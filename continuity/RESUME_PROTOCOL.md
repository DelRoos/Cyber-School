# Protocole obligatoire de reprise et de continuité inter-agents

Tout agent (**OpenAI Codex**, **Anthropic Claude Code**, **Google Gemini CLI**) reprenant ce dépôt doit exécuter ces 8 étapes dans l'ordre avant toute modification substantielle :

1. **Lire les instructions du projet** :
   - Point d'entrée outil (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) et [docs/agents/AGENT_GUIDE.md](../docs/agents/AGENT_GUIDE.md).
2. **Lire l'état de continuité** :
   - [continuity/STATE.json](./STATE.json), checkpoint machine lié aux sources.
   - [continuity/CURRENT_STATE.md](./CURRENT_STATE.md)
   - [continuity/HANDOFF.md](./HANDOFF.md)
   - [continuity/BLOCKERS.md](./BLOCKERS.md)
3. **Inspecter Git et les modifications non validées** :
   - Exécuter `git status`, `git diff`, `git log -n 5 --oneline`.
4. **Identifier la tâche active** :
   - Vérifier l'itération active sous `planning/iterations/` et les tâches sous `planning/tasks/`.
5. **Comparer la documentation à l'état réel du code** :
   - Vérifier que les fichiers et comportements mentionnés dans `CURRENT_STATE.md` existent réellement dans le dépôt.
6. **Vérifier les derniers tests** :
   - Lancer `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test:unit` (et `corepack pnpm test:e2e` si l'UI est concernée).
7. **Reprendre uniquement le travail restant** :
   - Ne pas réinventer ou casser le socle validé ; traiter uniquement les critères d'acceptation restants ou la prochaine tâche prioritaire.
8. **Actualiser l'état persistant** :
   - Générer les checkpoints avec `corepack pnpm quality:checkpoint --task <ID> --next "Action exacte"` ; ne pas éditer CURRENT_STATE.md ou HANDOFF.md à la main.
   - Ne **jamais** marquer une tâche `Done` sans critères d'acceptation vérifiés après la dernière édition et sans preuve enregistrée dans `continuity/`.
   - Ne jamais laisser une tâche marquée `Ready` si l'une de ses `dependsOn` n'est pas `Done` (`Blocked` tant que les prérequis sont ouverts).
   - Enregistrer toute décision structurante dans un ADR sous `docs/decisions/`.

Avant de conclure, lancer `corepack pnpm quality:verify --task <ID>` pour enregistrer les résultats réels. Si l'environnement empêche la suite, conserver failed et les blocages ; les tests isolés ou l'inspection du code ne permettent pas de déclarer le produit validé. Appliquer [les garde-fous communs](../docs/standards/QUALITY_GATES.md).

## Protocole de coordination en parallèle (plusieurs agents ou sous-agents)

- **Séparation des lots et worktrees** : Assigner des lots de fichiers disjoints à chaque agent ou utiliser des worktrees Git séparés afin d'éviter les écritures concurrentes sur le même fichier.
- **Un seul consolidateur de continuité** : Un seul agent consolidateur met à jour `continuity/CURRENT_STATE.md`, `continuity/HANDOFF.md` et les statuts `planning/tasks/` après fusion et vérification finale des tests.
