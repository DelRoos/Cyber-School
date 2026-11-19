"use client";

import * as React from "react";
import {
  AlertTriangle,
  BookOpen,
  Captions,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  Headphones,
  Pause,
  PauseCircle,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
} from "lucide-react";
import type { CourseEditorialBlock, CourseScene } from "@cyber-school/lesson-runtime";
import { cn } from "@cyber-school/ui";
import { formatClock, formatSpokenTranscript } from "@/lib/course/course-audio";
import { LiveSpokenTranscript } from "./course-synced-audio-bar";
import { SlideStageRenderer } from "./slide-stage-renderer";
import type { CourseAudioController } from "./use-course-audio";

export interface GuidedListeningStageProps {
  chapterNumber: number;
  chapterTitle: string;
  scenes: CourseScene[];
  audio: CourseAudioController;
  courseSidebarOpen?: boolean;
  onSwitchToReading: () => void;
  renderBlock: (
    block: CourseEditorialBlock,
    blockKey: string,
    isVisible: boolean,
  ) => React.ReactNode;
  renderInline: (text: string) => React.ReactNode[];
}

const INTERACTIVE_STUDIO_TYPES = new Set<CourseEditorialBlock["type"]>([
  "diagram",
  "practice",
  "micro-check",
  "worked-example",
  "reference-sheet",
]);

const FALLBACK_VISUAL_TYPES = new Set<CourseEditorialBlock["type"]>([
  "diagram",
  "terminal",
  "table",
  "worked-example",
  "micro-check",
  "practice",
  "reference-sheet",
  "callout",
  "summary",
]);

/** Works on BOTH HTML elements and SVG elements (`<g role="button">`) so diagram keys never hijack slide controls. */
function isInteractiveElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName.toUpperCase();
  if (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    tag === "BUTTON" ||
    tag === "A" ||
    (target instanceof HTMLElement && target.isContentEditable)
  ) {
    return true;
  }
  const role = target.getAttribute("role");
  return (
    role === "radio" ||
    role === "radiogroup" ||
    role === "slider" ||
    role === "button" ||
    role === "textbox" ||
    role === "checkbox" ||
    role === "switch" ||
    Boolean(
      target.closest(
        'button, a, input, textarea, select, [role="radio"], [role="slider"], [role="button"], summary',
      ),
    )
  );
}

