# Consolidated marketing UI/UX review — 2026-11-10

**Status: PARTIAL review / BLOCKED browser acceptance.** Scope: ECHO-003, 105/107/108, 301–307, 401–403 (also informs 109/308). No redesign, new pages or backend changes. Existing work/staging preserved.

## Results and evidence

| Area | Result | Evidence / boundary |
| --- | --- | --- |
| Approved reference | PASS integrity; BLOCKED browser baseline | Original ZIP/member hashes/CRCs and frozen/root HTML consistency pass. Supplied `design/reference/original/screen.png` inspected at 442×1600: a scaled desktop composition, **not evidence of a 442px mobile viewport**. No new reference capture. |
| Homepage fidelity | BLOCKED rendered acceptance | Source retains six sections, hero/runtime panel, capability strip, three service/concept cards, benefits, process, inquiry and footer. Source-level differences below; no implementation pixels available for comparison. |
| Services hierarchy | PASS structural; BLOCKED visual | Localized H1, three pillars, nested scopes/deliverables/examples/exclusions and per-pillar inquiry CTAs; DOM and HTTP coverage pass. |
| Work listing/details | PASS content/navigation; FAIL → fixed numbering | Honest empty client/internal groups, concept labels, nine detail routes, limitations and omitted results. HTTP destinations/anchors and localized unknown-slug 404s pass. Workflow marker reset fixed below. |
| FA/EN/AR | PASS structural; BLOCKED native typography | Localized content/labels and FA/AR RTL, EN LTR verified in fixtures/HTTP. Shaping, reading quality, mixed-script wrapping and native-language approval require owner/browser review. |
| 320/375/768/1024/1440px and 200% zoom | BLOCKED | Responsive CSS is not rendered evidence. No overflow, clipping, touch-target or zoom pass claimed. |
| Theme | PASS controller fixtures; BLOCKED browser | Light/Dark/System, stored override, OS/storage events and rendered pre-body initializer covered by tests. Actual persistence across Firefox navigations, first-paint flash and native select rendering unverified. |
| Header/dialog/keyboard | PASS lifecycle fixtures; BLOCKED native interaction | Open/close/Escape, focus calls, scroll-lock cleanup and hydration fixture pass. jsdom dialog APIs are doubles: native focus containment/inertness, scroll and visible focus remain unverified. |
| Inquiry states | PASS synthetic DOM fixtures; BLOCKED browser | Validation/summary focus, confirmed response announcement, retained draft, uncertainty and retry delay covered without real customer data. No browser-to-DB submission performed. Default preview API is disabled. |
| Console/hydration | BLOCKED browser | Header hydration fixture passes; no Firefox console session exists. No claim that the live site is console-error-free. |

### Confirmed defect and limited fix

**UX-01 — Low severity, ECHO-403: ordered workflow markers suppressed.** `node_modules/tailwindcss/preflight.css:202–205` sets `ol, ul, menu { list-style: none; }`. `src/styles/work.css` restored `display: list-item` and styled `::marker`, but never restored a marker type. Thus the intended ordered visual cue had no marker. Added scoped `list-style-type: decimal` and used `--color-action` for numeric text instead of decorative coral (the approved light coral/white pair is only 2.83:1). No list content, ordering, layout redesign or inquiry contract changed.

New regression test initially **FAIL** (4 other detail tests passed), then passes after the fix. This is CSS/source evidence, **not a before/after screenshot**; Firefox RTL marker placement/visibility is still pending. No other product defect is asserted as confirmed without browser evidence.

### Source-observed differences from the prototype

These are not measured visual deltas or fresh owner sign-off:

- Header is stable/sticky, not scroll/hover-resizing; mobile navigation starts below 80rem. Original desktop navigation starts at its `lg` breakpoint. Current wordmark omits the original Persian secondary name/subtitle; the labeled native theme select replaces the compact icon toggle. Compare header proportions at 1024/1440 and narrow/zoom widths before proposing changes. Do not redesign it on source evidence alone.
- Licensed local Vazirmatn and SVG icons replace external font/icon providers; accessible darker light-theme action text/fill replaces white-on-coral. Rendered font weight, shaping, line breaks and glass contrast remain pending.
- Technical artwork now uses the reference neural canvas with a bounded lifecycle and a static SVG fallback for reduced motion, compact/coarse-pointer devices and no-JS; orbit/scan remain static, and no operational “ONLINE” claim exists. Confirm reference character, text contrast and frame cost in a browser; local lifecycle tests are not visual/performance acceptance.
- Unsupported statistics, certifications, fake contact channels and client outcomes are removed; concepts and proposed process are explicit. The inquiry now has separate contact fields and real validation rather than prototype fake success. These intentional safety/truthfulness changes must not be reverted to imitate the screenshot.
- Batch 3 restored the reference glass base/blur with an opaque fallback, discrete hero scale, eyebrow dots, per-concept badge accents/preview density, inquiry proportions and the dark right-side rail pill. Modeled contrast passes, but rendered `backdrop-filter` contrast, rail overlap at 1024px, FA/AR shaping, reduced-motion hover and nested Services/Work glass remain browser checks; see `docs/BATCH3-VISUAL-DETAILS.md`.
- Services/work/details have no supplied separate page mockups. Review them for consistency with the existing section/card language, not invented pixel parity with nonexistent reference pages.

## Browser access and owner-side acceptance packet

`command -v firefox chromium chromium-browser google-chrome` found no executable. Known temporary Playwright browser storage contains no browser binary. This session exposes no remote browser control for Fedora Firefox. No launch retry, download, SSH configuration/credential access, host access, firewall change or security workaround was attempted.

