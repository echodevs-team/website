# NOW — current execution, not authorization

Reviewed **2026-11-18**, implementation/QA baseline
**`d5c78b1353120c84364dc8fe6e26f7b2b2a453f8`** (F1 and B1a integrated; the
application source is unchanged since `88d123f`). Planning-only changes do not
complete development tasks. Recompute after each accepted change using
[the coordinator refresh procedure](README.md#repeatable-coordinator-refresh).

## CURRENT

- Coordinator: **F1 and B1a accepted and integrated.** F1 arrived as a
  fast-forward `1ebf092`→`d78926b` with authorship preserved. B1a arrived as
  worker2's export `/tmp/b1a-transfer/b1a-71dcc5c.patch` (52,996 bytes, SHA-256
  `8e6f6ff9…da548b`, patch id `fa2f3c2b…`), applied with `git am --3way` as
  `d5c78b1`; the committed blob is identical to the patch's `index` line. No lane
  is active on `main` and no environment lease is held here. `parallel/a1`
  (`a015c8f`), `parallel/d1` (`d84a17a`), `parallel/h1` (`55b8422`) and
  `parallel/f1` (`d78926b`) remain preserved; the B1a branch lives only in
  worker2's checkout and was not touched.
- **F1 DONE:** QA coverage and revalidation proposal in
  [`docs/parallel/handoffs/F1.md`](handoffs/F1.md) — recomputed snapshot,
  `F1-W1`–`F1-W12`, 43 candidate cases in four tiers (11 / 5 / 15 / 12), the
  gap-to-milestone cross-tab, revalidation order and a 39–65 h bottom-up
  estimate. It registers nothing and records nothing.
- **B1a DONE:** visual evidence inventory in
  [`docs/parallel/handoffs/B1a.md`](handoffs/B1a.md) — route × locale evidence
  matrix, findings #1–#6 reconciled, source-observable differences separated from
  confirmed defects, capture conditions and the proposed capture matrix. It
  changes no style, asset or QA record.
- **Disposition, not registration.** Of the 43 candidates, 10 are approved for
  registration once F2a delivers definitions, 1 waits on an explicit dependency
  decision, 29 are mandatory but blocked on D2/E1a/E2/E3/E4 or H2/H3, and 3 are
  optional. `qa/registry.json`, `qa/results/**` and `qa/evidence/**` were **not**
  modified in this batch, and no suite was executed.
- **Two F1 text defects corrected centrally, not edited into the handoff:**
  `F1-W4` is a false positive — the parsed registry already normalizes
  `evidenceRequired` to `true`, so a manual PASS with empty evidence is refused —
  and §7's prediction that seven PASS records would go STALE is wrong. Measured
  on a copy, making the inherited watch explicit changes no definition hash, so
  the real registry fixes change **zero** recorded statuses.
- **B1a: no conclusion changed, no capture claimed.** Its source observations were
  re-verified against the tree (reference FA/RTL/light, the `scrollY > 20` header
  switch, exactly seven `↗` glyphs, no RTL mirroring rules, the navigation switch
  at `64rem` versus the stale 80rem line in `docs/UI-UX-REVIEW.md:30`, and exactly
  three tracked images). It contributes the capture packet and a bounded
  durable-evidence policy; the 442 × 1600 reference PNG is a downscale and no
  pixel-level acceptance exists.
- QA01 is authoritative at `d5c78b1`: **14 PASS / 0 FAIL / 1 BLOCKED /
  4 STALE / 12 NOT_RUN**, unchanged because no watch path moved. Release
  readiness remains **NO**; `MANUAL-FIREFOX-GLASS` is BLOCKED by the recorded
  environment and the release/legal/origin/owner cases are still NOT_RUN.
- No other worker is active in this checkout, and no E1a/E2 provisioning,
  external action or purchase is authorized by this plan.

## READY — dependency-eligible, assignable now

Dependency-eligible means every prerequisite is DONE. It is **not** authorization.
Ranking follows the refresh procedure — owner/provider roots first, then quality
baseline, then shortest ready work — with raw fan-out as a tie-break; any override
is stated in the row.

