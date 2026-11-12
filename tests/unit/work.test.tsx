// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Header } from "../../src/components/layout/header";
import { WorkPage } from "../../src/components/marketing/work-page";
import { Homepage } from "../../src/components/marketing/homepage";
import { getWorkItems, workContent, workKinds } from "../../src/content/work";
import { serviceIds } from "../../src/content/home";
import { locales } from "../../src/i18n/config";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  expect(typeof value).toBe("string");
  expect(String(value).trim().length).toBeGreaterThan(0);
  return typeof value;
}

describe("ECHO-402 grouped work list", () => {
  it("has complete localized copy and stable, unique item identities", () => {
    for (const locale of locales) {
      expect(shape(workContent[locale])).toEqual(shape(workContent.en));
      expect(shape(getWorkItems(locale))).toEqual(shape(getWorkItems("en")));
      const ids = getWorkItems(locale).map((item) => item.id);
      expect(ids).toEqual(getWorkItems("en").map((item) => item.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it.each(locales)("shows honest groups, concept badges and implemented destinations in %s", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path="/work" /><WorkPage locale={locale} /></>);
    const home = document.createElement("div");
    home.innerHTML = renderToStaticMarkup(<Homepage locale={locale} />);
    const t = workContent[locale];
    expect(host.querySelectorAll("main")).toHaveLength(1);
    expect(host.querySelectorAll("h1")).toHaveLength(1);
    expect(host.querySelector("h1")?.textContent).toBe(t.title);
    expect(host.querySelectorAll("[data-work-kind]")).toHaveLength(3);
    for (const kind of workKinds) {
      const section = host.querySelector(`#${kind}`)!;
      expect(section.querySelector("h2")?.textContent).toBe(t.groups[kind].title);
      expect(section.textContent).toContain(t.groups[kind].description);
      expect(section.querySelectorAll("article")).toHaveLength(kind === "concept" ? 3 : 0);
    }
    for (const item of getWorkItems(locale)) {
      expect(item.kind).toBe("concept");
      const article = host.querySelector(`#work-${item.id}`)!.closest("article")!;
      expect(article.textContent).toContain(item.description);
      expect(article.querySelector(".home-badge")?.textContent).toBe(t.groups.concept.badge);
      expect(article.textContent).toContain(t.proposedStack);
      expect(article.querySelector("a")?.getAttribute("aria-label")).toContain(item.title);
    }
    expect(host.textContent).toContain(t.stackNote);
    const ids = [...host.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const node of host.querySelectorAll("[aria-labelledby]")) expect(host.querySelector(`[id="${node.getAttribute("aria-labelledby")}"]`)).not.toBeNull();
    for (const link of host.querySelectorAll("a")) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^(#|\/(fa|en|ar)(\/(about|contact|services|work)(\/(analytics|chat|booking))?($|#)|#|$))/);
      if (href.startsWith("#")) expect(host.querySelector(`[id="${href.slice(1)}"]`)).not.toBeNull();
      else if (href.includes("#")) {
        const [pathname, id] = href.split("#");
        if (pathname.includes("/services")) expect(serviceIds).toContain(id);
        else expect(home.querySelector(`[id="${id}"]`)).not.toBeNull();
      }
    }
    for (const target of locales) expect(host.querySelector(`a[hreflang="${target}"]`)?.getAttribute("href")).toBe(`/${target}/work`);
    expect(host.querySelectorAll(`.primary-links a[href="/${locale}/work"][aria-current="page"]`)).toHaveLength(2);
    // jsdom parses noscript contents as text with scripting enabled.
    expect(host.querySelector("noscript")?.innerHTML).toContain(`href="/${locale}/work"`);
    expect(host.querySelector(`footer a[href="/${locale}/work"]`)).not.toBeNull();
    expect(host.querySelector("form, iframe, canvas")).toBeNull();
    expect(host.innerHTML).not.toMatch(/mailto:|https:\/\/|HIPAA|TOKENS:|RPS:/);
  });
  it("reuses mobile-first cards without client filtering or dependencies", () => {
    const css = readFileSync("src/styles/work.css", "utf8");
    expect(css).toContain("min-inline-size: 0");
    expect(css).toContain("flex-wrap: wrap");
    expect(css).not.toMatch(/[;{]\s*(width|left|right):/);
    expect(readFileSync("src/components/marketing/work-page.tsx", "utf8")).not.toContain('"use client"');
  });
});
