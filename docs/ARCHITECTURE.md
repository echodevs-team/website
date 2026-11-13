# Production architecture and P1 handoff

**P2-B2 local operations implemented, 2026-11-07:** private CLI readback, separate NOLOGIN capability groups, deliberate replay-safe erasure, bounded encrypted snapshot/empty-target restore and atomic TTL cleanup. Migration owner configuration is separate from the app environment; `--verify` checks history read-only. Runbooks/data inventory: `INQUIRY-OPERATIONS.md`, `INQUIRY-PRIVACY.md`; evidence: `P2-B2.md`. Operator identity/retention and actual deployment/CI/browser acceptance are not resolved by these fixtures. Notifications remain absent.

**P2-B1 implemented, 2026-11-07:** canonical localized client form, memory-only frozen same-key retries, migration 002 network buckets/cleanup, explicit local-only vs authenticated proxy network resolution. See `P2-B1.md` for exact MAC contract, tested limits and actual evidence. This supersedes the earlier “form disabled / global-only” implementation state, not production assumptions. API remains opt-in; native browser, proxy trust/host maintenance and operator handoff acceptance remain open. No arbitrary forwarded IP headers are trusted.

**P2-A implemented, 2026-11-07:** ECHO-201–204 now have a private local PostgreSQL foundation, checksummed SQL migrations, strict shared validation and a fail-closed POST endpoint. Direct `pg` + SQL was chosen instead of the earlier suggested Drizzle layer: three small tables do not require an ORM. See `P2-A.md` for the actual contract, dependency/tooling decision and evidence. Global shared attempts/origin/honeypot and backend replay protection are implemented portions of ECHO-206/207; per-network abuse controls, form wiring, operational handoff and browser/CI acceptance are still outstanding. The forward architecture below is not a claim that all P2 is complete.

**Implementation update:** ECHO-101/102/104/106 are complete; shared primitives/Header and ECHO-107/108 theme/navigation are implemented with browser acceptance pending. See `P1-FOUNDATION.md`, `P1-PRIMITIVES.md` and latest `P1-SHELL.md` for versions, source boundaries and actual checks. This document otherwise remains the forward architecture for later phases. ECHO-003 has an owner-authorized deferral, not a completed baseline.

P0 recommendation, 2026-11-04; not an implemented application. Requirements trace to SCOPE §§3–9 and ECHO-101–210. Structural fit is validated against that scope; installed framework/ORM APIs, cold build, DB connectivity and hosting compatibility have **not** been validated. The initial audit performed no dependency downloads; the follow-up installed isolated Playwright under approved temporary storage, but the browser download failed. No app dependencies or deployment. See `P0-FINALIZATION.md` for the latest evidence and scope cross-check.

## Shape and boundaries

**Current owner handoff, 2026-11-05:** original `code.html` is the approved authoritative UI baseline. Preserve its visual composition in Next.js, not a redesign. ROADMAP's immediate order supersedes historical screenshot-before-replication restrictions: faithful homepage first, real inquiry/PostgreSQL immediately next, remaining pages/localization/hardening afterward. Missing VM browser does not block implementation; actual browser/reference evidence remains required before release.

One Next.js App Router application, TypeScript strict mode, build-time Tailwind, PostgreSQL. Public marketing pages render server-side or statically; route handlers handle mutations in the Node runtime. No microservices, Redis, message broker, visitor login, CMS or admin dashboard. Prefer built-in platform features to extra packages.

Recommend npm (available, no existing lockfile), next-intl for explicit locale routes/messages, Zod for validation, Drizzle + `pg` for typed SQL/migrations, Vitest for unit tests and Playwright for E2E. Add accessibility tooling only when its test is added. These are selections to validate, **not pinned/installed dependencies**. In ECHO-101 check current stable Next/React/TypeScript/Tailwind compatibility, Node engines, peer ranges, maintenance/security, licenses and lifecycle scripts, then create one lockfile and record actual versions. Node 24.21.0/npm 11.19.0 are available; this alone does not prove framework compatibility. Do not follow the prototype's “Next.js 15” label as a version requirement.

