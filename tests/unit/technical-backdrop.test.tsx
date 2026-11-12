// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { StrictMode, act, type ReactNode } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TechnicalBackdrop } from "../../src/components/marketing/technical-backdrop";
import { backdropPalette } from "../../src/components/marketing/neural-backdrop";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const reducedMotion = "(prefers-reduced-motion: reduce)";
const compactViewport = "(max-width: 47.99rem)";
const coarsePointer = "(hover: none) and (pointer: coarse)";

interface MediaEntry {
  matches: boolean;
  target: EventTarget;
}

let mediaEntries: Map<string, MediaEntry>;
let host: HTMLDivElement;
let root: Root | undefined;
let getContextSpy: ReturnType<typeof vi.spyOn>;
let pending: Map<number, FrameRequestCallback>;
let drawContext: CanvasRenderingContext2D;

function queryMedia(query: string): MediaEntry {
  let entry = mediaEntries.get(query);
  if (!entry) {
    const target = new EventTarget();
    entry = { matches: false, target };
    Object.defineProperties(target, {
      media: { value: query, configurable: true },
      onchange: { value: null, writable: true, configurable: true },
      matches: { get: () => entry!.matches, configurable: true },
    });
    mediaEntries.set(query, entry);
  }
  return entry;
}

function setMedia(query: string, matches: boolean): void {
  const entry = queryMedia(query);
  entry.matches = matches;
  entry.target.dispatchEvent(new Event("change"));
}

function installFrames(): void {
  pending = new Map();
  let nextId = 1;
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    value: vi.fn((callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    }),
  });
  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    value: vi.fn((id: number) => { pending.delete(id); }),
  });
}

function flushFrame(): void {
  const callbacks = [...pending.values()];
  pending.clear();
  for (const callback of callbacks) callback(0);
}

async function mount(node: ReactNode = <TechnicalBackdrop />) {
  root = createRoot(host);
  await act(() => root?.render(node));
}

beforeEach(() => {
  mediaEntries = new Map();
  vi.stubGlobal("matchMedia", (query: string) => queryMedia(query).target as unknown as MediaQueryList);
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 720 });
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 1 });
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  document.documentElement.dataset.theme = "light";
  installFrames();

  drawContext = {
    setTransform: vi.fn(), scale: vi.fn(), clearRect: vi.fn(),
    beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
    fillStyle: "", strokeStyle: "", lineWidth: 1, shadowColor: "", shadowBlur: 0, globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
  getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => drawContext);

  host = document.createElement("div");
  document.body.append(host);
  root = undefined;
});

afterEach(async () => {
  if (root) await act(() => root?.unmount());
  root = undefined;
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
});

describe("technical backdrop client boundary", () => {
  it("renders the static fallback on the server and initializes the canvas only after hydration", async () => {
    const node = <TechnicalBackdrop />;
    host.innerHTML = renderToString(node);
    expect(getContextSpy).not.toHaveBeenCalled();
    expect(pending.size).toBe(0);
    expect(host.querySelector(".technical-backdrop")?.getAttribute("data-backdrop")).toBe("static");
    expect(host.querySelector(".technical-backdrop svg")).not.toBeNull();
    expect(host.querySelector("canvas.technical-canvas")?.getAttribute("aria-hidden")).toBe("true");
    expect(host.querySelector(".technical-backdrop")?.getAttribute("aria-hidden")).toBe("true");

    const errors: unknown[] = [];
    await act(() => {
      root = hydrateRoot(host, node, { onRecoverableError: (error) => errors.push(error) });
    });
    expect(errors).toEqual([]);
    expect(getContextSpy).toHaveBeenCalledTimes(1);
    expect(host.querySelector(".technical-backdrop")?.getAttribute("data-backdrop")).toBe("animated");
    expect(pending.size).toBe(1);
  });

  it("keeps the static fallback for reduced motion and starts/stops on preference changes", async () => {
    setMedia(reducedMotion, true);
    await mount();
    expect(getContextSpy).not.toHaveBeenCalled();
    expect(pending.size).toBe(0);
    expect(host.querySelector(".technical-backdrop")?.getAttribute("data-backdrop")).toBe("static");

    await act(() => setMedia(reducedMotion, false));
    expect(getContextSpy).toHaveBeenCalledTimes(1);
    expect(pending.size).toBe(1);
    expect(host.querySelector(".technical-backdrop")?.getAttribute("data-backdrop")).toBe("animated");

    await act(() => setMedia(reducedMotion, true));
    expect(pending.size).toBe(0);
    expect(host.querySelector(".technical-backdrop")?.getAttribute("data-backdrop")).toBe("static");
  });

  it("keeps compact viewports static and animates again at desktop width", async () => {
    setMedia(compactViewport, true);
    await mount();
    expect(getContextSpy).not.toHaveBeenCalled();
    expect(pending.size).toBe(0);

    await act(() => setMedia(compactViewport, false));
    expect(getContextSpy).toHaveBeenCalledTimes(1);
    expect(pending.size).toBe(1);
    expect(host.querySelector(".technical-backdrop")?.getAttribute("data-backdrop")).toBe("animated");
  });

  it("keeps coarse-pointer devices static", async () => {
    setMedia(coarsePointer, true);
    await mount();
    expect(getContextSpy).not.toHaveBeenCalled();
    expect(pending.size).toBe(0);
    expect(host.querySelector(".technical-backdrop")?.getAttribute("data-backdrop")).toBe("static");

    await act(() => setMedia(coarsePointer, false));
    expect(getContextSpy).toHaveBeenCalledTimes(1);
    expect(pending.size).toBe(1);
  });

  it("applies theme changes without recreating the canvas or animation loop", async () => {
    await mount();
    flushFrame();
    const canvas = host.querySelector<HTMLCanvasElement>("canvas.technical-canvas")!;
    const width = canvas.width;
    expect(drawContext.fillStyle).toBe(backdropPalette.light.particle);

    document.documentElement.dataset.theme = "dark";
    flushFrame();
    expect(drawContext.fillStyle).toBe(backdropPalette.dark.particle);
    expect(canvas.width).toBe(width);
    expect(getContextSpy).toHaveBeenCalledTimes(1);
    expect(pending.size).toBe(1);
  });

  it("does not create a second loop on React re-renders or strict-mode remounts", async () => {
    await act(() => {
      root = createRoot(host);
      root.render(<StrictMode><TechnicalBackdrop /></StrictMode>);
    });
    expect(pending.size).toBe(1);
    await act(() => root?.render(<StrictMode><TechnicalBackdrop /></StrictMode>));
    expect(pending.size).toBe(1);
    expect(getContextSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("uses the same fallback swap contract in the stylesheet", () => {
    const css = readFileSync("src/styles/homepage.css", "utf8");
    expect(css).toContain('.technical-backdrop[data-backdrop="animated"] > svg { display: none; }');
    expect(css).toContain('.technical-backdrop[data-backdrop="static"] > canvas { visibility: hidden; }');
    expect(css).toMatch(/\.technical-backdrop \{[^}]*pointer-events: none/);
    expect(css).toMatch(/\.technical-backdrop \{[^}]*overflow: hidden/);
  });

  it("still emits a complete static network without JavaScript", () => {
    const html = renderToStaticMarkup(<TechnicalBackdrop />);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    expect(wrapper.querySelectorAll("svg path")).toHaveLength(27);
    expect(wrapper.querySelectorAll("svg circle")).toHaveLength(22);
    expect(wrapper.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    expect(wrapper.querySelector(".technical-backdrop")?.getAttribute("data-backdrop")).toBe("static");
  });
});
