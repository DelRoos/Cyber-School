"use client";

import * as React from "react";
import gsap from "gsap";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Server,
  Smartphone,
} from "lucide-react";
import type { LessonManifest } from "@cyber-school/lesson-runtime";
import {
  ConceptTransformBanner,
  MotionStepPanel,
  getStepDuration,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
import { ExerciseCard } from "@cyber-school/exercises";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
  cn,
} from "@cyber-school/ui";

type TcpState = "CLOSED" | "LISTEN" | "SYN_SENT" | "SYN_RCVD" | "ESTABLISHED";

interface HandshakeFrame {
  id: string;
  manifestStepId?: string;
  label: string;
  title: string;
  explanation: string;
  clientState: TcpState;
  serverState: TcpState;
  clientSndNxt: string;
  clientRcvNxt: string;
  serverSndNxt: string;
  serverRcvNxt: string;
  packet: {
    direction: "none" | "c2s" | "s2c" | "lost-s2c";
    flags: string[];
    seq: number;
    ack: number | null;
    window: number;
    caption: string;
  } | null;
}

const NOMINAL_FRAMES: HandshakeFrame[] = [
  {
    id: "idle",
    manifestStepId: "step-idle-listen",
    label: "0. Initialisation",
    title: "État initial : le serveur écoute, le client est fermé",
    explanation:
      "Avant tout échange, le serveur exécute listen() sur le port TCP 443 et passe à l'état LISTEN. Le client (port éphémère 54321) est encore en CLOSED.",
    clientState: "CLOSED",
    serverState: "LISTEN",
    clientSndNxt: "—",
    clientRcvNxt: "—",
    serverSndNxt: "—",
    serverRcvNxt: "—",
    packet: null,
  },
  {
    id: "syn",
    manifestStepId: "step-syn",
    label: "1. SYN",
    title: "Étape 1 : le client envoie SYN et passe en SYN_SENT",
    explanation:
      "Le client choisit un numéro de séquence initial (ISN simplifié = 100), émet SYN (SEG.SEQ = 100) et passe en SYN_SENT. Comme SYN consomme 1 position de séquence, son prochain numéro à émettre (SND.NXT) vaut déjà 101.",
    clientState: "SYN_SENT",
    serverState: "LISTEN",
    clientSndNxt: "101 (ISN_c + 1)",
    clientRcvNxt: "—",
    serverSndNxt: "—",
    serverRcvNxt: "—",
    packet: {
      direction: "c2s",
      flags: ["SYN"],
      seq: 100,
      ack: null,
      window: 65535,
      caption: "En-tête émis : SYN · SEG.SEQ=100",
    },
  },
  {
    id: "syn-ack",
    manifestStepId: "step-syn-ack",
    label: "2. SYN-ACK",
    title: "Étape 2 : le serveur répond SYN-ACK et passe en SYN_RCVD",
    explanation:
      "À la réception du SYN(100), le serveur enregistre RCV.NXT = 101, passe en SYN_RCVD, choisit son propre ISN (300, d'où SND.NXT = 301) et émet SYN-ACK (SEG.SEQ = 300, SEG.ACK = 101).",
    clientState: "SYN_SENT",
    serverState: "SYN_RCVD",
    clientSndNxt: "101",
    clientRcvNxt: "—",
    serverSndNxt: "301 (ISN_s + 1)",
    serverRcvNxt: "101",
    packet: {
      direction: "s2c",
      flags: ["SYN", "ACK"],
      seq: 300,
      ack: 101,
      window: 65535,
      caption: "En-tête émis : SYN-ACK · SEG.SEQ=300, SEG.ACK=101",
    },
  },
  {
    id: "ack",
    manifestStepId: "step-ack",
    label: "3. ACK",
    title: "Étape 3 : le client reçoit SYN-ACK et émet ACK",
    explanation:
      "À la réception du SYN-ACK, le client passe en ESTABLISHED (RCV.NXT = 301) et émet le troisième segment ACK (SEG.SEQ = 101, SEG.ACK = 301). Le serveur reste en SYN_RCVD jusqu'à réception de cet ACK.",
    clientState: "ESTABLISHED",
    serverState: "SYN_RCVD",
    clientSndNxt: "101",
    clientRcvNxt: "301",
    serverSndNxt: "301",
    serverRcvNxt: "101",
    packet: {
      direction: "c2s",
      flags: ["ACK"],
      seq: 101,
      ack: 301,
      window: 65535,
      caption: "En-tête émis : ACK · SEG.SEQ=101, SEG.ACK=301",
    },
  },
  {
    id: "established",
    manifestStepId: "step-established",
    label: "4. ESTABLISHED",
    title: "Connexion établie des deux côtés (Full-Duplex)",
    explanation:
      "À la réception du ACK(301), le serveur passe lui aussi en ESTABLISHED. Les deux compteurs SND.NXT et RCV.NXT concordent : le transfert applicatif peut démarrer.",
    clientState: "ESTABLISHED",
    serverState: "ESTABLISHED",
    clientSndNxt: "101",
    clientRcvNxt: "301",
    serverSndNxt: "301",
    serverRcvNxt: "101",
    packet: null,
  },
];

