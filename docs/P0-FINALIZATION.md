# P0 follow-up and P1 handoff

**Historical report below. Latest update:** original archive/assets are now supplied and ECHO-001 passes; owner explicitly authorized ECHO-101/102/106 without ECHO-003 in the subsequent implementation request. That limited batch is implemented and verified; see `P1-FOUNDATION.md`. ECHO-003 remains deferred and no visual/launch approval is implied. Earlier missing-asset and proposed-exception statements describe the earlier inspection, not current state.

2026-11-04. Follow-up only; completed ECHO-002/004/005/006 audits were not rerun or rewritten. No P1 implementation, Git mutation, deployment, host/network/security changes or privileged installation.

## Readiness

**Architecture handoff ready; P0 acceptance gate remains open.** ECHO-001 is PARTIAL; ECHO-003 is BLOCKED. The initial static audit remains valid, but no archive provenance, original image comparison or actual browser screenshot evidence can be added. Owner baseline sign-off has not been supplied. Do not describe P0 as fully complete.

### Current acceptance evidence

| Task | State | Evidence / remaining acceptance |
|---|---|---|
| ECHO-001 | PARTIAL | Previously hashed extracted HTML/legacy design remain available. Requested `design/reference/original/cvecho.zip` is absent; even its parent directory is absent. Scoped project file discovery found no ZIP or PNG. No archive file list, CRC check, archive/member SHA-256 or byte comparison can be reported. |
| ECHO-002 | DONE, unchanged | Existing static inventory in P0-AUDIT. No duplicate audit performed. |
| ECHO-003 | BLOCKED | Actual browser attempt described below. No browser executable, screenshot or image comparison. Explicit P1 prerequisite/exception below. |
| ECHO-004 | DONE, unchanged | Existing claim/asset registry; no newly inspected original assets to classify. |
| ECHO-005 | DONE, unchanged | Approved planning direction and contrast-tested starting specification; final owner visual/identity approval remains D7. |
| ECHO-006 | DONE, supplemented | Git investigation and isolated-tooling limits now recorded; no framework/build/DB/CI validation implied. |

### Missing original assets

The requested archive path was checked directly, followed by a project-scoped file listing excluding Git/dependencies. Neither `cvecho.zip` nor `screen.png` exists in this workspace. No unrelated folders, host paths, history or private data were searched. No archive was downloaded, guessed or recreated.

Required next evidence, once the owner places the file at the stated path:
1. SHA-256 the archive; inspect central-directory filenames, sizes, compression and file modes before extraction. Reject traversal/absolute paths, symlinks, duplicates, unexpected executable content and excessive expansion; no blanket extraction.
2. Test ZIP CRCs and hash each member. Compare `code.html` bytes to both root and frozen HTML and legacy `DESIGN.md` bytes to `DESIGN.sahara.md`. Do **not** compare it to the intentionally superseded active DESIGN brief. If different, preserve both sources and explain rather than overwriting.
3. Preserve the actual `screen.png` and its hash under reference storage, inspect it as an image, record dimensions and compare to actual browser captures. Never infer its pixels from HTML or the earlier SCOPE description of ZIP contents.

No original image was opened: none was supplied at inspection time. The expected three-file archive list in SCOPE remains an assertion to verify, not archive evidence.

## Git initialization investigation

Read-only checks: `git status --short`, `git diff --stat`, `git diff --cached --stat`, `git rev-parse --show-toplevel`, `git symbolic-ref --short HEAD`, `git rev-list --all --count`, `git for-each-ref --format='%(refname)'`, local config **key names only**, sample-hook filenames and selected metadata timestamps. No configuration-value dump, user identity, remote URLs, credential files, shell history or reflog personal data accessed.

- Root is `/home/worker1/projects/echodevs`; HEAD is unborn `main`; zero commits and no refs. All project files are untracked; tracked/staged diffs empty. Existing files are not protected by recorded history.
- Local configuration keys are only `core.repositoryformatversion`, `core.filemode`, `core.bare`, `core.logallrefupdates`; `core.bare=false`, reflog updates enabled. **No local remote/origin section** exists. Global conditional configuration was not inspected, so no broader integration inference is made.
- `.git/HEAD` and `.git/config` birth/modify times are `2026-11-04 18:50:57 +0000`; `.git` has the same birth time and a later directory modification time. Initial prior-session Git check failed before the directory appeared. These are timestamps, not actor attribution or proof of a particular command.
- `.git/logs` is absent; hooks are named `*.sample` only. No commit/ref activity provides an actor trail. The initializer **cannot be determined from repository evidence**. Owner/editor/runtime action is possible but unproven. This agent did not initialize it.

