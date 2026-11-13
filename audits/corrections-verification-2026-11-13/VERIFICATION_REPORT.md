# Vérification indépendante des corrections

**Date : 13 novembre 2026 — Africa/Douala. Résultat : corrections réelles, mais remédiation incomplète et fonctionnement global non validé.**

Comparaison avec les 32 constats de `audits/initial-codex-review/FINDINGS.md`, lecture du code actuel et nouvelles vérifications. **37 fichiers initiaux ont changé et 15 fichiers de source/configuration/skills ont été ajoutés**, hors dépendances et documents d'audit. Aucun fichier initial n'a été supprimé. L'absence de commit empêche d'attribuer les changements à un auteur ou à une révision Git précise.

Le bilan est de **19 corrections constatées dans le code/configuration, neuf corrections partielles et quatre constats encore ouverts**. « Correction constatée » signifie que le défaut ciblé est traité dans l'implémentation inspectée ; ce statut ne signifie pas que la compilation, le navigateur et tous les critères de réception ont réussi.

## Ce qui reste bloquant

1. **Installation inachevée et lockfile absent.** `node_modules/.pnpm` contient des packages extraits, mais ni `node_modules/.bin` ni le lien workspace racine vers le runtime ne sont présents. L'installation gelée échoue toujours avec `ERR_PNPM_NO_LOCKFILE`.
2. **Aucun commit.** La branche main ne contient toujours aucune base versionnée ; tous les fichiers restent non suivis.
3. **Continuité toujours obsolète.** CURRENT_STATE et HANDOFF n'ont pas changé depuis l'audit initial et demandent encore de créer le code déjà présent.
4. **Publication sans garantie de revue.** Les métadonnées de revue ont été ajoutées, mais le schéma et le validateur acceptent toujours une leçon published sans revue. Une référence vers un fichier de test ne constitue pas un résultat d'exécution.
5. **Nouveaux tests comportant des erreurs reproductibles ou démontrables**, décrites ci-dessous. Ils doivent être corrigés avant de pouvoir obtenir une validation complète après installation.

## Vérifications exécutées

| Vérification | Résultat observé |
| --- | --- |
| `corepack pnpm install --frozen-lockfile --ignore-scripts` | Échec 1, `ERR_PNPM_NO_LOCKFILE` ; aucune installation ni création de lockfile effectuée |
| `corepack pnpm typecheck` | Échec 1, `turbo` introuvable |
| `corepack pnpm lint` | Échec 1, `turbo` introuvable |
| `corepack pnpm test:unit` | Échec 1, `turbo` introuvable ; aucun cas Vitest du dépôt exécuté |
| `corepack pnpm build` | Échec 1, `turbo` introuvable |
| `corepack pnpm test:e2e` | Échec 1, `@playwright/test` local introuvable lors du chargement de la configuration par le Playwright global |
| `corepack pnpm validate:curriculum` | Échec 1, `turbo` introuvable |
| `corepack pnpm format:check` | Échec 1, `prettier` introuvable |
| `corepack pnpm validate:governance` | **Succès 0** : 58 fichiers Markdown, neuf fichiers de skills miroirs, trois tâches |

Ces commandes ont réellement été exécutées ; les sorties complètes figurent dans [CHECK_RESULTS.json](CHECK_RESULTS.json) et les journaux `check-*.txt`. Les échecs de préparation ne constituent pas des résultats de tests applicatifs. La suite ne peut pas être déclarée verte.

Des contrôles complémentaires ont pu être exécutés **sans installer ni relier de dépendance sur disque** :

- **17 sondes sur les schémas et le validateur originaux**, avec Zod 4.6.7 déjà présent dans le store local. Résolution d'import redirigée uniquement en mémoire. **15 attentes satisfaites ; deux défauts de politique de publication toujours acceptés**. Les sept anomalies qui passaient dans l'audit initial sont maintenant rejetées.
- **Chargeur applicatif original** : lecture du corpus actuel ; sonde virtuelle de deux catalogues et deux leçons réussie ; curriculum cyclique rejeté. Les données de la sonde restent en mémoire.
- **Quatre sondes de gouvernance**, avec surcouche de lecture virtuelle : le dépôt courant passe ; Ready avec dépendance ouverte et Done avec critères décochés sont refusés ; **Done avec cases cochées et simple titre “Vérifications”, sans résultat réel, est encore accepté**.
- **Chargeur natif Gemini 0.64.0** : six agents acceptés, sans erreur. L'auditeur reçoit bien uniquement `read_file`, `grep_search`, `glob`, `list_directory`. Aucun agent ni moteur de modèle n'a été lancé.
- **Calcul de contraste** de la variante destructive : **5,72:1**, contre 3,34:1 auparavant, pour les tokens par défaut.

