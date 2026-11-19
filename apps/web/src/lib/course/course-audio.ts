export interface AudioWordTiming {
  word: string;
  startMs: number;
  endMs: number;
}

export interface LessonAudioCue {
  id: string;
  title: string;
  blockId: string;
  startMs: number;
  endMs: number;
  estimatedDurationMs: number;
  spokenText: string;
  style?: string;
  pauseForAction?: boolean;
  focusPoints?: string[];
  wordTimings?: AudioWordTiming[];
}

export interface LessonAudioTrack {
  chapterId: string;
  chapterTitle: string;
  model: string;
  voiceName: string;
  audioSrc: string;
  fallbackAudioSrc?: string;
  mimeType?: string;
  totalMs: number;
  cues: LessonAudioCue[];
}

export interface LessonAudioManifest {
  version?: string;
  model: string;
  persona: string;
  voiceName: string;
  chapters: Record<string, LessonAudioTrack>;
}

export interface AudioCueWindow {
  cue: LessonAudioCue;
  index: number;
  startMs: number;
  endMs: number;
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

export function buildCueTimeline(cues: LessonAudioCue[]): {
  windows: AudioCueWindow[];
  totalMs: number;
} {
  let cursor = 0;
  const windows: AudioCueWindow[] = cues.map((cue, index) => {
    const startMs = typeof cue.startMs === "number" && cue.startMs >= 0 ? cue.startMs : cursor;
    const duration = Math.max(1500, cue.estimatedDurationMs || 8000);
    const endMs =
      typeof cue.endMs === "number" && cue.endMs > startMs ? cue.endMs : startMs + duration;
    cursor = endMs;
    return { cue, index, startMs, endMs };
  });
  return { windows, totalMs: Math.max(1000, cursor) };
}

export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

/** Strips Gemini 3.8 TTS inline vocal/pause directives (`<short pause>`, `<long pause>`, etc.) for readable transcripts. */
export function formatSpokenTranscript(rawSpokenText: string): string {
  return rawSpokenText
    .replace(/<(?:short pause|long pause|breath|sigh|cough|laugh|gasp|throat-clearing)>/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();
}
