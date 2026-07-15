import { client } from './sanity'
import { sanityQuery } from './sanityProxy'
import { computeProductKey, findDuplicateBrandNames } from './productImageKey'
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

function getCorrectParentCategory(sub: string, parentName: string): string {
  const normSub = sub.toLowerCase();
  const normParent = parentName.toLowerCase();
  
  if (normParent === 'oncology' || normParent === 'hematology') {
    const isHem = normSub.includes('aml') || 
                  normSub.includes('cml') || 
                  normSub.includes('lymphoma') || 
                  normSub.includes('leukemia') || 
                  normSub.includes('anemia') || 
                  normSub.includes('myeloma') || 
                  normSub.includes('sickle');
    if (isHem) return 'Hematology';
    return 'Oncology';
  }
  
  if (normParent === 'respiratory' || normParent === 'allergy') {
    const isAllergy = normSub.includes('allergy') || normSub.includes('rhinitis');
    if (isAllergy) return 'Allergy';
    return 'Respiratory';
  }
  
  if (normParent === 'nephrology' || normParent === 'renal') {
    const isRenal = normSub.includes('renal');
    if (isRenal) return 'Renal';
    return 'Nephrology';
  }
  
  if (normParent === 'gynecology' || normParent === 'obstetrician') {
    const isOb = normSub.includes('obstetrician') || normSub.includes('pregnancy');
    if (isOb) return 'Obstetrician';
    return 'Gynecology';
  }
  
  return parentName;
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

async function fetchProductsFromExcel(): Promise<Product[]> {
  const result = await sanityQuery<{ json_data?: string; productImages?: ProductImageLink[] }>('product.excelJson')
  if (!result || !result.json_data) return []
  try {
    const data = JSON.parse(result.json_data)
    const firstSheetName = Object.keys(data)[0]
    if (!firstSheetName) return []
    const rawProducts = data[firstSheetName] || []

    // Images are linked explicitly per product (via the Studio's Product
    // Images tab) rather than guessed from an uploaded file's name — look
    // each one up by the same stable key the Studio computed when it was
    // attached. See productImageKey.ts.
    const duplicateBrandNames = findDuplicateBrandNames(rawProducts)
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
          const key = computeProductKey(p, duplicateBrandNames)
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
      } as Product;

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

// Adds `sub` under whichever category it actually belongs to (per getCorrectParentCategory),
// creating that category's bucket if it doesn't exist yet — a subcategory that gets
// reclassified away from `declaredCategoryName` must land somewhere, not be dropped.
function addSubcategoryToBucket(
  catMap: Map<string, Category>,
  sub: string,
  declaredCategoryName: string,
  seed: Partial<Category>
) {
  const targetName = getCorrectParentCategory(sub, declaredCategoryName)
  const catKey = targetName.toUpperCase()

  if (!catMap.has(catKey)) {
    const slugStr = targetName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    catMap.set(catKey, {
      ...seed,
      _type: 'category',
      category: targetName,
      slug: { _type: 'slug', current: slugStr },
      subcategory: []
    } as Category)
  }

  const catObj = catMap.get(catKey)!
  if (!catObj.subcategory) {
    catObj.subcategory = []
  }
  if (!catObj.subcategory.includes(sub)) {
    catObj.subcategory.push(sub)
  }
}

export async function getCategories() {
  const products = await fetchProductsFromExcel()
  // Also get the base Sanity categories so we have their icons, descriptions, etc. if available
  const baseCategories = await sanityQuery<Category[]>('category.all') || []

  const catMap = new Map<string, Category>()

  // Seed the map with existing Sanity categories
  baseCategories.forEach(c => {
    if (c.category) {
      // Split base categories by '/' to match dynamic formatting
      const names = c.category.split('/').map(s => s.trim()).filter(Boolean)
      names.forEach(name => {
        const titleCasedName = toTitleCase(name)
        const catKey = titleCasedName.toUpperCase()
        if (!catMap.has(catKey)) {
          const slugStr = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          catMap.set(catKey, {
            ...c,
            _id: c._id || `temp-${slugStr}`,
            category: titleCasedName,
            slug: { _type: 'slug', current: slugStr },
            subcategory: []
          })
        }
        c.subcategory?.forEach(rawSub => {
          const sub = toTitleCase(rawSub.trim())
          addSubcategoryToBucket(catMap, sub, titleCasedName, { ...c, _id: c._id })
        })
      })
    }
  })

  // Extend with categories and subcategories from products
  products.forEach(p => {
    let catName = p.category?.category || p.excelCategory
    if (!catName) return

    // Split combined categories (e.g. "ONCOLOGY / HEMATOLOGY")
    const catNames = catName.split('/').map(s => s.trim()).filter(Boolean)

    catNames.forEach(name => {
      const titleCasedName = toTitleCase(name)
      const catKey = titleCasedName.toUpperCase()

      const subCategoryStr = p.subCategory || ''
      const subcats = subCategoryStr.split('/')
        .map(s => toTitleCase(s.trim().replace(/,$/, '')))
        .filter(Boolean)

      if (!catMap.has(catKey)) {
        const slugStr = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        catMap.set(catKey, {
          _id: p.category?._id || `temp-${slugStr}`,
          _type: 'category',
          category: titleCasedName,
          slug: { _type: 'slug', current: slugStr },
          subcategory: []
        })
      }

      subcats.forEach(sub => {
        addSubcategoryToBucket(catMap, sub, titleCasedName, {
          _id: p.category?._id || `temp-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
        })
      })
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

const WP_API_BASE = import.meta.env.VITE_WORDPRESS_API_BASE || '/wp-json/wp/v2';

export async function getNews() {
  try {
    const res = await fetch(`${WP_API_BASE}/posts?per_page=20&_embed=true&_=${Date.now()}`, { cache: 'reload' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.map((item: any) => {
      const categories = item._embedded?.['wp:term']?.[0] || [];
      const tag = categories[0]?.name || 'News';

      const featuredMedia = item._embedded?.['wp:featuredmedia']?.[0];
      const image = featuredMedia?.source_url || '';

      // Strip HTML tags from excerpt for a clean description snippet
      const rawExcerpt = item.excerpt?.rendered || '';
      const description = rawExcerpt
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#\d+;/g, '')
        .trim();

      // Read time calculation (approx 200 words per minute)
      const rawContent = item.content?.rendered || '';
      const textOnly = rawContent.replace(/<[^>]*>/g, '');
      const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.round(wordCount / 200));
      const readTime = `${minutes} min read`;

      return {
        _id: String(item.id),
        _type: 'news' as const,
        tag: tag,
        title: item.title?.rendered || '',
        slug: item.slug || '',
        date: item.date,
        description: description,
        readTime: readTime,
        image: cleanWordPressUrl(image),
        contentHtml: rawContent,
        source_link: item.link
      };
    });
  } catch (err) {
    console.error('Error fetching news from WordPress API:', err);
    return [];
  }
}

export async function getNewsPage(page: number, perPage: number = 20): Promise<{ items: News[]; totalPages: number }> {
  try {
    const res = await fetch(`${WP_API_BASE}/posts?per_page=${perPage}&page=${page}&_embed=true&_=${Date.now()}`, { cache: 'reload' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const data = await res.json();
    const items: News[] = data.map((item: any) => {
      const categories = item._embedded?.['wp:term']?.[0] || [];
      const tag = categories[0]?.name || 'News';

      const featuredMedia = item._embedded?.['wp:featuredmedia']?.[0];
      const image = featuredMedia?.source_url || '';

      const rawExcerpt = item.excerpt?.rendered || '';
      const description = rawExcerpt
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#\d+;/g, '')
        .trim();

      const rawContent = item.content?.rendered || '';
      const textOnly = rawContent.replace(/<[^>]*>/g, '');
      const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.round(wordCount / 200));
      const readTime = `${minutes} min read`;

      return {
        _id: String(item.id),
        _type: 'news' as const,
        tag: tag,
        title: item.title?.rendered || '',
        slug: item.slug || '',
        date: item.date,
        description: description,
        readTime: readTime,
        image: cleanWordPressUrl(image),
        contentHtml: rawContent,
        source_link: item.link
      };
    });
    return { items, totalPages };
  } catch (err) {
    console.error(`Error fetching news page ${page} from WordPress API:`, err);
    return { items: [], totalPages: 0 };
  }
}

export async function getNewsById(id: string) {
  try {
    const res = await fetch(`${WP_API_BASE}/posts/${id}?_embed=true&_=${Date.now()}`, { cache: 'reload' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const item = await res.json();

    const categories = item._embedded?.['wp:term']?.[0] || [];
    const tag = categories[0]?.name || 'News';

    const featuredMedia = item._embedded?.['wp:featuredmedia']?.[0];
    const image = featuredMedia?.source_url || '';

    const rawExcerpt = item.excerpt?.rendered || '';
    const description = rawExcerpt
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#\d+;/g, '')
      .trim();

    const rawContent = item.content?.rendered || '';
    const textOnly = rawContent.replace(/<[^>]*>/g, '');
    const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 200));
    const readTime = `${minutes} min read`;

    return {
      _id: String(item.id),
      _type: 'news' as const,
      tag: tag,
      title: item.title?.rendered || '',
      slug: item.slug || '',
      date: item.date,
      description: description,
      readTime: readTime,
      image: cleanWordPressUrl(image),
      contentHtml: rawContent,
      source_link: item.link
    };
  } catch (err) {
    console.error(`Error fetching news item ${id} from WordPress API:`, err);
    return null;
  }
}

export async function getNewsBySlug(slug: string) {
  try {
    const res = await fetch(`${WP_API_BASE}/posts?slug=${slug}&_embed=true&_=${Date.now()}`, { cache: 'reload' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const posts = await res.json();
    if (!posts || posts.length === 0) return null;
    const item = posts[0];

    const categories = item._embedded?.['wp:term']?.[0] || [];
    const tag = categories[0]?.name || 'News';

    const featuredMedia = item._embedded?.['wp:featuredmedia']?.[0];
    const image = featuredMedia?.source_url || '';

    const rawExcerpt = item.excerpt?.rendered || '';
    const description = rawExcerpt
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#\d+;/g, '')
      .trim();

    const rawContent = item.content?.rendered || '';
    const textOnly = rawContent.replace(/<[^>]*>/g, '');
    const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 200));
    const readTime = `${minutes} min read`;

    return {
      _id: String(item.id),
      _type: 'news' as const,
      tag: tag,
      title: item.title?.rendered || '',
      slug: item.slug || '',
      date: item.date,
      description: description,
      readTime: readTime,
      image: cleanWordPressUrl(image),
      contentHtml: rawContent,
      source_link: item.link
    };
  } catch (err) {
    console.error(`Error fetching news item by slug ${slug} from WordPress API:`, err);
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




