# Roadmap — Cyber School (Académie Interactive AI-First)

## Jalons (Milestones)

### M1 — Socle technique & Continuité AI-First (`ITER-001` — En cours)

- Monorepo `pnpm` + `Turborepo` + TypeScript strict + ESLint + Prettier.
- Gouvernance multi-agents (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, 8 skills, 13 rôles, `continuity/`).
- Modèle pédagogique Zod (`@cyber-school/lesson-runtime`), design system (`@cyber-school/ui`), primitives d'animation (`@cyber-school/animations`), moteur d'exercices (`@cyber-school/exercises`).
- Premier démonstrateur interactif : **TCP et le Three-Way Handshake**.
- Validation complète : Vitest + Playwright + GitHub Actions CI.

### M2 — Explorateur de curriculum, Cours Mémoire de référence & Modules fondateurs (`ITER-002`)

- Activation de `packages/visualizations` (XYFlow pour le graphe de concepts atomiques + D3 pour métriques/fenêtres).
- Conception et implémentation du premier cours complet de référence : **Fonctionnement de la mémoire d'un programme** (`systems-and-memory`, 14 concepts atomiques, `VIS-01..05`).
- Extension du corpus _Réseaux fondamentaux_ (`ip-packet-delivery`, `tcp-ports-and-sockets`, `tcp-sliding-window`, `dns-resolution`).
- Évaluations cumulatives multi-concepts et intégration des premiers liens vers laboratoires externes vérifiés.

### M3 — Scènes 3D pédagogiques & Simulations avancées (`ITER-003`)

- Activation de `packages/3d-scenes` (Three.js + React Three Fiber v9 + Drei) sous contraintes strictes de performance.
- Premières leçons où la 3D est justifiée (ex: architecture pipeline CPU / encapsulation multi-couches spatiale / topologie réseau physique).

### M4 — Corpus étendu & Assistant IA contextuel (`ITER-004+`)

- Passage à l'échelle du corpus (dizaines puis centaines de leçons).
- Assistant IA contextuel ancré sur l'état de la simulation et le graphe de prérequis (jamais générateur de cours à la volée).
- Synchronisation optionnelle du suivi `planning/tasks/` avec GitHub Issues & GitHub Projects.
