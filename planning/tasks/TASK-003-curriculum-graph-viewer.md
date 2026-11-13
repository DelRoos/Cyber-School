---
id: TASK-003
title: Activer packages/visualizations (XYFlow) pour explorer graphiquement le graphe de concepts atomiques
status: Blocked
priority: P1
complexity: M
iteration: ITER-002
dependsOn: [TASK-002]
labels: [area:visualizations, area:curriculum]
githubIssue: null
---

# TASK-003 — Explorateur visuel du graphe de concepts atomiques

## Objectif

Créer le package `packages/visualizations` avec `@xyflow/react` et exposer une vue interactive du graphe de prérequis et relations du curriculum dans `apps/web/app/curriculum/page.tsx`.

## Critères d'acceptation

- [ ] `packages/visualizations` configuré et compilé dans le monorepo.
- [ ] Rendu du graphe `curriculum/networking-foundations.json` avec filtrage par niveau de profondeur et mise en évidence des prérequis.
- [ ] Navigation clavier vers les nœuds de concepts et lien direct vers les leçons disponibles.
- [ ] Tests unitaires et test Playwright sur `/curriculum` passent sans erreur console.
