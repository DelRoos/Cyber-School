---
id: TASK-025
title: Aligner la carte Parcours sur le découpage V4
status: In Progress
priority: P0
complexity: M
iteration: ITER-002
dependsOn: [TASK-021]
labels: [area:web, area:curriculum, area:qa]
---

# TASK-025 — Un socle, quatre branches et des compléments transversaux

## Objectif

Corriger la présentation des approfondissements et des parcours à partir du fichier V4 explicitement fourni par l’utilisateur. Le fichier source reste inchangé. Préserver les retraits de routes de la session parallèle.

## Critères d'acceptation

- [ ] L’accueil et `/parcours` présentent le tronc commun, les quatre branches A/B/C/D et les dix modules X à part, sans sixième parcours autonome.
- [ ] Les dix modules transversaux sont consultables par thème et par lien direct, sans ordre de passage imposé ni durée complète présentée comme obligatoire.
- [ ] Les modules et micro-leçons affichés correspondent au V4, sans chapitres artificiels ; les liens thématiques proposés sont distingués des prérequis explicites.
- [ ] Les rattachements automatiques erronés sont corrigés, avec couverture intégrale, import idempotent et conservation des curations et états existants.
- [ ] Recherche, filtres, liens, clavier, rendus ordinateur/mobile/320 px et console sont vérifiés ; les neuf contrôles officiels passent sur les sources finales.

## Référence et conception

Voir `docs/design/PARCOURS_V4_ALIGNMENT.md`.
