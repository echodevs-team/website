# NOW — current execution, not authorization

Reviewed **2026-11-15**, implementation/QA baseline
**`a015c8f62e7fd91e117c31d2c39eac8b38bb9456`** (A1 integrated). Planning-only
changes do not complete development tasks. Recompute after each accepted change
using [the coordinator refresh procedure](README.md#repeatable-coordinator-refresh).

## CURRENT

- Coordinator: **A1 accepted and integrated** into `main` by fast-forward from
  `parallel/a1` (`9be2de7`, `a015c8f`); planning state refreshed in this commit.
  No other lane is active on `main` and no environment lease is held here.
- **A1 DONE:** V1.0 definition of done (`SCOPE.md` §12.1) and mandatory private
  traffic analytics (`SCOPE.md` §8.4) recorded, with approval accountability in
  `docs/APPROVALS.md` and decision entries in `docs/DECISIONS.md`. Scope only:
  analytics has **no** provider, consent position, retention, access owner, code
  or tracker; the published disclosure still correctly states none.
- **C3** remains the only other DONE task: ECHO-506 preview engineering
  acceptance, not production SEO or manual metadata acceptance.
- QA01 is authoritative at `a015c8f`: **14 PASS / 0 FAIL / 1 BLOCKED /
  4 STALE / 12 NOT_RUN**. A1 touched no watch path, so no status changed. Release
  readiness remains **NO**; `MANUAL-FIREFOX-GLASS` is BLOCKED by the recorded
  environment, and the Release/legal/origin/owner cases are still NOT_RUN.
- A parallel **E1** worker may be active in its own worktree. E1 is **not**
  integrated, no E1 file exists on `main`, and its branch/worktree must not be
  touched by any other worker.

## READY — dependency-eligible, ranked by downstream unlock

Dependency-eligible means every prerequisite is DONE. It is **not** authorization,
and several rows still need owner input before they can complete.

| Rank | Lane / candidate | Remaining effort | Transitive unlocks / longest chain | Owner input | Exclusive output | Why this rank |
|---|---|---:|---|---|---|---|
| 1 | D / **D1** | 3–5h | 21 / 100h | No — audit only | `docs/parallel/handoffs/D1.md` | Largest fan-out that is completable now; opens the inquiry/security host contract for E1a and feeds D2/D3/H3 without owner facts |
| 2 | A / **A3** | 4–8h | 18 / 89h | **Yes — owner/legal answers required** | `docs/parallel/handoffs/A3.md` | Largest A-lane fan-out; supplies the policy input D2/E3/H2 need. A worker may prepare options, risk notes and open questions only |
| 3 | B / **B1a** | 2–3h | 12 / 72h | No | `docs/parallel/handoffs/B1a.md` | Consolidates the existing visual defect packet; human capture is needed later, not here |
| 4 | H / **H1** | 3–5h | 12 / 78h | Selection yes, research no | `docs/parallel/handoffs/H1.md` | Options-only analytics comparison against `SCOPE.md` §8.4; no install, account, tracker or visitor data |
| 5 | C / **C1a** | 2–3h | 11 / 63h | No | `docs/parallel/handoffs/C1a.md` | Updates the copy-review packet to current source; native review itself waits |
| 6 | A / **A2** | 2–4h | 10 / 57h | **Yes — owner facts required** | `docs/parallel/handoffs/A2.md` | Smaller A-lane fan-out; unlocks C2 once contacts, publishable work and identity facts exist |
| 7 | F / **F1** | 2–4h | 9 / 49h | No | `docs/parallel/handoffs/F1.md` | Coverage proposal for the missing a11y/performance/security/recovery/analytics cases |
| — | E / **E1** | 2–4h | 22 / 101h | No | `docs/parallel/handoffs/E1.md` | Not assigned to Agent 1: hosting options packet belongs to the separate E1 worker |

**Recommended Agent 1 assignment:** **D1** — highest-ranked task that can complete
without owner decisions, and it produces the host/security contract E1a and the
D lane need. **A3** stays the highest-value A-lane task but cannot close without
real owner/legal answers, so it should be assigned only together with those
answers (or explicitly as a proposal-only package).

**Concurrency with E1:** D1 can run alongside E1. Both are read-only audits with
separate handoff files and no shared source edits. Boundary: E1 inventories
provider/CI/hosting options and approval questions; D1 audits the inquiry,
role, limit and operations surface and states the **requirements** a host must
satisfy. Neither may edit `docs/DECISIONS.md`, `SCOPE.md`, `ROADMAP.md`, QA
files, another task's handoff, or the other worker's checkout. A2/A3/A5/A6
outputs are proposals; the coordinator applies accepted values.

## NEXT — recompute after acceptance, not pre-authorized

| Lane | Next task | Readiness condition |
|---|---|---|
| A | A2, A3 | Owner supplies the public-content facts and privacy/operator answers; coordinator accepts proposals |
| A | A5, A6 | E1 / E1a plus explicit provider, cost, DNS, TLS and origin authorization |
| B | B1 | B1a accepted **and** a human reference/GPU capture path exists |
| C | C1 | C1a accepted **and** named native FA/AR plus editorial EN reviewers |
| D | D2 | D1, A3 and E1a accepted; retention/backup/operator policies and a real host contract |
| E | E1a | E1, A5 and D1 accepted; explicit external-action approval |
| F | F2a | F1 accepted; coordinator registers the proposed cases; tooling authorized |
| H | H2 | H1 accepted **and** A3 answers; no tracker may exist before disclosure and consent decisions |

## BLOCKED — exact root causes

- **A5 / A6:** E1 and E1a, then owner approval of provider/region/budget and of a
  public HTTPS origin with any indexing authorization (indexing stays off).
- **B1–B4:** B1a, then human reference/GPU capture and confirmed defect fixes;
  owner visual acceptance is last and cannot be replaced by WebKit software output.
- **C1–C5:** native reviewers, A2 facts, A6 origin, integrated staging and
  analytics verification (H4); the privacy disclosure cannot be finalized early.
- **D2–D5:** A3 decisions, E1a target and E2 staging, then real ingress/logging,
  scheduling, recovery and operator handoff evidence.
- **E1a–E4:** A5/D1 contract, A6 origin and explicit external-action authorization
  for staging, TLS, secrets and hosted CI verification.
- **F2a–F4:** F1 coverage, final B2/C1/D3/C5 work, integrated E4/D4/H4 and human
  assistive-technology, native-language and cross-engine resources.
- **H2–H4:** H1 options plus A3 privacy answers, then E2/D2 integration and E4
  verification. No analytics QA case exists yet; the coordinator must register
  them before any verification can be recorded.
- **G1–G4:** full lane table in the README; owner/legal/staging gates precede any
  controlled production action, intake enablement or indexing.

## Owner approval requested

Approve the next Agent 1 assignment (**recommended: D1**) and let the E1 worker
continue; supply the public-content facts and privacy/operator answers that A2 and
A3 need; decide analytics provider, consent, retention and access when H1 returns;
provide native FA/AR, GPU browser and screen-reader/zoom reviewers when available.
Costs, DNS, TLS, external services, intake enablement and indexing remain separate
authorizations.

Stop here. No execution starts from a READY label, commit or this plan alone.
