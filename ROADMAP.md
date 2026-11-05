# Echo Devs — Agent-Executable Roadmap

**Version:** 1.6 · **Status:** ECHO-101/102/104/106 complete; ECHO-103 hosted acceptance pending; ECHO-105/107/108 implemented, partial pending actual browser acceptance. ECHO-003 remains deferred. ECHO-109 onward not started.
**Source of truth:** `SCOPE.md`. **Operating rules:** `AGENTS.md`.  
**Progress:** Mark `[x]` only with verified acceptance evidence. Record concise verification in task notes/reports. Agents must never stage files, create/amend commits, or push; Git commits are not completion requirements.

## Delivery strategy

**Prefer a working vertical slice over many partially functional components.** Start with architecture and page shell, then prove the actual inquiry pipeline, then fill out the polished public website, and finally localize/harden/launch. No unauthorized deployment or public communication. Keep the original screenshot visible during visual reviews.

### Dependency overview
```
P0 Source audit + product truth
  └─ P1 Foundation + design primitives + locale shell
       ├─ P2 Complete inquiry vertical slice
       └─ P3 Full polished homepage
            └─ P4 Portfolio / service / about / policies
                 └─ P5 Complete locale/copy QA
                      └─ P6 Security + a11y + SEO + performance + end-to-end QA
                           └─ P7 Production launch (owner approval required)
                                └─ P8 Evidence-driven improvement
```
P2/P3 may overlap after their interfaces are stable, but no parallel branch may redefine shared tokens, content schema, or DB without coordination.

## P0 — Discovery, baseline and truth inventory
**Goal:** Establish an accurate baseline and stop agents from guessing.  
**Exit gate:** Signed-off baseline map, explicit open questions, reproducible reference, scope frozen for P1–P2.

- [x] **ECHO-001 [P0]** Import/reference ZIP immutably; record file list and hash; do not ship original HTML as production code. **Accept:** source reference available in repo.
- [x] **ECHO-002 [P0]** Inventory all sections, interactions, assets, links, claims, form controls, motion, breakpoints, and their current state. **Accept:** concise audit table with working/broken/placeholder.
- [ ] **ECHO-003 [P0]** Capture baseline desktop and mobile screenshots using actual browser; compare to supplied screenshot. **Accept:** baseline artifacts and known display deltas.
- [x] **ECHO-004 [P0]** Create claim/asset registry: verified, concept, unknown, remove. **Accept:** every prominent metric, link, contact and work example classified.
- [x] **ECHO-005 [P0]** Reconcile `DESIGN.md` Sahara vs proposed Coral & Charcoal. Define brand brief, theme/accessibility starting tokens and logo variants needed. **Accept:** single agreed direction; uncertainties labeled.
- [x] **ECHO-006 [P0]** Confirm repo commands, project-level instructions/security boundary, CI feasibility, target deploy constraints. **Accept:** no environment assumptions hidden.

### Initial P0 evidence — 2026-11-04

See `docs/P0-AUDIT.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` and `design/reference/README.md`.

| Task | State | Verified evidence / outstanding work |
|---|---|---|
| ECHO-001 | PARTIAL | Read-only byte-identical extracted HTML/legacy DESIGN copies and SHA-256 manifest; original ZIP/hash/list and supplied screenshot unavailable. Source remains untracked; Git appeared during session without agent action. |
| ECHO-002 | DONE | Full section/interaction/asset/link/form/motion/breakpoint inventory; parser assertions reproduced 6 sections, 35 anchors, 15 unique IDs and zero missing fragment targets. Runtime findings not implied. |
| ECHO-003 | BLOCKED | No available browser tooling found and no supplied screenshot; no actual screenshots or visual comparison. Capture procedure recorded; browser evidence still required. |
| ECHO-004 | DONE | Prominent claims/metrics/work/links/contacts/assets classified in audit registry; no unverified business fact promoted to truth. |
| ECHO-005 | DONE (specification) | Active Coral & Charcoal brief replaces Sahara, legacy copy preserved; starting theme tokens/contrast and required logo variants documented. Final mark/copy/rendered owner review remains D7. |
| ECHO-006 | DONE (discovery) | Guest identity, initially absent Git (repo appeared later, all files untracked/no staged changes), absent app/CI/DB/browser tooling, actual Node/npm versions, commands and conditional CI/hosting requirements documented. No builds/deploy compatibility claimed. |

