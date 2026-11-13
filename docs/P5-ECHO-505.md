# ECHO-505 — typography and localization rendering

Task: **ECHO-505 only** · Status: **PASS for the stated acceptance (no clipping and
readable mixed scripts) under WebKitGTK; native FA/AR reading quality,
cross-engine parity, human screen-reader and real 200% zoom gates remain open**,
2026-11-13

## Scope and baseline

Audited typography, font loading/fallback, Arabic shaping, content expansion,
Persian/Arabic punctuation and localized formatting across all **27 localized
marketing routes** (`fa`/`en`/`ar` × homepage, services, work, three concept
details, about, contact, privacy) plus shared header, navigation, footer,
language/theme controls, the inquiry form, and mono-styled chrome (brand chip,
footer badges/headings/status, runtime labels, language names).

Baseline: `main` at `7bc8cbb` (ECHO-504). Corrections committed as `fd923a7`
(font stack), `f8aadcd` (documentation), `f9f0b6c` (audits and QA definitions).
This task did **not** change the inquiry API/database/validation/security, enable
intake, remove `noindex`, add analytics, replace the approved brand face, restyle
the reference design, add dependencies or deploy/push. The pre-existing loopback
server on `127.0.0.1:3210` was left untouched; the browser harness starts and
stops its own private `next start` on a random loopback port.

## Browser and method

No Chromium/Firefox/Playwright was available, and no browser, font or framework
was downloaded. The audit uses the already-installed **WebKitGTK 2.52.6** under
**Xvfb**, captures real viewport PNGs through the Cairo snapshot C API, and writes
a manifest with route, locale, theme, viewport, engine, tested revision and
`worktreeDirty` through `scripts/evidence_manifest.py`.

Viewports: 1440×900, 1024×900, 768×900, 375×812, 320×720; light and dark.
Matrix: **78 page cases** (26 per locale; full page set at 1440/375, expansion at
320/768/1024 for home and contact, representative dark at 375) plus **2
fallback simulation captures** — **80 screenshots, 3296 checks**.

The run also verifies, per page:

- `document.fonts` settled and the six declared faces requested (`fontStatus`);
- computed body/heading families, no external font resource;
- glyph coverage for FA/AR/Latin weights, Persian and Arabic-Indic digits,
  Arabic punctuation, ZWNJ, arrows, and tofu/collision probes;
- mono-styled chrome resolves Arabic-script text to Vazirmatn, not the system
  monospace fallback (width comparison against the declared face);
- minimum prose line-height ≥ 1.6 and heading line-height ≥ 1.3;
- no clipped text, no forced nowrap, no line box outside its container, and no
  sticky-header overlap at any tested width;
- declared `system-ui, sans-serif` fallback readability: same content, no
  replacement glyphs, no horizontal overflow when Vazirmatn is unavailable.

Static coverage: `scripts/typography_audit.py` inspects the shipped WOFF2 assets
(signature, byte size, SHA-256), declared families/weights/`unicode-range`/
`font-display`, the token stacks, and the codepoints actually used by FA/EN/AR
content: **160 checks, 0 errors, 2 warnings** (the only codepoints outside the
shipped ranges are `U+2190` and `U+2192`, intentionally system-fallback arrows).

## Confirmed defect and fix

| # | Area | Defect | Fix |
| --- | --- | --- | --- |
| 1 | Mono-styled chrome (all locales) | `--font-mono: ui-monospace, monospace` forced Persian/Arabic text in mono styles (brand chip `اکو دوز`/`إيكو ديفز`, footer badges/headings/status, runtime labels, language names) onto an unreviewed system monospace fallback instead of the approved Vazirmatn. Measured width delta up to **60 px** in footer badges; the baseline matrix recorded it on **76 page cases** in FA/AR and in English pages where the localized chip/labels are Arabic-script. | `--font-mono: ui-monospace, "Vazirmatn", monospace;` keeps Latin chrome monospaced while Arabic-script glyphs resolve to the shipped face. After: **404 mono rows, 0 mismatches**. |

