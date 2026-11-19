"use client";

import * as React from "react";
import gsap from "gsap";
import { MotionStepPanel } from "./motion-primitives.js";
import { getStepDuration } from "./reduced-motion.js";

export type ConceptTransformTone = "neutral" | "causal" | "warning" | "danger" | "success";

export interface ConceptTransformBannerProps {
  stepKey: string | number;
  cause: string;
  mechanism: string;
  effectDelta?: string;
  tone?: ConceptTransformTone;
  testId?: string;
}

const TONE_CLASSES: Record<ConceptTransformTone, string> = {
  neutral: "border-border bg-muted/40 text-foreground",
  causal: "border-primary/45 bg-primary/10 text-foreground",
  warning: "border-amber-500/45 bg-amber-500/10 text-foreground",
  danger: "border-destructive/50 bg-destructive/10 text-foreground",
  success: "border-emerald-500/45 bg-emerald-500/10 text-foreground",
};

const TONE_LABELS: Record<ConceptTransformTone, string> = {
  neutral: "ÉTAT",
  causal: "MÉCANISME",
  warning: "BIAIS / ALERTE",
  danger: "RUPTURE / FAILLE",
  success: "PREUVE",
};

/**
 * Contiguous CTML banner linking the active visual transformation directly to its causal explanation
 * and before -> after delta, preserving clarity under reduced-motion.
 */
export function ConceptTransformBanner({
  stepKey,
  cause,
  mechanism,
  effectDelta,
  tone = "causal",
  testId = "concept-transform-banner",
}: ConceptTransformBannerProps) {
  return (
    <MotionStepPanel stepKey={stepKey}>
      <div
        data-testid={testId}
        role="status"
        aria-live="polite"
        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${TONE_CLASSES[tone]}`}
      >
        <div className="flex min-w-0 grow basis-full flex-wrap items-center gap-x-2 gap-y-1 sm:basis-64">
          <span className="inline-flex shrink-0 items-center rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide border border-border">
            {TONE_LABELS[tone]}
          </span>
          <span className="font-semibold text-foreground">{cause}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            →
          </span>
          <span className="text-muted-foreground">{mechanism}</span>
        </div>
        {effectDelta ? (
          <span className="max-w-full break-words rounded border border-border bg-background/90 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
            {effectDelta}
          </span>
        ) : null}
      </div>
    </MotionStepPanel>
  );
}

export interface SvgSignalRoute {
  element: SVGElement | null;
  from: { x: number; y: number };
  to: { x: number; y: number };
  active: boolean;
}

/**
 * Animates labeled SVG tokens along exact edge coordinates simultaneously, snapping cleanly when reducedMotion is active.
 */
export function animateSvgSignalRoutes(
  routes: SvgSignalRoute[],
  options: { durationSeconds?: number; reducedMotion: boolean },
): void {
  const duration = getStepDuration(options.durationSeconds ?? 0.55, options.reducedMotion);
  for (const route of routes) {
    if (!route.element) continue;
    if (!route.active) {
      gsap.set(route.element, {
        opacity: 0,
        attr: { cx: route.from.x, cy: route.from.y },
      });
      continue;
    }
    if (duration === 0) {
      gsap.set(route.element, {
        opacity: 1,
        attr: { cx: route.to.x, cy: route.to.y },
      });
      continue;
    }
    gsap.fromTo(
      route.element,
      { opacity: 0.2, attr: { cx: route.from.x, cy: route.from.y } },
      {
        opacity: 1,
        attr: { cx: route.to.x, cy: route.to.y },
        duration,
        ease: "power2.out",
      },
    );
  }
}
