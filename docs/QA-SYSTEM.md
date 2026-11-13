# QA system — running, recording and reading test status

Task: **ECHO-QA01** · Introduced 2026-11-13 · Applies to every later batch

This is the project's source of truth for what has actually been tested. It is a
thin layer over the commands that already exist (`npm run lint`, `npm test`,
`npm run build`, the HTTP smoke suite, the Python harnesses and the WebKitGTK
browser audits), plus an explicit record for things only a human can accept.

It has no runtime dependencies, no database, no server and no dashboard. The
registry is JSON, results are JSONL, and the CLI is TypeScript executed by Node's
native type stripping (`node scripts/qa.ts`).

## Files

| Path | Committed | Purpose |
| --- | --- | --- |
| `qa/registry.json` | yes | Suites and test definitions: ids, categories, procedures, expected results, evidence, criticality, gates, freshness watch lists. |
| `qa/lib/*.ts` | yes | Registry validation, runner, status/freshness rules, manual recording, reporting. |
| `scripts/qa.ts` | yes | CLI behind the `qa:*` npm scripts. |
| `qa/results/automated.jsonl` | yes | Append-only automated history. |
| `qa/results/manual.jsonl` | yes | Append-only manual history. |
| `qa/evidence/<TEST-ID>/` | yes | Small, durable evidence that must survive a clean checkout. |
| `qa/.out/logs/`, `qa/.out/qa-report.md` | **no** (gitignored) | Generated logs and reports. Never an acceptance source. |
| `test-results/` | **no** (gitignored) | Screenshot runs and evidence archives. Referenced by recorded results, not committed. |
| `tests/unit/qa-*.test.ts` | yes | Tests for the QA system itself. |

The rule of thumb: **definitions and decisions are committed; bulk output is
not.** Anything that must be reviewable in Git goes in `qa/evidence/`; anything
reproducible from a command belongs in `qa/.out/`.

## Running automated checks

```bash
npm run qa:validate                 # schema, ids, suites, gates
npm run qa:run                      # every non-opt-in suite, once each
npm run qa:run -- --only UNIT-SUITE # one test
npm run qa:run -- --only browser    # a category
npm run qa:run -- --only ECHO-504   # a milestone
npm run qa:run -- --dry-run         # show what would run
npm run qa:run -- --include-opt-in  # browser/PostgreSQL suites
```

Selection tokens match a test id, a suite name, a category or a milestone. A
shared suite runs **once** even when several tests map to it, so two tests that
both depend on `npm test` do not run it twice.

Exit codes: `0` all selected suites passed, `1` at least one failed, `2` at least
one was blocked or the selection was invalid.

Opt-in suites never run implicitly. They are:

| Suite | Needs | Why opt-in |
| --- | --- | --- |
| `browser-rtl`, `browser-locale`, `browser-visual` | `xvfb-run`, Python `gi`, `.next/BUILD_ID` | Slow; needs a production build and the WebKitGTK/Xvfb stack. |
| `postgres` | `.local/dev-pg/app.env` | Development database only; must never point at production data. |

If a prerequisite is absent, the suite is recorded as **BLOCKED** with the exact
reason and nothing is executed. A blocked suite is never reported as passing.

The runner records, per test: suite, command, start/finish timestamps, duration,
exit status, signal, timeout flag, source revision, dirty-tree flag, definition
hash, a trimmed summary, a log path and the final status. Output is redacted for
connection strings, passwords, tokens and private keys before it is written.

## Completing manual checks

```bash
npm run qa:manual -- --list
npm run qa:manual -- --show MANUAL-FIREFOX-GLASS
npm run qa:manual                              # interactive: pick a case, read the procedure, record
npm run qa:manual -- --history MANUAL-FIREFOX-GLASS
npm run qa:manual -- --id MANUAL-FIREFOX-GLASS --result PASS \
  --reviewer "Name" --role owner \
  --browser "Firefox 141" --os "Fedora 42" \
  --evidence test-results/manual/firefox/contact-375-dark.png \
  --notes "Header legible over the scrolled form; blur visible."
```

A manual record always stores: reviewer, role, result, browser/device/OS,
evidence paths, notes, findings, blocker, timestamp, source revision, dirty-tree
flag and the definition hash.

Constraints that cannot be bypassed:

- No record without a reviewer identity or role.
- `FAIL` needs notes or findings; `BLOCKED` needs a blocker.
- A `PASS` on an `owner` or `legal` gate is refused unless `--role owner` /
  `--role legal` is given. That role must correspond to a real person who
  actually reviewed the evidence; the CLI cannot verify that, so do not use it
  as a shortcut.
- Evidence paths must be repository-relative under `test-results/` or
  `qa/evidence/`; traversal, absolute paths, symlink escapes and the bare
  evidence root are rejected.
- A `PASS` whose required evidence is missing stays **REVIEW_REQUIRED**.

Corrections and retests are new records: the newest wins, and the new record's
`supersedes` field points at the previous one. History is never rewritten. Use
`--history <ID>` to review it.

### Recording the Firefox header check on Fedora (no developer knowledge needed)

`MANUAL-FIREFOX-GLASS` exists because the VM can only run WebKitGTK in software
mode, which does not rasterize `backdrop-filter`. Only a GPU-backed browser on
the host can settle it.

1. Make sure the site is being served locally (the preview server on
   `http://127.0.0.1:3210` or a tunnel to it). Do not open a public deployment.
