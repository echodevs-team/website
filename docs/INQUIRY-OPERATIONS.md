# Inquiry operations — private local runbook

This is an implemented **development/local-only** handoff mechanism, not deployment authorization or an approved customer privacy policy. Current owner decisions D5 (who handles leads and access) and D6 (privacy/retention) are unresolved. No human/operator identity, inbox, external service, production schedule or production access model is created here.

## 1. Roles and access prerequisites

`scripts/provision-inquiry-roles.mjs` provisions four **NOLOGIN capability groups**, transactionally and repeatably. It does not create operator logins, grant memberships or alter application credentials. Use approved separate individual logins with SCRAM authentication, not the migration owner or application account:

| Group | Database privileges / purpose |
|---|---|
| `echo_inquiry_reader` | SELECT on inquiries only; list metadata and retrieve one full record |
| `echo_inquiry_eraser` | SELECT(id), DELETE on inquiries; SELECT(inquiry_id,expires_at) on submission metadata; no contact/description read or status update |
| `echo_inquiry_backup` | SELECT on the four application tables and migration ledger; no writes |
| `echo_inquiry_restore` | SELECT/INSERT/MAINTAIN on the four application tables, SELECT on ledger; no DELETE/TRUNCATE/DDL. MAINTAIN permits an exclusive restore lock without granting data deletion. |

Provisioning requires the explicitly configured owner/migration credential and CREATEROLE capability. It refuses conflicting privileged/login groups. Groups are cluster-wide; membership grants access wherever that group has been granted permissions. Before any multi-environment deployment, the owner must select isolation and environment-specific grants; do not blindly share these groups across production and development.

An authorized DB owner must independently approve/create the actual login and grant only the needed capability, for example this **SQL template, not executed here**:

```sql
GRANT echo_inquiry_reader TO "<approved_read_login>";
-- Erasure/backup/restore are distinct approvals, not implied by read permission.
```

Provisioning/reviewing individual authentication and revocation is an owner action; no guessed login/password or contact is supplied. The CLI checks effective membership and refuses superuser, database/role-creator, BYPASSRLS and inquiry-owner credentials even if they could read data directly. PostgreSQL still enforces underlying table privileges. `echo_app` gets none of these groups and still cannot read inquiries.

### Credential files

Keep all files in owner-only project `.local/` directories (0700), files 0600, never Git/artifacts/logs. Do not put URL/password/key values in command arguments, shell history, reports or `NEXT_PUBLIC_*`. Pass dedicated environment variables using private files supplied by the owner:

- `.local/operator/read.env`: `OPERATOR_DATABASE_URL`
- `.local/operator/erase.env`: `ERASURE_DATABASE_URL`
- `.local/operator/backup.env`: `BACKUP_DATABASE_URL`
- `.local/operator/restore.env`: `RESTORE_DATABASE_URL`
- `.local/operator/backup-key.env`: independent `INQUIRY_BACKUP_KEY`, not the DB password, ingress secret or replay HMAC secret

Each operator URL must use a private Unix socket under this checkout's `.local/`, never remote TCP. Paths outside that scope and unsigned connection assumptions are rejected. This deliberately does **not** support a managed production database yet. CLI access controls are not a sandbox against the trusted OS account/DB administrator: the development migration owner has private-socket trust and the same guest account owns the cluster. Actual human/OS separation remains D5/deployment work.

## 2. Local startup / shutdown / app configuration

```sh
npm ci --ignore-scripts
npm run db:dev
```

The existing unprivileged PostgreSQL 18.6 helper uses **no TCP listener**, private socket permissions, synchronous commits and redacted statement/parameter/error-detail logging. It applies reviewed SQL migrations, provisions capability groups, configures the scoped SCRAM application role, and keeps its foreground process alive. **Ctrl-C** stops PostgreSQL cleanly; do not use kill -9, delete data directories or remove postmaster.pid as a routine recovery method. A second startup refuses a running/stale-pid cluster rather than overwriting it. All database listeners started during this batch were stopped.

