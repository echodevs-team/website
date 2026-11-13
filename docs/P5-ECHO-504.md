# ECHO-504 — Preserve route and slug during language switching

Task: **ECHO-504 only** · Status: **PASS** for route/slug preservation and
intentional preference persistence, 2026-11-12

## Scope and baseline

Audited language switching across all implemented marketing route families in
FA/EN/AR: homepage, services, work listing, the three concept details
(`analytics`, `chat`, `booking`), about, contact and privacy. Checked the desktop
header, mobile drawer, no-script header and the localized 404, plus direct loads
and deep links.

Baseline: `main` at `6d1b68e` (ECHO-503). Implementation committed as `fc1c578`
with a harness follow-up `406adc3`. No inquiry API/database/validation/security,
Canvas, intake, `noindex`, metadata policy, page layout or unrelated copy changed.

## Audit result

**Route and slug retention already worked.** Every page passes its logical path
to `Header`, and `localePath` builds the target route, so `/fa/about` →
`/en/about` → `/ar/about` and `/fa/work/chat` → `/en/work/chat` →
`/ar/work/chat` were correct before this task. Production HTML assertions now
lock the full 27-document matrix in place.

Confirmed gaps:

| Gap | Impact | Correction |
| --- | --- | --- |
| `echo_locale` was read but never written | The root could not remember an intentional language choice; `docs/ARCHITECTURE.md` assigned this to ECHO-504 and privacy copy disclosed the missing write | One shared client switch writes a validated `echo_locale` cookie (one year, `Path=/`, `SameSite=Lax`, `Secure` on HTTPS) on click/aux-click |
| Homepage/anchored fragments were dropped on switch | `/fa#process` → EN landed at the top instead of the process section | Click handler appends the live hash only when it matches a simple allowlist; unsafe values are ignored |
| Privacy copy said the cookie is not written | Would become inaccurate | Updated the Local preferences card in all three locales |

Query strings are **not** propagated: marketing routes define no query state, and
copying arbitrary parameters could carry unrelated values across locales.

## Routing and fallback policy

- Valid locale + valid route: exact equivalent path/slug in the target locale.
- Unknown work slug, invalid locale prefix, nonexistent route: existing localized
  404 document; language links fall back to the three locale homes and do not
  invent a destination slug.
- Trailing slash: 308 to the canonical path, preserving the route family.
- Root `/`: stored `echo_locale` → weighted `Accept-Language` → FA, still a
  307 `no-store` redirect. Explicit locale URLs remain unaffected by the cookie.
- No JavaScript: links still navigate to the equivalent page; only preference
  persistence and fragment carry-over require JavaScript.

No new redirect endpoint, routing architecture, open-redirect surface or
untrusted URL construction was introduced.

## Browser verification (WebKitGTK 2.52.6 / Xvfb)

Targeted real-browser run, not the full ECHO-503 matrix:

- Desktop: `/fa/work/chat` → click EN → `/en/work/chat` (`lang=en`, `dir=ltr`,
  cookie written) → click AR → `/ar/work/chat` (`lang=ar`, `dir=rtl`).
- Homepage `/fa#process` → EN keeps `#process`.
- `/en/privacy` → AR stays on `/ar/privacy` and writes the cookie.
- `/fa/work/unknown` renders the localized 404 with home-only language fallback.
- Root `/` after an AR switch redirects to `/ar` from the stored cookie.
- Mobile `/fa/work/booking` → open drawer → EN → `/en/work/booking`, drawer
  closes, cookie written.

**PASS:** 37 checks, 8 screenshots. Evidence:
`test-results/echo-504-locale-switch-evidence.zip` (649,019 bytes, CRC-verified,
manifest commit `406adc3`); run folder
`test-results/echo-504-20261113-064353/`. `test-results/` is gitignored.

## Automated verification

| Check | Actual result |
| --- | --- |
| `tests/unit/locale-switch.test.tsx` | **PASS**, 14 tests: 9 route families × 3 locales, slug mapping, fragment allowlist, cookie attributes, click behavior |
| Full unit suite | **PASS**, 26 files / **259 tests** (baseline 25/245) |
| `npm run lint` | **PASS**, zero warnings/errors |
| `npm run typecheck` | **PASS**, Next typegen + `tsc --noEmit` |
| `npm run build` | **PASS**, 27 localized routes retained |
| `npm run test:http` | **PASS**, exact locale-switch matrix over 27 documents, localized 404 fallback, trailing-slash canonicalization |
| Targeted WebKitGTK run | **PASS**, 37 checks / 8 screenshots |
| `npm run verify:reference` | **PASS**, original hashes/CRCs |
| `git diff --check` / staged secret scan | **PASS** |

Not rerun: PostgreSQL integration tests (no API/schema/validation change);
Chromium/Firefox, native-language, human screen-reader/zoom and full visual
fidelity.

## Deferred visual findings (owner review of ECHO-503)

Recorded, not fixed in ECHO-504:
mobile sticky-header bleed-through; excessive empty-state prominence before
concept studies; About copy reading like internal verification commentary;
minimal 404; decorative arrow direction in RTL; incomplete full-theme/reference
fidelity acceptance. Tracking: `docs/ECHO-503-VISUAL-FOLLOWUPS.md`. These are
assigned to the subsequent owner-authorized visual/accessibility work and remain
open.

## Remaining acceptance gaps

Cross-engine (Chromium/Firefox) parity, native FA/AR review, human
screen-reader/keyboard/zoom acceptance, full visual fidelity and the owner visual
follow-ups are still open. This task claims only the automated route/slug,
cookie, HTTP and targeted WebKitGTK interaction evidence above.

## Changed files

- `src/i18n/preference.ts` (new)
- `src/components/layout/language-links.tsx`
- `src/components/layout/header.tsx`
- `src/content/privacy.ts`
- `tests/unit/locale-switch.test.tsx` (new)
- `scripts/smoke-http.mjs`
- `scripts/audit-locale-switch.py` (new)
- `docs/ARCHITECTURE.md`
- `docs/P5-ECHO-504.md` (this report)
- `docs/ECHO-503-VISUAL-FOLLOWUPS.md` (new)
- `ROADMAP.md`
