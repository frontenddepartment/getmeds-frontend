import type { Metadata } from 'next';
import { CatalogRoutePage } from '@/components/CatalogRoutePages';
import { getCatalogModel } from '@/lib/catalogServer';
import { allProductsSeo } from '@/lib/catalogSeo';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// Renders getmeds_frontend/src/pages/cancer-medicines.tsx; head/body as prerendered for
// /product-range by scripts/prerender-slugs.cjs.
export const revalidate = 3600;

async function baseGenerateMetadata(): Promise<Metadata> {
  return allProductsSeo(await getCatalogModel()).metadata;
}

export default async function ProductRangePage() {
  return <CatalogRoutePage seo={allProductsSeo(await getCatalogModel())} />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export async function generateMetadata(...args: Parameters<typeof baseGenerateMetadata>): Promise<Metadata> {
  return withVidrysSeo(await '/product-range', await baseGenerateMetadata(...args));
}
