// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Header } from "../../src/components/layout/header";
import { PrivacyPage } from "../../src/components/marketing/privacy-page";
import { privacyContent } from "../../src/content/privacy";
import { locales } from "../../src/i18n/config";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  expect(typeof value).toBe("string");
  expect(String(value).trim().length).toBeGreaterThan(0);
  return typeof value;
}

const sectionIds = [
  "privacy-intro", "privacy-data", "privacy-storage", "privacy-temporary",
  "privacy-retention", "privacy-third-parties", "privacy-updates",
];

describe("ECHO-406 privacy disclosure", () => {
  it("has complete localized copy parity with no empty placeholders", () => {
    for (const locale of locales) {
      const t = privacyContent[locale];
      expect(shape(t)).toEqual(shape(privacyContent.en));
      expect(t.badges).toHaveLength(2);
      expect(t.data.cards).toHaveLength(4);
      expect(t.storage.cards).toHaveLength(4);
      expect(t.temporary.cards).toHaveLength(4);
      expect(t.retention.cards).toHaveLength(3);
      expect(t.thirdParties.cards).toHaveLength(3);
      expect(t.updates.links.map((link) => link.key)).toEqual(["contact", "about"]);
    }
  });

  it.each(locales)("renders the localized disclosure sections and card copy in %s", (locale) => {
    const t = privacyContent[locale];
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path="/privacy" /><PrivacyPage locale={locale} /></>);

    expect(host.querySelectorAll("main")).toHaveLength(1);
    expect(host.querySelectorAll("h1")).toHaveLength(1);
    expect(host.querySelector("h1")?.textContent).toBe(t.title);
    expect([...host.querySelectorAll("main > section[id]")].map((section) => section.id)).toEqual(sectionIds);
    for (const section of host.querySelectorAll("main > section")) {
      const heading = host.querySelector(`[id="${section.getAttribute("aria-labelledby")}"]`);
      expect(heading?.textContent).toBeTruthy();
    }

    expect(host.textContent).toContain(t.description);
    for (const badge of t.badges) expect(host.textContent).toContain(badge);
    expect(host.querySelector(".privacy-notice h2")?.textContent).toBe(t.notice.title);
    expect(host.textContent).toContain(t.notice.body);

    for (const section of [t.data, t.storage, t.temporary, t.retention, t.thirdParties]) {
      expect(host.textContent).toContain(section.title);
      expect(host.textContent).toContain(section.description);
      for (const card of section.cards) {
        expect(host.textContent).toContain(card.title);
        expect(host.textContent).toContain(card.body);
      }
    }
    expect(host.querySelectorAll(".privacy-card")).toHaveLength(18);
    expect(host.querySelector(".privacy-updates")?.textContent).toContain(t.updates.body);

    for (const link of t.updates.links) {
      const anchor = host.querySelector(`.privacy-links a[href="/${locale}/${link.key}"]`);
      expect(anchor?.textContent).toContain(link.label);
    }

    const ids = [...host.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const link of host.querySelectorAll("a")) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^(#|\/(fa|en|ar)(\/(about|contact|privacy|services|work)(#[a-z]+)?|#(hero|process|contact))?)$/);
    }
  });

  it.each(locales)("makes Privacy a real localized destination reachable from header and footer in %s", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path="/privacy" /><PrivacyPage locale={locale} /></>);

    for (const target of locales) {
      expect(host.querySelector(`a[hreflang="${target}"]`)?.getAttribute("href")).toBe(`/${target}/privacy`);
    }
    expect(host.querySelector(`footer a[href="/${locale}/privacy"]`)?.textContent).toBeTruthy();
    expect(host.querySelector(`footer a[href="/${locale}/contact"]`)).not.toBeNull();
  });

  it("separates implemented safeguards from unresolved policy instead of claiming legal approval", () => {
    const en = privacyContent.en;
    expect(en.notice.body).toContain("have not been approved");
    expect(en.notice.body).toContain("blocked");
    expect(en.retention.cards[0].body).toContain("No business retention period is selected");
    expect(en.thirdParties.cards[0].body).toContain("no analytics scripts");
    expect(en.updates.body).toContain("legal entity or controller identity");
    expect(en.updates.body).toContain("claims no regulatory compliance");

    for (const locale of locales) {
      const html = renderToStaticMarkup(<PrivacyPage locale={locale} />);
      expect(html).not.toMatch(/mailto:|https?:\/\/|@|tel:/i);
      expect(html).not.toMatch(/GDPR|HIPAA|ISO ?27001|SOC ?2|certified|guaranteed deletion time of/i);
    }
  });

  it("uses mobile-first logical styling without a client page island", () => {
    const css = readFileSync("src/styles/privacy.css", "utf8");
    expect(css).toContain("minmax(0, 1fr)");
    expect(css).toContain("min-inline-size: 0");
    expect(css).toContain("flex-wrap: wrap");
    expect(css).toContain("border-inline-start");
    expect(css).not.toMatch(/[;{]\s*(width|left|right):/);
    const source = readFileSync("src/components/marketing/privacy-page.tsx", "utf8");
    expect(source).not.toContain('"use client"');
    expect(readFileSync("src/styles/globals.css", "utf8")).toContain('@import "./privacy.css"');
    const route = readFileSync("src/app/[locale]/(marketing)/privacy/page.tsx", "utf8");
    expect(route).toContain("generateMetadata");
    expect(route).toContain('path="/privacy"');
  });
});
