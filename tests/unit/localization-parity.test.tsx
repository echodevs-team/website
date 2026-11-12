// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Homepage } from "../../src/components/marketing/homepage";
import { WorkPage } from "../../src/components/marketing/work-page";
import { aboutContent } from "../../src/content/about";
import { chromeContent } from "../../src/content/chrome";
import { contactContent } from "../../src/content/contact";
import { homeContent } from "../../src/content/home";
import { inquiryCopy } from "../../src/content/inquiry";
import { privacyContent } from "../../src/content/privacy";
import { servicesContent } from "../../src/content/services";
import { workContent } from "../../src/content/work";
import { workDetailContent } from "../../src/content/work-details";
import { direction, localePath, locales } from "../../src/i18n/config";
import { getMessages } from "../../src/i18n/messages";

type LocalizedRecords = Record<string, unknown>;

const modules: Record<string, LocalizedRecords> = {
  home: homeContent, services: servicesContent, about: aboutContent, contact: contactContent,
  privacy: privacyContent, work: workContent, "work details": workDetailContent,
  chrome: chromeContent, inquiry: inquiryCopy,
};

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  expect(typeof value, String(value)).toBe("string");
  expect(String(value).trim().length).toBeGreaterThan(0);
  return "string";
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

function contentStrings(locale: (typeof locales)[number]) {
  return Object.values(modules).flatMap((records) => strings(records[locale]));
}

