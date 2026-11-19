"use client";

import * as React from "react";
import gsap from "gsap";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  FileText,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import {
  ConceptTransformBanner,
  animateSvgSignalRoutes,
  getStepDuration,
  useGsapScope,
  usePrefersReducedMotion,
  type ConceptTransformTone,
} from "@cyber-school/animations";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@cyber-school/ui";
import {
  CONTEXT_MODE_ORDER,
  DEFAULT_OBSERVATION_INPUT,
  UPSTREAM_CAUSES,
  evaluateObservationWorkbench,
  type ObservationContextMode,
  type ObservationWorkbenchInput,
  type SelectedHypothesisId,
  type SimulatedUpstreamCause,
} from "./observation-model";

const CONTEXT_MODE_LABELS: Record<
  ObservationContextMode,
  { short: string; badge: string; description: string }
> = {
  "sshd-only": {
    short: "1 source · Log sshd seul",
    badge: "1 source",
    description: "Log srv-paie-01 seul (3 pistes ouvertes)",
  },
  "with-inventory": {
    short: "2 sources · + Inventaire CMDB",
    badge: "2 sources",
    description: "10.24.8.19 = serveur backup (H1 écartée)",
  },
  "with-inventory-and-backup-log": {
    short: "3 sources (Cas 3A) · + Log backup",
    badge: "3 sources · Cas 3A",
    description: "Script sync-paie-backup actif (H2 corroborée)",
  },
  "with-inventory-and-interactive-shell": {
    short: "3 sources (Cas 3B) · + Log shell",
    badge: "3 sources · Cas 3B",
    description: "Shell interactif actif (H3 corroborée)",
  },
};

export interface ObservationWorkbenchProps {
  onStateChange?: (state: ReturnType<typeof evaluateObservationWorkbench>) => void;
}

