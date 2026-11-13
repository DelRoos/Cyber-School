---
id: TASK-001
title: Initialiser le monorepo, la gouvernance agents, les ADR, les skills et les packages socle
status: Done
priority: P0
complexity: L
iteration: ITER-001
dependsOn: []
labels: [area:infra, area:agents, type:setup]
githubIssue: null
verificationRef: continuity/validation/2026-11-13T22-53-47-270Z-c4ebd332-816f-4718-95b1-48781e3a5645/result.json
---

# TASK-001 — Initialisation du monorepo et du socle AI-First

## Objectif

Mettre en place le monorepo pnpm/Turborepo, les instructions communes (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`), les 8 skills prioritaires, les 13 rôles, les ADR fondateurs, le système de continuité et les packages `lesson-runtime`, `ui`, `animations`, `exercises`.

## Critères d'acceptation

- [x] Workspace pnpm + Turborepo fonctionnel (`corepack pnpm install`).
- [x] `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` pointent vers `docs/agents/AGENT_GUIDE.md`.
- [x] 8 skills valides sous `.agents/skills/*/SKILL.md` et adaptateurs natifs `.codex/`, `.claude/`, `.gemini/`.
- [x] Schémas Zod et validation de graphe de concepts opérationnels dans `@cyber-school/lesson-runtime`.
- [x] `corepack pnpm typecheck`, `corepack pnpm lint` et `corepack pnpm test:unit` passent.
