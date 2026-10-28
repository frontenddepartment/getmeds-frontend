import { buildProductSitemapXml } from '@/lib/sitemapData';

// Port of the product-sitemap.xml that scripts/generate-sitemap.cjs wrote into public/ on every build;
// regenerated from the same sources at most once a day.
export const revalidate = 86400;

export async function GET() {
  return new Response(await buildProductSitemapXml(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
