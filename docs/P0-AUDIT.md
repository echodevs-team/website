# P0 source, visual and environment audit

Historical initial audit. Later original archive verification, explicit ECHO-003 exception and first P1 batch results are in `P1-FOUNDATION.md`; missing-input/tooling statements below reflect the original audit date/session.

Date: 2026-11-04. Scope: ECHO-001–006 only. No website scaffold, DB, deployment, external requests, Git initialization/staging/commit/push or host changes. Read all six requested documents in order, then the full HTML (large output was inspected in portions). Applicable global/workspace instructions were already loaded; only root `AGENTS.md` exists in this project.

## Task acceptance evidence

| Task | Status | Evidence / limitation |
|---|---|---|
| ECHO-001 | PARTIAL | Extracted HTML + legacy design copied byte-identically into read-only `design/reference/`, byte sizes/SHA-256 manifest verified. ZIP and supplied screenshot absent; original archive hash/list/provenance cannot be verified. No claim of Git-tracked source (files remain untracked). |
| ECHO-002 | DONE | Complete source inventory below and reproducible `scripts/audit_reference.py`; all sections, links, controls, assets, motion and responsive classes inspected. Runtime judgments clearly separated from static evidence. |
| ECHO-003 | BLOCKED | No browser screenshots captured: no browser executable found on PATH/in inspected binary locations, no project browser package or Python Playwright/Selenium. `screen.png` absent. Reproduction/capture procedure in reference README. |
| ECHO-004 | DONE | Exhaustive prominent claim/link/asset registry below; no customer/contact/capability treated as verified by a source comment. |
| ECHO-005 | DONE (specification) | Active DESIGN reconciled to already approved Coral & Charcoal; starting semantic tokens, calculated contrast, typography, motion and logo deliverables recorded. Final logo/rendered approval D7 explicitly pending, not falsely signed off. |
| ECHO-006 | DONE (discovery) | Actual VM/tool/Git findings, absence of commands/CI, conditional feasibility and deploy boundaries documented here and in ARCHITECTURE. No installed-stack or CI pass asserted. |

**P0 milestone remains PARTIAL:** signed-off baseline, browser artifacts and original provenance are missing. P1 was not started. The architecture is a scoped recommendation, not a tested app or business-fact approval.

## Prototype inventory

“Present” means source exists; “source-supported” means code path is inspectable, not browser-tested.

| Area | Present / source-supported | Broken / placeholder / production gap |
|---|---|---|
| Document | Persian `lang=fa`, `dir=rtl`, viewport and semantic main/sections; one H1 | No title, meta description, canonical, hreflang, social metadata, sitemap/robots, locale routes or localized 404. No skip link. |
| Fixed header | Brand/home, six desktop section anchors, FA/EN/AR appearance, theme and contact CTA; scroll adaptation | Desktop nav `hidden lg:flex`, no mobile menu; dot navigation also hidden below md. Header brand+controls+CTA may overflow narrow screens (not rendered). Hover height 80→96px and scaling risk layout/overlap. Two scroll handlers duplicate header work. |
| Hero | Benefit heading/description, contact and demo CTAs; decorative ED/runtime frame and four capability tiles | No real work evidence; technical/status labels imply capability/operations without proof. Static hero visual is not a product runtime. |
| Services | Three pillars, each four specialty bullets, two CTAs | Website/software/AI taxonomy is a good starting point; mobile/UIUX/data-engineering scope must become discoverable. “Service details” goes to demos rather than details. Claims require review. |
| Demos | Three styled static mockups (SaaS analytics, RAG bot, health booking); concept labels; order-similar CTA | No interactive demo, live app/source or detail routes. “Interactive/LIVE” wording misleading; metrics/compliance/zero-error claims not evidence. |
| Why us | Four collaboration cards | Guaranteed ROI, certain deadlines/no hidden cost and delivery claims unsupported. No approved testimony, client logos or identities. |
| Process | Six stages: discovery, planning, UI/UX, development, QA, delivery/support | Usable narrative, but weekly sprints/Figma/support practices require owner confirmation, not operating guarantees. |
| Contact | Availability badge, response text, three contact links, five fields, submit and hidden success block | False success on inline preventDefault; no network/backend/persistence/abuse/validation beyond required fields, no pending/retry/DB error path or secure review mechanism. No privacy route/disclosure. |
| Footer | Brand, services/demo anchors, repeated three contacts, availability/cloud badge | Placeholder contacts, fixed Persian 2025 copyright, unsupported infrastructure status. No privacy navigation. |
| Side dots | Six named anchors with visual active-state scroll tracking and hover tooltip | md+ only; tiny targets and `focus:outline-none` without replacement; aria-current stays on header home, dot state is visual only. |