```text
src/
  app/
    (entry)/
      layout.tsx                     # minimal root document for / redirect
      page.tsx                       # negotiated / redirect (no cross-user cache)
    [locale]/
      layout.tsx                     # validated locale, html lang/dir, providers
      (marketing)/
        page.tsx                     # homepage
        services/page.tsx
        work/page.tsx
        work/[slug]/page.tsx
        about/page.tsx
        contact/page.tsx
        privacy/page.tsx
    global-not-found.tsx              # routing-level 404 document, locale from proxy
    api/inquiries/route.ts            # only public mutation path
    sitemap.ts
    robots.ts
  components/
    layout/                          # Header, MobileNav, Footer, Container
    ui/                              # Button/Link, Card, Field, SectionHeading
    marketing/                       # Hero, Services, Work, Benefits, Process, CTA
    forms/                           # InquiryForm + accessible FormStatus
  content/                           # typed services/work/team, approved visibility
  i18n/                              # locale config, routing/request setup, messages
  lib/
    validation/inquiry.ts            # pure shared schema, stable field/error codes
    inquiries/                       # server-only submission orchestration
    db/                              # server-only client/schema, small pool
    security/                        # origin, limits, anti-spam, redacted logging
    seo/                             # metadata/alternates helpers
  styles/globals.css                 # semantic tokens and base typography
db/migrations/                       # versioned, reviewable SQL
public/                              # only approved optimized images/fonts/icons
tests/{unit,integration,e2e}/
design/reference/                    # frozen originals, NEVER public assets
docs/                                # decisions, evidence, later operations guide
scripts/                             # narrow reviewed local maintenance/test tools
```

Layout represents intended boundaries, not a scaffold. Use separate root layouts for `(entry)` and `[locale]`, each rendering `html/body`; do not add a shared `app/layout.tsx` that hard-codes FA or nests documents. This keeps the localized root responsible for `lang/dir`, and the negotiated `/` redirect has a valid minimal document. Validate current Next/next-intl support in ECHO-101/106, including unknown-locale handling before dictionary loads, localized not-found/error pages, root/global 404 behavior and metadata routes. A document navigation on locale-root changes is acceptable; preserving the equivalent route matters more than avoiding a reload. Retain a small number of route/layout files; do not create a module/service class per component.

Verified P1 choice: allowlisted static params (`dynamicParams=false`) and a **routing-level** global fallback, not a catch-all page that throws during document rendering. The original throw-based 404 arrangement produced Next error-shell HTML without document language; a shared-root trial did not fix it and was removed. `src/proxy.ts` overwrites a validated internal locale header for the independent error document only; normal locale pages remain prerendered. Next's documented experimental `globalNotFound` flag is the narrow accepted technical dependency, with HTTP regression tests for status, actual rendered copy, lang/dir and header spoofing. Recheck on framework upgrades. The language switch stays server-rendered for no-script and static navigation; a small client island only writes the validated `echo_locale` preference cookie on an intentional switch and carries a safe in-page fragment. Query strings are not propagated because marketing routes define no query state.

**Server:** layouts, static content cards, metadata, DB and submission logic. **Client islands:** theme control, mobile menu/focus handling, language preference control where needed, inquiry state, optional decorative effect. Never import server configuration or DB modules into client code. Send only current-locale interactive messages to the browser. Home/contact share exactly one form implementation and endpoint. Content and semantic tokens are coordinated contracts before P2/P3 overlap.

## Content and localization

Typed in-repo work records: stable slug, `client|internal|concept`, per-locale title/summary/problem/approach/contribution, actual technologies/assets, optional documented results and approved live/source links. Include review/provenance status; publication requires approval, not merely a nonempty field. Omit unavailable links/results. Unknown slugs return 404; do not fabricate case studies to populate routes.

Explicit allowlist `fa/en/ar`; reject unknown locale values. Generate permanent indexable localized routes; FA/AR RTL and EN LTR. Use logical spacing/alignment, `bdi`/LTR isolation for contact/code strings, native-reviewable translations and locale-aware formatting. Language switch maps the current logical route and stable slug, never does blind string replacement. If a translation is unavailable in development, show an explicit nonpublic placeholder; incomplete public routes are a release blocker, not silently English content.

Typed message keys and CI parity across all three dictionaries include navigation, form errors/loading/results, accessible names and not-found states. Root uses a validated preference cookie (written only on an intentional language switch) then supported Accept-Language then FA, temporary redirect with suitable `Vary`/private no-store behavior. Explicit locale URLs never redirect merely because of a cookie. Framework request interception filename/API is a P1 compatibility check, not copied from old Next patterns. Canonicals/hreflang/sitemap use the owner-verified origin; no guessed production domain. Do not index previews or incomplete placeholders. Unique server-rendered metadata per locale/page; structured data only for verified facts.

## Inquiry contract and persistence (P2)

Recommend `POST /api/inquiries` JSON over separate actions: one explicit, independently testable contract for both forms. No public GET/read endpoint. Initial payload limit 32 KiB **while reading the stream** (not only Content-Length); JSON only. Validate Origin against configured trusted origin, do not enable permissive CORS, and validate proxy headers only from a documented trusted proxy. Native non-browser clients are not an implicit supported API. Origin protection does not replace abuse controls.

