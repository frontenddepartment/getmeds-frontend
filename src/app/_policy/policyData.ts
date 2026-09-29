import type { Metadata } from 'next';
import type { PoliciesDisclaimers } from '@/types/sanity';
import { excerptFromHtml } from '@/lib/seo';
import { pageMetadata } from '@/lib/pageMeta';

// Server-side half of the policy pages. In the old site every policy URL
// (/return-and-refund-policy, /privacy-policy, …) was rewritten to /policy, i.e. the one
// CentralizedPolicyPage (src/pages/policy.tsx); scripts/prerender-policies.cjs baked each
// URL's title/description/canonical and the policy body into the served HTML. This does the
// same at request time: one Sanity read, used for the metadata and as the page's first render.

export const DEFAULT_POLICIES = [
  {
    title: 'Return & Refund Policy',
    slug: 'return-and-refund-policy',
    icon: 'fa-rotate-left',
    effectiveDate: 'August 07, 2026',
    lastUpdated: 'August 07, 2026',
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    icon: 'fa-user-shield',
    effectiveDate: 'August 07, 2026',
    lastUpdated: 'August 07, 2026',
  },
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    icon: 'fa-file-contract',
    effectiveDate: 'August 07, 2026',
    lastUpdated: 'August 07, 2026',
  },
  {
    title: 'Medical Disclaimer',
    slug: 'medical-disclaimer',
    icon: 'fa-triangle-exclamation',
    effectiveDate: 'August 07, 2026',
    lastUpdated: 'August 07, 2026',
  },
  {
    title: 'Prescription Policy',
    slug: 'prescription-policy',
    icon: 'fa-prescription-bottle-medical',
    effectiveDate: 'August 07, 2026',
    lastUpdated: 'August 07, 2026',
  },
  {
    title: 'Shipping & Delivery Policy',
    slug: 'shipping-and-delivery-policy',
    icon: 'fa-truck-fast',
    effectiveDate: 'August 07, 2026',
    lastUpdated: 'August 07, 2026',
  },
];

export function policySlugOf(p: PoliciesDisclaimers): string {
  const s = p.slug;
  if (!s) return '';
  return typeof s === 'object' ? s.current || '' : String(s);
}

const isInvalid = (val?: string) => !val || val.includes('[SENSITIVE]') || val.includes('[') || val.includes(']');

/** Same query scripts/prerender-policies.cjs ran: every policiesDisclaimers doc, by title. */
export async function fetchPolicies(): Promise<PoliciesDisclaimers[]> {
  const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
  const projectId = isInvalid(rawProjectId) ? 's7ocz8zp' : rawProjectId;
  const rawDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.VITE_SANITY_DATASET;
  const dataset = isInvalid(rawDataset) ? 'production' : rawDataset;
  const query = '*[_type == "policiesDisclaimers"] | order(title asc)';
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Sanity API returned status ${res.status}`);
    const json = await res.json();
    return Array.isArray(json.result) ? json.result : [];
  } catch (err) {
    console.warn('[Policies] Sanity fetch failed, using static fallbacks:', err);
    return [];
  }
}

/** Which policy a request is for: ?slug= wins (as in getSlugFromUrl), else the route's own. */
export function resolvePolicySlug(routeSlug: string, querySlug?: string | string[]): string {
  const q = Array.isArray(querySlug) ? querySlug[0] : querySlug;
  return q || routeSlug;
}

export async function policyMetadata(slug: string): Promise<Metadata> {
  const docs = await fetchPolicies();
  const doc = docs.find((d) => policySlugOf(d) === slug);
  const fallback = DEFAULT_POLICIES.find((p) => p.slug === slug) || DEFAULT_POLICIES[0];
  const title = doc?.title || fallback.title;
  const effectiveDate = doc?.effectiveDate || fallback.effectiveDate;
  const description = excerptFromHtml(doc?.contentHtml || '', 155) || `Read Getmeds' ${title} — effective ${effectiveDate}.`;
  return pageMetadata({ title, description, path: `/${slug}` });
}