Checks: `python3 scripts/audit_reference.py` **PASS** from project root; `sha256sum -c SHA256SUMS` **PASS** for both originals from reference directory. One initial audit invocation used the reference directory instead of the root and failed to locate the script; corrected invocation passed. Browser/build/lint/typecheck/DB/CI tests **NOT RUN** (no app/tooling). White-on-original-coral 2.83:1 is a confirmed baseline contrast failure, not a passing production state.

**Milestone PARTIAL, no sign-off fabricated.** Resolve missing ZIP/screenshot and actual browser baseline, then obtain owner baseline sign-off (or explicit acknowledgement of documented gaps) before proceeding to P1. No P1 task executed this session. Next foundation recommendation after that gate: ECHO-101/102/106. Owner dependencies D1–D8 remain in the decision ledger.

### P0 follow-up / P1 prerequisite — 2026-11-04

Latest evidence: `docs/P0-FINALIZATION.md`. Existing completed static audits were not repeated.

- **ECHO-001 remains PARTIAL:** `design/reference/original/cvecho.zip` and its parent directory are absent; no ZIP or PNG exists in the scoped project inventory. Archive/member hashes, CRCs, consistency and original image inspection cannot be verified until the actual upload is available.
- **ECHO-003 remains BLOCKED and unchecked:** isolated Playwright 1.64.1 installed in approved temporary storage with lifecycle scripts disabled. Chromium download timed out; explicit sandbox-enabled launch then failed because the executable was missing. No screenshots captured or compared. No privileged installation/security bypass attempted.
- **ECHO-006 supplement:** unborn `main`, zero commits/refs, all files untracked and no staged changes. Local config has no remote section; metadata dates creation to 18:50:57 UTC but does not identify the initializer. No Git changes performed.
- **Architecture review complete as documentation:** clarified entry/locale root layouts, separate short-lived idempotency/rate-limit tables, expiry/cleanup/attempt bounds and environment/test isolation; signed timing token optional. Framework compatibility, DB/browser integration and CI are still unvalidated.

**Owner-visible exception proposal, not approval:** allow only ECHO-101/102/106 while provenance/browser evidence remains open, if the owner explicitly accepts the gap. Real desktop/mobile screenshots and original-image comparison are prerequisites before ECHO-109 sign-off/full-page replication. Otherwise finish ECHO-001/003 and baseline sign-off before P1. The request to finalize P0 does not by itself waive missing acceptance evidence. Stop before P1 in this session.

### Latest closure / limited P1 authorization — 2026-11-04

Supersedes the historical missing-asset/proposed-exception state above. Evidence and exact file list: `docs/P1-FOUNDATION.md`.

- **ECHO-001 DONE:** original ZIP now supplied under `design/reference/original/`; exactly `code.html`, `screen.png`, `DESIGN.md`, CRCs valid. Archive SHA-256 `658daaf9def5badf3b9c061f8e669d0980b91cae6fe76975324def7f01bd050b`; member hashes recorded in `original/SHA256SUMS`. HTML/legacy design byte-identical to preserved copies; extracted originals match archive. Inputs made read-only, not tamper-proof. Original image inspected, 442×1600. References remain outside shipped code and untracked pending human review.
- **ECHO-003 BLOCKED/DEFERRED, unchecked:** no actual browser capture. The owner explicitly instructed this session to record an owner-authorized exception and implement only ECHO-101/102/106. This authorizes that batch without ECHO-003, not fabricated screenshots, final visual sign-off, deployment or subsequent batches. Actual reference desktop/mobile screenshots/comparison remain a gate before ECHO-109 approval/full-page replication.
- **ECHO-101/102/106 DONE:** lockfile install, minimal Next/TS/build-time Tailwind foundation, boundaries, typed dictionaries, allowlisted FA/EN/AR routes and direction, safe language links, negotiated root and localized/global 404s. Verification: lint, typecheck, six unit tests, production build and owned loopback HTTP smoke PASS. Native/reference browser QA remains deferred, not claimed. No CI, design-system, full homepage, form, DB or theme/menu implemented.
- Final dependency audit: zero vulnerabilities after targeted transitive minimatch override; compatible ESLint 9 deprecation and experimental global-not-found risk explicitly recorded. Failed initial type/404 checks were fixed and final checks passed; see report.

