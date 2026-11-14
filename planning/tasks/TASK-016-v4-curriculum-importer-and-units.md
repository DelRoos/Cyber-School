---
id: TASK-016
title: Industrialiser l'importateur V4, le contrat à 12 livrables et le regroupement en unités
status: Done
verificationRef: continuity/validation/2026-11-14T08-48-36-226Z-6b85a33b-d2b6-44b5-9e5c-c6adff37288d/result.json
priority: P0
complexity: M
iteration: ITER-002
dependsOn: [TASK-014]
labels: [area:curriculum, area:tooling, area:qa]
githubIssue: null
---

# TASK-016 — Importateur V4, schémas Zod et regroupement en unités

## Objectif

Transformer `Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md` en données structurées reproductibles et idempotentes sans altérer la source Markdown.

## Critères d'acceptation

- [x] Rapport d'audit V4 disponible dans `docs/curriculum/V4_AUDIT_REPORT.md` et ADR dans `docs/decisions/ADR-0007-v4-curriculum-industrialization.md`.
- [x] Contrats Zod (`V4ImportedCurriculumSchema`, `V4UnitsCatalogSchema`, `V4ProductionRegistrySchema`, `V4MissionBriefSchema`, `verifyUnitCoverage`, `assertCanPublishRecord`) implémentés et testés dans `packages/lesson-runtime`.
- [x] `corepack pnpm v4:import` importe les `54` modules, `1 122` micro-leçons, `772` compétences Part 2 et `9` examens de manière idempotente tout en couvrant `100 %` des micro-leçons sans doublons ni cycles (`159` unités).
- [x] `scripts/curriculum/v4-pipeline.test.ts` valide l'idempotence entre deux exécutions et la préservation des états dans `production/registry.json`.
