"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, BookOpen, Clock3, Layers, Sparkles } from "lucide-react";
import {
  getStepDuration,
  MotionStepPanel,
  useGsapScope,
  usePrefersReducedMotion,
} from "@cyber-school/animations";
import type {
  BespokeParcoursPageData,
  ParcoursTopologyKind,
  TopologyEdgeView,
  TopologyNodeView,
} from "@/lib/parcours/parcours-pages";

export interface ParcoursTopologyGraphProps {
  page: BespokeParcoursPageData;
  selectedNodeId: string;
  onSelectNode: (nodeId: string, options?: { syncAudio?: boolean }) => void;
  onInspectInProgram?: (nodeId: string) => void;
  calibratorHighlightedNodeIds?: string[];
  audioPlayingNodeId?: string;
}

function buildCubicPath(
  from: TopologyNodeView,
  to: TopologyNodeView,
  kind: ParcoursTopologyKind,
): { d: string; labelX: number; labelY: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (kind === "mission-loop" && Math.abs(dx) < 80) {
    const cx = from.x + (dx >= 0 ? 110 : -110);
    return {
      d: `M ${from.x} ${from.y} C ${cx} ${from.y}, ${cx} ${to.y}, ${to.x} ${to.y}`,
      labelX: (from.x + to.x) / 2 + (dx >= 0 ? 52 : -52),
      labelY: (from.y + to.y) / 2,
    };
  }

  if (kind === "dual-convergence" || kind === "ascension-pipeline") {
    const c1x = from.x + dx * 0.48;
    const c2x = to.x - dx * 0.48;
    return {
      d: `M ${from.x} ${from.y} C ${c1x} ${from.y}, ${c2x} ${to.y}, ${to.x} ${to.y}`,
      labelX: (from.x + to.x) / 2,
      labelY: (from.y + to.y) / 2 - 12,
    };
  }

  const bend = Math.abs(dy) < 28 ? -32 : dy * 0.16;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 + bend;
  return {
    d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
    labelX: cx,
    labelY: cy - 8,
  };
}

function stageKindLabel(kind: TopologyNodeView["stageKind"]): string {
  if (kind === "fondation") return "Socle";
  if (kind === "coeur") return "Cœur";
  return "Pointe";
}

function topologyBadgeLabel(kind: ParcoursTopologyKind): string {
  switch (kind) {
    case "ascension-pipeline":
      return "Pipeline ascendant";
    case "trust-chain":
      return "Chaîne de confiance";
    case "dual-convergence":
      return "Double convergence";
    case "evidence-timeline":
      return "Timeline de preuve";
    case "mission-loop":
      return "Boucle opérationnelle";
    case "constellation":
      return "Constellation de synthèse";
  }
}

