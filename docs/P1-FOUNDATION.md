# ECHO-001 closure and first P1 batch report

Date: 2026-11-04. Tasks: **ECHO-001, ECHO-101, ECHO-102, ECHO-106 — DONE**. ECHO-003 remains **BLOCKED/DEFERRED**. Stop after this batch; no ECHO-103 or other later task implemented.

## Owner-authorized exception

The owner explicitly requested: “Keep ECHO-003 blocked/deferred until actual browser screenshots can be captured” and “Record an explicit owner-authorized exception for starting this limited P1 batch without ECHO-003,” authorizing only ECHO-101/102/106 in this session. This supersedes the earlier **proposed, unapproved** exception in P0-FINALIZATION. It does not approve later batches, full design, final translations/identity, production content, external services or launch.

No browser download was retried this batch; the earlier unavailable Chromium binary remains the recorded limitation. Original-image inspection and HTTP response checks are not browser screenshots. Desktop/mobile reference captures and comparison remain required before ECHO-109 approval/full-page replication. P0 is not retroactively marked fully signed off.

## ECHO-001 acceptance

Original inputs are now supplied at `design/reference/original/`. Read-only verification performed before implementation; no ZIP extraction or source rewriting was needed.

| File | Size (bytes) | SHA-256 |
|---|---:|---|
| cvecho.zip | 264534 | `658daaf9def5badf3b9c061f8e669d0980b91cae6fe76975324def7f01bd050b` |
| code.html | 79104 | `442209f1ddad359afd32ec57ef89d280fcd60a88b06b76b22adb854f4b1a8a36` |
| screen.png | 248985 | `ad99ac9ebce18e484454baa17de048f9f51753e0d77055936126185800889731` |
| DESIGN.md | 1441 | `0947699de006092828e36745efd0478652e7f6568694a524fd22f030b8431fee` |

- ZIP contains exactly `code.html`, `screen.png`, `DESIGN.md`; no duplicate, traversal, absolute-path or symlink entries. Declared total expansion below 10 MB; CRCs pass. Compressed member sizes: 16,383 / 247,009 / 836 bytes respectively.
- Each archive member equals its supplied extracted original. HTML equals both project-root and frozen reference HTML. Legacy DESIGN equals `DESIGN.sahara.md`, not the intentionally replaced active brief.
- Original image opened and inspected: **442×1600 PNG**, warm light background, coral controls, hero/technical card, capability strip, three-column service/demo groups, benefits, process, contact and footer. It shows a scaled multi-column composition; image dimensions do not prove a CSS viewport or mobile rendering. No new claims verified from its copy.
- Original four input files set read-only (0444). This prevents accidental edits, not tampering or cryptographic provenance guarantees. `original/SHA256SUMS` and read-only `scripts/verify_original.py` make the checks repeatable. Inputs remain untracked until human review; no agent staging/commit.
- HTTP checks prove `/code.html` and `/design/reference/code.html` are not served by Next. Seven inspected build runtime trace manifests contain no reference paths. No references placed in `public/`.

## Delivered foundation

**ECHO-101:** minimal Next App Router/strict TypeScript/build-time Tailwind app, one npm lockfile, placeholder-only `.env.example`, focused `.gitignore`, actual lint/typecheck/unit/build/start/smoke scripts and README commands. Local servers bind to 127.0.0.1. No required env values, external fonts or service calls; no scaffolder/lifecycle installer executed.

**ECHO-102:** routes, server layout component, content, i18n, validation/DB boundary notes, styles and tests separated. No ORM, validator, query client, API, schema, migrations, empty service interfaces, CMS or infrastructure added. Future-only boundaries are README notes, not pretend implementations.

**ECHO-106:** explicit FA/EN/AR routes, typed dictionary shape/key coverage, FA fallback, RTL/LTR document attributes, natural-language preview labels and named native language links. `/` uses valid remembered `echo_locale` cookie then weighted supported Accept-Language then FA, 307 with no-store. Explicit locale URLs ignore preference overrides. Cookie-writing/persistence and full-page translations stay ECHO-504/P5 work; no false claim of native-language review.