### Interactions and controls

35 anchors: 29 internal (`#hero`×3, `#services`×5, `#demos`×7, `#why-us`×2, `#process`×2, `#contact`×10), 6 external/contact (three destinations twice). All internal IDs exist; 15 IDs unique. No dead `#` link in this actual source; semantic destinations can still be misleading. Smooth-scroll JS prevents native hash navigation and does not transfer focus/update history or account for fixed header. Verify anchor positioning in browser.

Theme button has a name and class/localStorage toggle; early initialization respects OS preference when no override exists. Source suggests persistence works, but no runtime test; localStorage access is unguarded and OS changes after load are not tracked. FA/EN/AR are nonfocusable spans without navigation/handlers: inert controls, not localization. No login UI or authentication is present/needed.

Form controls: required text name; required combined email/phone text; four-option service select (visually required, missing required attribute); optional combined “budget/timeline” select whose four options describe time/scales, not budget; required description textarea. Five separate labels have no `for`, controls have no `id`/`name`, no autocomplete or field limits/contact validity. No explicit not-sure service. Submit merely unhides the success message; success has no live/status semantics. Existing optional budget/time options are not business pricing facts to preserve.

### Assets, styles and motion

No `<img>` or local photography/product screenshot assets. Five inline SVGs (brand/control/code shapes), CSS chart/chat/booking illustrations, one full-screen canvas, four style blocks and six scripts (five inline plus Tailwind CDN). Material Symbols are external icon-font glyphs, not independent approved logos. No final favicon/OG/brand asset set or font-license files.

External resource inventory: Google Fonts API (Vazirmatn 300–800, JetBrains Mono 400–600, Plus Jakarta Sans 500–700); Google Material Symbols API; jsDelivr Vazirmatn v33.003 CSS; two direct jsDelivr regular/bold WOFF2 URLs under an IRANSans alias; Google Fonts/gstatic preconnects; runtime `cdn.tailwindcss.com?plugins=forms,container-queries`. Exact URLs remain in preserved HTML. Availability/license/network behavior unverified; none fetched. Redundant providers/alias and runtime CSS are production performance, privacy and CSP risks.

Motion: spin/pulse/ping utilities, neuralPulse/tokenStream/floatNode/chipGlow definitions (not all necessarily used), scanline sweep/grid pulse, hover lift/scale, title reveals, smooth scroll and continuous particle canvas with pointer repulsion/scroll drift. Canvas uses 45–110 particles and pairwise connections (up to 5,995 pairs/frame), DPR capped at 2. Reduced-motion is read once and suppresses particle movement **only**; redraw/pair loops still request every frame. CSS animations and JS smooth scrolling are not disabled by that flag; no hidden-page pause. Some reveal classes are pre-applied, so not all titles depend on the observer. Universal color/shadow transitions, repeated backdrop blur, hidden scrollbars and competing inline/class styles add cost/maintainability risks. Measure actual runtime later.

### Responsiveness and accessibility

Source uses sm/md/lg; no custom screen definitions, so conventional Tailwind CDN defaults are assumed 640/768/1024px, **not browser-verified**. Hero switches to 12-column at lg (8+4); capability tiles 2→4 at md; services/demos 1→3 at md; benefits 1→2→4; process 1→2→3; form inputs split at sm/contact columns at lg; footer 1→2→12-column layout. Max width 1440px and 20/40/64px gutters; nested padding, always-visible header controls, large text and 3-column cards at tablet widths need real reflow review. No screenshot/overflow/zoom/mobile CTA result is available.

