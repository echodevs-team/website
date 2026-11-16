# Echo Devs V1.0 — dependency-aware coordination

**Reconciled 2026-11-16, source baseline `55b842236e33fde0fc0cc855e97aae41d36ca409`
(A1, D1 and H1 accepted and integrated).** No lane is active on `main`; a separate E1
worker may be running in its own worktree. See [NOW](NOW.md) for the current wave;
owner approval is required before assignment or execution. The
supplied nine-file scaffold was reconciled on 2026-11-14, preserving its lane
names and task IDs; added subtask IDs separate safe preparation from missing
acceptance or external authorization. Executed lane tasks so far: A1
(`docs/parallel/handoffs/A1.md`), the D1 audit
(`docs/parallel/handoffs/D1.md`) and the H1 analytics-options packet
(`docs/parallel/handoffs/H1.md`).

## Scope and authority

SCOPE and ROADMAP govern product acceptance; QA01 governs observed test results;
these plans govern scheduling, not acceptance overrides. V1 requires the faithful
FA/EN/AR site, truthful approved content, durable secure inquiry, privacy/operator
and production recovery readiness, browser/accessibility/performance evidence,
approved HTTPS origin and owner-controlled launch. CMS, public admin, fabricated
proof and speculative services are not prerequisites.

**Analytics scope resolved (A1, 2026-11-15): mandatory V1.0.** A private
administrative traffic-analytics dashboard is required; requirements are in
`SCOPE.md` §8.4 and `SCOPE.md` §1.4 no longer excludes it. A maintained existing
self-hosted product must be reused rather than a custom engine — Umami is a
candidate only. **Technical implementation and privacy decisions remain open:**
provider, hosting, consent position, event scope, retention, dashboard access
owner and processor terms are unapproved (decision keys in `docs/DECISIONS.md`,
accountability in `docs/APPROVALS.md`). H1 is accepted options research: it
compares Umami, Plausible CE and Matomo and conditionally recommends Umami, but
**no provider is approved** and H2–H4 stay blocked. No tracker, dependency,
account, public intake or indexing is enabled, and the published disclosure still
correctly states that no analytics exists.

## Inspected baseline and acceptance boundary

| Area | Actual repository / evidence | Planning conclusion |
|---|---|---|
| Product | `src/app/[locale]/(marketing)/**`, `src/content/**`, shared components; P4 reports and ECHO-407 crawl | All nine families × three locales implemented, not new page-building tasks. ECHO-401–407 remain acceptance-partial |
| Foundation / homepage | ROADMAP ECHO-003,103,105,107–109,301–308; `src/styles/**`, layout components, P1/P3 reports | Implemented shell/homepage; hosted CI, full reference, native/a11y acceptance not closed by historical fixtures |
| Visual fixes | `70e414f`, `dd88984`, `a94fb57`, `a90938f`; `docs/ECHO-503-VISUAL-FOLLOWUPS.md` | Findings #1–4 addressed narrowly. #1 GPU check, #5 RTL arrow, #6 full fidelity still open. Do not repeat accepted implementation |
| Localization | `fc1c578`, `fd923a7`, ECHO-501/503/504/505 reports, typed dictionaries and parity tests | ROADMAP checked engineering milestones retained; historical acceptance not a fresh release pass. Native FA/AR and real zoom remain open |
| SEO preview | `a90938f`, `65b890e`, `ba7f116`, results commits `7900c6e`, `62c5cdf`; `docs/P5-ECHO-506.md` | C3 DONE for preview engineering slice. ECHO-506 remains PARTIAL; production/OG/owner review not done |
| SEO production gap | `src/lib/seo/{site,policy}.ts`, robots/sitemap, route metadata | Validated origin gates exist. `PREVIEW_ROBOTS` stays constant even with indexing flag; C4 must prepare coherent approved public metadata, G3 alone enables it |
| Inquiry | `88d123f`, handler/store/limits/network, DB migrations, scripts, P2 reports | P2-201–204 local implementation accepted historically; remaining P2 acceptance partial. Default API enable flag false unless explicitly set; no environment secret files inspected. D1 audited the current surface: 6 BLOCKER gaps remain (trusted ingress, edge limits, operator identity/tooling, retention, backup) |
| Operations | `docs/INQUIRY-OPERATIONS.md`, `docs/INQUIRY-PRIVACY.md`, `scripts/inquiry-ops.mjs`; D1 §4 host contract | Read/erase/backup/restore exist locally; CLI rejects non-project Unix sockets. Production adaptation, policy, ingress, schedule and real operator acceptance missing. D1 converted this into explicit hard/optional host requirements (HC-V/HC-L/HC-B) for E1a and for D1's own operator/retention/backup blockers |
| Infrastructure | `.github/workflows/ci.yml`, `docs/CI.md`, architecture/decision ledger | Local pinned CI exists, no hosted negative-check/deployed staging proof. No external actions performed |
| Product decisions | `SCOPE.md` v1.2 §8.4/§12.1, `docs/DECISIONS.md` A12–A13, `docs/APPROVALS.md`, `docs/parallel/handoffs/A1.md` | A1 DONE at `a015c8f`: V1 definition of done and mandatory analytics recorded; approval roles defined. Scope only — no capability, provider or approval inferred |
| Analytics | package manifest, app/content/handler inspected; A1 scope decision; `docs/parallel/handoffs/H1.md` | Private analytics mandatory for V1, but no tracker/dashboard/provider is approved or implemented and the privacy disclosure correctly says none. H1 accepted (Umami conditionally recommended, not approved); H2–H4 own the work |

