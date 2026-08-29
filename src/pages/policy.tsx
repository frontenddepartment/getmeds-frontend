import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { getAllPolicies } from '../lib/queries';
import { PoliciesDisclaimers } from '../types/sanity';
import { setPageMeta } from '../lib/seo';

const DEFAULT_POLICIES = [
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

export default function CentralizedPolicyPage() {
  const [policies, setPolicies] = useState<PoliciesDisclaimers[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('return-and-refund-policy');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Inject Header & Footer on mount
  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer) {
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => injectHTML(navContainer, html))
        .catch(err => console.warn('Failed to load navbar:', err));
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => injectHTML(footerContainer, html))
        .catch(err => console.warn('Failed to load footer:', err));
    }
  }, []);

  // 2. Parse current URL slug on mount or URL change
  useEffect(() => {
    const getSlugFromUrl = () => {
      const path = window.location.pathname.replace(/^\/|\/$/g, '');
      const searchParams = new URLSearchParams(window.location.search);
      const querySlug = searchParams.get('slug');

      if (querySlug) return querySlug;

      const matchingPolicy = DEFAULT_POLICIES.find(p => p.slug === path);
      if (matchingPolicy) return matchingPolicy.slug;

      return 'return-and-refund-policy';
    };

    setActiveSlug(getSlugFromUrl());
  }, []);

  // 3. Fetch policies from Sanity database
  useEffect(() => {
    async function fetchPolicies() {
      try {
        const data = await getAllPolicies();
        if (Array.isArray(data) && data.length > 0) {
          setPolicies(data);
        }
      } catch (err) {
        console.warn('[Getmeds] Failed to fetch dynamic policies, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicies();
  }, []);

  // 4. Find active policy item
  const policyMap = new Map<string, PoliciesDisclaimers>();
  policies.forEach(p => {
    const slugStr = typeof p.slug === 'object' && p.slug !== null ? (p.slug as any).current : p.slug;
    if (slugStr) policyMap.set(slugStr, p);
  });

  const currentDefault = DEFAULT_POLICIES.find(p => p.slug === activeSlug) || DEFAULT_POLICIES[0];
  const currentSanityItem = policyMap.get(activeSlug);

  const displayTitle = currentSanityItem?.title || currentDefault.title;
  const displayHtml = currentSanityItem?.contentHtml || '';
  const effectiveDate = currentSanityItem?.effectiveDate || currentDefault.effectiveDate;
  const lastUpdated = currentSanityItem?.lastUpdated || currentDefault.lastUpdated;

  // This page previously had no title/meta handling at all — every one of its 7 URLs
  // (/privacy-policy, /terms-of-service, etc.) showed whatever the static shell's
  // generic fallback was. Description is a real excerpt of the policy's own content,
  // not invented copy.
  useEffect(() => {
    const excerpt = displayHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);
    setPageMeta({
      title: displayTitle,
      description: excerpt || `Read Getmeds' ${displayTitle} — effective ${effectiveDate}.`,
      path: `/${activeSlug}`,
    });
  }, [activeSlug, displayTitle, displayHtml, effectiveDate]);

  const handleSelectPolicy = (slug: string) => {
    setActiveSlug(slug);
    if (window.history.pushState) {
      window.history.pushState({ slug }, '', `/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div id="navbar-container" />

      {/* Breadcrumb Header */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 relative z-10">
        <a
          href="/index.html"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <i className="fa-solid fa-chevron-left text-[9px]" />
          Back to Home
        </a>
      </div>

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-4 text-center py-6 relative z-10">
        <span
          className="inline-block text-xs font-semibold px-3 py-1 rounded-md mb-3 text-white uppercase tracking-wider shadow-xs"
          style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}
        >
          Policies &amp; Disclaimers
        </span>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-2">
          {displayTitle}
        </h1>

        <p className="text-xs text-gray-500">
          Effective Date: {effectiveDate} &bull; Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Main Document Content Area */}
      <div className="max-w-4xl mx-auto px-4 pb-20 mt-4 relative z-10">
        <main className="min-w-0">
          <article className="min-w-0">
            {loading ? (
              <div className="bg-white p-12 rounded-lg border border-gray-200 shadow-xs text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#1D9FDA] mb-4" />
                <p className="text-sm text-gray-500">Loading document details...</p>
              </div>
            ) : displayHtml ? (
              <div
                className="policy-html-content bg-white p-6 md:p-10 rounded-lg border border-gray-200 shadow-xs"
                dangerouslySetInnerHTML={{ __html: displayHtml }}
              />
            ) : (
              <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-xs text-center">
                <i className="fa-solid fa-file-circle-exclamation text-4xl text-gray-300 mb-3" />
                <h2 className="text-lg font-bold text-gray-900 mb-1">{displayTitle}</h2>
                <p className="text-xs text-gray-500">Document content will be available shortly.</p>
              </div>
            )}
          </article>
        </main>
      </div>

      <div id="footer-container" />
    </div>
  );
}
