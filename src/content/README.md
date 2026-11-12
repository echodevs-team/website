# Content boundary

Visitor-facing records live here as typed per-locale modules (`Record<Locale, ...>`),
separate from shared chrome messages in `src/i18n/messages/`. Every record must
provide Persian, English and Arabic; `npm run typecheck` and
`tests/unit/localization-parity.test.tsx` reject missing keys, empty values or
locale drift.

Rules:

- Never populate fictional clients, team profiles, metrics, testimonials, contacts,
  certifications or delivery guarantees. Label concept and preview work explicitly.
- Keep the same qualification and limitation in all three locales; do not let one
  translation imply a stronger promise than the others.
- Follow `docs/I18N-TERMINOLOGY.md` for service pillars, SaaS/API/AI terms, form
  address and bidi handling.
- Inquiry form labels, validation and status messages belong in `inquiry.ts`; the
  same form is reused by the homepage, Contact and tests.
- Privacy wording describes implemented technical behavior only. Legal identity,
  retention and jurisdiction remain owner decisions.
