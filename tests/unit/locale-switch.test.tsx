// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Header } from "../../src/components/layout/header";
import { localePath, locales, type Locale } from "../../src/i18n/config";
import {
  localePreferenceCookie,
  localePreferenceMaxAge,
  localeSwitchHref,
  rememberLocale,
} from "../../src/i18n/preference";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const routePaths = ["/", "/services", "/work", "/work/analytics", "/work/chat", "/work/booking", "/about", "/contact", "/privacy"];

let root: Root | undefined;
function renderHeader(locale: Locale, path: string) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<Header locale={locale} path={path} />);
  return host;
}

afterEach(async () => {
  if (root) await act(() => root?.unmount());
  root = undefined;
  document.cookie = "echo_locale=; Path=/; Max-Age=0";
  window.history.replaceState(null, "", "/");
});

describe("equivalent locale switching", () => {
  it.each(routePaths)("preserves the route family at %s across FA/EN/AR", (path) => {
    for (const locale of locales) {
      const host = renderHeader(locale, path);
      const links = [...host.querySelectorAll<HTMLAnchorElement>(".language-switch a[hreflang]")];
      // Desktop header and mobile dialog each render the same complete set.
      expect(links).toHaveLength(locales.length * 2);
      for (const target of locales) {
        const expected = localePath(target, path);
        const matching = links.filter((link) => link.getAttribute("hreflang") === target);
        expect(matching).toHaveLength(2);
        for (const link of matching) expect(link.getAttribute("href")).toBe(expected);
        const current = matching.filter((link) => link.getAttribute("aria-current") === "page");
        expect(current).toHaveLength(target === locale ? 2 : 0);
      }
    }
  });

  it("never substitutes the homepage when an equivalent page exists", () => {
    for (const path of routePaths.filter((value) => value !== "/")) {
      const host = renderHeader("fa", path);
      const hrefs = [...host.querySelectorAll(".language-switch a[hreflang]")].map((link) => link.getAttribute("href"));
      expect(hrefs).not.toContain("/en");
      expect(hrefs).not.toContain("/ar");
    }
  });

  it("maps each concept slug to the same slug in every locale", () => {
    for (const slug of ["analytics", "chat", "booking"]) {
      for (const target of locales) {
        expect(localeSwitchHref(target, `/work/${slug}`)).toBe(`/${target}/work/${slug}`);
      }
    }
  });
});

describe("locale switch safety and preference", () => {
  it("carries only simple in-page fragments", () => {
    expect(localeSwitchHref("en", "/work/chat", "#contact")).toBe("/en/work/chat#contact");
    expect(localeSwitchHref("ar", "/", "#process")).toBe("/ar#process");
    for (const unsafe of ["", "#", "#1bad", "#a b", "#a?b", "?ref=x", "//example.com", "ok"]) {
      expect(localeSwitchHref("fa", "/about", unsafe)).toBe("/fa/about");
    }
  });

  it("writes a scoped, same-site preference cookie with the locale code only", () => {
    expect(localePreferenceCookie("ar", false)).toBe(
      `echo_locale=ar; Path=/; Max-Age=${localePreferenceMaxAge}; SameSite=Lax`,
    );
    expect(localePreferenceCookie("en", true)).toContain("; Secure");
    rememberLocale("en");
    expect(document.cookie).toContain("echo_locale=en");
  });

  it("remembers the choice and keeps the current fragment on click", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    window.history.replaceState(null, "", "#process");
    await act(async () => root?.render(<Header locale="fa" path="/" />));
    const link = host.querySelector<HTMLAnchorElement>('.language-switch a[hreflang="en"]')!;
    // Prevent jsdom's unimplemented navigation; the React handler still runs.
    host.addEventListener("click", (event) => event.preventDefault(), true);

    await act(async () => {
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });

    expect(link.getAttribute("href")).toBe("/en#process");
    expect(document.cookie).toContain("echo_locale=en");
    host.remove();
  });
});
