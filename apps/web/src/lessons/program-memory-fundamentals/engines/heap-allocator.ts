export type HeapPresetId =
  "healthy-cycle" | "external-fragmentation" | "leak-and-double-free" | "use-after-free";

export type ChunkStatus = "allocated" | "free" | "uaf-aliased" | "double-free-corrupted";

export interface HeapChunk {
  id: string;
  offset: number; // byte offset inside the 256B managed heap
  totalSize: number; // header(8) + requested + alignment padding (multiple of 16, min 32)
  requestedSize: number;
  headerHex: string; // e.g. "0x21" (32 | PREV_INUSE=1)
  prevInUse: boolean;
  label: string;
  status: ChunkStatus;
}

export interface StackPointerRef {
  varName: string;
  targetChunkId: string | null;
  targetAddr: string;
  status: "valid" | "dangling" | "leaked" | "uaf-aliased";
}

export interface MmapBlock {
  id: string;
  addr: string;
  requestedLabel: string;
  flagsLabel: string;
}

export interface HeapMetrics {
  capacityBytes: number;
  allocatedTotalBytes: number;
  requestedPayloadBytes: number;
  internalWasteBytes: number;
  totalFreeBytes: number;
  largestContiguousFreeBytes: number;
  externalFragmentationPercent: number;
}

export interface HeapState {
  capacityBytes: number;
  coalescingEnabled: boolean;
  nextChunkSeq: number;
  chunks: HeapChunk[];
  mmapBlocks: MmapBlock[];
  stackRefs: StackPointerRef[];
  hazard: "none" | "external-fragmentation" | "leak" | "double-free" | "uaf";
  logs: string[];
}

const HEAP_BASE = 0x602000;
const HEADER_SIZE = 8;

function formatAddr(offset: number): string {
  return "0x" + (HEAP_BASE + offset).toString(16).toUpperCase();
}

export function alignChunkSize(requestedBytes: number): number {
  const raw = HEADER_SIZE + Math.max(1, requestedBytes);
  const aligned = Math.ceil(raw / 16) * 16;
  return Math.max(32, aligned);
}

export function computeHeaderHex(totalSize: number, prevInUse: boolean, isMmapped = false): string {
  const flags = (prevInUse ? 1 : 0) | (isMmapped ? 2 : 0);
  return "0x" + (totalSize | flags).toString(16).toUpperCase();
}

export function recomputeHeaders(chunks: HeapChunk[]): HeapChunk[] {
  return chunks.map((chunk, idx) => {
    const prev = chunks[idx - 1];
    const prevInUse = idx === 0 ? true : prev !== undefined && prev.status !== "free";
    return {
      ...chunk,
      prevInUse,
      headerHex: computeHeaderHex(chunk.totalSize, prevInUse),
    };
  });
}

export function createInitialHeapState(coalescingEnabled = true): HeapState {
  const initialChunk: HeapChunk = {
    id: "chunk-free-0",
    offset: 0,
    totalSize: 256,
    requestedSize: 0,
    headerHex: computeHeaderHex(256, true),
    prevInUse: true,
    label: "Libre (Wilderness)",
    status: "free",
  };
  return {
    capacityBytes: 256,
    coalescingEnabled,
    nextChunkSeq: 1,
    chunks: [initialChunk],
    mmapBlocks: [],
    stackRefs: [],
    hazard: "none",
    logs: ["Tas initialisé : 256 octets libres contigus à partir de 0x602000."],
  };
}

export function computeHeapMetrics(state: HeapState): HeapMetrics {
  const active = state.chunks.filter((c) => c.status !== "free");
  const free = state.chunks.filter((c) => c.status === "free");

  const allocatedTotalBytes = active.reduce((acc, c) => acc + c.totalSize, 0);
  const requestedPayloadBytes = active.reduce((acc, c) => acc + c.requestedSize, 0);
  const internalWasteBytes = Math.max(0, allocatedTotalBytes - requestedPayloadBytes);
  const totalFreeBytes = free.reduce((acc, c) => acc + c.totalSize, 0);
  const largestContiguousFreeBytes = free.reduce((max, c) => Math.max(max, c.totalSize), 0);
  const externalFragmentationPercent =
    totalFreeBytes > 0
      ? Math.round(((totalFreeBytes - largestContiguousFreeBytes) / totalFreeBytes) * 100)
      : 0;

  return {
    capacityBytes: state.capacityBytes,
    allocatedTotalBytes,
    requestedPayloadBytes,
    internalWasteBytes,
    totalFreeBytes,
    largestContiguousFreeBytes,
    externalFragmentationPercent,
  };
}

