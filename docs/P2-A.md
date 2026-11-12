# P2-A — persistent inquiry backend (2026-11-07)

**Historical batch evidence.** Current form/abuse behavior is in `P2-B1.md`; current operations/commands are in `INQUIRY-OPERATIONS.md` and `P2-B2.md`. In particular, migrations now use separate `.local/dev-pg/owner.env`, not the app environment shown in the original batch commands below.

## Task mapping / stop boundary

- **ECHO-201–204 DONE locally:** private PostgreSQL development setup, versioned migrations/scoped app role, constrained schema/indexes, shared validation and transactional POST API. Verified acceptance evidence below; no deployment or hosted CI claim.
- **ECHO-206 PARTIAL:** exact Origin/JSON/body/timeout gates, empty honeypot and atomic shared **global** attempt limit. Trusted network identity/proxy rules, per-network limits, timing signals and traffic tuning remain P2-B/release work. The global cap is not adequate standalone public-launch protection.
- **ECHO-207 PARTIAL:** backend concurrency, conflict, expiry and lost-acknowledgement behavior tested; UI double-click, draft/retry and browser network scenarios remain.
- **ECHO-210 PARTIAL:** actual PostgreSQL and production HTTP integration tests implemented/run; browser-to-DB mobile E2E and CI integration are not complete.
- **ECHO-205/208/209 not implemented:** homepage controls unchanged/disabled; test owner readback only, no operational readback command, notifications or external integration. D5/D6 operational/privacy decisions remain open. ECHO-306 conversion acceptance remains partial.

## PostgreSQL decision and commands

No installed `psql`, `postgres`, `initdb`, `pg_ctl`, Docker or Podman command; no known PostgreSQL installation/container sockets found. Chosen setup: real **PostgreSQL 18.6**, unprivileged, project-local, **Unix socket only** (`listen_addresses=''`); no TCP database port, system package, container, host/network/security change or persistent service.

Binary tooling: pinned **dev-only** npm `@embedded-postgres/linux-x64@18.6.0-beta.19`, from leinelissen/embedded-postgres (Zonky-derived binaries). npm wrapper has a prerelease version; executable reports PostgreSQL 18.6. This is an isolated VM fixture, **not approved production database distribution**. Native library security is not assessed by npm audit. Current setup targets Linux x64; other platforms are unverified. Application dependencies are stable `pg@8.23.1`, `zod@4.6.7`, `server-only@0.0.1`, plus dev `@types/pg@8.23.1`. No ORM is needed for this small SQL slice.

Registry metadata, package lifecycle code, binary exports and library alias manifest were reviewed. Install used `--ignore-scripts`; the reviewed package-local symlink hydration was tested once. The local helper recreates only manifest aliases confined to this package. It never downloads/executes a standalone installer. Dependency lockfile pins downloads/integrity.

```sh
npm ci --ignore-scripts
npm run db:dev               # foreground PostgreSQL; Ctrl-C stops it
# separate terminal:
npm run dev:inquiries        # Next loopback; API STILL disabled
```

`.local/dev-pg/` contains persistent **development-only** data, private socket/log and generated `app.env` (0600). No existing `.env` file is overwritten. Application role uses a generated SCRAM password. The migration owner uses local trust **only inside the OS-user-private socket directory**; this is not production authentication. No TCP authentication path is accepted. App credentials rotate when restarting this helper; restart Next as well. The HMAC digest key is retained in private `digest.key` across restarts so active retries remain valid. Never print these files or use production secrets/data here.

Automatic migrations run before the helper announces readiness. Explicit rerun/cleanup while that cluster runs:

```sh
node --env-file=.local/dev-pg/app.env scripts/migrate.mjs
node --env-file=.local/dev-pg/app.env scripts/cleanup-submissions.mjs
```

`npm run db:migrate` requires explicitly provided `MIGRATION_DATABASE_URL`; it never falls back to the app URL. `npm run db:cleanup` requires `DATABASE_URL` and deletes only expired replay metadata. Run cleanup daily during continuing local API experiments. A production maintenance schedule is **not** installed/verified; it must be selected with hosting. Do not reset/delete a development database automatically. Migration recovery is transaction rollback on failure/checksum refusal; subsequent changes use new numbered SQL, not edits to applied history. Backups/restoration/rollback for valuable data remain P6 work.

`npm run test:inquiries` creates a fresh unique `.local/test-pg-*` cluster and `echo_test` database, independent of persistent `echo_dev`. It overrides inherited DB settings, guards database/socket identity before destructive fixtures, stops PostgreSQL and removes **only its own** directory in `finally`. No real customer data is used. It does not reuse/reset the development or any external database. The plain command skips the production-HTTP test, which needs a build:

