# B1a handoff — visual evidence inventory and reference-fidelity assessment

**Task:** B1a (lane B — UI / reference fidelity) · **Status:** packet complete;
coordinator acceptance pending · **Branch/worktree:** `parallel/b1a` at
`~/projects/echodevs-b1a` · **Base:** `9ed31f4`
(`docs(planning): integrate H1 analytics options and refresh execution plan`,
full SHA `9ed31f49534751b6aad6d8c0a41dd23ff3287a90`) · **Date:** 2026-11-16 ·
**Author:** Agent 2 (documentation and read-only inspection only).

This handoff contains no application, style, asset, QA-history, lane-plan,
shared-status or other task's handoff change. No browser was launched, no
screenshot was created, no dependency was installed, and nothing was pushed,
merged or deployed. Exactly one file was added: this one.

**Baseline discrepancy, stated first.** The coordinator reported `main` at
`1ebf092`. That object does not exist in this checkout
(`git cat-file -t 1ebf092` → `fatal: Not a valid object name`). The local `main`
tip is `9ed31f4`, one commit after the H1 integration `55b8422`; the only
difference is three planning documents (`docs/parallel/{H-analytics,NOW,README}.md`).
Nothing B1a depends on is missing, so the task proceeded on `9ed31f4` and every
statement below is relative to that revision. B1a does not depend on the H1 or
E1 planning changes, and `parallel/e1` (`63a4bca`, this worker's earlier
worktree) is unrelated to visual evidence.

## How this satisfies the B1a definition

The lane row defines B1a as: reconcile existing reference mappings, captures and
unresolved visual defects; specify the capture packet; read-only app review; no
manual UI verification delegated.

| Lane requirement | Section |
|---|---|
| Reconcile reference mappings | §1, §3.1 |
| Reconcile existing captures | §2.2, §3.2, §3.3 |
| Reconcile unresolved visual defects | §4 |
| Specify the capture packet | §5, §6 |
| Read-only app review | §1.3, §4.3, §9 |
| No manual UI verification claimed | §2.3, §6.4, §11 |

## 1. Reference authority and design baseline

### 1.1 Authority

`design/reference/code.html` is the owner-approved **authoritative UI baseline**
(owner clarification 2026-11-05), not inspiration. It is frozen and unmodified;
`design/reference/README.md` records its provenance. Integrity was verified from
the repository, not assumed:

| Artifact | Size | SHA-256 | Verified here |
|---|---:|---|---|
| `design/reference/code.html` | 79,104 B | `442209f1ddad359afd32ec57ef89d280fcd60a88b06b76b22adb854f4b1a8a36` | yes — `sha256sum` matches `SHA256SUMS` |
| `design/reference/original/cvecho.zip` | — | `658daaf9def5badf3b9c061f8e669d0980b91cae6fe76975324def7f01bd050b` | not re-extracted here; `sha256sum` matches `original/SHA256SUMS`, and `qa/results/automated.jsonl` holds a `REFERENCE-INTEGRITY` PASS at `ba7f116` covering member CRCs |
| `design/reference/original/screen.png` | 248,985 B | `ad99ac9ebce18e484454baa17de048f9f51753e0d77055936126185800889731` | yes — hash matches; image opened and inspected |
| `design/reference/original/DESIGN.md` | 1,441 B | `0947699de006092828e36745efd0478652e7f6568694a524fd22f030b8431fee` | hash matches |

The root `code.html` is also preserved byte-identically. It was read as source
(not executed); its third-party assets were **not** fetched.

### 1.2 What the reference actually defines — and what it does not

This is the single most consequential B1a finding, because every later
"fidelity" claim depends on it.

| Dimension | Reference provides | Consequence for B1/B2/B4 |
|---|---|---|
| Locale / direction | One document, `<html class="light" dir="rtl" lang="fa">`. No EN or AR variant exists. | Only **FA/RTL** has a true visual benchmark. EN (LTR) and AR (RTL) can only be reviewed for *consistency with the established language*, never pixel parity. |
| Theme | `class="light"` at rest; dark values exist only as `dark:` class names inside the markup. No dark capture was supplied. | Dark-theme acceptance is necessarily a **judgment against the documented material/token intent**, not a reference comparison. |
| Viewport | One supplied PNG, 442×1600. | No mobile, tablet or intermediate-width reference exists. |
| Pages | Homepage only (six sections). | Services, Work, concept details, About, Contact, Privacy and 404 have **no reference page**; they may only be judged for consistency with the homepage's section/card/typography language, never "pixel parity with a page that does not exist". |
| Typography | Vazirmatn first for every headline/body role; **JetBrains Mono** for all mono/label/technical chrome; Plus Jakarta Sans and Inter as secondary Latin stacks. | FA script character is comparable. Latin display and mono character are **not** reproducible as specified (see §4.3.4). |
| Runtime | Tailwind CDN JIT, Google Fonts, Material Symbols, jsDelivr Vazirmatn, and inline `<script>` blocks (header scroll state, mobile menu, section rail). | A faithful reference capture needs network access or documented asset failures. A capture with missing icon fonts is not a design statement. |
| Motion | Seven animation utilities (`animate-spin`, `-ping`, `-pulse`, `-neural`, `-stream`, `-float`, `-chip`) and random/time-dependent canvas work; one `prefers-reduced-motion` rule. | Reference captures are **not pixel-deterministic**. Timing must be recorded, and a motion-disabled variant must be labelled separately from the frozen source. |

### 1.3 The supplied 442×1600 PNG

Inspected directly. It is a single downscaled composition of the whole Persian
homepage: content is legible only at section/heading level, body copy and 11px
mono labels are sub-pixel, and header controls cannot be resolved. Its geometry
(442 wide × 1600 tall, full-page) is consistent with a ~1440px-wide desktop page
of roughly 5,200px height scaled by ≈0.307 — **inference from proportion, not a
recorded capture parameter**. Two things follow and must not be blurred:

- it is **not** evidence of a 442px viewport, and it does not show any narrow
  layout;
- it is **insufficient** for judging spacing, type scale, radii, glass
  translucency, border/shadow values, iconography or control proportions. It can
  support gross section order, composition and hierarchy only.

### 1.4 Implementation baseline for comparisons

Application source is unchanged since **`65b890e`** (`feat(ECHO-506): prepare
locale-aware SEO metadata policy`, 2026-11-14). Every later commit to `main`
touches documentation only, so the rendered output at `HEAD` (`9ed31f4`) is the
same application as `65b890e`. A capture at `65b890e` or later therefore shows
current source; a capture older than that is current **only** for files that did
not change afterwards. `7900c6e` (2026-11-14) — the revision of the one current
browser PASS — is a results-only commit after `65b890e`, so it also reflects
current source.

