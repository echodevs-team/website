# Echo Devs — Agent-Executable Roadmap

**Version:** 1.7 · **Status:** Approved HTML fidelity governs implementation. Foundation/homepage browser and hosted CI gates remain open. P2-A ECHO-201–204 complete locally; P2-B1 form/security/retry and P2-B2 private operations/recovery tooling implemented, owner/deployment/browser acceptance partial. API opt-in; notifications absent; ECHO-306 visual/conversion browser acceptance pending.
**Source of truth:** `SCOPE.md`. **Operating rules:** `AGENTS.md`.  
**Progress:** Mark `[x]` only with verified acceptance evidence. Record concise verification in task notes/reports. Agents may create focused local commits for completed, verified changes; they must never push. Git commits are review evidence, not completion requirements.

## Delivery strategy

**Migrate the approved website, do not redesign it.** Owner clarification (2026-11-05): original `code.html` is authoritative for visual fidelity. First reconstruct/populate its homepage within the existing Next.js foundation, then immediately deliver real inquiry/PostgreSQL persistence, remaining pages, full trilingual content and production hardening. Preserve existing safe theme/locale/keyboard infrastructure. No more infrastructure-only batches unless a feature requires them; no unauthorized deployment/public communication.

Missing VM Chromium is a verification gap, not an implementation dependency. ECHO-003/105/107/108 and all browser criteria remain open until evidence exists; owner-side Fedora checks through existing loopback-only SSH forwarding are valid evidence. No repeated downloads/security changes. Actual reference comparison and implementation visual approval are required before release. This owner authorization supersedes earlier historical statements limiting development to ECHO-101/102/106 or prohibiting full-page replication before screenshots; it does not mark any test passed.

### Dependency overview
```
P0 Verified source + product truth (browser baseline outstanding)
  └─ Existing P1 foundation (browser acceptance outstanding)
       └─ P3 faithful homepage reconstruction/population + ECHO-109 comparison
            └─ P2 real inquiry vertical slice + P3 inquiry integration
                 └─ P4 Portfolio / service / about / policies
                      └─ P5 Complete locale/copy QA
                           └─ P6 Security + a11y + SEO + performance + end-to-end QA
                                └─ P7 Production launch (owner approval required)
                                     └─ P8 Evidence-driven improvement
```
Phase numbers/task IDs are retained for traceability, not execution order. Browser evidence may run alongside implementation; no incomplete phase exit gate is implied. P3 contact composition precedes P2; actual submission and final conversion acceptance depend on P2. Shared tokens/content/schema remain coordinated contracts.

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
- [ ] **ECHO-109 [P1]** Compare the reconstructed homepage's first 1–2 screens with approved HTML; no alternative-design exercise or prerequisite preview build. **Accept:** actual comparison screenshots, targeted deviations/revisions recorded; significant departures approved. May run alongside P3; pending browser evidence does not block implementation.

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
**Exit gate:** End-to-end browser test + DB readback. No pretend success. Immediately follows homepage reconstruction; missing browser may defer E2E acceptance, not schema/API/local integration implementation.

- [x] **ECHO-201 [P2]** Set up PostgreSQL development environment, migration tool, least-privilege application role and `.env.example`. **Accept:** fresh DB migrations succeed and can rerun safely.
- [x] **ECHO-202 [P2]** Implement minimal Inquiry schema and indexes from SCOPE. **Accept:** migration + DB-level integration test.
- [x] **ECHO-203 [P2]** Define strict shared field names/types and authoritative server validation; email/phone alternatives and Unicode cases. **Accept:** valid/invalid data matrix covered by unit tests.
- [x] **ECHO-204 [P2]** Implement POST endpoint/server action with size cap, structured errors, transaction and safe logging. **Accept:** accepted request yields persisted record; invalid input yields no insert.
- [ ] **ECHO-205 [P2]** Build one reusable localized UI form, interactive field errors, progress, accessible success/failure and retry. **Accept:** no false success; form can be reached from hero CTA on mobile.
- [ ] **ECHO-206 [P2]** Implement simple shared-store rate limiting, honeypot, CSRF/origin safeguards appropriate to chosen submission method. **Accept:** spam scenarios documented and tested.
- [ ] **ECHO-207 [P2]** Prevent common duplicate submissions; test double click, retry, timeout and network outage. **Accept:** one durable inquiry per successful action or explicit repeat intent.
- [ ] **ECHO-208 [P2]** Implement secure operator readback path without public admin UI. **Accept:** authorized operator can retrieve ID and inspect status; anonymous user cannot.
- [ ] **ECHO-209 [P2]** Add optional notification abstraction/config only if target inbox/credentials are approved. **Accept:** email failure cannot delete lead; if no inbox, feature disabled, not faked.
- [ ] **ECHO-210 [P2]** Add integration and Playwright E2E test for valid submit, invalid fields, DB failure, duplicate attempt and mobile success state. **Accept:** CI pass with disposable test DB.

### P2-A evidence — 2026-11-07

**ECHO-201–204 DONE locally. ECHO-206/207/210 PARTIAL; other P2 tasks not implemented.** Detailed contract, provenance/tooling decision, commands, exact files and limitations: `docs/P2-A.md`. No phase-exit/production readiness inferred.

- Real PostgreSQL **18.6** from pinned dev-only npm binary tooling; no installed PostgreSQL/container tooling was available. Private OS-user-owned Unix socket only, no TCP DB listener/system install/host/security change. Separate persistent `echo_dev` and disposable unique-cluster `echo_test`; SCRAM app login, least-privilege insert-only inquiry role and separate migration/test owner. Generated credentials/data ignored. All temporary servers stopped; test clusters removed.
- Checksummed, advisory-locked transactional `001_inquiries.sql`; inquiry constraints/indexes, short-lived replay metadata with FK/cascade and bounded one-row global abuse counter. Migrations rerun without resetting data and reject history drift. Explicit expired-metadata cleanup command; host scheduling not yet selected.
- Strict shared Zod request contract, Unicode preservation/international phone format normalization, 32KiB streaming cap/5s body deadline, parameterized SQL. `POST /api/inquiries` commits before 201, same-key replay 200, changed-payload 409, safe validation/storage errors. No public reads or payload/exception logging. Backend HMAC replay/expiry/concurrency/lost-ack behavior tested. API **disabled by default**, homepage form unchanged and still disabled.
- **PASS:** final lint/typecheck, **80 unit tests / 7 files**, production build, **16 actual PostgreSQL/production-HTTP integration tests / 2 files**, fixture DB log-privacy check, local dev setup/restart/private permissions/stable key check, existing locale/theme/homepage HTTP smoke plus default-disabled API checks, original reference verification, dependency audit (0 vulnerabilities), diff whitespace. Native binary libraries are not covered by npm audit. Initial type/lint issues corrected; no failing check presented as passing.
- ECHO-206 partial: exact origin/JSON/empty honeypot/global shared 30-per-10min attempts implemented; trusted per-network identity/rate limiting/timing/traffic tuning remain. ECHO-207 partial: backend tests pass, UI/browser retry/double-click/network checks remain. ECHO-210 partial: DB+HTTP integration verified, hosted CI/browser/mobile E2E not done. ECHO-208 operational readback/D5 not done; test owner queries are not operator acceptance. No notifications/admin/deployment.
- **Stop after P2-A. Recommended P2-B:** ECHO-205/206 plus remaining ECHO-207 UI wiring/safeguards, then ECHO-208/210 handoff and CI/browser evidence. Keep ECHO-306 and browser acceptance open; no automatic form enablement or next batch.

