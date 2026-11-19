"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, Binary, Cpu, Minus, Network, Plus, ShieldCheck } from "lucide-react";
import {
  MotionStepPanel,
  getStepDuration,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";

type LabTabId = "memory" | "tcp" | "mmu";

const TCP_PREVIEW_STEPS = [
  {
    id: "syn",
    label: "1. SYN",
    direction: "right",
    badge: "Client vers Serveur",
    clientState: "SYN_SENT",
    serverState: "LISTEN",
    seq: "100",
    ack: "—",
    summary: "Le client envoie un numéro de séquence initial (100) pour ouvrir la synchronisation.",
  },
  {
    id: "syn-ack",
    label: "2. SYN-ACK",
    direction: "left",
    badge: "Serveur vers Client",
    clientState: "SYN_SENT",
    serverState: "SYN_RCVD",
    seq: "300",
    ack: "101",
    summary:
      "Le serveur acquitte 100 en attendant 101, et propose son propre numéro de séquence (300).",
  },
  {
    id: "ack",
    label: "3. ACK",
    direction: "right",
    badge: "Client vers Serveur",
    clientState: "ESTABLISHED",
    serverState: "ESTABLISHED",
    seq: "101",
    ack: "301",
    summary:
      "Le client confirme 301 : la connexion bidirectionnelle est prête à transporter des données.",
  },
] as const;

export function HeroLabWorkbench() {
  const workbenchRef = React.useRef<HTMLDivElement>(null);
  const hasInteractedRef = React.useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  const [activeTab, setActiveTab] = React.useState<LabTabId>("memory");

  // Tab 1: Memory & Byte interactive model
  const [value, setValue] = React.useState(42);
  const bits = React.useMemo(() => value.toString(2).padStart(8, "0").split(""), [value]);
  const hexValue = `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
  const asciiDisplay =
    value >= 33 && value <= 126
      ? `'${String.fromCharCode(value)}'`
      : value === 32
        ? "'espace'"
        : "contrôle";
  const activeWeights = React.useMemo(
    () =>
      bits
        .map((bit, i) => (bit === "1" ? 2 ** (7 - i) : null))
        .filter((weight): weight is number => weight !== null),
    [bits],
  );

  function updateValue(updater: (prev: number) => number) {
    hasInteractedRef.current = true;
    setValue(updater);
  }

  function toggleBit(index: number) {
    hasInteractedRef.current = true;
    const mask = 1 << (7 - index);
    setValue((prev) => prev ^ mask);
  }

  // Tab 2: TCP handshake micro-preview
  const [tcpStepIndex, setTcpStepIndex] = React.useState(0);
  const tcpStep = TCP_PREVIEW_STEPS[tcpStepIndex] ?? TCP_PREVIEW_STEPS[0];

  // Tab 3: MMU permissions micro-preview
  const [allowWrite, setAllowWrite] = React.useState(false);
  const [allowExec, setAllowExec] = React.useState(false);
  const [mmuAction, setMmuAction] = React.useState<"read" | "write" | "exec">("write");

  const mmuAllowed =
    mmuAction === "read" ||
    (mmuAction === "write" && allowWrite) ||
    (mmuAction === "exec" && allowExec);

  // Micro-animation when byte value changes after interaction
  useGsapScope(workbenchRef, () => {
    if (reducedMotion || !hasInteractedRef.current || activeTab !== "memory") return;
    gsap.fromTo(
      "[data-byte-output]",
      { scale: 1.09 },
      {
        scale: 1,
        duration: getStepDuration(0.24, reducedMotion),
        ease: "back.out(2)",
        clearProps: "transform",
      },
    );
    gsap.fromTo(
      ".bit-cell.is-one",
      { y: -3 },
      {
        y: 0,
        duration: getStepDuration(0.22, reducedMotion),
        stagger: 0.015,
        ease: "power2.out",
        clearProps: "transform",
      },
    );
  }, [value, activeTab, reducedMotion]);

  // Micro-animation when TCP step changes
  useGsapScope(workbenchRef, () => {
    if (reducedMotion || activeTab !== "tcp") return;
    const startX = tcpStep.direction === "right" ? -32 : 32;
    gsap.fromTo(
      "[data-tcp-packet]",
      { x: startX, opacity: 0.2 },
      {
        x: 0,
        opacity: 1,
        duration: getStepDuration(0.32, reducedMotion),
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }, [tcpStepIndex, activeTab, tcpStep.direction, reducedMotion]);

  // Micro-animation when MMU verdict changes
  useGsapScope(workbenchRef, () => {
    if (reducedMotion || activeTab !== "mmu") return;
    if (mmuAllowed) {
      gsap.fromTo(
        "[data-mmu-verdict]",
        { scale: 0.97 },
        {
          scale: 1,
          duration: getStepDuration(0.22, reducedMotion),
          ease: "power2.out",
          clearProps: "transform",
        },
      );
    } else {
      gsap.fromTo(
        "[data-mmu-verdict]",
        { x: -5 },
        {
          x: 0,
          duration: getStepDuration(0.28, reducedMotion),
          ease: "elastic.out(1.2, 0.4)",
          clearProps: "transform",
        },
      );
    }
  }, [mmuAllowed, mmuAction, allowWrite, allowExec, activeTab, reducedMotion]);

  return (
    <div
      ref={workbenchRef}
      className="hero-workbench spotlight-surface"
      aria-label="Simulateur interactif : explorer octets, paquets réseau et droits mémoire"
    >
      <div className="workbench-beam" aria-hidden="true" />
      <div className="workbench-header">
        <div className="workbench-tabs" role="tablist" aria-label="Choisir une micro-expérience">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "memory"}
            onClick={() => setActiveTab("memory")}
            className={activeTab === "memory" ? "workbench-tab is-active" : "workbench-tab"}
          >
            <Binary size={14} aria-hidden="true" />
            Octet & bits
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tcp"}
            onClick={() => setActiveTab("tcp")}
            className={activeTab === "tcp" ? "workbench-tab is-active" : "workbench-tab"}
          >
            <Network size={14} aria-hidden="true" />
            Paquet TCP
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "mmu"}
            onClick={() => setActiveTab("mmu")}
            className={activeTab === "mmu" ? "workbench-tab is-active" : "workbench-tab"}
          >
            <ShieldCheck size={14} aria-hidden="true" />
            Garde CPU
          </button>
        </div>
        <span className="workbench-status">
          <span className="signal-dot" aria-hidden="true" />
          Interactif
        </span>
      </div>

      <MotionStepPanel stepKey={activeTab}>
        {activeTab === "memory" && (
          <div className="workbench-body">
            <div className="experiment-question">
              Comment la machine stocke-t-elle <strong>{value}</strong> à l&apos;adresse{" "}
              <code>0x1000</code> ?
            </div>

            <div className="experiment-value">
              <button
                type="button"
                onClick={() => updateValue((v) => Math.max(0, v - 1))}
                disabled={value === 0}
                aria-label="Diminuer le nombre"
              >
                <Minus size={18} aria-hidden="true" />
              </button>
              <output aria-live="polite" data-byte-output>
                {value}
                <span>valeur décimale</span>
              </output>
              <button
                type="button"
                onClick={() => updateValue((v) => Math.min(255, v + 1))}
                disabled={value === 255}
                aria-label="Augmenter le nombre"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="workbench-telemetry" aria-label="Représentations équivalentes">
              <div>
                <span>Hexadécimal</span>
                <strong>{hexValue}</strong>
              </div>
              <div>
                <span>Binaire</span>
                <strong>{bits.join("")}</strong>
              </div>
              <div>
                <span>ASCII</span>
                <strong>{asciiDisplay}</strong>
              </div>
            </div>

            <div className="bit-grid" aria-label={`${value} en binaire : ${bits.join("")}`}>
              {bits.map((bit, i) => {
                const weight = 2 ** (7 - i);
                return (
                  <button
                    key={weight}
                    type="button"
                    onClick={() => toggleBit(i)}
                    aria-pressed={bit === "1"}
                    aria-label={`Basculer le bit de poids ${weight} (actuellement ${bit})`}
                    className={bit === "1" ? "bit-cell is-one" : "bit-cell"}
                  >
                    <span className="bit-weight">{weight}</span>
                    <span>{bit}</span>
                  </button>
                );
              })}
            </div>

            <div className="memory-formula">
              <span>
                {activeWeights.length > 0 ? `${activeWeights.join(" + ")} = ${value}` : "0 = 0"}
              </span>
              <span>RAM [0x1000] = {hexValue}</span>
            </div>

            <div className="workbench-presets">
              {[0, 42, 65, 255].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateValue(() => preset)}
                  className={value === preset ? "preset-pill is-active" : "preset-pill"}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tcp" && (
          <div className="workbench-body">
            <div className="experiment-question">
              Comment deux machines se synchronisent en <strong>3 messages</strong> ?
            </div>

            <div className="tcp-mini-stage">
              <div className="tcp-endpoint">
                <span className="tcp-role">Client</span>
                <strong className="tcp-state-pill">{tcpStep.clientState}</strong>
              </div>
              <div className="tcp-wire">
                <span className="tcp-direction">{tcpStep.badge}</span>
                <div className="tcp-packet-badge" data-tcp-packet>
                  {tcpStep.label.replace(/^\d+\.\s*/, "")} · SEQ {tcpStep.seq}
                  {tcpStep.ack !== "—" ? ` · ACK ${tcpStep.ack}` : ""}
                </div>
                <svg
                  className="tcp-arrow-svg"
                  viewBox="0 0 180 18"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="6"
                    y1="9"
                    x2="174"
                    y2="9"
                    stroke="#5b829d"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {tcpStep.direction === "right" ? (
                    <polyline
                      points="166,4 174,9 166,14"
                      fill="none"
                      stroke="#a9c7fa"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <polyline
                      points="14,4 6,9 14,14"
                      fill="none"
                      stroke="#a9c7fa"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
              <div className="tcp-endpoint">
                <span className="tcp-role">Serveur</span>
                <strong className="tcp-state-pill">{tcpStep.serverState}</strong>
              </div>
            </div>

            <p className="workbench-note">{tcpStep.summary}</p>

            <div className="workbench-step-bar">
              {TCP_PREVIEW_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setTcpStepIndex(index)}
                  className={tcpStepIndex === index ? "preset-pill is-active" : "preset-pill"}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "mmu" && (
          <div className="workbench-body">
            <div className="experiment-question">
              Que décide le processeur face à une <strong>page mémoire protégée</strong> ?
            </div>

            <div className="mmu-gates">
              <span className="mmu-gate is-on">R = 1</span>
              <button
                type="button"
                onClick={() => setAllowWrite((v) => !v)}
                aria-pressed={allowWrite}
                className={allowWrite ? "mmu-gate is-on" : "mmu-gate"}
              >
                W = {allowWrite ? "1" : "0"}
              </button>
              <button
                type="button"
                onClick={() => setAllowExec((v) => !v)}
                aria-pressed={allowExec}
                className={allowExec ? "mmu-gate is-on" : "mmu-gate"}
              >
                X = {allowExec ? "1" : "0"}
              </button>
            </div>

            <p className="mmu-legend">
              Lecture active (R) · Écriture (W) · Exécution (X) — cliquez W ou X pour changer les
              droits
            </p>

            <div className="mmu-actions" role="group" aria-label="Choisir une opération CPU">
              {[
                { id: "read" as const, label: "Lire octet" },
                { id: "write" as const, label: "Écrire 0x90" },
                { id: "exec" as const, label: "Exécuter" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMmuAction(item.id)}
                  className={mmuAction === item.id ? "preset-pill is-active" : "preset-pill"}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              className={mmuAllowed ? "mmu-verdict is-ok" : "mmu-verdict is-trap"}
              role="status"
              data-mmu-verdict
            >
              <Cpu size={16} aria-hidden="true" />
              <div>
                <strong>{mmuAllowed ? "Accès autorisé par la MMU" : "TRAP CPU · SIGSEGV"}</strong>
                <p>
                  {mmuAllowed
                    ? "Les bits de permission correspondent à l'opération demandée."
                    : mmuAction === "write"
                      ? "Impossible d'écrire quand W=0 : la zone reste en lecture seule."
                      : "Impossible d'exécuter une zone où X=0 (protection NX contre l'injection de code)."}
                </p>
              </div>
            </div>
          </div>
        )}
      </MotionStepPanel>

      <div className="workbench-footer">
        <span>
          {activeTab === "memory"
            ? "Chapitre 1 du cours Mémoire"
            : activeTab === "tcp"
              ? "Cours Réseau et protocole TCP"
              : "Chapitre 2 : Pagination et droits"}
        </span>
        <Link
          href={
            activeTab === "tcp"
              ? "/parcours/v4-tronc-commun#noeud-TC-03"
              : "/parcours/v4-tronc-commun#noeud-TC-01"
          }
          className="workbench-link"
        >
          Voir dans le parcours <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
