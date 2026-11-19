"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  EyeOff,
  Flame,
  Info,
  Layers,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react";
import type { SlideTone, SlideVisualSpec } from "@cyber-school/lesson-runtime";
import { cn } from "@cyber-school/ui";

export interface SlideStageRendererProps {
  slide: SlideVisualSpec;
  sceneTitle: string;
  slideNumber: number;
  totalSlides: number;
  isPlaying: boolean;
  progressRatio: number;
  reducedMotion?: boolean;
  renderInline: (text: string) => React.ReactNode[];
}

interface ToneStyles {
  surface: string;
  border: string;
  accentBar: string;
  text: string;
  badge: string;
  chip: string;
  ring: string;
}

const TONE_MAP: Record<SlideTone, ToneStyles> = {
  fact: {
    surface: "bg-[#142016]",
    border: "border-[#3c5934]",
    accentBar: "bg-[#c8ed97]",
    text: "text-[#c8ed97]",
    badge: "bg-[#c8ed97] text-[#101312]",
    chip: "border-[#4b6e3f] bg-[#1a2b1a] text-[#c8ed97]",
    ring: "ring-[#c8ed97]/60",
  },
  info: {
    surface: "bg-[#111d26]",
    border: "border-[#2a4960]",
    accentBar: "bg-[#68b8ea]",
    text: "text-[#a9c7fa]",
    badge: "bg-[#68b8ea] text-[#0c141a]",
    chip: "border-[#2e526b] bg-[#142634] text-[#a9c7fa]",
    ring: "ring-[#68b8ea]/60",
  },
  warning: {
    surface: "bg-[#20190d]",
    border: "border-[#6b4d1a]",
    accentBar: "bg-[#f59e0b]",
    text: "text-[#fcd34d]",
    badge: "bg-[#f59e0b] text-[#141008]",
    chip: "border-[#7a581f] bg-[#292010] text-[#fcd34d]",
    ring: "ring-[#f59e0b]/60",
  },
  danger: {
    surface: "bg-[#221216]",
    border: "border-[#6f2636]",
    accentBar: "bg-[#be123c]",
    text: "text-[#fda4af]",
    badge: "bg-[#be123c] text-white",
    chip: "border-[#842b3f] bg-[#2f151b] text-[#fda4af]",
    ring: "ring-[#fda4af]/60",
  },
  neutral: {
    surface: "bg-[#151b17]",
    border: "border-[#303932]",
    accentBar: "bg-[#8fa192]",
    text: "text-[#dbe4dc]",
    badge: "bg-[#2c382f] text-[#f0f1e9]",
    chip: "border-[#39473d] bg-[#1b221d] text-[#dce3db]",
    ring: "ring-[#c8ed97]/40",
  },
};

function ToneIcon({ tone, className }: { tone: SlideTone; className?: string }) {
  if (tone === "fact") return <CheckCircle2 className={className} aria-hidden="true" />;
  if (tone === "info") return <Info className={className} aria-hidden="true" />;
  if (tone === "warning") return <AlertTriangle className={className} aria-hidden="true" />;
  if (tone === "danger") return <ShieldAlert className={className} aria-hidden="true" />;
  return <Compass className={className} aria-hidden="true" />;
}

