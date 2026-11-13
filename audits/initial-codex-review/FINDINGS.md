# Registre consolidé des constats

Audit du 13 novembre 2026. Périmètre : les 120 fichiers initiaux inventoriés, sans commit de référence. Les lignes renvoient au contenu initial, conservé intact.

**Gravité** : critique = compromission/perte irréversible avérée ; élevée = blocage du socle ou défaillance importante d'intégrité/reprise ; moyenne = fonctionnalité, contrôle ou maintenabilité à corriger ; faible = défaut local à faible impact immédiat. Aucun constat de gravité critique n'est établi. Une priorité P0 peut concerner un défaut de gravité élevée.

**Nature** : « confirmé » repose sur une observation ou sur un chemin de code explicite ; « risque » désigne une conséquence non reproduite dans l'application ; « non vérifié » ne vaut jamais échec du produit. Les estimations sont du temps d'ingénierie indicatif, hors délais de revue et d'accès réseau. Les dépendances désignent les prérequis de correction, pas une autorisation de les appliquer.

## AUD-001 — Installation gelée impossible

- **Catégorie / gravité / nature** : reproductibilité / élevée / confirmé.
- **Emplacement** : `pnpm-lock.yaml` absent ; `.github/workflows/ci.yml:26` ; `package.json:5`.
- **Constat** : la CI exige un lockfile absent ; aucun `node_modules` n'est installé.
- **Preuve** : `corepack pnpm install --frozen-lockfile --ignore-scripts` retourne 1 et `ERR_PNPM_NO_LOCKFILE`. Voir `CHECK_RESULTS.json`.
- **Impact** : un checkout neuf ne peut franchir l'installation CI ; versions résolues et dépendances transitives inconnues.
- **Cause probable** : bootstrap interrompu avant la résolution et la validation des dépendances.
- **Recommandation** : après autorisation explicite, résoudre les versions déclarées, examiner le résultat et versionner le lockfile ; conserver ensuite l'installation gelée.
- **Effort** : S, 1–3 h. **Dépendances** : AUD-002 et autorisation de créer le lockfile.
- **Critère de correction** : installation gelée réussie sur un checkout neuf, lockfile inchangé après installation et suite de validation exécutée.

## AUD-002 — Version Node locale hors des moteurs pris en charge

- **Catégorie / gravité / nature** : environnement / élevée / confirmé.
- **Emplacement** : `package.json:7` ; `README.md:7` ; `.github/workflows/ci.yml:20`.
- **Constat** : `node >=22.0.0` autorise Node 23.9.0, effectivement présent et annoncé testé. Les métadonnées npm de Vitest 5.1.0 et jsdom 31.0.1 excluent cette branche ; jsdom exige notamment `^22.22.2 || ^24.15.0 || >=26.0.0`.
- **Preuve** : versions locales et `REGISTRY_VERSION_CHECKS_NETWORK.json`, champs `engines` de ces deux packages.
- **Impact** : l'environnement documenté ne satisfait pas les moteurs des outils de test ; les résultats ne sont pas reproductibles entre local et CI.
- **Cause probable** : versions d'outils choisies sans matrice de compatibilité Node.
- **Recommandation** : choisir une branche LTS compatible, borner le moteur et documenter/épingler la même version pour local et CI.
- **Effort** : XS, 30–60 min. **Dépendances** : aucune ; changement d'environnement à approuver séparément si nécessaire.
- **Critère de correction** : Node choisi satisfait tous les `engines` résolus, puis installation et tests passent sur cette version.

## AUD-003 — Aucune base Git récupérable

- **Catégorie / gravité / nature** : continuité / élevée / confirmé.
- **Emplacement** : dépôt Git ; ensemble des fichiers initiaux.
- **Constat** : branche `main` sans commit ; tous les fichiers sont non suivis.
- **Preuve** : `git status --short --branch` ; `git log -n 5 --oneline` échoue ; `git ls-files` est vide.
- **Impact** : aucun rollback versionné, provenance, diff de référence ou checkout pour un autre agent ; `git diff` vide pourrait donner une fausse impression de propreté.
- **Cause probable** : initialisation Git sans premier enregistrement.
- **Recommandation** : après revue des secrets et du rapport, enregistrer une base explicitement identifiée comme validée ou incomplète ; prévoir sauvegarde et branche de travail.
- **Effort** : XS, 30–60 min. **Dépendances** : revue humaine du périmètre et des preuves.
- **Critère de correction** : commit reproductible, fichiers attendus suivis, reprise démontrée depuis son identifiant. Aucun commit n'a été créé pendant l'audit.

## AUD-004 — Import de workspace non déclaré au point d'exécution racine