- Shared strict schema rejects unknown keys and validates SCOPE §7.1: name 2–120, email/phone alternative, description 20–5000, stable service including `not_sure`, optional separate budget and timeline, allowlisted locale and source path. Separate email and phone UI inputs, not the ambiguous prototype field. Normalize whitespace and local-script phone digits carefully; preserve names, Unicode and international `+` formats. Phone validation method/dependency is selected/tested in ECHO-203, not invented as an Iran-only regex. Consent fields only if D6 requires them.
- Client pending state disables double click; server remains authoritative. Use an opaque random submission UUID as idempotency key, reused on uncertain retries, scoped to the same normalized payload. Persist a keyed digest plus key in a separate short-lived `InquirySubmission` table (key, digest, inquiryId, expiresAt), under a unique constraint, atomically with the inquiry; concurrent retries yield the same reference, changed payload with same key returns 409. Bound key lifetime (proposed 24h) and cleanup; after expiry a repeat can create a new inquiry. Check expiry during conflict resolution, not only during cleanup. This is bounded duplicate prevention, not an exactly-once promise forever. Do not expose prior inquiry fields through replay responses. Retention deletion must also remove related submission metadata.
- `Inquiry`: UUID, created/updated timestamps, fullName, optional email/phone, service, optional budgetRange/timeline, description, locale, allowlisted sourcePage, status (`new/contacted/qualified/closed/spam`), conditional consentAt. DB constraints for at least one contact, enums/lengths, indexes on createdAt/status. Prefer actual deletion after approved retention; add deletedAt only with a documented purge rule (soft deletion alone is not retention compliance).
- Anti-abuse: honeypot plus timestamp as low-cost signals, not sole protection; a signed timing token is optional only if justified by observed abuse, not another prerequisite endpoint. PostgreSQL shared fixed-window counters in a separate `RateLimitBucket` table (key, windowStart, count, expiresAt), atomic upsert, keyed-HMAC network identity, short expiry and scheduled cleanup; do not persist raw IPs in Inquiry. Proposed starting limit 5 submissions/10min per network key plus bounded global cap; tune with tests/owner traffic expectations and shared-NAT usability. IPv6/proxy trust rules must be explicit. Apply cheap size/origin/input gates and shared attempt limits before idempotency lookup; retries must still be rate-bounded and the UI honor Retry-After. Bound body/pool/query timeouts and bucket cardinality; unauthorized flood must not monopolize DB. Use host request limits when later available, but no changes to VM networking. P2 must select/test a host-supported maintenance command/schedule for expiry cleanup (no queue service); fail closed with retryable error if required shared storage is unavailable.
- Resolve valid idempotent retries without creating duplicate writes; invalid/abusive requests create zero Inquiry rows (ephemeral abuse state may change). Enforce transactional atomicity and uniqueness in DB, not read-then-insert client logic. Success only after confirmed commit; if the response is lost, retry using the same key. On uncertain commit outcome never show premature success.
- Responses: 201 new / 200 replay with opaque reference only; 400 malformed/validation with stable localized error codes, 403 origin refusal, 409 key conflict, 413 too large, 415 type, 429 rate limit + Retry-After, controlled 503 unavailable. No SQL/internal exception details, echoed descriptions, PII or keys in logs/URLs/analytics. UI retains draft **in memory**, announces field/error summaries and result, supports retry without silently clearing inputs. No localStorage PII drafts.

Least-privilege app DB role and separate migration/operator roles; parameterized SQL, server-only environment, bounded connection pool compatible with eventual host. Integration tests must exercise actual PostgreSQL transactions/concurrency, not just ORM mocks. No DB reset against real data.

**Operations:** owner-approved restricted provider console or local secured readback command, not a web admin. Test anonymous access rejection and authorized retrieval of the returned reference. D5 blocks operational completion, not schema design. Notifications stay disabled absent an approved inbox/provider; if added, durable save is independent of send failure, with redacted operational error visibility. A reliable retry/outbox is deferred until explicitly needed, not an excuse for a queue now. D6 must define retention/purge, backup expiry, deletion access and actual privacy notice before launch. No routine full payload logging or traces. Backups, restore and rollback require real P6 rehearsal, not a documentation-only pass.

## Security, accessibility and performance gates

Treat all submissions as text; no HTML rendering, file uploads or email-header interpolation. Validate sizes before parsing, enums/paths before use. Plan CSP without runtime CDN scripts, frame-ancestors, nosniff, referrer policy and a restrictive permissions policy; account for any theme-init script using hash/nonce appropriate to chosen rendering model. HSTS only on a verified TLS deployment. No secrets in `NEXT_PUBLIC_*`, git, public paths or test artifacts. Tests and diagnostics use disposable synthetic inquiries; browser traces/screenshots of real PII must not be published.

