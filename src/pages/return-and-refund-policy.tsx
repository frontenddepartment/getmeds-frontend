import React, { useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { getPolicyBySlug } from '../lib/queries';

const sections = [
  { id: 'section-1', title: '1. Introduction' },
  { id: 'section-2', title: '2. General Principles' },
  { id: 'section-3', title: '3. Eligible Claims and Reporting Windows' },
  { id: 'section-4', title: '4. What Can Be Refunded' },
  { id: 'section-5', title: '5. What Cannot Be Refunded' },
  { id: 'section-6', title: '6. Special-Handling Products' },
  { id: 'section-7', title: '7. Patient Orders' },
  { id: 'section-8', title: '8. Hospital & Institutional Accounts' },
  { id: 'section-9', title: '9. Product Recall Refunds' },
  { id: 'section-10', title: '10. Refund Methods' },
  { id: 'section-11', title: '11. Refund Processing Timelines' },
  { id: 'section-12', title: '12. How to File a Refund Claim' },
  { id: 'section-13', title: '13. Denied Claims & Appeals' },
  { id: 'section-14', title: '14. Right of Final Decision' },
  { id: 'section-15', title: '15. Regulatory Compliance' },
  { id: 'section-16', title: '16. Changes to This Policy' },
  { id: 'section-17', title: '17. Contact Us' },
];

export default function ReturnAndRefundPolicy() {
  const [activeSection, setActiveSection] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dynamicHtml, setDynamicHtml] = useState<string | null>(null);

  useEffect(() => {
    getPolicyBySlug('return-and-refund-policy')
      .then((data) => {
        if (data?.contentHtml) {
          setDynamicHtml(data.contentHtml);
        }
      })
      .catch((err) => {
        console.warn('Failed to load Return & Refund Policy from Sanity database:', err);
      });
  }, []);

  useEffect(() => {
    document.title = 'Return & Refund Policy — Getmeds';

    // Canonical link
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', 'https://getmeds.ph/return-and-refund-policy');

    // Navbar and footer injection
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

    // Scroll spy for table of contents
    const handleScroll = () => {
      const els = sections.map((s) => document.getElementById(s.id));
      let current = 0;
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= 140) {
          current = i;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif", background: '#ffffff' }}
      className="min-h-screen relative text-gray-800 antialiased"
    >
      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2 relative z-10">
        <a
          href="/index.html"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <i className="fa-solid fa-chevron-left text-[10px]" />
          Back to Home
        </a>
      </div>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto px-4 text-center py-6 relative z-10">
        <span
          className="inline-block text-xs font-semibold px-3.5 py-1 rounded-full mb-4 text-white uppercase tracking-wider"
          style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}
        >
          Compliance &amp; Legal Policy
        </span>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-snug mb-3">
          Return &amp; Refund Policy
        </h1>

        <p className="text-xs md:text-sm text-gray-400">
          Effective Date: August 07, 2026 &bull; Last Updated: August 07, 2026
        </p>
      </div>

      {/* Two-Column Main Layout */}
      <div className="max-w-4xl mx-auto px-4 pb-20 mt-4 relative z-10">
        <div className="flex gap-10">
          {/* Left Sidebar: Table of Contents + Share */}
          <aside
            className="hidden md:flex flex-col gap-6 w-56 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Contents
              </p>
              <nav className="flex flex-col gap-1.5">
                {sections.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="text-left text-xs leading-relaxed transition-all duration-200 py-0.5"
                    style={{
                      color: activeSection === idx ? '#1D9FDA' : '#6b7280',
                      fontWeight: activeSection === idx ? 600 : 400,
                      borderLeft:
                        activeSection === idx
                          ? '2px solid #1D9FDA'
                          : '2px solid transparent',
                      paddingLeft: '10px',
                    }}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Share / Action Widget */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-700 mb-2.5">
                Share Policy
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyPageLink}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 text-xs transition"
                  title="Copy link"
                >
                  <i className={`fa-solid ${copied ? 'fa-check text-green-600' : 'fa-link'}`} />
                </button>
                <a
                  href="mailto:info@getmeds.ph?subject=Inquiry%20Regarding%20Return%20%26%20Refund%20Policy"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: '#1D9FDA' }}
                  title="Email Inquiry"
                >
                  <i className="fa-solid fa-envelope" />
                </a>
                <a
                  href="tel:+639190769105"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: '#61A644' }}
                  title="Call Customer Support"
                >
                  <i className="fa-solid fa-phone" />
                </a>
              </div>
              {copied && (
                <span className="text-[11px] text-green-600 font-medium mt-1 inline-block">
                  Link copied!
                </span>
              )}
            </div>
          </aside>

          {/* Right Main Content Area: Pure HTML Elements (Dynamic from Sanity database) */}
          <article className="flex-1 min-w-0">
            {dynamicHtml ? (
              <div dangerouslySetInnerHTML={{ __html: dynamicHtml }} />
            ) : (
              <>
                {/* Section 1 */}
            <section id="section-1" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                1. Introduction
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Getmeds is committed to fair, transparent, and regulation-compliant handling of returns and refunds for all our customers &mdash; patients, hospitals, pharmacies, and pharmaceutical partners. This Return &amp; Refund Policy outlines the conditions under which returns are accepted, refunds are issued, and how you can file a claim.
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                As a licensed pharmaceutical wholesaler, importer, distributor, and retail pharmacy, our return and refund practices follow Good Distribution Practice (GDP) standards, FDA Philippines regulations, PDEA requirements for controlled substances, and the Consumer Act of the Philippines (Republic Act No. 7394).
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                2. General Principles
              </h2>
              <p className="text-gray-700 text-sm font-semibold mb-2">
                How refunds work at Getmeds:
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>
                    Refunds are processed only after formal approval of the related return, discrepancy, or recall claim.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>
                    All returned goods must be authorized via our Return/Discrepancy Merchandise Authorization (RMA) Form before pickup or acceptance.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>
                    Refund value equals the invoiced price actually paid, net of discounts and rebates, inclusive of VAT where applicable.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>
                    Every claim requires product name, batch or lot number, expiry date, and original Sales Invoice number for traceability.
                  </span>
                </li>
              </ul>

              <div className="bg-blue-50/70 border-l-4 border-[#1D9FDA] p-4 rounded-r-xl my-4">
                <p className="text-xs font-semibold text-gray-900 mb-1">
                  Order of Remedies:
                </p>
                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  Approved claims are resolved in this preferred order:
                </p>
                <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1 font-medium pl-1">
                  <li>Product replacement</li>
                  <li>Credit memo or offset against outstanding/future invoices</li>
                  <li>Bank refund (only where replacement and credit are impractical)</li>
                </ol>
                <p className="text-xs text-gray-500 italic mt-2">
                  Note: Approval of a return does not automatically entitle the customer to a cash refund &mdash; Getmeds determines the appropriate remedy based on the situation.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                3. Eligible Claims and Reporting Windows
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                The following table outlines when to report each type of claim:
              </p>

              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4 shadow-sm">
                <table className="w-full text-xs text-left text-gray-700">
                  <thead className="text-xs font-semibold uppercase bg-gray-50 text-gray-800 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-4 py-3">Claim Type</th>
                      <th scope="col" className="px-4 py-3">Reporting Window</th>
                      <th scope="col" className="px-4 py-3">Required Documentation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-900">Visible damage, leakage, or shortage at delivery</td>
                      <td className="px-4 py-3 text-red-600 font-medium">At the point of delivery (before signing)</td>
                      <td className="px-4 py-3">Annotation on Delivery Receipt + photographs taken at delivery</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-900">Concealed damage, defect, wrong product, or missing items</td>
                      <td className="px-4 py-3 font-medium">Within 7 calendar days from receipt</td>
                      <td className="px-4 py-3">Photographs, batch/lot numbers, original Sales Invoice, RMA Form</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-900">Confirmed manufacturing defect or quality complaint</td>
                      <td className="px-4 py-3 font-medium">Within 7 calendar days of discovery (within shelf life)</td>
                      <td className="px-4 py-3">Quality complaint report, retained sample if possible, batch/lot info, Sales Invoice</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 bg-amber-50/30">
                      <td className="px-4 py-3 font-semibold text-gray-900">Cold-chain temperature excursion</td>
                      <td className="px-4 py-3 text-amber-700 font-medium">At delivery (before signing)</td>
                      <td className="px-4 py-3">Temperature data logger readout or delivery temperature record</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-900">Product recall (regulatory or voluntary)</td>
                      <td className="px-4 py-3 font-medium">Per recall notice timeline</td>
                      <td className="px-4 py-3">Recall notice reference, batch/lot reconciliation, verified returned quantities</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl">
                <p className="text-xs text-amber-900 font-semibold flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation text-amber-600" />
                  Important Cold-Chain Notice:
                </p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Claims for cold-chain products must be raised at the point of delivery. Claims submitted after acceptance of cold-chain goods are not eligible for return or refund.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                4. What Can Be Refunded
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Refundable scenarios include:
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-700">
                {[
                  'Incorrect product delivered by Getmeds',
                  'Damaged or defective products on arrival (reported within the applicable window)',
                  'Delivery failure caused by Getmeds',
                  'Product unavailability confirmed prior to delivery (full refund of any advance payment within 7 business days)',
                  'Product recall issued before administration or use',
                  'Quantity shortage verified at delivery',
                  'Cold-chain temperature excursion during transit (reported at delivery)',
                  'Confirmed manufacturing defect or quality complaint within shelf life',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
                      <i className="fa-solid fa-check" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                5. What Cannot Be Refunded
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Non-refundable conditions include:
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-700">
                {[
                  'Claims reported beyond the applicable reporting window',
                  'Products improperly stored, handled, or transported by the customer or patient after acceptance (including cold-chain breaks after delivery)',
                  'Products that have been opened, used, partially consumed, repackaged, or relabeled',
                  'Expired or near-expiry products outside conditions expressly approved under our Return Policy',
                  'Products sold under a written no-return commercial agreement (e.g., clearance items, short-dated stock sold with disclosed expiry)',
                  'Damage from force majeure events occurring after delivery and acceptance',
                  'Claims unsupported by an approved RMA, original Sales Invoice, or batch/lot traceability',
                  'Cold-chain products where integrity was compromised after customer acceptance',
                  'Special importation or patient-specific orders once procurement has commenced',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px]">
                      <i className="fa-solid fa-xmark" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-r-xl text-xs text-emerald-900">
                <p className="font-semibold mb-0.5">Statutory Protection Notice:</p>
                <p className="leading-relaxed">
                  Nothing in this policy waives your statutory rights under the Consumer Act of the Philippines (Republic Act No. 7394) with respect to defective or hazardous products.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                6. Special-Handling Products
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Certain product categories have additional return and refund conditions due to regulatory requirements:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                    Controlled Substances (Dangerous Drugs)
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Returns and refunds involving dangerous drugs and controlled precursors follow the documentation, custody, and destruction requirements of Republic Act No. 9165 and applicable FDA / PDEA regulations. Refund or credit is released only after regulatory documentation of the return or witnessed destruction is complete.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                    Blood Bags, Contrast Media, and Sterile Devices
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Eligible for refund only for Getmeds-fault discrepancies confirmed within the applicable reporting window. Sterility-critical items with broken seals or compromised packaging are non-refundable.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                    Special Permit Medicines (CSP, EUA, Named-Patient Access)
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Products procured under Compassionate Special Permit (CSP), Emergency Use Authorization (EUA), or similar named-patient/special-import mechanisms are non-refundable once procurement has commenced &mdash; except where Getmeds delivered the wrong product or the product was defective on arrival.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                    Cold-Chain Products
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Cold-chain claims must be raised at the point of delivery, not after acceptance.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                7. Patient Orders
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                For individual patients ordering medicines from Getmeds, the following applies:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-check text-emerald-600" />
                    Refundable Scenarios
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    <li>&bull; Incorrect product delivered by Getmeds</li>
                    <li>&bull; Damaged or defective on arrival (reported at delivery for visible damage, or within 7 calendar days for concealed damage)</li>
                    <li>&bull; Delivery failure caused by Getmeds</li>
                    <li>&bull; Product unavailability confirmed prior to delivery (full refund within 7 business days)</li>
                    <li>&bull; Recall issued before administration of the product</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                  <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-xmark text-rose-600" />
                    Non-Refundable Scenarios
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    <li>&bull; Cold-chain integrity compromised after acceptance</li>
                    <li>&bull; Special importation or patient-specific orders once procurement has commenced</li>
                    <li>&bull; Opened, used, or tampered packaging</li>
                    <li>&bull; Special permit medicines (CSP, EUA), except for Getmeds-fault delivery errors or defects on arrival</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Cancellation Policy for Patient Orders:
                </h3>
                <ul className="space-y-1 text-xs text-gray-700 leading-relaxed">
                  <li>&bull; Cancellation is permitted before procurement or shipment commences.</li>
                  <li>&bull; Advance payments are refunded in full within 7 business days of an eligible cancellation.</li>
                  <li>&bull; Once procurement of a patient-specific or special-import order has commenced, cancellation is no longer permitted and advance payments are non-refundable, except as required by law.</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                8. Hospital and Institutional Accounts
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                For hospital and government institutional customers:
              </p>
              <ul className="space-y-2 mb-4 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>
                    Claims arising from hospital and government deliveries follow the inspection and acceptance terms of the underlying Purchase Order, contract, or bidding documents.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>
                    These contractual terms prevail over standard reporting windows where stricter.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>
                    Default remedies for institutional accounts are product replacement or credit memo/offset.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>
                    Cash refunds to government entities are processed only where replacement and credit are not permissible under the contract, and upon written instruction of the procuring entity.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                9. Product Recall Refunds
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                For product recalls (regulatory or voluntary):
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#61A644' }}
                  />
                  <span>
                    Applies to recalls mandated by the Philippine FDA or Department of Health, and voluntary recalls initiated by Getmeds or the manufacturer.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#61A644' }}
                  />
                  <span>
                    Getmeds covers retrieval, freight, and reverse-logistics costs for recalls.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#61A644' }}
                  />
                  <span>No restocking or handling fee is charged on recalled goods.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#61A644' }}
                  />
                  <span>
                    Refund value is based on verified returned quantities reconciled by batch/lot against distribution records.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#61A644' }}
                  />
                  <span>
                    Credit memo is the default remedy; bank refund applies where the customer has fully settled and has no offsetting purchases.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#61A644' }}
                  />
                  <span>
                    Credit memo is issued within 15 business days of completed batch reconciliation and Quality verification.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="section-10" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                10. Refund Methods
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Getmeds offers the following refund methods:
              </p>

              <div className="space-y-3 text-xs text-gray-700">
                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    Credit Memo (Default)
                  </h3>
                  <p>
                    BIR-compliant credit memo issued against the original Sales Invoice. Applied to outstanding balance or held as credit for future purchases.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    Offset Against Future Purchases
                  </h3>
                  <p>
                    Available to active trade accounts. Reflected in the next Statement of Account.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    Bank Transfer
                  </h3>
                  <p className="mb-2">Available only under strict payee verification controls:</p>
                  <ul className="space-y-1 pl-4 list-disc text-gray-600">
                    <li>Refund only to a bank account in the exact registered name of the invoiced customer</li>
                    <li>Bank details validated in writing on company letterhead (corporate) or with valid government ID (patient orders)</li>
                    <li>Bank details confirmed by documented call-back to a known contact number before first use</li>
                    <li className="font-semibold text-rose-700">No third-party payees. No cash payouts.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section id="section-11" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                11. Refund Processing Timelines
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Our end-to-end commitment for refund processing is <strong>7&ndash;30 business days</strong> from submission of complete documents and receipt of returned goods.
              </p>

              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4 shadow-sm">
                <table className="w-full text-xs text-left text-gray-700">
                  <thead className="text-xs font-semibold uppercase bg-gray-50 text-gray-800 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-4 py-3">Step</th>
                      <th scope="col" className="px-4 py-3">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">Claim acknowledgment</td>
                      <td className="px-4 py-2.5 text-gray-700 font-semibold">2 business days</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">Payment validation</td>
                      <td className="px-4 py-2.5 text-gray-700 font-semibold">3 business days</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">Goods receipt, quarantine, and quality verification (for physical returns)</td>
                      <td className="px-4 py-2.5 text-gray-700 font-semibold">5 business days from goods receipt</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">Eligibility evaluation and approval</td>
                      <td className="px-4 py-2.5 text-gray-700 font-semibold">3 business days</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">Denial notification (if applicable)</td>
                      <td className="px-4 py-2.5 text-gray-700 font-semibold">2 business days</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">Credit memo or offset execution</td>
                      <td className="px-4 py-2.5 text-gray-700 font-semibold">5 business days</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">Bank transfer execution</td>
                      <td className="px-4 py-2.5 text-gray-700 font-semibold">15 business days</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">Customer notification and closure</td>
                      <td className="px-4 py-2.5 text-gray-700 font-semibold">2 business days after execution</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                Note: Incomplete claim submissions are placed on hold. Customers are notified of deficiencies within 2 business days, and the processing timeline pauses until documentation is complete.
              </p>
            </section>

            {/* Section 12 */}
            <section id="section-12" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                12. How to File a Refund Claim
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                To submit a return or refund request, please provide:
              </p>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Required Documentation:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-file-invoice text-[#1D9FDA]" />
                    Original Sales Invoice number
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-barcode text-[#1D9FDA]" />
                    Batch or lot number &amp; expiry date
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-camera text-[#1D9FDA]" />
                    Photographs of product/packaging
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-truck-ramp-box text-[#1D9FDA]" />
                    Delivery Receipt annotation
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-align-left text-[#1D9FDA]" />
                    Issue description &amp; timeline
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-receipt text-[#1D9FDA]" />
                    Proof of payment
                  </li>
                  <li className="flex items-center gap-2 sm:col-span-2">
                    <i className="fa-solid fa-file-signature text-[#1D9FDA]" />
                    Approved RMA Form (for physical returns)
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Submission Channels:
                </h3>
                <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                  <a
                    href="mailto:info@getmeds.ph"
                    className="inline-flex items-center gap-2 text-[#1D9FDA] font-semibold hover:underline"
                  >
                    <i className="fa-solid fa-envelope" /> info@getmeds.ph
                  </a>
                  <a
                    href="tel:+639190769105"
                    className="inline-flex items-center gap-2 text-[#61A644] font-semibold hover:underline"
                  >
                    <i className="fa-solid fa-phone" /> +63 919 076 9105
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  Once we receive your complete request, you will receive a claim reference number for tracking. All updates on your claim will reference this number.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section id="section-13" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                13. Denied Claims and Appeals
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                If your claim is denied:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>You will receive a written notice citing the specific reason for the denial.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>You may appeal once in writing within 7 calendar days of the denial notice.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span>Appeals are reviewed by senior management, and a decision is issued within 5 business days.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9FDA' }}
                  />
                  <span className="font-semibold text-gray-900">The appeal decision is final.</span>
                </li>
              </ul>
            </section>

            {/* Section 14 */}
            <section id="section-14" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                14. Right of Final Decision
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                Getmeds reserves the right to approve or deny refund requests, conduct investigations, request additional documentation, and modify the refund method based on operational, contractual, or regulatory requirements &mdash; subject always to applicable Philippine law and regulations.
              </p>
            </section>

            {/* Section 15 */}
            <section id="section-15" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                15. Regulatory Compliance
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                This Return &amp; Refund Policy operates in compliance with:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <i className="fa-solid fa-scale-balanced mt-1 text-[#1D9FDA] text-xs" />
                  <span>Republic Act No. 7394 &mdash; Consumer Act of the Philippines</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fa-solid fa-prescription-bottle-medical mt-1 text-[#1D9FDA] text-xs" />
                  <span>Republic Act No. 9711 &mdash; Food and Drug Administration Act of 2009</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fa-solid fa-shield-halved mt-1 text-[#1D9FDA] text-xs" />
                  <span>Republic Act No. 9165 &mdash; Comprehensive Dangerous Drugs Act (for controlled substances)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fa-solid fa-boxes-packing mt-1 text-[#1D9FDA] text-xs" />
                  <span>Good Distribution Practice (GDP) requirements for pharmaceutical distribution</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fa-solid fa-building-columns mt-1 text-[#1D9FDA] text-xs" />
                  <span>FDA Philippines and PDEA regulations</span>
                </li>
              </ul>
            </section>

            {/* Section 16 */}
            <section id="section-16" className="mb-10">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                16. Changes to This Policy
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                Getmeds reserves the right to update this Return &amp; Refund Policy at any time to reflect changes in laws, regulations, or business practices. Material changes will be posted on this page with an updated effective date. Continued use of Getmeds services after policy changes constitutes acceptance of the revised policy.
              </p>
            </section>

            {/* Section 17 */}
            <section id="section-17" className="mb-6">
              <h2 className="text-lg md:text-xl font-bold mb-3 scroll-mt-28 bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">
                17. Contact Us
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                For questions about returns, refunds, or claim submissions:
              </p>

              <div className="bg-gradient-to-br from-gray-900 to-[#1A1D2B] text-white p-6 rounded-2xl shadow-lg">
                <p className="font-bold text-base text-white mb-2">Getmeds Philippines</p>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Unit 301 &amp; 305, 17 Vatican Building, Vatican Drive, BF Resort Village, Las Pi&ntilde;as City, Metro Manila 1747, Philippines
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-4 border-t border-gray-800">
                  <a
                    href="tel:+639190769105"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                  >
                    <i className="fa-solid fa-phone text-[#61A644]" />
                    +63 919 076 9105
                  </a>
                  <a
                    href="mailto:info@getmeds.ph"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                  >
                    <i className="fa-solid fa-envelope text-[#1D9FDA]" />
                    info@getmeds.ph
                  </a>
                  <a
                    href="https://getmeds.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                  >
                    <i className="fa-solid fa-globe text-primary" />
                    getmeds.ph
                  </a>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400 italic">
                  For urgent refund concerns, please call our customer support hotline directly.
                </div>
              </div>
            </section>
              </>
            )}
          </article>
        </div>
      </div>

      {/* Footer */}
      <div id="footer-container" />
    </div>
  );
}
