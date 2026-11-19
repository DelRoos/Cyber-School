---
id: TASK-023
title: Produire des pages de cours complètes par un workflow vérifiable
status: In Progress
priority: P0
complexity: L
iteration: ITER-002
dependsOn: [TASK-017]
labels: [area:lesson, area:agents, area:tooling, area:qa]
verificationRef: continuity/validation/2026-11-14T14-02-38-289Z-a8a1439c-9314-4580-b81f-a94319196d3f/result.json
---

# TASK-023 — De la mission à une page de cours complète

## Objectif

Unifier la fabrication des pages de cours : sources, pédagogie, expériences, assemblage, vérification navigateur et revue. Fournir un workflow utilisable par Codex, Claude Code et Gemini, des contrôles exécutables et un cours pilote entièrement assemblé. La préparation d'une mission ne doit jamais être présentée comme un cours généré.

## Périmètre

Contrat additif de page pédagogique dans lesson-runtime, rendu partagé, expériences du pilote, scripts et skill de production. Préserver les modifications en cours de TASK-022, notamment l'accueil et les trois expériences de cours existantes. Aucun orchestrateur externe, service payant, modèle imposé ou publication automatique.

## Critères d'acceptation

- [x] Une commande prépare un workflow borné et reprenable, sans écraser les livrables existants.
- [x] Chaque étape indique ses entrées, ses sorties, le rôle et les skills à utiliser, et sa condition de sortie.
- [x] Le contrat de page impose explications, exemple résolu, prédiction, manipulation, exercices corrigés, bilan et sources pour chaque chapitre.
- [x] Les contrôles refusent les pages incomplètes, les liens cassés entre exercices et chapitres et les simulations non enregistrées.
- [x] Un rendu partagé transforme les données rédigées en page complète, avec navigation et réponses conservées ; les trois cours existants continuent de fonctionner.
- [x] Le pilote « Comprendre les alertes et les preuves » couvre les huit micro-leçons de son unité, avec sources primaires, expériences et exercices réels.
- [x] Le skill et le workflow sont communs à Codex, Claude Code et Gemini, avec miroirs synchronisés.
- [ ] Les tests et les contrôles requis passent après les derniers changements ; les statuts distinguent structure complète, QA et revue humaine.

## Décision et livraison

Voir [ADR-0008](../../docs/decisions/ADR-0008-complete-course-pages.md).

## Vérification

Revalidation le 14 novembre 2026 pendant TASK-024 : la clôture locale non commitée référence une preuve antérieure aux modifications du dépôt. `validate:governance` la refuse comme périmée. Tâche rouverte ; la preuve historique est préservée. Une session simultanée a ensuite supprimé les routes de cours et plusieurs tests : le critère de continuité des cours doit être réexaminé avant une nouvelle clôture. Les preuves échouées pendant ces changements restent enregistrées.

Neuf contrôles officiels réussis sur les sources finales : 36 tests de garde-fous, 36 tests unitaires, 16 scénarios Playwright ordinateur/mobile, types, lint, format, gouvernance, curriculum et build. Les captures du pilote sont inspectées et décrites dans `audits/course-workflow-2026-11-14/REVIEW.md`. Le workflow de production est livré ; la publication du pilote et sa revue scientifique humaine restent séparées, avec le cours in-review.
