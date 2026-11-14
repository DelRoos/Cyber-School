---
id: TASK-009
title: Modéliser et tester les machines à états déterministes de la mémoire (VIS-01..VIS-05)
status: Done
priority: P0
complexity: L
iteration: ITER-002
dependsOn: [TASK-001]
labels: [area:lesson, area:simulations, area:systems-memory]
githubIssue: null
verificationRef: continuity/validation/2026-11-14T00-03-54-963Z-a4547737-2f02-451c-8767-8db2c7bac117/result.json
---

# TASK-009 — Moteurs déterministes TypeScript (`VIS-01`..`VIS-05`)

## Objectif

Implémenter en TypeScript pur (sans dépendance DOM/React) les 5 machines à états déterministes spécifiées dans [03-STORYBOARDS_VISUELS.md](../../docs/courses/program-memory-fundamentals/03-STORYBOARDS_VISUELS.md) sous `apps/web/src/lessons/program-memory-fundamentals/engines/`, accompagnées de leurs suites de tests unitaires Vitest.

## Critères d'acceptation

- [x] Moteur `VIS-01` (`cpu-memory.ts`) : cycle `Fetch -> Decode -> Execute -> Update RIP` et encodage little-endian vérifié octet par octet.
- [x] Moteur `VIS-02` (`virtual-memory.ts`) : traduction `Processus + Page Virtuelle -> Cadre Physique`, permissions `rwx`, bascule ASLR et déclenchement `SIGSEGV`.
- [x] Moteur `VIS-03` (`call-stack.ts`) : trames décroissantes, `RSP`/`RBP`, adresse de retour, octets résiduels conservés après `RET`, scénario `dangling pointer` et `stack overflow`.
- [x] Moteur `VIS-04` (`heap-allocator.ts`) : découpage en chunks (`size + A|M|P`), splitting, free-lists, coalescing activable, métriques de fragmentation interne/externe, bascule `mmap`, scénarios fuite / double free / Use-After-Free.
- [x] Moteur `VIS-05` (`memory-models.ts`) : chronologie synchronisée C manuel vs Rust Ownership vs GC traçant avec `GC Roots`.
- [x] Tests Vitest complets passant (`corepack pnpm test:unit`) couvrant les cas nominaux et tous les cas limites listés dans [06-RIGUEUR_SCIENTIFIQUE_ET_SOURCES.md](../../docs/courses/program-memory-fundamentals/06-RIGUEUR_SCIENTIFIQUE_ET_SOURCES.md).
