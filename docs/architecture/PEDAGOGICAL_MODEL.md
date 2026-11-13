# Architecture pédagogique — Modèle conceptuel de données

## 1. Hiérarchie et graphe

```text
Domain ──▶ Module ──▶ Chapter ──▶ AtomicConcept (graphe DAG via prerequisites/relations)
                                        │
                                        ├──▶ Lesson (1..N parcours peuvent référencer le même concept)
                                        │      ├── ProgressiveSteps (explications + animations)
                                        │      ├── Exercises (compréhension & raisonnement)
                                        │      └── ExternalLabs (TP externes vérifiés)
                                        └──▶ Assessments (évaluations cumulatives multi-concepts)
```

## 2. Réutilisation sans duplication

- Un **Concept Atomique** (`AtomicConcept`) possède un identifiant stable (kebab-case, ex: `tcp-three-way-handshake`) et est stocké indépendamment des parcours dans le graphe de curriculum.
- Plusieurs `Chapter` ou parcours (ex: _Réseaux fondamentaux_, _Cybersécurité offensive & défensive_, _Systèmes distribués_) peuvent référencer les mêmes `conceptIds` sans dupliquer la définition, les prérequis ni la leçon associée.
- Les schémas Zod officiels et validateurs de graphe résident dans `packages/lesson-runtime/src/schemas.ts` et `packages/lesson-runtime/src/validator.ts`.

## 3. Champs obligatoires d'un `AtomicConcept`

- `id`: identifiant stable unique
- `title`: intitulé clair
- `definition`: définition rigoureuse et concise
- `prerequisites`: liste d'`id` de concepts prérequis (validée sans cycle)
- `learningObjectives`: objectifs observables (verbes d'action)
- `relations`: liens typés vers d'autres concepts (`builds_on`, `contrasts_with`, `applied_in`, `part_of`)
- `resourceIds`: références vers `resources/sources.json`
- `depthLevel`: `foundational` | `intermediate` | `advanced` | `expert`
- `validationCriteria`: critères permettant d'attester la maîtrise du concept
