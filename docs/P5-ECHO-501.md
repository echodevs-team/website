# ECHO-501 — localization and content parity

Task: **ECHO-501 only** · Status: **implementation verified for the ROADMAP acceptance
(“missing key fails CI”); native-copy and browser acceptance remain open**,
2026-11-12

## Scope

Audited the visitor-facing copy of all **27 localized marketing routes**
(`fa`/`en`/`ar` × homepage, services, work, three concept details, about, contact,
privacy), plus shared header/footer, inquiry form labels/validation/status, 404
chrome and metadata/accessible names.

Inputs: `AGENTS.md`, `SCOPE.md`, `ROADMAP.md` (P5), `DESIGN.md`, P4 reports,
`docs/I18N-TERMINOLOGY.md` (new), `src/content/*.ts`,
`src/i18n/messages/{en,fa,ar}.json`, route components and the frozen
`design/reference/code.html`.

This task did **not** change the UI structure, Canvas, inquiry API/database,
idempotency, rate limits, intake enablement, `noindex`, analytics, privacy/legal
policy, dependencies, deployment or remote state.

## Defects corrected

| Area | Correction | Reason |
| --- | --- | --- |
| Arabic homepage/About/Services CTAs | `ابدأ`/`استكشف`/`ناقش` → `ابدأوا`/`استكشفوا`/`ناقشوا`; `أخبرنا عن مشروعك` → `أخبرونا عن مشروعكم`; About next-step links pluralized | The surrounding Arabic prose consistently uses the plural honorific (`أفكاركم`, `أعمالكم`, `استخدموا`); singular imperatives broke register |
| Arabic inquiry form | Intro/note/success/error/rate-limit/retry/conflict/expiry/hints moved to plural address (`صفوا`, `أدخلوا`, `تحققوا`, `راجعوا`, `انتظروا`, `أعيدوا`, `لا تكتبوا`, `طلبكم`) | Same form is shared by homepage and Contact; Contact already used plural, so one form mixed two registers |
| Persian service-pillar term | Homepage badges `ستون اول/دوم/سوم` and footer `ستون‌های خدمات` → `حوزه اول/دوم/سوم` and `حوزه‌های خدمات` | Persian already used `حوزه` for the same concept in the services navigation and `۳ حوزه تخصصی`; one term now covers homepage, services and footer (`محور` in Arabic, “pillar” in English) |
| SaaS sub-service names | FA `نرم‌افزار اشتراکی` → `پلتفرم‌های SaaS`; AR `البرمجيات باشتراك` → `منصات SaaS` | Same sub-service was named inconsistently on the homepage (`پلتفرم‌های SaaS` / `منصات SaaS`); `SaaS` is an intentional untranslated term |
| Homepage inquiry description | “future inquiry area / will open” replaced with an actual request description plus the storage/review dependency in FA/EN/AR | The form and Contact page are implemented; “future area” contradicted the rendered form and the Contact copy |
| Contact path wording | `contactsPending` “available contact path” → “implemented contact path” in FA/EN/AR | The form is deliberately disabled in preview; “implemented” matches Contact/About and avoids claiming open intake |
| Homepage form accessible name | Form now uses localized `inquiryCopy.formLabel` instead of the hero CTA “Start a project”; Contact still supplies its own `contact.form.ariaLabel` | A CTA phrase is not an accessible form name; both pages now name the form by purpose |
| Duplicate form intro | Visible `fieldset` legend is now “Project details” / “مشخصات پروژه” / “تفاصيل المشروع”; homepage heading uses `home.inquiry.description` | The old legend repeated the section description almost verbatim on both pages |
| Services navigation name | EN/FA/AR labels changed to noun phrases (`Service pillar navigation`, `پیمایش حوزه‌های خدمات`, `التنقل بين محاور الخدمات`) | Landmark accessible name should describe navigation, not read as a CTA |
| Content documentation | `src/content/README.md` updated; `docs/I18N-TERMINOLOGY.md` added | The old README still said content was “future”; terminology was undocumented |

No fabricated profile, client, result, metric, contact, legal term or guarantee was
added. Existing concept-only labeling, privacy disclosure and claim qualifications
were preserved.

## Terminology decisions

Recorded in `docs/I18N-TERMINOLOGY.md`:

- One pillar term per locale: English `service pillar`, Persian `حوزه خدمات`,
  Arabic `محور خدمات`; “areas of focus” stays a separate label.
