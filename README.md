# Echo Devs — Website foundation

Implemented batch: **ECHO-101/102/106** only. Local development preview, not an approved public website. No full homepage, design system, theme/menu, inquiry API, database or deployment. Preview routes are `noindex, nofollow`.

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
npm test                          # six foundation unit tests
NEXT_TELEMETRY_DISABLED=1 npm run build
npm run test:http                 # starts/stops its own loopback production server
npm run verify:reference          # original ZIP safety/CRC/hash/byte checks
npm audit
```

`npm run start` serves the build on loopback only. Stop manually started servers when finished. Dependency lifecycle scripts are intentionally disabled during installation; packaged optional native binaries worked on this VM. Do not run global installers or install system dependencies speculatively. A new platform must verify native binaries rather than bypass isolation.

## Structure and boundaries

- `src/app/(entry)/`: dynamic locale-selection redirect and minimal document.
- `src/app/[locale]/`: allowlisted, prerendered locale document and `(marketing)` preview page; no business content copied from prototype.
- `src/app/global-not-found.tsx`: independent localized 404 document. Uses Next's documented **experimental** `globalNotFound` flag; HTTP-tested, upgrade-sensitive.
- `src/proxy.ts`: overwrites the internal locale header from the URL for error documents; does not negotiate or redirect explicit locale URLs.
- `src/components/layout/`: server-rendered language links, not a finished navigation system.
- `src/i18n/`: locale/configuration, typed FA/EN/AR dictionaries and server translation setup. No client dictionary/provider payload is needed yet.
- `src/content/`, `src/lib/{validation,db}/`: documented future boundaries, no invented records or backend code.
- `src/styles/`: build-time Tailwind and minimal readable preview CSS; ECHO-104 remains TODO.
- `tests/unit/`, `scripts/`: focused tests, owned loopback HTTP smoke and read-only reference checks.
- `design/reference/`: frozen originals and supplied ZIP/image, **never** in `public/` or production assets.

## Evidence and remaining gates

Read `AGENTS.md`, `SCOPE.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md` and latest `docs/P1-FOUNDATION.md`. Earlier P0 reports are historical evidence, not current tooling status.

ECHO-001 is verified: original archive/member hashes, CRCs and prototype byte comparisons pass. Original `screen.png` inspected at 442×1600. **ECHO-003 remains blocked/deferred**: no browser screenshots. Owner explicitly authorized this limited P1 batch despite that gap; no visual sign-off or launch approval implied. Actual baseline capture/comparison remains required before ECHO-109 approval/full-page replication.

Known tooling constraint: ESLint 9.39.5 is deprecated but is the compatible release line for the selected Next React/a11y plugins (which reject ESLint 10). Do not force peer upgrades. A narrow minimatch override addresses the transitive dev advisory; see the batch report for evidence and revisit on tooling updates. Final dependency audit reported zero vulnerabilities; not a security certification.

Agents must never stage, commit, tag or push. No deploys, host/network/security changes or real service operations without approval. Next recommended task is **ECHO-103**, not started here.
