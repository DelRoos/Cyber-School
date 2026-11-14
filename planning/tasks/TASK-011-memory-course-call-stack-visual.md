---
id: TASK-011
title: Implémenter le simulateur VIS-03 (Pile d'appels, RSP/RBP, ABI & Pointeurs pendants)
status: Done
priority: P1
complexity: L
iteration: ITER-002
dependsOn: [TASK-002, TASK-009]
labels: [area:lesson, area:visualizations, area:systems-memory]
githubIssue: null
verificationRef: continuity/validation/2026-11-14T00-06-15-743Z-82a84455-4ab7-457f-889e-6d10cc36d08b/result.json
---

# TASK-011 — Simulateur interactif `VIS-03` (Pile d'appels & Pointeurs pendants)

## Objectif

Construire le simulateur `VIS-03` dans `apps/web/src/lessons/program-memory-fundamentals/components/` couvrant les trames de pile décroissantes, `RSP`/`RBP`, la vue ABI optionnelle, le scénario _Dangling Pointer_ et le _Stack Overflow_.

## Critères d'acceptation

- [x] Croissance vers les adresses basses vérifiable visuellement avec conservation explicite en grisé des octets libérés après `RET`.
- [x] Flèche SVG / bannière de pointeur montrant le passage de valeur résiduelle valide en apparence à écrasement lors de l'appel suivant.
- [x] Raccourcis clavier, `aria-live="polite"`, `prefers-reduced-motion` et mise en page mobile `375px` sans débordement horizontal.
- [x] Tests de rendu et de transitions accessibles vérifiés par Playwright.
