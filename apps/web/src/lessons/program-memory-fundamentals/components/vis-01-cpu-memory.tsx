"use client";

import * as React from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, Cpu, Pause, Play, RotateCcw } from "lucide-react";
import {
  ConceptTransformBanner,
  getStepDuration,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@cyber-school/ui";
import {
  CPU_INSTRUCTIONS,
  PRESET_HEX_VALUES,
  getCpuSteps,
  type CpuPresetId,
  type PresetHexValue,
} from "../engines/cpu-memory";

const PRESET_LABELS: Record<CpuPresetId, string> = {
  "little-endian-write": "Écriture Little-Endian",
  "load-and-add": "Lecture & Addition",
  "conditional-jump": "Branchement (JZ)",
};

const SLICE_PALETTE = [
  { bg: "#6366f1", border: "#818cf8", label: "MSB" },
  { bg: "#0ea5e9", border: "#38bdf8", label: "B2" },
  { bg: "#14b8a6", border: "#2dd4bf", label: "B1" },
  { bg: "#84cc16", border: "#a3e635", label: "LSB" },
] as const;

const INT32_ADDRS = ["0x1008", "0x1009", "0x100A", "0x100B"] as const;

function splitHexBytes(hex32: string): [string, string, string, string] {
  const clean = hex32.replace(/^0x/i, "").padStart(8, "0").toUpperCase();
  return [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6), clean.slice(6, 8)];
}

/**
 * VIS-01 Explorable Canvas:
 * - Confusion détruite : croire que little-endian « renverse » un nombre ou écrit 32 bits d'un coup.
 * - Objets animés : tranches colorées [MSB..LSB] dans EAX -> paquet nommé sur le bus -> cases 0x1008..0x100B.
 * - Preuve finale : bascule interactive Little-Endian <-> Big-Endian montrant le même entier rangé différemment.
 */
