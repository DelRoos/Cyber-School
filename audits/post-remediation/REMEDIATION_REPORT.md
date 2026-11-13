# Rapport post-remédiation — Audit Codex (`cyber-school`)

**Date :** 14 novembre 2026 (`2026-11-13T22:56Z` UTC / `2026-11-14T00:01` CET)  
**Branche Git :** `main` (commits `f77c096` et `af745f4`, base récupérable vérifiée)  
**Périmètre traité :** Remédiation des 32 constats de [FINDINGS.md](../initial-codex-review/FINDINGS.md), des 3 défauts de tests de [VERIFICATION_REPORT.md](../corrections-verification-2026-11-13/VERIFICATION_REPORT.md), consolidation des garde-fous (`ADR-0005`) et validation sur environnement Node LTS (`v22.23.5`).

---

## 1. Synthèse critique et décision

Sur les 32 constats (`AUD-001` à `AUD-032`) et les 3 défauts de tests (`VER-001` à `VER-003`) issus des audits :

- **27 constats + les 3 défauts de tests (`VER-001`..`VER-003`) sont corrigés et vérifiés** dans le code, la configuration, les tests et les preuves générées.
- **2 constats sont partiellement résolus avec limites techniques ou d'isolation documentées** (`AUD-002` Node système vs Node LTS espace utilisateur sans droits Admin UAC ; `AUD-012`/`AUD-013` compatibilité/isolation live CLI non invoquée sur session LLM tierce).
- **1 constat relève d'une décision humaine requise** (`AUD-027` / `BLK-005` : revue scientifique et approbation humaine réelle avant passage de la leçon TCP de `in-review/pending` à `published`).
- **2 points ont été analysés comme non bloquants pour le socle M1 / différés à `ITER-002` ou conservés après vérification** (`AUD-028` / `TASK-005`, `react-dom` dans `AUD-030`, absence de faille XSS active dans `AUD-032`).

