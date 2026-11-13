# Spécifications des rôles spécialisés

Ce document définit les 13 rôles spécialisés nécessaires au développement de l'académie interactive.
Un rôle représente une **responsabilité fonctionnelle réutilisable** : selon l'outil utilisé (Codex, Claude Code, Gemini CLI), il peut être incarné par l'agent principal appliquant les skills associés ou délégué à un sous-agent natif (`.codex/agents/`, `.claude/agents/`, `.gemini/agents/`).

---

## 1. Architecte produit et logiciel (`product-software-architect`)

- **Mission** : Concevoir et faire évoluer l'architecture technique du monorepo, des packages partagés et des contrats de données tout en gardant la simplicité d'évolution pour des milliers de cours.
- **Responsabilités** : Définir les frontières entre packages, valider la compatibilité des dépendances, rédiger les ADR, approuver les nouveaux patterns transversaux.
- **Entrées** : `docs/vision/VISION.md`, `docs/requirements/`, `docs/architecture/`, demandes produit, contraintes techniques.
- **Livrables** : ADR (`docs/decisions/`), schémas d'architecture, interfaces TypeScript/Zod structurantes.
- **Critères de qualité** : Couplage faible, cohérence strict TypeScript, absence de sur-ingénierie, compatibilité Next.js/React/pnpm/Turborepo vérifiée.
- **Skills à utiliser** : `architecture-design`, `project-handoff`.
- **Conditions de transfert** : Transférer au _Planificateur d'itérations_ une fois l'ADR et les interfaces validées, ou à l'_Ingénieur frontend_ / _Responsable continuité_ pour exécution.

## 2. Planificateur d'itérations (`iteration-planner`)

- **Mission** : Transformer la vision et l'architecture en jalons, itérations et tâches atomiques actionnables et testables.
- **Responsabilités** : Décomposer les fonctionnalités, identifier les dépendances, estimer la complexité, définir des critères d'acceptation vérifiables, tenir à jour le backlog.
- **Entrées** : ADR, roadmap (`planning/roadmap.md`), backlog (`planning/backlog/`), état courant (`continuity/CURRENT_STATE.md`).
- **Livrables** : Plans d'itération (`planning/iterations/`), fiches tâches (`planning/tasks/`) compatibles GitHub Issues/Projects.
- **Critères de qualité** : Chaque tâche a une portée atomique, des dépendances explicites, une estimation et des critères d'acceptation mesurables.
- **Skills à utiliser** : `iteration-planning`, `project-handoff`.
- **Conditions de transfert** : Transférer aux rôles d'implémentation dès que la tâche est prête (`Ready`) et sans blocage amont.

## 3. Chercheur documentaire (`documentation-researcher`)

- **Mission** : Collecter, vérifier et structurer les sources techniques et scientifiques officielles nécessaires aux cours et à l'outillage.
- **Responsabilités** : Vérifier les RFC, documentations officielles de bibliothèques, standards Web et références académiques ; indexer les métadonnées dans `resources/` avec niveau de confiance.
- **Entrées** : Sujet de cours ou question technique, `docs/security/AI_ENVIRONMENT_SECURITY.md`.
- **Livrables** : Fiches de ressources dans `resources/`, synthèses sourcées dans `docs/`.
- **Critères de qualité** : Sources primaires officielles privilégiées, URL et versions vérifiées, aucune injection d'instructions non fiables recopiée dans les prompts.
- **Skills à utiliser** : `lesson-design`, `architecture-design`.
- **Conditions de transfert** : Transférer à l'_Expert scientifique du domaine_ pour validation de l'exactitude, puis à l'_Ingénieur pédagogique_.

## 4. Expert scientifique du domaine (`domain-scientist`)

- **Mission** : Garantir la rigueur scientifique, technique et terminologique de chaque concept, simulation et explication.
- **Responsabilités** : Valider les modèles conceptuels, identifier les simplifications trompeuses, vérifier les cas limites (edge cases) et les unités/invariants.
- **Entrées** : Sources indexées (`resources/`), brouillons de concepts (`curriculum/`) et de leçons (`lessons/`).
- **Livrables** : Validation scientifique annotée, liste des invariants et cas limites à couvrir, corrections terminologiques.
- **Critères de qualité** : Zéro erreur factuelle, distinction claire entre modèle simplifié et réalité complète, cas limites documentés.
- **Skills à utiliser** : `lesson-design`, `visual-explanation`.
- **Conditions de transfert** : Transférer à l'_Ingénieur pédagogique_ et au _Concepteur de scénarios visuels_ après validation des faits et invariants.