export function allocateFromHeap(
  state: HeapState,
  requestedBytes: number,
  labelPrefix = "buf",
): HeapState {
  // Large allocations (>= 128 KiB in glibc; simulated with requestedBytes >= 1024 here) route to mmap
  if (requestedBytes >= 1024) {
    const seq = state.nextChunkSeq;
    const mmapAddr =
      "0x" + (0x705000 + state.mmapBlocks.length * 0x40000).toString(16).toUpperCase();
    const block: MmapBlock = {
      id: `mmap-${seq}`,
      addr: mmapAddr,
      requestedLabel: `${Math.round(requestedBytes / 1024)} Ko`,
      flagsLabel: "IS_MMAPPED (M=1)",
    };
    return {
      ...state,
      nextChunkSeq: seq + 1,
      mmapBlocks: [...state.mmapBlocks, block],
      hazard: "none",
      logs: [
        `mmap(${block.requestedLabel}) -> ${mmapAddr} (hors tas brk, bit M=1).`,
        ...state.logs.slice(0, 5),
      ],
    };
  }

  const neededChunkSize = alignChunkSize(requestedBytes);
  const candidateIdx = state.chunks.findIndex(
    (c) => c.status === "free" && c.totalSize >= neededChunkSize,
  );

  if (candidateIdx === -1) {
    const metrics = computeHeapMetrics(state);
    const hasEnoughTotalButFragmented = metrics.totalFreeBytes >= neededChunkSize;
    return {
      ...state,
      hazard: hasEnoughTotalButFragmented ? "external-fragmentation" : state.hazard,
      logs: [
        hasEnoughTotalButFragmented
          ? `Échec malloc(${requestedBytes}) [chunk ${neededChunkSize} o] : ${metrics.totalFreeBytes} o libres au total mais plus grand bloc = ${metrics.largestContiguousFreeBytes} o (fragmentation externe).`
          : `Échec malloc(${requestedBytes}) : plus de place contiguë sur le tas simulé de 256 o.`,
        ...state.logs.slice(0, 5),
      ],
    };
  }

  const target = state.chunks[candidateIdx];
  if (!target) return state;

  const seq = state.nextChunkSeq;
  const allocatedId = `chunk-${seq}`;
  const varName = `${labelPrefix}_${seq}`;
  const allocatedChunk: HeapChunk = {
    id: allocatedId,
    offset: target.offset,
    totalSize: target.totalSize - neededChunkSize >= 32 ? neededChunkSize : target.totalSize,
    requestedSize: requestedBytes,
    headerHex: target.headerHex,
    prevInUse: target.prevInUse,
    label: varName,
    status: "allocated",
  };

  const remainderSize = target.totalSize - allocatedChunk.totalSize;
  const replacement: HeapChunk[] = [allocatedChunk];
  if (remainderSize >= 32) {
    replacement.push({
      id: `free-${seq}`,
      offset: target.offset + allocatedChunk.totalSize,
      totalSize: remainderSize,
      requestedSize: 0,
      headerHex: computeHeaderHex(remainderSize, true),
      prevInUse: true,
      label: "Libre",
      status: "free",
    });
  }

  const nextChunks = recomputeHeaders([
    ...state.chunks.slice(0, candidateIdx),
    ...replacement,
    ...state.chunks.slice(candidateIdx + 1),
  ]);

  const userAddr = formatAddr(allocatedChunk.offset + HEADER_SIZE);
  const nextRefs: StackPointerRef[] = [
    ...state.stackRefs,
    { varName, targetChunkId: allocatedId, targetAddr: userAddr, status: "valid" },
  ];

  return {
    ...state,
    nextChunkSeq: seq + 1,
    chunks: nextChunks,
    stackRefs: nextRefs,
    hazard: "none",
    logs: [
      `malloc(${requestedBytes}) -> ${userAddr} (${allocatedChunk.totalSize} o réels : 8 o en-tête + ${requestedBytes} o + ${allocatedChunk.totalSize - HEADER_SIZE - requestedBytes} o padding).`,
      ...state.logs.slice(0, 5),
    ],
  };
}

export function coalesceAdjacentFree(chunks: HeapChunk[]): HeapChunk[] {
  const merged: HeapChunk[] = [];
  for (const chunk of chunks) {
    const last = merged[merged.length - 1];
    if (last && last.status === "free" && chunk.status === "free") {
      merged[merged.length - 1] = {
        ...last,
        totalSize: last.totalSize + chunk.totalSize,
        label: "Libre (fusionné)",
      };
    } else {
      merged.push({ ...chunk });
    }
  }
  return recomputeHeaders(merged);
}

