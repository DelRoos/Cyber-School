# Audit des agents, configurations, rôles et skills

## Méthode et niveaux de preuve

Ont été lus : les trois entrées racine, guide commun, 13 rôles, huit skills et leur unique référence ADR, six TOML Codex, six Markdown Claude, six Markdown Gemini et settings Gemini. Les frontmatters YAML et TOML sont parsés. Aucune session de modèle supplémentaire ni aucun sous-agent n'a été lancé. L'inspection du chargeur Gemini installé permet une vérification native hors authentification. Une validation syntaxique n'est pas assimilée à une découverte opérationnelle.

| Outil | Preuve locale | Instructions / skills / agents | Verdict |
| --- | --- | --- | --- |
| Codex de la session | AGENTS et huit skills visibles ; six rôles correspondants exposés par les outils de session | Métadonnées et champs TOML cohérents | Exploitabilité dans cette session étayée ; aucune délégation testée |
| Codex CLI local | `codex-cli 0.87.0`, flag expérimental `collab=false` | Pas de version minimale définie ; six TOML syntaxiquement valides | Compatibilité native de ce CLI avec ces adaptateurs non établie |
| Claude Code | `2.1.145` ; six frontmatters valides | CLAUDE.md existe ; imports littéraux ; `.claude/skills/` annoncé mais absent | Adaptation incomplète ; lancement réel non testé |
| Gemini CLI | `0.64.0` ; clé enableAgents présente dans le schéma installé | Chargeur natif accepte six agents ; charge huit skills dans `.agents/skills/` | Formats natifs réels et chargement prouvés, invocation modèle non testée |

La documentation OpenAI actuelle décrit des agents TOML avec `name`, `description` et `developer_instructions`, présents ici. Elle précise aussi que des champs de sandbox d'agent ne remplacent pas les paramètres du parent ; il faut donc configurer la session parente pour une isolation d'audit. Ces faits ne suffisent pas à certifier le CLI ancien installé. [Sous-agents Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents).

