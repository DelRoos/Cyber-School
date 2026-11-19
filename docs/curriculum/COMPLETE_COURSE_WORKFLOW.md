# Produire une page de cours complète

Le workflow transforme une unité V4 en page utilisable. L'agent natif rédige et implémente les livrables ; les commandes préparent le dossier, contrôlent les liens et exécutent la réception. Elles ne sollicitent aucun modèle et n'installent aucun service. Le contrat additif est décrit dans [ADR-0008](../decisions/ADR-0008-complete-course-pages.md).

## Démarrer et reprendre

Dans PowerShell, utiliser une version Node prise en charge par `package.json`. Le projet emploie `corepack pnpm`.

```powershell
corepack pnpm v4:plan -- --limit 3
corepack pnpm course:workflow -- prepare --unit unit-tc00-uncertainty-errors --task TASK-023 --slug understanding-alerts-and-evidence
corepack pnpm course:workflow -- status --unit unit-tc00-uncertainty-errors
```

`prepare` traite une seule unité et une tâche existante. Il écrit `production/workflows/<unit>/workflow.json`, un dossier `AUTHORING.md` et un brouillon hors du catalogue public. Il préserve les fichiers existants ; des entrées différentes demandent une révision explicite du dossier. Il ne crée pas de cours public vide. Le statut inspecte les fichiers réels, sans se fier à une case cochée dans un plan.

## Étapes et sorties

| Étape         | Entrée                          | Responsabilité et skills                                                                                                                              | Sortie et contrôle                                                                                                                                                                                                |
| ------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sources       | Unité, notions, prérequis       | pedagogy-designer ; `curriculum-production`, `web-source-synthesis`, `scientific-thinking-literature-review`, `source-driven-development`             | Dossier scientifique rédigé depuis des sources primaires datées trouvées en ligne, avec `scientific-thinking-scholar-evaluation`. Relire les affirmations ; la présence d'un fichier ne certifie pas leur vérité. |
| Pédagogie     | Objectifs et erreurs fréquentes | pedagogy-designer ; `lesson-design`, `assessment-authoring`, `visual-explanation`, `humanizer`, `better-writing` (+ passe `doubt-driven-development`) | Manifeste et page complète conformes aux schémas, couverture exacte des micro-leçons, concepts et exercices reliés avec distracteurs diagnostiques.                                                               |
| Expériences   | Exemple résolu et invariants    | frontend-engineer ; `pedagogical-animation`, `gsap-animation`, `gsap-react`, `gsap-performance`, `better-accessibility`                               | Composants enregistrés, moteur déterministe et tests présents. La QA exécutera les tests ; leur existence ne prouve pas leur succès.                                                                              |
| Assemblage    | Page et expériences             | frontend-engineer ; `frontend-design`, `better-writing`, `better-accessibility`, `browser-validation`                                                 | Route rendue par le composant partagé, scénario E2E du cours, captures inspectées à 1280 et 375 px.                                                                                                               |
| Réception     | Sources finales                 | qa-engineer ; `browser-validation`, `better-accessibility`, `project-handoff`                                                                         | Neuf commandes réellement réussies, preuve liée au contenu, à la tâche et à ses critères.                                                                                                                         |
| Revue humaine | Page et preuve actuelles        | Relecteur scientifique et pédagogique réel                                                                                                            | Approbation nominative et datée selon les garde-fous. Publication distincte.                                                                                                                                      |

Ces responsabilités peuvent être assurées successivement par un agent natif. Les skills sont sélectionnés selon le domaine, sans charger toute la bibliothèque ni imposer de sous-agents.

## Contrat de la page

`lessons/<slug>/lesson.json` reste le contrat des exercices, sources et évaluations. Le fichier optionnel `course.page.json` contient les textes réellement affichés et les liens vers les expériences. Le schéma est dans [course-page.ts](../../packages/lesson-runtime/src/course-page.ts). Les trois cours sur mesure existants gardent leur rendu tant qu'ils n'ont pas ce fichier.

Chaque chapitre possède une question, un objectif, des explications rédigées, un exemple résolu, une prédiction avant manipulation, une expérience avec consigne et limites, un exercice de mise en pratique, une confusion corrigée, un bilan, un transfert et des sources. Les identifiants de chapitre correspondent aux étapes du manifeste. Chaque exercice est placé une seule fois et figure dans une évaluation cumulative. Chaque concept du chapitre a une question de compréhension.

Pour ajouter une expérience, modifier les deux registres `apps/web/src/components/course-experiences/catalog.ts` et `registry.tsx`, son composant, son moteur et ses tests. Le catalogue pur est partagé avec les contrôles Node ; le registre React lie les identifiants aux composants réels. Une simulation doit expliquer le mécanisme enseigné. Un identifiant enregistré ne valide pas sa pertinence pédagogique.

Le rendu conserve les réponses lors des changements de chapitre. Modifier une réponse invalide son ancien score. Les expériences masquées sont démontées ; leurs paramètres reviennent à l'état initial quand on les rouvre. La progression est limitée à la session ; aucun compte ou stockage persistant n'est annoncé.

## Contrôles et preuve

```powershell
corepack pnpm course:workflow -- check --unit unit-tc00-uncertainty-errors
corepack pnpm course:workflow -- verify --unit unit-tc00-uncertainty-errors
# Remplacer la référence par le résultat réellement créé par le runner :
corepack pnpm course:workflow -- status --unit unit-tc00-uncertainty-errors --evidence continuity/validation/<run>/result.json
```

`check` échoue si la structure est incomplète ; son succès ne certifie ni exécution des tests ni revue scientifique. `verify` appelle le runner qualité existant pour la tâche du workflow : garde-fous, types, lint, format, gouvernance, curriculum, unités, build, navigateur. `status --evidence` vérifie cette preuve, son empreinte actuelle et ses journaux. Une preuve ancienne, incomplète ou attribuée à une autre tâche est refusée. `readyForHumanReview` exige structure et QA actuelles ; `publicationPerformed` reste toujours `false`.

Créer les dossiers, rapports et modifications du registre avant la QA : ce sont des sources contrôlées. Après la QA, utiliser le statut en lecture seule et `quality:checkpoint`. Le rapport V4 historique est un inventaire de livrables ; il ne remplace pas la preuve d'exécution du workflow.

Si plusieurs sessions utilisent le même dépôt, attribuer à chacune un `PLAYWRIGHT_PORT` et un `PLAYWRIGHT_OUTPUT_DIR` distincts avant la vérification. Cela évite de partager un serveur de tests ou d'effacer les captures d'une autre réception. Les sources et la build doivent rester stables pendant la QA ; des worktrees distincts restent préférables pour des modifications simultanées.

## Consigne native commune

Dans Codex, Claude Code ou Gemini CLI, demander :

> Utilise le skill course-page-production. Reprends le workflow de l'unité unit-tc00-uncertainty-errors, tâche TASK-023. Lis AUTHORING.md et le statut réel. Produis tous les livrables jusqu'à la page complète testée, respecte les sources et les invariants, conserve la revue humaine pending et termine par un checkpoint factuel.

Source canonique : `.agents/skills/course-page-production/`. Claude utilise son miroir `.claude/skills/`; Gemini et Codex découvrent la source commune. `validate:governance` vérifie les miroirs. Le mécanisme natif et les permissions effectives de chaque session continuent de s'appliquer.
