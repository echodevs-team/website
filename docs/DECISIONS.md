# P0 decision and owner-input ledger

2026-11-04. Technical decisions below are recommended within the approved SCOPE; they do not supply missing business facts or grant external-action approval.

| ID | Decision / trade-off | State / revisit trigger |
|---|---|---|
| A01 | One Next.js App Router/TypeScript app, build-time Tailwind and PostgreSQL; no separate API service, CMS, auth/admin, Redis or queue. Static marketing content in repo. | Accepted scope; exact package versions/compatibility unverified until ECHO-101. |
| A02 | Server components by default, small client islands; Node runtime for inquiry endpoint. Static localized pages where possible. | Recommended; host must support Node + private PostgreSQL access, not static-only export. |
| A03 | npm + lockfile; next-intl selected for the P1 locale skeleton. Zod/Drizzle/pg remain P2 candidates, not installed. | P1 uses peer-checked versions in package.json; install/build/tests pass. TypeScript 5.9 selected for parser peer support; ESLint 9 compatibility/deprecation and scoped minimatch security override documented in P1-FOUNDATION. |
| A04 | Single JSON POST route, explicit shared schema and error codes, commit-before-success, atomic bounded idempotency and PostgreSQL-backed shared rate limits. | Recommended; real concurrency/failure tests required in P2. DB use avoids a new service but needs cleanup and overload bounds. |
| A05 | `/fa`, `/en`, `/ar` explicit routes; root temporarily redirects by valid remembered choice, then supported browser language, then FA. | Existing SCOPE assumption; D8 owner review before P5. Root negotiated redirect must not be cached across users. |
| A06 | Coral & Charcoal replaces Sahara; keep composition, use accessible action shades rather than white on original coral. | Palette already accepted; D7 final logo/copy/rendered sign-off pending. |
| A07 | Preserve extracted originals byte-for-byte plus checksums, outside public assets. | ECHO-001 now verified against supplied original ZIP; all members/CRCs/hashes match. Original image inspected; browser comparison still deferred. Read-only permissions are not tamper-proof. |
| A08 | Agents never stage, commit, amend or push. Reports/checklists provide evidence; humans own Git publication. | Project-wide policy reconciled. Git absent initially; repo appeared during session without agent action, final files untracked/no staged changes. |
| A09 | Independent routing-level 404 document with documented experimental globalNotFound; sanitized locale header from proxy. | HTTP-tested status/copy/lang/dir, preserves separate roots/static locale pages. Throw-based catch-all produced an invalid Next error shell; shared-root trial removed. Recheck experimental API on upgrades. |
| A10 | Owner explicitly authorizes ECHO-101/102/106 without ECHO-003. | Authorized by the current implementation request; no later-batch, visual-sign-off or launch approval. ECHO-003 stays unchecked; capture/comparison required before ECHO-109 approval. |

## Owner decisions (no answers invented)

| Key | Evidence / decision needed | Blocking stage; safe interim |
|---|---|---|
| D1 | Actual domain, public inbox, social/profile destinations and permission to publish them | Final metadata/contacts/launch; omit production contact links until verified. |
| D2 | Publishable real/internal work, role/stack/result evidence, licensed screenshots | P4 portfolio release; concepts may be visible only with explicit labels and honest static illustrations. |
| D3 | Team names, roles, public profiles or organization-only identity | About release; no invented members/photos. |
| D4 | Hosting region/provider, budget, operator capability and backup responsibility | P7 external work; design for portable Node deployment now. Reachability from target audiences/regions remains untested. |
| D5 | Named lead reader, secure access/readback workflow, approved inbox if notifications wanted | P2 operational gate; notifications disabled until approved. No public admin UI. |
| D6 | Retention duration, deletion requests/contact, jurisdiction, vendor disclosure, analytics/consent policy | Privacy/launch; no analytics or marketing consent by default. Owner/legal approval required; no made-up legal terms. |
| D7 | Final mark, idiomatic brand spelling/core copy, visual preview approval | ECHO-109/full visual replication; palette and composition can proceed as documented. |
| D8 | Root locale behavior and FA/EN/AR native-review ownership | P5 release gate; implement documented FA fallback and route parity. |
| R1 | Original archive and assets | RESOLVED for provenance: supplied originals match ZIP and frozen prototype; manifest and repeatable check added. Browser comparison remains R2. |
| R2 | Local browser executable and baseline review/sign-off | Chromium download previously timed out; no actual screenshots. Owner-authorized exception now permits only ECHO-101/102/106. Still required before ECHO-109 approval/full-page replication. |

P0 browser/sign-off gate remains open, with the narrow exception A10 applied to the completed first P1 batch. Original archive provenance is resolved. D1–D8 remain unresolved business/release decisions, not facts supplied by the implementation. This session stops after ECHO-101/102/106.