Visual-relevant history that must not be re-litigated without new evidence:
`70e414f` (header glass), `dd88984` (Work hierarchy), `2abcdfc` + `a94fb57`
(About copy), `a90938f` (localized 404), `fd923a7` (mono chrome uses the approved
script face), `fc1c578` (locale/slug retention).

## 2. Inventory of available evidence

### 2.1 Durable, in-repository evidence

| Artifact | What it is | Can be reviewed here |
|---|---|---|
| `design/reference/code.html` | Frozen approved prototype (FA/RTL/light, homepage) | yes (source) |
| `design/reference/original/screen.png` | Single 442×1600 downscaled composition | yes (image, §1.3 limits) |
| `design/reference/original/{cvecho.zip,DESIGN.md}` + `SHA256SUMS` | Original supplied archive and legacy brief | yes (integrity only) |
| `docs/UI-UX-REVIEW.md` | Consolidated source/fixture review; explicit browser BLOCKED status | yes (text) |
| `docs/ECHO-503-VISUAL-FOLLOWUPS.md` | Owner-confirmed findings #1–#6 and status split | yes (text) |
| `docs/ECHO-VF01.md`, `docs/ECHO-VF01-R1.md` | Targeted fix reports with before/after **measured numbers** | yes (text) |
| `docs/P5-ECHO-503.md`, `-504`, `-505`, `-506` | WebKitGTK matrix reports (counts, scope, corrections) | yes (text) |
| `docs/BATCH1-HEADER-FOOTER.md`, `BATCH2-BACKDROP.md`, `BATCH3-VISUAL-DETAILS.md` | Homepage/artwork fidelity batches with deviations | yes (text) |
| `qa/registry.json`, `qa/results/{automated,manual}.jsonl` | Test definitions and recorded outcomes | yes (data) |
| `src/styles/**`, `src/components/**`, `src/content/**` | Current presentation source | yes (source) |

**No implementation screenshot exists in Git.** The tree tracks exactly two
PNG/ZIP files — `design/reference/original/screen.png` and
`design/reference/original/cvecho.zip` — and `git log --diff-filter=A` shows no
other PNG/ZIP was ever added on any branch; the only other tracked image is
`src/app/icon.svg`. `qa/evidence/` contains only `README.md`; there is no
`test-results/` directory, no implementation PNG/JPG/WebP and no capture archive
in this checkout.

### 2.2 Referenced but physically absent evidence

Every implementation capture is a **filename cited in a report**, stored under
the gitignored `test-results/` of the producing machine, and therefore not
reviewable here. The QA log records the producing path literally, e.g.
`/home/worker1/projects/echodevs/test-results/echo-506-after-20261114-081741`.

| Bundle / run | Claimed content | Producer | Revision | Integrity recorded | Present here |
|---|---|---|---|---:|---|
| `test-results/echo-503-browser-evidence.zip` | 8,334,317 B / 76 entries / 71 PNGs, 1022 checks | WebKitGTK 2.52.6 / Xvfb | `969f97f` | ZIP CRC + PNG headers | no |
| `test-results/echo-504-locale-switch-evidence.zip` | 649,019 B, 8 PNGs, 37 checks | WebKitGTK 2.52.6 | `406adc3` | CRC | no |
| `test-results/echo-505-typography-evidence.zip` | 23,578,695 B / 255 entries / 240 PNGs, 80 per run | WebKitGTK 2.52.6 | `bd4d5ed` (after) | CRC + per-chunk PNG | no |
| `test-results/echo-506-seo-404-evidence.zip` | 856,521 B / 34 entries / 24 PNGs, 336 checks/run | WebKitGTK 2.52.6 | `62c5cdf` | CRC, SHA-256 `96d3cddc…1ba268` | no |
| `test-results/echo-vf01-visual-evidence.zip` | 3,847,495 B, 25 before + 25 after PNGs | WebKitGTK 2.52.6 | before `8e8f746`, after `70e414f`/`dd88984`/`2abcdfc` | CRC, SHA-256 `e27eacb4…43588` | no |
| `test-results/echo-vf01-r1-after-20261113-130940/` | 6 About captures, 39 checks | WebKitGTK 2.52.6 | `a94fb57` clean | manifest recorded | no |
| `test-results/echo-506-after-20261114-081741/` | 12 captures, 336 checks (the QA `PASS` run) | WebKitGTK 2.52.6 | clean `7900c6e` | manifest recorded | no |

Consequence: **no implementation pixel can be compared to anything in this
checkout.** Any B1a statement about rendered appearance is either a recorded
measurement quoted from a report, a source-level inference, or an open question.
That distinction is carried through §3 and §4.

### 2.3 Rendering capability actually available here

Measured in this worktree, this session (read-only probes):

| Capability | Result | Evidence |
|---|---|---|
| WebKitGTK | **present**, 2.52.6 | `python3 -c "from gi.repository import WebKit2; …"` → `2.52.6` |
| Xvfb | **present** (`/usr/bin/xvfb-run`) | `command -v` |
| Node / npm | **absent** | `command -v node npm` → nothing; a bounded search (`find / -maxdepth 4 -name node -type f`) found no binary outside `/proc`; no `node_modules` in any checkout |
| Firefox / Chromium | **absent** | `command -v` → nothing |
| GPU device access | **denied** | `/dev/dri/renderD128` is `root:render`; worker2 is in `worker2,users` only; historical runs logged `libEGL … Permission denied` |
| `backdrop-filter` rasterisation | **not available** in this stack | documented in ECHO-VF01 and ECHO-VF01-R1 with identical-pixel probes |

Because every capture harness starts the site with
`node node_modules/next/dist/bin/next start`, and Node is absent, **no browser
matrix — including the historically available WebKitGTK ones — can be
regenerated in this checkout.** That is a capability gap, not a product defect.

### 2.4 What "previously reviewed" means in the records

| Record | Status | Revision | Meaning |
|---|---|---|---|
| `REFERENCE-INTEGRITY` | PASS | `ba7f116` | byte integrity of the frozen reference |
| `BROWSER-404-EXPERIENCE` | PASS (current by watch inspection) | `7900c6e`, clean | WebKitGTK 404 matrix; **no evidence paths attached to the QA record** |
| `BROWSER-RTL-MATRIX` | STALE | `969f97f` | 40 cases / 71 captures; `src/**` changed afterwards |
| `BROWSER-TYPOGRAPHY-MATRIX` | STALE | `ff458af` | 78 page cases + 2 fallback sims / 80 captures |
| `BROWSER-LOCALE-SWITCH` | STALE | `406adc3` | 8 captures |
| `BROWSER-VISUAL-CORRECTIONS` | STALE (imported dirty) | `2abcdfc`, dirty | deliberately not release evidence |
| `MANUAL-FIREFOX-GLASS` | **BLOCKED** | `79d337d`, clean | environment record, not an acceptance result |
| `MANUAL-CROSSENGINE-PARITY`, `MANUAL-OWNER-VISUAL`, `MANUAL-404-METADATA`, `MANUAL-ZOOM-200`, `MANUAL-SR-KEYBOARD`, `MANUAL-NATIVE-FA/AR` | NOT_RUN | — | no human review exists |

