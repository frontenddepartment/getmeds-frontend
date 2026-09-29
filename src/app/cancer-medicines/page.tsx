import type { Metadata } from 'next';
import { CatalogRoutePage } from '@/components/CatalogRoutePages';
import { getCatalogModel } from '@/lib/catalogServer';
import { categorySeo } from '@/lib/catalogSeo';

// "cancer-medicines" is Oncology's Category Folder: the same listing page, prerendered as
// that category by scripts/prerender-slugs.cjs.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return categorySeo(await getCatalogModel(), 'cancer-medicines').metadata;
}

export default async function CancerMedicinesPage() {
  return <CatalogRoutePage seo={categorySeo(await getCatalogModel(), 'cancer-medicines')} />;
}
