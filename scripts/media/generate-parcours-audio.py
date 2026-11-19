"""Synthesize synchronized Gemini studio narration WAVs and exact millisecond cue manifests.

Usage:
  GEMINI_API_KEY=... uv run --with google-genai scripts/media/generate-parcours-audio.py
"""

from __future__ import annotations

import json
import os
import sys
import wave
from io import BytesIO
from pathlib import Path

from google import genai
from google.genai import types

ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_PATH = ROOT / "apps" / "web" / "src" / "lib" / "parcours" / "parcours-audio-scripts.json"
MANIFEST_OUT = ROOT / "apps" / "web" / "src" / "lib" / "parcours" / "audio-manifests.json"
AUDIO_OUT_DIR = ROOT / "apps" / "web" / "public" / "audio" / "parcours"

MODEL_ID = "gemini-2.5-pro-preview-tts"
SAMPLE_RATE = 24000
CHANNELS = 1
SAMPLE_WIDTH = 2


def load_api_key() -> str:
    for var in ("GEMINI_API_KEY", "GOOGLE_API_KEY"):
        val = os.environ.get(var)
        if val:
            return val
    env_local = ROOT / ".env.local"
    if env_local.exists():
        for line in env_local.read_text(encoding="utf-8").splitlines():
            for prefix in ("GEMINI_API_KEY=", "GOOGLE_API_KEY="):
                if line.startswith(prefix):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError(
        "GEMINI_API_KEY manquante. Definissez GEMINI_API_KEY dans votre environnement ou dans .env.local."
    )


def extract_pcm_frames(raw_bytes: bytes, mime_type: str) -> bytes:
    # Gemini TTS inline audio can be raw PCM or WAV container depending on endpoint defaults.
    if raw_bytes[:4] == b"RIFF" or "wav" in mime_type.lower():
        with wave.open(BytesIO(raw_bytes), "rb") as wf:
            return wf.readframes(wf.getnframes())
    return raw_bytes


def main() -> int:
    api_key = load_api_key()
    client = genai.Client(api_key=api_key)
    scripts = json.loads(SCRIPTS_PATH.read_text(encoding="utf-8"))

    AUDIO_OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, object] = {"model": MODEL_ID, "tracks": {}}
    tracks_out: dict[str, object] = {}

    for slug, track in scripts["tracks"].items():
        voice_name = track.get("voiceName", "Kore")
        combined_pcm = bytearray()
        cues_out: list[dict[str, object]] = []
        cursor_ms = 0

        for cue in track["cues"]:
            prompt = (
                "Lis d'une voix calme, claire, pedagogique et naturelle en francais, "
                "sans exagerer les effets :\n\n"
                f"{cue['spokenText']}"
            )
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice_name,
                            )
                        )
                    ),
                ),
            )

            audio_part = None
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    audio_part = part.inline_data
                    break
            if audio_part is None:
                raise RuntimeError(f"Aucune donnee audio retournee pour {slug}/{cue['id']}")

            pcm = extract_pcm_frames(audio_part.data, audio_part.mime_type or "")
            frame_count = len(pcm) // (SAMPLE_WIDTH * CHANNELS)
            duration_ms = round((frame_count / SAMPLE_RATE) * 1000)
            start_ms = cursor_ms
            end_ms = start_ms + duration_ms

            combined_pcm.extend(pcm)
            # 350ms natural breathing silence between sections
            silence_frames = int(SAMPLE_RATE * 0.35)
            combined_pcm.extend(b"\x00" * (silence_frames * SAMPLE_WIDTH * CHANNELS))
            cursor_ms = end_ms + 350

            cues_out.append({"id": cue["id"], "startMs": start_ms, "endMs": end_ms})
            print(f"[{slug}] {cue['id']}: {start_ms}ms -> {end_ms}ms")

        out_wav = AUDIO_OUT_DIR / f"{slug}.wav"
        with wave.open(str(out_wav), "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(SAMPLE_WIDTH)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(bytes(combined_pcm))

        tracks_out[slug] = {
            "model": MODEL_ID,
            "voiceName": voice_name,
            "audioPath": f"/audio/parcours/{slug}.wav",
            "cues": cues_out,
        }

    manifest["tracks"] = tracks_out
    MANIFEST_OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Termine. Manifeste ecrit dans {MANIFEST_OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
