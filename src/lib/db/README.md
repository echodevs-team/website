# Database boundary (P2-A)

`client.ts` is server-only: bounded `pg` pool and timeouts, lazy environment configuration. Versioned SQL lives in `db/migrations/`; transactions/idempotency live in `../inquiries/`. No ORM, public read API or operator UI. Application credentials cannot read stored inquiry fields. See `docs/P2-A.md` for local private-socket setup, roles, migration/cleanup commands, API contract and verification gaps. Never import this module from client components or use real credentials/data in tests.
