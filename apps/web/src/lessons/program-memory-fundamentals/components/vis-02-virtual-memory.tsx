"use client";

import * as React from "react";
import { Layers, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  animateSvgSignalRoutes,
  ConceptTransformBanner,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@cyber-school/ui";
import {
  getProcessSegments,
  simulateMemoryAccess,
  type MemoryAccessAction,
  type SegmentId,
} from "../engines/virtual-memory";

const ACTIONS: Array<{ id: MemoryAccessAction; label: string }> = [
  { id: "read-text", label: "Lire .text (r-x)" },
  { id: "write-text", label: "Écrire dans .text" },
  { id: "alloc-heap", label: "Allouer Heap (rw-)" },
  { id: "exec-stack", label: "Exécuter Stack" },
  { id: "access-unmapped", label: "Déréférencer NULL (0x0)" },
];

const SEGMENT_TO_ACTION: Record<SegmentId, MemoryAccessAction> = {
  text: "read-text",
  rodata: "read-text",
  "data-bss": "read-text",
  heap: "alloc-heap",
  mmap: "alloc-heap",
  stack: "exec-stack",
};

/**
 * VIS-02 Explorable Canvas:
 * - Confusion détruite : croire que deux processus partageant 0x400000 écrasent la même RAM ou qu'un pointeur mappé est toujours écrivable.
 * - Objets animés : fibres de traduction VA -> MMU (verrous R/W/X) -> cadres physiques RAM ; décalage live ASLR ; choc rouge SIGSEGV sur verrou fermé.
 */
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

  const activeRowIndex = Math.max(
    0,
    activeSegments.findIndex(
      (s) =>
        s.id === (mmuResult.targetSegment !== "none" ? mmuResult.targetSegment : selectedSegmentId),
    ),
  );
  const startY =
    (activeProcess === "P2" && isolationMode ? 142 : 36) + Math.min(activeRowIndex, 5) * 14;
  const mmuY = 128;
  const targetRamY = activeProcess === "P2" ? 182 : 76;

  useGsapScope(scopeRef, () => {
    animateSvgSignalRoutes(
      [
        {
          element: mmuBeamRef.current,
          from: { x: 204, y: startY },
          to: isFault ? { x: 358, y: mmuY } : { x: 514, y: targetRamY },
          active: true,
        },
      ],
      { durationSeconds: 0.55, reducedMotion },
    );
  }, [lastAction, activeProcess, aslrEnabled, isFault, startY, targetRamY, reducedMotion]);

  function triggerAction(actionId: MemoryAccessAction, proc: "P1" | "P2" = activeProcess) {
    setActiveProcess(proc);
    setLastAction(actionId);
    const next = simulateMemoryAccess(actionId, proc, aslrEnabled);
    if (next.targetSegment !== "none") {
      setSelectedSegmentId(next.targetSegment);
    }
  }

  const rwxChecks = {
    r: lastAction !== "access-unmapped",
    w: lastAction !== "write-text" && lastAction !== "access-unmapped",
    x: lastAction !== "exec-stack" && lastAction !== "access-unmapped",
  };

  return (
    <div ref={scopeRef}>
      <Card data-testid="vis-02-virtual-memory" className="overflow-hidden border-primary/25">
        <CardHeader className="space-y-3 border-b border-border/60 bg-secondary/15 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base sm:text-lg">
                Explorer : deux processus isolés face aux verrous{" "}
                <code className="font-mono">rwx</code> de la MMU
              </CardTitle>
            </div>
            <Badge variant={isFault ? "destructive" : "success"} data-testid="vis02-outcome-badge">
              {isFault ? (
                <span className="inline-flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> SIGSEGV bloqué
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Traduction MMU OK
                </span>
              )}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={isolationMode ? "default" : "outline"}
              onClick={() => setIsolationMode((prev) => !prev)}
              aria-pressed={isolationMode}
            >
              {isolationMode ? "Isolation P1 ↔ P2" : "P1 seul"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeProcess === "P1" ? "secondary" : "ghost"}
              onClick={() => setActiveProcess("P1")}
            >
              Processus P1
            </Button>
            {isolationMode ? (
              <Button
                type="button"
                size="sm"
                variant={activeProcess === "P2" ? "secondary" : "ghost"}
                onClick={() => setActiveProcess("P2")}
              >
                Processus P2
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant={aslrEnabled ? "secondary" : "outline"}
              onClick={() => setAslrEnabled((prev) => !prev)}
              aria-pressed={aslrEnabled}
              data-testid="vis02-aslr-toggle"
            >
              ASLR : {aslrEnabled ? "ON (adresses aléatoires)" : "OFF"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <ConceptTransformBanner
            stepKey={`${activeProcess}-${lastAction}-${aslrEnabled}`}
            cause={`${activeProcess} · ${lastAction} (${mmuResult.virtualAddr})`}
            mechanism={mmuResult.explanation}
            effectDelta={
              mmuResult.physicalFrame ? `RAM → ${mmuResult.physicalFrame}` : "TRAP : SIGSEGV"
            }
            tone={isFault ? "danger" : "success"}
            testId="vis02-transform-banner"
          />

          {/* Main Interactive MMU Vector Map */}
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <svg
              viewBox="0 0 720 250"
              className="h-auto w-full"
              role="img"
              aria-label={`Traduction MMU ${activeProcess} ${mmuResult.virtualAddr} vers ${mmuResult.physicalFrame ?? "SIGSEGV"}`}
            >
              {/* Virtual Processes Column */}
              {(isolationMode ? (["P1", "P2"] as const) : (["P1"] as const)).map((pid, pIdx) => {
                const segs = pid === "P1" ? segmentsP1 : segmentsP2;
                const yBase = pIdx === 0 ? 18 : 132;
                const isActiveProc = activeProcess === pid;
                return (
                  <g key={pid}>
                    <rect
                      x="10"
                      y={yBase}
                      width="202"
                      height="104"
                      rx="10"
                      fill="hsl(var(--card))"
                      stroke={isActiveProc ? "hsl(var(--primary))" : "hsl(var(--border))"}
                      strokeWidth={isActiveProc ? 1.8 : 1}
                    />
                    <text x="22" y={yBase + 18} className="fill-foreground text-[10.5px] font-bold">
                      {pid} (Adresses virtuelles{aslrEnabled ? " +ASLR" : ""})
                    </text>
                    {segs.slice(0, 6).map((seg, sIdx) => {
                      const sy = yBase + 22 + sIdx * 13.5;
                      const isTarget =
                        isActiveProc &&
                        (mmuResult.targetSegment === seg.id ||
                          (mmuResult.targetSegment === "none" && selectedSegmentId === seg.id));
                      return (
                        <g
                          key={`${pid}-${seg.id}`}
                          onClick={() => triggerAction(SEGMENT_TO_ACTION[seg.id], pid)}
                          className="cursor-pointer"
                        >
                          <rect
                            x="18"
                            y={sy}
                            width="186"
                            height="12"
                            rx="3"
                            fill={isTarget ? (isFault ? "#ef4444" : "#84cc16") : "#64748b"}
                            fillOpacity={isTarget ? 0.25 : 0.12}
                            stroke={isTarget ? (isFault ? "#ef4444" : "#84cc16") : "transparent"}
                          />
                          <text
                            x="24"
                            y={sy + 9}
                            className="fill-foreground font-mono text-[8.5px] font-semibold"
                          >
                            .{seg.id} {seg.virtualRange.split("-")[0]}
                          </text>
                          <text
                            x="198"
                            y={sy + 9}
                            textAnchor="end"
                            className="fill-primary font-mono text-[8.5px]"
                          >
                            {seg.permissions}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Translation Fiber P1 -> MMU -> RAM */}
              <path
                d={`M 212 ${startY} C 275 ${startY}, 275 ${mmuY}, 308 ${mmuY}`}
                fill="none"
                stroke={isFault ? "#ef4444" : "#84cc16"}
                strokeWidth="2.4"
              />
              <path
                d={`M 412 ${mmuY} C 455 ${mmuY}, 465 ${targetRamY}, 512 ${targetRamY}`}
                fill="none"
                stroke={isFault ? "#ef4444" : "#84cc16"}
                strokeWidth="2.4"
                strokeDasharray={isFault ? "5 4" : undefined}
              />

              {/* Center MMU Permission Gate */}
              <rect
                x="308"
                y="68"
                width="104"
                height="120"
                rx="12"
                fill="hsl(var(--card))"
                stroke={isFault ? "#ef4444" : "#10b981"}
                strokeWidth="2.2"
              />
              <text
                x="360"
                y="88"
                textAnchor="middle"
                className="fill-foreground text-[11px] font-bold"
              >
                MMU Matérielle
              </text>
              <text
                x="360"
                y="102"
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[8.5px]"
              >
                {activeProcess} · {lastAction === "access-unmapped" ? "Page P=0" : "Page P=1"}
              </text>

              {(["r", "w", "x"] as const).map((bit, bIdx) => {
                const ok = rwxChecks[bit];
                const bx = 320 + bIdx * 28;
                return (
                  <g key={bit}>
                    <rect
                      x={bx}
                      y="112"
                      width="24"
                      height="30"
                      rx="5"
                      fill={ok ? "#10b981" : "#ef4444"}
                      fillOpacity="0.22"
                      stroke={ok ? "#10b981" : "#ef4444"}
                    />
                    <text
                      x={bx + 12}
                      y="126"
                      textAnchor="middle"
                      className="fill-foreground font-mono text-[10px] font-bold uppercase"
                    >
                      {bit}
                    </text>
                    <text
                      x={bx + 12}
                      y="138"
                      textAnchor="middle"
                      className={cn(
                        "font-mono text-[8px]",
                        ok ? "fill-emerald-400" : "fill-rose-400",
                      )}
                    >
                      {ok ? "OK" : "NON"}
                    </text>
                  </g>
                );
              })}

              <text
                x="360"
                y="174"
                textAnchor="middle"
                className={cn(
                  "font-mono text-[10px] font-bold",
                  isFault ? "fill-rose-400" : "fill-emerald-400",
                )}
              >
                {isFault ? "⛔ TRAP SIGSEGV" : "✓ Cadre résolu"}
              </text>

              {/* Physical RAM Column */}
              <rect
                x="512"
                y="24"
                width="196"
                height="202"
                rx="12"
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
              <text
                x="610"
                y="44"
                textAnchor="middle"
                className="fill-primary text-[11px] font-bold uppercase tracking-wider"
              >
                RAM Physique (Séparée)
              </text>

              <rect
                x="526"
                y="56"
                width="168"
                height="64"
                rx="8"
                fill={activeProcess === "P1" && !isFault ? "#10b98124" : "hsl(var(--secondary))"}
                stroke={activeProcess === "P1" && !isFault ? "#10b981" : "hsl(var(--border))"}
              />
              <text x="536" y="76" className="fill-foreground font-mono text-[10px] font-bold">
                Cadre Physique P1
              </text>
              <text x="536" y="94" className="fill-primary font-mono text-[9.5px]">
                {segmentsP1[0]?.physicalFrame} …
              </text>
              <text x="536" y="109" className="fill-muted-foreground text-[8.5px]">
                Isolé de P2 même si VA identique
              </text>

              {isolationMode ? (
                <g>
                  <rect
                    x="526"
                    y="142"
                    width="168"
                    height="64"
                    rx="8"
                    fill={
                      activeProcess === "P2" && !isFault ? "#10b98124" : "hsl(var(--secondary))"
                    }
                    stroke={activeProcess === "P2" && !isFault ? "#10b981" : "hsl(var(--border))"}
                  />
                  <text x="536" y="162" className="fill-foreground font-mono text-[10px] font-bold">
                    Cadre Physique P2
                  </text>
                  <text x="536" y="180" className="fill-primary font-mono text-[9.5px]">
                    {segmentsP2[0]?.physicalFrame} …
                  </text>
                  <text x="536" y="195" className="fill-muted-foreground text-[8.5px]">
                    Autre zone RAM physique réelle
                  </text>
                </g>
              ) : null}

              {/* Animated MMU Translation Particle */}
              <circle
                ref={mmuBeamRef}
                cx="204"
                cy={startY}
                r="6"
                fill={isFault ? "#ef4444" : "#84cc16"}
              />
            </svg>
          </div>

          {/* Direct Probe Operations + Segment Selector (keeps existing testids) */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Opérations MMU">
            {ACTIONS.map((act) => (
              <Button
                key={act.id}
                type="button"
                size="sm"
                variant={lastAction === act.id ? "default" : "outline"}
                onClick={() => triggerAction(act.id)}
                data-testid={`vis02-action-${act.id}`}
              >
                {act.label}
              </Button>
            ))}
          </div>

          <div
            className="grid gap-1.5 sm:grid-cols-4"
            role="listbox"
            aria-label="Segments inspectables"
          >
            {activeSegments.map((seg) => (
              <button
                key={seg.id}
                type="button"
                role="option"
                aria-selected={seg.id === selectedSegmentId}
                data-testid={`vis02-seg-${seg.id}`}
                onClick={() => setSelectedSegmentId(seg.id)}
                className={cn(
                  "rounded-lg border px-2.5 py-2 text-left text-xs transition-colors",
                  seg.id === selectedSegmentId
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary/40",
                )}
              >
                <div className="flex items-center justify-between font-mono font-semibold">
                  <span>.{seg.id}</span>
                  <span>{seg.permissions}</span>
                </div>
                <div className="truncate font-mono text-[10px] opacity-80">{seg.virtualRange}</div>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border/70 bg-secondary/20 px-3 py-2 font-mono text-[11px] text-muted-foreground">
            <strong className="text-foreground">/proc/self/maps ({inspectedSegment.name}) :</strong>{" "}
            {inspectedSegment.procMapsExample}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