Regression coverage: `scripts/typography_audit.py` now treats a mono stack
without Vazirmatn as an error, `tests/unit/typography.test.ts` asserts the token
stack directly, and the browser harness compares rendered widths against the
declared face on every page. `docs/I18N-TERMINOLOGY.md` documents the stack as a
regression rule rather than a style preference.

## Harness measurement artifact (not a product defect)

The first clean baseline (`7bc8cbb`, harness v1) reported **336 failures**: the 76
real mono mismatches plus **260 false failures on the English locale** (26 ×
`document.fonts is loaded` and 234 coverage checks). WebKit loads subsets lazily,
so an English page that renders no Persian/Arabic text legitimately leaves the
Arabic faces unloaded; `document.fonts.check()` then reports a false gap, and the
canvas glyph probe itself started the download and flipped
`document.fonts.status` to `loading`.

The harness now force-loads the declared Vazirmatn weights 400/500/700 after the
page settles and re-settles before measuring, and records `fontStatus` before any
probe runs. The corrected baseline (`7bc8cbb`, harness v2) reports exactly **76
failures, all mono**, with `fontStatus: loaded` on all 78 cases. This artifact is
recorded rather than hidden because it explains the difference between the 336
and 76 baselines; the product fix is the same one defect.

## Verified non-defects

- Six self-hosted WOFF2 subsets (`arabic`/`latin` × 400/500/700), all with
  explicit `unicode-range` and `font-display: swap`; **no external font origin**.
- FA copy uses Persian ی/ک and Persian punctuation; AR copy uses Arabic
  yeh/kaf and Arabic-Indic digits; no Western `, ; ?` in RTL prose and no
  Western digits in RTL prose.
- Phone/email stay LTR with `bdi`/`dir="ltr"` isolation inside RTL prose; the
  isolated `CORE_RUNTIME`, `NEXT.JS // PYTHON // AI` and stack tags do not
  reorder surrounding punctuation.
- Letter-spacing/uppercasing remain scoped to `:lang(en)`; no joining break.
- No tofu, no duplicate-glyph collisions, no uncovered used codepoints except the
  documented system-fallback arrows.
- Fallback simulation (FA and AR at 375): same text length, **11 px** width delta,
  no replacement glyphs, document width equals viewport width.
- Light and dark both render; mono chrome and headings keep approved hierarchy.

## Tests and verification

| Check | Actual result |
| --- | --- |
| `scripts/audit-typography.py` browser matrix (after, clean `bd4d5ed`) | **PASS**, 3296 checks, 80 screenshots, 0 failures, 0 warnings |
| `scripts/audit-typography.py` baseline (`7bc8cbb`, corrected harness) | **76 failures**, all mono, `fontStatus: loaded` on 78/78 |
| `scripts/typography_audit.py` static audit | **PASS**, 160 checks, 0 errors, 2 documented arrow warnings |
| `python3 -m unittest scripts/test_typography_audit.py` | **PASS**, 14 tests |
| `npx vitest run tests/unit/typography.test.ts` | **PASS**, 7 tests |
| Full unit suite | **PASS**, 33 files / **335 tests** |
| `npm run lint` | **PASS**, zero warnings/errors |
| `npm run typecheck` | **PASS**, Next typegen + `tsc --noEmit` |
| `npm run build` | **PASS**, 27 localized routes retained |
| `npm run test:http` | **PASS**, 27 documents, 73 destinations, six served font subsets, no external/placeholder URLs |
| `npm run verify:reference` | **PASS**, original ZIP/code.html/screen.png/DESIGN.md SHA-256 and member CRC/safety checks |
| `npm run qa:validate` | **PASS**, 25 tests (10 manual), 13 suites, 25 unique ids |
| `npm run qa:run` (automated) | **PASS 10 / FAIL 0 / BLOCKED 1 / STALE 3 / NOT_RUN 11** at `ff458af` |
| `npm run qa:run -- --include-opt-in --only BROWSER-TYPOGRAPHY-MATRIX` | **PASS 11 / FAIL 0 / BLOCKED 1 / STALE 3 / NOT_RUN 10** at `bd4d5ed` |
| `git diff --cached --check` / staged secret scan | **PASS** |

