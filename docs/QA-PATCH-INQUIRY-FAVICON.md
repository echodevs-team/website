# QA patch — inquiry required fields and favicon

**Date:** 2026-11-12 · **Status:** implemented and locally verified; browser pixel
review not repeated. Scope is limited to the three confirmed Chromium-review defects
D1–D3. D4–D8 remain deferred. `design/reference/code.html` was not modified.

## D1 — empty required fields showed the contact message

**Root cause.** `InquiryCopy.required` held the either/or contact rule (“Provide an
email address or international phone number”) and the form reused it for every
`required` code. Blank `fullName`/`description` therefore explained the wrong
requirement.

**Fix.** The dictionary now separates:

- `required` — generic localized “This field is required.” for blank required inputs.
- `contactRequired` — the existing contact-required guidance.
- `invalid` — unchanged length/format message.

`src/lib/validation/inquiry.ts` still returns the stable `required`/`invalid` codes and
still shares one schema between client and server. The form maps `email: "required"`
(the either/or rule) to `contactRequired`; all other `required` codes use the generic
message. The error summary and per-field errors use the same mapping, so late server
field errors render identically. No API payload, database, idempotency, rate-limit or
security behavior changed.

**Regression coverage:** `tests/unit/inquiry-validation.test.ts` (FA/EN/AR blank vs
malformed classification) and `tests/unit/inquiry-form.test.tsx` (FA/EN/AR summary and
field messages, including malformed nonempty values).

## D2 — required fields were not identified visually

**Fix.** Required controls keep native `required` semantics and now render a localized,
visible marker inside the associated `<label>`: a coral `*` (`aria-hidden`) plus the
localized “required” word (`copy.requiredField`). Only `fullName` and `description` are
marked; optional controls stay unmarked. Native `required` already exposes the
accessibility required state, so no redundant `aria-required` is added. The existing
label/`aria-describedby`/`aria-invalid` error wiring and form composition are unchanged.
The marker uses the existing error/action palette (Coral & Charcoal) and the existing
`ui-field-required` styles.

**Regression coverage:** `tests/unit/primitives.test.tsx` (indicator only for required
controls, native attribute preserved) and the FA/EN/AR form test; the production smoke
test also verifies two localized markers and two native `required` attributes per
rendered locale.

## D3 — missing favicon

**Fix.** Added `src/app/icon.svg` (the approved three-rule/dot brand mark on the charcoal
tile, 32×32 viewBox, coral accent) and a 648-byte `src/app/favicon.ico` 32×32 fallback.
Next.js file conventions emit both links and serve both assets; no dependency or image
generation tool was introduced.

**Evidence:** production build lists `/icon.svg`; `/favicon.ico` and `/icon.svg` return
200 with `image/x-icon` and `image/svg+xml`. All three localized homepages, a
representative services/work/detail page and localized 404 documents contain both
`<link rel="icon">` tags. The entry `/` redirects and has no document of its own.
Covered by `tests/unit/favicon.test.ts`, `scripts/smoke-http.mjs`, and a manual loopback
curl of the production build.

## Verification actually executed

- `npm run lint` — PASS, zero warnings.
- `npm run typecheck` — PASS.
- Focused Vitest (inquiry validation/form/client, primitives, favicon) — PASS,
  **58 tests / 5 files**.
- `npm test` — PASS, **163 tests / 18 files**.
- `npm run build` — PASS; all existing routes generated and `/icon.svg` emitted.
- `npm run test:http` — PASS for FA/EN/AR pages, services, work, nine concept details,
  localized 404s, redirects, disabled preview API, favicon links/assets and required
  markers. Owned loopback server stopped.
- `git diff --check` — PASS.

PostgreSQL integration tests were not rerun: validation codes, schema, persistence,
idempotency, rate limiting and server behavior are unchanged; only display mapping and
localized copy changed. No browser executable was invoked and no new screenshots are
claimed.

## Deferred

D4–D8 remain deferred and untouched. No staging, commit, tag, push or deployment was
performed. ECHO-404 was not started.

## Suggested human commit

`fix(ECHO-306): correct required-field messages, mark required fields and add favicon`
