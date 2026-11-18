# B — UI / reference fidelity

Reviewed 2026-11-18 at `d5c78b1` (B1a accepted and integrated). Preserve
`design/reference/code.html`; no redesign. Seed B1 is split so unavailable
GPU/native comparison does not prevent a bounded source/evidence defect inventory.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| B1a | Reconcile existing reference mappings, captures and unresolved visual defects; specify capture packet | — | 0–0 | DONE | Accepted and integrated at `d5c78b1` (source `71dcc5c`, patch id `fa2f3c2b…`, SHA-256 `8e6f6ff9…`): `docs/parallel/handoffs/B1a.md`, 688 lines — evidence inventory, route × locale matrix, findings #1–#6 reconciled, source-only differences separated from confirmed defects, capture conditions and the N1–N13 matrix. Inventory only: no browser, capture or style change | B1 |
| B1 | Actual reference/current desktop/mobile, theme and GPU comparison | B1a | 3–5 | NEEDS_REVALIDATION | `70e414f`, `dd88984`, `a94fb57`, `a90938f` fix specific findings, not full fidelity. ECHO-003/109/608 open. B1a delivered the capture packet (its §5.2/§5.3), but the capture itself needs approved offline reference assets plus owner-side Firefox/Chromium with a GPU through the existing loopback tunnel; this VM has no such engine and no offline asset set | B2 |
| B2 | Correct only confirmed residual defects, including RTL-arrow investigation | B1 | 6–12 | BLOCKED | Findings #1–4 already addressed; do not redo Work/About/404. #5–6 and any new confirmed defects need before/after evidence; zero changes is valid if inspection clears them | B3, F2 |
| B3 | Cross-engine interaction/responsive visual validation after fixes | B2 | 6–10 | BLOCKED | `MANUAL-CROSSENGINE-PARITY` NOT_RUN; WebKit-only historical matrices do not prove Chromium/Firefox | B4, F3 |
| B4 | Owner visual acceptance of desktop/mobile, both themes and all locales | B3, A1 | 3–5 | BLOCKED | `MANUAL-OWNER-VISUAL` NOT_RUN; written owner approval tied to captures/revision | A4, F4, G1 |

## B1a acceptance (2026-11-18)

B1a satisfies its definition: it is a read-only inventory that adds one file and
touches no source, style, asset, QA or lane file. Its factual claims were
re-verified against the integrated tree and hold: the reference is
`<html class="light" dir="rtl" lang="fa">` with a `scrollY > 20` header switch from
`bg-transparent` to a 90 % fill with `blur(16px) saturate(140%)`; `↗` (U+2197)
appears exactly seven times and no `[dir="rtl"]`/`scaleX(-1)`/`rotate-180` mirroring
exists; the navigation switches at `64rem` (`src/components/layout/mobile-nav.tsx:25`)
while `docs/UI-UX-REVIEW.md:30` still says 80rem. Findings #1–#4 stay resolved and
were not reopened; #5 and #6 stay open exactly as B1a describes.

Source-observable differences are **not** treated as required design changes. The
one worth naming is the header's permanent fill against the reference's
transparent top state, which is a deliberate VF01 readability correction, not a
regression: it stays a B2 question only if B1's capture shows an actual fidelity
problem. No visual acceptance is claimed anywhere — the 442 × 1600 reference PNG is
a downscaled composition, not a CSS viewport, and no pixel comparison exists.

**Evidence policy accepted with a size cap** (see F lane for the operative rule):
`qa/evidence/<TEST-ID>/<short-revision>/README.md` plus at most four decisive PNGs
per case, ≤ 1.5 MB per case, with SHA-256 recorded in the README. The 928 PNGs and
seven `.zip` bundles already in the gitignored `test-results/` are review staging;
B1a's cited bundles and hashes were checked in this checkout and match. Copying
whole matrices into Git is explicitly rejected on repository-size and maintenance
grounds; consistency across a long-lived repo matters more than pixel-fidelity
archive depth.

## Ownership / prerequisites

First wave writes only `docs/handoffs/B/`. Later exclusive B files:
`src/styles/{header,homepage,work,about,primitives,tokens}.css` and presentation
components, by explicit per-task lease. C owns copy, not layout; request changes
instead of editing its files. `header.tsx`, `inquiry-form.tsx`, shared layout,
fonts and tokens require coordinator assignment before edits. B3 is visual
validation; F3 owns integrated test execution to avoid duplicate browser runs.
B1a is DONE, so B1's dependency is satisfied, but **B1 is not assignable in this
environment**: it needs the owner-side GPU/browser run and an approved offline
reference asset set. The next B work is therefore that owner-side capture session,
not a new agent task.
