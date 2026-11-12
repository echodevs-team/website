// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { InquiryForm } from "../../src/components/marketing/inquiry-form";
import { homeContent } from "../../src/content/home";
import { inquiryCopy } from "../../src/content/inquiry";
import { locales } from "../../src/i18n/config";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let host: HTMLDivElement; let root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); vi.useRealTimers(); });
function fill() {
  for (const [name, value] of Object.entries({ fullName: "Synthetic نام العربية", email: "form@example.invalid", description: "A synthetic multilingual inquiry for testing only." })) (host.querySelector(`[name="${name}"]`) as HTMLInputElement).value = value;
}
async function submit() { await act(async () => { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }); }

it.each(locales)("submits localized %s form, announces confirmation and retains draft until new intent", async (locale) => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({ reference: crypto.randomUUID(), replayed: false }, { status: 201 }));
  vi.stubGlobal("fetch", fetcher);
  await act(() => root.render(<InquiryForm content={homeContent[locale]} locale={locale} copy={inquiryCopy[locale]} />));
  for (const control of host.querySelectorAll('input:not([name="website"]), select, textarea')) {
    expect(host.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
    expect(control.getAttribute("tabindex")).not.toBe("-1");
  }
  expect(host.querySelector('[name="email"]')?.getAttribute("dir")).toBe("ltr");
  expect(host.querySelector('[name="phone"]')?.getAttribute("dir")).toBe("ltr");
  // Localized text fields must inherit the document direction so an empty
  // Persian/Arabic field does not resolve to LTR via dir="auto".
  for (const name of ["fullName", "timeline", "description"]) {
    expect(host.querySelector(`[name="${name}"]`)?.hasAttribute("dir")).toBe(false);
  }
  expect(host.querySelector(`form a[href="/${locale}/privacy"]`)?.textContent).toBe(inquiryCopy[locale].privacy);
  fill(); await submit();
  expect(fetcher).toHaveBeenCalledTimes(1);
  const payload = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(payload.locale).toBe(locale);
  expect(payload.sourcePage).toBe(`/${locale}`);
  expect(host.querySelector('[role="status"]')?.textContent).toContain(inquiryCopy[locale].success);
  expect(document.activeElement).toBe(host.querySelector('[role="status"]'));
  expect((host.querySelector('[name="fullName"]') as HTMLInputElement).value).toContain("Synthetic");
  await submit(); expect(fetcher).toHaveBeenCalledTimes(1);
  const button = [...host.querySelectorAll("button")].find((b) => b.textContent === inquiryCopy[locale].newRequest)!;
  await act(() => button.click());
  expect((host.querySelector('[name="fullName"]') as HTMLInputElement).value).toBe("");
});
it("keeps all localized form messages and stable service choices complete", () => {
  const keys = Object.keys(inquiryCopy.en).sort();
  for (const locale of locales) {
    expect(Object.keys(inquiryCopy[locale]).sort()).toEqual(keys);
    expect(inquiryCopy[locale].serviceLabels).toHaveLength(4);
    expect(Object.values(inquiryCopy[locale]).every((value) => Array.isArray(value) || value.length > 0)).toBe(true);
  }
});
it.each(locales)("separates required and invalid messages and marks required fields in %s", async (locale) => {
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  const copy = inquiryCopy[locale];
  await act(() => root.render(<InquiryForm content={homeContent[locale]} locale={locale} copy={copy} />));
  for (const id of ["inquiry-fullName", "inquiry-description"]) {
    expect(host.querySelector(`#${id}`)?.hasAttribute("required")).toBe(true);
    const label = host.querySelector(`label[for="${id}"]`)!;
    expect(label.textContent).toContain(copy.requiredField);
    expect(label.querySelector(".ui-field-required")?.getAttribute("aria-hidden")).toBe("true");
  }
  for (const id of ["inquiry-email", "inquiry-phone", "inquiry-timeline"]) {
    expect(host.querySelector(`#${id}`)?.hasAttribute("required")).toBe(false);
    expect(host.querySelector(`label[for="${id}"]`)?.textContent).not.toContain(copy.requiredField);
  }
  await submit(); expect(fetcher).not.toHaveBeenCalled();
  const link = (id: string) => host.querySelector<HTMLAnchorElement>(`[role="alert"] a[href="#${id}"]`)!;
  expect(link("inquiry-fullName").textContent).toContain(copy.required);
  expect(link("inquiry-fullName").textContent).not.toContain(copy.contactRequired);
  expect(link("inquiry-description").textContent).toContain(copy.required);
  expect(link("inquiry-email").textContent).toContain(copy.contactRequired);
  expect(host.querySelector("#inquiry-fullName-error")?.textContent).toBe(copy.required);
  expect(host.querySelector("#inquiry-description-error")?.textContent).toBe(copy.required);
  expect(host.querySelector("#inquiry-email-error")?.textContent).toBe(copy.contactRequired);
  for (const [name, value] of Object.entries({ fullName: "a", email: "form@example.invalid", description: "short" })) (host.querySelector(`[name="${name}"]`) as HTMLInputElement).value = value;
  await submit(); expect(fetcher).not.toHaveBeenCalled();
  expect(host.querySelector("#inquiry-fullName-error")?.textContent).toBe(copy.invalid);
  expect(host.querySelector("#inquiry-description-error")?.textContent).toBe(copy.invalid);
  expect(link("inquiry-fullName").textContent).toContain(copy.invalid);
});
it("focuses accessible field-error summary and links, without sending invalid data", async () => {
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  await act(() => root.render(<InquiryForm content={homeContent.en} locale="en" copy={inquiryCopy.en} />));
  await submit(); expect(fetcher).not.toHaveBeenCalled();
  const summary = host.querySelector('[role="alert"]')!;
  expect(document.activeElement).toBe(summary);
  const link = summary.querySelector<HTMLAnchorElement>('a[href="#inquiry-fullName"]')!;
  await act(() => link.click());
  expect(document.activeElement?.id).toBe("inquiry-fullName");
  const input = host.querySelector('[name="fullName"]')!;
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(host.querySelector(`#${input.getAttribute("aria-describedby")}`)?.textContent).toBeTruthy();
});
it("retains and locks a draft after network failure, with no success or console logging", async () => {
  const log = vi.spyOn(console, "log");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("synthetic network failure")));
  await act(() => root.render(<InquiryForm content={homeContent.fa} locale="fa" copy={inquiryCopy.fa} />));
  fill(); await submit();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(inquiryCopy.fa.uncertain);
  expect(host.querySelector('[role="status"]')?.textContent).not.toContain(inquiryCopy.fa.success);
  expect((host.querySelector('[name="email"]') as HTMLInputElement).value).toBe("form@example.invalid");
  expect(host.querySelector('[name="email"]')?.matches(":disabled")).toBe(true);
  expect(log).not.toHaveBeenCalled(); log.mockRestore();
});
it("maps authoritative server field errors without echoing response details and allows correction", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "validation_failed", fields: { email: "invalid" }, detail: "synthetic-db-secret" }, { status: 400 })));
  await act(() => root.render(<InquiryForm content={homeContent.ar} locale="ar" copy={inquiryCopy.ar} />));
  fill(); await submit();
  expect(host.querySelector('[name="email"]')?.getAttribute("aria-invalid")).toBe("true");
  expect(host.querySelector('[name="email"]')?.matches(":disabled")).toBe(false);
  expect((host.querySelector('[name="email"]') as HTMLInputElement).value).toBe("form@example.invalid");
  expect(host.textContent).not.toContain("synthetic-db-secret");
});
it.each([429, 503])("keeps data and enforces retry guidance after %s", async (code) => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: code === 429 ? "rate_limited" : "unavailable" }, { status: code, headers: { "retry-after": "2" } })));
  await act(() => root.render(<InquiryForm content={homeContent.en} locale="en" copy={inquiryCopy.en} />));
  fill(); await submit();
  const button = host.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  expect(button.disabled).toBe(true);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(code === 429 ? inquiryCopy.en.limited : inquiryCopy.en.uncertain);
  expect((host.querySelector('[name="fullName"]') as HTMLInputElement).value).toContain("Synthetic");
  await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
  await act(async () => { await vi.advanceTimersByTimeAsync(1001); });
  expect(button.disabled).toBe(false);
});