## 5. Ingénieur pédagogique (`instructional-engineer`)

- **Mission** : Structurer la progression d'apprentissage à partir du graphe de concepts atomiques, des prérequis et des objectifs observables.
- **Responsabilités** : Définir les concepts dans `curriculum/`, découper la leçon en étapes progressives, aligner objectifs d'apprentissage et évaluations.
- **Entrées** : Référentiel existant (`curriculum/`), validation de l'_Expert scientifique du domaine_, `docs/standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md`.
- **Livrables** : Concepts atomiques validés par Zod, plan progressif de leçon (`lessons/<slug>/lesson.json`), spécification des points de contrôle.
- **Critères de qualité** : Prérequis explicites sans cycles, progression du concret vers l'abstrait, réutilisation de concepts existants sans duplication.
- **Skills à utiliser** : `lesson-design`, `iteration-planning`.
- **Conditions de transfert** : Transférer au _Concepteur de scénarios visuels_ et au _Concepteur d'exercices_.

## 6. Concepteur de scénarios visuels (`visual-scenario-designer`)

- **Mission** : Traduire les mécanismes abstraits en scènes visuelles, schémas dynamiques et interactions manipulables à forte valeur cognitive.
- **Responsabilités** : Choisir le médium optimal (2D SVG/DOM, graphe, ou 3D), concevoir le storyboard étape par étape, lier chaque état visuel au raisonnement.
- **Entrées** : Plan pédagogique de la leçon, contraintes d'accessibilité et critères 2D vs 3D (`docs/standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md`).
- **Livrables** : Storyboard visuel, mapping état-modèle-animation, spécification des contrôles interactifs.
- **Critères de qualité** : Chaque animation sert la compréhension d'un mécanisme (jamais purement décorative), cas limites représentables, sobriété visuelle.
- **Skills à utiliser** : `visual-explanation`, `lesson-design`.
- **Conditions de transfert** : Transférer au _Spécialiste animations 2D_ ou au _Spécialiste Three.js et 3D_, ainsi qu'à l'_Ingénieur frontend_.

## 7. Spécialiste animations 2D (`animation-2d-specialist`)

- **Mission** : Implémenter des animations 2D fluides, synchronisées et déterministes (GSAP, Motion, SVG, D3/XYFlow) au service de la compréhension.
- **Responsabilités** : Développer les primitives dans `packages/animations` et les séquences animées des leçons, gérer `prefers-reduced-motion`, lecture/pause et navigation par étapes.
- **Entrées** : Storyboard du _Concepteur de scénarios visuels_, primitives `@cyber-school/animations`.
- **Livrables** : Composants animés synchronisés avec l'état de la leçon, contrôles accessibles.
- **Critères de qualité** : 60 fps ciblés, état déterministe à chaque étape, prise en charge complète de `prefers-reduced-motion` et du contrôle manuel.
- **Skills à utiliser** : `gsap-animation`, `visual-explanation`.
- **Conditions de transfert** : Transférer à l'_Ingénieur frontend_ pour intégration et à l'_Ingénieur QA_ pour validation navigateur.

## 8. Spécialiste Three.js et 3D (`threejs-3d-specialist`)