Not rerun: PostgreSQL integration tests (no API/schema/validation change) and
real Chromium/Firefox, native-language, human screen-reader and real 200% zoom
acceptance.

## QA integration

Added to `qa/registry.json` without duplicate ids:

- Suites: `typography` (static audit, automated) and `browser-typography`
  (opt-in WebKitGTK matrix).
- Tests: `TYPOGRAPHY-FONT-ASSETS` (served WOFF2 assets), `TYPOGRAPHY-AUDIT-UNIT`
  (harness/unit checks), `TYPOGRAPHY-CONTENT` (script/digit/punctuation rules),
  `BROWSER-TYPOGRAPHY-MATRIX` (78-case browser matrix).
- ECHO-505 linked to the existing manual gates `MANUAL-ZOOM-200` and
  `MANUAL-CROSSENGINE-PARITY`; `MANUAL-NATIVE-FA`/`MANUAL-NATIVE-AR` stay not run.

No PASS record was written by hand. The four typography cases pass from actual
suite exits (`qa/results/automated.jsonl`), and the manual/native/zoom/cross-engine
cases remain `NOT_RUN`. The three STALE records (`BROWSER-RTL-MATRIX`,
`BROWSER-LOCALE-SWITCH`, `BROWSER-VISUAL-CORRECTIONS`) predate this batch and were
not fabricated into a pass; `PG-INQUIRY-INTEGRATION` remains the existing
BLOCKED opt-in record.

## Evidence

- Package: `test-results/echo-505-typography-evidence.zip`
  (**23,578,695 bytes / 255 entries / 240 PNGs**, ZIP CRC verified, every PNG
  chunk CRC/IHDR/IEND validated, all 80 screenshots present per run). It contains
  `README.md`, `FINDINGS.md`, `runs.json` (index of runs) and three source runs:
  - `before-baseline/` — `7bc8cbb`, harness v1, 336 failures incl. the measured
    readiness artifact;
  - `before-corrected/` — `7bc8cbb`, harness v2, 76 mono failures;
  - `after/` — `bd4d5ed`, clean, 0 failures, 80 PNGs.
- Each run keeps `manifest.json`, `audit.json`, `font-faces.json`, `server.log`
  and `screenshots/`; the after set is the authoritative acceptance run
  (`worktreeDirty: false`).
- ZIP and PNG integrity are verified by Python `zipfile` CRC plus per-chunk PNG
  CRC/IHDR/IEND validation. `test-results/` is gitignored.

## Remaining gaps / acceptance not claimed

Cross-engine (Chromium/Firefox) rendering parity, native FA/AR reading and
register acceptance, human screen-reader/keyboard-only acceptance, real browser
200% zoom, GPU-backed blur and full visual fidelity remain open under
ECHO-505/601/605. This report claims only the automated WebKitGTK matrix and
static font/content audit at the listed viewports. `document.fonts.check()` is
documented as a family-load check, not proof of codepoint coverage; the static
range analysis plus the rendered fallback scan are authoritative.

## Changed files

- `src/styles/tokens.css`
- `scripts/typography_audit.py` (new)
- `scripts/test_typography_audit.py` (new)
- `scripts/audit-typography.py` (new)
- `tests/unit/typography.test.ts` (new)
- `qa/registry.json`
- `qa/results/automated.jsonl`
- `docs/I18N-TERMINOLOGY.md`
- `docs/QA-SYSTEM.md`
- `docs/P5-ECHO-505.md` (this report)
- `ROADMAP.md`
