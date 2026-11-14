---
id: TASK-012
title: Implémenter VIS-04 (Tas/Chunks/Fragmentation/UAF) et VIS-05 (Manuel vs RAII vs GC)
status: Done
priority: P1
complexity: L
iteration: ITER-002
dependsOn: [TASK-002, TASK-009]
labels: [area:lesson, area:visualizations, area:systems-memory]
githubIssue: null
verificationRef: continuity/validation/2026-11-14T00-07-01-421Z-bdaff14d-1c89-47b7-8b93-f3d82e6faa36/result.json
---

# TASK-012 — Simulateurs interactifs `VIS-04` (Tas & Allocateur) et `VIS-05` (C / Rust / GC)

## Objectif

Construire dans `apps/web/src/lessons/program-memory-fundamentals/components/` les visualiseurs `VIS-04` (tas avec en-têtes `A|M|P`, free-list, coalescing activable, graphique SVG réactif de fragmentation interne/externe, Use-After-Free) et `VIS-05` (comparateur synchronisé C manuel vs Rust Ownership vs GC traçant).

## Critères d'acceptation

- [x] `VIS-04` affiche en-têtes/alignement, bascule `Coalescing ON/OFF`, allocation `mmap` des gros blocs, fuite/double-free/UAF et graphique SVG réactif de fragmentation (sans ajout de dépendance externe pour préserver `pnpm-lock.yaml`).
- [x] `VIS-05` synchronise les 3 pistes sur un curseur unique `t = 0..6` avec visualisation des _GC Roots_, graphique comparatif SVG et détection compile-time _Move_ sous Rust.
- [x] Respect de `prefers-reduced-motion`, navigation clavier (`ArrowLeft`/`Right`/`Home`) et responsive `375px`.
- [x] Zéro saisie de code libre exigée de l'apprenant.