Positive semantics: header/main/footer, section headings, named theme button and side-dot navigation. Gaps: unassociated fields, inert language control, no mobile nav, focus removal/tiny dots, no skip link/status announcement, concealed scrollbars, incomplete reduced motion and small technical text. Calculated white-on-coral contrast is 2.83:1; opaque replacement pairs in DESIGN pass stated thresholds, but composited glass surfaces and all states remain untested. No WCAG conformance claim.

## Claim, link and asset registry

Classification: **verified** = inspectable fact/accepted product decision, **concept** = static illustrative material only, **unknown** = requires owner evidence, **remove** = unsuitable production wording/value without proof. Applies to repeated occurrences across header/hero/cards/contact/footer.

| Item / occurrence | Classification | Production treatment / evidence |
|---|---|---|
| Echo Devs, three locales, Coral & Charcoal, no visitor login | Verified planning decisions | SCOPE; not proof of operational delivery. Persian brand spelling still subject to copy review. |
| Three pillars, six process stages, three demo cards | Verified structural counts | Counted source; no shipped-project count implied. |
| All 29 fragment anchors | Verified targets (static) | IDs exist; runtime navigation/focus and useful destination review outstanding. Service-detail links must become services routes. |
| `contact@echodevs.com` (mailto ×2) and implied domain | Unknown | D1 verify ownership/inbox; omit until approved. Never send email to test it. |
| `https://t.me` ×2 with `@echodevs_studio` label | Remove link / unknown identity | Root destination mismatches displayed handle; owner supplies actual approved route. |
| `https://github.com` ×2 with `github.com/echodevs` label | Remove link / unknown identity | Root destination is not portfolio evidence; do not infer actual account ownership. |
| SaaS dashboard / bars / `SaaS_v2.4` | Concept | CSS illustration, no demo functionality or deployed proof. |
| `CPU:14%`, `RPS:2,450`, `LATENCY:18ms` | Remove numbers | Simulated telemetry, not measured performance; avoid implying benchmark results. |
| RAG chat mock conversation, FAISS/vector labels | Concept; underlying implementation unknown | Static dialogue, no model/vector store. Label illustration, not interactive product. |
| `RAG_BOT::LIVE`, `TOKENS:420/s`, 24/7, sensitive-data filtering, zero error | Remove unsupported status/guarantees/metric | No live system, benchmark or security evidence; even concept context cannot justify zero-error promise. |
| Medical booking/confirmation/SMS/payment/records mockup, `HEALTH_BOOKING` | Concept | No functional portal/SMS/payment; do not market it as patient-data capability evidence. |
| `COMPLIANT: HIPAA/GDPR` | Remove | No compliance evidence or legal validation. |
| Demo stack chips: React/Next, Tailwind, TanStack Query; Python/FastAPI, LangChain, Vector DB; Next.js 15, PostgreSQL, Redis Cache | Unknown implementation claims | Merely strings in HTML, not inspected apps. Not the required production dependency list. Redis explicitly unnecessary for this site. |
| End-to-End, quality/SLA tile, Cloud-Native and fast/scalable infrastructure | Unknown; remove SLA implication | No demonstrated capability/hosting evidence. Use reviewed conservative service descriptions. |
| Hero `CORE_RUNTIME`, `ONLINE`, `NEXT.JS // PYTHON // AI`, `ENGINEERING_PRECISION // ACTIVE` | Concept visual / remove live implication | Can retain clearly decorative technical visual, never operational status. |
| Direct engineer contact/no middlemen, clean code/source delivery/no lock-in | Unknown | D3/owner confirms actual practice/terms; no absolute promises. |
| Guaranteed ROI, definite deadlines, no missed deliveries/hidden costs | Remove guarantees | Replace with evidence-backed process language only. |
| Weekly sprints, documented method, Figma review, cloud deployment, continuous support | Unknown | Owner verifies delivery practice; do not turn generic process into SLA. |
| Accepting projects/ready to respond, <=24 business-hour reply | Unknown availability; remove response promise | D5 confirms workflow/capacity before public statement. |
| “Successfully registered” inquiry message | Remove from production prototype flow | False persistence; production success gated by DB commit/readback. |
| Footer stable operational cloud infrastructure and green badge | Remove operational implication | No infrastructure was inspected/provisioned. |
| Fixed ©2025 | Replace implementation detail | Use current year later; no claim of business founding date. |
| SVG/menu-like logo, ED mark, illustration art | Concept asset | Source available; distinct final mark + usage rights/owner approval pending D7. No people/client imagery supplied. |
| Font/icon/CDN dependencies | Unknown rights/availability | Verify licenses, script/coverage and asset provenance, self-host where approved. |
| Legacy Sahara brief | Verified reference artifact only | Hash preserved; superseded active direction. |
| ZIP and supplied screenshot | Unknown / missing asset | Owner must supply; never reconstruct and call original. |

