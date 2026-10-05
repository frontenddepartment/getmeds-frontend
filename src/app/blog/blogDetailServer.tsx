import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { pageMetadata } from '@/lib/pageMeta';
import { fetchWpPostById, fetchWpPostBySlug, postSeo, toNewsItem } from '@/lib/blogServer';
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

/** A WordPress draft preview (?preview=true / ?preview_id=): always resolved in the browser. */
function isDraftPreview(sp: BlogSearchParams): boolean {
  return first(sp.preview) === 'true' || Boolean(first(sp.preview_id));
}

/**
 * The post for this address, or the address's real answer: a 404 when WordPress has no such
 * post, and for the ?p= / ?id= links (/blog-detail, old /article-detail) a 308 to the post's
 * /blog/<slug>. Both used to be a 200 "Blog - Getmeds" shell that sent the browser on with
 * JavaScript, which Google reports as noindex / Soft 404 instead of dropping the address.
 * When WordPress can't be reached it stays `undefined` and the browser tries again.
 */
async function loadPost(routeSlug: string, sp: BlogSearchParams) {
  if (isDraftPreview(sp)) return undefined;
  if (!routeSlug) {
    const linkId = first(sp.p) || first(sp.id);
    if (!linkId) return undefined;
    const linked = await fetchWpPostById(linkId);
    if (linked === null) notFound();
    if (linked) permanentRedirect(`/blog/${linked.slug}`);
    return undefined;
  }
  if (hasPreviewParams(sp)) return undefined;
  const post = await fetchWpPostBySlug(routeSlug);
  if (post === null) notFound();
  return post;
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
