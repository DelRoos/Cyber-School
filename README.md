# Cyber School — Académie Interactive AI-First

Plateforme Web d'apprentissage de nouvelle génération dont chaque cours est une expérience interactive construite autour d'un **référentiel de concepts atomiques** (`Domaine -> Module -> Chapitre -> Concept atomique -> Leçon -> Exercices -> Évaluations -> Laboratoires externes`).

## Prérequis & Installation

- **Node.js LTS** `^22.12.0 || ^24.0.0 || ^26.0.0` (CI sur Node `22` ; Node 23 est refusé par le diagnostic)
- **pnpm** `10.28.0` via **Corepack** (`packageManager` épinglé dans [package.json](./package.json))
- **Git**

> Si `pnpm` n'est pas installé globalement dans votre `PATH`, utilisez **`corepack pnpm`** pour toutes les commandes.

```bash
corepack pnpm install --frozen-lockfile
```

Si le lockfile manque, la première génération doit être autorisée et revue. Ne pas contourner ce prérequis ; `corepack pnpm quality:environment` explique les blocages sans installer ni modifier le système.

## Démarrer l'application localement

```bash
corepack pnpm dev
```

`corepack pnpm dev` lance en parallèle Next.js (`apps/web`) et le mode watch (`tsc --watch`) des packages workspace (`@cyber-school/lesson-runtime`, `@cyber-school/ui`, `@cyber-school/animations`, `@cyber-school/exercises`).

Puis ouvrez :

- Accueil & aperçu du curriculum : `http://localhost:3000/`
- Démonstrateur interactif **TCP Three-Way Handshake** : `http://localhost:3000/lessons/tcp-three-way-handshake`

## Scripts de vérification

| Commande                                                                  | Rôle                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `corepack pnpm typecheck`                                                 | Vérification TypeScript strict (packages, web, `playwright.config.ts` et scripts `tests/`)                                           |
| `corepack pnpm lint`                                                      | Analyse statique ESLint (avec `eslint-plugin-react-hooks` et règles App Router)                                                      |
| `corepack pnpm format:check`                                              | Vérification Prettier                                                                                                                |
| `corepack pnpm validate:governance`                                       | Vérifie les liens Markdown locaux, les `@imports`, la parité `.agents/skills` <-> `.claude/skills` et la cohérence `planning/`       |
| `corepack pnpm validate:curriculum`                                       | Validation Zod stricte (`.strict()`) des ressources, concepts, leçons et détection de cycles                                         |
| `corepack pnpm test:unit`                                                 | Exécution des tests unitaires Vitest                                                                                                 |
| `corepack pnpm build`                                                     | Build complet (packages + Next.js production)                                                                                        |
| `corepack pnpm test:e2e`                                                  | Tests navigateur Playwright (desktop `1280x800`, mobile `375x812`, `reducedMotion`, clavier, console, captures dans `test-results/`) |
| `corepack pnpm check:all`                                                 | Diagnostic puis chaîne complète, preuves et journaux générés sous `continuity/validation/`                                           |
| `corepack pnpm test:guards`                                               | Tests natifs des refus : preuves périmées, fausses clôtures, publication non revue                                                   |
| `corepack pnpm quality:verify --task TASK-008`                            | Validation complète liée à la tâche réelle                                                                                           |
| `corepack pnpm quality:checkpoint --task TASK-008 --next "Action exacte"` | Checkpoint et relais vérifiables                                                                                                     |

> Note Playwright : la configuration [playwright.config.ts](./playwright.config.ts) réutilise un navigateur Chromium local déjà présent dans `%LOCALAPPDATA%/ms-playwright` s'il n'y a pas besoin de téléchargement supplémentaire (`corepack pnpm exec playwright install chromium` reste utilisable si absent).

## Architecture du dépôt

- `apps/web` : Application Next.js App Router, React 19, Tailwind CSS v4, démonstrateur TCP (`SND.NXT`/`RCV.NXT` RFC 9293).
- `packages/lesson-runtime` : Schémas Zod `.strict()` (`Domain`, `Module`, `Chapter`, `AtomicConcept`, `LessonManifest`, `ExerciseDefinition`, `ResourceMetadata`) et validateur de graphe sans cycle.
- `packages/ui` : Design system et primitives accessibles compatibles shadcn/ui (`tokens.css`, `Button`, `Card`, `Badge`, `Alert`, `Progress`).
- `packages/animations` : Primitives GSAP & Motion (`usePrefersReducedMotion`, `getStepDuration`, `useGsapScope`, `MotionStepPanel`).
- `packages/exercises` : Moteur et composants d'exercices interactifs accessibles au clavier (`<fieldset>` + `<input type="radio">` natifs, invalidation du score sur modification/réinitialisation).
- `curriculum/`, `resources/`, `lessons/` : Données pédagogiques chargées dynamiquement et validées par Zod.
- `docs/` : Vision, exigences, architecture, ADR, standards pédagogiques/3D, sécurité IA et guide des rôles.
- `planning/` & `continuity/` : Roadmap, backlog, itérations, tâches et mémoire persistante inter-agents.
- `.agents/skills/`, `.codex/`, `.claude/`, `.gemini/` : Skills portables (miroir vérifié dans `.claude/skills/`) et adaptateurs natifs pour Codex, Claude Code et Gemini CLI.

## Compatibilité CLI agents IA

| Outil CLI             | Version observée (invocation à vérifier) | Entrypoint & Skills                                 |
| --------------------- | ---------------------------------------- | --------------------------------------------------- |
| OpenAI Codex          | `0.87.0`                                 | `AGENTS.md` + `.agents/skills/` + `.codex/agents/`  |
| Anthropic Claude Code | `2.1.145`                                | `CLAUDE.md` + `.claude/skills/` + `.claude/agents/` |
| Google Gemini CLI     | `0.64.0`                                 | `GEMINI.md` + `.agents/skills/` + `.gemini/agents/` |

Tout agent entrant doit d'abord suivre [continuity/RESUME_PROTOCOL.md](./continuity/RESUME_PROTOCOL.md), puis consulter [continuity/CURRENT_STATE.md](./continuity/CURRENT_STATE.md) et [continuity/HANDOFF.md](./continuity/HANDOFF.md).

Les [garde-fous de qualité](./docs/standards/QUALITY_GATES.md) expliquent les preuves requises avant Done ou published. Une simple case cochée, un fichier de test ou une affirmation d'agent ne suffit pas. Le démonstrateur reste in-review en attendant sa réception complète.
