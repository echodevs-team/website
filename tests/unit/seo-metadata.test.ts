import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aboutContent } from "../../src/content/about";
import { contactContent } from "../../src/content/contact";
import { homeContent } from "../../src/content/home";
import { privacyContent } from "../../src/content/privacy";
import { servicesContent } from "../../src/content/services";
import { workContent } from "../../src/content/work";
import { getWorkDetail, workSlugs } from "../../src/content/work-details";
import { locales } from "../../src/i18n/config";
import { MARKETING_PATHS, PREVIEW_ROBOTS, robotsPolicy, sitemapEntries } from "../../src/lib/seo/policy";
import { localizedAlternates, localizedUrl, parseSiteOrigin } from "../../src/lib/seo/site";

const ORIGIN = "https://www.echo-devs.example";

function metadataSource(path: string) {
  return readFileSync(`src/app/${path}`, "utf8");
}

describe("ECHO-506 approved-origin policy", () => {
  it("accepts only an absolute HTTPS public origin and rejects unsafe values", () => {
    expect(parseSiteOrigin("https://echo-devs.com")).toBe("https://echo-devs.com");
    expect(parseSiteOrigin("  https://www.echo-devs.com  ")).toBe("https://www.echo-devs.com");
    for (const rejected of [
      undefined, null, "", "echo-devs.com", "http://echo-devs.com", "ftp://echo-devs.com",
      "https://localhost", "https://localhost:443", "https://127.0.0.1", "https://0.0.0.0",
      "https://[::1]", "https://preview.localhost", "https://app.local", "https://service.internal",
      "https://echo.test", "https://echo.example", "https://echo-devs.com/path", "https://echo-devs.com?q=1",
      "https://echo-devs.com#frag", "https://user:pass@echo-devs.com", "https://echo-devs.com:8443",
      "https://192.168.1.10", "https://10.0.0.1", "https://intranet",
    ]) {
      expect(parseSiteOrigin(rejected), String(rejected)).toBeNull();
    }
  });

  it("resolves locale paths without query, fragment or traversal", () => {
    expect(localizedUrl(ORIGIN, "fa")).toBe(`${ORIGIN}/fa`);
    expect(localizedUrl(ORIGIN, "en", "/work/chat")).toBe(`${ORIGIN}/en/work/chat`);
    expect(() => localizedUrl(ORIGIN, "en", "work")).toThrow();
    expect(() => localizedUrl(ORIGIN, "en", "/work/chat?x=1")).toThrow();
    expect(() => localizedUrl(ORIGIN, "en", "/work/chat#x")).toThrow();
    expect(() => localizedUrl(ORIGIN, "en", "//evil.example")).toThrow();
  });

  it("withholds canonical and hreflang while no approved origin exists", () => {
    expect(localizedAlternates("fa", "/services", null)).toBeUndefined();
    const alternates = localizedAlternates("en", "/services", ORIGIN);
    expect(alternates).toEqual({
      canonical: `${ORIGIN}/en/services`,
      languages: {
        fa: `${ORIGIN}/fa/services`,
        en: `${ORIGIN}/en/services`,
        ar: `${ORIGIN}/ar/services`,
      },
    });
    expect(alternates).not.toHaveProperty("x-default");
    expect(JSON.stringify(alternates)).not.toContain("x-default");
  });

  it("keeps concept-detail slugs intact in alternates", () => {
    for (const slug of workSlugs) {
      const alternates = localizedAlternates("ar", `/work/${slug}`, ORIGIN);
      expect(alternates).toEqual({
        canonical: `${ORIGIN}/ar/work/${slug}`,
        languages: Object.fromEntries(locales.map((locale) => [locale, `${ORIGIN}/${locale}/work/${slug}`])),
      });
    }
    expect(getWorkDetail("en", "missing")).toBeUndefined();
    for (const invalid of ["missing", "Analytics", "__proto__", "constructor", "analytics/extra", ""]) {
      expect(getWorkDetail("en", invalid)).toBeUndefined();
    }
  });
});

