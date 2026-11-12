# ECHO-407 — link, asset and content evidence audit

Task: **ECHO-407 only** · Status: **PARTIAL acceptance; audit and verified fixes delivered; browser/legal acceptance open**, 2026-11-12

## Scope and method

Inputs: repository guidance, `SCOPE.md`, `ROADMAP.md` ECHO-407, `design/reference/code.html` and the frozen reference bundle, current route/component/content source, existing unit/HTTP tests and prior P4 reports.

The audit read the actual rendered production output of all **27 localized marketing routes** (`/fa|en|ar` × homepage, `/services`, `/work`, `/work/{analytics,chat,booking}`, `/about`, `/contact`, `/privacy`). It cross-checked:

- every `href`/`src` in those documents, including shared header, mobile dialog, footer, inquiry form, privacy link and locale switching;
- in-page and cross-page fragments, duplicate ids and placeholder/unsafe URLs;
- fonts, favicon/icon, public files and reference-file serving;
- services, work, concept details, About, Contact, Privacy and homepage copy;
- FA/EN/AR message-key parity and accidental English fallback;
- the approved reference's example metrics, certifications, vendors and company names.

The durable evidence is `scripts/smoke-http.mjs` (whole-site crawl, including Work current-state on detail routes), `tests/unit/assets.test.ts` (font/attribution surface) and the header/footer component tests. No browser was downloaded for this batch, and no visual or assistive-technology result is claimed.

## Findings

| Area / route | Finding | Evidence | Status |
| --- | --- | --- | --- |
| All 27 routes | No broken primary or internal destination. 73 unique same-origin URLs all return 200. | `npm run test:http` crawl over every rendered document | Verified |
| All 27 routes | No missing fragment target; no duplicate element ids; no empty, `#`, `javascript:` or protocol-relative URLs. | Same crawl; id-uniqueness assertions | Verified |
| All routes / locale | `lang`/`dir` correct per route; locale links retain the equivalent path; explicit-locale URLs are not overridden by cookie/header. | HTTP locale and redirect checks | Verified |
| Unknown routes | Unknown slug, locale, extra segment and reference paths return localized 404 with `noindex`; `x-echo-locale` cannot override an explicit URL. | HTTP 404 block | Verified |
| External links | **None exist** in rendered marketing pages; therefore no external destination is available to verify or to mark broken. | Crawl reports 0 external URLs; unit tests forbid `https://`/`mailto:` | Verified (none to test) |
| Header/Footer vs in-content CTA | Header and Footer target `/{locale}/contact`; About/Services/Work/detail in-content inquiry CTAs target `/{locale}#contact` on the homepage. Both destinations work. | ECHO-405 report and HTTP checks | Intentional, see owner decision D2 |
| Inquiry privacy link | Every shared form links to the localized `/privacy` before the fields; footer links Privacy too. | HTTP/unit assertions | Verified |
| Images | No raster images or screenshots are published; 366 inline SVGs are decorative (`aria-hidden`) except `src/app/icon.svg`, which has `role="img"` and an `aria-label`. | Crawl/asset count; `favicon.test.ts`; `assets.test.ts` | Verified |
| Fonts | Six self-hosted WOFF2 subsets are referenced by `src/styles/fonts.css`, exist in `public/fonts`, and are served as `font/woff2`; no external font request. | HTTP font checks; `assets.test.ts` | Verified |
| Font license | `public/fonts/README.md` records `@fontsource/vazirmatn@5.3.0` provenance and `public/fonts/OFL.txt` carries SIL OFL 1.1 plus the copyright line. | `assets.test.ts` | Verified |
| Icons | `favicon.ico` (32×32 ICO) and `icon.svg` match the approved brand mark and are linked in every localized document. | `favicon.test.ts`; HTTP checks | Verified |
| Reference files | `design/reference/*`, `code.html`, `.env.example` and `package.json` are not served (404), and the frozen reference hashes/CRCs pass. | HTTP 404 block; `npm run verify:reference` | Verified |
| Concept work labeling | All nine concept details and three homepage/list items are labeled concept/static preview with possible—not deployed—stack tags; no client result, live URL or source link. | Content review; unit tests | Verified |
| Reference-only claims | `CPU: 14%`, `RPS: 2,450`, `LATENCY: 18ms`, `TOKENS: 420/s`, `HIPAA`, `GDPR`, `24/7`, `SMS GATEWAY`, `FAISS`, `LangChain`, `TanStack`, `Redis Cache`, `SaaS_v2.4` exist only in the reference and are absent from production source and rendered HTML. | Source/rendered searches; existing fake-metric tests | Verified |
| Company names / testimonials | No client names, testimonials, awards, certifications, guarantees, staff profiles, office, registration or response-time claims are published. Unavailable proof is stated as unavailable. | Content review; `about`/`contact`/`privacy` honesty tests | Verified |
| FA/EN/AR parity | Message keys have no missing/extra entries; no accidental English fallback beyond technical terms; the three locales make materially equivalent promises. | `src/i18n/messages` parity check; unit copy-parity tests | Verified |
| About `next.note` | Said the homepage inquiry was the "only implemented contact path", contradicting the delivered Contact page. | `src/content/about.ts`; `docs/P4-CONTACT.md` | **Fixed** (EN/FA/AR) |
| Shared `contactsPending` | Said "No contact links are published yet", contradicting the implemented Contact route and its inquiry. | `src/content/home.ts` (homepage + footer) | **Fixed** (EN/FA/AR) |
| Header on `/work/{analytics,chat,booking}` | The Work primary-nav link lacked `aria-current="page"` even though those are implemented Work destinations. | Rendered production HTML of the nine detail routes; `header.test.tsx`; new HTTP assertion | **Fixed** (EN/FA/AR) |
| Footer Work label | "Demos and selected work" / "دموها و نمونه‌کارها" / "النماذج والأعمال" implied verified selected work, but `/work` publishes only concept studies plus honest client/internal empty states. | `src/content/chrome.ts`; `work` page content | **Fixed** (EN/FA/AR) |
| Homepage metadata | The homepage inherits the layout preview title (`Echo Devs — Development preview`) instead of a page-specific title/description. | `src/app/[locale]/layout.tsx` | Owner/later task (ECHO-506/604), not changed |

