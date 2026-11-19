import { describe, expect, it } from "vitest";
import {
  CONTEXT_MODE_ORDER,
  DEFAULT_OBSERVATION_INPUT,
  UPSTREAM_CAUSES,
  evaluateObservationWorkbench,
  type SimulatedUpstreamCause,
} from "../observation-model.js";

describe("observation-model deterministic invariants", () => {
  it("Invariant 1 (Sensor Blindness): changing simulatedCause never alters the 5 fields of the sshd log entries", () => {
    const baseline = evaluateObservationWorkbench(DEFAULT_OBSERVATION_INPUT);
    expect(baseline.initialLog.recordedEntryCount).toBe(3);
    expect(baseline.initialLog.timeSpanSeconds).toBe(7);
    expect(baseline.initialLog.recordedFieldCount).toBe(5);
    expect(baseline.initialLog.differencesInNonTimestampFields).toBe(0);
    expect(baseline.initialLog.containsHumanIdentityOrMotive).toBe(false);

    for (const cause of UPSTREAM_CAUSES) {
      const state = evaluateObservationWorkbench({
        ...DEFAULT_OBSERVATION_INPUT,
        simulatedCause: cause.id,
      });
      expect(state.initialLog.entries).toEqual(baseline.initialLog.entries);
      expect(state.initialLog.differencesInNonTimestampFields).toBe(0);
      expect(state.initialLog.containsHumanIdentityOrMotive).toBe(false);
      for (const entry of state.initialLog.entries) {
        expect(entry.service).toBe("sshd");
        expect(entry.event).toBe("AUTH_FAILURE");
        expect(entry.account).toBe("c.moreau");
        expect(entry.sourceIp).toBe("10.24.8.19");
      }
    }
  });

  it("Invariant 2 (Hypothesis Funnel): compatibleHypothesesCount decreases deterministically as sources are added", () => {
    const sshdOnly = evaluateObservationWorkbench({
      ...DEFAULT_OBSERVATION_INPUT,
      contextMode: "sshd-only",
    });
    expect(sshdOnly.activeSourcesCount).toBe(1);
    expect(sshdOnly.compatibleHypothesesCount).toBe(3);
    expect(sshdOnly.compatibleHypothesisIds).toEqual([
      "h1-human-typo",
      "h2-scheduled-script-old-password",
      "h3-unauthorized-lateral",
    ]);
    expect(sshdOnly.corroboratedHypothesisId).toBeNull();

    const withInventory = evaluateObservationWorkbench({
      ...DEFAULT_OBSERVATION_INPUT,
      contextMode: "with-inventory",
    });
    expect(withInventory.activeSourcesCount).toBe(2);
    expect(withInventory.compatibleHypothesesCount).toBe(2);
    expect(withInventory.compatibleHypothesisIds).toEqual([
      "h2-scheduled-script-old-password",
      "h3-unauthorized-lateral",
    ]);
    expect(withInventory.corroboratedHypothesisId).toBeNull();

    const withBackupLog = evaluateObservationWorkbench({
      ...DEFAULT_OBSERVATION_INPUT,
      contextMode: "with-inventory-and-backup-log",
    });
    expect(withBackupLog.activeSourcesCount).toBe(3);
    expect(withBackupLog.compatibleHypothesesCount).toBe(1);
    expect(withBackupLog.compatibleHypothesisIds).toEqual(["h2-scheduled-script-old-password"]);
    expect(withBackupLog.corroboratedHypothesisId).toBe("h2-scheduled-script-old-password");

    const withShellLog = evaluateObservationWorkbench({
      ...DEFAULT_OBSERVATION_INPUT,
      contextMode: "with-inventory-and-interactive-shell",
    });
    expect(withShellLog.activeSourcesCount).toBe(3);
    expect(withShellLog.compatibleHypothesesCount).toBe(1);
    expect(withShellLog.compatibleHypothesisIds).toEqual(["h3-unauthorized-lateral"]);
    expect(withShellLog.corroboratedHypothesisId).toBe("h3-unauthorized-lateral");
  });

  it("Invariant 3 (Verdict & Overclaim Truth Table): claimedAsEstablishedFact always produces a distinct verdict and unsupportedClaimCount across Cases A, B, C, and D", () => {
    // Case A: selectedHypothesisId === "none"
    const caseAUnclaimed = evaluateObservationWorkbench({
      simulatedCause: "h1-human-typo",
      contextMode: "sshd-only",
      selectedHypothesisId: "none",
      claimedAsEstablishedFact: false,
    });
    expect(caseAUnclaimed.verdict).toBe("observing");
    expect(caseAUnclaimed.unsupportedClaimCount).toBe(0);

    const caseAClaimed = evaluateObservationWorkbench({
      simulatedCause: "h1-human-typo",
      contextMode: "sshd-only",
      selectedHypothesisId: "none",
      claimedAsEstablishedFact: true,
    });
    expect(caseAClaimed.verdict).toBe("no-hypothesis-selected");
    expect(caseAClaimed.unsupportedClaimCount).toBe(1);

    // Case B: selectedHypothesisId is contradicted by active sources
    const caseBUnclaimed = evaluateObservationWorkbench({
      simulatedCause: "h1-human-typo",
      contextMode: "with-inventory",
      selectedHypothesisId: "h1-human-typo",
      claimedAsEstablishedFact: false,
    });
    expect(caseBUnclaimed.verdict).toBe("contradicted-hypothesis");
    expect(caseBUnclaimed.unsupportedClaimCount).toBe(0);

    const caseBClaimed = evaluateObservationWorkbench({
      simulatedCause: "h1-human-typo",
      contextMode: "with-inventory",
      selectedHypothesisId: "h1-human-typo",
      claimedAsEstablishedFact: true,
    });
    expect(caseBClaimed.verdict).toBe("contradicted-claim");
    expect(caseBClaimed.unsupportedClaimCount).toBe(1);

    // Case C: selectedHypothesisId is compatible, but compatibleHypothesesCount > 1
    const caseCUnclaimed = evaluateObservationWorkbench({
      simulatedCause: "h3-unauthorized-lateral",
      contextMode: "sshd-only",
      selectedHypothesisId: "h3-unauthorized-lateral",
      claimedAsEstablishedFact: false,
    });
    expect(caseCUnclaimed.verdict).toBe("unverified-hypothesis");
    expect(caseCUnclaimed.unsupportedClaimCount).toBe(0);

    const caseCClaimed = evaluateObservationWorkbench({
      simulatedCause: "h3-unauthorized-lateral",
      contextMode: "sshd-only",
      selectedHypothesisId: "h3-unauthorized-lateral",
      claimedAsEstablishedFact: true,
    });
    expect(caseCClaimed.verdict).toBe("premature-conclusion");
    expect(caseCClaimed.unsupportedClaimCount).toBe(1);

    // Case D: selectedHypothesisId === corroboratedHypothesisId and compatibleHypothesesCount === 1
    const caseDUnclaimed = evaluateObservationWorkbench({
      simulatedCause: "h2-scheduled-script-old-password",
      contextMode: "with-inventory-and-backup-log",
      selectedHypothesisId: "h2-scheduled-script-old-password",
      claimedAsEstablishedFact: false,
    });
    expect(caseDUnclaimed.verdict).toBe("corroborated-with-limits");
    expect(caseDUnclaimed.unsupportedClaimCount).toBe(0);

    const caseDClaimed = evaluateObservationWorkbench({
      simulatedCause: "h2-scheduled-script-old-password",
      contextMode: "with-inventory-and-backup-log",
      selectedHypothesisId: "h2-scheduled-script-old-password",
      claimedAsEstablishedFact: true,
    });
    expect(caseDClaimed.verdict).toBe("overclaimed-certainty");
    expect(caseDClaimed.unsupportedClaimCount).toBe(1);

    // Exhaustive check across all 4 context modes x 4 selectedHypothesisIds
    const hypotheses: ReadonlyArray<"none" | SimulatedUpstreamCause> = [
      "none",
      "h1-human-typo",
      "h2-scheduled-script-old-password",
      "h3-unauthorized-lateral",
    ];
    for (const mode of CONTEXT_MODE_ORDER) {
      for (const hyp of hypotheses) {
        const falseState = evaluateObservationWorkbench({
          simulatedCause: "h1-human-typo",
          contextMode: mode,
          selectedHypothesisId: hyp,
          claimedAsEstablishedFact: false,
        });
        const trueState = evaluateObservationWorkbench({
          simulatedCause: "h1-human-typo",
          contextMode: mode,
          selectedHypothesisId: hyp,
          claimedAsEstablishedFact: true,
        });
        expect(falseState.unsupportedClaimCount).toBe(0);
        expect(trueState.unsupportedClaimCount).toBe(1);
        expect(falseState.verdict).not.toBe(trueState.verdict);
      }
    }
  });
});
