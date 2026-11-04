import { describe, expect, it } from "vitest";
import { direction, isLocale, localePath, locales, resolveLocale } from "../../src/i18n/config";
import { getMessages } from "../../src/i18n/messages";

describe("locale foundation", () => {
  it("validates the exact locale allowlist", () => {
    for (const locale of locales) expect(isLocale(locale)).toBe(true);
    for (const locale of [undefined, "FA", "fr", "__proto__", "../en", "en-US"]) expect(isLocale(locale)).toBe(false);
  });

  it("provides correct document direction", () => {
    expect(locales.map(direction)).toEqual(["rtl", "ltr", "rtl"]);
  });

  it("keeps supported preference ahead of browser language", () => {
    expect(resolveLocale("ar", "en-US,en;q=0.8")).toBe("ar");
    expect(resolveLocale("invalid", "fr;q=1, ar-SA;q=0.9, en;q=0.7")).toBe("ar");
    expect(resolveLocale(undefined, "en-US,en;q=0.8")).toBe("en");
    expect(resolveLocale(undefined, "fa-IR,en;q=0.5")).toBe("fa");
  });

  it("falls back to FA and ignores unacceptable quality values", () => {
    for (const header of [null, "fr", "*", "en;q=0", "en;q=NaN", "en;q=2", "en;q=-1"]) {
      expect(resolveLocale(undefined, header)).toBe("fa");
    }
  });

  it("builds equivalent app-relative routes without open redirects", () => {
    expect(localePath("fa")).toBe("/fa");
    expect(localePath("en", "/work/example")).toBe("/en/work/example");
    for (const path of ["https://example.com", "//example.com", "/\\evil", "/x?q=1", "/x#id", "/a b", "/../en", "/%2e%2e/en", "/%2fexample.com"]) {
      expect(() => localePath("ar", path)).toThrow();
    }
  });

  it("keeps the limited foundation dictionaries in parity with no empty values", () => {
    const keys = Object.keys(getMessages("en").Foundation).sort();
    for (const locale of locales) {
      const messages = getMessages(locale).Foundation;
      expect(Object.keys(messages).sort()).toEqual(keys);
      for (const value of Object.values(messages)) expect(value.trim()).not.toBe("");
    }
  });
});
