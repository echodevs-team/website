# Agent instructions — activate the seven-lane plan in the live Echo Devs repository

**Only the planning/reconciliation batch is authorized by this document; it does not authorize executing any of the seven development lanes.**

1. Place all nine Markdown files under `docs/parallel/`, preserving names and task IDs. Read `AGENTS.md`, `ROADMAP.md`, `SCOPE.md`, existing owner decisions, `docs/QA-SYSTEM.md`, `qa/registry.json`, current QA history and source. Check `git status` and preserve all concurrent edits.
2. Reconcile *every* seeded `UNVERIFIED` task against the live code and evidence. Split or refine dependencies to the smallest verified prerequisites. If work was already done, cite its code and acceptance evidence before marking `DONE`. If it lacks acceptance proof mark `NEEDS_REVALIDATION`, not `DONE`.
3. Verify the dependency graph, missing IDs, cycles, release gate and cross-lane shared-file conflicts. Do not claim any of the seven lanes READY just to fill seven slots.
4. Add a concise `docs/parallel/NOW.md` with **CURRENT / READY / BLOCKED / NEXT**, one safe candidate per lane when available, explicit cross-lane dependencies and ranks based on downstream unlocks and release critical-path. Mark unverified blockers and owner decisions precisely.
5. Define a repeatable refresh procedure in docs (or a small non-invasive read-only script if justified by existing tooling). It must be triggered after each approved completion, status change, owner decision, or new source revision. QA results remain authoritative for actual test outcome; no duplicate test status engine.
6. Establish file ownership/branch/worktree rules for parallel development. Shared `ROADMAP.md`, QA registry, and coordinator documents have one integration owner. No agent may silently edit an in-use file in another worker’s checkout.
7. Run repository markdown/QA validation and safe checks relevant to documentation. Commit *only* this planning batch locally after checking staged diff and secrets; no push, deployment, or new feature implementation.
8. Final handoff: list the seven current candidate tasks ranked by critical-path unblocks, dependencies, first proposed wave, exact files changed, commit hash, checks run, and requests for the owner's approval before launching any lane.

Existing report hints are not actual repo facts. ECHO-506 was authorized but no completion report was provided in this conversation; inspect before making a conclusion. Never activate real-user intake, production indexing or analytics tracking without their own approvals and privacy gates.