```sh
npm run build
npm run test:inquiries -- --http
```

The HTTP fixture starts/stops its own `127.0.0.1` Next production server. No browser or external listener is involved. All servers started for this batch were stopped. Persistent empty dev data/config are retained, ignored by Git and ESLint; disposable test clusters were removed.

## Schema / migration

`db/migrations/001_inquiries.sql`, applied transactionally by `scripts/migrate.mjs` under an advisory migration lock. `schema_migrations` records version and SHA-256; reruns preserve rows; modified applied SQL is refused.

- `inquiries`: generated UUID; created/updated timestamps; `full_name`, optional email/phone (at least one); stable service; optional budget/timeline; description; locale/source page; default `new` status. Contact/enum/length/source constraints; created-at and status indexes. No soft-delete or consent fields without an approved policy. Future status changes must maintain `updated_at` (there is no status update path in this batch).
- `inquiry_submissions`: UUID key, keyed payload digest, inquiry FK with delete cascade, 24h expiry; expiry index. Contains no contact fields or raw IP. Purging an inquiry also removes its replay metadata.
- `inquiry_rate_limit`: one `global` key, window timestamp and saturated counter; bounded row cardinality. No permanent network identifiers.

App role: non-superuser, no role/database creation or schema DDL; inquiry **INSERT only, no inquiry SELECT/UPDATE/DELETE**; scoped submission metadata CRUD and bucket SELECT/INSERT/UPDATE. Migration history is inaccessible. `echo_owner` is migration/test readback identity; no operator handoff is claimed. Production role provisioning/credential management is separate work.

## API contract

Only `POST /api/inquiries` is exported, Node runtime. **Disabled by default**: `INQUIRIES_ENABLED=false` returns 503 without touching storage. Enabling it for a synthetic local test requires explicit `true`, `DATABASE_URL`, exact HTTP(S) `INQUIRY_ORIGIN` (no trailing slash/path), and an independent random `INQUIRY_DIGEST_SECRET` of at least 32 characters. The helper intentionally does not enable it. Never use this switch to launch before remaining gates pass.

Headers: exact `Origin`, `Content-Type: application/json` (optional UTF-8 charset), random UUID `Idempotency-Key`; no content encoding, no permissive CORS. No missing-Origin exemption for scripts/proxies.

JSON input (unknown keys rejected):

| Field | Contract |
|---|---|
| `fullName` | trimmed, 2–120 UTF-16 code units; Unicode/join controls preserved, no line/control characters |
| `email` | optional valid email, trimmed, <=254; empty means absent |
| `phone` | optional, <=80 before normalization; FA/AR digits → ASCII; spaces, parentheses, dots/dashes removed; `00` → `+`; final international `+`, nonzero leading digit, 7–15 digits |
| `service` | required: `website`, `custom_software`, `ai_automation`, `not_sure` |
| `budgetRange` | optional: `not_sure`, `small`, `medium`, `large`; internal categories, no price promises |
| `timeline` | optional trimmed 1–120, separate from budget |
| `description` | trimmed 20–5000 UTF-16 units, paragraphs allowed, NUL/unsafe controls rejected |
| `locale` | `fa`, `en`, `ar` |
| `sourcePage` | only `/<locale>` or `/<locale>/contact` matching supplied locale |
| `website` | optional honeypot, empty literal only; default empty |

At least one contact is required; if both are supplied, both must validate. Phone validation is international **format validation**, not proof that a number exists/belongs to someone; no country assumption/forced Iran pattern. Source URLs have no arbitrary path/query/origin. Privacy consent is not invented; D6 must resolve it before UI/release.

Stream reads enforce **32 KiB total**, regardless of Content-Length, and a **5s total read deadline** with cancellation. Invalid UTF-8/JSON, oversized values and mismatching source/locale are rejected before inquiry writes. Names/text are never interpolated into SQL/HTML.

| Status | JSON / meaning |
|---|---|
| 201 | `{reference: UUID, replayed: false}` — confirmed PostgreSQL COMMIT |
| 200 | `{reference: UUID, replayed: true}` — same active key and normalized payload, no new inquiry |
| 400 | `invalid_json`, `invalid_submission_key`, or `validation_failed` plus allowlisted field codes `invalid|required` |
| 403 | `origin_refused` |
| 408 / 413 / 415 | `request_timeout` / `too_large` / `unsupported_media_type` |
| 409 | `submission_conflict` — same active key, changed normalized payload |
| 429 | `rate_limited`, conservative `Retry-After: 600` |
| 503 | `unavailable`; storage/commit/config errors never success; storage errors include `Retry-After: 30` |

Errors use `{error: code, fields?: {...}}`, not raw exception/SQL/payload values. Every handled response has no-store, nosniff and a generated opaque `X-Request-ID`. There is no GET/list/detail endpoint; Next returns 405 for GET and 404 for unknown reference routes.

