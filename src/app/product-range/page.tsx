import type { Metadata } from 'next';
import { CatalogRoutePage } from '@/components/CatalogRoutePages';
import { getCatalogModel } from '@/lib/catalogServer';
import { allProductsSeo } from '@/lib/catalogSeo';

// Renders getmeds_frontend/src/pages/cancer-medicines.tsx; head/body as prerendered for
// /product-range by scripts/prerender-slugs.cjs.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return allProductsSeo(await getCatalogModel()).metadata;
}

export default async function ProductRangePage() {
  return <CatalogRoutePage seo={allProductsSeo(await getCatalogModel())} />;
}
