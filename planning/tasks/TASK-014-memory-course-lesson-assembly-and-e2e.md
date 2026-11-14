---
id: TASK-014
title: Assembler lessons/program-memory-fundamentals, labos lecture seule et valider E2E Playwright
status: Done
priority: P0
complexity: L
iteration: ITER-002
dependsOn: [TASK-010, TASK-011, TASK-012, TASK-013]
labels: [area:web, area:lesson, area:qa, area:systems-memory]
githubIssue: null
verificationRef: continuity/validation/2026-11-14T00-07-49-251Z-6d8667cf-2cd8-427d-9545-015b4bfd4a60/result.json
---

# TASK-014 — Assemblage final de la leçon et validation E2E / Codex

## Objectif

Assembler `lessons/program-memory-fundamentals/lesson.json`, enregistrer les scènes interactives dans `apps/web/src/lib/lesson-registry.tsx`, intégrer les guides externes en lecture seule (`godbolt.org`, GDB `x/nfu`), puis exécuter la chaîne complète de validation technique et browser.

## Critères d'acceptation

- [x] `lessons/program-memory-fundamentals/lesson.json` valide sous `corepack pnpm validate:curriculum` (`status: "in-review"`, jamais `published` sans revue humaine).
- [x] Tous les 14 concepts de [curriculum/program-memory-foundations.json](../../curriculum/program-memory-foundations.json) sont liés dans la leçon et exploités.
- [x] Tests Playwright dans `tests/e2e/program-memory.spec.ts` vérifiant navigation, `VIS-01`..`VIS-05`, scénarios `SIGSEGV`/dangling/UAF, clavier seul, `reduced-motion`, mobile `375px` et zéro `console.error`.
- [x] Chaîne complète (`typecheck`, `lint`, `format:check`, `test:unit`, `test:guards`, `validate:curriculum`, `build`, `test:e2e`, `quality:verify --task TASK-014`, `validate:governance`) exécutée avec succès sous Node LTS `22.x`.
