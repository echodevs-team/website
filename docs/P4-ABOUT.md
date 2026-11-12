# ECHO-404 — localized About / Team page

Task: **ECHO-404 only** · Status: **PARTIAL acceptance; implementation delivered**, 2026-11-12

## Behavior delivered

- Static `/fa/about`, `/en/about`, `/ar/about` with validated locale, inherited FA/AR RTL and EN LTR, unique localized title/description and the existing preview `noindex, nofollow`.
- Seven content sections: intro, collective team identity, capabilities, working principles, requirement discovery, four-stage delivery path and client collaboration, followed by a next-step panel.
- Team identity stays collective. The page explains how work is approached, not who individuals are. Individual names, biographies, photographs and public profiles are explicitly not published; founding date, office address, registration number and delivery statistics are explicitly not stated because they are not verified. This records the owner-content dependency without fabricating people or company facts.
- Capabilities summarize product/interface design, web application engineering, APIs/data/integrations and practical AI, each linking to the matching implemented services anchor. The page does not reproduce the complete services scope.
- Discovery lists the questions used to understand a requirement plus the written scope, acceptance criteria, milestones and exclusions a client receives before committing.
- Delivery is a four-stage engagement path centred on review: first conversation, written scope and estimate, reviewable increments, handoff and next steps. It is intentionally shorter and client-review-oriented rather than a copy of the homepage's six-step process section.
- Collaboration covers a shared decision record, defined review points and clear handoff ownership. No response time, availability, SLA or guaranteed result is claimed.
- Intro and final panel link to implemented `/services`, `/work` and the existing localized homepage `#contact` inquiry. No second form, API, database or source-page contract was added.
- Header desktop/mobile/no-script navigation now treats About as a real destination with current-page state; the shared footer adds About in its status row. Locale switching preserves `/about` via the existing `path` prop. Contact/privacy remain unlinked/404.

## Design and implementation decisions

Inputs: repository guidance, SCOPE §4.2 and route table, ROADMAP, DESIGN, ARCHITECTURE, original `code.html`, existing homepage/services/work components and styles.

The page extends the approved section rhythm, eyebrow/badge hierarchy, Coral & Charcoal tokens, glass card treatment, technical icon accents, local Vazirmatn typography, fluid gutters and existing Header/Footer. No design-system expansion, new runtime dependency or client island was added. `about.css` uses logical properties and stacked cards that split at 48rem using `minmax(0, 1fr)`; `about.css` is imported by `globals.css`. Alternating bands reuse `.home-band`, and delivery cards reuse `.process-card` with a new `.about-path` list.

The only shared-shell edits are the About destination in the Header and an About link in the footer's bottom row, plus a small `.footer-bottom-links` row. Existing pages and their visual composition are unchanged.

Content is a conservative description of approach and capability, not evidence of prior client outcomes. Native-language and owner copy review remains outstanding, as does rendered visual acceptance.

## Commands/tests actually run

| Check | Result |
| --- | --- |
| Focused About/Header/Footer/Homepage/Services/Work Vitest | PASS: 45 tests / 6 files after removing one jsdom-inappropriate no-script assertion from the client-mounted Header test |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 169 tests / 19 files; one initial full-suite failure in the ECHO-403 link allowlist was corrected to include `/about` |
| `npm run build` | PASS: `/fa/about`, `/en/about` and `/ar/about` statically generated |
| `npm run test:http` | PASS: production locale/direction/metadata/section/link/404 checks for all three About routes plus homepage/services/work/theme regressions; owned loopback server stopped |
| `npm run verify:reference` | PASS: original ZIP/HTML/screenshot/design hashes, CRCs and preserved prototype consistency |
| `git diff --check` | PASS |
| Browser launch | NOT RUN/available; no download or security change attempted |

PostgreSQL integration tests were not repeated: no database, API, validation or inquiry contract changed.

## Files changed in this batch

- `src/app/[locale]/(marketing)/about/page.tsx` — localized server route and metadata
- `src/components/marketing/about-page.tsx` — about sections and links
- `src/content/about.ts` — typed FA/EN/AR copy
- `src/styles/about.css` — narrow page styling
- `src/styles/globals.css` — import
- `src/components/layout/header.tsx` — About destination and current state
- `src/components/marketing/marketing-footer.tsx`, `src/styles/homepage.css` — footer About destination and status row
- `tests/unit/about.test.tsx` — content parity, structure, links, shell and CSS coverage
- `tests/unit/header.test.tsx`, `footer.test.tsx`, `homepage.test.tsx`, `services.test.tsx`, `work.test.tsx`, `work-details.test.tsx` — About-aware destination allowlists/current-state check
- `scripts/smoke-http.mjs` — About route and 404 checks
- `ROADMAP.md`, `docs/P4-ABOUT.md` — evidence and acceptance gaps

## Outstanding acceptance and next task

No rendered screenshots, browser reference comparison, native keyboard/focus, screen-reader, 200% zoom or both-theme visual review occurred. Owner/native copy review is also pending, particularly the collective-identity wording and the explicit "not published yet" statements. These browser/native checks keep ECHO-404 unchecked; static DOM/HTTP tests are not visual acceptance and no release sign-off is implied.

Next recommended batch after ECHO-404 acceptance: **ECHO-405 `/contact`**, separately authorized. This batch stops at ECHO-404.
