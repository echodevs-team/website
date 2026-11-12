import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homepage = readFileSync("src/styles/homepage.css", "utf8");
const tokens = readFileSync("src/styles/tokens.css", "utf8");

function palette(theme: "light" | "dark") {
  const block = tokens.slice(tokens.indexOf(`[data-theme="${theme}"]`)).split("}")[0];
  return Object.fromEntries([...block.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6});/g)]
    .map((match) => [match[1], match[2]]));
}
function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map((n) => parseInt(n, 16) / 255)
    .map((n) => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
function mix(a: string, b: string, alpha: number) {
  return "#" + [1, 3, 5].map((offset) => Math.round(parseInt(a.slice(offset, offset + 2), 16) * alpha + parseInt(b.slice(offset, offset + 2), 16) * (1 - alpha)).toString(16).padStart(2, "0")).join("");
}
function accents(pattern: RegExp) {
  return Object.fromEntries([...homepage.matchAll(pattern)].map((match) => [match[1], match[2]]));
}

describe("homepage liquid-glass material", () => {
  it("keeps a solid surface before layering the reference blur", () => {
    const base = homepage.match(/\.home-glass \{[^}]*\}/)?.[0] ?? "";
    expect(base).toContain("background: var(--color-surface);");
    expect(base).toContain("border: 1px solid");
    expect(homepage.indexOf(".home-glass {")).toBeLessThan(homepage.indexOf("@supports ((backdrop-filter: blur(4px))"));
    expect(homepage).toContain("backdrop-filter: blur(4px) saturate(140%)");
    expect(homepage).toContain("-webkit-backdrop-filter: blur(4px) saturate(140%)");
    expect(homepage).toContain("background: color-mix(in srgb, var(--color-surface) 28%, transparent)");
    expect(homepage).toContain("background: color-mix(in srgb, var(--color-background) 35%, transparent)");
    expect(homepage).toMatch(/@supports not \(\(backdrop-filter: blur\(8px\)\) or \(-webkit-backdrop-filter: blur\(8px\)\)\)/);
  });
  it("provides an opaque fallback and removes motion when backdrop filters or motion are unavailable", () => {
    const inquiry = homepage.match(/\.inquiry-form \{[^}]*\}/)?.[0] ?? "";
    expect(inquiry).toContain("background: var(--color-surface);");
    expect(homepage.slice(homepage.lastIndexOf("@media (prefers-reduced-motion: reduce)"))).toContain("transition: none");
  });
});

describe.each(["light", "dark"] as const)("%s concept accents", (theme) => {
  const colors = palette(theme);
  const values = theme === "light"
    ? accents(/^\.concept-visual\.(analytics|chat|booking) \{ --concept-accent: (#[0-9a-f]{6}); \}$/gm)
    : accents(/^\[data-theme="dark"\] \.concept-visual\.(analytics|chat|booking) \{ --concept-accent: (#[0-9a-f]{6}); \}$/gm);

  it("keeps every badge and preview status readable on its tinted surface", () => {
    expect(Object.keys(values).sort()).toEqual(["analytics", "booking", "chat"]);
    for (const [name, accent] of Object.entries(values)) {
      expect(contrast(accent, mix(accent, colors.surface, .08)), `${theme}: ${name} badge`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(accent, mix(accent, colors.surface, .1)), `${theme}: ${name} status`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

it("uses the reference hero scale, glass secondary action and direction-neutral text", () => {
  expect(homepage).toContain(".hero-copy h1 { font-size: 2.25rem; line-height: 1.3;");
  expect(homepage).toMatch(/@media \(min-width: 40rem\) \{[\s\S]*?\.hero-copy h1 \{ font-size: 3rem; \}/);
  expect(homepage).toMatch(/@media \(min-width: 64rem\) \{[\s\S]*?\.hero-copy h1 \{ font-size: 3\.75rem; \}/);
  expect(homepage).toContain(":lang(en) .hero-copy h1");
  expect(homepage).toContain("background: color-mix(in srgb, var(--color-surface) 80%, transparent)");
  expect(homepage).toContain(".eyebrow-dot::before");
  expect(homepage).not.toMatch(/text-align:\s*(left|right)/);
});

it("keeps the section rail on an accessible target size without claiming scroll state", () => {
  const component = readFileSync("src/components/marketing/homepage.tsx", "utf8");
  expect(homepage).toContain(".section-rail { display: none; }");
  expect(homepage).toMatch(/\.section-rail a \{[^}]*inline-size: 2\.75rem; block-size: 2\.75rem;/);
  expect(component + homepage).not.toMatch(/IntersectionObserver|scroll-spy|scrollspy|onScroll|data-section|\.section-rail[^}]*\.active/);
});
