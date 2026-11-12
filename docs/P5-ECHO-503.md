# ECHO-503 — RTL/LTR audit

Task: **ECHO-503 only** · Status: **PASS for the stated acceptance (screenshot and
keyboard matrix) under WebKitGTK; cross-engine/native/screen-reader/zoom gates
remain with later tasks**, 2026-11-12

## Scope and baseline

Audited the rendered directionality of all **27 localized marketing routes**
(`fa`/`en`/`ar` × homepage, services, work, three concept details, about,
contact, privacy) plus shared header, desktop navigation, mobile dialog, footer,
language/theme controls, the inquiry form (default, logical tab order, disabled
intake failure status), and the localized 404 document.

Baseline: `main` at `c3fabbc` (ECHO-502). Corrections committed as `969f97f`.
This task did **not** change the inquiry API/database/validation/security, enable
intake, remove `noindex`, add analytics, restyle the approved reference design,
or deploy/push. The pre-existing loopback server on `127.0.0.1:3210` was left
untouched; the audit starts and stops its own private `next start` on a random
loopback port.

## Browser and method

No Chromium/Firefox/Playwright was available, and no browser or framework was
downloaded. The audit uses the already-installed **WebKitGTK 2.52.6** under
**Xvfb**, captures real viewport PNGs through the Cairo snapshot C API, and
drives keyboard input with `xdotool` through a new reusable harness,
`scripts/audit-rtl.py`.

Viewports: 1440×900, 1024×900, 768×900, 375×812, 320×720; light and dark.
Captures: **71 screenshots**, **1022 passing assertions**, 4 keyboard records.

## Confirmed defects and fixes

| # | Area | Defect | Fix |
| --- | --- | --- | --- |
| 1 | Inquiry form (FA/AR) | `fullName` and `description` used `dir="auto"`, which resolves an empty field to **LTR** even inside an RTL document, misaligning the caret/bidi base before typing. | Removed `dir="auto"` so both inherit document direction; email/phone keep explicit `dir="ltr"`. |
| 2 | Concept chat (FA/AR) | Bubble tails used physical corner radii; in RTL the tail pointed outward instead of toward the speaker side. | Replaced with logical `border-start-*`/`border-end-*` radii, identical in LTR and mirrored in RTL. |

Regression coverage: `tests/unit/inquiry-form.test.tsx` now asserts email/phone
stay `dir="ltr"` and localized text fields carry no forced direction; the audit
harness asserts localized control direction and mirrored chat tails from computed
styles.

## Verified non-defects

- Section rail stays right in RTL and overlaps **no** heading/paragraph line boxes
  at 1024/1050/1100/1152/1200/1280/1366 px (line-range intersection: zero hits).
- Grid/card order mirrors correctly (first child at right edge in FA/AR).
- Mobile drawer opens at the inline-end side, focuses Close, traps Tab, closes on
  Escape and restores focus.
- Desktop nav visual order matches locale; header/footer/privacy/services/about/
  404 set correct `lang`/`dir` and have no horizontal overflow at any tested width.
- Step numerals stay stable and unreordered; Latin email/phone tokens remain LTR
  inside RTL; disabled-intake failure status is localized, correctly directed and
  does not overflow at 320 px.
- Light and dark homepage both render the requested theme.

## Deferred (not defects fixed here)

- Decorative `↗` link arrows are not mirrored in RTL — a visual-symbol decision
  recorded for the later full visual-fidelity audit, not a bidi break.
- Minimal 404 (no site header/back link) belongs to ECHO-506.
- Sticky header can overlay scrolled content on short viewports — general
  accessibility/ECHO-601, not RTL-specific.
- Latin brand/technical tokens remain intentionally untranslated and isolated.

## Tests and verification

| Check | Actual result |
| --- | --- |
| `scripts/audit-rtl.py` browser matrix | **PASS**, 1022 checks, 71 screenshots, WebKitGTK 2.52.6 |
| Focused inquiry-form regression | **PASS**, 12 tests |
| Full unit suite | **PASS**, 25 files / **245 tests** |
| `npm run lint` | **PASS**, zero warnings/errors |
| `npm run typecheck` | **PASS**, Next typegen + `tsc --noEmit` |
| `npm run build` | **PASS**, 27 localized routes retained |
| `npm run test:http` | **PASS**, 27 documents, 73 destinations, no external/placeholder URLs |
| `npm run verify:reference` | **PASS**, original ZIP/code.html/screen.png/DESIGN.md SHA-256 and member CRC/safety checks |
| `git diff --check` / staged secret scan | **PASS** |

Not rerun: PostgreSQL integration tests (no API/schema/validation change) and
real Chromium/Firefox, native-language, screen-reader and zoom acceptance.

## Evidence

- Package: `test-results/echo-503-browser-evidence.zip`
  (**8,334,317 bytes / 76 entries / 71 PNGs**, ZIP CRC verified, all PNG headers
  valid, manifest commit `969f97f`). `test-results/` is gitignored.
- Source run: `test-results/echo-503-20261112-202215/` with `README.md`,
  `manifest.json`, `audit.json`, `findings.md`, `server.log` and screenshots.

## Remaining gaps / acceptance not claimed

Cross-engine (Chromium/Firefox) parity, native FA/AR reading and register
acceptance, human screen-reader/keyboard-only/zoom acceptance and full visual
fidelity remain open under ECHO-505, ECHO-601 and ECHO-605. This report claims
only the automated WebKitGTK screenshot + keyboard matrix at the listed
viewports.

## Changed files

- `scripts/audit-rtl.py` (new)
- `src/components/marketing/inquiry-form.tsx`
- `src/styles/homepage.css`
- `tests/unit/inquiry-form.test.tsx`
- `docs/P5-ECHO-503.md` (this report)
- `ROADMAP.md`