describe("ECHO-501 trilingual content parity and terminology", () => {
  it("keeps every typed content module equivalent across FA/EN/AR with no empty values", () => {
    for (const [name, records] of Object.entries(modules)) {
      for (const locale of locales) expect(shape(records[locale]), `${name}/${locale}`).toEqual(shape(records.en));
    }
  });

  it("contains no untranslated placeholder markers in visitor-facing content", () => {
    for (const [name, records] of Object.entries(modules)) {
      for (const locale of locales) {
        for (const value of strings(records[locale])) {
          expect(value, `${name}/${locale}`).not.toMatch(/\b(?:TODO|FIXME|lorem ipsum|translation needed|placeholder text)\b/i);
        }
      }
    }
  });

  it("keeps primary FA/AR labels translated rather than English fillers", () => {
    const labels: ((locale: (typeof locales)[number]) => string)[] = [
      (locale) => homeContent[locale].start,
      (locale) => homeContent[locale].examples,
      (locale) => homeContent[locale].request,
      (locale) => homeContent[locale].similar,
      (locale) => homeContent[locale].fields.name,
      (locale) => homeContent[locale].fields.description,
      (locale) => homeContent[locale].contactsPending,
      (locale) => aboutContent[locale].actions.primary,
      (locale) => servicesContent[locale].cta,
      (locale) => workContent[locale].cta,
      (locale) => inquiryCopy[locale].submit,
      (locale) => inquiryCopy[locale].required,
      (locale) => contactContent[locale].form.ariaLabel,
      (locale) => getMessages(locale).Header.home,
      (locale) => getMessages(locale).Foundation.notFound,
    ];
    for (const locale of ["fa", "ar"] as const) {
      for (const label of labels) expect(label(locale), label("en")).not.toBe(label("en"));
    }
  });

  it("keeps the Arabic visitor address consistently in the plural honorific", () => {
    const pluralInstructions: [string, RegExp][] = [
      [homeContent.ar.start, /^ابدأوا/u],
      [homeContent.ar.examples, /^استكشفوا/u],
      [homeContent.ar.request, /^ناقشوا/u],
      [homeContent.ar.similar, /^ناقشوا/u],
      [homeContent.ar.fields.description, /^أخبرونا/u],
      [aboutContent.ar.actions.primary, /^ابدأوا/u],
      [aboutContent.ar.actions.secondary, /^استكشفوا/u],
      [aboutContent.ar.next.services, /^راجعوا/u],
      [aboutContent.ar.next.work, /^استكشفوا/u],
      [aboutContent.ar.next.contact, /^افتحوا/u],
      [servicesContent.ar.cta, /^ناقشوا/u],
      [inquiryCopy.ar.invalid, /^تحققوا/u],
      [inquiryCopy.ar.contactRequired, /^أدخلوا/u],
      [inquiryCopy.ar.rejected, /راجعوا الحقول/u],
      [inquiryCopy.ar.limited, /انتظروا/u],
      [inquiryCopy.ar.uncertain, /أعيدوا محاولة الطلب/u],
      [inquiryCopy.ar.conflict, /ابدأوا طلبًا منفصلًا/u],
      [inquiryCopy.ar.expired, /لا ترسلوه/u],
      [inquiryCopy.ar.contactHint, /^أدخلوا/u],
      [inquiryCopy.ar.descriptionHint, /لا تكتبوا/u],
      [inquiryCopy.ar.success, /طلبكم/u],
      [inquiryCopy.ar.note, /لا تعيدوا تحميلها/u],
    ];
    for (const [value, expected] of pluralInstructions) expect(value).toMatch(expected);
    // Sample product copy inside an illustrative chat is intentionally a single
    // user's interface message, not site-level guidance to the visitor.
    const simulatedChat = new Set(homeContent.ar.chat);
    const singularStart = /^(?:ابدأ|استكشف|ناقش|صف|أدخل|راجع|حاول|انتظر|أعد|اكتب|اختر|تواصل|احتفظ|استخدم|أرسل|افتح|أخبرنا|لا تعِد)(?:\s|$)/u;
    for (const value of contentStrings("ar")) {
      if (simulatedChat.has(value)) continue;
      expect(value).not.toMatch(singularStart);
    }
  });

  it("keeps service-pillar and SaaS terminology consistent across modules and locales", () => {
    const pillarRoot: Record<(typeof locales)[number], RegExp> = {
      fa: /حوزه/u, en: /pillar/i, ar: /محور|محاور/u,
    };
    for (const locale of locales) {
      const root = pillarRoot[locale];
      for (const service of homeContent[locale].services) {
        expect(service.pillar, `${locale} homepage pillar`).toMatch(root);
      }
      expect(chromeContent[locale].footer.servicesHeading, `${locale} footer`).toMatch(root);
      expect(servicesContent[locale].navigation, `${locale} services navigation`).toMatch(root);
      expect(homeContent[locale].services[1].areas[0], `${locale} homepage SaaS`).toContain("SaaS");
      expect(servicesContent[locale].pillars.websites.services[1].title, `${locale} services SaaS`).toContain("SaaS");
    }
  });

  it.each(locales)("names the %s inquiry form by purpose and renders its description once", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<Homepage locale={locale} />);
    const form = host.querySelector("form")!;
    expect(form.getAttribute("aria-label")).toBe(inquiryCopy[locale].formLabel);
    expect(form.getAttribute("aria-label")).not.toBe(homeContent[locale].start);
    expect(host.querySelector(".inquiry-copy h2")?.textContent).toBe(homeContent[locale].inquiry.title);
    expect(host.textContent!.split(homeContent[locale].inquiry.description)).toHaveLength(2);
    const ctas = host.querySelectorAll(".hero-actions a");
    expect(ctas[0].getAttribute("href")).toBe("#contact");
    expect(ctas[0].textContent).toContain(homeContent[locale].start);
    expect(ctas[1].getAttribute("href")).toBe("#demos");
  });

  it.each(locales)("isolates Latin technical tokens for bidirectional %s rendering", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<Homepage locale={locale} />);
    for (const selector of [".runtime-top", ".runtime-bottom", ".stack-tags"]) {
      expect(host.querySelector(selector)?.getAttribute("dir"), selector).toBe("ltr");
    }
    expect(host.querySelector(".runtime-top")?.textContent).toContain("CORE_RUNTIME");
    expect(host.querySelector(".runtime-bottom")?.textContent).toContain("NEXT.JS // PYTHON // AI");
    expect(host.querySelectorAll(".capability h2 bdi")).toHaveLength(4);
    for (const code of host.querySelectorAll(".process-card code")) expect(code.getAttribute("dir")).toBe("ltr");
    expect(inquiryCopy[locale].serviceLabels).toHaveLength(4);
  });

  it("marks contact hints as left-to-right where a phone prefix is embedded in RTL copy", () => {
    expect(inquiryCopy.fa.contactHint).toContain("\u200e+44");
    expect(inquiryCopy.ar.contactHint).toContain("\u200e+44");
    expect(inquiryCopy.en.contactHint).toContain("+44");
  });

  it.each(locales)("renders only explicitly labeled concept studies in %s work", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<WorkPage locale={locale} />);
    const cards = [...host.querySelectorAll("[data-work-kind]")];
    expect(cards).toHaveLength(3);
    for (const card of cards) expect(card.getAttribute("data-work-kind")).toBe("concept");
    expect(host.querySelectorAll('[data-work-kind="client"], [data-work-kind="internal"]')).toHaveLength(0);
    expect(host.textContent).not.toMatch(/HIPAA|SLA|24\/7|\d+%/);
  });

  it("keeps localized 404 and inquiry status copy complete and distinct from English", () => {
    const keys = [
      "pending", "success", "uncertain", "rejected", "limited", "conflict",
      "expired", "invalid", "required", "contactRequired", "noScript", "formLabel",
    ] as const;
    for (const locale of ["fa", "ar"] as const) {
      for (const key of keys) {
        expect(inquiryCopy[locale][key].trim(), `${locale}/${key}`).not.toBe("");
        expect(inquiryCopy[locale][key], `${locale}/${key}`).not.toBe(inquiryCopy.en[key]);
      }
      expect(getMessages(locale).Foundation.notFound).not.toBe(getMessages("en").Foundation.notFound);
      expect(getMessages(locale).Foundation.back).not.toBe(getMessages("en").Foundation.back);
    }
  });

  it("keeps equivalent locale paths and document direction for every locale", () => {
    for (const locale of locales) {
      expect(direction(locale)).toBe(locale === "en" ? "ltr" : "rtl");
      expect(localePath(locale, "/work/chat")).toBe(`/${locale}/work/chat`);
    }
    const layout = readFileSync("src/app/[locale]/layout.tsx", "utf8");
    expect(layout).toContain("lang={locale}");
    expect(layout).toContain("dir={direction(locale)}");
  });
});
