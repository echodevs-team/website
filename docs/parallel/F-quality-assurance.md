# F — QA / accessibility / browser acceptance

Reviewed 2026-11-18 at `d5c78b1` (F1 accepted and integrated). Use ECHO-QA01
exclusively. Coordinator alone integrates registry/results; F proposes coverage
and performs explicitly approved checks in its own checkout. Planning inspection
is not execution of F1.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| F1 | Coverage/revalidation proposal for current release: missing cases, resources, reviewers and QA definitions | — | 0–0 | DONE | Accepted and integrated at `d78926b` (`docs/parallel/handoffs/F1.md`, 670 lines): 43 candidate ids in four tiers, `F1-W1`–`F1-W12`, gap-to-milestone cross-tab, revalidation order, cross-lane table and a 39–65 h bottom-up estimate. Proposal only — nothing was registered and no result was recorded. One claimed defect (`F1-W4`) does not survive verification and §7's seven-PASS-to-STALE prediction is wrong; both are corrected below | F2a, F3 |
| F2a | Baseline automated accessibility/contrast/reduced-motion coverage and defect triage | F1 | 3–5 | TODO | F1 DONE, so only registration, tooling authorization and a checkout with `node_modules` remain. Deliverable: the approved Tier 1 harnesses, the `scripts/qa.ts` selection fixes (`F1-W10`/`F1-W11`) with unit tests, and real local runs of the two new PostgreSQL cases; the coordinator registers definitions and records outcomes. ECHO-601 still has no recorded automated accessibility pass; final retest follows B2 | F2 |
| F2 | Final native-reading, keyboard/SR and actual 200% zoom acceptance | F2a, B2, C1, D3, C5 | 7–12 | BLOCKED | `MANUAL-SR-KEYBOARD`, `MANUAL-ZOOM-200`, native cases NOT_RUN; D3 needed for valid synthetic inquiry/announcements. Final C5 copy must be integrated before final review. Human AT/native/browser capability required, not a narrower viewport simulation | F4 |
| F3 | RC cross-engine/performance/regression tests, browser→DB, recovery/security evidence | F1, B3, E4, D4, H4, C5 | 8–14 | BLOCKED | Four browser matrices STALE; performance ECHO-602 >=90 lab target not measured. `MANUAL-CROSSENGINE-PARITY` NOT_RUN; no Firefox/Chromium/GPU here. Test integrated final content, not moving C5 edits; exact conditions/revisions and current QA outcomes required | F4, G1 |
| F4 | Integrated UAT and current release-gate evidence report | F2, F3, B4, C5 | 5–8 | BLOCKED | Not satisfied by 14 automated PASS; all required manual/owner/legal and operational evidence must be current, defects resolved or explicitly dispositioned without overriding safety gates | A4, G2 |

## F1 acceptance and candidate disposition (2026-11-18)

F1 satisfies its definition: it is a coverage/revalidation proposal, it registers
nothing, it recomputed the QA snapshot at its baseline exactly, and its 43
candidate ids are unique, collision-free with the 31 registered ids and mapped to
prerequisites and owners. The coordinator accepts it **in full as a proposal** and
accepts its defects and candidates **selectively** as follows.

| Disposition | Count | Cases |
|---|---:|---|
| Approved for registration now (F2a delivers the definitions; the coordinator registers and records) | 10 | `CI-WORKFLOW-INTEGRITY`, `SECRETS-HYGIENE-SCAN`, `PRIVACY-DISCLOSURE-PARITY`, `A11Y-DOM-CONTRACT`, `A11Y-CONTRAST-TOKENS`, `A11Y-REDUCED-MOTION`, `PERF-BUNDLE-BUDGET`, `PG-INQUIRY-HTTP-E2E`, `PG-OPERATIONS-RECOVERY`, `ANALYTICS-001` |
| Approved, but registrable only after an explicit dependency decision | 1 | `A11Y-AXE-SCAN` (needs a new devDependency; `A11Y-DOM-CONTRACT` is the dependency-free substitute until then) |
| Mandatory for V1, register when the named prerequisite lands (not now) | 29 | §4.2 minus `STAGING-GRACEFUL-SHUTDOWN` (4), §4.3 minus `MANUAL-FORCED-COLORS` (14), and `ANALYTICS-002`–`011` plus `ANALYTICS-013` (11); each one is blocked on D2/E1a/E2/E3/E4 or H2/H3, none on F |
| Optional or deferred; recorded, not scheduled | 3 | `STAGING-GRACEFUL-SHUTDOWN` and `MANUAL-FORCED-COLORS` (both OPTIONAL in F1 §3.2), `ANALYTICS-012` (not release-relevant) |