WCAG 2.2 AA-oriented checks: contrast of actual states, focus visibility/order, skip link, correctly named fields, inline errors/error summary, live result, no keyboard traps, focus restoration/close-on-navigation mobile menu, target sizing, reduced motion, 200% zoom and screen-reader spot checks. Automated axe checks supplement, not replace, manual checks.

Prefer local licensed fonts, optimized images, server components and minimal client JS. Preserve baseline technical artwork, card/glass treatments and interaction character, using bounded effects or faithful static fallbacks for accessibility/performance. Do not replace the UI with unrelated opaque cards/art by default. Performance targets remain SCOPE goals: repeatable mobile Lighthouse >=90, eventual field p75 LCP <=2.5s / INP <=200ms / CLS <=0.1. Record conditions and targeted deviations; P0 does not establish these results.

## Testing and implementation order

1. Preserve implemented foundation and compatible ECHO-105/107/108 behavior. No additional generic UI infrastructure without a concrete feature need; acceptance gaps remain open.
2. **Next ECHO-301–307:** port actual homepage sections to server marketing components/content in ROADMAP's focused increments. Existing preview CSS (narrow main, static Header, dot wordmark, generic cards) is not the visual target. Adapt presentation to approved HTML while preserving safe theme/menu/locale logic. Use section anchors until detail routes exist. Reconstruct inquiry region honestly disabled until persistence; no fake success/PII collection. No raw reference iframe/HTML injection, external Tailwind runtime or copied unsafe handlers. ECHO-109/308 compare this work when browser evidence is available, not an alternative-design prerequisite.
3. **Immediately next ECHO-201–210:** DB/schema/validation → endpoint/form/security/idempotency → restricted readback/failure tests. Reuse one canonical form in homepage/later contact page. Disposable PostgreSQL integration is mandatory; missing browser may defer E2E acceptance, not DB implementation. Notifications stay disabled absent approval.
4. P4 pages → P5 full content/native review → P6/P7 release gates. Basic localization/accessibility/security accompany every feature. Existing Fedora browser via localhost-only SSH is a valid verification path; no isolation changes/repeated installs.

**Unit:** validation limits/contact alternatives/FA-AR Unicode, enums, message parity, safe route mapping, content visibility, errors, normalization, expiry boundaries. **Integration:** fresh migrations, constraints, valid insert/readback, invalid zero insert, concurrent duplicates, replay conflict, rate-limit counters/expiry, DB timeouts/unavailable and notification failure isolation if enabled. **Browser:** actual CTA→contact→submit→DB readback; invalid, DB failure, double-click, lost response/retry, mobile focus, locales and themes. **Matrix:** 320/375/768/1024/1440 plus zoom, keyboard/reduced motion; Chromium plus Firefox/WebKit when available. No real customers or external messages in tests.

CI foundation: `.github/workflows/ci.yml` defines one GitHub-hosted Ubuntu 24.04 job with verified Node/npm versions, npm-download caching and locked install/lint/typecheck/unit/build checks, contents:read only and no custom secrets. Local commands and disposable negative checks pass; **hosted verification is pending, no remote configured**. See `CI.md`. Browser/DB jobs are not implemented; add those only when the corresponding integration tasks require them. Review actions/package lifecycle scripts before execution, pin action SHAs, and use no production secrets. Browser tooling must launch with its sandbox enabled; never solve launch failures by adding `--no-sandbox` or changing VM security settings. Distinct development/test/production DB URLs and roles are mandatory: destructive tests require an explicit disposable-test database identity check, never an implicit production fallback. Production artifacts must exclude reference HTML/ZIP/screenshots, test tooling and credentials, including from container build context where possible.

## P1 prerequisites and remaining risk

Source provenance is verified; browser/sign-off remains pending, not an implementation blocker under current owner authorization. Historical Git/tooling observations in P0 reports are not current status checks. Verify isolated PostgreSQL availability at ECHO-201; do not assume a DB/container daemon or modify system/host configuration without approval. Browser evidence is mandatory before release; use the existing Fedora workflow if VM binaries remain unavailable. No automatic Git publication.

Choose production managed Node+DB or containerized Node+private DB later (D4). Both need TLS, migrations, secure secrets, reachable services, backups, restore, log access and rollback. Static-only hosting cannot satisfy durable inquiry storage. Serverless needs explicit pooling/connection limits; VPS needs an owner capable of patching/backups. VM is development-only, not a production target; isolation/host networking must remain unchanged. Hosting, domain, vendors, real PII, paid services and release need owner authorization. None was performed here.
