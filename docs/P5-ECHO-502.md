# ECHO-502 — Translation coverage and sensitive-claims review

Task: **ECHO-502 only** · Status: **coverage PASS; owner review package delivered,
owner/native/legal sign-off pending**, 2026-11-12

## Scope and baseline

Audited the visitor-facing surface of all **27 localized marketing routes**
(`fa`/`en`/`ar` × homepage, services, work, three concept details, about,
contact, privacy), plus:

- shared header, mobile dialog, footer and language/theme controls;
- the single inquiry form, its labels, validation, loading, success, retry and
  failure copy;
- error/404 document and no-script fallbacks;
- route metadata, document `lang`/`dir`, accessible names and the localized
  skip link.

Sources inspected: `AGENTS.md`, `SCOPE.md`, `ROADMAP.md`, `DESIGN.md`,
`docs/ARCHITECTURE.md`, `docs/INQUIRY-PRIVACY.md`,
`docs/INQUIRY-OPERATIONS.md`, `docs/DECISIONS.md`,
`docs/I18N-TERMINOLOGY.md`, `docs/P5-ECHO-501.md`, the typed content modules in
`src/content/*.ts`, `src/i18n/messages/{en,fa,ar}.json`, the marketing
components/routes and the immutable `design/reference/code.html`.

Baseline: clean `main` at `71237d1` (ECHO-501). This task did **not** change the
UI composition, Canvas, inquiry API/database/validation/idempotency/rate limits,
intake enablement, `noindex`, analytics, privacy/legal policy, dependencies,
deployment or remote state.

## Coverage result

| Surface | Result |
| --- | --- |
| 27 localized marketing routes | All render localized content from typed `Record<Locale, …>` modules; no missing key, empty value or locale drift |
| Header / mobile dialog / footer | Localized navigation, labels, tagline, footer headings, status copy and brand aria-label |
| Language and theme controls | Native language names, localized theme group and option labels, persisted mode names |
| Inquiry form | Localized legend, accessible name, labels, hints, required indicator, service options, validation, pending/success/uncertain/limited/conflict/expiry/retry copy |
| 404 document | Localized heading and language navigation, correct `lang`/`dir`, unknown-locale fallback |
| Metadata | Localized title on every route; description on every route **after this task** (homepage previously had none) |
| No-script | Localized skip link, header navigation, language links and inquiry/JavaScript warning |
| Source-level strings | Only deliberate brand/technical tokens remain in JSX (listed below); the hidden `Website` honeypot label is `aria-hidden` and never presented to visitors |
| Placeholders | No `TODO`/`FIXME`/lorem/“translation needed” markers in localized content |

### Intentional non-localized tokens

These are not translation omissions:

- Latin `Echo Devs` wordmark and the fixed Persian brand chip `اکو دوز` in shared
  header/footer (brand presentation, D7).
- `ED`, `CORE_RUNTIME`, `NEXT.JS // PYTHON // AI`, `CONCEPT`, `PREVIEW`,
  `SaaS_PREVIEW`/`RAG_BOT_PREVIEW`/`HEALTH_BOOKING_PREVIEW`, concept telemetry
  codes, stack tags and process codes (`DISCOVERY`…). They are reference/technical
  labels isolated with `bdi`/`dir="ltr"`.
- English reference-style mono captions on the four homepage benefit cards
  (`Clear Decisions`, `Product Thinking`, `Maintainable Code`,
  `Visible Milestones`). They duplicate the localized heading/body and preserve
  the approved technical caption treatment; localizing them is an optional
  design/copy decision (Minor), not a missing page translation.
- The hidden `Website` field is an anti-bot trap with `aria-hidden="true"`; it is
  not read by assistive technology.

## Confirmed correction