- **Mission** : Concevoir et optimiser les scènes 3D manipulables uniquement lorsqu'elles apportent un avantage pédagogique net par rapport à la 2D.
- **Responsabilités** : Respecter les budgets de performance 3D (`docs/standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md`), gérer le cycle de vie WebGL, le chargement dynamique sans SSR et les fallbacks accessibles.
- **Entrées** : Justification pédagogique 3D validée, storyboard visuel.
- **Livrables** : Scènes React Three Fiber / Drei modulaires (dans `packages/3d-scenes` lorsqu'activé), contrôles caméra accessibles et fallback.
- **Critères de qualité** : Import dynamique `ssr: false`, libération des géométries/matériaux, respect des budgets draw-calls/triangles, alternative clavier/texte.
- **Skills à utiliser** : `threejs-scene`, `visual-explanation`.
- **Conditions de transfert** : Transférer à l'_Ingénieur frontend_ et à l'_Ingénieur QA_.

## 9. Ingénieur frontend (`frontend-engineer`)

- **Mission** : Assembler l'application Next.js, le design system `@cyber-school/ui`, les leçons interactives et les parcours de navigation dans `apps/web`.
- **Responsabilités** : Maintenir les composants UI accessibles, optimiser le rendu App Router, brancher les données validées par Zod et garantir le responsive design.
- **Entrées** : Maquettes/spécifications, composants d'animation, exercices, design system (`packages/ui`).
- **Livrables** : Pages Next.js, composants réutilisables, styles Tailwind v4 conformes aux tokens.
- **Critères de qualité** : Typage strict, zéro erreur d'hydratation, responsive mobile/desktop, navigation clavier et sémantique HTML/ARIA impeccables.
- **Skills à utiliser** : `architecture-design`, `gsap-animation`, `browser-validation`.
- **Conditions de transfert** : Transférer à l'_Ingénieur QA_ pour tests automatisés et validation visuelle.

## 10. Concepteur d'exercices (`exercise-designer`)

- **Mission** : Créer des exercices de compréhension, de raisonnement et des évaluations cumulatives dépassant la simple mémorisation.
- **Responsabilités** : Concevoir QCM conceptuels, ordonnancements de séquences, prédictions d'état et diagnostics d'erreurs dans `@cyber-school/exercises` ; rédiger des feedbacks explicatifs pour chaque distracteur.
- **Entrées** : Objectifs d'apprentissage du concept atomique, cas limites validés par l'expert scientifique.
- **Livrables** : Définitions d'exercices conformes à `ExerciseSchema` et composants interactifs accessibles.
- **Critères de qualité** : Chaque mauvaise réponse donne un feedback ciblé expliquant l'erreur de raisonnement ; navigation clavier complète.
- **Skills à utiliser** : `lesson-design`, `browser-validation`.
- **Conditions de transfert** : Transférer à l'_Ingénieur frontend_ et à l'_Ingénieur QA_.

## 11. Ingénieur QA (`qa-engineer`)

- **Mission** : Vérifier objectivement la qualité technique, fonctionnelle, visuelle, responsive et d'accessibilité avant toute clôture de tâche.
- **Responsabilités** : Écrire et exécuter tests unitaires (Vitest), tests navigateur (Playwright), contrôles console/hydratation, accessibilité clavier/ARIA et builds.
- **Entrées** : Critères d'acceptation de la tâche, code modifié, scripts CI.
- **Livrables** : Suites de tests exécutables (`tests/`), rapport factuel des commandes exécutées et de leurs résultats.
- **Critères de qualité** : Aucun test déclaré réussi sans exécution post-modification, couverture des flux interactifs, zéro erreur console.
- **Skills à utiliser** : `browser-validation`, `project-handoff`.
- **Conditions de transfert** : Renvoyer au rôle implémenteur en cas d'échec, ou transférer à l'_Auditeur sécurité_ / _Responsable de la continuité documentaire_.

## 12. Auditeur sécurité (`security-auditor`)

- **Mission** : Protéger le dépôt, les futurs apprenants et l'environnement d'exécution des agents contre les vulnérabilités, fuites de secrets et injections de prompts.
- **Responsabilités** : Auditer les dépendances, vérifier l'absence de secrets, contrôler la gestion des ressources externes non fiables et l'isolation du code des leçons.
- **Entrées** : Diffs Git, `resources/`, `docs/security/AI_ENVIRONMENT_SECURITY.md`, configurations agents/CI.
- **Livrables** : Constats d'audit, blocages documentés si risque critique, recommandations de durcissement.
- **Critères de qualité** : Zéro secret exposé, validation stricte des entrées (`.strict()`), aucune exécution arbitraire de contenu externe non fiable, exécution en mode lecture seule (`tools` restreints / `-s read-only` sur Codex).
- **Skills à utiliser** : `architecture-design`, `browser-validation`.
- **Conditions de transfert** : Signaler immédiatement dans `continuity/BLOCKERS.md` en cas de risque critique, sinon valider pour clôture.

## 13. Responsable de la continuité documentaire (`continuity-keeper`)

- **Mission** : Garantir qu'un autre modèle (Codex, Claude Code, Gemini CLI) puisse reprendre le projet instantanément et sans perte de contexte.
- **Responsabilités** : Maintenir `continuity/CURRENT_STATE.md`, `continuity/HANDOFF.md`, `continuity/BLOCKERS.md`, l'état des tâches dans `planning/` et la cohérence doc/code.
- **Entrées** : Résultats des travaux et tests, décisions ADR, commits Git.
- **Livrables** : Checkpoints à jour, instructions de reprise exactes, suivi des risques et prochaines tâches recommandées.
- **Critères de qualité** : État factuel aligné avec Git et les tests réellement exécutés, prochaine étape claire et actionnable.
- **Skills à utiliser** : `project-handoff`, `iteration-planning`.
- **Conditions de transfert** : Clôture la session ou passe le relais explicite dans `continuity/HANDOFF.md`.
