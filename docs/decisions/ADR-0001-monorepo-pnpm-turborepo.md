# ADR-0001: Monorepo avec pnpm workspaces et Turborepo

- **Status**: Accepted
- **Date**: 2026-11-13
- **Author(s)**: product-software-architect

## Context

La plateforme doit accueillir une application Web Next.js, un design system partagé, des moteurs d'animations et d'exercices, un runtime pédagogique et potentiellement des milliers de cours interactifs modulaires.

## Decision

Structurer le dépôt en monorepo géré par **pnpm workspaces** (`pnpm@10.28.0` via `packageManager` / Corepack) et **Turborepo** (`turbo.json`).
Ne créer dès l'initialisation que les packages réellement utilisés (`ui`, `animations`, `exercises`, `lesson-runtime`) et documenter les emplacements futurs (`visualizations`, `3d-scenes`).

## Alternatives Considered

1. **Dépôt unique non structuré** : Couplage rapide entre le shell Next.js et les composants pédagogiques ; difficile à tester isolément à grande échelle.
2. **pnpm workspaces sans Turborepo** : Fonctionnel à petite échelle, mais perte du graphe d'exécution `^build` et du cache incrémental lorsque le nombre de packages augmentera.

## Consequences

- Orchestration unifiée (`corepack pnpm build`, `typecheck`, `lint`, `test:unit`).
- Isolation claire des contrats publics via `exports` dans chaque `package.json`.
- Légère configuration initiale supplémentaire (`turbo.json`, `pnpm-workspace.yaml`), largement amortie dès 4+ packages.

## Verification Criteria

`corepack pnpm install`, `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test:unit` et `corepack pnpm build` passent sur l'ensemble des workspaces.
