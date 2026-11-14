# F — QA / accessibility / browser acceptance

Reviewed 2026-11-14 at `6eedf3b`. Use ECHO-QA01 exclusively. Coordinator alone
integrates registry/results; F proposes coverage and performs explicitly approved
checks in its own checkout. Planning inspection is not execution of F1.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| F1 | Coverage/revalidation proposal for current release: missing cases, resources, reviewers and QA definitions | — | 2–4 | TODO | QA01 exists and validates (31 cases/15 suites), but no complete P6/P7 coverage proposal: a11y automation, contrast/motion, performance, security, staging DB E2E, recovery and analytics (if approved) need explicit coverage | F2a, F3 |
| F2a | Baseline automated accessibility/contrast/reduced-motion coverage and defect triage | F1 | 3–5 | BLOCKED | ECHO-601 has no recorded automated accessibility pass; choose existing compatible tools, no speculative installs. Register via coordinator; baseline may run before B2, final retest after fixes | F2 |
| F2 | Final native-reading, keyboard/SR and actual 200% zoom acceptance | F2a, B2, C1, D3, C5 | 7–12 | BLOCKED | `MANUAL-SR-KEYBOARD`, `MANUAL-ZOOM-200`, native cases NOT_RUN; D3 needed for valid synthetic inquiry/announcements. Final C5 copy must be integrated before final review. Human AT/native/browser capability required, not a narrower viewport simulation | F4 |
| F3 | RC cross-engine/performance/regression tests, browser→DB, recovery/security evidence | F1, B3, E4, D4, H4, C5 | 8–14 | BLOCKED | Four browser matrices STALE; performance ECHO-602 >=90 lab target not measured. `MANUAL-CROSSENGINE-PARITY` NOT_RUN; no Firefox/Chromium/GPU here. Test integrated final content, not moving C5 edits; exact conditions/revisions and current QA outcomes required | F4, G1 |
| F4 | Integrated UAT and current release-gate evidence report | F2, F3, B4, C5 | 5–8 | BLOCKED | Not satisfied by 14 automated PASS; all required manual/owner/legal and operational evidence must be current, defects resolved or explicitly dispositioned without overriding safety gates | A4, G2 |

## Ownership / handoff

First wave writes only `docs/handoffs/F/` (coverage proposal, not another tracker).
Later F owns assigned test harness/new regression files; existing browser scripts
are exclusive leases shared with B. Only coordinator edits `qa/registry.json`,
appends reviewed real results and integrates `qa/evidence/**`; worker evidence
retains tested commit, dirty flag, tool versions and actual observations.
No one uses owner/legal reviewer roles on their behalf. F2 human review and
B1 GPU comparison require owner resources, not subagents. Next: **F1**.
