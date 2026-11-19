---
id: TASK-024
title: Reconcevoir l’orientation et les pages Parcours
status: In Progress
priority: P0
complexity: L
iteration: ITER-002
dependsOn: [TASK-021]
labels: [area:web, area:ui, area:qa]
verificationRef: continuity/validation/2026-11-14T18-49-45-317Z-555c90eb-4142-4923-b8e0-bfbba7e0dcbd/result.json
---

# TASK-024 — Choisir un parcours et explorer son programme

## Objectif

Refonte complète demandée par l’utilisateur de `/parcours` : comprendre les possibilités, identifier le tronc commun et explorer les modules. Harmoniser les pages de détail avec cette expérience.

## Critères d'acceptation

- [x] `/parcours` présente une orientation claire, le tronc commun et les cinq autres parcours, avec recherche et filtres utilisables.
- [x] Les détails présentent un programme dépliable et les prérequis ; aucune disponibilité ou progression n’est inventée.
- [x] Les liens entre catalogue et parcours, ainsi que les liens profonds des modules, fonctionnent au clavier et à la souris.
- [x] Les rendus 1280 × 800, 375 × 812 et 320 px sont inspectés, sans débordement ; les mouvements réduits sont respectés.
- [ ] Les vérifications du projet sont exécutées et leurs résultats réels conservés ; les éventuels blocages préexistants sont explicités.

## Conception

Revalidation locale pendant TASK-025 : la correction du découpage à partir du V4 renouvelle les sources de cette refonte. Conserver la preuve précédente et actualiser la preuve avant de rétablir la clôture.

Voir `docs/design/PARCOURS_EXPERIENCE.md`.

## Adaptation aux changements simultanés

Pendant la validation, une autre session a retiré les routes `/lessons/[slug]` et `/curriculum`, leurs liens et plusieurs tests de cours, et a réécrit `tests/e2e/parcours.spec.ts`. Ces modifications ont été conservées. La refonte n’annonce plus de cours immédiatement accessibles ; elle oriente vers les programmes consultables. Les scénarios indépendants de la refonte sont conservés dans `tests/e2e/parcours-orientation.spec.ts`. La réintroduction des cours est hors de ce lot.
