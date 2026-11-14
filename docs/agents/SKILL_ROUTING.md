# Choisir les skills selon le travail

Ces onze compétences du projet sont communes à Codex, Claude Code et Gemini CLI. À chaque tâche, choisir celles qui correspondent au travail réel et lire leurs instructions avant de les appliquer. Les compétences conditionnelles sont activées quand leur domaine intervient ; ne pas charger systématiquement toute la bibliothèque.

| Domaine                                         | Skills                  | Rôle habituel                        |
| ----------------------------------------------- | ----------------------- | ------------------------------------ |
| Architecture, contrats et dépendances           | `architecture-design`   | architect                            |
| Objectifs, explications, exemples et exercices  | `lesson-design`         | pedagogy-designer                    |
| Lots du curriculum V4 et dossiers de production | `curriculum-production` | pedagogy-designer, continuity-keeper |
| Direction artistique et mise en page            | `frontend-design`       | frontend-engineer                    |
| Schémas et scénarios explicatifs                | `visual-explanation`    | pedagogy-designer, frontend-engineer |
| Animations causales CTML & explications actives | `pedagogical-animation` | pedagogy-designer, frontend-engineer |
| Animation 2D et commandes temporelles           | `gsap-animation`        | frontend-engineer                    |
| 3D avec apport pédagogique démontré             | `threejs-scene`         | frontend-engineer                    |
| Navigation, accessibilité et rendu réel         | `browser-validation`    | qa-engineer, frontend-engineer       |
| Décomposition et dépendances des tâches         | `iteration-planning`    | continuity-keeper, architect         |
| Reprise, preuves et relais                      | `project-handoff`       | tous les rôles                       |

Les sources canoniques sont dans `.agents/skills/`. Codex et Gemini utilisent ce répertoire commun ; Claude utilise son miroir `.claude/skills/`. La gouvernance vérifie l'identité des copies. Aucun skill n'accorde une permission d'exécution, de modification, de publication ou une approbation scientifique.

## Adaptateurs natifs

- Codex : les rôles sous `.codex/agents/` référencent les consignes communes ; les skills disponibles sont hérités de la session. Le binaire CLI séparé doit prendre en charge cette fonction pour exécuter des sous-agents personnalisés. La version locale 0.87.0 n'a pas été certifiée pour ce mode.
- Claude Code : `skills:` précharge les compétences principales du rôle ; l'outil `Skill` permet d'activer les autres compétences pertinentes. L'auditeur conserve uniquement ses outils de lecture et l'activation des skills.
- Gemini CLI : `.agents/skills/` est un alias natif. La confiance doit porter uniquement sur le dossier de ce projet pour charger sa configuration. L'auditeur peut activer un skill mais ne peut ni écrire ni exécuter de commande shell.

## Références

[Skills Codex](https://learn.chatgpt.com/docs/build-skills), [agents Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents), [skills dans les agents Claude](https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents), [skills Gemini](https://geminicli.com/docs/cli/skills/) et [confiance du dossier Gemini](https://geminicli.com/docs/cli/trusted-folders/).