export function Vis01CpuMemory() {
  const [preset, setPreset] = React.useState<CpuPresetId>("little-endian-write");
  const [hexValue, setHexValue] = React.useState<PresetHexValue>("0x12345678");
  const [stepIdx, setStepIdx] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [endianPreview, setEndianPreview] = React.useState<"little" | "big">("little");
  const [inspectedSliceIdx, setInspectedSliceIdx] = React.useState<number | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = React.useState<1 | 2>(1);

  const reducedMotion = usePrefersReducedMotion();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const packetRef = React.useRef<SVGGElement | null>(null);

  const steps = React.useMemo(() => getCpuSteps(preset, hexValue), [preset, hexValue]);
  const current = steps[Math.min(stepIdx, steps.length - 1)] ?? steps[0]!;
  const instructions = CPU_INSTRUCTIONS[preset];
  const ramEntries = Object.entries(current.memoryBytes);

  // Decompose chosen 32-bit hex value into [MSB, B2, B1, LSB]
  const raxSlices = React.useMemo(() => splitHexBytes(hexValue), [hexValue]);

  // Identify which byte slice [0..3] corresponds to an active RAM write/read highlight
  const activeAddr = current.highlightedBytes[0] ?? current.busAddr ?? null;
  const activeRamIndex = activeAddr
    ? INT32_ADDRS.indexOf(activeAddr as (typeof INT32_ADDRS)[number])
    : -1;
  const activeSliceIndex =
    inspectedSliceIdx !== null
      ? inspectedSliceIdx
      : activeRamIndex >= 0
        ? endianPreview === "little"
          ? 3 - activeRamIndex
          : activeRamIndex
        : null;

  const movingByteLabel =
    current.busDirection === "data-write" && activeSliceIndex !== null
      ? (raxSlices[activeSliceIndex] ?? current.busData ?? "0x..")
      : (current.busData ?? current.busAddr ?? "");

  function selectPreset(nextPreset: CpuPresetId) {
    setPreset(nextPreset);
    setStepIdx(0);
    setIsPlaying(false);
    setInspectedSliceIdx(null);
  }

  function handleReset() {
    setStepIdx(0);
    setIsPlaying(false);
    setInspectedSliceIdx(null);
  }

  React.useEffect(() => {
    if (!isPlaying || stepIdx >= steps.length - 1) return;
    const delayMs = Math.round((reducedMotion ? 700 : 1200) / speedMultiplier);
    const timer = window.setTimeout(() => {
      const next = Math.min(steps.length - 1, stepIdx + 1);
      setStepIdx(next);
      if (next >= steps.length - 1) setIsPlaying(false);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, reducedMotion, speedMultiplier, stepIdx, steps.length]);

  useGsapScope(scopeRef, () => {
    const packet = packetRef.current;
    if (!packet) return;
    if (current.busDirection === "idle") {
      gsap.set(packet, { opacity: 0, x: 0, y: 0 });
      return;
    }
    const isFetch = current.phase === "FETCH";
    const startX = current.busDirection === "data-write" ? 236 : 444;
    const endX = current.busDirection === "data-write" ? 444 : 236;
    const trackY = isFetch ? 76 : 148;
    const duration = getStepDuration(0.45 / speedMultiplier, reducedMotion);

    if (duration === 0) {
      gsap.set(packet, { opacity: 1, x: endX, y: trackY });
      return;
    }
    gsap.fromTo(
      packet,
      { opacity: 1, x: startX, y: trackY },
      { x: endX, y: trackY, duration, ease: "power2.out" },
    );
  }, [
    current.stepIndex,
    current.phase,
    current.busDirection,
    preset,
    hexValue,
    reducedMotion,
    speedMultiplier,
  ]);

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
        className="overflow-hidden border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CardHeader className="space-y-3 border-b border-border/60 bg-secondary/15 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base sm:text-lg">
                Explorer : du registre 32 bits aux cases de 8 bits
              </CardTitle>
            </div>
            <Badge variant="default" data-testid="vis01-phase-badge">
              {current.phase} · Étape {stepIdx + 1}/{steps.length}
            </Badge>
          </div>

          {/* Direct Controls: Program + Live 32-bit Input + Endianness Flip */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Scénarios CPU">
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

            <div className="flex flex-wrap items-center gap-1.5">
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
              <Button
                type="button"
                size="sm"
                variant={endianPreview === "little" ? "outline" : "secondary"}
                onClick={() => setEndianPreview((m) => (m === "little" ? "big" : "little"))}
                aria-pressed={endianPreview === "big"}
                data-testid="vis01-endian-toggle"
              >
                {endianPreview === "little"
                  ? "Ordre : Little-Endian (x86)"
                  : "Comparé : Big-Endian"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Synchronized 1-line Causal Banner */}
          <ConceptTransformBanner
            stepKey={`${preset}-${hexValue}-${current.stepIndex}-${endianPreview}`}
            cause={`RIP=${current.rip} · ${current.ir}`}
            mechanism={current.explanation}
            effectDelta={
              current.highlightedBytes.length > 0
                ? `Case ${current.highlightedBytes.join(", ")} mise à jour`
                : `Phase ${current.phase}`
            }
            tone={current.busDirection === "data-write" ? "success" : "causal"}
            testId="vis01-transform-banner"
          />

          {/* Main Explorable Vector Stage */}
          <div className="rounded-xl border border-border bg-background/80 p-3">
            <svg
              viewBox="0 0 720 220"
              className="h-auto w-full"
              role="img"
              aria-label={`CPU ${current.rax} vers RAM ${current.busAddr ?? "inactif"} en ${endianPreview}-endian`}
            >
              {/* CPU Box */}
              <rect
                x="12"
                y="12"
                width="222"
                height="196"
                rx="12"
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
              <text
                x="26"
                y="34"
                className="fill-primary text-[11px] font-bold uppercase tracking-wider"
              >
                Processeur (CPU)
              </text>
              <text
                x="220"
                y="34"
                textAnchor="end"
                className="fill-muted-foreground font-mono text-[10px]"
              >
                RIP={current.rip} · ZF={current.zf}
              </text>

              {/* EAX 4-Byte Color Decomposition */}
              <text x="26" y="54" className="fill-muted-foreground text-[10px]">
                Registre 32 bits EAX (cliquer un octet) :
              </text>
              {raxSlices.map((byteHex, idx) => {
                const palette = SLICE_PALETTE[idx]!;
                const x = 26 + idx * 49;
                const isSelected = activeSliceIndex === idx;
                return (
                  <g
                    key={`slice-${idx}`}
                    onClick={() => setInspectedSliceIdx(inspectedSliceIdx === idx ? null : idx)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x}
                      y="62"
                      width="44"
                      height="42"
                      rx="7"
                      fill={palette.bg}
                      fillOpacity={isSelected ? 0.35 : 0.16}
                      stroke={palette.border}
                      strokeWidth={isSelected ? 2.4 : 1.3}
                    />
                    <text
                      x={x + 22}
                      y="76"
                      textAnchor="middle"
                      className="fill-muted-foreground font-mono text-[8.5px]"
                    >
                      {palette.label}
                    </text>
                    <text
                      x={x + 22}
                      y="94"
                      textAnchor="middle"
                      className="fill-foreground font-mono text-[13px] font-bold"
                    >
                      {byteHex}
                    </text>
                  </g>
                );
              })}

              {/* Instruction Pointer Mini List Inside CPU */}
              <text x="26" y="124" className="fill-muted-foreground text-[10px]">
                Programme ({preset === "conditional-jump" ? "saut JZ" : "séquentiel"}) :
              </text>
              {instructions.slice(0, 4).map((ins, i) => {
                const active = current.activeInstructionAddr === ins.addr;
                const y = 131 + i * 18;
                return (
                  <g key={ins.addr}>
                    <rect
                      x="24"
                      y={y}
                      width="198"
                      height="15"
                      rx="4"
                      fill={active ? "hsl(var(--primary))" : "transparent"}
                      fillOpacity={active ? 0.2 : 0}
                    />
                    <text
                      x="30"
                      y={y + 11}
                      className={
                        active
                          ? "fill-primary font-mono text-[9.5px] font-bold"
                          : "fill-muted-foreground font-mono text-[9px]"
                      }
                    >
                      {active ? "▶ " : "  "}
                      {ins.addr} {ins.asm}
                    </text>
                  </g>
                );
              })}

              {/* Dual System Bus Wires */}
              <text
                x="342"
                y="62"
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9.5px]"
              >
                Bus d&apos;adresses ({current.busAddr ?? "attente"})
              </text>
              <line
                x1="238"
                y1="76"
                x2="444"
                y2="76"
                stroke={current.phase === "FETCH" ? "#38bdf8" : "hsl(var(--border))"}
                strokeWidth={current.phase === "FETCH" ? 3 : 2}
              />
              <polygon
                points="444,71 454,76 444,81"
                fill={current.phase === "FETCH" ? "#38bdf8" : "hsl(var(--border))"}
              />

              <text
                x="342"
                y="134"
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9.5px]"
              >
                Bus de données (1 case = 1 octet)
              </text>
              <line
                x1="238"
                y1="148"
                x2="444"
                y2="148"
                stroke={
                  current.busDirection === "data-write"
                    ? "#84cc16"
                    : current.busDirection === "data-read"
                      ? "#38bdf8"
                      : "hsl(var(--border))"
                }
                strokeWidth={current.busDirection !== "idle" ? 3 : 2}
              />
              <polygon
                points={
                  current.busDirection === "data-write"
                    ? "444,143 454,148 444,153"
                    : "238,143 228,148 238,153"
                }
                fill={current.busDirection === "data-write" ? "#84cc16" : "#38bdf8"}
                opacity={current.busDirection === "idle" ? 0.25 : 1}
              />

              {/* Animated Named Bus Packet */}
              <g ref={packetRef} opacity="0">
                <rect
                  x="-24"
                  y="-14"
                  width="48"
                  height="26"
                  rx="6"
                  fill={current.busDirection === "data-write" ? "#84cc16" : "#38bdf8"}
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  className="fill-slate-950 font-mono text-[10px] font-bold"
                >
                  {movingByteLabel.slice(0, 7)}
                </text>
              </g>

              {/* RAM Linear Strip */}
              <rect
                x="458"
                y="12"
                width="250"
                height="196"
                rx="12"
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
              <text
                x="472"
                y="34"
                className="fill-primary text-[11px] font-bold uppercase tracking-wider"
              >
                Mémoire RAM ({endianPreview === "little" ? "LSB en premier" : "MSB en premier"})
              </text>

              {INT32_ADDRS.map((addr, idx) => {
                const rawHex = current.memoryBytes[addr] ?? "00";
                const displayHex =
                  endianPreview === "big" && current.int32Group
                    ? (raxSlices[idx] ?? rawHex)
                    : rawHex;
                const sliceIdx = endianPreview === "little" ? 3 - idx : idx;
                const palette = SLICE_PALETTE[sliceIdx]!;
                const rowY = 48 + idx * 38;
                const isLit =
                  current.highlightedBytes.includes(addr) || inspectedSliceIdx === sliceIdx;

                return (
                  <g
                    key={addr}
                    onClick={() =>
                      setInspectedSliceIdx(inspectedSliceIdx === sliceIdx ? null : sliceIdx)
                    }
                    className="cursor-pointer"
                  >
                    <rect
                      x="472"
                      y={rowY}
                      width="222"
                      height="31"
                      rx="7"
                      fill={palette.bg}
                      fillOpacity={isLit ? 0.28 : 0.1}
                      stroke={isLit ? palette.border : "hsl(var(--border))"}
                      strokeWidth={isLit ? 2 : 1}
                    />
                    <text
                      x="484"
                      y={rowY + 19}
                      className="fill-muted-foreground font-mono text-[10px]"
                    >
                      {addr}
                    </text>
                    <text
                      x="580"
                      y={rowY + 20}
                      textAnchor="middle"
                      className="fill-foreground font-mono text-[13px] font-bold"
                    >
                      0x{displayHex}
                    </text>
                    <text
                      x="682"
                      y={rowY + 19}
                      textAnchor="end"
                      className="fill-muted-foreground font-mono text-[9px]"
                    >
                      ← {palette.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive RAM Byte Cards + Registers Readout (preserved for inspection & E2E) */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <Badge variant="outline" data-testid="vis01-rip">
                RIP {current.rip}
              </Badge>
              <Badge variant="outline" data-testid="vis01-rax">
                RAX {current.rax}
              </Badge>
              <Badge variant="outline" data-testid="vis01-rbx">
                RBX {current.rbx}
              </Badge>
            </div>
            {current.int32Group ? (
              <Badge
                variant="secondary"
                className="font-mono text-[11px]"
                data-testid="vis01-le-group"
              >
                int32 @{current.int32Group.baseAddr} = [{current.int32Group.bytes.join(" ")}]
              </Badge>
            ) : null}
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8 font-mono text-xs">
            {ramEntries.map(([addr, byteHex]) => {
              const highlighted = current.highlightedBytes.includes(addr);
              const cellIdx = INT32_ADDRS.indexOf(addr as (typeof INT32_ADDRS)[number]);
              return (
                <button
                  key={addr}
                  type="button"
                  data-testid={`vis01-byte-${addr}`}
                  onClick={() => {
                    if (cellIdx >= 0) {
                      const targetSlice = endianPreview === "little" ? 3 - cellIdx : cellIdx;
                      setInspectedSliceIdx(inspectedSliceIdx === targetSlice ? null : targetSlice);
                    }
                  }}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-center transition-colors motion-reduce:transition-none",
                    highlighted
                      ? "border-primary bg-primary/20 text-foreground font-bold"
                      : cellIdx >= 0
                        ? "border-sky-500/40 bg-sky-500/10 text-foreground"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <div className="text-[10px] opacity-75">{addr}</div>
                  <div className="text-sm">{byteHex}</div>
                </button>
              );
            })}
          </div>

          {/* Step Transport Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
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
                    Animer
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
                Étape suivante
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSpeedMultiplier((s) => (s === 1 ? 2 : 1))}
            >
              Vitesse {speedMultiplier}x
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
