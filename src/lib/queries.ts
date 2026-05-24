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

export async function getProducts() {
  return client.fetch<Product[]>(`
    *[_type == "product"] | order(name asc) {
      _id,
      name,
      genericName,
      brandName,
      slug,
      availability,
      image,
      strength,
      form,
      packaging,
      description,
      indications,
      category-> { _id, category, slug },
      subCategory,
      country,
      distributor,
      innovator,
    }
  `)
}

export async function getProductBySlug(slug: string) {
  return client.fetch<Product>(`
    *[_type == "product" && slug.current == $slug][0] {
      ...,
      category->
    }
  `, { slug })
}

export async function getProductsByCategory(categoryId: string) {
  return client.fetch<Product[]>(`
    *[_type == "product" && category._ref == $categoryId] | order(name asc) {
      _id,
      name,
      genericName,
      brandName,
      slug,
      availability,
      image,
      strength,
      form,
      packaging,
      description,
      category-> { _id, category, slug },
      subCategory,
    }
  `, { categoryId })
}

export async function searchProducts(query: string) {
  return client.fetch<Product[]>(`
    *[_type == "product" && (
      name match $query ||
      genericName match $query ||
      brandName match $query ||
      subCategory match $query
    )] | order(name asc) {
      _id,
      name,
      genericName,
      brandName,
      slug,
      availability,
      image,
      strength,
      form,
      category-> { _id, category, slug },
      subCategory,
    }
  `, { query: `*${query}*` })
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
    *[_type == "homePage" && _id == "home-page"][0]
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