Generated local environments are now separated:

- `.local/dev-pg/app.env`: application URL, local ingress settings and replay secret; **no migration-owner URL**.
- `.local/dev-pg/owner.env`: migration-owner URL only. Never load it into Next.
- `.local/dev-pg/digest.key`: stable HMAC key; do not rotate during active 24h replay windows. App password rotates when the helper restarts; restart Next too.

In another terminal, only for **synthetic local inquiries**:

```sh
INQUIRIES_ENABLED=true npm run dev:inquiries
```

Open `http://127.0.0.1:3000/fa`, `/en`, `/ar`; Origin must exactly match `INQUIRY_ORIGIN`. Default generated API enablement stays false. No real customer/production secret import to this VM is authorized.

## 3. Migrations and grants

Review changes before application. Existing 001/002 SQL is unchanged by B2; no data model change is needed for readback.

```sh
node --env-file=.local/dev-pg/owner.env scripts/migrate.mjs
node --env-file=.local/dev-pg/owner.env scripts/migrate.mjs --verify
node --env-file=.local/dev-pg/owner.env scripts/provision-inquiry-roles.mjs
```

`--verify` uses a read-only transaction and refuses pending, modified or unknown applied migration history. Apply uses the existing advisory lock and atomic transaction; reruns preserve inquiry data. Never edit/delete applied migrations or “fix” drift by replacing ledger checksums. Forward-fix with a reviewed new migration or restore a tested backup under an approved recovery plan.

Reapply reviewed capability grants after migrations that recreate tables. Grant provisioning only affects these dedicated groups, not `echo_app`; any new application-table grants must be reviewed separately. Provisioning creates **no membership**, so existing owner login approval remains necessary. The local helper performs the sequence automatically.

## 4. Find new requests / read one request

After owner-authorized credentials exist:

```sh
node --env-file=.local/operator/read.env scripts/inquiry-ops.mjs list \
  --status new --limit 20 --acknowledge-pii --out .local/operator/new-page-1.json

node --env-file=.local/operator/read.env scripts/inquiry-ops.mjs list \
  --status new --locale fa --since 2026-11-07T00:00:00Z --limit 20 \
  --acknowledge-pii --out .local/operator/new-fa.json

node --env-file=.local/operator/read.env scripts/inquiry-ops.mjs show \
  --id <REFERENCE_UUID> --acknowledge-pii --out .local/operator/detail.json
```

UUID/cursor/target placeholders must be replaced with owner-authorized values, never customer text or credentials. Dates in examples are explicit filters, **not retention defaults**. `list` defaults to `new`, 20 records, hard max **50**, newest first. Use `--status all` or another schema status if needed. List exports only reference/time/status/service/locale, not names/contact/description. A `nextCursor` in the private JSON can be passed as `--cursor <CURSOR>` with the same filters to retrieve the next page. Cursor retains timestamp microseconds; no unstable OFFSET paging. `--since` is inclusive, so deduplicate UUIDs when polling a high-water mark.

Inspect detail exports only in an approved local non-logging viewer. JSON serialization escapes terminal controls plus bidi overrides/isolates; original Unicode remains intact in PostgreSQL. Never execute submitted content, render it as HTML, paste it into tickets/analytics or send it externally. Exported copies need their own approved deletion/retention rule. File output requires explicit `--acknowledge-pii`, private directories and exclusive 0600 creation; symlinks/shared directories/overwrites are refused. CLI stdout/stderr contains generic result/counts only, no customer fields, IDs, passwords or SQL details. Do not redirect viewer output into logs/CI artifacts.

No status-update command is provided: the owner has not approved a lead-handling/status workflow. Until then, identify requests by UUID/date/status without inventing response-time promises or marking them contacted automatically.

## 5. Privacy / business retention and manual erasure

See `INQUIRY-PRIVACY.md` for data inventory and required owner decisions. **Business retention is UNSET; automatic inquiry deletion is DISABLED/absent.** There is no fallback purge period or age-based delete job.

