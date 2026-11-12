// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ServicesPage } from "../../src/components/marketing/services-page";
import { Header } from "../../src/components/layout/header";
import { Homepage } from "../../src/components/marketing/homepage";
import { servicesContent } from "../../src/content/services";
import { serviceIds } from "../../src/content/home";
import { locales } from "../../src/i18n/config";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  expect(typeof value).toBe("string");
  expect(String(value).trim().length).toBeGreaterThan(0);
  return typeof value;
}

describe("ECHO-401 services", () => {
  it("has complete content parity including nested service scopes", () => {
    expect(shape(servicesContent.fa)).toEqual(shape(servicesContent.en));
    expect(shape(servicesContent.ar)).toEqual(shape(servicesContent.en));
  });
  it.each(locales)("renders outcome, scope, deliverables, example, exclusions and a real CTA for each pillar in %s", (locale) => {
    const t = servicesContent[locale];
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path="/services" /><ServicesPage locale={locale} /></>);
    const home = document.createElement("div");
    home.innerHTML = renderToStaticMarkup(<Homepage locale={locale} />);
    expect(host.querySelectorAll("main")).toHaveLength(1);
    expect(host.querySelectorAll("h1")).toHaveLength(1);
    expect(host.querySelector("h1")?.textContent).toBe(t.title);
    expect(host.querySelectorAll(".services-subservices > li")).toHaveLength(12);
    expect(host.querySelector("form")).toBeNull(); // reuse the existing homepage destination, not another intake
    expect(host.querySelector("footer")).not.toBeNull();
    for (const id of serviceIds) {
      const section = host.querySelector(`#${id}`)!;
      const pillar = t.pillars[id];
      expect(section.querySelector("h2")?.textContent).toBe(pillar.title);
      for (const copy of [pillar.outcome, pillar.example, pillar.boundaries, ...pillar.deliverables]) expect(section.textContent).toContain(copy);
      for (const item of pillar.services) {
        expect(section.textContent).toContain(item.title);
        expect(section.textContent).toContain(item.scope);
      }
      expect(section.querySelector('a')?.getAttribute("href")).toBe(`/${locale}#contact`);
      expect(section.querySelector('a')?.getAttribute("aria-label")).toContain(pillar.title);
      expect(home.querySelector(`a[href="/${locale}/services#${id}"]`)).not.toBeNull();
    }
    const ids = [...host.querySelectorAll("[id]")].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const section of host.querySelectorAll("section")) expect(host.querySelector(`[id="${section.getAttribute("aria-labelledby")}"]`)).not.toBeNull();
    for (const link of host.querySelectorAll("a")) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^(#|\/(fa|en|ar)(\/(about|contact|services|work)|#|$))/);
      if (href.startsWith("#")) expect(host.querySelector(`[id="${href.slice(1)}"]`)).not.toBeNull();
      else if (href.includes("#")) {
        const [pathname, id] = href.split("#");
        const scope = pathname.includes("/services") ? host : home;
        expect(scope.querySelector(`[id="${id}"]`)).not.toBeNull();
      }
    }
    for (const target of locales) expect(host.querySelector(`a[hreflang="${target}"]`)?.getAttribute("href")).toBe(`/${target}/services`);
    expect(host.innerHTML).not.toMatch(/mailto:|https:\/\/|<iframe|<canvas/);
  });
  it("uses mobile-first logical layout without fixed widths or new client islands", () => {
    const css = readFileSync("src/styles/services.css", "utf8");
    expect(css).toContain("minmax(0, 1fr)");
    expect(css).toContain("min-inline-size: 0");
    expect(css).toContain("flex-wrap: wrap");
    expect(css).not.toMatch(/[;{]\s*(width|left|right):/);
    expect(readFileSync("src/components/marketing/services-page.tsx", "utf8")).not.toContain('"use client"');
  });
});
