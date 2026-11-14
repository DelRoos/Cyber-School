import { describe, expect, it } from "vitest";
import {
  CAUSAL_STAGES,
  COUNTEREXAMPLE_CONDITIONS,
  evaluateCounterexample,
} from "../causal-reasoning";

describe("causal-reasoning deterministic engine (TC-00)", () => {
  it("models 4 progressive stages from raw observation to controlled do(X) intervention", () => {
    expect(CAUSAL_STAGES).toHaveLength(4);
    expect(CAUSAL_STAGES[0]?.confounderVisible).toBe(false);
    expect(CAUSAL_STAGES[2]?.activeEdges).toEqual(["Z->X", "Z->Y"]);
    expect(CAUSAL_STAGES[3]?.interventionApplied).toBe(true);
    expect(CAUSAL_STAGES[3]?.sshAlertsPerHour).toBeGreaterThan(400);
    expect(CAUSAL_STAGES[3]?.controlledCausalEffectPct).toBe(0);
  });

  it("distinguishes non-falsified, non-minimal, and minimal counterexamples", () => {
    expect(COUNTEREXAMPLE_CONDITIONS).toHaveLength(3);

    const none = evaluateCounterexample([]);
    expect(none.falsified).toBe(false);
    expect(none.isMinimal).toBe(false);

    const noisy = evaluateCounterexample(["firefox-linux", "low-latency"]);
    expect(noisy.falsified).toBe(false);
    expect(noisy.redundantIds).toEqual(["firefox-linux", "low-latency"]);

    const minimal = evaluateCounterexample(["public-healthz"]);
    expect(minimal.falsified).toBe(true);
    expect(minimal.isMinimal).toBe(true);
    expect(minimal.redundantIds).toEqual([]);

    const nonMinimal = evaluateCounterexample(["public-healthz", "firefox-linux"]);
    expect(nonMinimal.falsified).toBe(true);
    expect(nonMinimal.isMinimal).toBe(false);
    expect(nonMinimal.redundantIds).toEqual(["firefox-linux"]);
  });
});
