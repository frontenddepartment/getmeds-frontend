// Keep in sync with getmeds_database/studio/lib/categoryImageKey.ts — both
// must derive the exact same key for the exact same category name, since the
// Studio writes links keyed this way and this file looks them up the same
// way.

function normalizeKeyPart(value: any): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function computeCategoryKey(categoryName: string): string {
  return normalizeKeyPart(categoryName)
}

export interface MergeableCategoryLink {
  categoryKeys?: string[]
  categoryKey?: string
}

/**
 * The category keys a Category Featured entry actually covers — categoryKeys when present
 * (one entry, or several when merged into one card, e.g. "Nephrology / Renal"), falling back to
 * the legacy single categoryKey field for entries published before merging was supported.
 */
export function linkCategoryKeys(link: MergeableCategoryLink): string[] {
  if (link.categoryKeys && link.categoryKeys.length) return link.categoryKeys
  return link.categoryKey ? [link.categoryKey] : []
}
