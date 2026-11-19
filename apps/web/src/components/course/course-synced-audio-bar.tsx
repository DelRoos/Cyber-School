"use client";

import * as React from "react";
import {
  AlertTriangle,
  BookOpen,
  FileText,
  Headphones,
  Link2,
  Pause,
  PauseCircle,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
} from "lucide-react";
import {
  formatClock,
  formatSpokenTranscript,
  type LessonAudioCue,
} from "@/lib/course/course-audio";
import { cn } from "@cyber-school/ui";
import type { CourseAudioController } from "./use-course-audio";

export type StudyMode = "reading" | "listening";

export interface CourseSyncedAudioBarProps {
  audio: CourseAudioController;
  syncEnabled: boolean;
  studyMode: StudyMode;
  sidebarOpen?: boolean;
  transcriptOpen: boolean;
  onToggleSync: () => void;
  onToggleStudyMode: () => void;
  onToggleTranscript: () => void;
}

export function LiveSpokenTranscript({
  cue,
  elapsedMs,
  startMs,
  endMs,
  isPlaying,
}: {
  cue: LessonAudioCue;
  elapsedMs: number;
  startMs: number;
  endMs: number;
  isPlaying: boolean;
}) {
  const cleanText = React.useMemo(() => formatSpokenTranscript(cue.spokenText), [cue.spokenText]);
  const words = React.useMemo(() => cleanText.split(/\s+/).filter(Boolean), [cleanText]);

  const cumulativeWeights = React.useMemo(() => {
    const weights: number[] = [];
    let running = 0;
    for (const word of words) {
      let w = Math.max(2, word.replace(/[.,!?;:«»()]/g, "").length);
      if (/[.!?]$/.test(word)) w += 6;
      else if (/[,;:]$/.test(word)) w += 3;
      running += w;
      weights.push(running);
    }
    return { weights, total: Math.max(1, running) };
  }, [words]);

  const activeWordIdx = React.useMemo(() => {
    if (!isPlaying || words.length === 0) return -1;
    if (cue.wordTimings && cue.wordTimings.length === words.length) {
      const idx = cue.wordTimings.findIndex((t) => elapsedMs >= t.startMs && elapsedMs <= t.endMs);
      if (idx >= 0) return idx;
    }
    const duration = Math.max(100, endMs - startMs);
    const progress = Math.min(1, Math.max(0, (elapsedMs - startMs) / duration));
    const targetWeight = progress * cumulativeWeights.total;
    const found = cumulativeWeights.weights.findIndex((w) => w >= targetWeight);
    return found >= 0 ? found : words.length - 1;
  }, [isPlaying, words.length, cue.wordTimings, elapsedMs, startMs, endMs, cumulativeWeights]);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const activeWordRef = React.useRef<HTMLSpanElement | null>(null);

  // Container-local scrolling ONLY (never hijacks the main page scroll!)
  React.useEffect(() => {
    const wordEl = activeWordRef.current;
    const scrollParent = containerRef.current?.closest(
      "[data-transcript-scroll-container]",
    ) as HTMLElement | null;
    if (!wordEl || !scrollParent) return;
    if (scrollParent.scrollHeight <= scrollParent.clientHeight + 4) return;

    const parentRect = scrollParent.getBoundingClientRect();
    const wordRect = wordEl.getBoundingClientRect();
    const relTop = wordRect.top - parentRect.top + scrollParent.scrollTop;
    const desiredTop = Math.max(0, relTop - scrollParent.clientHeight / 2 + wordRect.height / 2);

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scrollParent.scrollTo({
      top: desiredTop,
      behavior: prefersReduced ? "instant" : "smooth",
    });
  }, [activeWordIdx]);

  return (
    <div
      ref={containerRef}
      className="text-[13.5px] leading-relaxed sm:text-[14.5px]"
      data-testid="audio-transcript-karaoke"
    >
      {words.map((word, idx) => {
        const isPast = activeWordIdx >= 0 && idx < activeWordIdx;
        const isCurrent = activeWordIdx >= 0 && idx === activeWordIdx;
        return (
          <React.Fragment key={idx}>
            <span
              ref={isCurrent ? activeWordRef : undefined}
              className={cn(
                "inline-block my-0.5 rounded px-1 transition-colors duration-150",
                isCurrent && "font-bold text-[#0c130d] bg-[#c8ed97]",
                isPast && "font-medium text-[#f0f3eb] bg-[#c8ed97]/10",
                !isPast && !isCurrent && "text-[#94a697]",
              )}
            >
              {word}
            </span>{" "}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function CourseSyncedAudioBar({
  audio,
  syncEnabled,
  studyMode,
  sidebarOpen,
  transcriptOpen,
  onToggleSync,
  onToggleStudyMode,
  onToggleTranscript,
}: CourseSyncedAudioBarProps) {
  const { track, currentWindow, windows, activeCueIndex, elapsedMs, totalMs, isPlaying } = audio;

  if (!track || !currentWindow) return null;

  return (
    <aside
      aria-label="Voix mentor synchronisée avec le cours"
      className={cn(
        "fixed bottom-3 z-40 w-[calc(100%-1rem)] max-w-[860px] -translate-x-1/2 transition-all duration-300 sm:bottom-5 sm:w-[calc(100%-2rem)]",
        sidebarOpen ? "left-1/2 lg:left-[calc(348px+(100vw-348px)/2)]" : "left-1/2",
      )}
      data-testid="course-synced-audio-bar"
    >
      <div className="overflow-hidden rounded-2xl border border-[#2a382d] bg-[#111713]/95 shadow-[0_12px_45px_rgba(0,0,0,0.75)] backdrop-blur-md">
        {/* Honest Audio Error Banner */}
        {audio.audioError ? (
          <div
            role="alert"
            data-testid="audio-error-banner"
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6f2636] bg-[#241216] px-4 py-2.5 text-xs text-[#fda4af]"
          >
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{audio.audioError}</span>
            </span>
            <button
              type="button"
              onClick={audio.retryAudio}
              className="min-h-[40px] rounded-lg border border-[#8c3246] bg-[#361720] px-3 py-1 font-semibold text-[#fce7ea] hover:bg-[#491e2a]"
            >
              Réessayer
            </button>
          </div>
        ) : null}

        {/* Pedagogical Action Pause Bar */}
        {audio.isActionPaused ? (
          <div
            role="status"
            data-testid="audio-action-pause-banner"
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3a4f36] bg-[#192418] px-4 py-2.5 text-xs sm:px-5"
          >
            <span className="flex items-center gap-2 font-medium text-[#e6f1df]">
              <PauseCircle className="h-4 w-4 shrink-0 text-[#c8ed97]" aria-hidden="true" />
              <span>Pause active : testez ou répondez avant de poursuivre l&apos;écoute.</span>
            </span>
            <button
              type="button"
              onClick={audio.resumeAfterAction}
              data-testid="audio-action-resume-btn"
              className="min-h-[40px] rounded-lg bg-[#c8ed97] px-3.5 py-1 font-bold text-[#101312] transition-colors hover:bg-[#d7f4ae]"
            >
              Continuer
            </button>
          </div>
        ) : null}

        {/* Transcript Drawer */}
        {transcriptOpen ? (
          <div
            data-transcript-scroll-container
            className="max-h-44 overflow-y-auto border-b border-[#222e25] bg-[#0c100e] px-4 py-3 sm:px-6"
            data-testid="audio-teacher-transcript"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#c8ed97] sm:text-[11.5px]">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#c8ed97]" aria-hidden="true" />
                <span className="truncate">
                  Diapo {String(currentWindow.index + 1).padStart(2, "0")} ·{" "}
                  {currentWindow.cue.title}
                </span>
              </span>
              <span className="shrink-0 text-[10.5px] font-mono text-muted-foreground sm:text-[11px]">
                Voix mentor · {track.voiceName} ({track.model})
              </span>
            </div>
            <LiveSpokenTranscript
              cue={currentWindow.cue}
              elapsedMs={elapsedMs}
              startMs={currentWindow.startMs}
              endMs={currentWindow.endMs}
              isPlaying={isPlaying}
            />
          </div>
        ) : null}

        {/* Main Controls Row — flex-wrap safe from 320px up */}
        <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:justify-start">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => audio.jumpToCue(activeCueIndex - 1, isPlaying)}
                disabled={activeCueIndex <= 0}
                aria-label="Scène précédente"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] text-[#cbd6ca] transition-colors hover:border-[#3a4d3e] hover:text-[#f5f7f0] disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
                data-testid="audio-prev-cue-btn"
              >
                <SkipBack className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={audio.rewindTenSeconds}
                aria-label="Reculer de 10 secondes"
                title="Reculer de 10 s"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] text-[#cbd6ca] transition-colors hover:border-[#3a4d3e] hover:text-[#f5f7f0] sm:h-9 sm:w-9"
                data-testid="audio-rewind-btn"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={audio.togglePlay}
                aria-label={isPlaying ? "Mettre la voix off en pause" : "Écouter la voix mentor"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#c8ed97] text-[#0d140e] shadow-[0_0_15px_rgba(200,237,151,0.25)] transition-colors hover:bg-[#d4f2aa] sm:h-10 sm:w-10"
                data-testid="audio-play-toggle"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4 fill-current translate-x-0.5" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => audio.jumpToCue(activeCueIndex + 1, isPlaying)}
                disabled={activeCueIndex >= windows.length - 1}
                aria-label="Scène suivante"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] text-[#cbd6ca] transition-colors hover:border-[#3a4d3e] hover:text-[#f5f7f0] disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
                data-testid="audio-next-cue-btn"
              >
                <SkipForward className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile Actions (>= 44px touch targets, wraps cleanly on 320px without clipping) */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                type="button"
                onClick={onToggleStudyMode}
                aria-pressed={studyMode === "listening"}
                aria-label={
                  studyMode === "listening"
                    ? "Revenir au mode lecture"
                    : "Ouvrir le mode écoute guidée"
                }
                data-testid="audio-mode-toggle-mobile"
                className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-[#3c5737] bg-[#19241b] px-2.5 text-xs font-semibold text-[#c8ed97]"
              >
                {studyMode === "listening" ? (
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{studyMode === "listening" ? "Lire" : "Diapos"}</span>
              </button>
              <button
                type="button"
                onClick={audio.cycleRate}
                aria-label={`Vitesse : ${audio.playbackRate}x`}
                data-testid="audio-speed-btn-mobile"
                className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] px-2 font-mono text-xs text-[#cbd6ca]"
              >
                {audio.playbackRate}x
              </button>
              <button
                type="button"
                onClick={onToggleTranscript}
                aria-expanded={transcriptOpen}
                aria-label="Afficher la transcription"
                data-testid="audio-transcript-toggle-mobile"
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl border",
                  transcriptOpen
                    ? "border-[#c8ed97]/40 bg-[#1e2a20] text-[#c8ed97]"
                    : "border-[#263529] bg-[#161f18] text-[#cbd6ca]",
                )}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Title & Native Keyboard-Accessible Range Scrubber */}
          <div className="min-w-0 flex-1 px-0.5 sm:px-2">
            <div className="flex items-center justify-between gap-2 pb-1 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 font-medium text-[#f5f7f0]">
                <Headphones className="h-3.5 w-3.5 shrink-0 text-[#c8ed97]" aria-hidden="true" />
                <span className="truncate" data-testid="audio-active-cue-title">
                  {currentWindow.cue.title}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] text-[#9fad9f]">
                {formatClock(elapsedMs)} / {formatClock(totalMs)}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(1000, Math.round(totalMs))}
              step={500}
              value={Math.min(Math.round(totalMs), Math.round(elapsedMs))}
              onChange={(e) => audio.seekToMs(Number(e.target.value))}
              aria-label="Progression de la voix mentor dans le chapitre"
              aria-valuetext={`${formatClock(elapsedMs)} sur ${formatClock(totalMs)}`}
              data-testid="audio-scrubber"
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1b261d] accent-[#c8ed97]"
            />
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleStudyMode}
              aria-pressed={studyMode === "listening"}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#3d5936] bg-[#192619] px-3 text-xs font-semibold text-[#c8ed97] transition-colors hover:bg-[#233522]"
              data-testid="audio-mode-toggle"
            >
              {studyMode === "listening" ? (
                <>
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mode lecture</span>
                </>
              ) : (
                <>
                  <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mode diapos</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={audio.cycleRate}
              aria-label={`Vitesse de lecture : ${audio.playbackRate}x`}
              className="inline-flex h-9 min-w-[44px] items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] px-2 font-mono text-xs text-[#cbd6ca] transition-colors hover:text-[#f5f7f0]"
              data-testid="audio-speed-btn"
            >
              {audio.playbackRate}x
            </button>

            <button
              type="button"
              onClick={onToggleSync}
              aria-pressed={syncEnabled}
              title={
                syncEnabled
                  ? "Synchronisation visuelle activée"
                  : "Synchronisation visuelle désactivée"
              }
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition-colors",
                syncEnabled
                  ? "border-[#c8ed97]/40 bg-[#1e2a20] text-[#c8ed97]"
                  : "border-[#263529] bg-[#161f18] text-muted-foreground hover:text-[#f5f7f0]",
              )}
              data-testid="audio-sync-toggle"
            >
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sync</span>
            </button>

            <button
              type="button"
              onClick={onToggleTranscript}
              aria-expanded={transcriptOpen}
              aria-label="Afficher la transcription de la voix mentor"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                transcriptOpen
                  ? "border-[#c8ed97]/40 bg-[#1e2a20] text-[#c8ed97]"
                  : "border-[#263529] bg-[#161f18] text-[#cbd6ca] hover:text-[#f5f7f0]",
              )}
              data-testid="audio-transcript-toggle"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
