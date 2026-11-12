import { describe, expect, it } from "vitest";
import { normalizePhone, validateInquiry } from "../../src/lib/validation/inquiry";

const valid = { fullName: "نام آزمایشی", email: "fixture@example.invalid", service: "not_sure", description: "Synthetic inquiry used only for disposable tests.", locale: "fa", sourcePage: "/fa" };
describe("strict inquiry validation", () => {
  it.each(["fa", "en", "ar"])("preserves Unicode and locale %s", (locale) => {
    const result = validateInquiry({ ...valid, fullName: " علی‌ رضا 😀 ", description: " متن آزمایشی برای بررسی داده‌های فارسی و العربية.\nسطر دوم ", locale, sourcePage: `/${locale}/contact` });
    expect(result.data?.fullName).toBe("علی‌ رضا 😀");
    expect(result.data?.description).toContain("\n");
  });
  it("accepts email-only, phone-only and both contacts", () => {
    expect(validateInquiry(valid).data).toBeDefined();
    expect(validateInquiry({ ...valid, email: "", phone: "۰۰۴۴ (۲۰) ۷۹۴۶-۰۰۱۸" }).data?.phone).toBe("+442079460018");
    expect(validateInquiry({ ...valid, phone: "+1 202 555 0100" }).data).toBeDefined();
    expect(normalizePhone("+٩٧١ ٥٠ ١٢٣ ٤٥٦٧")).toBe("+971501234567");
  });
  it.each(["fa", "en", "ar"])("separates blank required fields from malformed values in %s", (locale) => {
    const base = { ...valid, locale, sourcePage: `/${locale}` };
    expect(validateInquiry({ ...base, fullName: "   ", description: "\n " }).fields)
      .toEqual({ fullName: "required", description: "required" });
    expect(validateInquiry({ ...base, fullName: "a", description: "short" }).fields)
      .toEqual({ fullName: "invalid", description: "invalid" });
    expect(validateInquiry({ ...base, email: "", phone: "" }).fields).toEqual({ email: "required" });
    expect(validateInquiry({ ...base, email: "not-an-email", phone: "+1 202 555 0100" }).fields).toEqual({ email: "invalid" });
  });
  it.each([
    { fullName: "a" }, { fullName: "x".repeat(121) }, { email: "bad" }, { email: "", phone: "" },
    { phone: "09123456789" }, { phone: "+123" }, { phone: "+0123456789" }, { phone: "+1234567890123456" },
    { service: "all" }, { budgetRange: "guaranteed" }, { timeline: "x".repeat(121) },
    { description: "short" }, { description: "x".repeat(5001) }, { description: "a".repeat(25) + "\u0000" },
    { fullName: "Test\nName" }, { locale: "de" }, { sourcePage: "/en" }, { sourcePage: "https://example.invalid" },
    { website: "bot" }, { admin: true },
  ])("rejects invalid data with safe codes: %j", (patch) => {
    const result = validateInquiry({ ...valid, ...patch });
    expect(result.data).toBeUndefined();
    expect(Object.values(result.fields!)).toEqual(expect.arrayContaining([expect.stringMatching(/^(invalid|required)$/)]));
    expect(JSON.stringify(result.fields)).not.toContain("fixture@example.invalid");
  });
  it("accepts exact bounds and independently optional budget/timeline", () => {
    expect(validateInquiry({ ...valid, fullName: "aa", description: "x".repeat(20) }).data).toBeDefined();
    expect(validateInquiry({ ...valid, fullName: "a".repeat(120), description: "x".repeat(5000), budgetRange: "small", timeline: "After scope review" }).data).toBeDefined();
    expect(validateInquiry(null).fields).toEqual({ request: "invalid" });
  });
});
