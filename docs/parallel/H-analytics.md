# H — Private analytics / conversion insights

Accepted 2026-11-15 at `a015c8f` (A1 accepted; scope settled, provider still
unapproved). No tracker/dashboard exists in source or package dependencies, and
`src/content/privacy.ts` correctly discloses none. **Owner decision 2026-11-15:
private reuse-first analytics is mandatory V1 scope** (`SCOPE.md` §8.4,
`docs/DECISIONS.md` A13), which resolves the scaffold/SCOPE/ECHO-804 conflict in
favour of inclusion. **H1 accepted and integrated 2026-11-16** at `55b8422`
(options packet only). H1 recommends Umami 3.5.0 self-hosted as a separate
private service with its own PostgreSQL database, with Plausible CE as the
privacy-first alternative and Matomo as the depth fallback — a recommendation,
**not** an approved provider. H2–H4 stay blocked, no provider, consent position,
retention or implementation is approved, and nothing may be tracked, installed or
deployed by this lane.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| H1 | Reuse-first options, metrics and minimal event contract for owner selection | A1 | 0–0 | DONE | **Accepted and integrated 2026-11-16** at `55b8422` (branch `parallel/h1`; handoff `docs/parallel/handoffs/H1.md`, 827 lines). Compares Umami 3.5.0 (MIT), Plausible CE 3.2.1 (AGPL-3.0) and Matomo 5.14.2 (GPL-3.0) against the `SCOPE.md` §8.4 outcomes, three architectures (co-hosted, separate host, managed), a confirmed-durable-write no-PII conversion contract, a weighted matrix (4.30/3.35/3.20) and owner decisions D10-a–l. **Umami is a conditional recommendation, not an approved provider**; no account, tracker, dependency, spend or privacy-copy change | H2 |
| H2 | Approve analytics retention, disclosure, access, consent and conversion semantics | H1, A3 | 3–6 | BLOCKED | H1 accepted at `55b8422` but supplies options only; **A3 owner/legal answers still absent**, so product, architecture, retention, consent, access and event scope are unapproved (D10-a–l). Must record no form fields, contacts, inquiry UUID, idempotency key, IP or sensitive query/referrer in events, the FA/EN/AR disclosure update that must precede tracking (`SCOPE.md` §8.4, D10), and dashboard access/revocation; minimization is not automatically anonymity | H3 |
| H3 | Approved private dashboard and safe pageview/confirmed-inquiry integration | H2, E2, D1, D2 | 7–13 | BLOCKED | D1 satisfied: conversion hook boundary and no-PII rule are in D1 §4.8/§7. H1 accepted and supplies the event contract plus proposed cases ANALYTICS-001–012; still blocked on H2, E2 and D2. No code/config implemented; D owns submission hook, H owns tracker adapter/config only. Synthetic tests; failure must not affect durable intake or replay duplicate counts | H4 |
| H4 | Verify privacy, count accuracy, failure isolation, access, backup and handoff | H3, E4 | 4–7 | BLOCKED | No analytics QA evidence. Add approved cases to QA01 via coordinator; actual test events/dashboard evidence and owner handoff required. No dependency on marketing contact facts: access/operator policy comes from A3 | A4, C5, F3, G1, G3 |

## Ownership / scope handling

No runnable H candidate remains: H1 options research is delivered and accepted,
and **H2 cannot start** until the owner/legal A3 answers and the D10 product,
architecture, retention, consent, access and event-scope decisions exist. H1's
handoff is the decision input for those answers, not a decision. The app adapter
path is assigned after architecture approval, not an invented new service now.
H never edits `inquiry-form.tsx`, API or DB code, privacy translations or shared
QA files. C applies disclosure, D emits approved commit-confirmed signal, E
deploys only with external authorization. A1 confirmed inclusion, so the H4
release edges stay in place and no graph change is required; if the owner later
defers analytics, the coordinator must record that reversal and remove those edges
explicitly. Unexecuted H tasks are never marked DONE, and inclusion does not
authorize installing a provider, creating an account or enabling tracking.