- **Catégorie / gravité / nature** : dépendances / élevée / défaut structurel confirmé, échec après installation non exécuté.
- **Emplacement** : `tests/scripts/validate-curriculum.ts:3` ; `package.json:21` et dépendances racine.
- **Constat** : le script exécuté depuis la racine importe `@cyber-school/lesson-runtime`, mais la racine ne déclare pas cette dépendance workspace. Construire le package ne crée pas une dépendance du consommateur.
- **Preuve** : comparaison de l'import et des six manifestes ; configuration pnpm isolée non personnalisée dans le dépôt.
- **Impact** : résolution Node non garantie, normalement absente dans une installation pnpm isolée ; étape CI de validation susceptible de bloquer après résolution d'AUD-001.
- **Cause probable** : confusion entre présence dans le monorepo et dépendance accessible au script.
- **Recommandation** : déclarer le consommateur réel ou déplacer l'exécution dans un workspace qui dépend explicitement du runtime.
- **Effort** : XS, 30–60 min. **Dépendances** : AUD-001 ; autorisation de modifier les manifestes.
- **Critère de correction** : `corepack pnpm validate:curriculum` passe en installation isolée sans hoisting correctif implicite.

## AUD-005 — Démarrage en développement sans construction des exports

- **Catégorie / gravité / nature** : chaîne de développement / élevée / configuration confirmée, conséquence à reproduire après installation.
- **Emplacement** : `turbo.json`, tâche `dev` ; `packages/*/package.json`, exports `dist/` ; `README.md:20`.
- **Constat** : seuls `next dev` et aucune tâche de construction/watch des packages sont démarrés. Les quatre packages exportent des fichiers `dist/` absents du dépôt.
- **Preuve** : manifeste des tâches et exports ; absence de `dist/`. `transpilePackages` ne produit pas ces fichiers manquants.
- **Impact** : le parcours documenté « install puis dev » ne prépare pas ses imports ; modifications des bibliothèques compilées non suivies automatiquement.
- **Cause probable** : orchestration production réutilisée sans stratégie de développement.
- **Recommandation** : définir préparation et watch des packages compilés, ou une stratégie explicite d'exports source compatible Next/Vitest.
- **Effort** : S, 2–4 h. **Dépendances** : AUD-001.
- **Critère de correction** : sur checkout sans artefacts, `dev` affiche les deux pages et une modification d'une primitive partagée est visible sans commande manuelle.

## AUD-006 — Entrées de cache incomplètes pour le contenu et les configurations

- **Catégorie / gravité / nature** : intégrité des builds / élevée / risque statiquement étayé.
- **Emplacement** : `turbo.json`, `build.inputs` ; `apps/web/src/lib/curriculum-data.ts:31` ; `tsconfig.base.json` et `eslint.config.mjs` racine.
- **Constat** : JSON sous `curriculum/`, `lessons/`, `resources/` et configurations communes externes aux workspaces ne sont pas explicitement inclus dans les empreintes des tâches qui les consomment.
- **Preuve** : `inputs` contient seulement `$TURBO_DEFAULT$` et `.env*`, sans `globalDependencies` ; les JSON sont lus via `fs`.
- **Impact** : cache pouvant restituer un site ou une validation antérieurs après changement de contenu ou de règle commune.
- **Cause probable** : dépendances fichiers hors graphe de packages non modélisées.
- **Recommandation** : déclarer les entrées communes et pédagogiques pour les tâches concernées ; éviter une invalidation globale inutilement large.
- **Effort** : S, 1–3 h. **Dépendances** : AUD-001.
- **Critère de correction** : après cache chaud, changer uniquement un manifeste puis une règle commune provoque les réexécutions attendues et modifie le rendu/diagnostic.

## AUD-007 — Sources Tailwind pointant hors des packages réels

- **Catégorie / gravité / nature** : rendu / élevée / chemins erronés confirmés, rendu non observé.
- **Emplacement** : `apps/web/src/app/globals.css:4`.
- **Constat** : les trois `@source ../../../packages/...` se résolvent en `apps/packages/...`, répertoires inexistants.
- **Preuve** : résolution absolue dans `STATIC_CHECKS.json` ; les sources se calculent depuis la feuille CSS.
- **Impact** : classes propres aux composants partagés susceptibles de manquer, avec perte de styles, d'états et de focus ; la détection automatique depuis `apps/web` n'assure pas ces sources externes.
- **Cause probable** : un niveau `..` manquant.
- **Recommandation** : corriger les chemins et vérifier les styles effectivement produits, y compris les variantes absentes des pages applicatives.
- **Effort** : XS, 30–60 min. **Dépendances** : AUD-001.
- **Critère de correction** : tous les chemins existent ; styles des boutons, badges, feedbacks et focus constatés en navigateur desktop/mobile.

## AUD-008 — Intégrité incomplète des exercices, évaluations et identifiants

- **Catégorie / gravité / nature** : contrats pédagogiques / élevée / confirmé par exécution directe.
- **Emplacement** : `packages/lesson-runtime/src/validator.ts:104` ; `schemas.ts:117` et `:149`.
- **Constat** : pas de contrôle des concepts d'exercices, de l'appartenance de la bonne réponse, des permutations, des références d'évaluations, des doublons d'exercices, des slugs ou des chapitres.
- **Preuve** : sept mutations invalides retournent `valid: true` dans `INTEGRITY_PROBES.json`. Les formes restent compatibles avec les champs des schémas ; leur parsing Zod n'a pas été exécuté.
- **Impact** : exercices impossibles à réussir, collisions de clés et évaluations orphelines peuvent passer la validation annoncée.
- **Cause probable** : validateur limité au graphe des concepts et à une partie des liens de leçons.
- **Recommandation** : définir et vérifier unicité, références et invariants relationnels à tous les niveaux, avec tests négatifs.
- **Effort** : M, 0,5–1,5 j. **Dépendances** : décisions de périmètre d'unicité ; AUD-001 pour la suite complète.
- **Critère de correction** : les sept mutations sont rejetées avec diagnostics localisés ; corpus actuel accepté via Zod puis validateur.

