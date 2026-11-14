# B — UI / reference fidelity

Reviewed 2026-11-14 at `6eedf3b`. Preserve `design/reference/code.html`;
no redesign. Seed B1 is split so unavailable GPU/native comparison does not
prevent a bounded source/evidence defect inventory.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| B1a | Reconcile existing reference mappings, captures and unresolved visual defects; specify capture packet | — | 2–3 | TODO | `docs/ECHO-503-VISUAL-FOLLOWUPS.md`, VF01/R1 and ECHO-506 reports exist, but no current consolidated visual defect packet. Read-only app review; no manual UI verification delegated | B1 |
| B1 | Actual reference/current desktop/mobile, theme and GPU comparison | B1a | 3–5 | NEEDS_REVALIDATION | `70e414f`, `dd88984`, `a94fb57`, `a90938f` fix specific findings, not full fidelity. ECHO-003/109/608 open; faithful reference render needs approved offline assets; Firefox GPU human evidence unavailable here | B2 |
| B2 | Correct only confirmed residual defects, including RTL-arrow investigation | B1 | 6–12 | BLOCKED | Findings #1–4 already addressed; do not redo Work/About/404. #5–6 and any new confirmed defects need before/after evidence; zero changes is valid if inspection clears them | B3, F2 |
| B3 | Cross-engine interaction/responsive visual validation after fixes | B2 | 6–10 | BLOCKED | `MANUAL-CROSSENGINE-PARITY` NOT_RUN; WebKit-only historical matrices do not prove Chromium/Firefox | B4, F3 |
| B4 | Owner visual acceptance of desktop/mobile, both themes and all locales | B3, A1 | 3–5 | BLOCKED | `MANUAL-OWNER-VISUAL` NOT_RUN; written owner approval tied to captures/revision | A4, F4, G1 |

## Ownership / prerequisites

First wave writes only `docs/handoffs/B/`. Later exclusive B files:
`src/styles/{header,homepage,work,about,primitives,tokens}.css` and presentation
components, by explicit per-task lease. C owns copy, not layout; request changes
instead of editing its files. `header.tsx`, `inquiry-form.tsx`, shared layout,
fonts and tokens require coordinator assignment before edits. B3 is visual
validation; F3 owns integrated test execution to avoid duplicate browser runs.
B1 cannot be called READY until owner supplies the GPU/browser/reference path.
Next runnable candidate: **B1a**, not the full B1 acceptance.