No other content inconsistency was supported by repository evidence, so no further copy was changed.

## Fixes applied

The four changes are limited to already-established meaning: the Contact page and its shared inquiry form exist, the three concept details are implemented Work destinations, `/work` publishes only concept studies today, and public email/phone/social channels remain unverified.

1. `src/content/about.ts` — all three `next.note` strings now state that the project inquiry is the implemented contact path and is available on both the homepage and the Contact page.
2. `src/content/home.ts` — all three `contactsPending` strings now name unverified public email/phone/social channels and identify the project inquiry as the available contact path.
3. `src/components/layout/header.tsx` — Work keeps `aria-current="page"` for `/work` and every `/work/{slug}` detail route; other primary-nav behavior is unchanged.
4. `src/content/chrome.ts` — the footer Work label now reads "Demos and concept studies" / "دموها و طرح‌های مفهومی" / "النماذج والدراسات التصورية", matching the concept-only work page.

Regression coverage was added to `tests/unit/about.test.tsx`, `tests/unit/homepage.test.tsx`, `tests/unit/header.test.tsx` (detail-route current state), `tests/unit/footer.test.tsx` (honest concept-only label), `scripts/smoke-http.mjs` (production detail-route current state), plus `tests/unit/assets.test.ts` for the font/license surface.

## Owner decisions still required

