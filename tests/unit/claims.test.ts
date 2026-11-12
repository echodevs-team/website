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
import { locales } from "../../src/i18n/config";

const modules = {
  home: homeContent,
  services: servicesContent,
  about: aboutContent,
  contact: contactContent,
  privacy: privacyContent,
  work: workContent,
  "work details": workDetailContent,
  inquiry: inquiryCopy,
  chrome: chromeContent,
} as const;

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

// Obvious fabricated facts are not allowed in any locale. This is a narrow
// regression guard against invented contacts, compliance badges and uptime
// claims; it cannot prove the truth of the remaining copy or replace owner,
// native-language and legal review.
const fabricatedMarker = /(?:mailto:|https?:\/\/|HIPAA|GDPR|PCI(?:[ -]?DSS)?|ISO[ -]?27001|SOC ?2|24\/7|\bSLA\b|99[.,]9\s*%|@[a-z0-9.-]+\.(?:com|io|dev|net|org))/iu;

describe("ECHO-502 sensitive-claim regression guard", () => {
  it("keeps fabricated contact, compliance and uptime markers out of all localized content", () => {
    for (const [name, records] of Object.entries(modules)) {
      for (const locale of locales) {
        for (const value of strings(records[locale])) {
          expect(value, `${name}/${locale}`).not.toMatch(fabricatedMarker);
        }
      }
    }
  });
});
