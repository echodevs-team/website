# Trilingual terminology reference

**Task:** ECHO-501 · **Locales:** `fa`, `en`, `ar` · **Updated:** 2026-11-12

This is the working vocabulary for visitor-facing copy in `src/content/*.ts` and
`src/i18n/messages/*.json`. It records the terms and presentation rules currently
implemented in the website. It does not replace native-speaker review (owner gate D8)
or approve legal/privacy wording.

## Core vocabulary

| Concept | English (`en`) | Persian (`fa`) | Arabic (`ar`) |
| --- | --- | --- | --- |
| Brand | Echo Devs (Latin in chrome) | اکو دوز / Echo Devs | إيكو ديفز |
| Software engineering studio | software engineering studio | استودیوی مهندسی نرم‌افزار | استوديو هندسة برمجيات |
| Service pillar / domain | service pillar | حوزه خدمات | محور خدمات |
| Areas of focus | areas of focus | زمینه‌های تخصصی | مجالات التركيز |
| Web applications | web applications | وب‌اپلیکیشن‌ها / اپلیکیشن‌های تحت وب | تطبيقات الويب |
| SaaS | SaaS (untranslated) | SaaS | SaaS |
| Backend | backend | بک‌اند | الأنظمة الخلفية |
| API | API / interfaces | API / رابط‌های برنامه‌نویسی | API / واجهات البرمجة |
| AI | AI | هوش مصنوعی | الذكاء الاصطناعي |
| Automation | automation | اتوماسیون | الأتمتة |
| Data engineering | data engineering | مهندسی داده | هندسة البيانات |
| Product design / UI-UX | UI/UX & product design | طراحی تجربه کاربری، رابط و محصول | تصميم تجربة المستخدم والواجهات والمنتج |
| Concept study | concept study / static preview | طرح مفهومی / پیش‌نمایش ثابت | دراسة تصورية / معاينة ثابتة |
| Client project | client project | پروژه مشتری | مشروع عميل |
| Project inquiry | project inquiry | درخواست پروژه | طلب مشروع |
| Inquiry form (accessible name) | project inquiry form | فرم درخواست پروژه | نموذج طلب المشروع |
| Privacy / data handling | privacy / how inquiry data is handled | حریم خصوصی / نگهداری و پردازش اطلاعات | الخصوصية / تخزين معلومات الطلب ومعالجتها |

## Terminology and register rules

1. **One concept, one stable term.** “Service pillar” is `حوزه` in Persian and
   `محور` in Arabic across the homepage badges, services navigation and footer.
   “Areas of focus” (`زمینه‌های تخصصی` / `مجالات التركيز`) is a separate label and
   must not replace the pillar term.
2. **Keep internationally recognised technical terms.** Write `SaaS`, `API`,
   `UI/UX`, `End-to-End`, `Cloud-Native`, stack names and process codes in Latin
   script. Do not invent localized acronyms or literal substitutions such as
   `نرم‌افزار اشتراکی` / `البرمجيات باشتراك` where `SaaS` is meant.
3. **Address the visitor consistently.** English uses neutral “you”. Persian uses
   the formal plural (`شما`, `کنید`). Arabic uses the plural honorific
   (`أنتم`, `ـكم`, `ابدأوا`, `استكشفوا`, `ناقشوا`, `صفوا`, `أدخلوا`, `راجعوا`).
   Primary CTAs and form guidance must not slip into singular imperatives
   (`ابدأ`, `استكشف`, `ناقش`, `صف`, `أدخل`). Illustrative product copy inside a
   concept mock-up may use singular UI address because it is a simulated interface,
   not site guidance.
4. **Form wording.** `inquiryCopy.formLabel` is the form’s accessible name.
   `inquiryCopy.intro` is the visible `fieldset` legend and reads
   “Project details” / “مشخصات پروژه” / “تفاصيل المشروع”; it must not repeat the
   section description.
   Form validation and status strings live only in `src/content/inquiry.ts`.
5. **Concept honesty.** Every homepage/work item is `kind: "concept"` until
   verified client or internal work exists. Use “concept study”, “static preview”
   or the localized equivalent. Never imply a deployed product, client result,
   source repository or live demo.
6. **Preview honesty.** `Foundation.preview` names the development preview. Do not
   claim a public launch, open intake, response time or notification capability.
   The implemented contact path may be named, but not described as publicly
   available when the API/form is disabled.
7. **Claims stay qualified in all three locales.** No guarantee, uptime/SLA,
   revenue, search ranking, compliance or delivery promise may appear in one
   locale without the matching limitation in the other two.

## Numerals, punctuation and bidi

- Dynamic numbers (step counters, retry seconds) use `Intl.NumberFormat(locale)`.
- Prose uses Persian digits in Persian and Arabic-Indic digits in Arabic; phone
  numbers, environment identifiers, API values and code stay Latin.
- Use `،` `؛` `؟` in Persian/Arabic prose, not `,` `;` `?`.
- Wrap inline Latin technical text in `<bdi>` where it sits in RTL prose, and use
  `dir="ltr"` on containers such as `.runtime-top`, `.runtime-bottom` and
  `.stack-tags`. Isolated tokens include `CORE_RUNTIME`, `NEXT.JS // PYTHON // AI`,
  process codes and stack tags.