Locale home pages are **prerendered**; negotiated root and 404 are dynamic. All preview pages are noindex/nofollow, explicitly not a functioning public inquiry site. Server components translate content; no client provider/dictionary payload or client-side state library needed. Minimum readable CSS is not the ECHO-104 design system, theme implementation or approved visual preview.

### Framework 404 finding and final decision

The initial throw-based catch-all/metadata not-found arrangement produced 404 error-shell HTML without `lang/dir` in actual production HTTP checks. A shared-root trial and request-order adjustments did not solve it and were removed; no failed layout experiment remains in source.

Final: retain approved separate entry/locale roots, use `generateStaticParams` + `dynamicParams=false`, and route all unmatched paths to the independent `global-not-found` document. `src/proxy.ts` overwrites the internal locale header from an allowlisted URL prefix, never trusts the caller's header, and does not redirect explicit locale pages. Only error rendering reads that request header. The documented **experimental `globalNotFound`** API is an explicit upgrade-sensitive trade-off. Final HTTP tests verify actual `<html>` and `<h1>` markup, not text that appears only in hydration scripts; status/copy/direction and spoofed-header checks pass. Future detail-page `notFound()` handling should be tested again when real content routes are added.

## Dependency compatibility and safety

Registry metadata and official Next layout/not-found plus next-intl App Router/error-file docs reviewed before selection. Verified installed top-level versions:

| Tool | Version |
|---|---|
| Node / npm | 24.21.0 / 11.19.0 |
| Next / next-intl | 16.4.5 / 4.14.9 |
| React / React DOM | 19.3.1 / 19.3.1 |
| TypeScript | 5.9.3 |
| Tailwind / PostCSS integration | 4.3.4 / 4.3.4 |
| PostCSS | 8.5.32 |
| ESLint / Next config | 9.39.5 / 16.4.5 |
| Vitest | 5.1.0 |

Next declares Node >=20.9; Vitest supports Node 24. TypeScript 7 was not selected because typescript-eslint declares `<6.1`. ESLint 10 was not forced: Next's selected React/a11y plugins declare ESLint 9 support, not 10. **ESLint 9.39.5 is deprecated/unsupported per npm**, an unresolved tooling-maintenance limitation to revisit with the next compatible plugin update. No peer bypass/legacy-peer-deps used.

Install metadata showed install scripts on optional watcher/SWC/fsevents packages; all dependency lifecycle scripts were disabled with `--ignore-scripts`. Optional prepackaged native binaries worked on this Ubuntu guest; no privileged/global packages. Lockfile resolved package hosts are the public npm registry. Exact transitive versions/integrities are in the lockfile; reviewed registry requests did not upload project contents.

Initial full audit found **8 moderate dev-only advisory paths** through typescript-estree's minimatch 10 dependency; production-only audit was already zero. Did not run the suggested breaking `npm audit fix --force`. Applied a **scoped** override of `@typescript-eslint/typescript-estree > minimatch` to 11.0.4 after checking its exports/Node range and parser call site (`minimatch(path, pattern, {dot:true})`). Three matching API compatibility cases and final lint/type/build pass. This is outside the parent's original major range; revisit/remove when upstream fixes it. Final full audit: **0 vulnerabilities**. This is dependency advisory evidence, not a full security review.

## Actual checks and results

