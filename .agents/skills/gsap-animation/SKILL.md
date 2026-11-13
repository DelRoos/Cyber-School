---
name: gsap-animation
description: Implement deterministic, accessible 2D animations using GSAP and Motion inside packages/animations and lesson components. Use when animating SVG diagrams, state transitions, timelines, or packet flows with play/pause/step and reduced-motion support.
metadata:
  owner: animation-2d-specialist
  version: "1.0"
---

# GSAP & Motion 2D Animation

## When to Use

- Building reusable animation primitives in `packages/animations`.
- Implementing step-synchronized SVG/DOM animations in an interactive lesson.

## Workflow

1. **Use shared primitives**: Import `usePrefersReducedMotion`, `getStepDuration`, `useGsapScope`, and `MotionStepPanel` from `@cyber-school/animations` (`packages/animations/src/index.ts`).
2. **Respect `prefers-reduced-motion`**:
   - Never rely solely on CSS or JS motion to convey state.
   - Compute durations via `getStepDuration(baseSeconds, reducedMotion)` so reduced-motion users snap immediately (`duration: 0`) while labels, highlights, and state badges remain clear.
   - `MotionStepPanel` already wraps content in `<MotionConfig reducedMotion="user">`.
3. **Keep timelines deterministic & clean**:
   - Scope GSAP animations with `useGsapScope(scopeRef, (ctx) => { ... }, deps)`, which runs `gsap.context(..., scopeRef)` inside `useEffect` and calls `ctx.revert()` on cleanup/Strict Mode double-mount.
   - Track active playback tweens via a `useRef<gsap.core.Tween | null>` so Play/Pause and Step Forward/Backward remain synchronized without overlapping animations.
4. **Minimal compilable example**:
   ```tsx
   import { useRef } from "react";
   import gsap from "gsap";
   import {
     getStepDuration,
     MotionStepPanel,
     useGsapScope,
     usePrefersReducedMotion,
   } from "@cyber-school/animations";

   export function StepDiagram({ stepIndex }: { stepIndex: number }) {
     const scopeRef = useRef<HTMLDivElement>(null);
     const reducedMotion = usePrefersReducedMotion();

     useGsapScope(scopeRef, () => {
       gsap.to("[data-packet]", {
         x: stepIndex * 80,
         duration: getStepDuration(0.45, reducedMotion),
         ease: "power2.out",
       });
     }, [stepIndex, reducedMotion]);

     return (
       <div ref={scopeRef}>
         <div data-packet>Packet</div>
         <MotionStepPanel stepKey={stepIndex}>
           <span>Step {stepIndex}</span>
         </MotionStepPanel>
       </div>
     );
   }
   ```
5. **Verify in browser**: Test animations and reduced-motion behavior via `browser-validation`.