| Rank | Lane / candidate | Remaining effort | Transitive unlocks / longest chain | Owner input | Exclusive output | Why this rank |
|---|---|---:|---|---|---|---|
| 1 | F / **F2a** | 3–5h | 6 / 45h | No | `scripts/**` harnesses, `tests/unit/**`, a proposed registry block | Quality baseline and the only ready assignment that can convert the single release-critical NOT_RUN into real evidence. F1 delivered; `node_modules` and the embedded PostgreSQL devDependency exist in a clone of this repository, so the two PostgreSQL cases are executable without any external infrastructure or approval |
| 2 | C / **C1a** | 2–3h | 11 / 63h | No | `docs/parallel/handoffs/C1a.md` | The last root that needs no owner answer. It refreshes the copy-review packet to current source so native review can start the moment reviewers are named; it writes one handoff file and conflicts with nothing |
| — | B / **B1** | 3–5h | 11 / 69h | **Yes** | capture set, then `qa/evidence/**` | Dependency met by B1a, but **not assignable in this environment**: there is no Firefox/Chromium, no GPU and no approved offline reference asset set. This is an owner-side capture session through the existing loopback tunnel, not agent work |
| — | A / **A5** | 1–2h | 21 / 97h | **Yes** | owner decision record | Largest fan-out in the graph, but it *is* the owner's approval of architecture, provider, region, budget, account ownership, RPO/RTO and named operators. Not assignable as research and not DONE until the owner answers |

**Ranking override:** F2a is ranked above C1a and above the larger B1 and A5
fan-out because executable release evidence outranks further preparation, and
because neither B1 nor A5 can be executed by an agent here. No dependency edge
changed: F1 and B1a were DONE, so F2a and B1 became roots in the graph and B1a and
F1 stopped being roots.

**Recommended two-agent wave:** **Agent 1 → F2a**, **Agent 2 → C1a**.

- **Agent 1 (F2a)** — branch `parallel/f2a`, worktree `~/projects/echodevs-f2a`,
  own checkout with `npm ci` from `package-lock.json` (no global installs).
  Prerequisites: F1 DONE (satisfied); the coordinator has **not** registered
  anything yet, so F2a must deliver the exact registry definition text and must
  not edit `qa/registry.json`, `qa/results/**` or `qa/evidence/**`. Exclusive
  writable files: new `scripts/audit-*.{mjs,py}`-style harnesses for the approved
  Tier 1 cases, `tests/unit/**` additions, `scripts/qa.ts` for the `F1-W10`/
  `F1-W11` selection fixes, and `docs/parallel/handoffs/F2a.md`. It must not touch
  `src/**`, `src/styles/**`, `.github/**`, `next.config.ts`, `package*.json`
  (propose instead) or another task's handoff. Expected deliverable: working
  harnesses with unit tests, real local runs of `PG-INQUIRY-INTEGRATION`,
  `PG-INQUIRY-HTTP-E2E` and `PG-OPERATIONS-RECOVERY` from a clean commit, defect
  triage into named lanes, and the proposed registry JSON block. Verification:
  `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`,
  `npm run test:inquiries`, `npm run test:inquiries -- --http`,
  `npm run test:operations`, `node scripts/qa.ts validate`,
  `node scripts/qa.ts status`. Effort 3–5 h as recorded, realistically at the
  upper bound; no owner participation except an optional decision on an
  axe-equivalent devDependency.
- **Agent 2 (C1a)** — branch `parallel/c1a`, worktree `~/projects/echodevs-c1a`,
  no build or database needed (read-only source and evidence review). Exclusive
  writable file: `docs/parallel/handoffs/C1a.md`. It must not edit `src/content/**`,
  `src/i18n/**`, `qa/**`, lane tables or another task's handoff: it prepares the
  review packet and the reviewer checklist, it does not approve copy. Effort
  2–3 h; no owner participation until named FA/AR and editorial EN reviewers
  exist, which is an owner decision that cannot be delegated.

The two assignments share no writable file, so they can run concurrently.
`package*.json`, `.env.example`, Next config, routes/layout and tokens stay
read-only for both, and only the coordinator integrates registry or result
changes.

## NEXT — recompute after acceptance, not pre-authorized

