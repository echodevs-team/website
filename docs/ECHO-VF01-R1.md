# ECHO-VF01-R1 — Targeted visual follow-up corrections

Task: **ECHO-VF01-R1 only** · Status: **PASS** for the copy correction and the
evidence-manifest fix; the Firefox GPU header check remains a **pending manual
test**, 2026-11-13

## Scope and baseline

Follow-up to `docs/ECHO-VF01.md`, covering the three items raised in the
independent review:

1. the About heading described an unverified team size;
2. the WebKitGTK captures cannot establish GPU-backed header blur behaviour;
3. the evidence manifest serialized malformed route URLs such as `/facontact`.

Baseline: `main` at `844d3cf`. Corrections committed as `a94fb57`. Not a
redesign: no page, section, component API, Canvas/API/DB, intake, `noindex`,
privacy, 404 or header-CSS change, and no deployment.

## 1. About copy no longer claims a team size

Team size has never been verified by the owner, so the copy could not state it.
Three headings and the adjacent collaboration paragraph changed in every locale.

| Locale | Before | After |
| --- | --- | --- |
| EN | "A small team organized around the problem" | "A team aligned around the problem" |
| FA | «تیمی کوچک، سازمان‌یافته حول مسئله» | «تیمی هم‌راستا برای حل مسئله» |
| AR | «فريق صغير يتنظم حول المشكلة» | «فريق يجمع خبراته لحل المشكلة» |
| EN (adjacent) | "We work with clients as a small, direct team." | "We work with clients as a direct team." |
| FA (adjacent) | «به‌عنوان تیمی کوچک و مستقیم با مشتری کار می‌کنیم.» | «به‌صورت مستقیم با مشتری کار می‌کنیم.» |
| AR (adjacent) | «نعمل مع العملاء كفريق صغير ومباشر.» | «نعمل مع العملاء بشكل مباشر.» |

The rest of the About page already avoided size, names, credentials and metrics;
a full scan of `src/` finds no remaining size claim. Layout, heading level,
eyebrow, badges and section order are unchanged, so the visual hierarchy is
identical — only the words changed.

**Regression guard:** `tests/unit/about.test.tsx` now scans every string in the
About content for nine unsupported size phrasings (`small team`, `small group`,
`small, direct`, Persian and Arabic equivalents) and asserts the exact neutral
heading per locale. It fails if the claim is reintroduced anywhere in that
content tree.

## 2. Header readability — Firefox is still a pending manual test

The current header has not changed since ECHO-VF01: 90% background fill,
`blur(16px) saturate(140%)`, `-webkit-backdrop-filter` plus `@supports` guarding
either property, and a 93% fallback where backdrop filters are unsupported.

Investigation result: this VM has **no Firefox and no Chromium**, and no GPU or
DRI device. Only WebKitGTK 2.52.6 exists, and under Xvfb it renders in software
mode, which does not rasterize `backdrop-filter`. The measured header-band
metrics therefore describe the opacity layer only. No CSS was changed, because
no confirmed defect was found — changing it on the strength of software
rendering would be speculation.

The check is registered as `MANUAL-FIREFOX-GLASS` (gate: technical, release
relevant, freshness-watched against `src/styles/header.css`,
`src/components/layout/header.tsx` and the contact form styles). The exact
procedure — light and dark, scrolled form, validation-error state, 320 and 375
widths, sticky header, open mobile drawer with focus handling, and the required
screenshot evidence — is in `qa/registry.json` and repeated owner-friendly in
`docs/QA-SYSTEM.md`. It stays **NOT_RUN** until a human records it on the
Fedora host; WebKitGTK captures are explicitly not accepted as its evidence.

## 3. Evidence manifest URL serialization

**Reproduced.** The previous harness built the record URL as
`origin + '/' + locale + route.lstrip('/')`. With `route = '/contact'` that
yields `http://127.0.0.1:49045/facontact`. The ECHO-VF01 manifest in
`test-results/echo-vf01-after-20261113-070429/manifest.json` still contains
`/facontact`, `/encontact` and `/arcontact`; that file was **not** rewritten.

**Fix.** URL construction moved into `scripts/evidence_manifest.py`:

- `page_path(locale, route)` keeps the locale segment and the route separator
  explicit, normalizes a missing leading slash and maps the `/contact-drawer`
  capture to the `/contact` document it photographs;
- `page_url(origin, locale, route)` joins origin and path without ambiguity;
- `source_revision(root)` records the tested revision and whether the tree was
  dirty;
- `evidence_root(root)` refuses a symlinked evidence directory outside the
  repository.

The harness now uses these helpers for every capture, including the drawer
capture, and records:

| Field | Meaning |
| --- | --- |
| `url` | Exact URL loaded for the capture. |
| `route`, `locale` | Route and locale segments. |
| `viewport` | `[width, height]`. |
| `theme` | `light` (the harness only captures light). |
| `engine` | `WebKitGTK <version>`. |
| `testedSourceRevision` | Full commit SHA that was running. |
| `worktreeDirty` | Whether tracked files were modified at capture time. |
| `documentationRevision` | `null` until a human records the commit; never guessed. |
| `phase` | `before` or `after`. |
| `file` | Screenshot path inside the run folder. |
| `scroll`, `scrollY` | Scroll state (`top`, `scrolled`, `drawer`). |

**Regression test.** `scripts/test_evidence_manifest.py` covers homepage paths,
marketing routes, a route without a leading slash, the drawer alias, a trailing
slash on the origin, rejection of empty or non-HTTP inputs, and an assertion
that no locale/route combination can produce `facontact`. All 15 Python tests
(the existing WebKit snapshot tests plus these) pass.

**New evidence only.** `test-results/echo-vf01-r1-after-20261113-130940/` was
captured from clean `a94fb57` with `--task ECHO-VF01-R1 --phase after --only
about`, so only the six About captures were regenerated. Its manifest shows
`testedSourceRevision: a94fb57172da7e74eb2d0759bb380d07c6946adc`,
`worktreeDirty: false`, and URLs `/fa/about`, `/en/about`, `/ar/about` at
1440×900 and 375×812. 39 checks passed.

Evidence bundle: `test-results/echo-vf01-r1-about-evidence.zip` (gitignored;
before/after captures, both manifests, metrics, URL regression table and
SHA-256 checksums).

## Verification

| Check | Result |
| --- | --- |
| `npm run lint` | pass, zero warnings |
| `npm run typecheck` | pass |
| `npm test` | 32 files / 328 tests pass |
| `npm run build` | pass |
| `npm run test:http` | pass |
| `python3 -m unittest discover -s scripts` | 15 tests pass |
| `npm run verify:reference` | pass |
| visual harness `--only about` | 39 checks, 6 captures, clean revision |

## Limitations

- GPU-backed blur, Firefox and Chromium behaviour, real screen-reader output and
  the Fedora host remain unverified here; they are recorded manual cases rather
  than implied passes.
- The harness captures light theme only. Dark-theme glass remains part of the
  manual Firefox procedure.
- The "before" images are reused from the ECHO-VF01 after-run because that is
  the last capture made with the previous copy; no screenshot was re-created to
  simulate a before state.
