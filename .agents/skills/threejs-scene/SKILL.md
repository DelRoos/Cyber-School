---
name: threejs-scene
description: Architect, build, and optimize interactive 3D scenes with Three.js, React Three Fiber (v9+), and Drei within performance and accessibility budgets. Use ONLY when 3D provides clear pedagogical value over 2D.
metadata:
  owner: threejs-3d-specialist
  version: "1.0"
---

# Three.js & React Three Fiber Scene Engineering

## When to Use

- Only after `visual-explanation` confirms 3D offers a clear spatial/pedagogical advantage over 2D.
- When initializing or extending `packages/3d-scenes` (see `docs/architecture/PACKAGES_ROADMAP.md`).

## Workflow

1. **Enforce React 19 & Next.js compatibility**:
   - Use `@react-three/fiber` v9+ for React 19 compatibility.
   - Mark scene components `'use client'` and load them via `next/dynamic(..., { ssr: false })` with an accessible loading state.
2. **Respect 3D performance budgets** (from `docs/standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md`):
   - Target <= 100 draw calls, <= 100k triangles per scene, compressed textures <= 1024px unless justified, DPR capped (`dpr={[1, 2]}`).
   - Dispose geometries, materials, and textures on unmount; avoid allocating objects inside `useFrame`.
3. **Provide accessible alternatives**:
   - Include keyboard-accessible camera presets / step controls and a synchronized textual state summary.
   - Provide a graceful WebGL fallback when hardware acceleration or WebGL context is unavailable.
4. **Verify**: Check console errors, memory stability, and responsiveness with `browser-validation`.

## Learning studio acceptance

Read docs/standards/COURSE_AUTHORING.md. Require a concrete learning reason for depth and a readable text/2D equivalent; never add 3D merely to decorate a course.
