---
name: project-handoff
description: Execute the mandatory cross-agent resume and handoff protocol across Codex, Claude Code, and Gemini CLI. Use at session start to recover context from the repository, during long tasks to write checkpoints, and before ending any session.
metadata:
  owner: continuity-keeper
  version: "1.0"
---

# Project Handoff & Continuity

## When to Use

- At the beginning of every session before making changes.
- At intermediate checkpoints during multi-step implementations.
- At the end of every session or before handing work to another model/agent.

## Resume Workflow (Start of Session)

Follow `continuity/RESUME_PROTOCOL.md` strictly:

1. Read `docs/agents/AGENT_GUIDE.md` and the agent entry file (`AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`).
2. Read `continuity/CURRENT_STATE.md`, `continuity/HANDOFF.md`, and `continuity/BLOCKERS.md`.
3. Inspect `git status`, `git diff`, and recent `git log`.
4. Identify the active task in `planning/tasks/` and `planning/iterations/`.
5. Compare documentation claims against actual files on disk.
6. Run baseline verification (`corepack pnpm typecheck`, `corepack pnpm test:unit`).
7. Resume only the remaining uncompleted work.
8. Update `continuity/` files as progress occurs.

## Handoff Workflow (End of Session or Checkpoint)

1. Never mark a task `Done` unless all acceptance criteria are verified after the final edit.
2. Generate `continuity/CURRENT_STATE.md` with `quality:checkpoint` from actual state.
3. Generate `continuity/HANDOFF.md` with the same checkpoint and a concrete next action.
4. Record any unresolved environment or architectural obstacles in `continuity/BLOCKERS.md`.

## Learning studio acceptance

Read docs/standards/COURSE_AUTHORING.md. CURRENT_STATE.md and HANDOFF.md are generated. Use corepack pnpm quality:checkpoint --task <ID> --next "Exact next action" instead of manual edits. Preserve learning acceptance, inspected screenshot locations and pending scientific reviews.
