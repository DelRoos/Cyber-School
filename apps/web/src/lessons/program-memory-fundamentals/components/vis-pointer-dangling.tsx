"use client";

import * as React from "react";
import { AlertTriangle, Layers, ShieldCheck } from "lucide-react";
import {
  animateSvgSignalRoutes,
  ConceptTransformBanner,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@cyber-school/ui";

interface DanglingStage {
  id: string;
  label: string;
  code: string;
  slotOwner: string;
  slotValue: string;
  rspLineY: number;
  pointerStatus: "valid" | "ghost" | "corrupted" | "nullified";
  cause: string;
  mechanism: string;
  effectDelta: string;
}

const STAGES: DanglingStage[] = [
  {
    id: "alive",
    label: "1. int x = 42",
    code: "int x = 42; return &x;",
    slotOwner: "creer()",
    slotValue: "42",
    rspLineY: 146,
    pointerStatus: "valid",
    cause: "creer() est active sur la pile",
    mechanism: "x vit à l'adresse 0x7FF4 (sous RBP) ; le pointeur *p pointe vers une case vivante",
    effectDelta: "*p == 42 (valide)",
  },
  {
    id: "returned",
    label: "2. Après return (RSP ↑)",
    code: "int *p = creer(); // RSP remonte !",
    slotOwner: "fantôme (creer)",
    slotValue: "42 (résidu)",
    rspLineY: 82,
    pointerStatus: "ghost",
    cause: "creer() termine : RET remonte RSP",
    mechanism:
      "La case 0x7FF4 n'est plus protégée, mais 42 traîne encore : *p trompe le développeur",
    effectDelta: "*p == 42 (piège !)",
  },
  {
    id: "overwritten",
    label: "3. autreAppel(99)",
    code: "autreAppel(99); // réutilise 0x7FF4 !",
    slotOwner: "autreAppel()",
    slotValue: "99",
    rspLineY: 146,
    pointerStatus: "corrupted",
    cause: "Un nouvel appel réutilise 0x7FF4",
    mechanism:
      "y = 99 écrase la même case RAM ; p contient toujours 0x7FF4 et lit la donnée d'un autre !",
    effectDelta: "*p == 99 (corruption)",
  },
  {
    id: "safe-null",
    label: "4. Correctif sûr (p = NULL)",
    code: "free(h); h = NULL; // ou valeur par copie",
    slotOwner: "libre",
    slotValue: "—",
    rspLineY: 82,
    pointerStatus: "nullified",
    cause: "Renvoyer une valeur ou allouer + NULL",
    mechanism:
      "Après libération, p est mis à 0x0 (NULL) : impossible de réutiliser une adresse périmée",
    effectDelta: "p = 0x0 (sûr)",
  },
];

/**
 * Chapitre 4 Explorable Simulator: Pointeur vs durée de vie réelle d'un objet.
 */
export function VisPointerDangling() {
  const [stageIdx, setStageIdx] = React.useState(0);
  const stage = STAGES[stageIdx] ?? STAGES[0]!;

  const reducedMotion = usePrefersReducedMotion();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const pulseRef = React.useRef<SVGCircleElement | null>(null);

  useGsapScope(scopeRef, () => {
    animateSvgSignalRoutes(
      [
        {
          element: pulseRef.current,
          from: { x: 215, y: 66 },
          to: stage.pointerStatus === "nullified" ? { x: 215, y: 156 } : { x: 422, y: 118 },
          active: true,
        },
      ],
      { durationSeconds: 0.48, reducedMotion },
    );
  }, [stage.id, stage.pointerStatus, reducedMotion]);

  const tone =
    stage.pointerStatus === "valid" || stage.pointerStatus === "nullified"
      ? "success"
      : stage.pointerStatus === "ghost"
        ? "warning"
        : "danger";

  const arrowColor =
    stage.pointerStatus === "valid"
      ? "#10b981"
      : stage.pointerStatus === "ghost"
        ? "#f59e0b"
        : stage.pointerStatus === "corrupted"
          ? "#ef4444"
          : "#38bdf8";

  return (
    <div ref={scopeRef}>
      <Card data-testid="vis-pointer-dangling" className="overflow-hidden border-primary/25">
        <CardHeader className="space-y-3 border-b border-border/60 bg-secondary/15 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base sm:text-lg">
                Explorer : le pointeur garde l&apos;adresse même quand l&apos;objet meurt
              </CardTitle>
            </div>
            <Badge
              variant={
                stage.pointerStatus === "corrupted"
                  ? "destructive"
                  : stage.pointerStatus === "ghost"
                    ? "outline"
                    : "success"
              }
              data-testid="vis-pointer-status-badge"
            >
              {stage.pointerStatus === "corrupted" ? (
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Aliasing silencieux
                </span>
              ) : stage.pointerStatus === "nullified" ? (
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Référence invalidée
                </span>
              ) : (
                stage.effectDelta
              )}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STAGES.map((st, idx) => (
              <Button
                key={st.id}
                type="button"
                size="sm"
                variant={stageIdx === idx ? "default" : "outline"}
                onClick={() => setStageIdx(idx)}
                data-testid={`vis-pointer-stage-${st.id}`}
              >
                {st.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <ConceptTransformBanner
            stepKey={stage.id}
            cause={stage.cause}
            mechanism={stage.mechanism}
            effectDelta={stage.effectDelta}
            tone={tone}
            testId="vis-pointer-banner"
          />

          <div className="rounded-xl border border-border bg-background/80 p-3">
            <svg
              viewBox="0 0 720 190"
              className="h-auto w-full"
              role="img"
              aria-label={`Pointeur p vers 0x7FF4 : état ${stage.pointerStatus}, valeur ${stage.slotValue}`}
            >
              {/* Pointer Holder in main() */}
              <rect
                x="16"
                y="24"
                width="202"
                height="86"
                rx="10"
                fill="hsl(var(--card))"
                stroke="hsl(var(--primary))"
                strokeWidth="1.6"
              />
              <text x="28" y="46" className="fill-primary text-[10.5px] font-bold uppercase">
                Trame main() (toujours active)
              </text>
              <text x="28" y="68" className="fill-foreground font-mono text-[12px] font-bold">
                int *p = {stage.pointerStatus === "nullified" ? "0x0 (NULL)" : "0x7FF4"}
              </text>
              <text x="28" y="88" className="fill-muted-foreground font-mono text-[10px]">
                {stage.code}
              </text>

              {/* Null target box */}
              <rect
                x="16"
                y="132"
                width="202"
                height="42"
                rx="8"
                fill={stage.pointerStatus === "nullified" ? "#38bdf822" : "transparent"}
                stroke={stage.pointerStatus === "nullified" ? "#38bdf8" : "hsl(var(--border))"}
                strokeDasharray="4 3"
              />
              <text
                x="117"
                y="157"
                textAnchor="middle"
                className={cn(
                  "font-mono text-[10.5px] font-semibold",
                  stage.pointerStatus === "nullified" ? "fill-sky-400" : "fill-muted-foreground",
                )}
              >
                0x0 (NULL · zone protégée)
              </text>

              {/* Pointer Arrow */}
              {stage.pointerStatus === "nullified" ? (
                <path d="M 117 110 L 117 132" fill="none" stroke="#38bdf8" strokeWidth="2.6" />
              ) : (
                <path
                  d="M 218 66 C 310 66, 330 118, 420 118"
                  fill="none"
                  stroke={arrowColor}
                  strokeWidth="2.8"
                  strokeDasharray={stage.pointerStatus === "ghost" ? "6 4" : undefined}
                />
              )}

              {/* RSP Boundary Line */}
              <line
                x1="400"
                y1={stage.rspLineY}
                x2="704"
                y2={stage.rspLineY}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <text
                x="700"
                y={stage.rspLineY - 5}
                textAnchor="end"
                className="fill-sky-400 font-mono text-[9.5px] font-bold"
              >
                ← Sommet RSP (au-dessus = vivant · au-dessous = libéré)
              </text>

              {/* Target Stack Cell 0x7FF4 */}
              <rect
                x="422"
                y="92"
                width="274"
                height="52"
                rx="10"
                fill={
                  stage.pointerStatus === "corrupted"
                    ? "#ef444424"
                    : stage.pointerStatus === "valid"
                      ? "#10b9811f"
                      : "transparent"
                }
                stroke={arrowColor}
                strokeWidth="2"
                strokeDasharray={stage.pointerStatus === "ghost" ? "5 4" : undefined}
              />
              <text x="436" y="114" className="fill-primary font-mono text-[10px] font-bold">
                0x7FF4 · [{stage.slotOwner}]
              </text>
              <text x="436" y="133" className="fill-muted-foreground text-[9.5px]">
                {stage.pointerStatus === "ghost"
                  ? "Case hors pile : octets fantômes non remis à zéro"
                  : stage.pointerStatus === "corrupted"
                    ? "Écrasée par un autre appel !"
                    : stage.pointerStatus === "nullified"
                      ? "p ne pointe plus ici"
                      : "Variable locale x vivante"}
              </text>
              <text
                x="682"
                y="124"
                textAnchor="end"
                className="fill-foreground font-mono text-[16px] font-bold"
              >
                {stage.slotValue}
              </text>

              {/* Animated Dereference Pulse */}
              <circle ref={pulseRef} cx="215" cy="66" r="5.5" fill={arrowColor} />
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