Nothing was registered, installed or executed in this batch, so all 43 stay
candidates. The two PostgreSQL cases are the highest-value entries: they are the
only way to convert the single release-critical NOT_RUN into real evidence.

## Corrections recorded against the accepted handoff

Neither correction changes the proposal's structure or its effort range; both
would otherwise mislead the next agent. They are recorded here, in
[README](README.md) and in [NOW](NOW.md) rather than edited into the worker's
handoff, following the E1 precedent.

1. **`F1-W4` is not a defect.** `qa/registry.json` declares `evidenceRequired`
   zero times, but `qa/lib/registry.ts:117` normalizes it to
   `raw.evidenceRequired !== false`, so the parsed registry already carries
   `true` on 31/31 cases and `missingEvidence()` (`qa/lib/status.ts:65-68`)
   refuses a manual PASS with an empty `evidence[]`. Proposed fix §2.2 item 3 is
   therefore a no-op — measured: no definition hash changes. The real, narrower
   gap is durable/portable evidence (`F1-W8`, plus B1a §5.2 item 6), and
   `MANUAL-FIREFOX-GLASS` stays BLOCKED regardless because the BLOCKED branch
   returns before the evidence check.
2. **§7 steps 1–2 mispredict the freshness effect.** They expect seven PASS
   records to become STALE when the inherited watches become explicit. Measured
   with `parseRegistry` on a copy: `normalizeTest` already substitutes
   `defaultWatch` (`qa/lib/registry.ts:103`), so copying it verbatim yields an
   identical normalized object and an **identical definition hash**. The
   `postgres` prerequisite change and the two new suites do not move the hash
   either, because `definitionHash` covers only the test object (`F1-W12`).
   Exactly zero recorded statuses change when the real `F1-W1`/`W5`/`W6` fixes
   are applied; the only hash changes are the five NOT_RUN manual cases touched
   by `W3`/`W7`, and they are invisible. A later coordinator batch must not
   report a freshness regression that cannot occur.

**Proposed split declined.** F1 §9 offers an F2b (human acceptance) split of F2.
F2a already exists as a separate row whose only dependency was F1, so a third row
would duplicate F2's scope, unlock nothing and add a lane row with no distinct
acceptance — and it would make the human-resource gate look schedulable when it
is not. F2 keeps its current list unchanged.

**Effort revision proposed, not applied.** The lane total stays 23–39 h (F1
delivered) because the owner has not approved new scope. F1's bottom-up estimate
implies F2a 13–20 h (registry/tooling fixes, Tier 1 automation, browser
revalidation; 15–24 h if the axe decision lands) and F3 12–21 h (staging suite
plus analytics verification) with F2 and F4 unchanged — a lane total of 37–61 h
(39–65 h with axe), i.e. **+14 to +22 h** over the applied figure. The increase
is entirely coverage the old row never itemised, not new features. Applying it
would move the plan total from 139–243 h to 153–265 h (155–267 h with axe). That
is a scope decision for the owner, so the tables keep the approved numbers.

## Ownership / handoff

First wave writes only `docs/handoffs/F/` (coverage proposal, not another tracker).
Later F owns assigned test harness/new regression files; existing browser scripts
are exclusive leases shared with B. Only coordinator edits `qa/registry.json`,
appends reviewed real results and integrates `qa/evidence/**`; worker evidence
retains tested commit, dirty flag, tool versions and actual observations.
No one uses owner/legal reviewer roles on their behalf. F2 human review and
B1 GPU comparison require owner resources, not subagents.

Durable evidence policy adopted (B1a §5.2 item 6, tightened here): acceptance
evidence lives at `qa/evidence/<TEST-ID>/<short-revision>/` with a `README.md`
carrying revision, engine, viewport, theme, zoom and SHA-256 per image, and at
most four decisive PNGs per case (target ≤ 1.5 MB per case). `test-results/`
archives and the review `.zip` bundles stay gitignored staging, never the
acceptance record; per-image sidecar JSON is dropped in favour of the README
table, and a superseded run keeps its own revision directory so an older PASS
record stays verifiable. Next: **F2a**.