Conformément à la consigne de stabilisation, **aucune nouvelle fonctionnalité M2/M3** (`packages/visualizations`, `packages/3d-scenes`, moteur d'évaluations cumulatives) n'a été développée ; `TASK-003` a uniquement été promue de `Blocked` à `Ready` après clôture de `TASK-001` et `TASK-002`.

---

## 2. Problèmes corrigés

### A. Démarrage, environnement, reproductibilité et base Git
- **`AUD-001` / `BLK-003` (Lockfile & installation gelée)** : génération de `pnpm-lock.yaml`, validation de `corepack pnpm install --frozen-lockfile` sous Node `v22.23.5` LTS ; activation des shims Corepack `pnpm@10.28.0` dans `%APPDATA%\npm` et `%LOCALAPPDATA%\Programs\nodejs-22` (`BLK-001` résolu pour `pnpm` et `turbo`).
- **`AUD-002` (Environnement Node compatible pour les vérifications)** : installation officielle de Node.js `v22.23.5` LTS (contrôle SHA-256 `4A191082E9706866830379D577D2CC8A50C776FCD9436A8D061B063ED0D9A0E3`) dans `%LOCALAPPDATA%\Programs\nodejs-22` (en tête du `PATH` utilisateur) et alignement des bornes `engines` (`^22.12.0 || ^24.0.0 || ^26.0.0`) entre `package.json`, `README.md` et `.github/workflows/ci.yml`.
- **`AUD-003` / `BLK-004` (Base Git récupérable)** : vérification `.gitignore` + contrôle absence de secrets, création de la base versionnée sur `main` (`f77c096`, `af745f4`).
- **`AUD-004` (Dépendance racine manquante)** : ajout de `"@cyber-school/lesson-runtime": "workspace:*"` dans `package.json`.
- **`AUD-005` (Workflow `dev`)** : tâches `tsc -p tsconfig.json --watch` ajoutées aux 4 packages et `dev.dependsOn: ["^build"]` dans `turbo.json`.
- **`AUD-006` (Cache Turborepo)** : déclaration de `globalDependencies` (`tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`) et des entrées `$TURBO_ROOT$/curriculum/**/*.json`, `lessons/**/*.json`, `resources/**/*.json` dans `turbo.json`.
- **`AUD-007` (Sources Tailwind v4)** : correction des directives `@source` dans [globals.css](../../apps/web/src/app/globals.css) vers `../../../../packages/{ui,exercises,animations}/src/**/*.{ts,tsx}`.

### B. Gouvernance multi-agents, skills, continuité et sécurité
- **`AUD-010` & `AUD-011` (Claude Code)** : création et synchronisation octet par octet de `.claude/skills/` depuis `.agents/skills/` (9 fichiers contrôlés par `tests/scripts/validate-governance.ts`) ; suppression des backticks autour des `@imports` dans [CLAUDE.md](../../CLAUDE.md).
- **`AUD-013` (Moindre privilège auditeur sécurité)** : restriction explicite dans [.gemini/agents/security-auditor.md](../../.gemini/agents/security-auditor.md) (`kind: local`, `tools: [read_file, grep_search, glob, list_directory]`), contrôle ajouté dans [validate-governance.ts](../../tests/scripts/validate-governance.ts) pour Gemini et Claude, et documentation du mode `-s read-only` pour Codex dans [AGENT_GUIDE.md](../../docs/agents/AGENT_GUIDE.md).
- **`AUD-014` & `AUD-015` (Continuité & transitions vérifiables)** : mise en place des scripts déterministes (`scripts/quality/preflight.ts`, `checkpoint.ts`, `run-checks.ts`, `core.ts`, `guards.test.ts` — ADR-0005), régénération cryptographique de [CURRENT_STATE.md](../../continuity/CURRENT_STATE.md), [HANDOFF.md](../../continuity/HANDOFF.md) et [STATE.json](../../continuity/STATE.json), blocage automatique des statuts `Ready`/`Done` sans dépendances ni preuves `result.json` intègres, correction des liens cassés dans [RESUME_PROTOCOL.md](../../continuity/RESUME_PROTOCOL.md), et définition des règles de travail parallèle dans [AGENT_GUIDE.md](../../docs/agents/AGENT_GUIDE.md).
- **`AUD-016` (Skill animation)** : alignement de [.agents/skills/gsap-animation/SKILL.md](../../.agents/skills/gsap-animation/SKILL.md) (et son miroir Claude) sur les exports réels de `@cyber-school/animations` (`usePrefersReducedMotion`, `getStepDuration`, `useGsapScope`, `MotionStepPanel`) avec exemple minimal valide.
- **`AUD-017` & `AUD-018` (Qualité & périmètre CI/local)** : ajout de `eslint-plugin-react-hooks` dans [eslint.config.mjs](../../eslint.config.mjs), création des `tsconfig.typecheck.json` par package + [tsconfig.checks.json](../../tsconfig.checks.json) pour typage des tests et scripts racine, intégration de `validate:curriculum` et `validate:governance` dans la chaîne complète (`quality:verify` / `check:all`).
- **`AUD-032` (Validation stricte des données)** : adoption de `.strict()` sur les schémas Zod dans [schemas.ts](../../packages/lesson-runtime/src/schemas.ts), restriction HTTPS des URLs, et tests négatifs dans [validator.test.ts](../../packages/lesson-runtime/src/__tests__/validator.test.ts).

### C. Moteur pédagogique, démonstrateur TCP, accessibilité et tests
- **`AUD-008` & `AUD-009` (Intégrité référentielle et runtime)** : ajout des contrôles d'unicité, options valides, permutations d'ordonnancement, slugs, concepts et chapitres dans `validator.ts` ; appel obligatoire de `validateCurriculumIntegrity` dans [curriculum-data.ts](../../apps/web/src/lib/curriculum-data.ts).
- **`AUD-019` (Généralisation multi-catalogues et multi-leçons)** : chargement dynamique multi-catalogues/multi-leçons dans `loadAcademyData`, affichage multi-domaines sur [page.tsx](../../apps/web/src/app/page.tsx), route dynamique [/lessons/[slug]/page.tsx](../../apps/web/src/app/lessons/[slug]/page.tsx), registre [lesson-registry.tsx](../../apps/web/src/lib/lesson-registry.tsx) (`LessonRenderer` avec `DefaultLessonExperience`), et test multi-catalogues dans [curriculum-data.test.ts](../../apps/web/src/lib/__tests__/curriculum-data.test.ts).
- **`AUD-020` & `AUD-021` (Exercices & accessibilité clavier)** : invalidation du résultat agrégé via `onResult(id, null)` au reset/changement/réordonnancement dans [exercise-card.tsx](../../packages/exercises/src/exercise-card.tsx) ; remplacement par des boutons radio HTML natifs sous `<fieldset>`/`<legend>` testés au clavier (`Space`, `ArrowDown`, `ArrowUp`).
- **`AUD-022` (Préférence `prefers-reduced-motion`)** : réécriture de `usePrefersReducedMotion()` via `useSyncExternalStore` (lecture synchrone dès montage + garde défensive) dans [reduced-motion.ts](../../packages/animations/src/reduced-motion.ts), ajout de `motion-reduce:duration-0` sur [Progress](../../packages/ui/src/components/feedback.tsx), règle `@media (prefers-reduced-motion: reduce)` dans [globals.css](../../apps/web/src/app/globals.css), et assertion E2E `transitionDuration === "0s"`.
- **`AUD-023` & `AUD-024` (Pause GSAP et historique visuel de perte)** : contrôle de `activeTweenRef.current?.pause()` / `resume()` dans [tcp-handshake-simulator.tsx](../../apps/web/src/components/tcp-handshake-simulator.tsx) ; conservation de la ligne de perte `diagram-row-lost-syn-ack` séparée de la retransmission `diagram-row-syn-ack`, vérifiée par Playwright.
- **`AUD-025` & `AUD-026` (Exactitude TCP & laboratoire Wireshark)** : séparation explicite de l'en-tête (`SEG.SEQ`/`SEG.ACK`) et des variables d'état (`SND.NXT`/`RCV.NXT`) selon la RFC 9293, question sur l'état `SYN_RCVD`, remplacement du filtre figé par `tcp.stream eq <N>` dans [lesson.json](../../lessons/tcp-three-way-handshake/lesson.json).
- **`AUD-029` & `VER-001`..`VER-003` (Suites de tests)** : résolution des racines de fixtures via `findRepoRoot()`, alignement des sélecteurs/attentes E2E après reset, extension des scénarios Playwright (`desktop` + `mobile`, 4 exercices, clavier, perte `SYN-ACK`, `reducedMotion`, 404 slug inconnu, zéro `console.error`/`pageerror`).
- **`AUD-030` & `AUD-031` (Dépendances & contraste)** : retrait de `motion` dans `apps/web` et `@vitejs/plugin-react` inutilisés ; ajustement de `--destructive` à `#be123c` sur `#fff1f2` (ratio calculé `5,72:1` > AA `4,5:1`) dans [tokens.css](../../packages/ui/src/styles/tokens.css).

---

## 3. Problèmes non confirmés (analyse critique)

1. **Suppression de `react-dom` évoquée lors du scan statique (`AUD-030`)** : confirmé **non supprimable**, requis par Next.js App Router (`peerDependency` React DOM). Conservé.
2. **Exposition XSS / exécution via absence de `.strict()` sur les schémas initiaux (`AUD-032`)** : l'audit a vérifié qu'aucun rendu HTML brut (`dangerouslySetInnerHTML`) ni `eval` n'existait dans le socle ; le durcissement `.strict()` a néanmoins été appliqué pour harmoniser l'implémentation avec `AI_ENVIRONMENT_SECURITY.md`.
3. **Absence de persistance et d'évaluations cumulatives comme défaut bloquant M1 (`AUD-028`)** : confirmé comme **fonctionnalité prévue en itération 2 (`TASK-005`)**, hors périmètre minimal du socle M1 (confirmé explicitement par la fiche `AUD-028`).
4. **Syntaxe des adaptateurs Gemini (`AUD-013`)** : l'inspection du chargeur natif Gemini `0.64.0` a confirmé que le format des six agents était accepté nativement ; seule l'absence de liste `tools:` sur `security-auditor.md` permettait l'héritage des outils du parent (corrigé).

---

## 4. Problèmes encore ouverts et limitations

| Sujet | État | Justification / Action restante |
| :--- | :--- | :--- |
| **`BLK-005` / `AUD-027` — Revue scientifique & publication TCP** | Ouvert | [lesson.json](../../lessons/tcp-three-way-handshake/lesson.json) reste intentionnellement `status: "in-review"` / `review.status: "pending"`. Les garde-fous interdisent d'inventer un `approvedBy` humain ou de promouvoir sans revue humaine réelle. |
| **`TASK-008` — Critère 5 (revue humaine des critères)** | `In Progress` (4/5 cochés) | La preuve `quality:verify` est liée ([result.json](../../continuity/validation/2026-11-13T22-50-35-739Z-cd2ffec7-ff0d-4a78-83e6-144994ff09be/result.json)), mais la validation finale du critère 5 reste réservée au relecteur humain avant passage à `Done`. |
| **`BLK-002` — Node système Windows (`C:\Program Files\nodejs\`)** | Partiellement résolu | Sans droits Admin UAC (`IS_ADMIN:False`), Node `23.9.0` reste dans le `PATH` Système devant le `PATH` Utilisateur contenant `Node v22.23.5` (`%LOCALAPPDATA%\Programs\nodejs-22`). Un terminal système par défaut résoudra `23.9.0` tant qu'un installateur Admin n'aura pas mis à jour `Program Files\nodejs` ou préfixé `PATH`. |
| **`AUD-012` & `AUD-013` — Invocation live inter-CLI & test OS en sandbox** | Partiellement résolu | Versions locales observées : `codex-cli 0.87.0` (`collab=false`), `claude 2.1.145`, `gemini 0.64.0`. Aucune session LLM externe imbriquée ni test destructeur d'écriture OS côté Codex `-s read-only` / Claude n'a été exécuté. |
| **`AUD-028` / `TASK-005` — Persistance et évaluation cumulative** | Reporté (`ITER-002`) | Maintenu en `Backlog` conformément à la consigne de ne pas développer de nouvelles fonctionnalités majeures durant la stabilisation. |
| **Accessibilité assistante & protection de branche distante** | Limitation | Aucun lecteur d'écran humain ni audit `axe-core` dédié n'est inclus ; aucun dépôt distant GitHub ni protection de branche requise n'est encore configuré côté serveur. |

---

## 5. Décisions prises

- **Garde-fous exécutables (`ADR-0005`)** : conservation intacte des règles de `scripts/quality/*` et de [QUALITY_GATES.md](../../docs/standards/QUALITY_GATES.md) ; aucun contournement de `NODE_UNSUPPORTED`, `GIT_BASE_MISSING` ou `PUBLICATION_REVIEW`.
- **Installation LTS isolée en espace utilisateur** : choix de Node `v22.23.5` (aligné sur CI Node 22) vérifié par SHA-256 sous `%LOCALAPPDATA%\Programs\nodejs-22` et activation Corepack dans `%APPDATA%\npm`, permettant des vérifications réelles sans élévation de privilèges.
- **Clôture sélective des tâches** : passage à `Done` uniquement pour [`TASK-001`](../../planning/tasks/TASK-001-monorepo-bootstrap.md) et [`TASK-002`](../../planning/tasks/TASK-002-tcp-handshake-demo.md) après génération de leurs propres rapports `quality:verify` complets ; maintien de `TASK-008` en `In Progress` jusqu'à revue humaine finale et passage de [`TASK-003`](../../planning/tasks/TASK-003-curriculum-graph-viewer.md) en `Ready` sans en démarrer l'implémentation.

---

## 6. Tests et vérifications réellement exécutés

Exécutés sous **Node `v22.23.5`** + **`pnpm@10.28.0`** après gel du lockfile (`corepack pnpm install --frozen-lockfile`) et sur base Git versionnée (`f77c096` puis `af745f4`) :

| Commande | Portée | Résultat | Preuve / Détails observés |
| :--- | :--- | :--- | :--- |
| `corepack pnpm quality:environment` | Prérequis Node LTS, `pnpm`, lockfile, `.bin/`, Git `HEAD` | **0 (`passed`)** | `Environment verified: supported Node, pinned package manager, lockfile, Git base and local tools.` (rejoué post-commit `af745f4`) |
| `corepack pnpm quality:verify --task TASK-008` | Chaîne complète des 9 contrôles obligatoires | **0 (`passed`)** | [result.json](../../continuity/validation/2026-11-13T22-50-35-739Z-cd2ffec7-ff0d-4a78-83e6-144994ff09be/result.json) (`issues: []`) |
| `corepack pnpm quality:verify --task TASK-001` | Chaîne complète des 9 contrôles obligatoires | **0 (`passed`)** | [result.json](../../continuity/validation/2026-11-13T22-53-47-270Z-c4ebd332-816f-4718-95b1-48781e3a5645/result.json) (`issues: []`) |
| `corepack pnpm quality:verify --task TASK-002` | Chaîne complète des 9 contrôles obligatoires | **0 (`passed`)** | [result.json](../../continuity/validation/2026-11-13T22-54-32-099Z-3d73b538-b5b8-4181-85c0-95f241d24b5c/result.json) (`issues: []`) |
| `corepack pnpm test:guards` | 26 tests négatifs des garde-fous | **0 (`26/26 passed`)** | Rejoué après le commit `af745f4` |
| `corepack pnpm validate:governance` | Liens Markdown, `@imports`, miroir skills (9 fichiers), tâches (4), continuité | **0 (`passed`)** | `61 markdown file(s), 9 mirrored skill file(s), 4 task(s)` (rejoué post-commit `af745f4`) |
| `corepack pnpm format:check` | Style Prettier sur tout le dépôt non ignoré | **0 (`passed`)** | Rejoué post-commit `af745f4` |
| `corepack pnpm validate:curriculum` | Schémas Zod `.strict()` + intégrité graphe | **0 (`passed`)** | `1 catalog(s), 1 domain(s), 4 concept(s), 1 lesson(s), 3 resource(s)` |
| `corepack pnpm typecheck` & `lint` & `build` | Monorepo complet + tests + `scripts/` + `next build` | **0 (`passed`)** | 5 workspaces compilés, 0 erreur TS/ESLint |
| `corepack pnpm test:unit` | `lesson-runtime` (5), `ui` (2), `animations` (3), `exercises` (2), `web` (3) | **0 (`15/15 passed`)** | Vitest 3.2.7 |
| `corepack pnpm test:e2e` | Playwright `chromium-desktop` + `chromium-mobile` (3 scénarios × 2 viewports) | **0 (`6/6 passed`)** | Parcours nominal/auto-play/perte `SYN-ACK`/4 exercices/clavier, `reducedMotion` (`0s`) + 404 `/lessons/unknown-lesson-slug`, mobile `375x812` sans overflow ni `console.error` |

---

## 7. Fichiers modifiés et créés (état consolidé)

- **Infrastructure & outillage** : `pnpm-lock.yaml`, `package.json`, `turbo.json`, `tsconfig.checks.json`, `eslint.config.mjs`, `.github/workflows/ci.yml`, `scripts/quality/{core,preflight,checkpoint,run-checks,guards.test}.ts`, `packages/*/tsconfig.typecheck.json`, `packages/ui/eslint.config.mjs`.
- **Packages & application** : `packages/lesson-runtime/src/{schemas,validator}.ts`, `packages/animations/src/reduced-motion.ts`, `packages/ui/src/styles/tokens.css`, `packages/ui/src/components/feedback.tsx`, `packages/exercises/src/exercise-card.tsx`, `apps/web/src/app/{globals.css,icon.svg,page.tsx,lessons/[slug]/page.tsx}`, `apps/web/src/components/{default-lesson-experience,tcp-handshake-simulator}.tsx`, `apps/web/src/lib/{curriculum-data.ts,lesson-registry.tsx}`.
- **Données & tests** : `lessons/tcp-three-way-handshake/lesson.json`, `resources/sources.json`, `packages/*/__tests__/*`, `apps/web/src/lib/__tests__/curriculum-data.test.ts`, `tests/e2e/tcp-handshake.spec.ts`, `tests/scripts/validate-{curriculum,governance}.ts`.
- **Agents, documentation, planification & continuité** : `CLAUDE.md`, `.claude/skills/**`, `.gemini/agents/security-auditor.md`, `.agents/skills/gsap-animation/SKILL.md`, `README.md`, `docs/agents/{AGENT_GUIDE,ROLES}.md`, `docs/security/AI_ENVIRONMENT_SECURITY.md`, `docs/standards/QUALITY_GATES.md`, `docs/decisions/ADR-0005-executable-quality-evidence.md`, `planning/backlog/BACKLOG.md`, `planning/tasks/TASK-{001,002,003,008}*.md`, `continuity/{BLOCKERS,CURRENT_STATE,HANDOFF,RESUME_PROTOCOL}.md`, `continuity/STATE.json`, `continuity/validation/*`.

---

## 8. Risques restants et recommandations pour la prochaine itération

1. **Revue humaine immédiate (`BLK-005` & `TASK-008`)** : relire les critères de `TASK-008` et effectuer la revue scientifique de la leçon TCP avant de passer son statut à `published` avec un `approvedBy` humain réel.
2. **Harmonisation système de Node LTS (`BLK-002`)** : mettre à jour `C:\Program Files\nodejs\` vers Node 22/24 LTS (installation MSI avec droits Admin) afin qu'aucun terminal local ne retombe par défaut sur Node `23.9.0`.
3. **Configuration dépôt distant & CI** : lors de la création du remote GitHub, activer la protection de branche sur `main` exigeant le workflow `.github/workflows/ci.yml` (`verify`).
4. **Démarrage d'`ITER-002`** :
   - Lancer [`TASK-003`](../../planning/tasks/TASK-003-curriculum-graph-viewer.md) (`packages/visualizations` avec `@xyflow/react` sur `/curriculum`) désormais `Ready`.
   - Enchaîner avec `TASK-004` (`tcp-sliding-window-and-congestion` + D3) puis `TASK-005` (`AUD-028` : modèle de tentatives versionné lié à `contentRevision` et évaluations cumulatives multi-concepts).
   - Effectuer une vérification d'invocation réelle sur `codex-cli` (version à aligner si `collab` requis) et `claude` lors du premier transfert inter-agents effectif.
