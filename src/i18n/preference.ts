import { localeCookie, localePath, type Locale } from "./config";

// One year is long enough to remember an intentional choice without becoming
// effectively permanent. The cookie contains only the locale identifier.
export const localePreferenceMaxAge = 60 * 60 * 24 * 365;

// Only simple in-page fragments are carried across a locale switch. Query
// strings are intentionally not propagated: marketing routes define no query
// state and retaining arbitrary parameters could leak unrelated values.
const safeFragment = /^#[A-Za-z][\w:-]*$/u;

export function localeSwitchHref(target: Locale, path: string, fragment = ""): string {
  const base = localePath(target, path);
  return safeFragment.test(fragment) ? `${base}${fragment}` : base;
}

export function localePreferenceCookie(target: Locale, secure: boolean): string {
  return `${localeCookie}=${target}; Path=/; Max-Age=${localePreferenceMaxAge}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** Persist an intentional language choice so the root can remember it later. */
export function rememberLocale(target: Locale): void {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = localePreferenceCookie(target, secure);
}
