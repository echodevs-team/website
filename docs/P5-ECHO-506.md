# ECHO-506 — localized metadata, canonical URLs, hreflang, sitemap/robots and 404

Task: **ECHO-506 only** · Status: **PARTIAL — preview metadata/robots/404
acceptance PASS under WebKitGTK; production canonical, hreflang and sitemap
publication remain blocked pending an owner-approved HTTPS origin and explicit
indexing authorization**, 2026-11-14

## Scope and baseline

Audited all **27 localized marketing routes** (`fa`/`en`/`ar` × homepage,
services, work, three concept details, about, contact, privacy) for localized
title/description, `lang`/`dir`, title-template consistency, duplicate or
inherited metadata, preview `noindex`/`nofollow`, 404 metadata and locale
equivalence. Rebuilt the minimal 404 as a localized, recoverable page inside the
established shell.

Baseline: `main` at `1a48981` (ECHO-505 documentation tip). Commits:
`a90938f` (localized 404 experience), `65b890e` (locale-aware SEO metadata
policy), `ba7f116` (QA registration and WebKitGTK 404 harness), `7900c6e`
(automated QA results), `62c5cdf` (clean WebKitGTK 404 browser run). This task did
**not** change the inquiry API/database/validation/security, enable intake, remove
`noindex`, enable public indexing, invent a production domain, add analytics, add
dependencies, restyle the reference design or deploy/push. `ECHO_SITE_ORIGIN` and
`ECHO_PUBLIC_INDEXING` remain unset.

## Metadata policy

One module owns the origin (`src/lib/seo/site.ts`) and one owns publication
policy (`src/lib/seo/policy.ts`); pages never read the request `Host`.

| Concern | Implemented behavior |
| --- | --- |
| Approved origin | `ECHO_SITE_ORIGIN` is accepted only as an absolute `https:` origin without credentials, explicit port, path, query or fragment, and only for a public dotted hostname. Localhost, loopback/private IPs, bracketed IPv6 and `.local`/`.internal`/`.test`/`.example`/`.invalid` suffixes are rejected. Unset or invalid → no origin. |
| Canonical + hreflang | `localizedAlternates(locale, path)` returns `undefined` while no origin exists, so preview HTML emits **no** canonical and **no** document `hreflang`. With an approved origin it emits a self-referencing canonical plus reciprocal `fa`/`en`/`ar` alternates for the same route. No `x-default` is fabricated. |
| Work slugs | Concept details use the route slug unchanged in every locale (`/work/analytics`, `/work/chat`, `/work/booking`); invalid or non-locale slugs render the 404 with preview robots. |
| Titles | `[locale]/layout.tsx` sets `title.default` to the localized `Foundation.title — Foundation.preview` and `title.template` to `%s — Echo Devs`. Route pages supply only their localized title, removing hand-written suffix drift. |
| Descriptions | All nine route families per locale now have a localized description. The homepage previously had none; it uses `homeContent[locale].lead`. Tests assert all 27 descriptions are present and unique per locale. |
| Robots | Shared `PREVIEW_ROBOTS` (`noindex, nofollow`) replaces per-page object literals, so every localized marketing page keeps the documented preview directive. |
| Request host | Never consulted for canonical, alternates, sitemap or robots. Tests fail on `headers()`, `x-forwarded-host` or `host` usage in the SEO modules. |

Limit that remains: with no approved origin, canonical/hreflang are intentionally
absent rather than guessed. That is the correct preview state, not production SEO
readiness.

## robots.txt and sitemap

`src/app/robots.ts` and `src/app/sitemap.ts` call the policy module.

- Preview (current state): `robots.txt` is `User-Agent: *` + `Disallow: /`, with
  **no** `Sitemap:` line; `sitemap.xml` is a valid `<urlset>` with **no `<loc>`**.
- Publication requires **both** an approved origin **and**
  `ECHO_PUBLIC_INDEXING=true`. Only then does robots allow `/` (still disallowing
  `/api/`), advertise `${origin}/sitemap.xml`, and the sitemap list the 27
  localized marketing URLs with reciprocal language alternates.
- Neither output can contain localhost, a placeholder domain or a request Host
  value; tests and the HTTP smoke suite assert this.
- Private/API/dev paths are never advertised.