/** Highlights matching tokens inline inside a raw log line with crisp color-coded chips. */
function renderHighlightedLogLine(
  line: string,
  highlights: Array<{ token: string; tone?: SlideTone }>,
  activeTokenIndex: number | null,
): React.ReactNode {
  interface Segment {
    text: string;
    matchIndex: number | null;
    tone: SlideTone;
  }

  let segments: Segment[] = [{ text: line, matchIndex: null, tone: "neutral" }];

  highlights.forEach((hl, hlIdx) => {
    if (!hl.token) return;
    const next: Segment[] = [];
    for (const seg of segments) {
      if (seg.matchIndex !== null) {
        next.push(seg);
        continue;
      }
      const parts = seg.text.split(hl.token);
      if (parts.length === 1) {
        next.push(seg);
        continue;
      }
      parts.forEach((part, pIdx) => {
        if (part.length > 0) {
          next.push({ text: part, matchIndex: null, tone: "neutral" });
        }
        if (pIdx < parts.length - 1) {
          next.push({
            text: hl.token,
            matchIndex: hlIdx,
            tone: hl.tone ?? "fact",
          });
        }
      });
    }
    segments = next;
  });

  return segments.map((seg, idx) => {
    if (seg.matchIndex === null) {
      return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
    }
    const styles = TONE_MAP[seg.tone];
    const isSpotlit = activeTokenIndex === seg.matchIndex;
    return (
      <mark
        key={idx}
        className={cn(
          "mx-0.5 inline-block rounded-md border px-1.5 py-0.5 font-semibold transition-all duration-200",
          styles.chip,
          isSpotlit && "ring-2 ring-[#f5f7f0]/80 brightness-110",
        )}
      >
        {seg.text}
      </mark>
    );
  });
}

function getBeatIndex(
  count: number,
  isPlaying: boolean,
  progressRatio: number,
  reducedMotion: boolean,
): number | null {
  if (!isPlaying || reducedMotion || count <= 1) return null;
  return Math.min(count - 1, Math.floor(progressRatio * count));
}

