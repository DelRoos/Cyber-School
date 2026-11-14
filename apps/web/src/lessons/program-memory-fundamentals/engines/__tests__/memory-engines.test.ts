import { describe, expect, it } from "vitest";
import { getCpuSteps, toLittleEndianBytes32 } from "../cpu-memory.js";
import { getProcessSegments, simulateMemoryAccess } from "../virtual-memory.js";
import { getCallStackSteps } from "../call-stack.js";
import {
  alignChunkSize,
  allocateFromHeap,
  buildHeapPreset,
  computeHeapMetrics,
  createInitialHeapState,
  freeHeapChunk,
  toggleCoalescing,
} from "../heap-allocator.js";
import { getModelComparisonTimeline } from "../memory-models.js";

describe("Program Memory deterministic simulation engines (VIS-01..05)", () => {
  it("VIS-01 encodes 32-bit integers into x86-64 little-endian bytes without swapping nibbles", () => {
    expect(toLittleEndianBytes32("0x12345678")).toEqual(["78", "56", "34", "12"]);
    expect(toLittleEndianBytes32("0xAABBCCDD")).toEqual(["DD", "CC", "BB", "AA"]);

    const steps = getCpuSteps("little-endian-write", "0x12345678");
    const execStep = steps.find((s) => s.phase === "EXECUTE" && s.busDirection === "data-write");
    expect(execStep?.memoryBytes["0x1008"]).toBe("78");
    expect(execStep?.memoryBytes["0x1009"]).toBe("56");
    expect(execStep?.memoryBytes["0x100A"]).toBe("34");
    expect(execStep?.memoryBytes["0x100B"]).toBe("12");
  });

  it("VIS-02 isolates identical virtual addresses between P1 and P2 and blocks writes to Text", () => {
    const p1Read = simulateMemoryAccess("read-text", "P1", false);
    const p2Read = simulateMemoryAccess("read-text", "P2", false);
    expect(p1Read.virtualAddr).toBe(p2Read.virtualAddr);
    expect(p1Read.physicalFrame).not.toBe(p2Read.physicalFrame);

    const writeFault = simulateMemoryAccess("write-text", "P1", false);
    expect(writeFault.outcome).toBe("sigsegv_permission_denied");
    expect(writeFault.physicalFrame).toBeNull();

    const segFixed = getProcessSegments("P1", false);
    const segAslr = getProcessSegments("P1", true);
    expect(segFixed[0]?.virtualRange).not.toBe(segAslr[0]?.virtualRange);
  });

  it("VIS-03 grows stack toward lower addresses, preserves residual bytes after RET and traps dangling overwrites", () => {
    const nested = getCallStackSteps("nested-calls");
    expect(Number.parseInt(nested[1]!.rsp, 16)).toBeLessThan(Number.parseInt(nested[0]!.rsp, 16));
    const probeStep = nested[nested.length - 1]!;
    expect(probeStep.slots.some((s) => s.status === "freed-residual")).toBe(true);

    const dangling = getCallStackSteps("dangling-pointer");
    expect(dangling[1]?.hazard).toBe("dangling-read");
    expect(dangling[2]?.hazard).toBe("dangling-overwritten");

    const overflow = getCallStackSteps("stack-overflow", 5);
    expect(overflow[overflow.length - 1]?.hazard).toBe("stack-overflow");
  });

  it("VIS-04 tracks chunk alignment, external fragmentation, coalescing and Use-After-Free", () => {
    expect(alignChunkSize(20)).toBe(32); // 8B header + 20B + 4B padding -> 32B aligned
    let heap = createInitialHeapState(true);
    heap = allocateFromHeap(heap, 16, "a");
    heap = allocateFromHeap(heap, 16, "b");
    expect(heap.chunks[0]?.totalSize).toBe(32);

    const fragmented = buildHeapPreset("external-fragmentation");
    const metrics = computeHeapMetrics(fragmented);
    expect(metrics.totalFreeBytes).toBeGreaterThanOrEqual(48);
    expect(metrics.externalFragmentationPercent).toBeGreaterThan(0);

    // Without coalescing, freeing adjacent blocks leaves two separate chunks
    let noMerge = createInitialHeapState(false);
    noMerge = allocateFromHeap(noMerge, 24, "x");
    noMerge = allocateFromHeap(noMerge, 24, "y");
    noMerge = freeHeapChunk(noMerge, "chunk-1");
    noMerge = freeHeapChunk(noMerge, "chunk-2");
    expect(noMerge.chunks.filter((c) => c.status === "free").length).toBeGreaterThan(1);

    const merged = toggleCoalescing(noMerge, true);
    expect(merged.chunks.filter((c) => c.status === "free").length).toBe(1);

    const uaf = buildHeapPreset("use-after-free");
    expect(uaf.hazard).toBe("uaf");
    expect(uaf.stackRefs.some((r) => r.status === "uaf-aliased")).toBe(true);
  });

  it("VIS-05 synchronizes manual C, Rust ownership and GC timelines according to GC frequency", () => {
    const aggressive = getModelComparisonTimeline("forgotten-free-or-cycle", "aggressive");
    const lazy = getModelComparisonTimeline("forgotten-free-or-cycle", "lazy");

    // At t=4 aggressive GC collects while lazy still holds dead cycle in RAM
    expect(aggressive[4]?.tracks[2].statusBadge).toBe("freed");
    expect(lazy[4]?.tracks[2].statusBadge).toBe("gc-pending");

    const move = getModelComparisonTimeline("use-after-move", "aggressive");
    expect(move[5]?.tracks[0].statusBadge).toBe("uaf-risk");
    expect(move[5]?.tracks[1].statusBadge).toBe("compile-blocked");
  });
});