| Area | Correction | Evidence |
| --- | --- | --- |
| Homepage metadata | Added a localized `<meta name="description">` sourced from `homeContent[locale].lead`; the route previously inherited only the layout title and was the sole marketing page without a description. `noindex` and the existing title remain unchanged. | Production HTML before: title only. After: localized description on `/fa`, `/en`, `/ar`; smoke test now asserts it. |
| Regression coverage | Added `tests/unit/claims.test.ts`, a cross-module guard against fabricated contact, compliance and uptime markers in any locale. Extended the production HTTP smoke test to require a homepage metadata description. | See verification table. |

No other confirmed translation defect was found. No business, contact, legal,
retention, compliance or portfolio fact was invented or rewritten.

## Sensitive-claims summary

Detailed claim text, evidence, classification, severity and owner action are in
[`docs/P5-ECHO-502-OWNER-REVIEW.md`](P5-ECHO-502-OWNER-REVIEW.md). Summary:

- **Verified implementation facts:** inquiry flow and storage behavior, success
  only after a confirmed PostgreSQL commit, field/source-page limits, no
  analytics/marketing tools, self-hosted fonts, local-only theme preference,
  read-only `echo_locale` cookie, concept-only portfolio data.
- **Clearly framed proposals:** service scopes, deliverables, workflows,
  exclusions and engagement process; all qualified as proposals.
- **Concept/demo:** all three work items and their stack tags, visuals,
  telemetry and detail pages; no client deployment, source repository, result or
  live demo is claimed.
- **Unverified business claims:** collective team identity/working model, brand
  transliteration and public channels; withheld facts are explicitly marked.
- **Unresolved operational policy / legal review:** controller identity,
  jurisdiction, legal basis, retention, privacy contact and request
  verification, operators/access review, hosting and subprocessors, backups and
  deletion reconciliation.
- **No misleading or contradictory content remains** after the ECHO-501 and
  ECHO-502 corrections; no publishing blocker affects the current preview while
  intake is disabled and `noindex` is retained.

## Tests and verification

| Check | Actual result |
| --- | --- |
| Focused new tests | **PASS**, `tests/unit/claims.test.ts` + `tests/unit/localization-parity.test.tsx`, 18 tests |
| Full unit suite | **PASS**, 25 files / **245 tests** (baseline 244/24) |
| `npm run lint` | **PASS**, zero warnings/errors |
| `npm run typecheck` | **PASS**, Next typegen + `tsc --noEmit` |
| `npm run build` | **PASS**, 33 static outputs; 27 localized marketing routes retained |
| `npm run test:http` | **PASS**, 27 localized documents, 73 unique destinations, localized titles/descriptions, 404, `noindex`, locale/theme controls, API disabled (503) |
| `npm run verify:reference` | **PASS**, original ZIP/code.html/screen.png/DESIGN.md SHA-256 and member CRC/safety checks |
| `git diff --check` / staged secret scan | **PASS** |

Not rerun: PostgreSQL integration tests (no API, validation or persistence
contract changed) and browser visual/keyboard/screen-reader/zoom checks. This task
did not perform the consolidated browser audit or download browser tooling.

## Deferred owner / native / legal review

- Owner review of the sensitive-claims matrix and the grouped decisions in the
  owner-review document (D1–D8).
- Native FA/AR reading, register and tone review of all visitor-facing copy.
- Legal/privacy approval of identity, jurisdiction, retention, deletion,
  backups, hosting/subprocessors and operator access before real-user intake.
- Rendered RTL/bidi (`ECHO-503`/`ECHO-505`), locale metadata/SEO
  (`ECHO-506`) and full browser/keyboard/screen-reader/zoom acceptance remain
  open. No such acceptance is claimed here.

## Changed files

- `src/app/[locale]/(marketing)/page.tsx`
- `scripts/smoke-http.mjs`
- `tests/unit/claims.test.ts` (new)
- `docs/I18N-TERMINOLOGY.md`
- `docs/P5-ECHO-502.md` (this report)
- `docs/P5-ECHO-502-OWNER-REVIEW.md` (new)
- `ROADMAP.md`
