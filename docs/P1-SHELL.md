# ECHO-107/108 and deferred ECHO-105 Header

Date: 2026-11-05. Status: **implementation/local verification complete;
acceptance partial**. ECHO-105 remains partial as requested. ECHO-107/108 also
remain unchecked because browser reload/paint and 320px keyboard acceptance have
not been demonstrated. No full homepage, content pages, inquiry, DB or ECHO-109.

## Delivered behavior and decisions

### Theme

- `ThemeInit` emits one static, trusted synchronous script in the head of all
  three document roots (locale, redirect entry, global 404). It applies
  `data-theme="light|dark"` before body content; `data-theme-mode` records the
  user's Light/Dark/System choice. The existing semantic palettes remain the
  only color source. No React provider, theme library or theme cookie required;
  locale pages remain prerendered.
- `echo_theme` localStorage accepts only `light`, `dark`, `system`. Missing or
  invalid values use System. System resolves the OS setting and listens for
  changes; explicit light/dark overrides ignore OS changes. Storage events keep
  tabs synchronized, including clear/removal. No PII is stored. When storage
  throws, changes still work for this document but cannot persist across reload.
- A single initializer/controller owns mode updates; `ThemeSelect` sends a
  validated event and uses `useSyncExternalStore` to observe it. Server/initial
  hydration always renders System with controls disabled; after hydration they
  reflect the bootstrapped mode without markup mismatch. `suppressHydrationWarning`
  is limited to html, whose theme attributes are deliberately changed pre-hydration.
- Bootstrap code stays out of the theme-control client module. The inline
  script contains no user-derived data, external request, eval or injected HTML.
  Before enforcing a future CSP, authorize its exact script hash or a properly
  supplied nonce in every document root. Do not weaken CSP with unsafe-inline.
  No CSP has been added/relaxed in this batch. With JS disabled or blocked, the
  readable CSS fallback is light; interactive appearance controls stay disabled.

### Header and navigation

- Server `Header({locale, path = "/"})` reuses Container, Link, Button and
  existing fonts/tokens. The current page passes the known root path; future
  pages must pass their equivalent app-relative path explicitly. Native locale
  links preserve lang/dir through document navigation. Language preference
  cookie writing remains ECHO-504, not part of this batch.
- Only Home and the three locale roots are currently implemented. Services,
  Work, About, Contact and Privacy are labeled planned text, never dead anchors,
  fake intake buttons or links to nonexistent pages. Future content tasks should
  deliberately replace those labels with real destinations. Text wordmark plus
  decorative coral dot is not a newly approved final logo.
- Desktop navigation at 80rem and above; mobile/tablet uses a native modal
  `<dialog>`, not an ARIA menu with invented arrow-key semantics. Native links,
  select and buttons retain normal keyboard behavior. The Header is static,
  avoiding sticky-overlay and anchor-offset issues. CSS uses logical properties,
  wrap-safe groups, opaque semantic surfaces and 44px control targets; no motion
  or hover-dependent content. Theme changes do not change its structure.
- Trigger exposes expanded/controls/haspopup. Opening focuses Close; the native
  modal supplies background inertness and Tab containment in supported browsers.
  Escape/cancel/Close and link activation dismiss; focus returns to trigger.
  When resizing to desktop, close and focus the visible brand instead of the
  hidden trigger. Body overflow is restored on close/unmount. Links are not
  prevented from navigating. No-script locale links remain available; Home is
  always the brand destination.
- Children are server-rendered navigation slots; clients receive only localized
  interactive labels, not all locale dictionaries. Button gained React 19
  ref-as-prop typing for reliable focus management. No global focus manager,
  focus-trap package, UI library or extra runtime dependency introduced.

## Actual verification

