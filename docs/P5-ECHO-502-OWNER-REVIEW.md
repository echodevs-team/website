# ECHO-502 owner review — sensitive claims and translation decisions

**Status:** review package ready; no owner, native-language or legal approval is
recorded in this document. **Current preview remains safe** because intake is
disabled by default (`INQUIRIES_ENABLED=false`), the site is `noindex, nofollow`,
and all concept work is explicitly labeled.

This is the concise decision package for ECHO-502. It groups related questions so
the owner does not need to answer every editorial sentence. Full technical
evidence is in [`docs/P5-ECHO-502.md`](P5-ECHO-502.md); the implemented
disclosure is in `src/content/privacy.ts` and
`docs/INQUIRY-PRIVACY.md` / `docs/INQUIRY-OPERATIONS.md`.

## How to read severity

- **Blocker** — resolve before enabling real-user inquiry intake or public
  release. Nothing here blocks continued preview work.
- **Important** — owner review required before publication, but the current
  wording is safe and qualified.
- **Minor** — editorial polish that can wait.

## Claim review matrix (material items only)

| # | Claim or short paraphrase | Locale(s) / source | Evidence | Classification | Severity | Recommended action |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | “Echo Devs is a collective software team / a small group” | About description and team section; home badge; chrome tagline | No member profiles, registration, office, founding date or statistics are published; About explicitly withholds them | Unverified business identity | **Important** (launch/About) | Keep the generic collective wording or supply owner-approved identity facts (D3). Do not invent names or roles. |
| 2 | Websites, custom software, AI and automation capability | Home, Services, About | Presented as possible scopes, capabilities and working approach; no completed client work or result is implied | Clearly framed proposal | Minor | Preserve qualifications; no factual edit needed. |
| 3 | Deliverables, examples, workflows and exclusions | Services and concept details | Repeatedly labeled “possible”, “illustrative”, “proposal”, “not a completed project” | Clearly framed proposal | Minor | Preserve. Changes should keep the same limits in all three locales. |
| 4 | “No fixed timeline, response time or business result is promised” | Contact, Services, About | Consistent disclaimers; no SLA or turnaround claim | Verified editorial safeguard | Minor | Preserve. Do not add delivery promises without an approved operating policy. |
| 5 | Three concept studies, their stack tags and static visuals | Home concepts, Work, Work detail | All records are `kind: "concept"`; client/internal groups are empty; stack tags are labeled possible choices; visuals are static | Concept/demo — not client evidence | Minor | Preserve. Real client/internal work requires verified evidence and permission (D2). |
| 6 | “Healthcare booking portal” concept | Home booking card; booking detail | Explicitly says medical records, payments and regulatory compliance are not implemented or certified; no clinical advice | Concept/demo, health-adjacent | **Important** | Keep the disclaimer; owner/native review before any stronger healthcare wording. |
| 7 | “Project inquiry is the implemented contact path” | Home `contactsPending`, Contact guidance, About next step, footer | The shared form exists on Home and Contact; API is opt-in and returns 503 by default; success appears only after a confirmed DB commit | Verified implementation fact | Minor | Preserve. Enabling intake requires decisions below. |
| 8 | “This preview is not a public launch; intake requires the local API” | Inquiry note, Contact form note, privacy notice | Matches `INQUIRIES_ENABLED`, handler 503 default and `noindex`; no fake success | Verified implementation fact | Minor | Replace the dev-preview note only when production intake/hosting is approved. |
| 9 | Collected fields, purpose, source-page allowlist and technical expiry | Privacy data/storage/temporary sections | Matches Zod schema, DB constraints, 32 KiB cap, 24-hour replay row, 10-minute network bucket, global 30-attempt window, `/64` grouping | Verified implementation fact | Minor | Re-verify this page if the form, schema, limits or storage changes. |
| 10 | Retention, deletion, backups, controller, jurisdiction, privacy contact and legal basis are unresolved | Privacy notice/retention/updates; inquiry and contact notes | `docs/INQUIRY-PRIVACY.md` records retention/legal identity as unset; no automatic business purge; no published privacy contact | Unresolved operational policy + legal review required | **Blocker** (real-user intake) | Owner + legal must supply/approve before intake. Keep the current technical disclosure and no compliance claim. |
| 11 | No analytics, advertising, social embeds, marketing cookies or external notification providers; self-hosted fonts | Privacy third-parties | Source scan and self-hosted WOFF2 files; only `echo_locale` read and `echo_theme` localStorage | Verified implementation fact | Minor | Preserve. Re-review and disclose if any processor, analytics or notification service is added. |
| 12 | Security safeguards described; no certification or hosting guarantee | Privacy storage/third-parties | Parameterized SQL, least-privilege roles and insert-only application access on `inquiries` are implemented; TLS, production hosting, encryption at rest, logging and named operators are not approved/verified | Verified implementation fact + unresolved production policy | **Important** (production) | Keep “no certification” wording; approve hosting/encryption/logging/operator policy before launch (D4/D5). |
| 13 | No public email, phone or social profile is published yet | Home, Contact, About, footer | No verified channel exists in content; the form is the only contact path | Withheld/unverified business fact | **Important** (launch) | Supply verified channels and publication permission (D1), or keep them omitted. |
| 14 | Brand appears as Latin `Echo Devs`, Persian `اکو دوز`, Arabic `إيكو ديفز`; the header/footer also show a fixed Persian chip on every locale | Shared header/footer and content modules | Implemented ECHO-501/501b terminology; no owner sign-off recorded | Unverified brand/transliteration decision | **Important** (launch) | Approve the wordmark/chip and per-locale spelling (D7). Do not change silently. |
| 15 | Localized metadata and `noindex`; canonical, `hreflang`, sitemap/robots not implemented | All routes; `src/app/[locale]/layout.tsx`; new homepage description | Layout/route metadata verified; homepage description added in ECHO-502; ECHO-506 remains open | Verified implementation + later technical scope | **Important** (launch/SEO) | Keep `noindex` until launch; complete ECHO-506 separately. |
| 16 | FA/AR register, tone, brand transliteration and English reference captions | All localized content | Plural honorific/formal address is guarded; human native review is unavailable | Unverified native-language quality | **Important** (launch) | Native FA/AR review (D8). Optional: localize the English benefit captions. |