## AUD-009 — L'application ne vérifie pas l'intégrité du graphe

- **Catégorie / gravité / nature** : frontière données/application / élevée / confirmé par lecture.
- **Emplacement** : `apps/web/src/lib/curriculum-data.ts:43` ; `docs/architecture/OVERVIEW.md`, flux de données.
- **Constat** : `loadAcademyData()` parse trois JSON par Zod sans appeler `validateCurriculumIntegrity`, contrairement à l'affirmation documentaire de validation côté application.
- **Preuve** : fonction complète ; validation relationnelle uniquement dans un test et dans le script séparé.
- **Impact** : un build ou lancement isolé peut accepter un cycle ou des références inexistantes ; l'UI masque certains liens manquants par un affichage de l'ID brut.
- **Cause probable** : confusion entre conformité de forme et intégrité référentielle.
- **Recommandation** : choisir un point de validation obligatoire avant génération/publication, appelé par les chemins de build pertinents ; éviter une validation lourde à chaque rendu.
- **Effort** : S, 2–4 h. **Dépendances** : AUD-008.
- **Critère de correction** : un JSON cyclique ou orphelin bloque la génération du site avec diagnostic utile, même en lançant directement le build applicatif.

## AUD-010 — Skills Claude annoncés mais absents

- **Catégorie / gravité / nature** : agents / élevée / confirmé.
- **Emplacement** : `CLAUDE.md:12` ; `.claude/agents/*.md`, champs `skills` ; `.claude/skills/` absent.
- **Constat** : huit skills canoniques existent dans `.agents/skills/`, mais les miroirs Claude et tout mécanisme de synchronisation sont absents.
- **Preuve** : inventaire ; chemins natifs documentés par Anthropic ; noms préchargés par les six adaptateurs.
- **Impact** : le dépôt seul ne garantit ni découverte native Claude ni préchargement de ces skills ; la lecture manuelle demeure possible.
- **Cause probable** : adaptateur annoncé avant sa réalisation.
- **Recommandation** : fournir une adaptation reproductible vers la source canonique, sans copies éditables divergentes, et vérifier la découverte sur la version retenue.
- **Effort** : S, 1–3 h. **Dépendances** : matrice AUD-012.
- **Critère de correction** : session Claude propre listant les huit skills du dépôt et sous-agent capable de charger ceux déclarés ; égalité des contenus contrôlée automatiquement.

## AUD-011 — Imports CLAUDE.md rendus littéraux

- **Catégorie / gravité / nature** : instructions / moyenne / confirmé par format et documentation.
- **Emplacement** : `CLAUDE.md:7` à `:9`.
- **Constat** : les références `@docs/...` et `@continuity/...` sont entre backticks ; le parseur d'import Claude ignore les spans de code.
- **Preuve** : fichier et documentation officielle « How Claude remembers your project ».
- **Impact** : ces références ne sont pas automatiquement incorporées comme imports ; elles exigent une lecture volontaire de l'agent, déjà demandée par la prose.
- **Cause probable** : mise en forme Markdown incompatible avec l'intention d'import natif.
- **Recommandation** : choisir explicitement imports natifs ou liens à lecture manuelle, puis tester le contexte chargé.
- **Effort** : XS, 15–30 min. **Dépendances** : aucune.
- **Critère de correction** : inspection du contexte Claude démontrant le chargement attendu du guide et du protocole.

## AUD-012 — Compatibilité des CLI non définie

- **Catégorie / gravité / nature** : infrastructure agents / moyenne / absence confirmée, incompatibilité Codex locale non entièrement vérifiée.
- **Emplacement** : `README.md` ; `.codex/agents/*.toml` ; `.gemini/settings.json`.
- **Constat** : aucune version minimale/validée des trois CLI. Localement : Codex 0.87.0 avec `collab` désactivé, Claude 2.1.145, Gemini 0.64.0. Le schéma Codex actuel est compatible avec les champs présents, sans preuve d'application par cet ancien CLI.
- **Preuve** : aide/versions/flags locaux ; six TOML parsés ; six rôles exposés dans la session d'audit ; chargeur natif Gemini acceptant six agents et huit skills.
- **Impact** : une installation différente peut ignorer des adaptateurs pourtant syntaxiquement valides.
- **Cause probable** : vérification du format sans contrat de version de l'outil.
- **Recommandation** : matrice de compatibilité, commandes de diagnostic et test de découverte sans lancement d'implémentation.
- **Effort** : S, 2–4 h. **Dépendances** : disponibilité des CLI choisis.
- **Critère de correction** : preuve de découverte des instructions, skills et agents pour chacun des trois outils dans un environnement documenté.

## AUD-013 — Inspection en lecture seule non imposée dans tous les adaptateurs