P0 is **not fully signed off**; its remaining browser gate has a narrow owner exception. This batch ends here. Next recommended task: ECHO-103 (not started).

## P1 — Foundation and reusable UI shell
**Goal:** Stable Next/TS app with accessible, responsive, trilingual **routing skeleton**, theme, tokens and CI.  
**Exit gate:** `/fa`, `/en`, `/ar` load; desktop/mobile header works; build/lint/typecheck/test pass; no useless dependency sprawl.

- [x] **ECHO-101 [P1]** Scaffold minimal Next.js App Router + TypeScript app, package lock, `.env.example`, README local commands. **Accept:** cold install and production build reproducible.
- [x] **ECHO-102 [P1]** Establish folder boundaries: app routes, components, content, i18n, validation, DB, tests. **Accept:** simple structure documented; no premature abstractions.
- [ ] **ECHO-103 [P1]** Add basic CI pipeline: lint, typecheck, unit tests, build. **Accept:** intentional lint/type failure breaks CI.
- [x] **ECHO-104 [P1]** Create semantic design tokens for Coral & Charcoal light/dark and typography scales. **Accept:** no hard-coded one-off theme duplication in new primitives; key colors contrast-tested.
- [ ] **ECHO-105 [P1]** Build accessible shared Button, Link, Field, Container, SectionHeading, Card, Header, Footer; avoid unnecessary design-system framework. **Accept:** keyboard and visual states demonstrated.
- [x] **ECHO-106 [P1]** Implement locale URL skeleton and basic dictionaries; default `fa` assumption documented. **Accept:** route-specific `lang`/`dir`, route-safe locale links.
- [ ] **ECHO-107 [P1]** Implement theme selection with OS preference, persisted override, no flash/FOUC. **Accept:** toggle works in all locale routes and survives reload.
- [ ] **ECHO-108 [P1]** Implement desktop nav and accessible mobile menu with keyboard/focus behavior. **Accept:** all primary routes accessible at 320px and by keyboard.
- [ ] **ECHO-109 [P1]** Create concise 1–2 screen design preview of homepage shell based on ZIP; owner checks direction before full-page replication. **Accept:** approve visual direction or log focused revisions; not indefinite redesign.

### ECHO-103 evidence — 2026-11-04

**PARTIAL (implementation/local verification complete; hosted acceptance pending).** Checkbox intentionally remains unchecked: no remote is configured and no GitHub run or hosted failure propagation was observed.

- Added `.github/workflows/ci.yml`: one Ubuntu 24.04 job for branch push/PR/manual dispatch; Node 24.21.0 + bundled npm 11.19.0 guards; locked install with lifecycle scripts disabled, lint, typecheck, unit tests, production build. Official actions pinned to reviewed commit SHAs; npm-download cache, contents:read only, timeout/concurrency, no credentials persisted, custom secrets, artifact uploads, deploys or external services.
- All five CI commands **PASS locally** in CI environment: install (409 packages), ESLint, typecheck, six unit tests and production build. Existing ESLint deprecation/global-not-found warnings are not newly introduced changes.
- Disposable-copy negative checks **PASS**: lint exits 1 with no-explicit-any, typecheck exits 2 with TS2322. Temporary copy removed; no fixtures or application edits left behind. No workflow step suppresses failure.
- YAML parsed and SchemaStore GitHub workflow schema validated using existing js-yaml/Ajv; targeted trigger/permission/SHA/version/cache/command checks pass. Ajv emitted draft-07 $ref-sibling warnings; actionlint unavailable. This is local structural validation, not the GitHub runner/expression evaluator.
- Build/dependency outputs are ignored and not tracked/staged. Package/lockfile, application, prototype and visual design unchanged. Exact verification/security notes and owner-controlled hosted activation: `docs/CI.md`.

Next: human-controlled publication/hosted validation of ECHO-103; then authorized ECHO-104/105. No later task started. No agent stage/commit/tag/push.

### ECHO-104/105 evidence — 2026-11-04

