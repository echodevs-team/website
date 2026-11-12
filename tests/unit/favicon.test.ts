import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The favicon is the approved brand mark (three lines and the accent dot) on a
// charcoal tile, so it stays legible in both light and dark browser chrome.
describe("favicon assets", () => {
  it("derives the scalable icon from the approved brand mark", () => {
    const svg = readFileSync("src/app/icon.svg", "utf8");
    const mark = readFileSync("src/components/layout/brand-mark.tsx", "utf8");
    expect(svg).toContain('viewBox="0 0 32 32"');
    expect(svg).toContain('aria-label="Echo Devs"');
    expect(svg.match(/<path\b/g)).toHaveLength(3);
    expect(svg).toContain("<circle");
    expect(svg).toContain('fill="#201b14"');
    expect(svg).toContain('fill="#ee7758"');
    // Same anatomy as the header mark: three descending-length rules and a dot.
    expect(mark).toContain('d="M4 6h16M4 12h11M4 18h16"');
    expect(mark).toContain("<circle");
  });
  it("keeps a lightweight ICO fallback for browsers without SVG icon support", () => {
    const ico = readFileSync("src/app/favicon.ico");
    expect(ico.subarray(0, 4)).toEqual(Buffer.from([0, 0, 1, 0]));
    expect(ico.readUInt16LE(4)).toBe(1);
    expect([ico[6] || 256, ico[7] || 256]).toEqual([32, 32]);
    expect(ico.length).toBeLessThan(10_000);
  });
});
