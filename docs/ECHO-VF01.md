# ECHO-VF01 — Targeted visual corrections

Task: **ECHO-VF01 only** · Status: **PASS** for the three owner-confirmed
corrections, 2026-11-13

## Scope and baseline

Owner-authorized, narrowly scoped batch covering findings **#1–#3** from
`docs/ECHO-503-VISUAL-FOLLOWUPS.md`:

1. mobile sticky-header bleed-through;
2. excessive empty-state prominence before the Work concept studies;
3. About copy reading like internal verification commentary.

Baseline: clean `main` at `8e8f746` (ECHO-504 complete). Implementation committed
as `70e414f`, `dd88984`, `2abcdfc`. Not a redesign and not a visual-polish pass:
no page, route, section, card, component API, Canvas/API/DB, intake, `noindex`,
privacy, 404 or arrow change, and no deployment.

## 1. Sticky-header readability

**Root cause.** The sticky glass surface was 82% background with
`blur(8px) saturate(140%)`. 18% of scrolled copy showed through, and the blur
was only declared with the unprefixed property.

**Correction** (`src/styles/header.css`): fill 82% → 90%, blur 8px → 16px,
`-webkit-backdrop-filter` added, and `@supports` now accepts either property.
The 93% non-support fallback, sticky behaviour, z-index, drawer geometry,
focus handling and the glass identity are unchanged. 90% was chosen deliberately
instead of a near-opaque fill so the material still reads as glass.

**Measured.** Band metrics exclude header UI boxes. `edgeRatio` is the share of
adjacent pixel pairs with a visible (>0.08 luma) edge; `spread` is the p5–p95
luminance range.

| capture | spread before → after | edge before → after |
| --- | --- | --- |
| fa-contact-375-light | 0.0191 → 0.0166 | 0.0044 → 0.0000 |
| en-contact-375-light | 0.0196 → 0.0157 | 0.0099 → 0.0000 |
| ar-contact-375-light | 0.0095 → 0.0095 | 0.0000 → 0.0000 |
| fa-contact-375-dark | 0.0131 → 0.0106 | 0.0000 → 0.0000 |
| en-contact-375-dark | 0.0199 → 0.0179 | 0.0093 → 0.0000 |
| fa-contact-320-light | 0.0196 → 0.0160 | 0.0052 → 0.0000 |
| fa-contact-768-light | 0.0213 → 0.0112 | 0.0150 → 0.0008 |
| fa-contact-1024-light | 0.0423 → 0.0286 | 0.0210 → 0.0016 |
| fa-home-375-light | 0.0255 → 0.0210 | 0.0069 → 0.0000 |
| ar-home-375-dark | 0.0207 → 0.0215 | 0.0026 → 0.0000 |
| en-contact-375-dark-error | 0.0521 → 0.0414 | 0.0211 → 0.0000 |

Every previously affected case falls to 0.0000 except the two wide bands, where
it is 0.0008/0.0016. `spread` remains non-zero because the band still contains
the header's own border and control chrome; it is not a pure ghosting metric.
`ar-contact-375-light` never showed a measurable bleed at that scroll and
`ar-home-375-dark` spread is essentially unchanged — reported as measured.

**Drawer regression check.** The mobile drawer still opens, focuses Close, keeps
an opaque background and is unaffected by the header change.

## 2. Work-page hierarchy

**Root cause.** Sections rendered `client → internal → concept`, and each empty
group used a full-height section with a full-size heading and description. Two
empty groups of 254 px each pushed the real concept studies below the first
1440×900 viewport.

**Correction** (`src/content/work.ts`, `work-page.tsx`, `work.css`): added
`workDisplayOrder = ["concept", "client", "internal"]` while keeping `workKinds`
as the canonical complete set; jump links and sections follow the display order;
empty groups get compact `work-empty` styling. No project invented, no card,
link, route or detail page changed.

| capture | concept section top | first concept card | cards in first view |
| --- | --- | --- | --- |
| fa-work-1440-light | 924 → 416 | 1148 → 640 | 0 → 3 |
| en-work-1440-light | 924 → 416 | 1173 → 665 | 0 → 3 |
| ar-work-1440-light | 924 → 416 | 1148 → 640 | 0 → 3 |
| en-work-1440-dark | 924 → 416 | 1173 → 665 | 0 → 3 |
| fa-work-375-light | 991 → 521 | 1312 → 842 | 0 → 0 |
| en-work-375-light | 950 → 480 | 1300 → 830 | 0 → 0 |
| ar-work-375-light | 921 → 451 | 1217 → 747 | 0 → 1 |

Empty groups remain visible and honest at 115 px instead of 254 px. At 375 px
the concept section and heading are inside the first viewport; the first card is
30–31 px below the fold in `fa`/`en` and visible in `ar`. Not claimed as fully
above the fold on mobile.

## 3. About introduction

**Correction** (`src/content/about.ts`, FA/EN/AR): the description now explains
what the collective does and how it works; the team title, description,
profiles note and facts note describe collaboration, scope and handoff;
`next.note` keeps the implemented-contact-path sentence and drops the
owner-verification clause. No names, headcount, credentials, clients,
achievements or promises were added. Section hierarchy, icons and ECHO-501
terminology are unchanged; internal verification commentary now lives only in
documentation.

