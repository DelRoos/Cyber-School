"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Link2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import type { AudioCueSpec, ParcoursAudioData } from "@/lib/parcours/curriculum-facts";

export interface ParcoursSyncedAudioBarProps {
  audio: ParcoursAudioData;
  activeCueIndex: number;
  syncEnabled: boolean;
  onToggleSync: () => void;
  onSelectCue: (cue: AudioCueSpec, index: number) => void;
}

interface CueWindow {
  cue: AudioCueSpec;
  index: number;
  startMs: number;
  endMs: number;
}

function buildCueTimeline(cues: AudioCueSpec[]): {
  windows: CueWindow[];
  totalMs: number;
} {
  let cursor = 0;
  const windows: CueWindow[] = cues.map((cue, index) => {
    const startMs = typeof cue.startMs === "number" ? cue.startMs : cursor;
    const duration = Math.max(1500, cue.estimatedDurationMs);
    const endMs = typeof cue.endMs === "number" ? cue.endMs : startMs + duration;
    cursor = endMs;
    return { cue, index, startMs, endMs };
  });
  return { windows, totalMs: Math.max(1000, cursor) };
}

function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function ParcoursSyncedAudioBar({
  audio,
  activeCueIndex,
  syncEnabled,
  onToggleSync,
  onSelectCue,
}: ParcoursSyncedAudioBarProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const lastCueRef = React.useRef<number>(activeCueIndex);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState<1 | 1.25 | 1.5>(1);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [transcriptOpen, setTranscriptOpen] = React.useState(false);

  const timeline = React.useMemo(() => buildCueTimeline(audio.cues), [audio.cues]);

  React.useEffect(() => {
    lastCueRef.current = activeCueIndex;
  }, [activeCueIndex]);

  // Real audio element sync when WAV file exists on disk
  React.useEffect(() => {
    const el = audioRef.current;
    if (!audio.hasGeneratedAudio || !el) return;
    el.playbackRate = playbackRate;
  }, [audio.hasGeneratedAudio, playbackRate]);

  // Deterministic synchronized cue timer when running in guided cue mode (no WAV generated yet)
  React.useEffect(() => {
    if (!isPlaying || audio.hasGeneratedAudio) return;

    const tickMs = 150;
    const id = window.setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + tickMs * playbackRate;
        if (next >= timeline.totalMs) {
          setIsPlaying(false);
          return 0;
        }
        const matched = timeline.windows.find((win) => next >= win.startMs && next < win.endMs);
        if (matched && matched.index !== lastCueRef.current) {
          lastCueRef.current = matched.index;
          onSelectCue(matched.cue, matched.index);
        }
        return next;
      });
    }, tickMs);

    return () => window.clearInterval(id);
  }, [audio.hasGeneratedAudio, isPlaying, onSelectCue, playbackRate, timeline]);

  const jumpToCue = (index: number) => {
    const clamped = Math.max(0, Math.min(timeline.windows.length - 1, index));
    const win = timeline.windows[clamped];
    if (!win) return;

    lastCueRef.current = clamped;
    setElapsedMs(win.startMs);
    onSelectCue(win.cue, clamped);

    if (audio.hasGeneratedAudio && audioRef.current) {
      audioRef.current.currentTime = win.startMs / 1000;
    }
  };

  const togglePlay = () => {
    if (audio.hasGeneratedAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        void audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (!isPlaying && timeline.windows.length > 0) {
      const currentWin = timeline.windows[activeCueIndex];
      if (currentWin && elapsedMs < currentWin.startMs) {
        setElapsedMs(currentWin.startMs);
      }
    }
    setIsPlaying((prev) => !prev);
  };

  const handleAudioTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    const ms = el.currentTime * 1000;
    setElapsedMs(ms);
    const matched = timeline.windows.find((win) => ms >= win.startMs && ms < win.endMs);
    if (matched && matched.index !== lastCueRef.current) {
      lastCueRef.current = matched.index;
      onSelectCue(matched.cue, matched.index);
    }
  };

  const cycleRate = () => {
    setPlaybackRate((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1));
  };

  const currentWindow = timeline.windows[activeCueIndex] ?? timeline.windows[0];
  const progressPct = Math.min(100, Math.round((elapsedMs / timeline.totalMs) * 100));

  if (!currentWindow) return null;

  return (
    <aside
      aria-label="Lecteur audio synchronisé avec le parcours"
      className="parcours-audio-dock"
      data-testid="parcours-synced-audio-bar"
    >
      {audio.hasGeneratedAudio && audio.audioSrc ? (
        <audio
          ref={audioRef}
          src={audio.audioSrc}
          preload="metadata"
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      ) : null}

      <div className="parcours-audio-inner">
        {transcriptOpen ? (
          <div className="parcours-audio-transcript" data-testid="audio-live-transcript">
            <div className="flex items-center justify-between gap-2 pb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-primary">
                Segment 0{currentWindow.index + 1} · {currentWindow.cue.title}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {audio.hasGeneratedAudio
                  ? `${audio.model} · voix ${audio.voiceName}`
                  : "Script guidé synchronisé (WAV Gemini TTS prêt à générer)"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {currentWindow.cue.spokenText}
            </p>
          </div>
        ) : null}

        <div className="parcours-audio-row">
          {/* Play / Prev / Next */}
          <div className="parcours-audio-controls">
            <button
              type="button"
              onClick={() => jumpToCue(activeCueIndex - 1)}
              disabled={activeCueIndex <= 0}
              aria-label="Segment précédent"
              className="parcours-audio-icon-btn"
              data-testid="audio-prev-cue-btn"
            >
              <SkipBack className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Mettre l'audio en pause" : "Lancer la narration guidée"}
              className="parcours-audio-play-btn"
              data-testid="audio-play-toggle"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => jumpToCue(activeCueIndex + 1)}
              disabled={activeCueIndex >= timeline.windows.length - 1}
              aria-label="Segment suivant"
              className="parcours-audio-icon-btn"
              data-testid="audio-next-cue-btn"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Active cue title + Timeline Scrubber */}
          <div className="parcours-audio-timeline-col">
            <div className="parcours-audio-title-line">
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground">
                <Headphones className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate" data-testid="audio-active-cue-title">
                  {currentWindow.cue.title}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {formatClock(elapsedMs)} / {formatClock(timeline.totalMs)}
              </span>
            </div>

            <div
              className="parcours-audio-cue-track"
              role="group"
              aria-label="Segments de narration"
            >
              <div className="parcours-audio-cue-fill" style={{ width: `${progressPct}%` }} />
              {timeline.windows.map((win) => {
                const active = win.index === activeCueIndex;
                return (
                  <button
                    key={win.cue.id}
                    type="button"
                    onClick={() => jumpToCue(win.index)}
                    aria-label={`Aller à : ${win.cue.title}`}
                    title={win.cue.title}
                    data-testid={`audio-cue-pin-${win.index}`}
                    className={`parcours-audio-cue-pin ${active ? "is-active" : ""}`}
                  >
                    <span>0{win.index + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sync Page toggle + Speed + Transcript toggle */}
          <div className="parcours-audio-extras">
            <button
              type="button"
              onClick={onToggleSync}
              aria-pressed={syncEnabled}
              data-testid="audio-sync-toggle"
              className={`parcours-audio-chip-btn ${syncEnabled ? "is-synced" : ""}`}
            >
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Synchro page</span>
            </button>

            <button
              type="button"
              onClick={cycleRate}
              aria-label={`Vitesse de lecture ${playbackRate}x`}
              className="parcours-audio-chip-btn font-mono"
            >
              {playbackRate}×
            </button>

            <button
              type="button"
              onClick={() => setTranscriptOpen((prev) => !prev)}
              aria-expanded={transcriptOpen}
              aria-label="Afficher le texte synchronisé"
              data-testid="audio-transcript-toggle"
              className="parcours-audio-chip-btn"
            >
              {transcriptOpen ? (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Texte</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
