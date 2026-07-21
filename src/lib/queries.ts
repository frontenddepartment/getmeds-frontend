import { client } from './sanity'
import { sanityQuery } from './sanityProxy'
import { computeProductKey } from './productImageKey'
import type {
  Product,
  Category,
  FAQ,
  Service,
  TeamMember,
  Testimonial,
  CountryPresence,
  CsrProgram,
  Navigation,
  SiteSettings,
  HomePage,
  AboutPage,
  CareersPage,
  ContactPage,
  CsrPage,
  GlobalPresencePage,
  MeditationsPage,
  OrderMedicinesPage,
  PapPage,
  ProductsPage,
  ServicesPage,
  UngcPage,
  PageAsset,
  News,
} from '../types/sanity'

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function cleanWordPressUrl(url: string | undefined | null): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/(cms\.)?getmeds\.ph/i, '')
    .replace(/^https?:\/\/www\.getmeds\.ph/i, '')
    .replace(/^https?:\/\/173\.231\.197\.156/i, '');
}

// ─────────────────────────────────────────────
// Site-wide
// ─────────────────────────────────────────────

export async function getSiteSettings() {
  return sanityQuery<SiteSettings>('siteSettings.global')
}

export async function getNavigation() {
  return sanityQuery<Navigation>('navigation.main')
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

interface ProductImageLink {
  productKey?: string
  image?: any
}

// The "Products Range" sheet repeats a product once per condition it's
// relevant to (each repeat carries the same Product URL Slug, with the other
// conditions listed in "Also Linked From") rather than one row per product.
// This builds a lookup from condition name -> its own condition slug/hub url
// across *all* raw rows (before rows sharing a slug are collapsed to one
// canonical product below), so a product can still link to the hub page of
// a condition it's "also linked from" even though that condition's row was
// deduped away.
function buildConditionSlugLookup(rawProducts: any[]): Map<string, { conditionSlug?: string; conditionHubUrl?: string }> {
  const lookup = new Map<string, { conditionSlug?: string; conditionHubUrl?: string }>()
  rawProducts.forEach((p) => {
    const name = (p.subCategory || '').trim()
    if (!name || lookup.has(name.toLowerCase())) return
    lookup.set(name.toLowerCase(), { conditionSlug: p.conditionSlug, conditionHubUrl: p.conditionHubUrl })
  })
  return lookup
}

function splitConditionList(value: any): string[] {
  if (!value) return []
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

async function fetchProductsFromExcel(): Promise<Product[]> {
  const result = await sanityQuery<{ json_data?: string; productImages?: ProductImageLink[] }>('product.excelJson')
  if (!result || !result.json_data) return []
  try {
    const data = JSON.parse(result.json_data)
    const firstSheetName = Object.keys(data)[0]
    if (!firstSheetName) return []
    // The sheet's used range can extend well past the last real row (trailing
    // blank rows still parse as objects with every value ''), so anything with
    // no identifying data at all is dropped before it can become a phantom product.
    const allRawRows = (data[firstSheetName] || []).filter(
      (r: any) => r && (r.brandName || r.genericName || r.name || r.slug || r['slug.current'])
    )
    const conditionSlugLookup = buildConditionSlugLookup(allRawRows)

    // Collapse rows that share the same Product URL Slug into a single
    // canonical product (first occurrence wins for display fields), merging
    // every row's condition + "Also Linked From" names into one `conditions`
    // list — this is what drives which condition hub pages the product
    // surfaces on, without duplicating the product page itself.
    const bySlug = new Map<string, any>()
    const slugOrder: string[] = []
    allRawRows.forEach((p: any) => {
      const slugKey = String(p.slug || p['slug.current'] || p._id || '').toLowerCase().trim()
      if (!slugKey) {
        // No slug to dedupe on — keep as its own row.
        slugOrder.push(`__noslug-${slugOrder.length}`)
        bySlug.set(slugOrder[slugOrder.length - 1], p)
        return
      }
      const allConditions = new Set<string>(
        [p.subCategory, ...splitConditionList(p.alsoLinkedFrom)].map((s) => (s || '').trim()).filter(Boolean)
      )
      if (!bySlug.has(slugKey)) {
        slugOrder.push(slugKey)
        bySlug.set(slugKey, { ...p, _conditions: allConditions })
      } else {
        const existing = bySlug.get(slugKey)
        allConditions.forEach((c) => existing._conditions.add(c))
      }
    })
    const rawProducts = slugOrder.map((key) => {
      const row = bySlug.get(key)
      const conditions: string[] = Array.from(row._conditions || [])
      delete row._conditions
      return { ...row, conditions }
    })

    // Images are linked explicitly per product (via the Studio's Product
    // Images tab) rather than guessed from an uploaded file's name — look
    // each one up by the same stable key the Studio computed when it was
    // attached. See productImageKey.ts.
    const imageByKey = new Map<string, any>()
    ;(result.productImages || []).forEach((link) => {
      if (link.productKey && link.image) imageByKey.set(link.productKey, link.image)
    })

    // Fetch all individual product documents (which don't have title defined) that are active/present or undefined remarks
    const originalProducts = await sanityQuery<any[]>('product.individualDocs')
    // Fetch all category documents to resolve category references
    const categories = await sanityQuery<Category[]>('category.all') || []

    console.log("DEBUG [fetchProductsFromExcel]: Excel products rows count:", rawProducts.length);
    console.log("DEBUG [fetchProductsFromExcel]: Sanity individual products count:", originalProducts.length);

    // Create a lookup map for original products by their document _id
    const originalMap = new Map<string, any>()
    originalProducts.forEach(op => {
      originalMap.set(op._id, op)
    })

    const getCategoryReference = (pCat: any) => {
      if (!pCat) return undefined
      if (typeof pCat === 'object' && pCat._id) return pCat
      if (typeof pCat !== 'string') return undefined

      const excelCat = pCat.trim()
      if (!excelCat) return undefined

      const parts = excelCat.split(/[\/,]/).map(s => s.trim().toLowerCase()).filter(Boolean)
      for (const part of parts) {
        const matched = categories.find(c => c.category.toLowerCase().trim() === part)
        if (matched) {
          return {
            _id: matched._id,
            _type: 'reference',
            category: matched.category,
            slug: matched.slug
          }
        }
      }

      for (const part of parts) {
        const matched = categories.find(c => 
          c.category.toLowerCase().includes(part) || part.includes(c.category.toLowerCase())
        )
        if (matched) {
          return {
            _id: matched._id,
            _type: 'reference',
            category: matched.category,
            slug: matched.slug
          }
        }
      }

      const cleanName = excelCat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const titleCased = excelCat.split('/')
        .map(s => toTitleCase(s.trim()))
        .join(' / ')
      return {
        _id: `temp-${cleanName}`,
        _type: 'reference',
        category: titleCased,
        slug: { _type: 'slug', current: cleanName }
      }
    }

    const allowedProducts = rawProducts.map((p: any) => {
      // Find matching original product
      const orig = originalMap.get(p._id) || {}

      // Exclude if the original document has remarks that are not active/present (e.g. previews)
      if (orig.remarks && orig.remarks !== 'present' && orig.remarks !== 'active') {
        return null
      }

      // Resolve slug
      // Note: SheetJS flattens nested "slug.current" columns into a literal "slug.current" key,
      // not a nested { slug: { current } } object, so that key must be checked explicitly.
      let slug = p.slug || p['slug.current'] || orig.slug
      if (typeof slug === 'string') {
        slug = { _type: 'slug', current: slug }
      } else if (slug && typeof slug === 'object' && slug.current) {
        // already formatted correctly
      } else if (p.name || orig.name) {
        slug = {
          _type: 'slug',
          current: String(p.name || orig.name).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
        }
      } else {
        slug = { _type: 'slug', current: 'unnamed-product' }
      }

      const merged = {
        ...orig,
        ...p,
        _id: p._id || orig._id || `excel-${slug.current}`,
        _type: 'product',
        slug,
        category: orig.category || getCategoryReference(p.category),
        excelCategory: p.category,
        image: (() => {
          const key = computeProductKey(p)
          return (key && imageByKey.get(key)) || orig.image
        })(),
        availability: p.availability === undefined ? (orig.availability ?? true) : (p.availability === true || String(p.availability).toLowerCase() === 'true'),
        // Preserve rich-text / detail fields from the Sanity doc when Excel row is empty
        description: p.description || orig.description,
        indications: p.indications || orig.indications,
        dosageAdministration: p.dosageAdministration || orig.dosageAdministration,
        mechanismOfAction: p.mechanismOfAction || orig.mechanismOfAction,
        supportingFacts: p.supportingFacts || orig.supportingFacts,
        storageCondition: p.storageCondition || orig.storageCondition,
        packaging: p.packaging || orig.packaging,
        innovator: p.innovator || orig.innovator,
        // ── "Products Range" workbook fields — read directly, no re-derivation ──
        productGroup: p.productGroup || orig.productGroup,
        categoryFolder: p.categoryFolder || orig.categoryFolder,
        conditionSlug: p.conditionSlug || orig.conditionSlug,
        conditionHubUrl: p.conditionHubUrl || orig.conditionHubUrl,
        productPageUrl: p.productPageUrl || orig.productPageUrl,
        breadcrumb: p.breadcrumb || orig.breadcrumb,
        alsoLinkedFrom: p.alsoLinkedFrom || orig.alsoLinkedFrom,
        conditions: (p.conditions && p.conditions.length ? p.conditions : undefined) || orig.conditions,
        metaTitle: p.metaTitle || orig.metaTitle,
        metaDescription: p.metaDescription || orig.metaDescription,
        status: p.status || orig.status,
        notes: p.notes || orig.notes,
      } as Product;

      // Every condition this product belongs under gets its own hub slug/url,
      // even conditions whose own sheet row got deduped away above.
      merged.conditionSlugsByName = Object.fromEntries(
        (merged.conditions || []).map((name) => [name, conditionSlugLookup.get(name.toLowerCase())])
      )

      if ((merged.brandName || '').toLowerCase().includes('abira')) {
        console.log("DEBUG [fetchProductsFromExcel]: Merged AbiraGet product fields:", {
          brandName: merged.brandName,
          indications: merged.indications,
          description: merged.description,
          dosageAdministration: merged.dosageAdministration
        });
      }

      return merged;
    }).filter(Boolean) as Product[]

    // Find manually created individual product documents (which have remarks present or active)
    const excelProductIds = new Set(rawProducts.map((p: any) => p._id))
    const individualOnlyProducts = originalProducts.filter(op => {
      if (excelProductIds.has(op._id)) return false
      return op.remarks === 'present' || op.remarks === 'active'
    }).map(op => {
      // Resolve slug
      let slug = op.slug
      if (typeof slug === 'string') {
        slug = { _type: 'slug', current: slug }
      } else if (slug && typeof slug === 'object' && slug.current) {
        // already formatted correctly
      } else if (op.name) {
        slug = {
          _type: 'slug',
          current: String(op.name).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
        }
      } else {
        slug = { _type: 'slug', current: 'unnamed-product' }
      }

      return {
        ...op,
        _type: 'product',
        slug,
        availability: op.availability === undefined ? true : (op.availability === true || String(op.availability).toLowerCase() === 'true'),
      } as Product
    })

    return [...allowedProducts, ...individualOnlyProducts]
  } catch (err) {
    console.error('Failed to parse Excel products:', err)
    return []
  }
}

export async function getProducts() {
  const products = await fetchProductsFromExcel()
  return products.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

export async function getProductBySlug(slug: string) {
  const products = await fetchProductsFromExcel()
  return products.find((p) => p.slug?.current === slug) || null
}

export async function getProductsByCategory(categoryId: string) {
  const products = await fetchProductsFromExcel()
  return products
    .filter((p) => p.category?._id === categoryId)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

export async function searchProducts(query: string) {
  const products = await fetchProductsFromExcel()
  const normalizedQuery = query.replace(/\*/g, '').toLowerCase().trim()
  if (!normalizedQuery) return products
  return products
    .filter((p) =>
      (p.name || '').toLowerCase().includes(normalizedQuery) ||
      (p.genericName || '').toLowerCase().includes(normalizedQuery) ||
      (p.brandName || '').toLowerCase().includes(normalizedQuery) ||
      (p.subCategory || '').toLowerCase().includes(normalizedQuery)
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

// A "category" for site navigation/routing purposes is now keyed on the
// Excel's Category Folder (the URL section a product lives under), not on
// the Product Range name — one Product Range can span more than one folder
// (e.g. Endocrinology → both "hormonal-therapy" and "diabetes-medicines"),
// so the folder is the real routing unit. Everything here comes straight
// from the sheet; there's no fuzzy string-matching or reclassification.
function folderDisplayName(folder: string): string {
  return folder
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function getCategories() {
  const products = await fetchProductsFromExcel()
  const catMap = new Map<string, Category>()

  products.forEach((p: any) => {
    const rawCategory = p.excelCategory || (typeof p.category === 'string' ? p.category : p.category?.category) || (p.categoryFolder ? folderDisplayName(p.categoryFolder) : '')
    const catName = (rawCategory || '').trim()
    if (!catName) return

    const key = catName.toLowerCase()
    const folder = p.categoryFolder || key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    if (!catMap.has(key)) {
      catMap.set(key, {
        _id: `cat-${key}`,
        _type: 'category',
        category: catName,
        slug: { _type: 'slug', current: folder },
        subcategory: [],
      } as Category)
    }

    const catObj = catMap.get(key)!
    const conditions = p.conditions && p.conditions.length ? p.conditions : (p.subCategory ? [p.subCategory] : [])
    conditions.forEach((sub: string) => {
      if (sub && !catObj.subcategory!.includes(sub)) catObj.subcategory!.push(sub)
    })
  })

  return Array.from(catMap.values()).sort((a, b) => (a.category || '').localeCompare(b.category || ''))
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories()
  return categories.find(c => c.slug?.current === slug) || null
}

// ─────────────────────────────────────────────
// FAQs
// ─────────────────────────────────────────────

export async function getFAQs() {
  return sanityQuery<FAQ[]>('faq.all')
}

export async function searchFAQs(query: string) {
  return sanityQuery<FAQ[]>('faq.search', { query: `*${query}*` })
}

// ─────────────────────────────────────────────
// Reusable content
// ─────────────────────────────────────────────

export async function getServices() {
  return sanityQuery<Service[]>('service.all')
}

export async function getTeamMembers() {
  return sanityQuery<TeamMember[]>('teams.all')
}

export async function getTestimonials() {
  return sanityQuery<Testimonial[]>('testimonial.all')
}

export async function getCountries() {
  return sanityQuery<CountryPresence[]>('countryPresence.all')
}

export async function getCsrPrograms() {
  return sanityQuery<CsrProgram[]>('csrProgram.all')
}

// ─────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────

export async function getHomePage() {
  return sanityQuery<HomePage>('homePage.main')
}

export async function getAboutPage() {
  return sanityQuery<AboutPage>('aboutPage.main')
}

export async function getCareersPage() {
  return sanityQuery<CareersPage>('careersPage.main')
}

export async function getContactPage() {
  return sanityQuery<ContactPage>('contactPage.main')
}

export async function getCsrPage() {
  return sanityQuery<CsrPage>('csrPage.main')
}

export async function getGlobalPresencePage() {
  return sanityQuery<GlobalPresencePage>('globalPresencePage.main')
}

export async function getMeditationsPage() {
  return sanityQuery<MeditationsPage>('meditationsPage.main')
}

export async function getOrderMedicinesPage() {
  return sanityQuery<OrderMedicinesPage>('orderMedicinesPage.main')
}

export async function getPapPage() {
  return sanityQuery<PapPage>('papPage.main')
}

export async function getProductsPage() {
  return sanityQuery<ProductsPage>('productsPage.main')
}

export async function getServicesPage() {
  return sanityQuery<ServicesPage>('servicesPage.main')
}

export async function getUngcPage() {
  return sanityQuery<UngcPage>('ungcPage.main')
}

// ─────────────────────────────────────────────
// Page Assets (Images)
// ─────────────────────────────────────────────

export async function getPageAssets() {
  return sanityQuery<PageAsset[]>('pageAsset.all')
}

export async function getPageAssetsByPage(_page?: string) {
  // Page filtering is no longer used — all assets are fetched and matched by name.
  // This function is kept for backwards compatibility with existing hook calls.
  return sanityQuery<PageAsset[]>('pageAsset.all')
}

export async function getHeroSlides() {
  return sanityQuery<PageAsset[]>('pageAsset.heroSlides')
}

export async function getGoogleSpreadsheetBySlug(slug: string) {
  return sanityQuery<{ _id: string; spreadsheetId: string; link: string } | null>('googleSpreadsheet.bySlug', { slug })
}

// ─────────────────────────────────────────────
// News & Articles
// ─────────────────────────────────────────────

export async function getNews() {
  try {
    const res = await fetch('/api/blog/posts?per_page=20');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error('Error fetching news from backend API:', err);
    return [];
  }
}

export async function getNewsPage(page: number, perPage: number = 20): Promise<{ items: News[]; totalPages: number }> {
  try {
    const res = await fetch(`/api/blog/posts?per_page=${perPage}&page=${page}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return {
      items: data.items || [],
      totalPages: data.totalPages || 1
    };
  } catch (err) {
    console.error(`Error fetching news page ${page} from backend API:`, err);
    return { items: [], totalPages: 0 };
  }
}

export async function getNewsById(id: string) {
  try {
    const res = await fetch(`/api/blog/posts/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching news item ${id} from backend API:`, err);
    return null;
  }
}

export async function getNewsBySlug(slug: string) {
  try {
    const res = await fetch(`/api/blog/posts?slug=${slug}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;
    return data.items[0];
  } catch (err) {
    console.error(`Error fetching news item by slug ${slug} from backend API:`, err);
    return null;
  }
}

export async function getCareers() {
  return sanityQuery<any[]>('career.all')
}

export async function getVerifiedEmployees() {
  return client.fetch<any[]>(`
    *[_type == "verifiedEmployees" && (remarks == "present" || !defined(remarks))] {
      _id,
      title,
      json_data,
      remarks
    }
  `)
}