| ID | Decision | Why it is not an agent choice |
| --- | --- | --- |
| D1 | Verified public contact channel(s): email, phone, social profiles, office address, legal entity/registration and company facts | No approved data exists; publishing any would fabricate business facts |
| D2 | Whether to consolidate in-content inquiry CTAs onto `/{locale}/contact` or keep the documented split to homepage `#contact` | Both are functional; it is a UX/brand preference, not a defect |
| D3 | Privacy/legal acceptance: entity, jurisdiction, legal basis, retention, request contact, analytics/consent policy (`docs/DECISIONS.md` D6) | Legal/policy approval, not engineering |
| D4 | Real client/internal case studies, verified results, screenshots or public proof | Requires owner-verified facts, assets and publication permission |
| D5 | Whether to publish any raster screenshots or partner/customer names in future | Would need provenance, permission and an asset-license record |
| D6 | Page-specific homepage (and later SEO) metadata, canonical/hreflang/sitemap/robots | Scheduled as ECHO-506/604; changing it here would exceed the audit scope |

## Remaining acceptance checks

- Rendered **desktop and narrow** layouts for changed shared surfaces in both themes, including RTL, with the approved reference.
- Native **keyboard/focus**, **screen-reader** spot check and **200% zoom** on header, mobile dialog, form, footer and language links.
- Owner/native-language copy review of the two corrected statements and the wider P4 copy.
- External-link verification would only apply if a future task publishes external URLs; none exist today.
- Passing DOM/HTTP/asset tests are **not** visual, legal or accessibility acceptance. ECHO-407's checkbox remains open and no release sign-off is implied.

## Commands/tests actually run

| Check | Result |
| --- | --- |
| `npm run lint` | PASS for all changed files and all tracked repository source |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 199 tests / 22 files (195 prior plus four header/footer regressions) |
| `npm run build` | PASS: 27 localized marketing routes plus root/404/API/icon |
| `npm run test:http` | PASS: all prior locale/route/content/404/redirect checks plus the 27-document link/anchor/asset crawl, Work detail current-state and six-font check; owned loopback server stopped |
| `npm run verify:reference` | PASS: original ZIP/HTML/screenshot/design hashes, CRCs and preserved prototype consistency |
| `git diff --check` | PASS |
| Browser launch | NOT RUN/available; no download or security change attempted |

PostgreSQL integration tests were not repeated: no schema, API, validation, persistence, idempotency or rate-limit contract changed.

## Files changed in this batch

- `src/content/about.ts` — corrected `next.note` in FA/EN/AR
- `src/content/home.ts` — corrected `contactsPending` in FA/EN/AR
- `src/components/layout/header.tsx` — Work `aria-current` on `/work/{slug}` detail routes
- `src/content/chrome.ts` — footer Work label now says concept studies in FA/EN/AR
- `scripts/smoke-http.mjs` — whole-site link/anchor/asset crawl, font serving and detail-route current-state check
- `tests/unit/assets.test.ts` — font references, provenance/license evidence and no unlicensed raster assets
- `tests/unit/about.test.tsx`, `tests/unit/homepage.test.tsx` — corrected-copy regression assertions
- `tests/unit/header.test.tsx`, `tests/unit/footer.test.tsx` — navigation-current and honest-label regressions
- `docs/P4-AUDIT.md`, `ROADMAP.md` — audit evidence and open acceptance

## Outstanding acceptance and next task

Visual, keyboard, screen-reader, zoom, owner/native copy and legal acceptance remain open, so ECHO-407 stays unchecked. The audit found no broken primary links, missing assets or false production claims. Four verified defects were corrected in all locales: two stale contact statements, the missing Work current-state on concept detail routes, and the footer label that implied verified selected work on a concept-only page.

Next recommended task after ECHO-407 acceptance: **ECHO-501/P5** localized content-dictionary and parity validation, or owner-authorized `ECHO-406` legal decisions first. This batch stops at ECHO-407.

## ECHO-407 follow-up audit — 2026-11-12

