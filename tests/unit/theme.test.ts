import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { themeChangeEvent, themeStorageKey } from "../../src/lib/theme";
import { themeInitScript } from "../../src/lib/theme-init";

function boot({ saved = new Map<string, string>(), dark = false, blocked = false } = {}) {
  const dataset: Record<string, string> = {};
  const media = Object.assign(new EventTarget(), { matches: dark });
  const window = Object.assign(new EventTarget(), { matchMedia: () => media });
  const localStorage = {
    getItem(key: string) { if (blocked) throw new Error("Denied"); return saved.get(key) ?? null; },
    setItem(key: string, value: string) { if (blocked) throw new Error("Denied"); saved.set(key, value); },
  };
  runInNewContext(themeInitScript, { window, document: { documentElement: { dataset } }, localStorage, Event });
  return {
    dataset, saved,
    choose(mode: string) { window.dispatchEvent(new CustomEvent(themeChangeEvent, { detail: mode })); },
    system(dark: boolean) { media.matches = dark; media.dispatchEvent(new Event("change")); },
    storage(key: string | null, value: string | null, storageArea = localStorage) {
      window.dispatchEvent(Object.assign(new Event("storage"), { key, newValue: value, storageArea }));
    },
  };
}

describe("exact pre-paint theme controller", () => {
  it("defaults to system and follows live OS changes", () => {
    const theme = boot({ dark: true });
    expect(theme.dataset).toEqual({ themeMode: "system", theme: "dark" });
    theme.system(false);
    expect(theme.dataset.theme).toBe("light");
  });
  it("persists explicit modes across reloads and ignores OS changes for overrides", () => {
    const first = boot();
    first.choose("dark");
    first.system(false);
    expect(first.dataset.theme).toBe("dark");
    expect(boot({ saved: first.saved }).dataset.theme).toBe("dark");
    first.choose("light");
    expect(boot({ saved: first.saved, dark: true }).dataset.theme).toBe("light");
  });
  it("persists system selection and resumes OS following", () => {
    const theme = boot({ dark: true });
    theme.choose("light");
    theme.choose("system");
    expect(theme.saved.get(themeStorageKey)).toBe("system");
    expect(boot({ saved: theme.saved, dark: true }).dataset.theme).toBe("dark");
    theme.system(false);
    expect(theme.dataset.theme).toBe("light");
  });
  it("ignores invalid saved values and invalid change events", () => {
    const theme = boot({ saved: new Map([[themeStorageKey, "<script>"]]), dark: true });
    theme.choose("invalid");
    expect(theme.dataset).toEqual({ themeMode: "system", theme: "dark" });
  });
  it("remains usable in memory when storage reads and writes throw", () => {
    const theme = boot({ blocked: true });
    theme.choose("dark");
    expect(theme.dataset.theme).toBe("dark");
    theme.choose("system");
    theme.system(true);
    expect(theme.dataset.theme).toBe("dark");
  });
  it("synchronizes tabs and storage removal, ignoring unrelated keys/areas", () => {
    const theme = boot();
    theme.storage("unrelated", "dark");
    expect(theme.dataset.theme).toBe("light");
    theme.storage(themeStorageKey, "dark");
    expect(theme.dataset.theme).toBe("dark");
    theme.storage(null, null);
    expect(theme.dataset.themeMode).toBe("system");
    theme.storage(themeStorageKey, "dark", { getItem: () => null, setItem() {} });
    expect(theme.dataset.themeMode).toBe("system");
  });
});
