/**
 * Catalog adapter for the new-setup workflows. Uses v2's own static product list
 * (src/lib/data.ts — the same list the navbar search uses), so the RFQ / PO / partner
 * pickers show exactly the products the site already lists. No prices or stock: per
 * site policy, prescription medicines have no online price.
 */
import { products as v2Products } from "@/lib/data";

export type CatalogItem = { slug: string; brand: string; generic: string; strength: string; form: string; category: string };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const PRODUCTS: CatalogItem[] = v2Products.map((p) => ({
  slug: slugify(`${p.brand}-${p.strength}`),
  brand: p.brand,
  generic: p.generic,
  strength: p.strength,
  form: p.form,
  category: p.category,
}));

export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productLabel = (p: CatalogItem) => `${p.brand} — ${p.generic} ${p.strength} ${p.form}`;
