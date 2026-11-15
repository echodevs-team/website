# H — Private analytics / conversion insights

Accepted 2026-11-15 at `a015c8f` (A1 accepted; scope settled, provider still
unapproved). No tracker/dashboard exists in source or package dependencies, and
`src/content/privacy.ts` correctly discloses none. **Owner decision 2026-11-15:
private reuse-first analytics is mandatory V1 scope** (`SCOPE.md` §8.4,
`docs/DECISIONS.md` A13), which resolves the scaffold/SCOPE/ECHO-804 conflict in
favour of inclusion. H1 (options only) is dependency-eligible; H2–H4 stay blocked,
no provider, consent position or implementation is approved, and nothing may be
tracked, installed or deployed by this lane.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| H1 | Reuse-first options, metrics and minimal event contract for owner selection | A1 | 3–5 | TODO | A1 satisfied; inclusion is confirmed, but no provider/metrics/architecture is accepted. Compare maintained self-hosted options against the `SCOPE.md` §8.4 criteria (private admin access, pageviews/trends, popular pages, sources, device/language, inquiry conversion, minimization, backup/upgrade path, licence and hosting cost); Umami is one candidate, not a decision. Research only: no deployment, account, tracker or visitor data | H2 |
| H2 | Approve analytics retention, disclosure, access, consent and conversion semantics | H1, A3 | 3–6 | BLOCKED | Owner/legal sign-off absent. Specify no form fields, contacts, inquiry UUID, idempotency key, IP or sensitive query/referrer in events, the FA/EN/AR disclosure update that must precede tracking (`SCOPE.md` §8.4, D10), and dashboard access/revocation; minimization is not automatically anonymity | H3 |
| H3 | Approved private dashboard and safe pageview/confirmed-inquiry integration | H2, E2, D1, D2 | 7–13 | BLOCKED | No code/config implemented; D owns submission hook, H owns tracker adapter/config only. Synthetic tests; failure must not affect durable intake or replay duplicate counts | H4 |
| H4 | Verify privacy, count accuracy, failure isolation, access, backup and handoff | H3, E4 | 4–7 | BLOCKED | No analytics QA evidence. Add approved cases to QA01 via coordinator; actual test events/dashboard evidence and owner handoff required. No dependency on marketing contact facts: access/operator policy comes from A3 | A4, C5, F3, G1, G3 |

## Ownership / scope handling

No runnable H candidate now beyond H1 options research, which no worker is
assigned yet. Reserved future output `docs/parallel/handoffs/H1.md`; app adapter
path assigned after architecture approval, not an invented new service now.
H never edits `inquiry-form.tsx`, API or DB code, privacy translations or shared
QA files. C applies disclosure, D emits approved commit-confirmed signal, E
deploys only with external authorization. A1 confirmed inclusion, so the H4
release edges stay in place and no graph change is required; if the owner later
defers analytics, the coordinator must record that reversal and remove those edges
explicitly. Unexecuted H tasks are never marked DONE, and inclusion does not
authorize installing a provider, creating an account or enabling tracking.
