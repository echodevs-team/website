// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "../../src/components/layout/header";
import { MobileNav } from "../../src/components/layout/mobile-nav";
import { ThemeSelect } from "../../src/components/ui/theme-select";
import { Link } from "../../src/components/ui/link";
import { getMessages } from "../../src/i18n/messages";
import { locales } from "../../src/i18n/config";
import { themeChangeEvent, themeUpdateEvent } from "../../src/lib/theme";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let host: HTMLDivElement;
let root: Root | undefined;
let media: MediaQueryList;
let desktop = false;

beforeEach(() => {
  root = undefined;
  desktop = false;
  const target = new EventTarget();
  media = Object.assign(target, { get matches() { return desktop; } }) as MediaQueryList;
  // Object.assign copies a getter's value: define it explicitly for resize tests.
  Object.defineProperty(media, "matches", { get: () => desktop, configurable: true });
  vi.stubGlobal("matchMedia", () => media);
  // jsdom has no top layer/focus containment. Only emulate dialog API events;
  // these tests intentionally do NOT claim native browser Tab/inert validation.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  } });
  host = document.createElement("div");
  document.body.append(host);
  document.documentElement.dataset.themeMode = "system";
  document.body.style.overflow = "auto";
});
afterEach(async () => {
  if (root) await act(() => root?.unmount());
  host?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount(node: ReactNode) {
  root = createRoot(host);
  await act(() => root?.render(node));
}
function buttons() { return [...host.querySelectorAll("button")]; }
async function open() { await act(() => buttons()[0].click()); }

describe("localized header", () => {
  it.each(locales)("uses safe locale destinations and honest placeholders in %s", async (locale) => {
    await mount(<Header locale={locale} />);
    const t = getMessages(locale);
    expect(host.querySelector("header")).not.toBeNull();
    expect(host.textContent).toContain(t.Header.planned);
    for (const a of host.querySelectorAll("a")) expect(a.getAttribute("href")).toMatch(/^\/(fa|en|ar)$/);
    for (const target of locales) {
      expect(host.querySelector(`a[href="/${target}"][hreflang="${target}"]`)?.textContent).toBeTruthy();
    }
    expect(host.querySelector(`a[hreflang="${locale}"][aria-current="page"]`)).not.toBeNull();
    expect(host.querySelector('a[href$="/contact"]')).toBeNull();
    expect(host.querySelector('[role="menu"]')).toBeNull();
  });
  it("preserves the equivalent path for locale links", async () => {
    await mount(<Header locale="fa" path="/work/example" />);
    expect(host.querySelector('a[hreflang="en"]')?.getAttribute("href")).toBe("/en/work/example");
  });
  it("hydrates the complete header without recoverable mismatches", async () => {
    const node = <Header locale="ar" />;
    host.innerHTML = renderToString(node);
    document.documentElement.dataset.themeMode = "dark";
    const errors: unknown[] = [];
    await act(() => { root = hydrateRoot(host, node, { onRecoverableError: (error) => errors.push(error) }); });
    expect(errors).toEqual([]);
    expect([...host.querySelectorAll("select")].every((s) => s.value === "dark")).toBe(true);
    await open();
    expect(host.querySelector("dialog")?.open).toBe(true);
  });
});

describe("mobile dialog lifecycle", () => {
  const nav = <MobileNav labels={{ open: "Menu", close: "Close", title: "Navigation" }}>
    <nav><Link href="/en">Home</Link><Link href="/ar">العربية</Link></nav>
  </MobileNav>;
  it("opens, focuses close control, exposes expanded state and locks scrolling", async () => {
    await mount(nav);
    expect(buttons()[0].getAttribute("aria-expanded")).toBe("false");
    await open();
    expect(host.querySelector("dialog")?.open).toBe(true);
    expect(buttons()[0].getAttribute("aria-controls")).toBe(host.querySelector("dialog")?.id);
    expect(buttons()[0].getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(buttons()[1]);
    expect(document.body.style.overflow).toBe("hidden");
  });
  it("Escape dismisses, restores trigger focus and previous scroll state", async () => {
    await mount(nav); await open();
    await act(() => host.querySelector("dialog")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(host.querySelector("dialog")?.open).toBe(false);
    expect(document.activeElement).toBe(buttons()[0]);
    expect(document.body.style.overflow).toBe("auto");
    expect(buttons()[0].getAttribute("aria-expanded")).toBe("false");
  });
  it("closes through the explicit close button and native cancel event", async () => {
    await mount(nav); await open();
    await act(() => buttons()[1].click());
    expect(host.querySelector("dialog")?.open).toBe(false);
    await open();
    await act(() => host.querySelector("dialog")!.dispatchEvent(new Event("cancel", { cancelable: true })));
    expect(host.querySelector("dialog")?.open).toBe(false);
  });
  it("closes on locale-link activation without preventing navigation", async () => {
    await mount(nav); await open();
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const link = host.querySelector('a[href="/ar"]')!;
    // Observe after React's delegated handler, then suppress jsdom navigation.
    let appPrevented: boolean | undefined;
    const preventNavigation = (e: Event) => { appPrevented = e.defaultPrevented; e.preventDefault(); };
    document.addEventListener("click", preventNavigation, { once: true });
    await act(() => link.dispatchEvent(event));
    expect(appPrevented).toBe(false);
    expect(host.querySelector("dialog")?.open).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
  });
  it("closes on desktop resize and restores focus to visible brand", async () => {
    await mount(<><Link href="/en" className="header-brand">Echo Devs</Link>{nav}</>);
    await open();
    desktop = true;
    await act(() => media.dispatchEvent(new Event("change")));
    expect(host.querySelector("dialog")?.open).toBe(false);
    expect(document.activeElement).toBe(host.querySelector(".header-brand"));
    expect(document.body.style.overflow).toBe("auto");
  });
  it("restores body scrolling on unmount while open", async () => {
    await mount(nav); await open();
    await act(() => root?.unmount());
    root = undefined;
    expect(document.body.style.overflow).toBe("auto");
  });
});

describe("theme select hydration", () => {
  it("stays safely disabled if the head initializer was blocked", async () => {
    delete document.documentElement.dataset.themeMode;
    await mount(<ThemeSelect labels={getMessages("en").Theme} />);
    expect(host.querySelector("select")?.disabled).toBe(true);
  });
  it("hydrates deterministically then reflects the initialized preference", async () => {
    const labels = getMessages("fa").Theme;
    const node = <ThemeSelect labels={labels} />;
    host.innerHTML = renderToString(node);
    expect(host.querySelector("select")?.disabled).toBe(true);
    document.documentElement.dataset.themeMode = "dark";
    const errors: unknown[] = [];
    await act(() => { root = hydrateRoot(host, node, { onRecoverableError: (error) => errors.push(error) }); });
    expect(errors).toEqual([]);
    expect(host.querySelector("select")?.value).toBe("dark");
    expect(host.querySelector("select")?.disabled).toBe(false);
  });
  it("dispatches validated choices and synchronizes multiple controls", async () => {
    const labels = getMessages("en").Theme;
    await mount(<><ThemeSelect labels={labels} /><ThemeSelect labels={labels} /></>);
    const listener = vi.fn((event: Event) => {
      document.documentElement.dataset.themeMode = (event as CustomEvent).detail;
      window.dispatchEvent(new Event(themeUpdateEvent));
    });
    window.addEventListener(themeChangeEvent, listener);
    try {
      const select = host.querySelector("select")!;
      select.value = "light";
      await act(() => select.dispatchEvent(new Event("change", { bubbles: true })));
      expect(listener).toHaveBeenCalledOnce();
      expect([...host.querySelectorAll("select")].map((s) => s.value)).toEqual(["light", "light"]);
      expect(new Set([...host.querySelectorAll("select")].map((s) => s.id)).size).toBe(2);
    } finally { window.removeEventListener(themeChangeEvent, listener); }
  });
});