export function ObservationWorkbench({ onStateChange }: ObservationWorkbenchProps) {
  const [input, setInput] = React.useState<ObservationWorkbenchInput>(DEFAULT_OBSERVATION_INPUT);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const signalCircleRef = React.useRef<SVGCircleElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const state = React.useMemo(() => evaluateObservationWorkbench(input), [input]);

  React.useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  const modeIndex = CONTEXT_MODE_ORDER.indexOf(input.contextMode);
  const activePlaying = isPlaying && !reducedMotion;

  React.useEffect(() => {
    if (!activePlaying) {
      return;
    }
    const timer = window.setInterval(() => {
      setInput((prev) => {
        const currentIdx = CONTEXT_MODE_ORDER.indexOf(prev.contextMode);
        const nextIdx = (currentIdx + 1) % CONTEXT_MODE_ORDER.length;
        const nextMode = CONTEXT_MODE_ORDER[nextIdx] ?? "sshd-only";
        if (nextIdx === CONTEXT_MODE_ORDER.length - 1) {
          setIsPlaying(false);
        }
        return { ...prev, contextMode: nextMode };
      });
    }, 2400);
    return () => window.clearInterval(timer);
  }, [activePlaying]);

  useGsapScope(scopeRef, () => {
    animateSvgSignalRoutes(
      [
        {
          element: signalCircleRef.current,
          from: { x: 225, y: 98 },
          to: { x: 515, y: 98 },
          active: true,
        },
      ],
      { durationSeconds: 0.5, reducedMotion },
    );

    const duration = getStepDuration(0.32, reducedMotion);
    if (duration > 0) {
      gsap.fromTo(
        "[data-wb-funnel-card]",
        { y: 6, opacity: 0.72 },
        { y: 0, opacity: 1, duration, stagger: 0.04, ease: "power2.out" },
      );
    }
  }, [input.simulatedCause, input.contextMode, reducedMotion]);

  function setSimulatedCause(simulatedCause: SimulatedUpstreamCause) {
    setIsPlaying(false);
    setInput((prev) => ({ ...prev, simulatedCause }));
  }

  function setContextMode(contextMode: ObservationContextMode) {
    setIsPlaying(false);
    setInput((prev) => ({ ...prev, contextMode }));
  }

  function stepMode(delta: -1 | 1) {
    setIsPlaying(false);
    const nextIndex = Math.max(0, Math.min(CONTEXT_MODE_ORDER.length - 1, modeIndex + delta));
    const nextMode = CONTEXT_MODE_ORDER[nextIndex];
    if (nextMode) {
      setInput((prev) => ({ ...prev, contextMode: nextMode }));
    }
  }

  function handleReset() {
    setIsPlaying(false);
    setInput(DEFAULT_OBSERVATION_INPUT);
  }

  function handleToolbarKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepMode(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepMode(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      handleReset();
    }
  }

  const bannerTone: ConceptTransformTone =
    state.unsupportedClaimCount > 0
      ? "danger"
      : state.verdict === "corroborated-with-limits"
        ? "success"
        : state.activeSourcesCount > 1
          ? "causal"
          : "neutral";

  const h1Eliminated = !state.compatibleHypothesisIds.includes("h1-human-typo");
  const h2Eliminated = !state.compatibleHypothesisIds.includes("h2-scheduled-script-old-password");
  const h3Eliminated = !state.compatibleHypothesisIds.includes("h3-unauthorized-lateral");

  return (
    <div
      ref={scopeRef}
      className="space-y-4 rounded-xl border border-border bg-card/95 p-3.5 sm:p-5 shadow-sm"
      data-testid="observation-workbench"
    >
      {/* Top Status & Controls Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3"
        onKeyDown={handleToolbarKeyDown}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Simulateur 2D</Badge>
          <span className="font-mono text-xs text-muted-foreground">
            Étape {modeIndex + 1}/{CONTEXT_MODE_ORDER.length}
          </span>
        </div>

        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Contrôles de progression du recoupement"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => stepMode(-1)}
            disabled={modeIndex === 0}
            aria-label="Source précédente du simulateur"
            data-testid="workbench-prev-step"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => stepMode(1)}
            disabled={modeIndex === CONTEXT_MODE_ORDER.length - 1}
            aria-label="Source suivante du simulateur"
            data-testid="workbench-next-step"
          >
            Suivant
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          {!reducedMotion ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-pressed={isPlaying}
              aria-label={
                isPlaying ? "Mettre en pause la séquence" : "Lancer la séquence pas à pas"
              }
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  Lecture
                </>
              )}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            aria-label="Réinitialiser l'atelier"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* CTML Contiguous Banner */}
      <ConceptTransformBanner
        stepKey={`${input.simulatedCause}-${input.contextMode}-${input.selectedHypothesisId}-${input.claimedAsEstablishedFact}`}
        cause={state.transformSummary.beforeLabel}
        mechanism={state.transformSummary.afterLabel}
        effectDelta={`Affirmations non soutenues : ${state.unsupportedClaimCount}`}
        tone={bannerTone}
        testId="workbench-transform-banner"
      />

      {/* Metric Counters Strip */}
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        aria-label="Compteurs d'état du dossier"
      >
        <div className="rounded-lg border border-border bg-secondary/30 p-2.5">
          <p className="text-[11px] text-muted-foreground">Log sshd</p>
          <p
            className="font-mono text-base font-bold text-foreground sm:text-lg"
            data-testid="metric-fields"
          >
            {state.initialLog.recordedFieldCount} champs
          </p>
          <p className="font-mono text-[10px] text-emerald-400">0 écart hors timestamp</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-2.5">
          <p className="text-[11px] text-muted-foreground">Sources actives</p>
          <p
            className="font-mono text-base font-bold text-primary sm:text-lg"
            data-testid="metric-sources"
          >
            {state.activeSourcesCount} / 3
          </p>
          <p className="text-[10px] text-muted-foreground">
            {CONTEXT_MODE_LABELS[input.contextMode].badge}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-2.5">
          <p className="text-[11px] text-muted-foreground">Pistes compatibles</p>
          <p
            className="font-mono text-base font-bold text-amber-400 sm:text-lg"
            data-testid="metric-compatible"
          >
            {state.compatibleHypothesesCount} piste{state.compatibleHypothesesCount > 1 ? "s" : ""}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {state.corroboratedHypothesisId ? "1 corroborée" : "À départager"}
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg border p-2.5",
            state.unsupportedClaimCount > 0
              ? "border-rose-500/60 bg-rose-500/10"
              : "border-emerald-500/50 bg-emerald-500/10",
          )}
        >
          <p className="text-[11px] text-muted-foreground">Sur-interprétation</p>
          <p
            className={cn(
              "font-mono text-base font-bold sm:text-lg",
              state.unsupportedClaimCount > 0 ? "text-rose-400" : "text-emerald-400",
            )}
            data-testid="metric-unsupported"
          >
            {state.unsupportedClaimCount}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {state.unsupportedClaimCount > 0 ? "Conclusion hâtive" : "Calibré"}
          </p>
        </div>
      </div>

      {/* Step 1: Upstream Cause Selector & Sensor Blindness SVG Proof */}
      <div className="space-y-2.5 rounded-xl border border-border bg-secondary/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">
            1. Cause amont sur 10.24.8.19 → Cécité du capteur sshd
          </h4>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Choisir la cause amont simulée sur 10.24.8.19"
          >
            {UPSTREAM_CAUSES.map((cause) => {
              const active = input.simulatedCause === cause.id;
              return (
                <button
                  key={cause.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSimulatedCause(cause.id)}
                  data-testid={`cause-btn-${cause.id}`}
                  className={cn(
                    "min-h-9 rounded-lg border px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "border-primary bg-primary/20 font-semibold text-foreground"
                      : "border-border bg-background/70 text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {cause.shortTitle}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2D Causal SVG Diagram */}
        <div className="overflow-hidden rounded-lg border border-border bg-background/95 p-2">
          <svg
            viewBox="0 0 760 175"
            className="h-auto w-full"
            role="img"
            aria-label={`Schéma causal : ${state.upstreamCause.shortTitle} sur 10.24.8.19 envoie une requête SSH vers srv-paie-01 qui consigne toujours les 5 mêmes champs.`}
          >
            {/* Left Box: Host 10.24.8.19 */}
            <rect
              x="12"
              y="16"
              width="212"
              height="142"
              rx="10"
              fill="rgba(30, 41, 59, 0.9)"
              stroke="rgba(56, 189, 248, 0.5)"
              strokeWidth="1.5"
            />
            <text x="26" y="40" fill="#38bdf8" fontSize="10.5" fontFamily="monospace">
              HOST ÉMETTEUR · 10.24.8.19
            </text>
            <text x="26" y="64" fill="#f8fafc" fontSize="13" fontWeight="bold">
              {state.upstreamCause.shortTitle}
            </text>
            <rect x="26" y="78" width="184" height="66" rx="6" fill="rgba(245, 158, 11, 0.12)" />
            <text x="36" y="96" fill="#fbbf24" fontSize="10.5" fontWeight="bold">
              Invisible sur le réseau :
            </text>
            <text x="36" y="114" fill="#fde68a" fontSize="10" fontFamily="monospace">
              ✕ Visage / identité physique
            </text>
            <text x="36" y="132" fill="#fde68a" fontSize="10" fontFamily="monospace">
              ✕ Intention (oubli vs attaque)
            </text>

            {/* Middle Arrow: Network Request */}
            <line
              x1="224"
              y1="98"
              x2="516"
              y2="98"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
            <polygon points="516,98 504,92 504,104" fill="#38bdf8" />
            <circle ref={signalCircleRef} cx="370" cy="98" r="7" fill="#38bdf8" />

            <rect
              x="252"
              y="32"
              width="236"
              height="48"
              rx="6"
              fill="rgba(15, 23, 42, 0.95)"
              stroke="rgba(56, 189, 248, 0.45)"
              strokeWidth="1"
            />
            <text x="264" y="51" fill="#38bdf8" fontSize="10.5" fontWeight="bold">
              Paquet SSH transmis sur le réseau
            </text>
            <text x="264" y="68" fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
              user=c.moreau | src=10.24.8.19
            </text>
            <text x="266" y="126" fill="#94a3b8" fontSize="10.5">
              Seuls ces paramètres arrivent au capteur ↓
            </text>

            {/* Right Box: Target Sensor srv-paie-01 */}
            <rect
              x="520"
              y="16"
              width="228"
              height="142"
              rx="10"
              fill="rgba(15, 23, 42, 0.95)"
              stroke="rgba(16, 185, 129, 0.6)"
              strokeWidth="1.5"
            />
            <text x="534" y="40" fill="#34d399" fontSize="10.5" fontFamily="monospace">
              CAPTEUR CIBLE · srv-paie-01
            </text>
            <text x="534" y="62" fill="#f8fafc" fontSize="12.5" fontWeight="bold">
              Log sshd : 5 champs identiques
            </text>
            <text x="534" y="84" fill="#a7f3d0" fontSize="10.5" fontFamily="monospace">
              08:14:02..09 UTC (3 lignes)
            </text>
            <text x="534" y="102" fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
              service=sshd | event=AUTH_FAILURE
            </text>
            <text x="534" y="120" fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
              account=c.moreau
            </text>
            <text x="534" y="138" fill="#34d399" fontSize="10.5" fontFamily="monospace">
              source_ip=10.24.8.19 (0 différence)
            </text>
          </svg>
        </div>
      </div>

      {/* Step 2: Interactive Visual Funnel SVG + Source Buttons */}
      <div className="space-y-3 rounded-xl border border-border bg-secondary/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">
            2. Entonnoir de recoupement multi-sources (3 → 2 → 1 piste)
          </h4>
          <span className="font-mono text-[11px] text-muted-foreground">
            Cliquez sur une source pour filtrer les hypothèses
          </span>
        </div>

        <div
          className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4"
          role="group"
          aria-label="Choisir les sources de recoupement actives"
        >
          {CONTEXT_MODE_ORDER.map((mode) => {
            const active = input.contextMode === mode;
            const info = CONTEXT_MODE_LABELS[mode];
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={active}
                onClick={() => setContextMode(mode)}
                data-testid={`mode-btn-${mode}`}
                className={cn(
                  "flex min-h-11 flex-col items-start justify-between rounded-lg border px-2.5 py-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "border-primary bg-primary/15 text-foreground font-semibold"
                    : "border-border bg-background/70 text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <span>{info.short}</span>
                <span className="mt-0.5 text-[10px] font-normal text-muted-foreground">
                  {info.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Visual Funnel Diagram SVG */}
        <div className="overflow-hidden rounded-lg border border-border bg-background/95 p-2">
          <svg
            viewBox="0 0 760 175"
            className="h-auto w-full"
            role="img"
            aria-label="Schéma d'entonnoir reliant les sources actives aux 3 hypothèses H1, H2 et H3"
          >
            {/* Left column: Sources */}
            <g>
              <rect
                x="14"
                y="14"
                width="245"
                height="42"
                rx="7"
                fill="rgba(56, 189, 248, 0.14)"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <text x="26" y="32" fill="#38bdf8" fontSize="10.5" fontWeight="bold">
                SOURCE 1 · Log sshd (srv-paie-01)
              </text>
              <text x="26" y="47" fill="#e2e8f0" fontSize="9.5" fontFamily="monospace">
                3 AUTH_FAILURE depuis 10.24.8.19
              </text>

              <rect
                x="14"
                y="66"
                width="245"
                height="42"
                rx="7"
                fill={
                  input.contextMode !== "sshd-only"
                    ? "rgba(56, 189, 248, 0.14)"
                    : "rgba(30, 41, 59, 0.5)"
                }
                stroke={input.contextMode !== "sshd-only" ? "#38bdf8" : "#475569"}
                strokeWidth="1.5"
              />
              <text
                x="26"
                y="84"
                fill={input.contextMode !== "sshd-only" ? "#38bdf8" : "#94a3b8"}
                fontSize="10.5"
                fontWeight="bold"
              >
                SOURCE 2 · Inventaire CMDB
              </text>
              <text x="26" y="99" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
                {input.contextMode !== "sshd-only"
                  ? "10.24.8.19 = serveur backup (pas Claire)"
                  : "Non ouverte (cliquez sur 2 sources)"}
              </text>

              <rect
                x="14"
                y="118"
                width="245"
                height="42"
                rx="7"
                fill={
                  state.activeSourcesCount === 3
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(30, 41, 59, 0.5)"
                }
                stroke={state.activeSourcesCount === 3 ? "#34d399" : "#475569"}
                strokeWidth="1.5"
              />
              <text
                x="26"
                y="136"
                fill={state.activeSourcesCount === 3 ? "#34d399" : "#94a3b8"}
                fontSize="10.5"
                fontWeight="bold"
              >
                SOURCE 3 · Log local de 10.24.8.19
              </text>
              <text x="26" y="151" fill="#cbd5e1" fontSize="9.5" fontFamily="monospace">
                {input.contextMode === "with-inventory-and-backup-log"
                  ? "Cas 3A : sync-paie-backup à 08:14"
                  : input.contextMode === "with-inventory-and-interactive-shell"
                    ? "Cas 3B : shell interactif à 08:13:55"
                    : "Non ouverte (cliquez sur Cas 3A ou 3B)"}
              </text>
            </g>

            {/* Connecting Funnel Lines */}
            <line
              x1="260"
              y1="35"
              x2="455"
              y2="35"
              stroke={h1Eliminated ? "#f43f5e" : "#38bdf8"}
              strokeWidth="2"
              strokeDasharray={h1Eliminated ? "4 4" : undefined}
            />
            <line
              x1="260"
              y1="87"
              x2="455"
              y2="87"
              stroke={
                state.corroboratedHypothesisId === "h2-scheduled-script-old-password"
                  ? "#34d399"
                  : h2Eliminated
                    ? "#f43f5e"
                    : "#38bdf8"
              }
              strokeWidth="2"
              strokeDasharray={h2Eliminated ? "4 4" : undefined}
            />
            <line
              x1="260"
              y1="139"
              x2="455"
              y2="139"
              stroke={
                state.corroboratedHypothesisId === "h3-unauthorized-lateral"
                  ? "#34d399"
                  : h3Eliminated
                    ? "#f43f5e"
                    : "#38bdf8"
              }
              strokeWidth="2"
              strokeDasharray={h3Eliminated ? "4 4" : undefined}
            />

            {/* Right column: 3 Hypotheses */}
            <g>
              {/* H1 */}
              <rect
                x="458"
                y="14"
                width="288"
                height="42"
                rx="7"
                fill={h1Eliminated ? "rgba(244, 63, 94, 0.1)" : "rgba(30, 41, 59, 0.85)"}
                stroke={h1Eliminated ? "#f43f5e" : "#fbbf24"}
                strokeWidth="1.5"
              />
              <text
                x="470"
                y="32"
                fill={h1Eliminated ? "#fda4af" : "#f8fafc"}
                fontSize="10.5"
                fontWeight="bold"
              >
                {h1Eliminated
                  ? "✕ H1 · Faute de frappe (ÉCARTÉE)"
                  : "? H1 · Faute de frappe de Claire (Compatible)"}
              </text>
              <text x="470" y="47" fill="#94a3b8" fontSize="9.5">
                {h1Eliminated
                  ? "Contredite : 10.24.8.19 n'est pas son poste"
                  : "Possible tant que l'IP 10.24.8.19 n'est pas vérifiée"}
              </text>

              {/* H2 */}
              <rect
                x="458"
                y="66"
                width="288"
                height="42"
                rx="7"
                fill={
                  state.corroboratedHypothesisId === "h2-scheduled-script-old-password"
                    ? "rgba(16, 185, 129, 0.18)"
                    : h2Eliminated
                      ? "rgba(244, 63, 94, 0.1)"
                      : "rgba(30, 41, 59, 0.85)"
                }
                stroke={
                  state.corroboratedHypothesisId === "h2-scheduled-script-old-password"
                    ? "#34d399"
                    : h2Eliminated
                      ? "#f43f5e"
                      : "#fbbf24"
                }
                strokeWidth="1.5"
              />
              <text
                x="470"
                y="84"
                fill={
                  state.corroboratedHypothesisId === "h2-scheduled-script-old-password"
                    ? "#6ee7b7"
                    : h2Eliminated
                      ? "#fda4af"
                      : "#f8fafc"
                }
                fontSize="10.5"
                fontWeight="bold"
              >
                {state.corroboratedHypothesisId === "h2-scheduled-script-old-password"
                  ? "✓ H2 · Script de backup (CORROBORÉE)"
                  : h2Eliminated
                    ? "✕ H2 · Script de backup (ÉCARTÉE)"
                    : "? H2 · Script de backup (Compatible)"}
              </text>
              <text x="470" y="99" fill="#94a3b8" fontSize="9.5">
                {state.corroboratedHypothesisId === "h2-scheduled-script-old-password"
                  ? "Confirmée par sync-paie-backup.log à 08:14"
                  : h2Eliminated
                    ? "Contredite : aucun backup lancé à 08:14"
                    : "À vérifier dans les logs locaux de 10.24.8.19"}
              </text>

              {/* H3 */}
              <rect
                x="458"
                y="118"
                width="288"
                height="42"
                rx="7"
                fill={
                  state.corroboratedHypothesisId === "h3-unauthorized-lateral"
                    ? "rgba(16, 185, 129, 0.18)"
                    : h3Eliminated
                      ? "rgba(244, 63, 94, 0.1)"
                      : "rgba(30, 41, 59, 0.85)"
                }
                stroke={
                  state.corroboratedHypothesisId === "h3-unauthorized-lateral"
                    ? "#34d399"
                    : h3Eliminated
                      ? "#f43f5e"
                      : "#fbbf24"
                }
                strokeWidth="1.5"
              />
              <text
                x="470"
                y="136"
                fill={
                  state.corroboratedHypothesisId === "h3-unauthorized-lateral"
                    ? "#6ee7b7"
                    : h3Eliminated
                      ? "#fda4af"
                      : "#f8fafc"
                }
                fontSize="10.5"
                fontWeight="bold"
              >
                {state.corroboratedHypothesisId === "h3-unauthorized-lateral"
                  ? "✓ H3 · Shell interactif (CORROBORÉE)"
                  : h3Eliminated
                    ? "✕ H3 · Shell interactif (ÉCARTÉE)"
                    : "? H3 · Shell interactif (Compatible)"}
              </text>
              <text x="470" y="151" fill="#94a3b8" fontSize="9.5">
                {state.corroboratedHypothesisId === "h3-unauthorized-lateral"
                  ? "Confirmée par audit-sessions.log à 08:13:55"
                  : h3Eliminated
                    ? "Contredite : les essais viennent du script backup"
                    : "À vérifier dans le log des sessions locales"}
              </text>
            </g>
          </svg>
        </div>

        {/* Compact Active Sources Strip (only active sources shown to avoid clutter) */}
        <div className="grid gap-2 sm:grid-cols-3">
          {state.sources
            .filter((src) => src.active)
            .map((src) => (
              <div
                key={src.id}
                data-testid={`source-card-${src.id}`}
                className="rounded-lg border border-primary/45 bg-background/90 px-3 py-2 text-xs text-foreground"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                    {src.id === "source-1-sshd" ? (
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : src.id === "source-2-inventory" ? (
                      <Database className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {src.title}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {src.observedFact}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Step 3: Hypothesis Selector & Overclaim Calibration */}
      <div className="space-y-2.5 rounded-xl border border-border bg-secondary/20 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">
          3. Choisir une piste et tester le piège de certitude absolue
        </h4>

        <div
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
          role="group"
          aria-label="Sélectionner une hypothèse à évaluer"
        >
          <button
            type="button"
            aria-pressed={input.selectedHypothesisId === "none"}
            onClick={() =>
              setInput((prev) => ({
                ...prev,
                selectedHypothesisId: "none" as SelectedHypothesisId,
              }))
            }
            data-testid="select-hyp-none"
            className={cn(
              "flex min-h-11 flex-col justify-between rounded-lg border p-2.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              input.selectedHypothesisId === "none"
                ? "border-primary bg-primary/15 font-semibold text-foreground"
                : "border-border bg-background/70 text-muted-foreground hover:bg-secondary/60",
            )}
          >
            <span>Observation seule</span>
            <span className="mt-1 text-[10px] font-normal text-muted-foreground">
              Aucune cause affirmée
            </span>
          </button>

          {state.hypotheses.map((hyp) => {
            const isSelected = input.selectedHypothesisId === hyp.id;
            return (
              <button
                key={hyp.id}
                type="button"
                data-wb-funnel-card
                aria-pressed={isSelected}
                onClick={() => setInput((prev) => ({ ...prev, selectedHypothesisId: hyp.id }))}
                data-testid={`select-hyp-${hyp.id}`}
                className={cn(
                  "flex min-h-11 flex-col justify-between rounded-lg border p-2.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isSelected
                    ? "border-primary bg-primary/15 font-semibold text-foreground"
                    : "border-border bg-background/70 text-foreground hover:bg-secondary/60",
                )}
              >
                <span>{hyp.title.split("·")[0]?.trim() ?? hyp.title}</span>
                <span className="mt-1 text-[10px] font-normal text-muted-foreground">
                  {hyp.status === "corroborated"
                    ? "✓ Corroborée (3 sources)"
                    : hyp.status === "compatible"
                      ? "? Compatible (à recouper)"
                      : "✕ Contredite (écartée)"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Claimed as established fact toggle */}
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-background/80 px-3 py-2.5 text-xs sm:text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
          <input
            type="checkbox"
            name="claimedAsEstablishedFact"
            checked={input.claimedAsEstablishedFact}
            onChange={(event) =>
              setInput((prev) => ({ ...prev, claimedAsEstablishedFact: event.target.checked }))
            }
            data-testid="claim-as-fact-checkbox"
            className="h-4 w-4 shrink-0 rounded border-border accent-primary"
          />
          <span className="font-medium text-foreground">
            Affirmer comme fait prouvé sans réserve ni mention des limites
          </span>
        </label>

        {/* Verdict Output Card */}
        <Card
          data-testid="workbench-verdict-card"
          className={cn(
            "border",
            state.unsupportedClaimCount > 0
              ? "border-rose-500/60 bg-rose-500/10"
              : state.verdict === "corroborated-with-limits"
                ? "border-emerald-500/60 bg-emerald-500/10"
                : "border-primary/40 bg-primary/5",
          )}
        >
          <CardHeader className="py-2.5">
            <div className="flex items-center gap-2">
              {state.unsupportedClaimCount > 0 ? (
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              ) : state.verdict === "corroborated-with-limits" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              )}
              <CardTitle className="text-xs sm:text-sm" data-testid="workbench-verdict-title">
                {state.verdictTitle}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0 text-xs text-muted-foreground">
            <p data-testid="workbench-verdict-explanation">{state.verdictExplanation}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