The repository was clean at entry, with ECHO-407 implementation already committed
as `9299ca3`; ECHO-406 is `425f765`. The actual ECHO-407 definition still matches
the requested link/asset/content audit. This follow-up revalidated existing work,
not a new page/design batch. **Status remains PARTIAL.** ECHO-406 policy/legal and
browser acceptance are not closed by this audit.

### Findings and additional durable coverage

| Area / route | Finding and supporting evidence | Status |
| --- | --- | --- |
| All 27 FA/EN/AR marketing routes | Fresh production HTTP crawl: all 73 unique destinations return 200; fragments resolve; ids are unique; no placeholder/unsafe/external URLs. Existing redirect/localized-404/default-disabled API checks pass. | Verified at HTTP level |
| Shared chrome, page CTAs, inquiry privacy, equivalent locale paths | New `tests/unit/marketing-audit.test.tsx` renders all 27 route/component combinations. Every link has text or an explicit label; privacy links preserve locale; language links preserve page/slug. | Verified at DOM/source level, not full accessibility acceptance |
| Process | There is no separate Process route. Shared navigation intentionally targets the localized homepage `#process`; its six proposed stages differ in granularity from About's four collaboration stages, not in timing/support promises. `home.ts`, `about.ts`, Header and HTTP fragments agree. | Verified; no route invented |
| Authored stylesheet assets | Every `url(...)` in `src/styles/*.css` resolves to the six reviewed local fonts. New coverage in `assets.test.ts` also verifies WOFF2 magic bytes, not only file size. Provenance/OFL evidence remains beside the unchanged binaries. | Verified; no ownership/license invented |
| Illustrations and controls | New 27-page DOM matrix checks SVG/canvas decorative treatment through the element **or an ancestor**; exposed nondecorative vectors require an image role/name. No published raster marketing images were found. Static concept bars/messages/booking states are illustrations, not broken controls. SSR-disabled inquiry controls are intentional no-script safeguards, not broken links. | Verified within current asset inventory |
| Current copy and claims | Rechecked Home, Services, Work/details, About, Contact, Privacy and shared chrome in all locales against the existing reference/claim registry. No additional objectively supported copy defect or false production claim found. The two stale-contact fixes in `9299ca3` are retained, not reimplemented. | Verified within available evidence; native copy/business-fact approval remains open |
| External destinations | No external marketing links are published. Font-license provenance URLs in the distributed text are evidence references, not public marketing CTAs. No external destination was contacted or declared broken. | None to verify |
| Narrow shared surfaces | Actual production frontend at 375×1000: English/dark About, Persian/dark Contact, Arabic/light concept detail, corresponding footers, Persian mobile menu and inquiry privacy link. Eight final captures inspected; no observed horizontal overflow or clipped primary link in these samples. | Bounded browser spot check only |
| Mobile menu and privacy link | Real XTest Enter opens each sampled locale's native menu; Tab stays inside it; Escape closes and returns focus. Persian inquiry privacy link is focused, within the viewport, unobscured and hit-testable. No inquiry was entered/submitted. | Spot checks verified; not full keyboard/screen-reader acceptance |
| Desktop browser evidence | GDK readback at 1300×1000 produced blank/partial images despite hydrated DOM; the Arabic Services first view painted but its footer was incomplete. Expected DRI/accessibility warnings occurred. An independent WebKit snapshot attempt was blocked by a missing Python `cairo.Surface` converter. Cause is **unverified**, not automatically an app defect or automatically a harmless renderer issue. | Unverified; independent desktop browser inspection required |

No production source, layout, copy, inquiry, API, schema, persistence, throttling,
operator tooling or reference assets changed. No replacement assets, dependency,
external service, real intake, deployment or next task was introduced.

### Actual checks

- Focused existing/new unit tests: **87 passed / 10 files**. After adding missing
  test-element keys flagged by ESLint, the changed audit tests were rerun:
  **31 passed / 2 files**. No failed check is presented as passing.
- `npm run lint`, `npm run typecheck`, `npm run build`: **PASS**. The build renders
  the existing 27 localized marketing routes; earlier report counts are historical.
