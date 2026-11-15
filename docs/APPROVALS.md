# Approval responsibilities and open decisions

**Date:** 2026-11-15 · **Source of truth:** `SCOPE.md` (product scope, quality
gates and release constraints). **Decision ledger:** `docs/DECISIONS.md`.
**Delivery plan:** `ROADMAP.md` and `docs/parallel/`. **Test outcomes:**
`qa/registry.json` via `npm run qa:status`; this page is not a test tracker.

This page records *who* approves *what* and which decisions are settled,
delegated or still missing. It grants no approval by itself: an approval exists
only when the accountable role records it with a date, the exact revision it
applies to and the scope it covers. Roles are responsibilities, not people; no
individual is named here. When a human is assigned to a role, the owner states
it and the coordinator records that assignment. One human may hold several
roles, and technical test success never substitutes for an owner, privacy or
legal approval.

## Roles

- **Product Owner (PO):** product scope, V1.0 definition, business facts, costs, release authorization.
- **Brand & Content Owner (BCO):** brand spelling and identity, public copy, verified contacts, portfolio publication permission.
- **Visual Acceptance Reviewer (VAR):** rendered fidelity against the approved HTML baseline and light/dark, mobile, RTL acceptance.
- **Infrastructure & Operations Owner (IOO):** provider, region, budget, DNS, TLS, backups, monitoring and operator capability.
- **Security & Operator Readiness Reviewer (SOR):** threat model, secrets, access separation, abuse controls, operator runbook.
- **Privacy & Legal Approver (PLA):** controller/entity, jurisdiction, lawful basis, retention, disclosure, consent and vendor/processor terms.
- **QA Acceptance Reviewer (QAR):** current automated and manual evidence in the QA registry, including accessibility, performance, security and recovery checks.
- **Release Approver (RA):** go/no-go at one exact revision; requires PO authorization and PLA sign-off.

## Approval matrix

| Area | Accountable role | Required input | Approval evidence | Gate |
|---|---|---|---|---|
| Product scope and V1.0 definition of done | Product Owner | Privacy & Legal Approver; QA Acceptance Reviewer | Recorded scope change (`SCOPE.md`; section 1 of this page) | Adding or removing a V1.0 capability |
| Brand identity, public facts and copy | Brand & Content Owner | Product Owner for commitments; native FA/AR reviewers | `docs/DECISIONS.md` D1–D3, D7 records | Publishing any real name, contact, client proof, metric or new identity asset |
| Visual acceptance | Visual Acceptance Reviewer | Product Owner for significant departures | Captures tied to a revision (`ROADMAP.md` ECHO-608/B4) | Release candidate acceptance (A4) |
| Infrastructure and deployment | Infrastructure & Operations Owner | Security & Operator Readiness Reviewer; Product Owner for cost/region | E1a target contract, E2–E4 evidence, ECHO-701 ledger | Any provisioning, DNS, TLS or paid service |
| Security and operator readiness | Security & Operator Readiness Reviewer | Infrastructure & Operations Owner; Backend/Data owner | D1 threat/gap audit, D4–D5, ECHO-603 | Enabling intake for real users |
| Privacy and legal | Privacy & Legal Approver | Product Owner; Backend/Data owner | A3 record; ECHO-406 disclosure; `MANUAL-LEGAL-PRIVACY` | Any real-user intake, launch, or analytics tracking |
| QA and manual acceptance | QA Acceptance Reviewer | Lane owners | Current QA01 results plus `qa/evidence/<TEST-ID>/` | Release candidate acceptance (F4) |
| Analytics provider, metrics and access | Product Owner (selection, access owner); Privacy & Legal Approver (consent, disclosure) | Infrastructure & Operations Owner; Backend/Data owner | H1 comparison, H2 record | Enabling any tracker, dashboard or analytics storage |
| Production release | Release Approver (Product Owner with Privacy & Legal Approver sign-off) | QA, Security, Infrastructure roles | G2 record at the exact release candidate | G3 deployment and indexing enablement |

No worker may accept a row on behalf of its role, and owner/legal QA reviewer
roles are never used by an agent or coordinator.

## 1. Owner-approved decisions (recorded 2026-11-15)

- **V1.0 definition of done accepted.** Echo Devs V1.0 is a production-ready,
  publicly accessible, trilingual business website capable of attracting and
  accepting real project inquiries. The required capabilities and their mapping
  to roadmap/lane tasks are in `SCOPE.md` §12.1. Nothing in this record marks an
  unimplemented capability or an open acceptance gate as complete.
