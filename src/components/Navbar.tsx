'use client';

/**
 * Site navbar — port of getmeds_frontend/public/components/navbar.html (markup, styles and
 * its three inline scripts) and navbar-data.js (live Product Range menu).
 *
 * The original was injected into each page's <div id="navbar-container" class="sticky
 * top-0 z-[50]">; that container is rendered here. Per-page styling that the original
 * keyed off <body data-page> is keyed off #navbar-container[data-nav-page] instead
 * (see chrome.css), computed from the route so the server render is already correct.
 */

import './chrome.css';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { client } from '@/lib/sanity';
import { fetchSiteLogoUrl } from '@/lib/siteSettings';
import {
  loadDynamicMenu,
  type DynamicMenu,
  type MenuItem,
  type MenuSection,
  STATIC_ONCOLOGY_SOLID,
  STATIC_ONCOLOGY_HEMATOLOGY,
  STATIC_ANTI_INFECTIVES,
  STATIC_ENDOCRINOLOGY,
  STATIC_ORTHOPEDIC,
  STATIC_CARDIOLOGY_DESKTOP,
  STATIC_NEURO_ONCOLOGY,
  STATIC_RESPIRATORY,
  STATIC_NEPHROLOGY,
  STATIC_PAIN,
  STATIC_RHEUMATOLOGY,
  STATIC_MOBILE_SECTIONS,
} from '@/components/navbarMenu';

// ── Route helpers ─────────────────────────────────────────────────────────────

const normalize = (p: string) => p.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '') || 'index';

/** The value each original page put on <body data-page="..."> for this route. */
function navPageKey(pathname: string): string {
  const p = pathname.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
  if (!p) return 'home';
  const [seg, ...rest] = p.split('/');
  if (seg === 'blog') return rest.length ? 'blog-detail' : 'blog';
  // product-range and the condition listings were all served by cancer-medicines.html;
  // single products by product-detail.html.
  if (seg === 'product-range' || seg === 'cancer-medicines') return rest.length ? 'product-detail' : 'cancer-medicines';
  return seg;
}

/** Pages the original rendered without navbar.html at all. */
const NO_NAVBAR_ROUTES = new Set(['business-card', 'card', 'coming-soon']);

/** Pages whose navbar mount point had no positioning class (or no container), so it scrolls away. */
const SCROLLING_NAVBAR_ROUTES = new Set([
  'cart', 'account', 'profile', 'sitemap', 'under-development',
  // all served by policy.html, whose container was a bare <div id="navbar-container" />
  'policy', 'policies', 'privacy-policy', 'terms-of-service', 'medical-disclaimer',
  'prescription-policy', 'shipping-and-delivery-policy', 'return-and-refund-policy',
]);

