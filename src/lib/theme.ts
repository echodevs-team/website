export const themeStorageKey = "echo_theme";
export const themeChangeEvent = "echo:theme-change";
export const themeUpdateEvent = "echo:theme-update";
export type ThemeMode = "light" | "dark" | "system";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}
