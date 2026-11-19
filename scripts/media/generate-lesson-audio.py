"""Synthesize studio-grade course narration with Gemini 3.8 Flash TTS (Interactions API)
with per-slide SHA-256 atomic caching, parallel synthesis, jittered exponential backoff retry,
single-pass pronunciation normalization (global + per-course), WPM pacing validation, and dual
web encoding (Ogg Opus + MP3 fallback).

Official SDK & API:
  - google-genai >= 3.2.0 (`client.interactions.create` on `v1beta`)
  - Default model: `gemini-3.8-flash-tts` (override via `--model gemini-3.8-flash-lite-tts` for fast bulk drafts)

Usage:
  uv run --with "google-genai>=3.2.0" python scripts/media/generate-lesson-audio.py --slug observation-et-interpretation
  uv run --with "google-genai>=3.2.0" python scripts/media/generate-lesson-audio.py --slug observation-et-interpretation --force --workers 3
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import random
import re
import shutil
import subprocess
import sys
import threading
import time
import wave
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GLOBAL_PRONUNCIATION_PATH = ROOT / "curriculum" / "pronunciation.yaml"
CACHE_ROOT = ROOT / ".cache" / "tts"

DEFAULT_MODEL = "gemini-3.8-flash-tts"
SAMPLE_RATE = 24000
CHANNELS = 1
SAMPLE_WIDTH = 2
PAUSE_BETWEEN_SCENES_MS = 420
MIN_HEALTHY_WPM = 115.0
MAX_HEALTHY_WPM = 195.0

_THREAD_LOCAL = threading.local()


def log(msg: str) -> None:
    print(msg, flush=True)


def load_api_key() -> str:
    for var in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
        val = os.environ.get(var)
        if val:
            return val
    env_local = ROOT / ".env.local"
    if env_local.exists():
        for line in env_local.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            for prefix in ("GEMINI_API_KEY=", "GOOGLE_API_KEY="):
                if stripped.startswith(prefix):
                    return stripped.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError(
        "GEMINI_API_KEY manquante. Définissez GEMINI_API_KEY dans votre environnement ou dans .env.local."
    )


def parse_pronunciation_file(path: Path) -> list[tuple[str, str]]:
    if not path.exists():
        return []
    rules: list[tuple[str, str]] = []
    current_match: str | None = None
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m_match = re.match(r'^-\s*match:\s*("([^"\\]*(?:\\.[^"\\]*)*)"|\'([^\']*)\')', line)
        if m_match:
            val = m_match.group(2) if m_match.group(2) is not None else m_match.group(3)
            current_match = val.replace('\\"', '"') if val is not None else None
            continue
        m_say = re.match(r'^say:\s*("([^"\\]*(?:\\.[^"\\]*)*)"|\'([^\']*)\')', line)
        if m_say and current_match is not None:
            val = m_say.group(2) if m_say.group(2) is not None else m_say.group(3)
            rules.append((current_match, (val or "").replace('\\"', '"')))
            current_match = None
    return rules


def load_pronunciation_rules(lesson_dir: Path) -> list[tuple[str, str]]:
    combined: dict[str, str] = {}
    for token, spoken in parse_pronunciation_file(GLOBAL_PRONUNCIATION_PATH):
        combined[token] = spoken
    for token, spoken in parse_pronunciation_file(lesson_dir / "pronunciation.yaml"):
        combined[token] = spoken
    rules = list(combined.items())
    rules.sort(key=lambda pair: len(pair[0]), reverse=True)
    return rules


def compile_pronunciation_engine(
    rules: list[tuple[str, str]],
) -> tuple[re.Pattern[str] | None, dict[str, str]]:
    """Build a single-pass regex replacer to prevent cascading double-substitutions across 160 units."""
    if not rules:
        return None, {}
    mapping = dict(rules)
    patterns: list[str] = []
    for token, _ in rules:
        escaped = re.escape(token)
        if re.match(r"^[A-Za-z0-9_]+$", token):
            patterns.append(rf"\b{escaped}\b")
        else:
            patterns.append(escaped)
    return re.compile("|".join(patterns)), mapping


def apply_pronunciation(
    text: str,
    compiled_pattern: re.Pattern[str] | None,
    mapping: dict[str, str],
) -> str:
    if not compiled_pattern:
        return text
    return compiled_pattern.sub(lambda m: mapping[m.group(0)], text)


def extract_pcm_frames(raw_bytes: bytes, mime_type: str) -> tuple[bytes, int]:
    if raw_bytes[:4] == b"RIFF" or "wav" in mime_type.lower():
        with wave.open(BytesIO(raw_bytes), "rb") as wf:
            return wf.readframes(wf.getnframes()), wf.getframerate()
    return raw_bytes, SAMPLE_RATE


def encode_dual_web_audio(wav_path: Path, ogg_path: Path, mp3_path: Path) -> tuple[str, str | None, str]:
    """Encode crisp Ogg Opus primary track + MP3 fallback for Safari/WebKit compatibility."""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return wav_path.name, None, "audio/wav"

    ogg_cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(wav_path),
        "-c:a",
        "libopus",
        "-b:a",
        "48k",
        "-vbr",
        "on",
        "-application",
        "voip",
        str(ogg_path),
    ]
    ogg_res = subprocess.run(ogg_cmd, capture_output=True, text=True)

    mp3_cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(wav_path),
        "-c:a",
        "libmp3lame",
        "-b:a",
        "64k",
        "-ac",
        "1",
        str(mp3_path),
    ]
    mp3_res = subprocess.run(mp3_cmd, capture_output=True, text=True)
    fallback_name = (
        mp3_path.name
        if (mp3_res.returncode == 0 and mp3_path.exists() and mp3_path.stat().st_size > 1000)
        else None
    )

    if ogg_res.returncode == 0 and ogg_path.exists() and ogg_path.stat().st_size > 1000:
        wav_path.unlink(missing_ok=True)
        return ogg_path.name, fallback_name, "audio/ogg; codecs=opus"

    if fallback_name:
        wav_path.unlink(missing_ok=True)
        return fallback_name, None, "audio/mpeg"

    log("  [WARN] Encodage Opus/MP3 échoué, conservation WAV.")
    return wav_path.name, None, "audio/wav"


def cache_key_for_cue(model_id: str, voice_name: str, style: str, tts_text: str) -> str:
    payload = f"{model_id}|{voice_name}|{style}|{tts_text}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()[:24]


def get_thread_client(api_key: str, api_version: str):
    """Reuse one genai.Client per worker thread instead of leaking a fresh client per slide."""
    client = getattr(_THREAD_LOCAL, "client", None)
    if client is None:
        from google import genai

        client = genai.Client(api_key=api_key, http_options={"api_version": api_version})
        _THREAD_LOCAL.client = client
    return client


def synthesize_cue_with_retry(
    api_key: str,
    api_version: str,
    model_id: str,
    voice_name: str,
    tts_text: str,
    style: str,
    cache_dir: Path,
    bypass_cache: bool = False,
) -> tuple[bytes, int, bool]:
    """Synthesize one slide/cue via Gemini 3.8 TTS Interactions API with atomic cache + jittered retry."""
    key = cache_key_for_cue(model_id, voice_name, style, tts_text)
    cache_file = cache_dir / f"{key}.wav"

    if not bypass_cache and cache_file.exists() and cache_file.stat().st_size > 100:
        try:
            raw_cached = cache_file.read_bytes()
            pcm, rate = extract_pcm_frames(raw_cached, "audio/wav")
            if len(pcm) > 0:
                return pcm, rate, True
        except Exception:
            cache_file.unlink(missing_ok=True)

    client = get_thread_client(api_key, api_version)
    last_err: Exception | None = None

    for attempt in range(1, 5):
        try:
            interaction = client.interactions.create(
                model=model_id,
                input=[
                    {
                        "type": "user_input",
                        "content": [
                            {
                                "type": "text",
                                "text": tts_text,
                                "annotations": [
                                    {
                                        "type": "speech_metadata",
                                        "style": style,
                                    }
                                ],
                            }
                        ],
                    }
                ],
                response_format={"type": "audio"},
                generation_config={
                    "speech_config": [
                        {"voice": voice_name},
                    ]
                },
            )

            audio_bytes: bytes | None = None
            mime_type = "audio/wav"

            output_audio = getattr(interaction, "output_audio", None)
            if output_audio and getattr(output_audio, "data", None):
                raw = output_audio.data
                audio_bytes = base64.b64decode(raw) if isinstance(raw, str) else bytes(raw)
                mime_type = getattr(output_audio, "mime_type", None) or "audio/wav"
            else:
                for step in getattr(interaction, "steps", None) or []:
                    if getattr(step, "type", None) != "model_output":
                        continue
                    for item in getattr(step, "content", None) or []:
                        if getattr(item, "type", None) == "audio" and getattr(item, "data", None):
                            raw = item.data
                            audio_bytes = base64.b64decode(raw) if isinstance(raw, str) else bytes(raw)
                            mime_type = getattr(item, "mime_type", None) or "audio/wav"
                            break

            if not audio_bytes:
                raise RuntimeError(f"Aucune donnée audio retournée par {model_id}.")

            pcm, rate = extract_pcm_frames(audio_bytes, mime_type)
            cache_dir.mkdir(parents=True, exist_ok=True)
            tmp_file = cache_dir / f"{key}.{os.getpid()}.{threading.get_ident()}.tmp"
            with wave.open(str(tmp_file), "wb") as wf:
                wf.setnchannels(CHANNELS)
                wf.setsampwidth(SAMPLE_WIDTH)
                wf.setframerate(rate)
                wf.writeframes(pcm)
            os.replace(tmp_file, cache_file)
            return pcm, rate, False
        except Exception as err:
            last_err = err
            wait_s = min(14.0, (2 ** attempt) + random.uniform(0.2, 1.1))
            log(f"    [RETRY {attempt}/4] Erreur transitoire ({str(err)[:120]}), nouvelle tentative dans {wait_s:.1f}s...")
            time.sleep(wait_s)

    raise RuntimeError(f"Échec synthèse après 4 tentatives : {last_err}")


def is_chapter_up_to_date(
    existing_manifest: dict,
    chapter_id: str,
    track: dict,
    model_id: str,
    voice_name: str,
    chapter_style: str,
    out_ogg: Path,
    out_mp3: Path,
) -> bool:
    """Return True only if audio files exist AND every cue's id, text, style, model & voice match."""
    if not (out_ogg.exists() and out_mp3.exists()):
        return False
    prev = existing_manifest.get("chapters", {}).get(chapter_id)
    if not isinstance(prev, dict):
        return False
    if prev.get("model") != model_id or prev.get("voiceName") != voice_name:
        return False
    prev_cues = prev.get("cues", [])
    next_cues = track.get("cues", [])
    if len(prev_cues) != len(next_cues):
        return False
    for pc, nc in zip(prev_cues, next_cues):
        if (
            pc.get("id") != nc.get("id")
            or pc.get("blockId") != nc.get("blockId")
            or pc.get("spokenText") != nc.get("spokenText")
            or (pc.get("style") or chapter_style) != (nc.get("style") or chapter_style)
            or bool(pc.get("pauseForAction")) != bool(nc.get("pauseForAction"))
        ):
            return False
    return True


