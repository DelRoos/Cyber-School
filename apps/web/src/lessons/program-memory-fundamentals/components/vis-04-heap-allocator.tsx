"use client";

import * as React from "react";
import { AlertTriangle, Boxes, Info, Plus, RotateCcw, Trash2 } from "lucide-react";
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
  "external-fragmentation": { label: "Fragmentation externe détectée", destructive: true },
  leak: { label: "Fuite mémoire (CWE-401)", destructive: true },
  "double-free": { label: "Double Free (CWE-415)", destructive: true },
  uaf: { label: "Use-After-Free (CWE-416)", destructive: true },
};

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

  // SVG bar chart computations (256 B total managed arena scale)
  const payloadPct = Math.round((metrics.requestedPayloadBytes / metrics.capacityBytes) * 100);
  const internalPct = Math.round((metrics.internalWasteBytes / metrics.capacityBytes) * 100);
  const freePct = Math.max(0, 100 - payloadPct - internalPct);

  return (
    <Card data-testid="vis-04-heap-allocator" aria-label="Simulateur VIS-04 Tas et Allocateur">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">
              VIS-04 · Tas (<code className="font-mono">heap</code>), métadonnées d&apos;allocateur
              &amp; dérives (<code className="font-mono">UAF</code>, fuite, fragmentation)
            </CardTitle>
          </div>
          <Badge
            variant={hazardBadge.destructive ? "destructive" : "secondary"}
            data-testid="vis04-hazard-badge"
          >
            {hazardBadge.label}
          </Badge>
        </div>

        <CardDescription>
          Observez l&apos;en-tête caché de 8 octets (
          <code className="font-mono">taille | A|M|P</code>), l&apos;alignement sur 16 octets, la
          bascule vers <code className="font-mono">mmap</code> pour les gros tampons et la
          réutilisation d&apos;adresse à l&apos;origine du Use-After-Free.
        </CardDescription>

        {/* Scenario Presets */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Scénarios préconfigurés">
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

        {/* Manual Allocator Controls */}
        <div className="flex flex-wrap items-center gap-2">
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
            Fusion (Coalescing) : {state.coalescingEnabled ? "ON" : "OFF"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={showHeaders}
            onClick={() => setShowHeaders((v) => !v)}
          >
            En-têtes 8 o : {showHeaders ? "Visibles" : "Masqués"}
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

      <CardContent className="space-y-4">
        {/* Managed Arena Bar (Linear Memory Chunks) */}
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">
              Arène tas simulée (256 o · base 0x602000)
            </span>
            <span>
              Cliquez sur <code className="font-mono">free()</code> sur n&apos;importe quel bloc (y
              compris un bloc déjà libéré pour observer un Double Free).
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="vis04-chunks-grid">
            {state.chunks.map((chunk) => {
              const addrHex = "0x" + (0x602000 + chunk.offset + 8).toString(16).toUpperCase();
              const headerOffsetHex = "0x" + (0x602000 + chunk.offset).toString(16).toUpperCase();
              return (
                <div
                  key={chunk.id}
                  data-testid={`vis04-chunk-${chunk.id}`}
                  className={cn(
                    "flex flex-col justify-between gap-2 rounded-md border p-2.5 text-xs transition-colors",
                    CHUNK_STATUS_STYLES[chunk.status],
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-semibold">{chunk.label}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {chunk.totalSize} o total
                      </Badge>
                    </div>
                    <p className="font-mono text-[11px] opacity-90">
                      payload @ {addrHex} · demandé : {chunk.requestedSize} o
                    </p>
                    {showHeaders && (
                      <div className="rounded border border-current/20 bg-background/60 px-2 py-1 font-mono text-[11px]">
                        En-tête [{headerOffsetHex}] ={" "}
                        <span className="font-bold">{chunk.headerHex}</span> (P=
                        {chunk.prevInUse ? "1" : "0"})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] opacity-80">offset +{chunk.offset} o</span>
                    <Button
                      type="button"
                      size="sm"
                      variant={chunk.status === "free" ? "outline" : "destructive"}
                      className="h-7 px-2 text-xs"
                      onClick={() => handleFree(chunk.id)}
                      data-testid={`vis04-free-${chunk.id}`}
                    >
                      <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
                      free()
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stack Pointer References + mmap area */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border bg-card p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pointeurs côté Pile (<code className="font-mono">stack -&gt; heap</code>)
            </h4>
            {state.stackRefs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aucun pointeur sur la pile pour l&apos;instant. Allouez un bloc ou chargez un
                scénario.
              </p>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {state.stackRefs.map((ref) => (
                  <li
                    key={`${ref.varName}-${ref.targetAddr}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border px-2.5 py-1.5 font-mono"
                  >
                    <span>
                      {ref.varName} → {ref.targetAddr}
                    </span>
                    <Badge
                      variant={ref.status === "valid" ? "secondary" : "destructive"}
                      className="text-[10px]"
                    >
                      {ref.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}

            {state.mmapBlocks.length > 0 && (
              <div className="space-y-1 pt-2">
                <h5 className="text-xs font-semibold text-primary">
                  Régions <code className="font-mono">mmap()</code> dédiées (hors tas contigu)
                </h5>
                {state.mmapBlocks.map((blk) => (
                  <div
                    key={blk.id}
                    className="flex items-center justify-between rounded border border-primary/30 bg-primary/5 px-2.5 py-1.5 font-mono text-xs"
                  >
                    <span>
                      {blk.addr} ({blk.requestedLabel})
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {blk.flagsLabel}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accessible SVG Occupation & Fragmentation Chart */}
          <div className="space-y-2 rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Métriques &amp; Fragmentation
              </h4>
              <span className="font-mono text-xs font-semibold">
                Frag. externe : {metrics.externalFragmentationPercent}%
              </span>
            </div>

            <svg
              viewBox="0 0 360 72"
              className="h-20 w-full rounded border bg-background p-1"
              role="img"
              aria-label={`Répartition du tas : ${payloadPct}% données utiles, ${internalPct}% surcoût interne, ${freePct}% libre, fragmentation externe ${metrics.externalFragmentationPercent}%`}
              data-testid="vis04-svg-chart"
            >
              {/* Stacked bar of the 256B arena */}
              <rect
                x="10"
                y="12"
                width={Math.max(0, (payloadPct / 100) * 340)}
                height="24"
                rx="3"
                className="fill-primary"
              />
              <rect
                x={10 + (payloadPct / 100) * 340}
                y="12"
                width={Math.max(0, (internalPct / 100) * 340)}
                height="24"
                className="fill-amber-500"
              />
              <rect
                x={10 + ((payloadPct + internalPct) / 100) * 340}
                y="12"
                width={Math.max(0, (freePct / 100) * 340)}
                height="24"
                rx="3"
                className="fill-muted stroke-border"
              />
              <text x="10" y="54" className="fill-foreground text-[11px] font-mono">
                Utile: {metrics.requestedPayloadBytes}o ({payloadPct}%) · Surcoût interne:{" "}
                {metrics.internalWasteBytes}o ({internalPct}%) · Libre: {metrics.totalFreeBytes}o
              </text>
              <text x="10" y="67" className="fill-muted-foreground text-[10px] font-mono">
                Plus grand bloc libre contigu : {metrics.largestContiguousFreeBytes} o
              </text>
            </svg>
          </div>
        </div>

        {/* Live event log & hazard explanation */}
        <div aria-live="polite" className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            {state.hazard !== "none" && (
              <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
            )}
            <span>Journal de l&apos;allocateur</span>
          </div>
          <ul className="space-y-1 font-mono text-[11px] text-muted-foreground">
            {state.logs.map((entry, idx) => (
              <li
                key={`${idx}-${entry}`}
                className={idx === 0 ? "font-semibold text-foreground" : ""}
              >
                • {entry}
              </li>
            ))}
          </ul>
        </div>

        <Alert>
          <Info className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Simplification pédagogique vs implémentations réelles</AlertTitle>
          <AlertDescription className="text-xs">
            Les allocateurs modernes (<code className="font-mono">glibc ptmalloc2</code>,{" "}
            <code className="font-mono">jemalloc</code>, <code className="font-mono">mimalloc</code>
            ) maintiennent plusieurs arènes par thread, des caches rapides (
            <code className="font-mono">tcache</code> / <code className="font-mono">fastbins</code>)
            sans fusion immédiate, et basculent vers <code className="font-mono">mmap</code> autour
            de 128 Ko plutôt qu&apos;à 256 o. L&apos;en-tête caché et l&apos;effet de réutilisation
            (Use-After-Free) restent toutefois fidèles.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
