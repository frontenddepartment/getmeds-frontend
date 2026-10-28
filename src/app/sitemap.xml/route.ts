import { LAST_MODIFIED, absoluteUrl, routes, xmlEscape } from "@/lib/site";

/* URL sitemap — every public page with its crawl priority. */
export function GET() {
  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${xmlEscape(absoluteUrl(r.path))}</loc>
    <lastmod>${LAST_MODIFIED}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