### P2-B1 evidence — 2026-11-07

**ECHO-205/206/207 implementation delivered, acceptance PARTIAL.** Checkboxes remain open for native mobile/browser flow and deployed ingress/maintenance validation. Full behavior, file list, test evidence and network trust contract: `docs/P2-B1.md`. No P2-B2/P4 work or production approval inferred.

- Canonical FA/EN/AR inquiry form now uses shared client/server validation, labeled separate email/phone fields, native controls, focusable field-error summary and polite pending/success/reference state. Original section/panel/grid/tokens retained. No extra personal fields, analytics or draft storage beyond page memory. No-script controls stay disabled to prevent unsafe native submission; API defaults remain opt-in.
- Memory-only logical submission uses a frozen payload/key after uncertainty, synchronous double-dispatch gate, 15s timeout, safe replay, explicit new intent after success/conflict and conservative 23h retry cutoff. Errors preserve drafts; success requires confirmed well-formed 201/200. Retry-After respected; no silent key rotation on uncertain rejection.
- Migration 002 adds atomic 5-attempt/10min network buckets alongside global 30/10min; migration 001 untouched and actual version-001 data-upgrade fixture passes. IPv4/mapped IPv6 normalize together; native IPv6 /64. Domain-separated HMAC identifiers, expiry/index, bounded opportunistic cleanup and explicit maintenance command; no raw IP storage. Arbitrary forwarding headers ignored. Local mode assumes private loopback binding; deployment-facing mode requires fresh key-bound signed ingress metadata, not an unverified forwarded header. Actual ingress and maintenance schedule remain unverified.
- **PASS:** final lint/typecheck, **110 unit tests / 10 files**, production build, **26 real PostgreSQL/DOM/production-HTTP integration tests / 3 files**, fixture log privacy, existing locale/theme/homepage/default-disabled API HTTP checks, reference integrity, npm audit (0 vulnerabilities), diff whitespace. Test/fix history and distinctions between injected acknowledgement loss and real browser networks recorded in report. All temporary servers stopped; disposable test data removed.
- No native browser/mobile/zoom/keyboard/screen-reader acceptance, real proxy deployment, host load-control proof, hosted CI, operator handoff or retention-policy approval. ECHO-205/207 browser criteria, ECHO-206 deployment criteria and ECHO-208/210 remain open. ECHO-306 is wired but not visually/end-to-end accepted. No notifications/admin/deployment.
- **Stop after P2-B1. Next separately authorized P2-B2:** restricted operator readback/D5, privacy/retention decisions/D6, verified ingress/maintenance assumptions and remaining CI/browser-to-DB evidence. Do not begin automatically.

### P2-B2 evidence — 2026-11-07

**ECHO-208 implementation/local acceptance delivered; owner D5 handoff still PARTIAL. ECHO-209 optionally deferred/disabled; ECHO-210 remains PARTIAL.** Task definitions/checkboxes unchanged. Evidence/files: `docs/P2-B2.md`; exact commands: `docs/INQUIRY-OPERATIONS.md`; owner privacy/retention decisions: `docs/INQUIRY-PRIVACY.md`.

- Private Unix-socket CLI supports bounded metadata paging/filtering and one-reference detail readback with separate least-privilege membership, explicit PII acknowledgement and private non-overwritten output. No public GET/detail route, admin UI, actual operator identity/membership, status workflow or notification service created.
- Separate reader/eraser/backup/restore NOLOGIN capability groups; app still cannot read inquiries. Generated owner configuration split out of the app environment. Single-ID deletion defaults to dry run, requires exact apply confirmation and refuses active replay mappings; no business retention period or automated inquiry purge selected.
- Bounded encrypted application-data snapshot/empty-target transactional restore rehearsed on disposable PostgreSQL; no production/PITR/backup-policy claim. Read-only migration verification/unknown-history guard and atomic temporary-state cleanup added. Existing migrations/data contract preserved.
- **PASS:** 14 focused actual-PostgreSQL operations tests, 111 unit tests/10 files, 40 real PostgreSQL/DOM/production-HTTP tests/4 files, lint/typecheck/build, fixture log-privacy/whitespace checks, local startup/restart/private credential separation/clean shutdown. Initial fixture SQL/grant issues corrected. All test servers stopped and disposable data removed; no persistent development inquiry rows inspected/deleted.
- Exact Origin, loopback alias limitations, signed ingress/clock/key boundary, IPv4/mapped IPv6/native /64, rate limits, expiry and safe failure handling reviewed; added strict Origin/Fetch Metadata and signed-clock boundary coverage. Actual proxy/trusted-chain, logging/load controls, scheduler, backup-key custody, erasure/restore reconciliation, D5/D6, native browser and hosted CI remain open release gates. ECHO-208/209/210 checkboxes intentionally stay open.
- **Stop after P2-B2.** Recommended next product milestone after separate authorization: P4/ECHO-401, with owner-backed contacts/projects/team/policy dependencies and parallel outstanding browser/hosted evidence. No P4 started.

## P3 — Faithful homepage reconstruction and completion (executes before P2)
**Goal:** Reconstruct and truthfully populate the approved HTML homepage, preserving composition and visual identity, not redesigning it.
**Exit gate:** Actual reference/implementation comparison at mobile and desktop, functional inquiry backed by P2, truthful content and working CTAs. Layout implementation can precede browser evidence and persistence; keep affected tasks partial until all criteria pass.

