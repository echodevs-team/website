# C — Content / localization / SEO

Reviewed 2026-11-14 at `6eedf3b`. ECHO-506 is implemented for **preview**;
its production and owner gates are not complete. Native sign-off is not a
technical dictionary-parity result.

| ID | Scope / remaining deliverable | Exact dependencies | Hours | State | Evidence / acceptance still needed | Unlocks |
|---|---|---|---:|---|---|---|
| C1a | Update remaining-copy review packet against current source; identify obsolete ECHO-502 claims | — | 2–3 | TODO | Owner packet predates ECHO-504 cookie write, VF01/R1 About edits and ECHO-506 SEO. Produce exact per-locale review targets, no speculative rewriting | C1 |
| C1 | Native FA/AR and editorial EN review, including sensitive claims | C1a | 4–7 | NEEDS_REVALIDATION | ECHO-501 parity and ECHO-505 font checks implemented; `MANUAL-NATIVE-FA`, `MANUAL-NATIVE-AR` NOT_RUN. Named reviewers required | C2, F2 |
| C2 | Apply approved business facts or explicit omissions and accepted editorial changes | A2, C1 | 3–6 | BLOCKED | All 27 marketing routes exist; no need to rebuild pages. Excludes final privacy/analytics wording, which C5 applies against D2/H4; business facts need not wait for hosting or analytics | C5 |
| C3 | Preview-safe localized metadata, robots/sitemap withholding and 404 engineering slice | — | 0–0 | DONE | `a90938f`, `65b890e`, `ba7f116`; current QA `SEO-METADATA-POLICY`, `SEO-ROBOTS-SITEMAP-PREVIEW`, `SEO-404-HTTP`, `BROWSER-404-EXPERIENCE` PASS at `7900c6e`; `docs/P5-ECHO-506.md` | C4 |
| C4 | Prepare production SEO policy, approved-origin build and preview/public tests without enabling indexing | C3, A6 | 3–5 | BLOCKED | `src/lib/seo/{site,policy}.ts` already gate origin/sitemap. Important: page metadata uses constant PREVIEW_ROBOTS even if indexing env is true; coordinated policy change and approved-state tests still needed. OG/structured facts review under ECHO-604 | C5 |
| C5 | Apply final privacy disclosure and accept localized/SEO output on integrated staging revision | C2, C4, E2, D2, H4 | 3–5 | BLOCKED | `MANUAL-404-METADATA`, `MANUAL-SEO-RELEASE-READINESS` NOT_RUN; reciprocal URLs, social metadata and privacy copy must match final implementation; G3 alone enables indexing | A4, F2, F3, F4, G1, G3 |

## Ownership / evidence boundary

First wave writes only `docs/handoffs/C/`. Later C owns `src/content/**`,
`src/i18n/messages/**`, `src/lib/seo/**`, robots/sitemap and route metadata;
coordinate route/layout changes with B. D/H propose privacy/event wording; C
applies translations after approvals. No real domain values or settings are
invented. C3 DONE means engineering acceptance of the seeded preview slice,
**not** ECHO-506 or its manual acceptance complete. Source report and QA JSONL
were inspected; screenshots were not newly visually accepted. Next: **C1a**.