const LOSS_FRAMES: HandshakeFrame[] = [
  NOMINAL_FRAMES[0]!,
  NOMINAL_FRAMES[1]!,
  {
    id: "syn-ack-lost",
    label: "2. SYN-ACK perdu",
    title: "Cas limite : le segment SYN-ACK est perdu sur le réseau",
    explanation:
      "Le serveur a traité le SYN (état semi-ouvert SYN_RCVD, RCV.NXT = 101, SND.NXT = 301), mais son SYN-ACK est perdu en transit. Le client reste bloqué en SYN_SENT.",
    clientState: "SYN_SENT",
    serverState: "SYN_RCVD",
    clientSndNxt: "101 (attente)",
    clientRcvNxt: "—",
    serverSndNxt: "301 (RTO actif)",
    serverRcvNxt: "101",
    packet: {
      direction: "lost-s2c",
      flags: ["SYN", "ACK"],
      seq: 300,
      ack: 101,
      window: 65535,
      caption: "SYN-ACK perdu en transit (SEG.SEQ=300, SEG.ACK=101)",
    },
  },
  {
    id: "rto-retransmit",
    label: "3. Retransmission",
    title: "Expiration du RTO serveur et réémission du SYN-ACK",
    explanation:
      "Faute de recevoir le 3e ACK attendu, le timer de retransmission (RTO) du serveur expire : il réémet le même SYN-ACK (SEG.SEQ = 300, SEG.ACK = 101). La perte précédente reste visible dans l'historique.",
    clientState: "SYN_SENT",
    serverState: "SYN_RCVD",
    clientSndNxt: "101",
    clientRcvNxt: "—",
    serverSndNxt: "301 (réémis)",
    serverRcvNxt: "101",
    packet: {
      direction: "s2c",
      flags: ["SYN", "ACK"],
      seq: 300,
      ack: 101,
      window: 65535,
      caption: "SYN-ACK retransmis : SEG.SEQ=300, SEG.ACK=101",
    },
  },
  NOMINAL_FRAMES[3]!,
  NOMINAL_FRAMES[4]!,
];

function stateBadgeVariant(state: TcpState): "outline" | "default" | "warning" | "success" {
  switch (state) {
    case "CLOSED":
      return "outline";
    case "LISTEN":
      return "default";
    case "SYN_SENT":
    case "SYN_RCVD":
      return "warning";
    case "ESTABLISHED":
      return "success";
  }
}

export interface TcpHandshakeSimulatorProps {
  lesson: LessonManifest;
}