Concern: there is no committed recovery baseline or remote backup, and all reference/assets/docs remain untracked. Absence of `.gitignore` is a **future P1 prerequisite**: add focused ignores for `.env*` except `.env.example`, node_modules, build/test artifacts and local DB files before dependencies/config arrive. Do not ignore canonical reference evidence just to hide it from review. Human review controls any staging/commit/remote setup. No reset, stage, commit, push or config change performed.

## Browser attempt and exact outcomes

Existing PATH browser checks and standard Playwright/Puppeteer cache checks found no usable existing browser. Chose isolated temporary tooling, not project app dependencies:

```sh
npm view playwright version scripts dependencies engines dist.integrity --json
npm view playwright-core@1.64.1 scripts dependencies engines dist.integrity --json
npm install --prefix /tmp/opencode/echo-p0-browser --ignore-scripts --no-audit --no-fund --package-lock=true playwright@1.64.1
```

Registry metadata showed Node >=20 and only `playwright-core@1.64.1` as dependency, no lifecycle scripts listed. Install **PASS**, two packages; lifecycle scripts disabled. The temporary lockfile records integrity. Inspected packaged `browsers.json`, download-host/install-deps references and CLI help before invoking only the browser installer:

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/opencode/echo-p0-browser/browsers \
  node /tmp/opencode/echo-p0-browser/node_modules/playwright/cli.js \
  install chromium --only-shell --no-remove --no-progress