No customer, named team member, testimonial or genuine deployed case evidence is present. “VERIFIED CAPABILITY METRICS (NO FABRICATED STATS)” is a source comment, **not verification**. Any future content must pass the same owner-evidence gate.

## Environment, commands and boundaries

- Actual checks: `/home/worker1/projects/echodevs`, hostname `agent-lab`, user `worker1`, Ubuntu 24.04.5 LTS. These guest observations match workspace instructions; they do not independently prove host isolation. No host mounts/private network/config/credentials accessed.
- Initial `git status --short` returned **fatal: not a git repository**. During final inspection a `.git` directory had appeared without agent action; `git rev-parse --show-toplevel` confirmed this project root. Final `git status --short` showed all project files untracked; `git diff --stat` and `git diff --cached --stat` were empty. No agent initialized/staged/committed/pushed. Since files are untracked, Git cannot provide a before/after diff; review used source hashes, changed-document inspection and status instead. Remote configuration was not inspected.
- Node v24.21.0, npm 11.19.0, Python 3 available. `npm ls --depth=0` returned `(empty)`. No package.json/lockfile/source app/tests/CI at start; no build/lint/test scripts to run. No dependencies installed during P0.
- PATH checks found no chromium/chromium-browser/google-chrome/firefox/playwright/psql/docker; scoped `/usr/bin` browser glob checks absent and `/opt` empty. Python playwright/selenium/PIL modules absent. This does not prove no browser anywhere on disk, nor Docker daemon availability; no broad home/system search performed.
- CI is feasible in principle with supported Node, PostgreSQL service and browser job, but remote/provider/runner are unknown; not provisioned/executed. Current allowed P0 checks are reference hashes, static parser audit and contrast calculations only.
- Deployment shape stays portable Node + PostgreSQL. No static-only export, development VM launch, services exposed beyond loopback, host changes, paid providers, DNS or external operations. Final hosting/connectivity/region/budget/private DB/TLS/backups are owner prerequisites.

## Check record and next gate

Initial source parser: 6 sections, 35 anchors, 15 unique IDs, zero missing internal fragment targets, zero duplicate IDs, five unassociated form labels, zero images. CSS/JS inspection confirms the false-success path, inert locale spans and partial reduced-motion behavior. Contrast computation performed with WCAG sRGB formula; not a rendered accessibility test.

Re-run `python3 scripts/audit_reference.py` from the project root, and `sha256sum -c SHA256SUMS` from `design/reference`. Both passed. One initial audit invocation used the wrong working directory and failed to locate the script; corrected invocation passed. A final ad-hoc workflow-policy assertion initially failed because it was case-sensitive (`Never` versus `never`); this was a check defect, not a contradictory instruction, and was corrected before rerunning. The script asserts preservation and expected audit findings; passing means **baseline findings reproduced**, not production readiness. No lint/typecheck/build/DB/browser/Lighthouse/axe/translation-native review can be claimed in P0. Exact final command results are recorded in the session report.

Next: resolve R1/R2 and owner baseline sign-off, then ECHO-101/102/106 as a small P1 foundation slice. D1–D8 block their named content/operations/release tasks, not all independent engineering. Stop here; see ARCHITECTURE and DECISIONS for handoff.
