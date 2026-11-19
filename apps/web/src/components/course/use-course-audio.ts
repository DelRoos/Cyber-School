"use client";

import * as React from "react";
import {
  PLAYBACK_RATES,
  buildCueTimeline,
  type AudioCueWindow,
  type LessonAudioCue,
  type LessonAudioTrack,
  type PlaybackRate,
} from "@/lib/course/course-audio";

export interface CourseAudioController {
  track: LessonAudioTrack | null;
  windows: AudioCueWindow[];
  currentWindow: AudioCueWindow | null;
  activeCueIndex: number;
  elapsedMs: number;
  totalMs: number;
  cueProgressRatio: number;
  isPlaying: boolean;
  isActionPaused: boolean;
  playbackRate: PlaybackRate;
  audioError: string | null;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekToMs: (targetMs: number) => void;
  rewindTenSeconds: () => void;
  jumpToCue: (index: number, autoPlay?: boolean) => void;
  resumeAfterAction: () => void;
  cycleRate: () => void;
  resetTrack: () => void;
  retryAudio: () => void;
  handleLoadedMetadata: () => void;
  handleTimeUpdate: () => void;
  handleEnded: () => void;
  handleError: () => void;
}

export function useCourseAudio(
  track: LessonAudioTrack | null,
  audioRef: React.RefObject<HTMLAudioElement | null>,
  options?: {
    onCueChange?: (cue: LessonAudioCue, index: number) => void;
  },
): CourseAudioController {
  const lastCueRef = React.useRef<number>(0);
  const pausedCueHandledRef = React.useRef<number>(-1);
  const pendingSeekSecRef = React.useRef<number | null>(null);
  const playRequestSeqRef = React.useRef<number>(0);
  const lastUiPaintMsRef = React.useRef<number>(0);
  const onCueChangeRef = React.useRef(options?.onCueChange);

  React.useEffect(() => {
    onCueChangeRef.current = options?.onCueChange;
  }, [options?.onCueChange]);

  const [activeCueIndex, setActiveCueIndex] = React.useState(0);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isActionPaused, setIsActionPaused] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState<PlaybackRate>(1);
  const [audioError, setAudioError] = React.useState<string | null>(null);

  const timeline = React.useMemo(
    () => (track ? buildCueTimeline(track.cues) : { windows: [], totalMs: 1000 }),
    [track],
  );

  const applyElementSeek = React.useCallback(
    (targetSec: number) => {
      const el = audioRef.current;
      if (!el) return;
      if (el.readyState >= 1) {
        pendingSeekSecRef.current = null;
        try {
          el.currentTime = targetSec;
        } catch {
          pendingSeekSecRef.current = targetSec;
        }
      } else {
        pendingSeekSecRef.current = targetSec;
      }
    },
    [audioRef],
  );

  React.useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.playbackRate = playbackRate;
    }
  }, [audioRef, playbackRate, track?.chapterId]);

  const pause = React.useCallback(() => {
    playRequestSeqRef.current += 1;
    const el = audioRef.current;
    if (el && !el.paused) {
      el.pause();
    }
    setIsPlaying(false);
  }, [audioRef]);

  const play = React.useCallback(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    const reqSeq = ++playRequestSeqRef.current;
    setAudioError(null);
    setIsActionPaused(false);
    el.playbackRate = playbackRate;
    if (pendingSeekSecRef.current !== null && el.readyState >= 1) {
      try {
        el.currentTime = pendingSeekSecRef.current;
      } catch {
        // Defer to loadedmetadata
      }
      pendingSeekSecRef.current = null;
    }
    const promise = el.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          if (reqSeq !== playRequestSeqRef.current) return;
          setIsPlaying(true);
        })
        .catch((err: unknown) => {
          if (reqSeq !== playRequestSeqRef.current) return;
          const errorName = err instanceof Error ? err.name : "";
          if (errorName === "AbortError") {
            return;
          }
          setIsPlaying(false);
          if (errorName === "NotAllowedError") {
            setAudioError(
              "Votre navigateur attend un clic direct sur Lecture pour démarrer l'audio.",
            );
          } else {
            setAudioError(
              "La piste audio de ce chapitre n'a pas pu démarrer. Cliquez sur Réessayer ou utilisez le mode lecture.",
            );
          }
        });
    } else {
      setIsPlaying(true);
    }
  }, [audioRef, playbackRate, track]);

  /**
   * Maps any playback timestamp `ms` to its owning slide window.
   * Crucially spans the inter-slide silence gap (`endMs..next.startMs`) with the preceding slide
   * so the UI NEVER flashes to the final slide during pauses between cues.
   */
  const findWindowForMs = React.useCallback(
    (ms: number): AudioCueWindow | undefined => {
      const wins = timeline.windows;
      if (wins.length === 0) return undefined;
      for (let i = wins.length - 1; i >= 0; i -= 1) {
        if (ms >= wins[i]!.startMs) {
          return wins[i];
        }
      }
      return wins[0];
    },
    [timeline.windows],
  );

  const checkBoundaryAndSync = React.useCallback(
    (nextMs: number) => {
      const activeWin = timeline.windows[lastCueRef.current];
      if (
        activeWin &&
        activeWin.cue.pauseForAction &&
        pausedCueHandledRef.current !== activeWin.index &&
        nextMs >= activeWin.endMs - 90
      ) {
        pausedCueHandledRef.current = activeWin.index;
        playRequestSeqRef.current += 1;
        const clampedMs = Math.max(activeWin.startMs, activeWin.endMs - 25);
        const el = audioRef.current;
        if (el) {
          el.pause();
          try {
            el.currentTime = clampedMs / 1000;
          } catch {
            // Ignore seek failure
          }
        }
        setIsPlaying(false);
        setElapsedMs(activeWin.endMs);
        setIsActionPaused(true);
        return;
      }

      const matched = findWindowForMs(nextMs);
      if (matched && matched.index !== lastCueRef.current) {
        lastCueRef.current = matched.index;
        pausedCueHandledRef.current = -1;
        setActiveCueIndex(matched.index);
        onCueChangeRef.current?.(matched.cue, matched.index);
      }
    },
    [audioRef, findWindowForMs, timeline.windows],
  );

  // High-precision 50ms boundary watcher while playing (UI clock painted at ~120ms to avoid heavy 20Hz re-renders)
  React.useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      const el = audioRef.current;
      if (!el || el.paused) return;
      const ms = el.currentTime * 1000;
      checkBoundaryAndSync(ms);
      const now = performance.now();
      if (now - lastUiPaintMsRef.current >= 120) {
        lastUiPaintMsRef.current = now;
        setElapsedMs(ms);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [audioRef, checkBoundaryAndSync, isPlaying]);

  const seekToMs = React.useCallback(
    (rawTargetMs: number) => {
      const clampedMs = Math.max(0, Math.min(timeline.totalMs, rawTargetMs));
      setIsActionPaused(false);
      setAudioError(null);
      pausedCueHandledRef.current = -1;
      setElapsedMs(clampedMs);
      applyElementSeek(clampedMs / 1000);
      const matched = findWindowForMs(clampedMs);
      if (matched && matched.index !== lastCueRef.current) {
        lastCueRef.current = matched.index;
        setActiveCueIndex(matched.index);
        onCueChangeRef.current?.(matched.cue, matched.index);
      }
    },
    [applyElementSeek, findWindowForMs, timeline.totalMs],
  );

  const jumpToCue = React.useCallback(
    (index: number, autoPlay = false) => {
      if (timeline.windows.length === 0) return;
      const clamped = Math.max(0, Math.min(timeline.windows.length - 1, index));
      const win = timeline.windows[clamped];
      if (!win) return;

      lastCueRef.current = clamped;
      pausedCueHandledRef.current = -1;
      setActiveCueIndex(clamped);
      setIsActionPaused(false);
      setAudioError(null);
      setElapsedMs(win.startMs);
      applyElementSeek(win.startMs / 1000);
      onCueChangeRef.current?.(win.cue, clamped);

      if (autoPlay) {
        play();
      }
    },
    [applyElementSeek, play, timeline.windows],
  );

  const resumeAfterAction = React.useCallback(() => {
    const pausedIdx =
      pausedCueHandledRef.current >= 0 ? pausedCueHandledRef.current : lastCueRef.current;
    const nextIdx = pausedIdx + 1;
    setIsActionPaused(false);
    if (nextIdx < timeline.windows.length) {
      jumpToCue(nextIdx, true);
    }
  }, [jumpToCue, timeline.windows.length]);

  const togglePlay = React.useCallback(() => {
    if (isActionPaused) {
      resumeAfterAction();
      return;
    }
    if (isPlaying) {
      pause();
      return;
    }
    const currentWin = timeline.windows[lastCueRef.current];
    if (currentWin && elapsedMs < currentWin.startMs) {
      setElapsedMs(currentWin.startMs);
      applyElementSeek(currentWin.startMs / 1000);
    }
    play();
  }, [
    applyElementSeek,
    elapsedMs,
    isActionPaused,
    isPlaying,
    pause,
    play,
    resumeAfterAction,
    timeline.windows,
  ]);

  const rewindTenSeconds = React.useCallback(() => {
    seekToMs(elapsedMs - 10_000);
  }, [elapsedMs, seekToMs]);

  const cycleRate = React.useCallback(() => {
    setPlaybackRate((prev) => {
      const idx = PLAYBACK_RATES.indexOf(prev);
      return PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length] ?? 1;
    });
  }, []);

  const resetTrack = React.useCallback(() => {
    playRequestSeqRef.current += 1;
    pendingSeekSecRef.current = null;
    const el = audioRef.current;
    if (el) {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        // Ignore media not yet loaded
      }
    }
    lastCueRef.current = 0;
    pausedCueHandledRef.current = -1;
    setActiveCueIndex(0);
    setElapsedMs(0);
    setIsPlaying(false);
    setIsActionPaused(false);
    setAudioError(null);
  }, [audioRef]);

  const retryAudio = React.useCallback(() => {
    const el = audioRef.current;
    setAudioError(null);
    const currentWin = timeline.windows[lastCueRef.current];
    if (currentWin) {
      pendingSeekSecRef.current = currentWin.startMs / 1000;
    }
    if (el) {
      el.load();
      play();
    }
  }, [audioRef, play, timeline.windows]);

  const handleLoadedMetadata = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
    if (pendingSeekSecRef.current !== null) {
      const target = pendingSeekSecRef.current;
      pendingSeekSecRef.current = null;
      try {
        el.currentTime = target;
      } catch {
        // Ignore seek failure
      }
    }
  }, [audioRef, playbackRate]);

  const handleTimeUpdate = React.useCallback(() => {
    const el = audioRef.current;
    if (!el || el.paused) return;
    const ms = el.currentTime * 1000;
    setElapsedMs(ms);
    checkBoundaryAndSync(ms);
  }, [audioRef, checkBoundaryAndSync]);

  const handleEnded = React.useCallback(() => {
    playRequestSeqRef.current += 1;
    setIsPlaying(false);
    setIsActionPaused(false);
  }, []);

  const handleError = React.useCallback(() => {
    playRequestSeqRef.current += 1;
    setIsPlaying(false);
    setAudioError(
      "Impossible de charger le fichier audio de ce chapitre. Le cours reste accessible intégralement à l'écrit.",
    );
  }, []);

  const safeIndex = Math.max(0, Math.min(Math.max(0, timeline.windows.length - 1), activeCueIndex));
  const currentWindow = timeline.windows[safeIndex] ?? null;

  const cueProgressRatio = React.useMemo(() => {
    if (!currentWindow) return 0;
    const span = Math.max(100, currentWindow.endMs - currentWindow.startMs);
    return Math.min(1, Math.max(0, (elapsedMs - currentWindow.startMs) / span));
  }, [currentWindow, elapsedMs]);

  return {
    track,
    windows: timeline.windows,
    currentWindow,
    activeCueIndex: safeIndex,
    elapsedMs,
    totalMs: timeline.totalMs,
    cueProgressRatio,
    isPlaying,
    isActionPaused,
    playbackRate,
    audioError,
    play,
    pause,
    togglePlay,
    seekToMs,
    rewindTenSeconds,
    jumpToCue,
    resumeAfterAction,
    cycleRate,
    resetTrack,
    retryAudio,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    handleError,
  };
}
