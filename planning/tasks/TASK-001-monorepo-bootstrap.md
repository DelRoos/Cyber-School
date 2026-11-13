---
id: TASK-001
title: Initialiser le monorepo, la gouvernance agents, les ADR, les skills et les packages socle
status: In Progress
priority: P0
complexity: L
iteration: ITER-001
dependsOn: []
labels: [area:infra, area:agents, type:setup]
githubIssue: null
---

# TASK-001 — Initialisation du monorepo et du socle AI-First

## Objectif

Mettre en place le monorepo pnpm/Turborepo, les instructions communes (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`), les 8 skills prioritaires, les 13 rôles, les ADR fondateurs, le système de continuité et les packages `lesson-runtime`, `ui`, `animations`, `exercises`.

## Critères d'acceptation

- [ ] Workspace pnpm + Turborepo fonctionnel (`corepack pnpm install`).
- [ ] `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` pointent vers `docs/agents/AGENT_GUIDE.md`.
- [ ] 8 skills valides sous `.agents/skills/*/SKILL.md` et adaptateurs natifs `.codex/`, `.claude/`, `.gemini/`.
- [ ] Schémas Zod et validation de graphe de concepts opérationnels dans `@cyber-school/lesson-runtime`.
- [ ] `corepack pnpm typecheck`, `corepack pnpm lint` et `corepack pnpm test:unit` passent.
