# E — Infrastructure / CI / deployment

Reviewed 2026-11-15 at `d84a17a` (D1 integrated; E1a's D1 prerequisite is
satisfied). No deployed staging/hosting acceptance is evidenced. Existing local
CI is not hosted failure propagation. Separate the safe repository inventory from
purchasing/provisioning or remote operations. D1's host contract is
[`docs/parallel/handoffs/D1.md`](handoffs/D1.md) §4 and must be consumed by E1a.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| E1 | Inventory repository deployment/CI constraints; produce smallest hosting options and approval questions | — | 0–0 | DONE | **Accepted and integrated 2026-11-16** at `140769a`, replayed from worker2 commit `63a4bca` (`parallel/e1`) with `git am --3way`; author preserved and the added blob `edcbf23` is byte-identical to the exported patch. Handoff `docs/parallel/handoffs/E1.md` (472 lines): verified repo/CI inventory, three architectures (A VPS + self-managed PostgreSQL ≈$27/mo, B VPS + managed PostgreSQL ≈$42/mo conditionally recommended, C managed container + managed PostgreSQL ≈$69–94/mo not recommended on HC-N3/HC-N5), 15 CI/CD gaps, D1 §4 mapping, 12 owner questions and cited provider pages. **No provider, budget, region, account or provisioning approved**; coordinator review corrected two minor evidence defects (§1 "19 HARD" → 26, and the "empty watch" wording) | A5, E1a |
| E1a | Select owner-approved target and specify ingress/DB/CI/access contract | E1, A5, D1 | 2–3 | BLOCKED | D1 satisfied: use the §4 hard/optional contract (Node runtime, PostgreSQL ≥17 + TLS, signed ingress and edge limits, secret inventory, off-host backups, operator access, logging). E1 satisfied: consumes its §3 constraints, §4 option shapes, §6 CI gap list and §7 ingress requirement. **Still blocked on A5/D4**: owner approval of architecture, provider, country/region, monthly ceiling, account/payment owner and operator identities. Portable Node runtime plus private PostgreSQL required; local-only ops limitation must be resolved before provisioning | A6, E2, D2 |
| E2 | Approved private staging, isolated synthetic DB, secrets/TLS and origin configuration | E1a, A6 | 10–16 | BLOCKED | ECHO-702 not implemented/accepted. Requires explicit external-action permission, no non-loopback service in this VM, no production secrets imported. Staging remains noindex/intake private | D3, E3, H3, C5 |
| E3 | Host health/log redaction/alerts, cleanup scheduler and backup monitoring | E2, A3 | 6–10 | BLOCKED | No staging operational evidence; D1 HC-L1–L5 and HC-B1–B7 define the required controls. E implements host scheduling/config, D owns data cleanup semantics; provider log retention must be approved | E4, D4 |
| E4 | Hosted CI negative checks, migration/deploy/rollback and environment acceptance | E3 | 6–10 | BLOCKED | ECHO-103 workflow exists (pinned actions, locked install, lint/type/unit/build), but hosted failure checks absent. ECHO-607/702 staging restore/rollback still unproved | A4, F3, H4, G1, G3, G4 |

## Ownership / approvals

Output is `docs/parallel/handoffs/E1.md` (standardized per-task handoff; the older
`docs/handoffs/E/` directory is retired). Later E owns workflow and separately
approved deployment/config files, host runbooks and environment operations. D
owns migration/backup code; shared `.env.example`, package manifests and Next
config need explicit coordinator leases. Tests use separate ports/DBs; staging
migrations/deployments/restores require an exclusive environment lock. No DNS,
cloud, budget, public listener, CI publication or remote modification is authorized
by this plan. Next: **E1** (inventory only).
