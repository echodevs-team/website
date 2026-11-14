// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "../../src/components/layout/not-found-page";
import { getMessages } from "../../src/i18n/messages";
import { locales } from "../../src/i18n/config";

describe("ECHO-506 localized 404 experience", () => {
  it.each(locales)("renders a localized, recoverable 404 shell in %s", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<NotFoundPage locale={locale} />);
    const t = getMessages(locale).Foundation;
    const nav = getMessages(locale).Header;

    expect(host.querySelectorAll("h1")).toHaveLength(1);
    expect(host.querySelector("h1")?.textContent).toBe(t.notFound);
    expect(host.querySelector(".not-found-recovery h2")?.textContent).toBe(t.recovery);
    expect(host.querySelector(".not-found-description")?.textContent).toBe(t.notFoundDescription);

    expect(host.querySelector("header.site-header")).not.toBeNull();
    expect(host.querySelector("footer")).not.toBeNull();
    expect(host.querySelector("main")?.getAttribute("id")).toBe("main");
    expect(host.querySelector("main")?.getAttribute("tabindex")).toBe("-1");

    const home = host.querySelector(`.hero-actions a[href="/${locale}"]`);
    expect(home?.textContent).toBe(t.notFoundHome);
    for (const path of ["/services", "/work", "/contact"]) {
      expect(host.querySelector(`a[href="/${locale}${path}"]`), path).not.toBeNull();
    }
    expect(host.querySelector(`a[href="/${locale}/services"]`)?.textContent).toBe(nav.services);
    expect(host.querySelector(`a[href="/${locale}/work"]`)?.textContent).toBe(nav.work);
    expect(host.querySelector(`a[href="/${locale}/contact"]`)?.textContent).toBe(nav.contact);

    const languageLinks = [...host.querySelectorAll("a[hreflang]")];
    expect(languageLinks.length).toBeGreaterThanOrEqual(3);
    for (const target of locales) {
      expect(languageLinks.some((link) => link.getAttribute("hreflang") === target)).toBe(true);
    }
    expect(host.querySelector(`.not-found-languages a[hreflang="${locale}"]`)?.getAttribute("aria-current")).toBe("page");
    expect(host.textContent).not.toContain("/missing");
    expect(host.querySelector(".not-found-panel form, .not-found-panel button, .not-found-panel input, .not-found-panel textarea, .not-found-panel select")).toBeNull();
  });

  it("keeps the 404 document free of duplicate robots metadata and masked redirects", () => {
    const source = readFileSync("src/app/global-not-found.tsx", "utf8");
    expect(source).toContain('export const metadata: Metadata = { title: "404 — Echo Devs" }');
    expect(source).not.toContain("robots:");
    expect(source).toContain("lang={locale} dir={direction(locale)}");
    expect(source).toContain('className="skip-link"');
    expect(source).toContain("<NotFoundPage locale={locale} />");
    expect(source).not.toMatch(/redirect\s*\(/u);
  });

  it("uses existing design primitives and no invented recovery feature", () => {
    const source = readFileSync("src/components/layout/not-found-page.tsx", "utf8");
    expect(source).toContain("Header");
    expect(source).toContain("MarketingFooter");
    expect(source).toContain("home-glass");
    expect(source).not.toMatch(/<form|<button|role="search"/u);
  });

  it("keeps 404 copy localized and distinct from English", () => {
    for (const locale of ["fa", "ar"] as const) {
      const copy = getMessages(locale).Foundation;
      const english = getMessages("en").Foundation;
      expect(copy.notFoundDescription).not.toBe(english.notFoundDescription);
      expect(copy.notFoundHome).not.toBe(english.notFoundHome);
      expect(copy.recovery).not.toBe(english.recovery);
    }
  });
});
