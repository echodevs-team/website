import type { MetadataRoute } from "next";
import { robotsPolicy } from "@/lib/seo/policy";

/** Preview policy: disallow crawling until an approved origin and indexing gate exist. */
export default function robots(): MetadataRoute.Robots {
  return robotsPolicy();
}
