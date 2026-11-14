import ProductRangeClient, { type ProductLink } from "./ProductRangeClient";
import { getCatalogModel, productPath } from "@/lib/catalogServer";

// Same cadence as the product pages the cards link to.
export const revalidate = 3600;

/* NEW SETUP: /product-range opens the searchable product list directly (search + category / dosage-form
   filters + sort), as in the low-fidelity prototype. The hub (ribbons, category cards) is no longer shown
   here; ProductRangeHub.tsx is kept for reference and the ribbons now live on /cancer-medicines and /conditions.
   Footer, sitemap and search links still carry ?category=, ?cat= or ?q=.
   Server wrapper: looks up each product's real page (e.g. /cancer-medicines/<slug>) and its
   Studio photo in the catalogue, so cards link straight to the page and show the real pack. */
export default async function ProductRangePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await searchParams; // the client reads ?q= / ?cat= / ?category= itself
  const model = await getCatalogModel();

  const productLinks: Record<string, ProductLink> = {};
  // Each brand's conditions, across all its strengths, for the sidebar's subcategories
  const productConditions: Record<string, string[]> = {};
  for (const p of model.products) {
    const brand = p.brandName?.trim().toLowerCase();
    if (brand && p.slug && !productLinks[brand]) {
      productLinks[brand] = { href: productPath(p), image: p.imageUrl };
    }
    if (brand) productConditions[brand] = [...new Set([...(productConditions[brand] ?? []), ...p.conditions])];
  }
  return <ProductRangeClient productLinks={productLinks} productConditions={productConditions} />;
}
