# ECHO-301–307 — homepage implementation

## Status

Implementation delivered for this batch; **acceptance PARTIAL**. No browser-rendered fidelity, mobile, keyboard or zoom acceptance is implied. ECHO-306 remains partial until P2 durably persists inquiries. No P2 implementation started.

Inputs inspected: `SCOPE.md`, `ROADMAP.md`, `DESIGN.md`, original `code.html`, immutable reference copies, supplied **442×1600** screenshot and existing application/styles/tests. The screenshot depicts a scaled desktop composition; it is not mobile acceptance evidence. Existing owner edits in guidance/docs were preserved.

## Reference → implementation

| Task | Source composition retained | Implementation / remaining evidence |
|---|---|---|
| ECHO-301 | Large right-aligned FA hero, badge, lead, paired CTAs; opposing technical runtime card; four-item capability strip | `Hero` in `homepage.tsx`; hero anchors to `#contact` and `#demos`; localized positioning, no invented results. Actual first-screen fidelity pending. |
| ECHO-302 | Three pillar cards, icon/badge, description, sub-service lists, bottom action row | `Services`; 12 visible sub-services; native keyboard-operable `details/summary` opens genuine scope detail in each card, rather than misleadingly linking “details” to unrelated demos. Rendered responsive/keyboard QA pending. |
| ECHO-303 | Three demo cards with inset analytics/chat/booking previews, badges, stack chips and bottom CTA | `Concepts`; typed `client/internal/concept` classification, all current entries explicitly **concept/static preview**. No “live” demo or deployed-client claim. Destination is the actual unavailable inquiry area. Visual QA pending. |
| ECHO-304 | Four benefits cards with technical icons and captions | `BenefitsAndProcess`; unsupported historical/operational claims replaced by explicitly proposed collaboration checkpoints. No ROI, delivery, SLA or response-time guarantee. Owner copy review and rendered QA pending. |
| ECHO-305 | Six numbered cards in a three-column desktop/two-column intermediate/single-column narrow layout | Ordered list, localized numbers, retained technical stage labels; realistic scope, design, development, QA and handoff copy. Actual device reading/reflow pending. |
| ECHO-306 | Header/section links, two-column inquiry composition with inset form, three-column footer, desktop section rail | Reuses existing theme and dialog/menu behavior. Original SVG brand mark restored. One canonical `InquiryForm`; explicit localized unavailability notice, disabled fieldset and all controls, non-submit disabled button, no payload names, action, handler or success state. **Persistence and conversion acceptance deferred to ECHO-205/P2.** |
| ECHO-307 | Orbital rings, particle/connection motif, code icon/runtime panel, scan beam, glass surfaces, CTA hover lift | Deterministic static SVG network and static rings/scan fallback; no canvas/RAF, scroll listeners, timers or continuous animations. Hover lift/smooth scroll only under `prefers-reduced-motion: no-preference`. No animation-dependent content; rendered/performance acceptance pending. |

## Necessary deviations (not a redesign)

- Existing accessible action/text/focus tokens replace failing white-on-light-coral small text. Coral remains on decorative accents, mark, chart and technical artwork. Glass surfaces mix with existing theme roles; no new runtime styling framework.
- Locally hosted licensed Vazirmatn and system monospace replace redundant external font providers/incorrect IRANSans alias. Inline SVG replaces icon-font requests; original brand SVG geometry is retained. No new dependencies or external assets.
- Static fallback for original unbounded decorative motion; artwork remains technical, not substitute illustration. Runtime status reads `CONCEPT`, not a claim of operational availability. Charts/conversations/booking explicitly illustrative; fabricated throughput, latency, certifications and zero-error claims removed.
- A stable sticky header replaces scroll/hover resizing; existing native theme select and accessible mobile dialog retained. Homepage anchors replace planned/unbuilt-page links; no about/privacy page is invented. No-script users get ordinary section/locale links.
- Generic/unverified contact addresses/social profiles are omitted and explained, including in footer. Benefits are proposed process expectations, not past-client evidence.
- Inquiry is visibly unavailable and cannot collect input; budget is no longer conflated with timeline. Final email/phone/budget fields, validation, enums, errors and persistence belong to the single canonical form's P2 implementation.
- Mobile CTAs stack, form/grid columns collapse, runtime frame has a minimum height for localized text, and section headings use fluid sizing. These are intended responsive adaptations, **not demonstrated browser results**.
- Existing preview `noindex` metadata remains. This batch does not authorize release, policies or new routes.

## Verification actually executed

- Focused initial homepage/header tests: **21 PASS**.
- Post-review focused homepage/header/token tests: **33 PASS**, including modeled glass contrast. This is sRGB compositing approximation, not sampled rendered pixels.
- Final `npm run lint`: **PASS**.
- Final `npm run typecheck`: **PASS**.
- Final `npm test`: **55 PASS / 6 files**.
- Final `npm run build`: **PASS**, static `/fa`, `/en`, `/ar`; existing experimental `globalNotFound` flag remains.
- Final `npm run test:http`: **PASS**. Owned temporary loopback production server stopped. Checks localized hero, `lang/dir`, all six sections, three concept labels, disabled fieldset/no fake success, locale links, redirects, 404s, theme initialization and reference non-exposure.
- `npm run verify:reference`: **PASS**, ZIP/member hashes, CRC, HTML-copy consistency and image dimensions. Reference originals unchanged.
- `git diff --check`: **PASS**; no staging, commits, tags or pushes. Framework-generated `next-env.d.ts` route-import rewrite restored to its pre-batch contents.

An initial tool patch was rejected before writing (missing patch envelope); corrected invocation succeeded. No failed implementation test is hidden. Full boundary checks were repeated after review restored the exact reference mark and added surface-contrast coverage.

## Browser / release gaps

No `chromium`, `chromium-browser`, `google-chrome` or `firefox` executable was found. No browser download/install, screenshot capture, native dialog/tab/inert test, screen reader, axe, Lighthouse or pixel comparison was performed. DOM fixtures and breakpoint declarations do not establish 320px usability. Keep ECHO-003/109/308 and existing shell browser acceptance open.

Required follow-up: actual reference/implementation comparison at 320/375/768/1024/1440px, both themes, FA/EN/AR, reduced motion, keyboard and 200% zoom; native-language copy/shaping review. No production/performance sign-off.

## Files / next task

- `src/app/[locale]/(marketing)/page.tsx`
- `src/components/layout/{header,brand-mark}.tsx`
- `src/components/marketing/{homepage,inquiry-form,technical-backdrop}.tsx`
- `src/content/home.ts`
- `src/styles/{globals,homepage}.css`
- `tests/unit/{homepage,header,tokens}.test.ts(x)`
- `scripts/smoke-http.mjs`, `ROADMAP.md`, this report

Ready for the **next separately authorized batch ECHO-201/202/203**, then ECHO-204–210. Reuse/wire `InquiryForm` under ECHO-205; success must follow confirmed PostgreSQL commit only. D5/D6 and public contact/hosting decisions still gate operations/release. Stop here; no database/API/CMS/admin/unrelated pages/deployment implemented.

Suggested human commit: `feat(ECHO-301): reconstruct approved trilingual homepage`
