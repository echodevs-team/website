# Echo Devs — Website foundation

Implemented foundation: **ECHO-101/102/104/106**, shared primitives and Header, Light/Dark/System appearance and responsive navigation. ECHO-105/107/108 browser acceptance and ECHO-103 hosted acceptance remain pending. Local development preview, not an approved public website. No full homepage, inquiry API, database or deployment. Preview routes are `noindex, nofollow`.

## Local setup (Ubuntu VM)

Node 24.x and npm 11.19.0; versions are pinned in `package.json`/`package-lock.json`. No environment variables or external font/service credentials are needed. `.env.example` documents that boundary.

```sh
npm ci --ignore-scripts
npm run dev                       # 127.0.0.1:3000 only
```

Open `/fa`, `/en` or `/ar`. `/` temporarily redirects by valid `echo_locale` cookie, then supported browser language, then FA. Language links use native navigation; setting/persisting a language preference is deferred to ECHO-504. Explicit locale URLs never follow a different cookie/browser preference.

```sh
npm run lint
npm run typecheck
npm test                          # locale, tokens, theme, primitives and DOM fixtures
NEXT_TELEMETRY_DISABLED=1 npm run build
npm run test:http                 # starts/stops its own loopback production server
npm run verify:reference          # original ZIP safety/CRC/hash/byte checks
npm audit
```

`npm run start` serves the build on loopback only. Stop manually started servers when finished. Dependency lifecycle scripts are intentionally disabled during installation; packaged optional native binaries worked on this VM. Do not run global installers or install system dependencies speculatively. A new platform must verify native binaries rather than bypass isolation.

## CI / before submitting changes

Use **Node 24.21.0 / npm 11.19.0** for parity with `.github/workflows/ci.yml`. The workflow runs on branch pushes, pull requests and manual dispatch, with one Ubuntu 24.04 job. Before submitting:

```sh
export CI=true NEXT_TELEMETRY_DISABLED=1
test "$(node --version)" = 'v24.21.0'
test "$(npm --version)" = '11.19.0'
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run typecheck
npm test
npm run build
```

To recheck failure propagation safely on this Ubuntu VM:

```sh
TMPDIR=/tmp/opencode node scripts/check-ci-failures.mjs
```

The helper copies only known source/config inputs to a disposable directory, links installed dependencies, confirms intentional lint/type errors exit nonzero with the expected diagnostics, then removes the copy. It does not modify project source. Outside this VM, omit the TMPDIR override to use the platform temporary directory.

CI caches npm downloads keyed by the lockfile, never node_modules or `.next`. It has read-only repository permissions, no custom secrets, no artifact upload or deployment. Both action versions are SHA-pinned. Local checks and negative tests pass, but **no hosted CI run is claimed**: no remote is configured. See `docs/CI.md` for evidence, limitations and human activation steps. Do not mark ECHO-103 accepted until hosted checks are demonstrated.

## Structure and boundaries

- `src/app/(entry)/`: dynamic locale-selection redirect and minimal document.
- `src/app/[locale]/`: allowlisted, prerendered locale document and `(marketing)` preview page; no business content copied from prototype.
- `src/app/global-not-found.tsx`: independent localized 404 document. Uses Next's documented **experimental** `globalNotFound` flag; HTTP-tested, upgrade-sensitive.
- `src/proxy.ts`: overwrites the internal locale header from the URL for error documents; does not negotiate or redirect explicit locale URLs.
- `src/components/layout/`: server Header/language links, mobile-dialog client island, container/footer and pre-paint theme script.
- `src/components/ui/`: shared primitives and native theme select; no UI framework dependency.
- `src/i18n/`: locale/configuration, typed FA/EN/AR dictionaries and server translation setup. No client dictionary/provider payload is needed yet.
- `src/content/`, `src/lib/{validation,db}/`: documented future boundaries, no invented records or backend code.
- `src/styles/`: build-time Tailwind, semantic light/dark tokens, local Vazirmatn, primitives and logical Header layout.
- `tests/unit/`, `scripts/`: focused tests, owned loopback HTTP smoke and read-only reference checks.
- `design/reference/`: frozen originals and supplied ZIP/image, **never** in `public/` or production assets.

## Evidence and remaining gates

Read `AGENTS.md`, `SCOPE.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md` and `docs/P1-SHELL.md` (latest batch), alongside the historical foundation/primitives reports. Earlier reports are not current tooling status.

ECHO-001 is verified: original archive/member hashes, CRCs and prototype byte comparisons pass. Original `screen.png` inspected at 442×1600. **ECHO-003 remains blocked/deferred**: no browser screenshots. Owner explicitly authorized this limited P1 batch despite that gap; no visual sign-off or launch approval implied. Actual baseline capture/comparison remains required before ECHO-109 approval/full-page replication.

Known tooling constraint: ESLint 9.39.5 is deprecated but is the compatible release line for the selected Next React/a11y plugins (which reject ESLint 10). Do not force peer upgrades. A narrow minimatch override addresses the transitive dev advisory; see the batch report for evidence and revisit on tooling updates. Final dependency audit reported zero vulnerabilities; not a security certification.

## Appearance and navigation

Appearance supports Light, Dark and System, with the selected mode stored as
`echo_theme` in localStorage (no personal data). System follows live OS changes;
storage-denied contexts still work in memory. A static inline head initializer
sets the palette before body content, and client controls hydrate from a stable
server snapshot. No theme cookie or dynamic rendering is required. If adding an
enforced CSP, authorize the exact initializer hash/nonce; do not add unsafe-inline
as a workaround. With scripts disabled, the readable default is light.

Only Home and the locale roots currently exist. Other primary navigation labels
are explicitly marked planned and are not clickable. No inquiry CTA pretends to
work. The mobile menu uses a native modal dialog, scroll lock, Escape/Close and
focus restoration; no-script locale links remain reachable. Desktop layout starts
at 80rem; the static Header does not overlay content. See `docs/P1-SHELL.md` for
API guidance and the browser verification gap. Native translations still need
owner review.

Agents must never stage, commit, tag or push. No deploys, host/network/security changes or real service operations without approval. Next: actual browser acceptance for ECHO-105/107/108 and reference capture, then ECHO-109's focused preview; hosted ECHO-103 validation remains owner-controlled.
