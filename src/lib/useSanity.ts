/**
 * useSanity.ts
 * ─────────────────────────────────────────────
 * Drop-in React hooks for every page + shared data.
 *
 * Usage:
 *   const { data, loading, error } = useHomePage()
 *   const { data: products, loading } = useProducts()
 *
 * Each hook returns:
 *   data    — typed result (null until loaded)
 *   loading — boolean
 *   error   — Error | null
 */

import { useState, useEffect } from 'react'
import {
  getHomePage,
  getAboutPage,
  getCareersPage,
  getContactPage,
  getCsrPage,
  getGlobalPresencePage,
  getMeditationsPage,
  getOrderMedicinesPage,
  getPapPage,
  getProductsPage,
  getServicesPage,
  getUngcPage,
  getProducts,
  getProductBySlug,
  getProductsByCategory,
  searchProducts,
  getCategories,
  getCategoryBySlug,
  getFAQs,
  searchFAQs,
  getServices,
  getTeamMembers,
  getTestimonials,
  getCountries,
  getCsrPrograms,
  getSiteSettings,
  getNavigation,
} from './queries'

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
// Generic fetch hook
// ─────────────────────────────────────────────

function useFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error }
}

// Variant that re-runs when a param changes
function useFetchWithParam<T, P>(fetcher: (param: P) => Promise<T>, param: P) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!param) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher(param)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [String(param)])

  return { data, loading, error }
}

// ─────────────────────────────────────────────
// Site-wide
// ─────────────────────────────────────────────

export function useSiteSettings() {
  return useFetch<SiteSettings>(getSiteSettings)
}

export function useNavigation() {
  return useFetch<Navigation>(getNavigation)
}

// ─────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────

export function useHomePage() {
  return useFetch<HomePage>(getHomePage)
}

export function useAboutPage() {
  return useFetch<AboutPage>(getAboutPage)
}

export function useCareersPage() {
  return useFetch<CareersPage>(getCareersPage)
}

export function useContactPage() {
  return useFetch<ContactPage>(getContactPage)
}

export function useCsrPage() {
  return useFetch<CsrPage>(getCsrPage)
}

export function useGlobalPresencePage() {
  return useFetch<GlobalPresencePage>(getGlobalPresencePage)
}

export function useMeditationsPage() {
  return useFetch<MeditationsPage>(getMeditationsPage)
}

export function useOrderMedicinesPage() {
  return useFetch<OrderMedicinesPage>(getOrderMedicinesPage)
}

export function usePapPage() {
  return useFetch<PapPage>(getPapPage)
}

export function useProductsPage() {
  return useFetch<ProductsPage>(getProductsPage)
}

export function useServicesPage() {
  return useFetch<ServicesPage>(getServicesPage)
}

export function useUngcPage() {
  return useFetch<UngcPage>(getUngcPage)
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export function useProducts() {
  return useFetch<Product[]>(getProducts)
}

export function useProductBySlug(slug: string) {
  return useFetchWithParam<Product, string>(getProductBySlug, slug)
}

export function useProductsByCategory(categoryId: string) {
  return useFetchWithParam<Product[], string>(getProductsByCategory, categoryId)
}

export function useProductSearch(query: string) {
  return useFetchWithParam<Product[], string>(searchProducts, query)
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export function useCategories() {
  return useFetch<Category[]>(getCategories)
}

export function useCategoryBySlug(slug: string) {
  return useFetchWithParam<Category, string>(getCategoryBySlug, slug)
}

// ─────────────────────────────────────────────
// FAQs
// ─────────────────────────────────────────────

export function useFAQs() {
  return useFetch<FAQ[]>(getFAQs)
}

export function useFAQSearch(query: string) {
  return useFetchWithParam<FAQ[], string>(searchFAQs, query)
}

// ─────────────────────────────────────────────
// Reusable content
// ─────────────────────────────────────────────

export function useServices() {
  return useFetch<Service[]>(getServices)
}

export function useTeamMembers() {
  return useFetch<TeamMember[]>(getTeamMembers)
}

export function useTestimonials() {
  return useFetch<Testimonial[]>(getTestimonials)
}

export function useCountries() {
  return useFetch<CountryPresence[]>(getCountries)
}

export function useCsrPrograms() {
  return useFetch<CsrProgram[]>(getCsrPrograms)
}
