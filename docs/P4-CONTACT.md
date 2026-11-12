# ECHO-405 — localized Contact page

Task: **ECHO-405 only** · Status: **PARTIAL acceptance; implementation delivered**, 2026-11-12

## Behavior delivered

- Static `/fa/contact`, `/en/contact`, `/ar/contact` with validated locale, inherited FA/AR RTL and EN LTR, unique localized title/description derived from approved copy and the existing preview `noindex, nofollow`.
- Three sections: intro, the inquiry block (`#contact-inquiry`) and next steps (`#contact-next`).
- Intro explains how to start a project conversation, provides context badges and links to the inquiry and the implemented services page.
- Guidance lists five inputs that make an initial request useful: problem/outcome, current context, scope signals, data/integrations and constraints. The wording asks for what is already known rather than a complete specification.
- The inquiry block renders the **single existing `InquiryForm`** inside the existing glass-card composition. No second form, validation, submission, client, API, schema, persistence, idempotency or rate-limit implementation was added. `InquiryForm` gained one optional `sourcePage` prop that defaults to `/${locale}`; the Contact page passes `/${locale}/contact`, which the existing validation already allowlists. Homepage behavior is unchanged and still sends `/${locale}`.
- Next steps are limited to confirmation/reference, context review and follow-up or a written scope. The page explicitly states that no public response-time guarantee is published; no SLA, availability window or response duration is invented.
- Public copy explains that success appears only after the inquiry is stored and that an unavailable service leaves the draft in the page while reporting unconfirmed storage. The developer-oriented `inquiryCopy.note` is not rendered; a public-facing equivalent (`contact.form.note`) is shown instead.
- Direct contact channels: none are published. A localized "Direct channels" note states that no public email, phone or social profile is published yet and that the project inquiry is the implemented path. This records the owner-content dependency without a fabricated address, handle, office or registration.
- Explore links reach implemented `/services`, `/work` and `/about` pages.

## Navigation and localization

- Header desktop/mobile/no-script navigation now treats Contact as a real destination with `aria-current="page"` on the Contact route. The Header "Start a project" CTA and the shared footer contact link now point to `/${locale}/contact`.
- Locale switching uses the existing `path` prop; `/fa/contact`, `/en/contact` and `/ar/contact` are equivalent links. Mobile dialog markup, focus lifecycle and theme controls are unchanged.
- Existing Services/Work/About inquiry CTAs still point to the localized homepage `#contact`; only the shared Header/Footer destinations changed.

## Design and implementation decisions

Inputs: repository guidance, SCOPE, ROADMAP ECHO-405, DESIGN, ARCHITECTURE, P2-B1/B2, P4-ABOUT and the original `code.html`.

The page extends the approved section rhythm, eyebrow/badge hierarchy, Coral & Charcoal tokens, glass cards, technical icons, typography, fluid gutters and existing Header/Footer. The inquiry panel reuses `.inquiry-composition`-adjacent form primitives without altering homepage styles. `contact.css` is narrow, mobile-first, uses logical properties and stacks before a 48rem split; it is imported by `globals.css`. No new dependency, design system, client page island, Canvas change, admin/CMS or notification service was added.

The Contact page stays honest about the opt-in inquiry API: it does not enable the API, does not claim a public launch and does not show success before a confirmed durable write. The existing 503 response maps to the locked "uncertain" guidance and retains the draft.

## Commands/tests actually run

| Check | Result |
| --- | --- |
| `npx vitest run tests/unit/contact.test.tsx` | PASS: 13 tests |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 183 tests / 20 files |
| `npm run build` | PASS: `/fa/contact`, `/en/contact` and `/ar/contact` statically generated |
| `npm run test:http` | PASS: all three Contact routes for locale/direction/metadata/sections/shared form/links/404 plus homepage/services/work/about/theme/redirect regressions; owned loopback server stopped |
| `npm run verify:reference` | PASS: original ZIP/HTML/screenshot/design hashes, CRCs and preserved prototype consistency |
| `git diff --check` | PASS |
| Browser launch | NOT RUN/available; no download or security change attempted |

PostgreSQL integration tests were not repeated: no schema, API, validation, persistence, idempotency or rate-limit contract changed.

Focused unit coverage includes copy parity, section order and headings, guidance/next-step/explore content, one shared form with accessible status semantics, the honest failure state and draft retention on 503, Contact source-page submission, localized navigation/current state/locale switching, no fabricated channels/claims and mobile-first logical CSS.

## Files changed in this batch

- `src/app/[locale]/(marketing)/contact/page.tsx` — localized server route and metadata
- `src/components/marketing/contact-page.tsx` — contact sections, navigation links and shared form composition
- `src/content/contact.ts` — typed FA/EN/AR copy and unverified-channel note
- `src/components/marketing/inquiry-form.tsx` — optional `sourcePage` prop, default unchanged
- `src/styles/contact.css`, `src/styles/globals.css` — narrow page styling and import
- `src/components/layout/header.tsx`, `src/components/marketing/marketing-footer.tsx` — Contact destinations and current state
- `tests/unit/contact.test.tsx` — route component, copy, form reuse, failure state and CSS coverage
- `tests/unit/inquiry-form.test.tsx`, `header.test.tsx`, `footer.test.tsx`, `homepage.test.tsx`, `services.test.tsx`, `work.test.tsx`, `work-details.test.tsx`, `about.test.tsx` — source-page and Contact-aware destination allowlists
- `scripts/smoke-http.mjs` — Contact routes, shared form, links and 404 checks
- `ROADMAP.md`, `docs/P4-CONTACT.md` — evidence and acceptance gaps

## Outstanding acceptance and next task

No rendered screenshots, browser reference comparison, native keyboard/focus, screen-reader, 200% zoom or both-theme visual review occurred. Owner/native copy review is pending, especially the guidance wording and the explicit "no public channel published yet" statement. A real public email/phone/social channel remains an owner dependency; when supplied and verified, it can be added to the Contact page and the guidance note replaced. These browser/native checks keep ECHO-405 unchecked; static DOM/HTTP tests are not visual acceptance and no release sign-off is implied.

Next recommended P4 task after ECHO-405 acceptance: **ECHO-406 `/privacy`**, separately authorized. This batch stops at ECHO-405.
