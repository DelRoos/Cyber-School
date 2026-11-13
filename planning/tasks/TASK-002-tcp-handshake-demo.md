---
id: TASK-002
title: Implémenter le démonstrateur interactif TCP Three-Way Handshake et les tests Playwright
status: Done
priority: P0
complexity: L
iteration: ITER-001
dependsOn: [TASK-001]
labels: [area:web, area:lesson, area:qa]
githubIssue: null
verificationRef: continuity/validation/2026-11-13T22-54-32-099Z-3d73b538-b5b8-4181-85c0-95f241d24b5c/result.json
---

# TASK-002 — Démonstrateur interactif TCP Three-Way Handshake

## Objectif

Développer dans `apps/web` une page pédagogique de référence sur le Three-Way Handshake TCP (SYN, SYN-ACK, ACK, transitions d'état, cas limite perte/retransmission, exercice de compréhension) validée par Playwright.

## Critères d'acceptation

- [x] Leçon accessible sur `/lessons/tcp-three-way-handshake` (et liée depuis `/`).
- [x] Schéma réseau animé avec GSAP/Motion + contrôles Play/Pause/Précédent/Suivant/Reset + mode perte SYN-ACK.
- [x] États TCP client/serveur (`CLOSED`, `LISTEN`, `SYN_SENT`, `SYN_RCVD`, `ESTABLISHED`) affichés clairement.
- [x] Exercice de compréhension interactif avec feedback ciblé et navigation clavier complète.
- [x] Tests Playwright (desktop + mobile, accessibilité de base, zéro console.error) passent après build.