- **Catégorie / gravité / nature** : permissions / élevée / risque confirmé dans la configuration, aucune action dangereuse observée.
- **Emplacement** : `.gemini/agents/security-auditor.md:1` ; `.codex/agents/security_auditor.toml` ; `.claude/agents/security-auditor.md`.
- **Constat** : Gemini ne déclare aucune liste d'outils ; son chargeur produit un `toolConfig` absent et les outils sont hérités. Codex formule une consigne textuelle sans isolation spécifique du parent. Claude limite bien son auditeur à Read/Glob/Grep.
- **Preuve** : `GEMINI_NATIVE_LOAD.json` et métadonnées des adaptateurs ; documentation des outils.
- **Impact** : un auditeur présenté comme inspecteur peut disposer de capacités d'écriture/exécution selon le parent ; moindre privilège non uniforme.
- **Cause probable** : assimilation d'une instruction au modèle à une restriction d'outil.
- **Recommandation** : allowlist Gemini adaptée et session parent Codex réellement en lecture seule pour l'audit ; documenter les limites. Ne pas proposer une clé de sandbox Codex ignorée dans un fichier d'agent.
- **Effort** : S, 1–3 h. **Dépendances** : AUD-012.
- **Critère de correction** : inspection des capacités effectives et refus d'une écriture de contrôle dans un environnement jetable, sans toucher au dépôt utile.

## AUD-014 — Checkpoint et relais décalés par rapport au code

- **Catégorie / gravité / nature** : continuité / élevée / confirmé.
- **Emplacement** : `continuity/CURRENT_STATE.md:14` ; `continuity/HANDOFF.md` ; `continuity/RESUME_PROTOCOL.md:10`.
- **Constat** : quatre packages, les données et l'application sont annoncés à implémenter alors qu'ils existent. Le relais reste initial ; aucun journal de tests ni commande en cours ; lien vers BLOCKERS doublant `continuity/`.
- **Preuve** : inventaire et comparaison directe ; un lien Markdown local cassé dans `STATIC_CHECKS.json`.
- **Impact** : reprise fondée sur un état faux, risque de réécriture du travail existant et de perte du point d'arrêt.
- **Cause probable** : checkpoint de documentation non mis à jour pendant l'implémentation.
- **Recommandation** : réconcilier état/tâche/fichiers/commandes, ajouter identifiant de base, statut des étapes et prochaine action exacte ; vérifier automatiquement liens et champs requis.
- **Effort** : S, 1–2 h. **Dépendances** : AUD-003 pour une référence Git stable.
- **Critère de correction** : un agent sans conversation retrouve les fichiers réalisés, les vérifications réellement faites et le prochain travail sans ambiguïté.

## AUD-015 — États de tâches et travail parallèle sans contrôle exécutable

- **Catégorie / gravité / nature** : gouvernance / moyenne / incohérence confirmée et risque de collision.
- **Emplacement** : `planning/tasks/TASK-003-curriculum-graph-viewer.md:4` et `:8` ; `planning/backlog/BACKLOG.md` ; `continuity/RESUME_PROTOCOL.md`.
- **Constat** : TASK-003 est Ready bien que sa dépendance TASK-002 soit In Progress. Aucun propriétaire actif, lot de fichiers réservé ou protocole de consolidation des checkpoints concurrents.
- **Preuve** : trois fiches tâches et workflow CI, sans validation des états/critères de clôture.
- **Impact** : démarrage prématuré de la suite ; écrasement de fichiers ou de relais entre agents ; une déclaration Done n'est reliée à aucun résultat machine.
- **Cause probable** : statuts éditoriaux sans règles de transition.
- **Recommandation** : vérifier dépendances Ready/Done et preuves de validation en CI ; définir un propriétaire des fichiers de continuité et des branches/worktrees distincts pour le travail simultané.
- **Effort** : M, 0,5–1 j. **Dépendances** : AUD-003 et AUD-014.
- **Critère de correction** : une tâche Ready bloquée en amont et une clôture sans preuve sont rejetées ; exercice de deux branches sans perte de checkpoints.

## AUD-016 — Skill d'animation citant une API inexistante

- **Catégorie / gravité / nature** : skills / moyenne / confirmé.
- **Emplacement** : `.agents/skills/gsap-animation/SKILL.md:16` ; `packages/animations/src/index.ts`.
- **Constat** : le skill prescrit `useReducedMotion` et des helpers de timeline ; les exports offrent `usePrefersReducedMotion`, `getStepDuration`, `useGsapScope`, `MotionStepPanel`.
- **Preuve** : confrontation des deux fichiers ; aucun export de timeline.
- **Impact** : appliquer littéralement le skill produit des imports invalides ou du code inventé.
- **Cause probable** : skill écrit avant la stabilisation des primitives.
- **Recommandation** : aligner les instructions sur les exports et fournir un exemple vérifié minimal ; ne pas ajouter d'API uniquement pour satisfaire le texte.
- **Effort** : XS, 30–60 min. **Dépendances** : aucune.
- **Critère de correction** : exemple de consommation du skill compilé contre le package réel.

## AUD-017 — Directive ESLint de hook sans plugin enregistré

