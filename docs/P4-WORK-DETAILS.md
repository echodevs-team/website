# ECHO-403 — localized concept details

Task: **ECHO-403 only**  
Status: **PARTIAL acceptance; implementation delivered**, 2026-11-10

## Delivered scope and truth boundaries

Nine statically rendered routes: `/{fa,en,ar}/work/{analytics,chat,booking}`.
These extend the three existing homepage studies, not a new fictional portfolio:

- **Analytics:** fragmented reporting needs; proposed source definitions, filters, access and reporting workflow. No connected data, exports, refresh jobs or measured improvement.
- **Knowledge-based support assistant:** scattered guidance; proposed source-linked retrieval, uncertainty and human handoff. No model, retrieval index, support integration, accuracy or availability guarantee.
- **Healthcare booking portal:** clear appointment request/confirmation journey; proposed selection, availability states and scoped reminders. No actual booking, messages, payment, clinical advice, medical records or compliance claim.

Every detail includes title, visible concept/static-preview classification, problem, proposed solution/capabilities, an ordered illustrative workflow, the existing static visual with an explicit caption, scope/limitations, an honest contribution description, possible stack choices, related implemented service sections and the existing homepage inquiry CTA. Back links and named listing links make the index/detail relationship explicit. Shared Header, Footer and theme controls remain; locale links retain the same stable slug, including no-script navigation. Unknown slugs and extra path segments return actual localized HTTP 404s. Invalid locales remain rejected.

Verified implementation facts are limited to the static interface illustrations and these editorial pages. **No delivered product, client engagement, deployment, result, customer, testimonial, live demo or repository proof is claimed.** Absent verified results are omitted rather than given a fictional result section. Technology tags remain explicitly possible choices, not an implemented stack. Owner/native review of the proposed copy remains necessary; no publication permission for real cases is inferred. Client/internal empty states are unchanged.

## Design mapping and decisions

Read AGENTS/SCOPE/ROADMAP/DESIGN, architecture/P4 Work report, existing Work/services/home/localization modules, original and frozen HTML concept sections and reference notes. The original has no detail-page layout: use its existing warm Coral & Charcoal sections, glass cards, badge/stack treatments, typography, button styles and responsive grid rather than inventing a visual direction. Reuse ECHO-401 detail cards for text groups. The three illustrations were extracted unchanged into one server component shared with the homepage; homepage layout/content/interactions are unchanged. No new artwork, assets, dependency, client island, CMS, backend or schema. Inquiry implementation untouched; CTAs point to `/{locale}#contact` without sending content or changing the form contract. Localized metadata inherits the existing preview noindex policy; no origin/domain is guessed.

Numbers in the workflow express order only, not evidence or performance. Graph bars and sample messages are clearly captioned as illustrations, not production screenshots or active controls. CSS uses existing tokens, logical sizing/spacing, wrapping links and mobile-first grids; actual rendered layout is not established by source inspection.

## Actual verification

| Command/check | Result |
| --- | --- |
| `npx vitest run tests/unit/work-details.test.tsx tests/unit/work.test.tsx tests/unit/homepage.test.tsx` | PASS: 16 tests / 3 files |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 125 tests / 13 files |
| `npm run build` | PASS: nine concept details prerendered, existing routes retained |
| `npm run test:http` | PASS: all nine detail routes; localized lang/dir/title/metadata, sections, illustration, shared shell and same-slug locale links; all detail link destinations/fragment targets reachable; localized unknown/prototype-name/extra-segment 404s and invalid locale; homepage/services/list/theme/redirect/reference-non-exposure/disabled-preview API regressions. Owned loopback server stopped. |
| `npm run verify:reference` | PASS: archive/member SHA-256, CRCs, original/frozen/root copies, supplied PNG dimensions |
| `git diff --check` | PASS |

No PostgreSQL integration tests: DB/API/inquiry behavior and contracts are unchanged. HTTP fixtures check fail-closed preview behavior, not persistence. No browser was launched or downloaded; no screenshots, native keyboard, screen-reader, contrast-over-rendered-surfaces, responsive or zoom result claimed. Existing `globalNotFound` experiment remains unchanged. Build-generated `next-env.d.ts` paths restored to their pre-task contents. Existing staged/unstaged/untracked work preserved; no stage, commit, tag, push or deployment.

## Files changed for ECHO-403 only

- `src/app/[locale]/(marketing)/work/[slug]/page.tsx` (new)
- `src/content/work-details.ts` (new typed FA/EN/AR proposals, safe lookup and related services)
- `src/components/marketing/work-detail-page.tsx` (new shared template)
- `src/components/marketing/concept-visual.tsx` (new extracted unchanged illustration)
- `src/components/marketing/homepage.tsx` (use extracted illustration only)
- `src/components/marketing/work-page.tsx` (named detail links)
- `src/styles/work.css` (narrow detail layout extension)
- `tests/unit/work-details.test.tsx` (new content/DOM/navigation tests)
- `tests/unit/work.test.tsx` (allow implemented detail destinations)
- `scripts/smoke-http.mjs` (detail/links/localized 404 coverage)
- `ROADMAP.md`, `docs/P4-WORK-DETAILS.md` (evidence)

## Remaining acceptance / next task

Keep ECHO-403 unchecked until actual browser responsive/theme/reference comparison at 320/375/768/1024/1440px, keyboard/focus/mobile navigation, 200% zoom and screen-reader checks exist. Owner/native-language copy review remains pending. Real case studies still require verified facts/assets/publication permission; their absence is not filled with invented content.

Stop after ECHO-403. Next recommended P4 task: **ECHO-404**, subject to approved identity facts; no fictional profiles. Suggested human commit: `feat(ECHO-403): add trilingual concept detail pages`.
