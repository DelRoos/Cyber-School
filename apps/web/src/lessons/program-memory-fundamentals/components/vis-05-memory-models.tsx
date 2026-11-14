"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, GitCompare, Info, RotateCcw } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@cyber-school/ui";
import {
  getModelComparisonTimeline,
  type GcFrequency,
  type ModelScenarioId,
  type ModelTrackSnapshot,
} from "../engines/memory-models";

const SCENARIO_LABELS: Record<ModelScenarioId, string> = {
  nominal: "Cycle nominal",
  "forgotten-free-or-cycle": "Oubli de free() / Réf. circulaire",
  "use-after-move": "Réutilisation après libération / Move",
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

export function Vis05MemoryModels() {
  const [scenario, setScenario] = React.useState<ModelScenarioId>("nominal");
  const [gcFreq, setGcFreq] = React.useState<GcFrequency>("aggressive");
  const [tickIdx, setTickIdx] = React.useState(0);

  const timeline = React.useMemo(
    () => getModelComparisonTimeline(scenario, gcFreq),
    [scenario, gcFreq],
  );
  const current = timeline[Math.min(tickIdx, timeline.length - 1)] ?? timeline[0]!;

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
    <Card
      data-testid="vis-05-memory-models"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Comparateur VIS-05 Gestion manuelle C, Ownership Rust et GC traçant"
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">
              VIS-05 · Comparateur de modèles mémoire : Manuel C vs Ownership Rust vs GC traçant
            </CardTitle>
          </div>
          <Badge variant="outline" data-testid="vis05-tick-badge">
            t = {current.tick} / {timeline.length - 1} · {current.phaseLabel}
          </Badge>
        </div>

        <CardDescription>
          Même scénario métier, trois philosophies d&apos;ingénierie : responsabilité manuelle à
          l&apos;exécution, preuve statique à la compilation (
          <code className="font-mono">borrow checker</code>
          ), ou traçage périodique depuis les racines (<code className="font-mono">GC Roots</code>).
        </CardDescription>

        {/* Scenario & GC controls */}
        <div className="flex flex-wrap items-center gap-2">
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
            Fréquence GC : {gcFreq === "aggressive" ? "Agressif (t=4)" : "Paresseux (t=5)"}
          </Button>
        </div>

        {/* Timeline Stepper */}
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
            <span>Timeline</span>
            <input
              type="range"
              min={0}
              max={timeline.length - 1}
              value={tickIdx}
              onChange={(e) => setTickIdx(Number(e.target.value))}
              aria-label="Position temporelle dans la comparaison"
              className="accent-primary"
            />
          </label>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 3 Synchronized Columns */}
        <div className="grid gap-3 md:grid-cols-3">
          {current.tracks.map((track) => (
            <div
              key={track.trackId}
              data-testid={`vis05-track-${track.trackId}`}
              className={cn(
                "flex flex-col justify-between gap-2 rounded-lg border p-3",
                track.statusBadge === "leaked" || track.statusBadge === "uaf-risk"
                  ? "border-destructive/60 bg-destructive/5"
                  : track.statusBadge === "compile-blocked"
                    ? "border-primary/60 bg-primary/5"
                    : "bg-card",
              )}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h4 className="text-sm font-semibold">{track.title}</h4>
                  <Badge
                    variant={BADGE_VARIANTS[track.statusBadge]}
                    data-testid={`vis05-status-${track.trackId}`}
                    className="text-[11px]"
                  >
                    {track.statusLabel}
                  </Badge>
                </div>

                <div className="space-y-1 rounded border bg-muted/30 p-2 font-mono text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Pile : </span>
                    <span className="font-medium">{track.stackSummary}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tas : </span>
                    <span className="font-medium">{track.heapSummary}</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{track.detail}</p>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Occupation RAM simulée : {track.ramUnits}%
              </div>
            </div>
          ))}
        </div>

        {/* Comparative SVG Bar Chart */}
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Empreinte RAM comparative à t = {current.tick}
            </span>
            <span className="font-mono">GC Roots actifs : {current.gcRootsCount}</span>
          </div>

          <svg
            viewBox="0 0 420 96"
            className="h-24 w-full rounded border bg-background p-1"
            role="img"
            aria-label={`Empreinte RAM à t=${current.tick} : C ${current.tracks[0].ramUnits}%, Rust ${current.tracks[1].ramUnits}%, GC ${current.tracks[2].ramUnits}%`}
            data-testid="vis05-svg-chart"
          >
            {current.tracks.map((track, idx) => {
              const y = 10 + idx * 28;
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
                  <text x="8" y={y + 14} className="fill-foreground text-[11px] font-medium">
                    {track.trackId === "manual-c"
                      ? "Manuel C"
                      : track.trackId === "rust-raii"
                        ? "Rust RAII"
                        : "GC Traçant"}
                  </text>
                  <rect x="95" y={y + 2} width="230" height="16" rx="3" className="fill-muted" />
                  <rect
                    x="95"
                    y={y + 2}
                    width={barWidth}
                    height="16"
                    rx="3"
                    className={fillClass}
                  />
                  <text x="334" y={y + 14} className="fill-foreground text-[11px] font-mono">
                    {track.ramUnits}% ({track.statusBadge})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Synchronized explanation */}
        <div
          aria-live="polite"
          className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed"
        >
          <span className="font-semibold text-foreground">Analyse comparative : </span>
          {current.summary}
        </div>

        <Alert>
          <Info className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Nuance d&apos;architecture</AlertTitle>
          <AlertDescription className="text-xs">
            En production, <code className="font-mono">unsafe</code> en Rust contourne le borrow
            checker, un GC générationnel ne balaie la majorité des objets courts qu&apos;en Gen0, et
            le comptage de références pur (sans collecteur de cycles) fuit sur{" "}
            <code className="font-mono">A &lt;-&gt; B</code> contrairement au GC traçant montré ici.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
