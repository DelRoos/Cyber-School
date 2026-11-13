---
id: TASK-010
title: Implémenter les simulateurs VIS-01 (CPU/Octets) et VIS-02 (Espace Virtuel/MMU/Segments)
status: Blocked
priority: P1
complexity: L
iteration: ITER-002
dependsOn: [TASK-002, TASK-009]
labels: [area:lesson, area:visualizations, area:systems-memory]
githubIssue: null
---

# TASK-010 — Simulateurs interactifs `VIS-01` et `VIS-02`

## Objectif

Construire les composants React/SVG interactifs et accessibles `VIS-01` et `VIS-02` dans `lessons/program-memory-fundamentals/components/` à partir des storyboards [03-STORYBOARDS_VISUELS.md](../../docs/courses/program-memory-fundamentals/03-STORYBOARDS_VISUELS.md) et des moteurs de `TASK-009`.

## Critères d'acceptation

- [ ] Flux animés CPU ↔ Bus ↔ RAM et MMU utilisant exclusivement `createGsapTimelineScope` (`@cyber-school/animations`) avec nettoyage propre.
- [ ] Bascule octets bruts ↔ `int32` little-endian et bascule Processus A / Isolation A+B / ASLR fonctionnelles.
- [ ] Navigation clavier complète (`Tab`, `ArrowLeft`/`Right`, `Space`/`Enter`), zone `aria-live="polite"`, double encodage non colorimétrique et support `prefers-reduced-motion`.
- [ ] Encarts « Ce que le simulateur simplifie » présents et fidèles à [06-RIGUEUR_SCIENTIFIQUE_ET_SOURCES.md](../../docs/courses/program-memory-fundamentals/06-RIGUEUR_SCIENTIFIQUE_ET_SOURCES.md).