No preview-origin artifact is published, and indexing is not enabled anywhere.

## 404 experience

Before (`1a48981`): the localized 404 rendered only an `<h1>` and language links.
The WebKitGTK run recorded **109 failures / 324 checks**: no header, no footer, no
skip target, no homepage/Services/Work/Contact recovery, no recovery heading, no
keyboard-reachable recovery link, plus duplicate `<meta name="robots">` tags
(`noindex` from Next and a page-level `noindex, nofollow`). Four mobile captures
also failed a snapshot-flatness heuristic because the page painted one color.

After: `src/app/global-not-found.tsx` keeps the real 404 status and renders
`NotFoundPage` — the established `Header` and `MarketingFooter`, a `home-glass`
panel with an eyebrow, one localized `<h1>`, a localized explanation, a primary
homepage action, a localized recovery navigation (`Services`, `Work`, `Contact`),
and inline language links that fall back to `/fa`, `/en`, `/ar`. It includes one
skip link and a `main` with `tabIndex={-1}`. It has no fake search/retry control
and no redirect masking. The static `robots` object was removed from
`global-not-found.tsx` so Next's single `noindex` directive is not duplicated;
the page title stays `404 — Echo Devs`. Copy is FA/EN/AR in
`src/i18n/messages/*.json` (`notFoundDescription`, `notFoundHome`, `recovery`) and
`src/styles/not-found.css` adds only panel layout to the existing primitives.

Wording is honest: it says the page does not exist, moved, or the address is
incomplete, and offers existing destinations. It does not claim the content was
deleted, recovered or searchable.

## Browser evidence (WebKitGTK only)

No Chromium/Firefox/Playwright exists in this VM and none was downloaded. The
harness (`scripts/audit-404.py`) drives the installed **WebKitGTK 2.52.6** under
**Xvfb** against its own private loopback `next start`, confirms the HTTP status
with an independent request, and captures real viewport PNGs through the Cairo
snapshot API.

Route tested: `/{locale}/missing/nested`. Matrix: FA/EN/AR × 1440×900 and
375×812 × light/dark = **12 screenshots per run**. Checks per run cover HTTP 404,
`lang`/`dir`, one localized `h1`, recovery heading, header/footer shell, skip
target, homepage/Services/Work/Contact links, language links falling back to
locale homes without inventing the path, no fake control, no horizontal
overflow/off-screen panel, exactly one `noindex` directive, no preview canonical
or document `hreflang`, applied theme, and keyboard focus with a visible outline.

| Run | Revision | Dirty | Screenshots | Checks | Failures |
| --- | --- | --- | --- | --- | --- |
| before | `1a48981f0e91` | no | 12 | 324 | 109 |
| after | `62c5cdf3ac37` | no | 12 | 336 | 0 |

Directories: `test-results/echo-506-before-20261114-075950/` and
`test-results/echo-506-after-20261114-081855/` (both gitignored). The QA runner
recorded `BROWSER-404-EXPERIENCE` PASS at clean `7900c6e`; the bundled after run
is a direct clean run at `62c5cdf`, the later results-only commit with the same
application source.

## Evidence bundle

`test-results/echo-506-seo-404-evidence.zip` (untracked):

- **856,521 bytes, 34 entries, 24 PNGs**
- `README.md`, `FINDINGS.md`, `manifest.json` (tested-URL manifest, revisions,
  engine, QA record) and `metadata-diagnostics.json` (title, robots, canonical
  and document hreflang observed per capture)
- both runs' `manifest.json`, `audit.json`, `server.log` and `screenshots/*.png`
- ZIP CRC verified; every PNG validated for IHDR/CRC/IEND; SHA-256
  `96d3cddc9df1555ddb369f4df4afbd9ddb21c2d5fff4d59d365dea3b3f1ba268`

The bundle states its WebKitGTK-only scope and does not claim cross-engine,
native-language, screen-reader or zoom acceptance.

## Tests and verification

