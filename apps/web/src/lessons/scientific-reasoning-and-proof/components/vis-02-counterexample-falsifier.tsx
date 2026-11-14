"use client";

import * as React from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  animateSvgSignalRoutes,
  ConceptTransformBanner,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
import {
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
  COUNTEREXAMPLE_CLAIM,
  COUNTEREXAMPLE_CONDITIONS,
  evaluateCounterexample,
} from "../engines/causal-reasoning";

export function Vis02CounterexampleFalsifier() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const reducedMotion = usePrefersReducedMotion();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const bypassTokenRef = React.useRef<SVGCircleElement | null>(null);
  const noiseTokenRef = React.useRef<SVGCircleElement | null>(null);

  const evaluation = React.useMemo(() => evaluateCounterexample(selectedIds), [selectedIds]);
  const hasC1 = selectedIds.includes("public-healthz");
  const hasNoise = evaluation.redundantIds.length > 0;

  useGsapScope(scopeRef, () => {
    animateSvgSignalRoutes(
      [
        {
          element: bypassTokenRef.current,
          from: { x: 46, y: 46 },
          to: { x: 314, y: 46 },
          active: hasC1,
        },
        {
          element: noiseTokenRef.current,
          from: { x: 46, y: 102 },
          to: { x: 224, y: 102 },
          active: hasNoise,
        },
      ],
      { durationSeconds: 0.5, reducedMotion },
    );
  }, [hasC1, hasNoise, reducedMotion]);

  function toggleCondition(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  return (
    <div ref={scopeRef}>
      <Card data-testid="vis-counterexample-falsifier">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">
                VIS-02 · Détecteur de contre-exemple minimal (TC00.008)
              </CardTitle>
            </div>
            <Badge
              data-testid="counterexample-status-badge"
              variant={
                evaluation.isMinimal ? "success" : evaluation.falsified ? "secondary" : "outline"
              }
            >
              {evaluation.verdictTitle}
            </Badge>
          </div>
          <CardDescription>{COUNTEREXAMPLE_CLAIM}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ConceptTransformBanner
            stepKey={`${selectedIds.join(",")}|${evaluation.isMinimal}`}
            cause={
              hasC1
                ? hasNoise
                  ? "C1 active + bruit annexe"
                  : "C1 seule (GET /healthz sans JWT)"
                : "Aucune route hors JWT activée"
            }
            mechanism={
              evaluation.isMinimal
                ? "Le flux contourne le contrôle JWT et obtient HTTP 200 sans prémisse superflue"
                : evaluation.falsified
                  ? "La réfutation passe par /healthz mais transporte des conditions non causales"
                  : "Toutes les requêtes actives passent par la porte JWT obligatoire"
            }
            effectDelta={
              evaluation.isMinimal
                ? "Réfutation minimale (1/1)"
                : evaluation.falsified
                  ? `Bruit : +${evaluation.redundantIds.length}`
                  : "Règle non réfutée"
            }
            tone={evaluation.isMinimal ? "success" : evaluation.falsified ? "warning" : "neutral"}
            testId="vis02-counterexample-banner"
          />

          {/* Interactive SVG Decision Pipeline */}
          <div className="rounded-lg border bg-muted/20 p-3">
            <svg
              viewBox="0 0 360 132"
              className="max-h-36 w-full"
              role="img"
              aria-label="Circuit visuel de réfutation par route /healthz sans jeton JWT"
            >
              <defs>
                <marker
                  id="logic-arrow-red"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                </marker>
                <marker
                  id="logic-arrow-amber"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* Main Causal Path: Request -> Route /healthz bypass -> HTTP 200 */}
              <rect
                x="8"
                y="24"
                width="76"
                height="42"
                rx="6"
                fill="hsl(var(--card))"
                stroke={hasC1 ? "#10b981" : "hsl(var(--border))"}
                strokeWidth="1.8"
              />
              <text
                x="46"
                y="42"
                textAnchor="middle"
                className="fill-foreground text-[9px] font-semibold"
              >
                Requête GET
              </text>
              <text
                x="46"
                y="55"
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[8.5px]"
              >
                JWT = absent
              </text>

              <line
                x1="84"
                y1="46"
                x2="132"
                y2="46"
                stroke={hasC1 ? "#10b981" : "hsl(var(--border))"}
                strokeWidth={hasC1 ? 2.2 : 1.2}
                markerEnd={hasC1 ? "url(#logic-arrow-red)" : undefined}
              />

              <rect
                x="134"
                y="24"
                width="102"
                height="42"
                rx="6"
                fill={hasC1 ? "hsl(142 71% 45% / 0.14)" : "hsl(var(--card))"}
                stroke={hasC1 ? "#10b981" : "hsl(var(--border))"}
                strokeWidth={hasC1 ? 2 : 1.2}
                strokeDasharray={hasC1 ? undefined : "4 3"}
              />
              <text
                x="185"
                y="41"
                textAnchor="middle"
                className="fill-foreground text-[9px] font-semibold"
              >
                {hasC1 ? "C1 : /healthz" : "Route /api/*"}
              </text>
              <text
                x="185"
                y="54"
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[8px]"
              >
                {hasC1 ? "Hors middleware JWT" : "JWT requis (401)"}
              </text>

              <line
                x1="236"
                y1="46"
                x2="276"
                y2="46"
                stroke={hasC1 ? "#10b981" : "hsl(var(--border))"}
                strokeWidth={hasC1 ? 2.2 : 1.2}
                markerEnd={hasC1 ? "url(#logic-arrow-red)" : undefined}
              />

              <rect
                x="278"
                y="24"
                width="74"
                height="42"
                rx="6"
                fill={hasC1 ? "hsl(142 71% 45% / 0.2)" : "hsl(var(--muted) / 0.4)"}
                stroke={hasC1 ? "#10b981" : "hsl(var(--border))"}
                strokeWidth="2"
              />
              <text
                x="315"
                y="41"
                textAnchor="middle"
                className="fill-foreground font-mono text-[9px] font-bold"
              >
                {hasC1 ? "HTTP 200 !" : "HTTP 401"}
              </text>
              <text x="315" y="54" textAnchor="middle" className="fill-muted-foreground text-[8px]">
                {hasC1 ? "Loi réfutée" : "Loi intacte"}
              </text>

              {/* Noise branch C2/C3 */}
              <rect
                x="116"
                y="82"
                width="176"
                height="36"
                rx="6"
                fill={hasNoise ? "#f59e0b1f" : "transparent"}
                stroke={hasNoise ? "#f59e0b" : "hsl(var(--border))"}
                strokeWidth={hasNoise ? 1.8 : 1}
                strokeDasharray="4 3"
              />
              <text
                x="204"
                y="98"
                textAnchor="middle"
                className="fill-foreground text-[8.5px] font-semibold"
              >
                {hasNoise
                  ? `Conditions superflues (${evaluation.redundantIds.join(", ")})`
                  : "Conditions annexes (navigateur / latence)"}
              </text>
              <text
                x="204"
                y="111"
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[8px]"
              >
                {hasNoise ? "N'affectent pas la réponse 200" : "Sans impact sur le middleware JWT"}
              </text>

              <circle ref={bypassTokenRef} cx="46" cy="46" r="5" fill="#10b981" opacity={0} />
              <circle ref={noiseTokenRef} cx="46" cy="102" r="4.5" fill="#f59e0b" opacity={0} />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Activez uniquement les conditions strictement nécessaires pour invalider l&apos;énoncé
              :
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2">
              {COUNTEREXAMPLE_CONDITIONS.map((cond) => {
                const active = selectedIds.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    aria-pressed={active}
                    data-testid={`counterexample-toggle-${cond.id}`}
                    onClick={() => toggleCondition(cond.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-xs transition-colors",
                      active
                        ? "border-primary bg-primary/10 font-medium text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary/60",
                    )}
                  >
                    <span className="min-w-0 flex-1">{cond.label}</span>
                    <span className="ml-3 shrink-0 font-mono text-[11px]">
                      {active ? "ACTIF" : "INACTIF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              "flex items-start gap-2.5 rounded-lg border p-3 text-xs",
              evaluation.isMinimal
                ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                : evaluation.falsified
                  ? "border-amber-500/40 bg-amber-500/10 text-foreground"
                  : "border-border bg-muted/40 text-muted-foreground",
            )}
            aria-live="polite"
            data-testid="counterexample-verdict-box"
          >
            {evaluation.isMinimal ? (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                aria-hidden="true"
              />
            )}
            <div className="space-y-1">
              <div className="font-semibold text-foreground">{evaluation.verdictTitle}</div>
              <p className="leading-relaxed">{evaluation.verdictDetail}</p>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="counterexample-clear-btn"
              onClick={() => setSelectedIds([])}
            >
              Effacer la sélection
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