- **Catégorie / gravité / nature** : qualité / moyenne / écart statique confirmé, diagnostic ESLint non exécuté.
- **Emplacement** : `packages/animations/src/gsap-scope.ts:22` ; `packages/animations/eslint.config.mjs:1` ; `eslint.config.mjs:4`.
- **Constat** : une directive vise `react-hooks/exhaustive-deps`, tandis que la configuration de ce package n'enregistre que JS et TypeScript ESLint, sans plugin React Hooks.
- **Preuve** : graphe de configurations ; plugin seulement indirectement utilisé par la configuration Next de l'application.
- **Impact** : probable diagnostic de règle inconnue et absence d'analyse des hooks dans les packages React.
- **Cause probable** : copie d'une suppression depuis un environnement Next.
- **Recommandation** : définir une politique de lint React pour les packages, incluant les hooks, et justifier précisément les dépendances du hook générique.
- **Effort** : S, 1–2 h. **Dépendances** : AUD-001 ; ajout de dépendance soumis à autorisation si requis.
- **Critère de correction** : lint effectif sans règle inconnue et défaut de dépendance de hook détecté sur un exemple de contrôle.

## AUD-018 — Commande globale et périmètre de vérification incomplets

- **Catégorie / gravité / nature** : qualité / moyenne / confirmé par configuration.
- **Emplacement** : `package.json:22` ; `tests/scripts/validate-curriculum.ts` ; `playwright.config.ts` ; `apps/web/eslint.config.mjs:4` ; tsconfig des packages.
- **Constat** : `check:all` omet `validate:curriculum`, présent en CI. Les tâches lint/typecheck des workspaces ne couvrent pas les scripts/configurations racine ; les tests unitaires sont exclus des builds TypeScript et aucun typecheck spécifique ne les couvre. L'application ne reprend pas les règles communes de lint.
- **Preuve** : scripts, inclusions/exclusions et configurations lues.
- **Impact** : validation locale et CI divergent ; erreurs de scripts et dérive des conventions possibles derrière un succès partiel.
- **Cause probable** : orchestration des workspaces confondue avec couverture de tous les fichiers du dépôt.
- **Recommandation** : définir une porte de validation unique et un périmètre explicite pour scripts/tests/configurations, en partageant les règles pertinentes.
- **Effort** : S, 2–4 h. **Dépendances** : AUD-004 et AUD-017.
- **Critère de correction** : la commande globale inclut le curriculum et détecte un défaut volontaire dans un script racine et dans un test typé.

## AUD-019 — Chargement et implémentation encore spécialisés pour une seule leçon

- **Catégorie / gravité / nature** : passage à l'échelle / moyenne / limitation actuelle confirmée, risque futur.
- **Emplacement** : `apps/web/src/lib/curriculum-data.ts:37` ; `tests/scripts/validate-curriculum.ts` ; `apps/web/src/components/tcp-handshake-simulator.tsx:63` et `:157` ; route TCP fixe.
- **Constat** : un curriculum et une leçon sont codés en dur. Étapes/explications existent à la fois dans le JSON et dans les frames TSX, sans liaison par identifiant. Le validateur CLI énumère les leçons mais un seul fichier curriculum.
- **Preuve** : chemins fixes et deux jeux d'étapes distincts ; aucune interface de registre de leçons.
- **Impact** : chaque nouveau cours exige du câblage dans le shell ; dérive contenu/visuel et validation incomplète des futurs domaines.
- **Cause probable** : démonstrateur livré avant généralisation du contrat.
- **Recommandation** : éprouver un registre et une interface de leçon avec un deuxième cours léger avant toute industrialisation ; garder la simulation spécifique au domaine.
- **Effort** : M, 1–2 j. **Dépendances** : AUD-008 et AUD-009 ; ADR à valider si structurant.
- **Critère de correction** : ajout d'une seconde leçon et d'un second curriculum détectés et validés sans modification du chargeur commun ; lien explicite état/étape/explication.

## AUD-020 — Compteur d'exercices désynchronisé des réponses affichées

- **Catégorie / gravité / nature** : exercices / moyenne / chemin de code confirmé, reproduction navigateur bloquée.
- **Emplacement** : `packages/exercises/src/exercise-card.tsx:62`, `:70`, `:139` ; `apps/web/src/components/tcp-handshake-simulator.tsx:230` et `:708`.
- **Constat** : reset, changement d'option et réordonnancement effacent `submitted` sans notifier le parent ; celui-ci conserve le booléen de la dernière soumission.
- **Preuve** : `onResult` n'est appelé que par `handleSubmit`.
- **Impact** : une carte sans réponse validée peut encore être comptée parmi les exercices « validés ».
- **Cause probable** : état de réponse et score agrégé maintenus séparément sans protocole d'invalidation.
- **Recommandation** : définir les états de tentative et synchroniser toute modification, ou préciser une sémantique explicite d'acquis historique distincte du résultat courant.
- **Effort** : S, 1–3 h. **Dépendances** : AUD-001 pour validation React.
- **Critère de correction** : réussite puis reset/changement d'option/ordre mettent compteur et carte dans l'état attendu ; test couvrant les trois chemins.

## AUD-021 — Radios ARIA dépourvues de navigation aux flèches

