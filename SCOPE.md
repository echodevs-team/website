# Echo Devs — Product & Engineering Scope

**Document:** SCOPE.md  
**Version:** 1.1 — approved UI baseline and delivery order
**Date:** 2026-11-05
**Status:** Approved strategic direction; implementation choices and unresolved real-world facts are labeled below.

> This scope turns the supplied `cvecho.zip` prototype into a credible, production-ready, trilingual lead-generation website. It does **not** authorize making up portfolio facts, testimonials, metrics, credentials, contacts, or compliance claims.

## 1. Executive product brief

### 1.1 Product
Echo Devs is a software development team serving Iranian and international customers. The website is a public-facing product/portfolio and an intake channel for qualified project inquiries, not a SaaS control panel or a generic résumé template.

**North star:** A visitor quickly understands **what Echo Devs builds**, **why the team is credible**, **what evidence supports that credibility**, and **how to initiate a project**.

### 1.2 Intended audiences
1. Small businesses and professionals needing professional business/personal websites or custom tools.
2. Startups and growing businesses needing web apps, SaaS, mobile apps, APIs, integrations, backend architecture, or product design.
3. Organizations needing targeted automation, data processing, intelligent business assistants, and integrations.
4. International clients seeking a small reliable team for remote project-based collaboration.

The site must communicate in business outcomes first; technology stack details support rather than dominate the message.

### 1.3 Product goals (ordered)
- G1: Convert a qualified visitor into a securely stored, reviewable project inquiry.
- G2: Create credible trust through real cases, clear team identity, visible process, and verified links.
- G3: Offer excellent Persian, English, and Arabic experiences, including correct RTL/LTR.
- G4: Feel premium, contemporary, polished, lightweight, and fast on mobile and desktop.
- G5: Provide clean SEO/indexable pages, sensible analytics, deployability, and maintainability.

### 1.4 Non-goals for v1
No user signup/login; no client portal, project management, public comments, payment checkout, live chatbot, complex CMS, newsletter, elaborate blog, proprietary analytics dashboard, or microservice architecture. No fake demos framed as deployed client work. No admin dashboard unless operational review genuinely requires one after launch.

**Implementation priorities (owner clarification):** faithfully reconstruct the approved HTML in Next.js; populate its homepage sections; immediately implement real validated inquiry/PostgreSQL persistence; then remaining service/work/about/contact pages; complete production-quality FA/EN/AR content; finish browser acceptance, accessibility, performance, SEO, security and deployment readiness. These priorities do not defer basic safety, accessibility or locale support in each feature. Browser unavailability leaves acceptance pending but does not prohibit implementation.

### 1.5 Decisions already accepted for planning
- Brand name: **Echo Devs**.
- Personality: **Hybrid**, mostly restrained/minimal with selective technical character.
- Palette: **Coral & Charcoal**, preserving and refining the existing warm visual direction.
- Three locales: `fa`, `en`, `ar`. Assumed initial/default locale `fa`; root redirects to remembered preference or browser preference if supported, otherwise `fa`, while `/fa`, `/en`, `/ar` remain permanent indexable routes. If product owner prefers a different root behavior, change before phase P5.
- Both light and dark themes, with system preference respected on first visit.
- No visitor login; inquiry persisted in database.
- Original `code.html` is the approved UI baseline, not visual inspiration. Preserve composition, hierarchy, sections, Coral & Charcoal identity, typography, spacing, proportions, cards, hero/CTAs and interaction character. Targeted accessibility/responsiveness/functionality/consistency/usability improvements are allowed; significant departures need explicit owner approval. We are migrating the existing website, not designing a new one.
- Recommended stack: **Next.js App Router + TypeScript + Tailwind (build-time) + PostgreSQL** in one cohesive application. A lightweight ORM/query layer, schema validator, and translation library should be selected after checking compatibility. Avoid speculative dependency additions and version pinning without verification.

## 2. Existing source / baseline audit

`cvecho.zip` contains only `code.html`, `screen.png`, and `DESIGN.md`. The source is a Persian RTL single-page HTML prototype with fixed header, animated canvas, hero, three service pillars, conceptual demos, benefits, six-stage process, inquiry form, and footer.

**Observed issues to resolve:**
- Contact form uses `event.preventDefault()` and reveals a success message without network/persistence.
- Tailwind is loaded from CDN with inline configuration; code is highly monolithic.
- Language controls are not functional translated routes.
- Mobile navigation lacks a robust accessible substitute when desktop nav is hidden.
- Page lacks key production metadata, structured content, and multilingual SEO.
- Project/contact links and displayed claims include examples/placeholders that require verification.
- `DESIGN.md` describes an older 'Sahara' burnt-sienna/serif concept, while HTML uses Coral and modern Persian typography; consolidate the brand specification.
- Continuous decorative animation requires reduced-motion handling and performance review.

