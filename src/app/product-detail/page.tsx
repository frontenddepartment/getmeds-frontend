import type { Metadata } from 'next';
import ProductDetailClient from '@/components/ProductDetailClient';
import { productDetailShellMetadata } from '@/lib/catalogSeo';

// The bare product-detail shell (product-detail.html): reached via legacy
// "/product-detail?product=<slug>" links, which the page itself forwards to the product's
// real URL. Not indexable, as in the original.
export const metadata: Metadata = productDetailShellMetadata;

export default function ProductDetailShellPage() {
  return <ProductDetailClient />;
}
