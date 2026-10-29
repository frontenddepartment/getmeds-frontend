import type { News } from '@/types/sanity';
import { truncateAtWord } from './seo';

// Server-side WordPress reads for the blog routes. Mirrors what the old build scripts did —
// scripts/prerender-blog.cjs (per-post title/description/OG/JSON-LD, the article body and its
// preload data, the /blog crawl list) and scripts/generate-sitemap.cjs (blog-sitemap.xml) —
// which fetched WordPress directly rather than through the admin backend's /api/blog/posts.
// The browser still reads posts through /api/blog/posts (src/lib/queries.ts), as before.

const WP_API_ROOT = (
  process.env.NEXT_PUBLIC_WORDPRESS_API_ROOT ||
  process.env.VITE_WORDPRESS_API_ROOT ||
  'https://cms.getmeds.ph'
).replace(/\/$/, '');

const REVALIDATE_SECONDS = 3600;

/**
 * Blog posts next.config.ts 301-redirects to another post ("Renamed blog posts"). The old
 * scripts read these from vercel.json's redirects and kept them off the /blog crawl list and
 * out of blog-sitemap.xml; keep this list in step with next.config.ts.
 */
export const BLOG_REDIRECTED_SLUGS = new Set([
  'how-to-get-medical-assistance-from-dswd',
  '14-essential-cancer-screening-tests-for-women-early-detection-in-the-philippines',
  'nutrition-tips-for-a-healthy-immune-system',
  'cough-and-cold-medicines',
  'how-to-cure-cough-and-cold',
  'maintain-a-healthy-weight',
  'best-supplements-and-vitamins-for-kids',
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
export type WpPost = any;

// Decodes WordPress's pre-encoded HTML entities back to plain text.
export function decodeWpEntities(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(html: string): string {
  return decodeWpEntities(String(html || '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

// WPBakery shortcodes left in older posts; only vc_ tags are removed.
function stripPageBuilderShortcodes(text: string): string {
  return String(text || '').replace(/\[\/?vc_[^\]]*\]/g, '');
}

/**
 * CMS HTML placed straight into server-rendered markup, minus the parts that could run code
 * (same rules as sanitizeCmsHtml in scripts/lib/prerender-body.cjs). The browser-side
 * renderer additionally runs DOMPurify once the page is interactive.
 */
export function sanitizeCmsHtml(html: string): string {
  return String(html || '')
    .replace(/<(script|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|iframe|object|embed)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

/** The SEO fields prerender-blog.cjs derived per post (parseWpPost there). */
export function postSeo(item: WpPost) {
  const featuredMedia = item._embedded?.['wp:featuredmedia']?.[0] || {};
  return {
    slug: String(item.slug || ''),
    title: decodeWpEntities(stripHtml(item.title?.rendered || '')),
    description: truncateAtWord(stripHtml(stripPageBuilderShortcodes(item.excerpt?.rendered)), 160),
    image: String(featuredMedia.source_url || ''),
    date: String(item.date || ''),
  };
}

/** The post as /api/blog/posts returns it (toNewsItem in prerender-blog.cjs). */
export function toNewsItem(item: WpPost): News {
  const categories = item._embedded?.['wp:term']?.[0] || [];
  const featuredMedia = item._embedded?.['wp:featuredmedia']?.[0] || {};
  const content = stripPageBuilderShortcodes(item.content?.rendered || '')
    .replace(/<div id="ez-toc-container"[\s\S]*?<\/nav>\s*<\/div>/g, '')
    .replace(/<p>\s*<\/p>/g, '');
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return {
    _id: String(item.id || ''),
    _type: 'news',
    tag: categories[0] ? decodeWpEntities(categories[0].name || 'News') : 'News',
    title: decodeWpEntities(item.title?.rendered || ''),
    slug: item.slug || '',
    date: item.date || '',
    description: stripHtml(stripPageBuilderShortcodes(item.excerpt?.rendered)),
    readTime: `${Math.max(1, Math.round(words / 200))} min read`,
    image: String(featuredMedia.source_url || '')
      .replace(/^https?:\/\/(cms\.|www\.)?getmeds\.ph/i, '')
      .replace(/^http:\/\/173\.231\.197\.156/, ''),
    contentHtml: content,
    source_link: item.link || '',
  };
}

/**
 * One post by slug. `null` = WordPress answered and has no such post; `undefined` = the
 * request failed (the page then falls back to fetching in the browser, like the old shell).
 */
export async function fetchWpPostBySlug(slug: string): Promise<WpPost | null | undefined> {
  try {
    const res = await fetch(
      `${WP_API_ROOT}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=true`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) throw new Error(`WordPress API returned status ${res.status}`);
    const posts = await res.json();
    return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
  } catch (err) {
    console.warn(`[Blog] WordPress fetch for "${slug}" failed:`, err);
    return undefined;
  }
}

/**
 * One published post by its WordPress id (the ?p= / ?id= links). Same answers as
 * fetchWpPostBySlug: `null` = no such published post, `undefined` = the request failed.
 */
export async function fetchWpPostById(id: string): Promise<WpPost | null | undefined> {
  if (!/^\d+$/.test(id)) return null; // WordPress ids are numbers; anything else names no post
  try {
    const res = await fetch(`${WP_API_ROOT}/wp-json/wp/v2/posts/${id}?_fields=id,slug,status`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    // 404 = no post; 401/403 = a draft or private post, which only a preview may show.
    if (res.status === 404 || res.status === 401 || res.status === 403) return null;
    if (!res.ok) throw new Error(`WordPress API returned status ${res.status}`);
    const post = await res.json();
    return post && post.slug && post.status === 'publish' ? post : null;
  } catch (err) {
    console.warn(`[Blog] WordPress fetch for post id ${id} failed:`, err);
    return undefined;
  }
}

/** A post as the /blog crawl list and blog-sitemap.xml need it. */
export interface BlogPostSummary {
  slug: string;
  title: string;
  tag: string;
  date: string;
  modified: string;
  description: string;
  /** WordPress featured image id (0 when the post has none). */
  mediaId?: number;
}

async function fetchCategoryNames(): Promise<Map<number, string>> {
  const names = new Map<number, string>();
  try {
    const res = await fetch(`${WP_API_ROOT}/wp-json/wp/v2/categories?per_page=100&_fields=id,name`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`WordPress API returned status ${res.status}`);
    const cats = await res.json();
    if (Array.isArray(cats)) cats.forEach((c: WpPost) => names.set(Number(c.id), decodeWpEntities(c.name || '')));
  } catch (err) {
    console.warn('[Blog] Failed to fetch WordPress categories:', err);
  }
  return names;
}

/**
 * Every published post, 100 per page, as the old scripts paged through them
 * (fetchAllPosts in prerender-blog.cjs / generate-sitemap.cjs). Only the listing fields are
 * requested: the full bodies would put each page's response past the fetch cache's size cap.
 * The first category is the post's tag, as wp:term[0][0] was there.
 */
export async function fetchAllPostSummaries(): Promise<BlogPostSummary[] | null> {
  try {
    const [categories, raw] = await Promise.all([
      fetchCategoryNames(),
      (async () => {
        let all: WpPost[] = [];
        let page = 1;
        let totalPages = 1;
        do {
          const res = await fetch(
            `${WP_API_ROOT}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=id,slug,title,date,modified,excerpt,categories,featured_media`,
            { next: { revalidate: REVALIDATE_SECONDS } }
          );
          if (!res.ok) throw new Error(`WordPress API returned status ${res.status}`);
          const posts = await res.json();
          all = all.concat(Array.isArray(posts) ? posts : []);
          totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10) || 1;
          page++;
        } while (page <= totalPages);
        return all;
      })(),
    ]);
    const seen = new Set<string>();
    const out: BlogPostSummary[] = [];
    raw.forEach((item) => {
      const slug = String(item.slug || '');
      const title = decodeWpEntities(stripHtml(item.title?.rendered || ''));
      // Same skips as prerender-blog.cjs: no slug/title, or already seen across pages.
      if (!slug || !title || seen.has(slug)) return;
      seen.add(slug);
      const firstCat = Array.isArray(item.categories) ? categories.get(Number(item.categories[0])) : undefined;
      out.push({
        slug,
        title: decodeWpEntities(item.title?.rendered || ''),
        tag: firstCat || 'News',
        date: String(item.date || ''),
        modified: String(item.modified || ''),
        description: stripHtml(stripPageBuilderShortcodes(item.excerpt?.rendered)),
        mediaId: Number(item.featured_media) || 0,
      });
    });
    return out;
  } catch (err) {
    console.warn('[Blog] Failed to fetch posts from WordPress:', err);
    return null;
  }
}

/** A post as the /blog index page shows it: card + featured carousel. */
export interface BlogIndexPost {
  slug: string;
  title: string;
  tag: string;
  /** e.g. "September 15, 2026", formatted on the server so it can't differ from the browser's */
  date: string;
  excerpt: string;
  /** ~768px image for cards, ~1536px for the featured carousel; absent when the post has no image */
  image?: { card: string; wide: string; alt: string };
}

type MediaSizes = Record<string, { source_url?: string } | undefined>;

/** Featured images for the given media ids, 100 per request (WordPress's cap). */
async function fetchMediaImages(ids: number[]): Promise<Map<number, NonNullable<BlogIndexPost['image']>>> {
  const out = new Map<number, NonNullable<BlogIndexPost['image']>>();
  const unique = [...new Set(ids.filter(Boolean))];
  const batches: number[][] = [];
  for (let i = 0; i < unique.length; i += 100) batches.push(unique.slice(i, i + 100));
  await Promise.all(
    batches.map(async (batch) => {
      try {
        const res = await fetch(
          `${WP_API_ROOT}/wp-json/wp/v2/media?include=${batch.join(',')}&per_page=100&_fields=id,source_url,alt_text,media_details.sizes`,
          { next: { revalidate: REVALIDATE_SECONDS } }
        );
        if (!res.ok) throw new Error(`WordPress API returned status ${res.status}`);
        const items = await res.json();
        if (!Array.isArray(items)) return;
        items.forEach((m: WpPost) => {
          const sizes: MediaSizes = m.media_details?.sizes || {};
          const pick = (...keys: string[]) => keys.map((k) => sizes[k]?.source_url).find(Boolean) || String(m.source_url || '');
          const card = pick('medium_large', 'content-single', 'large');
          if (!card) return;
          out.set(Number(m.id), {
            card,
            wide: pick('1536x1536', 'large', 'medium_large'),
            alt: decodeWpEntities(String(m.alt_text || '')),
          });
        });
      } catch (err) {
        console.warn('[Blog] Failed to fetch featured images:', err);
      }
    })
  );
  return out;
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' });

/** Every listed post, newest first, with its featured image, for the /blog index page. */
export async function fetchBlogIndex(): Promise<BlogIndexPost[]> {
  const posts = await fetchListedPosts();
  const images = await fetchMediaImages(posts.map((p) => p.mediaId || 0));
  return posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((p) => {
      const parsed = new Date(p.date);
      const title = decodeWpEntities(stripHtml(p.title));
      let excerpt = decodeWpEntities(p.description).replace(/\s*\[(?:…|&hellip;|\.\.\.)\]\s*$/, '…').trim();
      // Posts whose body opens with the title get it repeated at the start of the auto-excerpt
      if (title && excerpt.toLowerCase().startsWith(title.toLowerCase())) excerpt = excerpt.slice(title.length).trim();
      return {
        slug: p.slug,
        title,
        tag: p.tag,
        date: Number.isNaN(parsed.getTime()) ? '' : DATE_FORMAT.format(parsed),
        excerpt: excerpt.length > 180 ? `${excerpt.slice(0, 177).replace(/\s+\S*$/, '')}…` : excerpt,
        ...(p.mediaId && images.get(p.mediaId) ? { image: images.get(p.mediaId) } : {}),
      };
    });
}

/** Posts for the /blog crawl list: everything except posts that redirect to another one. */
export async function fetchListedPosts(): Promise<BlogPostSummary[]> {
  const all = await fetchAllPostSummaries();
  return (all || []).filter((p) => !BLOG_REDIRECTED_SLUGS.has(p.slug));
}
