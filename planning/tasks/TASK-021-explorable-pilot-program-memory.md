---
id: TASK-021
title: Refondre le cours pilote program-memory-fundamentals en Explorable Explanation visuelle et tactile
status: Done
verificationRef: continuity/validation/2026-11-14T11-04-30-392Z-ac95b35b-aa8b-4154-bd4a-d3178841b2a6/result.json
priority: P0
complexity: L
iteration: ITER-002
dependsOn: [TASK-020]
labels: [area:lesson, area:visualizations, area:web, area:qa]
githubIssue: null
---

# TASK-021 — Refonte Explorable Explanation du cours pilote `program-memory-fundamentals`

## Objectif

Transformer le cours de référence `program-memory-fundamentals` en véritable expérience _Explorable Explanation_ (approche _Brilliant / Bartosz Ciechanowski_) : schéma interactif animé au centre dès l'entrée dans chaque chapitre, manipulation directe (tranches d'octets, curseurs, bascules `Little-Endian`, `ASLR`, `Coalescing`, `-O0/-O2`), chapitres sans impasse (simulateur dédié pour les pointeurs pendants et explorateur interactif de compilation) et réduction drastique des blocs de prose denses.

## Critères d'acceptation

- [x] `memory-course-experience.tsx` et `chapter-guidance.ts` placent la scène interactive au centre de chaque chapitre avec micro-étayage concis (sans mur de texte préalable).
- [x] `VIS-01` à `VIS-05` montrent physiquement chaque concept par des schémas SVG animés et manipulables (bus couleur octet par octet en Little-Endian, fibres MMU `rwx` avec ASLR dynamique, tour de pile `RSP/RBP` + Guard Page, ruban proportionnel du tas avec padding hachuré et flèches UAF, 3 pistes animées C / Rust Ownership / GC traçant).
- [x] Le chapitre 4 dispose de son propre simulateur interactif de pointeur pendant (`VisPointerDangling`) et le chapitre 6 remplace les blocs `<pre>` figés par un explorateur interactif `-O0` vs `-O2`.
- [x] Tous les contrôles qualité (`quality:verify --task TASK-021`, y compris Playwright desktop + mobile `375x812`) passent avec zéro erreur après la refonte.
