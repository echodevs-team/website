# NOW — proposed execution, not authorization

Reviewed **2026-11-14**, implementation/QA baseline **`6eedf3b`**. Planning-only
changes do not complete development tasks. Recompute after each accepted change
using [the coordinator refresh procedure](README.md#repeatable-coordinator-refresh).

## CURRENT

- Coordinator: reconciliation and planning verification only. **No active lane**,
  no assigned worktrees, no source/QA writes and no environment locks held.
- Seven lane plans reconciled. Only **C3** is DONE: ECHO-506 preview engineering
  acceptance, not production SEO or manual metadata acceptance.
- QA01 is authoritative: baseline snapshot 14 PASS / 1 BLOCKED / 4 STALE /
  12 NOT_RUN, no FAIL. These are inspected recorded outcomes, not suites run here.
- Mandatory analytics scope is unresolved (A1); intake/indexing/analytics remain
  disabled by default in code, not verified deployment settings.

## READY — first proposed maximum safe wave

Six concurrent tasks are dependency-eligible **for bounded preparation/decision
work only**. All have no predecessors. Owner must authorize this wave and assign
the A1 decision maker. Each worker writes only its exclusive handoff directory;
no app, harness, shared planning, roadmap or QA file edits. No browser/DB/server,
external operations or installs needed for this wave. Read-only source inspection
can overlap. No reason to create a seventh task by bypassing A1.

| Rank | Lane / candidate | Remaining effort | Transitive unlocks / longest upper chain | Dependencies / capability | Exclusive output | Why now |
|---|---|---:|---|---|---|---|
| 1 | A / A1 | 2–4h | 28 / 101h | None; actual owner decision required | `docs/handoffs/A/` | Resolve release DoD, analytics scope and approvers; opens policy, provider/origin and H roots |
| 2 | E / E1 | 2–4h | 22 / 101h | None; local repository inventory only | `docs/handoffs/E/` | Hosting approval packet shortens staging/TLS/CI critical path; no remote changes |
| 3 | D / D1 | 3–5h | 21 / 100h | None; source/runbook audit only | `docs/handoffs/D/` | Unblocks host contract and lifecycle; exposes local-only operator CLI and signed ingress gap before choosing provider |
| 4 | B / B1a | 2–3h | 12 / 72h | None; existing evidence/source inventory only | `docs/handoffs/B/` | Prepare precise reference/GPU packet; do not redo resolved fixes or claim visual acceptance |
| 5 | C / C1a | 2–3h | 11 / 63h | None; current copy-review packet only | `docs/handoffs/C/` | Remove obsolete review targets and prepare native reviewers without changing copy |
| 6 | F / F1 | 2–4h | 9 / 49h | None; QA coverage proposal, no test execution | `docs/handoffs/F/` | Define missing a11y/performance/security/recovery acceptance early; no duplicate tracker |
| — | H / H1 (not ready) | 3–5h | Not ranked while blocked | **A1** analytics inclusion/deferral decision | None reserved in wave | No accepted mandatory V1 analytics scope; keep lane idle |

**Wave effort: 13–23 human hours**, excluding owner waiting; simultaneous
completion is not guaranteed by six workers. Coordinator integrates packets
serially and accepts/rejects evidence. These tasks prepare actual deliverables,
not general status summaries. No worker automatically advances to its next task.

### Priority method and critical path

Counts include unfinished transitive consumers, including G, but not the root
itself. Chain figures sum upper estimates on the longest directed path; they
ignore parallel joins/resource waiting and are **not** a release date or summed
total. They are reproducible from `check-plan.py` at this planning revision.

The checker prints transitive downstream counts and longest upper-bound chain
from the actual graph; use those rather than intuitive whole-lane dependencies.
Raw fan-out is not the only priority: A1 resolves policy/scope; E1 and D1 together
open staging/platform decisions and real data lifecycle, the longest release
chain. F1 has smaller fan-out but supplies the missing acceptance contract before
fixes; B1a/C1a prepare human review paths without source conflicts.

Main conditional release spine:
**A1 + E1 → A5 → E1a** (also D1) **→ A6 → E2 → E3 → E4 → H4 →
C5 → F3 → F4 → A4 → G2 → G3 → G4**. H4 also needs H3 (H2/A3 + D2/E2),
F4 also needs F2/F3, and G2 needs G1. Another gating branch is
**B1a → B1 → B2 → B3 → B4/F3**; human GPU/cross-engine/native/legal
availability may dominate calendar time. No calendar release date is defensible
until these resources and A1/A3/A5/A6 are resolved. Estimates are bounded effort,
not commitments; re-estimate after audits, especially B2/D2 and H scope.

## NEXT — recompute after acceptance, not pre-authorized wave two

| Lane | Next task | Exact prerequisite / readiness condition |
|---|---|---|
| A | A2, A3 | A1 accepted; owner facts/omit decisions and legal/operator policy available. A5 also needs E1 |
| B | B1 | B1a accepted **and** real reference capture/GPU-browser human resource path; otherwise blocked |
| C | C1 | C1a accepted **and** named native FA/AR plus EN reviewers |
| D | D2 | D1, A3, E1a accepted; retention/backup/operator policies, actual target access contract |
| E | E1a | E1, A5, D1 accepted; owner provider/budget/external-action approval |
| F | F2a | F1 accepted; coordinator integrates proposed QA cases, authorized tooling available |
| H | H1 | A1 explicitly includes analytics and authorizes design research; if deferred, remove release edges by recorded decision |

Potential next nonconflicting wave: A2/A3, B1 human capture, C1 native review,
E1a contract, F2a baseline and H1 design **only if** each listed prerequisite and
resource is actually satisfied. D2 generally waits on A3/E1a. No seven-way claim.

## BLOCKED — exact dependency and owner/resource ledger

All downstream tasks' complete prerequisite lists live in their lane tables;
the following names root causes, not vague “depends on backend” labels.

- **A2/A3/A5/A6/A4:** A1 plus their listed predecessors; need real facts or
  explicit omission, privacy/controller/jurisdiction/retention/export/backup/
  operator policy, hosting/region/budget and verified origin/indexing decision.
  The eight existing `docs/DECISIONS.md` owner decisions remain open; those
  decision keys are not parallel lane task IDs.
- **B1/B2/B3/B4:** B1a then actual reference/implementation evidence and fixes;
  GPU Firefox/Chromium owner path absent here. ECHO-003/109/full-theme/arrow
  findings and `MANUAL-FIREFOX-GLASS` cannot be waived by WebKit software output.
- **C1/C2/C4/C5:** native reviewers; A2/A3/H2 approved content; A6 real origin;
  C4 coherent public page robots policy; E2/D2/H4 integrated behavior and actual
  manual SEO/404 acceptance. No duplicate ECHO-506 preview implementation.
- **D2/D3/D4/D5:** D1/A3/E1a, then production-compatible tooling + E2 staging,
  E3 actual ingress/logging/schedule; current QA PG result NOT_RUN and no native
  browser→staging DB proof. Synthetic local fixture history is insufficient.
- **E1a/E2/E3/E4:** A5/D1 target contract, A6 origin, explicit external-action
  authorization and A3 policies. No external service changes authorized now;
  hosted CI negative checks and rollback/restore evidence absent.
- **F2a/F2/F3/F4:** F1 coverage, final B2/C1/D3/C5 work, integrated E4/D4/H4;
  native/AT/real zoom/cross-engine human resources missing. Revalidate four
  stale browser cases at accepted revisions via QA01, not this document.
- **H1–H4:** A1 scope, H2/A3 privacy/metrics/access approval, E2/D2 integration,
  then E4 verification. No analytics provider/tracker/dashboard accepted.
- **G1–G4:** full table in README; staging/owner/legal gates precede controlled
  production actions. No public intake/indexing without separate G3 permission.

## Owner approval requested

Approve or revise the **six-task preparation wave above**, identify the owner
decision authority for A1, and confirm whether mandatory private analytics is
V1 scope or deferred. Supply native FA/AR reviewers, GPU Firefox/Chromium and
screen-reader/zoom review availability when possible. Policy, provider, origin,
costs and external changes remain separate decisions, not bundled permission.

Stop here. No execution starts from a READY label, commit or this plan alone.
