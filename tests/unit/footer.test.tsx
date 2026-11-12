// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarketingFooter } from "../../src/components/marketing/marketing-footer";
import { ServicesPage } from "../../src/components/marketing/services-page";
import { chromeContent } from "../../src/content/chrome";
import { serviceIds } from "../../src/content/home";
import { servicesContent } from "../../src/content/services";
import { locales } from "../../src/i18n/config";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  expect(typeof value).toBe("string");
  expect(String(value).trim().length).toBeGreaterThan(0);
  return typeof value;
}

describe("reference footer composition", () => {
  it("keeps localized chrome copy in parity", () => {
    for (const locale of locales) expect(shape(chromeContent[locale])).toEqual(shape(chromeContent.en));
  });

  it.each(locales)("renders three columns, pillar destinations and no fabricated claims in %s", (locale) => {
    const services = servicesContent[locale];
    const chrome = chromeContent[locale];
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<MarketingFooter locale={locale} onHome />);
    const servicesHost = document.createElement("div");
    servicesHost.innerHTML = renderToStaticMarkup(<ServicesPage locale={locale} />);
    const footer = host.querySelector("footer")!;

    expect(footer.querySelectorAll(".footer-columns > *")).toHaveLength(3);
    expect(footer.querySelector(".footer-brand .brand-mark")).not.toBeNull();
    expect(footer.querySelector(".footer-brand .brand-chip")?.textContent).toBe("اکو دوز");
    expect(footer.textContent).toContain(chrome.footer.intake);
    expect(footer.textContent).toContain(chrome.footer.architecture);
    expect(footer.querySelectorAll(".footer-badge")).toHaveLength(2);

    for (const id of serviceIds) {
      const link = footer.querySelector(`a[href="/${locale}/services#${id}"]`);
      expect(link?.textContent).toBe(services.pillars[id].title);
      expect(servicesHost.querySelector(`#${id}`)).not.toBeNull();
    }
    expect(footer.querySelector(`a[href="/${locale}/work"]`)?.textContent).toBe(chrome.footer.demos);
    expect(footer.querySelector(`a[href="/${locale}/contact"]`)).not.toBeNull();
    expect(footer.querySelector(`a[href="/${locale}/privacy"]`)?.textContent).toBeTruthy();
    expect(footer.querySelector(`a[href="#hero"]`)?.textContent).toContain("↑");
    // Unverified legal, contact and infrastructure claims stay out of the shared shell.
    expect(footer.innerHTML).not.toMatch(/mailto:|https?:\/\/|©|HIPAA|24\/7|SLA|contact@|github|telegram/i);
  });

  it.each(locales)("keeps off-home footer destinations absolute and implemented in %s", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<MarketingFooter locale={locale} />);
    expect(host.querySelector(`a[href="/${locale}/contact"]`)).not.toBeNull();
    expect(host.querySelector(`a[href="/${locale}/privacy"]`)).not.toBeNull();
    expect(host.querySelector(`a[href="/${locale}#hero"]`)).not.toBeNull();
    for (const link of host.querySelectorAll("a")) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^\/(fa|en|ar)(\/(about|contact|privacy|services|work)(#[a-z]+)?|#[a-z-]+)?$/);
    }
    const ids = [...host.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("scopes link-decoration changes to the shared chrome", () => {
    expect(readFileSync("src/styles/globals.css", "utf8")).toMatch(/a\s*\{[^}]*text-decoration:\s*underline/);
    expect(readFileSync("src/styles/header.css", "utf8")).toMatch(/\.site-header a\s*\{[^}]*text-decoration:\s*none/);
    expect(readFileSync("src/styles/homepage.css", "utf8")).toMatch(/\.home-footer a\s*\{[^}]*text-decoration:\s*none/);
  });
});
