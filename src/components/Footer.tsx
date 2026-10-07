'use client';

/**
 * Site footer — port of getmeds_frontend/public/components/footer.html plus the footer
 * logic in components.js (fetchAndApplyFooterSettings: logo, contact list, copyright,
 * and the Sanity-driven legal/policies row).
 *
 * Footer also renders, once per page, everything else footer.html / components.js put
 * on every page: the footer modals (FooterModals), the cookie consent manager and the
 * dynamic logo (ChromeExtras). The Tawk chat, chat links and scroll-to-top button are
 * FloatingContactButtons, mounted by the root layout.
 * Pages that render a second <Footer /> (the catalog renders one inside its scroll
 * column) share that single instance; only one Footer at a time mounts them.
 */

import './chrome.css';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FooterModals, { openDynamicPolicyModal } from '@/components/FooterModals';
import ChromeExtras from '@/components/ChromeExtras';
import { sizedSanityUrl } from '@/lib/sanity';
import { fetchPolicies, fetchSiteSettings, type ContactGroup, type PolicyDoc, type SiteSettings } from '@/lib/siteSettings';

// ── Single owner for the page-wide pieces ─────────────────────────────────────

const claimants: symbol[] = [];
const listeners = new Set<() => void>();

function useChromeOwner(): boolean {
  const [id] = useState(() => Symbol('footer'));
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    claimants.push(id);
    const update = () => setIsOwner(claimants[0] === id);
    listeners.add(update);
    listeners.forEach((l) => l());
    return () => {
      const idx = claimants.indexOf(id);
      if (idx >= 0) claimants.splice(idx, 1);
      listeners.delete(update);
      listeners.forEach((l) => l());
    };
  }, [id]);
  return isOwner;
}

// ── Helpers ported from components.js ─────────────────────────────────────────

const SANITY_PROJECT = 's7ocz8zp';
const SANITY_DATASET = 'production';

function normalizeToArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') return [val];
  return [];
}

const normalizePath = (p: string) => p.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '') || 'index';

type ContactItem = { kind: 'address' | 'phone' | 'email'; value: string };

function buildContactItems(settings: SiteSettings): ContactItem[] {
  let footerGroups: ContactGroup[] = [];
  if (settings.contactGroups && Array.isArray(settings.contactGroups) && settings.contactGroups.length > 0) {
    footerGroups = settings.contactGroups.filter((g) => g.showInFooter);
    if (footerGroups.length === 0) footerGroups = [settings.contactGroups[0]];
  }

  const items: ContactItem[] = [];
  const push = (addrs: string[], phones: string[], emails: string[]) => {
    addrs.forEach((value) => items.push({ kind: 'address', value }));
    phones.forEach((value) => items.push({ kind: 'phone', value }));
    emails.forEach((value) => items.push({ kind: 'email', value }));
  };

  if (footerGroups.length > 0) {
    footerGroups.forEach((group) => {
      const addrs = normalizeToArray(group?.addresses);
      const phones = normalizeToArray(group?.phones);
      const emails = normalizeToArray(group?.emails);
      if (addrs.length === 0 && phones.length === 0 && emails.length === 0) return;
      push(addrs, phones, emails);
    });
  } else {
    push(
      normalizeToArray(settings.contactInfo?.address),
      normalizeToArray(settings.contactInfo?.phone),
      normalizeToArray(settings.contactInfo?.email),
    );
  }
  return items;
}

function footerLogoFromSettings(settings: SiteSettings): { src?: string; alt?: string } {
  const out: { src?: string; alt?: string } = {};
  const ref = settings.logo?.src?.asset?._ref;
  if (ref) {
    const parts = ref.split('-');
    if (parts.length >= 4) {
      out.src = `https://cdn.sanity.io/images/${SANITY_PROJECT}/${SANITY_DATASET}/${parts[1]}-${parts[2]}.${parts[3]}`;
    }
    if (settings.logo?.alt) out.alt = settings.logo.alt;
  }
  return out;
}

const DEFAULT_POLICIES = [
  { label: 'Privacy Policy', slug: 'privacy-policy' },
  { label: 'Terms of Service', slug: 'terms-of-service' },
  { label: 'Medical Disclaimer', slug: 'medical-disclaimer' },
  { label: 'Prescription Policy', slug: 'prescription-policy' },
  { label: 'Shipping & Delivery Policy', slug: 'shipping-and-delivery-policy' },
  { label: 'Return & Refund Policy', slug: 'return-and-refund-policy' },
  // Not a policy, but it lives in this row. It has no policiesDisclaimers doc, so it
  // always renders as a plain link to the HTML sitemap page.
  { label: 'Sitemap', slug: 'sitemap' },
];

type LegalEntry = { label: string; slug: string; item?: PolicyDoc };

/** Pages the original rendered without footer.html. */
const NO_FOOTER_ROUTES = new Set(['business-card', 'card', 'chat', 'search', 'coming-soon', 'edit-profile', 'locations']);
/** Pages that did not load components.js at all (no consent banner, chat or scroll button). */
const NO_COMPONENTS_ROUTES = new Set(['coming-soon']);

