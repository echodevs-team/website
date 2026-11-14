# D — Backend / security / data operations

Reviewed 2026-11-14 at `6eedf3b`. P2 code is substantial, not a new backend build.
Current QA has no recorded `PG-INQUIRY-INTEGRATION` run; historical P2 reports
are local fixture evidence, not current staging or production acceptance.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| D1 | Current production threat/gap audit of inquiry, roles, limits and operations; define host contract | — | 3–5 | TODO | `88d123f`, `src/lib/inquiries/{handler,store,limits,network}.ts`, DB migrations, `scripts/inquiry-ops.mjs`, P2-A/B1/B2 reports. No current integrated threat/gap acceptance packet | D2, D3, E1a, H3 |
| D2 | Implement only approved remaining lifecycle/operator safeguards and production-compatible access | D1, A3, E1a | 8–14 | BLOCKED | Existing CLI readback/erasure/encrypted snapshots are local Unix-socket-only, not managed-DB ready; retention/restore erasure manifest/scheduler/key custody unresolved. Disposable tests and updated runbook required | C5, D3, D4, H3 |
| D3 | Isolated staging inquiry browser→DB→operator proof, replay and failure cases | D1, D2, E2 | 6–10 | BLOCKED | Existing 40 PostgreSQL/HTTP/DOM fixture tests in P2-B2 do not satisfy native browser→staging flow or current QA NOT_RUN. Synthetic data only, cleanup policy and approved operator | D4, F2 |
| D4 | Verify abuse/ingress, logs, headers/dependencies, secrets and data readiness | D2, D3, E3 | 5–9 | BLOCKED | Exact-origin/32KiB/commit-before-success already implemented; signed-proxy headers must be generated/stripped by actual ingress. ECHO-603/606, deployment rate controls and scheduled cleanup still open | D5, A4, F3, G1, G3 |
| D5 | Recovery drill, erasure reconciliation, operator and incident handoff | D4 | 3–5 | BLOCKED | Existing `docs/INQUIRY-OPERATIONS.md` is development-only; require approved personnel, restore/rollback evidence, RPO/RTO and credential custody without printing secrets | G4 |

## Ownership / boundary

First wave writes only `docs/handoffs/D/`, including a signed-ingress and DB
access contract proposal for E. Later D owns `src/lib/inquiries/**`,
`src/lib/db/**`, validation, API, `db/**`, inquiry/operations scripts and tests.
No retention period is guessed, no credentials opened/imported, no persistent
rows inspected, no real intake enabled. H must not edit submission hooks:
D owns any approved commit-confirmed conversion hook and failure isolation;
H consumes the agreed no-PII contract. Next: **D1**.