- [ ] **ECHO-301 [P3]** Reconstruct the approved hero, technical visual, hierarchy and CTA proportions; make only necessary truthful/localized copy corrections. Primary CTA -> existing homepage inquiry section, secondary -> existing concepts/work section until real detail pages exist. **Accept:** faithful composition, valid destinations and understandable positioning; record deviations, never invent claims.
- [ ] **ECHO-302 [P3]** Implement service pillar section aligned to 3 categories and 7+ discoverable sub-services. **Accept:** no misleading blanket claim; navigation leads to details.
- [ ] **ECHO-303 [P3]** Reconstruct existing demo/work composition and card treatments using typed content and true `client/internal/concept` labels; do not substitute a new featured-work layout. **Accept:** every published card has a valid destination or is clearly noninteractive; concept visuals/results are not presented as deployed client proof.
- [ ] **ECHO-304 [P3]** Improve trust/benefits section with tangible process facts rather than fabricated metrics. **Accept:** each claim has approved supporting fact or is removed.
- [ ] **ECHO-305 [P3]** Refine six-stage process for readable, realistic buyer-facing copy. **Accept:** coherent process on mobile and desktop; no unsupported SLAs.
- [ ] **ECHO-306 [P3]** Reconstruct baseline inquiry CTA/form composition, header/footer and section links; retain compatible accessible navigation/theme logic. Use one canonical form implementation, wired during P2/ECHO-205. **Accept:** reference-faithful presentation, real destinations/labels and durable submission path. Before P2, visibly identify inquiry as unavailable and disable submission; no fake success or collection without persistence. Remains partial until wired and verified.
- [ ] **ECHO-307 [P3]** Preserve baseline technical artwork and interaction character with bounded progressive enhancement or faithful static fallback; honor reduced motion. **Accept:** no animation-dependent navigation/content, no unrelated replacement artwork, performance budget not compromised.
- [ ] **ECHO-308 [P3]** Review 320/375/768/1024/1440px screenshots, keyboard tab order, text zoom, light/dark. **Accept:** no unintended overflow, clipped content or overlay trapping CTA.

### ECHO-301–307 implementation evidence — 2026-11-07

**PARTIAL acceptance; homepage implementation delivered.** Checkboxes remain unchecked because actual browser/mobile/reference comparison has not occurred; ECHO-306 also requires durable P2 submission. Exact mapping, deviations, changed files and evidence: `docs/P3-HOMEPAGE.md`.

- Reconstructed all six original sections: hero/runtime artwork and four capability cards, three service pillars with 12 discoverable sub-services and real inline scope details, three explicitly labeled static concepts, four benefits, six-stage ordered process, inquiry/form composition. Reconstructed header/footer/section rail; retained locale/theme/modal navigation infrastructure and original SVG brand mark.
- Typed FA/EN/AR homepage content and RTL-safe responsive styles. No client evidence, metrics, certification, SLA, ROI, response-time or unverified contact claim promoted to fact. Proposed collaboration process labeled as such. Static network/orbits/scan fallback retains technical artwork without continuous animation; reduced-motion-safe progressive hover/scroll only. No new dependencies.
- One canonical inquiry presentation, prominently unavailable, all controls disabled, no payload names, submission handler, endpoint or success state. No P2/API/DB/new pages/deployment work performed.
- **PASS:** final lint, typecheck, **55 tests / 6 files**, production build, owned loopback HTTP locale/dir/hero/section/concept/form/theme/redirect/404 checks (server stopped), immutable ZIP/reference verification and diff whitespace review. Focused tests also passed; modeled glass contrast is not a browser pixel audit.
- Supplied 442×1600 screenshot inspected alongside source, but **no rendered implementation screenshots/comparison**, native keyboard/zoom/320px checks or performance audit. No installed browser executable found; no download attempted. ECHO-003/109/308 and existing shell browser gates remain open. Native copy review remains pending.
- Next recommended implementation: **ECHO-201/202/203**, then remaining P2, separately authorized. This batch stops at ECHO-301–307; no task checkbox completion or production readiness inferred.

### Visual fidelity Batch 2 — technical backdrop animation — 2026-11-10

**PARTIAL; implementation/local verification complete, browser visual/performance acceptance pending.** Full analysis, reuse/adaptation decisions and evidence: `docs/BATCH2-BACKDROP.md`.

- Restored the approved `code.html` neural canvas: reference particle count, sizes, velocity, pulse, scroll drift, pointer repulsion, `125px` connection/`150px` pointer thresholds, alpha curves, coral/charcoal colors, opacity and fixed layering. The existing static SVG remains the server/no-JS/reduced-motion/compact/coarse-pointer fallback.
- Added one guarded rAF loop, hidden-document pause/resume, resize coalescing and particle preservation, DPR cap and change watch, complete listener teardown, squared-distance rejection and hoisted canvas styles. No new dependency, React state per frame, header/footer, homepage structure, inquiry, Services/Work or localization change.
- **PASS:** lint, typecheck, **148 tests / 16 files**, production build (22 static pages), production HTTP locale/route/link/fallback checks, original reference integrity and `git diff --check`. Temporary HTTP server stopped. **No browser executable**, so no screenshots, FPS/CPU measurement, contrast pass or native visual approval is claimed; ECHO-307/308 and ECHO-003/109 remain unchecked.
- Next Batch 3 (glass/typography/concept-card fidelity) requires separate owner authorization and browser evidence; it was not started.

### Visual fidelity Batch 3 — homepage glass, typography and concept details — 2026-11-11

**PARTIAL; implementation/local verification complete, browser visual/theme/RTL/rail acceptance pending.** Details, deviations and QA checks: `docs/BATCH3-VISUAL-DETAILS.md`.

- Restored the reference liquid-glass model (28% light / 35% dark, `blur(4px) saturate(140%)`, coral-tinted borders/shadows) with an opaque fallback, hero 2.25/3/3.75rem scale and translucent secondary CTA material, eyebrow dots, per-concept localized badges/accents and honest preview telemetry, 12px card copy, inquiry panel proportions and the dark right-side rail pill. Hover elevation is progressive and reduced motion removes transitions; no animation library.
- Preserved darker accessible action tokens instead of the failing source white-on-coral; kept technical placeholders (`*_PREVIEW`, em-dash telemetry) instead of source versions/capacity/HIPAA/SLA claims. Rail remains hidden below 1024px with 44px targets; no scroll-spy. Header/Footer, canvas, section order, inquiry contract, Services/Work content, API/DB/security and deployment were not changed. `.home-glass` is shared with Services/Work/details, so those surfaces need browser regression review.
- **PASS:** lint, typecheck, **154 tests / 17 files**, production build (22 static pages), production HTTP locale/route/preview/fake-metric/link/API/404 checks (loopback server stopped), reference integrity and `git diff --check`. **No browser executable**; no screenshots, rendered glass/RTL/zoom/rail-overlap, FPS/GPU or native interaction acceptance is claimed. ECHO-301/303/306/307/308 and ECHO-003/109 remain unchecked; ECHO-306 still needs the durable browser inquiry path.

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

### ECHO-401 implementation evidence — 2026-11-08

