"use client";

import * as React from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, Cpu, Info, Pause, Play, RotateCcw } from "lucide-react";
import { getStepDuration, useGsapScope, usePrefersReducedMotion } from "@cyber-school/animations";
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
  CPU_INSTRUCTIONS,
  PRESET_HEX_VALUES,
  getCpuSteps,
  type CpuPresetId,
  type PresetHexValue,
} from "../engines/cpu-memory";

const PRESET_LABELS: Record<CpuPresetId, string> = {
  "load-and-add": "Chargement & Addition",
  "conditional-jump": "Branchement conditionnel (JZ)",
  "little-endian-write": "Écriture Little-Endian int32",
};

export function Vis01CpuMemory() {
  const [preset, setPreset] = React.useState<CpuPresetId>("little-endian-write");
  const [hexValue, setHexValue] = React.useState<PresetHexValue>("0x12345678");
  const [stepIdx, setStepIdx] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [groupInt32, setGroupInt32] = React.useState(true);
  const [speedMultiplier, setSpeedMultiplier] = React.useState<1 | 2>(1);

  const reducedMotion = usePrefersReducedMotion();
  const busTokenRef = React.useRef<SVGCircleElement | null>(null);

  const steps = React.useMemo(() => getCpuSteps(preset, hexValue), [preset, hexValue]);
  const current = steps[Math.min(stepIdx, steps.length - 1)] ?? steps[0]!;
  const instructions = CPU_INSTRUCTIONS[preset];
  const ramEntries = Object.entries(current.memoryBytes);

  function selectPreset(nextPreset: CpuPresetId) {
    setPreset(nextPreset);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function handleReset() {
    setStepIdx(0);
    setIsPlaying(false);
  }

  React.useEffect(() => {
    if (!isPlaying || stepIdx >= steps.length - 1) return;
    const delayMs = Math.round((reducedMotion ? 700 : 1200) / speedMultiplier);
    const timer = window.setTimeout(() => {
      const next = Math.min(steps.length - 1, stepIdx + 1);
      setStepIdx(next);
      if (next >= steps.length - 1) {
        setIsPlaying(false);
      }
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, reducedMotion, speedMultiplier, stepIdx, steps.length]);

  const scopeRef = React.useRef<HTMLDivElement>(null);

  useGsapScope(scopeRef, () => {
    const token = busTokenRef.current;
    if (!token) return;
    if (current.busDirection === "idle") {
      gsap.set(token, { opacity: 0, attr: { cx: 60 } });
      return;
    }
    const fromX = current.busDirection === "data-write" ? 20 : 140;
    const toX = current.busDirection === "data-write" ? 140 : 20;
    const duration = getStepDuration(0.45 / speedMultiplier, reducedMotion);
    if (duration === 0) {
      gsap.set(token, { opacity: 1, attr: { cx: toX } });
      return;
    }
    gsap.fromTo(
      token,
      { opacity: 1, attr: { cx: fromX } },
      { attr: { cx: toX }, duration, ease: "power2.out" },
    );
  }, [current.stepIndex, current.busDirection, preset, hexValue, reducedMotion, speedMultiplier]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIsPlaying(false);
      setStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIsPlaying(false);
      setStepIdx((prev) => Math.max(0, prev - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      handleReset();
    }
  }

  return (
    <div ref={scopeRef}>
      <Card
        data-testid="vis-01-cpu-memory"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Simulateur VIS-01 CPU Fetch-Decode-Execute et RAM Little-Endian"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">
                VIS-01 · Cycle Fetch-Decode-Execute &amp; octets en RAM
              </CardTitle>
            </div>
            <Badge variant="default" data-testid="vis01-phase-badge">
              Phase : {current.phase}
            </Badge>
          </div>
          <CardDescription>
            Observez le compteur d&apos;instruction <code className="font-mono">RIP</code>, les bus
            et le stockage octet par octet en représentation <strong>little-endian</strong>{" "}
            (x86-64).
          </CardDescription>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Programmes VIS-01">
            {(Object.keys(PRESET_LABELS) as CpuPresetId[]).map((id) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={preset === id ? "default" : "outline"}
                onClick={() => selectPreset(id)}
                role="tab"
                aria-selected={preset === id}
              >
                {PRESET_LABELS[id]}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Valeur 32 bits :</span>
              {PRESET_HEX_VALUES.map((val) => (
                <Button
                  key={val}
                  type="button"
                  size="sm"
                  variant={hexValue === val ? "secondary" : "ghost"}
                  className="font-mono text-xs"
                  onClick={() => {
                    setHexValue(val);
                    setStepIdx(0);
                    setIsPlaying(false);
                  }}
                >
                  {val}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setGroupInt32((prev) => !prev)}
                aria-pressed={groupInt32}
              >
                {groupInt32 ? "Vue int32 groupée" : "Vue octets bruts"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSpeedMultiplier((s) => (s === 1 ? 2 : 1))}
              >
                Vitesse {speedMultiplier}x
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_160px_1.25fr]">
            {/* CPU Registers */}
            <div className="min-w-0 rounded-xl border border-border bg-secondary/25 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Processeur (CPU)
                </span>
                <Badge variant="outline" className="font-mono text-[11px]">
                  ZF={current.zf}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="rounded-md border border-primary/50 bg-primary/10 p-2">
                  <div className="text-[10px] text-muted-foreground">RIP (Instruction Ptr)</div>
                  <div className="font-bold text-primary" data-testid="vis01-rip">
                    {current.rip}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-card p-2">
                  <div className="text-[10px] text-muted-foreground">IR (Décodage)</div>
                  <div className="truncate font-semibold">{current.ir}</div>
                </div>
                <div className="rounded-md border border-border bg-card p-2">
                  <div className="text-[10px] text-muted-foreground">RAX / EAX</div>
                  <div className="font-semibold text-foreground" data-testid="vis01-rax">
                    {current.rax}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-card p-2">
                  <div className="text-[10px] text-muted-foreground">RBX / EBX</div>
                  <div className="font-semibold text-foreground" data-testid="vis01-rbx">
                    {current.rbx}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-medium text-muted-foreground">
                  Instructions (Zone Code 0x0040..)
                </div>
                <ul className="space-y-1 font-mono text-xs">
                  {instructions.map((ins) => {
                    const isActive = current.activeInstructionAddr === ins.addr;
                    return (
                      <li
                        key={ins.addr}
                        className={cn(
                          "flex items-center justify-between rounded border px-2 py-1",
                          isActive
                            ? "border-primary bg-primary/15 text-foreground font-semibold"
                            : "border-border/60 bg-card/50 text-muted-foreground",
                        )}
                      >
                        <span>{ins.addr}</span>
                        <span>{ins.asm}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Bus SVG */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/50 p-3 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Bus système
              </span>
              <svg
                viewBox="0 0 160 60"
                className="my-2 h-14 w-full"
                role="img"
                aria-label={`Bus mémoire : ${current.busDirection}`}
              >
                <line
                  x1="12"
                  y1="22"
                  x2="148"
                  y2="22"
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="2"
                />
                <line
                  x1="12"
                  y1="42"
                  x2="148"
                  y2="42"
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="2"
                />
                <circle
                  ref={busTokenRef}
                  cx="60"
                  cy="32"
                  r="7"
                  fill="var(--color-primary, #38bdf8)"
                  opacity="0"
                />
              </svg>
              <div className="font-mono text-[11px] text-foreground">
                {current.busAddr ? `Addr: ${current.busAddr}` : "Bus inactif"}
              </div>
              {current.busData ? (
                <div className="mt-1 truncate max-w-full font-mono text-[11px] text-primary">
                  {current.busData}
                </div>
              ) : null}
            </div>

            {/* RAM Byte Grid */}
            <div className="min-w-0 rounded-xl border border-border bg-secondary/25 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mémoire Données (1 case = 1 octet)
                </span>
                {groupInt32 && current.int32Group ? (
                  <Badge
                    variant="secondary"
                    className="max-w-full whitespace-normal break-all font-mono text-[11px]"
                    data-testid="vis01-le-group"
                  >
                    int32 @{current.int32Group.baseAddr} = {current.int32Group.valueHex} [
                    {current.int32Group.bytes.join(" ")}]
                  </Badge>
                ) : null}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-xs">
                {ramEntries.map(([addr, byteHex]) => {
                  const highlighted = current.highlightedBytes.includes(addr);
                  const isInt32Cell =
                    groupInt32 && ["0x1008", "0x1009", "0x100A", "0x100B"].includes(addr);
                  return (
                    <div
                      key={addr}
                      data-testid={`vis01-byte-${addr}`}
                      className={cn(
                        "rounded-md border px-2 py-1.5 text-center transition-colors motion-reduce:transition-none",
                        highlighted
                          ? "border-primary bg-primary/20 text-foreground font-bold"
                          : isInt32Cell
                            ? "border-sky-500/40 bg-sky-500/10 text-foreground"
                            : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      <div className="text-[10px] opacity-75">{addr}</div>
                      <div className="text-sm">{byteHex}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={stepIdx === 0}
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx((p) => Math.max(0, p - 1));
                }}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Précédent
              </Button>
              <Button type="button" size="sm" onClick={() => setIsPlaying((p) => !p)}>
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" aria-hidden="true" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Lecture auto
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={stepIdx >= steps.length - 1}
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx((p) => Math.min(steps.length - 1, p + 1));
                }}
                data-testid="vis01-next-step"
              >
                Phase suivante
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Réinitialiser
              </Button>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Étape {stepIdx + 1} / {steps.length}
            </span>
          </div>

          {/* Synchronized explanation */}
          <Alert variant="info" aria-live="polite" aria-atomic="true">
            <AlertTitle>Explication synchronisée</AlertTitle>
            <AlertDescription>{current.explanation}</AlertDescription>
          </Alert>

          <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/20 px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong>Ce que le simulateur simplifie :</strong> un processeur réel sépare ses cœurs
              de la DRAM via des caches L1/L2/L3, des tampons d&apos;écriture et un pipeline
              superscalaire. L&apos;ordre exact des octets en little-endian reste toutefois
              strictement identique.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