| Lane | Next task | Readiness condition |
|---|---|---|
| A | A2, A3 | Owner supplies the public-content facts and the privacy/operator answers; coordinator accepts proposals |
| A | A5 | Owner answers the architecture/provider/region/budget/account/RPO/operator questions in E1 §8; costs, DNS, TLS and accounts stay separately authorized |
| A | A6 | E1a accepted; owner approves the public HTTPS origin, redirect policy and any indexing authorization (indexing stays off) |
| B | B1 | B1a accepted (satisfied) **and** an owner-side reference/GPU capture path exists |
| C | C1 | C1a accepted **and** named native FA/AR plus editorial EN reviewers |
| D | D2 | A3 and E1a accepted; retention/backup/operator policies and a real host contract. Must close D1's operator, retention and backup blockers |
| E | E1a | A5 accepted (E1 and D1 satisfied); write the target contract for ingress, database, CI, secrets and access |
| E | E2 | E1a and A6 accepted; staging lease, secrets and synthetic-data cleanup plan approved |
| F | F2a | F1 accepted (satisfied); coordinator registration of the approved definitions and tooling authorization |
| F | F3 | B3, C5, D4, E4 and H4 accepted; one exact candidate; staging and lab resources available |
| H | H2 | H1 accepted and the A3 answers plus the twelve analytics decisions exist; no tracker may exist before disclosure and consent decisions |

## BLOCKED — exact root causes

- **A6:** E1a, then owner approval of the public origin, redirects and any
  indexing authorization.
- **B2–B4:** B1 capture and confirmed defect fixes; owner visual acceptance is last
  and cannot be replaced by WebKit software output.
- **C1–C5:** native reviewers, A2 facts, A6 origin, integrated staging and
  analytics verification (H4); the privacy disclosure cannot be finalized early.
- **D2–D5:** A3 decisions, E1a target and E2 staging; D2 must also close the D1
  operator, retention and backup blockers listed under CURRENT.
- **E1a–E4:** A5, the D1 §4 contract (satisfied), A6 origin and explicit
  external-action authorization for provisioning, staging, TLS, secrets and
  hosted CI verification. The signed ingress component and the managed-database
  operator path are unbuilt work, not purchase decisions.
- **F2:** B2, C1, D3 and C5 fixes must land before final human acceptance; the
  assistive-technology, native-language and cross-engine capability is missing.
- **F3–F4:** integrated E4/D4/H4 work, one exact candidate, staging and lab
  resources, and every manual/owner/legal gate recorded by a real reviewer.
- **H2–H4:** A3 answers plus the analytics product/architecture/retention/consent/
  access/event-scope decisions; H3 then needs E2/D2 and H4 needs E4. The
  coordinator must register approved analytics cases before verification.
- **Release sequence:** full lane table in the README; owner/legal/staging gates
  precede any controlled production action, intake enablement, indexing or
  provisioning.

## Owner approval requested

1. Approve the next two-agent wave (**Agent 1: F2a**, **Agent 2: C1a**) and the
   coordinator's disposition of F1's candidates (10 to register, 1 pending a
   dependency decision, 29 mandatory-but-blocked, 3 optional).
2. Decide the pending lane F revision: adopting F2a 13–20 h and F3 12–21 h takes
   lane F from 23–39 h to 37–61 h (39–65 h with axe) and the plan total from
   139–243 h to 153–265 h (155–267 h with axe). Nothing has been applied.
3. Answer the open decisions that gate other lanes: **A2** public-content facts,
   **A3** privacy/operator answers, **A5** (architecture A/B/C, provider,
   country/region, monthly ceiling, account/payment owner, RPO/RTO, named
   operators) and then **A6** (origin/DNS/TLS and indexing).
4. Supply the two human resources no agent can substitute: an owner-side
   Firefox/Chromium-with-GPU capture session through the loopback tunnel for B1,
   and named native FA/AR plus editorial EN reviewers for C1 and F2.

The E1 prices remain planning estimates (≈ $27 / $42 / $69–94 per month, excluding
tax and domain), not quotes, and selecting an option does **not** authorize
purchase, provisioning, deployment, staging or external services. Analytics
remains unapproved beyond its V1 scope decision: choosing a product starts H2, not
deployment.

Stop here. No execution starts from a READY label, commit or this plan alone.