Freshness here was **derived** from `qa/results/*.jsonl` plus
`git diff --name-only <rev>..HEAD`. `npm run qa:status` could not be executed
because Node is absent (§11), so treat these as expected values, not as the
authoritative QA01 computation.

## 3. Existing visual coverage matrix

Legend — **Captured**: a PNG was produced at some revision (artifact absent here).
**Current**: that capture still matches current `src/**` by watch inspection.
**Reviewable**: the pixels can be opened in this checkout (always "no").

### 3.1 Reference availability per route and locale

| Route family | FA | EN | AR | Viewports with reference | Themes with reference |
|---|---|---|---|---|---|
| `/` home | composition only, 442×1600 downscale | none | none | one desktop composition; no narrow | light (dark only as class names) |
| `/services` | none | none | none | — | — |
| `/work` | none | none | none | — | — |
| `/work/{analytics,chat,booking}` | none | none | none | — | — |
| `/about` | none | none | none | — | — |
| `/contact` | none | none | none | — | — |
| `/privacy` | none | none | none | — | — |
| localized 404 | none | none | none | — | — |

### 3.2 Implementation coverage that exists as a claim

Counts and scope are quoted from the cited reports; they are not re-verified
pixels.

| Case family | Engine | Viewports | Locales | Routes | Captures | Checks | Current? | Reviewable |
|---|---|---|---|---|---:|---:|---|---|
| RTL/LTR matrix (`BROWSER-RTL-MATRIX`) | WebKitGTK 2.52.6 | 1440×900, 1024×900, 768×900, 375×812, 320×720 | fa, en, ar | home (all), contact (all + 320), services, work, one detail, privacy, about, 404 | 71 | 1022 | no | no |
| Typography matrix (`BROWSER-TYPOGRAPHY-MATRIX`) | WebKitGTK 2.52.6 | 1440/375 all routes; 320/768/1024 for home + contact; 375 dark all routes | fa, en, ar | all 9 families | 80 | 3296 | no | no |
| Locale switch (`BROWSER-LOCALE-SWITCH`) | WebKitGTK 2.52.6 | 1440×900, 375×812 | fa, en, ar | representative routes + slug retention | 8 | 37 | no | no |
| 404 experience (`BROWSER-404-EXPERIENCE`) | WebKitGTK 2.52.6 | 1440×900, 375×812 | fa, en, ar | localized + unknown 404 | 12/run | 336/run | yes (`7900c6e`) | no |
| Visual corrections (`BROWSER-VISUAL-CORRECTIONS`) | WebKitGTK 2.52.6 | 320, 375, 768, 1024, 1440 | fa, en, ar | contact (header), home, work, about | 25 + 25 | 146 / 167 | no (dirty) | no |
| Dark theme | WebKitGTK only | 375 (all 9 families) + 1440 (home, FA/AR) | fa, en, ar | all families at 375; home at 1440 | within above | within above | no | no |
| Firefox / GPU | — | — | — | — | **0** | 0 | — | — |
| Chromium | — | — | — | — | **0** | 0 | — | — |
| 200% real zoom | — | — | — | — | **0** | 0 | — | — |
| Native FA/AR reading | — | — | — | — | **0** | 0 | — | — |
| Owner visual acceptance | — | — | — | — | **0** | 0 | — | — |

### 3.3 Route × locale evidence matrix

"Hist." = a WebKitGTK capture was produced at a superseded revision and is
**absent** here. "Current" = captured at a revision that still matches current
`src/**`. No cell anywhere in this table is reviewable as pixels in this
checkout, and no cell has a reference counterpart except the FA home composition.

| Route family | FA | EN | AR | Engine(s) | Viewports captured | Reference | Unresolved visual defect | Next validation |
|---|---|---|---|---|---|---|---|---|
| `/` home | hist. | hist. | hist. | WebKitGTK only | 320, 375, 768, 1024, 1440; light + 375 dark (subset) | FA composition only | Header top-state vs transparent, glass/blur, rail threshold, arrow, no reference pair | **N1, N2, N3** |
| `/services` | hist. | hist. | hist. | WebKitGTK only | 1440, 375; 768/320 for AR/FA; 375 dark | none | Nested glass on pillar cards, mono labels | N3-extension, N10 |
| `/work` | hist. | hist. | hist. | WebKitGTK only | 1440, 375; 320 for FA/AR; 375 dark | none | Concept-first ordering verified by measurement only; mobile first card below fold | **N5**, N7 |
| `/work/{analytics,chat,booking}` | hist. | hist. | hist. | WebKitGTK only | 1440, 375 per locale; 375 dark | none | Ordered workflow marker placement in Firefox RTL (**UX-01 is source-fixed, not browser-verified**) | N5-extension, N10 |
| `/about` | hist. | hist. | hist. | WebKitGTK only | 1440, 375 per locale (VF01-R1); 375 dark | none | Native reading quality; no structural defect recorded | **N6** |
| `/contact` | hist. | hist. | hist. | WebKitGTK only | 1440, 375, 320 (FA); 375 dark; drawer + privacy-link focus | none | GPU blur, dark glass, error state under header, drawer | **N4**, N7 |
| `/privacy` | hist. | hist. | hist. | WebKitGTK only | 1440, 375; 320 FA; 375 dark | none | Legal wording is a C/A lane gate, not a visual defect | N10 (layout only) |
| localized 404 | current | current | current | WebKitGTK only | 1440, 375, light + dark | none | Owner metadata review; no visual defect recorded | **N9** |
| shared header / footer / rail | hist. | hist. | hist. | WebKitGTK only | 320–1440 | FA composition only | Header top-state, rail/zoom overlap, mono face | **N4**, N11, N12 |

### 3.4 Gaps this matrix exposes

1. **Reference-to-implementation pairs have never existed.** Not one FA home
   capture was made at a reference-comparable viewport in the same session as a
   reference capture. ECHO-003/ECHO-109 therefore remain genuinely open, exactly
   as ROADMAP says.
2. **Coverage is broad in WebKit software rendering and zero everywhere else.**
   Firefox, Chromium, GPU blur, real zoom and native reading have no capture at
   any revision.
3. **No current capture of the current source.** The broad typography matrix
   predates the localized-404 presentation change and the SEO-metadata commit;
   the Work captures predate the About-copy, mono-chrome and 404 changes. The
   only current browser PASS is the 404 page.
