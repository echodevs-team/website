import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/seo/policy";

/**
 * Withheld in preview: returns no URLs until the owner approves a production
 * origin and explicitly enables publication. Never emits localhost,
 * placeholder or Host-derived URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