Persistence: autocommitted atomic global attempt upsert (30 valid submissions/retries/conflicts per 10min), then transaction with per-key advisory lock. Active digest match replays; mismatch conflicts. Expired metadata is replaced while prior inquiry remains. Unique key/FK and inquiry insertion are committed together. Synchronous commit enabled; pool max 4, connect/statement/lock/query/idle-transaction timeouts bounded. Failed/uncertain transaction discards the connection and returns 503; a same-key retry resolves a possible committed-but-unacknowledged write. Different keys may intentionally create repeated inquiries; this is not permanent content deduplication or forever exactly-once delivery.

No payload, DB exception, credential, idempotency key or raw IP is logged by application code. Local PostgreSQL disables statement/parameter logging and detailed error rows; fixture logs are checked for synthetic PII before deletion. Production provider/audit logging must be configured independently; npm/fixture checks do not establish production privacy.

## Actual verification

- Focused validation: **25 PASS**. Initial real PostgreSQL suite: **13 PASS**; expanded focused DB suite **15 PASS**, with HTTP intentionally skipped before build.
- Final lint/typecheck: **PASS**. Initial test-helper UUID inference error and unused-import lint warning were corrected before final checks.
- Final unit suite: **80 PASS / 7 files**, including existing homepage/locale/theme/navigation regression tests.
- Final production build: **PASS**, existing localized static pages plus dynamic POST API. Existing experimental global-not-found flag remains.
- Final `npm run test:inquiries -- --http`: **16 PASS / 2 files**, actual PostgreSQL 18.6 and actual loopback Next HTTP. Covers repeat migrations/checksum drift, indexes/DB constraints, committed Unicode readback by test owner, application privilege/authentication denial, expired-metadata cleanup, concurrent same-key writes, changed-payload 409, expiry/repeat intent, parameterized SQL-looking text, invalid/oversize/streamed/stalled requests, origin/config refusal, actual deferred COMMIT failure/rollback, missing socket connection failure, injected lost acknowledgement **after a real COMMIT**, shared global attempt/expiry behavior, HTTP read refusal and safe storage failure. Lost-ack injection is not a real network-partition/browser test.
- Database fixture log privacy check: **PASS**; development setup/restart/private permissions and preserved digest-key file: **PASS**; no remaining postmaster PID after shutdown.
- Existing production HTTP locale/dir/theme/section/404/disabled-form checks plus default-disabled API GET/POST checks: **PASS**; server stopped.
- Original ZIP/reference verification: **PASS**. `npm audit`: **0 vulnerabilities** (does not scan native PostgreSQL libraries). `git diff --check`: **PASS**; no staged files/commits/tags/pushes.

No browser tests, mobile success state, screen-reader/form focus review, hosted CI run, production database/role/proxy validation, backup restore, operator access handoff or public traffic/load/security sign-off occurred. Homepage HTML/CSS/form were not modified in P2-A. No notification, admin/dashboard, deployment or external integration.

## Files changed by P2-A

`.env.example`, `.gitignore`, `package.json`, `package-lock.json`, `eslint.config.mjs`; `db/migrations/001_inquiries.sql`; `scripts/{local-postgres,migrate,cleanup-submissions,test-inquiries,smoke-http}.mjs`; `src/app/api/inquiries/route.ts`; `src/lib/db/{client.ts,README.md}`, `src/lib/validation/{inquiry.ts,README.md}`, `src/lib/inquiries/{store,handler}.ts`; `tests/unit/inquiry-validation.test.ts`, `tests/integration/{inquiries,inquiry-http}.test.ts`, `tests/fixtures/server-only.ts`, `vitest.integration.config.ts`; `README.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`, this report. Existing P3/owner edits were preserved. Framework-generated `next-env.d.ts` imports restored after verification.

## P2-B recommendation / form enablement gate

Keep the form disabled until ECHO-205's single canonical FA/EN/AR form uses separate email/phone, stable enums, field/error summary/live statuses, in-memory draft retention, pending prevention and same-key retries. Complete ECHO-206's network/proxy trust and per-network shared limits/timing signals, test flood/timeout paths, and select maintenance scheduling; do not trust arbitrary forwarded IP headers. Finish ECHO-207's UI retry/double-click/uncertain network cases. Then ECHO-208 restricted operator readback with owner D5, and ECHO-210 CI/browser-to-DB/mobile tests when tooling permits. Notifications stay absent. Privacy/retention, verified contacts, native-language and browser/reference acceptance still gate launch. Do not begin these automatically in P2-A.

Suggested human commit: `feat(ECHO-204): persist validated inquiries in PostgreSQL`
