// Server-only catalogue model for the Product Range / category / condition / product
// routes. Replaces what the old site did at deploy time in scripts/prerender-slugs.cjs
// (per-URL title/description/canonical/OG/JSON-LD plus crawler-readable body markup)
// and the vercel.json rewrites that decided whether "/<folder>/<slug>" is a condition
// listing (cancer-medicines.tsx) or a product page (product-detail.tsx).
//
// Built from the same getProducts()/getCategories() the pages use in the browser, so a
// URL the server accepts is one the client can actually render. Do not import this from
// a client component.
import { unstable_cache } from 'next/cache';
import { getProducts, getCategories, folderDisplayName } from './queries';

export const DOMAIN = 'https://getmeds.ph';
export const REVALIDATE_SECONDS = 3600;

// Category folders routed onto the listing / product pages in getmeds_frontend/vercel.json.
export const STATIC_CATEGORY_FOLDERS = [
  'cancer-medicines',
  'blood-disorder-medicines',
  'anemia-medicines',
  'antibiotics',
  'hormonal-therapy',
  'diabetes-medicines',
  'bone-health-medicines',
  'heart-medicines',
  'contrast-media',
  'anti-inflammatory-medicines',
  'pain-management',
  'kidney-medicines',
  'allergy-medicines',
  'brain-cancer-medicines',
];

// The ":subcategory(...)" list from vercel.json — "/<folder>/<one of these>" is a
// condition listing, anything else under a folder is a product page.
export const STATIC_CONDITION_SLUGS = [
  'breast-cancer', 'ovarian-cancer', 'non-small-cell-lung-cancer', 'prostate-cancer', 'colorectal-cancer',
  'pancreatic-cancer', 'gastric-cancer-gastric-adenocarcinoma', 'head-and-neck-cancer',
  'malignant-pleural-mesothelioma', 'malignant-pleural-effusion', 'renal-cell-carcinoma', 'bladder-cancer',
  'cervical-cancer', 'hepatocellular-carcinoma', 'small-cell-lung-cancer', 'thyroid-cancer', 'testicular-cancer',
  'soft-tissue-sarcoma', 'acute-myeloid-leukemia', 'chronic-myeloid-leukemia', 'acute-lymphocytic-leukemia',
  'chronic-lymphocytic-leukemia', 'hodgkin-non-hodgkins-lymphoma', 'mantle-cell-lymphoma',
  'chronic-myelocytic-leukemia', 'meningeal-leukemia', 'acute-lymphoblastic-leukemia',
  'acute-promyelocytic-leukemia', 'sickle-cell-anemia', 'folate-deficiency-anemia', 'iron-deficiency-anemia',
  'respiratory-infections', 'urinary-tract-infections', 'skin-and-soft-tissue-infections',
  'bone-and-joint-infections', 'gynecological-infections', 'intra-abdominal-infections', 'bloodstream-infections',
  'ocular-or-topical-infections', 'endometriosis', 'fibrocystic-breast-disease', 'benign-prostatic-hyperplasia',
  'type-2-diabetes-mellitus', 'multiple-myeloma', 'glucocorticoid-induced-osteoporosis', 'arrhythmia-management',
  'hypertension-angina', 'radiology', 'inflammatory-and-rheumatic-disorders', 'chronic-pain-management',
  'chronic-kidney-disease', 'seasonal-allergies-allergic-rhinitis', 'glioblastoma-multiforme',
];

// Listing routes that are not a category folder: "/product-range" (all products) and the
// "/conditions/<slug>" condition-hub namespace.
export const GENERIC_LISTING_PREFIXES = ['product-range', 'conditions'];

export const ALL_PRODUCTS_DESCRIPTION =
  "Browse Getmeds' full range of specialty pharmaceutical products across oncology, hematology, cardiology, and other therapeutic areas in the Philippines.";

export interface CatalogProduct {
  id: string;
  slug: string;
  brandName?: string;
  genericName?: string;
  name?: string;
  displayName: string;
  productPageUrl?: string;
  categoryFolder?: string;
  category?: string;
  subCategory?: string;
  conditionSlug?: string;
  conditions: string[];
  conditionSlugsByName: Record<string, { conditionSlug?: string; conditionHubUrl?: string } | undefined>;
  breadcrumb?: string;
  metaTitle?: string;
  metaDescription?: string;
  manufacturer?: string;
  strength?: string;
  form?: string;
  indications?: string;
  dosageAdministration?: string;
  // Condition metadata, repeated on every row filed under a condition.
  conditionHubUrl?: string;
  conditionFilipinoName?: string;
  conditionSpecialty?: string;
  conditionLastReviewed?: string;
  conditionReviewedBy?: string;
}

