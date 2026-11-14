---
id: TASK-013
title: Résoudre ADR-0006, encoder la banque d'exercices EX-01..16 et l'évaluation EVAL-01..04
status: Done
priority: P1
complexity: M
iteration: ITER-002
dependsOn: [TASK-001]
labels: [area:exercises, area:lesson, area:architecture]
githubIssue: null
verificationRef: continuity/validation/2026-11-14T00-04-44-169Z-2090320c-192f-4cf5-a38f-0614de25d38e/result.json
---

# TASK-013 — Exercices sans code et évaluation cumulative

## Objectif

Obtenir la décision architecturale sur [ADR-0006](../../docs/decisions/ADR-0006-interactive-diagram-probe-and-assessment-runner.md) (extension `diagram-probe` + `AssessmentRunner`, ou repli Option A natif), puis préparer et tester les définitions JSON/TS des 16 exercices et 4 évaluations cumulatives décrits dans [05-BANQUE_EXERCICES.md](../../docs/courses/program-memory-fundamentals/05-BANQUE_EXERCICES.md).

## Critères d'acceptation

- [x] Décision explicite consignée dans `ADR-0006` (`Accepted` pour Option B).
- [x] Extension rétrocompatible de `@cyber-school/lesson-runtime` (`diagram-probe`) et `@cyber-school/exercises` (`AssessmentRunner` + rendu `diagram-probe`) avec tests Vitest dédiés sans casser `tcp-three-way-handshake`.
- [x] 16 exercices (`EX-01`..`EX-16`) + 4 scénarios cumulatifs (`EVAL-01`..`EVAL-04`) couvrant les 14 concepts sans aucune saisie manuelle de code.
- [x] Cartographie des distractions/erreurs fréquentes incluse dans les feedbacks immédiats.
