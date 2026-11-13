# GEMINI.md — Instructions Google Gemini CLI

Ce dépôt applique une gouvernance partagée entre **Gemini CLI**, **Claude Code** et **Codex**.

## Source de vérité commune

Lire impérativement avant toute modification :

1. `./docs/agents/AGENT_GUIDE.md` — Règles communes, commandes, standards et sécurité.
2. `./continuity/RESUME_PROTOCOL.md` — Protocole obligatoire de reprise en 8 étapes.
3. `./continuity/CURRENT_STATE.md` et `./continuity/HANDOFF.md` — État courant et consignes de reprise.

## Intégration native Gemini CLI

- **Skills** : Découverts nativement depuis `.agents/skills/<nom>/SKILL.md` (convention Agent Skills partagée).
- **Sous-agents** : Définis dans `.gemini/agents/*.md` (configuration workspace dans `.gemini/settings.json`), alignés sur [docs/agents/ROLES.md](./docs/agents/ROLES.md).
- **Continuité** : Créer des checkpoints dans `continuity/CURRENT_STATE.md` sur les travaux longs et actualiser `continuity/HANDOFF.md` en fin de session avec les résultats réels des tests exécutés.
