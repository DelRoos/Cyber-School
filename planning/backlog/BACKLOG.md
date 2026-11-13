# Backlog de développement

> Compatibilité GitHub Issues / Projects : chaque item possède un identifiant stable, une priorité (`P0`-`P2`), une estimation (`XS`/`S`/`M`/`L`), des dépendances et des labels normalisés.

| ID         | Titre                                                                                                  | Itération  | Priorité | Complexité | Dépendances | Labels                                    | Statut        |
| ---------- | ------------------------------------------------------------------------------------------------------ | ---------- | -------- | ---------- | ----------- | ----------------------------------------- | ------------- |
| `TASK-001` | Initialiser le monorepo, la gouvernance agents, les ADR, les skills et les packages socle              | `ITER-001` | `P0`     | `L`        | —           | `area:infra`, `area:agents`, `type:setup` | `Done`        |
| `TASK-002` | Implémenter le démonstrateur interactif TCP Three-Way Handshake et les tests Playwright                | `ITER-001` | `P0`     | `L`        | `TASK-001`  | `area:web`, `area:lesson`, `area:qa`      | `Done`        |
| `TASK-003` | Activer `packages/visualizations` (XYFlow) pour explorer graphiquement le graphe de concepts atomiques | `ITER-002` | `P1`     | `M`        | `TASK-002`  | `area:visualizations`, `area:curriculum`  | `Ready`       |
| `TASK-004` | Développer la leçon complète `tcp-sliding-window-and-congestion` (D3 + simulation interactive)         | `ITER-002` | `P1`     | `L`        | `TASK-003`  | `area:lesson`, `area:visualizations`      | `Backlog`     |
| `TASK-005` | Ajouter les évaluations cumulatives multi-concepts et la persistance locale de progression apprenant   | `ITER-002` | `P1`     | `M`        | `TASK-002`  | `area:exercises`, `area:web`              | `Backlog`     |
| `TASK-006` | Activer `packages/3d-scenes` (Three.js + R3F v9) avec harnais de budget performance et fallback WebGL  | `ITER-003` | `P2`     | `L`        | `TASK-003`  | `area:3d`, `area:architecture`            | `Backlog`     |
| `TASK-007` | Script d'export/synchronisation `planning/tasks/` <-> GitHub Issues / Projects                         | `ITER-002` | `P2`     | `S`        | `TASK-001`  | `area:tooling`, `area:planning`           | `Backlog`     |
| `TASK-008` | Garde-fous de validation, publication et continuité                                                    | `ITER-001` | `P0`     | `M`        | —           | `area:infra`, `area:agents`, `area:qa`    | `In Progress` |
