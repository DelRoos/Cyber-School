---
id: TASK-013
title: Résoudre ADR-0006, encoder la banque d'exercices EX-01..16 et l'évaluation EVAL-01..04
status: Ready
priority: P1
complexity: M
iteration: ITER-002
dependsOn: [TASK-001]
labels: [area:exercises, area:lesson, area:architecture]
githubIssue: null
---

# TASK-013 — Exercices sans code et évaluation cumulative

## Objectif

Obtenir la décision architecturale sur [ADR-0006](../../docs/decisions/ADR-0006-interactive-diagram-probe-and-assessment-runner.md) (extension `diagram-probe` + `AssessmentRunner`, ou repli Option A natif), puis préparer et tester les définitions JSON/TS des 16 exercices et 4 évaluations cumulatives décrits dans [05-BANQUE_EXERCICES.md](../../docs/courses/program-memory-fundamentals/05-BANQUE_EXERCICES.md).

## Critères d'acceptation

- [ ] Décision explicite consignée dans `ADR-0006` (`Accepted` pour Option B ou `Accepted (Option A fallback)`).
- [ ] Si Option B retenue : extension rétrocompatible de `@cyber-school/lesson-runtime` et `@cyber-school/exercises` avec tests Vitest dédiés sans casser `tcp-three-way-handshake`.
- [ ] 16 exercices (`EX-01`..`EX-16`) + 4 scénarios cumulatifs (`EVAL-01`..`EVAL-04`) couvrant les 14 concepts sans aucune saisie manuelle de code.
- [ ] Cartographie des distractions/erreurs fréquentes incluse dans les feedbacks immédiats.
