# Itération ITER-001 — Socle technique, gouvernance AI-First et démonstrateur TCP

- **Jalon** : M1
- **Statut** : En cours (`In Progress`)
- **Objectif** : Mettre en place un monorepo opérationnel, testable et reprenable par Codex, Claude Code et Gemini CLI, démontré par une leçon interactive accessible sur le Three-Way Handshake TCP.

## Tâches incluses

- [TASK-001 — Monorepo, gouvernance agents et packages socle](../tasks/TASK-001-monorepo-bootstrap.md)
- [TASK-002 — Démonstrateur TCP Three-Way Handshake et validation navigateur](../tasks/TASK-002-tcp-handshake-demo.md)

## Critères de sortie d'itération

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test:unit`, `corepack pnpm build` et `corepack pnpm test:e2e` passent sans erreur.
- Un agent tiers peut reprendre le projet via `continuity/RESUME_PROTOCOL.md` et enchaîner sur `TASK-003`.
