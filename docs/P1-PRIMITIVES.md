# ECHO-104/105 — tokens and shared primitives

Historical 2026-11-04 batch report. Header and theme/navigation were implemented
in the following batch; current behavior/evidence: `P1-SHELL.md`. ECHO-105 still
awaits actual browser state verification.

Task(s): ECHO-104, ECHO-105 · 2026-11-04  
Status: **104 done; 105 partial** (Header excluded by owner, actual browser keyboard/visual state demonstration pending).

## Contract and use

`src/styles/tokens.css` is the semantic color/typography/layout contract. Warm
surfaces, charcoal text and original decorative coral preserve the approved
direction. Never use decorative coral behind white text. Opaque surface/action
pairs are intentional. Borders on cards are decorative; fields use a stronger
control border. Error text accompanies invalid borders, not color alone.

`globals.css` loads local fonts, tokens and primitive styles. Default is light;
`data-theme="dark"` only defines an opt-in palette for future previews/themes.
There is no media-query theme, toggle, persistence or initialization script.
Use the theme attribute at document/shell level so foreground/background match.
Do not implement per-component palette copies. Font sizes use rem/fluid scales;
body line height 1.85 and heading 1.5 accommodate connected scripts. Logical
spacing and wrapping avoid direction-specific variants; never letter-space FA/AR.

All components are server-compatible functions, without hooks or `use client`.
Import them inside a client form when event handlers/state are needed. Caller
supplies localized content; there are no embedded English control strings.

| API | Behavior / responsibility |
|---|---|
| `Button` | Native button; default `type="button"`; primary/secondary. Explicit submit type for forms. `loading={true}` requires localized `loadingLabel`, disables action, sets busy and pending name (including overriding an idle aria-label). Consumer owns submission and live result announcements. |
| `Link` | Required href; native anchor, text/primary/secondary appearance; locale URLs supplied by caller. New-tab links retain rel and add noopener/noreferrer. No fake disabled/loading navigation; omit unavailable links. |
| `Field` | Stable unique caller `id`, visible `label`; input by default or `multiline` textarea. Merges caller described-by IDs with description/error IDs; error sets invalid. Native required/disabled/readOnly/autocomplete/inputMode/dir supported. Use text-like inputs, not as checkbox/radio/file/select layout. Consumer owns validation, error summary/live announcements and focus on failure. |
| `Container` | Logical auto margins/gutters, max 90rem (1440px at default root size); no landmark. Avoid nested gutters. Foundation main retains its existing narrower reading measure. |
| `SectionHeading` | Required id for section association; level 1/2/3 (default 2), optional description. Caller maintains heading order and one page h1. |
| `Card` | Noninteractive article with native attributes; use `aria-labelledby` and an inner named link. No tabindex/clickable wrapper or nested controls disguised as links. |
| `Footer` | Native footer + Container slot; only supplied verified content. No fabricated contacts or premature marketing assembly. |

Example composition (use dictionary strings, not these illustrative names):

```tsx
<section aria-labelledby="topic">
  <SectionHeading id="topic">{t.title}</SectionHeading>
  <Field id="email" name="email" type="email" dir="ltr"
    autoComplete="email" label={t.email} error={errors.email} />
  <Button type="submit" disabled={unavailable}>{t.send}</Button>
</section>
```

Keep emails/phones/code LTR-isolated; do not set the whole RTL form to LTR.
IDs must be unique if two form instances exist. Native keyboard operation is
retained (Enter/Space for button, Enter for anchor); disabled/pending buttons are
removed from sequential focus by the browser. There is no custom focus trap.
All focusable elements receive a 3px outline with 4px offset; do not clip it.
Controls target 44px minimum height and button width; inline text links remain
text links. No transitions, animation or hover-only content are introduced.

## Actual verification

- `npm ci --ignore-scripts --no-audit --no-fund`: PASS, 409 packages; existing
  unsupported ESLint 9 warning. No dependency/lockfile changes.
- `npm run lint`, `npm run typecheck`, `npm test`,
  `NEXT_TELEMETRY_DISABLED=1 npm run build`: PASS. 3 test files, **25 tests**
  (6 existing locale, 9 SSR component, 10 token/font checks). SSR checks native
  semantics, localized busy/disabled names, label/help/error relationships,
  textarea escaping, new-tab rel, direction propagation and heading/landmarks.
- `npm run test:http`: PASS, production loopback server stopped in finally;
  FA/AR RTL, EN LTR, actual translated headings, redirects, noindex, locale links,
  localized 404s, spoofed-header protection and reference path non-exposure.
- `npm run verify:reference`: PASS, archive/original/prototype hashes and CRCs
  unchanged. No original source edits.
- WCAG sRGB calculations read the implemented palette, not duplicated fixtures.
  Text minimum across text/muted/link/action-hover/action-active/error/success
  against both surfaces: **light 5.19:1, dark 6.45:1**. Filled action text minimum
  across idle/hover/active: **5.46:1 / 7.17:1**. Field-boundary/focus minimum:
  **4.51:1 / 5.08:1**. Disabled text: **5.66:1 / 6.20:1** (even though disabled
  controls are exempt). Decorative brand/borders are deliberately not text or
  sole control boundaries. These calculations are not a complete WCAG audit.
- Fontconfig `fc-scan`: all three Arabic weights cover common Persian/Arabic
  letters, both digit sets and ZWNJ/ZWJ. Six local WOFF2 files total **113,452
  bytes**, split by weight/script, swap loading, no external requests or extra
  font library. OFL reviewed/copied; provenance in `public/fonts/README.md`.
- An initial explicit Vitest esbuild JSX option failed typecheck with installed
  Vite types; removed it (installed defaults already handle TSX). Final typecheck
  and TSX tests pass; no failing test removed.

## Evidence gaps and scope

No available Chromium binary in the existing isolated browser-tool directory;
no new download attempted. **No screenshots or actual manual keyboard, 200%
zoom/reflow, forced-colors, screen-reader, axe, browser font-loading or
native-script shaping approval**. Test 320/375/768/1024/1440px, both token
palettes, FA/EN/AR and long mixed-script content when a sandbox-enabled browser
is available. Rare historic/Quranic and Latin-ext glyphs fall back to system
fonts; native FA/AR review remains necessary. No visual owner sign-off implied.

Header is required by the broad ECHO-105 roadmap but **explicitly forbidden in
this batch**. Deferred to ECHO-108, not silently marked complete. Footer is a
reusable content slot, not the full homepage footer/navigation. No full preview,
theme switching, header/menu, API, database, new marketing facts or other task.
ECHO-003/D7 and hosted ECHO-103 acceptance remain open.

## Files changed in this batch

- `ROADMAP.md`, `docs/P1-PRIMITIVES.md`
- `src/styles/{globals,tokens,fonts,primitives}.css`
- `src/components/ui/{button,link,field,section-heading,card}.tsx`
- `src/components/layout/{container,footer,language-links}.tsx`
- `src/app/[locale]/(marketing)/page.tsx`
- `public/fonts/{README.md,OFL.txt}` and six Arabic/Latin 400/500/700 WOFF2 files
- `tests/unit/{primitives.test.tsx,tokens.test.ts}`, `vitest.config.ts`

Pre-existing CI work in README/ROADMAP/architecture/workflow/CI docs/scripts was
preserved. No staging, commit, tag or push performed.

Suggested commit message (human use only):
`feat(ECHO-104,ECHO-105): add semantic tokens and accessible primitives`

Next recommended batch: **ECHO-107/108**, including deferred Header; obtain
browser/reference evidence before ECHO-109 sign-off. Stop after this batch.
