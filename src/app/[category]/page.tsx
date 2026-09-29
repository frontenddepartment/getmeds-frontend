import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { CatalogRoutePage } from '@/components/CatalogRoutePages';
import { getCatalogModel, isListingPrefix, wordpressPostExists } from '@/lib/catalogServer';
import { allProductsSeo, categorySeo } from '@/lib/catalogSeo';
import { NOT_FOUND_METADATA } from '@/lib/notFoundMetadata';

// Single-segment URLs. Category folders (/antibiotics, /heart-medicines, ...) and /conditions
// render the listing page, as vercel.json rewrote them onto cancer-medicines.html. Anything
// else went to the backend's /api/resolve-slug/:slug (the legacy WordPress resolver), which
// sent a blog post's slug to /blog/<slug>; the rest is a 404.
export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const safeDecode = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const model = await getCatalogModel();
  if (category === 'conditions') return allProductsSeo(model).metadata;
  if (isListingPrefix(model, category)) return categorySeo(model, safeDecode(category)).metadata;
  return NOT_FOUND_METADATA; // an old WordPress slug redirects before this is shown
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const model = await getCatalogModel();
  if (category === 'conditions') return <CatalogRoutePage seo={allProductsSeo(model)} />;
  if (isListingPrefix(model, category)) return <CatalogRoutePage seo={categorySeo(model, safeDecode(category))} />;

  const slug = safeDecode(category);
  if (await wordpressPostExists(slug)) permanentRedirect(`/blog/${encodeURIComponent(slug)}`);
  notFound();
}
