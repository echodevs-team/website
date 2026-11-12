# ECHO-402 — localized grouped work list

Task: **ECHO-402 only**  
Status: **PARTIAL acceptance; implementation delivered**, 2026-11-08

## Behavior delivered

- Static `/fa/work`, `/en/work`, `/ar/work` using the existing validated locale route, metadata and RTL/LTR patterns. Localized title/description; inherited preview `noindex, nofollow` remains. No guessed production origin.
- Simplest accessible grouped list, with native category jump links. Client and internal groups have honest localized empty states: no approved, documented items are currently available. No invented customer, internal experiment, testimonial, result or repository fills these groups.
- Three existing homepage interface studies reused as concepts: analytics dashboard, knowledge-based support assistant and healthcare booking portal. Each has a visible **Concept / static preview** badge, localized title/summary and a named inquiry link. Technology tags are explicitly **possible implementation choices**, not proof of a working stack. No live/source/results links are fabricated.
- Inquiry CTAs reach the existing localized homepage `#contact`; the preview link reaches the existing `#demos` visuals and explicitly calls them static. No `/work/[slug]` route or detail link is added: that is ECHO-403, not this task. Unknown nested work URLs still return localized 404s.
- Existing desktop/mobile/no-script header and shared footer expose `/work`. Language links retain `/work`, with current-page indication. Existing homepage section anchors, hero CTAs, cards, services page and inquiry logic remain unchanged.

## Design mapping and boundaries

Inputs read: AGENTS/SCOPE/ROADMAP/DESIGN, architecture/P3/P4 services reports, original and immutable reference HTML concept composition, current routes/content/styles/components/tests. Existing ECHO-401 and staged/unstaged work were preserved.

The list extends the reference Coral & Charcoal language using existing section rhythm, glass surfaces, badges, card radii/shadows, stack chips, fluid headings, locally hosted font and shared Header/Footer/theme controls. It uses the existing mobile-first three-column grid, logical CSS and wrapping native links. It is a text-first work index, not a duplicated gallery or homepage redesign; the original static concept visuals remain available at their existing destination. No new component framework, dependencies, JavaScript island, filtering state, external asset or service was needed.

The two empty groups are intentional truth states, not disabled controls or fake projects. Owner/native-language review is required before publication; verified client/internal records, assets and publication permission can replace them when available. Missing marketing proof did not block structural implementation. No business fact approval, deployment or policy change is implied.

## Commands/tests actually executed

| Check | Result |
| --- | --- |
| Focused work/header/homepage/services unit tests | Initial 28 PASS / 3 FAIL: jsdom treats `noscript` content as text with scripting enabled. Replaced the inappropriate descendant query with a markup assertion; subsequent full suite passes. |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS: **121 tests / 12 files**, including five new work tests covering parity, honest groups/badges, headings, IDs, destinations, equivalent locale links, shared navigation and static layout constraints |
| `npm run build` | PASS: all three work routes statically generated; existing `globalNotFound` experiment unchanged |
| `npm run test:http` | PASS: all locale work titles/metadata/direction/groups/concepts/links; homepage/services/theme/redirect regressions; unknown locale/nested-work 404s; reference non-exposure and disabled-preview API behavior. Owned loopback server stopped. |
| `npm run verify:reference` | PASS: original ZIP/member SHA-256, CRC, copy consistency and PNG dimensions; originals unchanged |
| `git diff --check` | PASS |

Database integration was **not run**: no DB/API/shared inquiry contracts changed, and ECHO-402 requires no persistence behavior. Existing inquiry unit regressions and fail-closed preview HTTP checks passed; this is not a claim of a newly executed database or browser integration test.

The build-generated `next-env.d.ts` import changes were restored to their pre-task contents. No staging, commits, tags, pushes, deployment, downloads or VM/host configuration changes.

## Changed files (this task only)

- `src/app/[locale]/(marketing)/work/page.tsx`
- `src/components/marketing/work-page.tsx`
- `src/content/work.ts`
- `src/styles/work.css`, `src/styles/globals.css` (import only)
- `src/components/layout/header.tsx`, `src/components/marketing/marketing-footer.tsx` (implemented work links/current-page state)
- `tests/unit/work.test.tsx`
- `tests/unit/header.test.tsx`, `tests/unit/homepage.test.tsx`, `tests/unit/services.test.tsx` (allow implemented work links)
- `scripts/smoke-http.mjs`
- `ROADMAP.md`, `docs/P4-WORK.md`

## Outstanding acceptance / next task

No browser was launched or downloaded. Known unavailable-browser acceptance stays open: actual 320/375/768/1024/1440px, both themes/all locales, keyboard/focus/mobile menu, screen-reader, contrast sampling and 200% zoom/reflow checks. Static DOM/CSS assertions do not prove these. Owner/native-language copy review and any real portfolio publication approvals remain outstanding. ECHO-402 stays unchecked; no release sign-off.

Next recommended P4 task: **ECHO-403**, only after separate authorization, with truthful concept detail and absent proof omitted. Not started.

Suggested human commit: `feat(ECHO-402): add trilingual grouped work list`
