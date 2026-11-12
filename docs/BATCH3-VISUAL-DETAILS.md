# Visual Fidelity Correction — Batch 3: homepage visual details

**Date:** 2026-11-11 · **Status:** implemented and locally verified; browser visual,
theme, RTL shaping, reduced-motion and rail-overlap acceptance pending.
`design/reference/code.html` remains the authoritative UI baseline and was not modified.

Scope was limited to homepage presentation: glass materials, hero/section typography,
concept-card language, inquiry composition, CTA material and the section rail. Header,
Footer, technical canvas, section order, service/work copy, inquiry validation, API,
PostgreSQL, security and deployment were not changed.

## Corrected differences

| Reference evidence | Batch 3 implementation |
|---|---|
| `.liquid-glass-card`: white 28% / `rgba(24,20,18,.35)`, `blur(4px) saturate(140%)`, coral-tinted borders and layered soft shadows | `.home-glass` now uses an opaque surface fallback, then the reference translucent fill, 12% coral border and source shadow values behind `@supports` for prefixed/unprefixed `backdrop-filter`. Dark fill is the `#181412` background token at 35%. |
| Hero `text-4xl sm:text-5xl lg:text-6xl`, `leading-[1.3]`; white/80 translucent secondary CTA; `px-7 py-3.5` primary | Discrete `2.25rem / 3rem / 3.75rem` scale at the same 640/1024px breakpoints, 1.3 line-height, EN-only tight tracking, taller CTAs, coral primary shadow and a translucent 80% glass secondary with an opaque fallback. Existing accessible action tokens replace white-on-coral. |
| 11–12px semibold coral eyebrows with a 8px dot; uppercase wide tracking | Eyebrows are 11px/600 with 8px dots on Services and Demos; EN only receives uppercase and 10% tracking. Persian/Arabic keep natural joining and case behavior. |
| Hero badge: coral/10, coral/25 border, dot; source service-pillar badge | Badge proportions, 10% tint, 25% border, 600 weight and 8px dot restored. |
| Concept cards: per-card badge color family, dot, 12rem preview, bars/chat/booking samples, 11px telemetry, stack tags, separated CTA | Cards keep the shared `ConceptVisual` component used by Work details. Each concept owns a localized badge and a light/dark accent (`analytics` blue, `chat` purple, `booking` emerald). Preview labels, varied bar opacity, preview booking statuses and source density were restored without operational claims. |
| Concept card copy: 12px description, 12px stack tags, 12px action | Card copy and technical labels were reduced to the source 12px scale; card body/action wrappers keep the footer aligned across cards. |
| Inquiry card: ~3rem padding, 5/7 split, items-start; white/60 form panel | `align-items:start` and 5fr/7fr columns restored. The form panel is opaque without backdrop support and 60% surface with blur support; controls likewise fall back to opaque. Validation, persistence, idempotency, abuse controls and status copy were untouched. |
| Dark pill section rail on the physical right; 10px dots; dark tooltip | Rail is now a dark translucent `#181412` pill with blur, subtle border/shadow, 10px dots, dark tooltip and physical right placement matching the RTL source. It stays at the current 1024px threshold and keeps 44px targets instead of the source's 768px/18px links. |
| Hover elevation and coral heading hover | Progressive `:hover`/`:focus-within` elevation and heading color were added. Motion exists only under `prefers-reduced-motion: no-preference`; reduced motion removes transitions. No animation library. |

## Reused structures

- Existing typed `homeContent` and `ConceptVisual`; badges are localized content fields.
- Existing semantic palette, spacing, radius, target-size, focus and action tokens.
- Existing section order, copy, `Homepage`, Header/Footer, inquiry client/server flow.
- Existing `@supports` pattern and CSS-only motion policy; no dependency or new service.
- Existing unit/HTTP smoke harness, extended with fidelity assertions.

## Intentional deviations and safety decisions

- **Accessible actions:** the source’s white-on-coral primary button fails normal-text
  contrast. The project keeps its darker coral light-theme action role and dark-theme
  light-coral role; the material and proportions follow the source.
- **Hero weight:** the source requests `font-extrabold` (800), but the licensed local
  Vazirmatn files ship 400/500/700. The heading stays at the available 700 weight rather
  than applying synthetic emboldening that can distort Persian/Arabic shaping.
- **Concept truthfulness:** source strings such as `SaaS_v2.4`, `RPS`, `TOKENS`, `HIPAA`,
  `SLA`, `24/7` and “instant confirmation” imply unverified versions, capacity,
  certification or availability. Batch 3 uses `*_PREVIEW`, `SERIES: —`, `RATE: —`,
  `PREVIEW` chips and the existing “illustrative data only” caption instead.
- **Rail threshold:** source shows the rail from 768px with ~18px links. The project
  retains 44px targets and keeps the rail hidden below 1024px to reduce known
  content-overlap risk. No scroll-spy or active state was invented.
- **Rail position:** `right` is intentional. The source itself uses physical `right-6`
  and the rail is a fixed physical control; it does not mirror with document direction.
