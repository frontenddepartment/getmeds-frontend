import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/pageMeta';
import { fetchWpPostBySlug, postSeo, toNewsItem } from '@/lib/blogServer';
import BlogDetailClient from './BlogDetailClient';

// Shared by /blog/<slug...> and /blog-detail. In the old site both were the one blog-detail
// page (vercel.json rewrote /blog/:slug* to it); scripts/prerender-blog.cjs then wrote a
// static copy per post with its own <head> and article body. Here the server reads the post
// from WordPress per request (cached for an hour) to produce the same head and first render.

export type BlogSearchParams = Record<string, string | string[] | undefined>;

const DOMAIN = 'https://getmeds.ph';

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** ?preview=true, ?preview_id=, ?p= or ?id= — the page then resolves the post in the browser. */
export function hasPreviewParams(sp: BlogSearchParams): boolean {
  return first(sp.preview) === 'true' || Boolean(first(sp.preview_id) || first(sp.p) || first(sp.id));
}

// blog-detail.html's own head: what any URL without a prerendered post got.
const SHELL_METADATA: Metadata = {
  title: { absolute: 'Blog - Getmeds' },
  description:
    'Read the latest health insights, product updates, and company news from Getmeds — your trusted pharmaceutical partner in the Philippines.',
  robots: { index: false, follow: true },
};

async function loadPost(routeSlug: string, sp: BlogSearchParams) {
  if (!routeSlug || hasPreviewParams(sp)) return undefined;
  return fetchWpPostBySlug(routeSlug);
}

export async function blogDetailMetadata(routeSlug: string, sp: BlogSearchParams): Promise<Metadata> {
  const raw = await loadPost(routeSlug, sp);
  if (!raw) return SHELL_METADATA;
  const post = postSeo(raw);
  if (!post.slug || !post.title) return SHELL_METADATA;
  return pageMetadata({
    title: post.title,
    description: post.description || `${post.title} — read the full article on the Getmeds blog.`,
    path: `/blog/${post.slug}`,
    image: post.image || undefined,
    type: 'article',
  });
}

export async function BlogDetailServerPage({ routeSlug, sp }: { routeSlug: string; sp: BlogSearchParams }) {
  const raw = await loadPost(routeSlug, sp);
  const initialSlug = hasPreviewParams(sp) ? '' : routeSlug;
  const post = raw ? postSeo(raw) : null;
  const news = raw && post?.slug && post.title ? toNewsItem(raw) : null;
  const canonical = post ? `${DOMAIN}/blog/${post.slug}` : '';
  const jsonLd = news && post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        ...(post.image ? { image: post.image } : {}),
        ...(post.date ? { datePublished: post.date } : {}),
        url: canonical,
        mainEntityOfPage: canonical,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <BlogDetailClient routeSlug={routeSlug} initialSlug={initialSlug} initialArticle={news} />
    </>
  );
}
