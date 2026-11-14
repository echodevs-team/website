# A — Owner / product decisions

Reviewed 2026-11-14 against `6eedf3b`. Owner is the acceptance authority;
coordinator prepares evidence, never impersonates owner/legal. Remaining estimates
are human effort, excluding decision waiting. No approval is inferred from this plan.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| A1 | Confirm V1 DoD, approvers and whether private reuse-first analytics is mandatory or deferred | — | 2–4 | TODO | SCOPE §§1.4,8.3 and ROADMAP ECHO-804 do not establish mandatory analytics; scaffold claim is not approval. Owner decision and any authorized scope amendment required | A2, A3, A5, A6, H1, B4 |
| A2 | Approve brand spelling, collective identity, contacts and concept-only publication or supplied proof | A1 | 2–4 | BLOCKED | `docs/P5-ECHO-502-OWNER-REVIEW.md`, `src/content/{about,work,contact}.ts`; D1/D2/D3/D7 unresolved; explicit omit decisions acceptable | A4, C2 |
| A3 | Decide controller/contact, legal basis/jurisdiction, retention/holds, erasure, exports/backups, operators, analytics posture | A1 | 4–8 | BLOCKED | `docs/INQUIRY-PRIVACY.md`, D5/D6; no retention period, operator or legal approval. Owner/legal record required | A4, D2, E3, H2 |
| A4 | Accept release candidate and exceptions at exact revision | A2, A3, B4, C5, D4, E4, F4, H4 | 2–4 | BLOCKED | `MANUAL-RELEASE-SIGNOFF` NOT_RUN; reviewer and evidence must be real | G2 |
| A5 | Approve hosting/provider/region/budget, operator and external staging actions | A1, E1 | 1–2 | BLOCKED | D4/D5 unresolved; separate approval for costs, services, DNS or remote changes | E1a |
| A6 | Approve public HTTPS origin, redirect policy and conditional indexing authorization | A1, E1a | 1–2 | BLOCKED | `MANUAL-PRODUCTION-ORIGIN` NOT_RUN; authorization may be conditional on G2, never enable indexing here | C4, E2 |

## Ownership / handoff

Reserved worker output: `docs/handoffs/A/` (decision proposals only). Coordinator
alone applies accepted values to `docs/DECISIONS.md`, SCOPE, ROADMAP, planning and
QA. Existing D1–D8 remain authoritative; A1–A6 are **parallel task IDs**, not a
replacement for the similarly named historical decision entries. Record who,
what, date, source revision and scope of each approval. Next candidate: **A1**.
