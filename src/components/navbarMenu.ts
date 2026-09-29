// Product Range mega-menu data for the navbar.
//
// STATIC_* below is the placeholder markup navbar.html rendered before the live catalog
// loaded (and what stays on screen if it never does). buildDynamicMenu() is a port of
// getmeds_frontend/public/components/navbar-data.js: every category / condition shown is
// derived from the live product catalog, exactly as fetchAndPopulateDropdown() did.

import { client } from '@/lib/sanity';

export type MenuItem = { href: string; label: string };
export type MenuSection = { title: string; items: MenuItem[] };

const i = (href: string, label: string): MenuItem => ({ href, label });

// ── Static placeholder markup (navbar.html) ─────────────────────────────────

export const STATIC_ONCOLOGY_SOLID: MenuItem[] = [
  i('/cancer-medicines/breast-cancer', 'Breast Cancer'),
  i('/cancer-medicines/ovarian-cancer', 'Ovarian Cancer'),
  i('/cancer-medicines/lung-cancer', 'Non-Small Cell Lung Cancer'),
  i('/cancer-medicines/prostate-cancer', 'Prostate Cancer'),
  i('/cancer-medicines/colorectal-cancer', 'Colorectal Cancer'),
  i('/cancer-medicines/pancreatic-cancer', 'Pancreatic Cancer'),
  i('/cancer-medicines/gastric-cancer', 'Gastric Cancer / Gastric Adenocarcinoma'),
  i('/cancer-medicines/head-and-neck-cancer', 'Head and Neck Cancer'),
  i('/cancer-medicines/malignant-pleural-mesothelioma', 'Malignant Pleural Mesothelioma'),
  i('/cancer-medicines/malignant-pleural-effusion', 'Malignant Pleural Effusion'),
  i('/cancer-medicines/gastrointestinal-stromal-tumors', 'Gastrointestinal Stromal Tumors'),
];

export const STATIC_ONCOLOGY_HEMATOLOGY: MenuItem[] = [
  i('/cancer-medicines/aml', 'Acute Myeloid Leukemia'),
  i('/cancer-medicines/cml', 'Chronic Myeloid Leukemia'),
  i('/cancer-medicines/acute-lymphocytic-leukemia', 'Acute Lymphocytic Leukemia'),
  i('/cancer-medicines/chronic-lymphocytic-leukemia', 'Chronic Lymphocytic Leukemia'),
  i('/cancer-medicines/lymphoma', "Hodgkin/Non-Hodgkin's Lymphoma"),
  i('/cancer-medicines/mantle-cell-lymphoma', 'Mantle Cell Lymphoma'),
  i('/cancer-medicines/chronic-myelocytic-leukemia', 'Chronic Myelocytic Leukemia'),
  i('/cancer-medicines/meningeal-leukemia', 'Meningeal Leukemia'),
  i('/cancer-medicines/acute-lymphoblastic-leukemia', 'Acute Lymphoblastic Leukemia'),
  i('/cancer-medicines/acute-promyelocytic-leukemia', 'Acute Promyelocytic Leukemia'),
  i('/cancer-medicines/sickle-cell', 'Sickle Cell Anemia'),
];

export const STATIC_ANTI_INFECTIVES: MenuItem[] = [
  i('/product-range/respiratory', 'Respiratory Infections'),
  i('/product-range/uti', 'Urinary Tract Infections'),
  i('/product-range/skin-infections', 'Skin and Soft Tissue Infections'),
  i('/product-range/bone-infections', 'Bone and Joint Infections'),
];

export const STATIC_ENDOCRINOLOGY: MenuItem[] = [
  i('/product-range/endometriosis', 'Endometriosis'),
  i('/product-range/fibrocystic', 'Fibrocystic Breast Disease'),
];

export const STATIC_ORTHOPEDIC: MenuItem[] = [
  i('/cancer-medicines/multiple-myeloma', 'Multiple Myeloma'),
  i('/product-range/osteoporosis', 'Osteoporosis'),
];

