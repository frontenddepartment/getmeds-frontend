import { xmlEscape } from '@/lib/seo-config';
import { BLOG_REDIRECTED_SLUGS, fetchAllPostSummaries } from '@/lib/blogServer';

// blog-sitemap.xml as scripts/generate-sitemap.cjs wrote it: every published WordPress post
// (minus posts that 301 to another one), lastmod from the post's modified date, else its
// publish date, else today.
export const revalidate = 3600;

const DOMAIN = 'https://getmeds.ph';

export async function GET() {
  const posts = (await fetchAllPostSummaries()) || [];
  const currentDate = new Date().toISOString().split('T')[0];
  const livePosts = posts.filter((post) => post.slug && !BLOG_REDIRECTED_SLUGS.has(post.slug));

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  livePosts.forEach((post) => {
    const stamp = post.modified || post.date;
    const parsed = stamp ? new Date(stamp) : null;
    const dateStr = parsed && !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : currentDate;
    xml += '  <url>\n';
    xml += `    <loc>${xmlEscape(`${DOMAIN}/blog/${post.slug}`)}</loc>\n`;
    xml += `    <lastmod>${dateStr}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