Ces sondes ciblées ne remplacent pas les commandes pnpm, la compilation ou les suites Vitest/Playwright. Elles servent à vérifier des corrections précises malgré l'installation incomplète.

## État des 32 constats initiaux

**C** : correction constatée dans le code/configuration ; réception globale encore conditionnée aux tests. **P** : partiel. **O** : ouvert.

| ID | État | Vérification actuelle et reste à faire |
| --- | --- | --- |
| AUD-001 | O | Aucun `pnpm-lock.yaml` ; installation gelée impossible ; liens des outils/modules manquants. |
| AUD-002 | P | Les moteurs incompatibles initiaux ont été évités par les changements de versions : Vitest 3.2.7, jsdom 26.1.0, ESLint 9.39.5 présents dans le store prennent en charge Node 23.9.0. Le poste reste cependant sur une branche Node en fin de support, sans alignement LTS local/CI démontré. |
| AUD-003 | O | Toujours aucun commit ni fichier suivi. |
| AUD-004 | C | La racine déclare maintenant `@cyber-school/lesson-runtime: workspace:*`. Le lien sera à matérialiser lors d'une installation complète. |
| AUD-005 | C | Tâches `tsc --watch` ajoutées aux quatre packages ; `dev.dependsOn` inclut `^build`. Démarrage et rechargement réel non exécutables actuellement. |
| AUD-006 | C | Entrées JSON racine ajoutées aux tâches build/test ; configurations communes incluses dans `globalDependencies`. Invalidation de cache chaud encore à mesurer après installation. |
| AUD-007 | C | Trois `@source` corrigés en `../../../../packages/...` ; les trois répertoires existent. CSS compilé et rendu non observés. |
| AUD-008 | C | Contrôles des options, permutations, références et identifiants ajoutés. Les contre-exemples initiaux sont effectivement rejetés par Zod et/ou le validateur. |
| AUD-009 | C | `loadAcademyData()` appelle le validateur et lève une erreur d'intégrité. Rejet d'un cycle confirmé par la sonde applicative. |
| AUD-010 | C | Les huit skills et leur référence sont présents dans `.claude/skills/`, identiques octet par octet au canonique selon la commande de gouvernance. Découverte d'une session Claude neuve encore à réceptionner. |
| AUD-011 | C | Les imports `@docs/...` et `@continuity/...` sont maintenant hors backticks ; leurs cibles sont contrôlées et existent. |
| AUD-012 | P | Matrice de versions ajoutée, mais le mot “validée” n'est pas accompagné de preuves de découverte/invocation des trois CLI. Codex reste en 0.87.0 avec `collab=false` ; aucune preuve nouvelle ne résout sa compatibilité native avec les adaptateurs. |
| AUD-013 | P | Liste de lecture Gemini effectivement chargée ; recommandation Codex `-s read-only` ajoutée au guide. Pas d'essai de refus d'écriture ni de preuve de lancement du parent Codex dans ce mode. |
| AUD-014 | O | CURRENT_STATE, HANDOFF et BLOCKERS initiaux inchangés. Le lien cassé dans RESUME_PROTOCOL est réparé, mais le défaut principal de relais reste entier. |
| AUD-015 | P | TASK-003 est Blocked, règle de dépendance et consolidateur documentés, contrôles automatisés ajoutés. Le contrôle Done vérifie un en-tête et des cases, sans preuve réelle, révision ou résultat machine. |
| AUD-016 | C | Le skill cite désormais les quatre exports réels et fournit un exemple. Compilation de cet exemple non exécutée. |
| AUD-017 | C | Plugin React Hooks déclaré et enregistré dans le lint commun. Exécution ESLint encore bloquée. |
| AUD-018 | C | `check:all` inclut les deux validateurs ; scripts/configuration racine ajoutés au lint/typage ; tsconfig de typecheck incluant les tests ajoutés aux packages. L'application reprend les règles ciblées. Commande complète non réussie. |
| AUD-019 | P | Énumération de tous les catalogues/leçons et lien `manifestStepId` ajoutés. Sonde à deux catalogues/leçons réussie. Le shell exige toujours le démonstrateur TCP, le catalogue affiche encore le premier domaine et il n'existe pas de route/registre général des composants de leçon. |
| AUD-020 | C | Reset, changement de choix et réordonnancement invalident maintenant le résultat via `onResult(id, null)` ; le parent retire ce score. Tests ajoutés, mais non exécutés. |
| AUD-021 | C | Radios HTML natives sous fieldset/legend ; libellés et état contrôlé présents. Fonctionnement en navigateur et lecteur d'écran non vérifié. |
| AUD-022 | P | Transition de progression neutralisée par `motion-reduce:transition-none`, ajout de MotionConfig. Le hook initialise toujours la préférence à false puis la lit après montage. Le nouveau test reduced-motion vérifie les états finaux, pas l'absence de mouvement. |
| AUD-023 | C | Tween actif conservé dans une ref ; le bouton Pause appelle maintenant `pause()`, puis `resume()` en reprise. Conservation de position et reprise réelle encore à tester. |
| AUD-024 | C | La perte reste représentée par une ligne dédiée après retransmission ; le segment livré est dessiné séparément. Assertions E2E ajoutées, rendu non observé. |
| AUD-025 | C | Texte corrigé en “après réception”, variables SND.NXT/RCV.NXT et en-tête SEG.SEQ/SEG.ACK distingués ; question sur le serveur semi-ouvert ajoutée. |
| AUD-026 | P | Lien vers la documentation des filtres et consignes locales ajoutés. La consigne fixe toutefois `tcp.stream == 0` après avoir demandé de noter le numéro du flux ; elle peut sélectionner une autre connexion. Activité non exécutée. |
| AUD-027 | P | `contentRevision` et métadonnées de revue ajoutées, mais revue optionnelle et révision par défaut. Une leçon published sans revue passe encore. Pas de preuve QA exécutée ni d'approbation humaine traçable. |
| AUD-028 | O | Toujours trois formats d'exercice, état local éphémère, sans historique persistant ni moteur d'évaluation cumulative. L'ajout d'un quatrième exercice ne corrige pas ce point, prévu pour une itération ultérieure. |
| AUD-029 | P | Trois scénarios E2E maintenant déclarés : parcours complet, reduced-motion et mobile, exécutables théoriquement sur deux projets. Couverture enrichie et artefacts CI ajoutés ; tests non exécutés et trois erreurs identifiées ci-dessous. |
| AUD-030 | C | Dépendance Motion directe retirée de web ; plugin React Vite retiré des manifestes concernés ; dépendances de tests inutilisées de web simplifiées. Build non exécuté. |
| AUD-031 | C | Fond destructive passé à `#be123c` : ratio des tokens 5,72:1. Contrôle des couleurs finales/états hover encore à faire. |
| AUD-032 | C | Objets stricts, provenance enrichie et politique alignée. Champ inconnu et URL HTTP rejetés par les schémas originaux dans les sondes. |

