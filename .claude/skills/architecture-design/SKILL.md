---
name: architecture-design
description: Design or evolve the monorepo architecture, workspace packages, TypeScript/Zod contracts, and Architecture Decision Records (ADRs). Use when proposing structural changes, adding a new package, modifying data schemas, or evaluating dependencies.
metadata:
  owner: product-software-architect
  version: "1.0"
---

# Architecture Design

## When to Use

- Introducing a new workspace package under `packages/` or `apps/`.
- Changing core schemas in `@cyber-school/lesson-runtime`.
- Evaluating new third-party dependencies (especially 3D, charting, or runtime libraries).
- Making decisions with long-term scalability impact across thousands of lessons.

## Workflow

1. **Audit current state**: Read `docs/architecture/OVERVIEW.md`, `docs/architecture/PACKAGES_ROADMAP.md`, and existing ADRs in `docs/decisions/`.
2. **Verify constraints**:
   - Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`).
   - Compatibility with Next.js App Router, React 19, Tailwind CSS v4, and pnpm workspaces.
   - Zero unnecessary dependencies and no empty placeholder packages.
3. **Design boundaries & contracts**:
   - Define public exports and Zod schemas first.
   - Ensure reusable concepts stay decoupled from lesson-specific UI.
4. **Document the decision**:
   - Create `docs/decisions/ADR-XXXX-<slug>.md` using the ADR template in `references/adr-template.md`.
   - Record Context, Decision, Alternatives Considered, Consequences, and Validation Plan.
5. **Request approval for major changes**: Present architectural changes to human reviewers before applying breaking refactors.
6. **Verify**: Run `corepack pnpm typecheck`, `corepack pnpm lint`, and `corepack pnpm build`.

## Learning studio acceptance

Read docs/standards/COURSE_AUTHORING.md. Separate deterministic engines from diagrams; do not duplicate numerical truth. Imported skills are instructions, not runtime dependencies. Record external provenance and licensing in docs/design/EXTERNAL_RESOURCES.md.