- Keep `SaaS`, `API`, `UI/UX`, `End-to-End`, `Cloud-Native`, stack tags and process
  codes in Latin script; do not force awkward localized substitutes.
- Persian uses formal plural address; Arabic uses the plural honorific; English
  uses neutral “you”. Simulated product copy inside a concept mock-up keeps
  singular UI address because it is not site guidance.
- Form labels/validation/status have a single source (`src/content/inquiry.ts`);
  `formLabel` is the accessible name and `intro` is the legend.
- Dynamic numbers use `Intl.NumberFormat`; prose uses Persian/Arabic-Indic digits;
  technical identifiers and phone prefixes stay Latin/LTR.
- RTL pages isolate Latin tokens with `<bdi>` or `dir="ltr"`; phone examples keep
  the `U+200E` mark.

## Tests and verification

| Check | Actual result |
| --- | --- |
| Focused localization/parity suite | **PASS**, `tests/unit/localization-parity.test.tsx`, 17 tests |
| Full unit suite | **PASS**, 24 files / **244 tests** (baseline was 227) |
| `npm run lint` | **PASS**, zero warnings/errors |
| `npm run typecheck` | **PASS**, Next typegen + `tsc --noEmit` |
| `npm run build` | **PASS**, 33 static outputs; 27 localized marketing routes retained |
| `npm run test:http` | **PASS**, 27 localized documents, 73 unique destinations, locale `lang`/`dir`, localized 404, font/favicon/reference checks, API disabled (503) |
| `npm run verify:reference` | **PASS**, original ZIP/code.html/screen.png/DESIGN.md SHA-256 and member CRC/safety checks |
| `git diff --check` | **PASS** |

New durable coverage:

- recursive key/array/value parity across home, services, about, contact, privacy,
  work, work details, chrome and inquiry copy;
- no empty values or placeholder markers;
- primary FA/AR labels differ from English fillers;
- Arabic plural-address guard (positive list + singular-imperative scan, excluding
  the simulated concept chat line);
- cross-module pillar and SaaS terminology checks;
- inquiry form accessible name, single description render, hero CTA destinations;
- `dir="ltr"`/`bdi` isolation and LRM phone hints;
- concept-only work rendering and claim-pattern guard;
- localized 404/status copy and equivalent locale paths plus layout `lang`/`dir`.

Not rerun: PostgreSQL integration tests (no API, validation or persistence contract
changed) and browser visual/keyboard/screen-reader/zoom checks.

## Deferred owner / native review

- Native Persian/Arabic reading and tone review of the corrected copy (D8); the
  automated suite cannot prove copy quality.
- Final brand presentation: Latin `Echo Devs`, Persian `اکو دوز`, Arabic
  `إيكو ديفز`; brand transliteration needs owner approval.
- Public contact channels (D1), legal identity, jurisdiction, retention, deletion
  and privacy-contact decisions (D6). No legal/privacy wording changed beyond
  consistency.
- Homepage card titles vs services-page pillar titles still differ in granularity;
  unifying them is a copy decision, not a defect fixed here.
- Full P5 coverage/owner claim review (ECHO-502), RTL/bidi rendered audit
  (ECHO-503/505) and locale metadata/hreflang (ECHO-506) remain open.
- Browser/visual, keyboard, screen-reader, zoom and native acceptance remain open;
  no screenshot or assistive-technology result is claimed.

## Working-tree artifact disposition

- `tests/unit/assets.test.ts`, `tests/unit/marketing-audit.test.tsx` and
  `scripts/audit-browser.py` were already tracked in `6c8d596`.
- During this session another ECHO-407 tooling commit, `5acddc2`, added
  `scripts/webkit_snapshot.py` and related harness files. It is unrelated to
  ECHO-501 and was left untouched.
- Nothing was deleted, staged or committed from that unrelated work.

## Changed files

- `src/content/home.ts`
- `src/content/inquiry.ts`
- `src/content/services.ts`
- `src/content/about.ts`
- `src/content/chrome.ts`
- `src/content/README.md`
- `src/components/marketing/homepage.tsx`
- `src/components/marketing/contact-page.tsx`
- `src/components/marketing/inquiry-form.tsx`
- `tests/unit/localization-parity.test.tsx` (new)
- `docs/I18N-TERMINOLOGY.md` (new)
- `docs/P5-ECHO-501.md` (this report)
- `ROADMAP.md`
