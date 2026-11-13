---
id: TASK-012
title: Implémenter VIS-04 (Tas/Chunks/Fragmentation/UAF) et VIS-05 (Manuel vs RAII vs GC)
status: Blocked
priority: P1
complexity: L
iteration: ITER-002
dependsOn: [TASK-002, TASK-009]
labels: [area:lesson, area:visualizations, area:systems-memory]
githubIssue: null
---

# TASK-012 — Simulateurs interactifs `VIS-04` (Tas & Allocateur) et `VIS-05` (C / Rust / GC)

## Objectif

Construire dans `lessons/program-memory-fundamentals/components/` les visualiseurs `VIS-04` (tas avec en-têtes `A|M|P`, free-list, coalescing activable, jauge D3 de fragmentation interne/externe, Use-After-Free) et `VIS-05` (comparateur synchronisé C manuel vs Rust Ownership vs GC traçant).

## Critères d'acceptation

- [ ] `VIS-04` affiche en-têtes/alignement, bascule `Coalescing ON/OFF`, allocation `mmap` des gros blocs, fuite/double-free/UAF et graphique D3 de fragmentation.
- [ ] `VIS-05` synchronise les 3 pistes sur un curseur unique `t = 0..6` avec visualisation des _GC Roots_ et de la détection compile-time _Move_ sous Rust.
- [ ] Respect de `createGsapTimelineScope`, `prefers-reduced-motion`, navigation clavier et responsive `375px`.
- [ ] Zéro saisie de code libre exigée de l'apprenant.