- **Private traffic analytics is mandatory V1.0 scope.** A private administrative
  dashboard is required, covering pageviews/visitor trends, popular pages,
  traffic sources, device and language breakdown where appropriate, project
  inquiry conversion tracking, private administrative access and
  privacy-conscious collection. A reliable existing self-hosted solution should
  be evaluated instead of building a custom engine; **Umami is a candidate, not
  an approved technology**. Requirements: `SCOPE.md` §8.4. No tracker,
  collection, dashboard, dependency or privacy-disclosure change is authorized
  or performed by this decision alone.
- Previously accepted decisions remain in force and are not reopened here:
  A01–A09 (architecture, form contract, locale routes, palette, reference
  integrity, commit policy, 404 strategy) and A11 (the approved HTML baseline
  governs visual fidelity). This scope decision supersedes only the earlier
  statements that deferred analytics and excluded an analytics dashboard.

## 2. Engineering choices delegated to the owning lane

These need no further owner approval as long as they stay inside `SCOPE.md`, the
approved baseline and the lane ownership tables in `docs/parallel/`.

- **H1:** compare self-hosted analytics candidates (including Umami) and propose
  metrics, event contract, minimization and hosting shape. Research only — no
  deployment, tracker, SDK, account or visitor data. The final provider choice
  returns to the owner with the privacy approver.
- **Implementation detail already delegated:** query/ORM layer and package
  versions, test harnesses and tooling, CSS/structure, capture tooling,
  ports/disposable DB names and documentation structure (A01–A09, lane tables).
- **Sequencing inside a lane** that changes no public behavior, public text,
  data contract or acceptance criterion.
- Choosing to omit an unverified claim rather than inventing it is always
  allowed and is not a scope change.

## 3. Owner decisions outstanding — block named work now

| ID | Decision needed | Blocks | Needed before |
|---|---|---|---|
| D1 | Verified public contacts: domain, inbox, social/profile links and permission to publish them | A2, C2, ECHO-405/604 public metadata | Public launch |
| D2 | Which real/internal projects may be published, with role, stack, result and licensed-screenshot evidence | A2, C2 | Replacing concept-only portfolio proof |
| D3 | Team public identities/roles, or organization-only identity | A2, C2 | About/public launch |
| D4 | Hosting provider, region, budget, backup responsibility and operator capability | A5, E1a | Staging environment |
| D5 | Named lead reader, secure readback workflow, access expiry/revocation and whether notifications/inbox are enabled | A3, D2, E3 | Real-user intake |
| D6 | Business retention per purpose/status, deletion-request handling, vendor/processor disclosure | A3, ECHO-406 | Privacy text acceptance |
| D7 | Significant visual departures, new identity assets, final factual/core copy | B4, A2 | Release candidate |
| D8 | Confirmed root-locale behavior and named native FA/AR review ownership | C1, A4 | Release candidate |
| D9 | Legal entity/controller, jurisdiction, privacy contact and legal basis for inquiry data | A3, ECHO-406, ECHO-703 | Any real-user intake |
| D10 | Analytics provider selection, consent model, event/metric scope, retention and dashboard access owner | H2, H3 | Enabling any tracking |

These are business, legal and operational facts. Agents must not invent an
entity, jurisdiction, domain, provider, contact, retention period or responsible
person; they may proceed with explicit omission and clearly labeled placeholders.
A decision may also be recorded as an explicit waiver ("omit this content"), which
is an answer, not a blocker.

## 4. Legal and privacy approvals requiring separate sign-off

Recorded by the Privacy & Legal Approver, never inferred from technical evidence:

1. Public privacy/data-handling disclosure accepted in FA, EN and AR
   (ECHO-406, C5, `MANUAL-LEGAL-PRIVACY`).
2. Lawful basis for inquiry processing, and the analytics consent position —
   including whether a consent UI is required for the selected provider.
3. Retention and erasure protocol, including backups, exports and restored
   snapshots (`docs/INQUIRY-PRIVACY.md`).
4. Vendor/processor disclosure for host, database, email and analytics.
5. Any claim, badge or commitment with legal effect (currently none published).

## 5. Publication and release gates

Sequential, separately authorized steps; no earlier PASS waives a later gate:

1. **No real-user intake** until A3 (including D6/D9) and D4/D5 are answered and
   the localized privacy disclosure is accepted (`SCOPE.md` §10).
2. **No analytics tracking** until the disclosure is updated for the approved
   provider and the consent decision exists; current published copy correctly
   states that no analytics is implemented.
3. **No public indexing** until an approved public HTTPS origin exists and
   `ECHO_PUBLIC_INDEXING` is authorized (ECHO-506/C4/G3); `robots.txt` and
   `sitemap.xml` stay restrictive and empty by default.
4. **No deployment, DNS change, purchase or public communication** without
   explicit owner authorization (A5/A6, E1a, G3).
5. **Release requires a G2 record** at the exact revision, with QA01 results and
   the owner/legal approvals current for that revision.
