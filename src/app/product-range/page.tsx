import ProductRangeClient, { type ProductLink } from "./ProductRangeClient";
import ProductRangeHub from "./ProductRangeHub";
import { getCatalogModel, productPath } from "@/lib/catalogServer";

// Same cadence as the product pages the cards link to.
export const revalidate = 3600;

/* /product-range is the hub. Footer, sitemap and search links carry ?category=, ?cat= or ?q=,
   which keep opening the searchable product list.
   Server wrapper: looks up each product's real page (e.g. /cancer-medicines/<slug>) and its
   Studio photo in the catalogue, so cards link straight to the page and show the real pack. */
export default async function ProductRangePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { q, cat, category } = await searchParams;
  const model = await getCatalogModel();
  if (!q && !cat && !category) return <ProductRangeHub model={model} />;

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