def build_baseline_manifest(scripts: dict, slug: str, model_id: str) -> dict:
    voice_name = scripts.get("voiceName", "Sadaltager")
    persona = scripts.get("persona", "Voix pédagogique claire et posée")
    manifest = {
        "version": "2.0",
        "model": model_id,
        "persona": persona,
        "voiceName": voice_name,
        "chapters": {},
    }

    for ch_id, ch_data in scripts.get("chapters", {}).items():
        cursor_ms = 0
        cues_out = []
        cues = ch_data.get("cues", [])
        for idx, cue in enumerate(cues):
            text = cue.get("spokenText", "")
            word_count = max(1, len(text.split()))
            duration_ms = max(4000, round((word_count / 148.0) * 60_000))
            start_ms = cursor_ms
            end_ms = start_ms + duration_ms
            out_cue = {
                "id": cue["id"],
                "title": cue["title"],
                "blockId": cue["blockId"],
                "startMs": start_ms,
                "endMs": end_ms,
                "estimatedDurationMs": duration_ms,
                "spokenText": text,
            }
            if cue.get("style"):
                out_cue["style"] = cue["style"]
            if cue.get("pauseForAction"):
                out_cue["pauseForAction"] = True
            if cue.get("focusPoints"):
                out_cue["focusPoints"] = cue["focusPoints"]
            cues_out.append(out_cue)
            cursor_ms = end_ms + (PAUSE_BETWEEN_SCENES_MS if idx < len(cues) - 1 else 0)

        manifest["chapters"][ch_id] = {
            "chapterId": ch_id,
            "chapterTitle": ch_data.get("title", ""),
            "model": model_id,
            "voiceName": ch_data.get("voiceName", voice_name),
            "audioSrc": f"/audio/lessons/{slug}/{ch_id}.ogg",
            "fallbackAudioSrc": f"/audio/lessons/{slug}/{ch_id}.mp3",
            "mimeType": "audio/ogg; codecs=opus",
            "totalMs": cursor_ms,
            "cues": cues_out,
        }
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description="Générateur audio Gemini 3.8 TTS pour Cyber School")
    parser.add_argument("--slug", required=True, help="Slug du cours sous lessons/<slug>/")
    parser.add_argument("--chapter", help="ID d'un chapitre spécifique à synthétiser (optionnel)")
    parser.add_argument("--model", help=f"Modèle Gemini TTS (défaut : {DEFAULT_MODEL})")
    parser.add_argument("--voice", help="Surcharge de voix Gemini TTS (ex: Sadaltager, Charon, Sulafat)")
    parser.add_argument("--workers", type=int, default=3, help="Nombre de requêtes TTS parallèles (défaut : 3)")
    parser.add_argument("--force", action="store_true", help="Reconstruire les fichiers chapitres (utilise le cache par slide)")
    parser.add_argument("--no-cache", action="store_true", help="Ignorer le cache disque par slide")
    parser.add_argument("--baseline-only", action="store_true", help="Écrire uniquement le manifeste estimé sans appel API")
    args = parser.parse_args()

    slug = args.slug
    lesson_dir = ROOT / "lessons" / slug
    scripts_path = lesson_dir / "lesson-audio-scripts.json"
    manifest_path = lesson_dir / "audio-manifest.json"
    audio_out_dir = ROOT / "apps" / "web" / "public" / "audio" / "lessons" / slug
    cache_dir = CACHE_ROOT / slug

    if not scripts_path.exists():
        raise FileNotFoundError(
            f"Scripts audio introuvables : {scripts_path}. Lancez d'abord `corepack pnpm course:compile -- --slug {slug}`."
        )

    scripts = json.loads(scripts_path.read_text(encoding="utf-8"))
    model_id = args.model or os.environ.get("GEMINI_TTS_MODEL") or scripts.get("recommendedModel") or DEFAULT_MODEL
    default_voice = args.voice or scripts.get("voiceName", "Sadaltager")
    default_style = scripts.get("defaultStyle", "calm, warm and steady")

    log(f"=== Génération Voix Off Cyber School · {slug} ===")
    log(f"    Modèle : {model_id} | Voix : {default_voice} | Workers : {args.workers}")

    audio_out_dir.mkdir(parents=True, exist_ok=True)
    pronunciation_rules = load_pronunciation_rules(lesson_dir)
    pron_pattern, pron_map = compile_pronunciation_engine(pronunciation_rules)
    log(f"    Règles de prononciation chargées (globales + locales, passe unique) : {len(pronunciation_rules)}")

    if manifest_path.exists() and not args.baseline_only:
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except Exception:
            manifest = build_baseline_manifest(scripts, slug, model_id)
    else:
        manifest = build_baseline_manifest(scripts, slug, model_id)

    manifest["version"] = "2.0"
    manifest["model"] = model_id
    manifest["voiceName"] = default_voice
    manifest["persona"] = scripts.get("persona", manifest.get("persona", "Voix mentor"))

    if args.baseline_only:
        manifest_path.write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        log(f"Manifeste estimé écrit : {manifest_path}")
        return 0

    api_key = load_api_key()
    api_version = os.environ.get("GOOGLE_GENAI_API_VERSION", "v1beta")
    target_chapters = [args.chapter] if args.chapter else list(scripts["chapters"].keys())

    if not args.chapter and args.force:
        expected_stems = set(scripts["chapters"].keys())
        for old_file in audio_out_dir.iterdir():
            if old_file.is_file() and old_file.stem not in expected_stems:
                log(f"  Suppression ancien fichier audio obsolète : {old_file.name}")
                old_file.unlink(missing_ok=True)
        for existing_ch in list(manifest.get("chapters", {}).keys()):
            if existing_ch not in expected_stems:
                del manifest["chapters"][existing_ch]

    for chapter_id in target_chapters:
        if chapter_id not in scripts["chapters"]:
            log(f"Chapitre inconnu : {chapter_id}")
            continue

        track = scripts["chapters"][chapter_id]
        voice_name = args.voice or track.get("voiceName", default_voice)
        chapter_style = track.get("style") or default_style
        cues = track["cues"]

        out_ogg = audio_out_dir / f"{chapter_id}.ogg"
        out_mp3 = audio_out_dir / f"{chapter_id}.mp3"
        out_wav = audio_out_dir / f"{chapter_id}.wav"
        if not args.force and not args.no_cache and is_chapter_up_to_date(
            manifest, chapter_id, track, model_id, voice_name, chapter_style, out_ogg, out_mp3
        ):
            log(f"Audio à jour pour {chapter_id} (scripts inchangés), ignoré.")
            continue

        log(f"\n--- Synthèse {chapter_id} ({len(cues)} slides · voix {voice_name}) ---")

        # Parallel synthesis per slide (preserving exact slide order after completion)
        results_by_idx: dict[int, tuple[bytes, int, bool, str]] = {}
        with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
            futures = {}
            for idx, cue in enumerate(cues):
                tts_text = apply_pronunciation(cue["spokenText"], pron_pattern, pron_map)
                cue_style = cue.get("style") or chapter_style
                fut = pool.submit(
                    synthesize_cue_with_retry,
                    api_key,
                    api_version,
                    model_id,
                    voice_name,
                    tts_text,
                    cue_style,
                    cache_dir,
                    args.no_cache,
                )
                futures[fut] = (idx, cue, tts_text)

            for fut in as_completed(futures):
                idx, cue, tts_text = futures[fut]
                pcm, rate, from_cache = fut.result()
                results_by_idx[idx] = (pcm, rate, from_cache, tts_text)
                dur_s = (len(pcm) // (SAMPLE_WIDTH * CHANNELS)) / rate
                spoken_words = max(1, len(re.sub(r"<[^>]+>", "", tts_text).split()))
                wpm = (spoken_words / max(0.1, dur_s)) * 60.0
                tag = "CACHE" if from_cache else "TTS"
                warn = (
                    f" [WARN rythme {wpm:.0f} m/min]"
                    if (wpm < MIN_HEALTHY_WPM or wpm > MAX_HEALTHY_WPM)
                    else ""
                )
                log(f"  [{idx + 1}/{len(cues)}] {cue['id']} -> {tag} ({dur_s:.1f}s · {wpm:.0f} m/min){warn}")

        # Assemble chapter sequentially using exact cumulative sample frames (zero rounding drift!)
        combined_pcm = bytearray()
        cues_out: list[dict[str, object]] = []
        total_frames = 0
        expected_rate: int | None = None

        for idx, cue in enumerate(cues):
            pcm, rate, _, _ = results_by_idx[idx]
            if expected_rate is None:
                expected_rate = rate
            elif rate != expected_rate:
                raise RuntimeError(
                    f"Fréquence d'échantillonnage incohérente dans {chapter_id}/{cue['id']} : {rate} Hz vs {expected_rate} Hz."
                )

            cue_frames = len(pcm) // (SAMPLE_WIDTH * CHANNELS)
            start_ms = round((total_frames / expected_rate) * 1000)
            end_ms = round(((total_frames + cue_frames) / expected_rate) * 1000)
            duration_ms = end_ms - start_ms

            combined_pcm.extend(pcm)
            total_frames += cue_frames

            # Insert inter-slide silence ONLY between slides (never after the final slide)
            if idx < len(cues) - 1:
                silence_frames = int(expected_rate * (PAUSE_BETWEEN_SCENES_MS / 1000.0))
                combined_pcm.extend(b"\x00" * (silence_frames * SAMPLE_WIDTH * CHANNELS))
                total_frames += silence_frames

            out_cue: dict[str, object] = {
                "id": cue["id"],
                "title": cue["title"],
                "blockId": cue["blockId"],
                "startMs": start_ms,
                "endMs": end_ms,
                "estimatedDurationMs": duration_ms,
                "spokenText": cue["spokenText"],
            }
            if cue.get("style"):
                out_cue["style"] = cue["style"]
            if cue.get("pauseForAction"):
                out_cue["pauseForAction"] = True
            if cue.get("focusPoints"):
                out_cue["focusPoints"] = cue["focusPoints"]
            cues_out.append(out_cue)

        final_rate = expected_rate or SAMPLE_RATE
        total_ms = round((total_frames / final_rate) * 1000)
        with wave.open(str(out_wav), "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(SAMPLE_WIDTH)
            wf.setframerate(final_rate)
            wf.writeframes(bytes(combined_pcm))

        primary_name, fallback_name, final_mime = encode_dual_web_audio(out_wav, out_ogg, out_mp3)
        primary_kb = (audio_out_dir / primary_name).stat().st_size / 1024.0
        fb_info = (
            f" + {fallback_name} ({(audio_out_dir / fallback_name).stat().st_size / 1024.0:.0f} Ko)"
            if fallback_name
            else ""
        )
        log(f"  Audio écrit : {primary_name} ({total_ms / 1000:.1f}s, {primary_kb:.0f} Ko){fb_info}")

        ch_entry: dict[str, object] = {
            "chapterId": chapter_id,
            "chapterTitle": track.get("title", ""),
            "model": model_id,
            "voiceName": voice_name,
            "audioSrc": f"/audio/lessons/{slug}/{primary_name}",
            "mimeType": final_mime,
            "totalMs": total_ms,
            "cues": cues_out,
        }
        if fallback_name:
            ch_entry["fallbackAudioSrc"] = f"/audio/lessons/{slug}/{fallback_name}"

        manifest["chapters"][chapter_id] = ch_entry
        manifest_path.write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        log(f"  Manifeste sauvegardé : {manifest_path}")

    log("\nSynthèse terminée avec succès.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