**PARTIAL acceptance; services implementation delivered.** `/fa/services`, `/en/services`, `/ar/services` render outcome-first descriptions of three pillars, 12 nested sub-services, possible deliverables, explicitly illustrative examples, exclusions and an inquiry CTA per pillar. Header/no-script/mobile navigation, shared reference-style footer and homepage service-detail links reach implemented destinations; locale switching retains `/services`. Existing inquiry implementation unchanged; no ECHO-402–407 pages implemented.

- **PASS:** lint, typecheck, **116 unit tests / 11 files**, production build (all three services routes prerendered), production HTTP locale/direction/metadata/link/404/homepage checks, **40 disposable PostgreSQL integration tests / 4 files** including actual production inquiry HTTP persistence, replay and failure paths. Temporary servers/cluster stopped; synthetic data removed. These fixtures are not browser E2E evidence.
- Browser launch attempted with installed temporary Playwright and Chromium sandbox enabled: executable missing. No install/download or security changes. **Outstanding:** rendered reference/theme/320–1440px/zoom comparison, native keyboard and native-language review. Checkbox remains open under the UI definition of done; no production readiness implied.
- Design mapping, content assumptions and exact changed-file list: `docs/P4-SERVICES.md`. Next recommended task: **ECHO-402**, separately authorized; this batch stops at ECHO-401.

### ECHO-402 implementation evidence — 2026-11-08

**PARTIAL acceptance; grouped work list implementation delivered.** `/fa/work`, `/en/work`, `/ar/work` render localized client/internal/concept groups with native jump links. No approved client/internal records are available, so honest empty states replace invented proof. Three existing homepage interface studies are visibly labeled concept/static preview; stack tags are explicitly possible implementation choices. Named CTAs reach the existing homepage inquiry; static previews link to the existing homepage gallery. No unbuilt detail route or fabricated live/source/result link; ECHO-403 not started.

- **PASS:** lint, typecheck, **121 unit tests / 12 files**, production build (three work routes prerendered), production HTTP locale/direction/metadata/groups/link/404/homepage/services/theme checks, original reference ZIP/hash/CRC/copy integrity, `git diff --check`. Owned temporary loopback server stopped. DB integration not run: no DB/API/inquiry contract changes and no persistence acceptance in ECHO-402.
- Header desktop/mobile/no-script and shared footer expose `/work`; locale switching preserves it. No homepage/services redesign, new dependencies, backend changes or infrastructure. Existing staged/unstaged work preserved.
- **Outstanding:** rendered responsive/theme/reference checks, native keyboard/focus/zoom/screen-reader checks and owner/native copy review. Browser not available; no launch/download attempted. Checkbox stays open. Verified project facts/assets/publication permissions are needed before real/internal entries can be published, not to build this list.
- Exact file list, design mapping, initial test-fixture failure and actual evidence: `docs/P4-WORK.md`. Next recommended task: **ECHO-403**, separately authorized. Stop after ECHO-402.

### ECHO-403 implementation evidence — 2026-11-10

**PARTIAL acceptance; concept details implemented.** Nine static `/{fa,en,ar}/work/{analytics,chat,booking}` pages extend the three existing concepts with localized problem, proposed solution/capabilities, illustrative workflow, unchanged static visual, scope/limitations, honest contribution, possible stack, related service links and existing inquiry CTA. Named listing/back links and shared Header/Footer/theme controls; language switching retains the slug. No client/internal case study, deployment, result or proof link fabricated; unavailable verified results omitted. Inquiry/DB/backend unchanged.

- **PASS:** lint, typecheck, **125 unit tests / 13 files**, production build (nine detail routes prerendered), production HTTP locale/direction/metadata/detail/link-target/unknown-slug localized 404 checks plus homepage/services/list/theme/redirect regressions; original reference ZIP/hash/CRC/copy integrity; `git diff --check`. Owned loopback test server stopped. Focused 16 tests / 3 files also pass. No PostgreSQL rerun: no related contracts changed.
- Reused reference-aligned warm surfaces, glass cards, badges, typography, spacing, buttons and responsive grids; no homepage redesign, dependencies, CMS, backend or deployment. Existing staged/unstaged work preserved. Exact files, decisions and evidence: `docs/P4-WORK-DETAILS.md`.
- **Outstanding:** actual rendered responsive/theme/reference comparison, keyboard/focus/screen-reader/zoom acceptance and owner/native copy review. No browser launched or downloaded; checkbox stays open and no release sign-off is implied. Real case publication still requires verified evidence and permission.
- Next recommended P4 task: **ECHO-404**, separately authorized and constrained by approved identity facts. This batch stops after ECHO-403.

### Consolidated UI/UX review — 2026-11-10

**PARTIAL review / browser acceptance BLOCKED.** ECHO-003, 105/107/108, 301–307 and 401–403 reviewed at source/fixture/HTTP level; no additional checkbox closed. Supplied original PNG inspected, not a new browser capture. No local browser executable or Fedora remote-control tool available; no downloads/security/network changes. Owner Firefox capture/keyboard/theme/zoom/console packet and source-observed reference differences: `docs/UI-UX-REVIEW.md`.

- **Fixed UX-01 (low, ECHO-403):** base CSS suppressed ordered workflow markers. Restored scoped decimal markers and accessible action-color numerals; new regression test failed before the fix and passes after. Rendered RTL marker placement still pending. No redesign, new pages or inquiry/backend changes.
- **PASS:** lint, typecheck, **63 focused tests / 8 files**, production build, localized HTTP routes/link-targets/404/theme-init/preview regressions, original reference integrity and diff whitespace. Temporary HTTP server stopped. Full unit suite/DB integration not repeated for this CSS-only fix. No browser console, native keyboard, responsive, zoom or visual fidelity pass claimed.
- Next evidence milestone: owner-side Firefox review and targeted remediation; next separately authorized product task remains ECHO-404 with approved identity facts. This review stops here.

### ECHO-404 implementation evidence — 2026-11-12

**PARTIAL acceptance; localized About/Team implemented.** `/fa/about`, `/en/about`, `/ar/about` render seven sections: collective team identity, capabilities, working principles, requirement discovery, a four-stage delivery path and client collaboration, plus a next-step panel. Profile notes and company-fact notes explicitly state that individual names/biographies/photos, founding date, office, registration and delivery statistics are not published because they are unverified. No individual member, client, metric, certification, guarantee or response-time claim was invented. Capabilities link to implemented service anchors; the final panel links to `/services`, `/work` and the existing localized homepage `#contact` inquiry. No form/API/DB/validation change.

