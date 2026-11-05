import { buildImageSitemapXml } from '@/lib/sitemapData';

// Every page's indexable images: products, categories, blog posts and page assets.
export const revalidate = 86400;

export async function GET() {
  return new Response(await buildImageSitemapXml(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
