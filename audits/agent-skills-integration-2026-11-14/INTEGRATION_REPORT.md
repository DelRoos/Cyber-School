# Vérification des skills — Codex, Claude Code, Gemini CLI

Le contrôle porte sur le projet cyber-school. Les configurations globales et les autres projets ne sont pas modifiés.

## Installation et découverte

- 10 skills présents dans `.agents/skills/`.
- Miroir complet et identique dans `.claude/skills/` ; aucun fichier manquant ou divergent.
- 6 adaptateurs TOML Codex et 12 adaptateurs Markdown Claude/Gemini analysés avec leurs parseurs ; 18 fichiers de rôles au total.
- Codex reconnaît les 10 skills dans cette session, comme indiqué par le catalogue de compétences fourni par l'hôte. Le CLI séparé installé est en version 0.87.0 ; sa fonction expérimentale collab est désactivée. Ce contrôle n'a lancé aucun sous-agent et ne certifie pas l'exécution multi-agent de cet ancien binaire.
- Claude Code 2.1.145 dispose des six agents du projet et des préchargements `skills:` adaptés à leurs rôles. `claude agents --json` liste les sessions en arrière-plan dans cette version ; son résultat vide n'est pas un inventaire des définitions de rôles.
- Gemini CLI 0.64.0 prend en charge le répertoire commun, mais `gemini.cmd skills list` retourne actuellement zéro skill : le projet n'est pas déclaré fiable. Sa configuration locale est ignorée dans ce mode restreint.

## Choix selon le domaine

| Travail | Skills disponibles à appliquer selon le besoin |
| --- | --- |
| Architecture, contrats, dépendances | architecture-design |
| Cours et explications | lesson-design |
| Production et suivi du curriculum V4 | curriculum-production |
| Direction visuelle et mise en page | frontend-design |
| Schémas, scénarios visuels, choix 2D/3D | visual-explanation |
| Animation 2D | gsap-animation |
| Scène 3D lorsque justifiée pédagogiquement | threejs-scene |
| Parcours navigateur et accessibilité | browser-validation |
| Planification | iteration-planning |
| Reprise et continuité | project-handoff |

Les skills sont sélectionnés selon la tâche. Ils ne sont pas tous chargés systématiquement. Les agents spécialisés combinent les compétences nécessaires ; les règles partagées et les contrôles de gouvernance restent applicables.

## Activation Gemini proposée

Ajouter uniquement la clé du dossier `C:\Users\Emerite\Documents\projets\cyber-school` avec la valeur `TRUST_FOLDER` à `~/.gemini/trustedFolders.json`, en préservant toutes les autres entrées. Aucun changement du sandbox, des confirmations d'exécution, de l'approbation automatique ou du niveau de confiance des dossiers parents.

La confirmation de l'utilisateur est demandée via le formulaire de la conversation. Aucune activation n'est effectuée avant sa réponse. Après accord, relancer `gemini.cmd skills list` sans option de contournement et enregistrer la liste réellement découverte.

## Références officielles consultées

- [Skills Codex](https://learn.chatgpt.com/docs/build-skills).
- [Agents Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents).
- [Skills Gemini et alias partagé](https://geminicli.com/docs/cli/skills/).
- [Dossiers fiables Gemini](https://geminicli.com/docs/cli/trusted-folders/).
- [Skills Claude Code](https://code.claude.com/docs/en/skills).
- [Préchargement des skills dans les agents Claude](https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents).