Single-reference deletion is separate from read access. Preview is default; apply requires both `--apply` and an identical UUID confirmation:

```sh
node --env-file=.local/operator/erase.env scripts/inquiry-ops.mjs delete --id <REFERENCE_UUID>
node --env-file=.local/operator/erase.env scripts/inquiry-ops.mjs delete \
  --id <REFERENCE_UUID> --apply --confirm-id <SAME_REFERENCE_UUID>
```

Run apply **only after actual owner-approved case-specific erasure authorization**; flags confirm intent, not legal approval. The CLI does not delete multiple inquiries or accept a retention cutoff. It briefly locks the inquiry table within a bounded transaction, refuses records with an active replay mapping, and otherwise hard-deletes just the confirmed UUID; expired dependent replay rows cascade. Missing references are a safe no-op. No audit log stores customer fields.

**Replay safety limitation:** deleting an active mapping would let the same key recreate a recently erased request. The tool therefore refuses deletion during the existing 24h server replay window; this is a technical safeguard, **not** a chosen business retention policy. Urgent erasure during that window requires owner-approved incident handling (pause intake, verify concurrent retries and decide a tombstone/protocol change); no unsafe bypass is implemented. It cannot prevent an intentional later new-key submission. Deleted data may still exist in older backups, exported detail files or external provider logs; erasure is not complete until the approved backup/export policy is handled. D6 must settle that process before real-user intake.

## 6. Temporary-state maintenance / future scheduling

```sh
node --env-file=.local/dev-pg/app.env scripts/cleanup-submissions.mjs
```

Only expired replay (24h) and network (10min) metadata are removed; actual inquiries and the bounded global counter are not purged. Cleanup is now one transaction: permission/storage failure rolls both deletions back, outputs no false-success counts and can be retried safely. It complements bounded opportunistic cleanup on admitted submissions; without traffic a schedule is necessary for physical deletion.

For a future approved host scheduler, use the exact same command with an approved scoped maintenance credential, private environment injection, non-overlapping execution, bounded timeout, and exit-code monitoring. Choose cadence to meet the owner's maximum allowed cleanup lag (e.g. evaluate hourly execution, **not installed or approved here**). Alert on failure using generic operation/error codes only; never upload DB errors/payloads. Do not schedule business inquiry deletion until D6 is explicitly approved and implemented. No cron/timer/service or production listener was created.

## 7. Encrypted logical backup / restore

The bundled development PostgreSQL package has no `pg_dump`/`pg_restore` binary. Instead this slice provides a small **bounded application-data snapshot**, using existing `pg` and Node crypto, not a full PostgreSQL/PITR backup product.

```sh
node scripts/inquiry-ops.mjs keygen --out .local/operator/backup-key.env
node --env-file=.local/operator/backup.env --env-file=.local/operator/backup-key.env \
  scripts/inquiry-ops.mjs backup --out .local/backups/inquiries-unique.enc
```

`keygen` never prints or overwrites the key. Keep a separately secured recovery copy of the key, not on backup media; an approved key custodian/location and recovery procedure are still owner decisions. Losing the key loses recovery; compromise of both archive and key exposes PII. No key material or DB credentials are inside the backup.

Backup uses repeatable-read/read-only consistency, compares checked-in/applied migration checksums, preserves PostgreSQL timestamp precision and serializes inquiries, replay metadata, network/global counters. AES-256-GCM authenticates the versioned format; private exclusive output is fsynced. Plaintext exists in process memory only. It refuses more than **1,000 rows in any table or 16 MiB JSON**, never truncates silently. Existing destination files are never overwritten. This is suitable for the local rehearsal/small dataset, not a claim of encryption compliance, large-volume backup performance, HA, role/config recovery or production disaster recovery.

For restore, an approved owner must provision a **separate empty local target**, apply identical migrations and capability grants, and supply a scoped restore login. Do not restore into running development/production or automatically drop/create a valuable database. The automated disposable rehearsal below provisions its own isolated target and needs no real-data reset.