- **ECHO-104 DONE:** semantic light/dark palettes, action hover/active, focus, disabled, error/success roles; typography/spacing/radii/border/shadow/measure tokens. New primitive CSS contains no literal colors or physical left/right layout rules. Light is default; dark values are opt-in only, with no ECHO-107 behavior.
- **ECHO-105 PARTIAL:** typed native Button, Link, input/textarea Field, Container, SectionHeading, Card and content-slot Footer. Existing locale skeleton uses Link and SectionHeading; no new pages/claims. Header is explicitly excluded by the owner's batch scope and deferred to ECHO-108. Keyboard/visual state browser demonstration remains unverified; checkbox intentionally unchecked.
- Local CI commands PASS: locked install (409 packages, scripts disabled), lint, typecheck, 25 unit/SSR tests, production build. Production HTTP locale/redirect/404 checks and immutable reference verification PASS. Contrast tests cover both palettes and actual action states, text/error/success, field boundaries and focus. Licensed local Vazirmatn 400/500/700 (113,452 WOFF2 bytes), common FA/AR glyph and join-control coverage checked via Fontconfig; not native shaping approval.
- No available Chromium executable; no screenshots, manual keyboard/screen-reader/zoom, axe or visual approval claimed. ECHO-003/D7 remain open. No later task, theme switching, navigation, inquiry or DB implemented. Existing ECHO-103 changes preserved; no staging/commit/tag/push.
- API guidance, exact files, evidence and remaining checks: `docs/P1-PRIMITIVES.md`. Next recommended batch (not started): ECHO-107/108 with deferred Header, then ECHO-109 only after actual browser/reference evidence.

### ECHO-107/108 + deferred Header evidence — 2026-11-05

**PARTIAL (implementation/local verification complete; actual browser acceptance pending).** ECHO-105/107/108 checkboxes intentionally remain unchecked. Owner authorized only this shell batch; no ECHO-109 or full-page replication performed.

- Added server-rendered Header using existing tokens/primitives and small client islands for native theme select and modal mobile navigation. FA/EN/AR labels and locale links; Home/locale roots are real destinations, unbuilt Services/Work/About/Contact/Privacy are visibly planned non-links. No invented inquiry CTA or content pages.
- Light/Dark/System: synchronous trusted head initializer in every document root; allowlisted localStorage preference, live OS changes in System, tab synchronization, safe in-memory behavior on storage denial. Controls hydrate deterministically; only expected html theme attributes suppress hydration warnings. No runtime/theme/UI framework added.
- Native dialog with named navigation, aria-expanded/controls/haspopup, initial Close focus, Escape/cancel/Close/link dismissal, scroll restoration on close/unmount and visible-brand focus on desktop resize. Static Header avoids overlaying page content; RTL-safe CSS, 44px controls, no animation. Native Tab containment/inertness require actual browser verification, not the dialog test double.
- PASS: reviewed locked install with scripts disabled, lint, typecheck, **46 tests / 5 files**, production build, production locale/redirect/404 HTTP checks (also executes exact rendered head initializer for each theme mode in each locale), reference integrity, dependency audit (zero vulnerabilities), diff whitespace review. Added pinned jsdom 30.1.3 for DOM fixtures only; no new runtime dependency.
- Existing isolated Playwright inspected; sandbox-enabled launch failed because Chromium/headless-shell binaries are missing. No browser download, screenshots, manual keyboard/screen-reader/zoom, native Tab/inert tests or flash/visual approval claimed. CSS/DOM fixtures do not establish 320px rendered usability. ECHO-003/D7 remain open.
- Exact files, behavior, test limitations and CSP notes: `docs/P1-SHELL.md`. Prior work preserved; no staging/commit/tag/push. Next: browser/reference evidence and ECHO-105/107/108 acceptance, then authorized ECHO-109 preview.

## P2 — First full vertical slice: inquiries
**Goal:** A user can start from a real CTA and submit an inquiry that is durably stored, verified and retrievable.  
**Exit gate:** End-to-end browser test + DB readback. No pretend success.