export interface CatalogCategory {
  category: string;
  slug: string;
  folders: string[];
  subcategory: string[];
}

export interface CatalogModel {
  products: CatalogProduct[];
  categories: CatalogCategory[];
}

const str = (v: unknown): string | undefined => {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'string' && typeof v !== 'number') return undefined;
  const s = String(v).trim();
  return s || undefined;
};

export function stripDomain(url: string | undefined | null): string {
  if (!url) return '';
  return '/' + String(url).replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '');
}

export function slugify(value: string): string {
  return String(value || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function productDisplayName(p: { brandName?: string; genericName?: string; name?: string }): string {
  if (p.brandName && p.genericName && p.brandName !== p.genericName) return `${p.brandName} (${p.genericName})`;
  return p.name || p.brandName || p.genericName || 'Product';
}

export function productPath(p: CatalogProduct): string {
  return p.productPageUrl ? stripDomain(p.productPageUrl) : `/${p.categoryFolder || 'product-range'}/${p.slug}`;
}

async function buildModel(): Promise<CatalogModel> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return {
    products: (products || []).map((p: any): CatalogProduct => ({
      id: String(p._id || ''),
      slug: String(p.slug?.current || ''),
      brandName: str(p.brandName),
      genericName: str(p.genericName),
      name: str(p.name),
      displayName: productDisplayName({ brandName: str(p.brandName), genericName: str(p.genericName), name: str(p.name) }),
      productPageUrl: str(p.productPageUrl),
      categoryFolder: str(p.categoryFolder),
      category: str(p.excelCategory) || str(typeof p.category === 'string' ? p.category : p.category?.category),
      subCategory: str(p.subCategory),
      conditionSlug: str(p.conditionSlug),
      conditions: Array.isArray(p.conditions) && p.conditions.length ? p.conditions.map(String) : (str(p.subCategory) ? [String(p.subCategory).trim()] : []),
      conditionSlugsByName: p.conditionSlugsByName || {},
      breadcrumb: str(p.breadcrumb),
      metaTitle: str(p.metaTitle),
      metaDescription: str(p.metaDescription),
      manufacturer: str(p.manufacturer),
      strength: str(p.strength),
      form: str(p.form),
      indications: str(p.indications),
      dosageAdministration: str(p.dosageAdministration),
      conditionHubUrl: str(p.conditionHubUrl),
      conditionFilipinoName: str(p.conditionFilipinoName),
      conditionSpecialty: str(p.conditionSpecialty),
      conditionLastReviewed: str(p.conditionLastReviewed),
      conditionReviewedBy: str(p.conditionReviewedBy),
    })),
    categories: (categories || [])
      .filter((c: any) => c.category && c.slug?.current)
      .map((c: any): CatalogCategory => ({
        category: String(c.category),
        slug: String(c.slug.current),
        folders: c.folders && c.folders.length ? c.folders.map(String) : [String(c.slug.current)],
        subcategory: (c.subcategory || []).filter(Boolean).map(String),
      })),
  };
}

const getCachedModel = unstable_cache(buildModel, ['getmeds-catalog-model-v1'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['catalog'],
});

/** The catalogue, or an empty one if Sanity can't be reached (never throws). */
export async function getCatalogModel(): Promise<CatalogModel> {
  try {
    return await getCachedModel();
  } catch (err) {
    console.error('[catalogServer] Failed to load catalogue:', err);
    return { products: [], categories: [] };
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Every first path segment that renders the catalogue or a product under it. */
export function isListingPrefix(model: CatalogModel, segment: string): boolean {
  const s = safeDecode(segment).trim().toLowerCase();
  if (GENERIC_LISTING_PREFIXES.includes(s) || STATIC_CATEGORY_FOLDERS.includes(s)) return true;
  return model.categories.some((c) => c.folders.some((f) => f.toLowerCase() === s))
    || model.products.some((p) => (p.categoryFolder || '').toLowerCase() === s);
}

export interface ConditionGroup {
  slug: string;
  name: string;
  hubPath: string;
  category?: string;
  folder?: string;
  productNames: string[];
  filipinoName?: string;
  specialty?: string;
  lastReviewed?: string;
  reviewedBy?: string;
}

/** Conditions grouped by condition slug — mirrors the grouping in scripts/prerender-slugs.cjs. */
export function conditionGroups(model: CatalogModel): Map<string, ConditionGroup> {
  const groups = new Map<string, ConditionGroup>();
  const ensure = (slug: string, name: string, hubUrl: string | undefined, p: CatalogProduct) => {
    if (!groups.has(slug)) {
      groups.set(slug, {
        slug,
        name,
        hubPath: hubUrl ? stripDomain(hubUrl) : `/conditions/${slug}`,
        category: p.category,
        folder: p.categoryFolder,
        productNames: [],
      });
    }
    const g = groups.get(slug)!;
    if (!g.productNames.includes(p.displayName)) g.productNames.push(p.displayName);
    if (!g.category && p.category) g.category = p.category;
    if (!g.folder && p.categoryFolder) g.folder = p.categoryFolder;
    return g;
  };
  model.products.forEach((p) => {
    if (p.conditionSlug && p.subCategory) {
      const g = ensure(p.conditionSlug, p.subCategory, p.conditionHubUrl, p);
      if (!g.filipinoName && p.conditionFilipinoName) g.filipinoName = p.conditionFilipinoName;
      if (!g.specialty && p.conditionSpecialty) g.specialty = p.conditionSpecialty;
      if (!g.lastReviewed && p.conditionLastReviewed) g.lastReviewed = p.conditionLastReviewed;
      if (!g.reviewedBy && p.conditionReviewedBy) g.reviewedBy = p.conditionReviewedBy;
    }
    Object.entries(p.conditionSlugsByName || {}).forEach(([name, info]) => {
      if (!info?.conditionSlug) return;
      ensure(String(info.conditionSlug).trim(), name, info.conditionHubUrl, p);
    });
  });
  return groups;
}

export interface ResolvedCondition {
  name: string;
  category?: string;
  group?: ConditionGroup;
}

/**
 * A condition for "/<prefix>/<slug>": the vercel.json subcategory list, any condition slug
 * in the sheet, or a slugified condition name (resolveConditionName() in the listing page).
 */
export function resolveCondition(model: CatalogModel, slugParam: string): ResolvedCondition | null {
  const target = safeDecode(slugParam).trim().toLowerCase();
  const groups = conditionGroups(model);
  const group = groups.get(target) || [...groups.values()].find((g) => g.slug.toLowerCase() === target);
  if (group) return { name: group.name, category: group.category, group };
  for (const cat of model.categories) {
    const sub = cat.subcategory.find((s) => s.toLowerCase() === target || slugify(s) === target);
    if (sub) {
      const g = [...groups.values()].find((x) => x.name.toLowerCase() === sub.toLowerCase());
      return { name: sub, category: cat.category, group: g };
    }
  }
  if (STATIC_CONDITION_SLUGS.includes(target)) return { name: target };
  return null;
}

/** Same lookup product-detail.tsx does in the browser (slug, brand name, or page URL slug). */
export function resolveProduct(model: CatalogModel, slugParam: string): CatalogProduct | null {
  const targetSlug = slugParam.toLowerCase();
  const decodedTarget = safeDecode(slugParam).toLowerCase();
  return model.products.find((p) => {
    const pSlug = p.slug.toLowerCase();
    const bName = p.brandName?.toLowerCase();
    if (pSlug === targetSlug || pSlug === decodedTarget) return true;
    if (bName === targetSlug || bName === decodedTarget) return true;
    if (p.productPageUrl) {
      const stripped = p.productPageUrl.replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '').toLowerCase();
      const pageSlug = stripped.split('/').filter(Boolean).pop();
      if (pageSlug === targetSlug || pageSlug === decodedTarget) return true;
    }
    return false;
  }) || null;
}

/** A category keyed by one of its folders (or its name), as the listing page resolves it. */
export function resolveCategoryByFolder(model: CatalogModel, folderParam: string): CatalogCategory | null {
  const seg = safeDecode(folderParam).trim().toLowerCase();
  return model.categories.find((c) =>
    c.folders.map((f) => f.toLowerCase()).includes(seg) || slugify(c.category) === seg || c.category.toLowerCase() === seg
  ) || null;
}

/**
 * Whether a WordPress post has this slug: what the backend's /api/resolve-slug/:slug checked
 * for single-segment URLs that aren't a page of this site. Cached like the catalogue.
 */
export async function wordpressPostExists(slug: string): Promise<boolean> {
  if (!slug || slug.includes('/')) return false;
  const root = (process.env.NEXT_PUBLIC_WORDPRESS_API_ROOT || process.env.VITE_WORDPRESS_API_ROOT || 'https://cms.getmeds.ph').replace(/\/$/, '');
  try {
    const res = await fetch(`${root}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=id,slug`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return false;
    const posts = await res.json();
    return Array.isArray(posts) && posts.length > 0;
  } catch {
    return false;
  }
}

export { folderDisplayName };