- **Catégorie / gravité / nature** : accessibilité / moyenne / confirmé par implémentation, observation assistive non faite.
- **Emplacement** : `packages/exercises/src/exercise-card.tsx:127`.
- **Constat** : des boutons avec `role="radio"` et `aria-checked` ne disposent ni de roving tabindex ni de gestion des flèches.
- **Preuve** : contrôles concernés ; modèle radio officiel WAI-ARIA. Tab/Entrée/Espace restent utilisables par leur comportement natif de bouton.
- **Impact** : interaction différente de celle annoncée aux utilisateurs de technologies d'assistance et multiplication des arrêts Tab.
- **Cause probable** : sémantique ARIA ajoutée sans implémentation du comportement associé.
- **Recommandation** : radios HTML natives de préférence, ou pattern ARIA complet avec focus géré.
- **Effort** : S, 2–4 h. **Dépendances** : AUD-001 et AUD-007.
- **Critère de correction** : Tab entre/sort du groupe, flèches déplacent focus et sélection, Espace sélectionne ; test clavier réel sur les trois exercices.

## AUD-022 — Réduction des mouvements incomplète

- **Catégorie / gravité / nature** : accessibilité / moyenne / transition CSS confirmée, effet initial JS à observer.
- **Emplacement** : `packages/ui/src/components/feedback.tsx:79` ; `packages/animations/src/reduced-motion.ts:6` ; `motion-primitives.tsx`.
- **Constat** : progression animée par CSS pendant 300 ms sans variante reduced-motion. Le hook commence à false et ne consulte la préférence qu'après montage.
- **Preuve** : classes et cycle des effets ; aucun média global neutralisant cette transition.
- **Impact** : respect strict de la préférence non garanti, surtout au premier affichage ; une brève animation initiale est un risque, pas une observation navigateur.
- **Cause probable** : prise en compte limitée aux durées JS après hydratation.
- **Recommandation** : couvrir aussi les transitions CSS et choisir un état initial sûr pour le rendu/hydratation.
- **Effort** : S, 1–3 h. **Dépendances** : AUD-001.
- **Critère de correction** : contexte Playwright reduced-motion avant navigation, puis transitions et montage sans mouvement non demandé.

## AUD-023 — Pause de progression sans pause du mouvement actif

- **Catégorie / gravité / nature** : animations / moyenne / capacité absente confirmée par code.
- **Emplacement** : `apps/web/src/components/tcp-handshake-simulator.tsx:240`, `:254`, `:620`.
- **Constat** : `isPlaying` contrôle un timeout de 2,2 s ; les tweens GSAP lancés séparément n'ont pas de contrôleur pause/reprise et ne dépendent pas de ce drapeau.
- **Preuve** : `gsap.fromTo` sans référence conservée ; bouton Pause ne modifiant que `isPlaying`.
- **Impact** : la lecture automatique s'arrête, mais le segment en mouvement poursuit son tween ; inspection fine et synchronisation temporelle limitées.
- **Cause probable** : storyboard à étapes et animation locale développés comme deux horloges indépendantes.
- **Recommandation** : préciser le contrat de pause et synchroniser la progression visuelle si la pause du mouvement est requise, conformément au skill.
- **Effort** : S, 2–4 h. **Dépendances** : AUD-016 et contrat visuel.
- **Critère de correction** : test en cours de mouvement vérifiant arrêt, conservation de position et reprise déterministe, ou libellé/documentation explicites de la seule pause des étapes.

## AUD-024 — Historique visuel de perte remplacé par une livraison

- **Catégorie / gravité / nature** : fidélité pédagogique du visuel / moyenne / confirmé par conditions de rendu.
- **Emplacement** : `apps/web/src/components/tcp-handshake-simulator.tsx:457`.
- **Constat** : la ligne SYN-ACK est tronquée et pointillée uniquement à `simulateLoss && stepIndex === 2`. À l'étape suivante elle devient une ligne livrée ; aucun tracé distinct ne conserve la perte initiale.
- **Preuve** : conditions de `x2`, `strokeDasharray` et `markerEnd` ; scénario LOSS_FRAMES.
- **Impact** : l'apprenant ne peut plus distinguer le segment perdu de sa retransmission dans l'historique affiché.
- **Cause probable** : même ligne recyclée pour deux événements.
- **Recommandation** : représenter les événements avec identité et statut, en conservant perte et retransmission distinctes.
- **Effort** : S, 1–3 h. **Dépendances** : aucune structurelle ; AUD-001 pour vérification visuelle.
- **Critère de correction** : après retransmission, les deux événements restent identifiables et retour arrière/reset restitue les mêmes états.

## AUD-025 — Formulation TCP et compteurs ambigus