- **PASS:** lint, typecheck, **169 unit tests / 19 files**, production build (three About routes statically generated), production HTTP locale/direction/metadata/section/link-target/unknown-locale-404 checks plus homepage/services/work/theme/redirect regressions; original reference ZIP/hash/CRC/copy integrity; `git diff --check`. Owned loopback test server stopped. Focused 45 tests / 6 files also pass. PostgreSQL rerun not required: no related contract changed.
- Header desktop/mobile/no-script navigation now marks About as implemented and current; the shared footer adds an About link in its status row. Language switching preserves `/about`. Reused approved section/glass/type/token language with one narrow `about.css`; no redesign, dependency, CMS or deployment. Existing files preserved; exact evidence and file list: `docs/P4-ABOUT.md`.
- **Outstanding:** actual rendered responsive/theme/reference comparison, native keyboard/focus/screen-reader/200% zoom checks and owner/native copy review (collective-identity wording and unpublished-profile statements). No browser launched or downloaded; checkbox stays open; no release sign-off implied.
- Next recommended P4 task: **ECHO-405 `/contact`**, separately authorized. This batch stops after ECHO-404.

### ECHO-405 implementation evidence — 2026-11-12

**PARTIAL acceptance; localized Contact implemented.** `/fa/contact`, `/en/contact`, `/ar/contact` render intro, inquiry and next-step sections. The inquiry block reuses the single existing `InquiryForm`; `InquiryForm` gained only an optional `sourcePage` prop (default `/${locale}`, Contact passes `/${locale}/contact`). No second form/validation/submission/API/DB/schema/idempotency/rate-limit change. Guidance lists five useful inputs; next steps state confirmation/reference, context review and follow-up/written scope without inventing a response time or SLA. Honest copy states success only after storage and that an unavailable service keeps the draft while reporting unconfirmed storage.

- Direct contact channels are not published: no email, phone, social profile, office, registration or availability claim was invented. A localized "direct channels" note records that the implemented contact path is the project inquiry and that verified channels will be added when approved. This is the remaining owner-content dependency.
- Header desktop/mobile/no-script navigation now treats Contact as a real destination and marks it current; the Header CTA and shared footer link target `/${locale}/contact`. Locale switching preserves `/contact`; mobile dialog/keyboard markup and theme controls are unchanged. Existing Services/Work/About inquiry CTAs still use the localized homepage `#contact`.
- **PASS:** lint, typecheck, **183 unit tests / 20 files**, production build (three Contact routes statically generated), production HTTP locale/direction/metadata/section/shared-form/link-target/unknown-locale-404 checks plus homepage/services/work/about/theme/redirect regressions; original reference ZIP/hash/CRC/copy integrity; `git diff --check`. Owned loopback test server stopped. PostgreSQL rerun not required: no related contract changed.
- Reused approved section/glass/type/token language with one narrow mobile-first `contact.css`; no redesign, dependency, client page island, Canvas/CMS/admin/deployment change. Existing files preserved; exact evidence and file list: `docs/P4-CONTACT.md`.
- **Outstanding:** actual rendered responsive/theme/reference comparison, native keyboard/focus/screen-reader/200% zoom checks and owner/native copy review, plus a verified public contact channel if the owner wants one published. No browser launched or downloaded; checkbox stays open; no release sign-off implied.
- Next recommended P4 task: **ECHO-406 `/privacy`**, separately authorized. This batch stops after ECHO-405.

### ECHO-406 implementation evidence — 2026-11-12

**PARTIAL acceptance; localized Privacy disclosure implemented; policy blocker open.** `/fa/privacy`, `/en/privacy`, `/ar/privacy` render seven sections covering collected inquiry fields and purpose, storage/access, temporary replay and throttling records, retention/deletion requests/backups, third parties/analytics/cookies, and update status. The page labels itself a working technical disclosure with legal review pending and states that legal entity, jurisdiction, privacy contact, retention and legal basis are unapproved and real-user intake remains blocked.

- Grounded in the actual implementation: 32 KiB JSON-only exact-origin endpoint, transaction/commit-only success, insert-only app role, separate readback/erasure capability groups, 24-hour replay metadata, 10-minute keyed network throttling, raw IP absent from inquiry rows, no business retention/automatic purge, replay-safe single-record erasure CLI, encrypted backups that may outlive live-row deletion, no analytics/marketing cookies or external notification provider, self-hosted WOFF2 fonts, `echo_theme` localStorage and read-only `echo_locale` handling. No legal entity, DPO, privacy email, jurisdiction/legal basis, fixed retention, certification or deletion guarantee was invented.
- The shared inquiry form now renders a localized `/privacy` link above its fields on both homepage and Contact; the footer bottom row links to `/${locale}/privacy`. Inquiry schema, validation, submission, API, persistence, idempotency and rate limits are unchanged; no consent checkbox added. Header primary navigation is unchanged; locale switching preserves `/privacy`.
- **PASS:** lint, typecheck, **192 unit tests / 21 files**, production build (three Privacy routes statically generated), production HTTP locale/direction/metadata/section/card/link/footer/no-form/unknown-locale-404 checks plus all prior page/theme/redirect regressions; original reference ZIP/hash/CRC/copy integrity; `git diff --check`. Owned loopback test server stopped. PostgreSQL rerun not required: no related contract changed.
- Reused approved section/glass/type/token language with one narrow mobile-first `privacy.css`; no redesign, dependency, client page island, Canvas/CMS/admin/analytics/deployment change. Exact evidence and file list: `docs/P4-PRIVACY.md`.
- **Outstanding:** actual rendered responsive/theme/reference comparison, native keyboard/focus/screen-reader/200% zoom checks and owner/native copy plus legal review. D6 (retention, jurisdiction, vendor disclosure, request contact, analytics/consent policy) remains open; checkbox stays open and no compliance or release sign-off is implied.
- Next recommended P4 task: **ECHO-407 link, asset and content evidence audit**, separately authorized. This batch stops after ECHO-406.

### ECHO-407 implementation evidence — 2026-11-12

**PARTIAL acceptance; link/asset/content audit delivered, no broken primary links or false production claims found.** All 27 localized marketing routes were rendered through the production server; every one of the 73 unique same-origin `href`/`src` destinations returns 200, every fragment resolves, ids are unique, and no empty, `#`, `javascript:`, protocol-relative or external URL exists. Localized 404s, explicit-locale immunity and non-served reference/`code.html` paths were re-verified.