2. In Firefox, open `http://127.0.0.1:3210/en/contact`.
3. Press **Ctrl+Shift+M** (responsive design mode) and set **375 × 812**.
4. Scroll until the inquiry form sits behind the header. Look at the header:
   is the text crisp, or is doubled/blurred content visible behind it?
5. Click the theme control to switch to dark and repeat.
6. Submit the empty form, then scroll so the error text sits behind the header.
7. Set the width to **320** and repeat the light-theme check.
8. Open the mobile menu, confirm it is opaque, focus is on Close, and Escape
   returns focus to the trigger.
9. Take a screenshot for each state (light, dark, error, 320, open drawer) and
   save them under `test-results/manual/firefox/`.
10. Record the outcome:

```bash
npm run qa:manual -- --id MANUAL-FIREFOX-GLASS --result PASS \
  --reviewer "Your name" --role owner \
  --browser "Firefox <version>" --os "Fedora <version>" --device "desktop" \
  --evidence test-results/manual/firefox/light-375.png,test-results/manual/firefox/dark-375.png \
  --notes "Header text legible; surface visibly blurs scrolled content."
```

If anything is wrong, use `--result FAIL --findings "..."` and describe the
defect precisely. If Firefox cannot be used at all, use `--result BLOCKED
--blocker "..."` instead of guessing.

## How status is calculated

Each test has at most one current automated record and one current manual record.

1. No record → **NOT_RUN**. A missing result is never PASS.
2. A record whose `definitionHash` no longer matches the registry entry →
   **STALE** (the test itself changed).
3. A record from a dirty working tree → **STALE** (it cannot be reproduced from
   a commit).
4. Uncommitted changes in the test's `watch` globs → **STALE**.
5. A record whose revision is not an ancestor of `HEAD` → **STALE**.
6. Git cannot answer (not a checkout, unknown revision, unreadable diff) →
   **STALE**, not PASS.
7. Otherwise: automated PASS/FAIL/BLOCKED come from the exit status; an
   interrupted run that only wrote its start record shows **RUNNING**.
8. Manual results additionally require the gate role and the required evidence.
   Missing evidence or an insufficient role → **REVIEW_REQUIRED**.

The freshness policy is stored verbatim in `qa/registry.json`
(`freshnessPolicy`) and repeated in every generated report.

An empty `watch` list means "this result does not depend on repository paths"
(for example a legal wording approval), so uncommitted or later source changes do
not invalidate it. A definition edit still does.

### Practical consequence

Run `npm run qa:run` on a **clean** tree — commit or stash first. A run made
before committing records `worktreeDirty: true` and is deliberately reported as
STALE, because it cannot be tied to a commit. The newly written result files are
untracked, so they do not mark the tree dirty themselves; commit them afterwards.

## Reading status and reports

```bash
npm run qa:status                    # table grouped by category
npm run qa:status -- --milestone ECHO-505
npm run qa:status -- --json          # machine-readable
npm run qa:report                    # Markdown in qa/.out/qa-report.md
npm run qa:report -- --stdout        # also print it
```

The report includes generation time and command, the source revision and whether
it was dirty, coverage counts, per-test automated and manual outcomes with
revisions and evidence, pending/failed/blocked/stale lists, milestone readiness,
release gates and the freshness policy. It states explicitly that it is not
owner or legal sign-off.

`qa:status` and `qa:report` only read: they never modify results.

## Milestones, acceptance and release gates

Definitions carry `milestones` (e.g. `ECHO-503`, `ECHO-VF01-R1`, `ECHO-505`) and
`gate` (`technical`, `owner`, `legal`). The report's milestone table shows
automated PASS, manual PASS and the number of owner/legal gated cases.

Five different statements are deliberately kept apart:

| Statement | Where it lives |
| --- | --- |
| Implementation complete | `ROADMAP.md` checkboxes and task docs |
| Automated verification passed | QA records, `qa:status` |
| Manual acceptance passed | manual QA records with evidence |
| Owner/legal sign-off complete | `gate: owner` / `gate: legal` manual records |
| Release ready | report's release gate section, only when all of the above hold |

The QA CLI never edits `ROADMAP.md` and never approves a gate. Passing tests do
not tick a checkbox; a human does that after reading the evidence.

## Failures and blockers

- **FAIL** — a real command failed or a reviewer recorded a defect. Reproduce,
  fix, re-run; the new record supersedes the old one. Do not delete the failure.
- **BLOCKED** — an environment or decision is missing (no GPU browser, no
  PostgreSQL env, no owner decision). The blocker text is required and shown in
  every report. Blocked release-relevant tests keep release at NO.
- **STALE** — the record no longer represents the current tree. Re-run it; do not
  reinterpret it.
- **REVIEW_REQUIRED** — evidence or the correct reviewer role is missing.

## What is committed versus generated

Commit: `qa/registry.json`, `qa/lib/`, `scripts/qa.ts`, `qa/results/*.jsonl`,
`qa/evidence/`, `tests/unit/qa-*.test.ts`, `docs/QA-SYSTEM.md`.

Do not commit: `qa/.out/` (logs, generated report), `test-results/` (screenshot
runs, archives), `.next/`, databases or `.local/`.

Because the generated report is ignored, project-wide acceptance never depends on
an ephemeral file: it is always recomputable from the committed registry and
result history.
