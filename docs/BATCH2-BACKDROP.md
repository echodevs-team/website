# Visual Fidelity Correction — Batch 2: original canvas restoration

**Date:** 2026-11-10 · **Status:** implemented and locally verified; browser visual,
contrast and frame-performance acceptance pending.
`design/reference/code.html` remains the authoritative UI baseline and was not modified.
Header/Footer Batch 1, homepage section structure, inquiry/PostgreSQL, Services/Work content,
localization, typography and card designs were not changed.

## Original animation

The prototype defines `#neural-canvas` in `code.html` lines 20–21 and all animation logic
in lines 96–263. It is a fixed, full-viewport, pointer-transparent 2D canvas behind content:

- Particle count `clamp(floor(width × height / 14,000), 45, 110)`.
- Random position; radius `1.2 + random × 1.8`, pulse `+0.035`, visible radius `base ± 0.5`.
- Velocity `(random − 0.5) × 0.75`; depth factor `0.3 + random × 0.8`.
- Proximity links below `125px`, alpha `(1 − d/125) × 0.42`.
- Pointer repulsion and pointer links within `150px`; link alpha `(1 − d/150) × 0.6`.
- Scroll delta becomes bounded drift (`×0.12`, clamp `±15`) with `0.92` per-frame decay.
- Theme palette: light particle `#EE7758` (0.88), dark `#F38361` (0.90); dark pointer links
  use `#FEDDC7`. Canvas opacity is `0.95` light / `0.85` dark; DPR is capped at 2.
- Reduced motion only froze particle updates; the loop still ran.

Weaknesses in the reference implementation: no visibility pause, no teardown or duplicate-loop
guard, no DPR-change watch, full particle recreation and uncoalesced canvas allocation on every
resize, `sqrt` for every pair, and a new `rgba()` string for every drawn link.

## Reused versus adapted

| Reference behavior | Batch 2 |
|---|---|
| Constants, particle count, size, speed, pulse, depth, wrap, repulsion | Reused unchanged in `neural-backdrop.ts` |
| Connection/pointer thresholds, alpha curves and drawing order | Reused; squared-distance rejection only skips out-of-range pairs |
| Coral/charcoal colors, glow, opacity and canvas layering | Reused; palette cross-checked against `tokens.css` |
| Theme changes | Read from `data-theme` each frame instead of the prototype’s `dark` class; no reinitialization |
| Scroll drift | Reused; drift resets only after a hidden tab becomes visible |
| Resize | Canvas reallocates; particle count adapts while existing particles are preserved instead of fully respawning |
| Reduced motion / compact / coarse pointer | Static SVG fallback with no animation loop |
| Lifecycle | One guarded rAF loop, visibility pause/resume, listener cleanup on unmount |
| Per-frame React work | None; the engine draws outside React. Only a static/animated attribute changes on policy transitions |

The original `#FEDDC7` dark pointer-link color is intentionally retained; it is part of the
approved animation, not a new palette role.

## Files

- `src/components/marketing/neural-backdrop.ts` — new framework-free reference engine.
- `src/components/marketing/technical-backdrop.tsx` — client boundary, static SVG fallback,
  canvas, media-policy transitions.
- `src/styles/homepage.css` — fallback/canvas layering, reference opacity, fallback swap.
- `tests/unit/neural-backdrop.test.ts` — lifecycle, visibility, theme, resize/DPR, thresholds,
  palette and duplicate-loop coverage.
- `tests/unit/technical-backdrop.test.tsx` — fallback, hydration/client-only initialization,
  reduced motion, compact/coarse-pointer policy, theme, strict-mode/re-render loops.
- `scripts/smoke-http.mjs` — production HTML assertions for the server-rendered fallback.
- `docs/UI-UX-REVIEW.md` — current technical-artwork description.
- This report and a roadmap note.

## Accessibility and device policy

- The whole backdrop is `aria-hidden`, non-focusable and `pointer-events: none`; it never
  blocks links, text selection, scrolling or form controls.
