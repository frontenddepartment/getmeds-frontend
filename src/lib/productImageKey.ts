// Keep in sync with getmeds_database/studio/lib/productImageKey.ts — both must
// derive the exact same key for the exact same product, since the Studio
// writes links keyed this way and this file looks them up the same way.
//
// Replaces the old naming-format + fuzzy-filename-matching system (see git
// history for imageNaming.ts): instead of guessing which uploaded file
// "probably" belongs to a product, a person explicitly attaches an image to
// a specific product row in the Studio, and the key below is just a stable
// handle for that link.

function normalizeKeyPart(value: any): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export interface KeyableProduct {
  brandName?: string
  genericName?: string
  name?: string
  strength?: string
}

/** Brand names (lowercased/trimmed) that appear on more than one product row. */
export function findDuplicateBrandNames(products: KeyableProduct[]): Set<string> {
  const counts = new Map<string, number>()
  products.forEach((p) => {
    const brand = (p.brandName || '').toLowerCase().trim()
    if (brand) counts.set(brand, (counts.get(brand) || 0) + 1)
  })
  const duplicates = new Set<string>()
  counts.forEach((count, brand) => {
    if (count > 1) duplicates.add(brand)
  })
  return duplicates
}

/**
 * Stable key for linking an image to a product: brandName alone, unless that
 * brand name is shared by multiple rows, in which case strength is appended
 * to disambiguate. Returns null if there isn't enough data to key on.
 */
export function computeProductKey(product: KeyableProduct, duplicateBrandNames: Set<string>): string | null {
  const base = normalizeKeyPart(product.brandName || product.genericName || product.name)
  if (!base) return null

  const brandLower = (product.brandName || '').toLowerCase().trim()
  if (brandLower && duplicateBrandNames.has(brandLower)) {
    const strength = normalizeKeyPart(product.strength)
    if (strength) return `${base}-${strength}`
  }

  return base
}
