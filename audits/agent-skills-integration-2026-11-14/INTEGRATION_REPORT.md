# Vérification des skills — Codex, Claude Code, Gemini CLI

Le contrôle porte sur le projet cyber-school. Après accord explicite, seule sa règle de confiance Gemini a été ajoutée. Les règles des autres projets et les confirmations d'exécution sont conservées. L'inventaire ci-dessous décrit les dix skills présents lors du contrôle initial ; des compétences ont été ajoutées ensuite par d'autres travaux.

## Installation et découverte

- 10 skills présents dans `.agents/skills/`.
- Miroir complet et identique dans `.claude/skills/` ; aucun fichier manquant ou divergent.
- 6 adaptateurs TOML Codex et 12 adaptateurs Markdown Claude/Gemini analysés avec leurs parseurs ; 18 fichiers de rôles au total.
- Codex reconnaît les 10 skills dans cette session, comme indiqué par le catalogue de compétences fourni par l'hôte. Le CLI séparé installé est en version 0.87.0 ; sa fonction expérimentale collab est désactivée. Ce contrôle n'a lancé aucun sous-agent et ne certifie pas l'exécution multi-agent de cet ancien binaire.
- Claude Code 2.1.145 dispose des six agents du projet et des préchargements `skills:` adaptés à leurs rôles. L'outil `Skill` a été ajouté aux six listes d'outils afin d'activer les compétences pertinentes non préchargées ; les noms et les préchargements ont été validés. `claude agents --json` liste les sessions en arrière-plan dans cette version ; son résultat vide n'est pas un inventaire des définitions de rôles.
- Gemini CLI 0.64.0 refusait initialement les skills faute de confiance dans le dossier. Après l'accord de l'utilisateur et l'ajout de la seule règle du projet, `gemini.cmd skills list` a découvert les dix skills et les a tous indiqués `Enabled`, sans option de contournement.

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

## Activation Gemini effectuée après accord

La clé du dossier `C:\Users\Emerite\Documents\projets\cyber-school`, avec la valeur `TRUST_FOLDER`, a été ajoutée à `~/.gemini/trustedFolders.json`. Toutes les autres entrées ont été préservées et une sauvegarde de l'ancien fichier a été créée à côté de celui-ci. Aucun changement du sandbox, des confirmations d'exécution, de l'approbation automatique ou du niveau de confiance des dossiers parents.

L'utilisateur a répondu « Oui, activer pour ce projet » dans le formulaire. Le chargement natif a ensuite été vérifié sans `--skip-trust`. L'auditeur Gemini conserve seulement les outils de lecture et `activate_skill`.

## Validation finale et relais

La sélection des compétences par domaine est explicitée dans [SKILL_ROUTING.md](../../docs/agents/SKILL_ROUTING.md) et référencée par le guide commun. Les fichiers de skills canoniques et leurs miroirs n'ont pas été modifiés par ces ajustements d'activation.

La passe par défaut des tests navigateur a réutilisé le serveur 3000 : le HTML était servi mais les commandes ne réagissaient pas, avec des erreurs WebSocket HMR. La [sonde](browser-environment.json) a confirmé que le serveur isolé 3100 était interactif et sans ces erreurs.

La relance de `quality:verify --task TASK-015` avec `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100` n'a pas été exécutée : le contrôle automatique des autorisations a atteint son quota. Il s'agit d'une indisponibilité du contrôle, pas d'un refus motivé par un risque de la commande. Aucun contournement ni succès de test n'est revendiqué. Reprendre cette vérification lorsque le contrôle est disponible, en tenant compte de la tâche active et des changements ultérieurs dans le dépôt. Les travaux parallèles ont depuis fait évoluer la continuité vers TASK-022 ; ce rapport n'écrase pas leur relais.

## Références officielles consultées

- [Skills Codex](https://learn.chatgpt.com/docs/build-skills).
- [Agents Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents).
- [Skills Gemini et alias partagé](https://geminicli.com/docs/cli/skills/).
- [Dossiers fiables Gemini](https://geminicli.com/docs/cli/trusted-folders/).
- [Skills Claude Code](https://code.claude.com/docs/en/skills).
- [Préchargement des skills dans les agents Claude](https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents).