- **Catégorie / gravité / nature** : exactitude pédagogique / moyenne / confirmé pour le texte, ambiguïté pour les compteurs.
- **Emplacement** : `lessons/tcp-three-way-handshake/lesson.json:77` ; `apps/web/src/components/tcp-handshake-simulator.tsx:107`, `:380`, `:580`.
- **Constat** : l'exercice dit qu'après l'envoi du SYN-ACK le client sait que les deux sens fonctionnent ; cette connaissance exige sa réception. Les champs « SEQ courant » / « ACK attendu » n'indiquent pas s'ils décrivent le dernier segment, SND.NXT ou RCV.NXT.
- **Preuve** : scénario de perte contredisant la première formulation ; valeurs affichées à 100/300 après émission des SYN alors que les prochains numéros sont 101/301.
- **Impact** : confusion entre émission/réception, en-tête transmis et état interne ; le déroulé nominal et les bonnes réponses numériques restent corrects.
- **Cause probable** : simplification sans définition des variables affichées.
- **Recommandation** : préciser les instants et nommer les variables ; ajouter une question sur le serveur avant réception du troisième ACK.
- **Effort** : S, 1–3 h. **Dépendances** : revue scientifique.
- **Critère de correction** : chaque valeur et transition se rattache à un événement explicite, conforme aux exemples et variables de la RFC 9293.

## AUD-026 — Laboratoire externe ne correspondant pas à sa promesse

- **Catégorie / gravité / nature** : sources / moyenne / confirmé par consultation.
- **Emplacement** : `lessons/tcp-three-way-handshake/lesson.json:118` ; `resources/sources.json`, `wireshark-tcp-docs`.
- **Constat** : le lien intitulé laboratoire de handshake et décrit comme guide du filtre `tcp.flags.syn == 1` mène à « Following Protocol Streams », sans ce filtre ni déroulé de laboratoire correspondant.
- **Preuve** : page officielle Wireshark ouverte pendant l'audit.
- **Impact** : l'apprenant est dirigé vers une référence voisine mais ne dispose pas des consignes annoncées.
- **Cause probable** : lien générique utilisé comme activité validée.
- **Recommandation** : fournir les étapes et supports locaux de l'activité, puis un lien exact complémentaire ; tracer section et date de vérification.
- **Effort** : S, 1–2 h. **Dépendances** : choix d'un support de capture légitime.
- **Critère de correction** : un lecteur peut effectuer le filtrage et identifier les trois segments avec les seules consignes publiées.

## AUD-027 — Publication et versions de contenu sans preuves de validation

- **Catégorie / gravité / nature** : publication pédagogique / élevée / absence confirmée, aucun déploiement constaté.
- **Emplacement** : `lessons/tcp-three-way-handshake/lesson.json:2` et `:10` ; `schemas.ts:164` ; `docs/decisions/ADR-000*.md`.
- **Constat** : leçon marquée published avec critères TASK-002 encore décochés ; `version: "1.0"` est un littéral de format, sans révision de contenu, relecteur, date de validation ni historique Git. Les ADR Accepted n'identifient pas d'approbateur humain.
- **Preuve** : manifeste, fiches et quatre ADR ; aucun journal de validation fourni dans le dépôt initial.
- **Impact** : statut publié assimilable à une garantie non démontrée ; impossible d'associer une future tentative apprenant à une révision scientifique précise.
- **Cause probable** : statut d'exemple devenu statut métier sans workflow.
- **Recommandation** : distinguer version de schéma/révision de contenu, définir preuves et revue requises avant publication ; vérifier le statut dans le chargeur/catalogue.
- **Effort** : M, 0,5–1 j. **Dépendances** : AUD-003, AUD-008, AUD-015 et décision de politique de publication.
- **Critère de correction** : publication sans preuve refusée ; révision, sources et décision humaine traçables ; brouillon non présenté comme publié.

## AUD-028 — Maîtrise et persistance encore limitées au prototype

- **Catégorie / gravité / nature** : évaluations / moyenne / capacité absente confirmée, prévue en itération 2.
- **Emplacement** : `packages/exercises/src/exercise-card.tsx:26` ; `apps/web/src/components/tcp-handshake-simulator.tsx:230` ; `schemas.ts:143` ; TASK-005 du backlog.
- **Constat** : seuls QCM, prédiction à choix et ordonnancement existent. Pas de persistance, historique de tentatives, moteur d'évaluation cumulative ni mesure de maîtrise ; `AssessmentBlueprint` reste un schéma non exécuté.
- **Preuve** : union discriminée à trois variantes et état React local ; aucune écriture de progression observée.
- **Impact** : rechargement perdant réponses/score ; association, analyse de diagramme, questions ouvertes et problèmes multi-concepts non disponibles. Cela ne viole pas à lui seul le périmètre minimal M1.
- **Cause probable** : incrément volontairement restreint du démonstrateur.
- **Recommandation** : traiter le modèle de tentatives et la persistance versionnée avant d'étendre les évaluations ; garder les formats nouveaux motivés par les objectifs.
- **Effort** : M, 1–2 j pour un premier incrément. **Dépendances** : AUD-020 et AUD-027.
- **Critère de correction** : rechargement/reprise cohérents, migration de révision définie, évaluation multi-concepts calculée et feedback conservé.

## AUD-029 — Tests trop restreints pour les garanties annoncées

