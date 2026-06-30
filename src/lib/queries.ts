import { client } from './sanity'
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

// ─────────────────────────────────────────────
// Site-wide
// ─────────────────────────────────────────────

export async function getSiteSettings() {
  return client.fetch<SiteSettings>(`
    *[_type == "siteSettings" && _id == "global-site-settings"][0] {
      ...,
      mainNavigation->
    }
  `)
}

export async function getNavigation() {
  return client.fetch<Navigation>(`
    *[_type == "navigation" && _id == "main-navigation"][0]
  `)
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

async function fetchProductsFromExcel(): Promise<Product[]> {
  const result = await client.fetch<{ json_data?: string }>(`
    *[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)][0] {
      json_data
    }
  `)
  if (!result || !result.json_data) return []
  try {
    const data = JSON.parse(result.json_data)
    const firstSheetName = Object.keys(data)[0]
    if (!firstSheetName) return []
    const rawProducts = data[firstSheetName] || []
    
    // Fetch all individual product documents (which don't have title defined) that are active/present or undefined remarks
    const originalProducts = await client.fetch<any[]>(`
      *[_type == "product" && !defined(title) && (!defined(remarks) || remarks == "present" || remarks == "active")] {
        _id,
        slug,
        image,
        category-> { _id, category, slug },
        subCategory,
        availability,
        genericName,
        brandName,
        name,
        remarks,
        description,
        packaging,
        innovator,
        strength,
        form,
        indications,
        dosageAdministration,
        storageCondition,
        accreditations
      }
    `)

    // Create a lookup map for original products by their document _id
    const originalMap = new Map<string, any>()
    originalProducts.forEach(op => {
      originalMap.set(op._id, op)
    })

    const allowedProducts = rawProducts.map((p: any) => {
      // Find matching original product
      const orig = originalMap.get(p._id) || {}

      // Exclude if the original document has remarks that are not active/present (e.g. previews)
      if (orig.remarks && orig.remarks !== 'present' && orig.remarks !== 'active') {
        return null
      }

      // Resolve slug
      let slug = p.slug || orig.slug
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

      return {
        ...orig,
        ...p,
        _id: p._id || orig._id || `excel-${slug.current}`,
        _type: 'product',
        slug,
        category: orig.category || p.category,
        image: orig.image || p.image,
        availability: p.availability === undefined ? (orig.availability ?? true) : (p.availability === true || String(p.availability).toLowerCase() === 'true'),
      } as Product
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

export async function getCategories() {
  return client.fetch<Category[]>(`
    *[_type == "category"] | order(category asc) {
      _id,
      category,
      slug,
      subtitle,
      description,
      icon,
      image,
      subcategory,
      categoryId,
    }
  `)
}

export async function getCategoryBySlug(slug: string) {
  return client.fetch<Category>(`
    *[_type == "category" && slug.current == $slug][0]
  `, { slug })
}

// ─────────────────────────────────────────────
// FAQs
// ─────────────────────────────────────────────

export async function getFAQs() {
  return client.fetch<FAQ[]>(`
    *[_type == "faq"] | order(_createdAt asc)
  `)
}

export async function searchFAQs(query: string) {
  return client.fetch<FAQ[]>(`
    *[_type == "faq" && (
      question match $query ||
      answer match $query ||
      $query in keywords
    )]
  `, { query: `*${query}*` })
}

// ─────────────────────────────────────────────
// Reusable content
// ─────────────────────────────────────────────

export async function getServices() {
  return client.fetch<Service[]>(`
    *[_type == "service"] | order(_createdAt asc)
  `)
}

export async function getTeamMembers() {
  return client.fetch<TeamMember[]>(`
    *[_type == "teamMember"] {
      _id,
      name,
      role,
      image,
      ribbonLabel,
      bio,
      socialLinks,
    }
  `)
}

export async function getTestimonials() {
  return client.fetch<Testimonial[]>(`
    *[_type == "testimonial"] | order(rating desc)
  `)
}

export async function getCountries() {
  return client.fetch<CountryPresence[]>(`
    *[_type == "countryPresence"] | order(name asc)
  `)
}

export async function getCsrPrograms() {
  return client.fetch<CsrProgram[]>(`
    *[_type == "csrProgram"] | order(_createdAt asc)
  `)
}

// ─────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────

export async function getHomePage() {
  return client.fetch<HomePage>(`
    *[_type == "homePage" && _id == "home-page"][0] {
      ...,
      hero {
        ...,
        slides[0..4] {
          _key,
          heading,
          description,
          enabled,
          image { ..., asset-> }
        }
      }
    }
  `)
}

export async function getAboutPage() {
  return client.fetch<AboutPage>(`
    *[_type == "aboutPage" && _id == "about-page"][0] {
      ...,
      team {
        ...,
        members[]->
      }
    }
  `)
}

export async function getCareersPage() {
  return client.fetch<CareersPage>(`
    *[_type == "careersPage" && _id == "careers-page"][0]
  `)
}

export async function getContactPage() {
  return client.fetch<ContactPage>(`
    *[_type == "contactPage" && _id == "contact-page"][0]
  `)
}

export async function getCsrPage() {
  return client.fetch<CsrPage>(`
    *[_type == "csrPage" && _id == "csr-page"][0] {
      ...,
      programs[]->
    }
  `)
}

export async function getGlobalPresencePage() {
  return client.fetch<GlobalPresencePage>(`
    *[_type == "globalPresencePage" && _id == "global-presence-page"][0] {
      ...,
      countries[]->
    }
  `)
}

export async function getMeditationsPage() {
  return client.fetch<MeditationsPage>(`
    *[_type == "meditationsPage" && _id == "meditations-page"][0]
  `)
}

export async function getOrderMedicinesPage() {
  return client.fetch<OrderMedicinesPage>(`
    *[_type == "orderMedicinesPage" && _id == "order-medicines-page"][0]
  `)
}

export async function getPapPage() {
  return client.fetch<PapPage>(`
    *[_type == "papPage" && _id == "pap-page"][0]
  `)
}

export async function getProductsPage() {
  return client.fetch<ProductsPage>(`
    *[_type == "productsPage" && _id == "products-page"][0]
  `)
}

export async function getServicesPage() {
  return client.fetch<ServicesPage>(`
    *[_type == "servicesPage" && _id == "services-page"][0] {
      ...,
      services[]->
    }
  `)
}

export async function getUngcPage() {
  return client.fetch<UngcPage>(`
    *[_type == "ungcPage" && _id == "ungc-page"][0]
  `)
}

// ─────────────────────────────────────────────
// Page Assets (Materials)
// ─────────────────────────────────────────────

export async function getPageAssets() {
  return client.fetch<PageAsset[]>(`
    *[_type == "pageAsset"] {
      _id,
      _type,
      name,
      page,
      location,
      image,
      altText,
      assetPath,
      images[] {
        image,
        altText,
        assetPath
      }
    }
  `)
}

export async function getPageAssetsByPage(page: string) {
  return client.fetch<PageAsset[]>(`
    *[_type == "pageAsset" && (page == $page || page == "shared")] {
      _id,
      _type,
      name,
      page,
      location,
      image,
      altText,
      assetPath,
      images[] {
        image,
        altText,
        assetPath
      }
    }
  `, { page })
}

export async function getHeroSlides() {
  return client.fetch<PageAsset[]>(`
    *[_type == "pageAsset" && page == "home" && location == "hero-slider"] | order(_createdAt asc) [0..4] {
      _id,
      name,
      altText,
      image { ..., asset-> }
    }
  `)
}

export async function getGoogleSpreadsheetBySlug(slug: string) {
  return client.fetch<{ _id: string; spreadsheetId: string; link: string } | null>(`
    *[_type == "googleSpreadsheet" && id.current == $slug][0] {
      _id,
      spreadsheetId,
      link
    }
  `, { slug })
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
        image: image,
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
        image: image,
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
      image: image,
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
      image: image,
      contentHtml: rawContent,
      source_link: item.link
    };
  } catch (err) {
    console.error(`Error fetching news item by slug ${slug} from WordPress API:`, err);
    return null;
  }
}

export async function getCareers() {
  return client.fetch<any[]>(`
    *[_type == "career"] | order(title asc) {
      _id,
      title,
      "desc": description,
      "responsibilities": keyResponsibilities,
      "requirements": qualificationRequirements,
      image
    }
  `)
}



