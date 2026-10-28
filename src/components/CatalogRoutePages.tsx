// Server wrappers shared by the catalogue routes: the page's JSON-LD, the crawler-readable
// copy (scripts/prerender-slugs.cjs body markup) and the live client page behind it.
import CatalogClient from '@/components/CatalogClient';
import ProductDetailClient from '@/components/ProductDetailClient';
import PrerenderHandoff from '@/components/PrerenderHandoff';
import { JsonLdScripts, type CatalogPageSeo } from '@/lib/catalogSeo';

export function CatalogRoutePage({ seo }: { seo: CatalogPageSeo }) {
  return (
    <>
      <JsonLdScripts blocks={seo.jsonLd} />
      {/* The catalogue has its own sidebar/table skeletons, so show those while it loads
          rather than the plain crawler copy (which then jumped into a different layout). */}
      <PrerenderHandoff baked={seo.baked} mode="skeleton">
        <CatalogClient />
      </PrerenderHandoff>
    </>
  );
}

export function ProductRoutePage({ seo, categorySlug, productSlug }: { seo: CatalogPageSeo | null; categorySlug?: string; productSlug?: string }) {
  if (!seo) return <ProductDetailClient categorySlug={categorySlug} productSlug={productSlug} />;
  return (
    <>
      <JsonLdScripts blocks={seo.jsonLd} />
      <PrerenderHandoff baked={seo.baked}>
        <ProductDetailClient categorySlug={categorySlug} productSlug={productSlug} />
      </PrerenderHandoff>
    </>
  );
}
