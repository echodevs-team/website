# Frozen extracted source reference

**Owner clarification, 2026-11-05:** `code.html` is the approved authoritative UI
baseline, not merely inspiration. Reconstruct it faithfully in Next.js; keep
these original bytes untouched. Browser captures remain outstanding acceptance
evidence, but their absence does not block homepage or inquiry implementation.
Current delivery order is in ROADMAP; older narrow first-batch exceptions below
are historical and superseded for implementation, not proof of browser approval.

Captured 2026-11-04 from the project-root `code.html` (79,104 bytes) and legacy `DESIGN.md` (1,441 bytes). Byte-identical copies were verified before replacing the active design brief. SHA-256 hashes are in `SHA256SUMS`; run `sha256sum -c SHA256SUMS` from this directory. Original source copies have read-only file permissions; hashes detect changes but do not prove provenance or enforce storage-level immutability.

The original archive/assets are now supplied in `original/`. ECHO-001 verification passed: archive SHA-256 `658daaf9def5badf3b9c061f8e669d0980b91cae6fe76975324def7f01bd050b`, exactly three members (`code.html`, `screen.png`, `DESIGN.md`), valid CRCs and byte-identical extracted/frozen HTML and legacy design. All original inputs are read-only; hashes detect changes but are not a signature of provenance. Member hashes are in `original/SHA256SUMS`; run `npm run verify:reference` or `python3 scripts/verify_original.py` from project root. Image SHA-256 `ad99ac9ebce18e484454baa17de048f9f51753e0d77055936126185800889731`, 442×1600, visually inspected as the supplied reference, not an actual-browser capture.

Never edit these source copies or put this directory in production assets. The root `code.html` is also preserved unchanged. It includes unverified claims and external CDN requests; opening it may contact third-party font/CDN services. No external requests were made during the initial static audit. The follow-up requested only public browser tooling/distribution resources, not project/customer endpoints; see `../../docs/P0-FINALIZATION.md`.

## Browser baseline outstanding (ECHO-003)

Initially no browser executable or local Playwright/Selenium package was found. Follow-up installed Playwright in `/tmp/opencode/echo-p0-browser`, but Chromium download timed out and sandbox-enabled launch confirmed a missing executable. No browser screenshot was captured. Current owner authorization permits faithful reconstruction while capture/comparison remains outstanding; no repeated browser downloads. Use the existing Fedora browser via localhost-only SSH forwarding if needed. Serve **this directory only**, e.g. `python3 -m http.server 8765 --bind 127.0.0.1 --directory design/reference` from project root. Stop after review; never expose repository root, environment files or a public share link. Do not disable browser sandboxing or modify isolation.

Capture actual browser full-page and first-viewport screenshots at desktop 1440×1000 and mobile 375×812, plus 320/768/1024 widths, both themes, reduced motion and 200% zoom. Record browser/version, device scale, font readiness, viewport, theme, CDN/network failures, console errors and time. The animation is random/time-dependent: capture timing is not pixel-deterministic; use a separately labeled motion-disabled comparison without altering the frozen source. Only compare to `screen.png` once actually supplied; distinguish missing styles/fonts from intentional design deltas. Add artifact paths and observed deltas to the P0 audit before completing ECHO-003. Do not claim static source inspection as browser validation.