- **Per-card accent tint:** the source preview box border is neutral while its badge is
  colored. The implementation uses the card accent at low alpha on the preview border for
  identity; contrast was modeled for badge/status text over their own tinted surfaces.
- **Dark glass border:** uses the source `#ffb68e` tint at 12%/8% rather than the dark
  brand token, matching the approved material.
- **Inquiry form:** source fake success, unapproved contacts and 24-hour response claim
  remain removed. Only the visual panel changed.

## Shared-page risk

`.home-glass` is shared by the homepage, `/services`, `/work` and `/work/[slug]`.
Restored translucency/blur therefore changes surfaces on those pages too. Their layouts
and content were not edited, but browser acceptance must include at least one Services,
Work and Work-detail page in both themes; nested translucent panels, text over the
animated backdrop and GPU cost are not covered by the CSS source checks.

## Files

- `src/styles/homepage.css` — glass fallback/material, hero scale, eyebrow/badge details,
  concept accents/telemetry/density, inquiry panel and controls, rail, hover/reduced-motion.
- `src/components/marketing/concept-visual.tsx` — shared per-concept badge, preview label,
  varied bars, preview booking status and honest telemetry.
- `src/components/marketing/homepage.tsx` — dot headings and concept body/action wrappers.
- `src/content/home.ts` — localized per-concept badges; removed generic concept label.
- `tests/unit/homepage.test.tsx` — distinct badges, previews, telemetry, card structure,
  no numeric/fake operational claims.
- `tests/unit/homepage-fidelity.test.ts` — material/fallback/reduced-motion source checks
  and accent contrast for both themes.
- `tests/unit/tokens.test.ts` — modeled 28%/35% glass, inquiry panel/control and preview
  surface contrast.
- `scripts/smoke-http.mjs` — production homepage preview/badge/telemetry assertions and
  fake-metric rejection.
- `docs/UI-UX-REVIEW.md`, `ROADMAP.md` and this report — current evidence and boundaries.

## Verification actually executed

- `npm run lint` — **PASS**, zero warnings.
- `npm run typecheck` — **PASS**.
- `npx vitest run tests/unit/homepage.test.tsx tests/unit/homepage-fidelity.test.ts tests/unit/tokens.test.ts tests/unit/work-details.test.tsx` — **PASS**, 30 tests / 4 files.
- `npm test` — **PASS**, **154 tests / 17 files**.
- `npm run build` — **PASS**, 22 static pages generated.
- `npm run test:http` — **PASS** for FA/EN/AR homepage, services, work and nine concept
  detail routes, including new badge/body/telemetry/preview assertions, fake-metric
  rejection, redirects, disabled inquiry API, localized 404s and blocked reference
  paths. Owned loopback server stopped.
- `npm run verify:reference` — **PASS**; original ZIP/HTML/PNG/DESIGN hashes, member CRCs,
  extracted copies and frozen prototype consistency unchanged.
- `git diff --check` — **PASS**.

The contrast checks are sRGB compositing models over assumed backdrops, not rendered
pixels or a browser audit.

## Browser gaps and QA checklist

No browser executable is available in the VM, and no browser was launched or downloaded
in this batch. No screenshot, visual diff, real backdrop-filter rendering, FPS/GPU,
native RTL shaping, keyboard or zoom result is claimed. Batch 1–2 browser gaps remain.
Owner-operated Firefox/Chromium checks should cover:

1. **Fidelity pairs:** FA/EN/AR homepage at 1440×1000 and 375×812, light/dark, against
   matching `code.html` captures; record reference asset/CDN failures.
2. **Glass:** card fill, blur/saturation, borders, shadows and text contrast over the
   animated backdrop; verify nested Services/Work/detail cards. Disable backdrop support
   (or test an unsupporting browser profile) and confirm the opaque fallback.
3. **Typography:** hero 2.25/3/3.75rem breakpoints, section heading wrapping, EN tracking,
   FA/AR shaping and line breaks, 200% zoom, and no clipped badges/telemetry.
4. **Concept cards:** distinct badge colors in both themes, preview-code wrapping at
   320/375/768/1024, bar/chat/booking density, stack-tag wrapping, aligned action footers.
5. **Rail:** 1024/1440 right-edge overlap with content/CTAs, tooltip position in RTL/LTR,
   44px focus targets, tab order, no active-state claim. 768px remains intentionally hidden.
6. **Inquiry:** panel/field contrast in both themes, odd last field spanning the grid,
   error/uncertainty/retry states, disabled preview, no overflow or hidden submit on mobile.
7. **Motion:** hover/focus elevation and secondary-CTA lift only with motion enabled;
   reduced motion removes transitions and keeps all information/navigation static.
8. **Keyboard/console:** focus visibility through rail, cards and form; no hydration or
   backdrop-filter console errors; theme persistence across reloads/navigation.

Required viewport/theme/locale combinations from `docs/UI-UX-REVIEW.md` still apply;
this checklist adds Batch 3-specific glass, rail and concept checks. No task checkbox is
closed by source-level evidence alone.

## Suggested human commit

`fix(ECHO-301): restore homepage glass, typography and concept details`
