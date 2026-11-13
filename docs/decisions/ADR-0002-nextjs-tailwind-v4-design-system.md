# ADR-0002: Next.js App Router, React 19, Tailwind CSS v4 et Design System shadcn-compatible

- **Status**: Accepted
- **Date**: 2026-11-13
- **Author(s)**: product-software-architect, frontend-engineer

## Context

Nous avons besoin d'un socle Web moderne capable d'offrir à la fois un rendu rapide et indexable pour le catalogue de cours, et une interactivité riche côté client pour les simulations, animations GSAP/Motion et futures scènes 3D.

## Decision

Adopter **Next.js (App Router, `16.4.x`)**, **React `19.3.x`**, **TypeScript strict (`~6.0.3` pour compatibilité avec `typescript-eslint`)**, **Tailwind CSS v4** (`@import "tailwindcss";` + `@theme`) et un design system dans `packages/ui` compatible avec les conventions **shadcn/ui** (`components.json` configuré pour Tailwind v4 avec `tailwind.config: ""`, `class-variance-authority`, `lucide-react`).

## Alternatives Considered

1. **Tailwind CSS v3** : Configuration JS legacy ; moins aligné avec les nouveaux templates shadcn/ui et les variables CSS natives.
2. **UI kit opaque externe** : Moins de maîtrise sur l'accessibilité fine et l'intégration visuelle des schémas interactifs.

## Consequences

- Design system léger, personnalisable et auditable directement dans `packages/ui`.
- Toute future intégration React Three Fiber devra utiliser `@react-three/fiber` v9+ pour la compatibilité React 19 et `next/dynamic(..., { ssr: false })`.

## Verification Criteria

Build Next.js sans erreur, vérification Tailwind v4 des classes utilitaires et tests Playwright desktop/mobile sans régression visuelle ou console.