4. **Evidence is not durable.** All pixels live outside Git on worker1's
   filesystem; the QA PASS for 404 carries no evidence paths at all.
5. **Reference-page coverage does not exist** for 7 of 9 route families, so
   "fidelity" for them is a consistency judgment, not a comparison.

## 4. Known visual concerns and their evidence status

### 4.1 The six owner-confirmed findings

| # | Finding | Recorded status | Evidence that exists | Evidence still missing | B1a verdict |
|---|---|---|---|---|---|
| 1 | Mobile sticky header bleeds through scrolled content | Resolved in `70e414f`; CSS unchanged since | Measured band metrics (11 captures, spread/edge ratios), `tests/unit/header-glass.test.ts` | Rasterised `backdrop-filter` in a GPU browser; dark theme | **Partially proven.** Opacity layer proven by measurement; the blur half is unproven — `MANUAL-FIREFOX-GLASS` is BLOCKED, not passed. |
| 2 | Work empty states dominate before concept studies | Resolved in `dd88984` | Concept section top 924→416px, first card 1148→640px (1440); compact empty rows 254→115px; unit + HTTP assertions | Current-source capture; mobile first-card position | **Proven at source + measurement.** At 375px the first card is still 30–31px below the fold in FA/EN (visible in AR) — reported honestly, not a regression. |
| 3 | About copy reads like internal verification commentary | Resolved in `2abcdfc`, corrected again in `a94fb57` | Rendered-text tables (FA/EN/AR), banned-phrase regression test, size-claim scan | Native FA/AR reading quality | **Proven at content level.** Remaining question is editorial/native, not structural. |
| 4 | 404 minimal, no header/back link | Resolved in ECHO-506 (`a90938f`) | 336/336 WebKitGTK checks, 12 captures/run, localized recovery | Owner metadata/visual review (`MANUAL-404-METADATA` NOT_RUN) | **Proven in WebKitGTK only.** Not cross-engine, not owner-reviewed. |
| 5 | Decorative arrow direction may be inappropriate in RTL | Deferred to B2 | None visual | Direction decision + any capture | **Open, and now better scoped — see §4.2.** |
| 6 | Full-theme and reference-fidelity acceptance incomplete | Deferred to B1/B4 | None visual | The whole §5 packet | **Open, and cannot be closed in this environment.** |

### 4.2 Finding #5 — new source-level scoping (no visual claim)

Inspected in the current tree:

- The implementation renders the glyph **`↗` (U+2197) in 7 places**:
  `homepage.tsx` hero primary CTA, `marketing-footer.tsx` footer CTA,
  `about-page.tsx` ×3, `privacy-page.tsx`, `contact-page.tsx`. Every one is
  `aria-hidden`, so this is a purely decorative, directional signal.
- **No RTL mirroring rule exists anywhere in `src/styles/**`**: no `[dir="rtl"]`,
  no `scaleX(-1)`, no conditional rotation. The glyph therefore points
  north-east in FA, EN and AR alike.
- The **reference uses a different symbol, not a mirrored glyph**: its CTAs use
  the Material Symbols `arrow_forward` icon with a static `rotate-180` class,
  which in the FA/RTL document points **left**.
- **Font coverage:** `public/fonts/*` declare Latin ranges that include
  `U+2191`/`U+2193` but **not** `U+2197`, and no FA/AR range includes it. The CTA
  glyph therefore always resolves to a **system fallback face**, not Vazirmatn.
  The typography audit records exactly this class of warning for the two content
  arrows `U+2190`/`U+2192` in `home.ts` (`TYPOGRAPHY-FONT-ASSETS` PASS with 2
  warnings, `ba7f116`); the seven JSX glyphs are **not** covered by that audit,
  so their fallback is a source inference, not an audit record.

So finding #5 is not "mirror a symmetric arrow". It is a **symbol decision** with
three candidate resolutions, all requiring a design/native call rather than a
unilateral CSS flip:

1. keep `↗` as a language-neutral "outbound/progress" affordance in all locales
   (accept the reference divergence, and accept a per-OS fallback glyph);
2. keep one symbol but mirror it per direction (`↖`/scale) so it reads with the
   text flow;
3. adopt the reference's left-pointing arrow in RTL and a right-pointing arrow in
   LTR, which restores prototype character but needs an inline SVG or a newly
   licensed icon set — a new dependency decision, not a CSS tweak.

Recommendation for B2: decide **after** captures N5–N7 exist, because the arrow
is small, decorative and aria-hidden; it must not drive the fidelity verdict.

### 4.3 Source-observable differences from the reference (not confirmed defects)

These are recorded so they are neither rediscovered nor "fixed" by guesswork.
None is measured against rendered pixels.

1. **Header interaction character (highest-risk fidelity item).** The reference
   header starts `bg-transparent` with `backdrop-filter: none` and switches at
   `scrollY > 20` to `#fffaf6/85` + `blur(8px)` + border + `shadow-sm`; it is
   `position: fixed`. The implementation is a permanent sticky glass bar: 90%
   fill + `blur(16px) saturate(140%)` at all scroll positions, constant bottom
   border, no shadow/state change. ECHO-VF01 deliberately moved the fill *away*
   from the reference (82%→90%) to fix a legibility finding. Net effect: the
   reference's calm, transparent-at-top hero header is not reproduced. This is a
   legitimate trade-off to re-judge, but only with a top-of-page capture pair.