| Check | Actual result |
| --- | --- |
| `scripts/audit-404.py --phase before` (`1a48981`, clean) | 324 checks, **109 failures** |
| `scripts/audit-404.py --phase after` (`62c5cdf`, clean) | **PASS**, 336 checks, 12 screenshots, 0 failures |
| `npm run lint` | **PASS**, zero warnings/errors |
| `npm run typecheck` | **PASS**, Next typegen + `tsc --noEmit` |
| `npm test` | **PASS**, 35 files / **360 tests** (25 new SEO/404 tests) |
| `npm run build` | **PASS**, 27 localized routes plus `/robots.txt` and `/sitemap.xml` |
| `npm run test:http` | **PASS**, 27 documents, 73 destinations, preview robots/sitemap, no canonical/hreflang, richer 404 assertions |
| `npm run verify:reference` | **PASS**, original reference hashes and member CRCs unchanged |
| `npm run qa:validate` | **PASS**, 31 tests (12 manual), 15 suites, 31 unique ids |
| `npm run qa:run` (automated) | **PASS 14 / FAIL 0 / BLOCKED 1 / STALE 4 / NOT_RUN 12** at `7900c6e` |
| `npm run qa:run -- --include-opt-in --only ECHO-506` | **PASS**, browser-404/http/seo at clean `7900c6e` |
| `git diff --cached --check` / staged secret scan | **PASS** |

Not rerun: PostgreSQL integration (no API/schema/validation change; not
authorized here), cross-engine/native/screen-reader/real-zoom acceptance.

Pre-existing STALE cases (`BROWSER-RTL-MATRIX`, `BROWSER-LOCALE-SWITCH`,
`BROWSER-VISUAL-CORRECTIONS`, `BROWSER-TYPOGRAPHY-MATRIX`) and
`PG-INQUIRY-INTEGRATION` NOT_RUN are reported unchanged and were not cleared to
make this task look greener.

## QA integration (ECHO-QA01)

Added without duplicate ids (`qa/registry.json`):

- Suites: `seo` (focused Vitest SEO/404 source and policy tests) and
  `browser-404` (opt-in WebKitGTK/Xvfb harness with its own loopback server).
- Automated tests: `SEO-METADATA-POLICY` (localization), `SEO-404-HTTP` and
  `SEO-ROBOTS-SITEMAP-PREVIEW` (http), `BROWSER-404-EXPERIENCE` (browser).
  ECHO-506 was also linked to the existing `HTTP-SMOKE` case because its
  assertions now cover this milestone.
- Manual gates: `MANUAL-PRODUCTION-ORIGIN` (owner) and
  `MANUAL-SEO-RELEASE-READINESS` (owner). The pre-existing `MANUAL-404-METADATA`
  (technical) and `MANUAL-LEGAL-PRIVACY` (legal) remain NOT_RUN.

No PASS was written by hand. Automated results come from actual commands in the
QA runner; the browser record was captured from a clean tree, and the directly
captured after run is separately revision-stamped in its manifest.

Current milestone view (`npm run qa:status -- --milestone ECHO-506`): **PASS 5 /
FAIL 0 / BLOCKED 0 / STALE 0 / NOT_RUN 4**, i.e. **5/5 automated PASS, 0/4 manual**,
with **3 owner/legal gates pending**. The generated report still says release
ready **NO**.

## Outstanding gates and limitations

- **Production origin/indexing (owner):** without a real approved HTTPS origin,
  canonical URLs, absolute `hreflang` and a populated sitemap cannot be verified;
  publication stays gated and is not claimed. `MANUAL-PRODUCTION-ORIGIN` and
  `MANUAL-SEO-RELEASE-READINESS` are NOT_RUN and must not be marked PASS by an
  agent.
- **404 social/technical review:** `MANUAL-404-METADATA` remains a human check
  (screenshots plus copied metadata values).
- **Legal:** `MANUAL-LEGAL-PRIVACY` is unchanged and not approved here.
- **Engine/accessibility scope:** WebKitGTK-only evidence; no Chromium/Firefox,
  native FA/AR reading, screen-reader or real 200% zoom acceptance. Backdrop
  blur still does not render in this software WebKit.
- Production SEO readiness is **not** inferred from preview checks.

## Not changed

Inquiry API/DB/migrations/validation/security, intake enablement (still
disabled), preview `noindex`, analytics, business/legal copy, reference design,
Canvas, dependencies, deployment and Git remotes. No existing failed, stale or
manual record was deleted or rewritten; new records only.
