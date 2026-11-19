import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Badge, Button, EditorialCallout, Progress, cn } from "../index.js";

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

  it("renders accessible EditorialCallout variants with explicit labels and titles", () => {
    render(
      <div>
        <EditorialCallout variant="information" title="Format simplifié">
          Chaque entrée affiche cinq champs normalisés.
        </EditorialCallout>
        <EditorialCallout variant="question" title="Le serveur voit-il le clavier ?">
          Non, il ne reçoit que des paramètres réseau.
        </EditorialCallout>
        <EditorialCallout variant="warning" title="Limites du modèle">
          Vérifiez la synchronisation horaire sur un parc réel.
        </EditorialCallout>
        <EditorialCallout variant="error" title="Conclusion hâtive">
          Ne qualifiez pas une trace brute d'attaque sans recoupement.
        </EditorialCallout>
      </div>,
    );

    expect(screen.getByRole("complementary", { name: "Repère : Format simplifié" })).toBeTruthy();
    expect(
      screen.getByRole("complementary", {
        name: "Question fréquente : Le serveur voit-il le clavier ?",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("complementary", { name: "Point de vigilance : Limites du modèle" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("complementary", { name: "Erreur fréquente : Conclusion hâtive" }),
    ).toBeTruthy();

    render(
      <EditorialCallout variant="question">Comment savoir sans titre superflu ?</EditorialCallout>,
    );
    expect(screen.getByRole("complementary", { name: "Question fréquente" })).toBeTruthy();
  });
});