### QA evidence snapshot, not a second tracker

`npm run qa:validate` and `npm run qa:status` were executed at
`d84a17a`: **31 cases, 15 suites; 14 PASS, 0 FAIL, 1 BLOCKED, 4 STALE,
12 NOT_RUN**. Neither the A1 nor the D1 documentation change touched a QA watch
path, so the recorded statuses are unchanged from `6eedf3b`. This paragraph is a
dated reconciliation snapshot only; always recompute with QA01. Raw histories
`qa/results/{automated,manual}.jsonl` were inspected.

- Current preview SEO/404 records are PASS at `7900c6e`; general unit/build/
  lint/type/reference/font records at `ba7f116` remain current by watch rules.
- RTL, locale-switch, visual-correction and typography browser matrices are
  STALE. First visual record was dirty; other watch paths changed. Reports
  describing past PASS are not substituted for these statuses.
- `PG-INQUIRY-INTEGRATION` is NOT_RUN in QA01 despite historical P2 fixture
  reports. All twelve unrun cases include native, SR/keyboard, zoom, cross-engine,
  404 metadata, legal, origin, SEO and owner release/visual acceptance.
- `MANUAL-FIREFOX-GLASS` is **BLOCKED** in the actual manual history (not the
  NOT_RUN wording in older reports): recorded environment lacks Firefox,
  Chromium/GPU. Existing WebKitGTK cannot prove GPU backdrop blur.
- `test-results/echo-50{3,4,5,6}-*` and VF01/R1 archives exist locally; not
  newly rendered or visually approved in this batch. Bulk artifacts are ignored;
  durable handoff evidence belongs in `qa/evidence/<TEST-ID>/`. Their presence
  alone is not manual acceptance or portability proof.

No app/browser/DB suites or manual acceptance were run during planning. No QA
records were added or changed. Missing production/analytics/security/performance
coverage goes into F1's proposal, then the existing QA registry, never a new
test tracker. ROADMAP checkboxes were not changed.

## States, dependencies and evidence

### Revised remaining effort

| Lane | Remaining human hours | Estimate basis / uncertainty |
|---|---:|---|
| A | 10–20 | A1 is DONE (0 h); approval and provider/origin decisions remain |
| B | 20–35 | Work/About/404 fixes not repeated; complete reference/GPU comparison and residual defect size uncertain |
| C | 15–26 | Preview C3 is zero; native review, approved facts, public SEO/disclosure remain |
| D | 22–38 | D1 audit accepted (0 h); existing P2 reused; production access/lifecycle adaptation for D1's operator/retention/backup blockers, staging and handoff remain |
| E | 26–43 | Workflow reused; provider contract, secure staging, host controls and hosted verification remain |
| F | 25–43 | QA engine reused; missing coverage, manual/performance/cross-engine and RC execution remain |
| H | 14–26 | H1 options research accepted (0 h); no provider/implementation/privacy approval exists, so selection, integration and verification remain |
| G | 13–23 | Integrated release and production/operator validation only; no duplicate lane engineering |
| Total | 145–254 | Analytics included; excludes costs, vendor/owner waiting and post-launch enhancements |

