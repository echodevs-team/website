# NOW — current execution, not authorization

Reviewed **2026-11-16**, implementation/QA baseline
**`55b842236e33fde0fc0cc855e97aae41d36ca409`** (H1 integrated; the inquiry
implementation itself is unchanged since `88d123f`). Planning-only changes do not
complete development tasks. Recompute after each accepted change using
[the coordinator refresh procedure](README.md#repeatable-coordinator-refresh).

## CURRENT

- Coordinator: **H1 accepted and integrated** into `main` by fast-forward from
  `parallel/h1` (`55b8422`); planning state refreshed in this commit. No lane is
  active on `main` and no environment lease is held here. Branches/worktrees
  `parallel/a1` (`a015c8f`), `parallel/d1` (`d84a17a`) and `parallel/h1`
  (`55b8422`) are preserved untouched.
- **H1 DONE:** analytics product and architecture options packet in
  [`docs/parallel/handoffs/H1.md`](handoffs/H1.md). It compares Umami 3.5.0
  (MIT), Plausible CE 3.2.1 (AGPL-3.0) and Matomo 5.14.2 (GPL-3.0) against
  `SCOPE.md` §8.4, describes co-hosted / separate-host / managed architectures,
  specifies a confirmed-durable-write conversion contract, scores the options
  (4.30 / 3.35 / 3.20) and lists the twelve owner questions needed for H2.
- **H1 selected nothing.** Umami (self-hosted, separate private service, own
  PostgreSQL database) is a **conditional recommendation**, not an approved
  provider; Plausible CE is the privacy-first alternative and Matomo the depth
  fallback. No account, dependency, tracker, deployment, spend, privacy-copy
  change or visitor data exists, and `/privacy` still correctly states that no
  analytics is implemented.
- **Analytics conversion trade-off, recorded explicitly:** a conversion counted
  from a **server event after commit** is replay-safe (no double count on an
  idempotent replay, no payload/PII in the request) but **best effort** — a lost,
  timed-out or bot-filtered event silently undercounts, so the metric is a lower
  bound. A **client event after success** attributes to the actual visit but can
  double count when an uncertain retry resolves as a replay, and it is the only
  workable design for Plausible, whose own documentation says webhook/retry
  server events are unsuitable and may be dropped. The H lane keeps the server
  event as the count of record, never adds a client conversion fallback, and
  reconciles against an operator database count instead. Counts stay accurate
  only in the **under**counting direction; nothing may inflate them.
- **H2/H3/H4 remain blocked, not deferred.** H1 was the only missing input for
  H2; its remaining prerequisite is **A3 owner/legal answers** (controller,
  lawful basis, retention, erasure, operators, analytics posture) plus the product,
  architecture, budget, access and event-scope choices listed in H1 §10. H3 still
  needs H2, E2 and D2; H4 still needs H3 and E4. No analytics QA case exists yet:
  H1 proposes `ANALYTICS-001`–`ANALYTICS-012` and the coordinator must register
  approved ones in QA01 before H3/H4 verification can be recorded.
- **A1 DONE** (V1 definition of done; private reuse-first analytics mandatory),
  **D1 DONE** (threat/gap audit plus host contract) and **C3** (ECHO-506 preview
  engineering) are the other accepted tasks. The six D1 production
  blockers are carried forward verbatim: trusted ingress and edge volumetric
  limits → E1a/E2; operator identities, managed-DB operations tooling and
  retention/purge → D2; production backup/recovery → D2, verified by E3/E4.
- **H1 evidence limits stay open** for H2/H3 rather than being treated as solved:
  Umami's recommended Node 22 LTS versus this app's Node 24 pin, how Umami's bot
  filtering treats a fixed internal User-Agent, self-hosted retention automation,
  Plausible CE language/2FA/export specifics and the Matomo 6 beta timeline. H1's
  vendor facts were spot-checked during review (Umami install and collection API
  pages, Plausible CE requirements and events API); the remaining `[U]` items are
  recorded in H1 §13 and in the README verification log.
- QA01 is authoritative at `55b8422`: **14 PASS / 0 FAIL / 1 BLOCKED /
  4 STALE / 12 NOT_RUN**. The H1 documentation change touched no watch path, so
  no status changed. Release readiness remains **NO**; `MANUAL-FIREFOX-GLASS` is
  BLOCKED by the recorded environment, and the release/legal/origin/owner cases
  are still NOT_RUN.
- A parallel **E1** worker may be active in its own worktree. At this review no
  E1 branch or worktree exists on this machine, `main` contains no E1 file, and
  nothing about E1 is integrated or accepted. Its branch/worktree must not be
  touched by any other worker. A2/A3/A5/A6 outputs remain proposals the owner must
  decide; this refresh changed none of them.

## READY — dependency-eligible, assignable now

Dependency-eligible means every prerequisite is DONE. It is **not** authorization.
Ranking follows the refresh procedure — owner/provider roots first, then quality
baseline, then shortest ready work — with raw fan-out as a tie-break; any override
is stated in the row.

| Rank | Lane / candidate | Remaining effort | Transitive unlocks / longest chain | Owner input | Exclusive output | Why this rank |
|---|---|---:|---|---|---|---|
| 1 | F / **F1** | 2–4h | 9 / 49h | No | `docs/parallel/handoffs/F1.md` | Overrides raw fan-out: its proposal is immediately actionable — the coordinator can register the missing cases and F2a can run a baseline pass locally once its tools are authorized — while B1a's and C1a's next tasks need human GPU/native resources that do not exist. It is also the only place that turns D1's CI/backup/retention coverage gaps and H1's twelve analytics cases into registered QA coverage before H3/H4 verification |
| 2 | B / **B1a** | 2–3h | 12 / 72h | No | `docs/parallel/handoffs/B1a.md` | Highest raw fan-out and fastest task, consolidating the existing visual defect packet; its chain then stops at B1, which needs human reference/GPU capture unavailable in this VM |
| 3 | C / **C1a** | 2–3h | 11 / 63h | No | `docs/parallel/handoffs/C1a.md` | Updates the copy-review packet to current source (ECHO-504 cookie write, VF01/R1, ECHO-506 SEO); native review afterwards waits on named FA/AR plus editorial EN reviewers |
| — | E / **E1** | 2–4h | 22 / 101h | No | `docs/parallel/handoffs/E1.md` | Not assigned to Agent 1: the hosting-options packet belongs to the separate E1 worker |

**Owner-gated, not READY for assignment as a decision:** **A3** (18 unlocks /
89h) is the largest fan-out in the graph and **A2** (10 / 57h) the smaller A-lane
root, but both deliverables *are* owner/legal decisions; they now also gate H2.
A worker may only prepare options, risk notes and open questions; neither may be
marked DONE or supply policy values the owner has not approved.

**Recommended Agent 1 assignment:** **F1**. It is dependency-eligible, needs no
owner facts, writes one uncontested handoff file, and its output can be acted on
immediately: register the missing cases (analytics, staging DB end-to-end,
backup/erasure/retention, signed ingress, log redaction) in QA01, after which F2a
can run the baseline accessibility pass locally. **B1a** remains the shorter
alternative if the owner expects to supply GPU/native captures soon; **C1a** is
third and also waits on named native reviewers. **A3** stays available only with
real owner/legal answers, or as an explicitly proposal-only package.

**Concurrency with E1:** F1 and E1 do not collide. F1 reads `qa/registry.json`,
`qa/results/**`, `docs/QA-SYSTEM.md` and test scripts read-only and writes only
`docs/parallel/handoffs/F1.md`; E1 inventories CI/hosting and writes only
`docs/parallel/handoffs/E1.md`. Neither may edit `docs/DECISIONS.md`, `SCOPE.md`,
`ROADMAP.md`, `qa/**`, another task's handoff, source, or the other worker's
checkout. Shared contracts (`package*.json`, `.env.example`, Next config) stay
read-only for both.

## NEXT — recompute after acceptance, not pre-authorized

| Lane | Next task | Readiness condition |
|---|---|---|
| A | A2, A3 | Owner supplies the public-content facts and privacy/operator answers, including the analytics posture H2 needs; coordinator accepts proposals |
| A | A5, A6 | E1 / E1a plus explicit provider, cost, DNS, TLS and origin authorization |
| B | B1 | B1a accepted **and** a human reference/GPU capture path exists |
| C | C1 | C1a accepted **and** named native FA/AR plus editorial EN reviewers |
| D | D2 | A3 and E1a accepted (D1 satisfied); retention/backup/operator policies and a real host contract. Must close D1's operator, retention and backup blockers |
| E | E1a | E1, A5 and D1 accepted (D1 satisfied); explicit external-action approval |
| E | E2 | E1a accepted; staging lease, secrets and synthetic-data cleanup plan approved |
| F | F2a | F1 accepted; coordinator registers the proposed cases; tooling authorized |
| H | H2 | H1 accepted **and** A3 answers on product, architecture, budget, retention, consent, access and event scope; no tracker may exist before disclosure and consent decisions |

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
- **H2–H4:** H1 is satisfied, so the only blocker left for H2 is the A3
  owner/legal answer set including the analytics decisions in H1 §10; H3 then
  needs E2/D2 and H4 needs E4. No analytics QA case is registered yet, and the
  coordinator must register approved ones before verification can be recorded.
- **Release sequence:** full lane table in the README; owner/legal/staging gates
  precede any controlled production action, intake enablement or indexing.

## Owner approval requested

Approve the next Agent 1 assignment (**recommended: F1**, alternatives **B1a**,
**C1a**), let the E1 worker continue, supply the public-content facts A2 needs and
the privacy/operator answers A3 needs, and — when the analytics lane is taken up
— answer the twelve questions in H1 §10 (product, architecture, budget, retention,
consent/lawful basis, dashboard access, event scope, UTM, geo, FA/EN/AR disclosure
text, backup owner). Note that H1 recommends Umami and approves nothing: choosing
a product starts H2, not deployment. Costs, DNS, TLS, external services, intake
enablement and indexing remain separate authorizations.

Stop here. No execution starts from a READY label, commit or this plan alone.
