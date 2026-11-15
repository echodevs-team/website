# NOW — current execution, not authorization

Reviewed **2026-11-15**, implementation/QA baseline
**`d84a17a39d29e2afb24db8e682c40e20e2770247`** (D1 integrated). Planning-only
changes do not complete development tasks. Recompute after each accepted change
using [the coordinator refresh procedure](README.md#repeatable-coordinator-refresh).

## CURRENT

- Coordinator: **D1 accepted and integrated** into `main` by fast-forward from
  `parallel/d1` (`d84a17a`); planning state refreshed in this commit. No lane is
  active on `main` and no environment lease is held here. Branch `parallel/d1`
  and worktree `~/projects/echodevs-d1` remain at `d84a17a` untouched.
- **D1 DONE:** production threat/gap audit of the inquiry path, roles, limits and
  operations, plus the host contract in
  [`docs/parallel/handoffs/D1.md`](handoffs/D1.md). Evidence: 22 gaps
  (**6 BLOCKER**, 12 IMPORTANT, 4 OPTIONAL) and the §4 hard/optional host
  contract. Audit only — no application, host, policy, QA or legal change.
- **Six production blockers carried forward verbatim** and mapped to the tasks
  that must close them: **trusted ingress** and **edge volumetric limits** →
  E1a/E2; **operator identities**, **managed-DB operations tooling** and
  **retention/purge execution** → D2; **production backup/recovery** → D2,
  verified by E3/E4. None is accepted as resolved, and no row below may claim
  production readiness while one is open.
- **A1 DONE:** V1.0 definition of done (`SCOPE.md` §12.1) and mandatory private
  traffic analytics (`SCOPE.md` §8.4) recorded, with approval accountability in
  `docs/APPROVALS.md` and decision entries in `docs/DECISIONS.md`. Scope only:
  analytics has **no** provider, consent position, retention, access owner, code
  or tracker; the published disclosure still correctly states none.
- **C3** is the only other DONE task: ECHO-506 preview engineering acceptance,
  not production SEO or manual metadata acceptance.
- QA01 is authoritative at `d84a17a`: **14 PASS / 0 FAIL / 1 BLOCKED /
  4 STALE / 12 NOT_RUN**. D1 added one handoff Markdown file and touched no watch
  path, so no status changed. Release readiness remains **NO**;
  `MANUAL-FIREFOX-GLASS` is BLOCKED by the recorded environment, and the
  Release/legal/origin/owner cases are still NOT_RUN.
- A parallel **E1** worker may be active in its own worktree. E1 is **not**
  integrated, no E1 file exists on `main`, and its branch/worktree must not be
  touched by any other worker. A2/A3/A5/A6 outputs remain proposals the owner
  must decide; this refresh changed none of them.

## READY — dependency-eligible, assignable now

Dependency-eligible means every prerequisite is DONE. It is **not** authorization.
Ranking is transitive unlock count first, then release-critical-path value and
shorter remaining chain.

| Rank | Lane / candidate | Remaining effort | Transitive unlocks / longest chain | Owner input | Exclusive output | Why this rank |
|---|---|---:|---|---|---|---|
| 1 | H / **H1** | 3–5h | 12 / 78h | No for research; provider selection yes | `docs/parallel/handoffs/H1.md` | Only root on a mandatory V1 capability with **zero** implementation; produces the comparison the owner needs to decide H2. No install, account, tracker or visitor data |
| 2 | B / **B1a** | 2–3h | 12 / 72h | No | `docs/parallel/handoffs/B1a.md` | Fastest ready task and consolidates the existing visual defect packet; its chain then stalls at B1 awaiting human GPU/native capture unavailable here |
| 3 | C / **C1a** | 2–3h | 11 / 63h | No | `docs/parallel/handoffs/C1a.md` | Updates the copy-review packet to current source (ECHO-504 cookie write, VF01/R1, ECHO-506 SEO); native review itself waits on named reviewers |
| 4 | F / **F1** | 2–4h | 9 / 49h | No | `docs/parallel/handoffs/F1.md` | Coverage proposal for the missing a11y, performance, security, recovery and analytics cases, including D1's two QA-coverage gaps: no CI evidence for `PG-INQUIRY-INTEGRATION` and no backup/erasure/retention/signed-ingress/log-redaction cases |
| — | E / **E1** | 2–4h | 22 / 101h | No | `docs/parallel/handoffs/E1.md` | Not assigned to Agent 1: the hosting-options packet belongs to the separate E1 worker |

**Owner-gated, not READY for assignment as a decision:** **A3** (18 unlocks /
89h) is the largest fan-out in the graph and **A2** (10 / 57h) the smaller A-lane
root, but both deliverables *are* owner/legal decisions. A worker may only prepare
options, risk notes and open questions; neither may be marked DONE or supply
policy values the owner has not approved.

**Recommended Agent 1 assignment:** **H1**. It is dependency-eligible, needs no
owner facts to produce the packet, sits on a mandatory V1 release capability that
is currently unimplemented, and is the input the owner needs before H2 can be
decided. **B1a** is the faster alternative (2–3h) if the owner prefers shortest
work first; **A3** remains available only together with real owner/legal answers,
or as an explicitly proposal-only package.

**Concurrency with E1:** H1 and E1 can run in parallel. Both consume existing
repository evidence and write one separate handoff file each
(`docs/parallel/handoffs/H1.md` vs `E1.md`); H1 reads `SCOPE.md` §8.4, the package
manifest and app code read-only, while E1 inventories CI/hosting constraints.
Neither may edit `docs/DECISIONS.md`, `SCOPE.md`, `ROADMAP.md`, `qa/**`, another
task's handoff, source, or the other worker's checkout. Shared contracts
(`package*.json`, `.env.example`, Next config) stay read-only for both.

## NEXT — recompute after acceptance, not pre-authorized

| Lane | Next task | Readiness condition |
|---|---|---|
| A | A2, A3 | Owner supplies the public-content facts and privacy/operator answers; coordinator accepts proposals |
| A | A5, A6 | E1 / E1a plus explicit provider, cost, DNS, TLS and origin authorization |
| B | B1 | B1a accepted **and** a human reference/GPU capture path exists |
| C | C1 | C1a accepted **and** named native FA/AR plus editorial EN reviewers |
| D | D2 | A3 and E1a accepted (D1 satisfied); retention/backup/operator policies and a real host contract. Must close D1's operator, retention and backup blockers |
| E | E1a | E1, A5 and D1 accepted (D1 satisfied); explicit external-action approval |
| E | E2 | E1a accepted; staging lease, secrets and synthetic-data cleanup plan approved |
| F | F2a | F1 accepted; coordinator registers the proposed cases; tooling authorized |
| H | H2 | H1 accepted **and** A3 answers; no tracker may exist before disclosure and consent decisions |

## BLOCKED — exact root causes

- **A5 / A6:** E1 and E1a, then owner approval of provider/region/budget and of a
  public HTTPS origin with any indexing authorization (indexing stays off).
- **B1–B4:** B1a, then human reference/GPU capture and confirmed defect fixes;
  owner visual acceptance is last and cannot be replaced by WebKit software output.
- **C1–C5:** native reviewers, A2 facts, A6 origin, integrated staging and
  analytics verification (H4); the privacy disclosure cannot be finalized early.
- **D2–D5:** A3 decisions, E1a target and E2 staging; D2 must also close the D1
  operator, retention and backup blockers listed under CURRENT before any
  production claim.
- **E1a–E4:** A5 and the D1 §4 contract (satisfied), A6 origin and explicit
  external-action authorization for staging, TLS, secrets and hosted CI
  verification.
- **F2a–F4:** F1 coverage, final B2/C1/D3/C5 work, integrated E4/D4/H4 and human
  assistive-technology, native-language and cross-engine resources.
- **H2–H4:** H1 options plus A3 privacy answers, then E2/D2 integration and E4
  verification. No analytics QA case exists yet; the coordinator must register
  them before any verification can be recorded.
- **Release sequence:** full lane table in the README; owner/legal/staging gates
  precede any controlled production action, intake enablement or indexing.

## Owner approval requested

Approve the next Agent 1 assignment (**recommended: H1**, alternative **B1a**) and
let the E1 worker continue; supply the public-content facts and privacy/operator
answers that A2 and A3 need; decide analytics provider, consent, retention and
access when H1 returns; provide native FA/AR, GPU browser and screen-reader/zoom
reviewers when available. Costs, DNS, TLS, external services, intake enablement
and indexing remain separate authorizations.

Stop here. No execution starts from a READY label, commit or this plan alone.
