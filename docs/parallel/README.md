# Echo Devs V1.0 — dependency-aware coordination

**Reconciled 2026-11-15, source baseline `a015c8f62e7fd91e117c31d2c39eac8b38bb9456`
(A1 accepted and integrated).** No lane is active on `main`; a separate E1 worker
may be running in its own worktree. See [NOW](NOW.md) for the current wave; owner
approval is required before assignment or execution. The
supplied nine-file scaffold was reconciled on 2026-11-14, preserving its lane
names and task IDs; added subtask IDs separate safe preparation from missing
acceptance or external authorization. A1 was the first executed lane task; its
handoff is `docs/parallel/handoffs/A1.md`.

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
accountability in `docs/APPROVALS.md`). H1 is options research only; H2–H4 stay
blocked. No tracker, dependency, account, public intake or indexing is enabled,
and the published disclosure still correctly states that no analytics exists.

## Inspected baseline and acceptance boundary

| Area | Actual repository / evidence | Planning conclusion |
|---|---|---|
| Product | `src/app/[locale]/(marketing)/**`, `src/content/**`, shared components; P4 reports and ECHO-407 crawl | All nine families × three locales implemented, not new page-building tasks. ECHO-401–407 remain acceptance-partial |
| Foundation / homepage | ROADMAP ECHO-003,103,105,107–109,301–308; `src/styles/**`, layout components, P1/P3 reports | Implemented shell/homepage; hosted CI, full reference, native/a11y acceptance not closed by historical fixtures |
| Visual fixes | `70e414f`, `dd88984`, `a94fb57`, `a90938f`; `docs/ECHO-503-VISUAL-FOLLOWUPS.md` | Findings #1–4 addressed narrowly. #1 GPU check, #5 RTL arrow, #6 full fidelity still open. Do not repeat accepted implementation |
| Localization | `fc1c578`, `fd923a7`, ECHO-501/503/504/505 reports, typed dictionaries and parity tests | ROADMAP checked engineering milestones retained; historical acceptance not a fresh release pass. Native FA/AR and real zoom remain open |
| SEO preview | `a90938f`, `65b890e`, `ba7f116`, results commits `7900c6e`, `62c5cdf`; `docs/P5-ECHO-506.md` | C3 DONE for preview engineering slice. ECHO-506 remains PARTIAL; production/OG/owner review not done |
| SEO production gap | `src/lib/seo/{site,policy}.ts`, robots/sitemap, route metadata | Validated origin gates exist. `PREVIEW_ROBOTS` stays constant even with indexing flag; C4 must prepare coherent approved public metadata, G3 alone enables it |
| Inquiry | `88d123f`, handler/store/limits/network, DB migrations, scripts, P2 reports | P2-201–204 local implementation accepted historically; remaining P2 acceptance partial. Default API enable flag false unless explicitly set; no environment secret files inspected |
| Operations | `docs/INQUIRY-OPERATIONS.md`, `docs/INQUIRY-PRIVACY.md`, `scripts/inquiry-ops.mjs` | Read/erase/backup/restore exist locally; CLI rejects non-project Unix sockets. Production adaptation, policy, ingress, schedule and real operator acceptance missing |
| Infrastructure | `.github/workflows/ci.yml`, `docs/CI.md`, architecture/decision ledger | Local pinned CI exists, no hosted negative-check/deployed staging proof. No external actions performed |
| Product decisions | `SCOPE.md` v1.2 §8.4/§12.1, `docs/DECISIONS.md` A12–A13, `docs/APPROVALS.md`, `docs/parallel/handoffs/A1.md` | A1 DONE at `a015c8f`: V1 definition of done and mandatory analytics recorded; approval roles defined. Scope only — no capability, provider or approval inferred |
| Analytics | package manifest, app/content/handler inspected; A1 scope decision | Private analytics mandatory for V1, but no tracker/dashboard/provider is approved or implemented and the privacy disclosure correctly says none. H1–H4 own the work |

### QA evidence snapshot, not a second tracker

`npm run qa:validate` and `npm run qa:status` were executed at
`a015c8f`: **31 cases, 15 suites; 14 PASS, 0 FAIL, 1 BLOCKED, 4 STALE,
12 NOT_RUN**. The A1 documentation change touched no QA watch path, so the
recorded statuses are unchanged from `6eedf3b`. This paragraph is a dated
reconciliation snapshot only; always recompute with QA01. Raw histories
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
| D | 25–43 | Existing P2 reused; production access/lifecycle adaptation, staging and handoff remain |
| E | 26–43 | Workflow reused; provider contract, secure staging, host controls and hosted verification remain |
| F | 25–43 | QA engine reused; missing coverage, manual/performance/cross-engine and RC execution remain |
| H | 17–31 | Inclusion confirmed (A1); no provider/implementation/privacy approval exists, reuse-first design assumed |
| G | 13–23 | Integrated release and production/operator validation only; no duplicate lane engineering |
| Total | 151–264 | Analytics included; excludes costs, vendor/owner waiting and post-launch enhancements |

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
evidence. No seeded UNVERIFIED states remain. A1 is the first lane task moved to
DONE, at `a015c8f` with an integrated handoff; its consumers stayed BLOCKED only
where another prerequisite (E1, E1a, B3) is missing and became TODO where A1 was
the sole prerequisite. READY is **computed**, not a completion status: every
dependency DONE plus available execution resources, approval to perform that kind
of work and an uncontested file/environment lease. Scheduling eligibility does not
authorize the next batch.

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
| H | `docs/parallel/handoffs/H1.md` (after assignment) | Analytics adapter only; no submission-hook or privacy-copy edits |

First wave is documentation/audit output only: no production source writes, QA
history writes, browsers or DBs needed. A's decision work can proceed alongside
five technical packets without conflicting files. For later waves, maintain a
file-level lease in NOW before edits; `package*.json`, `.env.example`, Next
config, routes/layout, inquiry form and tokens are shared contracts, not open
ownership. Parallel worktrees do not resolve logical conflicts. Private ports,
artifact directories and disposable DB names must be distinct; staging
migrations/restores/deploys serialized. No cross-worker secret/config sharing.

## G — sequential integrated release (not an eighth lane)

These dependencies conservatively include H pending A1. Estimates exclude
waiting, infrastructure costs and monitoring elapsed time.

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
