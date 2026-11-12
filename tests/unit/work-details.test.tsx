// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Header } from "../../src/components/layout/header";
import { WorkDetailPage } from "../../src/components/marketing/work-detail-page";
import { WorkPage } from "../../src/components/marketing/work-page";
import { Homepage } from "../../src/components/marketing/homepage";
import { ServicesPage } from "../../src/components/marketing/services-page";
import { getWorkDetail, workDetailContent, workSlugs } from "../../src/content/work-details";
import { workContent } from "../../src/content/work";
import { locales } from "../../src/i18n/config";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  expect(typeof value).toBe("string");
  expect(String(value).trim()).not.toBe("");
  return typeof value;
}

describe("ECHO-403 concept details", () => {
  it("restores visible ordered workflow markers after the base list reset", () => {
    const css = readFileSync("src/styles/work.css", "utf8");
    const rule = /\.work-workflow\s*\{([^}]+)\}/.exec(css)?.[1];
    expect(rule).toMatch(/list-style-type:\s*decimal\s*;/);
    expect(css).toMatch(/\.work-workflow\s*>\s*li\s*\{\s*display:\s*list-item;/);
    expect(css).toMatch(/\.work-workflow li::marker\s*\{\s*color:\s*var\(--color-action\)/);
  });
  it("has complete locale parity and an explicit slug allowlist", () => {
    for (const locale of locales) {
      expect(shape(workDetailContent[locale])).toEqual(shape(workDetailContent.en));
      for (const slug of ["missing", "Analytics", "__proto__", "constructor", "analytics/extra", ""]) expect(getWorkDetail(locale, slug)).toBeUndefined();
    }
    const route = readFileSync("src/app/[locale]/(marketing)/work/[slug]/page.tsx", "utf8");
    expect(route).toContain("dynamicParams = false");
    expect(route).toContain("if (!item) notFound()");
    expect(route).toContain("workSlugs.map");
  });
  it.each(locales)("renders all concept sections, shared shell, safe links and equivalent locale paths in %s", (locale) => {
    const t = workDetailContent[locale];
    const index = renderToStaticMarkup(<WorkPage locale={locale} />);
    const home = document.createElement("div");
    home.innerHTML = renderToStaticMarkup(<><Homepage locale={locale} /><ServicesPage locale={locale} /></>);
    for (const slug of workSlugs) {
      const item = getWorkDetail(locale, slug)!;
      expect(item.kind).toBe("concept");
      expect(item).not.toHaveProperty("results");
      expect(item).not.toHaveProperty("liveUrl");
      expect(item).not.toHaveProperty("sourceUrl");
      expect(index).toContain(`href="/${locale}/work/${slug}"`);
      const host = document.createElement("div");
      host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path={`/work/${slug}`} /><WorkDetailPage locale={locale} item={item} /></>);
      expect(host.querySelectorAll("h1")).toHaveLength(1);
      expect(host.querySelector("h1")?.textContent).toBe(item.title);
      expect(host.querySelector("main")?.getAttribute("tabindex")).toBe("-1");
      expect(host.querySelector(".home-badge")?.textContent).toBe(workContent[locale].groups.concept.badge);
      for (const copy of [t.notice, t.contributionNote, t.visualNote, item.problem, item.solution, item.limitations, ...item.capabilities, ...item.workflow]) expect(host.textContent).toContain(copy);
      expect(host.querySelectorAll(".work-workflow > li")).toHaveLength(3);
      expect(host.querySelector("figure figcaption")?.textContent).toContain(t.visualNote);
      expect(host.querySelector(`.concept-visual.${slug}`)).not.toBeNull();
      expect(host.querySelector("header .theme-control")).not.toBeNull();
      expect(host.querySelector("footer")).not.toBeNull();
      expect(host.querySelector("form, iframe, canvas")).toBeNull();
      const ids = [...host.querySelectorAll("[id]")].map((node) => node.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const node of host.querySelectorAll("[aria-labelledby]")) expect(host.querySelector(`[id="${node.getAttribute("aria-labelledby")}"]`)).not.toBeNull();
      for (const target of locales) {
        expect(host.querySelector(`a[hreflang="${target}"]`)?.getAttribute("href")).toBe(`/${target}/work/${slug}`);
        expect(host.querySelector("noscript")?.innerHTML).toContain(`href="/${target}/work/${slug}"`);
      }
      for (const link of host.querySelectorAll("a")) {
        const href = link.getAttribute("href")!;
        expect(href).toMatch(/^(#|\/(fa|en|ar)(\/(about|contact|services|work)(\/(analytics|chat|booking))?($|#)|#|$))/);
        if (href.includes("#")) expect(home.querySelector(`[id="${href.split("#")[1]}"]`)).not.toBeNull();
      }
      expect(host.innerHTML).not.toMatch(/mailto:|https:\/\/|HIPAA|TOKENS:|RPS:/);
    }
  });
});
