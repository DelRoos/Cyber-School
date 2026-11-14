"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, GitFork, Info, Pause, Play, RotateCcw } from "lucide-react";
import {
  animateSvgSignalRoutes,
  ConceptTransformBanner,
  MotionStepPanel,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
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
import { CAUSAL_STAGES, type CausalStageId } from "../engines/causal-reasoning";

const STAGE_BANNER_COPY: Record<
  CausalStageId,
  {
    cause: string;
    mechanism: string;
    effectDelta: string;
    tone: "neutral" | "warning" | "causal" | "success";
  }
> = {
  "raw-observation": {
    cause: "Lundi 08:00 UTC",
    mechanism: "Deux logs coïncident dans le temps (EDR redémarre et SSH alerte) sans lien tracé",
    effectDelta: "Preuve causale : aucune",
    tone: "neutral",
  },
  "naive-correlation": {
    cause: "Corrélation r(X,Y) = 0.91",
    mechanism: "L'arc pointillé X → Y est une hypothèse hâtive : Z reste encore caché",
    effectDelta: "P(Y|X=1) = 410 alertes/h",
    tone: "warning",
  },
  "confounder-revealed": {
    cause: "Tâche cron Z (08:00)",
    mechanism: "Z émet deux impulsions parallèles : Z → X (maj EDR) et Z → Y (scan SSH)",
    effectDelta: "Fourche Z→X & Z→Y active",
    tone: "causal",
  },
  "controlled-intervention": {
    cause: "do(X = OFF) appliqué",
    mechanism: "On coupe Z → X sur un hôte test ; l'impulsion Z → Y continue seule vers Y",
    effectDelta: "Y : 410 → 408 (-0.5%)",
    tone: "success",
  },
};

export function Vis01CausalConfounder() {
  const [stageIdx, setStageIdx] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const pulseZXRef = React.useRef<SVGCircleElement | null>(null);
  const pulseZYRef = React.useRef<SVGCircleElement | null>(null);
  const pulseXYRef = React.useRef<SVGCircleElement | null>(null);

  const stage = CAUSAL_STAGES[Math.min(stageIdx, CAUSAL_STAGES.length - 1)] ?? CAUSAL_STAGES[0]!;
  const banner = STAGE_BANNER_COPY[stage.id];

  React.useEffect(() => {
    if (!isPlaying || stageIdx >= CAUSAL_STAGES.length - 1) return;
    const timer = window.setTimeout(
      () => {
        setStageIdx((prev) => {
          const next = Math.min(CAUSAL_STAGES.length - 1, prev + 1);
          if (next >= CAUSAL_STAGES.length - 1) setIsPlaying(false);
          return next;
        });
      },
      reducedMotion ? 900 : 1500,
    );
    return () => window.clearTimeout(timer);
  }, [isPlaying, reducedMotion, stageIdx]);

  useGsapScope(scopeRef, () => {
    animateSvgSignalRoutes(
      [
        {
          element: pulseZXRef.current,
          from: { x: 152, y: 58 },
          to: { x: 92, y: 130 },
          active: stage.activeEdges.includes("Z->X"),
        },
        {
          element: pulseZYRef.current,
          from: { x: 208, y: 58 },
          to: { x: 268, y: 130 },
          active: stage.activeEdges.includes("Z->Y"),
        },
        {
          element: pulseXYRef.current,
          from: { x: 130, y: 158 },
          to: { x: 228, y: 158 },
          active: stage.activeEdges.includes("X->Y-spurious"),
        },
      ],
      { durationSeconds: 0.6, reducedMotion },
    );
  }, [stage.id, reducedMotion]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setIsPlaying(false);
      setStageIdx((prev) => Math.min(CAUSAL_STAGES.length - 1, prev + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setIsPlaying(false);
      setStageIdx((prev) => Math.max(0, prev - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setIsPlaying(false);
      setStageIdx(0);
    }
  }

  const alertsBarWidthPct = Math.min(100, Math.round((stage.sshAlertsPerHour / 450) * 100));

  return (
    <div
      ref={scopeRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-testid="vis-causal-confounder"
    >
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">
                VIS-01 · Simulateur causal : Corrélation vs Variable confondante (Z)
              </CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-xs" data-testid="causal-stage-badge">
              Étape {stage.stepNumber} / {CAUSAL_STAGES.length}
            </Badge>
          </div>
          <CardDescription>
            Observez comment une tâche planifiée Z (lundi 08:00) crée une fausse causalité entre
            redémarrage EDR (X) et pic d&apos;alertes SSH (Y), puis vérifiez l&apos;effet réel
            d&apos;une intervention <code className="font-mono">do(X = OFF)</code>.
          </CardDescription>

          {/* Playback Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="causal-prev-btn"
              disabled={stageIdx === 0}
              onClick={() => {
                setIsPlaying(false);
                setStageIdx((p) => Math.max(0, p - 1));
              }}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Précédent
            </Button>
            <Button
              type="button"
              size="sm"
              variant="default"
              data-testid="causal-play-btn"
              onClick={() => {
                if (stageIdx >= CAUSAL_STAGES.length - 1) setStageIdx(0);
                setIsPlaying((p) => !p);
              }}
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Lire
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="causal-next-btn"
              disabled={stageIdx >= CAUSAL_STAGES.length - 1}
              onClick={() => {
                setIsPlaying(false);
                setStageIdx((p) => Math.min(CAUSAL_STAGES.length - 1, p + 1));
              }}
            >
              Suivant
              <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              data-testid="causal-reset-btn"
              onClick={() => {
                setIsPlaying(false);
                setStageIdx(0);
              }}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Réinitialiser
            </Button>
          </div>

          {/* Stage Selector Pills */}
          <div
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Étapes du raisonnement causal"
          >
            {CAUSAL_STAGES.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={idx === stageIdx}
                data-testid={`causal-tab-${item.id}`}
                onClick={() => {
                  setIsPlaying(false);
                  setStageIdx(idx);
                }}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  idx === stageIdx
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary",
                )}
              >
                {item.shortTitle}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="min-w-0 space-y-4">
          <ConceptTransformBanner
            stepKey={stage.id}
            cause={banner.cause}
            mechanism={banner.mechanism}
            effectDelta={banner.effectDelta}
            tone={banner.tone}
            testId="vis01-causal-banner"
          />

          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
            {/* SVG Causal Graph */}
            <div className="min-w-0 rounded-lg border bg-muted/20 p-3">
              <svg
                viewBox="0 0 360 212"
                className="max-h-60 w-full"
                role="img"
                aria-label="Graphe causal orienté Z vers X et Y avec démonstration do(X=OFF)"
              >
                <defs>
                  <marker
                    id="causal-arrow-primary"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="hsl(var(--primary))" />
                  </marker>
                  <marker
                    id="causal-arrow-amber"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                </defs>

                {/* Z Node */}
                <g opacity={stage.confounderVisible ? 1 : 0.3}>
                  <rect
                    x="104"
                    y="12"
                    width="152"
                    height="46"
                    rx="8"
                    fill={stage.confounderVisible ? "hsl(var(--primary) / 0.16)" : "transparent"}
                    stroke="hsl(var(--primary))"
                    strokeWidth={stage.confounderVisible ? 2.2 : 1}
                    strokeDasharray={stage.confounderVisible ? undefined : "4 3"}
                  />
                  <text
                    x="180"
                    y="31"
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-semibold"
                  >
                    Z : Scan cron (Lun 08h)
                  </text>
                  <text
                    x="180"
                    y="47"
                    textAnchor="middle"
                    className="fill-muted-foreground text-[9px]"
                  >
                    {stage.confounderVisible ? "Cause commune active" : "Non observé à cette étape"}
                  </text>
                </g>

                {/* Causal Edges */}
                <line
                  x1="154"
                  y1="58"
                  x2="90"
                  y2="131"
                  stroke={
                    stage.activeEdges.includes("Z->X")
                      ? "hsl(var(--primary))"
                      : stage.interventionApplied
                        ? "#ef4444"
                        : "hsl(var(--border))"
                  }
                  strokeWidth={stage.activeEdges.includes("Z->X") ? 2.6 : 1.3}
                  strokeDasharray={stage.activeEdges.includes("Z->X") ? undefined : "4 3"}
                  markerEnd={
                    stage.activeEdges.includes("Z->X") ? "url(#causal-arrow-primary)" : undefined
                  }
                />

                {stage.interventionApplied && (
                  <g>
                    <rect
                      x="88"
                      y="82"
                      width="68"
                      height="18"
                      rx="4"
                      fill="#7f1d1d"
                      stroke="#ef4444"
                      strokeWidth="1.2"
                    />
                    <text
                      x="122"
                      y="94"
                      textAnchor="middle"
                      className="fill-rose-100 font-mono text-[8.5px] font-bold"
                    >
                      ✂ COUPÉ do(X=OFF)
                    </text>
                  </g>
                )}

                <line
                  x1="206"
                  y1="58"
                  x2="270"
                  y2="131"
                  stroke={
                    stage.activeEdges.includes("Z->Y")
                      ? "hsl(var(--primary))"
                      : "hsl(var(--border))"
                  }
                  strokeWidth={stage.activeEdges.includes("Z->Y") ? 2.6 : 1.2}
                  strokeDasharray={stage.activeEdges.includes("Z->Y") ? undefined : "4 3"}
                  markerEnd={
                    stage.activeEdges.includes("Z->Y") ? "url(#causal-arrow-primary)" : undefined
                  }
                />

                {/* Spurious / Rejected Edge X -> Y */}
                <line
                  x1="128"
                  y1="158"
                  x2="229"
                  y2="158"
                  stroke={
                    stage.activeEdges.includes("X->Y-spurious")
                      ? "#f59e0b"
                      : "hsl(var(--muted-foreground) / 0.35)"
                  }
                  strokeWidth={stage.activeEdges.includes("X->Y-spurious") ? 2.5 : 1.2}
                  strokeDasharray="5 4"
                  markerEnd={
                    stage.activeEdges.includes("X->Y-spurious")
                      ? "url(#causal-arrow-amber)"
                      : undefined
                  }
                />
                <text
                  x="180"
                  y="147"
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono text-[8.5px]"
                >
                  {stage.activeEdges.includes("X->Y-spurious")
                    ? "Lien supposé X → Y ?"
                    : stage.interventionApplied
                      ? "× Aucun effet sur Y"
                      : "Pas d'arc causal"}
                </text>

                {/* Synchronized Dual Causal Signal Pulses */}
                <circle
                  ref={pulseZXRef}
                  cx="152"
                  cy="58"
                  r="5.5"
                  fill="hsl(var(--primary))"
                  opacity={0}
                />
                <circle
                  ref={pulseZYRef}
                  cx="208"
                  cy="58"
                  r="5.5"
                  fill="hsl(var(--primary))"
                  opacity={0}
                />
                <circle ref={pulseXYRef} cx="130" cy="158" r="5.5" fill="#f59e0b" opacity={0} />

                {/* X Node */}
                <g>
                  <rect
                    x="14"
                    y="134"
                    width="114"
                    height="50"
                    rx="8"
                    fill={stage.interventionApplied ? "#ef444420" : "hsl(var(--card))"}
                    stroke={
                      stage.interventionApplied
                        ? "#ef4444"
                        : stage.activeEdges.includes("Z->X")
                          ? "hsl(var(--primary))"
                          : "hsl(var(--border))"
                    }
                    strokeWidth={2}
                  />
                  <text
                    x="71"
                    y="154"
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-semibold"
                  >
                    X : Agent EDR
                  </text>
                  <text
                    x="71"
                    y="170"
                    textAnchor="middle"
                    className="fill-muted-foreground font-mono text-[9px]"
                  >
                    {stage.interventionApplied
                      ? "do(X = OFF) forcé"
                      : `${stage.edrRestartsPerHour} redémarrage/h`}
                  </text>
                </g>

                {/* Y Node */}
                <g>
                  <rect
                    x="232"
                    y="134"
                    width="114"
                    height="50"
                    rx="8"
                    fill="hsl(var(--card))"
                    stroke={stage.activeEdges.includes("Z->Y") ? "hsl(var(--primary))" : "#f59e0b"}
                    strokeWidth={2.2}
                  />
                  <text
                    x="289"
                    y="154"
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-semibold"
                  >
                    Y : Échecs SSH
                  </text>
                  <text
                    x="289"
                    y="170"
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[10px] font-bold"
                  >
                    {stage.sshAlertsPerHour} alertes/h
                  </text>
                </g>
              </svg>
            </div>

            {/* Metrics & Contiguous Visual Bars */}
            <MotionStepPanel stepKey={stage.id}>
              <div className="space-y-3 rounded-lg border bg-card p-3.5 text-sm">
                <div className="font-semibold text-foreground" data-testid="causal-stage-title">
                  {stage.label}
                </div>
                <p
                  className="text-xs leading-relaxed text-muted-foreground"
                  aria-live="polite"
                  data-testid="causal-stage-explanation"
                >
                  {stage.explanation}
                </p>

                {/* Visual gauge comparing observed vs interventional SSH rate */}
                <div className="space-y-1.5 rounded-md border bg-muted/30 p-2.5 text-[11px]">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-muted-foreground">Volume Y observé à cette étape</span>
                    <strong className="text-foreground">{stage.sshAlertsPerHour} / h</strong>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all motion-reduce:transition-none",
                        stage.interventionApplied ? "bg-emerald-500" : "bg-primary",
                      )}
                      style={{ width: `${alertsBarWidthPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Sans scan Z=0 : 3/h</span>
                    <span>
                      {stage.interventionApplied
                        ? "Toujours ~408/h malgré do(X=OFF)"
                        : "Pic du lundi matin"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5 font-mono text-xs">
                  <div className="rounded border bg-muted/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Corrélation r(X,Y)</div>
                    <div className="font-semibold text-foreground">
                      {stage.apparentCorrelationR.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded border bg-muted/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Effet causal réel</div>
                    <div className="font-semibold text-primary">
                      {stage.controlledCausalEffectPct} %
                    </div>
                  </div>
                </div>
              </div>
            </MotionStepPanel>
          </div>

          <Alert>
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertTitle className="text-xs font-semibold">
              Limites de l&apos;analogie pédagogique (TC00.020)
            </AlertTitle>
            <AlertDescription className="text-xs">
              Ce graphe à 3 nœuds illustre une fourche causale pure ; dans un SI réel, plusieurs
              variables confondantes coexistent et une taille d&apos;échantillon suffisante reste
              nécessaire avant toute généralisation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
