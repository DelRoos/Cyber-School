import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExerciseDefinition } from "@cyber-school/lesson-runtime";
import { ExerciseCard } from "../index.js";

afterEach(() => {
  cleanup();
});

const choiceExercise: ExerciseDefinition = {
  kind: "state-prediction",
  id: "ex-predict-ack",
  conceptId: "tcp-three-way-handshake",
  prompt: "Quel numéro d'acquittement (ack) le serveur envoie-t-il dans le SYN-ACK ?",
  scenario: "Client envoie SYN avec seq = 100. Serveur choisit ISN = 300.",
  hint: "TCP acquitte le prochain octet attendu.",
  explanation: "Le drapeau SYN consomme 1 numéro de séquence virtuel : ack = 100 + 1 = 101.",
  options: [
    {
      id: "100",
      label: "ack = 100",
      feedback: "Un segment SYN consomme 1 numéro de séquence logique, donc 100 est déjà reçu.",
    },
    {
      id: "101",
      label: "ack = 101",
      feedback: "Exact : le serveur confirme la réception du SYN (100) et attend le numéro 101.",
    },
  ],
  correctOptionId: "101",
};

const orderExercise: ExerciseDefinition = {
  kind: "sequence-order",
  id: "ex-order",
  conceptId: "tcp-three-way-handshake",
  prompt: "Ordonne les étapes d'ouverture d'une connexion TCP.",
  explanation: "SYN -> SYN-ACK -> ACK.",
  items: [
    { id: "syn-ack", label: "Serveur -> Client : SYN-ACK" },
    { id: "syn", label: "Client -> Serveur : SYN" },
    { id: "ack", label: "Client -> Serveur : ACK" },
  ],
  expectedOrder: ["syn", "syn-ack", "ack"],
};

describe("@cyber-school/exercises", () => {
  it("evaluates native radio choice exercise and invalidates score on option change or reset", () => {
    const onResult = vi.fn();
    render(<ExerciseCard exercise={choiceExercise} index={0} onResult={onResult} />);

    const wrongRadio = screen.getByRole("radio", { name: "ack = 100" });
    const rightRadio = screen.getByRole("radio", { name: "ack = 101" });

    fireEvent.click(wrongRadio);
    fireEvent.click(screen.getByRole("button", { name: "Vérifier ma réponse" }));
    expect(screen.getByText("Pas encore — analysons pourquoi")).toBeTruthy();
    expect(onResult).toHaveBeenLastCalledWith("ex-predict-ack", false);

    // Changing selection after submission notifies parent with null
    fireEvent.click(rightRadio);
    expect(onResult).toHaveBeenLastCalledWith("ex-predict-ack", null);

    fireEvent.click(screen.getByRole("button", { name: "Vérifier ma réponse" }));
    expect(screen.getByText("Raisonnement exact")).toBeTruthy();
    expect(onResult).toHaveBeenLastCalledWith("ex-predict-ack", true);

    // Resetting notifies parent with null
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onResult).toHaveBeenLastCalledWith("ex-predict-ack", null);
  });

  it("supports reordering and invalidates prior score when order changes", () => {
    const onResult = vi.fn();
    render(<ExerciseCard exercise={orderExercise} index={1} onResult={onResult} />);

    fireEvent.click(screen.getByRole("button", { name: "Monter Client -> Serveur : SYN" }));
    fireEvent.click(screen.getByRole("button", { name: "Vérifier ma réponse" }));

    expect(screen.getByText("Raisonnement exact")).toBeTruthy();
    expect(onResult).toHaveBeenLastCalledWith("ex-order", true);

    // Changing order after submission notifies parent with null
    fireEvent.click(screen.getByRole("button", { name: "Descendre Client -> Serveur : SYN" }));
    expect(onResult).toHaveBeenLastCalledWith("ex-order", null);
  });
});
