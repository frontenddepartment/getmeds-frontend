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