```

**FAIL:** CDN request redirected to `storage.googleapis.com/chrome-for-testing-public/156.0.8078.4/linux64/chrome-headless-shell-linux64.zip` and timed out at 30 seconds. Installer retried automatically; the containing tool command exceeded its 120-second bound. No executable was installed (only `.links` in the browser directory). No repeated installer loop or mirror/security override.

Then called isolated Playwright `chromium.launch({headless:true, chromiumSandbox:true, timeout:15000})`, catching/reporting errors and closing a browser if launched. **BLOCKED:** executable missing at `.../chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell`. No browser ran, no listener was started, no screenshot was captured. No sandbox disabling or privileged install-deps. The need for system libraries remains **unknown until a browser is actually downloaded/launched**; there is no justified apt/sudo request yet. Do not install system packages speculatively.

External activity was limited to public npm metadata/package and browser-distribution requests, now authorized for minimal isolated browser tooling. No project source/data was uploaded, contacts visited or external services modified. Temporary tooling is outside Git and is not a reproducible production dependency decision. Later P1 browser tests should pin their own compatible version/lockfile rather than depend on this temporary folder.

### Owner-visible P1 prerequisite / proposed exception

**ECHO-003 stays unchecked.** Before ECHO-109 visual approval/full-page replication, provide a usable sandbox-enabled browser, the original archive/image and actual desktop 1440×1000 plus mobile 375×812 screenshots of unchanged reference HTML. Compare to `screen.png`, recording fonts/CDN readiness, browser/version, theme, viewport/DPR, motion/timing, console/network errors and actual display deltas. The broader viewport/theme/zoom matrix remains the later roadmap requirement; no P0 capture can imply those checks passed.

**Proposed exception, NOT owner-approved:** owner may explicitly authorize only the first foundation batch ECHO-101/102/106 while ECHO-001 provenance and ECHO-003 remain open prerequisites. ECHO-109 must not claim visual sign-off and full-page replication must wait for real baseline evidence. Without that acknowledgement or completed baseline/sign-off, P0 is not ready to hand over as an unqualified completed milestone. A request to finalize P0 is not evidence that the missing browser acceptance was waived.

## Architecture cross-check and focused clarifications

Reviewed the full ARCHITECTURE against SCOPE and ROADMAP; findings are design review, not compiled/integration validation.

| Topic | Assessment / action |
|---|---|
| App Router modules | Cohesive app/API/content/i18n/DB boundaries fit SCOPE §8. Clarified separate entry/locale root layouts with valid html/body; prior naked root page plus locale-root layout sketch was underspecified. ECHO-101/106 must validate actual framework conventions, invalid locales, global/localized 404s and metadata routes. |
| Server/client | Server marketing/data by default, small theme/menu/form client islands; server-only DB/env. No unnecessary state library, repository/service-class framework or visitor auth. |
| FA/EN/AR | Explicit indexable routes, locale validation, lang/dir, logical CSS, mixed-script isolation, key parity and equivalent slug switching fit §§5–6/P1/P5. Native Arabic/English review is still an owner prerequisite, not supplied by library choice. |
| PostgreSQL/inquiry | Strict authoritative validation, one JSON endpoint, durable commit-before-success and restricted operator readback fit §7/P2. Clarified short-lived InquirySubmission separate from Inquiry and rate-limit tables; no raw IPs or anti-abuse tokens in permanent inquiry rows. Constraint/transaction/race/failure tests still mandatory. |
| Abuse/idempotency | PostgreSQL atomic counters/unique keys avoid Redis/queues. Clarified expiry enforcement, keyed network hashing, attempt limits before replay lookup, bounded cardinality and cleanup maintenance requirement. Signed timing-token issuance is optional, not a new required subsystem. Thresholds/24h expiry are starting proposals, not approved traffic/retention facts. |
| Tests/browser | Existing unit/integration/real browser-to-DB plan fits roadmap. Browser download/CDN access and disposable PostgreSQL provisioning remain concrete prerequisites. Added sandbox-enabled launch and destructive-test database identity guards; no CI or E2E pass yet. |
| Dev/production | Guest is development-only; separate URLs/roles/test DB, no production fallback. Production build/container excludes references/test tooling/secrets. Host/provider/pooling/backup/cleanup schedule remains D4/P2/P6 work. |
| A11y/performance/security | Source rendering plus minimal JS, semantic contrast, reduced motion/focus/mobile menu, request bounds/origin/PII protection and least privilege fit scope. CSP/theme-init strategy must be validated without accidentally forcing all marketing routes dynamic via nonces; prefer a static-compatible script hash when supported. No WCAG/Lighthouse/security certification is implied. |

No material scope conflict or need for new infrastructure. Main complexity risks are premature signed-token endpoints, notification abstractions, overgeneralized service layers and unbounded rate buckets; none should be added in the first batch. Exact framework/library versions, phone-validation method, migration execution/cleanup workflow and browser/DB availability remain implementation-time checks, not hidden established capability.

## Owner decisions and precise first batch

D1–D8 remain unanswered: verified contacts/domain; portfolio permissions/evidence; team identity; hosting/budget; lead reader/readback/optional inbox; privacy/retention/analytics; final logo/copy/visual review; root locale and native translation review. New evidence blockers are the missing original upload and unavailable browser binary. No business facts invented.

After baseline/sign-off is completed **or** the narrow exception is explicitly accepted:

1. **ECHO-101:** validate current stable package engines/peers; minimal Next/TS/Tailwind scaffold, one npm lockfile, placeholder-only `.env.example`, focused `.gitignore`, documented actual local scripts. No DB feature, marketing-page implementation, remote workflow publication or production origin.
2. **ECHO-102:** establish only immediately used route/components/content/i18n/lib/tests boundaries, not empty speculative abstractions. Keep all frozen references outside shipped assets.
3. **ECHO-106:** basic FA/EN/AR routing/dictionary skeleton, FA fallback, correct document direction, route-safe locale links and validated root/error behavior. No full copy/content/homepage build.

Batch evidence: clean install/build, actual lint/typecheck/unit scripts and relevant tests, each locale's rendered lang/dir, valid root redirect/unknown locale behavior, and browser smoke if tooling is available. If unavailable, report affected acceptance partial; do not call the P1 shell complete. ECHO-103 CI and ECHO-104/105 tokens/primitives follow; ECHO-107/108/109 follow those. No P1 task began here.

## Final verification

Focused read-only handoff checks **PASS**: only ECHO-002/004/005/006 checked, ECHO-003 explicitly blocked, proposed exception not approved, evidence documents present, original extracted reference hashes and root HTML unchanged. Archive presence check **false**. Final Git status still all untracked; tracked/staged diff stats empty. Completed static audit, contrast calculations and app tests were not rerun. No build/DB/browser/CI pass is claimed.

Files changed in this follow-up: `README.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `design/reference/README.md`; created `docs/P0-FINALIZATION.md`. No prototype/reference source file modified. No Git mutation.

Suggested human commit message: `docs(ECHO-006): clarify P0 blockers and P1 handoff`
