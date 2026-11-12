import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Public asset references must resolve to real files, and every published
// binary must carry distribution evidence. This is a source-level check, not a
// substitute for HTTP/visual acceptance (see `npm run test:http`).
const fontsCss = readFileSync("src/styles/fonts.css", "utf8");
const fontUrls = [...fontsCss.matchAll(/url\('([^']+)'\)/g)].map((match) => match[1]);
const publicPath = (url: string) => `public${url}`;

describe("public font assets", () => {
  it("references six self-hosted WOFF2 subsets that exist", () => {
    expect(fontUrls).toEqual([
      "/fonts/vazirmatn-arabic-400-normal.woff2",
      "/fonts/vazirmatn-arabic-500-normal.woff2",
      "/fonts/vazirmatn-arabic-700-normal.woff2",
      "/fonts/vazirmatn-latin-400-normal.woff2",
      "/fonts/vazirmatn-latin-500-normal.woff2",
      "/fonts/vazirmatn-latin-700-normal.woff2",
    ]);
    for (const url of fontUrls) {
      const file = publicPath(url);
      expect(existsSync(file), url).toBe(true);
      expect(statSync(file).size, url).toBeGreaterThan(1_000);
      expect(readFileSync(file).subarray(0, 4).toString("ascii"), url).toBe("wOF2");
    }
    expect(fontUrls.some((url) => /^https?:/.test(url))).toBe(false);
  });

  it("resolves asset URLs in every authored stylesheet, not only font declarations", () => {
    const references: string[] = [];
    for (const name of readdirSync("src/styles").filter((name) => name.endsWith(".css"))) {
      const css = readFileSync(`src/styles/${name}`, "utf8");
      for (const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
        const url = match[1];
        // Current authored styles publish only the reviewed local font assets.
        // New providers/images require evidence rather than an automatic fetch.
        expect(url, name).toMatch(/^\/fonts\/[a-z0-9-]+\.woff2$/);
        expect(existsSync(publicPath(url)), `${name}: ${url}`).toBe(true);
        references.push(url);
      }
    }
    expect(references.sort()).toEqual([...fontUrls].sort());
  });

  it("keeps provenance and license evidence beside the fonts", () => {
    const readme = readFileSync("public/fonts/README.md", "utf8");
    const license = readFileSync("public/fonts/OFL.txt", "utf8");
    expect(readme).toContain("@fontsource/vazirmatn@5.3.0");
    expect(readme).toContain("OFL 1.1");
    expect(readme).toMatch(/Arabic and Latin/);
    expect(license).toContain("SIL OPEN FONT LICENSE Version 1.1");
    expect(license).toContain("Copyright 2015 The Vazirmatn Project Authors");
  });

  it("publishes no raster marketing imagery without verified attribution", () => {
    // Raster screenshots were deliberately excluded from the approved-reference
    // population. Adding one later requires provenance review and a test update.
    const raster = readdirSync("public", { recursive: true })
      .map(String)
      .filter((file) => /\.(png|jpe?g|webp|gif|avif)$/i.test(file));
    expect(raster).toEqual([]);
  });
});
