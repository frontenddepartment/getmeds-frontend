import { LAST_MODIFIED, absoluteUrl, pageImages, xmlEscape } from "@/lib/site";

/* Image sitemap — kept separate from the URL sitemap; lists each page's indexable images. */
export function GET() {
  const urls = Object.entries(pageImages)
    .map(([path, images]) => {
      const imageTags = images
        .map((img) => `    <image:image>\n      <image:loc>${xmlEscape(absoluteUrl(img.src))}</image:loc>\n    </image:image>`)
        .join("\n");
      return `  <url>
    <loc>${xmlEscape(absoluteUrl(path))}</loc>
    <lastmod>${LAST_MODIFIED}</lastmod>
${imageTags}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
