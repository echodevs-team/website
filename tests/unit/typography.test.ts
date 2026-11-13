import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aboutContent } from "../../src/content/about";
import { chromeContent } from "../../src/content/chrome";
import { contactContent } from "../../src/content/contact";
import { homeContent } from "../../src/content/home";
import { inquiryCopy } from "../../src/content/inquiry";
import { privacyContent } from "../../src/content/privacy";
import { servicesContent } from "../../src/content/services";
import { workContent } from "../../src/content/work";
import { workDetailContent } from "../../src/content/work-details";
import { locales, type Locale } from "../../src/i18n/config";
import { getMessages } from "../../src/i18n/messages";

type Records = Record<Locale, unknown>;

const modules: Records[] = [
  homeContent, servicesContent, workContent, workDetailContent, aboutContent,
  contactContent, privacyContent, inquiryCopy, chromeContent,
] as Records[];

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

function localeStrings(locale: Locale): string[] {
  return [...modules.flatMap((records) => strings(records[locale])), ...strings(getMessages(locale))];
}

function westernDigitsInRtlProse(value: string): string[] {
  if (!/[\u0600-\u06FF]/u.test(value)) return [];
  const simplified = value
    .replace(/\+\d[\d\s-]*/g, "")
    .replace(/[A-Za-z][A-Za-z0-9._/+&#:-]*/g, "")
    .replace(/\/\s*[0-9]+/g, "");
  return simplified.match(/[0-9]+/g) ?? [];
}

const faStrings = localeStrings("fa");
const arStrings = localeStrings("ar");
const rtlStrings = [...faStrings, ...arStrings];

describe("ECHO-505 localized typography and script consistency", () => {
  it("collects the full visitor-facing FA/AR copy surface", () => {
    expect(faStrings.length).toBeGreaterThan(150);
    expect(arStrings.length).toBeGreaterThan(150);
    expect(locales).toEqual(["fa", "en", "ar"]);
  });

  it("uses Persian yeh and kaf in Persian copy, not Arabic codepoints", () => {
    for (const value of faStrings) {
      expect(value, value).not.toMatch(/[\u064A\u0643]/u);
    }
  });

  it("uses Arabic yeh and kaf in Arabic copy, not Persian codepoints", () => {
    for (const value of arStrings) {
      expect(value, value).not.toMatch(/[\u06CC\u06A9]/u);
    }
  });

  it("uses the documented digit set per locale", () => {
    expect(faStrings.join(" ")).toMatch(/[\u06F0-\u06F9]/u);
    expect(arStrings.join(" ")).toMatch(/[\u0660-\u0669]/u);
    for (const value of faStrings) expect(value, value).not.toMatch(/[\u0660-\u0669]/u);
    for (const value of arStrings) expect(value, value).not.toMatch(/[\u06F0-\u06F9]/u);
  });

  it("uses Arabic punctuation instead of ASCII , ; ? in RTL prose", () => {
    for (const value of rtlStrings) {
      expect(value, value).not.toMatch(/[\u0600-\u06FF][\u0600-\u06FF\s\u200C\u200D]*[,;?](?=\s|$)/u);
    }
  });

  it("keeps Western digits out of RTL prose while allowing technical tokens", () => {
    for (const value of rtlStrings) {
      expect(westernDigitsInRtlProse(value), value).toEqual([]);
    }
    expect(westernDigitsInRtlProse("IPv6 با پیشوند /64 و API v2 و +44…")).toEqual([]);
    expect(westernDigitsInRtlProse("3 حوزه خدمات")).toEqual(["3"]);
  });

  it("keeps the approved script face in the monospace chrome stack", () => {
    const tokens = readFileSync(new URL("../../src/styles/tokens.css", import.meta.url), "utf8");
    expect(tokens).toMatch(/--font-body:\s*"Vazirmatn",\s*system-ui,\s*sans-serif;/u);
    expect(tokens).toMatch(/--font-mono:\s*ui-monospace,\s*"Vazirmatn",\s*monospace;/u);
  });
});
