---
id: TASK-008
title: Bloquer les clôtures et publications sans preuve et fiabiliser la reprise
status: In Progress
priority: P0
complexity: M
iteration: ITER-001
dependsOn: []
labels: [area:infra, area:agents, area:qa]
githubIssue: null
verificationRef: continuity/validation/2026-11-13T23-23-48-154Z-36409115-ea98-4c8a-ba14-aa74f88fcbe3/result.json
---

# TASK-008 — Garde-fous de validation

## Objectif

Mettre en œuvre la demande explicite de garde-fous : preuves de commandes exécutées, contrôle de leur fraîcheur, statuts de tâches cohérents, publication revue et relais reproductible. Aucun orchestrateur ni nouvelle dépendance.

## Critères d'acceptation

- [x] Les tests natifs des garde-fous refusent preuve manquante/périmée, commande échouée, mauvais identifiant de tâche, journal modifié et publication sans revue.
- [x] La gouvernance du dépôt passe avec un checkpoint généré et les miroirs de skills cohérents.
- [x] Les trois erreurs de tests relevées dans la vérification précédente sont corrigées puis éprouvées par les suites du projet (résultats directs sur Node `23.9.0` : `typecheck`, `lint`, `format:check`, `validate:curriculum`, `test:unit`, `build`, `test:e2e`, `test:guards` passent après la dernière édition).
- [x] Typecheck, lint, test:unit, build et test:e2e passent sur une installation gelée complète et un Node LTS compatible.
- [ ] Une preuve générée et une revue des critères sont disponibles avant de marquer cette tâche Done.

## Vérifications

Les résultats sont générés sous continuity/validation/ et décrits dans le relais. Une exécution des seuls tests de garde-fous ne clôture pas cette tâche. Node local, lockfile, installation et base Git restent à régulariser avant réception complète.