Use **owner-operated Fedora Firefox through existing localhost-only forwarding**, not a public share URL. For a current production preview, run `npm run start` in the VM (loopback 3000, build verified below); stop with Ctrl-C afterwards. If needed, serve only the frozen reference directory with `python3 -m http.server 8765 --bind 127.0.0.1 --directory design/reference`, through an already available owner-managed forward; stop afterwards. Do not serve the repository root or expose listeners externally. Original HTML requests third-party CDN/font assets: record load failures, never submit its fake form or follow its unverified contact links.

### Manual checks and required evidence

1. **Coverage log:** test `/fa`, `/en`, `/ar` and each locale's `/services`, `/work`, `/work/analytics`, `/work/chat`, `/work/booking` at **320, 375, 768, 1024, 1440 CSS px**, Light and Dark. Record route, viewport, theme, browser/version, zoom, result and evidence filename. Any untested combinations remain pending. Check no horizontal page scrolling, clipped cards/text, overlapping rail/header, hidden CTA or unusable wrapping. Read all three languages with a native reviewer.
2. **Fidelity captures:** matching original/implementation FA full-page and first-viewport pairs at 1440×1000 and 375×812 in both themes; original baseline captures at other required widths too. Wait for fonts; use identical viewport/scale/theme and record unavailable original assets. Keep motion-enabled original captures distinguishable from any owner-disabled-animation capture. The supplied 442×1600 PNG is a supplement, not a matching-viewport screenshot.
3. **Implementation captures:** full pages for each locale's homepage, services, work and one detail at 320 and 1440 in both themes; capture all three details at least once per locale. At 375/768/1024 retain screenshots of any differing breakpoint behavior or defect, with a coverage-log result even if no screenshot is needed. Capture the corrected workflow markers in FA/EN/AR. Name files e.g. `impl-fa-work-chat-320-dark-100.png`; reference files use `reference-...`. No implementation captures currently exist.
4. **Keyboard recording:** at 320 and desktop, Tab from skip link through navigation/theme/inquiry/footer; Shift-Tab reverses sensibly. Open mobile dialog: focus starts on Close, Tab stays inside, background cannot be activated/scrolled; Escape/Close restore focus. Activate locale/section/page links, reopen, resize across 80rem while open, verify no stranded focus/scroll lock. Destination heading/field and error summary must not be hidden under sticky header. Include visible focus in captures; spot-check labels/landmarks/errors with the owner's available screen reader.
5. **Theme recording:** Light → reload → another route → another locale retains Light; repeat Dark. System follows the Fedora preference on reload and while open; explicit overrides ignore OS changes. Record initial-load filmstrip/video for flashes and console. Test storage-denied behavior without changing host security. Test no-script navigation separately: links readable, no form submission, menu/theme controls disabled intentionally.
6. **Inquiry, synthetic only:** use `UI REVIEW TEST`, `ui-review@example.invalid`, and an explicitly synthetic description of at least 20 characters. Empty submit focuses localized error summary; each link focuses its field. Default disabled API submission must never show success; expect uncertainty, retained/locked draft and Retry-After delay. Do not reload a draft to bypass uncertainty. Success/replay/timeout/DB-failure browser acceptance needs a separately prepared **disposable** fixture environment; do not enable a real intake or use persistent/production customer records just for screenshots.
7. **Zoom/console:** use Firefox actual 200% page zoom (not only device emulation) on each page type/all locales, at desktop and narrow reflow; record effective CSS viewport and check menu, focused controls, errors and CTA remain usable. Check reduced motion. Keep Console open through load, navigation, theme, menu and form actions; capture error/hydration-warning text with URL/steps. No HAR, credential/storage dump or real inquiry payload in shared artifacts.

**Acceptance closure:** current evidence supports only structural/content/navigation/controller subcriteria and reference byte integrity. Close **no additional whole task checkbox** now. ECHO-003 needs actual reference browser captures; 105/107/108 need native visual/keyboard/theme evidence; 301–307 and 401–403 need matching rendered review plus applicable copy approval. ECHO-306 also needs the durable browser inquiry path, not preview 503 or mocked success. 109/308 stay open. Browser access is an acceptance/release blocker, not a demonstrated critical product defect.

## Actual checks this review

- `npm run lint`, `npm run typecheck`: **PASS**.
- Focused Vitest: header, theme, homepage, services, work, details, inquiry form, tokens: **63 PASS / 8 files** after UX-01 fix. Full suite and PostgreSQL integration deliberately **not rerun**; only CSS/test changed.
- `npm run build`: **PASS**; all existing marketing routes and nine details prerendered. Existing `globalNotFound` experiment unchanged.
- `npm run test:http`: **PASS**; all locales/pages, detail destinations/fragments, localized 404s, preview API and theme-init regressions. Temporary loopback server stopped. Not browser evidence.
- `npm run verify:reference`, `git diff --check`: **PASS**. Generated `next-env.d.ts` restored to pre-review paths.

**Files changed:** `src/styles/work.css`, `tests/unit/work-details.test.tsx`, this report and a narrow `ROADMAP.md` review note. No staging/commit/tag/push/deployment.

**Next milestone:** owner Firefox evidence and targeted remediation for the existing acceptance gates. Next product implementation remains ECHO-404 only after separate authorization and approved identity facts; none implemented here.

Suggested human commit: `fix(ECHO-403): restore ordered concept workflow markers`.
