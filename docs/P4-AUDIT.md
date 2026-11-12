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

The durable evidence is `scripts/smoke-http.mjs` (new whole-site crawl) and `tests/unit/assets.test.ts` (font/attribution surface). No browser tooling was available or downloaded.

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
| Homepage metadata | The homepage inherits the layout preview title (`Echo Devs — Development preview`) instead of a page-specific title/description. | `src/app/[locale]/layout.tsx` | Owner/later task (ECHO-506/604), not changed |

No other content inconsistency was supported by repository evidence, so no further copy was changed.

## Fixes applied

Both changes are limited to already-established meaning: the Contact page and its shared inquiry form exist, and public email/phone/social channels remain unverified.

1. `src/content/about.ts` — all three `next.note` strings now state that the project inquiry is the implemented contact path and is available on both the homepage and the Contact page.
2. `src/content/home.ts` — all three `contactsPending` strings now name unverified public email/phone/social channels and identify the project inquiry as the available contact path.

Regression coverage was added to `tests/unit/about.test.tsx` and `tests/unit/homepage.test.tsx`, plus `tests/unit/assets.test.ts` for the font/license surface.

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
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 195 tests / 22 files (includes new `assets.test.ts`) |
| `npm run build` | PASS: 22 localized marketing pages plus root/404/API as before |
| `npm run test:http` | PASS: all prior locale/route/content/404/redirect checks plus the new 27-document link/anchor/asset crawl and six-font check; owned loopback server stopped |
| `npm run verify:reference` | PASS: original ZIP/HTML/screenshot/design hashes, CRCs and preserved prototype consistency |
| `git diff --check` | PASS |
| Browser launch | NOT RUN/available; no download or security change attempted |

PostgreSQL integration tests were not repeated: no schema, API, validation, persistence, idempotency or rate-limit contract changed.

## Files changed in this batch

- `src/content/about.ts` — corrected `next.note` in FA/EN/AR
- `src/content/home.ts` — corrected `contactsPending` in FA/EN/AR
- `scripts/smoke-http.mjs` — durable whole-site link/anchor/asset crawl and font serving check
- `tests/unit/assets.test.ts` — font references, provenance/license evidence and no unlicensed raster assets
- `tests/unit/about.test.tsx`, `tests/unit/homepage.test.tsx` — corrected-copy regression assertions
- `docs/P4-AUDIT.md`, `ROADMAP.md` — audit evidence and open acceptance

## Outstanding acceptance and next task

Visual, keyboard, screen-reader, zoom, owner/native copy and legal acceptance remain open, so ECHO-407 stays unchecked. The audit found no broken primary links, missing assets or false production claims; the only verified content defects were the two stale contact statements above, now corrected in all locales.

Next recommended task after ECHO-407 acceptance: **ECHO-501/P5** localized content-dictionary and parity validation, or owner-authorized `ECHO-406` legal decisions first. This batch stops at ECHO-407.