export function GuidedListeningStage({
  chapterNumber,
  chapterTitle,
  scenes,
  audio,
  courseSidebarOpen = false,
  onSwitchToReading,
  renderBlock,
  renderInline,
}: GuidedListeningStageProps) {
  const [subtitlesOn, setSubtitlesOn] = React.useState(false);
  const [transcriptOpen, setTranscriptOpen] = React.useState(false);
  const [notesDrawerOpen, setNotesDrawerOpen] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  const pillContainerRef = React.useRef<HTMLElement | null>(null);
  const pillRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const safeIdx = Math.max(0, Math.min(scenes.length - 1, audio.activeCueIndex));
  const scene = scenes[safeIdx];
  const activeCue = audio.currentWindow?.cue ?? null;

  // Keep latest audio actions in a ref so the window keydown listener registers ONCE without 10Hz churn
  const keyStateRef = React.useRef({
    safeIdx,
    total: scenes.length,
    isPlaying: audio.isPlaying,
    jumpToCue: audio.jumpToCue,
    togglePlay: audio.togglePlay,
  });
  React.useEffect(() => {
    keyStateRef.current = {
      safeIdx,
      total: scenes.length,
      isPlaying: audio.isPlaying,
      jumpToCue: audio.jumpToCue,
      togglePlay: audio.togglePlay,
    };
  }, [audio.isPlaying, audio.jumpToCue, audio.togglePlay, safeIdx, scenes.length]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isInteractiveElement(event.target) || isInteractiveElement(document.activeElement)) {
        return;
      }
      const st = keyStateRef.current;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (st.safeIdx < st.total - 1) {
          st.jumpToCue(st.safeIdx + 1, st.isPlaying);
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (st.safeIdx > 0) {
          st.jumpToCue(st.safeIdx - 1, st.isPlaying);
        }
      } else if (event.key === " ") {
        event.preventDefault();
        st.togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keep active slide centered inside the vertical left rail (desktop) or horizontal strip (mobile) without scrolling the page
  React.useEffect(() => {
    if (!scene) return;
    const container = pillContainerRef.current;
    const pill = pillRefs.current[scene.id];
    if (!container || !pill) return;
    const isVerticalRail = container.scrollHeight > container.clientHeight + 4;
    const isHorizontalStrip = container.scrollWidth > container.clientWidth + 4;
    if (isVerticalRail) {
      const targetTop = pill.offsetTop - container.clientHeight / 2 + pill.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: reducedMotion ? "instant" : "smooth",
      });
    } else if (isHorizontalStrip) {
      const targetLeft = pill.offsetLeft - container.clientWidth / 2 + pill.clientWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: reducedMotion ? "instant" : "smooth",
      });
    }
  }, [scene, reducedMotion]);

  if (!scene) return null;

  const hasSlideSpec = Boolean(scene.slide);
  const focusPoints = scene.focusPoints ?? activeCue?.focusPoints ?? [];
  const stageBlocks = hasSlideSpec
    ? scene.blocks.filter((b) => INTERACTIVE_STUDIO_TYPES.has(b.type))
    : scene.blocks.filter((b) => FALLBACK_VISUAL_TYPES.has(b.type));
  const detailBlocks = hasSlideSpec
    ? scene.blocks.filter((b) => !INTERACTIVE_STUDIO_TYPES.has(b.type) && b.type !== "heading")
    : scene.blocks.filter((b) => b.type === "prose" || b.type === "quote" || b.type === "list");

  // Avoid duplicating focusPoints over Practice.instructions on interactive workshop slides
  const hasPracticeBlock = stageBlocks.some((b) => b.type === "practice");
  const cleanSpoken = activeCue ? formatSpokenTranscript(activeCue.spokenText) : null;
  const currentWindow = audio.currentWindow;
  const sideRailAtLg = !courseSidebarOpen;

  return (
    <section
      aria-label={`Mode studio guidé : ${chapterTitle}`}
      data-testid="guided-listening-stage"
      className="space-y-4"
    >
      {/* Dedicated screen-reader announcement for slide transitions (NEVER wraps interactive widgets!) */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Diapositive {safeIdx + 1} sur {scenes.length} : {scene.title}
      </div>

      {/* KEYNOTE-STYLE TWO-COLUMN PRESENTATION STUDIO: Left Slides Table of Contents + Right Cinema Stage */}
      <div
        className={cn(
          "grid items-start gap-4",
          sideRailAtLg
            ? "lg:grid-cols-[292px_minmax(0,1fr)] lg:gap-6"
            : "2xl:grid-cols-[276px_minmax(0,1fr)] 2xl:gap-5",
        )}
      >
        {/* 1. LEFT SLIDES TABLE OF CONTENTS (Vertical sticky outline on desktop, compact bar on mobile) */}
        <aside
          aria-label="Sommaire des diapositives"
          data-testid="guided-slides-toc"
          className={cn(
            "min-w-0 overflow-hidden rounded-2xl border border-[#2a382c] bg-[#121614]",
            sideRailAtLg
              ? "lg:sticky lg:top-[84px] lg:flex lg:max-h-[calc(100vh-160px)] lg:flex-col"
              : "2xl:sticky 2xl:top-[84px] 2xl:flex 2xl:max-h-[calc(100vh-160px)] 2xl:flex-col",
          )}
        >
          {/* Rail Header (echoes Cyber School's Table des matières header) */}
          <div className="space-y-2 border-b border-[#25323f] bg-[#18222b] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3c5636] bg-[#192618] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#c8ed97]">
                <Headphones className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>
                  Mode écoute guidée · Diapo {safeIdx + 1} / {scenes.length}
                </span>
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[13px] font-bold leading-snug text-[#f5f7f0]">
                Chapitre {chapterNumber} · {chapterTitle}
              </p>
              {audio.totalMs > 0 ? (
                <span className="shrink-0 font-mono text-[11px] text-[#9fb3c4]">
                  {formatClock(audio.totalMs)}
                </span>
              ) : null}
            </div>

            {/* Segmented Storyboard Progress Strip */}
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${scenes.length}, minmax(0, 1fr))` }}
              aria-hidden="true"
            >
              {scenes.map((entry, idx) => {
                const isCurrent = idx === safeIdx;
                const isPast = idx < safeIdx;
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "relative h-1.5 overflow-hidden rounded-full",
                      isPast ? "bg-[#c8ed97]" : isCurrent ? "bg-[#263829]" : "bg-[#111920]",
                    )}
                  >
                    {isCurrent ? (
                      <div
                        className="h-full bg-[#c8ed97] transition-all duration-150"
                        style={{
                          width: `${Math.max(12, Math.round(audio.cueProgressRatio * 100))}%`,
                        }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Slide List on Desktop / Horizontal Compact Strip on Mobile */}
          <nav
            ref={pillContainerRef}
            aria-label="Diapositives du chapitre"
            className={cn(
              "relative flex items-center gap-1.5 overflow-x-auto px-3 py-2.5",
              sideRailAtLg
                ? "lg:flex-1 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-x-hidden lg:overflow-y-auto lg:divide-y lg:divide-[#1d261f] lg:p-0"
                : "2xl:flex-1 2xl:flex-col 2xl:items-stretch 2xl:gap-0 2xl:overflow-x-hidden 2xl:overflow-y-auto 2xl:divide-y 2xl:divide-[#1d261f] 2xl:p-0",
            )}
          >
            {scenes.map((entry, idx) => {
              const isCurrent = idx === safeIdx;
              const isPast = idx < safeIdx;
              const cueWindow = audio.windows[idx];
              const slideDurationMs = cueWindow
                ? Math.max(0, cueWindow.endMs - cueWindow.startMs)
                : 0;
              return (
                <button
                  key={entry.id}
                  ref={(el) => {
                    pillRefs.current[entry.id] = el;
                  }}
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  data-testid={`listening-scene-pill-${entry.id}`}
                  onClick={() => audio.jumpToCue(idx, audio.isPlaying)}
                  className={cn(
                    "relative inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-left text-xs",
                    isCurrent && "border-[#c8ed97] bg-[#1d2b1d] font-bold text-[#c8ed97]",
                    !isCurrent &&
                      isPast &&
                      "border-[#2b3a2e] bg-[#151c17] text-[#dce3db] hover:border-[#49614b]",
                    !isCurrent &&
                      !isPast &&
                      "border-[#242e27] bg-[#101412] text-[#9fad9f] hover:border-[#3c4d3e] hover:text-[#e6ede5]",
                    sideRailAtLg
                      ? "lg:w-full lg:shrink lg:items-start lg:gap-3 lg:rounded-none lg:border-0 lg:border-l-[3px] lg:px-4 lg:py-3"
                      : "2xl:w-full 2xl:shrink 2xl:items-start 2xl:gap-3 2xl:rounded-none 2xl:border-0 2xl:border-l-[3px] 2xl:px-4 2xl:py-3",
                    sideRailAtLg &&
                      isCurrent &&
                      "lg:border-l-[#c8ed97] lg:bg-[#19251a] lg:text-[#f5f7f0]",
                    sideRailAtLg &&
                      !isCurrent &&
                      isPast &&
                      "lg:border-l-transparent lg:bg-[#121614] lg:text-[#d1dcd1] lg:hover:bg-[#171e19]",
                    sideRailAtLg &&
                      !isCurrent &&
                      !isPast &&
                      "lg:border-l-transparent lg:bg-[#121614] lg:text-[#98a899] lg:hover:bg-[#171e19] lg:hover:text-[#e6ede5]",
                    !sideRailAtLg &&
                      isCurrent &&
                      "2xl:border-l-[#c8ed97] 2xl:bg-[#19251a] 2xl:text-[#f5f7f0]",
                    !sideRailAtLg &&
                      !isCurrent &&
                      isPast &&
                      "2xl:border-l-transparent 2xl:bg-[#121614] 2xl:text-[#d1dcd1] 2xl:hover:bg-[#171e19]",
                    !sideRailAtLg &&
                      !isCurrent &&
                      !isPast &&
                      "2xl:border-l-transparent 2xl:bg-[#121614] 2xl:text-[#98a899] 2xl:hover:bg-[#171e19] 2xl:hover:text-[#e6ede5]",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10.5px] font-bold",
                      isCurrent && "bg-[#c8ed97] text-[#101312]",
                      !isCurrent && isPast && "border border-[#4c6945] bg-[#192418] text-[#c8ed97]",
                      !isCurrent &&
                        !isPast &&
                        "border border-[#2b372e] bg-[#161c18] text-[#8fa192]",
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block max-w-[165px] truncate",
                        sideRailAtLg
                          ? "lg:max-w-none lg:whitespace-normal lg:line-clamp-2 lg:text-[13px] lg:leading-snug"
                          : "2xl:max-w-none 2xl:whitespace-normal 2xl:line-clamp-2 2xl:text-[13px] 2xl:leading-snug",
                      )}
                    >
                      {entry.title}
                    </span>

                    <span
                      className={cn(
                        "hidden items-center gap-2 pt-1 font-mono text-[10.5px]",
                        sideRailAtLg ? "lg:flex" : "2xl:flex",
                      )}
                    >
                      {slideDurationMs > 0 ? (
                        <span className={isCurrent ? "text-[#b6d49b]" : "text-[#7d9080]"}>
                          {formatClock(slideDurationMs)}
                        </span>
                      ) : null}
                      {entry.pauseForAction ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#6b4d1a] bg-[#21190c] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#fcd34d]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                          Atelier
                        </span>
                      ) : null}
                      {isCurrent && audio.isPlaying ? (
                        <span className="text-[10px] font-semibold text-[#c8ed97]">En lecture</span>
                      ) : null}
                    </span>
                  </span>

                  {entry.pauseForAction ? (
                    <span
                      title="Pause interactive"
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]",
                        sideRailAtLg ? "lg:hidden" : "2xl:hidden",
                      )}
                      aria-hidden="true"
                    />
                  ) : null}

                  {isCurrent ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute right-0 bottom-0 left-0 hidden h-[2px] bg-[#1e2d1e]",
                        sideRailAtLg ? "lg:block" : "2xl:block",
                      )}
                    >
                      <span
                        className="block h-full bg-[#c8ed97]"
                        style={{
                          width: `${Math.max(10, Math.round(audio.cueProgressRatio * 100))}%`,
                        }}
                      />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Rail Footer: Switch back to Reading Mode + Keyboard Hint */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#232f26] bg-[#0f1411] px-3 py-2.5">
            <button
              type="button"
              onClick={onSwitchToReading}
              data-testid="switch-to-reading-from-stage"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#2f3d32] bg-[#17201a] px-3 py-1.5 text-xs font-semibold text-[#e6ede5] transition-colors hover:border-[#c8ed97]/60 hover:text-[#c8ed97]"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mode lecture</span>
            </button>
            <span
              className={cn(
                "hidden font-mono text-[10px] text-[#7d9080]",
                sideRailAtLg ? "lg:inline" : "2xl:inline",
              )}
            >
              ← → · Espace
            </span>
          </div>
        </aside>

        {/* 2. RIGHT MAIN PRESENTATION CANVAS */}
        <div className="min-w-0 space-y-4">
          {/* ACTION PAUSE BANNER (when mentor pauses for hands-on reflection/interaction) */}
          {audio.isActionPaused ? (
            <div
              role="status"
              data-testid="guided-action-pause-card"
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-[#c8ed97] bg-[#192418] p-4 sm:p-5 shadow-[0_0_24px_rgba(200,237,151,0.16)]"
            >
              <div className="flex items-start gap-3">
                <PauseCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#c8ed97]"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#f5f7f0]">
                    Pause interactive · Prenez la main sur cette diapositive
                  </p>
                  <p className="text-xs leading-relaxed text-[#d3dfd1]">
                    La voix mentor s&apos;est arrêtée pour vous laisser tester le schéma, répondre à
                    la vérification ou expérimenter sans pression.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={audio.resumeAfterAction}
                data-testid="guided-resume-after-action-btn"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#c8ed97] px-4 py-2 text-xs font-bold text-[#101312] transition-colors hover:bg-[#d7f4ae]"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <span>
                  {safeIdx < scenes.length - 1
                    ? "Continuer vers la diapo suivante"
                    : "Terminer la pause"}
                </span>
              </button>
            </div>
          ) : null}

          {/* 3. UNIFIED NON-OVERLAPPING CINEMA DECK FRAME (Slide Canvas + Attached Bottom Transport Bar) */}
          <article id={scene.id} data-section-id={scene.id} className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-[#2d3d30] bg-[#0e1310] shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
              {/* Slide Visual Canvas (100% Unobstructed — ZERO floating bar over text!) */}
              {scene.slide ? (
                <SlideStageRenderer
                  slide={scene.slide}
                  sceneTitle={scene.title}
                  slideNumber={safeIdx + 1}
                  totalSlides={scenes.length}
                  isPlaying={audio.isPlaying}
                  progressRatio={audio.cueProgressRatio}
                  reducedMotion={reducedMotion}
                  renderInline={renderInline}
                />
              ) : (
                <div className="bg-[radial-gradient(circle_at_top_left,_rgba(104,184,234,0.08),_transparent_45%),#0e1310] p-5 sm:p-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2c4a60] bg-[#12202b] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#a9c7fa]">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      {scene.pauseForAction ? "ATELIER INTERACTIF" : "MISE EN APPLICATION"} · DIAPO{" "}
                      {String(safeIdx + 1).padStart(2, "0")} /{" "}
                      {String(scenes.length).padStart(2, "0")}
                    </span>
                    {scene.pauseForAction ? (
                      <span className="rounded-full border border-[#6b4d1a] bg-[#21190c] px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-[#fcd34d]">
                        Pause auto en fin de narration
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#f5f7f0] sm:text-2xl">
                    {scene.title}
                  </h2>
                  {!hasPracticeBlock && focusPoints.length > 0 ? (
                    <ul className="grid gap-2.5 sm:grid-cols-3 pt-1">
                      {focusPoints.map((pt, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 rounded-xl border border-[#253328] bg-[#131915] p-3 text-[13.5px] leading-snug text-[#e6eee4]"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#c8ed97]"
                            aria-hidden="true"
                          />
                          <span>{renderInline(pt)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}

              {/* Optional Cinema Subtitles Strip (OFF by default — Mayer Redundancy Principle) */}
              {subtitlesOn && currentWindow ? (
                <div
                  data-testid="theater-subtitles-bar"
                  data-transcript-scroll-container
                  className="max-h-28 overflow-y-auto border-t border-[#243228] bg-[#0a0f0c] px-5 py-3"
                >
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#c8ed97]">
                    Sous-titres · {audio.track?.voiceName ?? "Voix mentor"}
                  </p>
                  <LiveSpokenTranscript
                    cue={currentWindow.cue}
                    elapsedMs={audio.elapsedMs}
                    startMs={currentWindow.startMs}
                    endMs={currentWindow.endMs}
                    isPlaying={audio.isPlaying}
                  />
                </div>
              ) : null}

              {/* ATTACHED NON-OVERLAPPING STUDIO TRANSPORT BAR (Part of the Cinema Frame!) */}
              {audio.track && currentWindow ? (
                <div
                  role="region"
                  aria-label="Console de lecture audio du mode studio"
                  data-testid="studio-transport-dock"
                  className="border-t border-[#26352a] bg-[#111814]"
                >
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

                  {/* Expandable Full Live Transcript Drawer */}
                  {transcriptOpen ? (
                    <div
                      data-transcript-scroll-container
                      className="max-h-44 overflow-y-auto border-b border-[#222e25] bg-[#0b0f0d] px-4 py-3 sm:px-6"
                      data-testid="audio-teacher-transcript"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#c8ed97]">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>
                            Diapo {String(currentWindow.index + 1).padStart(2, "0")} ·{" "}
                            {currentWindow.cue.title}
                          </span>
                        </span>
                        <span className="font-mono text-[10.5px] text-[#9fad9f]">
                          Voix mentor · {audio.track.voiceName} ({audio.track.model})
                        </span>
                      </div>
                      <LiveSpokenTranscript
                        cue={currentWindow.cue}
                        elapsedMs={audio.elapsedMs}
                        startMs={currentWindow.startMs}
                        endMs={currentWindow.endMs}
                        isPlaying={audio.isPlaying}
                      />
                    </div>
                  ) : null}

                  {/* Compact Single-Row Transport on Desktop, Clean Stacked on Mobile */}
                  <div className="flex flex-col gap-2.5 px-4 py-3 lg:flex-row lg:items-center lg:gap-4 sm:px-5">
                    {/* Transport Buttons */}
                    <div className="flex items-center justify-between gap-2 lg:justify-start">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => audio.jumpToCue(safeIdx - 1, audio.isPlaying)}
                          disabled={safeIdx <= 0}
                          aria-label="Diapo précédente"
                          data-testid="audio-prev-cue-btn"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] text-[#cbd6ca] transition-colors hover:border-[#3e5442] hover:text-[#f5f7f0] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <SkipBack className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={audio.rewindTenSeconds}
                          aria-label="Reculer de 10 secondes"
                          title="Reculer de 10 s"
                          data-testid="audio-rewind-btn"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] text-[#cbd6ca] transition-colors hover:border-[#3e5442] hover:text-[#f5f7f0]"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={audio.togglePlay}
                          aria-label={
                            audio.isPlaying
                              ? "Mettre la voix off en pause"
                              : "Écouter la voix mentor"
                          }
                          data-testid="audio-play-toggle"
                          className="inline-flex h-11 min-w-[104px] items-center justify-center gap-2 rounded-xl bg-[#c8ed97] px-3.5 text-xs font-extrabold text-[#0d140e] shadow-[0_0_16px_rgba(200,237,151,0.25)] transition-colors hover:bg-[#d7f4ae]"
                        >
                          {audio.isPlaying ? (
                            <>
                              <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                              <span>Écouter</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => audio.jumpToCue(safeIdx + 1, audio.isPlaying)}
                          disabled={safeIdx >= scenes.length - 1}
                          aria-label="Diapo suivante"
                          data-testid="audio-next-cue-btn"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] text-[#cbd6ca] transition-colors hover:border-[#3e5442] hover:text-[#f5f7f0] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <SkipForward className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Scrubber + Active Title */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-1.5 font-semibold text-[#f5f7f0]">
                          <span
                            className={cn(
                              "h-2 w-2 shrink-0 rounded-full",
                              audio.isPlaying ? "bg-[#c8ed97]" : "bg-[#68b8ea]",
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate" data-testid="audio-active-cue-title">
                            {currentWindow.cue.title}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-[#9fad9f]">
                          {formatClock(audio.elapsedMs)} / {formatClock(audio.totalMs)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(1000, Math.round(audio.totalMs))}
                        step={500}
                        value={Math.min(Math.round(audio.totalMs), Math.round(audio.elapsedMs))}
                        onChange={(e) => audio.seekToMs(Number(e.target.value))}
                        aria-label="Position dans la piste audio du chapitre"
                        aria-valuetext={`${formatClock(audio.elapsedMs)} sur ${formatClock(audio.totalMs)}`}
                        data-testid="audio-scrubber"
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1b261d] accent-[#c8ed97]"
                      />
                    </div>

                    {/* Secondary Actions (Speed, Subtitles with explicit aria-label, Transcript) */}
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={audio.cycleRate}
                        aria-label={`Vitesse de lecture : ${audio.playbackRate}x`}
                        data-testid="audio-speed-btn"
                        className="inline-flex h-11 min-w-[48px] items-center justify-center rounded-xl border border-[#263529] bg-[#161f18] px-2.5 font-mono text-xs font-semibold text-[#dce3db] transition-colors hover:border-[#3e5442] hover:text-[#f5f7f0]"
                      >
                        {audio.playbackRate}x
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubtitlesOn((prev) => !prev)}
                        aria-pressed={subtitlesOn}
                        aria-label={
                          subtitlesOn
                            ? "Masquer les sous-titres en direct"
                            : "Afficher les sous-titres en direct"
                        }
                        data-testid="theater-subtitles-toggle"
                        className={cn(
                          "inline-flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors",
                          subtitlesOn
                            ? "border-[#c8ed97]/50 bg-[#1d2b1d] text-[#c8ed97]"
                            : "border-[#263529] bg-[#161f18] text-[#cbd6ca] hover:text-[#f5f7f0]",
                        )}
                      >
                        <Captions className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Sous-titres</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTranscriptOpen((prev) => !prev)}
                        aria-expanded={transcriptOpen}
                        aria-label="Afficher la transcription de la voix mentor"
                        data-testid="audio-transcript-toggle"
                        className={cn(
                          "inline-flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors",
                          transcriptOpen
                            ? "border-[#c8ed97]/50 bg-[#1d2b1d] text-[#c8ed97]"
                            : "border-[#263529] bg-[#161f18] text-[#cbd6ca] hover:text-[#f5f7f0]",
                        )}
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Transcription</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* 4. INTERACTIVE COMPANION DECK BELOW THE CINEMA FRAME (Diagrams, Real 2D Simulator, Micro-Checks, Worked Examples, Reference Sheet) */}
            {stageBlocks.length > 0 ? (
              <div className="space-y-5" data-testid="theater-interactive-deck">
                {stageBlocks.map((block, bIdx) => (
                  <div key={`${scene.id}-studio-vis-${bIdx}`}>
                    {renderBlock(block, `${scene.id}-studio-vis-${bIdx}`, true)}
                  </div>
                ))}
              </div>
            ) : null}

            {/* 5. QUICK PREV / NEXT SLIDE + OPTIONAL NOTES DRAWER */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                disabled={safeIdx <= 0}
                onClick={() => audio.jumpToCue(safeIdx - 1, audio.isPlaying)}
                data-testid="theater-prev-slide-btn"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#2a382d] bg-[#131815] px-4 py-2 text-xs font-semibold text-[#dce3db] transition-colors hover:border-[#415744] hover:text-[#f5f7f0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Diapo précédente</span>
              </button>

              {detailBlocks.length > 0 || cleanSpoken ? (
                <button
                  type="button"
                  onClick={() => setNotesDrawerOpen((prev) => !prev)}
                  aria-expanded={notesDrawerOpen}
                  data-testid="guided-toggle-prose-btn"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#263848] bg-[#111b23] px-4 py-2 text-xs font-semibold text-[#a9c7fa] transition-colors hover:border-[#68b8ea]/60"
                >
                  {notesDrawerOpen ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>
                    {notesDrawerOpen
                      ? "Masquer les notes détaillées"
                      : "Notes détaillées & script complet"}
                  </span>
                </button>
              ) : null}

              <button
                type="button"
                disabled={safeIdx >= scenes.length - 1}
                onClick={() => audio.jumpToCue(safeIdx + 1, audio.isPlaying)}
                data-testid="theater-next-slide-btn"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#4c6941] bg-[#192517] px-4 py-2 text-xs font-bold text-[#c8ed97] transition-colors hover:bg-[#23341f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Diapo suivante</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Optional Collapsible Notes & Written Text Drawer */}
            {notesDrawerOpen && (detailBlocks.length > 0 || cleanSpoken) ? (
              <div
                data-testid="theater-notes-drawer"
                className="space-y-4 rounded-2xl border border-[#253128] bg-[#0f1411] p-5"
              >
                {detailBlocks.map((block, tIdx) => (
                  <div key={`${scene.id}-txt-${tIdx}`}>
                    {renderBlock(block, `${scene.id}-txt-${tIdx}`, true)}
                  </div>
                ))}
                {cleanSpoken ? (
                  <div className="border-t border-border pt-4 space-y-1.5">
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#9fad9f]">
                      Script complet de la voix mentor ({audio.track?.voiceName ?? "Studio"})
                    </p>
                    <p className="text-[14px] leading-relaxed text-[#cbd6ca]">{cleanSpoken}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}
