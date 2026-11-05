import { themeChangeEvent, themeStorageKey, themeUpdateEvent } from "./theme";

// Static, trusted code only. Synchronous head execution precedes body paint.
// Keep initialization and subsequent changes in one controller, not two
// competing React/bootstrap implementations. No user content is interpolated.
export const themeInitScript = `(() => {
  const root = document.documentElement;
  const key = ${JSON.stringify(themeStorageKey)};
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => value === 'light' || value === 'dark' || value === 'system';
  let mode = 'system';
  try { const saved = localStorage.getItem(key); if (valid(saved)) mode = saved; } catch {}
  function apply() {
    root.dataset.themeMode = mode;
    root.dataset.theme = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
    window.dispatchEvent(new Event(${JSON.stringify(themeUpdateEvent)}));
  }
  window.addEventListener(${JSON.stringify(themeChangeEvent)}, event => {
    if (!valid(event.detail)) return;
    mode = event.detail;
    try { localStorage.setItem(key, mode); } catch {}
    apply();
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    try { if (event.storageArea && event.storageArea !== localStorage) return; } catch { return; }
    mode = valid(event.newValue) ? event.newValue : 'system';
    apply();
  });
  media.addEventListener('change', () => { if (mode === 'system') apply(); });
  apply();
})();`;