- Email and phone inputs use `dir="ltr"`. Inline phone examples start with a
  left-to-right mark (`U+200E`) before `+44` in FA/AR hints.

## Fonts and rendering

The site ships one family, **Vazirmatn**, as six self-hosted WOFF2 subsets in
`public/fonts/` (`arabic` and `latin` × weights 400/500/700) declared in
`src/styles/fonts.css`. Nothing loads a font from a third-party origin.

- Each face carries an explicit `unicode-range` and `font-display: swap`, so the
  browser requests only the subsets a page uses and text stays readable with the
  declared fallback while a face loads.
- `--font-body` is `"Vazirmatn", system-ui, sans-serif`. Headings and prose both
  use it; do not introduce a second display face without owner approval.
- `--font-mono` is `ui-monospace, "Vazirmatn", monospace`. Latin chrome keeps a
  monospaced look, but Persian/Arabic glyphs inside mono-styled chrome (language
  names, brand chip, footer badges and headings, runtime labels) must resolve to
  Vazirmatn rather than an unreviewed system fallback. Removing Vazirmatn from
  that stack is a regression, not a style tweak.
- Persian/Arabic arrows (`←`, `→`, `↗`) and the `↑` in mixed chrome sit outside
  the subset ranges and intentionally use the system fallback; they must never
  render as tofu. Vazirmatn also intentionally shares some glyph shapes between
  Persian (`۱۲۳`) and Arabic-Indic (`١٢٣`) digits, so duplicate-glyph checks must
  not treat those as missing glyphs.
- Letter spacing and uppercasing are scoped to `:lang(en)` or to the Latin
  locale codes; they are never applied to Arabic-script text, where they break
  joining and reading.

`python3 scripts/typography_audit.py` (static) and
`scripts/audit-typography.py` (WebKitGTK browser matrix) enforce these rules;
`tests/unit/typography.test.ts` covers the copy-level script and numeral rules.

## Source ownership

| Copy | Source |
| --- | --- |
| Homepage, service pillars, CTAs, inquiry intro | `src/content/home.ts` |
| Services detail and sub-services | `src/content/services.ts` |
| About / team approach | `src/content/about.ts` |
| Contact guidance, form heading, notes | `src/content/contact.ts` |
| Privacy disclosure | `src/content/privacy.ts` |
| Work listing and concept groups | `src/content/work.ts` |
| Work detail proposals | `src/content/work-details.ts` |
| Shared form labels, validation, status | `src/content/inquiry.ts` |
| Header, footer, theme, 404 chrome | `src/i18n/messages/{en,fa,ar}.json` + `src/content/chrome.ts` |

Parity is enforced by `tests/unit/localization-parity.test.tsx` plus the per-page
copy tests. A missing key, empty value or new locale-specific branch fails the
test/typecheck rather than falling back silently.

## Owner / native-review items (not resolved here)

- Final brand presentation: Latin `Echo Devs`, Persian `اکو دوز`, Arabic
  `إيكو ديفز`. Do not change without brand approval.
- Native-speaker reading quality, tone and legal/privacy wording remain owner
  review gates.
- Homepage service-card titles and services-page pillar titles intentionally differ
  in granularity; unify only with an approved copy decision.
- Public contact channels, retention periods, jurisdiction and compliance wording
  remain open decisions (D1, D6).

## Intentionally non-localized visitor-facing tokens

These strings appear verbatim in every locale by design; they are not translation
gaps (audited in ECHO-502):

- Latin `Echo Devs` wordmark, the fixed Persian brand chip `اکو دوز` shown on every
  locale, and the localized Arabic transliteration `إيكو ديفز` in copy.
- Reference/technical labels `ED`, `CORE_RUNTIME`, `NEXT.JS // PYTHON // AI`,
  `CONCEPT`, `PREVIEW`, concept preview codes
  (`SaaS_PREVIEW`/`RAG_BOT_PREVIEW`/`HEALTH_BOOKING_PREVIEW`), telemetry codes,
  stack tags and process codes. They are isolated with `bdi`/`dir="ltr"` and sit
  beside localized equivalents.
- English mono captions on the four homepage benefit cards (`Clear Decisions`,
  `Product Thinking`, `Maintainable Code`, `Visible Milestones`). They duplicate
  the localized card heading/body and preserve the approved reference treatment;
  localizing them is an optional design decision, not a missing page translation.
- The hidden `Website` anti-bot field is `aria-hidden="true"` and never presented.

## Claim guardrails

- Only describe implemented behavior as fact. Anything about business identity,
  contacts, client work, metrics, certifications, hosting, retention or legal
  basis must come from the owner; otherwise keep the qualified/withheld wording.
- `tests/unit/claims.test.ts` rejects obvious fabricated markers (public
  contact/link schemes, compliance badges, uptime/SLA figures) in any locale. It
  is a regression tripwire, not proof that remaining copy is true.
- Re-verify `src/content/privacy.ts` whenever the form schema, limits, storage or
  infrastructure changes; see `docs/INQUIRY-PRIVACY.md`.