Rendered-text check for the confirmed defensive phrases:

| locale | before | after |
| --- | --- | --- |
| en | `unverified`, `not a list of`, `not published yet`, `not been verified` | none |
| fa | `تأییدنشده`, `تأیید نشده`, `منتشر نشده` | none |
| ar | `غير موثقة`, `لم تُنشر`, `لم تُتحقق` | none |

## Evidence

`test-results/echo-vf01-visual-evidence.zip` — **3,847,495 bytes**, SHA-256
`e27eacb4247b9a9440b726f9efc85061a7b179075cb6f1c02cec53b579943588`.

Contents: `README.md`, `manifest.json`, `findings.md`, `screenshots/before/`
(25 PNGs), `screenshots/after/` (25 PNGs), and per-run
`manifest/metrics/audit/server.log` under `runs/`. Verified with
`zipfile.testzip()` (all CRCs OK), PNG signature plus GdkPixbuf decode of all 50
images, and manifest check counts. `test-results/` is gitignored, so the bundle
is not committed.

Run folders: `test-results/echo-vf01-before-20261113-070032` (146 checks) and
`test-results/echo-vf01-after-20261113-070429` (167 checks).

### Environment and limitation

WebKitGTK **2.52.6** with the Cairo snapshot API under
`xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp'`, device scale factor 1,
software rendering (no DRI). Each capture uses a fresh ephemeral web context,
awaits fonts/images/two stable frames, and records the full viewport.

**The backdrop blur is not rasterised in this environment.** Computed style
reports `blur(16px) saturate(1.4)` and `CSS.supports` is true for both
properties, but probes at alpha 0.45 with blur 40px, alpha 0.45 without blur and
alpha 0.90 without blur produce identical pixels, including with
`WEBKIT_FORCE_COMPOSITING_MODE=1`. The screenshots demonstrate the opacity
correction only; blur rendering must be judged in a GPU browser. The fill was
sized so legibility does not depend on the blur, and no blur rendering is claimed.

Pull from the Fedora host:

```sh
incus file pull agent-lab/home/worker1/projects/echodevs/test-results/echo-vf01-visual-evidence.zip .
```

Replace `agent-lab` with the actual Incus instance name.

## Automated verification

| Check | Actual result |
| --- | --- |
| `tests/unit/header-glass.test.ts` (new) | **PASS**, fill ≥88% and <100%, blur ≥12px, both filter properties, sticky retained |
| `tests/unit/work.test.tsx` | **PASS**, display order, all three categories, three concept cards, `work-empty` on empty groups |
| `tests/unit/about.test.tsx` | **PASS**, locale parity plus no defensive phrasing and required contact-path sentence in FA/EN/AR |
| Focused run (3 files) | **PASS**, 14 tests |
| `npm test` | **PASS**, 27 files / **264 tests** (baseline 26/259) |
| `npm run lint` | **PASS**, zero warnings/errors |
| `npm run typecheck` | **PASS**, Next typegen + `tsc --noEmit` |
| `npm run build` | **PASS**, 27 localized routes retained |
| `npm run test:http` | **PASS**, work-page groups/concepts/destinations, locale switching, link crawl |
| `npm run verify:reference` | **PASS**, original hashes/CRCs |
| WebKitGTK before/after run | **PASS**, 146 / 167 checks, 25 / 25 screenshots |
| `git diff --check` / staged secret scan | **PASS** |

Not run: PostgreSQL integration tests (no API/schema/validation change),
Chromium/Firefox, native-language review, human screen-reader/zoom acceptance.

## Follow-ups status

- Resolved with evidence: #1 sticky-header bleed, #2 Work empty-state
  prominence, #3 About defensive copy.
- Deferred, untouched: #4 minimal 404 (ECHO-506), #5 RTL decorative arrow,
  #6 full-theme/reference-fidelity acceptance (ECHO-601/605/608).

`docs/ECHO-503-VISUAL-FOLLOWUPS.md` records the same split. The ZIP is review
evidence, not owner sign-off; blur rendering in a GPU browser still needs the
owner's visual check.

## Changed files

- `src/styles/header.css`
- `src/content/work.ts`
- `src/components/marketing/work-page.tsx`
- `src/styles/work.css`
- `src/content/about.ts`
- `tests/unit/header-glass.test.ts` (new)
- `tests/unit/work.test.tsx`
- `tests/unit/about.test.tsx`
- `scripts/audit-visual-corrections.py` (new)
- `docs/ECHO-VF01.md` (this report)
- `docs/ECHO-503-VISUAL-FOLLOWUPS.md`
- `ROADMAP.md`

## Commits

| Commit | Change |
| --- | --- |
| `70e414f` | `fix(ECHO-VF01): improve mobile sticky-header readability` |
| `dd88984` | `fix(ECHO-VF01): improve work-page content hierarchy` |
| `2abcdfc` | `refactor(ECHO-VF01): refine trilingual about introduction` |