- **Fixed** two stale statements that contradicted the delivered Contact page: About `next.note` now says the inquiry is implemented on both the homepage and the Contact page, and shared `contactsPending` now names unverified public email/phone/social channels and the inquiry as the available contact path (FA/EN/AR, used by homepage and footer). **Also fixed** the Work primary-nav link so it keeps `aria-current="page"` on the nine `/work/{slug}` concept-detail routes, and the footer link that implied verified selected work now reads "Demos and concept studies" / "دموها و طرح‌های مفهومی" / "النماذج والدراسات التصورية". Regression assertions added to the header/footer unit tests and the production HTTP crawl.
- **Verified**: concept work is labeled concept/static preview with possible-not-deployed stack tags; no client names, testimonials, awards, certifications, guarantees, profiles, office, registration or response-time claims; reference-only metrics/certifications (`CPU: 14%`, `RPS: 2,450`, `LATENCY: 18ms`, `TOKENS: 420/s`, `HIPAA`, `GDPR`, `24/7`, `SMS GATEWAY`, `FAISS`, `LangChain`, `TanStack`, `Redis Cache`, `SaaS_v2.4`) remain absent from source and rendered HTML; message keys have no missing/extra locale entries and no accidental English fallback.
- **Assets**: no raster images/screenshots are published; decorative inline SVGs are `aria-hidden` and `icon.svg` carries `role="img"` with a label; six self-hosted WOFF2 subsets are served as `font/woff2` with `public/fonts/README.md` provenance and `OFL.txt` (SIL OFL 1.1); ICO/SVG favicons match the brand mark; frozen reference hashes/CRCs pass. New `tests/unit/assets.test.ts` guards font references, license evidence and the absence of unlicensed raster assets; `scripts/smoke-http.mjs` now crawls every localized document and fails on broken destinations, fragments, duplicate ids, placeholder/external URLs or missing fonts.
- **PASS:** lint, typecheck, **199 unit tests / 22 files**, production build (27 localized marketing routes plus root/404/API/icon), full production HTTP crawl plus prior locale/route/content/404/redirect regressions and Work detail current-state (owned loopback server stopped), original reference integrity and `git diff --check`. PostgreSQL integration not repeated: no schema/API/validation/persistence/idempotency/rate-limit change.
- **Owner decisions remain open:** verified public contact channel(s), legal entity/company facts, privacy/legal acceptance (D6), real client/internal proof, screenshot/partner-name publication, and whether to consolidate in-content inquiry CTAs onto `/{locale}/contact` (both current destinations work; split is the documented ECHO-405 UX decision).
- **Outstanding:** rendered desktop/narrow/two-theme/RTL comparison of changed shared surfaces, native keyboard/focus/screen-reader/200% zoom checks and owner/native copy review. No browser launched or downloaded; checkbox stays open; DOM/HTTP/asset tests are not visual, legal or accessibility acceptance. Evidence, findings table and file list: `docs/P4-AUDIT.md`. This batch stops after ECHO-407.

### ECHO-407 follow-up verification — 2026-11-12

**PARTIAL; existing implementation `9299ca3` revalidated, no new production defect
confirmed.** Added whole-marketing DOM link/illustration/privacy/locale guards and
authored-stylesheet URL/WOFF2 signature checks. **PASS:** 87 focused tests/10 files,
changed audit tests rerun 31/2, lint/typecheck/build, production HTTP crawl (27 routes,
73 destinations), original reference hashes/CRCs. No PostgreSQL rerun or intake change.

Existing Ubuntu WebKitGTK tooling supplied **35 narrow browser spot checks and
eight inspected 375×1000 captures**, FA/EN/AR, light/dark and RTL, including actual
menu Enter/Tab/Escape/focus return and visible localized inquiry privacy. Desktop
window captures were blank/partial; alternative snapshot capture lacked its Cairo
converter. Cause remains unverified; no download/security workaround or speculative
CSS fix. Full desktop/reference, keyboard/screen-reader/zoom/native-copy acceptance
remains open. ECHO-406 `425f765` policy/legal/browser gates are unchanged. Exact
findings, paths and limitations: `docs/P4-AUDIT.md` follow-up section. No checkbox
closed, release or next task started.

### ECHO-407 desktop capture follow-up — 2026-11-12

**PARTIAL; harness corrected, not production styling.** Reproduced missing desktop
footer in historical GDK readback; paired WebKit snapshots contain the content with
mapped/drawable GTK, correct allocation, loaded fonts and visible footer geometry.
Underlying driver cause remains unproven. Uses installed public WebKit/Cairo APIs
through `ctypes` instead of the unavailable optional Python Cairo converter; no
download, dependency, security/global rendering or marketing-source change.

- **PASS:** 93 real WebKit browser spot assertions and 13 inspected viewport PNGs:
  EN/light and FA/dark Home, AR/dark Services, FA/light Contact/privacy focus,
  EN/dark Privacy at 1440×1000, plus EN/dark About at 375×1000; deliberate footers,
  no sampled horizontal overflow. Evidence: `test-results/echo-407-20261112-144603/`.
- **PASS:** 6 focused snapshot/serialization/error/timeout tests, Python syntax,
  original reference hashes/CRCs and diff whitespace checks. Full application/DB
  checks not repeated for this tooling-only change. Temporary server stopped.
- Reference source and supplied scaled screenshot compared; faithful offline HTML
  render blocked by remote Tailwind/font dependencies. Recorded existing header,
  typography, CTA palette and glass/particle differences without styling changes.
  Fidelity, broad browser/accessibility/native-copy and ECHO-406 policy/legal gates
  remain open. Exact reproduction, file inventory and evidence: `docs/P4-AUDIT.md`
  desktop capture section. No checkbox closed, release or next task started.

## P5 — Full trilingual product, not a language toggle mock
**Goal:** Every required route and transaction is good in Persian, English and Arabic.  
**Exit gate:** Language matrix complete; no wrong direction, missing dictionary keys, fake translations or SEO gaps.

- [x] **ECHO-501 [P5]** Build localized content dictionaries/types and parity validation. **Accept:** missing key fails CI.
- [ ] **ECHO-502 [P5]** Translate navigation, service content, pages, CTA, form validation, loading/success/error/404, accessible labels. **Accept:** full coverage; copy owner reviews sensitive claims.
- [x] **ECHO-503 [P5]** Audit RTL/LTR including mixed email/phone/URL/code, number shaping, inline icons, directional layout, mobile navigation. **Accept:** screenshot and keyboard matrix pass.
- [x] **ECHO-504 [P5]** Retain equivalent route/slug on language switch; store intentional user preference. **Accept:** changing language on project detail stays on same project.
- [ ] **ECHO-505 [P5]** Validate font loading/fallback, Arabic shaping, content expansion, Persian punctuation and appropriate localized formatting. **Accept:** no clipping and readable mixed scripts.
- [ ] **ECHO-506 [P5]** Localized metadata, canonical URLs, `hreflang`, sitemap/robots, locale-aware 404. **Accept:** scripted HTML inspection for each locale route.

### ECHO-501 localization parity — 2026-11-12

