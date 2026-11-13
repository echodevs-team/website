# QA result history

Two append-only JSONL files live here. They are **version-controlled**: they are
the durable acceptance record, not generated output.

| File | Written by | Meaning |
| --- | --- | --- |
| `automated.jsonl` | `npm run qa:run` | One record per test per suite execution, including BLOCKED and interrupted runs. |
| `manual.jsonl` | `npm run qa:manual` | One record per human review. Corrections and retests are new records. |

Rules:

- Never hand-write or delete a record to make status look better. A correction
  is a new record with `supersedes` pointing at the previous one.
- Never edit a historical record's revision, timestamp or evidence to match a
  later commit. Stale results are displayed as STALE; that is the intended
  behaviour.
- Records must keep `sourceRevision` and `worktreeDirty`. A record from a dirty
  tree is always reported as STALE, because it cannot be reproduced from a
  commit.
- `definitionHash` binds each record to the test definition it was produced
  from. Editing the definition invalidates older results.
- Malformed or invalid lines are ignored with a warning and never counted as
  PASS.

Generated logs and reports are written to `qa/.out/` and are gitignored.
Screenshots and similar artifacts belong in `test-results/` (gitignored) or, for
long-term acceptance evidence, in `qa/evidence/<TEST-ID>/`.

See `docs/QA-SYSTEM.md` for the full workflow.
