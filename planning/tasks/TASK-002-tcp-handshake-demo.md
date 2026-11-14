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
verificationRef: continuity/validation/2026-11-14T00-03-07-255Z-80e89ca7-cefa-4b5e-b67d-21a20837455b/result.json
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
