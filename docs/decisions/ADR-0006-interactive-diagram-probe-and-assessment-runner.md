# ADR-0006 : Exercice interactif de sonde sur diagramme (`diagram-probe`) et lecteur d'évaluation cumulative

- **Status** : Proposed _(en attente de validation humaine / architecte avant modification de `@cyber-school/lesson-runtime` et `@cyber-school/exercises`)_
- **Date** : 2026-11-14
- **Contexte** : Le cours de référence [program-memory-fundamentals](../courses/program-memory-fundamentals/00-FICHE_REFERENCE.md) exige 8 familles d'exercices sans saisie manuelle de code, incluant l'interprétation directe de diagrammes mémoire (`EX-06`, `EX-11`, `EX-13`) et une évaluation cumulative multi-concepts (`EVAL-01` à `EVAL-04`).

## Analyse du socle actuel

1. `packages/lesson-runtime/src/schemas.ts` définit actuellement trois types dans `ExerciseDefinitionSchema` : `multiple-choice`, `state-prediction` et `sequence-order`.
2. `AssessmentBlueprintSchema` existe déjà dans `packages/lesson-runtime/src/schemas.ts` (champ optionnel `assessments` de `LessonManifestSchema`), mais `DefaultLessonExperience` et `@cyber-school/exercises` ne proposent pas encore d'interface de passation d'évaluation cumulative avec score global/par module.

## Options envisagées

### Option A — Repli 100 % sur les schémas actuels (zéro modification de packages)

- Encoder `EX-06` et `EX-11` uniquement en `multiple-choice` / `state-prediction`, et reporter l'exécution interactive d'`AssessmentBlueprint` (`TASK-005`).
- **Avantage** : aucune modification de contrat partagé.
- **Inconvénient** : réduit la richesse pédagogique des diagnostics directement cliquables sur la pile, les segments ou le tas.

### Option B — Extension rétrocompatible contrôlée (recommandée)

1. Ajouter dans `@cyber-school/lesson-runtime` un quatrième variant facultatif `DiagramProbeExerciseSchema` (`type: "diagram-probe"`) décrivant des zones cliquables/sélectionnables au clavier sur un diagramme SVG déterministe (`probes[]`, `expectedTargets`).
2. Implémenter le composant accessible `DiagramProbeCard` et le lecteur `AssessmentRunner` dans `@cyber-school/exercises` pour exécuter `LessonManifest.assessments` (sans régression sur `tcp-three-way-handshake` ni sur les schémas existants).

## Conséquences si Option B acceptée

- **Périmètre touché** : `packages/lesson-runtime/src/schemas.ts`, `packages/exercises/src/`, tests unitaires Vitest et validation `validate:curriculum`.
- **Rétrocompatibilité** : 100 % préservée (`tcp-three-way-handshake` continue de fonctionner sans changement).
- **Plan de repli** : si l'approbation architecturale n'est pas accordée avant le démarrage de `TASK-013`, Claude Code utilise l'Option A documentée pour chaque exercice dans [05-BANQUE_EXERCICES.md](../courses/program-memory-fundamentals/05-BANQUE_EXERCICES.md).