All figures sum task rows and estimate **remaining** work, not elapsed historical
development. Re-estimate after audits and actual reviewer/provider commitments;
unbounded major defects are not promised inside these ranges. Analytics is
included; if the owner ever reverses that, do not merely subtract hours: the
coordinator must also update scope, disclosure work, graph edges, acceptance and
QA coverage under the recorded decision.

`TODO`: known unfinished deliverable; `NEEDS_REVALIDATION`: prior partial
implementation/evidence but missing final/current acceptance; `BLOCKED`: cannot
complete because named upstream/input/capability is missing; `IN_PROGRESS` and
`IN_REVIEW`: only for authorized active work; `DONE`: exact slice accepted with
evidence. No seeded UNVERIFIED states remain. A1 was the first lane task moved to
DONE, at `a015c8f` with an integrated handoff; its consumers stayed BLOCKED only
where another prerequisite (E1, E1a, B3) is missing and became TODO where A1 was
the sole prerequisite. D1 is the second: DONE at `d84a17a` for an audit-only
deliverable, keeping D2/D3/E1a/H3 BLOCKED on their **other** prerequisites while
D1's six blockers became explicit acceptance conditions inside
D2/E1a/E2/E3/E4. H1 is the third: DONE at `55b8422` for a research-only
deliverable; it supplies the provider/metrics/architecture decision input but
approves no provider, so H2 stays BLOCKED on the owner/legal A3 answers rather
than on H1. READY is **computed**, not a completion status: every dependency
DONE plus available execution resources, approval to perform that kind of work and
an uncontested file/environment lease. Scheduling eligibility does not authorize
the next batch.

Every table lists exact prerequisite IDs, remaining senior human hours, evidence
and downstream edges. Date/source at each file top apply to every row unless a
row cites a narrower implementation revision. Evidence column names acceptance
still needed, not an assertion it passed. `Unlocks` shows direct consumers;
transitive fan-out is computed by the checker. Dependencies are acceptance
prerequisites for completing the **whole** named task; inspect subtask IDs for
safe preparatory work. Shared observations do not require finishing a whole
phase. C4 no longer waits for E2 merely to prepare public-policy code; C5 needs
actual staging. D3 now correctly waits for production-compatible D2 tooling.
Final F2/F3 wait for C5 content and F3 for integrated operational/analytics
changes instead of testing a moving pre-RC target. F2a allows earlier
accessibility baseline work without holding all audits until final content.

## Ownership and isolation

Only coordinator edits/integrates `docs/parallel/**`, ROADMAP, SCOPE, decisions,
QA definitions/history/evidence, shared status and final release configuration.
F proposes QA changes; it is not a second shared-registry integration owner.
Workers return handoffs; they do not self-close planning rows or owner gates.

After owner approval, use one branch/worktree per assigned task, all from the
same accepted integration commit: branch `parallel/<task-id>`, worktree
`~/projects/echodevs-<task-id>` (A1 precedent: `parallel/a1`,
`~/projects/echodevs-a1`). Project-local `.worktrees/` is only acceptable after
ensuring it is ignored. Do not create worktrees or begin lanes as part of this
planning batch. Preserve existing user work. Never edit another checkout or
another task's handoff file. Commits/staging by future workers require explicit
owner authorization; the current commit permission covers this planning batch
only. No push.