- [ ] **ECHO-201 [P2]** Set up PostgreSQL development environment, migration tool, least-privilege application role and `.env.example`. **Accept:** fresh DB migrations succeed and can rerun safely.
- [ ] **ECHO-202 [P2]** Implement minimal Inquiry schema and indexes from SCOPE. **Accept:** migration + DB-level integration test.
- [ ] **ECHO-203 [P2]** Define strict shared field names/types and authoritative server validation; email/phone alternatives and Unicode cases. **Accept:** valid/invalid data matrix covered by unit tests.
- [ ] **ECHO-204 [P2]** Implement POST endpoint/server action with size cap, structured errors, transaction and safe logging. **Accept:** accepted request yields persisted record; invalid input yields no insert.
- [ ] **ECHO-205 [P2]** Build one reusable localized UI form, interactive field errors, progress, accessible success/failure and retry. **Accept:** no false success; form can be reached from hero CTA on mobile.
- [ ] **ECHO-206 [P2]** Implement simple shared-store rate limiting, honeypot, CSRF/origin safeguards appropriate to chosen submission method. **Accept:** spam scenarios documented and tested.
- [ ] **ECHO-207 [P2]** Prevent common duplicate submissions; test double click, retry, timeout and network outage. **Accept:** one durable inquiry per successful action or explicit repeat intent.
- [ ] **ECHO-208 [P2]** Implement secure operator readback path without public admin UI. **Accept:** authorized operator can retrieve ID and inspect status; anonymous user cannot.
- [ ] **ECHO-209 [P2]** Add optional notification abstraction/config only if target inbox/credentials are approved. **Accept:** email failure cannot delete lead; if no inbox, feature disabled, not faked.
- [ ] **ECHO-210 [P2]** Add integration and Playwright E2E test for valid submit, invalid fields, DB failure, duplicate attempt and mobile success state. **Accept:** CI pass with disposable test DB.

## P3 — Homepage completeness and visual polish
**Goal:** High-quality, responsive marketing experience preserving strengths of original concept.  
**Exit gate:** Complete homepage reviewed at mobile and desktop; CTAs work; no fake claims or dead anchors.

- [ ] **ECHO-301 [P3]** Rewrite Hero to clearly say who/what/why; primary CTA -> intake; secondary -> actual work. **Accept:** first screen understandable without scrolling.
- [ ] **ECHO-302 [P3]** Implement service pillar section aligned to 3 categories and 7+ discoverable sub-services. **Accept:** no misleading blanket claim; navigation leads to details.
- [ ] **ECHO-303 [P3]** Build featured project section with data-driven cards and true `client/internal/concept` labels. **Accept:** every published card links to a valid detail or explicitly says 'coming soon' without pretending.
- [ ] **ECHO-304 [P3]** Improve trust/benefits section with tangible process facts rather than fabricated metrics. **Accept:** each claim has approved supporting fact or is removed.
- [ ] **ECHO-305 [P3]** Refine six-stage process for readable, realistic buyer-facing copy. **Accept:** coherent process on mobile and desktop; no unsupported SLAs.
- [ ] **ECHO-306 [P3]** Assemble homepage CTA, compact footer, links, and repeated form entry points using one canonical form implementation. **Accept:** all main interactions have destinations and accessible labels.
- [ ] **ECHO-307 [P3]** Rework hero motion/canvas to a progressive-enhancement effect or static graphic; respect reduced motion. **Accept:** user navigation never depends on animation; performance budget not compromised.
- [ ] **ECHO-308 [P3]** Review 320/375/768/1024/1440px screenshots, keyboard tab order, text zoom, light/dark. **Accept:** no unintended overflow, clipped content or overlay trapping CTA.

## P4 — Conversion and trust pages
**Goal:** Visitors can investigate team and actual work before submitting a project.  
**Exit gate:** Public routes all render real reviewed content and navigation works.

