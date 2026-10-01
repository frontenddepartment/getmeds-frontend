import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CatalogRoutePage, ProductRoutePage } from '@/components/CatalogRoutePages';
import {
  getCatalogModel,
  isListingPrefix,
  resolveCondition,
  resolveProduct,
  productPath,
  type CatalogModel,
} from '@/lib/catalogServer';
import { conditionSeo, productSeo, type CatalogPageSeo } from '@/lib/catalogSeo';
import { NOT_FOUND_METADATA } from '@/lib/notFoundMetadata';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// "/<folder>/<slug>", "/product-range/<slug>" and "/conditions/<slug>". As in vercel.json, a
// condition slug renders the listing page (cancer-medicines.tsx) filtered to that condition;
// any other slug under a folder or /product-range is a product page (product-detail.tsx).
export const revalidate = 3600;

interface Props {
  params: Promise<{ category: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type Resolved =
  | { kind: 'condition'; seo: CatalogPageSeo }
  | { kind: 'product'; seo: CatalogPageSeo | null; redirectTo?: string }
  | { kind: 'none' };

const safeDecode = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};
const normalizePath = (p: string) => safeDecode(p).replace(/\/+$/, '');

function resolve(model: CatalogModel, category: string, slug: string): Resolved {
  if (!isListingPrefix(model, category)) return { kind: 'none' };
  const condition = resolveCondition(model, slug);
  if (condition) {
    return { kind: 'condition', seo: conditionSeo(model, condition.group, condition.name, `/${category}/${slug}`) };
  }
  if (category === 'conditions') return { kind: 'none' };
  // Catalogue unavailable (Sanity unreachable): let the client page try on its own rather
  // than turning every product URL into a 404.
  if (model.products.length === 0) return { kind: 'product', seo: null };
  const product = resolveProduct(model, slug);
  if (!product) return { kind: 'none' };
  const pretty = productPath(product);
  const redirectTo = normalizePath(pretty) !== normalizePath(`/${category}/${slug}`) ? pretty : undefined;
  return { kind: 'product', seo: productSeo(model, product), redirectTo };
}

async function baseGenerateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const r = resolve(await getCatalogModel(), category, slug);
  if (r.kind === 'none') return NOT_FOUND_METADATA;
  if (!r.seo) return {};
  return r.seo.metadata;
}

export default async function CatalogSlugPage({ params, searchParams }: Props) {
  const { category, slug } = await params;
  const r = resolve(await getCatalogModel(), category, slug);
  if (r.kind === 'none') notFound();
  if (r.kind === 'condition') return <CatalogRoutePage seo={r.seo} />;
  if (r.redirectTo) {
    // Any other URL a product is reachable at (another folder, /product-range/<slug>, a
    // brand-name slug...) goes to its one real URL, as product-detail.tsx did with
    // window.location.replace(). "?product=" is dropped, other params are kept.
    const sp = await searchParams;
    const query = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (k === 'product' || v === undefined) return;
      (Array.isArray(v) ? v : [v]).forEach((val) => query.append(k, val));
    });
    const qs = query.toString();
    redirect(r.redirectTo + (qs ? `?${qs}` : ''));
  }
  return <ProductRoutePage seo={r.seo} categorySlug={category} productSlug={slug} />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export async function generateMetadata(...args: Parameters<typeof baseGenerateMetadata>): Promise<Metadata> {
  return withVidrysSeo(await (async () => { const p = await args[0].params; return `/${p.category}/${p.slug}`; })(), await baseGenerateMetadata(...args));
}
