# ECHO-401 — localized services page

Task: **ECHO-401 only**  
Status: **PARTIAL acceptance; implementation delivered**, 2026-11-08

## Behavior delivered

- Static `/fa/services`, `/en/services`, `/ar/services`, validated locale, inherited FA/AR RTL and EN LTR, unique localized title/description. Preview `noindex, nofollow` retained; no guessed production origin/canonical.
- Three scope-aligned pillars: digital products, software systems, intelligent operations. Each has an outcome-first introduction, four nested sub-services with scope descriptions, possible deliverables, a visibly illustrative (not completed client work) example, exclusions and a named inquiry CTA.
- Includes business websites, web apps/SaaS, mobile discovery, UI/UX, backend, APIs/service boundaries, integrations, data engineering, AI/workflow automation, chatbots, knowledge assistants and document/model integrations. Mobile is explicitly **discovery/feasibility**, not an unsupported native-delivery claim; microservices require justification. No customer history, credentials, operating statistics, certification or guarantees invented.
- Every pillar CTA reaches the existing localized homepage `#contact`; no new form, source-page contract or persistence changes. No query-string drafts or new data collection.
- Header desktop/mobile/no-script services links and footer services link reach the new page. Language switching preserves `/services`; unbuilt work/about/contact/privacy routes are not linked. Homepage service details now include links to corresponding services sections, without replacing existing cards or inquiry CTAs.

## Design and implementation decisions

Inputs: repository guidance, SCOPE/ROADMAP/DESIGN, architecture and P3 report, current components/styles, original `code.html`, immutable `design/reference/code.html` services/footer composition and supplied 442×1600 screenshot.

The new page extends the approved Coral & Charcoal section rhythm, eyebrow/badge hierarchy, technical icons, glass card treatment, radii, locally hosted typography, theme tokens and fluid container gutters. Shared header/theme/mobile navigation remain intact. Footer markup was extracted from the homepage into `MarketingFooter` so both pages use the same reference-style composition, not competing shells. The homepage otherwise retains all six sections, artwork and inquiry presentation.

Long-form scopes use paired cards per pillar instead of squeezing full descriptions into the homepage's three-column overview. Cards stack by default and split at 48rem using `minmax(0, 1fr)`; logical properties, wrapping jump links and no fixed content heights support RTL and narrow screens. This is an implementation intention and static structural evidence, **not a rendered responsive result**. All service content is visible server-rendered HTML; native anchors and headings require no added client island or dependency.

Content is conservative proposed scope, not evidence of prior delivery. Examples are explicitly hypothetical. Owner/native-language review is still required for final publishable copy. Existing contact-channel limitations remain visible. No new policy/business decision or architecture expansion.

## Commands/tests actually run

| Check | Result |
| --- | --- |
| Focused services/homepage/header Vitest | Initial 25 pass / 1 fail: CSS test regex mistook `min-width` breakpoint for width declaration. Corrected test to match declaration boundaries; full subsequent run passes. |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 116 tests, 11 files; includes content parity, complete pillar content, anchors, shared shell, form and header regressions, mobile-first CSS assertions |
| `npm run build` | PASS: services routes statically generated in all three locales |
| `npm run test:http` | PASS: production locale/direction/metadata/route/404 checks, services discoverability, homepage/theme checks, preview API fail-closed; owned loopback server stopped |
| `node scripts/test-inquiries.mjs --http` | PASS: 40 tests, 4 files; disposable PostgreSQL including form-to-handler fixtures, real production API commit/readback/replay/failure and operator regressions; DB log privacy check passed; test cluster stopped and removed |
| Available Playwright sandbox-enabled Chromium launch | BLOCKED: executable missing; no browser installed/downloaded |

The build-generated `next-env.d.ts` rewrite was restored to its exact pre-task contents. An initial content patch lacked its required envelope and was rejected without writing; the corrected patch succeeded. Existing staged/unstaged/untracked work was preserved; no staging, commits, tags, pushes or deployment.

## Files changed in this batch

- `src/app/[locale]/(marketing)/services/page.tsx` — localized server route and metadata
- `src/components/marketing/services-page.tsx` — service sections
- `src/content/services.ts` — typed FA/EN/AR content
- `src/components/marketing/marketing-footer.tsx` — extracted shared footer
- `src/components/marketing/homepage.tsx` — footer reuse and service detail links only
- `src/components/layout/header.tsx` — services destination/current-page state
- `src/styles/services.css`, `src/styles/globals.css` — narrow extension/import
- `tests/unit/services.test.tsx` — content, structural and destination coverage
- `tests/unit/header.test.tsx`, `tests/unit/homepage.test.tsx` — real-page link expectations
- `scripts/smoke-http.mjs` — localized production route/metadata checks
- `ROADMAP.md`, `docs/P4-SERVICES.md` — current evidence and acceptance gaps

## Outstanding acceptance and next task

No rendered implementation screenshots, reference comparison, native tab order, screen reader, zoom, theme contrast sampling or mobile interaction audit occurred. Need actual 320/375/768/1024/1440px screenshots, both themes/all locales and 200% zoom; owner/native copy review. Static DOM/HTTP/DB fixtures do not close these browser gates. ECHO-401 remains unchecked and release is not authorized.

Next recommended batch: **ECHO-402**, simplest truthful grouped work list, only after separate authorization. No further P4 task was started.

Suggested human commit: `feat(ECHO-401): add trilingual services page`
