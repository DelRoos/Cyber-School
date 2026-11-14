"use client";

import * as React from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Info, Layers, RotateCcw } from "lucide-react";
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
import { getCallStackSteps, type CallStackScenarioId } from "../engines/call-stack";

const SCENARIO_LABELS: Record<CallStackScenarioId, string> = {
  "nested-calls": "Appels imbriqués & résidus",
  "dangling-pointer": "Pointeur pendant (Dangling)",
  "stack-overflow": "Stack Overflow (Récursion)",
};

export function Vis03CallStack() {
  const [scenario, setScenario] = React.useState<CallStackScenarioId>("nested-calls");
  const [stepIdx, setStepIdx] = React.useState(0);
  const [showAbiDetails, setShowAbiDetails] = React.useState(true);
  const [recursionTarget, setRecursionTarget] = React.useState(5);

  const steps = React.useMemo(
    () => getCallStackSteps(scenario, recursionTarget),
    [scenario, recursionTarget],
  );
  const current = steps[Math.min(stepIdx, steps.length - 1)] ?? steps[0]!;

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

  return (
    <Card
      data-testid="vis-03-call-stack"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Simulateur VIS-03 Pile d'appels, RSP RBP et pointeur pendant"
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">
              VIS-03 · Pile d&apos;appels (<code className="font-mono">RSP</code>/
              <code className="font-mono">RBP</code>), ABI &amp; pointeurs pendants
            </CardTitle>
          </div>
          <Badge
            variant={current.hazard === "none" ? "secondary" : "destructive"}
            data-testid="vis03-hazard-badge"
          >
            {current.hazard === "none"
              ? `Fonction : ${current.activeFunction}`
              : current.hazard === "dangling-read"
                ? "Pointeur pendant (donnée résiduelle !)"
                : current.hazard === "dangling-overwritten"
                  ? "Pointeur pendant écrasé !"
                  : "SIGSEGV Stack Overflow"}
          </Badge>
        </div>
        <CardDescription>
          La pile croît vers les <strong>adresses basses</strong>. Au retour (
          <code className="font-mono">RET</code>), seul <code className="font-mono">RSP</code>{" "}
          remonte en O(1) : les octets libérés restent visibles en grisé jusqu&apos;au prochain
          appel.
        </CardDescription>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Scénarios de pile">
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
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setRecursionTarget((d) => (d === 5 ? 3 : 5));
                  setStepIdx(0);
                }}
              >
                Limite récursion : {recursionTarget === 5 ? "Overflow (5)" : "Sûre (3)"}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowAbiDetails((p) => !p)}
              aria-pressed={showAbiDetails}
            >
              {showAbiDetails ? "Masquer détails ABI" : "Afficher détails ABI"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.25fr]">
          {/* Trace & Registers */}
          <div className="min-w-0 space-y-3">
            <div className="rounded-xl border border-border bg-secondary/25 p-3.5 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Trace d&apos;exécution guidée
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="rounded-lg border border-primary/50 bg-primary/10 p-2.5">
                <div className="text-[10px] text-muted-foreground">RSP (Sommet)</div>
                <div className="font-bold text-primary" data-testid="vis03-rsp">
                  {current.rsp}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-2.5">
                <div className="text-[10px] text-muted-foreground">RBP (Base trame)</div>
                <div className="font-semibold">{current.rbp}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-2.5">
                <div className="text-[10px] text-muted-foreground">RIP courant</div>
                <div className="font-semibold">{current.rip}</div>
              </div>
            </div>

            {showAbiDetails ? (
              <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
                <strong className="text-foreground">Convention System V AMD64 ABI :</strong>{" "}
                {current.abiNotes}
              </div>
            ) : null}
          </div>

          {/* Stack Memory Frames */}
          <div className="min-w-0 rounded-xl border border-border bg-secondary/25 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Pile d&apos;appels (adresses hautes → basses ↓)</span>
              <span className="font-mono">0x7FF0 ↓ 0x7F50</span>
            </div>

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
                  Pointeur {current.pointerArrow.fromVar} ({current.pointerArrow.fromAddr}) →{" "}
                  {current.pointerArrow.toAddr}
                </AlertTitle>
                <AlertDescription>
                  Valeur lue à cette adresse : <strong>{current.pointerArrow.targetValue}</strong>
                </AlertDescription>
              </Alert>
            ) : null}

            <ul className="space-y-1.5 font-mono text-xs">
              {current.slots.map((slot) => {
                const isRspHere = slot.addr === current.rsp;
                return (
                  <li
                    key={`${slot.addr}-${slot.frameOwner}-${slot.label}`}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2",
                      slot.status === "active" && "border-border bg-card text-foreground",
                      slot.status === "freed-residual" &&
                        "border-dashed border-muted-foreground/50 bg-secondary/10 text-muted-foreground opacity-80",
                      slot.status === "overwritten" &&
                        "border-rose-500 bg-rose-500/15 text-foreground font-semibold",
                      slot.status === "guard-page" &&
                        "border-rose-600 bg-rose-600/20 text-rose-200 font-bold",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{slot.addr}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {slot.frameOwner}
                      </Badge>
                      <span>{slot.label}</span>
                      {isRspHere ? (
                        <Badge variant="default" className="text-[10px]">
                          ← RSP
                        </Badge>
                      ) : null}
                    </div>
                    <span className="font-semibold">{slot.value}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Transport */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={stepIdx === 0}
              onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Pas précédent
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
              Réinitialiser
            </Button>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            Étape {stepIdx + 1} / {steps.length}
          </span>
        </div>

        <Alert
          variant={current.hazard === "none" ? "info" : "destructive"}
          aria-live="polite"
          aria-atomic="true"
        >
          <AlertTitle>État de la pile</AlertTitle>
          <AlertDescription>{current.explanation}</AlertDescription>
        </Alert>

        <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/20 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <strong>Ce que le simulateur simplifie :</strong> en compilation optimisée (
            <code className="font-mono">-O2</code>), le compilateur peut placer certaines locales
            uniquement en registres, omettre <code className="font-mono">RBP</code> (
            <code className="font-mono">-fomit-frame-pointer</code>) et utiliser la Red Zone de 128
            octets sous <code className="font-mono">RSP</code> dans les fonctions feuilles Linux
            x86-64.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