**Handoff convention (standardized 2026-11-15):** one file per task at
`docs/parallel/handoffs/<TASK-ID>.md` (for example `A1.md`, `E1.md`). The older
`docs/handoffs/<lane>/` directories are retired and must not be created. A
per-task file keeps concurrent workers from colliding in the same directory and
gives the coordinator one artifact per accepted branch; workers never edit or
rename another task's handoff. Lane plans that still name `docs/handoffs/<lane>/`
anywhere are superseded by this paragraph, so no lane file needs rewriting while
another task is in flight.

| Lane | First-wave exclusive output | Later ownership / conflict rule |
|---|---|---|
| A | `docs/parallel/handoffs/A2.md` | Proposals; coordinator applies approved decisions |
| B | `docs/parallel/handoffs/B1a.md` | Presentation/styles; shared header/layout/tokens assigned per task |
| C | `docs/parallel/handoffs/C1a.md` | Localized content, dictionaries, SEO metadata; D/H request disclosure changes |
| D | `docs/parallel/handoffs/D1.md` | DB/API/validation/ops and approved conversion hook; E supplies host boundary |
| E | `docs/parallel/handoffs/E1.md` | CI/host configuration/runbooks; exclusive staging deployment lease |
| F | `docs/parallel/handoffs/F1.md` | Assigned tests/harnesses, QA proposals; coordinator integrates records |
| H | `docs/parallel/handoffs/H1.md` (accepted 2026-11-16) | Analytics adapter only; no submission-hook or privacy-copy edits. H2's owner decision record is next, assigned only after the A3 answers exist |

First wave is documentation/audit output only: no production source writes, QA
history writes, browsers or DBs needed. A's decision work can proceed alongside
five technical packets without conflicting files. For later waves, maintain a
file-level lease in NOW before edits; `package*.json`, `.env.example`, Next
config, routes/layout, inquiry form and tokens are shared contracts, not open
ownership. Parallel worktrees do not resolve logical conflicts. Private ports,
artifact directories and disposable DB names must be distinct; staging
migrations/restores/deploys serialized. No cross-worker secret/config sharing.

## G — sequential integrated release (not an eighth lane)

These dependencies include the analytics chain recorded by A1 (A12/A13).
Estimates exclude waiting, infrastructure costs and monitoring elapsed time.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| G1 | Integrated staging: site, secure inquiry and approved analytics | B4, C5, D4, E4, F3, H4 | 4–7 | BLOCKED | Synthetic browser→DB/replay/failure/analytics proof on one clean RC, no real users | G2 |
| G2 | Explicit owner/legal release approval at exact RC | A4, G1, F4 | 2–4 | BLOCKED | Current QA release gates and written decision; no safety gate waived by aggregate PASS | G3 |
| G3 | Separately authorized production deploy, controlled inquiry/indexing enablement | G2, D4, E4, C5, H4 | 3–5 | BLOCKED | ECHO-703/704/705: TLS, approved origins, live controlled TEST readback/cleanup, public/search checks; no automatic env flip | G4 |
| G4 | Production smoke, recovery proof, operator handoff and monitoring ownership | G3, D5, E4 | 4–7 | BLOCKED | ECHO-706 launch/rollback version, synthetic test cleanup, backup/recovery and first-week checklist | — |

## Repeatable coordinator refresh

Trigger on **every accepted task/handoff, commit/source revision change, QA
definition/result/freshness change, owner decision, newly found defect or resource
change**, including doc-only commits (check watches rather than assuming stale).

1. Capture HEAD, `git status --short --branch`, recent history and exact changed
   paths; preserve unrelated work. Inspect relevant source and report, not only
   historical status prose. Record review date and tested/accepted source commit.
2. Run `npm run qa:validate`, `npm run qa:status`, and when useful
   `npm run qa:report -- --stdout`. These read status, not run suites. Missing/
   stale/blocked results remain as such. For **authorized executed** checks use
   `qa:run` on a clean implementation commit; append real manual observations
   with actual reviewer/role/evidence using `qa:manual`. Never fabricate legal
   approval, overwrite history or rerun development suites merely to refresh docs.
3. Review handoff: task, exact files/commit, clean/dirty state, real QA records,
   durable evidence, unresolved defects and actual owner approvals. Verify
   acceptance; implementation without acceptance stays partial/revalidation.
   Accept or return for correction; only then update task state and estimates.