**Migration rule:** Preserve ZIP/originals read-only. `design/reference/code.html` is authoritative for visual fidelity; `original/screen.png` supplements it, while the old Sahara DESIGN is superseded. Translate the HTML into current Next.js components/build-time styles, not a raw HTML iframe/injection or CDN-runtime copy. Preserve the approved UI rather than replacing it with generic primitives. Repair fake success, misleading claims, inaccessible contrast, redundant font providers and unsafe motion without treating their presence as approval. Record necessary deviations and obtain owner approval for significant changes. Screenshots/comparison remain required before release, not before starting reconstruction.

## 3. Information architecture

### 3.1 Public routes, v1
| Route pattern | Purpose | Main CTA |
|---|---|---|
| `/` | Deterministic locale selection/redirect | — |
| `/[locale]` | Homepage — positioning, services, proof, process, lead CTA | Start a project |
| `/[locale]/services` | Detailed grouping of services and deliverables | Discuss a need |
| `/[locale]/work` | Verified portfolio and explicitly labeled concepts | View project / Start a project |
| `/[locale]/work/[slug]` | Individual real case study **or** honest concept/demo detail | Discuss similar project |
| `/[locale]/about` | Team identity, working principles, capabilities | Contact the team |
| `/[locale]/contact` | Clear contact channels and inquiry form | Send inquiry |
| `/[locale]/privacy` | Accurate policy for inquiry data/cookies/vendors | — |

Keep route count deliberately small. Service-specific landing pages are **post-launch** unless clear content and search intent justify them. The same stable project slug may be shared across locales; localized visible titles/descriptions are required.

### 3.2 Global navigation
Logo/Home · Services · Work · About · Contact · Language switcher · Theme switcher · prominent project CTA. Mobile must offer a real keyboard-accessible menu with focus management, close-on-navigation, scroll lock where appropriate, and no hidden unreachable links. Do not overwhelm the header with all 7 sub-services.

### 3.3 Homepage content order
1. **Hero:** precise benefit-led positioning, differentiated secondary sentence, two CTAs (Start a project / Explore work), curated technical visual that does not dominate loading.
2. **Credibility strip:** only genuine proof (real shipped project count, team member public links, documented technologies, or an honest qualitative line). Omit numerical stats if not verified.
3. **Three service pillars:** distinct business outcomes, concise examples; links to services page.
4. **Featured work:** ideally 2–3 projects, each prominently marked `Client project`, `Internal project`, or `Concept demo`; one featured project may be larger for editorial hierarchy.
5. **Why Echo Devs:** 3–4 evidence-backed collaboration benefits.
6. **How we work:** practical discovery → scope → design → build → validate → deliver/handoff; no unsupported guarantees.
7. **Final CTA:** contact entry point; short inquiry form may be embedded or link to contact; avoid conflicting implementations.
8. **Footer:** verified email/social channels, navigation, locale links, copyright year automation, policies.

This section describes content responsibilities within the **existing HTML section composition**, not authority for a different layout or new editorial card hierarchy. Retain its section order and technical/capability strip; populate truthfully using approved facts or clearly labeled concepts, omitting unsupported metrics/contacts. New layouts, replacement artwork or changed card treatments need explicit approval unless required by a targeted fix. Do not let decoration harm readability.

### 3.4 Service taxonomy
Present **three top-level pillars** while making all services discoverable:
- **Digital products:** Business websites; Web applications & SaaS; mobile apps; UI/UX & product design.
- **Software systems:** Backend; APIs & microservices; integrations; data engineering.
- **Intelligent operations:** AI & automation; business chatbots; knowledge assistants and workflow integrations, with claims limited to actual capability.

Service details describe buyer problem, deliverables, examples, process, and CTA. Avoid overly broad 'we do everything' language. If a capability lacks credible evidence, describe it conservatively, or defer from primary marketing.

## 4. Content and trust requirements

### 4.1 Content integrity policy (hard launch gate)
Every client/project claim, metric, testimonial, client logo, compliance badge, team role, contact route, and social link must be verified by the product owner. Demo placeholders must visibly say **Concept / Demo / Internal experiment**, not imply deployed production impact. No fictitious revenue growth, zero failure rates, request throughput, response SLAs, compliance certifications, privacy guarantees, or project customers. Remove all unverified claims in the existing HTML.

