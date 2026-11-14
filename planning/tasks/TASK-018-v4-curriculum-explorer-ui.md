---
id: TASK-018
title: Créer l'explorateur Web /curriculum des 54 modules, 1 122 micro-leçons et 159 unités V4
status: Done
verificationRef: continuity/validation/2026-11-14T08-52-31-800Z-36b74e71-5916-430c-bd07-6e7cca5a8168/result.json
priority: P1
complexity: M
iteration: ITER-002
dependsOn: [TASK-016, TASK-017]
labels: [area:web, area:curriculum]
githubIssue: null
---

# TASK-018 — Explorateur Web `/curriculum` du référentiel V4

## Objectif

Permettre aux apprenants et relecteurs d'inspecter la cartographie complète du cursus V4, la couverture courante, les 12 états de production, les prérequis et les prochains lots éligibles depuis l'application Web.

## Critères d'acceptation

- [x] Chargeur serveur `apps/web/src/lib/v4-catalog.ts` exposant statistiques V4, éligibilité des unités et liens de provenance.
- [x] Page `/curriculum` (`apps/web/src/app/curriculum/page.tsx`) et composant `V4CatalogExplorer` avec recherche, filtre par domaine, filtre par état et bascule lots éligibles.
- [x] Navigation principale (`layout.tsx`) et page d'accueil (`page.tsx`) offrent un accès direct vers `/curriculum` sans casser les parcours existants.
- [x] Contrôles Playwright vérifiant filtres, dépliage de micro-leçons, absence d'erreurs console et rendu responsive sans débordement à `375px`.