4. Coordinator integrates source and QA deliberately; re-evaluate watch freshness
   at integrated HEAD. Merge success alone is not task acceptance. Record changed
   graph edges and decisions, amend ROADMAP only with its acceptance evidence.
5. Recompute roots, transitive unlock counts and longest remaining chain; update
   NOW CURRENT/READY/NEXT/BLOCKED, dates, blockers, estimates, files and leases.
   Prioritize release-policy/provider roots, then quality baseline and shortest
   ready work. Explain any override of raw graph fan-out; waiting is not effort.
6. Run `python3 docs/parallel/check-plan.py` and `git diff --check`; inspect links,
   estimates, all IDs/cycles, no false DONE/manual claims and no overlapping
   leases. Review staged files/diff for secrets and scope. Commit only explicitly
   authorized planning/evidence changes. Request approval for the next wave;
   newly eligible work never starts automatically.

`check-plan.py` validates scheduling metadata only. It does not interpret QA
outcomes, manufacture READY/acceptance, write results or replace ECHO-QA01.
Markdown has no repository linter configured; structural/link checks and diff
whitespace checks are the planning-specific validation.

### Planning verification — 2026-11-14 (historical, pre-A1 baseline)

- `python3 docs/parallel/check-plan.py`: PASS, 40 task IDs, no missing
  dependencies/cycles, all reverse edges consistent, valid remaining estimates
  and local Markdown links. Totals 153–268h; six dependency roots match NOW.
- In-memory checker fixtures: one valid graph accepted; unknown dependency,
  cycle, reverse-edge drift and duplicate dependency each rejected; Python
  `compile(...)` syntax check passed. No fixture files or application data written.
- `npm run qa:validate`: PASS, 31 unique cases (12 manual), 15 suites.
- `npm run qa:status` / `npm run qa:report -- --stdout`: executed; observed
  recorded statuses summarized above. These do not execute suites or add results;
  report output is ignored under `qa/.out/`.
- Initial planning validation caught inconsistent reverse-edge summaries and an
  overbroad NOW ID/prose check; corrected before final validation. No test history
  was suppressed or rewritten.
- Staged whitespace/scope review and post-commit status are reported in the
  coordinator handoff. No repository Markdown linter exists; no app, browser,
  PostgreSQL, deploy or development lane was executed. QA release readiness
  remains **NO**, not a planning validation failure.

### Planning verification — 2026-11-15 (A1 integration)

- **A1 verified before integration:** branch `parallel/a1` held exactly two
  commits (`9be2de7`, `a015c8f`) touching eight documentation files
  (`SCOPE.md`, `ROADMAP.md`, `docs/APPROVALS.md`, `docs/DECISIONS.md`,
  `docs/INQUIRY-PRIVACY.md`, the A and H lane plans, and
  `docs/parallel/handoffs/A1.md`). No `src/**`, `qa/**`, package manifest,
  workflow, migration or E-lane file; `git diff --check` clean; the handoff
  matched the diff.
- **Integration:** `git merge --ff-only parallel/a1` fast-forwarded `main` to
  `a015c8f`. No history rewrite, no merge commit, no force, no push; the main
  checkout was clean before and after.
- **State change:** A1 → DONE (0–0h) citing the integrated commits; A2 and A3 →
  TODO because their only prerequisite was A1 (owner input still required for the
  deliverables); A5/A6 stay BLOCKED on E1/E1a; B4 stays BLOCKED on B3; H1 → TODO
  as options research only. **No dependency edge changed** and no other row's
  estimate changed.
- `python3 docs/parallel/check-plan.py`: PASS, 40 tasks, unique IDs,
  dependencies, reverse edges, DAG and local links valid; totals **151–264h**;
  eight dependency roots (A2, A3, B1a, C1a, D1, E1, F1, H1).
- `npm run qa:validate`: PASS, 31 unique cases (12 manual), 15 suites.
  `npm run qa:status` re-executed at `a015c8f`: 14 PASS, 0 FAIL, 1 BLOCKED,
  4 STALE, 12 NOT_RUN — identical to `6eedf3b` because no QA watch path changed.
  No result was added, edited or deleted and no reviewer or timestamp was invented.
