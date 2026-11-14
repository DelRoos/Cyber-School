---
id: TASK-020
title: Renforcer les animations pédagogiques causales (CTML), ajouter le skill pedagogical-animation et documenter
status: Done
verificationRef: continuity/validation/2026-11-14T08-55-49-910Z-00601fe0-731b-488d-8b3d-3fa6f19324ce/result.json
priority: P0
complexity: M
iteration: ITER-002
dependsOn: [TASK-019]
labels: [area:lesson, area:visualizations, area:agents, area:qa]
githubIssue: null
---

# TASK-020 — Animations pédagogiques causales, skill `pedagogical-animation` et documentation CTML

## Objectif

Transformer les animations et schémas visuels afin qu'ils montrent physiquement la mécanique interne de chaque concept (signalisation, contiguïté spatiale/temporelle, segmenting et manipulation directe), enrichir les compétences multi-agents et documenter les motifs cognitifs fondés sur la recherche (Mayer CTML & Bret Victor Explorable Explanations).

## Critères d'acceptation

- [x] Nouveau skill `.agents/skills/pedagogical-animation/SKILL.md` + `references/ctml-explorable-patterns.md` créés et synchronisés octet pour octet vers `.claude/skills/pedagogical-animation/`.
- [x] Documentation mise à jour (`docs/design/PEDAGOGICAL_ANIMATION_PLAYBOOK.md`, `docs/standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md`, `docs/standards/COURSE_AUTHORING.md`, `docs/agents/SKILL_ROUTING.md`, `docs/agents/AGENT_GUIDE.md`, `docs/agents/ROLES.md`, skills `visual-explanation` et `gsap-animation`).
- [x] Primitives partagées `ConceptTransformBanner` et `animateSvgSignalRoutes` ajoutées et testées dans `@cyber-school/animations`.
- [x] Simulateurs `VIS-01` & `VIS-02` (`scientific-reasoning-and-proof`), `VIS-01..05` (`program-memory-fundamentals`) et `TcpHandshakeSimulator` mis à niveau avec visualisation causale directe et tests complets exécutés sous `quality:verify`.
