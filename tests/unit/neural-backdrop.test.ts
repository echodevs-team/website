// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  backdropConfig,
  backdropPalette,
  createNeuralBackdrop,
  particleCountForViewport,
  type NeuralBackdropController,
} from "../../src/components/marketing/neural-backdrop";

interface Fill {
  x: number;
  y: number;
  radius: number;
  fillStyle: string;
  shadowColor: string;
  shadowBlur: number;
}

interface Segment {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  strokeStyle: string;
  lineWidth: number;
  alpha: number;
}

function createFakeContext() {
  const state = { fillStyle: "", strokeStyle: "", lineWidth: 1, shadowColor: "", shadowBlur: 0, globalAlpha: 1 };
  const fills: Fill[] = [];
  const segments: Segment[] = [];
  let arc: { x: number; y: number; radius: number } | null = null;
  let start: { x: number; y: number } | null = null;
  let end: { x: number; y: number } | null = null;

  const context = {
    get fillStyle() { return state.fillStyle; },
    set fillStyle(value: string) { state.fillStyle = value; },
    get strokeStyle() { return state.strokeStyle; },
    set strokeStyle(value: string) { state.strokeStyle = value; },
    get lineWidth() { return state.lineWidth; },
    set lineWidth(value: number) { state.lineWidth = value; },
    get shadowColor() { return state.shadowColor; },
    set shadowColor(value: string) { state.shadowColor = value; },
    get shadowBlur() { return state.shadowBlur; },
    set shadowBlur(value: number) { state.shadowBlur = value; },
    get globalAlpha() { return state.globalAlpha; },
    set globalAlpha(value: number) { state.globalAlpha = value; },
    setTransform: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(() => { arc = null; start = null; end = null; }),
    arc: vi.fn((x: number, y: number, radius: number) => { arc = { x, y, radius }; }),
    fill: vi.fn(() => {
      if (arc) fills.push({ ...arc, fillStyle: state.fillStyle, shadowColor: state.shadowColor, shadowBlur: state.shadowBlur });
      arc = null;
    }),
    moveTo: vi.fn((x: number, y: number) => { start = { x, y }; end = null; }),
    lineTo: vi.fn((x: number, y: number) => { end = { x, y }; }),
    stroke: vi.fn(() => {
      if (start && end) segments.push({
        fromX: start.x, fromY: start.y, toX: end.x, toY: end.y,
        strokeStyle: state.strokeStyle, lineWidth: state.lineWidth, alpha: state.globalAlpha,
      });
    }),
  };

  return {
    context: context as unknown as CanvasRenderingContext2D,
    fills,
    segments,
    reset() { fills.length = 0; segments.length = 0; },
  };
}

interface FakeMediaList extends MediaQueryList {
  setMatches(value: boolean): void;
}

let mediaLists: Map<string, FakeMediaList>;

function media(query: string): FakeMediaList {
  let list = mediaLists.get(query);
  if (!list) {
    let matches = false;
    const target = new EventTarget() as FakeMediaList;
    Object.defineProperties(target, {
      media: { value: query, configurable: true },
      onchange: { value: null, writable: true, configurable: true },
      matches: { get: () => matches, configurable: true },
      setMatches: {
        value: (value: boolean) => {
          matches = value;
          target.dispatchEvent(new Event("change"));
        },
        configurable: true,
      },
      addListener: { value: (listener: () => void) => target.addEventListener("change", listener), configurable: true },
      removeListener: { value: (listener: () => void) => target.removeEventListener("change", listener), configurable: true },
    });
    mediaLists.set(query, target);
    list = target;
  }
  return list;
}

function setViewport(width: number, height: number, dpr = 1): void {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: dpr });
}

function seeded(seed = 0x2f6e2b1) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createFrames() {
  const pending = new Map<number, FrameRequestCallback>();
  let nextId = 1;
  const requestFrame = vi.fn((callback: FrameRequestCallback) => {
    const id = nextId++;
    pending.set(id, callback);
    return id;
  });
  const cancelFrame = vi.fn((id: number) => { pending.delete(id); });
  return {
    pending,
    requestFrame,
    cancelFrame,
    flush() {
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(0);
    },
  };
}

let fake: ReturnType<typeof createFakeContext>;
let frames: ReturnType<typeof createFrames>;
let getContextSpy: ReturnType<typeof vi.spyOn>;
let canvas: HTMLCanvasElement;
let controller: NeuralBackdropController | null;
let hidden = false;

beforeEach(() => {
  hidden = false;
  mediaLists = new Map();
  vi.stubGlobal("matchMedia", (query: string) => media(query));
  Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
  setViewport(1280, 720, 1);
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  document.documentElement.dataset.theme = "light";
  fake = createFakeContext();
  getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => fake.context);
  frames = createFrames();
  canvas = document.createElement("canvas");
  document.body.append(canvas);
  controller = null;
});

afterEach(() => {
  controller?.destroy();
  canvas.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "hidden");
  delete document.documentElement.dataset.theme;
});

function makeController(): NeuralBackdropController {
  const created = createNeuralBackdrop({
    canvas,
    window,
    requestFrame: frames.requestFrame,
    cancelFrame: frames.cancelFrame,
    random: seeded(),
  });
  expect(created).not.toBeNull();
  return created!;
}