- [ ] **ECHO-401 [P4]** `/services`: outcome-first description, scope/deliverables/examples of three pillars and nested sub-services. **Accept:** clear what is and isn't offered, CTA per section.
- [ ] **ECHO-402 [P4]** `/work`: filtering or simple grouped list of real, internal and concept items; default to simplest accessible layout. **Accept:** truthful badges and functional links.
- [ ] **ECHO-403 [P4]** `/work/[slug]`: case-study template with problem, solution, contribution, stack, visuals, verified result, CTA. **Accept:** absent proof omitted, not invented; 404 for unknown slug.
- [ ] **ECHO-404 [P4]** `/about`: real team identity, operating principles, roles/public profiles only when approved. **Accept:** no fictional people/credentials.
- [ ] **ECHO-405 [P4]** `/contact`: clear approved channels, shared real inquiry form, response expectation only if accurate. **Accept:** no nonfunctional handle/address.
- [ ] **ECHO-406 [P4]** `/privacy`: accurate disclosure about stored fields, purpose, retention, protection, contact rights, vendors/analytics; owner/legal review. **Accept:** mirrors real implemented behavior; mark blocker if policy unapproved.
- [ ] **ECHO-407 [P4]** Complete link, asset, and content evidence audit including example metrics, screenshots and company names. **Accept:** no false production claims or broken primary links.

## P5 — Full trilingual product, not a language toggle mock
**Goal:** Every required route and transaction is good in Persian, English and Arabic.  
**Exit gate:** Language matrix complete; no wrong direction, missing dictionary keys, fake translations or SEO gaps.

- [ ] **ECHO-501 [P5]** Build localized content dictionaries/types and parity validation. **Accept:** missing key fails CI.
- [ ] **ECHO-502 [P5]** Translate navigation, service content, pages, CTA, form validation, loading/success/error/404, accessible labels. **Accept:** full coverage; copy owner reviews sensitive claims.
- [ ] **ECHO-503 [P5]** Audit RTL/LTR including mixed email/phone/URL/code, number shaping, inline icons, directional layout, mobile navigation. **Accept:** screenshot and keyboard matrix pass.
- [ ] **ECHO-504 [P5]** Retain equivalent route/slug on language switch; store intentional user preference. **Accept:** changing language on project detail stays on same project.
- [ ] **ECHO-505 [P5]** Validate font loading/fallback, Arabic shaping, content expansion, Persian punctuation and appropriate localized formatting. **Accept:** no clipping and readable mixed scripts.
- [ ] **ECHO-506 [P5]** Localized metadata, canonical URLs, `hreflang`, sitemap/robots, locale-aware 404. **Accept:** scripted HTML inspection for each locale route.

## P6 — Production hardening and evidence-based QA
**Goal:** Public site is fast, accessible, secure, indexable, and operable.  
**Exit gate:** Release checklist all green or documented owner-approved noncritical exception.

- [ ] **ECHO-601 [P6]** Accessibility pass: automated axe-like checks plus manual keyboard, screen-reader spot check, contrast, focus, errors, 200% zoom, reduced motion. **Accept:** zero critical/high known blockers.
- [ ] **ECHO-602 [P6]** Performance pass: optimize font, images, animation, caching and client bundle; record test conditions. **Accept:** repeatable lab Lighthouse >=90 target, no key regressions.
- [ ] **ECHO-603 [P6]** Security pass: threat model public form, validation, request size, spam, injection, CSRF/origin, XSS, headers, secrets, dependencies and DB permissions. **Accept:** documented tests and no critical/high open issues.
- [ ] **ECHO-604 [P6]** SEO pass: metadata, sitemap, robots, canonical/hreflang, OG, structured data based only on approved facts, link crawler. **Accept:** sampled page HTML passes checks.
- [ ] **ECHO-605 [P6]** End-to-end browser matrix across Chromium + Firefox or WebKit as available, mobile/desktop, themes, locales. **Accept:** all critical paths green; limitations recorded honestly.
- [ ] **ECHO-606 [P6]** Privacy/data pass: logs redacted, analytics events contain no PII, retention/deletion defined, backups secure. **Accept:** reviewable policy and deletion procedure.
- [ ] **ECHO-607 [P6]** Operational readiness: deployment notes, health check, safe migration, error monitoring, DB backup and restore rehearsal, rollback guide. **Accept:** operator can restore and roll back in staging.
- [ ] **ECHO-608 [P6]** Conduct full design QA compared with reference; fix hierarchy, spacing, responsive content, logo, and theme consistency. **Accept:** sign-off screenshots and no major visual regression.

## P7 — Production launch (owner-controlled)
**Goal:** Deploy safely, validate the real lead path, and observe.  
**Exit gate:** Domain/TLS, real contacts, end-to-end live intake, alerts, backup and rollback validated.

