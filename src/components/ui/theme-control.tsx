"use client";

import { useSyncExternalStore } from "react";
import { isThemeMode, themeChangeEvent, themeUpdateEvent, type ThemeMode } from "../../lib/theme";

function subscribe(notify: () => void) {
  window.addEventListener(themeUpdateEvent, notify);
  return () => window.removeEventListener(themeUpdateEvent, notify);
}
function snapshot(): ThemeMode | null {
  const mode = document.documentElement.dataset.themeMode;
  return isThemeMode(mode) ? mode : null;
}

const icons: Record<ThemeMode, string> = {
  light: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0-5v2m0 16v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M2 12h2m16 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  dark: "M20 13.2A8.2 8.2 0 0 1 10.8 4a8.2 8.2 0 1 0 9.2 9.2z",
  system: "M4 5h16v11H4zM9 20h6m-3-4v4",
};

/** Reference-style icon control with the three persisted modes kept explicit. */
export function ThemeControl({ labels }: {
  labels: { label: string; light: string; dark: string; system: string };
}) {
  const mode = useSyncExternalStore(subscribe, snapshot, () => null);
  const options: readonly [ThemeMode, string][] = [["light", labels.light], ["dark", labels.dark], ["system", labels.system]];
  return <div className="theme-control" role="group" aria-label={labels.label}>
    {options.map(([value, label]) => <button key={value} type="button" title={label} aria-label={label}
      aria-pressed={mode === value} disabled={mode === null} onClick={() => {
        window.dispatchEvent(new CustomEvent(themeChangeEvent, { detail: value }));
      }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={icons[value]} /></svg>
    </button>)}
  </div>;
}