export function ParcoursTopologyGraph({
  page,
  selectedNodeId,
  onSelectNode,
  onInspectInProgram,
  calibratorHighlightedNodeIds = [],
  audioPlayingNodeId,
}: ParcoursTopologyGraphProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, TopologyNodeView>();
    for (const node of page.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [page.nodes]);

  const activeNode = nodeMap.get(selectedNodeId) ?? page.nodes[0];
  const calibratorSet = React.useMemo(
    () => new Set(calibratorHighlightedNodeIds),
    [calibratorHighlightedNodeIds],
  );

  const relatedIds = React.useMemo(() => {
    const upstream = new Set<string>();
    const downstream = new Set<string>();
    if (!activeNode) return { upstream, downstream };
    for (const edge of page.edges) {
      if (edge.toId === activeNode.id) upstream.add(edge.fromId);
      if (edge.fromId === activeNode.id) downstream.add(edge.toId);
    }
    return { upstream, downstream };
  }, [activeNode, page.edges]);

  const activeEdges = React.useMemo(() => {
    if (!activeNode) return [];
    return page.edges.filter(
      (edge) => edge.fromId === activeNode.id || edge.toId === activeNode.id,
    );
  }, [activeNode, page.edges]);

  useGsapScope(stageRef, () => {
    if (!activeNode) return;
    const duration = getStepDuration(0.36, reducedMotion);

    gsap.fromTo(
      "[data-topo-node='active'] .topo-halo-ring",
      { scale: reducedMotion ? 1 : 0.84, opacity: 0.4 },
      {
        scale: 1,
        opacity: 1,
        duration,
        ease: "power2.out",
        transformOrigin: "50% 50%",
      },
    );

    const pulses = gsap.utils.toArray<SVGElement>("[data-topo-edge-active='true'] .topo-pulse");
    for (const pulse of pulses) {
      const edgeId = pulse.getAttribute("data-edge-id");
      const pathEl = edgeId
        ? (stageRef.current?.querySelector(`#path-${edgeId}`) as SVGGeometryElement | null)
        : null;
      if (!pathEl || typeof pathEl.getTotalLength !== "function") continue;

      const length = pathEl.getTotalLength();
      if (reducedMotion) {
        const mid = pathEl.getPointAtLength(length * 0.52);
        gsap.set(pulse, { attr: { cx: mid.x, cy: mid.y }, opacity: 0.9 });
        continue;
      }

      const proxy = { t: 0 };
      gsap.to(proxy, {
        t: 1,
        duration: 1.9,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          const pt = pathEl.getPointAtLength(proxy.t * length);
          pulse.setAttribute("cx", pt.x.toFixed(1));
          pulse.setAttribute("cy", pt.y.toFixed(1));
          pulse.setAttribute("opacity", proxy.t > 0.08 && proxy.t < 0.92 ? "0.95" : "0.25");
        },
      });
    }
  }, [selectedNodeId, reducedMotion, page.slug]);

  if (!activeNode) return null;

  return (
    <section
      id="parcours-carte"
      aria-labelledby="parcours-carte-heading"
      className="parcours-studio-section"
      data-testid="parcours-topology-section"
    >
      <div className="parcours-section-head">
        <div>
          <p className="parcours-eyebrow">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Topologie interactive · {topologyBadgeLabel(page.topologyKind)}</span>
          </p>
          <h2 id="parcours-carte-heading" className="parcours-section-title">
            Carte causale des modules et dépendances
          </h2>
          <p className="parcours-section-lead">{page.topologyCaption}</p>
        </div>

        <Link href="/parcours" className="parcours-ghost-link">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span>Retrouver la carte des parcours</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div ref={stageRef} className="parcours-topology-shell">
        <div className="parcours-topology-canvas-card">
          <div className="parcours-canvas-toolbar">
            <span className="parcours-canvas-legend-group">
              <span className="parcours-legend-dot is-active" />
              <span>Module inspecté</span>
              <span className="parcours-legend-dot is-upstream" />
              <span>Prérequis direct</span>
              <span className="parcours-legend-dot is-downstream" />
              <span>Débloque</span>
            </span>
            {audioPlayingNodeId ? (
              <span className="parcours-audio-sync-pill" data-testid="topology-audio-badge">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                <span>Audio synchronisé actif</span>
              </span>
            ) : null}
          </div>

          <div className="parcours-svg-scrollwrap">
            <svg
              viewBox={`0 0 ${page.viewBoxWidth} ${page.viewBoxHeight}`}
              role="img"
              aria-label={`Graphe topologique du parcours ${page.title}`}
              className="parcours-topology-svg"
              data-testid="parcours-topology-svg"
            >
              <defs>
                <pattern
                  id={`grid-${page.slug}`}
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="rgba(200, 237, 151, 0.05)"
                    strokeWidth="1"
                  />
                </pattern>
                <radialGradient id={`glow-${page.slug}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(200, 237, 151, 0.28)" />
                  <stop offset="100%" stopColor="rgba(200, 237, 151, 0)" />
                </radialGradient>
                <marker
                  id={`arrow-${page.slug}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="rgba(200, 237, 151, 0.85)" />
                </marker>
                <marker
                  id={`arrow-muted-${page.slug}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 2 L 8 5 L 0 8 z" fill="rgba(162, 175, 164, 0.35)" />
                </marker>
              </defs>

              <rect
                x="0"
                y="0"
                width={page.viewBoxWidth}
                height={page.viewBoxHeight}
                rx="16"
                fill="#0b0e0d"
              />
              <rect
                x="0"
                y="0"
                width={page.viewBoxWidth}
                height={page.viewBoxHeight}
                rx="16"
                fill={`url(#grid-${page.slug})`}
              />

              {/* Topology backdrop geometry unique per Parcours */}
              <TopologyBackdrop
                kind={page.topologyKind}
                width={page.viewBoxWidth}
                height={page.viewBoxHeight}
              />

              {/* Ambient glow behind active node */}
              <circle
                cx={activeNode.x}
                cy={activeNode.y}
                r="105"
                fill={`url(#glow-${page.slug})`}
                pointerEvents="none"
              />

              {/* Causal Edges */}
              {page.edges.map((edge: TopologyEdgeView) => {
                const from = nodeMap.get(edge.fromId);
                const to = nodeMap.get(edge.toId);
                if (!from || !to) return null;

                const isConnected = edge.fromId === activeNode.id || edge.toId === activeNode.id;
                const geom = buildCubicPath(from, to, page.topologyKind);
                const safeId = edge.id.replace(/[^a-zA-Z0-9_-]/g, "_");

                return (
                  <g key={edge.id} data-topo-edge-active={isConnected ? "true" : "false"}>
                    <path
                      id={`path-${safeId}`}
                      d={geom.d}
                      fill="none"
                      stroke={
                        isConnected ? "rgba(200, 237, 151, 0.72)" : "rgba(162, 175, 164, 0.22)"
                      }
                      strokeWidth={isConnected ? 2.4 : 1.5}
                      strokeDasharray={isConnected ? undefined : "5 5"}
                      markerEnd={
                        isConnected ? `url(#arrow-${page.slug})` : `url(#arrow-muted-${page.slug})`
                      }
                    />
                    {isConnected ? (
                      <>
                        <circle
                          className="topo-pulse"
                          data-edge-id={safeId}
                          cx={from.x}
                          cy={from.y}
                          r="4.2"
                          fill="#c8ed97"
                          opacity="0"
                          pointerEvents="none"
                        />
                        <g
                          transform={`translate(${geom.labelX}, ${geom.labelY})`}
                          pointerEvents="none"
                        >
                          <rect
                            x="-56"
                            y="-11"
                            width="112"
                            height="20"
                            rx="10"
                            fill="#141a16"
                            stroke="rgba(200, 237, 151, 0.45)"
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            y="3"
                            fill="#c8ed97"
                            fontSize="9.5"
                            fontFamily="var(--font-mono), monospace"
                          >
                            {edge.signalLabel.slice(0, 18)}
                          </text>
                        </g>
                      </>
                    ) : null}
                  </g>
                );
              })}

              {/* Interactive Topology Nodes */}
              {page.nodes.map((node) => {
                const isActive = node.id === activeNode.id;
                const isUpstream = relatedIds.upstream.has(node.id);
                const isDownstream = relatedIds.downstream.has(node.id);
                const isAudioMatched = audioPlayingNodeId === node.id;
                const isCalibratorRecommended = calibratorSet.has(node.id);
                const hasOpen = Boolean(node.openLessonSlug);

                const strokeColor = isActive
                  ? "#c8ed97"
                  : isAudioMatched
                    ? "#facc15"
                    : isUpstream
                      ? "rgba(52, 211, 153, 0.78)"
                      : isDownstream
                        ? "rgba(200, 237, 151, 0.55)"
                        : isCalibratorRecommended
                          ? "rgba(251, 191, 36, 0.85)"
                          : "rgba(162, 175, 164, 0.34)";

                const fillColor = isActive
                  ? "#1c261e"
                  : isUpstream || isDownstream
                    ? "#171d1a"
                    : "#131715";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    aria-label={`${node.title} — ${node.durationLabel}`}
                    data-testid={`topology-node-${node.id}`}
                    data-topo-node={isActive ? "active" : "idle"}
                    onClick={() => onSelectNode(node.id, { syncAudio: true })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectNode(node.id, { syncAudio: true });
                      }
                    }}
                    className="parcours-svg-node-group"
                  >
                    {isActive || isAudioMatched ? (
                      <rect
                        className="topo-halo-ring"
                        x="-80"
                        y="-34"
                        width="160"
                        height="68"
                        rx="18"
                        fill="none"
                        stroke={
                          isAudioMatched && !isActive ? "#facc15" : "rgba(200, 237, 151, 0.42)"
                        }
                        strokeWidth="1.5"
                      />
                    ) : null}

                    <rect
                      x="-74"
                      y="-28"
                      width="148"
                      height="56"
                      rx="14"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isActive ? 2.2 : 1.3}
                    />

                    {/* Top badge line */}
                    <text
                      x="-62"
                      y="-10"
                      fill={isActive ? "#c8ed97" : "#a2afa4"}
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {`${String(node.order).padStart(2, "0")} · ${stageKindLabel(node.stageKind)}`}
                    </text>

                    {/* Open dot or duration on top right */}
                    <circle cx="58" cy="-13" r="3.5" fill={hasOpen ? "#10b981" : "#64748b"} />

                    {/* Main Node Title */}
                    <text x="-62" y="7" fill="#f0f1e9" fontSize="12.5" fontWeight="700">
                      {node.shortLabel}
                    </text>

                    {/* Bottom module id + lesson count */}
                    <text
                      x="-62"
                      y="21"
                      fill="#a2afa4"
                      fontSize="9.5"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {`${node.id} · ${node.microLessonsCount} leçons`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Mobile / Quick direct step rail */}
          <div className="parcours-node-pills" role="list" aria-label="Accès rapide aux nœuds">
            {page.nodes.map((node) => {
              const isSelected = node.id === activeNode.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  role="listitem"
                  onClick={() => onSelectNode(node.id, { syncAudio: true })}
                  className={`parcours-node-pill ${isSelected ? "is-selected" : ""}`}
                >
                  <span className="parcours-node-pill-num">
                    {String(node.order).padStart(2, "0")}
                  </span>
                  <span>{node.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spatial Module Inspector directly coupled to active node */}
        <aside
          className="parcours-inspector-card"
          aria-label="Inspecteur du module actif"
          data-testid="parcours-node-inspector"
        >
          <MotionStepPanel stepKey={activeNode.id}>
            <div className="parcours-inspector-inner">
              <div className="parcours-inspector-meta">
                <span className="parcours-stage-tag">
                  Étape {String(activeNode.order).padStart(2, "0")} ·{" "}
                  {stageKindLabel(activeNode.stageKind)}
                </span>
                <span className="parcours-duration-tag">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeNode.microLessonsCount} leçons
                </span>
              </div>

              <h3 className="parcours-inspector-title" data-testid="inspector-node-title">
                {activeNode.title}
              </h3>

              <p className="parcours-inspector-question">
                <strong>Déclic visé :</strong> {activeNode.mechanicalQuestion}
              </p>

              <p className="parcours-inspector-summary">{activeNode.summary}</p>

              {/* Active causal flows */}
              {activeEdges.length > 0 ? (
                <div className="parcours-flow-strip">
                  {activeEdges.map((edge) => {
                    const isIncoming = edge.toId === activeNode.id;
                    const peer = nodeMap.get(isIncoming ? edge.fromId : edge.toId);
                    if (!peer) return null;
                    return (
                      <button
                        key={edge.id}
                        type="button"
                        onClick={() => onSelectNode(peer.id, { syncAudio: true })}
                        className="parcours-flow-chip"
                      >
                        <span className="parcours-flow-dir">
                          {isIncoming ? "← Reçoit de" : "→ Débloque"}
                        </span>
                        <span className="font-semibold text-foreground">{peer.shortLabel}</span>
                        <span className="parcours-flow-signal">{edge.signalLabel}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {/* Real V4 lessons preview for this module */}
              <div className="parcours-chapters-box">
                <div className="parcours-chapters-head">
                  <span>Aperçu des leçons ({activeNode.microLessonsCount})</span>
                  <span>{activeNode.id}</span>
                </div>
                <ul className="parcours-chapters-list">
                  {activeNode.microLessons.slice(0, 5).map((lessonItem, lessonIdx) => (
                    <li key={lessonItem.id} className="parcours-chapter-row">
                      <div className="min-w-0">
                        <div className="parcours-chapter-title">
                          {String(lessonIdx + 1).padStart(2, "0")} · {lessonItem.title}
                        </div>
                      </div>
                      <span className="parcours-chapter-planned">Leçon</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Competencies */}
              <ul className="parcours-competency-chips">
                {activeNode.competencies.map((comp) => (
                  <li key={comp}>{comp}</li>
                ))}
              </ul>

              {/* External prerequisite bridge or direct program jump */}
              <div className="parcours-inspector-actions">
                {onInspectInProgram ? (
                  <button
                    type="button"
                    onClick={() => onInspectInProgram(activeNode.id)}
                    className="parcours-primary-btn"
                    data-testid="inspector-open-module-btn"
                  >
                    <span>Voir les {activeNode.microLessonsCount} leçons du module</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
                {activeNode.externalDeps[0] ? (
                  <Link href={activeNode.externalDeps[0].href} className="parcours-secondary-btn">
                    <span>Revoir prérequis : {activeNode.externalDeps[0].label}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </div>
          </MotionStepPanel>
        </aside>
      </div>
    </section>
  );
}

function TopologyBackdrop({
  kind,
  width,
  height,
}: {
  kind: ParcoursTopologyKind;
  width: number;
  height: number;
}) {
  if (kind === "ascension-pipeline") {
    return (
      <g pointerEvents="none" stroke="rgba(200, 237, 151, 0.1)" strokeDasharray="3 6">
        <line x1="40" y1="265" x2={width - 40} y2="265" />
        <line x1="40" y1="175" x2={width - 40} y2="175" />
        <line x1="40" y1="90" x2={width - 40} y2="90" />
        <text x="22" y="255" fill="rgba(162, 175, 164, 0.38)" fontSize="9" stroke="none">
          COUCHE MATÉRIEL
        </text>
        <text x="22" y="166" fill="rgba(162, 175, 164, 0.38)" fontSize="9" stroke="none">
          NOYAU & MÉMOIRE
        </text>
        <text x="22" y="82" fill="rgba(162, 175, 164, 0.38)" fontSize="9" stroke="none">
          RÉSEAU & RUNTIME
        </text>
      </g>
    );
  }

  if (kind === "trust-chain") {
    return (
      <g pointerEvents="none" stroke="rgba(200, 237, 151, 0.12)" fill="none">
        <ellipse cx="440" cy="172" rx="340" ry="125" strokeDasharray="6 6" />
        <text
          x="440"
          y="34"
          textAnchor="middle"
          fill="rgba(162, 175, 164, 0.42)"
          fontSize="9.5"
          stroke="none"
        >
          CHAÎNE DE CONFIANCE : BIT → SIGNATURE → SESSION → POLITIQUE
        </text>
      </g>
    );
  }

  if (kind === "dual-convergence") {
    return (
      <g pointerEvents="none" stroke="rgba(200, 237, 151, 0.1)" fill="none">
        <rect x="30" y="38" width={width - 60} height="122" rx="14" strokeDasharray="4 6" />
        <rect x="30" y="182" width={width - 60} height="122" rx="14" strokeDasharray="4 6" />
        <text x="48" y="55" fill="rgba(162, 175, 164, 0.42)" fontSize="9" stroke="none">
          VOIE A · SERVEURS, API & IDENTITÉ WEB
        </text>
        <text x="48" y="200" fill="rgba(162, 175, 164, 0.42)" fontSize="9" stroke="none">
          VOIE B · BINAIRES, SYSTÈME & DIAGNOSTIC
        </text>
      </g>
    );
  }

  if (kind === "evidence-timeline") {
    return (
      <g pointerEvents="none" stroke="rgba(200, 237, 151, 0.12)" fill="none">
        <line x1="65" y1="172" x2={width - 65} y2="172" strokeWidth="1.5" strokeDasharray="2 5" />
        <text
          x="440"
          y="318"
          textAnchor="middle"
          fill="rgba(162, 175, 164, 0.42)"
          fontSize="9.5"
          stroke="none"
        >
          TIMELINE FORENSIQUE : COLLECTE → MÉMOIRE → LOGS → CONTRADÉTECTION
        </text>
      </g>
    );
  }

  if (kind === "mission-loop") {
    return (
      <g pointerEvents="none" stroke="rgba(200, 237, 151, 0.14)" fill="none">
        <ellipse cx="440" cy="172" rx="285" ry="118" strokeDasharray="5 5" />
        <text
          x="440"
          y="176"
          textAnchor="middle"
          fill="rgba(200, 237, 151, 0.4)"
          fontSize="10"
          stroke="none"
        >
          BOUCLE OPÉRATIONNELLE · RECON → PREUVE → DURCISSEMENT
        </text>
      </g>
    );
  }

  return (
    <g pointerEvents="none" stroke="rgba(200, 237, 151, 0.12)" fill="none">
      <circle cx={width / 2} cy={height / 2} r="132" strokeDasharray="4 6" />
      <circle cx={width / 2} cy={height / 2} r="72" strokeDasharray="2 6" />
      <text
        x={width / 2}
        y="30"
        textAnchor="middle"
        fill="rgba(162, 175, 164, 0.42)"
        fontSize="9.5"
        stroke="none"
      >
        CONSTELLATION TRANSVERSALE · COMPLÉMENTS À LA CARTE
      </text>
    </g>
  );
}