| Check | Result |
|---|---|
| ZIP CRCs/member/hash/original consistency + original read-only modes | PASS; repeatable `npm run verify:reference` |
| Lockfile install `npm ci --ignore-scripts --no-audit --no-fund` | PASS, final 409 packages; no lifecycle scripts. Repeated fresh node_modules install uses existing package cache, not a claim of an empty-cache/offline-machine install. |
| `npm run lint` | PASS, zero lint warnings/errors |
| `npm run typecheck` | PASS, `next typegen && tsc --noEmit` |
| `npm test` | PASS, 1 file / **6 tests**: locale validation, direction, negotiation/precedence, fallback/quality, safe equivalent paths, dictionary parity/nonempty values |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | PASS; final additional build after deleting only generated `.next` also PASS, no existing build cache. Three locale pages prerendered. |
| `npm run test:http` | PASS against own production loopback process: three localized routes/lang/dir/rendered heading/noindex/links; five redirect cases/no-store; explicit locale preference immunity; three localized nested 404s; unknown locales/reference paths 404; forged locale header overwritten. Server stopped in finally. |
| Targeted minimatch API compatibility | PASS, three parser-style cases |
| `npm audit --audit-level=high` | Final PASS, **0 vulnerabilities** |
| Status/ignore/runtime trace review | PASS: intended eight task boxes only; dependencies/build/local env ignored but `.env.example` visible; references absent from seven runtime traces; no staged diff |
| Browser screenshots, manual keyboard/zoom/native-script QA, Lighthouse/axe | NOT RUN; ECHO-003 deferred; HTTP tests do not replace browser QA |
| DB/inquiry integration, CI/deploy | NOT RUN / intentionally not implemented |

Failures during development: first lockfile-generation attempt hit the 120-second tool limit (no lock created), bounded registry retry succeeded; initial typecheck found an overly broad locale type; initial 404 HTTP tests failed and exposed the error-shell behavior; full dependency audit found the moderate dev chain. These were addressed as described, with final checks passing. No failed meaningful test was removed or weakened to claim success. The final architecture uses routing-level 404s rather than the failed throw-based path, while retaining the same 404 status/document assertions.

## Files changed in this batch

Created:
```text
.gitignore
.env.example
package.json
package-lock.json
tsconfig.json
next-env.d.ts                       # generated/maintained by Next
next.config.ts
postcss.config.mjs
eslint.config.mjs
vitest.config.ts
src/proxy.ts
src/app/(entry)/layout.tsx
src/app/(entry)/page.tsx
src/app/[locale]/layout.tsx
src/app/[locale]/(marketing)/page.tsx
src/app/global-not-found.tsx
src/components/layout/language-links.tsx
src/i18n/config.ts
src/i18n/messages.ts
src/i18n/messages/{fa,en,ar}.json
src/i18n/request.ts
src/i18n/server.ts
src/i18n/types.d.ts
src/styles/globals.css
src/content/README.md
src/lib/db/README.md
src/lib/validation/README.md
tests/unit/i18n.test.ts
scripts/smoke-http.mjs
scripts/verify_original.py
design/reference/original/SHA256SUMS
docs/P1-FOUNDATION.md
```

Updated: `README.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, historical-report pointers in `docs/P0-AUDIT.md` and `docs/P0-FINALIZATION.md`, `design/reference/README.md`. Supplied original archive/three extracted inputs only had read-only permission changes; bytes unchanged. Root prototype, legacy reference and active DESIGN unchanged. `scripts/audit_reference.py` unchanged. No `.git` configuration/history changes.

All project files remain untracked, no staged changes; Git cannot provide a historical before/after diff. Source/configs, scoped status, ignore behavior, integrity checks and runtime traces were reviewed instead. Generated node_modules/.next remain ignored. No agent stage, commit, tag, push, deployment, external service modification or host/network/security change.

## Remaining work / stop

- ECHO-003 actual browser baseline, visual/native-language review and final D7 sign-off remain open. The owner exception is only for this completed batch.
- D1–D8 remain unresolved for their later stages; no domain/contact/case/team/legal/operational facts invented.
- Experimental global 404 API, ESLint 9 deprecation and scoped major-version dev override require future upgrade attention; no known audited dependency vulnerability remains.
- No theme/mobile menu/design primitives/CI/full pages/inquiry/DB. Do not call the full P1 exit gate complete.

**Next recommended task: ECHO-103**, subject to the next authorized batch; do not start automatically. Suggested human commit message: `feat(ECHO-101): scaffold trilingual Next.js foundation`
