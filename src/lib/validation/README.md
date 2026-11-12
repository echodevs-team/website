# Validation boundary (P2-A)

`inquiry.ts` contains the strict pure Zod request schema, normalized input type, stable enums and safe field error codes. It has no environment/DB dependencies and can be reused when the canonical form is wired in P2-B. Server validation is authoritative. See `docs/P2-A.md` for bounds, international phone format rules, response codes and UI requirements. Current homepage controls remain disabled.
