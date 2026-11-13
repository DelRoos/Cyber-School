---
id: TASK-011
title: Implémenter le simulateur VIS-03 (Pile d'appels, RSP/RBP, ABI & Pointeurs pendants)
status: Blocked
priority: P1
complexity: L
iteration: ITER-002
dependsOn: [TASK-002, TASK-009]
labels: [area:lesson, area:visualizations, area:systems-memory]
githubIssue: null
---

# TASK-011 — Simulateur interactif `VIS-03` (Pile d'appels & Pointeurs pendants)

## Objectif

Construire le simulateur `VIS-03` dans `lessons/program-memory-fundamentals/components/` couvrant les trames de pile décroissantes, `RSP`/`RBP`, la vue ABI optionnelle, le scénario _Dangling Pointer_ et le _Stack Overflow_.

## Critères d'acceptation

- [ ] Croissance vers les adresses basses vérifiable visuellement avec conservation explicite en grisé des octets libérés après `RET`.
- [ ] Flèche SVG de pointeur montrant le passage de valeur résiduelle valide en apparence à écrasement lors de l'appel suivant.
- [ ] Raccourcis clavier, `aria-live="polite"`, `prefers-reduced-motion` et mise en page mobile `375px` sans débordement horizontal.
- [ ] Tests de rendu et de transitions accessibles vérifiés.
