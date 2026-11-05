# ECHO-103 — CI foundation

2026-11-04. **Implementation and local verification complete; hosted acceptance pending.** ECHO-103 remains unchecked/PARTIAL because no remote is configured and no GitHub Actions run has occurred. This report does not claim hosted CI passed. No application, architecture, visual, prototype, package-script or lockfile changes.

## Workflow

`.github/workflows/ci.yml`:

- One `ubuntu-24.04` GitHub-hosted job, 15-minute timeout; branch pushes (not tags), ordinary `pull_request`, manual `workflow_dispatch`. No path filter that could leave a required check permanently pending.
- Concurrency cancels obsolete runs for the same workflow/PR/ref; no scheduled work or self-hosted runner.
- Node **24.21.0**, bundled npm **11.19.0**. Official Node release index confirms that pairing; local version guards also pass. No global npm/system installation needed. Keep the pin/guards synchronized with future reviewed runtime upgrades.
- Official actions resolved from GitHub release/tag metadata and their pinned action manifests reviewed: checkout **v7.0.1** at `3d3c42e5aac5ba805825da76410c181273ba90b1`; setup-node **v7.1.0** at `949feb2413d6458794dcd2491c4babbbce0c15c1`. Both actions use Node 24. No floating tag or extra validation/cache action.
- setup-node caches **npm downloads** with `package-lock.json` as the dependency key. `npm ci` always runs; neither node_modules nor `.next` is cached/restored. Cache hit/miss behavior itself is not yet observed on GitHub.
- Steps: version guards, `npm ci --ignore-scripts --no-audit --no-fund`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Commands use ordinary failure exits and default success dependencies; no continue-on-error, catch/ignore, `|| true` or fail-open wrapping. Explicit Bash shell uses Actions' fail-fast/pipefail behavior.
- `CI=true`, `NEXT_TELEMETRY_DISABLED=1`. No browser/DB/audit-service job or deploy; those are not this task. HTTP smoke remains available locally but is not presented as browser testing.

## Security choices

Only `contents: read` requested; other workflow token permissions are not elevated. Checkout does not persist credentials, run destructive pre-fetch cleaning or modify global safe-directory config; the job uses a fresh GitHub-hosted runner. No submodule/LFS checkout requested. No custom secrets, registry authentication, OIDC, write permission, artifact upload, privileged command, container/service or external-party notification. The platform's short-lived read token is used only through normal official checkout/setup actions, not copied into shell commands or files by project steps.

No `pull_request_target`, workflow_run privilege bridge or interpolation of untrusted PR text into run scripts. No application code, inquiry data or credentials are transmitted by local validation; public action metadata/schema/Node release reads were the only CI-tooling lookups. The workflow file is prepared locally, not published/activated here. Owner-controlled GitHub publication/enablement is still needed; no remote service was modified.

Lifecycle scripts stay disabled on install. Existing lockfile install-script flags on optional watcher/SWC/fsevents packages were reviewed; packaged native binaries work locally. No dependency or package-manager changes. Existing ESLint 9 deprecation, dev minimatch override and experimental global-not-found limitation remain as documented in P1-FOUNDATION; not silently fixed/expanded as part of CI.

## Local verification evidence

The exact workflow commands were run with `CI=true NEXT_TELEMETRY_DISABLED=1`:

| Check | Actual result |
|---|---|
| Node/npm equality guards | PASS: v24.21.0 / 11.19.0 |
| Clean `npm ci --ignore-scripts --no-audit --no-fund` | PASS, 409 packages; existing ESLint deprecation warning |
| `npm run lint` | PASS, zero warnings/errors |
| `npm run typecheck` | PASS, Next typegen + tsc |
| `npm test` | PASS, 1 file / 6 tests |
| `npm run build` | PASS, three prerendered locale pages; existing experimental globalNotFound notice |
| `TMPDIR=/tmp/opencode node scripts/check-ci-failures.mjs` | PASS: lint exit **1**, expected `@typescript-eslint/no-explicit-any`; typecheck exit **2**, expected `TS2322` |
| Temporary cleanup/source preservation | PASS: no fixture in project src, no `echo-ci-negative-*` directory left; no application/config/lockfile diff |
| Artifact tracking | `git ls-files -- .next out coverage node_modules` empty; .next/BUILD_ID, node_modules lock, out/coverage paths match ignore rules; nothing staged |

`scripts/check-ci-failures.mjs` is dependency-free test infrastructure, not application code. It copies only an explicit source/config allowlist into its own mkdtemp directory, symlinks installed project dependencies for reads, inserts each fixture in the copy and calls the **same** npm lint/typecheck scripts as CI. Expected diagnostics and nonzero normal exits are required: a crash, timeout or unrelated missing-config failure does not count as success. The helper removes its owned directory in finally, including generated .next and the dependency symlink without following its target. It never edits working-tree application files or copies `.env`, `.git` or reference assets. Install dependencies before running it. On other systems, omit TMPDIR to use the ordinary local temp directory; Windows-specific behavior was not tested.

README has the local pre-submission sequence. Positive checks passed before injecting errors; injected errors were isolated, not hidden or committed as real source defects.

### Workflow configuration validation

No actionlint executable was available; no privileged/downloaded standalone validator installed. Used existing **js-yaml 4.3.2** to parse YAML and **Ajv 6.15.0** against `https://json.schemastore.org/github-workflow.json` (draft-07) for structural validation. Result **PASS**, with Ajv warnings about sibling keywords next to schema `$ref` entries. Those warnings are recorded, not suppressed or confused with workflow errors; this older validator is not a complete GitHub expression/runtime validator.

Additional explicit assertions passed for the exact triggers, one Ubuntu job, timeout, contents-only permissions, both full action SHAs, Node pin, npm-lockfile caching, credentials disabled, five npm commands in order, absence of custom secret expressions and absence of continue-on-error. Reviewed concurrency expression uses documented GitHub workflow/PR/ref contexts and never enters shell scripts. No package was added merely to validate YAML. Hosted workflow parsing, runner action execution, expression evaluation and cache lifecycle remain pending.

## Hosted acceptance / owner handoff

Local Git configuration has no remote section; no remote URLs/credentials were inspected or configured. Baseline files are now tracked (one existing human-controlled commit); this task leaves its work unstaged/uncommitted. No stage, commit, tag, reset or push performed.

To finish acceptance, a human must review/publish the workflow to the intended GitHub repository, enable Actions if needed, and observe the normal check run. Hosted runner/download/cache behavior must be recorded rather than inferred from local commands. If testing deliberate failures on GitHub, use an owner-approved disposable PR/branch: observe the lint/type check fail and restore those fixtures before merging. Local exit propagation is proven; hosted failure propagation is not yet observed. Repository branch-protection/required-check settings are external owner actions, not configured by this file or agent.

No live runtime, browser screenshots, DB/inquiry tests, deployment or P0 re-audit was attempted. ECHO-003 and existing D1–D8 gates remain unchanged.

## Files / stopping point

Created `.github/workflows/ci.yml`, `scripts/check-ci-failures.mjs`, `docs/CI.md`. Updated `README.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`. No .gitignore change was needed; build outputs were already excluded. Package/lockfile and application source unchanged.

Next action: ECHO-103 hosted verification. Next implementation recommendation after that gate and fresh authorization: **ECHO-104/105**, not begun here. Suggested human commit message: `ci(ECHO-103): add verified GitHub Actions checks`.
