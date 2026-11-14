import type { Metadata } from "next";
import { locales, localePath, type Locale } from "../../i18n/config";

/**
 * ECHO-506 — single source of truth for the public origin.
 *
 * No production origin has been approved for this project yet. Canonical URLs
 * and absolute `hreflang` alternates are therefore withheld rather than being
 * derived from the request `Host`, localhost or an invented domain. When the
 * owner approves a real HTTPS origin, set `ECHO_SITE_ORIGIN` (for example
 * `https://www.example.com`) and the same metadata functions start emitting
 * self-referencing locale canonicals and reciprocal FA/EN/AR alternates.
 */
export const SITE_NAME = "Echo Devs";
export const SITE_ORIGIN_ENV = "ECHO_SITE_ORIGIN";

const BLOCKED_HOSTNAME_SUFFIXES = [".localhost", ".local", ".internal", ".test", ".example", ".invalid"] as const;
const BLOCKED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

/** Parse an owner-approved absolute HTTPS origin. Returns null when unusable. */
export function parseSiteOrigin(raw: string | undefined | null): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.port) return null;
  if (url.pathname !== "/" || url.search || url.hash) return null;

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) return null;
  if (!hostname.includes(".")) return null;
  if (hostname.startsWith("[") || hostname.includes(":")) return null;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/u.test(hostname)) return null;
  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) return null;

  return url.origin;
}

/**
 * Read once at module load. The value is only ever the approved public origin;
 * request headers are deliberately not consulted.
 */
export const approvedSiteOrigin = parseSiteOrigin(process.env[SITE_ORIGIN_ENV]);

function normalizeRoutePath(pathname: string): string {
  if (!pathname.startsWith("/")) throw new Error("Expected an app-relative route pathname");
  const decoded = decodeURIComponent(pathname);
  if (decoded.startsWith("//") || /[\\?#\s]/u.test(decoded)
    || /(^|\/)\.{1,2}(\/|$)/u.test(decoded) || /%2f|%5c/iu.test(pathname)) {
    throw new Error("Expected an app-relative route pathname without query, fragment or traversal");
  }
  return pathname === "/" ? "/" : pathname.replace(/\/+$/u, "");
}

/** Absolute localized URL for an approved origin and an app-relative path. */
export function localizedUrl(origin: string, locale: Locale, pathname = "/"): string {
  return origin + localePath(locale, normalizeRoutePath(pathname));
}

/**
 * Canonical + reciprocal FA/EN/AR alternates for one localized route.
 * Returns `undefined` while no approved origin exists, so preview HTML never
 * advertises a guessed, localhost or Host-derived URL. `x-default` is omitted
 * because no verified default destination has been approved.
 */
export function localizedAlternates(
  locale: Locale,
  pathname = "/",
  origin: string | null = approvedSiteOrigin,
): Metadata["alternates"] | undefined {
  if (!origin) return undefined;
  const languages = Object.fromEntries(
    locales.map((target) => [target, localizedUrl(origin, target, pathname)]),
  );
  return { canonical: localizedUrl(origin, locale, pathname), languages };
}