const subscribeNever = () => () => {};
const currentYear = () => String(new Date().getFullYear());
const emptyYear = () => '';

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer() {
  const pathname = usePathname() || '/';
  const isOwner = useChromeOwner();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [legal, setLegal] = useState<LegalEntry[] | null>(null);
  // Empty on the server, the current year once hydrated (footer.html filled it by script).
  const year = useSyncExternalStore(subscribeNever, currentYear, emptyYear);

  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings().then((s) => {
      if (cancelled || !s) return;
      setSettings(s);
      fetchPolicies().then((policies) => {
        if (cancelled) return;
        const policyMap: Record<string, PolicyDoc> = {};
        if (Array.isArray(policies)) {
          policies.forEach((p) => {
            if (p && p.slug) policyMap[p.slug] = p;
          });
        }
        setLegal(DEFAULT_POLICIES.map(({ label, slug }) => ({ label, slug, item: policyMap[slug] })));
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPath = normalizePath(pathname);
  const linkCls = (href: string, base = 'footer-link') =>
    normalizePath(href) === currentPath ? `${base} active` : base;

  const contactItems = settings ? buildContactItems(settings) : [];
  const logo = settings ? footerLogoFromSettings(settings) : {};

  let copyright: string | null = null;
  if (settings && year) {
    copyright = settings.copyright
      ? settings.copyright.replace(/\b\d{4}\b/, year)
      : `© ${year} Getmeds Philippines, Inc. All rights reserved.`;
  }

  const staticLegalCls = 'footer-link text-gray-400 hover:!text-white text-xs p-0';

  const firstSegment = pathname.replace(/^\//, '').split('/')[0].replace(/\.html$/, '');
  const showFooter = !NO_FOOTER_ROUTES.has(firstSegment);
  const showComponents = !NO_COMPONENTS_ROUTES.has(firstSegment);

  const singletons = isOwner && (showFooter || showComponents)
    ? createPortal(
        <>
          {showFooter && <FooterModals />}
          {showComponents && <ChromeExtras />}
        </>,
        document.body,
      )
    : null;

  if (!showFooter) return singletons;

  return (
    <>
      <footer id="site-footer" className="bg-[#1A1D2B] text-gray-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">

            {/* Branding */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="footer-logo"
                  src={logo.src ? sizedSanityUrl(logo.src, { h: 128 }) : '/assets/getmedslogo.webp'}
                  width={57}
                  height={32}
                  alt={logo.alt || 'Getmeds Logo'}
                  className="h-8 w-auto object-contain brightness-0 invert opacity-90"
                />
              </div>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Getmeds is a pharmaceutical company in the Philippines specializing in oncology, hematology, anesthesia, rare diseases, and essential medicines. FDA Philippines licensed. UN Global Compact member.
              </p>
              <div id="footer-socials" className="flex items-center space-x-4 flex-wrap gap-y-2">
                <a href="https://www.facebook.com/getmedsphilippines/" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Getmeds on Facebook" className="text-[#1877F2] hover:scale-110 transition-transform duration-300 text-[22px]"><i className="fa-brands fa-facebook"></i></a>
                <a href="https://twitter.com/getmeds_ph" target="_blank" rel="noopener noreferrer" title="Twitter" className="text-[#1DA1F2] hover:scale-110 transition-transform duration-300 text-[22px]"><i className="fa-brands fa-twitter"></i></a>
                <a href="https://www.linkedin.com/company/getmeds" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="Getmeds on LinkedIn" className="text-[#0A66C2] hover:scale-110 transition-transform duration-300 text-[22px]"><i className="fa-brands fa-linkedin"></i></a>
                <a href="https://www.tiktok.com/@getmedsph" target="_blank" rel="noopener noreferrer" title="TikTok" className="text-white hover:scale-110 transition-transform duration-300 text-[22px]"><i className="fa-brands fa-tiktok"></i></a>
                <a href="https://www.instagram.com/getmeds_ph/" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-[#E1306C] hover:scale-110 transition-transform duration-300 text-[22px]"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://www.youtube.com/@getmedsph" target="_blank" rel="noopener noreferrer" title="YouTube" className="text-[#FF0000] hover:scale-110 transition-transform duration-300 text-[22px]"><i className="fa-brands fa-youtube"></i></a>
              </div>
            </div>

            {/* Main Menu */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-base">Main Menu</h4>
              <ul className="footer-nav-grid">
                <li><Link href="/" className={linkCls('/')}>Home</Link></li>
                <li><Link href="/product-range" className={linkCls('/product-range')}>Product Range</Link></li>
                <li><Link href="/about-us" className={linkCls('/about-us')}>About Us</Link></li>
                <li><Link href="/contact-us" className={linkCls('/contact-us')}>Contact Us</Link></li>
                <li><Link href="/services" className={linkCls('/services')}>Our Services</Link></li>
                <li><Link href="/blog" className={linkCls('/blog')}>Blog</Link></li>
              </ul>
            </div>

            {/* Product Range Categories */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-base">Product Range</h4>
              <ul className="footer-nav-grid">
                <li><Link href="/cancer-medicines.html?category=breast-cancer" className={linkCls('/cancer-medicines.html?category=breast-cancer')}>Oncology</Link></li>
                <li><Link href="/blood-disorder-medicines" className={linkCls('/blood-disorder-medicines')}>Hematology</Link></li>
                <li><Link href="/product-range.html?category=respiratory" className={linkCls('/product-range.html?category=respiratory')}>Anti-Infectives</Link></li>
                <li><Link href="/product-range.html?category=endometriosis" className={linkCls('/product-range.html?category=endometriosis')}>Endocrinology</Link></li>
                <li><Link href="/bone-health-medicines" className={linkCls('/bone-health-medicines')}>Orthopedic</Link></li>
                <li><Link href="/product-range.html?category=arrhythmia" className={linkCls('/product-range.html?category=arrhythmia')}>Cardiology</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-base">Contact</h4>
              <ul id="footer-contact-list" className="space-y-4 text-sm">
                {contactItems.length > 0 ? (
                  contactItems.map((c, idx) => {
                    if (c.kind === 'address') {
                      return (
                        <li key={idx} className="flex items-start space-x-3">
                          <i className="fa-solid fa-location-dot mt-1 text-primary shrink-0"></i>
                          <span>{c.value}</span>
                        </li>
                      );
                    }
                    if (c.kind === 'phone') {
                      return (
                        <li key={idx} className="flex items-center space-x-3">
                          <i className="fa-solid fa-phone text-primary shrink-0"></i>
                          <a href={`tel:${c.value.replace(/[^+\d]/g, '')}`} className="hover:text-primary transition">{c.value}</a>
                        </li>
                      );
                    }
                    return (
                      <li key={idx} className="flex items-center space-x-3">
                        <i className="fa-solid fa-envelope text-primary shrink-0"></i>
                        <a href={`mailto:${c.value}`} className="hover:text-primary transition">{c.value}</a>
                      </li>
                    );
                  })
                ) : (
                  <>
                    <li className="flex items-start space-x-3">
                      <i className="fa-solid fa-location-dot mt-1 text-primary shrink-0"></i>
                      <span id="footer-address">Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Las Piñas City, Metro Manila 1747</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <i className="fa-solid fa-phone text-primary shrink-0"></i>
                      <a id="footer-phone" href="tel:+639190769105" className="footer-link">+63 919 076 9105</a>
                    </li>
                    <li className="flex items-center space-x-3">
                      <i className="fa-solid fa-envelope text-primary shrink-0"></i>
                      <a id="footer-email" href="mailto:info@getmeds.ph" className="footer-link">info@getmeds.ph</a>
                    </li>
                  </>
                )}
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <p id="footer-copyright">
              {copyright !== null ? copyright : <>&copy; <span id="footer-year">{year}</span> Getmeds Philippines, Inc. All rights reserved.</>}
            </p>
            <div id="footer-legal-links" className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 md:mt-0">
              {legal ? (
                legal.map(({ label, slug, item }) => {
                  const displayMode = item && item.displayMode ? item.displayMode : 'dedicatedPage';
                  const text = item?.title || label;
                  if (displayMode === 'modal') {
                    return (
                      <button
                        key={slug}
                        type="button"
                        className="footer-link text-gray-400 hover:text-white bg-transparent border-none cursor-pointer text-xs p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          openDynamicPolicyModal(text, item?.contentHtml || '<p>No content available.</p>');
                        }}
                      >
                        {text}
                      </button>
                    );
                  }
                  return (
                    <Link key={slug} href={`/${slug}`} className="footer-link text-gray-400 hover:text-white text-xs p-0">
                      {text}
                    </Link>
                  );
                })
              ) : (
                <>
                  <Link href="/privacy-policy" id="open-privacy-policy-btn" className={linkCls('/privacy-policy', staticLegalCls)}>
                    Privacy Policy
                  </Link>
                  <Link href="/terms-of-service" id="open-terms-of-service-btn" className={linkCls('/terms-of-service', staticLegalCls)}>
                    Terms of Service
                  </Link>
                  <Link href="/medical-disclaimer" id="open-medical-disclaimer-btn" className={linkCls('/medical-disclaimer', staticLegalCls)}>
                    Medical Disclaimer
                  </Link>
                  <Link href="/prescription-policy" id="open-prescription-policy-btn" className={linkCls('/prescription-policy', staticLegalCls)}>
                    Prescription Policy
                  </Link>
                  <Link href="/shipping-and-delivery-policy" id="open-shipping-delivery-policy-btn" className={linkCls('/shipping-and-delivery-policy', staticLegalCls)}>
                    Shipping &amp; Delivery Policy
                  </Link>
                  <Link href="/return-and-refund-policy" id="open-return-refund-policy-btn" className={linkCls('/return-and-refund-policy', staticLegalCls)}>
                    Return &amp; Refund Policy
                  </Link>
                  {/* Opens the cookie preferences (analytics consent manager). */}
                  <a href="#cookie-settings" data-gm-cookie-settings className={staticLegalCls}>
                    Cookie Settings
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {singletons}
    </>
  );
}
