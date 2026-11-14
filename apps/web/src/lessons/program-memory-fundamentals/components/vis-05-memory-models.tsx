"use client";

import * as React from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, GitCompare, RotateCcw } from "lucide-react";
import {
  ConceptTransformBanner,
  getStepDuration,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@cyber-school/ui";
import {
  getModelComparisonTimeline,
  type GcFrequency,
  type ModelScenarioId,
  type ModelTrackSnapshot,
} from "../engines/memory-models";

const SCENARIO_LABELS: Record<ModelScenarioId, string> = {
  nominal: "Cycle nominal",
  "forgotten-free-or-cycle": "Oubli de free() / Cycle",
  "use-after-move": "Use after free / Move",
};

const BADGE_VARIANTS: Record<
  ModelTrackSnapshot["statusBadge"],
  "secondary" | "default" | "destructive" | "outline"
> = {
  ok: "secondary",
  freed: "default",
  "compile-blocked": "default",
  "gc-pending": "outline",
  leaked: "destructive",
  "uaf-risk": "destructive",
};

/**
 * VIS-05 Explorable Canvas:
 * - Confusion détruite : croire que C, Rust et un GC détectent les mêmes bugs au même moment.
 * - Objets animés : 3 pistes synchronisées (Manuel C avec fuite/UAF, Rust avec transfert de jeton Owner
 *   & bouclier Borrow Checker, GC Traçant avec onde Mark-and-Sweep balayant les objets inatteignables).
 */
export function Vis05MemoryModels() {
  const [scenario, setScenario] = React.useState<ModelScenarioId>("nominal");
  const [gcFreq, setGcFreq] = React.useState<GcFrequency>("aggressive");
  const [tickIdx, setTickIdx] = React.useState(0);

  const reducedMotion = usePrefersReducedMotion();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const rustOwnerRef = React.useRef<SVGGElement | null>(null);
  const gcSweepRef = React.useRef<SVGRectElement | null>(null);

  const timeline = React.useMemo(
    () => getModelComparisonTimeline(scenario, gcFreq),
    [scenario, gcFreq],
  );
  const current = timeline[Math.min(tickIdx, timeline.length - 1)] ?? timeline[0]!;
  const cTrack = current.tracks[0]!;
  const rustTrack = current.tracks[1]!;
  const gcTrack = current.tracks[2]!;

  useGsapScope(scopeRef, () => {
    const owner = rustOwnerRef.current;
    const sweep = gcSweepRef.current;
    const dur = getStepDuration(0.45, reducedMotion);

    if (owner) {
      const moved =
        rustTrack.statusBadge === "freed" ||
        rustTrack.statusBadge === "compile-blocked" ||
        (scenario === "use-after-move" && current.tick >= 2);
      const targetX = moved ? 395 : 235;
      if (dur === 0) {
        gsap.set(owner, { x: targetX });
      } else {
        gsap.to(owner, { x: targetX, duration: dur, ease: "power2.out" });
      }
    }

    if (sweep) {
      const sweeping = gcTrack.statusBadge === "freed" && current.tick >= 4;
      if (dur === 0) {
        gsap.set(sweep, { opacity: sweeping ? 0.35 : 0, x: sweeping ? 560 : 190 });
      } else if (sweeping) {
        gsap.fromTo(
          sweep,
          { opacity: 0.7, x: 190 },
          { opacity: 0.15, x: 560, duration: Math.max(0.3, dur), ease: "power1.inOut" },
        );
      } else {
        gsap.set(sweep, { opacity: 0, x: 190 });
      }
    }
  }, [current.tick, scenario, rustTrack.statusBadge, gcTrack.statusBadge, reducedMotion]);

  function handleScenarioChange(next: ModelScenarioId) {
    setScenario(next);
    setTickIdx(0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setTickIdx((p) => Math.min(timeline.length - 1, p + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setTickIdx((p) => Math.max(0, p - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setTickIdx(0);
    }
  }

  return (
    <div ref={scopeRef}>
      <Card
        data-testid="vis-05-memory-models"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Comparateur VIS-05 Gestion manuelle C, Ownership Rust et GC traçant"
        className="overflow-hidden border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CardHeader className="space-y-3 border-b border-border/60 bg-secondary/15 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base sm:text-lg">
                Explorer : Manuel C vs Ownership Rust vs Ramasse-miettes (GC)
              </CardTitle>
            </div>
            <Badge variant="outline" data-testid="vis05-tick-badge">
              t = {current.tick} / {timeline.length - 1} · {current.phaseLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(SCENARIO_LABELS) as ModelScenarioId[]).map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={scenario === key ? "default" : "outline"}
                data-testid={`vis05-scenario-${key}`}
                onClick={() => handleScenarioChange(key)}
              >
                {SCENARIO_LABELS[key]}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="vis05-gc-toggle"
              onClick={() => setGcFreq((f) => (f === "aggressive" ? "lazy" : "aggressive"))}
            >
              GC : {gcFreq === "aggressive" ? "Agressif (t=4)" : "Paresseux (t=5)"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={tickIdx === 0}
              onClick={() => setTickIdx((p) => Math.max(0, p - 1))}
              data-testid="vis05-prev-step"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Précédent
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={tickIdx >= timeline.length - 1}
              onClick={() => setTickIdx((p) => Math.min(timeline.length - 1, p + 1))}
              data-testid="vis05-next-step"
            >
              Suivant
              <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setTickIdx(0)}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Début
            </Button>
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <span>Temps t={current.tick}</span>
              <input
                type="range"
                min={0}
                max={timeline.length - 1}
                value={tickIdx}
                onChange={(e) => setTickIdx(Number(e.target.value))}
                aria-label="Curseur temporel C, Rust et GC"
                className="accent-primary"
              />
            </label>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <ConceptTransformBanner
            stepKey={`${scenario}-${gcFreq}-${current.tick}`}
            cause={`${SCENARIO_LABELS[scenario]} · t = ${current.tick}`}
            mechanism={current.summary}
            effectDelta={`C ${cTrack.ramUnits}% · Rust ${rustTrack.ramUnits}% · GC ${gcTrack.ramUnits}%`}
            tone={
              current.tracks.some((t) => t.statusBadge === "leaked" || t.statusBadge === "uaf-risk")
                ? "danger"
                : current.tracks.some((t) => t.statusBadge === "compile-blocked")
                  ? "causal"
                  : "success"
            }
            testId="vis05-transform-banner"
          />

          {/* 3-Lane Animated Mechanism Stage */}
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <svg
              viewBox="0 0 720 226"
              className="h-auto w-full"
              role="img"
              aria-label={`Animation 3 pistes à t=${current.tick} : C ${cTrack.statusLabel}, Rust ${rustTrack.statusLabel}, GC ${gcTrack.statusLabel}`}
            >
              {/* Lane 1: Manual C */}
              <rect
                x="10"
                y="10"
                width="700"
                height="62"
                rx="10"
                fill="hsl(var(--card))"
                stroke={
                  cTrack.statusBadge === "leaked" || cTrack.statusBadge === "uaf-risk"
                    ? "#ef4444"
                    : "hsl(var(--border))"
                }
              />
              <text x="24" y="34" className="fill-foreground text-[11px] font-bold">
                1. Manuel C
              </text>
              <text x="24" y="52" className="fill-muted-foreground font-mono text-[9px]">
                {cTrack.statusLabel}
              </text>

              <rect
                x="200"
                y="22"
                width="104"
                height="36"
                rx="6"
                fill="hsl(var(--secondary))"
                stroke="hsl(var(--border))"
              />
              <text
                x="252"
                y="44"
                textAnchor="middle"
                className="fill-foreground font-mono text-[10px]"
              >
                ptr ({cTrack.statusBadge === "leaked" ? "perdu !" : "pile"})
              </text>
              <line
                x1="304"
                y1="40"
                x2="420"
                y2="40"
                stroke={
                  cTrack.statusBadge === "uaf-risk" || cTrack.statusBadge === "leaked"
                    ? "#ef4444"
                    : "#10b981"
                }
                strokeWidth="2.4"
                strokeDasharray={cTrack.statusBadge === "leaked" ? "4 4" : undefined}
              />
              <rect
                x="420"
                y="20"
                width="274"
                height="40"
                rx="7"
                fill={
                  cTrack.statusBadge === "uaf-risk" || cTrack.statusBadge === "leaked"
                    ? "#ef444424"
                    : cTrack.ramUnits > 0
                      ? "#10b9811f"
                      : "transparent"
                }
                stroke={
                  cTrack.statusBadge === "uaf-risk" || cTrack.statusBadge === "leaked"
                    ? "#ef4444"
                    : "#64748b"
                }
                strokeDasharray={cTrack.ramUnits === 0 ? "4 3" : undefined}
              />
              <text
                x="557"
                y="44"
                textAnchor="middle"
                className="fill-foreground font-mono text-[9.5px] font-semibold"
              >
                {cTrack.heapSummary}
              </text>

              {/* Lane 2: Rust Ownership */}
              <rect
                x="10"
                y="82"
                width="700"
                height="62"
                rx="10"
                fill="hsl(var(--card))"
                stroke={
                  rustTrack.statusBadge === "compile-blocked" ? "#38bdf8" : "hsl(var(--border))"
                }
              />
              <text x="24" y="106" className="fill-foreground text-[11px] font-bold">
                2. Ownership Rust
              </text>
              <text x="24" y="124" className="fill-primary font-mono text-[9px]">
                {rustTrack.statusLabel}
              </text>

              <rect
                x="200"
                y="94"
                width="104"
                height="36"
                rx="6"
                fill="hsl(var(--secondary))"
                stroke="hsl(var(--border))"
              />
              <text
                x="252"
                y="116"
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[10px]"
              >
                x
              </text>
              <rect
                x="360"
                y="94"
                width="104"
                height="36"
                rx="6"
                fill="hsl(var(--secondary))"
                stroke="hsl(var(--border))"
              />
              <text
                x="412"
                y="116"
                textAnchor="middle"
                className="fill-foreground font-mono text-[10px]"
              >
                y (drop auto)
              </text>

              {/* Moving Ownership Crown Badge */}
              <g transform="translate(0, 92)">
                <g ref={rustOwnerRef}>
                  <rect x="0" y="-4" width="66" height="16" rx="4" fill="#f59e0b" />
                  <text
                    x="33"
                    y="7"
                    textAnchor="middle"
                    className="fill-slate-950 font-mono text-[8.5px] font-bold"
                  >
                    OWNER
                  </text>
                </g>
              </g>

              {rustTrack.statusBadge === "compile-blocked" ? (
                <g>
                  <rect
                    x="484"
                    y="92"
                    width="210"
                    height="40"
                    rx="7"
                    fill="#38bdf824"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <text
                    x="589"
                    y="116"
                    textAnchor="middle"
                    className="fill-sky-400 font-mono text-[10px] font-bold"
                  >
                    🛡 Borrow Checker : bloqué avant exécution !
                  </text>
                </g>
              ) : (
                <text x="490" y="116" className="fill-muted-foreground font-mono text-[9.5px]">
                  {rustTrack.heapSummary}
                </text>
              )}

              {/* Lane 3: Tracing GC */}
              <rect
                x="10"
                y="154"
                width="700"
                height="62"
                rx="10"
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
              />
              <text x="24" y="178" className="fill-foreground text-[11px] font-bold">
                3. GC Traçant
              </text>
              <text x="24" y="196" className="fill-muted-foreground font-mono text-[9px]">
                {gcTrack.statusLabel} (Roots: {current.gcRootsCount})
              </text>

              <circle
                cx="236"
                cy="185"
                r="16"
                fill={current.gcRootsCount > 0 ? "#10b98128" : "#64748b22"}
                stroke={current.gcRootsCount > 0 ? "#10b981" : "#64748b"}
              />
              <text
                x="236"
                y="188"
                textAnchor="middle"
                className="fill-foreground font-mono text-[8.5px]"
              >
                Root
              </text>
              <line
                x1="252"
                y1="185"
                x2="348"
                y2="185"
                stroke={current.gcRootsCount > 0 ? "#10b981" : "#f59e0b"}
                strokeWidth="2"
                strokeDasharray={current.gcRootsCount === 0 ? "4 3" : undefined}
              />
              <rect
                x="348"
                y="165"
                width="346"
                height="40"
                rx="7"
                fill={
                  gcTrack.statusBadge === "gc-pending"
                    ? "#f59e0b20"
                    : gcTrack.ramUnits > 0
                      ? "#10b9811f"
                      : "transparent"
                }
                stroke={gcTrack.statusBadge === "gc-pending" ? "#f59e0b" : "#64748b"}
                strokeDasharray={gcTrack.ramUnits === 0 ? "4 3" : undefined}
              />
              <text
                x="521"
                y="189"
                textAnchor="middle"
                className="fill-foreground font-mono text-[9.5px]"
              >
                {gcTrack.heapSummary}
              </text>

              {/* Animated Mark & Sweep Scanner */}
              <rect
                ref={gcSweepRef}
                x="0"
                y="160"
                width="28"
                height="50"
                rx="4"
                fill="#10b981"
                opacity="0"
              />
            </svg>
          </div>

          {/* Track Status Badges (preserved data-testid="vis05-status-*") */}
          <div className="grid gap-2 md:grid-cols-3">
            {current.tracks.map((track) => (
              <div
                key={track.trackId}
                data-testid={`vis05-track-${track.trackId}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
                  track.statusBadge === "leaked" || track.statusBadge === "uaf-risk"
                    ? "border-destructive/60 bg-destructive/5"
                    : track.statusBadge === "compile-blocked"
                      ? "border-primary/60 bg-primary/5"
                      : "bg-card",
                )}
              >
                <span className="font-semibold">{track.title}</span>
                <Badge
                  variant={BADGE_VARIANTS[track.statusBadge]}
                  data-testid={`vis05-status-${track.trackId}`}
                  className="text-[11px]"
                >
                  {track.statusLabel}
                </Badge>
              </div>
            ))}
          </div>

          {/* Comparative SVG Bar Chart (preserved data-testid="vis05-svg-chart") */}
          <svg
            viewBox="0 0 420 84"
            className="h-20 w-full rounded border bg-background p-1"
            role="img"
            aria-label={`Empreinte RAM à t=${current.tick} : C ${cTrack.ramUnits}%, Rust ${rustTrack.ramUnits}%, GC ${gcTrack.ramUnits}%`}
            data-testid="vis05-svg-chart"
          >
            {current.tracks.map((track, idx) => {
              const y = 8 + idx * 25;
              const barWidth = Math.max(0, (track.ramUnits / 100) * 230);
              const fillClass =
                track.statusBadge === "leaked" || track.statusBadge === "uaf-risk"
                  ? "fill-destructive"
                  : track.statusBadge === "compile-blocked"
                    ? "fill-primary"
                    : track.statusBadge === "gc-pending"
                      ? "fill-amber-500"
                      : "fill-emerald-600";
              return (
                <g key={track.trackId}>
                  <text x="8" y={y + 13} className="fill-foreground text-[10.5px] font-medium">
                    {track.trackId === "manual-c"
                      ? "Manuel C"
                      : track.trackId === "rust-raii"
                        ? "Rust RAII"
                        : "GC Traçant"}
                  </text>
                  <rect x="95" y={y + 2} width="230" height="14" rx="3" className="fill-muted" />
                  <rect
                    x="95"
                    y={y + 2}
                    width={barWidth}
                    height="14"
                    rx="3"
                    className={cn(
                      fillClass,
                      "transition-all duration-300 motion-reduce:transition-none",
                    )}
                  />
                  <text x="334" y={y + 13} className="fill-foreground text-[10.5px] font-mono">
                    {track.ramUnits}%
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}