Use structured in-repo content files for v1 rather than introducing a database CMS. Each work item should include: stable ID/slug, type (`client`, `internal`, `concept`), title, summary, problem, approach, role/contributions, technologies (only true), actual visual asset, results/evidence if documented, and optional live/source links. Support graceful omission of absent links and results.

### 4.2 About page
Explain team focus, process, values, areas of specialization, member names/roles **only if approved**, public profiles **only if real**, and a realistic way to work together. If personal details cannot be published, emphasize verified team capabilities without invented biographies or photos.

### 4.3 Copy standards
- Persian natural, concise, buyer-first; English idiomatic, not literal machine translation; Arabic reviewed for idiomatic style.
- Avoid fluff such as '100% guaranteed ROI', 'error-free', 'world-class', 'HIPAA-compliant' without evidence.
- Distinguish services delivered now from capabilities being developed.
- Consistent primary CTA and language-specific microcopy (navigation, validation, empty states, buttons, success and error messages).
- Scope excludes legal drafting as authoritative advice: owner must supply/approve privacy and data retention statements before publication.

### 4.4 Verified external contact points
No placeholder `mailto`, `t.me`, `github.com` root links, empty demo URLs, or dead `#` anchors may appear in production. Show only approved actual channels. Domain, inbox and social handles are **unknown** and require owner confirmation before go-live.

## 5. Design / UX system

### 5.1 Visual foundation
- Color system: Coral accent, Charcoal/near-black, warm neutral surfaces; light and dark theme variants, semantic tokens rather than scattered hard-coded hex values.
- Existing coral `#EE7758` may be the starting brand anchor; contrast must be tested for actual text/button pairings. Adjust accessible shades without losing the brand.
- Typography: Persian/Arabic-friendly family such as Vazirmatn, complementary readable English sans; monospace sparingly for labels/technical detail. Avoid shipping multiple redundant font providers and unnecessary weights.
- Layout: restrained max-width, responsive 12-column desktop grid or equivalent, consistent spacing, typography scale, card radius, subtle borders and shadows.
- Preserve the baseline brand presentation; any replacement of its mark/wordmark requires owner approval. Variant assets may be derived consistently, not used as a reason to redesign.
- Components: Header, MobileNav, Button, Link, Badge (only status/type), SectionHeading, ServiceCard, WorkCard, Field, FormStatus, LanguageSwitcher, ThemeSwitcher, Footer.

### 5.2 Breakpoint and interaction behavior
Test at minimum 320px, 375px, 768px, 1024px, 1440px, plus a long-text zoom/reflow case at 200%. No horizontal scrolling except intentionally scrollable data. No content obstructed by sticky/fixed header. Touch targets ~44×44 CSS pixels wherever practicable. Keyboard and screen-reader states must remain usable.

### 5.3 Motion policy
Meaningful and low-cost motion only; decorative canvas and scroll effects disabled for `prefers-reduced-motion: reduce` and paused for hidden/idle states if retained. Prefer CSS transitions and static hero visuals over full-screen continuous animation. No animation required to understand the content or access CTA.

### 5.4 UX states
Every actionable UI includes loading, success, failure, invalid input, empty/missing content where applicable, disabled/retry states, and clear focus state. The form must never claim success before server acknowledgement and durable DB write.

## 6. Internationalization and SEO

### 6.1 Locale behavior
- Dedicated URLs: `/fa/...`, `/en/...`, `/ar/...`.
- `fa`/`ar`: RTL; `en`: LTR; proper `<html lang>` and `dir`, logical CSS properties, Unicode-safe mixed numerals, email, code, dates and phone (`dir="ltr"` where needed).
- Switching languages retains equivalent current route/project where available.
- Dictionary parity is validated in CI; no untranslated English control strings on Persian/Arabic pages and no duplicated literal copy scattered across components.
- Text layout should accommodate Arabic shaping, long translations, and Persian numbers without breaking control alignment.

### 6.2 Crawlability
- Unique title and meta description per locale and major page; canonical URL; Open Graph + social sharing image; robots and sitemap; appropriate alt text.
- Indexable localized server-rendered HTML and cross-locale `hreflang` alternates. Do **not** rely exclusively on JavaScript toggles or cookies to expose translations.
- Use structured data only for supported and verified organization facts; do not fake reviews/ratings.
- 404 and not-found behavior per locale; no index for non-public previews and incomplete placeholder pages.

