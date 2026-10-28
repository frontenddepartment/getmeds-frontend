import type { Metadata } from 'next';
import { BlogDetailServerPage, blogDetailMetadata, type BlogSearchParams } from '../blog/blogDetailServer';

// /blog-detail?p=<id> (also ?id=, ?preview_id=, ?preview=true): WordPress preview links and the
// legacy /article-detail?id= URLs. The page resolves the post by id in the browser and then
// sends a published post on to /blog/<slug>. Never indexed (vercel.json sent X-Robots-Tag:
// noindex for /blog-detail, and the shell carried its own robots noindex).
type Props = { searchParams: Promise<BlogSearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return blogDetailMetadata('', await searchParams);
}

export default async function BlogDetailPage({ searchParams }: Props) {
  return <BlogDetailServerPage routeSlug="" sp={await searchParams} />;
}