- Stale "open scope decision A1" text and the handoff-directory convention were
  reconciled here, and `NOW.md` was regenerated. No application, browser, DB,
  deployment or external action was performed and no development lane was started.

### Planning verification — 2026-11-15 (D1 integration)

- **D1 verified before integration:** `parallel/d1` held exactly one new commit
  (`d84a17a`) adding one file, `docs/parallel/handoffs/D1.md` (599 lines), on top
  of `53a181e`. No `src/**`, `qa/**`, package manifest, workflow, migration,
  decision/scope file or host change; `git diff --check` clean; the handoff
  matched the diff and was internally consistent (22 gaps = 6 BLOCKER + 12
  IMPORTANT + 4 OPTIONAL, each covered by a §9 group).
- **Integration:** `git merge --ff-only parallel/d1` fast-forwarded `main` to
  `d84a17a`. No history rewrite, no merge commit, no force, no push, no tag; the
  main checkout was clean before and after. Branches/worktrees `parallel/a1` and
  `parallel/d1` were preserved and no E1 branch exists.
- **State change:** D1 → DONE (0–0h) citing the integrated commit and the audit
  evidence. D2, D3, E1a and H3 keep their other prerequisites (A3, E2, E1, A5,
  H2) and stay BLOCKED; their evidence now cites D1's gaps and host contracts
  (D2 → D1-G07–G10 and HC-L/HC-B; E1a → §4; H3 → §4.8/§7). Lane D effort
  25–43h → 22–38h and the total 151–264h → 148–259h. **No dependency edge was
  added or removed** and no other task's estimate changed.
- **Six blockers preserved verbatim** and mapped to downstream ownership:
  D1-G01/D1-G02 (trusted ingress, edge volumetric limits) → E1a/E2;
  D1-G07/D1-G08/D1-G09 (operator identities, managed-DB tooling,
  retention/purge) → D2; D1-G10 (production backup/recovery) → D2 with E3/E4
  verification. No business, legal
  or QA record was changed and no blocker was accepted as resolved.
- **Newly READY:** none beyond the pre-existing roots. Post-D1 roots are A2, A3,
  B1a, C1a, E1, F1, H1; the graph has no new eligible task because D1's
  consumers each need at least one further input.
- `python3 docs/parallel/check-plan.py`: PASS, 40 tasks, unique IDs,
  dependencies, reverse edges, DAG and local links valid; totals **148–259h**;
  seven dependency roots (A2 10 unlocks/57h, A3 18/89h, B1a 12/72h, C1a 11/63h,
  E1 22/101h, F1 9/49h, H1 12/78h).
- `npm run qa:validate`: PASS, 31 unique cases (12 manual), 15 suites.
  `npm run qa:status` re-executed at `d84a17a`: 14 PASS, 0 FAIL, 1 BLOCKED,
  4 STALE, 12 NOT_RUN — identical to `6eedf3b` because no QA watch path changed.
  No result was added, edited or deleted and no reviewer or timestamp was invented.
- D1's own QA-coverage and stale-convention findings are recorded here as gaps
  (they feed F1 and the F2a/D3 cases) and were **not** fixed in this batch: the
  QA registry, results and manual acceptance remain untouched. Host, retention
  and backup blockers stay open and unassigned. No application, browser, DB,
  deployment or external action was performed and no development lane was
  started beyond the concurrent E1 worker already authorized.

### Planning verification — 2026-11-16 (H1 integration)

- **H1 verified before integration:** `parallel/h1` held exactly one commit
  (`55b8422`) on top of `d713abd`, adding one file,
  `docs/parallel/handoffs/H1.md` (827 lines). No `src/**`, `qa/**`, package
  manifest, workflow, migration, decision/scope/roadmap file or deployment
  configuration; only the authorized handoff was written, and the working tree
  was clean before and after the commit.
