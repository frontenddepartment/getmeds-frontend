import type { Metadata } from 'next';
import { BlogDetailServerPage, blogDetailMetadata, type BlogSearchParams } from '../blogDetailServer';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// /blog/<slug>, and any deeper path (/blog/2024/05/<slug> from the dated-permalink redirect):
// the post is the last segment. The old site rewrote /blog/:slug* to its blog-detail page.
type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<BlogSearchParams>;
};

function routeSlugOf(segments: string[]): string {
  const last = segments[segments.length - 1] || '';
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

async function baseGenerateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return blogDetailMetadata(routeSlugOf(slug), sp);
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return <BlogDetailServerPage routeSlug={routeSlugOf(slug)} sp={sp} />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export async function generateMetadata(...args: Parameters<typeof baseGenerateMetadata>): Promise<Metadata> {
  return withVidrysSeo(await `/blog/${(await args[0].params).slug.join('/')}`, await baseGenerateMetadata(...args));
}
