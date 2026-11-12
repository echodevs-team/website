# Batch 1 — Header & Footer visual fidelity

**Date:** 2026-11-10 · **Status:** implemented and locally verified; browser/visual acceptance pending.
Original `design/reference/code.html` remains the authoritative UI baseline. No homepage section,
canvas/backdrop, Services/Work layout, inquiry API/database or business logic was changed.

## Corrections applied

### Header
- Reference composition: gradient coral brand tile, `Echo Devs` wordmark, Persian `اکو دوز` chip,
  studio subtitle (desktop only), instead of a plain icon + wordmark.
- Six homepage destinations restored: home (`#hero`), services, work, about (`#why-us`),
  process, contact. Contact also retains the primary CTA.
- Desktop navigation appears from **1024px** (was 1280px); the CTA and subtitle appear from
  1280px so the bar cannot overflow between 1024–1279px. Below 1024px the existing accessible
  modal menu remains the only entry point.
- Segmented FA/EN/AR switch replaces underlined text links; the active segment uses the
  accessible action fill, and full language names remain the accessible labels.
- Theme control is now a reference-style icon control (sun / moon / monitor) with all three
  persisted modes (light, dark, system) still explicit via `aria-pressed`.
- Translucent sticky material (`backdrop-filter` on a pseudo-element, 93% opaque fallback),
  fixed 5rem height, no hover expansion.
- Link underlines are removed inside `.site-header` only; the global accessible underline for
  body content is untouched.

### Footer
- Three-column hierarchy restored: brand/status (5), service pillars (3), contact (4) at desktop;
  two columns at tablet and one at mobile.
- Brand tile + wordmark + chip, studio description, and two monospace badges matching the
  reference composition.
- Service-pillar links point at implemented anchors `/…/services#websites|software|ai`,
  plus the implemented `/…/work` listing.
- Bottom bar keeps a truthful status line (`Echo Devs · <localized preview label>`) and the
  existing back-to-top destination. No copyright, legal identity, cloud/uptime or availability
  claim is invented.
- Unverified contact handles stay omitted; the truthful “awaiting owner verification” note and a
  real inquiry-form link preserve the column’s visual weight.

## Truthful substitutions (intentional)
| Reference | Replacement | Reason |
|---|---|---|
| “New projects open” pulse badge | “Project intake by scope agreement” | Availability is unverified |
| `Clean Architecture` badge | “Maintainable architecture” | Same approach without a methodology claim |
| Email / Telegram / GitHub rows | Owner-verification note + inquiry link | Contact channels unverified |
| `© 2025 …` + “stable cloud infrastructure” | `Echo Devs · Development preview` | Legal identity and infrastructure unverified |
| Header subtitle on <1280px | Hidden below 1280px | Keeps the fixed bar from growing/wrapping |

## Reused reference markup
Brand tile/wordmark/chip arrangement, nav label spacing, segmented language pill, circular theme
treatment, header 80px bar, footer 5/3/4 grid, monospace section headings, badge shapes, and the
bottom status bar are close translations of the original Tailwind classes into existing tokens.
`BrandMark` still uses the approved SVG path.

## Files
- `src/components/layout/header.tsx` — composition, six destinations, segmented locale links
- `src/components/ui/theme-control.tsx` — new icon theme control (`theme-select.tsx` removed)
- `src/components/layout/mobile-nav.tsx` — desktop breakpoint aligned to 1024px
- `src/components/marketing/marketing-footer.tsx` — three-column reference footer
- `src/content/chrome.ts` — localized tagline/footer labels (new)
- `src/styles/header.css` — header, brand, nav, language, theme, footer chrome link scoping
- `src/styles/homepage.css` — footer styles; duplicated header overrides removed
- `src/styles/tokens.css` — `--color-on-brand` for the brand tile in both themes
- `tests/unit/header.test.tsx`, `tests/unit/footer.test.tsx` (new), and fragment/destination
  assertions in `tests/unit/{services,work,work-details}.test.tsx`

## Verification (actual)
- `npm test` — 134 tests / 14 files passed (baseline before batch: 126 / 13).
- `npm run lint` — passed, zero warnings.
- `npm run typecheck` — passed.
- `npm run build` — passed, 22 static pages generated.
- `npm run test:http` — passed for fa/en/ar home, services, work and three concept detail routes,
  including every absolute/fragment link resolving to a 200 destination with an existing `id`.
- `npm run verify:reference` — original `code.html`, `screen.png`, `DESIGN.md` hashes unchanged.
- No browser executable is available; rendered HTML/CSS only. No pixel comparison was performed.

## Remaining browser acceptance
1024/1280/1440 header fit (especially fa with six Persian labels), 320/375 brand/menu fit,
LTR/RTL segmented control order, dark-theme material, sticky/translucent contrast over content,
dialog focus containment with the new controls, and zoom/reflow at 200%.
