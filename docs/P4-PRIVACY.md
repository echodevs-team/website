# ECHO-406 — localized Privacy disclosure

Task: **ECHO-406 only** · Status: **PARTIAL acceptance; implementation delivered; policy blocker open**, 2026-11-12

## Behavior delivered

- Static `/fa/privacy`, `/en/privacy`, `/ar/privacy` with validated locale, inherited FA/AR RTL and EN LTR, localized title/description derived from the disclosure copy and the existing preview `noindex, nofollow`.
- Seven sections: intro/notice (`#privacy-intro`), data and purpose (`#privacy-data`), storage and access (`#privacy-storage`), temporary security/retry records (`#privacy-temporary`), retention/requests/backups (`#privacy-retention`), third parties/analytics/cookies (`#privacy-third-parties`) and status/updates (`#privacy-updates`).
- Copy is marked as a **working technical disclosure** with a **legal review pending** badge and an explicit notice that legal identity, jurisdiction, privacy contact, retention and legal basis are unapproved and real-user intake remains blocked. It does not present itself as a finalized legal notice.
- Implemented facts stated: inquiry fields and bounds; JSON-only 32 KiB endpoint with exact-origin check; transaction and commit-only success; insert-only application role; separate owner-approved readback/erasure capability groups; 24-hour replay metadata; 10-minute keyed network throttling with a 30-attempt global window; raw IP not stored in the inquiry row; no business retention or automatic purge; single-record erasure CLI with replay safeguard; local encrypted backups may outlive a live-row deletion; no analytics, advertising pixels, marketing cookies, social embeds or external notification provider; self-hosted WOFF2 fonts; `echo_theme` localStorage; `echo_locale` cookie read but not written by current code; no approved production host, proxy or log retention.
- Unresolved policy is recorded as unresolved: legal entity/controller, DPO or privacy contact, jurisdiction/legal basis, business retention period, request-verification process, named operators/access review, hosting/processor locations, backup custody and guaranteed deletion times. No compliance certification or deletion guarantee is claimed.

## Navigation and reachability

- A localized privacy link now appears inside the shared inquiry form above the fields, so both the homepage and Contact page expose it before any personal data is entered. The shared form, schema, validation, submission, API, idempotency and rate-limit behavior are unchanged; no consent checkbox was added.
- The shared footer bottom row links to `/${locale}/privacy` using the existing `Header.privacy` message key. Primary header navigation is unchanged.
- Locale switching on the page uses the existing `path` prop, yielding `/fa/privacy`, `/en/privacy` and `/ar/privacy`; mobile dialog/keyboard markup and theme controls are unchanged.

## Design and implementation decisions

Inputs: repository guidance, SCOPE, ROADMAP ECHO-406, DESIGN, ARCHITECTURE, INQUIRY-PRIVACY, INQUIRY-OPERATIONS, P2-A/B1/B2, P4-CONTACT and the original `code.html`.

The page reuses the approved section rhythm, eyebrow/badge hierarchy, Coral & Charcoal tokens, glass cards, technical icons, typography, fluid gutters and existing Header/Footer. `privacy.css` is narrow, mobile-first, uses logical properties and is imported by `globals.css`. No new dependency, design system, client page island, Canvas change, admin/CMS, analytics or notification service was added.

Content source was the actual implementation and documented data inventory, not assumptions: `db/migrations/001_inquiries.sql`, `002_network_limits.sql`, the inquiry handler/store/limits/network/client/validation modules, environment example, theme storage, locale cookie handling, font declarations and repository searches for logging/analytics/third-party scripts.

## Commands/tests actually run

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 192 tests / 21 files |
| `npm run build` | PASS: `/fa/privacy`, `/en/privacy` and `/ar/privacy` statically generated |
| `npm run test:http` | PASS: all three Privacy routes for locale/direction/metadata/sections/cards/locale-links/footer/no-form/no-invented-contact-or-compliance plus homepage/services/work/about/contact/theme/redirect/404 regressions; owned loopback server stopped |
| `npm run verify:reference` | PASS: original ZIP/HTML/screenshot/design hashes, CRCs and preserved prototype consistency |
| `git diff --check` | PASS |
| Browser launch | NOT RUN/available; no download or security change attempted |

PostgreSQL integration tests were not repeated: no schema, API, validation, persistence, idempotency or rate-limit contract changed.

Focused unit coverage includes copy parity and section counts, section order/headings and all card copy, badge/notice rendering, implemented-vs-unresolved policy assertions, localized footer/header reachability and language switching, absence of invented email/URL/phone/compliance claims, one `h1`, and the absence of a client page island with mobile-first logical CSS.

## Policy blocker

Public launch still requires owner and legal approval of at least: legal entity/controller identity, jurisdiction and legal bases, privacy contact and request-verification process, business retention and deletion times, operator identity/access review, hosting/logging/processor locations, and backup custody/reconciliation. Until those are approved, this page and `docs/INQUIRY-PRIVACY.md` remain the honest technical disclosure; `docs/DECISIONS.md` D6 stays open and live intake must not be enabled for real users.

## Files changed in this batch

- `src/app/[locale]/(marketing)/privacy/page.tsx` — localized server route and metadata
- `src/components/marketing/privacy-page.tsx` — disclosure sections, cards, notice and links
- `src/content/privacy.ts` — typed FA/EN/AR disclosure copy
- `src/styles/privacy.css`, `src/styles/globals.css` — narrow page styling and import
- `src/content/inquiry.ts`, `src/components/marketing/inquiry-form.tsx`, `src/styles/homepage.css` — localized privacy link before the fields
- `src/components/marketing/marketing-footer.tsx` — footer Privacy destination
- `tests/unit/privacy.test.tsx` — route component, copy, policy honesty, reachability and CSS coverage
- `tests/unit/inquiry-form.test.tsx`, `footer.test.tsx`, `homepage.test.tsx`, `services.test.tsx`, `work.test.tsx`, `work-details.test.tsx`, `about.test.tsx`, `contact.test.tsx` — privacy link and destination allowlists
- `scripts/smoke-http.mjs` — Privacy routes, content, links, no-form check and 404 checks
- `ROADMAP.md`, `docs/P4-PRIVACY.md` — evidence and acceptance gaps

## Outstanding acceptance and next task

No rendered screenshots, browser reference comparison, native keyboard/focus, screen-reader, 200% zoom or both-theme visual review occurred. Owner/native copy review is pending, and the policy blocker above prevents treating this as a final legal notice. These gaps keep ECHO-406 unchecked; static DOM/HTTP tests are not visual or legal acceptance and no release sign-off is implied.

Next recommended P4 task after ECHO-406 acceptance: **ECHO-407 link, asset and content evidence audit**, separately authorized. This batch stops at ECHO-406.
