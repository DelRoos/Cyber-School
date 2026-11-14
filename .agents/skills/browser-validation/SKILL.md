---
name: browser-validation
description: Validate rendered pages, interactive controls, keyboard navigation, responsive layouts, basic accessibility, performance sanity, and console cleanliness using Playwright. Use after any UI, lesson, or styling change before marking a task complete.
metadata:
  owner: qa-engineer
  version: "1.0"
---

# Browser Validation (Playwright)

## When to Use

- After modifying `apps/web`, `packages/ui`, `packages/animations`, `packages/exercises`, or any interactive lesson.
- Before marking any UI-facing task as `Done`.

## Workflow

1. **Ensure unit & build checks pass first**:
   - `corepack pnpm typecheck`
   - `corepack pnpm lint`
   - `corepack pnpm test:unit`
2. **Run Playwright E2E suite**:
   - `corepack pnpm test:e2e` (configured in `playwright.config.ts` and `tests/e2e/`).
3. **Verify mandatory assertions in every lesson/page test**:
   - HTTP 200 and expected primary heading visible.
   - Zero `console.error` and zero uncaught `pageerror` events.
   - Interactive state transitions work via click AND keyboard (`Tab`, `Enter`/`Space`, `ArrowRight`/`ArrowLeft`).
   - Comprehension exercises accept answers and display pedagogical feedback.
   - Responsive check at mobile (`375x812`) and desktop (`1280x800`) without unintended horizontal overflow (`scrollWidth <= innerWidth`).
   - Basic performance check (navigation load timing reasonable, no infinite layout loops).
4. **Report facts only**: Record exact commands run and observed pass/fail counts in `continuity/CURRENT_STATE.md`.

## Learning studio acceptance

Read docs/standards/COURSE_AUTHORING.md. Capture and inspect full pages at 1280x800 and 375x812. Test search, empty results, all navigation, chapter changes, checked-answer retention and invalidation after editing. Check wrong-answer feedback, readable text, focus and source disclosures. Record actual commands and screenshots.
