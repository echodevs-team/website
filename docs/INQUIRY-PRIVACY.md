# Inquiry data inventory and lifecycle — not a legal privacy policy

**Business retention configuration: UNSET. Automated business-data purge: absent.** No retention period, legal basis, operator identity, approved inbox, jurisdiction, notification provider or production storage location is invented by this document. D5/D6/D9 and an owner-approved public notice remain release gates.

| Data | Purpose / minimization | Current boundary / lifetime |
|---|---|---|
| Full name | Identify/respond to inquiry; required | Inquiry row; approved readback only; business retention undecided |
| Email and/or international phone | Reply channel; at least one, both optional individually | No third-party sending or verification service; operator must not publish/contact without owner workflow |
| Description | Understand requested work; 20–5000 bounds; potentially sensitive free text | UI warns against secrets/sensitive information; stored as text, never HTML/analytics/log payload |
| Service, optional timeline and budget category | Scope/context, no pricing promise | Form currently asks service/timeline, not budget; API accepts optional category, no added personal profile |
| Locale/source page | Language/context; tightly allowlisted | Inquiry metadata, not arbitrary tracking URLs |
| Opaque UUID, created/updated dates, status | Retrieval and processing state | No account, public read API, automatic status/contact change or invented response SLA |
| Submission UUID, keyed normalized-payload digest, inquiry reference, expiry | Bounded duplicate prevention | Separate pseudonymous metadata, **24h** technical replay expiry; cascade on eligible inquiry deletion; expired-only maintenance |
| HMAC network identity (/64 for IPv6), counter, window/expiry | Abuse throttling | Raw IP not stored by app; pseudonymous, **10min** technical expiry; indexed/maintenance cleanup |
| One global window/counter | Resource cap | Fixed row without visitor identity; reset on request, not a customer retention rule |
| Draft in open page | Recovery/retry UX | Memory only, no browser storage/URL/analytics; discarded on navigation; uncertainty warning says not to reload |
| Private operator JSON exports | Deliberate authorized readback | 0600, explicit acknowledgement, separate export retention decision; no automated expiry |
| Encrypted snapshots | Local recovery rehearsal | Full application-data copy; encryption does not erase obligations; backup/key custody and expiry unresolved |

Keyed digests and network hashes are **not claimed anonymous**. Ingress/hosting may independently see/log raw IPs or request information; no production provider/logging configuration is approved. No tracking/marketing consent, analytics, file upload or notification integration is added.

**Analytics status — 2026-11-15 scope decision, no implementation.** Private traffic analytics is now mandatory V1 scope (SCOPE §8.4, `DECISIONS.md` A13), but no provider, hosting, consent position, event scope, retention period, dashboard access owner or processor terms are approved, and **no tracker, cookie, script or analytics storage exists**. The published localized notice correctly states that no analytics is implemented; it must not be changed in advance of implementation. Before any tracking is enabled, this inventory needs analytics rows (data, purpose, minimization, lifetime, access), the vendor/processor disclosure must be added, and the FA/EN/AR notice must be accepted by the Privacy & Legal Approver. Pseudonymous throttling identifiers stay separate from analytics; inquiry payloads, contact details, inquiry UUIDs and replay keys must never enter analytics events.

## Access separation

- Public: POST only, reference/status/error codes; no stored-record reads.
- App SQL: INSERT inquiries, scoped short-lived state operations; no inquiry SELECT/UPDATE/DELETE.
- Reader: separate owner-approved membership, inquiry SELECT only; bounded CLI metadata pages/full single-record private output.
- Eraser: separate approval/capability, no contact read; single-record preview/explicit apply, active-replay refusal.
- Backup/restore: separate scoped credentials, privately encrypted snapshots; no owner password in app environment.
- Migration/DB owner: schema/grant administration only, not application/readback credential. Local same-OS-user trust is a development convenience, not production human access separation.

No actual human memberships are provisioned. Define approved personnel, least-privilege grants, offboarding/revocation, incident review and secured devices/files before processing real inquiries.

## Erasure and retention decisions

The implemented delete CLI defaults to dry run, requires an exact UUID confirmation for apply, refuses active replay keys and then deletes just that inquiry with dependent replay cascade. This protects against an uncertain client's retry recreating the erased request during the current replay window. It is **not a legal retention rule**; urgent erasure inside that window needs a separately approved protocol/incident solution. No bulk age cutoff or automatic inquiry-delete job exists.

Owner decisions required:

1. Purpose/legal basis and public disclosure in each locale; whether consent is actually required (not prechecked marketing consent).
2. Business inquiry retention period by purpose/status, start event, exceptions/holds and deletion authorization. No default value is configured.
3. How a requester is verified for access/correction/erasure without disclosing others' records; handling urgent erasure vs active retries.
4. Operator assignment and access expiry/revocation; safe reply channels and processing expectations.
5. Export/backup retention and encryption/key custodians, key loss/rotation/recovery, approved RPO/RTO and deletion manifest handling after restore.
6. Hosting/proxy/logging access, vendor/location/jurisdiction, breach/incident process, and whether notifications are enabled. Analytics is now V1 scope (A13), so this item must add the approved provider, consent position, event scope, retention, access owner and processor terms (D10) before tracking exists.

Deletion of the live row is not deletion of prior snapshots, local exports or possible provider logs. Before restoring an older snapshot, reconcile an owner-maintained approved erasure manifest in isolation; never reopen intake with resurrected erased records. Snapshot expiry/export disposal and manifest maintenance are **not automated or owner-approved yet**. PostgreSQL MVCC/WAL/backups may retain old bytes until their own lifecycle completes; do not claim secure physical wiping from a SQL DELETE.

Temporary-state physical deletion is independently controlled by the reviewed cleanup command and opportunistic expiry. Schedule it at the future host to meet an owner-approved maximum cleanup lag; no schedule exists now. Those technical TTLs do not authorize purging or indefinitely retaining business inquiries. Detailed commands and tested limitations: `INQUIRY-OPERATIONS.md`.
