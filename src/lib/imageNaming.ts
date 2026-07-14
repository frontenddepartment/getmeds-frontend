// Shared by cancer-medicines.tsx and product-detail.tsx so the product-image
// naming-format logic (driven by siteSettings.primaryImageNamingFormat /
// fallbackImageNamingFormat) lives in exactly one place instead of being
// copy-pasted per page.

export const IMAGE_NAMING_FIELDS = ['brandName', 'genericName', 'strength', 'form'] as const;
export type ImageNamingField = typeof IMAGE_NAMING_FIELDS[number];

/**
 * Replaces {brandName}/{brandname}/{BRANDNAME} (and the same for genericName,
 * strength, form) in `pattern` with the matching value from `doc`, preserving
 * whichever case variant was used in the pattern. Any other odd casing
 * (e.g. {Brandname}) still resolves via a case-insensitive fallback pass.
 */
export function formatImageFilename(pattern: string, doc: Record<string, any>): string {
  let name = pattern;
  for (const field of IMAGE_NAMING_FIELDS) {
    const val = String(doc[field] || '').trim();
    const lowerPlaceholder = `{${field.toLowerCase()}}`;
    const upperPlaceholder = `{${field.toUpperCase()}}`;
    const mixedPlaceholder = `{${field}}`;
    name = name.split(lowerPlaceholder).join(val.toLowerCase());
    name = name.split(upperPlaceholder).join(val.toUpperCase());
    name = name.split(mixedPlaceholder).join(val);
    // Catches any other casing of the token (e.g. {Brandname}) that the three
    // exact-case passes above didn't already consume.
    name = name.replace(new RegExp(`\\{${field}\\}`, 'gi'), val);
  }
  return name;
}

/** Normalizes a filename for comparison: lowercase, strip anything that isn't a-z0-9. */
export function cleanImageName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Finds the pageAsset/Sanity image asset whose original filename matches one
 * of `formats` (each rendered against `doc`), trying formats in the given
 * order. Pass 1 requires an exact normalized match; pass 2 falls back to a
 * fuzzy startsWith match (either direction) so naming drift like a trailing
 * "-1" or missing strength suffix still resolves.
 */
export function matchProductImageAsset<T extends { originalFilename?: string }>(
  doc: Record<string, any>,
  formats: string[],
  imageAssets: T[]
): T | null {
  const targets = formats
    .map(fmt => cleanImageName(formatImageFilename(fmt, doc)))
    .filter(Boolean);

  if (targets.length === 0) return null;

  // Pass 1: exact match, trying each format in order.
  for (const target of targets) {
    const match = imageAssets.find(asset => {
      if (!asset.originalFilename) return false;
      return cleanImageName(stripExtension(asset.originalFilename)) === target;
    });
    if (match) return match;
  }

  // Pass 2: fuzzy startsWith fallback, trying each format in order.
  for (const target of targets) {
    if (target.length < 3) continue;
    const match = imageAssets.find(asset => {
      if (!asset.originalFilename) return false;
      const assetNormalized = cleanImageName(stripExtension(asset.originalFilename));
      return assetNormalized.startsWith(target) || target.startsWith(assetNormalized);
    });
    if (match) return match;
  }

  return null;
}
