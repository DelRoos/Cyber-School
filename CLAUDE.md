# CLAUDE.md — Instructions Anthropic Claude Code

Ce dépôt applique une gouvernance partagée entre **Claude Code**, **Codex** et **Gemini CLI**.

## Source de vérité commune

Lire impérativement en début de session :

1. @docs/agents/AGENT_GUIDE.md — Règles d'architecture, commandes, qualité et sécurité.
2. @continuity/RESUME_PROTOCOL.md — Protocole obligatoire de reprise en 8 étapes.
3. @continuity/CURRENT_STATE.md et @continuity/HANDOFF.md — État actuel et prochaine tâche.

## Intégration native Claude Code

- **Skills** : Disponibles dans `.claude/skills/` (miroirs synchronisés avec la source canonique `.agents/skills/`, vérifiés octet par octet via `tests/scripts/validate-governance.ts`). Ne modifier que `.agents/skills/` puis synchroniser `.claude/skills/` avant validation.
- **Sous-agents** : Définis dans `.claude/agents/*.md` selon [docs/agents/ROLES.md](./docs/agents/ROLES.md).
- **Règle d'or** : Garder ce fichier concis ; consulter les fichiers référencés à la demande et maintenir `continuity/` à jour avant de clôturer la session.
