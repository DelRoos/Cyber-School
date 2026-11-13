import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Badge, Button, Progress, cn } from "../index.js";

afterEach(() => {
  cleanup();
});

describe("@cyber-school/ui", () => {
  it("merges Tailwind classes via cn", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("renders accessible button and progress bar", () => {
    render(
      <div>
        <Button variant="default">Suivant</Button>
        <Badge variant="success">ESTABLISHED</Badge>
        <Progress value={66} label="Avancement du handshake" />
      </div>,
    );

    expect(screen.getByRole("button", { name: "Suivant" })).toBeTruthy();
    expect(screen.getByText("ESTABLISHED")).toBeTruthy();
    const progress = screen.getByRole("progressbar", {
      name: "Avancement du handshake",
    });
    expect(progress.getAttribute("aria-valuenow")).toBe("66");
  });
});
