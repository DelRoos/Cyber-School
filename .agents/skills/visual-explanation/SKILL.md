---
name: visual-explanation
description: Design interactive visual explanations and choose the optimal medium (2D SVG/Canvas/DOM, data graph, or 3D WebGL). Use when turning abstract technical concepts into visual storyboards, diagrams, or simulations.
metadata:
  owner: visual-scenario-designer
  version: "1.0"
---

# Visual Explanation

## When to Use

- Designing a new interactive diagram, simulation, or visual storyboard for a lesson.
- Deciding between a 2D visualization (SVG/GSAP/D3/XYFlow) and a 3D scene (Three.js/R3F).

## Workflow

1. **Check standards**: Read `docs/standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md`.
2. **Choose the right medium (2D vs 3D)**:
   - Default to **2D** (SVG + GSAP + Motion) for protocols, timelines, state machines, data flows, trees, and architecture diagrams.
   - Use **3D** only when spatial depth, 3D geometry, hardware topology, or physical orientation directly improves comprehension.
3. **Map concept state to visual encoding (apply `pedagogical-animation`)**:
   - Every visual change (color, motion, position, label) must correspond to a state transition or invariant in the concept model and visually expose the **cause -> mechanism -> effect** chain.
   - Pair every visual state change with an adjacent micro-callout (`ConceptTransformBanner` / delta `before -> after`) satisfying Mayer's Signaling & Spatial/Temporal Contiguity principles.
   - Reject unlabelled floating dots, detached bottom legends, and text-only toggles without a live mechanism diagram.
4. **Design for exploration & edge cases**:
   - Include step-by-step progression, direct state inspection, and at least one edge/failure case (e.g., packet loss, timeout, boundary input).
5. **Enforce accessibility**:
   - Full keyboard control (`ArrowLeft`, `ArrowRight`, `Space`, `Tab`), visible focus rings, ARIA live announcements for state changes, and high contrast.

## Learning studio acceptance

Read docs/standards/COURSE_AUTHORING.md. Specify initial state, learner action, changed variables and adjacent explanation before drawing. Provide a worked example and prediction. Prioritize the main experiment on mobile; put advanced controls second.
