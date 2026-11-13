# ECHO-503 owner visual follow-ups

The owner reviewed the ECHO-503 screenshots and confirmed the issues below.
Findings #1–#3 were resolved by the authorized **ECHO-VF01** batch; #4–#6 remain
deferred to their assigned tasks.

| # | Finding | Likely task | Status |
| --- | --- | --- | --- |
| 1 | Mobile sticky header bleeds through scrolled content and reduces readability. | ECHO-VF01 (was ECHO-601/608) | **Resolved in ECHO-VF01** — fill 90% + 16px blur (WebKit-prefixed), measured before/after |
| 2 | Empty states before the concept studies on Work are excessively prominent. | ECHO-VF01 (was ECHO-608) | **Resolved in ECHO-VF01** — concept studies lead; empty groups compact |
| 3 | About page copy reads like internal verification commentary. | ECHO-VF01 (was owner/native copy + ECHO-608) | **Resolved in ECHO-VF01**, copy corrected again in **ECHO-VF01-R1** — no unverified team size in FA/EN/AR |
| 4 | The 404 experience is minimal (no full header or back link). | ECHO-506 | Deferred |
| 5 | Decorative arrow direction may be inappropriate in RTL. | ECHO-608; noted in `docs/P5-ECHO-503.md` | Deferred |
| 6 | Full-theme and reference-fidelity acceptance is incomplete. | ECHO-601 / ECHO-605 / ECHO-608 | Deferred |

## ECHO-VF01 evidence for #1–#3

Report: `docs/ECHO-VF01.md`. Evidence bundle:
`test-results/echo-vf01-visual-evidence.zip` (3,847,495 bytes, CRC- and
PNG-verified; before `8e8f746`, after commits `70e414f`, `dd88984`, `2abcdfc`).
WebKitGTK 2.52.6 / Xvfb, FA/EN/AR, light+dark, 320/375/768/1024/1440 widths,
25 before + 25 after full-viewport captures, 146/167 harness checks.

Caveats recorded there and not glossed over:

- this stack renders no backdrop blur, so the screenshots show the opacity layer
  only; blur rendering needs an owner GPU-browser check;
- at 375 px the Work concept section is in the first viewport but the first card
  is 30–31 px below the fold in FA/EN (visible in AR);
- the bundle is review evidence, not owner sign-off.

## ECHO-VF01-R1 follow-up

Report: `docs/ECHO-VF01-R1.md`. The independent review of those screenshots found
that the regenerated About heading had reintroduced an unverified team size; R1
removes it in all three locales and guards it with a content test. It also fixes
the harness URL bug that recorded `/facontact` instead of `/fa/contact`.

Finding #1's GPU half is unchanged: the VM renders no backdrop blur. It is now a
registered manual case, **`MANUAL-FIREFOX-GLASS`**, with a step-by-step Fedora
procedure in `docs/QA-SYSTEM.md`. It remains NOT_RUN until a human records it;
WebKitGTK screenshots are not accepted as its evidence.

#4–#6 were not touched by ECHO-VF01. Do not mark them resolved without browser
verification and owner sign-off. This file is a tracking aid, not an acceptance
record.
