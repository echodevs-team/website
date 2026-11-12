// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Header } from "../../src/components/layout/header";
import { AboutPage } from "../../src/components/marketing/about-page";
import { aboutContent } from "../../src/content/about";
import { serviceIds } from "../../src/content/home";
import { locales } from "../../src/i18n/config";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  expect(typeof value).toBe("string");
  expect(String(value).trim().length).toBeGreaterThan(0);
  return typeof value;
}

describe("ECHO-404 about and team", () => {
  it("has complete localized copy parity with no empty placeholders", () => {
    for (const locale of locales) {
      expect(shape(aboutContent[locale])).toEqual(shape(aboutContent.en));
      expect(aboutContent[locale].delivery.steps).toHaveLength(4);
      expect(aboutContent[locale].discovery.items).toHaveLength(5);
    }
  });

  it.each(locales)("renders the team identity, capabilities, principles and next steps in %s", (locale) => {
    const t = aboutContent[locale];
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path="/about" /><AboutPage locale={locale} /></>);

    expect(host.querySelectorAll("main")).toHaveLength(1);
    expect(host.querySelectorAll("h1")).toHaveLength(1);
    expect(host.querySelector("h1")?.textContent).toBe(t.title);
    expect([...host.querySelectorAll("main > section[id]")].map((section) => section.id)).toEqual([
      "about-team", "about-capabilities", "about-principles", "about-discovery", "about-delivery", "about-collaboration", "about-next",
    ]);

    for (const section of host.querySelectorAll("main > section")) {
      const heading = host.querySelector(`[id="${section.getAttribute("aria-labelledby")}"]`);
      expect(heading?.textContent).toBeTruthy();
    }
    expect(host.querySelectorAll("h1, h2, h3, h4").length).toBeGreaterThan(20);

    expect(host.textContent).toContain(t.team.description);
    for (const point of t.team.points) expect(host.textContent).toContain(point.description);
    expect(host.textContent).toContain(t.team.profilesNote);
    expect(host.textContent).toContain(t.team.factsNote);

    for (const item of t.capabilities.items) {
      const heading = [...host.querySelectorAll("h3")].find((node) => node.textContent === item.title)!;
      const card = heading.closest("article")!;
      expect(card.textContent).toContain(item.description);
      expect(card.querySelector("a")?.getAttribute("href")).toBe(`/${locale}/services#${item.service}`);
      expect(serviceIds).toContain(item.service);
      expect(card.querySelector("a")?.getAttribute("aria-label")).toContain(item.title);
    }

    for (const item of t.principles.items) {
      expect(host.textContent).toContain(item.code);
      expect(host.textContent).toContain(item.title);
      expect(host.textContent).toContain(item.description);
    }

    for (const item of t.discovery.items) expect(host.textContent).toContain(item.description);
    expect(host.querySelectorAll(".about-question-list > li")).toHaveLength(5);
    expect(host.textContent).toContain(t.discovery.agreement);
    expect(host.textContent).toContain(t.discovery.note);

    expect(host.querySelectorAll(".about-path > li")).toHaveLength(4);
    for (const step of t.delivery.steps) {
      expect(host.textContent).toContain(step.title);
      expect(host.textContent).toContain(step.description);
      expect(host.textContent).toContain(step.code);
    }
    expect(host.textContent).toContain(t.delivery.note);
    expect(host.textContent).toContain(t.collaboration.description);
    for (const item of t.collaboration.items) expect(host.textContent).toContain(item.title);

    expect(host.querySelector(`a[href="/${locale}/services"]`)).not.toBeNull();
    expect(host.querySelector(`a[href="/${locale}/work"]`)).not.toBeNull();
    expect(host.querySelector(`a[href="/${locale}#contact"]`)).not.toBeNull();
    expect(host.textContent).toContain(t.next.note);
    expect(host.querySelector("form, iframe, canvas")).toBeNull();

    const ids = [...host.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const link of host.querySelectorAll("a")) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^\/(fa|en|ar)(\/(about|contact|privacy|services|work)(#[a-z]+)?|#(hero|process|contact))?$/);
    }
    for (const target of locales) expect(host.querySelector(`a[hreflang="${target}"]`)?.getAttribute("href")).toBe(`/${target}/about`);
    expect(host.querySelectorAll(`.primary-links a[href="/${locale}/about"][aria-current="page"]`)).toHaveLength(2);
    expect(host.querySelector("noscript")?.innerHTML).toContain(`href="/${locale}/about"`);
    expect(host.querySelector(`footer a[href="/${locale}/about"]`)).not.toBeNull();

    // No invented people, contacts, certifications, years or measured results.
    expect(host.innerHTML).not.toMatch(/mailto:|https?:\/\/|©|HIPAA|SLA|24\/7|contact@|github|telegram|\d+%|[\w.+-]+@[\w.-]+\.\w+/i);
  });

  it("reuses mobile-first logical styling without a client island", () => {
    const css = readFileSync("src/styles/about.css", "utf8");
    expect(css).toContain("minmax(0, 1fr)");
    expect(css).toContain("min-inline-size: 0");
    expect(css).toContain("flex-wrap: wrap");
    expect(css).toContain("border-inline-start");
    expect(css).not.toMatch(/[;{]\s*(width|left|right):/);
    expect(readFileSync("src/components/marketing/about-page.tsx", "utf8")).not.toContain('"use client"');
  });
});