The routes and hreflang strategy match official Next.js i18n and Google Search Central guidance. Re-check current documentation during implementation.

## 7. Inquiry / lead ingestion — required full-stack feature

### 7.1 Field design
- `fullName`: required, 2–120 chars.
- `email`: optional valid email, if phone is supplied; otherwise required.
- `phone`: optional validated, if email is supplied; otherwise required. Accept international formats; don't force an Iran-only `09...` rule.
- `service`: optional/required as UI design decides, from stable enum with localized labels; support `not_sure`.
- `budgetRange`: optional enum; avoid fixed-price promises.
- `timeline`: optional enum or free-form if necessary; separate budget from timeline (existing HTML confuses them).
- `description`: required with server-enforced length (e.g. 20–5000 chars).
- `locale` and `sourcePage`: derived by server or tightly validated.
- Privacy consent: only if legally/operationally required; never add prechecked marketing consent.
- Anti-bot honeypot/timestamp or configured challenge; don't make humans solve unnecessary friction.

The public form should be reusable between home and contact page, with a single validated backend path. No attached file upload in v1. There should be no dependence on visitor account creation.

### 7.2 API behavior / data lifecycle
Proposed `POST /api/inquiries` or framework-equivalent server action:
1. Accept only expected fields and permitted content type/size.
2. Server-side validation independent of browser rules; trim/normalize carefully without mangling names.
3. Apply shared-store rate limits/anti-spam controls; no security dependence on client-only checks.
4. Write to PostgreSQL in a transaction; return a generated opaque reference ID on success.
5. Only after commit, show accessible success state and prevent accidental double-submit; on error display retry path and retain draft locally in memory while page remains open.
6. Notify team by email only if verified address and reliable credentials configured; notification delivery failure must not silently erase saved inquiry. Expose/report notification failure operationally.
7. Give operator a secure review method (restricted CLI/read-only query or authenticated provider console) **without building an admin UI** for v1.
8. Define a retention/deletion process, minimal PII access, backup security, and privacy policy that matches reality.

Never place full inquiry payloads in analytics, error traces, browser URLs, or routine logs. Never render submitted text as unsanitized HTML.

### 7.3 Minimal suggested model
`Inquiry`: `id` (UUID), `createdAt`, `updatedAt`, `fullName`, `email?`, `phone?`, `service`, `budgetRange?`, `timeline?`, `description`, `locale`, `sourcePage?`, `status` (`new|contacted|qualified|closed|spam`), `consentAt?`, `deletedAt?`. Index by `createdAt`, `status`. Keep anti-abuse tokens in separate ephemeral rate-limit storage, not permanent PII columns. Add indexes/migrations with tests. Do not over-model a CRM.

### 7.4 Reliability scenarios
- Valid request: one DB record, visible success, traceable reference.
- Invalid request: 4xx, field-level errors, zero records.
- Network outage: clear failure/retry, no false success.
- Double-click/retry: no accidental duplicate record; implement bounded idempotency if feasible.
- DB unavailable: controlled 5xx, no data-loss success.
- Bot flood: resource usage bounded, rate-limit responses.
- Email notification unavailable: stored inquiry remains accessible.
- International phone, RTL names, long Persian/Arabic text: stored and displayed intact.

## 8. Technical architecture

### 8.1 Proposed deployment shape
One full-stack Next.js application serving public pages and inquiry endpoint; PostgreSQL for lead data; statically/SSR-rendered marketing pages; minimal server API; secrets in host-managed environment; managed or self-hosted DB. Run on an appropriate production service, **not** on the isolated `agent-lab` development VM by accident.

Deploy option A: Dockerized Node application + PostgreSQL (managed or separate private container), TLS reverse proxy, encrypted backups, monitoring, and versioned rollout on a VPS. Option B: managed Next hosting + managed PostgreSQL. Select based on cost, reachable services, operational burden, and owner access, not popularity. Never embed production secrets in code or agent transcripts.

### 8.2 Project structure (illustrative, not mandatory)
```
src/
  app/[locale]/(marketing)/{page,services,work,about,contact,privacy}/
  app/[locale]/(marketing)/work/[slug]/
  app/api/inquiries/
  components/{layout,ui,marketing,forms}/
  content/{services,work,team}/
  i18n/{config,dictionaries}/
  lib/{db,validation,security,seo}/
  styles/
  tests/{unit,integration,e2e}/
db/migrations/
design/reference/
```
The real folder layout should follow framework conventions and remain compact. Do not overengineer interfaces or dependency injection for static content.

