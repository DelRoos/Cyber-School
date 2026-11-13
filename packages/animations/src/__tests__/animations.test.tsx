import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MotionStepPanel, getStepDuration, usePrefersReducedMotion } from "../index.js";

function ReducedMotionProbe() {
  const reduced = usePrefersReducedMotion();
  return <span data-testid="reduced-state">{reduced ? "reduce" : "no-preference"}</span>;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("@cyber-school/animations", () => {
  it("computes deterministic step durations for normal and reduced motion", () => {
    expect(getStepDuration(0.8, false)).toBe(0.8);
    expect(getStepDuration(0.8, true)).toBe(0);
    expect(getStepDuration(-1, false)).toBe(0);
  });

  it("reads prefers-reduced-motion immediately via useSyncExternalStore", () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal("matchMedia", matchMediaMock);

    render(<ReducedMotionProbe />);
    expect(screen.getByTestId("reduced-state").textContent).toBe("reduce");
  });

  it("renders MotionStepPanel children", () => {
    render(
      <MotionStepPanel stepKey="syn">
        <span>SYN Segment Active</span>
      </MotionStepPanel>,
    );
    expect(screen.getByText("SYN Segment Active")).toBeTruthy();
  });
});
