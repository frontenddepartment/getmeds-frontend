import { buildSitemapIndexXml } from '@/lib/sitemapData';

// Sitemap index over category-, product- and blog-sitemap.xml (the same index the live site serves).
// robots.txt points here and at image-sitemap.xml.
export const revalidate = 86400;

export function GET() {
  return new Response(buildSitemapIndexXml(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