export function SlideStageRenderer({
  slide,
  sceneTitle,
  slideNumber,
  totalSlides,
  isPlaying,
  progressRatio,
  reducedMotion = false,
  renderInline,
}: SlideStageRendererProps) {
  const [pinnedHighlight, setPinnedHighlight] = React.useState<{
    slideKey: string;
    index: number;
  } | null>(null);

  const slideKey = `${slideNumber}:${slide.layout}`;
  const pinnedHighlightIdx =
    pinnedHighlight && pinnedHighlight.slideKey === slideKey ? pinnedHighlight.index : null;

  /* =======================================================================
     1. HERO DILEMMA — Dramatic Split Decision Theater
     ======================================================================= */
  if (slide.layout === "hero-dilemma") {
    const leftTone = TONE_MAP[slide.leftStake.tone];
    const rightTone = TONE_MAP[slide.rightStake.tone];
    const beat = getBeatIndex(3, isPlaying, progressRatio, reducedMotion);

    return (
      <div
        data-testid="slide-layout-hero-dilemma"
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(200,237,151,0.08),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(104,184,234,0.08),_transparent_48%),#0e1310] p-5 sm:p-7 space-y-5"
      >
        <div className="space-y-2.5 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3e5737] bg-[#172417] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-[#c8ed97]">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" />
              {slide.kicker}
            </span>
            <span className="font-mono text-[11px] text-[#9fad9f]">
              DIAPO {String(slideNumber).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-[-0.025em] leading-[1.15] text-[#f5f7f0] sm:text-3xl lg:text-[34px]">
            {renderInline(slide.headline)}
          </h2>
        </div>

        {slide.alertText ? (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-[#7c2b3d] bg-[#1a1114] shadow-[0_12px_36px_rgba(0,0,0,0.45)] transition-all duration-300",
              beat === 0 && "ring-2 ring-[#fda4af]/60",
            )}
          >
            <div className="flex items-center justify-between gap-2 bg-[#be123c] px-4 py-2 text-xs font-bold tracking-wider text-white">
              <span className="inline-flex items-center gap-2 font-mono uppercase">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full bg-white",
                    isPlaying && !reducedMotion && "animate-pulse",
                  )}
                />
                {slide.alertBadge ?? "ALERTE ENTRANTE"}
              </span>
              <span className="font-mono text-[11px] opacity-90">PRIORITÉ HAUTE</span>
            </div>
            <div className="px-4 py-3.5 font-mono text-[13.5px] leading-relaxed text-[#fce7ea] sm:px-5 sm:text-[15.5px]">
              {renderInline(slide.alertText)}
            </div>
          </div>
        ) : null}

        <div className="relative grid gap-3.5 md:grid-cols-2">
          <div
            className={cn(
              "rounded-2xl border p-4 sm:p-5 space-y-2 transition-all duration-300",
              leftTone.surface,
              leftTone.border,
              beat === 1 && `ring-2 ${leftTone.ring}`,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider",
                  leftTone.badge,
                )}
              >
                <ToneIcon tone={slide.leftStake.tone} className="h-3.5 w-3.5" />
                {slide.leftStake.label}
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-[#eff3ec] sm:text-[15.5px]">
              {renderInline(slide.leftStake.detail)}
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-4 sm:p-5 space-y-2 transition-all duration-300",
              rightTone.surface,
              rightTone.border,
              beat === 2 && `ring-2 ${rightTone.ring}`,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider",
                  rightTone.badge,
                )}
              >
                <ToneIcon tone={slide.rightStake.tone} className="h-3.5 w-3.5" />
                {slide.rightStake.label}
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-[#eff3ec] sm:text-[15.5px]">
              {renderInline(slide.rightStake.detail)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================================
     2. LOG SPOTLIGHT — Interactive Token-Highlighted Forensic Terminal
     ======================================================================= */
  if (slide.layout === "log-spotlight") {
    const autoBeat = getBeatIndex(slide.highlights.length, isPlaying, progressRatio, reducedMotion);
    const activeTokenIdx = pinnedHighlightIdx ?? autoBeat;

    return (
      <div data-testid="slide-layout-log-spotlight" className="bg-[#0e1310] p-5 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68b8ea]">
              <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
              AUTOPSIE DE TRACE BRUTE
            </span>
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#f5f7f0] sm:text-2xl">
              {sceneTitle}
            </h2>
          </div>
          <span className="rounded-full border border-[#2b3c2f] bg-[#141c16] px-3 py-1 font-mono text-[11px] text-[#c8ed97]">
            {slide.highlights.length} champs · cliquez une carte pour cibler
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#2b3b2f] bg-[#090d0b] shadow-[0_14px_34px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-2 border-b border-[#202d23] bg-[#131a15] px-4 py-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#c8ed97]">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#be123c]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#c8ed97]" />
              </span>
              <span className="ml-1 truncate">{slide.sourceLabel}</span>
            </div>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#9fad9f]">
              Journal brut
            </span>
          </div>

          <div className="overflow-x-auto p-4 space-y-2 font-mono text-[12.5px] leading-[1.75] text-[#e7f0e6] sm:text-[14px]">
            {slide.lines.map((line, lIdx) => (
              <div key={lIdx} className="whitespace-pre-wrap break-words">
                <span aria-hidden="true" className="mr-3 select-none text-[#8fa192]">
                  {String(lIdx + 1).padStart(2, "0")}
                </span>
                {renderHighlightedLogLine(line, slide.highlights, activeTokenIdx)}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slide.highlights.map((hl, idx) => {
            const tone = hl.tone ?? "fact";
            const styles = TONE_MAP[tone];
            const isActive = activeTokenIdx === idx;
            return (
              <button
                key={`${hl.token}-${idx}`}
                type="button"
                aria-pressed={pinnedHighlightIdx === idx}
                onClick={() =>
                  setPinnedHighlight((prev) =>
                    prev && prev.slideKey === slideKey && prev.index === idx
                      ? null
                      : { slideKey, index: idx },
                  )
                }
                className={cn(
                  "flex min-h-[44px] cursor-pointer flex-col items-start gap-1.5 rounded-2xl border p-3.5 text-left transition-all duration-200 hover:brightness-110",
                  styles.surface,
                  styles.border,
                  isActive && `ring-2 ${styles.ring} -translate-y-0.5`,
                  activeTokenIdx !== null && !isActive && "opacity-85 hover:opacity-100",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <code
                    className={cn(
                      "rounded-md border px-2 py-0.5 font-mono text-xs font-bold",
                      styles.chip,
                    )}
                  >
                    {hl.token}
                  </code>
                  <ToneIcon tone={tone} className={cn("h-4 w-4 shrink-0", styles.text)} />
                </div>
                <p className={cn("text-xs font-bold uppercase tracking-wider", styles.text)}>
                  {hl.label}
                </p>
                <p className="text-[13px] leading-relaxed text-[#e6eee5]">
                  {renderInline(hl.explanation)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* =======================================================================
     3. CONTRAST SPLIT — High-Impact A vs B Side-by-Side Comparison
     ======================================================================= */
  if (slide.layout === "contrast-split") {
    const leftStyles = TONE_MAP[slide.leftTone];
    const rightStyles = TONE_MAP[slide.rightTone];
    const beat = getBeatIndex(3, isPlaying, progressRatio, reducedMotion);

    return (
      <div data-testid="slide-layout-contrast-split" className="bg-[#0e1310] p-5 sm:p-7 space-y-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#c8ed97]">
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            OPPOSITION CRITIQUE
          </span>
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#f5f7f0] sm:text-2xl lg:text-[26px]">
            {sceneTitle}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            className={cn(
              "overflow-hidden rounded-2xl border transition-all duration-300",
              leftStyles.surface,
              leftStyles.border,
              beat === 0 && `ring-2 ${leftStyles.ring}`,
            )}
          >
            <div className={cn("h-1.5 w-full", leftStyles.accentBar)} />
            <div className="p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    leftStyles.badge,
                  )}
                >
                  <ToneIcon tone={slide.leftTone} className="h-4 w-4" />
                </span>
                <h3 className={cn("text-base font-extrabold sm:text-lg", leftStyles.text)}>
                  {slide.leftTitle}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {slide.leftItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-[14px] leading-relaxed text-[#edf2ec]"
                  >
                    <span
                      className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", leftStyles.accentBar)}
                      aria-hidden="true"
                    />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className={cn(
              "overflow-hidden rounded-2xl border transition-all duration-300",
              rightStyles.surface,
              rightStyles.border,
              beat === 1 && `ring-2 ${rightStyles.ring}`,
            )}
          >
            <div className={cn("h-1.5 w-full", rightStyles.accentBar)} />
            <div className="p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    rightStyles.badge,
                  )}
                >
                  <ToneIcon tone={slide.rightTone} className="h-4 w-4" />
                </span>
                <h3 className={cn("text-base font-extrabold sm:text-lg", rightStyles.text)}>
                  {slide.rightTitle}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {slide.rightItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-[14px] leading-relaxed text-[#edf2ec]"
                  >
                    <span
                      className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", rightStyles.accentBar)}
                      aria-hidden="true"
                    />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {slide.verdict ? (
          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl border border-[#445e3b] bg-[#162216] px-4 py-3.5 transition-all duration-300",
              beat === 2 && "ring-2 ring-[#c8ed97]/70",
            )}
          >
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#c8ed97]" aria-hidden="true" />
            <p className="text-[14.5px] font-semibold leading-relaxed text-[#f2f7ee]">
              {renderInline(slide.verdict)}
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  /* =======================================================================
     4. MECHANISM FLOW — Causal Architecture & Sensor Boundary Pipeline
     ======================================================================= */
  if (slide.layout === "mechanism-flow") {
    const beat = getBeatIndex(slide.nodes.length, isPlaying, progressRatio, reducedMotion);

    const ZONE_META: Record<
      "upstream" | "boundary" | "sensor" | "output",
      { label: string; tone: SlideTone }
    > = {
      upstream: { label: "AMONT (INVISIBLE)", tone: "neutral" },
      boundary: { label: "FRONTIÈRE / FILTRE", tone: "warning" },
      sensor: { label: "CAPTEUR MESURANT", tone: "info" },
      output: { label: "TRACE / VERDICT", tone: "fact" },
    };

    return (
      <div data-testid="slide-layout-mechanism-flow" className="bg-[#0e1310] p-5 sm:p-7 space-y-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68b8ea]">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            MÉCANISME &amp; FRONTIÈRE D&apos;OBSERVATION
          </span>
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#f5f7f0] sm:text-2xl lg:text-[26px]">
            {sceneTitle}
          </h2>
        </div>

        {slide.blindSpotLabel ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#f59e0b]/70 bg-[#21190c] px-4 py-2.5 text-sm text-[#fde68a]">
            <EyeOff className="h-4 w-4 shrink-0 text-[#f59e0b]" aria-hidden="true" />
            <span className="font-medium">{renderInline(slide.blindSpotLabel)}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {slide.nodes.map((node, idx) => {
            const meta = ZONE_META[node.zone];
            const styles = TONE_MAP[meta.tone];
            const isCurrent = beat === idx;
            const isBoundary = node.zone === "boundary";

            return (
              <React.Fragment key={`${node.title}-${idx}`}>
                <div
                  className={cn(
                    "relative flex flex-1 flex-col justify-between rounded-2xl border p-4 space-y-2.5 transition-all duration-300",
                    styles.surface,
                    isBoundary ? "border-dashed border-2 border-[#f59e0b]" : styles.border,
                    isCurrent && `ring-2 ${styles.ring}`,
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                          styles.badge,
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#9fad9f]">0{idx + 1}</span>
                    </div>
                    <h3 className="text-[15.5px] font-extrabold leading-snug text-[#f5f7f0]">
                      {renderInline(node.title)}
                    </h3>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-[#dfe7de]">
                    {renderInline(node.detail)}
                  </p>
                </div>

                {idx < slide.nodes.length - 1 ? (
                  <div
                    className="flex shrink-0 items-center justify-center text-[#68b8ea]"
                    aria-hidden="true"
                  >
                    <ArrowDown className="h-5 w-5 lg:hidden" />
                    <ArrowRight className="hidden h-5 w-5 lg:block" />
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>

        {slide.takeaway ? (
          <div className="rounded-2xl border border-[#3d5935] bg-[#152116] px-4 py-3.5 text-[14.5px] font-semibold leading-relaxed text-[#e9f3e4]">
            <span className="mr-2 font-mono text-xs uppercase tracking-wider text-[#c8ed97]">
              À retenir ·
            </span>
            {renderInline(slide.takeaway)}
          </div>
        ) : null}
      </div>
    );
  }

  /* =======================================================================
     5. TIMELINE SHIFT — Before / After Clock-Drift Inversion Comparator
     ======================================================================= */
  if (slide.layout === "timeline-shift") {
    const beat = getBeatIndex(2, isPlaying, progressRatio, reducedMotion);

    return (
      <div data-testid="slide-layout-timeline-shift" className="bg-[#0e1310] p-5 sm:p-7 space-y-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#fcd34d]">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            PIÈGE TEMPOREL · DÉRIVE D&apos;HORLOGE
          </span>
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#f5f7f0] sm:text-2xl lg:text-[26px]">
            {sceneTitle}
          </h2>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-[#7c581c] bg-[#241b0c] px-4 py-3 text-sm text-[#fde68a]">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#f59e0b]" aria-hidden="true" />
          <p className="font-semibold leading-relaxed">{renderInline(slide.driftNote)}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            className={cn(
              "rounded-2xl border border-[#6f2636] bg-[#1e1114] p-4 sm:p-5 space-y-3.5 transition-all duration-300",
              beat === 0 && "ring-2 ring-[#fda4af]/60",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#4a1e28] pb-2.5">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#fda4af]">
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Chronologie apparente (trompeuse)
              </span>
            </div>
            <ol className="relative space-y-2.5 border-l-2 border-[#6f2636] pl-4">
              {slide.apparentOrder.map((ev, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-[#4c202a] bg-[#140c0e] p-3 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded bg-[#be123c] px-2 py-0.5 font-mono text-xs font-bold text-white">
                      {ev.time}
                    </span>
                    <span className="font-mono text-[11px] text-[#fda4af]">{ev.host}</span>
                  </div>
                  <p className="text-[13.5px] leading-snug text-[#f4e4e7]">
                    {renderInline(ev.event)}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div
            className={cn(
              "rounded-2xl border border-[#3e5b36] bg-[#121d14] p-4 sm:p-5 space-y-3.5 transition-all duration-300",
              beat === 1 && "ring-2 ring-[#c8ed97]/70",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#293d25] pb-2.5">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#c8ed97]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Chronologie réelle (horloges alignées)
              </span>
            </div>
            <ol className="relative space-y-2.5 border-l-2 border-[#4c6f41] pl-4">
              {slide.realOrder.map((ev, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-[#2c4228] bg-[#0d150f] p-3 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded bg-[#c8ed97] px-2 py-0.5 font-mono text-xs font-bold text-[#101312]">
                      {ev.time}
                    </span>
                    <span className="font-mono text-[11px] text-[#c8ed97]">{ev.host}</span>
                  </div>
                  <p className="text-[13.5px] leading-snug text-[#eef4eb]">
                    {renderInline(ev.event)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2b4960] bg-[#111d26] px-4 py-3.5 text-[14.5px] font-semibold leading-relaxed text-[#e5f1fc]">
          {renderInline(slide.lesson)}
        </div>
      </div>
    );
  }

  /* =======================================================================
     6. ELIMINATION BOARD — SOC Hypothesis Refutation Tracker (3 -> 2 -> 1)
     ======================================================================= */
  if (slide.layout === "elimination-board") {
    const beat = getBeatIndex(slide.hypotheses.length, isPlaying, progressRatio, reducedMotion);

    const STATUS_STYLE = {
      open: {
        badge: "OUVERTE",
        tone: TONE_MAP.info,
        icon: Compass,
      },
      refuted: {
        badge: "ÉCARTÉE",
        tone: TONE_MAP.danger,
        icon: XCircle,
      },
      corroborated: {
        badge: "CORROBORÉE",
        tone: TONE_MAP.fact,
        icon: ShieldCheck,
      },
    } as const;

    return (
      <div
        data-testid="slide-layout-elimination-board"
        className="bg-[#0e1310] p-5 sm:p-7 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222f25] pb-4">
          <div className="space-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68b8ea]">
              TABLEAU D&apos;ÉLIMINATION PAR PREUVES
            </span>
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#f5f7f0] sm:text-2xl">
              {slide.sourceLabel}
            </h2>
          </div>
          <div className="rounded-2xl border border-[#445f3b] bg-[#182517] px-4 py-2 text-center">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#9fad9f]">
              État du dossier
            </span>
            <span className="font-mono text-base font-extrabold text-[#c8ed97] sm:text-lg">
              {slide.activeSourceCount}
            </span>
          </div>
        </div>

        <div className="grid gap-3.5 md:grid-cols-3">
          {slide.hypotheses.map((hyp, idx) => {
            const cfg = STATUS_STYLE[hyp.status];
            const Icon = cfg.icon;
            const isRefuted = hyp.status === "refuted";
            const isCurrent = beat === idx;

            return (
              <div
                key={`${hyp.code}-${idx}`}
                className={cn(
                  "flex flex-col justify-between rounded-2xl border p-4 space-y-3 transition-all duration-300",
                  cfg.tone.surface,
                  cfg.tone.border,
                  isRefuted && "border-dashed",
                  isCurrent && `ring-2 ${cfg.tone.ring}`,
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-lg font-black text-[#f5f7f0]">{hyp.code}</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold tracking-wider",
                        cfg.tone.badge,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {cfg.badge}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      "text-[15px] font-bold leading-snug text-[#f5f7f0]",
                      isRefuted && "line-through decoration-[#fda4af]/80 text-[#e7cfd3]",
                    )}
                  >
                    {hyp.title}
                  </h3>
                </div>
                <p className="rounded-xl border border-white/5 bg-black/20 p-3 text-[13px] leading-relaxed text-[#e6ede5]">
                  {renderInline(hyp.reason)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* =======================================================================
     7. RULE MANIFESTO — Keynote Principle & Architectural Pillars Poster
     ======================================================================= */
  if (slide.layout === "rule-manifesto") {
    const beat = getBeatIndex(slide.pillars.length, isPlaying, progressRatio, reducedMotion);

    return (
      <div
        data-testid="slide-layout-rule-manifesto"
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(200,237,151,0.10),_transparent_52%),#0e1310] p-6 sm:p-8 space-y-6"
      >
        <div className="mx-auto max-w-3xl space-y-2.5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3f5937] bg-[#162216] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-[#c8ed97]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            RÈGLE FONDAMENTALE
          </span>
          <h2 className="text-2xl font-extrabold tracking-[-0.025em] leading-[1.2] text-[#f5f7f0] sm:text-3xl lg:text-[32px]">
            {renderInline(slide.axiom)}
          </h2>
          {slide.subtext ? (
            <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[#c6d3c7]">
              {renderInline(slide.subtext)}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "grid gap-3.5",
            slide.pillars.length === 2
              ? "sm:grid-cols-2"
              : slide.pillars.length === 4
                ? "sm:grid-cols-2"
                : "sm:grid-cols-3",
          )}
        >
          {slide.pillars.map((pillar, idx) => {
            const isCurrent = beat === idx;
            return (
              <div
                key={`${pillar.label}-${idx}`}
                className={cn(
                  "rounded-2xl border border-[#2c3b30] bg-[#131915] p-4 sm:p-5 space-y-2 transition-all duration-300",
                  isCurrent && "border-[#c8ed97] ring-2 ring-[#c8ed97]/50",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1d2b1d] font-mono text-sm font-black text-[#c8ed97] border border-[#3c5736]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-extrabold text-[#f5f7f0]">{pillar.label}</h3>
                </div>
                <p className="text-[13.5px] leading-relaxed text-[#dce3db]">
                  {renderInline(pillar.detail)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* =======================================================================
     8. CASE GALLERY — Multi-Sensor Transfer Matrix Cards
     ======================================================================= */
  const beat = getBeatIndex(slide.cards.length, isPlaying, progressRatio, reducedMotion);

  return (
    <div data-testid="slide-layout-case-gallery" className="bg-[#0e1310] p-5 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#c8ed97]">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            TRANSFERT MULTI-CAPTEURS
          </span>
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#f5f7f0] sm:text-2xl">
            {sceneTitle}
          </h2>
        </div>
        <span className="rounded-full border border-[#2c3d2f] bg-[#141c16] px-3 py-1 font-mono text-[11px] text-[#a9c7fa]">
          {slide.cards.length} capteurs réels
        </span>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {slide.cards.map((card, idx) => {
          const isCurrent = beat === idx;
          return (
            <div
              key={`${card.sensor}-${idx}`}
              className={cn(
                "flex flex-col justify-between rounded-2xl border border-[#2c3b30] bg-[#131915] p-4 space-y-2.5 transition-all duration-300",
                isCurrent && "border-[#c8ed97] ring-2 ring-[#c8ed97]/50",
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#222f25] pb-2">
                <h3 className="font-mono text-sm font-extrabold text-[#f5f7f0]">{card.sensor}</h3>
                <span className="font-mono text-[10.5px] text-[#9fad9f]">#{idx + 1}</span>
              </div>

              <div className="space-y-2 text-[12.5px] leading-snug">
                <div className="rounded-xl border border-[#324a2d] bg-[#142015] p-2.5 space-y-1">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#c8ed97]">
                    Fait mesuré
                  </span>
                  <p className="text-[#eaf2e8]">{renderInline(card.fact)}</p>
                </div>

                <div className="rounded-xl border border-[#612331] bg-[#211216] p-2.5 space-y-1">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#fda4af]">
                    Piège d&apos;interprétation
                  </span>
                  <p className="text-[#f7e4e7]">{renderInline(card.trap)}</p>
                </div>

                <div className="rounded-xl border border-[#264257] bg-[#111c24] p-2.5 space-y-1">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#a9c7fa]">
                    Vérification à mener
                  </span>
                  <p className="text-[#e3effa]">{renderInline(card.check)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
