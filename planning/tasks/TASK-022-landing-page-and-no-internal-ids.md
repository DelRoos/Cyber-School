---
id: TASK-022
title: Refondre complètement la landing page et supprimer toute fuite d'IDs internes (TC-00, unit-*) côté apprenant
status: In Progress
verificationRef: null
priority: P0
complexity: L
iteration: ITER-002
dependsOn: [TASK-021]
labels: [area:web, area:ui, area:lesson, area:qa]
githubIssue: null
---

# TASK-022 — Refonte complète de la landing page & suppression des IDs internes visibles

## Objectif

Installer le skill `landing-page-design` (partagé `.agents/skills` / `.claude/skills`), corriger l'exposition d'identifiants internes (`TC-00`, `unit-tc00-evidence-calibration`, `Tronc commun —`, `Version en revue`) dans les interfaces destinées aux apprenants, et refondre complètement la landing page (`/`) selon les meilleures pratiques d'académie interactive.

## Critères d'acceptation

- [x] Le skill `landing-page-design` (+ checklist de référence) est créé et synchronisé entre `.agents/skills/` et `.claude/skills/`.
- [ ] Aucun identifiant interne de pipeline (`TC-00`, `unit-tc00-*`, `Tronc commun —`, codes bruts) n'est affiché dans la landing page, les fiches de cours ou les vues apprenant.
- [ ] La landing page (`/`) est entièrement refondue (hero, preuve interactive directe, vitrine de cours, méthode pédagogique, parcours lisible sans jargon, responsive desktop + mobile `375x812`).
- [ ] Tous les contrôles qualité (`quality:verify --task TASK-022`, dont Playwright desktop + mobile) passent avec zéro erreur.