/** The class each original page put on its #navbar-container. */
function navContainerClass(pathname: string): string | undefined {
  const seg = pathname.replace(/^\//, '').split('/')[0].replace(/\.html$/, '');
  if (seg === 'ungc') return 'fixed top-0 left-0 right-0 z-[50]';
  // cancer-medicines.tsx (catalog shell) and product-detail.tsx
  if (seg === 'cancer-medicines' || seg === 'product-range') return 'shrink-0 z-[50]';
  if (SCROLLING_NAVBAR_ROUTES.has(seg)) return undefined;
  // Every other page, including home (where chrome.css then forces it static).
  return 'sticky top-0 z-[50]';
}

// Pages that live under the "Company" dropdown
const COMPANY_PAGES = new Set([
  'services', 'global-presence', 'csr', 'careers',
  'ungc', 'blog', 'blog-detail', 'patient-assistance-program',
]);

// Only top-level nav links get the active colour (navbar.html's topLevelHrefs)
const TOP_LEVEL_HREFS = new Set(['/', '/order-medicines', '/cancer-medicines', '/meditations', '/about-us', '/contact-us']);

// ── Class strings (verbatim from navbar.html) ─────────────────────────────────

const PRODUCT_LINK_CLS =
  "relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300";
const COMPANY_LINK_CLS =
  "relative inline-block text-gray-700 font-semibold hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 text-base";
const MEGA_CLS =
  'fixed top-[80px] left-0 w-full bg-white rounded-b-[30px] border-b border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] max-h-[calc(100vh-80px)] overflow-y-auto';
const MOBILE_TOP_CLS =
  'flex items-center px-3 py-3.5 text-[15px] font-semibold text-gray-700 border-b border-gray-100 hover:text-primary transition';
const MOBILE_ACC_BTN_CLS =
  'w-full flex items-center justify-between px-3 py-3.5 text-[15px] font-semibold text-gray-700 hover:text-primary transition';
const MOBILE_ACC_ICON_CLS = 'fa-solid fa-chevron-down text-[11px] text-gray-400 transition-transform duration-300';
const MOBILE_SUB_CLS = 'block pl-5 py-2.5 text-[14px] font-medium text-gray-600 hover:text-primary transition';
const MOBILE_SECTION_CLS = 'px-3 pt-3 pb-1 text-[12px] font-semibold uppercase text-black tracking-wider';
const GRADIENT = { background: 'linear-gradient(135deg, #61A644, #1D9FDA)' };

// ── Global Network entries ────────────────────────────────────────────────────

const GLOBAL_NETWORK: { href: string; label: string; external?: boolean }[] = [
  { href: '/', label: 'Getmeds Philippines' },
  { href: '/coming-soon?site=getmeds-healthcare', label: 'Getmeds Healthcare' },
  { href: '/coming-soon?site=getmeds-vanuatu', label: 'Getmeds Vanuatu' },
  { href: '/coming-soon?site=getmeds-south-east-asia', label: 'Getmeds South East Asia' },
  { href: '/coming-soon?site=getmeds-latin', label: 'Getmeds Latin' },
  { href: '/coming-soon?site=bishnoi-omniverse-india', label: 'Bishnoi Omniverse India' },
  { href: '/coming-soon?site=bishnoi-omniverse-philippines', label: 'Bishnoi Omniverse Philippines' },
  { href: '/coming-soon?site=naresh-bishnoi-foundation', label: 'Naresh Bishnoi Foundation' },
  { href: '/coming-soon?site=naresh-bishnoi', label: 'Naresh Bishnoi' },
  { href: '/ungc', label: 'UNGC' },
  { href: 'https://2mginc.com/', label: '2MG Incorporated', external: true },
];
// intro + links + map, staggered in that order
const GN_ANIMATED_COUNT = GLOBAL_NETWORK.length + 2;

// ── Company mega-menu slider ──────────────────────────────────────────────────

type Slide = { title: string; href: string; img: string; desc: string };

const DEFAULT_SLIDES: Record<string, Slide> = {
  services: { title: 'Our Services', href: '/services', img: '/assets/services_hero_new.png', desc: 'Getmeds connects globally certified pharmaceutical manufacturers with Filipino patients, doctors, and hospitals — bridging the gap between world-class treatment and local access.' },
  globalPresence: { title: 'Global Presence', href: '/global-presence', img: '/assets/globalpresencehero.jpg', desc: 'Discover seamless healthcare solutions. Access a world-class medical network worldwide, efficiently linking you with top care continuously.' },
  meditations: { title: 'Meditations', href: '/meditations', img: '/assets/categories.png', desc: 'Nurture your mind, body, and soul. Discover clinical mindfulness, guided breathing exercises, and soothing ambient soundscapes designed to support your holistic wellness journey.' },
  csr: { title: 'CSR', href: '/csr', img: '/assets/patienthand.jpg', desc: 'We don\'t just distribute medicine; we facilitate healing. Through NGO partnerships and digital health advocacy, we ensure no patient navigates their journey alone.' },
  careers: { title: 'Careers', href: '/careers', img: '/assets/careershero.png', desc: 'Join our mission to make healthcare accessible worldwide. We\'re looking for passionate individuals to innovate and grow with us.' },
  ungc: { title: 'United Nations Global Compact', href: '/ungc', img: '/assets/ungcimage.jpg', desc: 'At Getmeds Philippines, we do more than provide medicines—we drive meaningful impact through responsible healthcare, compassion, and sustainable action.' },
  blog: { title: 'Blog', href: '/blog', img: '/assets/fallback.jpg', desc: 'Stay updated with our latest news and medical articles.' },
  'join-us': { title: 'Join Us', href: '/careers#join-form', img: '/assets/careershero.png', desc: 'Apply for our open positions and start your journey with us.' },
};

const ROTATION_KEYS = ['services', 'globalPresence', 'meditations', 'csr', 'careers', 'ungc', 'blog', 'join-us'];

const HERO_IMAGE_NAMES: Record<string, string> = {
  services: 'Services Hero Background',
  globalPresence: 'Global Presence Hero Background',
  csr: 'CSR Hero Background',
  careers: 'Careers Hero Background',
  ungc: 'UNGC Hero Background',
  'join-us': 'Careers Hero Background',
  meditations: 'Meditations Categories Image',
};

const SANITY_PROJECT = 's7ocz8zp';
const SANITY_DATASET = 'production';

function getSanityImageUrl(imageRef: unknown): string {
  if (!imageRef) return '';
  if (typeof imageRef === 'string') {
    if (imageRef.startsWith('http') || imageRef.startsWith('/')) return imageRef;
    if (imageRef.startsWith('image-')) {
      const parts = imageRef.substring(6).split('-');
      const ext = parts.pop();
      return `https://cdn.sanity.io/images/${SANITY_PROJECT}/${SANITY_DATASET}/${parts.join('-')}.${ext}`;
    }
  }
  const obj = imageRef as { asset?: { _ref?: string }; _ref?: string };
  const ref = obj?.asset?._ref || obj?._ref;
  if (ref && ref.startsWith('image-')) {
    const parts = ref.substring(6).split('-');
    const ext = parts.pop();
    return `https://cdn.sanity.io/images/${SANITY_PROJECT}/${SANITY_DATASET}/${parts.join('-')}.${ext}`;
  }
  return '';
}

type PageAsset = { name?: string; images?: { image?: unknown }[]; videos?: { thumbnail?: unknown }[] };
type WpPost = {
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  _embedded?: {
    'wp:featuredmedia'?: {
      source_url?: string;
      media_details?: { sizes?: Record<string, { source_url?: string } | undefined> };
    }[];
  };
};

let slidesPromise: Promise<Record<string, Slide>> | null = null;

/** initCompanySlider() steps 1-4: Sanity pageAsset hero images + latest WordPress post. */
function loadCompanySlides(): Promise<Record<string, Slide>> {
  if (slidesPromise) return slidesPromise;
  slidesPromise = (async () => {
    const heroNames = [...new Set(Object.values(HERO_IMAGE_NAMES))];
    const byName: Record<string, PageAsset> = {};
    try {
      const result = await client.fetch<PageAsset[]>(
        '*[_type == "pageAsset" && name in $names] { name, images[]{ image }, videos[]{ thumbnail } }',
        { names: heroNames },
      );
      (result || []).forEach((a) => {
        if (a.name) byName[a.name] = a;
      });
    } catch (e) {
      console.warn('[Getmeds] Failed to fetch Sanity pageAsset hero images:', e);
    }

    let wpPost: WpPost | null = null;
    try {
      const res = await fetch('/wp-json/wp/v2/posts?per_page=1&_embed=true');
      if (res.ok) {
        const posts = (await res.json()) as WpPost[];
        if (posts && posts.length > 0) wpPost = posts[0];
      }
    } catch (e) {
      console.warn('[Getmeds] Failed to fetch latest blog post:', e);
    }

    const slides: Record<string, Slide> = {};
    Object.keys(DEFAULT_SLIDES).forEach((key) => {
      const def = DEFAULT_SLIDES[key];
      let img = def.img;
      let title = def.title;
      let desc = def.desc;

      const sanityAsset = byName[HERO_IMAGE_NAMES[key]];
      const imgRef = sanityAsset?.images?.[0]?.image || sanityAsset?.videos?.[0]?.thumbnail;
      if (imgRef) {
        const resolved = getSanityImageUrl(imgRef);
        if (resolved) img = resolved;
      }

      if (key === 'blog' && wpPost) {
        const media = wpPost._embedded?.['wp:featuredmedia']?.[0];
        const wpImg = media?.source_url
          || media?.media_details?.sizes?.medium_large?.source_url
          || media?.media_details?.sizes?.medium?.source_url
          || media?.media_details?.sizes?.full?.source_url;
        if (wpImg) img = wpImg;
        const wpTitle = wpPost.title?.rendered;
        if (wpTitle) {
          title = wpTitle.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
          if (title.length > 40) title = title.substring(0, 37) + '...';
        }
        const wpExcerpt = wpPost.excerpt?.rendered;
        if (wpExcerpt) {
          desc = wpExcerpt.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
          if (desc.length > 80) desc = desc.substring(0, 77) + '...';
        }
      }

      slides[key] = { title, href: def.href, img, desc };
    });
    return slides;
  })();
  return slidesPromise;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const pageKey = navPageKey(pathname);
  const isHome = pageKey === 'home';
  const normalizedPath = normalize(pathname);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accordion, setAccordion] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState<DynamicMenu | null>(null);
  const [slides, setSlides] = useState<Record<string, Slide> | null>(null);
  const [activeSlide, setActiveSlide] = useState('services');
  const [gnOpen, setGnOpen] = useState(false);
  const [gnIn, setGnIn] = useState(0);
  const [megaSuppressed, setMegaSuppressed] = useState(false);

  const gnTriggerRef = useRef<HTMLButtonElement>(null);
  const gnPanelRef = useRef<HTMLDivElement>(null);
  const gnHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gnStaggerTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rotationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotationIndex = useRef(0);

  // Dynamic logo (components.js fetchAndApplyLogo)
  useEffect(() => {
    fetchSiteLogoUrl().then((url) => {
      if (url) setLogoUrl(url);
    });
  }, []);

  // Live Product Range menu (navbar-data.js)
  useEffect(() => {
    let cancelled = false;
    loadDynamicMenu().then((m) => {
      if (!cancelled && m) setMenu(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Home page: transparent navbar over the hero, solid once scrolled past 80px.
  useEffect(() => {
    if (!isHome) return;
    const handleNavbarScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();
    return () => window.removeEventListener('scroll', handleNavbarScroll);
  }, [isHome]);

  // A new page closes the mobile menu and any open panel (the original reloaded).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setGnOpen(false);
    setGnIn(0);
  }

  // ── Company slider ──
  const stopRotation = useCallback(() => {
    if (rotationTimer.current) {
      clearInterval(rotationTimer.current);
      rotationTimer.current = null;
    }
  }, []);

  const startRotation = useCallback(() => {
    stopRotation();
    rotationTimer.current = setInterval(() => {
      rotationIndex.current = (rotationIndex.current + 1) % ROTATION_KEYS.length;
      setActiveSlide(ROTATION_KEYS[rotationIndex.current]);
    }, 5000);
  }, [stopRotation]);

  useEffect(() => {
    let cancelled = false;
    loadCompanySlides().then((s) => {
      if (cancelled) return;
      setSlides(s);
      setActiveSlide('services');
      startRotation();
    });
    return () => {
      cancelled = true;
      stopRotation();
    };
  }, [startRotation, stopRotation]);

  const slideEnter = (key: string) => {
    if (!slides) return;
    stopRotation();
    setActiveSlide(key);
  };
  const slideLeave = (key: string) => {
    if (!slides) return;
    const rotIdx = ROTATION_KEYS.indexOf(key);
    if (rotIdx !== -1) rotationIndex.current = rotIdx;
    startRotation();
  };

  // ── Global Network panel ──
  const setGn = useCallback((open: boolean) => {
    setGnOpen((prev) => (prev === open ? prev : open));
    // Closing clears the stagger so the next open fades in from the start.
    if (!open) setGnIn(0);
  }, []);

  useEffect(() => {
    gnStaggerTimers.current.forEach(clearTimeout);
    gnStaggerTimers.current = [];
    if (gnOpen) {
      for (let n = 0; n < GN_ANIMATED_COUNT; n++) {
        gnStaggerTimers.current.push(setTimeout(() => setGnIn((c) => Math.max(c, n + 1)), 60 * n));
      }
    }
    return () => {
      gnStaggerTimers.current.forEach(clearTimeout);
      gnStaggerTimers.current = [];
    };
  }, [gnOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (gnPanelRef.current?.contains(t) || gnTriggerRef.current?.contains(t)) return;
      setGn(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gnTriggerRef.current?.getAttribute('aria-expanded') === 'true') {
        setGn(false);
        gnTriggerRef.current.focus();
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [setGn]);

  const gnEnter = () => {
    if (window.innerWidth >= 1024) {
      if (gnHoverTimer.current) clearTimeout(gnHoverTimer.current);
      setGn(true);
    }
  };
  const gnLeave = () => {
    if (window.innerWidth >= 1024) {
      if (gnHoverTimer.current) clearTimeout(gnHoverTimer.current);
      gnHoverTimer.current = setTimeout(() => setGn(false), 150);
    }
  };
  const gnLinkCls = (index: number, extra: string) => `${extra} gn-link${gnIn > index ? ' gn-in' : ''}`;

  // ── Links to the catalog listing reset its selected category (document-wide, as before) ──
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a') as HTMLAnchorElement | null;
      if (!link || !link.pathname) return;
      const p = link.pathname;
      const isNavbarMenuLink = !!link.closest('#navbar-container');
      if (isNavbarMenuLink && (p.startsWith('/cancer-medicines/') || p.startsWith('/product-range/'))) return;
      if (p === '/cancer-medicines' || p === '/cancer-medicines/' || p === '/product-range' || p === '/product-range/') {
        const isBackBtn = (link.textContent || '').toLowerCase().includes('back') || link.closest('.back-button') !== null;
        if (!isBackBtn) {
          localStorage.setItem('selectedCategory', JSON.stringify({ category: 'All', subCategory: 'All' }));
        }
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /** navbar.html's interceptor for this navbar's own condition links. */
  const onProductMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, section: string, item: MenuItem) => {
    const p = e.currentTarget.pathname;
    if (!(p.startsWith('/cancer-medicines/') || p.startsWith('/product-range/'))) return;
    const prefix = p.startsWith('/cancer-medicines/') ? '/cancer-medicines' : '/product-range';
    if (p.split('/').filter(Boolean).length !== 2) return;
    e.preventDefault();
    const subCategory = item.label.replace(/\s+/g, ' ').trim();

    const realPath = menu?.resolve(subCategory);
    if (realPath) {
      router.push(realPath);
      return;
    }

    localStorage.setItem('selectedCategory', JSON.stringify({ category: section, subCategory }));
    if (window.location.pathname === prefix || window.location.pathname === prefix + '/') {
      window.location.reload();
    } else {
      router.push(prefix);
    }
  };

  // ── Active states ──
  const isActive = (href: string) => {
    if (!TOP_LEVEL_HREFS.has(href)) return false;
    const normalizedHref = normalize(href);
    const inSameSection = normalizedHref !== 'index' && normalizedPath.indexOf(normalizedHref + '/') === 0;
    return normalizedHref === normalizedPath || inSameSection;
  };
  const activeCls = (href: string, cls: string) => (isActive(href) ? `${cls} text-primary` : cls);
  const isCompanyPage = COMPANY_PAGES.has(normalizedPath);

  // ── Mobile accordions ──
  const toggleAccordion = (id: string) => setAccordion((a) => ({ ...a, [id]: !a[id] }));
  const iconStyle = (id: string) => (accordion[id] ? { transform: 'rotate(180deg)' } : undefined);
  const closeMobile = () => setMobileOpen(false);

  const mobileSections: MenuSection[] = menu?.mobileSections || STATIC_MOBILE_SECTIONS;
  const productLinkMatches = (href: string) => {
    const h = href.replace(/^\//, '').replace(/\/$/, '');
    return !!h && h === normalizedPath;
  };
  const productMatched = mobileSections.some((sec) => sec.items.some((it) => productLinkMatches(it.href)));

  // getmedsHighlightActiveProductLink: auto-expand the accordion on the matching page.
  const [expandedFor, setExpandedFor] = useState<string | null>(null);
  if (productMatched && expandedFor !== pathname) {
    setExpandedFor(pathname);
    setAccordion((a) => ({ ...a, 'mobile-products': true }));
  }

  const renderProductLi = (section: string, item: MenuItem, key: string) => (
    <li key={key}>
      <Link href={item.href} prefetch={false} className={PRODUCT_LINK_CLS} onClick={(e) => { setMegaSuppressed(true); onProductMenuClick(e, section, item); }}>
        {item.label}
      </Link>
    </li>
  );

  const staticList = (section: string, items: MenuItem[], ulCls: string) => (
    <ul className={ulCls}>{items.map((it, n) => renderProductLi(section, it, `${section}-${n}`))}</ul>
  );

  const isScrolled = isHome && scrolled;
  const megaCls = megaSuppressed ? `${MEGA_CLS} !opacity-0 !invisible` : MEGA_CLS;

  const wrapperCls = [isScrolled ? 'scrolled' : '', gnOpen ? 'gn-open' : ''].filter(Boolean).join(' ') || undefined;

  const firstSegment = pathname.replace(/^\//, '').split('/')[0].replace(/\.html$/, '');
  if (NO_NAVBAR_ROUTES.has(firstSegment)) return null;

  return (
    <div id="navbar-container" className={navContainerClass(pathname)} data-nav-page={pageKey}>
      <div id="global-nav-wrapper" className={wrapperCls}>
        {/* Top Bar (Dark semi-transparent strip) */}
        <div
          id="global-top-bar"
          className={`w-full bg-slate-900/40 border-b border-white/10 backdrop-blur-sm py-2 px-3 sm:py-2.5 sm:px-6${isScrolled ? ' scrolled' : ''}`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white/90 font-medium gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="font-bold text-[9px] sm:text-[11px] uppercase tracking-tight sm:tracking-wider text-white whitespace-nowrap">Connect With Us</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6 shrink-0">
              {/* Phone — Medicine Inquiries */}
              <a href="tel:+639190769103" className="flex items-center space-x-1 sm:space-x-2 hover:text-primary transition text-white whitespace-nowrap">
                <i className="fa-solid fa-phone text-[10px] sm:text-xs"></i>
                <span className="text-[10px] sm:text-xs">+63 919 076 9105</span>
              </a>
              {/* Socials */}
              <div className="flex items-center space-x-2 sm:space-x-4 border-l border-white/20 pl-2 sm:pl-6">
                <a href="https://www.facebook.com/getmedsphilippines/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition text-white">
                  <i className="fa-brands fa-facebook-f text-[11px] sm:text-[14px]"></i>
                </a>
                <a href="https://www.linkedin.com/company/getmeds" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition text-white">
                  <i className="fa-brands fa-linkedin-in text-[11px] sm:text-[14px]"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <nav id="global-nav" className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 relative">
              {/* Logo (Left) */}
              <div className="w-[140px] lg:w-[170px] flex-shrink-0 flex items-center">
                <Link href="/" className={activeCls('/', 'flex items-center')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl || '/assets/getmedslogo.png'} alt="Getmeds Logo" className="h-10 w-auto object-contain" />
                </Link>
              </div>

              {/* Desktop Nav Links (Center) */}
              <div id="global-nav-links" className="hidden lg:flex flex-1 justify-center items-center space-x-6 text-sm font-semibold text-gray-500">
                <Link href="/" className={activeCls('/', 'hover:text-primary transition')}>Home</Link>
                {/* Order Medicines — a plain link, no dropdown. */}
                <Link href="/order-medicines" id="order-medicines-nav-link" className={activeCls('/order-medicines', 'hover:text-primary transition whitespace-nowrap')}>Order Medicines</Link>

                {/* Product Range Dropdown */}
                <div className="group h-20 flex items-center" onMouseLeave={() => setMegaSuppressed(false)}>
                  <Link href="/product-range" className="flex items-center hover:text-primary transition focus:outline-none whitespace-nowrap">
                    Product Range <i className="fa-solid fa-chevron-down ml-1.5 text-[10px]"></i>
                  </Link>
                  {/* Mega Menu Container */}
                  <div className={megaCls}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-medium">
                      <div id="desktop-dropdown-grid" className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                        {menu?.desktopColumns ? (
                          menu.desktopColumns.map((colSections, colIdx) => (
                            <div key={colIdx}>
                              {colSections.map((sec, secIdx) => (
                                <Fragment key={sec.title}>
                                  <h4 className={secIdx > 0 ? 'font-semibold text-gray-900 mb-4 border-b pb-2 text-sm mt-6' : 'font-semibold text-gray-900 mb-4 border-b pb-2 text-sm'}>
                                    {/* The heading opens the whole category; its conditions below narrow it down. */}
                                    {sec.href ? (
                                      <Link href={sec.href} prefetch={false} onClick={() => setMegaSuppressed(true)} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors group/cat">
                                        {sec.title}
                                        <i aria-hidden="true" className="fa-solid fa-arrow-right text-[10px] opacity-0 -translate-x-1 group-hover/cat:opacity-100 group-hover/cat:translate-x-0 transition-all duration-200"></i>
                                      </Link>
                                    ) : sec.title}
                                  </h4>
                                  <ul className={secIdx < colSections.length - 1 ? 'space-y-2 text-[13px] mb-6' : 'space-y-2 text-[13px]'}>
                                    {sec.items.map((it, n) => renderProductLi(sec.title, it, `${sec.title}-${n}`))}
                                  </ul>
                                </Fragment>
                              ))}
                            </div>
                          ))
                        ) : (
                          <>
                            {/* Column 1 */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Oncology (Solid Tumors)</h4>
                              {staticList('Oncology (Solid Tumors)', STATIC_ONCOLOGY_SOLID, 'space-y-2 text-[13px]')}
                            </div>

                            {/* Column 2 */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Oncology / Hematology</h4>
                              {staticList('Oncology / Hematology', STATIC_ONCOLOGY_HEMATOLOGY, 'space-y-2 text-[13px] mb-6')}
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Anti-Infectives</h4>
                              {staticList('Anti-Infectives', STATIC_ANTI_INFECTIVES, 'space-y-2 text-[13px]')}
                            </div>

                            {/* Column 3 */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Endocrinology</h4>
                              {staticList('Endocrinology', STATIC_ENDOCRINOLOGY, 'space-y-2 text-[13px] mb-6')}
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Orthopedic</h4>
                              {staticList('Orthopedic', STATIC_ORTHOPEDIC, 'space-y-2 text-[13px] mb-6')}
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Cardiology</h4>
                              {staticList('Cardiology', STATIC_CARDIOLOGY_DESKTOP, 'space-y-2 text-[13px]')}
                            </div>

                            {/* Column 4 */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Neuro-Oncology</h4>
                              {staticList('Neuro-Oncology', STATIC_NEURO_ONCOLOGY, 'space-y-2 text-[13px] mb-6')}
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Respiratory / Allergy</h4>
                              {staticList('Respiratory / Allergy', STATIC_RESPIRATORY, 'space-y-2 text-[13px] mb-6')}
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Nephrology / Renal</h4>
                              {staticList('Nephrology / Renal', STATIC_NEPHROLOGY, 'space-y-2 text-[13px] mb-6')}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 border-b pb-1 text-sm">Pain Mgt.</h4>
                                  {staticList('Pain Mgt.', STATIC_PAIN, 'space-y-2 text-[13px]')}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 border-b pb-1 text-sm">Rheumatology</h4>
                                  {staticList('Rheumatology', STATIC_RHEUMATOLOGY, 'space-y-2 text-[13px]')}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/about-us" className={activeCls('/about-us', 'hover:text-primary transition whitespace-nowrap')}>About Us</Link>
                <Link id="pap-nav-link" href="/patient-assistance-program" className="opacity-80 hover:opacity-100 transition-all duration-200 hover:-translate-y-0.5 transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img id="pap-nav-logo" src="/assets/pap.png" alt="Patient Assistance Program" />
                </Link>

                {/* Company Dropdown */}
                <div className="group h-20 flex items-center pwa-hide" onMouseLeave={() => setMegaSuppressed(false)}>
                  <button
                    id="company-nav-btn"
                    type="button"
                    className={`flex items-center hover:text-primary transition focus:outline-none whitespace-nowrap${isCompanyPage ? ' text-primary' : ''}`}
                  >
                    Company <i className="fa-solid fa-chevron-down ml-1.5 text-[10px]"></i>
                  </button>
                  {/* Mega Menu Container */}
                  <div className={megaCls} onClickCapture={(e) => { if ((e.target as Element).closest('a')) setMegaSuppressed(true); }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-medium">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
                        {/* Links Section (Cols 1-7) */}
                        <div className="lg:col-span-7 grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm uppercase tracking-wider">Explore by Organization</h4>
                            <ul className="space-y-4">
                              <li><Link href="/services" prefetch={false} className={COMPANY_LINK_CLS}>Our Services</Link></li>
                              <li><Link href="/global-presence" prefetch={false} className={COMPANY_LINK_CLS}>Global Presence</Link></li>
                              <li><Link href="/meditations" prefetch={false} className={activeCls('/meditations', COMPANY_LINK_CLS)}>Meditations</Link></li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm uppercase tracking-wider">More Information</h4>
                            <ul className="space-y-4">
                              <li><Link href="/csr" prefetch={false} className={COMPANY_LINK_CLS}>CSR</Link></li>
                              <li><Link href="/careers" prefetch={false} className={COMPANY_LINK_CLS} onMouseEnter={() => slideEnter('careers')} onMouseLeave={() => slideLeave('careers')}>Careers</Link></li>
                              <li><Link href="/ungc" prefetch={false} className={COMPANY_LINK_CLS}>United Nations Global Compact</Link></li>
                              <li><Link href="/blog" prefetch={false} className={COMPANY_LINK_CLS} onMouseEnter={() => slideEnter('blog')} onMouseLeave={() => slideLeave('blog')}>Blog</Link></li>
                              <li className="pt-2">
                                <Link
                                  href="/careers#join-form"
                                  prefetch={false}
                                  className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-md"
                                  style={GRADIENT}
                                  onMouseEnter={() => slideEnter('join-us')} onMouseLeave={() => slideLeave('join-us')}
                                >
                                  Join Us
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        {/* Slider Section (Cols 8-12) */}
                        <div id="company-mega-menu-slider" className="lg:col-span-5 h-[260px] relative rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                          {slides ? (
                            Object.keys(slides).map((key) => {
                              const s = slides[key];
                              const on = key === activeSlide;
                              return (
                                <Link
                                  key={key}
                                  href={s.href}
                                  prefetch={false}
                                  data-slide-key={key}
                                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 cursor-pointer ${on ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}
                                  style={{ backgroundImage: `url('${s.img}')` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                  <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="text-white font-bold text-xl mb-1">{s.title}</h3>
                                    <p className="text-white/80 text-sm">{s.desc}</p>
                                  </div>
                                </Link>
                              );
                            })
                          ) : (
                            <>
                              <Link href="/about-us" prefetch={false} className="absolute inset-0 bg-cover bg-center company-slide-1 transition-opacity duration-1000 cursor-pointer" style={{ backgroundImage: "url('/assets/about_us_hero.png')" }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                  <h3 className="text-white font-bold text-xl mb-1">About Us</h3>
                                  <p className="text-white/80 text-sm">Learn more about our mission and vision.</p>
                                </div>
                              </Link>
                              <Link href="/global-presence" prefetch={false} className="absolute inset-0 bg-cover bg-center company-slide-2 transition-opacity duration-1000 cursor-pointer" style={{ backgroundImage: "url('/assets/globalpresencehero.jpg')" }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                  <h3 className="text-white font-bold text-xl mb-1">Global Presence</h3>
                                  <p className="text-white/80 text-sm">We are expanding healthcare solutions worldwide.</p>
                                </div>
                              </Link>
                              <Link href="/careers" prefetch={false} className="absolute inset-0 bg-cover bg-center company-slide-3 transition-opacity duration-1000 cursor-pointer" style={{ backgroundImage: "url('/assets/careershero.png')" }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                  <h3 className="text-white font-bold text-xl mb-1">Careers</h3>
                                  <p className="text-white/80 text-sm">Join our team and make a difference.</p>
                                </div>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Link href="/contact-us" className={activeCls('/contact-us', 'hover:text-primary transition whitespace-nowrap')}>Contact Us</Link>
              </div>

              {/* Right side — Global Network dropdown */}
              <div className="w-[140px] lg:w-auto lg:min-w-[170px] flex-shrink-0 flex items-center justify-end space-x-3 lg:space-x-4 text-gray-500">
                <div className="gn-dropdown" id="gn-dropdown" onMouseEnter={gnEnter} onMouseLeave={gnLeave}>
                  <button
                    ref={gnTriggerRef}
                    type="button"
                    id="gn-trigger"
                    className="gn-trigger"
                    aria-haspopup="true"
                    aria-expanded={gnOpen ? 'true' : 'false'}
                    aria-controls="gn-panel"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGn(!gnOpen);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/globalnetworklogo.png" alt="Global Network" className="gn-logo" />
                    <svg className="gn-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={gnOpen ? { transform: 'rotate(180deg)' } : undefined}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                id="mobile-menu-btn"
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                className={`lg:hidden flex items-center text-gray-500 hover:text-primary transition ml-2${mobileOpen ? ' menu-open' : ''}`}
              >
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
            </div>
          </div>

          {/* Mobile Sidebar Menu */}
          <div
            id="mobile-menu"
            className={`fixed top-[80px] left-0 w-full bg-white shadow-xl border-t border-gray-100 z-50 overflow-y-auto${mobileOpen ? ' menu-open' : ''}`}
            style={{ height: 'calc(100vh - 80px)' }}
          >
            <div className="flex flex-col px-4 py-4 pb-12">
              {/* Home */}
              <Link href="/" prefetch={false} onClick={closeMobile} className={activeCls('/', MOBILE_TOP_CLS)}>
                Home
              </Link>

              {/* Order Medicines */}
              <Link href="/order-medicines" prefetch={false} onClick={closeMobile} className={activeCls('/order-medicines', MOBILE_TOP_CLS)}>
                Order Medicines
              </Link>

              {/* Product Range accordion */}
              <div className="border-b border-gray-100">
                <button type="button" onClick={() => toggleAccordion('mobile-products')} className={MOBILE_ACC_BTN_CLS}>
                  <span>Product Range</span>
                  <i id="mobile-products-icon" className={MOBILE_ACC_ICON_CLS} style={iconStyle('mobile-products')}></i>
                </button>
                <div id="mobile-products" className={`${accordion['mobile-products'] ? '' : 'hidden '}px-2 pb-3`}>
                  {mobileSections.map((sec) => (
                    <Fragment key={sec.title}>
                      <p className={MOBILE_SECTION_CLS}>{sec.title}</p>
                      {sec.items.map((it, n) => (
                        <Link
                          key={`${sec.title}-${n}`}
                          href={it.href}
                          prefetch={false}
                          className={`block pl-5 py-2 text-[13px] ${productLinkMatches(it.href) ? 'text-primary' : 'text-gray-600'} hover:text-primary transition`}
                          onClick={(e) => {
                            closeMobile();
                            onProductMenuClick(e, sec.title, it);
                          }}
                        >
                          {it.label}
                        </Link>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>

              {/* About Us */}
              <Link href="/about-us" prefetch={false} onClick={closeMobile} className={activeCls('/about-us', MOBILE_TOP_CLS)}>
                About Us
              </Link>

              {/* Patient Assistance Program */}
              <Link href="/patient-assistance-program" prefetch={false} onClick={closeMobile} className="flex items-center px-3 py-2 border-b border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/pap.png" alt="Patient Assistance Program" className="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" />
              </Link>

              {/* Company accordion */}
              <div className="border-b border-gray-100 pwa-hide">
                <button type="button" onClick={() => toggleAccordion('mobile-company')} className={MOBILE_ACC_BTN_CLS}>
                  <span id="mobile-company-label">Company</span>
                  <i id="mobile-company-icon" className={MOBILE_ACC_ICON_CLS} style={iconStyle('mobile-company')}></i>
                </button>
                <div id="mobile-company" className={`${accordion['mobile-company'] ? '' : 'hidden '}px-2 pb-3 space-y-0.5`}>
                  <Link href="/services" prefetch={false} onClick={closeMobile} className={MOBILE_SUB_CLS}>Our Services</Link>
                  <Link href="/global-presence" prefetch={false} onClick={closeMobile} className={MOBILE_SUB_CLS}>Global Presence</Link>
                  <Link href="/meditations" prefetch={false} onClick={closeMobile} className={activeCls('/meditations', MOBILE_SUB_CLS)}>Meditations</Link>
                  <Link href="/csr" prefetch={false} onClick={closeMobile} className={MOBILE_SUB_CLS}>CSR</Link>
                  <Link href="/careers" prefetch={false} onClick={closeMobile} className={MOBILE_SUB_CLS}>Careers</Link>
                  <Link href="/ungc" prefetch={false} onClick={closeMobile} className={MOBILE_SUB_CLS}>United Nations Global Compact</Link>
                  <Link href="/blog" prefetch={false} onClick={closeMobile} className={MOBILE_SUB_CLS}>Blog</Link>
                  <div className="pl-5 pt-2 pb-1">
                    <Link
                      href="/careers#join-form"
                      prefetch={false}
                      onClick={closeMobile}
                      className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:opacity-80 shadow-md"
                      style={GRADIENT}
                    >
                      Join Us
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact Us */}
              <Link href="/contact-us" prefetch={false} onClick={closeMobile} className={activeCls('/contact-us', MOBILE_TOP_CLS)}>
                Contact Us
              </Link>

              {/* Global Network accordion — the desktop trigger is hidden below lg */}
              <div className="border-b border-gray-100 pwa-hide">
                <button type="button" onClick={() => toggleAccordion('mobile-global-network')} className={MOBILE_ACC_BTN_CLS}>
                  <span>Global Network</span>
                  <i id="mobile-global-network-icon" className={MOBILE_ACC_ICON_CLS} style={iconStyle('mobile-global-network')}></i>
                </button>
                <div id="mobile-global-network" className={`${accordion['mobile-global-network'] ? '' : 'hidden '}px-2 pb-3 space-y-0.5`}>
                  {GLOBAL_NETWORK.map((g) =>
                    g.external ? (
                      <a key={g.href} href={g.href} target="_blank" rel="noopener" onClick={closeMobile} className={MOBILE_SUB_CLS}>{g.label}</a>
                    ) : (
                      <Link key={g.href} href={g.href} prefetch={false} onClick={closeMobile} className={activeCls(g.href, MOBILE_SUB_CLS)}>{g.label}</Link>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Global Network mega panel */}
          <div
            id="gn-panel"
            ref={gnPanelRef}
            className={`gn-panel${gnOpen ? ' is-open' : ''}`}
            onMouseEnter={gnEnter}
            onMouseLeave={gnLeave}
          >
            <div className="gn-panel-inner">
              <div className="gn-panel-grid">
                <div className={gnLinkCls(0, 'gn-col-intro')}>
                  <h3 className="gn-title">Global Network</h3>
                  <p className="gn-desc">Getmeds Philippines&rsquo; growing footprint across the world &mdash; connect with any of our regional sites and trusted partners.</p>
                </div>

                <div className="gn-col-links">
                  {GLOBAL_NETWORK.map((g, n) =>
                    g.external ? (
                      <a key={g.href} className={gnLinkCls(n + 1, 'gn-item')} href={g.href} target="_blank" rel="noopener">{g.label}</a>
                    ) : (
                      <Link key={g.href} className={gnLinkCls(n + 1, activeCls(g.href, 'gn-item'))} href={g.href} prefetch={false} onClick={() => setGn(false)}>{g.label}</Link>
                    ),
                  )}
                </div>

                <div className={gnLinkCls(GLOBAL_NETWORK.length + 1, 'gn-col-map')} aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/countries.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
