---
id: TASK-019
title: Générer le lot pilote TC-00 et implémenter scientific-reasoning-and-proof avec E2E Playwright
status: Done
verificationRef: continuity/validation/2026-11-14T08-54-18-256Z-38452b25-319e-4c98-bd94-98ff60a4f2a4/result.json
priority: P0
complexity: L
iteration: ITER-002
dependsOn: [TASK-017, TASK-018]
labels: [area:web, area:lesson, area:qa]
githubIssue: null
---

# TASK-019 — Lot pilote `TC-00` & cours `scientific-reasoning-and-proof`

## Objectif

Planifier le premier lot racine sans prérequis (`TC-00`, `--next --limit 3`) et livrer complètement le premier cours interactif V4 (`unit-tc00-observation-hypotheses` -> `scientific-reasoning-and-proof`, `TC00.001..TC00.008`).

## Critères d'acceptation

- [x] Dossiers de mission générés pour les 3 unités racines de `TC-00` dans `production/missions/`.
- [x] `curriculum/tc00-logic-proof-research.json`, `resources/sources.json`, `docs/courses/scientific-reasoning-and-proof/COURSE_DOSSIER.md` et `lessons/scientific-reasoning-and-proof/lesson.json` (`status: "in-review"`) valident sous `validate:curriculum`.
- [x] Moteur déterministe `causal-reasoning.ts` testé sous Vitest, simulateurs accessibles `VIS-01` (graphe causal & confondant Z) et `VIS-02` (contre-exemple minimal) avec `@cyber-school/animations` (`prefers-reduced-motion`).
- [x] `v4:audit -- --unit unit-tc00-observation-hypotheses` et suite E2E Playwright `tests/e2e/v4-factory-and-tc00.spec.ts` exécutés avec succès sans publier automatiquement.
