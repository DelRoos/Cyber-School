"use client";

import * as React from "react";
import gsap from "gsap";
import { AlertTriangle, ArrowLeft, ArrowRight, Layers, RotateCcw } from "lucide-react";
import {
  ConceptTransformBanner,
  getStepDuration,
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
  CardHeader,
  CardTitle,
  cn,
} from "@cyber-school/ui";
import { getCallStackSteps, type CallStackScenarioId } from "../engines/call-stack";

const SCENARIO_LABELS: Record<CallStackScenarioId, string> = {
  "nested-calls": "Appels & résidus",
  "dangling-pointer": "Pointeur pendant",
  "stack-overflow": "Stack Overflow",
};

/**
 * VIS-03 Explorable Canvas:
 * - Confusion détruite : croire que RET efface les variables locales ou que la pile croît vers le haut.
 * - Objets animés : tour verticale de frames (0x7FF0 -> Guard Page), curseur RSP animé en O(1),
 *   trames libérées en pointillés conservant leurs octets résiduels, et curseur direct de profondeur.
 */
export function Vis03CallStack() {
  const [scenario, setScenario] = React.useState<CallStackScenarioId>("nested-calls");
  const [stepIdx, setStepIdx] = React.useState(0);
  const [showAbiDetails, setShowAbiDetails] = React.useState(true);
  const [recursionTarget, setRecursionTarget] = React.useState(5);

  const reducedMotion = usePrefersReducedMotion();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const rspMarkerRef = React.useRef<SVGGElement | null>(null);

  const steps = React.useMemo(
    () => getCallStackSteps(scenario, recursionTarget),
    [scenario, recursionTarget],
  );
  const current = steps[Math.min(stepIdx, steps.length - 1)] ?? steps[0]!;
  const activeDepthSlots = current.slots.filter((s) => s.status === "active").length;

  // Locate visual Y position of RSP inside vertical stack SVG
  const rspSlotIndex = current.slots.findIndex((s) => s.addr === current.rsp);
  const targetRspY = 34 + Math.max(0, rspSlotIndex) * 34;

  useGsapScope(scopeRef, () => {
    const marker = rspMarkerRef.current;
    if (!marker) return;
    const duration = getStepDuration(0.35, reducedMotion);
    if (duration === 0) {
      gsap.set(marker, { y: targetRspY });
      return;
    }
    gsap.to(marker, { y: targetRspY, duration, ease: "power2.out" });
  }, [targetRspY, reducedMotion, scenario]);

  function handleSelectScenario(next: CallStackScenarioId) {
    setScenario(next);
    setStepIdx(0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setStepIdx((p) => Math.min(steps.length - 1, p + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setStepIdx((p) => Math.max(0, p - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setStepIdx(0);
    }
  }

  const visibleSlots = current.slots.slice(0, 7);

  return (
    <div ref={scopeRef}>
      <Card
        data-testid="vis-03-call-stack"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Simulateur VIS-03 Pile d'appels, RSP RBP et pointeurs pendants"
        className="overflow-hidden border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CardHeader className="space-y-3 border-b border-border/60 bg-secondary/15 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base sm:text-lg">
                Explorer : <code className="font-mono">RSP</code> glisse en O(1) sans effacer
              </CardTitle>
            </div>
            <Badge
              variant={current.hazard === "none" ? "secondary" : "destructive"}
              data-testid="vis03-hazard-badge"
            >
              {current.hazard === "none"
                ? `Fonction : ${current.activeFunction}`
                : current.hazard === "dangling-read"
                  ? "Résidu non effacé !"
                  : current.hazard === "dangling-overwritten"
                    ? "Pointeur écrasé !"
                    : "SIGSEGV Stack Overflow"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Scénarios de pile">
              {(Object.keys(SCENARIO_LABELS) as CallStackScenarioId[]).map((id) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant={scenario === id ? "default" : "outline"}
                  onClick={() => handleSelectScenario(id)}
                  role="tab"
                  aria-selected={scenario === id}
                  data-testid={`vis03-tab-${id}`}
                >
                  {SCENARIO_LABELS[id]}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {scenario === "stack-overflow" ? (
                <label className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
                  <span>Profondeur : {recursionTarget}</span>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={recursionTarget}
                    onChange={(e) => {
                      const nextDepth = Number(e.target.value);
                      setRecursionTarget(nextDepth);
                      setStepIdx(
                        Math.min(
                          nextDepth,
                          getCallStackSteps("stack-overflow", nextDepth).length - 1,
                        ),
                      );
                    }}
                    aria-label="Profondeur de récursion"
                    className="w-20 accent-primary"
                  />
                </label>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowAbiDetails((p) => !p)}
                aria-pressed={showAbiDetails}
              >
                {showAbiDetails ? "Masquer ABI" : "Voir ABI"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <ConceptTransformBanner
            stepKey={`${scenario}-${stepIdx}-${recursionTarget}`}
            cause={`${current.activeFunction} · RSP=${current.rsp}`}
            mechanism={current.explanation}
            effectDelta={`Actives : ${activeDepthSlots} · RBP=${current.rbp}`}
            tone={
              current.hazard === "none"
                ? "causal"
                : current.hazard === "dangling-read"
                  ? "warning"
                  : "danger"
            }
            testId="vis03-transform-banner"
          />

          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.35fr]">
            {/* Left: Synchronized Code Execution + Live Pointers */}
            <div className="min-w-0 space-y-3">
              <div className="rounded-xl border border-border bg-secondary/25 p-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Exécution pas à pas
                </div>
                <ol className="space-y-1 font-mono text-xs">
                  {current.codeLines.map((line, i) => {
                    const active = i + 1 === current.activeLine;
                    return (
                      <li
                        key={line}
                        className={cn(
                          "rounded px-2 py-1",
                          active
                            ? "border-l-2 border-primary bg-primary/15 text-foreground font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        {line}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="rounded-lg border border-primary/50 bg-primary/10 p-2">
                  <div className="text-[10px] text-muted-foreground">RSP (Sommet)</div>
                  <div className="font-bold text-primary" data-testid="vis03-rsp">
                    {current.rsp}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-2">
                  <div className="text-[10px] text-muted-foreground">RBP (Base)</div>
                  <div className="font-semibold">{current.rbp}</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-2">
                  <div className="text-[10px] text-muted-foreground">RIP</div>
                  <div className="font-semibold">{current.rip}</div>
                </div>
              </div>

              {showAbiDetails ? (
                <div className="rounded-lg border border-border/80 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
                  <strong className="text-foreground">ABI x86-64 :</strong> {current.abiNotes}
                </div>
              ) : null}

              {current.pointerArrow ? (
                <Alert
                  variant={
                    current.pointerArrow.status === "corrupted-overwritten"
                      ? "destructive"
                      : "warning"
                  }
                  data-testid="vis03-pointer-banner"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>
                    {current.pointerArrow.fromVar} → {current.pointerArrow.toAddr}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    Lit encore : <strong>{current.pointerArrow.targetValue}</strong>
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>

            {/* Right: Animated Vertical Stack Tower SVG (High -> Low downward) */}
            <div className="rounded-xl border border-border bg-background/80 p-3">
              <svg
                viewBox="0 0 430 286"
                className="h-auto w-full"
                role="img"
                aria-label={`Tour de pile jusqu'à RSP ${current.rsp}, ${activeDepthSlots} cases actives`}
              >
                <text x="12" y="16" className="fill-muted-foreground font-mono text-[9.5px]">
                  Adresses hautes (0x7FF0) ↓ Croît vers les adresses basses
                </text>

                {/* Stack Slots Top -> Bottom */}
                {visibleSlots.map((slot, idx) => {
                  const y = 26 + idx * 34;
                  const isGuard = slot.status === "guard-page";
                  const isFreed = slot.status === "freed-residual";
                  const isOverwritten = slot.status === "overwritten";
                  return (
                    <g key={`${slot.addr}-${idx}`}>
                      <rect
                        x="94"
                        y={y}
                        width="324"
                        height="29"
                        rx="6"
                        fill={
                          isGuard
                            ? "#ef444433"
                            : isOverwritten
                              ? "#ef444424"
                              : isFreed
                                ? "transparent"
                                : "hsl(var(--card))"
                        }
                        stroke={
                          isGuard || isOverwritten
                            ? "#ef4444"
                            : isFreed
                              ? "#64748b"
                              : "hsl(var(--primary))"
                        }
                        strokeDasharray={isFreed ? "4 3" : undefined}
                        strokeWidth={slot.addr === current.rsp ? 2 : 1.2}
                      />
                      <text
                        x="104"
                        y={y + 18}
                        className="fill-primary font-mono text-[9.5px] font-semibold"
                      >
                        {slot.addr}
                      </text>
                      <text
                        x="160"
                        y={y + 18}
                        className={cn(
                          "font-mono text-[9.5px]",
                          isFreed
                            ? "fill-muted-foreground opacity-75"
                            : "fill-foreground font-medium",
                        )}
                      >
                        [{slot.frameOwner}] {slot.label}
                      </text>
                      <text
                        x="408"
                        y={y + 18}
                        textAnchor="end"
                        className={cn(
                          "font-mono text-[9.5px] font-bold",
                          isGuard || isOverwritten
                            ? "fill-rose-400"
                            : isFreed
                              ? "fill-amber-400"
                              : "fill-emerald-400",
                        )}
                      >
                        {slot.value}
                      </text>
                    </g>
                  );
                })}

                {/* Guard Page Floor Indicator if not already shown */}
                {!visibleSlots.some((s) => s.status === "guard-page") ? (
                  <g>
                    <rect
                      x="94"
                      y="264"
                      width="324"
                      height="18"
                      rx="4"
                      fill="#ef444422"
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="256"
                      y="276"
                      textAnchor="middle"
                      className="fill-rose-400 font-mono text-[8.5px] font-bold"
                    >
                      ⛔ GUARD PAGE NON MAPPÉE (SIGSEGV si dépassée)
                    </text>
                  </g>
                ) : null}

                {/* Animated O(1) RSP Sliding Pointer Arrow */}
                <g ref={rspMarkerRef}>
                  <rect x="8" y="-4" width="72" height="22" rx="6" fill="hsl(var(--primary))" />
                  <text
                    x="44"
                    y="10"
                    textAnchor="middle"
                    className="fill-slate-950 font-mono text-[10px] font-bold"
                  >
                    RSP ▶
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Interactive Stepper */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={stepIdx === 0}
                onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Précédent
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={stepIdx >= steps.length - 1}
                onClick={() => setStepIdx((p) => Math.min(steps.length - 1, p + 1))}
                data-testid="vis03-next-step"
              >
                Pas suivant
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setStepIdx(0)}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Étape {stepIdx + 1} / {steps.length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
