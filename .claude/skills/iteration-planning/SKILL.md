---
name: iteration-planning
description: Decompose roadmap milestones into iterations and atomic, testable tasks with dependencies, complexity estimates, and verifiable acceptance criteria. Use when planning work, grooming the backlog, or preparing the next iteration.
metadata:
  owner: iteration-planner
  version: "1.0"
---

# Iteration Planning

## When to Use

- Creating or updating `planning/roadmap.md` or `planning/backlog/BACKLOG.md`.
- Preparing a new iteration file under `planning/iterations/`.
- Breaking a feature or lesson into atomic tasks under `planning/tasks/`.

## Workflow

1. **Review context**: Read `planning/roadmap.md`, `continuity/CURRENT_STATE.md`, and `continuity/BLOCKERS.md`.
2. **Decompose atomically**:
   - Each task must deliver a cohesive, verifiable increment.
   - Explicitly list upstream/downstream dependencies (`dependsOn`).
   - Estimate complexity (`XS`, `S`, `M`, `L`) — split `XL` tasks into smaller ones.
3. **Define objective acceptance criteria**:
   - Every criterion must be testable (command, Playwright assertion, schema validation, or file verification).
4. **Maintain GitHub Issues/Projects compatibility**:
   - Include YAML frontmatter (`id`, `title`, `status`, `priority`, `complexity`, `labels`, `iteration`, `dependsOn`) in task files so they map cleanly to GitHub Issues/Projects later.
5. **Update continuity**: Reflect the active iteration and next `Ready` task in `continuity/CURRENT_STATE.md`.
