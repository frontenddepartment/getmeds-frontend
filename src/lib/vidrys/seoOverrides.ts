// Page metadata side of Vidrys SEO fixes: a page's title, meta description and canonical can
// be overridden per path by a "vidrysSeoOverride" document in Sanity (written by the webhook,
// src/app/api/vidrys/content/route.ts). Server-only; uses the public, token-free client.
import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { client } from '@/lib/sanity';
import { normalizeSitePath } from './paths';

/** Cache tag the webhook revalidates after an apply/revert. */
export const VIDRYS_SEO_TAG = 'vidrys-seo';

type Override = { path: string; title?: string; metaDescription?: string; canonical?: string };

// One query for every override, shared by all pages and cached until the webhook invalidates
// it (or an hour passes), so rebuilding hundreds of pages doesn't mean hundreds of requests.
const loadOverrides = unstable_cache(
  async (): Promise<Record<string, Override>> => {
    const rows = await client
      .withConfig({ useCdn: false })
      .fetch<Override[]>(
        `*[_type == "vidrysSeoOverride" && !(_id in path("drafts.**")) && defined(path)]{ path, title, metaDescription, canonical }`,
      );
    return Object.fromEntries(rows.map((row) => [normalizeSitePath(row.path), row]));
  },
  ['vidrys-seo-overrides'],
  { tags: [VIDRYS_SEO_TAG], revalidate: 3600 },
);

/** The page's own metadata with any Vidrys override for `path` laid on top. */
export async function withVidrysSeo(path: string, base: Metadata): Promise<Metadata> {
  let override: Override | undefined;
  try {
    override = (await loadOverrides())[normalizeSitePath(path)];
  } catch (err) {
    // Sanity unreachable: the page keeps its own metadata rather than failing to render.
    console.error('[vidrys] Could not load SEO overrides:', err);
    return base;
  }
  if (!override) return base;

  const next: Metadata = { ...base };
  if (override.title) {
    next.title = { absolute: override.title };
    if (base.openGraph) next.openGraph = { ...base.openGraph, title: override.title };
    if (base.twitter) next.twitter = { ...base.twitter, title: override.title };
  }
  if (override.metaDescription) {
    next.description = override.metaDescription;
    if (next.openGraph) next.openGraph = { ...next.openGraph, description: override.metaDescription };
    if (next.twitter) next.twitter = { ...next.twitter, description: override.metaDescription };
  }
  if (override.canonical) {
    next.alternates = { ...base.alternates, canonical: override.canonical };
  }
  return next;
}
