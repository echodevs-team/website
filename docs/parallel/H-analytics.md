# H — Private analytics / conversion insights

Reviewed 2026-11-14 at `6eedf3b`. No tracker/dashboard exists in source or package
dependencies; `src/content/privacy.ts` discloses no analytics. Scaffold calls
analytics mandatory, while SCOPE excludes a proprietary dashboard, requires
provider/privacy approval for tracking and ROADMAP ECHO-804 is post-launch.
An existing self-hosted solution could fit scope, but mandatory V1 gating is
unresolved. A1 must settle this explicitly; no analytics implementation authorized.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| H1 | Reuse-first options, metrics and minimal event contract for owner selection | A1 | 3–5 | BLOCKED | No accepted provider/metrics/architecture. If owner confirms inclusion, compare private open-source options, minimized referrers/URLs and aggregate metrics; no deployments or tracking during research | H2 |
| H2 | Approve analytics retention, disclosure, access, consent and conversion semantics | H1, A3 | 3–6 | BLOCKED | Owner/legal sign-off absent. Specify no form fields, contacts, inquiry UUID, idempotency key, IP or sensitive query/referrer in events; minimization is not automatically anonymity | H3 |
| H3 | Approved private dashboard and safe pageview/confirmed-inquiry integration | H2, E2, D1, D2 | 7–13 | BLOCKED | No code/config implemented; D owns submission hook, H owns tracker adapter/config only. Synthetic tests; failure must not affect durable intake or replay duplicate counts | H4 |
| H4 | Verify privacy, count accuracy, failure isolation, access, backup and handoff | H3, E4 | 4–7 | BLOCKED | No analytics QA evidence. Add approved cases to QA01 via coordinator; actual test events/dashboard evidence and owner handoff required. No dependency on marketing contact facts: access/operator policy comes from A3 | A4, C5, F3, G1, G3 |

## Ownership / scope handling

No runnable H candidate now. Proposed next is **H1 after A1**, not a seventh
artificially READY task. Reserved future output `docs/handoffs/H/`; app adapter
path assigned after architecture approval, not an invented new service now.
H never edits `inquiry-form.tsx`, API or DB code, privacy translations or shared
QA files. C applies disclosure, D emits approved commit-confirmed signal, E
deploys only with external authorization. If A1 defers analytics, coordinator
records that decision and removes H4 release edges explicitly; do not mark
unexecuted H tasks DONE. Estimates remain conditional, excluded from baseline
only after that owner decision.