## Mandatory before real-user intake (Blockers)

### A1. Legal identity, controller, jurisdiction, legal basis and privacy contact
- **What needs approval:** Legal entity/controller name, jurisdiction, legal
  basis for inquiry processing, a verified privacy contact, and the
  request-verification method for correction/deletion.
- **Where it affects the site:** Privacy notice, data/storage/retention/updates
  sections, Contact form note, footer/contact wording, future metadata.
- **Why it matters:** The site currently collects real personal data only when
  intake is enabled; without these facts it cannot truthfully publish a legal
  notice or handle data-subject requests.
- **Recommended safe default:** Keep the current technical disclosure, no legal
  identity invention, no privacy contact, and intake disabled.
- **Information required from owner:** Approved legal name, address/jurisdiction,
  privacy inbox, legal basis, deletion-request procedure and responsible person.

### A2. Retention, deletion, backups and production operations
- **What needs approval:** Business retention period, automatic/manual purge
  ownership, backup retention and key custody, production RPO/RTO, deletion
  reconciliation, and who may read/erase inquiries.
- **Where it affects the site:** Privacy retention/backups cards, operational
  notes, future launch documentation.
- **Why it matters:** The privacy page explicitly says deletion does not guarantee
  immediate removal from older backups/provider logs; a real policy is required
  before promising any lifecycle.
- **Recommended safe default:** Keep “retention is not configured”, no automatic
  purge, no guaranteed deletion time, and no production schedule approval.
- **Information required from owner:** Retention duration, purge schedule,
  backup/restore policy, named operators and access-review process (D5/D6).

### A3. Hosting, subprocessors, TLS, encryption and logging
- **What needs approval:** Production host/provider/region, proxy/log retention,
  TLS termination, encryption at rest, vendor/subprocessor list and disclosure.
- **Where it affects the site:** Privacy infrastructure/protection cards, future
  hosting and release checks.
- **Why it matters:** Current text correctly says these are unapproved; enabling
  real intake without them would make the disclosure incomplete.
- **Recommended safe default:** Keep the current “not approved or verified”
  wording and `noindex`; do not claim compliance or security certification.
- **Information required from owner:** Provider/region, contract/privacy terms,
  TLS/encryption/logging configuration and disclosure approval (D4/D6).

## Important before public launch or portfolio publication

### B1. Public contact channels (D1)
- **What needs approval:** Verified public email, phone and social profiles, plus
  permission to publish each one.
- **Where it affects the site:** Home `contactsPending`, Contact direct-channel
  card, About next step, footer “Contact channels”.
- **Why it matters:** The site currently states that no channel is published and
  the inquiry is the implemented path; adding handles without verification would
  create a dead or misleading link.
