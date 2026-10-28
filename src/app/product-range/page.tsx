import ProductRangeClient, { type ProductLink } from "./ProductRangeClient";
import { getCatalogModel, productPath } from "@/lib/catalogServer";

// Same cadence as the product pages the cards link to.
export const revalidate = 3600;

/* Server wrapper: looks up each product's real page (e.g. /cancer-medicines/<slug>) and its
   Studio photo in the catalogue, so cards link straight to the page and show the real pack. */
export default async function ProductRangePage() {
  const model = await getCatalogModel();
  const productLinks: Record<string, ProductLink> = {};
  for (const p of model.products) {
    const brand = p.brandName?.trim().toLowerCase();
    if (brand && p.slug && !productLinks[brand]) {
      productLinks[brand] = { href: productPath(p), image: p.imageUrl };
    }
  }
  return <ProductRangeClient productLinks={productLinks} />;
}
