import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/styles/tokens.css", "utf8");
function palette(selector: string) {
  const block = source.slice(source.indexOf(selector)).split("}")[0];
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

describe.each(["light", "dark"])("%s semantic palette", (theme) => {
  const colors = palette(`[data-theme="${theme}"]`);
  it("provides the same roles in both themes", () => {
    expect(Object.keys(colors).sort()).toEqual(Object.keys(palette('[data-theme="light"]')).sort());
  });
  it.each(["background", "surface"])("meets AA text and control contrast on %s", (surface) => {
    for (const text of ["text", "muted", "action", "action-hover", "action-active", "error", "success"]) {
      expect(contrast(colors[text], colors[surface]), `${theme}: ${text}/${surface}`).toBeGreaterThanOrEqual(4.5);
    }
    for (const control of ["control-border", "focus"]) {
      expect(contrast(colors[control], colors[surface]), `${theme}: ${control}/${surface}`).toBeGreaterThanOrEqual(3);
    }
  });
  it("meets AA in every filled action state and keeps disabled text legible", () => {
    for (const state of ["action", "action-hover", "action-active"]) {
      expect(contrast(colors["on-action"], colors[state]), state).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(colors["disabled-text"], colors["disabled-background"])).toBeGreaterThanOrEqual(4.5);
  });
  it("keeps homepage text readable over modeled glass and preview surfaces", () => {
    // sRGB compositing approximation, not a rendered-pixel/browser audit.
    const backdrop = mix(colors.brand, colors.background, .12);
    const band = mix(colors.surface, backdrop, .18);
    const fill = theme === "light" ? colors.surface : colors.background;
    const alpha = theme === "light" ? .28 : .35;
    const glass = mix(fill, backdrop, alpha);
    const inquiryPanel = mix(colors.surface, glass, .6);
    const surfaces = [glass, mix(fill, band, alpha), inquiryPanel,
      mix(colors.surface, inquiryPanel, .82), mix(colors.surface, backdrop, .85),
      mix(colors.brand, colors.surface, .1), mix(colors.text, colors.background, .07)];
    for (const surface of surfaces) {
      for (const role of ["text", "muted", "action"]) expect(contrast(colors[role], surface), `${theme}: ${role} over ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

it("keeps primitive colors semantic and layout direction-neutral", () => {
  const css = readFileSync("src/styles/primitives.css", "utf8") + readFileSync("src/styles/header.css", "utf8");
  expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(/i);
  expect(css).not.toMatch(/(?:margin|padding|border)-(?:left|right)|text-align:\s*(?:left|right)/);
  expect(css).toContain("var(--target-size)");
  expect(readFileSync("src/styles/globals.css", "utf8")).toContain(":focus-visible");
});

it("hosts only licensed local font files with swap and required script subsets", () => {
  const css = readFileSync("src/styles/fonts.css", "utf8");
  const urls = [...css.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]);
  expect(urls).toHaveLength(6);
  for (const url of urls) {
    expect(url).toMatch(/^\/fonts\/vazirmatn-(arabic|latin)-(400|500|700)-normal\.woff2$/);
    expect(existsSync(`public${url}`)).toBe(true);
    expect(readFileSync(`public${url}`).subarray(0, 4).toString()).toBe("wOF2");
  }
  expect(css.match(/font-display: swap/g)).toHaveLength(6);
  expect(readFileSync("public/fonts/OFL.txt", "utf8")).toContain("SIL OPEN FONT LICENSE");
});
