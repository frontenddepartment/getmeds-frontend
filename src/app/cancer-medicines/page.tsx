import type { Metadata } from 'next';
import { CatalogRoutePage } from '@/components/CatalogRoutePages';
import { getCatalogModel } from '@/lib/catalogServer';
import { categorySeo } from '@/lib/catalogSeo';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// "cancer-medicines" is Oncology's Category Folder: the same listing page, prerendered as
// that category by scripts/prerender-slugs.cjs.
export const revalidate = 3600;

async function baseGenerateMetadata(): Promise<Metadata> {
  return categorySeo(await getCatalogModel(), 'cancer-medicines').metadata;
}

export default async function CancerMedicinesPage() {
  return <CatalogRoutePage seo={categorySeo(await getCatalogModel(), 'cancer-medicines')} />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export async function generateMetadata(...args: Parameters<typeof baseGenerateMetadata>): Promise<Metadata> {
  return withVidrysSeo(await '/cancer-medicines', await baseGenerateMetadata(...args));
}