- **Handoff review:** all thirteen required sections are present, each H1
  requirement in the lane definition maps to a section, and the recommendation is
  explicitly conditional. `[V]`/`[A]`/`[U]` markers separate vendor facts from
  engineering estimates, and §13 lists the unresolved items. The event contract
  contains no form values, contacts, inquiry reference, idempotency key or IP,
  keeps the conversion tied to `replayed:false`, and forbids retries or a client
  fallback that could overcount. Owner answers are requested (twelve questions in
  §10) rather than invented, and "cookieless" is not equated with consent
  exemption. Repository claims were re-read in source (`package.json`,
  `src/lib/inquiries/{client,store}.ts`, `src/app/api/inquiries/route.ts`,
  `src/content/privacy.ts`, `SCOPE.md` §8.4) and match.
- **Vendor spot-check during review:** the Umami installation page confirms Node
  20.19+ (22 LTS recommended), PostgreSQL ≥ 12.14 and the v3.5.0 forced
  default-password change; the Umami collection-API page confirms `/api/send`
  needs no token but does require a `User-Agent` and supports `type: "event"`;
  the Plausible CE README confirms v3.2.1, Docker, a ClickHouse requirement with
  SSE 4.2/NEON and ≥ 2 GB RAM; the Plausible events API page confirms server,
  webhook and retry events are unsuitable for attribution and may be dropped.
  One addition worth recording: Plausible answers `202` even for a dropped event
  (`x-plausible-dropped`), which reinforces H1's caution rather than changing it.
  Load-bearing claims not re-verified here remain `[U]` in H1 §13 for H2/H3.
- **Known imprecision, not a state change:** H1 §11.1 lists only `H4` beside
  `G1/G3`; those release tasks also require their full prerequisite sets in their
  lane files. The lane tables remain authoritative and no edge was altered.
- **Integration:** `git merge --ff-only parallel/h1` fast-forwarded `main` to
  `55b8422`. No history rewrite, merge commit, force, push or tag; the main
  checkout was clean before and after. Branches/worktrees `parallel/a1`,
  `parallel/d1` and `parallel/h1` were preserved. No E1 branch or worktree exists
  on this machine and nothing about E1 is integrated.
- **State change:** H1 → DONE (0–0h) citing the integrated commit and the
  delivered options packet; **H2 stays BLOCKED** because only its A3
  owner/legal prerequisite remains, not because H1 is missing. Lane H effort
  17–31h → 14–26h and the total 148–259h → 145–254h. **No dependency edge was
  added or removed** and no other task's estimate changed. Umami is recorded as a
  recommendation, not an approval; no provider, consent, retention, budget,
  hosting or access decision was made here.
- **Conversion trade-off recorded for H2/H3:** server-side confirmed-write
  events are replay-safe but best-effort (lost, timed-out or bot-filtered events
  undercount), while client-side events attribute better but can double count on
  an uncertain retry that resolves as a replay. Counts therefore stay a lower
  bound; no client fallback and no reconciliation by inflating events.
- `python3 docs/parallel/check-plan.py`: PASS, 40 tasks, unique IDs,
  dependencies, reverse edges, DAG and local links valid; totals **145–254h**;
  six dependency roots (A2 10 unlocks/57h, A3 18/89h, B1a 12/72h, C1a 11/63h,
  E1 22/101h, F1 9/49h). H1 and D1 are DONE and no longer roots; H2 gained no
  edge but remains blocked on A3.
- `npm run qa:validate`: PASS, 31 unique cases (12 manual), 15 suites.
  `npm run qa:status` re-executed at `55b8422`: 14 PASS, 0 FAIL, 1 BLOCKED,
  4 STALE, 12 NOT_RUN — identical to `6eedf3b` because no QA watch path changed.
  No result was added, edited or deleted and no reviewer or timestamp was invented.
- H1's proposed analytics cases (`ANALYTICS-001`–`ANALYTICS-012`) and D1's
  coverage gaps were recorded as **proposals for F1**, not registered: the QA
  registry, results and manual acceptance remain untouched. Host, retention,
  consent and backup decisions stay open and unassigned. No application, browser,
  DB, deployment or external action was performed and no development lane was
  started beyond the concurrent E1 worker already authorized.