2. **Header composition and breakpoints.** Reference: brand + inline nav +
   language + compact icon theme toggle + CTA, desktop nav from `lg` (1024px).
   Implementation: brand + Persian chip, tagline and header CTA only **from
   80rem (1280px)**, segmented 3-state theme control instead of an icon toggle,
   desktop nav and drawer switch at **64rem (1024px)** in both CSS and
   `matchMedia("(min-width: 64rem)")` — i.e. it follows the reference breakpoint
   more closely than `docs/UI-UX-REVIEW.md` claimed ("mobile navigation starts
   below 80rem" is stale for the current tree). Correct that line in a future
   documentation pass; do not change code on the strength of it.
3. **Section rail.** Reference: `hidden md:flex` (≥768px) with ~18px hit areas.
   Implementation: ≥1024px only, 44px targets, physical `right` in both
   directions, dark translucent pill with hover label. Documented as a deliberate
   accessibility deviation. Overlap was tested at 1024–1366px with zero line-box
   intersections at `969f97f` — that result is STALE and does not cover the
   current header/typography or 200% zoom (effective viewport 512px).
4. **Mono typography.** `--font-mono: ui-monospace, "Vazirmatn", monospace` vs the
   reference's **JetBrains Mono** first. `ui-monospace` resolves to a different
   physical face per OS/engine, so all mono chrome (brand chip, eyebrows,
   technical telemetry, rail tooltip, footer bottom line) will differ across
   WebKitGTK, Chromium and Fedora Firefox **and** from the reference. This is a
   licensing/asset decision already recorded as intentional; the residual risk is
   cross-engine spacing/legibility of 11–12px labels, which only B3 can settle.
5. **Addressable typography otherwise matches the reference's stated scale:**
   hero 2.25rem → 3rem (≥40rem) → 3.75rem (≥64rem) at line-height 1.3, weight
   capped at 700 because only 400/500/700 subsets are licensed (the reference
   requests 800). Source-verified; no pixels.
6. **Section order and count match the prototype** (`hero` including the
   four-card capability grid, `services`, `demos`, `why-us`, `process`,
   `contact`), and the six labels/anchors are stable. This is the strongest
   fidelity statement that can currently be made, and it is structural only.
7. **Glass material** is `@supports`-gated (translucent fill + blur, opaque
   fallback) rather than unconditional. Nested glass inside Services/Work/details
   is explicitly listed as browser-unverified by Batch 3.
8. **Truthfulness edits stay.** Prototype strings such as `SaaS_v2.4`,
   `RPS: 2,450`, `TOKENS: 420/s`, `24/7`, `HIPAA/GDPR` and the fake success
   message were replaced with preview markers and a real inquiry contract.
   Restoring them to look closer to the screenshot would be a product defect.

### 4.4 Do not reopen without new evidence

- Work order/empty-state work (`dd88984`), About copy (`2abcdfc`, `a94fb57`),
  404 shell (`a90938f`), locale/slug retention (`fc1c578`), mono-face fix
  (`fd923a7`).
- The action-colour decision (white-on-coral 2.83:1 fails normal-text contrast)
  and the hero 700-weight cap. Both are accessibility/licensing decisions, not
  fidelity bugs.
- Anything already recorded as "resolved with measurement" — re-measuring is
  allowed; asserting regression without a capture is not.

## 5. Missing captures and review conditions

### 5.1 What is missing, grouped by reason

| # | Missing set | Why missing | Who can produce it |
|---|---|---|---|
| M1 | Reference browser captures: FA home at 1440×1000 + full page, light, plus 320/375/768/1024, plus a labelled reduced-motion variant, plus an asset-failure log | Never produced; the only PNG is a downscaled composition | Owner/browser on Fedora (or any GPU-capable browser with network) |
| M2 | Implementation FA home at the same viewports/themes as M1 | No current capture; harnesses need Node | Node-enabled checkout in the VM **or** owner Fedora against a loopback-forwarded server |
| M3 | GPU `backdrop-filter` evidence (header glass), light + dark + error + drawer | WebKit software rendering does not rasterise blur | Owner Fedora Firefox (**MANUAL-FIREFOX-GLASS**) |
| M4 | Current-source Work and About captures | Last Work set is STALE and predates four source commits (About copy, mono chrome, 404, SEO metadata); About was re-captured later and still predates three | Node-enabled checkout (harness supports `--only header,work,about`) |
| M5 | Chromium/Firefox critical-path parity | No Chromium/Firefox exists in the VM | Owner Fedora (**MANUAL-CROSSENGINE-PARITY**) |
| M6 | Real 200% zoom and reflow | No browser; zoom ≠ device emulation | Owner Fedora (**MANUAL-ZOOM-200**) |
| M7 | Native FA and AR reading quality | Requires human native reviewers | Named native reviewers (**MANUAL-NATIVE-FA/AR**) |
| M8 | Owner visual acceptance record | Requires a human decision at a named revision | Owner (**MANUAL-OWNER-VISUAL**) |

### 5.2 Conditions that make a capture valid

1. **Serve only loopback.** Implementation: `next start --hostname 127.0.0.1`
   on a private port. Reference: `python3 -m http.server 8765 --bind 127.0.0.1
   --directory design/reference` from the project root. Never expose the
   repository root, `.env*`, `db/`, `qa/` or a public tunnel.
2. **Capture only the reference directory's `code.html`.** It requests
   Tailwind/Google Fonts/Material Symbols/jsDelivr; record every failed request
   in the capture notes and do not interpret missing icon fonts as design intent.
3. **Deterministic timing.** Record `scrollY`, timestamp, engine + version, OS,
   device scale, zoom level, theme, locale, `document.fonts.status` and whether
   motion was enabled. Capture the reference twice: motion enabled, and with
   devtools reduced-motion emulation (never edit the frozen file). Label the two
   sets distinctly.
4. **Record the revision.** Every capture set carries the exact commit
   (`git rev-parse HEAD`) and `worktreeDirty: false`. A dirty-tree capture is
   diagnostic only, never acceptance evidence.
5. **Keep intake disabled** (`INQUIRIES_ENABLED=false`); use synthetic values only
   (`UI REVIEW TEST`, `ui-review@example.invalid`). Never store a real inquiry,
   credential, cookie dump or HAR in a shared artifact.
6. **Durable subset.** `test-results/` is gitignored by design, so acceptance
   evidence must be copied to `qa/evidence/<TEST-ID>/` (a handful of decisive
   PNGs + a short README with revision, engine, viewport, theme and checksum).
   The zip bundles remain review staging, not the acceptance record. This is the
   fix for the current situation where a 404 PASS references no artifacts at all.

### 5.3 Naming and metadata contract

`{kind}-{locale}-{route}-{viewport}-{theme}-{zoom}.png`, e.g.
`reference-fa-home-1440x1000-light-100.png`,
`impl-fa-work-375x812-dark-100.png`,
`impl-ar-contact-320x720-light-200.png`. `kind` ∈ {`reference`, `impl`}.
Sidecar JSON beside each set: `revision`, `dirty`, `engine`, `version`, `os`,
`deviceScaleFactor`, `zoom`, `viewport`, `theme`, `locale`, `route`, `scrollY`,
`fontsReady`, `motion`, `missingAssets[]`, `consoleErrors[]`, `capturedAt`.

## 6. Prioritized native acceptance plan

A compact matrix — the highest-risk comparisons, not every combination. Each row
is independently reviewable and none is claimed as executed.

### 6.1 Tier P0 — fidelity is blocked on these

| ID | Page / locale | Engine | Viewport | Expected comparison | Acceptance criteria | Reviewer | Existing evidence reuse | Automatable |
|---|---|---|---|---|---|---|---|---|
| N1 | reference `/code.html`, FA, light | Firefox (owner) | 1440×1000 + full page | Baseline; asset log | Capture exists, fonts loaded or failures listed, motion state labelled | Technical QA | none (442×1600 PNG is a supplement only) | no (CDN + random animation) |
| N2 | impl `/fa` home, light | same engine as N1 | 1440×1000 + full page | Pair with N1 | Section order, hero composition, capability strip, 3 pillars, 3 concepts, benefits, 6 steps, inquiry + footer all present in the same order; deviations listed, not eyeballed as "close" | Technical QA → owner | BATCH3 deviation list | partly (DOM assertions already exist; pixels no) |
| N3 | impl `/fa` home, light + dark | Firefox or Chromium | 375×812 | No reference exists | No horizontal scroll, no clipped text/cards, CTAs reachable, rail absent below 1024, header legible | Technical QA | ECHO-VF01 mobile metrics | yes (overflow/geometry checks already automated) |
| N4 | impl `/en/contact`, light + dark + error + drawer | **Firefox, GPU** | 375×812 and 320×720 | `MANUAL-FIREFOX-GLASS` procedure | Header text crisp over scrolled form; blur visibly present; drawer opaque, focus on Close, Escape restores; sticky intact | Technical QA (owner may self-review) | ECHO-VF01 opacity measurements | no |

### 6.2 Tier P1 — required before B2 can claim completeness

| ID | Page / locale | Engine | Viewport | Expected comparison | Acceptance criteria | Reviewer | Reuse | Automatable |
|---|---|---|---|---|---|---|---|---|
| N5 | impl `/fa/work`, light | Firefox/Chromium | 1440×900, 375×812 | ECHO-VF01 before/after numbers | Concept studies first; empty groups compact (≈115px); first card ≤ 24px below the 375-fold or the gap is explicitly accepted | Technical QA | VF01 metrics as before-state | partly |
| N6 | impl `/fa/about`, light | Firefox/Chromium | 1440×900, 375×812 | No reference; editorial | Copy reads as a public About page; no team-size, verification-commentary or invented credentials; heading hierarchy intact | **Native FA reviewer** | `a94fb57` text tables | no |
| N7 | impl `/ar` home + `/ar/contact`, light + dark | Chromium **or** Firefox | 1440×900, 375×812 | WebKit matrix + design intent | RTL mirroring correct (cards, chat tails, form fields), rail right + tooltip readable, mixed Latin tokens LTR, arrow direction decided per §4.2 | Technical QA + **native AR** | RTL matrix (`969f97f`) | partly |
| N8 | impl `/en` home + `/en/contact`, light + dark | Chromium or Firefox | 1440×900, 375×812 | Reference type role, LTR | Scale/hierarchy match intent; EN tracking not too tight; no wrapping/clipping at 200% text size | Technical QA | typography matrix (`ff458af`) | partly |
| N9 | impl `/fa/missing/nested` + `/fa/work/unknown`, both themes | Firefox/Chromium | 375×812, 1440×900 | Documented preview policy | Localized heading, header/footer present, recovery links work, `noindex` intact, metadata values recorded | Technical QA (**MANUAL-404-METADATA**) | 336-check WebKit run (`7900c6e`) | partly |

### 6.3 Tier P2 — close before owner acceptance, after P0/P1

| ID | Case | Engine | Viewport | Acceptance | Reviewer |
|---|---|---|---|---|---|
| N10 | Critical-path parity subset: home/services/contact × FA/EN/AR | Chromium **and** Firefox, compared to the WebKit set | 375×812, 1440×900 | No layout/direction/focus/shaping regression; differences documented (**MANUAL-CROSSENGINE-PARITY**) | Technical QA |
| N11 | Real 200% zoom: `/fa`, `/en/contact`, `/ar/services` | Firefox | 1440 desktop zoomed to 720 CSS px; 375 to ~187 | No clipped CTA, no hidden focus, menu/errors usable, no overlap with rail (**MANUAL-ZOOM-200**) | Technical QA |
| N12 | Reduced motion + theme persistence: `/fa` home dark, Light→reload→route | Firefox/Chromium | 375×812 | Transitions removed under reduced motion; no first-paint flash; choice persists per locale route | Technical QA |
| N13 | Owner acceptance of the assembled bundle | Owner browser | whatever the owner uses | Written approval tied to revised capture set + commit; unresolved items listed as findings (**MANUAL-OWNER-VISUAL**) | **Owner** |

### 6.4 Reproducible procedures

**A. If Node is restored in the VM** (Node 24 + `npm ci`; this worker installed
nothing):

```sh
cd ~/projects/echodevs-b1a
git status --short            # must be clean, or the run is diagnostic only
npm run build
xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp' \
  /usr/bin/python3 scripts/audit-visual-corrections.py \
  --task B1 --phase after --only header,work,about
xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp' \
  /usr/bin/python3 scripts/audit-404.py --phase after --task B1
```

The harnesses start and stop their own private loopback server, write
`test-results/<task>-after-<timestamp>/` with `manifest.json` (revision, dirty
flag, URL, viewport, engine) and never enable intake. They capture **light theme
only**, so dark-theme evidence still requires the browser path.

**B. Owner-side, no developer tooling** (recommended, because it is also N1/N4):

1. On the Fedora host, forward a VM loopback port to `127.0.0.1:3210`
   (existing localhost-only tunnel; no public URL).
2. Start the implementation in the VM on `127.0.0.1:3210` (a Node-enabled
   checkout) and serve the reference separately:
   `python3 -m http.server 8765 --bind 127.0.0.1 --directory design/reference`.
3. Open `http://127.0.0.1:8765/code.html` for the reference. Serve the
   reference with `--directory design/reference`; never serve the repository
   root, and record which CDN assets failed to load.
4. Capture per §5.3 at each row above; save under `test-results/manual/<case>/`
   and copy the decisive images to `qa/evidence/<TEST-ID>/`.
5. Record the manual case with the real reviewer identity:
   `npm run qa:manual -- --id MANUAL-FIREFOX-GLASS --result PASS --reviewer "…" --role owner --browser "Firefox …" --os "Fedora …" --evidence qa/evidence/MANUAL-FIREFOX-GLASS/…`.

### 6.5 Ordering and stop rules

- Run N1 and N2 **in the same session**; a reference capture compared against a
  capture from a different day, zoom or DPI is not a comparison.
- N4 can run independently and is the cheapest way to unlock the largest documented
  unknown (GPU blur).
- If N1/N2 show a gross divergence (e.g. missing icon font, wrong section order),
  stop and fix the capture conditions before judging design deltas.
- If a case cannot be produced, record **BLOCKED with the exact reason**; never
  substitute a WebKit software capture for a GPU/native requirement, and never
  record a PASS from source inspection.

## 7. Proposed B1 / B2 / B3 / B4 follow-up actions

### 7.1 B1 — reference/current comparison (3–5h, was NEEDS_REVALIDATION)

Reframe B1 as **capture-and-compare**, not "look at it again". Prerequisite: a
Node-enabled checkout **or** the owner's browser path (§5.2, §6.4). Deliverable:

- the N1+N2 pair from one session, N3, and the theme variants;
- a per-section delta table (hero, capability strip, services, demos, benefits,
  process, inquiry, footer, header, rail) with each row classified as
  **intentional deviation** (cite the report/decision), **confirmed defect**, or
  **unresolved**;
- an explicit statement of which rows could not be judged (missing assets,
  motion, mono substitution).

Acceptance: FA desktop fidelity is either accepted with a written delta list or
returns a bounded defect list. **Zero fixes is a valid B1 outcome.** B1 must not
close ECHO-003 or ECHO-109 on source evidence.

Proposed split, so external capture latency is not booked as engineering effort:
`B1-capture` (2–3h, may be owner-side) + `B1-compare` (1–2h, engineering).

### 7.2 B2 — correct only confirmed residual defects (6–12h)

Candidate order (evidence-first, smallest blast radius last):

1. **Header top-of-page state**, if and only if N2/N4 show the permanent 90%
   glass meaningfully diverges from the reference's transparent-then-glass
   header. Any change must keep the ECHO-VF01 legibility result and re-run
   `MANUAL-FIREFOX-GLASS` afterwards.
2. **Finding #5 arrow decision** per §4.2 — a symbol/design choice, not a CSS
   flip; one edit at most (shared affordance), or documented "keep as is".
3. **Rail/zoom overlap**, only if N11 finds a real intersection at 1024px or
   200% zoom. The historical zero-intersection result is STALE.
4. **Mono cross-engine spacing**, only if N7/N10 show clipped or colliding 11–12px
   labels. Otherwise record the face substitution as accepted.
5. **Anything new and confirmed** by N5–N9.

Explicitly **not** in B2: Work ordering, About copy, 404 shell, locale retention,
action colours, hero weight, concept truthfulness.

### 7.3 B3 — cross-engine and responsive validation after B2 (6–10h)

- Re-run the WebKit matrices **on the final commit** (they are all STALE relative
  to `src/**`), then N10 in Chromium + Firefox and N11 at 200% zoom.
- Compare engine-labelled captures; classify differences as rendering
  (fallback face, text rasterisation), layout (reflow/overflow) or behaviour
  (focus, drawer).
- Write every result through QA01 with real evidence paths; durable copies go to
  `qa/evidence/<TEST-ID>/`.

### 7.4 B4 — owner visual acceptance (3–5h)

- Present the assembled bundle: N1–N13 with checksums, the delta table, and the
  list of unresolved items.
- Acceptance is a **written owner decision at a named commit**; a technical PASS
  in WebKit does not substitute for it, and `--role owner` must only be used by
  the owner.
- Any rejected row returns to B2 with a specific defect description.

### 7.5 Coordinator-only follow-ups this packet recommends (not performed here)

1. Register a technical case for the missing reference baseline (proposed id
   `REFERENCE-BASELINE-CAPTURE`, N1) — currently no QA case requires a reference
   capture at all, which is why ECHO-003 has stayed open without a failing case.
2. Require at least one durable evidence path for browser PASS records. The
   `BROWSER-404-EXPERIENCE` PASS at `7900c6e` has `evidence: []`; that is a
   traceability gap, not a failed test.
3. Correct the stale "mobile navigation starts below 80rem" line in
   `docs/UI-UX-REVIEW.md` (§4.3.2) at the next documentation pass.
4. Decide whether the six remaining stale browser matrices should be re-run once
   Node is available, or retired in favour of a smaller maintained set.

## 8. Risks and dependencies

| # | Risk | Impact | Mitigation | Owner |
|---|---|---|---|---|
| R1 | Reference capture is not reproducible (CDN JIT Tailwind, Google Fonts, Material Symbols, random/time-based animation) | A capture with missing icons/fonts could be misread as a design defect | Record failed requests; capture motion-on and reduced-motion variants; label them; never edit the frozen file | Technical QA |
| R2 | Evidence is not durable (gitignored `test-results/`, some PASS records with no paths) | Acceptance cannot be re-reviewed after the producing checkout is gone — the current situation | Copy decisive captures to `qa/evidence/<TEST-ID>/`; reference them in the QA record | Coordinator + F lane |
| R3 | No Node/npm in this VM; harnesses require `next start` | No matrix — not even WebKit — can be regenerated here | Run in a Node-enabled checkout or owner Fedora; do not install tooling for a documentation task | E1/coordinator |
| R4 | No GPU (and no Firefox/Chromium) | The blur half of finding #1 stays unproven; dark glass unproven | `MANUAL-FIREFOX-GLASS` on the owner host; treat "legibility does not depend on blur" as a design constraint | Owner |
| R5 | Any B2 header edit invalidates `MANUAL-FIREFOX-GLASS` (watch list includes `header.css`, `header.tsx`, tokens, contact styles) | Rework | Run one early diagnostic record and one acceptance record on the final RC; do not record PASS twice for the same commit | Technical QA |
| R6 | `ui-monospace` resolves differently per engine | Cross-engine "differences" that are not defects; possible label spacing drift | Label engine and face in every capture; judge legibility, not glyph identity | Technical QA |
| R7 | No native FA/AR reviewer named | B4 cannot be honest; copy/typography quality unproven | Keep `MANUAL-NATIVE-FA/AR` NOT_RUN; do not let a technical PASS imply language approval | Owner |
| R8 | Scope creep: "fix" intentional truthfulness/accessibility deviations to look more like the prototype | Product and legal regression | §4.4 do-not-reopen list; B2 accepts "no change" | Coordinator |
| R9 | Metrics mistaken for visual sign-off | False confidence | Every quoted number in this packet is labelled as a measurement, not a pixel verdict | Technical QA |
| R10 | EN/AR and seven route families have no reference | Invented "fidelity" criteria | Judge consistency with the established language, never parity with a nonexistent page | B lane |

**Dependencies to start B1:** Node-enabled environment or owner browser session
(§5.1), a decision on durable evidence storage (§7.5.2), and no contested lease on
`src/styles/**` while captures are taken.

## 9. Evidence file references

### 9.1 Inspected directly in this worktree

| Path | Used for |
|---|---|
| `AGENTS.md`, `SCOPE.md`, `ROADMAP.md`, `DESIGN.md` | authority, delivery order, open gates |
| `design/reference/README.md`, `SHA256SUMS`, `original/SHA256SUMS` | reference provenance and hashes |
| `design/reference/code.html`, `design/reference/original/screen.png` | reference structure, header scroll script, typography stacks, 442×1600 limits |
| `docs/UI-UX-REVIEW.md` | consolidated browser-BLOCKED review, source-observed deltas |
| `docs/ECHO-503-VISUAL-FOLLOWUPS.md` | findings #1–#6 status |
| `docs/ECHO-VF01.md`, `docs/ECHO-VF01-R1.md` | measured before/after evidence, GPU limitation |
| `docs/P5-ECHO-503.md`, `docs/P5-ECHO-504.md`, `docs/P5-ECHO-505.md`, `docs/P5-ECHO-506.md` | matrix scope, counts, corrections |
| `docs/BATCH1-HEADER-FOOTER.md`, `docs/BATCH2-BACKDROP.md`, `docs/BATCH3-VISUAL-DETAILS.md` | homepage fidelity batches, deviations, browser gaps |
| `docs/QA-SYSTEM.md`, `qa/registry.json`, `qa/results/automated.jsonl`, `qa/results/manual.jsonl`, `qa/evidence/README.md` | test definitions, recorded outcomes, evidence policy |
| `docs/parallel/README.md`, `NOW.md`, `B-design-ux.md`, `handoffs/{A1,D1,H1}.md` | lane definition, handoff convention, baseline state |
| `src/styles/{header,homepage,work,fonts,tokens}.css`, `src/components/layout/{header,mobile-nav}.tsx`, `src/components/marketing/*.tsx`, `src/content/home.ts` | current breakpoints, glass values, rail, arrows, font stacks |
| `scripts/{audit-rtl,audit-typography,audit-404,audit-visual-corrections,audit-browser}.py` | what each harness can and cannot capture |

### 9.2 Referenced artifacts absent from this checkout

`test-results/echo-503-browser-evidence.zip` (8,334,317 B; 1022 checks; 71 PNGs) ·
`echo-504-locale-switch-evidence.zip` (649,019 B; 8 PNGs) ·
`echo-505-typography-evidence.zip` (23,578,695 B; 240 PNGs; 3296 checks/run) ·
`echo-506-seo-404-evidence.zip` (856,521 B; SHA-256 `96d3cddc9df1555ddb369f4df4afbd9ddb21c2d5fff4d59d365dea3b3f1ba268`) ·
`echo-vf01-visual-evidence.zip` (3,847,495 B; SHA-256 `e27eacb4247b9a9440b726f9efc85061a7b179075cb6f1c02cec53b579943588`) ·
`echo-vf01-r1-after-20261113-130940/` (6 About PNGs) ·
`echo-506-after-20261114-081741/` (12 PNGs, 336 checks).

These are quoted from the reports; none was opened, restored or re-created.

## 10. Remaining effort estimates

| Task | Remaining | Basis / uncertainty |
|---|---:|---|
| **B1a (this packet)** | **2–3h** | Delivered: inventory, matrix, defect reconciliation, capture packet |
| B1 (capture + compare) | 3–5h | Engineering portion ≈1–2h; the rest is a capture session. Rises to ~7h if the reference must be captured at five widths in two themes |
| B2 (confirmed fixes) | 6–12h | Zero-change outcome is valid. Header top-state work is the largest single item; arrow/rail/mono are small if confirmed |
| B3 (cross-engine + zoom) | 6–10h | Two engines × 3 locales × 6 routes + zoom set; re-run of the WebKit matrices adds ~1h of machine time |
| B4 (owner acceptance) | 3–5h | Review time only; waiting for the owner is not effort |
| Lane B total | 20–35h | Unchanged from the lane table; B1a's 2–3h are inside it |

Optional, not counted in lane B: a small reference-capture checklist (1h) and a
durable-evidence script (1–2h) would reduce R1/R2 — proposals for F1, not B work.

## 11. Verification actually performed

| Check | Command | Actual result |
|---|---|---|
| Planning graph + local links | `python3 docs/parallel/check-plan.py` | **PASS** — `OK: 40 tasks; unique IDs, dependencies, reverse edges, DAG, estimates and local Markdown links`; totals 145–254h; six dependency roots including B1a |
| Reference integrity (frozen) | `sha256sum -c SHA256SUMS` in `design/reference` | **PASS** — `code.html: OK`, `DESIGN.sahara.md: OK` |
| Reference integrity (original) | `sha256sum -c SHA256SUMS` in `design/reference/original` | **PASS** — `cvecho.zip: OK`, `code.html: OK`, `screen.png: OK`, `DESIGN.md: OK` |
| QA registry validation | `npm run qa:validate` | **NOT_RUN** — `node`/`npm` are not installed in this environment (`command -v node npm` → nothing; a bounded filesystem search found no `node` binary outside `/proc`). No dependency was installed, per the documentation-only scope |
| QA status recomputation | `npm run qa:status` | **NOT_RUN** — same reason; the statuses in §2.4 are derived from `qa/results/*.jsonl` plus `git diff --name-only`, and are labelled as derived |
| Whitespace / diff hygiene | `git diff --cached --check` | **PASS** (exit 0) after removing one trailing blank line at EOF |
| Link validation of this file | relative-link and inline-path scan | **PASS** — zero Markdown links; all 42 inline repository paths verified to exist |
| Browser capture | — | **NOT_RUN** deliberately; no browser exists and B1a does not delegate manual UI verification |
| Screenshot review | — | **NOT_RUN**; no implementation capture exists in this checkout (§2.2) |

### 11.1 Results observed on the staged file

- `git diff --cached --check` — first invocation reported
  `docs/parallel/handoffs/B1a.md:654: new blank line at EOF`; the stray blank line
  was removed and the re-run exited **0** with no output.
- `grep -c '](' docs/parallel/handoffs/B1a.md` — **0**, so this file introduces no
  Markdown link targets that could break. Every repository reference is an inline
  code path instead.
- Existence check over the 42 inline repository paths named in §9.1
  (`for f in …; do [ -e "$f" ] || echo MISSING` ) — **no `MISSING` line**; every
  cited file exists at this revision.
- `python3 docs/parallel/check-plan.py` — re-run after the file was added;
  unchanged **PASS**, because the checker reads only the seven lane files, the
  guide and top-level `docs/parallel/*.md`, and therefore does not interpret
  handoff content.

No result was written into `qa/results/**`: B1a is a documentation packet, and
recording a PASS there would require an executed suite.

## Scope statement

**Status: B1a complete as an evidence packet; coordinator acceptance pending.**
No application code, style, asset, QA registry/history, lane plan, shared status,
roadmap, scope, decision or another task's handoff was modified. No browser was
launched, no screenshot was created, no dependency was installed, and no claim of
rendered or native visual acceptance is made anywhere in this document. Every
visual statement is one of: a hash-verified artifact, a measured number quoted
from a cited report, an explicit source inspection, or an open question with a
named capture case. ECHO-003, ECHO-109, ECHO-601/605/608, `MANUAL-*` and release
readiness remain exactly as open as they were at `9ed31f4`.