### 8.3 Operational requirements
- Reproducible install, deterministic lockfile, `.env.example`, secret hygiene.
- `lint`, `typecheck`, unit/integration tests, production build and core browser smoke checks in CI.
- Migrations run safely with rollback/backup plan; never reset production DB automatically.
- App logging includes correlation IDs and redacts PII; errors recover gracefully.
- TLS, security headers, scoped DB role, dependency vulnerability review, CSRF/origin protection where appropriate, safe request size, spam/rate limits.
- Backup of inquiry records with verified restoration procedure; avoid backups in publicly served paths.
- Privacy-aware analytics only after owner approves provider, consent model where applicable, and actual tracking scope. Basic events can be `cta_clicked`, `inquiry_started`, `inquiry_submitted` (never form text or contact details).

## 9. Quality attributes and measurable gates

| Dimension | Target / acceptance |
|---|---|
| Accessibility | WCAG 2.2 AA-oriented audit; no critical keyboard blockers, visible focus, correct labels/errors and `lang/dir`, reduced motion |
| Performance | Mobile Lighthouse performance >= 90 **target** under documented repeatable test conditions; LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at p75 when meaningful field data becomes available |
| Reliability | All valid leads persist once; errors do not report false success; operator can retrieve a record |
| Mobile | Fully usable at 320, 375, 768px; no blocked CTAs, overflow, or hidden navigation |
| Localization | 100% required page/control key coverage for `fa/en/ar`, localization QA complete |
| Security | Server validation, rate limiting, safe secrets, restricted DB, abuse test, no PII leakage |
| SEO | Indexable clean localized routes, correct canonicals/hreflang/sitemap/metadata |
| Test quality | CI green, no critical or high severity unresolved release blockers; E2E inquiry happy+failure tests |
| Content integrity | Every displayed claim, address, handle, work item type and outbound link verified |
| Operability | Production deploy, log access, backup, restore test, and rollback documented |

Performance numbers are objectives, not promises and must not justify removing necessary accessible functionality. Automated audits do not replace manual browser testing.

## 10. Release constraints / non-negotiables

**Never launch if:** inquiry reports success without persistence; forms leak personal data; mobile navigation fails; English/Arabic pages are incomplete; TLS missing; critical exploit present; fake evidence presented as fact; broken primary CTAs; no operational way to retrieve leads; no rollback/backup plan.

**Change control:** The owner must approve domain/hosting costs, final public contacts, authentic portfolio entries, logo direction, privacy/retention policy, launch, and any outgoing communication involving a real customer. Developer agents may implement, test, refactor, and document authorized work within the allowed project workspace. Agents must never stage files, create/amend Git commits, or push changes in this project. Leave changes for human review and suggest a commit message only.

## 11. Key unknowns / deferred owner decisions

| Key | Question / required evidence | When it blocks |
|---|---|---|
| D1 | Which domain and verified public email + social links? | Final copy, links, launch |
| D2 | Which 2–3 projects may be published, and what exact verified evidence/screenshots/links are allowed? | Portfolio release |
| D3 | Team public identities/roles vs organization-only about page? | About release |
| D4 | Production host and desired monthly budget (managed vs VPS)? | P7 deployment |
| D5 | Who reads leads, by what secure means; should email notifications be enabled? | P2 operational gate |
| D6 | Privacy notice, data retention period, applicable legal needs, tracking/consent? | Production launch |
| D7 | Owner sign-off on final logo and core copy/visual design? | Brand/design approval |
| D8 | Confirm initial locale behavior (`fa` assumed) and translation review process? | P5 release gate |

Agents should proceed using labeled placeholders in development, not invent answers. Block **only the task requiring owner input**, and continue independent work.

D7 is narrowed by the 2026-11-05 approval: the HTML visual direction is already approved. Approval is still needed for significant departures, new identity assets and final factual/core copy, not permission to begin faithful reconstruction. D1–D8 do not block the homepage's safe layout or disposable local inquiry implementation; they block their specific published content, operational or release decisions.

## 12. Definition of done (per task and per milestone)

A task is done only if: implemented narrowly; meets acceptance criteria; tests/quality checks run and results included; desktop/mobile and locale regressions checked when UI-facing; docs/status updated; no new unresolved security/PII issue; and report references task ID. Git commits are not required and must not be created by agents. A milestone is done only after its gate is demonstrated, not because its checklist was merely marked. The roadmap is the executable checklist.

**Source references:** existing `cvecho.zip` + product decisions in this conversation. Implementation-time validation: official Next.js internationalization documentation and Google Search Central multilingual site guidance.
