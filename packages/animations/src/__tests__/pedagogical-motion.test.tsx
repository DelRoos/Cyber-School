import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConceptTransformBanner } from "../pedagogical-motion.js";
import { getStepDuration } from "../reduced-motion.js";

describe("@cyber-school/animations pedagogical primitives", () => {
  it("renders contiguous cause -> mechanism -> delta callout with accessible status", () => {
    render(
      <ConceptTransformBanner
        stepKey="intervention"
        cause="do(X = OFF)"
        mechanism="Z continue de déclencher Y directement"
        effectDelta="Y : 410 → 408 alertes/h"
        tone="success"
      />,
    );

    const banner = screen.getByTestId("concept-transform-banner");
    expect(banner.getAttribute("role")).toBe("status");
    expect(banner.textContent).toContain("PREUVE");
    expect(banner.textContent).toContain("do(X = OFF)");
    expect(banner.textContent).toContain("Y : 410 → 408 alertes/h");
  });

  it("forces zero duration when prefers-reduced-motion is active", () => {
    expect(getStepDuration(0.55, true)).toBe(0);
    expect(getStepDuration(0.55, false)).toBe(0.55);
  });
});