**PASS for the stated acceptance; native-copy/browser acceptance remains under P5.**
Typed `Record<Locale, ...>` modules already prevent missing keys at typecheck; added
recursive parity/terminology guards and corrected confirmed trilingual defects
(Arabic plural address, Persian pillar term, SaaS naming, inquiry/preview
contradiction, homepage form accessible name, duplicate form legend). **PASS:** 17
new localization tests; 244 tests/24 files; lint; typecheck; production build (27
localized routes); HTTP crawl (27 documents, 73 destinations); reference
hashes/CRCs. No PostgreSQL rerun, intake/API change or browser/download. Native
reading quality, brand transliteration, legal/privacy wording and rendered
RTL/keyboard/zoom gates remain open and are not claimed. Details:
`docs/P5-ECHO-501.md`; terminology: `docs/I18N-TERMINOLOGY.md`. ECHO-502 and later
tasks not started.

### ECHO-502 translation coverage — 2026-11-12

**PARTIAL — coverage PASS; acceptance stays open pending owner review of sensitive
claims, native FA/AR review and legal sign-off.** Audited all 27 localized
marketing routes plus shared chrome, inquiry form/validation/status copy,
404/no-script, metadata and accessible labels. One confirmed defect fixed: the
homepage route was the only marketing page without a localized
`<meta name="description">`; it now uses `homeContent[locale].lead`, asserted by
the HTTP smoke test. Added `tests/unit/claims.test.ts` to reject fabricated
contact/compliance/uptime markers across locales, and documented intentional
non-localized technical tokens plus claim guardrails in
`docs/I18N-TERMINOLOGY.md`. Privacy/operational wording was verified against the
handler, limits, schema, roles and cookie/localStorage usage; unresolved
identity/legal/retention/hosting/operator items are recorded as intake Blockers.
**PASS:** 25 files/245 tests; lint; typecheck; production build (33 static
outputs, 27 localized routes); HTTP crawl; reference verification. No API/DB,
intake, `noindex`, UI redesign, analytics or deployment change; no PostgreSQL
rerun or browser audit. Owner decision package:
`docs/P5-ECHO-502-OWNER-REVIEW.md`; evidence: `docs/P5-ECHO-502.md`. ECHO-503 and
later tasks not started.

### ECHO-503 RTL/LTR browser audit — 2026-11-12

**PASS for the stated acceptance (screenshot + keyboard matrix) under WebKitGTK;
cross-engine/native/screen-reader/zoom gates stay with ECHO-505/601/605.** Added
`scripts/audit-rtl.py`, a real WebKitGTK 2.52.6 + Xvfb harness that builds its own
private loopback server, captures 71 viewport PNGs and asserts bidi direction,
overflow, `bdi` isolation, number stability, nav order, rail overlap and mobile
drawer behavior across all 27 localized routes at 1440/1024/768/375/320 px in
light and dark. Fixed two confirmed RTL defects: localized name/description fields
no longer force empty-field LTR (`dir="auto"` removed; email/phone stay LTR), and
concept chat tails use logical corner radii so they mirror. **PASS:** 1022 audit
checks/71 screenshots (commit `969f97f`), 12 focused form tests, 25 files/245
tests, lint, typecheck, production build, HTTP crawl, reference verification,
diff/secret scan. Evidence ZIP:
`test-results/echo-503-browser-evidence.zip` (8,334,317 bytes, CRC-verified);
report: `docs/P5-ECHO-503.md`. No Chromium/Firefox, native-reading, human
screen-reader/zoom, full visual-fidelity or legal/privacy acceptance claimed; no
API/DB, intake, `noindex`, redesign or deployment change. ECHO-504 and later tasks
not started.

### ECHO-504 locale switching — 2026-11-12

**PASS for route/slug retention and intentional preference persistence.** Audited
all nine marketing route families (homepage, services, work, analytics/chat/
booking, about, contact, privacy) across FA/EN/AR in desktop, mobile drawer,
no-script and 404 contexts. Route/slug retention already worked via `path`; the
confirmed gaps were preference persistence and fragment carry-over. One shared
client switch now writes the validated one-year `echo_locale` cookie on an
intentional choice and appends only safe in-page fragments; privacy copy in all
three locales now discloses the cookie. Query strings are intentionally not
propagated. Unknown slugs/locales fall back to localized-404 home links, and
trailing slashes 308 to the canonical path. **PASS:** targeted WebKitGTK run (37
checks/8 screenshots, commit `406adc3`), 14 new route/cookie tests, 26 files/259
tests, lint, typecheck, production build, HTTP matrix over 27 documents,
reference verification, diff/secret scan. Evidence ZIP:
`test-results/echo-504-locale-switch-evidence.zip` (649,019 bytes, CRC-verified);
report: `docs/P5-ECHO-504.md`. Owner visual follow-ups from ECHO-503 are recorded
in `docs/ECHO-503-VISUAL-FOLLOWUPS.md` and remain open; no cross-engine, native,
screen-reader/zoom or full visual-fidelity acceptance claimed. ECHO-505 and later
tasks not started.

### ECHO-VF01 targeted visual corrections — 2026-11-13

**PASS for the three owner-confirmed corrections.** Narrow authorized batch:
sticky-header legibility, Work content hierarchy and About introduction copy.
Baseline `8e8f746`; commits `70e414f`, `dd88984`, `2abcdfc`. The header glass fill
rose from 82% to 90% with a 16px blur (plus the WebKit-prefixed property);
measured band edges fell to 0.0000 in every previously affected mobile case and
0.0008/0.0016 at 768/1024, with sticky behaviour, drawer geometry and focus
unchanged. Work now leads with the published concept studies
(`workDisplayOrder`) while empty client/internal groups remain honest at 115 px
instead of 254 px: concept section 924→416 px and three concept cards inside the
initial 1440×900 viewport (0→3). At 375 px the concept heading enters the first
viewport; the first card is 30–31 px below the fold in FA/EN. About FA/EN/AR
descriptions/team/notes were rewritten as purpose/capability/collaboration copy
with no defensive verification phrasing, invented people or claims; internal
commentary moved to docs. **PASS:** 25 before + 25 after WebKitGTK 2.52.6/Xvfb
captures (146/167 checks), 14 focused tests, 27 files/263 tests, lint, typecheck,
production build, HTTP matrix, reference verification, diff/secret scan. Evidence
ZIP: `test-results/echo-vf01-visual-evidence.zip` (3,847,495 bytes, CRC- and
PNG-verified); report: `docs/ECHO-VF01.md`. Limitations: this harness rasterises
no backdrop blur (opacity layer only; owner GPU-browser check needed), no
Chromium/Firefox, native-language, screen-reader/zoom or owner sign-off. Findings
#4–#6 remain deferred; ECHO-505 and later tasks not started.