export function freeHeapChunk(state: HeapState, chunkId: string): HeapState {
  const idx = state.chunks.findIndex((c) => c.id === chunkId);
  if (idx === -1) return state;
  const target = state.chunks[idx];
  if (!target) return state;

  if (target.status === "free" || target.status === "double-free-corrupted") {
    const corrupted = state.chunks.map((c, i) =>
      i === idx ? { ...c, status: "double-free-corrupted" as const, label: "DOUBLE FREE !" } : c,
    );
    return {
      ...state,
      chunks: corrupted,
      hazard: "double-free",
      logs: [
        `ALERTE Double Free sur ${formatAddr(target.offset + HEADER_SIZE)} : la free-list / tcache est corrompue.`,
        ...state.logs.slice(0, 5),
      ],
    };
  }

  let nextChunks = state.chunks.map((c, i) =>
    i === idx ? { ...c, status: "free" as const, requestedSize: 0, label: "Libre" } : c,
  );
  if (state.coalescingEnabled) {
    nextChunks = coalesceAdjacentFree(nextChunks);
  } else {
    nextChunks = recomputeHeaders(nextChunks);
  }

  const nextRefs = state.stackRefs.map((ref) =>
    ref.targetChunkId === chunkId ? { ...ref, status: "dangling" as const } : ref,
  );

  return {
    ...state,
    chunks: nextChunks,
    stackRefs: nextRefs,
    hazard: "none",
    logs: [
      `free(${target.label}) à ${formatAddr(target.offset + HEADER_SIZE)}${state.coalescingEnabled ? " (fusion adjacente activée)" : " (sans fusion immédiate)"}.`,
      ...state.logs.slice(0, 5),
    ],
  };
}

export function toggleCoalescing(state: HeapState, enabled: boolean): HeapState {
  const nextChunks = enabled ? coalesceAdjacentFree(state.chunks) : state.chunks;
  return {
    ...state,
    coalescingEnabled: enabled,
    chunks: nextChunks,
    logs: [
      `Fusion automatique (Coalescing) ${enabled ? "activée" : "désactivée"}.`,
      ...state.logs.slice(0, 5),
    ],
  };
}

export function buildHeapPreset(preset: HeapPresetId): HeapState {
  let s = createInitialHeapState(true);
  if (preset === "healthy-cycle") {
    s = allocateFromHeap(s, 24, "nodeA");
    s = allocateFromHeap(s, 40, "nodeB");
    s = freeHeapChunk(s, "chunk-1");
    return s;
  }
  if (preset === "external-fragmentation") {
    s = allocateFromHeap(s, 24, "blkA");
    s = allocateFromHeap(s, 40, "blkB");
    s = allocateFromHeap(s, 24, "blkC");
    s = allocateFromHeap(s, 40, "blkD");
    s = freeHeapChunk(s, "chunk-1"); // 32B free
    s = freeHeapChunk(s, "chunk-3"); // 32B free separated by blkB (48B)
    return {
      ...s,
      hazard: "external-fragmentation",
      logs: [
        "blkA et blkC sont libérés (64 o + reste), mais blkB actif empêche leur fusion en un bloc contigu.",
        ...s.logs.slice(0, 4),
      ],
    };
  }
  if (preset === "leak-and-double-free") {
    s = allocateFromHeap(s, 24, "lost_ptr");
    s = allocateFromHeap(s, 24, "dup_ptr");
    s = {
      ...s,
      stackRefs: s.stackRefs.map((ref) =>
        ref.varName === "lost_ptr_1" ? { ...ref, status: "leaked" } : ref,
      ),
    };
    s = freeHeapChunk(s, "chunk-2");
    s = freeHeapChunk(s, "chunk-2"); // double free
    return {
      ...s,
      hazard: "leak",
      logs: [
        "lost_ptr_1 a perdu son pointeur sans free() (Fuite CWE-401) et dup_ptr_2 a subi un Double Free.",
        ...s.logs.slice(0, 4),
      ],
    };
  }

  // "use-after-free"
  s = allocateFromHeap(s, 24, "user");
  s = freeHeapChunk(s, "chunk-1");
  // Next allocation of same size reuses exact same offset 0!
  s = allocateFromHeap(s, 24, "admin");
  const uafAddr = formatAddr(HEADER_SIZE);
  const chunks = s.chunks.map((c) =>
    c.offset === 0 ? { ...c, status: "uaf-aliased" as const, label: "admin (ex-user !)" } : c,
  );
  return {
    ...s,
    chunks,
    stackRefs: [
      {
        varName: "user (obsolète)",
        targetChunkId: "chunk-2",
        targetAddr: uafAddr,
        status: "uaf-aliased",
      },
      {
        varName: "admin (nouveau)",
        targetChunkId: "chunk-2",
        targetAddr: uafAddr,
        status: "valid",
      },
    ],
    hazard: "uaf",
    logs: [
      `USE-AFTER-FREE (CWE-416) : free(user) puis malloc(24) pour admin réutilise ${uafAddr}. L'ancien pointeur user pointe sur admin !`,
      ...s.logs.slice(0, 4),
    ],
  };
}
