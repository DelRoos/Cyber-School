---
name: assessment-authoring
description: Design diagnostics, prediction prompts, misconception-targeted distractors, grading rubrics, and cumulative assessments aligned with Cyber School lesson manifests and course pages. Use when authoring or iteratively refining exercises, quizzes, and evaluation blocks.
metadata:
  owner: exercise-designer
  version: "1.0"
---

# Assessment Authoring

## When to Use

- Designing comprehension checks, interactive predictions, and cumulative assessments during `lesson-design` or `course-page-production`.
- Refining an existing lesson or course page so wrong answers actively diagnose and repair student misconceptions.
- Auditing alignment between chapter explanations, worked examples, deterministic simulators, and `lessons/<slug>/lesson.json` / `course.page.json`.

## Core Principles (from `docs/standards/COURSE_AUTHORING.md`)

1. **No recall-only busywork**: Test causal reasoning, state prediction (`before -> after`), trace ordering, boundary identification, or fault diagnosis rather than isolated vocabulary memorization.
2. **Numerical & state parity with worked examples and simulators**: Every trace, packet field, memory offset, or alert value in an exercise must match a reproducible deterministic model (`packages/exercises` / simulator engine), never arbitrary placeholder numbers.
3. **Diagnostic distractors**: Each incorrect option must represent a **specific, plausible learner misconception** (e.g., off-by-one frame size, confusing transport port with IP address, treating correlation as causation).
4. **Actionable wrong-answer feedback**: Never reply with `"Incorrect"` or score alone. Every feedback item must explain:
   - _Why_ the chosen answer breaks down (naming the misconception),
   - _What_ mechanism actually governs the case,
   - _Where_ to re-observe the effect inside the chapter explanation or simulator.
5. **Complete coverage without orphans**: Every chapter concept has a comprehension question, every interactive experiment has a pre-manipulation prediction prompt, and every chapter exercise appears once and feeds the cumulative evaluation as required by `COMPLETE_COURSE_WORKFLOW.md`.

## Authoring & Refinement Loop

1. **Map concepts to observable mastery**: For each `AtomicConcept`, write one observable performance statement ("Given X input/state, the learner predicts/diagnoses Y").
2. **Draft the three assessment layers**:
   - **Pre-manipulation prediction**: Ask what variable or invariant changes before the learner clicks or steps the simulation.
   - **Chapter reasoning check**: Construct prompt + correct rationale + 2–3 misconception-mapped distractors with individualized explanations.
   - **Transfer & cumulative synthesis**: Pose a near-transfer variant changing parameters, assumptions, or failure conditions without introducing untaught vocabulary.
3. **Calibrate clarity with `better-writing` & `humanizer`**: Ensure prompts are unambiguous, buttons/labels match chapter terminology identically, and hints never leak the answer through grammatical or length cues.
4. **Adversarial critique (`doubt-driven-development`)**: Challenge each question: can a learner guess right for the wrong reason, or fail due to ambiguous wording rather than conceptual error?
5. **Verify against schema & browser**: Run `corepack pnpm validate:curriculum`, `corepack pnpm test:unit`, and verify retention + answer-change invalidation in Playwright (`browser-validation`).