export function TcpHandshakeSimulator({ lesson }: TcpHandshakeSimulatorProps) {
  const [simulateLoss, setSimulateLoss] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [exerciseScores, setExerciseScores] = React.useState<Record<string, boolean>>({});

  const reducedMotion = usePrefersReducedMotion();
  const diagramRef = React.useRef<HTMLDivElement>(null);
  const activeTweenRef = React.useRef<gsap.core.Tween | null>(null);

  const frames = simulateLoss ? LOSS_FRAMES : NOMINAL_FRAMES;
  const activeFrame = frames[stepIndex] ?? frames[0]!;
  const maxStep = frames.length - 1;
  const progressPercent = Math.round((stepIndex / maxStep) * 100);

  const linkedManifestStep = activeFrame.manifestStepId
    ? lesson.steps.find((s) => s.id === activeFrame.manifestStepId)
    : undefined;

  // Automatic playback timer
  React.useEffect(() => {
    if (!isPlaying || stepIndex >= maxStep) return;
    const timer = window.setTimeout(() => {
      const next = Math.min(maxStep, stepIndex + 1);
      setStepIndex(next);
      if (next >= maxStep) {
        setIsPlaying(false);
      }
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [isPlaying, maxStep, stepIndex]);

  // Pause/resume active GSAP tween cleanly alongside playback state
  React.useEffect(() => {
    const tween = activeTweenRef.current;
    if (!tween) return;
    if (isPlaying) {
      tween.resume();
    } else {
      // Only pause when user explicitly toggled pause mid-flight during auto-play
      // Manual step navigation plays once via useGsapScope below.
    }
  }, [isPlaying]);

  // GSAP deterministic animation for the active packet capsule in SVG
  useGsapScope(diagramRef, () => {
    activeTweenRef.current = null;
    const duration = getStepDuration(0.85, reducedMotion);
    const packetGroup = diagramRef.current?.querySelector("[data-gsap-packet]");
    if (!packetGroup || !activeFrame.packet) return;

    const { direction } = activeFrame.packet;
    const yPos =
      activeFrame.id === "syn"
        ? 18
        : activeFrame.id === "syn-ack-lost"
          ? 46
          : activeFrame.id === "syn-ack" || activeFrame.id === "rto-retransmit"
            ? 76
            : 106;

    if (direction === "c2s") {
      activeTweenRef.current = gsap.fromTo(
        packetGroup,
        { x: 64, y: yPos, opacity: 0.2 },
        { x: 348, y: yPos, opacity: 1, duration, ease: "power2.out" },
      );
    } else if (direction === "s2c") {
      activeTweenRef.current = gsap.fromTo(
        packetGroup,
        { x: 348, y: yPos, opacity: 0.2 },
        { x: 64, y: yPos, opacity: 1, duration, ease: "power2.out" },
      );
    } else if (direction === "lost-s2c") {
      activeTweenRef.current = gsap.fromTo(
        packetGroup,
        { x: 348, y: yPos, opacity: 1, scale: 1 },
        { x: 210, y: yPos, opacity: 0.4, scale: 0.92, duration, ease: "power2.in" },
      );
    }
  }, [stepIndex, simulateLoss, reducedMotion]);

  function goToStep(next: number) {
    setIsPlaying(false);
    setStepIndex(Math.max(0, Math.min(maxStep, next)));
  }

  function handleTogglePlay() {
    if (isPlaying) {
      setIsPlaying(false);
      activeTweenRef.current?.pause();
      return;
    }
    if (stepIndex >= maxStep) {
      setStepIndex(0);
      setIsPlaying(true);
      return;
    }
    activeTweenRef.current?.resume();
    setIsPlaying(true);
  }

  function handleReset() {
    setIsPlaying(false);
    setStepIndex(0);
  }

  function handleModeToggle() {
    setIsPlaying(false);
    setSimulateLoss((prev) => !prev);
    setStepIndex(0);
  }

  function handleRegionKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToStep(stepIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToStep(stepIndex - 1);
    }
  }

  function handleExerciseResult(exerciseId: string, correct: boolean | null) {
    setExerciseScores((prev) => {
      const next = { ...prev };
      if (correct === null) {
        delete next[exerciseId];
      } else {
        next[exerciseId] = correct;
      }
      return next;
    });
  }

  const solvedCount = Object.values(exerciseScores).filter(Boolean).length;
  const ackVisible = (!simulateLoss && stepIndex >= 3) || (simulateLoss && stepIndex >= 4);
  const synAckDeliveredVisible =
    (!simulateLoss && stepIndex >= 2) || (simulateLoss && stepIndex >= 3);

  return (
    <div className="space-y-8">
      <section
        aria-label="Simulateur interactif du Three-Way Handshake TCP"
        tabIndex={0}
        onKeyDown={handleRegionKeyDown}
        className="rounded-2xl border border-border bg-card p-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
      >
        {/* Top control bar */}
        <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={simulateLoss ? "warning" : "default"}>
                {simulateLoss
                  ? "Scénario cas limite : Perte SYN-ACK"
                  : "Scénario nominal (3 temps)"}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                Étape {stepIndex + 1} / {frames.length}
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              {linkedManifestStep ? linkedManifestStep.title : activeFrame.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={simulateLoss ? "secondary" : "outline"}
              size="sm"
              onClick={handleModeToggle}
              aria-pressed={simulateLoss}
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
              {simulateLoss ? "Revenir au mode nominal" : "Simuler perte du SYN-ACK"}
            </Button>
          </div>
        </div>

        {/* Interactive Diagram + State Machines */}
        <div className="mt-5 grid gap-4 lg:grid-cols-12" ref={diagramRef}>
          {/* Client state machine */}
          <div className="rounded-xl border border-border bg-secondary/40 p-4 lg:col-span-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-semibold text-sm">Client</span>
              </div>
              <Badge
                data-testid="client-tcp-state"
                variant={stateBadgeVariant(activeFrame.clientState)}
              >
                {activeFrame.clientState}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">192.0.2.10:54321</p>
            <Separator className="my-3" />
            <dl className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">SND.NXT</dt>
                <dd className="text-foreground text-right">{activeFrame.clientSndNxt}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">RCV.NXT</dt>
                <dd className="text-foreground text-right">{activeFrame.clientRcvNxt}</dd>
              </div>
            </dl>
          </div>

          {/* Animated network channel */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-background/80 p-4 lg:col-span-6">
            <ConceptTransformBanner
              stepKey={`${simulateLoss}-${activeFrame.id}`}
              cause={
                activeFrame.packet
                  ? `${activeFrame.packet.flags.join("+")} (seq=${activeFrame.packet.seq}${activeFrame.packet.ack !== null ? `, ack=${activeFrame.packet.ack}` : ""})`
                  : activeFrame.label
              }
              mechanism={activeFrame.packet?.caption ?? activeFrame.title}
              effectDelta={`${activeFrame.clientState} ↔ ${activeFrame.serverState}`}
              tone={
                activeFrame.packet?.direction === "lost-s2c"
                  ? "danger"
                  : activeFrame.clientState === "ESTABLISHED"
                    ? "success"
                    : "causal"
              }
              testId="tcp-transform-banner"
            />
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Client (:54321)</span>
              <span>Canal Réseau IP</span>
              <span>Serveur (:443)</span>
            </div>

            <div className="my-3">
              <svg
                viewBox="0 0 560 165"
                className="h-40 w-full overflow-visible"
                role="img"
                aria-label={`Diagramme réseau TCP : ${activeFrame.title}`}
              >
                <defs>
                  <marker
                    id="arrow-cyan"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#22d3ee" />
                  </marker>
                  <marker
                    id="arrow-amber"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                  <marker
                    id="arrow-emerald"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                  </marker>
                </defs>

                {/* Vertical lifelines */}
                <line
                  x1="50"
                  y1="10"
                  x2="50"
                  y2="155"
                  stroke="#1e2d47"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <line
                  x1="510"
                  y1="10"
                  x2="510"
                  y2="155"
                  stroke="#1e2d47"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Row 1: SYN (Client -> Server) */}
                {stepIndex >= 1 ? (
                  <g data-testid="diagram-row-syn">
                    <line
                      x1="56"
                      y1="26"
                      x2="500"
                      y2="34"
                      stroke="#22d3ee"
                      strokeOpacity={stepIndex === 1 ? 0.95 : 0.45}
                      strokeWidth="2"
                      markerEnd="url(#arrow-cyan)"
                    />
                    <text x="64" y="21" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      1. SYN (seq=100)
                    </text>
                  </g>
                ) : null}

                {/* Row 2 (Loss mode only): Lost SYN-ACK preserved permanently in history */}
                {simulateLoss && stepIndex >= 2 ? (
                  <g data-testid="diagram-row-lost-syn-ack">
                    <line
                      x1="504"
                      y1="56"
                      x2="285"
                      y2="62"
                      stroke="#f43f5e"
                      strokeOpacity={stepIndex === 2 ? 0.95 : 0.75}
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                    <text
                      x="265"
                      y="66"
                      textAnchor="middle"
                      fill="#fda4af"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      ✕ Perdu (SYN-ACK)
                    </text>
                  </g>
                ) : null}

                {/* Row 3: Delivered SYN-ACK (or Retransmitted SYN-ACK in loss mode) */}
                {synAckDeliveredVisible ? (
                  <g data-testid="diagram-row-syn-ack">
                    <line
                      x1="504"
                      y1="88"
                      x2="60"
                      y2="96"
                      stroke="#f59e0b"
                      strokeOpacity={
                        (!simulateLoss && stepIndex === 2) || (simulateLoss && stepIndex === 3)
                          ? 0.95
                          : 0.45
                      }
                      strokeWidth="2"
                      markerEnd="url(#arrow-amber)"
                    />
                    <text
                      x="496"
                      y="82"
                      textAnchor="end"
                      fill="#fbbf24"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {simulateLoss
                        ? "SYN-ACK retransmis (seq=300, ack=101)"
                        : "2. SYN-ACK (seq=300, ack=101)"}
                    </text>
                  </g>
                ) : null}

                {/* Row 4: Final ACK */}
                {ackVisible ? (
                  <g data-testid="diagram-row-ack">
                    <line
                      x1="56"
                      y1="120"
                      x2="500"
                      y2="128"
                      stroke="#10b981"
                      strokeOpacity={
                        (!simulateLoss && stepIndex === 3) || (simulateLoss && stepIndex === 4)
                          ? 0.95
                          : 0.5
                      }
                      strokeWidth="2"
                      markerEnd="url(#arrow-emerald)"
                    />
                    <text x="64" y="115" fill="#6ee7b7" fontSize="10" fontFamily="monospace">
                      3. ACK (seq=101, ack=301)
                    </text>
                  </g>
                ) : null}

                {/* In-flight animated packet capsule */}
                {activeFrame.packet ? (
                  <g data-gsap-packet transform="translate(64, 52)">
                    <rect
                      x="0"
                      y="0"
                      width="148"
                      height="28"
                      rx="8"
                      fill={
                        activeFrame.packet.direction === "lost-s2c"
                          ? "#4c0519"
                          : activeFrame.packet.direction === "s2c"
                            ? "#291d06"
                            : "#082936"
                      }
                      stroke={
                        activeFrame.packet.direction === "lost-s2c"
                          ? "#f43f5e"
                          : activeFrame.packet.direction === "s2c"
                            ? "#f59e0b"
                            : "#22d3ee"
                      }
                      strokeWidth="1.5"
                    />
                    <text
                      x="74"
                      y="18"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {activeFrame.packet.flags.join("+")} · seq={activeFrame.packet.seq}
                    </text>
                  </g>
                ) : (
                  <text
                    x="280"
                    y="150"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="12"
                    fontFamily="monospace"
                  >
                    {activeFrame.clientState === "ESTABLISHED"
                      ? "✓ Canal full-duplex prêt pour les données"
                      : "En attente d'ouverture de connexion (connect)"}
                  </text>
                )}
              </svg>
            </div>

            {/* Packet Header Breakdown */}
            <div className="rounded-lg border border-border bg-secondary/35 p-3 text-xs">
              {activeFrame.packet ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-primary">{activeFrame.packet.caption}</span>
                  <div className="flex flex-wrap gap-2 font-mono text-muted-foreground">
                    <span>Flags: [{activeFrame.packet.flags.join(", ")}]</span>
                    <span>SEG.SEQ={activeFrame.packet.seq}</span>
                    <span>SEG.ACK={activeFrame.packet.ack ?? "—"}</span>
                    <span>WIN={activeFrame.packet.window}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Aucun segment en transit à cette étape. Note : les ISN 100 et 300 sont simplifiés
                  (la RFC 6528 impose des entiers 32 bits pseudo-aléatoires en production).
                </p>
              )}
            </div>
          </div>

          {/* Server state machine */}
          <div className="rounded-xl border border-border bg-secondary/40 p-4 lg:col-span-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span className="font-semibold text-sm">Serveur</span>
              </div>
              <Badge
                data-testid="server-tcp-state"
                variant={stateBadgeVariant(activeFrame.serverState)}
              >
                {activeFrame.serverState}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">198.51.100.42:443</p>
            <Separator className="my-3" />
            <dl className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">SND.NXT</dt>
                <dd className="text-foreground text-right">{activeFrame.serverSndNxt}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">RCV.NXT</dt>
                <dd className="text-foreground text-right">{activeFrame.serverRcvNxt}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Synchronized explanation + ARIA live region */}
        <MotionStepPanel stepKey={`${simulateLoss}-${activeFrame.id}`} className="mt-4">
          <Alert variant={activeFrame.packet?.direction === "lost-s2c" ? "warning" : "info"}>
            <AlertTitle>{activeFrame.title}</AlertTitle>
            <AlertDescription>
              <p aria-live="polite">{activeFrame.explanation}</p>
            </AlertDescription>
          </Alert>
        </MotionStepPanel>

        {/* Playback Controls + Step Timeline */}
        <div className="mt-5 space-y-4">
          <Progress value={progressPercent} label="Progression du Three-Way Handshake" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToStep(stepIndex - 1)}
                disabled={stepIndex === 0}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Précédent
              </Button>

              <Button variant="default" size="sm" onClick={handleTogglePlay}>
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" aria-hidden="true" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Lecture auto
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToStep(stepIndex + 1)}
                disabled={stepIndex >= maxStep}
              >
                Suivant
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Réinitialiser
              </Button>
            </div>

            <span className="text-xs text-muted-foreground">
              Astuce clavier :{" "}
              <kbd className="rounded border border-border px-1.5 py-0.5 font-mono">←</kbd> /{" "}
              <kbd className="rounded border border-border px-1.5 py-0.5 font-mono">→</kbd> sur le
              simulateur · Minuterie pédagogique 2,2 s (distincte d&apos;un RTO RFC 6298)
            </span>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Accès direct aux étapes">
            {frames.map((frame, idx) => (
              <button
                key={frame.id}
                type="button"
                onClick={() => goToStep(idx)}
                aria-current={idx === stepIndex ? "step" : undefined}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                  idx === stepIndex
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {frame.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehension Exercises */}
      <section aria-labelledby="exercises-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="exercises-heading" className="text-xl font-semibold tracking-tight">
              Exercices de compréhension et de raisonnement
            </h2>
            <p className="text-sm text-muted-foreground">
              Vérifiez votre maîtrise de la synchronisation des numéros de séquence et des états
              TCP.
            </p>
          </div>
          <Badge
            data-testid="exercises-score-badge"
            variant={solvedCount === lesson.exercises.length ? "success" : "secondary"}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {solvedCount} / {lesson.exercises.length} validés
          </Badge>
        </div>

        <div className="grid gap-4">
          {lesson.exercises.map((exercise, idx) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={idx}
              onResult={handleExerciseResult}
            />
          ))}
        </div>
      </section>

      {/* Progressive Text Summary from Lesson Manifest */}
      <section aria-labelledby="summary-heading">
        <Card>
          <CardHeader>
            <CardTitle id="summary-heading" className="text-base">
              Le fil de la connexion, en résumé
            </CardTitle>
            <CardDescription>
              Retrouvez les messages dans l’ordre et ce que chaque machine sait à ce moment-là.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {lesson.steps.map((step) => (
                <li
                  key={step.id}
                  className="rounded-lg border border-border bg-secondary/25 px-3.5 py-2.5"
                >
                  <span className="font-medium text-foreground">{step.title} — </span>
                  <span className="text-muted-foreground">{step.summary}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