describe("neural backdrop engine", () => {
  it("retains the reference density, thresholds and coral palette", () => {
    expect(particleCountForViewport(320, 480)).toBe(45);
    expect(particleCountForViewport(1440, 900)).toBe(92);
    expect(particleCountForViewport(3840, 2160)).toBe(110);
    expect(backdropConfig.connectionDistance).toBe(125);
    expect(backdropConfig.pointerRadius).toBe(150);
    expect(backdropConfig.pointerForce).toBe(2.2);
    expect(backdropConfig.maxDpr).toBe(2);
    expect(backdropConfig.scrollFactor).toBe(0.12);
    expect(backdropConfig.scrollDamping).toBe(0.92);
    expect(backdropPalette.light.particle).toContain("238, 119, 88");
    expect(backdropPalette.dark.particle).toContain("243, 131, 97");

    const tokens = readFileSync("src/styles/tokens.css", "utf8");
    expect(tokens).toContain("--color-brand: #ee7758;");
    expect(tokens).toContain("--color-brand: #f38361;");
    expect(backdropPalette.light.connection).toBe("#ee7758");
    expect(backdropPalette.dark.connection).toBe("#f38361");
  });

  it("starts exactly one loop and removes every listener on destroy", () => {
    const addWindow = vi.spyOn(window, "addEventListener");
    const removeWindow = vi.spyOn(window, "removeEventListener");
    const addDocument = vi.spyOn(document, "addEventListener");
    const removeDocument = vi.spyOn(document, "removeEventListener");
    controller = makeController();

    controller.start();
    controller.start();
    expect(frames.requestFrame).toHaveBeenCalledTimes(1);
    expect(frames.pending.size).toBe(1);
    expect(addWindow.mock.calls.filter(([type]) => type === "mousemove")).toHaveLength(1);
    expect(addDocument.mock.calls.filter(([type]) => type === "visibilitychange")).toHaveLength(1);
    expect(getContextSpy).toHaveBeenCalledTimes(1);

    frames.flush();
    expect(frames.requestFrame).toHaveBeenCalledTimes(2);
    expect(fake.fills.length).toBeGreaterThan(0);

    controller.destroy();
    controller.destroy();
    expect(frames.pending.size).toBe(0);
    expect(frames.cancelFrame).toHaveBeenCalledTimes(1);
    for (const type of ["resize", "scroll", "mousemove", "mouseleave"]) {
      expect(removeWindow).toHaveBeenCalledWith(type, expect.any(Function));
    }
    expect(removeDocument).toHaveBeenCalledWith("visibilitychange", expect.any(Function));

    window.dispatchEvent(new Event("resize"));
    expect(frames.pending.size).toBe(0);
  });

  it("pauses on hidden documents and resumes with one loop", () => {
    controller = makeController();
    controller.start();
    expect(frames.pending.size).toBe(1);

    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(frames.pending.size).toBe(0);
    expect(frames.cancelFrame).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(frames.pending.size).toBe(0);

    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(frames.pending.size).toBe(1);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(frames.pending.size).toBe(1);

    frames.flush();
    expect(fake.fills.length).toBeGreaterThan(0);
    expect(frames.pending.size).toBe(1);
  });

  it("coalesces resizes and keeps the pixel ratio bounded", () => {
    controller = makeController();
    controller.start();
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(720);

    setViewport(1440, 900, 3);
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("resize"));
    expect(canvas.width).toBe(1280);

    frames.flush();
    expect(canvas.width).toBe(2880);
    expect(canvas.height).toBe(1800);
    expect(fake.context.setTransform).toHaveBeenCalled();

    setViewport(1440, 900, 1.25);
    media("(resolution: 3dppx)").setMatches(false);
    frames.flush();
    expect(canvas.width).toBe(1800);
    expect(canvas.height).toBe(1125);
  });

  it("applies theme changes per frame without reinitializing the canvas", () => {
    controller = makeController();
    controller.start();
    frames.flush();
    const initialWidth = canvas.width;
    expect(fake.fills[0].fillStyle).toBe(backdropPalette.light.particle);

    fake.reset();
    document.documentElement.dataset.theme = "dark";
    frames.flush();
    expect(fake.fills[0].fillStyle).toBe(backdropPalette.dark.particle);
    expect(fake.fills[0].shadowColor).toBe(backdropPalette.dark.particleGlow);
    expect(fake.fills[0].shadowBlur).toBe(backdropConfig.shadowBlur);
    expect(canvas.width).toBe(initialWidth);
    expect(getContextSpy).toHaveBeenCalledTimes(1);

    fake.reset();
    document.documentElement.dataset.theme = "light";
    frames.flush();
    expect(fake.fills[0].fillStyle).toBe(backdropPalette.light.particle);
  });

  it("draws only in-range links and preserves pointer interaction", () => {
    controller = makeController();
    controller.start();
    frames.flush();
    expect(fake.segments.length).toBeGreaterThan(0);
    for (const segment of fake.segments) {
      const distance = Math.hypot(segment.toX - segment.fromX, segment.toY - segment.fromY);
      expect(distance).toBeLessThan(backdropConfig.connectionDistance);
      expect(segment.strokeStyle).toBe(backdropPalette.light.connection);
    }

    const target = fake.fills[0];
    fake.reset();
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: target.x, clientY: target.y }));
    frames.flush();

    const pointerSegments = fake.segments.filter((segment) => segment.toX === target.x && segment.toY === target.y);
    expect(pointerSegments.length).toBeGreaterThan(0);
    for (const segment of pointerSegments) {
      expect(Math.hypot(segment.toX - segment.fromX, segment.toY - segment.fromY)).toBeLessThan(backdropConfig.pointerRadius);
      expect(segment.strokeStyle).toBe(backdropPalette.light.pointer);
      expect(segment.lineWidth).toBe(1.3);
      expect(segment.alpha).toBeLessThanOrEqual(backdropConfig.pointerAlpha);
    }

    window.dispatchEvent(new Event("mouseleave"));
    fake.reset();
    frames.flush();
    expect(fake.segments.some((segment) => segment.toX === target.x && segment.toY === target.y)).toBe(false);
  });
});