La découverte canonique `.agents/skills/` correspond au chemin Codex documenté. [Skills Codex](https://learn.chatgpt.com/docs/build-skills). Gemini documente également ce chemin comme alias workspace ; le chargement direct local le confirme. [Skills Gemini](https://geminicli.com/docs/cli/skills/).

## Hiérarchie et cohérence des instructions

La centralisation dans `docs/agents/AGENT_GUIDE.md` évite trois copies divergentes. Chaque entrée exige la lecture du protocole et de l'état. Les règles TypeScript, sources non fiables, choix 2D/3D et interdiction de déclarer des tests non exécutés sont cohérentes. Les documents n'inventent pas d'orchestrateur maison.

Deux adaptations ne réalisent cependant pas leurs promesses : les miroirs Claude manquent et les `@imports` sont entre backticks (AUD-010/011). Le chemin natif de skills documenté par Anthropic est `.claude/skills/` ; l'accès manuel au canonique peut fonctionner mais ne remplace pas le préchargement déclaré. [Skills Claude](https://code.claude.com/docs/en/skills). Les spans de code sont explicitement exclus du parsing d'import. [Mémoire et imports Claude](https://code.claude.com/docs/en/memory).

Les règles de continuité sont des consignes au modèle, sans contrôle automatique de statut. La présente mission limite explicitement les écritures au dossier d'audit : ce périmètre a été respecté, en laissant les fichiers de gouvernance et de continuité inchangés. Les checkpoints de l'audit se trouvent dans AUDIT_PLAN.md.

## Inspection des huit skills

Tous ont un nom correspondant à leur dossier, une description avec condition de déclenchement, un propriétaire et une version 1.0. Ils font 26 à 32 lignes, ce qui convient à une découverte progressive. Aucun ne contient de script, d'installation cachée ou de commande dynamique. Un skill procédural sans script est un vrai skill ; son efficacité n'est pas pour autant prouvée par sa seule présence.

| Skill | Entrées et déclenchement | Sortie / contrôle | Appréciation |
| --- | --- | --- | --- |
| architecture-design | Nouveau package, contrat ou dépendance ; architecture et ADR | Contrats, ADR avec modèle existant ; typecheck/lint/build | Procédure opérationnelle ; validation humaine structurante bien prévue |
| browser-validation | UI/leçon modifiée ; tests Playwright | Vérification console, clavier, viewports et performance de base | Exigences concrètes, mais tests présents moins complets et aucun résultat lié à une révision |
| gsap-animation | Scénario 2D, package animations | Animations propres, reduced-motion, contrôles | Déclenchement clair ; API `useReducedMotion` et helpers de timeline inexistants (AUD-016) |
| iteration-planning | Roadmap et tâche prêtes à décomposer | Frontmatter, dépendances, complexité, critères | Gabarit utilisable ; pas de validateur des transitions et Ready incohérent (AUD-015) |
| lesson-design | Concept/leçon/exercice ; sources primaires | Manifeste et contrôles curriculum/tests | Pipeline utile ; pas de modèle formel de preuve de revue scientifique ni de révision de contenu |
| project-handoff | Début/checkpoint/fin de session | État, relais, blocages et tests réels | Étapes utilisables ; protocole humain, checkpoint actuel obsolète et pas de sortie horodatée structurée |
| threejs-scene | Uniquement quand la 3D apporte une valeur démontrée | Scène, fallback, budgets et vérification navigateur | Réserve pertinente ; compétence non éprouvée, aucun package 3D ni harnais de mesure |
| visual-explanation | Concept abstrait et storyboard | Choix du médium, mapping état/visuel, clavier | Guide opérationnel qualitatif ; absence d'exemple de storyboard et de sortie machine vérifiable |

Les entrées/sorties sont généralement décrites dans les étapes, pas sous forme de contrat dédié. La réutilisation est plausible ; un exemple minimal compilé et un contrôle des liens/API apporteraient plus qu'une multiplication de fichiers. Les recouvrements lesson-design/visual-explanation/gsap-animation sont complémentaires si l'on distingue conception et implémentation. Ils ne nécessitent pas trois variantes du même skill par outil.

Les dépendances sont visibles : skills référant les standards, les schémas et les commandes du dépôt. Le seul support embarqué est `architecture-design/references/adr-template.md`, présent et cohérent. Les vérifications décrites ne sont pas auto-exécutées à l'invocation ; les checklists doivent être reliées à des artefacts de résultat.

## Les 13 rôles et leur couverture

| Rôle documentaire | Adaptateur effectif / regroupement | Évaluation |
| --- | --- | --- |
| Architecte produit/logiciel | architect | Frontières et ADR clairement attribués |
| Planificateur | continuity-keeper | Fonction couverte ; cumul avec maintien de l'état |
| Chercheur documentaire | pedagogy-designer côté Claude ; instructions canoniques ailleurs | Couverture moins explicite dans l'adaptateur Codex ; aucun outil Web autorisé au pédagogue Claude |
| Expert scientifique | pedagogy-designer | Même agent peut concevoir et valider ses propres simplifications ; revue distincte nécessaire pour publier |
| Ingénieur pédagogique | pedagogy-designer | Objectifs et concepts bien définis |
| Scénariste visuel | pedagogy-designer | Passage à l'implémentation prévu, sans artefact de storyboard imposé |
| Animation 2D | frontend-engineer | Responsabilité couverte ; doit consommer les exports réels |
| Three.js/3D | frontend-engineer | Regroupement raisonnable tant que cette capacité est future |
| Frontend | frontend-engineer | UI, serveur/client et intégration clairs |
| Concepteur d'exercices | pedagogy-designer | Besoin de contrôle explicite des clés et tentatives |
| QA | qa-engineer | Commandes définies ; pas de propriété de fichiers en cas de correction |
| Sécurité | security-auditor | Claude restreint aux outils de lecture ; autres outils hérités ou consigne seule |
| Continuité | continuity-keeper | Relais explicite prévu ; concurrence d'écriture non traitée |

Six adaptateurs pour treize rôles n'est pas un défaut en soi : le document dit explicitement qu'un rôle peut être incarné par l'agent principal. Il manque surtout des responsabilités de **publication/réception**, de mesure effective des budgets et de propriété des lots de travail. Il serait peu utile de créer sept sous-agents supplémentaires avant d'avoir des transferts et des contrôles concrets.

## Permissions et transferts

Claude permet Edit/Write aux agents d'implémentation ; architect et QA disposent de Bash sans Edit/Write, ce qui permet néanmoins des écritures via shell selon les permissions du parent. Son auditeur sans Bash est réellement plus restreint, mais ne peut pas suivre tel quel un skill exigeant de lancer des tests. Le concepteur pédagogique n'a pas WebFetch/WebSearch : il doit recevoir un dossier de sources vérifiées ou passer par le principal, sans supposer un accès natif absent. Les allowlists sont un mécanisme réel. [Configuration des sous-agents Claude](https://code.claude.com/docs/en/sub-agents).

Gemini sans `tools` hérite des outils du parent, y compris pour l'auditeur. L'activation enableAgents n'est pas fictive : elle existe dans le schéma 0.64.0. Le risque porte sur les capacités effectives, pas sur la syntaxe du fichier (AUD-013). [Outils des sous-agents Gemini](https://geminicli.com/docs/core/subagents/).

Chaque transfert devrait livrer identifiant de tâche et base Git, fichiers possédés, décisions en attente, critères restants et commandes/résultats. Une seule personne ou un agent désigné consoliderait l'état commun ; les implémenteurs transmettraient des résultats propres à leur tâche. Ce contrat éviterait les collisions sans orchestrateur supplémentaire.

## Conclusion du périmètre agents

Le dispositif s'appuie principalement sur des capacités natives réelles. Gemini a été vérifié au-delà de la syntaxe ; l'infrastructure Claude reste incomplète et la matrice de versions manque. Les huit skills sont des procédures utiles, avec un défaut d'API confirmé et des garanties non automatisées. Les constats détaillés sont AUD-010 à AUD-018, AUD-027 et AUD-029. Aucun fichier d'instructions ou adaptateur n'a été modifié pendant l'audit.
