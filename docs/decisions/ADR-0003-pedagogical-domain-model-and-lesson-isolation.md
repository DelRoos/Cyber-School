# ADR-0003: Modèle de domaine pédagogique validé par Zod et découplage des leçons

- **Status**: Accepted
- **Date**: 2026-11-13
- **Author(s)**: product-software-architect, instructional-engineer

## Context

Les cours ne sont pas générés dynamiquement par requête utilisateur mais construits durablement autour d'un graphe de concepts atomiques réutilisables entre plusieurs parcours.

## Decision

Définir les schémas canoniques dans `@cyber-school/lesson-runtime` avec **Zod** (`Domain`, `Module`, `Chapter`, `AtomicConcept`, `LessonManifest`, `ExerciseDefinition`, `AssessmentBlueprint`, `ExternalLabLink`, `ResourceMetadata`), accompagnés d'un validateur de graphe vérifiant :

- l'existence de tous les prérequis et ressources référencés ;
- l'absence de cycles dans le graphe de prérequis (`DAG`) ;
- la validité des manifestes de leçons dans `lessons/`.

## Alternatives Considered

1. **Interfaces TypeScript uniquement** : Pas de validation à l'exécution ni sur les fichiers JSON du curriculum.
2. **Base de données externe dès le jour 1** : Complexité opérationnelle inutile avant d'avoir stabilisé le corpus initial ; les fichiers JSON/TS versionnés restent la source de vérité.

## Consequences

- Détection immédiate en CI des liens cassés, concepts orphelins ou cycles de prérequis.
- Réutilisation d'un `AtomicConcept` dans plusieurs modules/parcours sans duplication.

## Verification Criteria

Exécution de `corepack pnpm validate:curriculum` et des tests unitaires Vitest dans `packages/lesson-runtime`.