// Desktop and mobile spell a few labels differently in navbar.html; both kept verbatim.
export const STATIC_CARDIOLOGY_DESKTOP: MenuItem[] = [
  i('/product-range/arrhythmia', 'Arrhythmia management'),
  i('/product-range/hypertension', 'Hypertension/Angina'),
];
export const STATIC_CARDIOLOGY_MOBILE: MenuItem[] = [
  i('/product-range/arrhythmia', 'Arrhythmia Management'),
  i('/product-range/hypertension', 'Hypertension / Angina'),
];

export const STATIC_NEURO_ONCOLOGY: MenuItem[] = [i('/cancer-medicines/glioblastoma', 'Glioblastoma Multiforme')];
export const STATIC_RESPIRATORY: MenuItem[] = [i('/product-range/allergic-rhinitis', 'Seasonal Allergic Rhinitis')];
export const STATIC_NEPHROLOGY: MenuItem[] = [i('/product-range/kidney-disease', 'Chronic Kidney Disease')];
export const STATIC_PAIN: MenuItem[] = [i('/product-range/pain', 'Chronic Pain')];
export const STATIC_RHEUMATOLOGY: MenuItem[] = [i('/product-range/rheumatology', 'Inflammatory Disorders')];

export const STATIC_MOBILE_SECTIONS: MenuSection[] = [
  { title: 'Oncology (Solid Tumors)', items: STATIC_ONCOLOGY_SOLID },
  { title: 'Oncology / Hematology', items: STATIC_ONCOLOGY_HEMATOLOGY },
  { title: 'Anti-Infectives', items: STATIC_ANTI_INFECTIVES },
  { title: 'Endocrinology', items: STATIC_ENDOCRINOLOGY },
  { title: 'Orthopedic', items: STATIC_ORTHOPEDIC },
  { title: 'Cardiology', items: STATIC_CARDIOLOGY_MOBILE },
  { title: 'Neuro-Oncology', items: STATIC_NEURO_ONCOLOGY },
  { title: 'Respiratory - Allergy', items: STATIC_RESPIRATORY },
  { title: 'Nephrology - Renal', items: STATIC_NEPHROLOGY },
  { title: 'Pain Management', items: STATIC_PAIN },
  { title: 'Rheumatology', items: STATIC_RHEUMATOLOGY },
];

// ── navbar-data.js port ─────────────────────────────────────────────────────

type CatalogRow = {
  category?: string;
  categoryFolder?: string;
  subCategory?: string;
  alsoLinkedFrom?: string;
  conditionHubUrl?: string;
  [key: string]: unknown;
};

type CategoryImageLink = { categoryKey?: string; categoryKeys?: string[]; order?: number };

function toPath(url: string): string {
  return '/' + String(url).replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '');
}

