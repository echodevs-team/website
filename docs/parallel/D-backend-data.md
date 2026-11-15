# D — Backend / security / data operations

Accepted 2026-11-15 at `d84a17a` (D1 integrated; D2–D5 remain blocked). P2 code
is substantial, not a new backend build. Current QA has no recorded
`PG-INQUIRY-INTEGRATION` run; historical P2 reports are local fixture evidence,
not current staging or production acceptance. D1's audit records 6 BLOCKER,
12 IMPORTANT and 4 OPTIONAL gaps plus the host contract in
`docs/parallel/handoffs/D1.md`; no application, host or policy change was made.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| D1 | Current production threat/gap audit of inquiry, roles, limits and operations; define host contract | — | 0–0 | DONE | **Accepted and integrated 2026-11-15** at `d84a17a` (branch `parallel/d1`; handoff [`docs/parallel/handoffs/D1.md`](handoffs/D1.md)). Evidence: 22-gap audit (6 BLOCKER / 12 IMPORTANT / 4 OPTIONAL) and the §4 host contract. Blockers: trusted ingress + edge limits (G01/G02 → E1a/E2), operator access/tooling/retention (G07–G09 → D2), production backup/recovery (G10 → D2/E3/E4). Audit only — no application, QA, host or legal change | D2, D3, E1a, H3 |
| D2 | Implement only approved remaining lifecycle/operator safeguards and production-compatible access | D1, A3, E1a | 8–14 | BLOCKED | D1 satisfied; still blocked on A3 and E1a. D1 §3 gaps G03, G05–G09, G11–G14, G16 and G20: configurable limits, redacted logging/health, TLS DB client, managed-DB operator access, audit trail, pool drain and actionable retention/erasure/backup gaps (E3 owns the sink/retention halves of G21–G22). Existing CLI readback/erasure/encrypted snapshots are local Unix-socket-only, not managed-DB ready; retention/restore erasure manifest/scheduler/key custody unresolved. Disposable tests and updated runbook required | C5, D3, D4, H3 |
| D3 | Isolated staging inquiry browser→DB→operator proof, replay and failure cases | D1, D2, E2 | 6–10 | BLOCKED | D1 satisfied; still blocked on D2 and E2. Use D1 HC-V1–V14 as the staging matrix. Existing 40 PostgreSQL/HTTP/DOM fixture tests in P2-B2 do not satisfy native browser→staging flow or current QA NOT_RUN. Synthetic data only, cleanup policy and approved operator | D4, F2 |
| D4 | Verify abuse/ingress, logs, headers/dependencies, secrets and data readiness | D2, D3, E3 | 5–9 | BLOCKED | Exact-origin/32KiB/commit-before-success already implemented; signed-proxy headers must be generated/stripped by actual ingress. ECHO-603/606, deployment rate controls and scheduled cleanup still open | D5, A4, F3, G1, G3 |
| D5 | Recovery drill, erasure reconciliation, operator and incident handoff | D4 | 3–5 | BLOCKED | Existing `docs/INQUIRY-OPERATIONS.md` is development-only; require approved personnel, restore/rollback evidence, RPO/RTO and credential custody without printing secrets | G4 |

## Ownership / boundary

Outputs use the standardized per-task handoff `docs/parallel/handoffs/<TASK-ID>.md`
(D1 is accepted at that path; the older `docs/handoffs/D/` directory is retired).
D1 supplied the signed-ingress and DB access contract for E. Later D owns
`src/lib/inquiries/**`,
`src/lib/db/**`, validation, API, `db/**`, inquiry/operations scripts and tests.
No retention period is guessed, no credentials opened/imported, no persistent
rows inspected, no real intake enabled. H must not edit submission hooks:
D owns any approved commit-confirmed conversion hook and failure isolation;
H consumes the agreed no-PII contract. Next runnable D task: none — **D2** waits
on A3 and E1a, and D3–D5 follow D2/E2/E3.