- **Catégorie / gravité / nature** : assurance qualité / moyenne / couverture statique confirmée, suites non exécutées.
- **Emplacement** : `tests/e2e/tcp-handshake.spec.ts` ; tests des quatre packages et d'`apps/web` ; `playwright.config.ts:10`.
- **Constat** : 10 cas unitaires déclarés ; un scénario E2E décliné en deux viewports. Il ne termine pas le scénario de perte, ne vérifie qu'un exercice et ne teste pas Tab/Entrée/Espace sur les radios, pause, reduced-motion ou invalidation du score. Le test dit clavier d'ordonnancement utilise `fireEvent.click`. Chromium local peut être choisi hors révision attendue.
- **Preuve** : `STRUCTURE_CHECKS.json` et assertions présentes ; aucun audit axe ou benchmark mémoire/GPU.
- **Impact** : succès futur de la suite insuffisant pour établir toutes les garanties ; comparaison multi-environnements fragile. Le contrôle `scrollWidth` peut manquer un contenu masqué par `overflow-x: clip`.
- **Cause probable** : scénario de fumée présenté comme couverture complète.
- **Recommandation** : assertions ciblées sur les défauts et exigences ; version navigateur explicite ; artefacts de résultats/trace/captures en CI et vérification réelle du contenu visible.
- **Effort** : M, 0,5–1,5 j. **Dépendances** : AUD-001, AUD-007, AUD-020 à AUD-024.
- **Critère de correction** : flux nominaux et de perte, trois exercices, clavier et reduced-motion testés ; contrôles console et captures desktop/mobile effectivement exécutés.

## AUD-030 — Dépendances candidates à simplification

- **Catégorie / gravité / nature** : dépendances / faible / usage statique partiel.
- **Emplacement** : `apps/web/package.json`, `motion` ; `package.json` et `packages/ui/package.json`, `@vitejs/plugin-react` ; devDependencies de test d'`apps/web`.
- **Constat** : Motion est importé dans animations, pas directement dans web ; aucun import/configuration du plugin React Vite n'a été trouvé. Le test web actuel est un test de données en environnement Node.
- **Preuve** : revue des imports/configurations et `DEPENDENCY_STATIC_USAGE.json`. `react-dom`, bien que sans import source direct, est requis par Next et ne constitue pas un candidat automatique à suppression.
- **Impact** : surface de maintenance et de résolution supérieure au besoin démontré, sans gain mesuré actuellement.
- **Cause probable** : anticipation de futurs tests/composants.
- **Recommandation** : confirmer l'utilité après installation ; supprimer uniquement les dépendances effectivement inutilisées avec autorisation, sans ajouter d'outil d'analyse par défaut.
- **Effort** : XS, 30–60 min. **Dépendances** : AUD-001.
- **Critère de correction** : justification d'usage ou retrait approuvé, puis tests/build inchangés dans leur comportement.

## AUD-031 — Variante destructive du design system sous le contraste cible

- **Catégorie / gravité / nature** : accessibilité / faible / calcul confirmé, variante non utilisée dans la leçon actuelle.
- **Emplacement** : `packages/ui/src/styles/tokens.css` ; `packages/ui/src/components/button.tsx:17`.
- **Constat** : texte `#fff1f2` sur fond `#f43f5e`, ratio calculé 3,34:1, inférieur au seuil AA de 4,5:1 pour le petit texte prévu par le bouton.
- **Preuve** : calcul sRGB dans `SECURITY_STATIC_CHECKS.json` ; pas de mesure de couleurs finales en navigateur.
- **Impact** : future utilisation de cette variante susceptible de violer la cible AA ; aucune défaillance généralisée des contrastes n'est déduite.
- **Cause probable** : choix de tokens non soumis à contrôle de contraste.
- **Recommandation** : ajuster cette paire et vérifier les variantes sémantiques du design system.
- **Effort** : XS, 30–60 min. **Dépendances** : aucune pour le calcul ; AUD-007 pour le rendu.
- **Critère de correction** : ratio requis sur les couleurs calculées dans le navigateur, y compris états pertinents.

## AUD-032 — Schémas de ressources moins stricts que la politique annoncée

- **Catégorie / gravité / nature** : validation/sécurité documentaire / moyenne / confirmé par source et contrat Zod, exécution Zod indisponible.
- **Emplacement** : `packages/lesson-runtime/src/schemas.ts:23` ; `docs/security/AI_ENVIRONMENT_SECURITY.md`, section 2.
- **Constat** : la politique dit interdire les champs exécutables par un schéma strict ; l'implémentation utilise `z.object`, qui supprime les clés inconnues au parsing au lieu de refuser l'entrée. HTTPS et le marquage de contenu non fiable sont bien vérifiés.
- **Preuve** : schéma et documentation officielle Zod sur les clés inconnues.
- **Impact** : faux sentiment de rejet d'un document contenant des champs inattendus ; divergence de politique. Cela ne démontre aucune exécution de ces champs ni XSS : ils sont supprimés du résultat parsé et aucun exécuteur n'existe.
- **Cause probable** : confusion entre typage strict TypeScript, objet validé et rejet strict de données.
- **Recommandation** : choisir explicitement rejet ou suppression, aligner la politique et tester l'entrée brute et la donnée retournée ; ajouter provenance/section/revue utiles au corpus.
- **Effort** : S, 1–2 h. **Dépendances** : AUD-001 pour exécution Zod.
- **Critère de correction** : tests d'URL non HTTPS et de champ inconnu conformes à la politique, sans prétendre que Zod prévient à lui seul les injections d'instructions.
