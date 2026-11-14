"use client";

import * as React from "react";
import { Boxes, Plus, RotateCcw, Trash2 } from "lucide-react";
import { ConceptTransformBanner } from "@cyber-school/animations";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@cyber-school/ui";
import {
  allocateFromHeap,
  buildHeapPreset,
  computeHeapMetrics,
  createInitialHeapState,
  freeHeapChunk,
  toggleCoalescing,
  type HeapChunk,
  type HeapPresetId,
  type HeapState,
} from "../engines/heap-allocator";

const PRESET_LABELS: Record<HeapPresetId, string> = {
  "healthy-cycle": "Cycle sain",
  "external-fragmentation": "Fragmentation externe",
  "leak-and-double-free": "Fuite & Double Free",
  "use-after-free": "Use-After-Free (CWE-416)",
};

const CHUNK_STATUS_STYLES: Record<HeapChunk["status"], string> = {
  allocated: "border-primary/40 bg-primary/10 text-foreground",
  free: "border-dashed border-muted-foreground/40 bg-muted/30 text-muted-foreground",
  "uaf-aliased": "border-destructive bg-destructive/15 text-destructive",
  "double-free-corrupted": "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

const HAZARD_LABELS: Record<HeapState["hazard"], { label: string; destructive: boolean }> = {
  none: { label: "Tas cohérent", destructive: false },
  "external-fragmentation": { label: "Fragmentation externe", destructive: true },
  leak: { label: "Fuite mémoire (CWE-401)", destructive: true },
  "double-free": { label: "Double Free (CWE-415)", destructive: true },
  uaf: { label: "Use-After-Free (CWE-416)", destructive: true },
};

/**
 * VIS-04 Explorable Canvas:
 * - Confusion détruite : croire que free() efface la RAM ou que malloc(24) occupe exactement 24 octets.
 * - Objets visuels : ruban linéaire 256 o à l'échelle [8B En-tête | Payload | Padding hachuré] +
 *   flèches des pointeurs ptrA / ptrB convergeant physiquement vers la même zone lors d'un UAF.
 */
export function Vis04HeapAllocator() {
  const [state, setState] = React.useState<HeapState>(() => createInitialHeapState(true));
  const [activePreset, setActivePreset] = React.useState<HeapPresetId | null>(null);
  const [showHeaders, setShowHeaders] = React.useState(true);

  const metrics = React.useMemo(() => computeHeapMetrics(state), [state]);
  const hazardBadge = HAZARD_LABELS[state.hazard];

  function handlePreset(preset: HeapPresetId) {
    setActivePreset(preset);
    setState(buildHeapPreset(preset));
  }

  function handleReset() {
    setActivePreset(null);
    setState(createInitialHeapState(state.coalescingEnabled));
  }

  function handleMalloc(bytes: number, prefix: string) {
    setActivePreset(null);
    setState((prev) => allocateFromHeap(prev, bytes, prefix));
  }

  function handleFree(chunkId: string) {
    setActivePreset(null);
    setState((prev) => freeHeapChunk(prev, chunkId));
  }

  function handleToggleCoalescing() {
    setState((prev) => toggleCoalescing(prev, !prev.coalescingEnabled));
  }

  const payloadPct = Math.round((metrics.requestedPayloadBytes / metrics.capacityBytes) * 100);
  const internalPct = Math.round((metrics.internalWasteBytes / metrics.capacityBytes) * 100);
  const freePct = Math.max(0, 100 - payloadPct - internalPct);

  return (
    <Card
      data-testid="vis-04-heap-allocator"
      aria-label="Simulateur VIS-04 Tas et Allocateur"
      className="overflow-hidden border-primary/25"
    >
      <CardHeader className="space-y-3 border-b border-border/60 bg-secondary/15 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-base sm:text-lg">
              Explorer : découpage, fusion &amp; réutilisation d&apos;adresses sur le Tas
            </CardTitle>
          </div>
          <Badge
            variant={hazardBadge.destructive ? "destructive" : "secondary"}
            data-testid="vis04-hazard-badge"
          >
            {hazardBadge.label}
          </Badge>
        </div>

        {/* Presets + Live Allocator Actions */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Scénarios préconfigurés">
          {(Object.keys(PRESET_LABELS) as HeapPresetId[]).map((presetKey) => (
            <Button
              key={presetKey}
              type="button"
              size="sm"
              variant={activePreset === presetKey ? "default" : "outline"}
              data-testid={`vis04-preset-${presetKey}`}
              onClick={() => handlePreset(presetKey)}
            >
              {PRESET_LABELS[presetKey]}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            data-testid="vis04-btn-malloc-16"
            onClick={() => handleMalloc(16, "req")}
          >
            <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            malloc(16)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            data-testid="vis04-btn-malloc-24"
            onClick={() => handleMalloc(24, "user")}
          >
            <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            malloc(24)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            data-testid="vis04-btn-malloc-40"
            onClick={() => handleMalloc(40, "buf")}
          >
            <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            malloc(40)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            data-testid="vis04-btn-malloc-mmap"
            onClick={() => handleMalloc(262144, "big")}
          >
            <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            malloc(256 Ko → mmap)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={state.coalescingEnabled ? "outline" : "destructive"}
            aria-pressed={state.coalescingEnabled}
            data-testid="vis04-toggle-coalescing"
            onClick={handleToggleCoalescing}
          >
            Fusion : {state.coalescingEnabled ? "ON" : "OFF"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={showHeaders}
            onClick={() => setShowHeaders((v) => !v)}
          >
            En-têtes 8 o : {showHeaders ? "ON" : "OFF"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleReset}
            aria-label="Réinitialiser le tas simulé"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <ConceptTransformBanner
          stepKey={`${state.hazard}-${state.chunks.length}-${state.coalescingEnabled}-${metrics.requestedPayloadBytes}`}
          cause={
            activePreset
              ? PRESET_LABELS[activePreset]
              : `Fusion ${state.coalescingEnabled ? "ON" : "OFF"} · ${state.chunks.length} blocs`
          }
          mechanism={
            state.logs[0] ??
            "Chaque allocation réserve 8 o d'en-tête + payload + bourrage aligné sur 16 octets"
          }
          effectDelta={`Utile ${payloadPct}% · Surcoût ${internalPct}% · Libre ${freePct}%`}
          tone={
            state.hazard === "none"
              ? "causal"
              : state.hazard === "external-fragmentation" || state.hazard === "leak"
                ? "warning"
                : "danger"
          }
          testId="vis04-transform-banner"
        />

        {/* Proportional 256B Linear Heap Strip + Live Pointer Arcs SVG */}
        <div className="rounded-xl border border-border bg-background/80 p-3">
          <svg
            viewBox="0 0 720 156"
            className="h-auto w-full"
            role="img"
            aria-label={`Arène tas 256 octets : ${state.chunks.length} blocs, fragmentation externe ${metrics.externalFragmentationPercent}%`}
          >
            <defs>
              <pattern
                id="paddingHatch"
                width="6"
                height="6"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="6" stroke="#f59e0b" strokeWidth="2.2" />
              </pattern>
            </defs>

            <text x="16" y="16" className="fill-muted-foreground font-mono text-[9.5px]">
              Pointeurs côté Pile → Arène Tas linéaire (256 octets · 0x602000 → 0x602100)
            </text>

            {/* Pointer Arcs from Stack Boxes Down to Target Heap Offsets */}
            {state.stackRefs.slice(0, 4).map((ref, rIdx) => {
              const boxX = 24 + rIdx * 165;
              const targetOffsetMatch = parseInt(ref.targetAddr, 16) - 0x602000;
              const clampedOffset = Number.isFinite(targetOffsetMatch)
                ? Math.max(0, Math.min(248, targetOffsetMatch))
                : 16;
              const targetX = 16 + (clampedOffset / metrics.capacityBytes) * 688;
              const isDanger = ref.status !== "valid";
              return (
                <g key={`${ref.varName}-${ref.targetAddr}-${rIdx}`}>
                  <rect
                    x={boxX}
                    y="24"
                    width="148"
                    height="24"
                    rx="6"
                    fill={isDanger ? "#ef444424" : "#10b9811f"}
                    stroke={isDanger ? "#ef4444" : "#10b981"}
                  />
                  <text
                    x={boxX + 74}
                    y="39"
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[9px] font-bold"
                  >
                    {ref.varName} → {ref.targetAddr}
                  </text>
                  <path
                    d={`M ${boxX + 74} 48 C ${boxX + 74} 68, ${targetX} 64, ${targetX} 84`}
                    fill="none"
                    stroke={isDanger ? "#ef4444" : "#10b981"}
                    strokeWidth="2"
                    strokeDasharray={isDanger ? "4 3" : undefined}
                  />
                </g>
              );
            })}

            {/* Proportional Arena Strip (x=16, w=688 for 256 bytes) */}
            {state.chunks.map((chunk) => {
              const x = 16 + (chunk.offset / metrics.capacityBytes) * 688;
              const totalW = Math.max(12, (chunk.totalSize / metrics.capacityBytes) * 688);
              const hdrW = showHeaders ? Math.min(totalW, (8 / metrics.capacityBytes) * 688) : 0;
              const payloadW =
                chunk.status === "free"
                  ? 0
                  : Math.max(
                      0,
                      Math.min(totalW - hdrW, (chunk.requestedSize / metrics.capacityBytes) * 688),
                    );
              const padW = Math.max(0, totalW - hdrW - payloadW);
              const isFree = chunk.status === "free";
              const isUaf = chunk.status === "uaf-aliased";
              const isDblFree = chunk.status === "double-free-corrupted";

              return (
                <g key={chunk.id}>
                  <rect
                    x={x}
                    y="84"
                    width={totalW}
                    height="46"
                    rx="5"
                    fill={
                      isFree
                        ? "transparent"
                        : isUaf
                          ? "#ef444433"
                          : isDblFree
                            ? "#f59e0b33"
                            : "hsl(var(--primary))"
                    }
                    fillOpacity={isFree || isUaf || isDblFree ? 1 : 0.25}
                    stroke={
                      isUaf
                        ? "#ef4444"
                        : isDblFree
                          ? "#f59e0b"
                          : isFree
                            ? "#64748b"
                            : "hsl(var(--primary))"
                    }
                    strokeDasharray={isFree ? "4 3" : undefined}
                    strokeWidth="1.6"
                  />
                  {/* 8-Byte Header */}
                  {hdrW > 0 ? (
                    <rect
                      x={x + 1}
                      y="85"
                      width={Math.max(4, hdrW - 1)}
                      height="44"
                      fill="#f59e0b"
                      fillOpacity="0.38"
                    />
                  ) : null}
                  {/* Alignment Padding Hatch */}
                  {!isFree && padW > 3 ? (
                    <rect
                      x={x + hdrW + payloadW}
                      y="85"
                      width={padW - 1}
                      height="44"
                      fill="url(#paddingHatch)"
                      opacity="0.65"
                    />
                  ) : null}
                  <text
                    x={x + totalW / 2}
                    y="106"
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[9px] font-bold"
                  >
                    {totalW > 46 ? chunk.label : `${chunk.totalSize}o`}
                  </text>
                  <text
                    x={x + totalW / 2}
                    y="120"
                    textAnchor="middle"
                    className="fill-muted-foreground font-mono text-[8px]"
                  >
                    {isFree ? `libre ${chunk.totalSize}o` : `${chunk.totalSize}o`}
                  </text>
                </g>
              );
            })}

            <text x="16" y="148" className="fill-muted-foreground font-mono text-[8.5px]">
              Légende : Or = En-tête 8o · Plein = Payload utile · Hachuré = Padding alignement 16o ·
              Pointillé = Libre
            </text>
          </svg>
        </div>

        {/* Clickable Chunk Controls (preserved for direct free() interactions & E2E) */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="vis04-chunks-grid">
          {state.chunks.map((chunk) => {
            const addrHex = "0x" + (0x602000 + chunk.offset + 8).toString(16).toUpperCase();
            return (
              <div
                key={chunk.id}
                data-testid={`vis04-chunk-${chunk.id}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-xs",
                  CHUNK_STATUS_STYLES[chunk.status],
                )}
              >
                <div className="min-w-0 font-mono">
                  <div className="truncate font-semibold">
                    {chunk.label} ({chunk.totalSize}o)
                  </div>
                  <div className="text-[10.5px] opacity-80">
                    @{addrHex} ·{" "}
                    {showHeaders
                      ? `${chunk.headerHex} P=${chunk.prevInUse ? 1 : 0}`
                      : `${chunk.requestedSize}o`}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={chunk.status === "free" ? "outline" : "destructive"}
                  className="h-7 shrink-0 px-2 text-xs"
                  onClick={() => handleFree(chunk.id)}
                  data-testid={`vis04-free-${chunk.id}`}
                >
                  <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
                  free()
                </Button>
              </div>
            );
          })}
        </div>

        {/* Compact Metrics & Occupation Bar SVG (preserved testid vis04-svg-chart) */}
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold">Occupation &amp; Fragmentation</span>
            <span className="font-mono">
              Frag. externe : {metrics.externalFragmentationPercent}% · Plus grand bloc libre :{" "}
              {metrics.largestContiguousFreeBytes} o
            </span>
          </div>
          <svg
            viewBox="0 0 360 46"
            className="h-14 w-full rounded border bg-background p-1"
            role="img"
            aria-label={`Répartition du tas : ${payloadPct}% données utiles, ${internalPct}% surcoût interne, ${freePct}% libre`}
            data-testid="vis04-svg-chart"
          >
            <rect
              x="10"
              y="6"
              width={Math.max(0, (payloadPct / 100) * 340)}
              height="16"
              rx="3"
              className="fill-primary"
            />
            <rect
              x={10 + (payloadPct / 100) * 340}
              y="6"
              width={Math.max(0, (internalPct / 100) * 340)}
              height="16"
              className="fill-amber-500"
            />
            <rect
              x={10 + ((payloadPct + internalPct) / 100) * 340}
              y="6"
              width={Math.max(0, (freePct / 100) * 340)}
              height="16"
              rx="3"
              className="fill-muted stroke-border"
            />
            <text x="10" y="38" className="fill-foreground font-mono text-[10.5px]">
              Utile: {metrics.requestedPayloadBytes}o ({payloadPct}%) · Surcoût interne:{" "}
              {metrics.internalWasteBytes}o ({internalPct}%) · Libre: {metrics.totalFreeBytes}o
            </text>
          </svg>
        </div>

        {state.mmapBlocks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 font-mono text-xs">
            <span className="font-semibold text-primary">Hors tas via mmap() :</span>
            {state.mmapBlocks.map((blk) => (
              <Badge key={blk.id} variant="outline">
                {blk.addr} ({blk.requestedLabel} · {blk.flagsLabel})
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