### ECHO-VF01-R1 targeted visual follow-up — 2026-11-13

**PASS for the copy correction and evidence-manifest fix; Firefox GPU header
check remains a pending manual test.** Follow-up from the independent review of
ECHO-VF01. About no longer states a team size in FA/EN/AR (headings now "A team
aligned around the problem" / «تیمی هم‌راستا برای حل مسئله» / «فريق يجمع خبراته
لحل المشكلة», plus the adjacent collaboration paragraph), with a regression guard
that scans the whole About content tree for unsupported size phrasing. The
evidence harness now builds URLs through `scripts/evidence_manifest.py`, which
fixes `/facontact` → `/fa/contact`, records `testedSourceRevision` and
`worktreeDirty`, and leaves `documentationRevision` null for a human to assign;
`scripts/test_evidence_manifest.py` covers the regression. Copy and harness
changes are committed as `a94fb57`. New About-only run from clean `a94fb57`:
39 checks, 6 captures at 375 and 1440, URLs `/fa/about` etc. **PASS:** lint, typecheck, 32
files/328 tests, production build, HTTP matrix, reference verification, 15 Python
harness tests. Evidence ZIP:
`test-results/echo-vf01-r1-about-evidence.zip`; report:
`docs/ECHO-VF01-R1.md`. No header CSS change: WebKitGTK software rendering cannot
prove backdrop blur, so `MANUAL-FIREFOX-GLASS` stays NOT_RUN with an owner-ready
procedure instead of a claimed pass.

### ECHO-QA01 repository QA tracking system — 2026-11-13

**PASS for the implemented system and its own tests; project acceptance remains
open by design.** Adds `qa/registry.json` (21 cases: 11 automated, 10 manual, 11
suites), a dependency-free runner/status/report/manual CLI (`npm run qa:run`,
`qa:status`, `qa:report`, `qa:manual`, `qa:validate`), append-only JSONL history,
and conservative freshness rules that report STALE instead of guessing. Status is
evidence-backed: missing results are NOT_RUN, dirty-tree or non-ancestor results
are STALE, owner/legal gates require the matching reviewer role, and missing
evidence stays REVIEW_REQUIRED. Historical ECHO-503/504/VF01/unit evidence is
imported with its real revision and marked imported; nothing was fabricated.
**PASS:** 32 files/328 tests (including 54 QA self-tests), lint, typecheck,
production build, HTTP matrix, reference verification. Guide: `docs/QA-SYSTEM.md`;
per-task automated history: `qa/results/automated.jsonl`. QA reports are generated
into ignored `qa/.out/`, so acceptance never depends on an ephemeral file.

## P6 — Production hardening and evidence-based QA
**Goal:** Public site is fast, accessible, secure, indexable, and operable.  
**Exit gate:** Release checklist all green or documented owner-approved noncritical exception.

Test status for this phase is tracked in the QA registry (`npm run qa:status`),
not by duplicating pass/fail state in this file. `docs/QA-SYSTEM.md` explains the
workflow; the report distinguishes implementation, automated verification,
manual acceptance, owner/legal sign-off and release readiness.

Owner visual follow-ups confirmed from ECHO-503 are tracked in
`docs/ECHO-503-VISUAL-FOLLOWUPS.md`; #1–#3 were resolved in ECHO-VF01 with
before/after evidence, while #4 (404, ECHO-506), #5 (RTL arrow) and #6
(full-theme/reference fidelity, ECHO-601/605/608) remain open.

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

Agents may create small, focused local commits for completed and verified changes after checks pass, using a task-ID Conventional Commit message (e.g. `feat(ECHO-204): persist validated inquiries`). They must never push, force-push, tag, publish, amend shared history or mix unrelated work into a commit. New development batches require explicit owner authorization; commits are review evidence, not acceptance or release approval. No bulk rewrites without approval or speculative scope creep. Prefer 1–3 tightly coupled tasks per implementation session, then report facts and update checklist. If blocked by D1–D8, record a blocker and advance independent tasks.

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

**Current position (2026-11-07):** homepage and P2-A/B1/B2 implementation delivered; owner/deployment/browser/hosted gates remain above. Next recommended product batch is **P4/ECHO-401**, separately authorized and constrained by owner facts; no P4 or launch is authorized automatically. The original sequence below is historical delivery context, not a request to repeat completed implementation.

1. **Next Developer batch — faithful homepage:** ECHO-301/302/303 reconstruct hero/technical visual, capability strip, service pillars and concept/work composition; then ECHO-304/305/306 presentation/307 populate benefits/process, baseline header/footer and inquiry region, bounded artwork behavior. These are focused increments within one homepage milestone, not a design-system project. Reuse locale/theme/menu logic; adjust presentation only for fidelity or targeted fixes. No new pages/API/DB in this batch. Use section components, local assets/build-time CSS and typed locale content; retain all three routes and honest concept labels. Preserve inquiry location/proportions, visibly disable submission until P2, and make CTA scroll to that clearly unavailable section. Never copy fake success, contacts, metrics or unsupported claims. Run lint/type/unit/build/HTTP checks, log deviations; browser criteria remain partial. ECHO-109 compares this work, not an alternative preview design.
2. **Immediately following — real inquiry milestone:** ECHO-201/202/203 (disposable PostgreSQL, migrations/constraints, shared Unicode-aware validation), then ECHO-204/205/206/207 (durable endpoint + canonical localized homepage form, origin/size/abuse/idempotency protection), then ECHO-208/210 (restricted readback, integration/concurrency/failure tests, browser-to-DB evidence when available). These are sequential sub-batches, not permission to skip safeguards. Reuse the form on the later contact page. ECHO-209 stays optional/disabled without an approved inbox. Finish ECHO-306 conversion acceptance here; no fake-success interim.
3. **Remaining product:** ECHO-401–407 real service/work/about/contact/privacy pages → ECHO-501–506 complete FA/EN/AR content/native review → P6/P7 hardening/release. Basic localization/accessibility/security accompany every feature, not a later retrofit.
4. **Parallel evidence, not a stalled implementation queue:** ECHO-003/105/107/108, ECHO-109/308 comparison/keyboard/zoom and hosted ECHO-103. Existing Fedora browser over localhost-only SSH forwarding is acceptable. No repeated installers/security changes. Keep tasks unchecked until their actual criteria pass; no release with outstanding browser/security/data gates.

No business decision blocks faithful layout implementation: missing publishable facts require omission or explicit concept labeling, not invented content. Usable isolated PostgreSQL tooling is required for DB integration; request approval only if provisioning requires system/host/network changes. D5 blocks operational handoff; D6, verified contacts and hosting approvals block release, not synthetic local development. Significant visual departures require owner approval before implementation.