- `npm run test:http`: **PASS** for the full current crawl and earlier locale,
  anchor, theme initializer, API-disabled, redirect and unknown-route regressions;
  owned loopback server stopped.
- `npm run verify:reference`: **PASS** for original hashes, ZIP CRCs, extracted
  copies and preserved prototype consistency. No reference bytes/hashes changed.
- `scripts/audit-browser.py --narrow-only`: **35 browser spot assertions passed**,
  eight screenshots. Uses existing Ubuntu WebKitGTK/Xvfb/XTest, ephemeral contexts,
  loopback production HTTP and `INQUIRIES_ENABLED=false`; no form submission.
- The initial mixed-width run's **42 DOM/interaction assertions** did not establish
  desktop visual acceptance: inspection exposed blank/partial readback. That run
  is preserved under `test-results/echo-407-20261112-134621/`, not approved as a
  screenshot pass. The snapshot follow-up failed before producing usable evidence.
  The harness now refuses flat body readback rather than silently accepting it;
  manual image inspection is still necessary for partial paint.
- No PostgreSQL integration, production protocol/persistence, full screen-reader,
  200% zoom, 320/768/1024/1440 matrix, cross-engine or performance acceptance run.
  No tooling installation/download or security/driver change was attempted.

Reproduce the bounded narrow check using existing dependencies only:

```sh
xvfb-run -a -s '-screen 0 1440x1100x24 -nolisten tcp' /usr/bin/python3 scripts/audit-browser.py --narrow-only
```

### Inspected final browser evidence

**Actual production frontend / Ubuntu WebKitGTK-Xvfb, local HTTP, intake disabled.**
Not native Fedora, reference-fidelity sign-off, legal or full accessibility acceptance.
All eight are **375×1000**. Exact state/dimensions/check names are in the same
directory's `manifest.json`; artifacts remain ignored, not committed.

| View | Absolute screenshot path |
| --- | --- |
| English/dark About | `/home/worker1/projects/echodevs/test-results/echo-407-20261112-134856/02-en-dark-about.png` |
| English/dark footer | `/home/worker1/projects/echodevs/test-results/echo-407-20261112-134856/02-en-dark-about-footer.png` |
| Persian/dark Contact | `/home/worker1/projects/echodevs/test-results/echo-407-20261112-134856/03-fa-dark-contact.png` |
| Persian/dark footer | `/home/worker1/projects/echodevs/test-results/echo-407-20261112-134856/03-fa-dark-contact-footer.png` |
| Persian/dark native menu | `/home/worker1/projects/echodevs/test-results/echo-407-20261112-134856/07-fa-dark-mobile-menu.png` |
| Persian/dark inquiry privacy link | `/home/worker1/projects/echodevs/test-results/echo-407-20261112-134856/08-fa-dark-inquiry-privacy.png` |
| Arabic/light concept | `/home/worker1/projects/echodevs/test-results/echo-407-20261112-134856/06-ar-light-concept.png` |
| Arabic/light footer | `/home/worker1/projects/echodevs/test-results/echo-407-20261112-134856/06-ar-light-concept-footer.png` |

### Owner decisions and acceptance still open

The D1–D6 owner decisions above are unchanged: verified public contacts/company
facts, CTA consolidation preference, privacy/legal approval, client/internal proof,
image/name publication permission and separately scoped metadata work. Default-
disabled intake and pending legal acceptance from ECHO-406 remain intact.

Desktop render/capture cause and reference comparison require independent browser
evidence. Complete locale/theme/viewport, keyboard, screen-reader, zoom and native
copy review remain open. No task checkbox or legal/accessibility gate is closed.

Follow-up changed files: `tests/unit/assets.test.ts`,
`tests/unit/marketing-audit.test.tsx`, `scripts/audit-browser.py`, this report and
`ROADMAP.md`. Next task is **not started**; stop after ECHO-407 for owner review.
