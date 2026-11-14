import type { MetadataRoute } from "next";
import { locales } from "../../i18n/config";
import { workSlugs } from "../../content/work-details";
import { approvedSiteOrigin, localizedUrl } from "./site";

/**
 * ECHO-506 — preview-safe robots/sitemap policy.
 *
 * The site is still a development preview: every page keeps `noindex, nofollow`
 * and no public indexing is authorized. A sitemap is therefore withheld (empty)
 * and `robots.txt` disallows crawling. Publication additionally requires the
 * owner to enable it explicitly after the production origin, noindex removal
 * and release gates are approved; this task does not flip any of those.
 */
export const PREVIEW_ROBOTS = { index: false, follow: false } as const;

/** Every localized marketing route family, including the three concept studies. */
export const MARKETING_PATHS = [
  "/",
  "/services",
  "/work",
  ...workSlugs.map((slug) => `/work/${slug}`),
  "/about",
  "/contact",
  "/privacy",
] as const;

export const PUBLIC_INDEXING_ENABLED =
  approvedSiteOrigin !== null && process.env.ECHO_PUBLIC_INDEXING === "true";

export function robotsPolicy(
  origin: string | null = approvedSiteOrigin,
  indexing: boolean = PUBLIC_INDEXING_ENABLED,
): MetadataRoute.Robots {
  if (!origin || !indexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${origin}/sitemap.xml`,
  };
}

export function sitemapEntries(
  origin: string | null = approvedSiteOrigin,
  indexing: boolean = PUBLIC_INDEXING_ENABLED,
): MetadataRoute.Sitemap {
  if (!origin || !indexing) return [];
  return MARKETING_PATHS.flatMap((pathname) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, localizedUrl(origin, locale, pathname)]),
    );
    return locales.map((locale) => ({
      url: localizedUrl(origin, locale, pathname),
      changeFrequency: "monthly" as const,
      priority: pathname === "/" ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
