# Architecture technique — Vue d'ensemble

## 1. Topologie du monorepo

Le dépôt utilise **pnpm workspaces** et **Turborepo** pour orchestrer le build, le typage, le lint et les tests à travers les applications et packages partagés :

```text
cyber-school/
├── apps/
│   └── web/                    # Application Next.js (App Router, React 19, Tailwind v4)
├── packages/
│   ├── ui/                     # Design system & primitives accessibles (tokens, shadcn-style)
│   ├── animations/             # Primitives GSAP + Motion & support prefers-reduced-motion
│   ├── exercises/              # Moteur et composants d'exercices interactifs
│   └── lesson-runtime/         # Schémas Zod, types pédagogiques, graphe de concepts & validation
├── curriculum/                 # Référentiel des domaines, modules, chapitres et concepts atomiques
├── resources/                  # Catalogue vérifié et métadonnées des sources primaires
├── lessons/                    # Manifestes et données structurées des leçons interactives
├── docs/                       # Vision, exigences, architecture, ADR, standards, sécurité, agents
├── planning/                   # Roadmap, backlog, itérations et tâches atomiques
├── continuity/                 # État courant, protocole de reprise, handoff et blocages
├── tests/                      # Tests transversaux (validation curriculum + E2E Playwright)
├── .agents/skills/             # Skills partagés (format Agent Skills)
├── .codex/agents/              # Sous-agents natifs Codex (TOML)
├── .claude/agents/             # Sous-agents natifs Claude Code (Markdown)
├── .gemini/                    # Configuration & sous-agents natifs Gemini CLI
└── .github/workflows/          # CI GitHub Actions
```

## 2. Flux de données pédagogiques

1. Les **sources** sont indexées et classées par niveau de confiance dans `resources/sources.json`.
2. Le **référentiel** (`curriculum/*.json`) définit les domaines, modules, chapitres et concepts atomiques.
3. Les **manifestes de leçons** (`lessons/<slug>/lesson.json`) relient une expérience interactive à un `AtomicConcept`, définissent ses étapes progressives, ses exercices et ses liens externes.
4. `@cyber-school/lesson-runtime` valide l'ensemble au moment des tests (`validate:curriculum`) et côté application, garantissant qu'aucun prérequis orphelin ou cycle ne passe en production.
5. `apps/web` rend les parcours et le démonstrateur interactif en s'appuyant sur `@cyber-school/ui`, `@cyber-school/animations` et `@cyber-school/exercises`.

## 3. Scalabilité vers des milliers de cours

- **Découplage contenu / shell** : L'application `apps/web` ne couple pas la navigation globale au code interne de chaque leçon.
- **Chargement paresseux / dynamique** : Les futures scènes lourdes (3D WebGL, graphes D3 complexes) seront isolées dans des packages dédiés chargés dynamiquement côté client uniquement sur les leçons concernées.
- **Caching Turborepo** : Les packages stables (`ui`, `lesson-runtime`, `exercises`) sont mis en cache lors des builds et tests CI.
