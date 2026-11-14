---
name: curriculum-production
description: Industrialize course planning, unit grouping, mission generation, quality auditing, and incremental execution from Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md without re-inventing a custom AI orchestrator. Use when identifying uncovered V4 concepts, creating mission dossiers, updating production/registry.json, or auditing a generated course.
metadata:
  owner: curriculum-architect
  version: "1.0"
---

# Curriculum Production (V4 Factory)

## When to Use

- Importing or re-synchronizing `Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md` via `pnpm v4:import`.
- Querying uncovered V4 modules/units and eligible next lots via `pnpm v4:plan`.
- Preparing reproducible mission dossiers under `production/missions/` via `pnpm v4:mission`.
- Auditing a completed unit against the 12-deliverables contract via `pnpm v4:audit`.

## Hard Guardrails

1. **Never overwrite V4 arbitrarily**: `Parcours_Ultra_Atomique_Cybersecurite_Zero_Expert_V4_Ingenierie_Offensive.md` is read-only reference input. Report inconsistencies in `curriculum/v4/import-report.json`.
2. **Idempotent imports & preserved state**: Running `pnpm v4:import` twice must produce identical output and preserve existing `production/units.json` curations, `production/registry.json` transitions/deliverables, and validated dependencies.
3. **12 production states & 12 deliverables**: Track every pedagogical unit cleanly in `production/registry.json`. Never promote a unit to `publie` (`lesson.json` status `published`) without verified deliverables and explicit human review sign-off.
4. **Bounded batching**: Use `pnpm v4:mission -- --next --limit <1..5>` — never launch unbounded mass generation across all 159 units.

## Standard Workflow

1. **Import & Coverage check**: `corepack pnpm v4:import`
2. **Inspect eligible lots**: `corepack pnpm v4:plan -- --limit 3`
3. **Generate mission dossier**: `corepack pnpm v4:mission -- --next --limit 3` (or `--unit <unitId>`)
4. **Produce deliverables**: Author `docs/courses/<slug>/COURSE_DOSSIER.md`, `curriculum/<module>.json`, `resources/sources.json`, `lessons/<slug>/lesson.json` (`status: "in-review"`), interactive visualizer/engine in `apps/web/src/lessons/<slug>/`, unit tests, and Playwright spec.
5. **Audit & Verify**:
   - `corepack pnpm v4:audit -- --unit <unitId>`
   - `corepack pnpm typecheck && corepack pnpm lint && corepack pnpm validate:curriculum && corepack pnpm test:unit && corepack pnpm test:guards && corepack pnpm test:e2e`
