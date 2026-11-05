"use client";

import { useId, useSyncExternalStore } from "react";
import { isThemeMode, themeChangeEvent, themeUpdateEvent } from "../../lib/theme";

function subscribe(notify: () => void) {
  window.addEventListener(themeUpdateEvent, notify);
  return () => window.removeEventListener(themeUpdateEvent, notify);
}
function snapshot() {
  const mode = document.documentElement.dataset.themeMode;
  return isThemeMode(mode) ? mode : null;
}

export function ThemeSelect({ labels }: {
  labels: { label: string; light: string; dark: string; system: string };
}) {
  const id = useId();
  const mode = useSyncExternalStore(subscribe, snapshot, () => null);
  return <div className="theme-select">
    <label htmlFor={id}>{labels.label}</label>
    <select id={id} value={mode ?? "system"} disabled={mode === null} onChange={(event) => {
      if (isThemeMode(event.target.value)) {
        window.dispatchEvent(new CustomEvent(themeChangeEvent, { detail: event.target.value }));
      }
    }}>
      <option value="light">{labels.light}</option>
      <option value="dark">{labels.dark}</option>
      <option value="system">{labels.system}</option>
    </select>
  </div>;
}