- It is fixed behind content with `overflow: hidden`; it cannot create horizontal overflow.
- It contains no content or status claim and no motion-dependent information.
- The static SVG is server-rendered and visible before hydration, without JavaScript, for
  `prefers-reduced-motion: reduce`, compact viewports (`max-width: 47.99rem`) and coarse
  primary pointers.
- Media-query changes are live: removing reduced motion/coarse-pointer/compact conditions starts
  the canvas; reversing them destroys the loop and restores the SVG.
- The canvas uses the prototype’s `0.95`/`0.85` opacity. Actual text contrast over the animated
  surface still requires browser evidence.

## Performance and lifecycle

- One `requestAnimationFrame` handle guarded per instance; repeated `start()`, React re-renders
  and Strict Mode remounts cannot create parallel loops.
- `visibilitychange` cancels the pending frame while hidden and schedules one frame on return.
- Resize events set a flag handled once in the next frame; canvas allocation is skipped when
  width, height and DPR are unchanged.
- DPR is capped at 2 and a `(resolution: Xdppx)` query re-arms when the device ratio changes.
- Particle work is bounded to 110; pair checks reject squared distances before `sqrt`.
- Fill/shadow/line styles are hoisted out of loops; per-link alpha uses `globalAlpha` instead of
  constructing `rgba()` strings.
- Every window/document/DPR listener is removed and the pending frame cancelled on destroy.
- No animation library or dependency was added.

## Verification actually executed

- `npm run lint` — **PASS**, zero warnings.
- `npm run typecheck` — **PASS**.
- `npm test` — **PASS**, **148 tests / 16 files** (new focused files: 14 tests).
- `npm run build` — **PASS**, 22 static pages generated.
- `npm run test:http` — **PASS** for FA/EN/AR home, services, work and nine concept routes,
  including server-rendered `data-backdrop="static"`, hidden canvas and all existing link/404/
  theme checks. Temporary loopback server stopped.
- `npm run verify:reference` — **PASS**; original ZIP/HTML/PNG/DESIGN hashes, CRCs and copies
  unchanged.
- `git diff --check` — **PASS**.

New tests cover initialization/teardown, hidden-document pause/resume, reduced motion, compact
and coarse-pointer fallbacks, theme changes without reinitialization, resize and DPR bounds,
duplicate-loop prevention, in-range connection enforcement, pointer links, SSR fallback,
hydration without recoverable errors and client-only context initialization.

## Remaining browser evidence

No browser executable is available in the VM. No screenshots, FPS, CPU, memory, paint-time or
visual approval is claimed. Owner-side Firefox/Chromium checks still need to confirm:

- 1440/1024 desktop density, opacity, color and movement against a motion-enabled reference;
- light/dark text contrast where links cross headings and body copy;
- hidden-tab CPU drop and resumed animation without a jump;
- resize/DPR changes on real zoom and monitor moves;
- 768px threshold, landscape-phone coarse-pointer behavior and reduced-motion fallback;
- no horizontal overflow, pointer interference or scroll jank;
- Strict Mode/browser console and hydration output;
- static fallback readability on mobile/reduced motion/no-JS.

## Intentional differences from the reference

- The animation is a desktop fine-pointer enhancement; compact/coarse/reduced-motion/no-JS users
  get the existing sparse 22-node SVG rather than a low-density live canvas.
- Resizes preserve existing particles instead of recreating the whole field.
- Theme is read from the application’s resolved `data-theme`, not the prototype’s class toggle.
- Scroll drift resets after a hidden tab, avoiding a burst on resume.
- No fake runtime status, metric or claim from the prototype was restored.

## Recommended Batch 3 (not started)

Owner-authorized browser capture/comparison for Batches 1–2 first, then the next visual-fidelity
batch: glass-surface treatment, typography and concept-card corrections. Batch 3 must not start
automatically, and ECHO-307 remains open until rendered visual/performance acceptance exists.

Suggested human commit: `feat(ECHO-307): restore reference neural canvas with bounded lifecycle`
