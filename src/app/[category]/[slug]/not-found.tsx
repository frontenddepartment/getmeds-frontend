import type { Metadata } from 'next';
import SiteNotFound from '@/app/not-found';
import { NOT_FOUND_METADATA } from '@/lib/notFoundMetadata';
import ProductNotFound from './ProductNotFound';

export const metadata: Metadata = NOT_FOUND_METADATA;

// Shown when page.tsx calls notFound(): the product "not found" state for product URLs,
// the general 404 page for anything else under a two-segment URL.
export default function CatalogSlugNotFound() {
  return <ProductNotFound fallback={<SiteNotFound />} />;
}
