// @vitest-environment jsdom
// DOM fixture + real PostgreSQL, NOT native browser/keyboard/visual acceptance.
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Pool } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { InquiryForm } from "../../src/components/marketing/inquiry-form";
import { homeContent } from "../../src/content/home";
import { inquiryCopy } from "../../src/content/inquiry";
import { createInquiryPool } from "../../src/lib/db/client";
import { handleInquiry } from "../../src/lib/inquiries/handler";
import { locales } from "../../src/i18n/config";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let owner: Pool; let app: Pool; let root: Root; let host: HTMLDivElement;
beforeAll(() => {
  if (process.env.ECHO_DISPOSABLE_DB !== "echo_test" || !new URL(process.env.TEST_OWNER_DATABASE_URL!).searchParams.get("host")?.includes("/.local/test-pg-")) throw new Error("Disposable runner required");
  owner = new Pool({ connectionString: process.env.TEST_OWNER_DATABASE_URL }); app = createInquiryPool(process.env.DATABASE_URL!);
});
beforeEach(async () => {
  await owner.query("TRUNCATE inquiries CASCADE; TRUNCATE inquiry_rate_limit; TRUNCATE inquiry_network_limit;");
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); vi.useRealTimers(); });
afterAll(async () => { await owner.end(); await app.end(); });
async function bridge(_url: unknown, init?: RequestInit) {
  const headers = new Headers(init?.headers); headers.set("origin", "http://127.0.0.1:3000");
  return handleInquiry(new Request("http://127.0.0.1:3000/api/inquiries", { ...init, headers }), {
    enabled: true, origin: "http://127.0.0.1:3000", secret: process.env.INQUIRY_DIGEST_SECRET!, pool: () => app, network: { mode: "loopback" },
  });
}
function fill(name: string) {
  for (const [key, value] of Object.entries({ fullName: name, phone: "+۴۴ ۲۰ ۷۹۴۶ ۰۰۱۸", description: "متن آزمایشی فقط برای پایگاه داده موقت. نص عربي تجريبي." })) (host.querySelector(`[name="${key}"]`) as HTMLInputElement).value = value;
}
function fireSubmit() { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }
it.each(locales)("saves %s localized form data through shared validation and real COMMIT", async (locale) => {
  let response!: Promise<Response>;
  vi.stubGlobal("fetch", vi.fn((url, init) => response = bridge(url, init)));
  await act(() => root.render(<InquiryForm locale={locale} content={homeContent[locale]} copy={inquiryCopy[locale]} />));
  const name = { fa: "نام آزمایشی", ar: "اسم تجريبي", en: "Synthetic Name" }[locale];
  fill(name); await act(async () => { fireSubmit(); await response; });
  expect(host.querySelector('[role="status"]')?.textContent).toContain(inquiryCopy[locale].success);
  const rows = (await owner.query("SELECT full_name,phone,locale FROM inquiries")).rows;
  expect(rows).toEqual([{ full_name: name, phone: "+442079460018", locale }]);
});
it("times out after real COMMIT, suppresses double submit and replays one frozen inquiry", async () => {
  let committed!: () => void;
  const committedSignal = new Promise<void>((resolve) => { committed = resolve; });
  let retryResponse!: Promise<Response>;
  const fetcher = vi.fn().mockImplementationOnce(async (url, init) => {
    const response = await bridge(url, init); expect(response.status).toBe(201); committed();
    return new Promise<Response>(() => {}); // inject lost response after real COMMIT
  }).mockImplementationOnce((url, init) => retryResponse = bridge(url, init));
  vi.stubGlobal("fetch", fetcher);
  await act(() => root.render(<InquiryForm locale="fa" content={homeContent.fa} copy={inquiryCopy.fa} />)); fill("نام آزمایشی");
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  await act(async () => { fireSubmit(); fireSubmit(); await committedSignal; });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("1");
  await act(async () => { await vi.advanceTimersByTimeAsync(15001); });
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(inquiryCopy.fa.uncertain);
  expect(host.querySelector('[role="status"]')?.textContent).not.toContain(inquiryCopy.fa.success);
  expect((host.querySelector('[name="fullName"]') as HTMLInputElement).value).toBe("نام آزمایشی");
  vi.useRealTimers();
  await act(async () => { fireSubmit(); await retryResponse; });
  expect(host.querySelector('[role="status"]')?.textContent).toContain(inquiryCopy.fa.success);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[0][1].body).toBe(fetcher.mock.calls[1][1].body);
  expect(fetcher.mock.calls[0][1].headers).toEqual(fetcher.mock.calls[1][1].headers);
  expect((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("1");
});
