// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../../src/components/layout/header";
import { ContactPage } from "../../src/components/marketing/contact-page";
import { MarketingFooter } from "../../src/components/marketing/marketing-footer";
import { contactContent } from "../../src/content/contact";
import { homeContent } from "../../src/content/home";
import { inquiryCopy } from "../../src/content/inquiry";
import { locales } from "../../src/i18n/config";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  expect(typeof value).toBe("string");
  expect(String(value).trim().length).toBeGreaterThan(0);
  return typeof value;
}

describe("ECHO-405 contact", () => {
  it("has complete localized copy parity with no empty placeholders", () => {
    for (const locale of locales) {
      expect(shape(contactContent[locale])).toEqual(shape(contactContent.en));
      expect(contactContent[locale].guidance.items).toHaveLength(5);
      expect(contactContent[locale].next.steps).toHaveLength(3);
      expect(contactContent[locale].explore.links.map((link) => link.key)).toEqual(["services", "work", "about"]);
    }
  });

  it.each(locales)("renders the localized contact sections in %s", (locale) => {
    const t = contactContent[locale];
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path="/contact" /><ContactPage locale={locale} /></>);

    expect(host.querySelectorAll("main")).toHaveLength(1);
    expect(host.querySelectorAll("h1")).toHaveLength(1);
    expect(host.querySelector("h1")?.textContent).toBe(t.title);
    expect([...host.querySelectorAll("main > section[id]")].map((section) => section.id)).toEqual([
      "contact-intro", "contact-inquiry", "contact-next",
    ]);
    for (const section of host.querySelectorAll("main > section")) {
      const heading = host.querySelector(`[id="${section.getAttribute("aria-labelledby")}"]`);
      expect(heading?.textContent).toBeTruthy();
    }

    expect(host.textContent).toContain(t.description);
    for (const badge of t.badges) expect(host.textContent).toContain(badge);
    expect(host.textContent).toContain(t.guidance.title);
    expect(host.textContent).toContain(t.guidance.description);
    for (const item of t.guidance.items) {
      expect(host.textContent).toContain(item.title);
      expect(host.textContent).toContain(item.description);
    }
    expect(host.textContent).toContain(t.guidance.channelsTitle);
    expect(host.textContent).toContain(t.guidance.channelsNote);
    expect(host.textContent).toContain(t.form.note);
    expect(host.textContent).not.toContain(inquiryCopy[locale].note);

    expect(host.querySelectorAll(".contact-step")).toHaveLength(3);
    for (const step of t.next.steps) {
      expect(host.textContent).toContain(step.title);
      expect(host.textContent).toContain(step.description);
    }
    expect(host.textContent).toContain(t.next.note);

    for (const link of t.explore.links) {
      const card = [...host.querySelectorAll(".contact-explore-card")].find((node) => node.querySelector("h3")?.textContent === link.title)!;
      expect(card.textContent).toContain(link.description);
      expect(card.querySelector("a")?.getAttribute("href")).toBe(`/${locale}/${link.key}`);
      expect(card.querySelector("a")?.getAttribute("aria-label")).toContain(link.title);
    }
  });

  it.each(locales)("reuses the single inquiry form with accessible, honest states in %s", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path="/contact" /><ContactPage locale={locale} /></>);
    const forms = host.querySelectorAll("form");
    expect(forms).toHaveLength(1);
    const form = forms[0];

    expect(form.getAttribute("aria-label")).toBe(contactContent[locale].form.ariaLabel);
    expect(form.querySelector("fieldset")?.hasAttribute("disabled")).toBe(true);
    expect(form.querySelector('button[type="submit"]')).not.toBeNull();
    expect(form.querySelector("noscript")).not.toBeNull();
    expect(form.querySelector('[role="status"]')?.getAttribute("aria-live")).toBe("polite");
    expect(form.querySelector('[role="status"]')?.getAttribute("aria-atomic")).toBe("true");
    expect(form.querySelectorAll("[required]")).toHaveLength(2);
    expect(form.querySelectorAll('[name="website"]')).toHaveLength(1);
    expect(form.querySelector('[name="website"]')?.closest("[hidden]")).not.toBeNull();
    for (const name of ["fullName", "email", "phone", "service", "timeline", "description"]) {
      const control = form.querySelector(`[name="${name}"]`);
      expect(control).not.toBeNull();
      if (control?.id) expect(form.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
    }
    expect(host.textContent).toContain(homeContent[locale].fields.name);
    expect(host.textContent).toContain(inquiryCopy[locale].serviceLabels[0]);
    expect(host.textContent).toContain(inquiryCopy[locale].contactHint);
    expect(host.textContent).toContain(contactContent[locale].form.note);

    const ids = [...host.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const link of host.querySelectorAll("a")) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^(#contact(-inquiry)?|\/(fa|en|ar)(\/(about|contact|privacy|work)|(\/services)(#[a-z]+)?|#(hero|process|contact(-inquiry)?))?)$/);
    }
  });

  it.each(locales)("makes Contact a real localized destination with equivalent-language switching in %s", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path="/contact" /><ContactPage locale={locale} /><MarketingFooter locale={locale} /></>);

    expect(host.querySelectorAll(`.primary-links a[href="/${locale}/contact"][aria-current="page"]`)).toHaveLength(2);
    expect(host.querySelector(`.header-cta[href="/${locale}/contact"]`)).not.toBeNull();
    for (const target of locales) {
      expect(host.querySelector(`a[hreflang="${target}"]`)?.getAttribute("href")).toBe(`/${target}/contact`);
    }
    expect(host.querySelector(`footer a[href="/${locale}/contact"]`)).not.toBeNull();
    expect(host.querySelectorAll("dialog")).toHaveLength(1);
    expect(host.querySelector('[aria-haspopup="dialog"]')).not.toBeNull();
  });

  it("publishes no unverified direct contact channel or availability claim", () => {
    for (const locale of locales) {
      const html = renderToStaticMarkup(<ContactPage locale={locale} />);
      expect(html).not.toMatch(/mailto:|https?:\/\/|@|tel:|HIPAA|SLA|24\/7|within \d+ (hours?|days?)|guaranteed response/i);
      expect(html).toContain(contactContent[locale].guidance.channelsNote);
    }
  });

  it("submits through the shared form with the Contact source page and an honest failure state", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: "unavailable" }, { status: 503 }));
    try {
      vi.stubGlobal("fetch", fetcher);
      await act(() => root.render(<ContactPage locale="en" />));
      expect(host.querySelector("fieldset")?.hasAttribute("disabled")).toBe(false);
      for (const [name, value] of Object.entries({
        fullName: "Synthetic Contact", email: "contact@example.invalid",
        description: "A synthetic contact-page inquiry used only by automated tests.",
      })) (host.querySelector(`[name="${name}"]`) as HTMLInputElement).value = value;
      await act(async () => { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });

      expect(fetcher).toHaveBeenCalledOnce();
      expect(JSON.parse(fetcher.mock.calls[0][1]!.body as string)).toMatchObject({ locale: "en", sourcePage: "/en/contact" });
      expect(host.querySelector('[role="alert"]')?.textContent).toContain(inquiryCopy.en.uncertain);
      expect(host.querySelector('[role="status"]')?.textContent).not.toContain(inquiryCopy.en.success);
      expect((host.querySelector('[name="fullName"]') as HTMLInputElement).value).toContain("Synthetic");
    } finally {
      await act(() => root.unmount());
      host.remove();
      vi.unstubAllGlobals();
    }
  });

  it("uses mobile-first logical styling without a client page island", () => {
    const css = readFileSync("src/styles/contact.css", "utf8");
    expect(css).toContain("minmax(0, 1fr)");
    expect(css).toContain("min-inline-size: 0");
    expect(css).toContain("flex-wrap: wrap");
    expect(css).toContain("border-inline-start");
    expect(css).not.toMatch(/[;{]\s*(width|left|right):/);
    const source = readFileSync("src/components/marketing/contact-page.tsx", "utf8");
    expect(source).not.toContain('"use client"');
    expect(source).toContain("<InquiryForm");
    expect(readFileSync("src/styles/globals.css", "utf8")).toContain('@import "./contact.css"');
  });
});
