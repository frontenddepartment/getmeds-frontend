'use client';

import React, { useEffect, useState } from 'react';
import { getAllPolicies } from '@/lib/queries';
import type { PoliciesDisclaimers } from '@/types/sanity';
import { setPageMeta, excerptFromHtml } from '@/lib/seo';
import { DEFAULT_POLICIES } from './policyData';
import './policy.css';

// Port of getmeds_frontend/src/pages/policy.tsx (CentralizedPolicyPage). Every policy URL was
// rewritten to that one page, so every policy route here renders this component.
//
// `initialSlug` is what getSlugFromUrl() returned (?slug=, else the path), resolved on the
// server. `initialPolicies` is the server's Sanity read — the counterpart of the policy body
// scripts/prerender-policies.cjs baked into the HTML and kept on screen until the live fetch
// finished — so the first render already shows the document instead of a spinner.
// (The original also defined handleSelectPolicy/handleCopyLink, but rendered nothing that
// called them; they are left out.)
export default function PolicyClient({
  initialSlug,
  initialPolicies,
}: {
  initialSlug: string;
  initialPolicies: PoliciesDisclaimers[];
}) {
  const [policies, setPolicies] = useState<PoliciesDisclaimers[]>(initialPolicies);
  const [activeSlug, setActiveSlug] = useState<string>(initialSlug);
  const [loading, setLoading] = useState<boolean>(initialPolicies.length === 0);

  useEffect(() => {
    setActiveSlug(initialSlug);
  }, [initialSlug]);

  // Fetch policies from Sanity database
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

  // Find active policy item
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

  // Description is a real excerpt of the policy's own content, not invented copy.
  // The server metadata (policyData.ts) computes the same values.
  useEffect(() => {
    const excerpt = excerptFromHtml(displayHtml, 155);
    setPageMeta({
      title: displayTitle,
      description: excerpt || `Read Getmeds' ${displayTitle} — effective ${effectiveDate}.`,
      path: `/${activeSlug}`,
    });
  }, [activeSlug, displayTitle, displayHtml, effectiveDate]);

  return (
    <div className="policy-page min-h-screen bg-gray-50 text-gray-800">
      {/* Breadcrumb Header */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 relative z-10">
        <a
          href="/"
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
    </div>
  );
}