- **Recommended safe default:** Keep the current omission and inquiry-only path.
- **Information required from owner:** Each channel, ownership proof and
  publication permission.

### B2. Team identity and profiles (D3)
- **What needs approval:** Whether to publish member names, roles, photos,
  profiles, organization-only identity, team size or company facts.
- **Where it affects the site:** About team/profiles/facts sections, home badge,
  metadata description.
- **Why it matters:** About deliberately avoids unverified biographies and
  credentials; the collective wording is the safe interim.
- **Recommended safe default:** Keep the collective description and the explicit
  “not published yet” notes.
- **Information required from owner:** Approved names/roles/photos, or a decision
  to remain organization-only.

### B3. Real client/internal work and proof (D2)
- **What needs approval:** Any publishable client or internal project, results,
  screenshots, logos, testimonials, stack/role evidence and permissions.
- **Where it affects the site:** Work listing, work detail template, home concept
  gallery, potential proof strip.
- **Why it matters:** The current portfolio is concept-only and honestly labeled;
  fabricated or unlicensed proof would violate `SCOPE.md`.
- **Recommended safe default:** Keep concept-only work and empty client/internal
  groups.
- **Information required from owner:** Approved case facts, evidence, licenses and
  client permission.

### B4. Native language, brand spelling and final copy (D7/D8)
- **What needs approval:** FA/AR native reading and tone, brand transliteration
  (`Echo Devs` / `اکو دوز` / `إيكو ديفز`), the fixed Persian chip on non-Persian
  pages, and final marketing prose.
- **Where it affects the site:** Shared header/footer, all content modules and
  metadata.
- **Why it matters:** Automated parity cannot prove native quality or brand
  approval; ECHO-501 established conventions, not sign-off.
- **Recommended safe default:** Keep the documented terminology and current brand
  presentation; do not rewrite positioning or transliteration without approval.
- **Information required from owner:** Native reviewer/owner approval and final
  brand/copy decisions.

### B5. Localized metadata and SEO completion (ECHO-506)
- **What needs approval:** Canonical URLs, `hreflang`, sitemap/robots policy and
  launch indexing; homepage description is now present.
- **Where it affects the site:** All locale routes and metadata.
- **Why it matters:** `noindex` is deliberate for the preview; a public launch
  needs a complete, consistent metadata plan.
- **Recommended safe default:** Keep `noindex, nofollow` and defer canonical/
  sitemap/robots to ECHO-506.
- **Information required from owner:** Final domain and launch/indexing approval
  (D1), then technical implementation.

## Optional content enhancements (Minor)

1. **Localize the four English reference captions** on the homepage benefit cards
   (`Clear Decisions`, `Product Thinking`, `Maintainable Code`,
   `Visible Milestones`). They are decorative and duplicate localized copy; the
   reference uses English technical captions. Recommendation: leave unless the
   owner wants fully localized captions.
2. **Remove unused stale copy keys**: `Foundation.description`,
   `Foundation.back`, `Header.planned`, `home.unavailable` and
   `home.submissionUnavailable` are not rendered. Removing them is safe but not
   required for coverage.
3. **404 back link / full chrome**: the localized 404 has a heading and language
   links but no “return home” link; this belongs with ECHO-506’s locale-aware 404
   work.
4. **Unify homepage service-card titles with services-page pillar titles** if the
   owner wants one canonical naming set; this is editorial, not a defect.
5. **Review the Arabic option “لست متأكدًا بعد”** (“not sure yet”) with a native
   speaker. It is a first-person choice, not site-level guidance, so it does not
   break the plural-honorific rule; confirm the preferred form.

## Owner decisions already satisfied by safe defaults

- No public channel was invented; the inquiry is described as implemented, not
  publicly open.
- No client, internal, testimonial, metric, logo, certificate or legal term was
  invented.
- Concept work remains labeled `Concept`, `static preview`, or the localized
  equivalent.
- Privacy describes implemented behavior and explicitly lists unresolved policy.
- `noindex` and intake-disabled defaults are preserved.

## Related records

- `SCOPE.md` — claim/verification rules.
- `docs/DECISIONS.md` — D1–D8 owner gates.
- `docs/INQUIRY-PRIVACY.md` — data inventory and unresolved lifecycle.
- `docs/INQUIRY-OPERATIONS.md` — operator/access, backup and restore limits.
- `docs/P5-ECHO-501.md` — terminology/parity work.
- `docs/P5-ECHO-502.md` — ECHO-502 evidence and test results.