```sh
node --env-file=.local/operator/restore.env --env-file=.local/operator/backup-key.env \
  scripts/inquiry-ops.mjs restore --in .local/backups/inquiries-unique.enc \
  --confirm-empty <EXACT_EMPTY_TARGET_DATABASE>
```

Restore authenticates/decrypts privately, checks format/migrations/row/field bounds, locks tables **before the serializable snapshot reads**, refuses any nonempty application table, and inserts only allowlisted columns using parameters. Any later-row constraint error rolls the entire restore back. No DROP/TRUNCATE/SQL from the archive executes. Wrong key/tampering/wrong target/permissions fail closed with generic errors. Replay metadata is restored with its original expiry; keep the independently secured original HMAC secret if resuming active replay semantics. Expired buckets/keys remain expired and should be cleaned before reopening intake.

Before reopening a restored system: verify counts/synthetic readback, migration hashes, owner-approved erasure manifest and any records deleted since backup, restored replay secret, current API/proxy trust and database permissions. Do not resurrect erased data by simply launching an older snapshot. Applying an owner-maintained deletion manifest and encrypted backup expiry is not automated here.

Future production hosting must select provider snapshots/PITR or version-matched native PostgreSQL tooling, separately protected encryption/access, verified restore drills, approved RPO/RTO and backup retention. No such provider, tool installation, recovery objective, external storage, schedule or launch has been approved or tested.

## 8. Unavailable DB / failures / incidents

1. Keep success contingent on confirmed COMMIT; 503/uncertain UI must not be treated as saved or discarded. Same-key retry is safe only within the existing replay window.
2. Confirm the foreground PostgreSQL process is running and the expected private socket/environment exists, without printing credentials. Don't inspect host networks, dump environment variables or use production secrets on this VM.
3. On helper restart, restart Next to pick up the rotated app password. Confirm `owner.env`, not `app.env`, is used for migrations; use dedicated operator files for readback.
4. Verify migration history and reapply reviewed capability grants if tables were recreated. Do not grant owner/superuser credentials to “fix” a denied readback or restore. Run `npm run test:operations` for a fresh synthetic isolated check.
5. Check private file permissions, nonexisting output path, explicit PII acknowledgement, command bounds and exact confirmation flags. A blocked active replay erasure is expected, not a permission bypass invitation.
6. Inspect only sanitized status/exit codes. DB logs should have statement/parameter/detail logging disabled as in the local helper. If provider/audit logs contain PII, restrict access and invoke the owner's incident policy; do not copy payload logs into reports.
7. Do not remove PID files, reset databases, bypass authentication/security, disable synchronous commit, expose listeners or rotate replay secrets speculatively. Obtain targeted approval for data recovery/destructive actions.

## 9. Reproduce acceptance / still-open deployment gates

```sh
npm run test:operations                 # own disposable cluster, operator roles, encrypted snapshot/restore
npm run lint
npm run typecheck
npm test
npm run build
npm run test:inquiries -- --http         # includes operations + API/DOM/real HTTP regression
```

These checks use synthetic data and stop/remove their owned test cluster. Actual ECHO-208 owner assignment/access/revocation, D6 retention/export/backup/urgent-erasure decisions, native browser/mobile/screen-reader acceptance, hosted CI, and production restore/ingress validation remain open.

The exact proxy contract is in `P2-B1.md`: no raw forwarded-header trust, explicit private-loopback binding or fresh key-bound signed client-IP metadata; edge derives peer from socket/trust-checked chain, strips client envelope headers, signs with independent secret, and clocks stay synchronized. Verify TLS, access restriction to backend, exact Origin, IPv4/mapped IPv6/native /64 behavior, NAT usability, ingress body/connection/concurrency limits, secret rotation, logging and maintenance at the **real** host before internet exposure. Fixture MAC tests do not prove a deployment trust chain. No public inquiry read endpoint or external notification exists.
