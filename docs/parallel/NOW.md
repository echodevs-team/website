# NOW — current execution, not authorization

Reviewed **2026-11-16**, implementation/QA baseline
**`140769aaba6b1f67ae4d2852c32a6d3cb6f0b9bd`** (E1 integrated; the application
source is unchanged since `88d123f`). Planning-only changes do not complete
development tasks. Recompute after each accepted change using
[the coordinator refresh procedure](README.md#repeatable-coordinator-refresh).

## CURRENT

- Coordinator: **E1 accepted and integrated** by replaying worker2's exported
  commit with `git am --3way` (source `63a4bca` → integrated `140769a`, author
  preserved, added blob identical to the patch). Planning state refreshed in this
  commit. No lane is active on `main` and no environment lease is held here; the
  worker2 checkout and its branch are separate and untouched.
  `parallel/a1` (`a015c8f`), `parallel/d1` (`d84a17a`) and `parallel/h1`
  (`55b8422`) remain preserved.
- **E1 DONE:** hosting and CI/CD assessment in
  [`docs/parallel/handoffs/E1.md`](handoffs/E1.md). It inventories the deployment
  constraints, compares three architecture shapes against the D1 §4 contract —
  A: 4 GB VPS with self-managed PostgreSQL ≈ $27/month; B: the same VPS with a
  managed PostgreSQL ≈ $42/month, **conditionally recommended**; C: managed
  container plus managed PostgreSQL ≈ $69–94/month, **not recommended** because
  the platform edge cannot sign the inquiry envelope or enforce per-IP limits —
  and lists 15 CI/CD gaps, a proposed pipeline, nine risks and 12 owner questions
  with cited provider pages.
- **E1 approved nothing.** No provider, region, budget, account, DNS, TLS,
  staging, deployment or CI change was made or authorized; the architecture
  choice is a recommendation priced from public pages, with FX, memory sizing,
  add-on pricing and jurisdiction/reachability explicitly unverified.
- **A5 is now a TODO owner decision, not blocked work.** Its only prerequisites
  (A1, E1) are DONE. It needs explicit owner approval of architecture (A/B/C),
  provider, country/region, monthly ceiling, account/payment ownership, RPO/RTO
  and named operators; answering it authorizes **no** provisioning. A6
  (origin/DNS/TLS) still waits on E1a, and E1a/E2/E3/E4 stay BLOCKED.
- **A1, D1, H1 and E1 are the accepted lane tasks**, with **C3** (ECHO-506
  preview engineering). The six D1 production blockers are preserved verbatim:
  trusted ingress and edge volumetric limits → E1a/E2; operator identities,
  managed-DB operations tooling and retention/purge → D2; production
  backup/recovery → D2, verified by E3/E4. E1 strengthens them rather than
  resolving them: the HMAC ingress signer is project code no provider supplies,
  and a managed database keeps the Unix-socket operator CLI unusable until D2
  adds its TLS path.
- **H2/H3/H4 are unchanged.** H2 needs the A3 owner/legal answers plus the twelve
  analytics decisions in H1 §10; H3 then needs E2 and D2; H4 needs E4. No
  analytics QA case is registered, which F1 must propose.
- **E1 review corrections recorded for F1:** E1 §1 says "19 HARD host
  requirements (HC-R/D/N)" where D1 §4 actually has 26, and its "empty watch
  lists" wording is imprecise — those five cases omit `watch` and inherit the
  broad default list, so the real defect is that the default set omits
  workflow/CI paths. Neither correction changes E1's conclusions, and neither was
  edited into the worker's handoff.
- QA01 is authoritative at `140769a`: **14 PASS / 0 FAIL / 1 BLOCKED /
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
| 1 | F / **F1** | 2–4h | 9 / 49h | No | `docs/parallel/handoffs/F1.md` | Quality baseline: it alone converts D1's CI/backup/retention coverage gaps, E1's fifteen CI gaps (E1-CI1–CI15) and H1's twelve analytics cases into a registry proposal. Its output is immediately actionable — the coordinator can register cases and F2a can then run a baseline pass locally once its tools are authorized — while the next B and C tasks need human GPU/native resources that do not exist |
| 2 | B / **B1a** | 2–3h | 12 / 72h | No | `docs/parallel/handoffs/B1a.md` | Highest raw fan-out and fastest ready task; consolidates existing reference mappings, captures and unresolved visual defects into one packet that the owner-side GPU/native capture step and B4 acceptance need. Its chain then stops at B1 until such capture exists |
| 3 | C / **C1a** | 2–3h | 11 / 63h | No | `docs/parallel/handoffs/C1a.md` | Updates the copy-review packet to current source (ECHO-504 cookie write, VF01/R1, ECHO-506 SEO); native review afterwards waits on named FA/AR plus editorial EN reviewers, and its next consumer also needs A2 facts |
| — | A / **A5** | 1–2h | 21 / 97h | **Yes** | owner decision record | Now dependency-eligible but it *is* the owner's approval of architecture, provider, region, budget, account ownership, RPO/RTO and operators. Not assignable as research and not DONE until the owner answers |

**Owner-gated, not READY for assignment as a decision:** **A5** (21 unlocks /
97h) is now the largest fan-out in the graph, **A3** (18 / 89h) is the second, and
**A2** (10 / 57h) the smaller A-lane root. All three deliverables *are* owner or
owner/legal decisions. A worker may prepare options, risk notes and open
questions, but none may be marked DONE or supply values the owner has not
approved.

**Recommended two-agent wave:** **Agent 1 → F1** and **Agent 2 → B1a**. Both have
every prerequisite DONE, need no owner answers, and write one exclusive handoff
file each (`docs/parallel/handoffs/F1.md` vs `B1a.md`). F1 reads `qa/**`,
`docs/QA-SYSTEM.md`, the D1/E1 gap lists and test scripts read-only; B1a reads
`docs/ECHO-503-VISUAL-FOLLOWUPS.md`, VF01/R1, ECHO-506 reports and existing
`test-results/` evidence read-only. Neither writes source, styles, tokens,
`qa/**`, stores or another task's handoff, so they can run concurrently without a
lease conflict; `package*.json`, `.env.example` and Next config stay read-only for
both. That ordering is executable without B/C human resources, and it keeps the
QA-coverage work ahead of the tasks whose verification depends on it.

## NEXT — recompute after acceptance, not pre-authorized

| Lane | Next task | Readiness condition |
|---|---|---|
| A | A2, A3 | Owner supplies the public-content facts and the privacy/operator answers; coordinator accepts proposals |
| A | A5 | Owner answers the architecture/provider/region/budget/account/RPO/operator questions in E1 §8; costs, DNS, TLS and accounts stay separately authorized |
| A | A6 | E1a accepted; owner approves the public HTTPS origin, redirect policy and any indexing authorization (indexing stays off) |
| B | B1 | B1a accepted **and** a human reference/GPU capture path exists |
| C | C1 | C1a accepted **and** named native FA/AR plus editorial EN reviewers |
| D | D2 | A3 and E1a accepted; retention/backup/operator policies and a real host contract. Must close D1's operator, retention and backup blockers |
| E | E1a | A5 accepted (E1 and D1 satisfied); write the target contract for ingress, database, CI, secrets and access |
| E | E2 | E1a and A6 accepted; staging lease, secrets and synthetic-data cleanup plan approved |
| F | F2a | F1 accepted; coordinator registers the proposed cases; tooling authorized |
| H | H2 | H1 accepted and the A3 answers plus the twelve analytics decisions exist; no tracker may exist before disclosure and consent decisions |

## BLOCKED — exact root causes

- **A6:** E1a, then owner approval of the public origin, redirects and any
  indexing authorization.
- **B1–B4:** B1a, then human reference/GPU capture and confirmed defect fixes;
  owner visual acceptance is last and cannot be replaced by WebKit software output.
- **C1–C5:** native reviewers, A2 facts, A6 origin, integrated staging and
  analytics verification (H4); the privacy disclosure cannot be finalized early.
- **D2–D5:** A3 decisions, E1a target and E2 staging; D2 must also close the D1
  operator, retention and backup blockers listed under CURRENT.
- **E1a–E4:** A5, the D1 §4 contract (satisfied), A6 origin and explicit
  external-action authorization for provisioning, staging, TLS, secrets and
  hosted CI verification. The signed ingress component and the managed-database
  operator path are unbuilt work, not purchase decisions.
- **F2a–F4:** F1 coverage, final B2/C1/D3/C5 work, integrated E4/D4/H4 and human
  assistive-technology, native-language and cross-engine resources.
- **H2–H4:** A3 answers plus the analytics product/architecture/retention/consent/
  access/event-scope decisions; H3 then needs E2/D2 and H4 needs E4. The
  coordinator must register approved analytics cases before verification.
- **Release sequence:** full lane table in the README; owner/legal/staging gates
  precede any controlled production action, intake enablement, indexing or
  provisioning.

## Owner approval requested

Approve the next two-agent wave (**Agent 1: F1**, **Agent 2: B1a**; alternative
**C1a**), supply the A2 public-content facts and the A3 privacy/operator answers,
and — when the hosting lane is taken up — answer A5 (architecture A/B/C, provider,
country/region, monthly ceiling, account/payment owner, RPO/RTO, named operators)
and then A6 (origin/DNS/TLS and indexing). The E1 prices are planning estimates
(≈ $27 / $42 / $69–94 per month, excluding tax and domain), not quotes, and
selecting an option does **not** authorize purchase, provisioning, deployment,
staging or external services. Analytics remains unapproved beyond its V1 scope
decision: choosing a product starts H2, not deployment.

Stop here. No execution starts from a READY label, commit or this plan alone.
