import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { getPolicyBySlug } from '../lib/queries';

export default function MedicalDisclaimer() {
  const [dynamicHtml, setDynamicHtml] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Medical Disclaimer — Getmeds';

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', 'https://getmeds.ph/medical-disclaimer');

    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then((r) => r.text())
        .then((html) => injectHTML(navContainer, html));
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then((r) => r.text())
        .then((html) => injectHTML(footerContainer, html));
    }

    getPolicyBySlug('medical-disclaimer')
      .then((data) => {
        if (data?.contentHtml) {
          setDynamicHtml(data.contentHtml);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch Medical Disclaimer from Sanity database:', err);
      });
  }, []);

  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif", background: '#ffffff' }}
      className="min-h-screen relative text-gray-800 antialiased"
    >
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2 relative z-10">
        <a
          href="/index.html"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <i className="fa-solid fa-chevron-left text-[10px]" />
          Back to Home
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center py-6 relative z-10">
        <span
          className="inline-block text-xs font-semibold px-3.5 py-1 rounded-full mb-4 text-white uppercase tracking-wider"
          style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}
        >
          Compliance &amp; Legal Policy
        </span>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-snug mb-3">
          Medical Disclaimer
        </h1>

        <p className="text-xs md:text-sm text-gray-400">
          Effective Date: August 07, 2026 &bull; Last Updated: August 07, 2026
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20 mt-4 relative z-10">
        <article className="min-w-0">
          {dynamicHtml ? (
            <div
              className="policy-html-content bg-white p-6 md:p-8 rounded-2xl border border-gray-200/80 shadow-sm"
              dangerouslySetInnerHTML={{ __html: dynamicHtml }}
            />
          ) : (
            <div className="p-6 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl">
              <h2 className="text-xl font-bold mb-3 text-amber-900">Medical Disclaimer</h2>
              <p className="text-amber-900 text-sm leading-relaxed mb-3">
                The content provided on Getmeds is for informational purposes only and does not constitute medical advice, diagnosis, or treatment.
              </p>
            </div>
          )}
        </article>
      </div>

      <div id="footer-container" />
    </div>
  );
}
