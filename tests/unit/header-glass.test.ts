import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const headerCss = readFileSync("src/styles/header.css", "utf8");
const glass = /\.site-header::before\s*\{([^}]*)\}/u.exec(headerCss)?.[1] ?? "";

// ECHO-VF01 owner finding: scrolled copy ghosted through the 82% translucent
// sticky header and reduced navigation readability. Keep the glass material but
// raise the fill and blur so legibility does not depend on the effect alone.
describe("ECHO-VF01 sticky-header glass legibility", () => {
  it("keeps a translucent fill that is opaque enough to hide scrolled copy", () => {
    const alpha = /color-mix\(in srgb, var\(--color-background\) (\d+)%, transparent\)/u.exec(glass)?.[1];
    expect(alpha).toBeDefined();
    expect(Number(alpha)).toBeGreaterThanOrEqual(88);
    expect(Number(alpha)).toBeLessThan(100);
    expect(Number(/blur\((\d+)px\)/u.exec(glass)?.[1])).toBeGreaterThanOrEqual(12);
  });

  it("declares the backdrop filter for WebKit and the standard property", () => {
    expect(glass).toContain("-webkit-backdrop-filter:");
    expect(glass).toContain("backdrop-filter:");
    expect(headerCss).toContain("position: sticky");
    expect(headerCss).toContain("background: transparent;");
  });
});
