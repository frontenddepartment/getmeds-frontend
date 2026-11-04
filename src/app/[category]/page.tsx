import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { CatalogRoutePage } from '@/components/CatalogRoutePages';
import ConditionsIndex from '@/components/ConditionsIndex';
import OtherRangePage from '@/components/OtherRangePage';
import { otherRanges } from '@/lib/catalogueHub';
import { getCatalogModel, isListingPrefix, wordpressPostExists } from '@/lib/catalogServer';
import { categorySeo, conditionsIndexSeo } from '@/lib/catalogSeo';
import { NOT_FOUND_METADATA } from '@/lib/notFoundMetadata';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// Single-segment URLs. Category folders (/antibiotics, /heart-medicines, ...) render the listing
// page, as vercel.json rewrote them onto cancer-medicines.html; /conditions is the A–Z page. Anything
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

async function baseGenerateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const range = otherRanges.find((r) => r.slug === category);
  if (range) {
    return {
      title: range.title,
      description: `${range.text} Send an inquiry to Getmeds for availability and a price quote.`,
      alternates: { canonical: `/${range.slug}` },
      robots: { index: false, follow: true }, // nothing to list until the products are in the sheet
    };
  }
  const model = await getCatalogModel();
  if (category === 'conditions') return conditionsIndexSeo().metadata;
  if (isListingPrefix(model, category)) return categorySeo(model, safeDecode(category)).metadata;
  return NOT_FOUND_METADATA; // an old WordPress slug redirects before this is shown
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const range = otherRanges.find((r) => r.slug === category);
  if (range) return <OtherRangePage range={range} />;
  const model = await getCatalogModel();
  if (category === 'conditions') return <ConditionsIndex model={model} />;
  if (isListingPrefix(model, category)) return <CatalogRoutePage seo={categorySeo(model, safeDecode(category))} />;

  const slug = safeDecode(category);
  if (await wordpressPostExists(slug)) permanentRedirect(`/blog/${encodeURIComponent(slug)}`);
  notFound();
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export async function generateMetadata(...args: Parameters<typeof baseGenerateMetadata>): Promise<Metadata> {
  return withVidrysSeo(await `/${(await args[0].params).category}`, await baseGenerateMetadata(...args));
}
