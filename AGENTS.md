# AGENTS.md — Instructions OpenAI Codex

Ce dépôt applique une gouvernance partagée entre **Codex**, **Claude Code** et **Gemini CLI**.

## Source de vérité commune

Lire impérativement avant toute action :

1. [docs/agents/AGENT_GUIDE.md](./docs/agents/AGENT_GUIDE.md) — Règles techniques, commandes, sécurité et conventions communes.
2. [continuity/RESUME_PROTOCOL.md](./continuity/RESUME_PROTOCOL.md) — Protocole obligatoire de reprise en 8 étapes.
3. [continuity/CURRENT_STATE.md](./continuity/CURRENT_STATE.md) et [continuity/HANDOFF.md](./continuity/HANDOFF.md) — État courant et relais actif.

## Intégration native Codex

- **Skills partagés** : `.agents/skills/<nom>/SKILL.md` (découverte progressive native par Codex).
- **Sous-agents projet** : `.codex/agents/*.toml` (alignés sur les rôles de [docs/agents/ROLES.md](./docs/agents/ROLES.md)).
- **Checkpoints & fin de tâche** : Mettre à jour `continuity/CURRENT_STATE.md` et `continuity/HANDOFF.md` après toute étape significative et ne clôturer une tâche qu'après exécution des vérifications (`typecheck`, `lint`, `test:unit`, `test:e2e` si UI modifiée).