Node 23 figure toujours parmi les branches EOL dans la documentation officielle ; les nouvelles versions de dépendances corrigent bien l'incompatibilité de moteurs précédemment constatée, ce qui est distinct du support de sécurité de Node lui-même. [Versions Node.js](https://nodejs.org/en/about/previous-releases).

Pour Codex, le schéma officiel actuel des sous-agents ne constitue pas une preuve de prise en charge par le CLI local ancien. La matrice ajoutée doit distinguer version présente et version testée. [Documentation officielle OpenAI — sous-agents](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Trois erreurs des nouveaux tests

### VER-001 — Test unitaire : chemins de fixtures invalides

**Emplacement :** `apps/web/src/lib/__tests__/curriculum-data.test.ts:28`, `:34`, `:43`.

Le nouveau test négatif utilise `../../../../resources/...` depuis `apps/web/src/lib/__tests__`. Ce chemin aboutit à `apps/resources/...`, au lieu du répertoire `resources/` de la racine. Les deux autres chemins aboutissent de la même manière à `apps/lessons/` et `apps/curriculum/`.

Les trois résolutions et lectures exactes ont été tentées en lecture seule : **trois erreurs ENOENT**, conservées dans [UNIT_FIXTURE_PATH_PROBES.json](UNIT_FIXTURE_PATH_PROBES.json). Le test échouerait donc avant d'atteindre son assertion de rejet du cycle. La suite Vitest elle-même n'a pas pu être lancée.

**Correction attendue :** déterminer la racine réelle ou corriger la profondeur des chemins. **Vérification :** exécuter le test depuis le workspace web et constater qu'il atteint puis satisfait l'assertion sur le cycle.

### VER-002 — Playwright : choix recherché absent du manifeste

**Emplacement :** `tests/e2e/tcp-handshake.spec.ts:119`.

Le scénario demande `ex1.getByText("seq = 301, ack = 100").click()`. L'exercice propose uniquement `seq = 300, ack = 100`, `seq = 300, ack = 101` et `seq = 101, ack = 301`. Aucun élément portant le libellé recherché ne peut être fourni par cette carte.

**Preuve :** comparaison automatique avec les options actuelles dans [STATIC_VERIFICATION.json](STATIC_VERIFICATION.json). **Impact :** timeout du scénario après installation, indépendamment de l'invalidation du score qui a été correctement implémentée.

**Correction attendue :** sélectionner le distracteur réellement présent. **Vérification :** le clic aboutit et le compteur retombe à zéro.

### VER-003 — Playwright : attente incorrecte après réinitialisation de l'ordre

**Emplacement :** `tests/e2e/tcp-handshake.spec.ts:165` à `:168` ; `packages/exercises/src/exercise-card.tsx:62`.

Après avoir résolu l'exercice d'ordre, le test clique Réessayer puis Vérifier sans réordonner les événements et attend de retrouver 4/4. Or le reset restaure volontairement l'ordre initial mélangé : `ev-synack, ev-ack, ev-syn, ev-srv-est`. La réponse correcte commence par `ev-syn`.

**Preuve :** handler actuel et comparaison des deux listes dans STATIC_VERIFICATION. Le résultat attendu après cette nouvelle soumission est une erreur et un total de 3/4, tant que l'ordre n'a pas été corrigé.

**Correction attendue :** tester la mauvaise réponse après reset, puis réordonner avant d'attendre 4/4 ; ou définir et appliquer explicitement une autre sémantique de reset. **Vérification :** assertions cohérentes avec le composant et exécution E2E réussie.

Ces erreurs sont des constats de code/données, pas une prétendue exécution de Playwright. Le premier scénario s'arrêterait d'abord sur VER-002 ; VER-003 resterait masqué jusqu'à correction de ce sélecteur.

## Deux contrôles encore trop déclaratifs

**Publication.** La sonde retire `review` d'une leçon published : elle reste acceptée. Retirer `contentRevision` entraîne l'application silencieuse du défaut 1.0.0. Le guide exige pourtant une revue approved et décrit des champs `reviewedBy`/`status`, tandis que le schéma accepte `scientificReviewer`, `qaEvidenceRef` et `approvedBy` facultatif. Le manifeste actuel pointe `qaEvidenceRef` vers le source du test, sans résultat exécuté, et n'identifie pas d'approbateur humain. Voir `packages/lesson-runtime/src/schemas.ts:255`, `:267`, `:276` et `docs/agents/AGENT_GUIDE.md:49`.

**Clôture des tâches.** Une surcouche virtuelle a marqué TASK-001 Done, coché les cases et ajouté le seul titre Vérifications avec une phrase indiquant qu'aucune commande n'a été exécutée. Le validateur a retourné succès. Le contrôle empêche les oublis éditoriaux, mais ne prouve pas que les tests de la révision ont passé. Aucun fichier de tâche réel n'a été modifié pendant cette sonde.

**Laboratoire.** Le nouveau lien correspond bien à la syntaxe des filtres. Pour isoler la connexion sélectionnée, Follow TCP Stream applique le filtre adapté ; le numéro de flux n'est pas nécessairement zéro. La consigne doit reprendre le numéro observé ou conserver le filtre calculé. [Filtres Wireshark](https://www.wireshark.org/docs/wsug_html_chunked/ChWorkBuildDisplayFilterSection.html), [suivi du flux sélectionné](https://www.wireshark.org/docs/wsug_html_chunked/ChAdvFollowStreamSection.html).

## Suite recommandée

1. Achever l'installation avec un lockfile autorisé et une base Git identifiable.
2. Corriger les trois erreurs de tests, puis exécuter réellement typage, lint, format, données, unitaires, build et navigateur.
3. Rendre obligatoires les preuves de revue/publication et de clôture, en les reliant à la révision testée.
4. Réconcilier CURRENT_STATE, HANDOFF et BLOCKERS après les résultats réels ; conserver les améliorations déjà confirmées.

**Aucune correction appliquée par cette vérification.** Les ajouts sont limités à ce dossier de rapport et de preuves ; les documents d'audit initiaux restent inchangés. Les empreintes des 135 fichiers source/configuration/skills suivis par cette vérification sont comparées en fin de travail dans `VERIFICATION_INTEGRITY.json`. Aucune installation, modification de version, création de commit, publication ou délégation à un modèle n'a été effectuée. Aucun rendu navigateur ni capture n'est présenté comme validé.
