import type { MetadataRoute } from "next";
import { SITE_URL, disallowedPaths } from "@/lib/site";

/* Sitemaps tell crawlers what to index; robots.txt tells them what to skip. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: disallowedPaths }],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/image-sitemap.xml`],
    host: SITE_URL,
  };
}
