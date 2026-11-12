// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Header } from "../../src/components/layout/header";
import { Homepage } from "../../src/components/marketing/homepage";
import { AboutPage } from "../../src/components/marketing/about-page";
import { ContactPage } from "../../src/components/marketing/contact-page";
import { PrivacyPage } from "../../src/components/marketing/privacy-page";
import { ServicesPage } from "../../src/components/marketing/services-page";
import { WorkPage } from "../../src/components/marketing/work-page";
import { WorkDetailPage } from "../../src/components/marketing/work-detail-page";
import { getWorkDetail, workSlugs } from "../../src/content/work-details";
import { locales } from "../../src/i18n/config";

describe("ECHO-407 rendered marketing link and illustration inventory", () => {
  for (const locale of locales) {
    const pages = [
      ["/", <Homepage key="home" locale={locale} />], ["/about", <AboutPage key="about" locale={locale} />],
      ["/contact", <ContactPage key="contact" locale={locale} />], ["/privacy", <PrivacyPage key="privacy" locale={locale} />],
      ["/services", <ServicesPage key="services" locale={locale} />], ["/work", <WorkPage key="work" locale={locale} />],
      ...workSlugs.map((slug) => [`/work/${slug}`, <WorkDetailPage key={slug} locale={locale} item={getWorkDetail(locale, slug)!} />] as const),
    ] as const;
    for (const [path, page] of pages) it(`${locale}${path}: named links, intentional illustrations and localized privacy`, () => {
      const host = document.createElement("div");
      host.innerHTML = renderToStaticMarkup(<><Header locale={locale} path={path} />{page}</>);
      for (const link of host.querySelectorAll("a")) {
        expect(link.getAttribute("aria-label")?.trim() || link.textContent?.trim(), link.outerHTML).toBeTruthy();
        const href = link.getAttribute("href");
        expect(href, link.outerHTML).toMatch(/^(?:#[\w-]+|\/(?:fa|en|ar)(?:[\/#]|$))/);
      }
      for (const image of host.querySelectorAll("svg, canvas, img")) {
        const hidden = image.closest('[aria-hidden="true"]');
        if (hidden) continue;
        if (image.tagName === "IMG") {
          expect(image.hasAttribute("alt"), image.outerHTML).toBe(true);
        } else {
          expect(image.getAttribute("role"), image.outerHTML).toBe("img");
          expect(image.getAttribute("aria-label") || image.querySelector("title")?.textContent, image.outerHTML).toBeTruthy();
        }
      }
      for (const form of host.querySelectorAll("form")) {
        expect(form.querySelector(".inquiry-privacy a")?.getAttribute("href")).toBe(`/${locale}/privacy`);
        expect(form.querySelector("fieldset")?.disabled).toBe(true); // Deliberate SSR/no-script safeguard, not a broken CTA.
      }
      const localeLinks = host.querySelectorAll(".language-switch a");
      expect(localeLinks.length).toBeGreaterThan(0);
      for (const link of localeLinks) {
        const target = link.getAttribute("hreflang");
        expect(link.getAttribute("href")).toBe(`/${target}${path === "/" ? "" : path}`);
      }
    });
  }
});