describe("ECHO-506 robots and sitemap policy", () => {
  it("withholds crawling and the sitemap in preview", () => {
    expect(robotsPolicy(null, false)).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
    expect(robotsPolicy(ORIGIN, false)).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
    expect(sitemapEntries(null, false)).toEqual([]);
    expect(sitemapEntries(ORIGIN, false)).toEqual([]);
    expect(JSON.stringify(robotsPolicy(null, false))).not.toContain("localhost");
    expect(JSON.stringify(sitemapEntries(null, false))).not.toContain("localhost");
  });

  it("publishes only after an approved origin and explicit indexing gate", () => {
    const policy = robotsPolicy(ORIGIN, true);
    expect(policy).toEqual({
      rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
      sitemap: `${ORIGIN}/sitemap.xml`,
    });
    const entries = sitemapEntries(ORIGIN, true);
    expect(entries).toHaveLength(MARKETING_PATHS.length * locales.length);
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.url.startsWith(`${ORIGIN}/`)).toBe(true);
      expect(entry.url).not.toMatch(/localhost|127\.0\.0\.1|\.local\b/u);
      expect(Object.keys(entry.alternates?.languages ?? {})).toEqual(["fa", "en", "ar"]);
    }
    expect(entries.map((entry) => entry.url)).toContain(`${ORIGIN}/en/work/chat`);
    expect(entries.some((entry) => entry.url.includes("/api/"))).toBe(false);
  });

  it("ships preview-safe robots and sitemap routes", () => {
    expect(readFileSync("src/app/robots.ts", "utf8")).toContain("robotsPolicy()");
    expect(readFileSync("src/app/sitemap.ts", "utf8")).toContain("sitemapEntries()");
    expect(PREVIEW_ROBOTS).toEqual({ index: false, follow: false });
  });
});

describe("ECHO-506 metadata coverage for every localized route family", () => {
  const families = [
    ["[locale]/(marketing)/page.tsx", "/"],
    ["[locale]/(marketing)/services/page.tsx", "/services"],
    ["[locale]/(marketing)/work/page.tsx", "/work"],
    ["[locale]/(marketing)/about/page.tsx", "/about"],
    ["[locale]/(marketing)/contact/page.tsx", "/contact"],
    ["[locale]/(marketing)/privacy/page.tsx", "/privacy"],
  ] as const;

  it.each(families)("wires localized alternates for %s", (file, path) => {
    const source = metadataSource(file);
    expect(source).toContain(`localizedAlternates(locale, "${path}")`);
    expect(source).toContain("PREVIEW_ROBOTS");
    expect(source).not.toMatch(/headers\(\)|x-forwarded-host|request\.headers/u);
  });

  it("wires the concept-detail path and keeps invalid slugs non-public", () => {
    const source = metadataSource("[locale]/(marketing)/work/[slug]/page.tsx");
    expect(source).toContain("localizedAlternates(locale, `/work/${item.slug}`)");
    expect(source).toContain("if (!isLocale(locale) || !item) return { robots: PREVIEW_ROBOTS }");
    expect(source).not.toMatch(/headers\(\)|x-forwarded-host|request\.headers/u);
  });

  it("uses a consistent localized title template and preview noindex", () => {
    const layout = metadataSource("[locale]/layout.tsx");
    expect(layout).toContain("template: `%s — ${SITE_NAME}`");
    expect(layout).toContain("default: `${t(\"title\")} — ${t(\"preview\")}`");
    expect(layout).toContain("robots: PREVIEW_ROBOTS");
    expect(layout).toContain("lang={locale}");
    expect(layout).toContain("dir={direction(locale)}");
    const policy = readFileSync("src/lib/seo/policy.ts", "utf8");
    expect(policy).toContain("index: false, follow: false");
    expect(policy).toContain('process.env.ECHO_PUBLIC_INDEXING === "true"');
  });

  it.each(locales)("keeps every %s description present and unique", (locale) => {
    const descriptions = [
      homeContent[locale].lead,
      servicesContent[locale].description,
      workContent[locale].description,
      aboutContent[locale].description,
      contactContent[locale].description,
      privacyContent[locale].description,
      ...workSlugs.map((slug) => getWorkDetail(locale, slug)?.description ?? ""),
    ];
    expect(descriptions).toHaveLength(9);
    for (const description of descriptions) expect(description.trim().length).toBeGreaterThan(20);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("never derives SEO URLs from a request host", () => {
    for (const file of ["site.ts", "policy.ts"]) {
      const source = readFileSync(`src/lib/seo/${file}`, "utf8");
      expect(source).not.toMatch(/\bheaders\s*\(/u);
      expect(source).not.toMatch(/x-forwarded-host|\bhost\b\s*:/iu);
      expect(source).not.toContain("localhost:3000");
    }
  });
});