- [ ] **ECHO-701 [P7]** Owner chooses/approves hosting, monthly budget, domain/DNS changes, privacy text, final assets and public contacts. **Accept:** explicit approval ledger.
- [ ] **ECHO-702 [P7]** Prepare staging deployment with production-equivalent DB/versioned migrations; secret and CI/CD controls. **Accept:** staging E2E passes and secrets not committed.
- [ ] **ECHO-703 [P7]** Securely configure production app, DB access, TLS, backups, monitor, and notifications (if approved). **Accept:** configuration and restore verified without printing secrets.
- [ ] **ECHO-704 [P7]** Execute approved deployment; verify redirects, all locale URLs, real public links, sitemap, mobile UI, canonical and TLS. **Accept:** live smoke report.
- [ ] **ECHO-705 [P7]** Perform **controlled test inquiry** (clearly marked TEST, operator-approved) and verify DB readback and notification if enabled; clean up test data according to policy. **Accept:** proof of durable real-path submission.
- [ ] **ECHO-706 [P7]** Record version, rollback point, ownership, known limitations, and first-week monitoring checklist. **Accept:** launch report with next actions.

## P8 — Post-launch, not a prerequisite to ship
**Goal:** Improve quality and lead conversion using real evidence.

- [ ] **ECHO-801 [P8]** Review errors, lead delivery, spam pressure, mobile completion and search coverage after sufficient actual data exists.
- [ ] **ECHO-802 [P8]** Replace placeholder concepts with verified case studies, screenshots, client-approved proof.
- [ ] **ECHO-803 [P8]** Explore service-specific SEO landing pages only for actual demand and sufficient unique content.
- [ ] **ECHO-804 [P8]** Consider secure admin workflow/CRM integration, notification providers, analytics experiments only if operator effort warrants it.

## Universal verification matrix

| Test | Must run at | Acceptance |
|---|---|---|
| Lint/typecheck/build | Every development task that touches app source | all pass or explicit environment blocker |
| Unit tests | Validation, schema, locales, content and business logic | all relevant cases pass |
| Integration test (temporary PostgreSQL) | DB/migrations/inquiry endpoint | valid insert + invalid reject + failure paths |
| Playwright browser flow | P2 + P6 + launch | Hero -> Contact -> Submit -> persisted success; errors tested |
| Responsive screenshots | UI milestones | 320,375,768,1024,1440 and zoom scenario |
| Locale/dir checks | P1/P5/P6 | fa/ar RTL, en LTR, all links and labels |
| Accessibility | New interactive controls and P6 | keyboard, focus, labels, contrast, reduced motion |
| External link and integrity scan | P4/P6/P7 | no placeholder contacts, false claims or dead key links |
| Operational drill | P6/P7 | rollback and restoration procedure documented/tested |

## Agent roles and branch/commit policy

Suggested separation if available:
- **Architect:** before P1, P2 security/data contract, and P7 deployment; review boundaries, not write entire app without need.
- **Developer:** implement one task or small coupled task slice at a time, tests included.
- **Reviewer:** validate task claims, independently inspect risky paths, ask for remediation with direct evidence.
- **Product owner:** signs off verified business facts, brand/identity, contacts, policies, costs and release.

Agents must never stage files, create/amend commits, or push changes. Leave all work for human review; suggest a small task-ID Conventional Commit message (e.g. `feat(ECHO-204): persist validated inquiries`) for the human to use. No bulk rewrites without approval or speculative scope creep. Prefer 1–3 tightly coupled tasks per implementation session, then report facts and update checklist. If blocked by D1–D8, record a blocker and advance independent tasks.

## Per-task agent report format
```
Task(s): ECHO-xxx
Status: done / partial / blocked
Files changed: ...
Behavior delivered: ...
Commands/tests executed: ... (PASS/FAIL; no fabricated results)
Screenshots/evidence: ...
Security/compatibility considerations: ...
Open issues/deviations: ...
Suggested commit message (human use only): ...
Next recommended task: ECHO-yyy
```

## Immediate execution order

1. ECHO-001 through ECHO-006 (source audit, product truth, visual baseline).
2. ECHO-101 through ECHO-109 (app shell, locale routes, brand tokens, CI).
3. ECHO-201 through ECHO-210 (working form and database).
4. Continue P3–P7, with real content and owner decision gates when necessary.