| Command/check | Result |
|---|---|
| Pinned jsdom 30.1.3 install, lifecycle scripts disabled | PASS; MIT, reviewed Node range supports installed Node 24.21.0. Dev-only DOM fixture dependency, 36 additional packages; lockfile registry provenance retained. |
| Locked `npm ci --ignore-scripts --no-audit --no-fund` | PASS, 445 packages. Existing unsupported ESLint 9 warning remains. |
| `npm run lint` | PASS, no warnings/errors |
| `npm run typecheck` | PASS |
| `npm test` | PASS, **46 tests in 5 files** |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | PASS; FA/EN/AR remain prerendered, existing experimental global-not-found flag warning |
| `npm run test:http` | PASS; owned loopback server stopped in finally |
| `npm run verify:reference` | PASS; originals/prototype unchanged |
| `npm audit --audit-level=high` | PASS, zero vulnerabilities |
| `git diff --check`, staged-diff review | PASS; no agent staging/commits/tags/push |

New tests cover the exact initializer's persisted light/dark/system state,
reload fixtures, live OS changes, invalid values, storage denial and cross-tab
events. DOM fixtures test hydration (individual select and full Arabic Header),
multiple synchronized selects, safely disabled controls if bootstrap is blocked,
safe locale URLs/current markers, non-link planned
labels, dialog open/focus/expanded/scroll behavior, Escape/cancel/Close/link close,
resize and unmount cleanup. Existing token/contrast/font checks remain intact;
Header CSS is also checked for literal colors/physical left/right layout rules.
Header/theme dictionary parity and nonempty strings are tested in all locales.

HTTP checks additionally verify Header/dialog markup and that the exact emitted
initializer is inside head, before body, on every locale root. That emitted code
is executed in isolated synthetic contexts for light/dark/system/default modes.
Existing redirects, document language/direction, noindex, equivalent locale links,
localized 404, spoof protection and reference non-exposure checks still pass.
This is not browser rendering or actual reload/paint validation.

Initial development failures: fixture anchors violated Next's lint rule (switched
fixtures to the shared native Link), Button lacked ref typing (added React 19
support), jsdom lacked native dialog methods (added explicit test doubles). These
were fixed; tests were not removed or disabled to obtain a pass.

## Browser evidence and remaining gates

Checked existing isolated Playwright at `/tmp/opencode/echo-p0-browser`; no
Chromium/Firefox executable found. Explicit sandbox-enabled Chromium launch
failed with missing Chromium/headless-shell executable. No new browser download
or system package installation attempted; no sandbox/security bypass used.

**No actual screenshots, manual keyboard/screen-reader, native Tab containment,
inertness, font shaping, 200% zoom, responsive or theme-flash approval.** jsdom
does not implement the browser top layer, layout or native dialog focus trap;
tests only emulate showModal/close events. VM initializer execution proves state
logic, not absence of a visible flash. Persian/Arabic labels still need native
review; D7 brand approval and ECHO-003 reference baseline remain outstanding.

Next validation: sandbox-enabled browser on FA/EN/AR, 320/375/768/1024/1440px,
light/dark/system/reload/OS-change/storage-denial, first paint, keyboard order,
Tab/Shift+Tab containment, Escape, close/link/resize focus restoration, scroll,
200% zoom and long labels. Capture screenshots and compare the immutable
prototype before ECHO-109 sign-off. This batch stops here.

## Files changed (this batch only)

- `README.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`, historical pointer in
  `docs/P1-PRIMITIVES.md`, new `docs/P1-SHELL.md`
- `package.json`, `package-lock.json` (jsdom dev dependency)
- `src/lib/{theme,theme-init}.ts`
- `src/components/layout/{header,mobile-nav,theme-init}.tsx`
- `src/components/ui/{button,theme-select}.tsx`
- `src/app/(entry)/layout.tsx`, `src/app/[locale]/layout.tsx`,
  `src/app/[locale]/(marketing)/page.tsx`, `src/app/global-not-found.tsx`
- `src/i18n/messages/{fa,en,ar}.json`
- `src/styles/{globals,tokens,header}.css`
- `tests/unit/{theme.test.ts,header.test.tsx,i18n.test.ts,tokens.test.ts}`
- `scripts/smoke-http.mjs`

Pre-existing CI/primitives changes were preserved. No original prototype/font
bytes, public contacts or business claims changed; no external services,
deployment, network/host configuration or Git publication operations.

Suggested human commit: `feat(ECHO-107,ECHO-108): add theme modes and accessible header`

Next recommended batch: browser acceptance/reference evidence, then ECHO-109
focused design preview (not a full homepage).
