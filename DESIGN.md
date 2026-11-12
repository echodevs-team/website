# Echo Devs — Coral & Charcoal

Owner clarification, 2026-11-05: **original `code.html` is the APPROVED UI BASELINE**, not inspiration. `design/reference/code.html` preserves it unchanged; the supplied screenshot supplements it. Approval of the design is not evidence that a reconstructed implementation has passed browser QA. This document guides faithful migration, not a replacement design system.

## Preserve and refine

Preserve the HTML's overall layout/hierarchy, section composition, warm surfaces/coral highlights, typography, spacing/proportions, card/glass treatments, hero technical visual, primary/secondary CTAs, capability strip, service pillars, concepts/work, benefits, six-step process and inquiry/footer. Preserve its interaction character where compatible with accessibility and performance. Do not replace these with a new visual concept or generic card system.

Only targeted accessibility, responsive, functional, consistency and demonstrable usability fixes are authorized. Record source-to-component deviations with reasons; seek approval for significant visual changes. Existing opaque tokens/shared components are implementation tools, not a replacement baseline: adapt them narrowly where faithful sections require it. Contrast must be checked over actual translucent surfaces. No new UI framework or token expansion without a concrete feature need.

The old Sahara/sienna/EB Garamond direction is superseded, not combined with this system. Its exact source is preserved in `design/reference/DESIGN.sahara.md`. The unmodified prototype is `design/reference/code.html`; do not ship either reference in `public/`.

## Starting semantic tokens (opaque surfaces)

| Role | Light | Dark |
|---|---|---|
| Background | `#FFF8F4` | `#181412` |
| Surface | `#FFFFFF` | `#241E1A` |
| Primary text | `#201B14` | `#FAF5EE` |
| Muted text | `#554339` | `#C9BDB5` |
| Brand / decoration | `#EE7758` | `#F38361` |
| Action fill / text link / focus | `#B84228` | `#F38361` |
| On action | `#FFFFFF` | `#181412` |
| Decorative border | `#DBC1B5` | `#594B42` |

Calculated WCAG sRGB contrast: white/original coral **2.83:1** (fails even large-text AA); charcoal/original coral 6.04:1; white/light action 5.46:1; light action/background 5.19:1; light primary/background 16.27:1; light muted/background 8.89:1; dark action/background 7.17:1; dark primary/background 16.87:1; dark muted/background 9.96:1. Reproduce with `python3 scripts/audit_reference.py`.

These are starting pairs, not a full accessibility pass. Decorative borders cannot alone identify fields. Choose visible field boundaries and focus indicators at >=3:1 against their actual adjacent surfaces. Validate hover, disabled, error and focus states and contrast over any translucency during ECHO-104/105. Never put small white text on the original coral.

## Typography, layout and interaction

- Use a licensed, locally hosted Vazirmatn family for FA/AR and an initially shared sans stack for EN, subject to Arabic shaping/native review. Verify font license/coverage before copying any assets. Remove the misleading IRANSans alias and redundant external providers. Start with regular, medium and bold only; add a Latin/mono family only if justified.
- Desktop max-width 1440px; fluid gutters about 20/40/64px, reducing nested padding on small screens. Spacing scale 4/8/12/16/24/32/40/64px; cards 16px radius, inputs/buttons 12px. Body 16px with generous script-aware line-height; fluid hero ~36–60px. These are P1 preview inputs, not an immutable pixel specification.
- Logical CSS properties; `fa/ar` RTL, `en` LTR. Isolate email/phone/code using `dir="ltr"`/`bdi`. Never letter-space connected Arabic/Persian text.
- Stable header height, no hover expansion. Keep all routes reachable through a keyboard-operable mobile menu. Visible focus, skip link, ~44px touch targets; anchors clear the header.
- One canonical form; associated labels, field descriptions/errors, pending and accessible result states. Never claim submission success without committed storage.
- Preserve the hero artwork/composition. A static rendering of the same technical visual is an allowed reduced-motion/performance fallback, not permission for unrelated replacement art. Decorative effects must honor reduced motion, stop when hidden and have bounded cost. No motion-dependent content.
- Preview both themes and all locales at 320/375/768/1024/1440px and 200% zoom/reflow. No screenshot or responsive result exists yet.

## Identity deliverables (not yet created)

Preserve the approved baseline mark/wordmark pending any explicitly approved replacement. Horizontal, icon-only, light/dark, monochrome, favicon and social variants must remain consistent. No speculative customer logos, team portraits or compliance badges. Actual work visuals require provenance and publication permission.