function folderDisplayName(folder: string | undefined): string {
  return String(folder || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function splitConditionList(value: unknown): string[] {
  if (!value) return [];
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

type DerivedCategory = { category: string; slug: string; subcategory: string[] };

function deriveCategories(rows: CatalogRow[]): DerivedCategory[] {
  const catMap = new Map<string, DerivedCategory>();
  rows.forEach((row) => {
    const rawCategory = row.category || (row.categoryFolder ? folderDisplayName(row.categoryFolder) : '');
    const catName = String(rawCategory || '').trim();
    if (!catName) return;

    const key = catName.toLowerCase();
    const slug = key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!catMap.has(key)) {
      catMap.set(key, { category: catName, slug, subcategory: [] });
    }

    const catObj = catMap.get(key)!;
    const conditions = row.subCategory ? [row.subCategory, ...splitConditionList(row.alsoLinkedFrom)] : [];
    conditions.forEach((sub) => {
      if (sub && !catObj.subcategory.includes(sub)) catObj.subcategory.push(sub);
    });
  });
  return Array.from(catMap.values()).sort((a, b) => a.category.localeCompare(b.category));
}

function normalizeKeyPart(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function linkCategoryKeys(link: CategoryImageLink): string[] {
  if (link.categoryKeys && link.categoryKeys.length) return link.categoryKeys;
  return link.categoryKey ? [link.categoryKey] : [];
}

function getFeaturedOrder(categoryName: string, categoryImages: CategoryImageLink[]): number | undefined {
  if (!categoryImages || categoryImages.length === 0) return undefined;
  const parts = String(categoryName)
    .split(/[/,]/)
    .map((s) => normalizeKeyPart(s.trim()))
    .filter(Boolean);
  if (parts.length === 0) return undefined;
  for (const link of categoryImages) {
    const keys = linkCategoryKeys(link);
    if (parts.every((p) => keys.includes(p))) return link.order;
  }
  return undefined;
}

function sortByFeaturedOrder(categories: DerivedCategory[], categoryImages: CategoryImageLink[]): DerivedCategory[] {
  return categories
    .map((cat, index) => ({ cat, index, order: getFeaturedOrder(cat.category, categoryImages) }))
    .sort((a, b) => {
      const ao = a.order === undefined ? Number.MAX_SAFE_INTEGER : a.order;
      const bo = b.order === undefined ? Number.MAX_SAFE_INTEGER : b.order;
      return ao !== bo ? ao - bo : a.index - b.index;
    })
    .map((entry) => entry.cat);
}

const SUBCATEGORY_SPECIALS: Record<string, string> = {
  'non-small-cell-lung-cancer': 'lung-cancer',
  'acute-myeloid-leukemia': 'aml',
  'chronic-myeloid-leukemia': 'cml',
  'hodgkin-non-hodgkins-lymphoma': 'lymphoma',
  'hodgkin-non-hodgkin-s-lymphoma': 'lymphoma',
  'sickle-cell-anemia': 'sickle-cell',
  'respiratory-infections': 'respiratory',
  'urinary-tract-infections': 'uti',
  'skin-and-soft-tissue-infections': 'skin-infections',
  'bone-and-joint-infections': 'bone-infections',
  'fibrocystic-breast-disease': 'fibrocystic',
  'arrhythmia-management': 'arrhythmia',
  'hypertension-angina': 'hypertension',
  'hypertension-and-angina': 'hypertension',
  'seasonal-allergic-rhinitis': 'allergic-rhinitis',
  'chronic-kidney-disease': 'kidney-disease',
  'chronic-pain': 'pain',
  'inflammatory-disorders': 'rheumatology',
  'inflammatory-and-rheumatic-disorders': 'rheumatology',
};

function getSubcategorySlug(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return SUBCATEGORY_SPECIALS[slug] || slug;
}

const CATEGORY_CONFIG: Record<string, { col: number; title: string }> = {
  oncology: { col: 0, title: 'Oncology' },
  hematology: { col: 1, title: 'Hematology' },
  'anti-infectives': { col: 1, title: 'Anti-Infectives' },
  endocrinology: { col: 2, title: 'Endocrinology' },
  orthopedic: { col: 2, title: 'Orthopedic' },
  cardiology: { col: 2, title: 'Cardiology' },
  'neuro-oncology': { col: 3, title: 'Neuro-Oncology' },
  respiratory: { col: 3, title: 'Respiratory / Allergy' },
  allergy: { col: 3, title: 'Respiratory / Allergy' },
  renal: { col: 3, title: 'Nephrology / Renal' },
  nephrology: { col: 3, title: 'Nephrology / Renal' },
  'pain-management': { col: 3, title: 'Pain Management' },
  rheumatology: { col: 3, title: 'Rheumatology' },
  gynecology: { col: 2, title: 'Gynecology' },
  obstetrician: { col: 2, title: 'Obstetrician' },
  radiology: { col: 1, title: 'Radiology' },
};

const CANCER_SLUGS = new Set([
  'oncology', 'breast-cancer', 'ovarian-cancer', 'non-small-cell-lung-cancer', 'lung-cancer',
  'prostate-cancer', 'gastric-cancer-gastric-adenocarcinoma', 'gastric-cancer', 'pancreatic-cancer', 'colorectal-cancer',
  'hodgkin-non-hodgkins-lymphoma', 'hodgkin-non-hodgkin-s-lymphoma', 'lymphoma',
  'acute-lymphoblastic-leukemia', 'malignant-pleural-mesothelioma', 'head-and-neck-cancer',
  'chronic-myeloid-leukemia', 'cml', 'sickle-cell-anemia', 'sickle-cell',
  'malignant-pleural-effusion', 'gastrointestinal-stromal-tumors',
  'acute-myeloid-leukemia', 'aml', 'acute-lymphocytic-leukemia', 'chronic-myelocytic-leukemia',
  'meningeal-leukemia', 'acute-promyelocytic-leukemia', 'chronic-lymphocytic-leukemia',
  'mantle-cell-lymphoma', 'multiple-myeloma', 'neuro-oncology', 'glioblastoma-multiforme', 'glioblastoma',
]);

const categoryPrefix = (slug: string) => (CANCER_SLUGS.has(slug) ? '/cancer-medicines/' : '/product-range/');

export type DynamicMenu = {
  /** Resolves a condition name to its real conditionHubUrl path (navbar.html click interceptor). */
  resolve: (name: string) => string | undefined;
  /** Four desktop columns of sections; null when the catalog had no categories to render. */
  desktopColumns: MenuSection[][] | null;
  /** Mobile accordion sections, in insertion order. */
  mobileSections: MenuSection[] | null;
};

const CATALOG_QUERY =
  '*[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)] | order(_updatedAt desc)[0]{ json_data, categoryImages }';

let menuPromise: Promise<DynamicMenu | null> | null = null;

/** fetchAndPopulateDropdown() — cached for the lifetime of the page. */
export function loadDynamicMenu(): Promise<DynamicMenu | null> {
  if (!menuPromise) {
    menuPromise = client
      .fetch<{ json_data?: string; categoryImages?: CategoryImageLink[] } | null>(CATALOG_QUERY)
      .then((result) => buildDynamicMenu(result))
      .catch((err) => {
        console.warn('[Getmeds] Failed to populate dropdown with dynamic categories:', err);
        menuPromise = null;
        return null;
      });
  }
  return menuPromise;
}

function buildDynamicMenu(result: { json_data?: string; categoryImages?: CategoryImageLink[] } | null): DynamicMenu | null {
  let rows: CatalogRow[] = [];
  try {
    const jsonData = result?.json_data;
    if (jsonData) {
      const parsed = JSON.parse(jsonData) as Record<string, CatalogRow[]>;
      const firstSheet = Object.keys(parsed)[0];
      rows = firstSheet ? parsed[firstSheet] || [] : [];
    }
  } catch (err) {
    console.warn('[Getmeds] Failed to parse product catalog:', err);
  }
  if (rows.length === 0) return null;

  const categoryImages = result?.categoryImages || [];

  const conditionHubPaths = new Map<string, string>();
  rows.forEach((row) => {
    if (row.subCategory && row.conditionHubUrl) {
      const key = String(row.subCategory).trim().toLowerCase();
      if (!conditionHubPaths.has(key)) conditionHubPaths.set(key, toPath(row.conditionHubUrl));
    }
  });

  const conditionHubPathsBySlug = new Map<string, string>();
  rows.forEach((row) => {
    if (row.subCategory && row.conditionHubUrl) {
      const slug = getSubcategorySlug(String(row.subCategory).trim());
      if (!conditionHubPathsBySlug.has(slug)) conditionHubPathsBySlug.set(slug, toPath(row.conditionHubUrl));
    }
  });

  const resolveHubPath = (name: string, slug: string): string | undefined => {
    const hit = conditionHubPathsBySlug.get(slug) ?? conditionHubPaths.get(name.toLowerCase());
    if (!hit) {
      console.warn(`[Getmeds] No conditionHubUrl found in Sanity for "${name}" (slug: ${slug}) — falling back to a guessed URL.`);
    }
    return hit;
  };

  const resolve = (name: string) => resolveHubPath(name, getSubcategorySlug(name));

  const categories = sortByFeaturedOrder(deriveCategories(rows), categoryImages);
  if (categories.length === 0) return { resolve, desktopColumns: null, mobileSections: null };

  const validCats = categories.filter((cat) => cat.subcategory && Array.isArray(cat.subcategory) && cat.subcategory.length > 0);

  const jaccardSimilarity = (arr1: string[], arr2: string[]) => {
    const setA = new Set(arr1.map((x) => x.trim().toLowerCase()));
    const setB = new Set(arr2.map((x) => x.trim().toLowerCase()));
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  };

  const visited = new Set<number>();
  const groups: DerivedCategory[][] = [];

  for (let a = 0; a < validCats.length; a++) {
    if (visited.has(a)) continue;
    const component: DerivedCategory[] = [];
    const queue = [a];
    visited.add(a);
    while (queue.length > 0) {
      const currIdx = queue.shift()!;
      const currCat = validCats[currIdx];
      component.push(currCat);
      for (let j = 0; j < validCats.length; j++) {
        if (visited.has(j)) continue;
        const sim = jaccardSimilarity(currCat.subcategory, validCats[j].subcategory);
        if (sim >= 0.5) {
          visited.add(j);
          queue.push(j);
        }
      }
    }
    groups.push(component);
  }

  type Processed = { category: string; slugs: string[]; slug: string; subcategory: string[] };
  const processedCategories: Processed[] = [];
  groups.forEach((groupCats) => {
    if (groupCats.length === 1) {
      processedCategories.push({
        category: groupCats[0].category,
        slugs: [groupCats[0].slug],
        slug: groupCats[0].slug,
        subcategory: groupCats[0].subcategory,
      });
    } else {
      const sortedCats = [...groupCats].sort((x, y) => x.category.localeCompare(y.category));
      const combinedName = sortedCats.map((c) => c.category).join(' / ');

      const subMaps = sortedCats.map((cat) => {
        const map = new Map<string, string>();
        cat.subcategory.forEach((sub) => map.set(sub.trim().toLowerCase(), sub));
        return map;
      });

      const firstMap = subMaps[0];
      const sharedKeys: string[] = [];
      for (const key of firstMap.keys()) {
        let inAll = true;
        for (let k = 1; k < subMaps.length; k++) {
          if (!subMaps[k].has(key)) {
            inAll = false;
            break;
          }
        }
        if (inAll) sharedKeys.push(key);
      }

      const sharedSubcategories = sharedKeys.map((key) => firstMap.get(key)!);

      if (sharedSubcategories.length > 0) {
        processedCategories.push({
          category: combinedName,
          slugs: sortedCats.map((c) => c.slug),
          slug: sortedCats[0].slug,
          subcategory: sharedSubcategories,
        });
      }

      sortedCats.forEach((cat) => {
        const uniqueSubs = cat.subcategory.filter((sub) => !sharedKeys.includes(sub.trim().toLowerCase()));
        if (uniqueSubs.length > 0) {
          processedCategories.push({ category: cat.category, slugs: [cat.slug], slug: cat.slug, subcategory: uniqueSubs });
        }
      });
    }
  });

  const sections: Record<string, { title: string; col: number; subcategories: string[] }> = {};
  processedCategories.forEach((cat) => {
    let minCol = 3;
    let confTitle: string | null = null;
    for (const s of cat.slugs) {
      if (CATEGORY_CONFIG[s]) {
        if (CATEGORY_CONFIG[s].col < minCol) minCol = CATEGORY_CONFIG[s].col;
        if (!confTitle) confTitle = CATEGORY_CONFIG[s].title;
      }
    }
    const title = cat.slugs.length > 1 ? cat.category : confTitle || cat.category;
    if (!sections[title]) sections[title] = { title, col: minCol, subcategories: [] };
    cat.subcategory.forEach((sub) => {
      if (sub && !sections[title].subcategories.includes(sub)) sections[title].subcategories.push(sub);
    });
  });

  const toItem = (sub: string): MenuItem => {
    const subSlug = getSubcategorySlug(sub);
    const href = resolveHubPath(sub, subSlug) || `${categoryPrefix(subSlug)}${subSlug}`;
    return { href, label: sub };
  };

  const desktopColumns: MenuSection[][] = [[], [], [], []];
  const mobileSections: MenuSection[] = [];
  Object.values(sections).forEach((sec) => {
    if (sec.subcategories.length > 0) {
      const section = { title: sec.title, items: sec.subcategories.map(toItem) };
      desktopColumns[sec.col].push(section);
      mobileSections.push(section);
    }
  });

  return { resolve, desktopColumns, mobileSections };
}
