"use client";

import * as React from "react";
import { Info, Layers, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  animateSvgSignalRoutes,
  ConceptTransformBanner,
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
import {
  getProcessSegments,
  simulateMemoryAccess,
  type MemoryAccessAction,
  type SegmentId,
} from "../engines/virtual-memory";

const ACTIONS: Array<{ id: MemoryAccessAction; label: string }> = [
  { id: "read-text", label: "Lire Text (r-x)" },
  { id: "write-text", label: "Écrire dans Text" },
  { id: "alloc-heap", label: "Allouer page Heap" },
  { id: "exec-stack", label: "Exécuter dans Stack" },
  { id: "access-unmapped", label: "Déréférencer NULL (0x0)" },
];

export function Vis02VirtualMemory() {
  const [isolationMode, setIsolationMode] = React.useState(true);
  const [activeProcess, setActiveProcess] = React.useState<"P1" | "P2">("P1");
  const [aslrEnabled, setAslrEnabled] = React.useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = React.useState<SegmentId>("text");
  const [lastAction, setLastAction] = React.useState<MemoryAccessAction>("read-text");

  const segmentsP1 = React.useMemo(() => getProcessSegments("P1", aslrEnabled), [aslrEnabled]);
  const segmentsP2 = React.useMemo(() => getProcessSegments("P2", aslrEnabled), [aslrEnabled]);

  const activeSegments = activeProcess === "P1" ? segmentsP1 : segmentsP2;
  const inspectedSegment =
    activeSegments.find((s) => s.id === selectedSegmentId) ?? activeSegments[0]!;
  const mmuResult = React.useMemo(
    () => simulateMemoryAccess(lastAction, activeProcess, aslrEnabled),
    [lastAction, activeProcess, aslrEnabled],
  );

  const reducedMotion = usePrefersReducedMotion();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const mmuBeamRef = React.useRef<SVGCircleElement | null>(null);

  const isFault =
    mmuResult.outcome === "sigsegv_permission_denied" || mmuResult.outcome === "sigsegv_unmapped";

  useGsapScope(scopeRef, () => {
    animateSvgSignalRoutes(
      [
        {
          element: mmuBeamRef.current,
          from: { x: 48, y: 42 },
          to: isFault ? { x: 185, y: 42 } : { x: 312, y: 42 },
          active: true,
        },
      ],
      { durationSeconds: 0.45, reducedMotion },
    );
  }, [lastAction, activeProcess, aslrEnabled, isFault, reducedMotion]);

  return (
    <div ref={scopeRef}>
      <Card data-testid="vis-02-virtual-memory">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">
                VIS-02 · Espace d&apos;adressage virtuel, MMU &amp; segments
              </CardTitle>
            </div>
            <Badge variant={isFault ? "destructive" : "success"} data-testid="vis02-outcome-badge">
              {isFault ? "SIGSEGV" : "Traduction MMU valide"}
            </Badge>
          </div>
          <CardDescription>
            Inspectez chaque région de <code className="font-mono">/proc/[pid]/maps</code>, observez
            comment deux processus partagent les mêmes adresses virtuelles sans collision physique,
            et testez la protection <code className="font-mono">rwx</code>.
          </CardDescription>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={isolationMode ? "default" : "outline"}
              onClick={() => setIsolationMode((prev) => !prev)}
              aria-pressed={isolationMode}
            >
              {isolationMode ? "Isolation P1 ↔ P2 active" : "Vue P1 uniquement"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeProcess === "P1" ? "secondary" : "ghost"}
              onClick={() => setActiveProcess("P1")}
            >
              Cibler Processus P1
            </Button>
            {isolationMode ? (
              <Button
                type="button"
                size="sm"
                variant={activeProcess === "P2" ? "secondary" : "ghost"}
                onClick={() => setActiveProcess("P2")}
              >
                Cibler Processus P2
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant={aslrEnabled ? "secondary" : "outline"}
              onClick={() => setAslrEnabled((prev) => !prev)}
              aria-pressed={aslrEnabled}
            >
              ASLR : {aslrEnabled ? "Activé (bases décalées)" : "Désactivé"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ConceptTransformBanner
            stepKey={`${activeProcess}-${lastAction}-${aslrEnabled}`}
            cause={`${activeProcess} demande ${lastAction} @ ${mmuResult.virtualAddr}`}
            mechanism={
              isFault
                ? "La MMU vérifie les bits de permission / présence et déclenche une interruption matérielle"
                : `La MMU traduit l'adresse virtuelle via ${mmuResult.pageTableMatch}`
            }
            effectDelta={
              mmuResult.physicalFrame ? `RAM → ${mmuResult.physicalFrame}` : "TRAP : SIGSEGV bloqué"
            }
            tone={isFault ? "danger" : "success"}
            testId="vis02-transform-banner"
          />

          {/* MMU Address Translation SVG */}
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <svg
              viewBox="0 0 360 84"
              className="h-20 w-full"
              role="img"
              aria-label={`Traduction MMU ${mmuResult.virtualAddr} vers ${mmuResult.physicalFrame ?? "SIGSEGV"}`}
            >
              <rect
                x="8"
                y="16"
                width="98"
                height="52"
                rx="6"
                fill="hsl(var(--card))"
                stroke="hsl(var(--primary))"
                strokeWidth="1.8"
              />
              <text
                x="57"
                y="34"
                textAnchor="middle"
                className="fill-foreground text-[9px] font-semibold"
              >
                VA ({activeProcess})
              </text>
              <text
                x="57"
                y="50"
                textAnchor="middle"
                className="fill-primary font-mono text-[8.5px]"
              >
                {mmuResult.virtualAddr}
              </text>

              <line
                x1="106"
                y1="42"
                x2="136"
                y2="42"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />

              <rect
                x="138"
                y="14"
                width="92"
                height="56"
                rx="6"
                fill={isFault ? "#ef44441a" : "#10b9811a"}
                stroke={isFault ? "#ef4444" : "#10b981"}
                strokeWidth="2"
              />
              <text
                x="184"
                y="34"
                textAnchor="middle"
                className="fill-foreground text-[9px] font-bold"
              >
                MMU (rwx)
              </text>
              <text
                x="184"
                y="50"
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[8px]"
              >
                {isFault ? "Droits refusés !" : "Bit OK · Traduit"}
              </text>

              <line
                x1="230"
                y1="42"
                x2="262"
                y2="42"
                stroke={isFault ? "#ef4444" : "#10b981"}
                strokeDasharray={isFault ? "4 3" : undefined}
                strokeWidth="2"
              />

              <rect
                x="264"
                y="16"
                width="88"
                height="52"
                rx="6"
                fill={isFault ? "#ef444422" : "hsl(var(--card))"}
                stroke={isFault ? "#ef4444" : "#10b981"}
                strokeWidth="1.8"
              />
              <text
                x="308"
                y="34"
                textAnchor="middle"
                className="fill-foreground text-[9px] font-semibold"
              >
                {isFault ? "Noyau SIGSEGV" : "RAM Physique"}
              </text>
              <text
                x="308"
                y="50"
                textAnchor="middle"
                className="fill-foreground font-mono text-[8.5px]"
              >
                {mmuResult.physicalFrame ?? "Accès stoppé"}
              </text>

              <circle
                ref={mmuBeamRef}
                cx="48"
                cy="42"
                r="5.5"
                fill={isFault ? "#ef4444" : "#10b981"}
              />
            </svg>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            {/* Virtual Segments List */}
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Espace virtuel de {activeProcess} (haut → bas)</span>
                <span>Permissions</span>
              </div>
              <div
                className="space-y-1.5"
                role="listbox"
                aria-label="Segments mémoire du processus"
              >
                {activeSegments.map((seg) => {
                  const selected = seg.id === selectedSegmentId;
                  const targetedByFault = isFault && mmuResult.targetSegment === seg.id;
                  return (
                    <button
                      key={seg.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-testid={`vis02-seg-${seg.id}`}
                      onClick={() => setSelectedSegmentId(seg.id)}
                      className={cn(
                        "flex min-h-11 w-full flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/25 text-secondary-foreground hover:bg-secondary/55",
                        targetedByFault && "border-rose-500 bg-rose-500/10",
                      )}
                    >
                      <div className="min-w-0 break-words">
                        <div className="font-semibold text-foreground">{seg.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {seg.virtualRange} ·{" "}
                          {seg.growth === "down"
                            ? "↓ adresses basses"
                            : seg.growth === "up"
                              ? "↑ adresses hautes"
                              : "taille fixe"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {seg.permissions}
                        </Badge>
                        {isolationMode ? (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {seg.physicalFrame}
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MMU & Action Tester */}
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-secondary/25 p-3.5 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tester une opération mémoire via la MMU
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIONS.map((act) => (
                    <Button
                      key={act.id}
                      type="button"
                      size="sm"
                      variant={lastAction === act.id ? "default" : "outline"}
                      onClick={() => {
                        setLastAction(act.id);
                        const next = simulateMemoryAccess(act.id, activeProcess, aslrEnabled);
                        if (next.targetSegment !== "none") {
                          setSelectedSegmentId(next.targetSegment);
                        }
                      }}
                      data-testid={`vis02-action-${act.id}`}
                    >
                      {act.label}
                    </Button>
                  ))}
                </div>

                <div className="rounded-lg border border-border bg-card p-3 font-mono text-xs space-y-1">
                  <div>
                    Processus : <strong>{mmuResult.processId}</strong> · Adresse virtuelle :{" "}
                    <strong>{mmuResult.virtualAddr}</strong>
                  </div>
                  <div>Table des pages : {mmuResult.pageTableMatch}</div>
                  <div
                    className={
                      isFault ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"
                    }
                  >
                    {mmuResult.physicalFrame
                      ? `Cadre physique RAM : ${mmuResult.physicalFrame}`
                      : "Accès matériel bloqué -> Interruption noyau SIGSEGV"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/70 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    Segment inspecté : {inspectedSegment.name}
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {inspectedSegment.permissions}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{inspectedSegment.contentsExample}</p>
                <div className="rounded border border-border bg-secondary/40 p-2 font-mono text-[11px] text-foreground break-all">
                  /proc/self/maps : {inspectedSegment.procMapsExample}
                </div>
              </div>
            </div>
          </div>

          <Alert
            variant={isFault ? "destructive" : "success"}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-start gap-2.5">
              {isFault ? (
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <div>
                <AlertTitle>
                  {isFault ? "Faute de protection / segmentation" : "Traduction MMU"}
                </AlertTitle>
                <AlertDescription>{mmuResult.explanation}</AlertDescription>
              </div>
            </div>
          </Alert>

          <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/20 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong>Ce que le simulateur simplifie :</strong> Linux x86-64 utilise des adresses
              virtuelles canoniques 48 bits, des tables de pages à 4/5 niveaux et un cache{" "}
              <code className="font-mono">TLB</code>. L&apos;isolation par processus et les droits{" "}
              <code className="font-mono">rwx</code> fonctionnent exactement comme illustré.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
