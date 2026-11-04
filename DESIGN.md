# Echo Devs — Coral & Charcoal

P0 design direction, 2026-11-04. The palette/personality are accepted in SCOPE; final logo, copy and rendered previews still need owner approval (D7). This is not a claim of browser-tested design approval.

## Preserve and refine

Keep the prototype's warm surfaces, coral highlights, restrained rounded cards, generous whitespace, benefit-led hero plus technical visual, three service pillars, work, benefits, six-step process and inquiry CTA. Use selective technical character, not an always-moving dashboard. Prefer distinct section hierarchy over repeating glass cards everywhere.

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
- Default hero art can be static. If retained, decorative effects must honor reduced motion, stop when hidden and have bounded cost. No motion-dependent content.
- Preview both themes and all locales at 320/375/768/1024/1440px and 200% zoom/reflow. No screenshot or responsive result exists yet.

## Identity deliverables (not yet created)

Owner-approved distinguishable mark rather than the hamburger-like current symbol; horizontal wordmark, icon-only, light/dark, monochrome, small-size favicon and social image variants. No speculative customer logos, team portraits or compliance badges. Actual work visuals require provenance and publication permission.
