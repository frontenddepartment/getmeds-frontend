import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useHeroSlides, useImageMapper, useNews, useSiteSettings, useCategories, useFeaturedNews } from '../lib/useSanity';
import { setPageMeta } from '../lib/seo';
import { getApiUrl } from '../lib/api';
import { injectHTML } from '../lib/injectHTML';
import { urlFor } from '../lib/sanity';
import { sanityQuery } from '../lib/sanityProxy';
import { LinkableImage } from '../lib/LinkableImage';
import { computeCategoryKey, linkCategoryKeys } from '../lib/categoryImageKey';


// Declare global tailwind interface
declare global {
  interface Window {
    tailwind?: any;
  }
}

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo function for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, hasAnimated]);

  return <span ref={counterRef}>{count.toLocaleString()}{suffix}</span>;
};

const slugify = (text: string | undefined | null) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export default function GetMedsHomepage() {
  useEffect(() => {
    setPageMeta({
      title: 'Getmeds',
      description: 'Pharmaceutical company in the Philippines specializing in oncology, hematology, anesthesia, rare diseases, and essential medicines. FDA Philippines licensed. UN Global Compact member.',
      path: '/',
    });
  }, []);

  // Redirect preview requests to the blog detail page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const previewId = params.get('preview_id') || params.get('p');
    if (previewId) {
      window.location.replace(`/blog-detail${window.location.search}`);
    }
  }, []);

  const { getImage, getImageLink, getCategoryImage, categoryImages, categoryImagesLoading } = useImageMapper('home');
  const { data: newsItems } = useNews();
  const { data: featuredNews } = useFeaturedNews();
  const { data: settings } = useSiteSettings();

  const homeNewsItems = useMemo(() => {
    const featured = featuredNews || [];
    const latest = newsItems || [];

    const merged = [...featured];
    const featuredIds = new Set(featured.map(item => item._id));

    for (const item of latest) {
      if (merged.length >= 3) break;
      if (!featuredIds.has(item._id)) {
        merged.push(item);
      }
    }
    return merged;
  }, [featuredNews, newsItems]);

  const { data: heroSlidesData } = useHeroSlides();
  // Same subcategory data already used for the sidebar flyout on the product-range/cancer-medicines
  // pages (getCategories() aggregates each Excel product's condition/subCategory names under its
  // Product Range category) — reused here rather than inventing a separate data source.
  const { data: excelCategories } = useCategories();
  const newsSliderRef = useRef<HTMLDivElement>(null);
  const [activeNewsSlide, setActiveNewsSlide] = useState(0);

  const handleNewsScroll = () => {
    const el = newsSliderRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    let closest = 0;
    let minDist = Infinity;
    const elCenter = el.getBoundingClientRect().left + el.offsetWidth / 2;
    children.forEach((child, i) => {
      const childCenter = child.getBoundingClientRect().left + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - elCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveNewsSlide(closest);
  };

  const scrollToNewsSlide = (idx: number) => {
    const el = newsSliderRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement;
    if (child) {
      el.scrollTo({ left: child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2, behavior: 'smooth' });
    }
  };

  // Reference data (marquee condition text + routing link) for the therapeutic areas this
  // site knows how to describe — keyed by category name. There's no Sanity field for this text
  // yet, so it's still hardcoded here; which of these actually show on the home page, and in
  // what order, is driven entirely by the Products document's "Category Featured" Studio tab
  // (see therapCards below) — a category dragged/added there that isn't in this list still
  // shows (with its own label/image), just without marquee text or a dedicated link.
  const therapCardsBase = useMemo(() => [
    { name: "Oncology", fallback: "assets/therapeuticareaoncology.png", marquee: "Breast Cancer • Ovarian Cancer • Non-Small Cell Lung Cancer • Prostate Cancer • Colorectal Cancer • Pancreatic Cancer • ", link: "/cancer-medicines/oncology" },
    { name: "Hematology", fallback: "assets/therapeuticareahematology.png", marquee: "Acute Myeloid Leukemia • Chronic Myeloid Leukemia • Hodgkin/Non-Hodgkin's Lymphoma • Sickle Cell Anemia • ", link: "/cancer-medicines/hematology" },
    { name: "Anti-Infectives", fallback: "assets/therapeuticareaantiinfectives.jpg", marquee: "Respiratory Infections • Urinary Tract Infections • Skin and Soft Tissue Infections • Bone and Joint Infections • ", link: "/cancer-medicines/anti-infectives" },
    { name: "Endocrinology", fallback: "assets/therapeuticareaendocrinology.jpg", marquee: "Endometriosis • Fibrocystic Breast Disease • Diabetes Management • Thyroid Disorders • Metabolic Syndrome • ", link: "/cancer-medicines/endocrinology" },
    { name: "Orthopedic", fallback: "assets/orthopedic.jpg", marquee: "Multiple Myeloma • Osteoporosis • Joint Replacement Support • Fracture Recovery • Bone Metastases • ", link: "/cancer-medicines/orthopedic" },
    { name: "Cardiology", fallback: "assets/therapeuticareacardiology.png", marquee: "Arrhythmia Management • Hypertension/Angina • Heart Failure • Atrial Fibrillation • Coronary Artery Disease • ", link: "/cancer-medicines/cardiology" },
    { name: "Radiology", fallback: "assets/radiology.jpg", marquee: "Contrast Media • Diagnostic Imaging • CT & MRI Contrast Agents • Nuclear Medicine • Radiopharmaceuticals • ", link: "/cancer-medicines/radiology" },
    { name: "Rheumatology", fallback: "assets/rheumatology.jpg", marquee: "Rheumatoid Arthritis • Osteoarthritis • Lupus • Gout • Ankylosing Spondylitis • ", link: "/cancer-medicines/rheumatology" },
    { name: "Pain Management", fallback: "assets/pain-management.jpg", marquee: "Chronic Pain • Post-Surgical Pain • Neuropathic Pain • Analgesics • Anesthesia Support • ", link: "/cancer-medicines/pain-management" },
    { name: "Nephrology / Renal", fallback: "assets/nephrology-renal.jpg", marquee: "Chronic Kidney Disease • Dialysis Support • Renal Anemia • Electrolyte Management • Nephrotic Syndrome • ", link: "/cancer-medicines/nephrology-renal" },
    { name: "Respiratory", fallback: "assets/respiratory.jpg", marquee: "Seasonal Allergic Rhinitis • Asthma • COPD • Bronchitis • Pulmonary Hypertension • Chronic Kidney Disease • ", link: "/cancer-medicines/respiratory" },
    { name: "Neurology", fallback: "assets/therapeuticareaneurology.png", marquee: "Glioblastoma Multiforme • Chronic Pain • Inflammatory Disorders • Osteoporosis • Multiple Myeloma • Neuro-Oncology • ", link: "/cancer-medicines/neuro-oncology" },
  ], []);

  const therapBaseByKey = useMemo(() => {
    const map = new Map<string, typeof therapCardsBase[number]>();
    therapCardsBase.forEach((card) => map.set(computeCategoryKey(card.name), card));
    return map;
  }, [therapCardsBase]);

  // Real (non-fabricated) subcategory names per Product Range category — the same aggregation
  // getCategories() already builds for the cancer-medicines sidebar flyout, keyed here by every
  // individual category name a multi-category Excel cell splits into (so it lines up with how
  // "Category Featured" keys — and merged cards — are derived; see categoryImageKey.ts).
  const subcategoriesByKey = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (excelCategories || []).forEach((cat) => {
      String(cat.category || '')
        .split(/[\/,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((name) => {
          const key = computeCategoryKey(name);
          if (!key) return;
          const set = map.get(key) || new Set<string>();
          (cat.subcategory || []).forEach((sub) => set.add(sub));
          map.set(key, set);
        });
    });
    return map;
  }, [excelCategories]);

  const subcategoriesForKeys = (keys: string[]): string[] =>
    Array.from(new Set(keys.flatMap((k) => Array.from(subcategoriesByKey.get(k) || []))));

  const therapCards = useMemo(() => {
    // Still waiting on the Studio's "Category Featured" list — render nothing rather than the
    // hardcoded default set: showing the static images first and then swapping to the real
    // featured ones a moment later is exactly the flash/twitch this was causing.
    if (categoryImagesLoading) return [];

    // The fetch finished and nothing has ever been featured yet — fall back to the full
    // default set so the section isn't permanently empty. This only renders once data has
    // settled, so it doesn't flicker the way showing it during loading did.
    if (!categoryImages || categoryImages.length === 0) {
      return therapCardsBase.map((card) => ({
        ...card,
        // Fall back straight to the bundled local asset — not through getImage()'s old
        // pageAsset lookup, which resolves independently of categoryImages and can (based on
        // which of the two async fetches happens to land first) hand back one of the old,
        // orphaned "Home Page Assets" pageAsset docs' broken Sanity URLs instead of a real
        // image, causing the card to intermittently show the no-image placeholder on reload.
        img: getCategoryImage(card.name, card.fallback),
        subcategories: subcategoriesForKeys([computeCategoryKey(card.name)]),
      }));
    }

    // Otherwise, show exactly what's featured, in the order set there (drag-and-drop in the
    // Studio) — a category removed from Featured disappears from the home page, not just
    // falls to the end. A card can merge 2+ categories (linkCategoryKeys), shown as "Category 1
    // / Category 2" via categoryLabel, with subcategories pooled from every merged category.
    const sorted = [...categoryImages].sort(
      (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
    );
    return sorted.map((entry) => {
      const keys = linkCategoryKeys(entry);
      const base = keys.length === 1 ? therapBaseByKey.get(keys[0]) : undefined;
      const fallback = base?.fallback || "assets/therapeuticareaoncology.png";
      const primaryKey = keys[0] || '';
      return {
        name: entry.categoryLabel || base?.name || primaryKey,
        marquee: base?.marquee || "",
        link: base?.link || `/cancer-medicines/${primaryKey}`,
        fallback,
        img: getCategoryImage(primaryKey, fallback),
        subcategories: subcategoriesForKeys(keys),
      };
    });
  }, [categoryImages, categoryImagesLoading, therapCardsBase, therapBaseByKey, getCategoryImage, subcategoriesByKey]);


  // --- Hero Slider ---
  const fallbackHeroSlides = [
    {
      bg: 'assets/imagebanner.jpg',
      heading: 'Life-Saving Access.\nRedefining Healthcare Possibilities.',
      sub: 'Getmeds is a global pharmaceutical company advancing healthcare access in the Philippines through high-quality medicines from essential therapies to advanced hospital treatments.',
      link: null as string | null,
    },
    {
      bg: 'assets/homebanner.png',
      heading: 'Advanced Cancer Medicines.\nHope Delivered to Every Patient.',
      sub: 'From oncology to hematology, we bring world-class cancer treatments directly to Filipino patients and healthcare institutions nationwide.',
      link: null as string | null,
    },
    {
      bg: 'assets/homebanner3.png',
      heading: 'Compassionate Care.\nA Global Reach,\nA Local Heart.',
      sub: 'With a presence across multiple countries, Getmeds connects global pharmaceutical innovation with the communities that need it most.',
      link: null as string | null,
    },
  ];

  // Build slides from Sanity pageAsset docs (Home Hero Background images); fall back to hardcoded if none
  const heroSlides = (heroSlidesData && heroSlidesData.length > 0)
    ? heroSlidesData.slice(0, 5).map((s, idx) => {
      const fallback = fallbackHeroSlides[idx % fallbackHeroSlides.length];
      return {
        bg: s.image ? urlFor(s.image).url() : fallback.bg,
        heading: s.altText || fallback.heading,
        sub: fallback.sub,
        link: s.enableLink && s.link ? s.link as string : null,
      };
    })
    : fallbackHeroSlides;
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFading, setHeroFading] = useState(false);
  const heroTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToHeroSlide = (idx: number) => {
    if (idx === heroIndex) return;
    setHeroFading(true);
    setTimeout(() => {
      setHeroIndex(idx);
      setHeroFading(false);
    }, 400);
  };

  useEffect(() => {
    heroTimerRef.current = setTimeout(() => {
      goToHeroSlide((heroIndex + 1) % heroSlides.length);
    }, 6000);
    return () => { if (heroTimerRef.current) clearTimeout(heroTimerRef.current); };
  }, [heroIndex]);



  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [partnershipData, setPartnershipData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    consent: false
  });
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnershipData.name || !partnershipData.company || !partnershipData.email || !partnershipData.phone || !partnershipData.message) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!partnershipData.consent) {
      alert('Please consent to processing your information.');
      return;
    }
    setSubmitState('sending');
    try {
      const payload = {
        inquiryType: 'Partnership',
        fullName: partnershipData.name,
        email: partnershipData.email,
        phone: partnershipData.phone,
        subject: partnershipData.company,
        message: partnershipData.message,
        files: []
      };

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Partnership submission failed.');
      }

      setSubmitState('sent');
      setPartnershipData({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        consent: false
      });
      setIsInquiryOpen(false);
      setSuccessModalOpen(true);
      setSubmitState('idle');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  const [therapPage, setTherapPage] = useState(0);
  const [therapMobileActive, setTherapMobileActive] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  // Therapeutic Areas mobile slider — auto-advance every 5s (12 cards)
  useEffect(() => {
    const timer = setInterval(() => {
      setTherapMobileActive(prev => (prev + 1) % 12);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 1. Inject Fonts
    if (!document.getElementById('google-fonts-home')) {
      const link = document.createElement('link');
      link.id = 'google-fonts-home';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // 2. Inject FontAwesome
    if (!document.getElementById('font-awesome-home')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-home';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // 3. Inject Tailwind CDN
    if (!window.tailwind && !document.getElementById('tailwind-cdn-home')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn-home';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => {
        if (window.tailwind) {
          window.tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#1D9FDA',
                  accent: '#6BB84A',
                  dark: '#1A202C',
                },
                fontFamily: {
                  sans: ['Poppins', 'Inter', 'sans-serif'],
                }
              }
            }
          };
        }
      };
      document.head.appendChild(script);
    } else if (window.tailwind) {
      window.tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#1D9FDA',
              accent: '#6BB84A',
              dark: '#1A202C',
            },
            fontFamily: {
              sans: ['Poppins', 'Inter', 'sans-serif'],
            }
          }
        }
      };
    }

    // 4. Scroll listener for sticky transparent header transition
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // 5. Intersection Observer for Scroll Reveals
    const revealOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // 5b. Intersection Observer for scroll-triggered ca-anim animations
    const caObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ca-in');
            caObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const observeCaAnim = (el: Element) => {
      if (!el.classList.contains('ca-in')) caObserver.observe(el);
    };
    document.querySelectorAll('.ca-anim').forEach(observeCaAnim);

    // A one-time querySelectorAll only catches elements already in the DOM at mount. Anything
    // that gains the ca-anim class later never gets picked up otherwise — e.g. the Therapeutic
    // Areas header, which is gated behind the "Category Featured" data still loading: React
    // reconciles the loading-skeleton's plain <h2> and the loaded real <h2> as the same DOM node
    // (same tag, same position) and just patches its className, rather than replacing the node —
    // so this needs to watch attribute changes, not just newly-inserted nodes (childList alone
    // misses it, since no new node is ever inserted for this case).
    const caMutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.target instanceof Element && mutation.target.matches('.ca-anim')) {
            observeCaAnim(mutation.target);
          }
          return;
        }
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('.ca-anim')) observeCaAnim(node);
          node.querySelectorAll?.('.ca-anim').forEach(observeCaAnim);
        });
      });
    });
    caMutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    // 6. Dynamically load the navbar and footer components
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then(res => res.text())
        .then(html => { injectHTML(navContainer, html); });
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then(res => res.text())
        .then(html => { injectHTML(footerContainer, html); });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealElements.forEach(el => observer.unobserve(el));
      caObserver.disconnect();
      caMutationObserver.disconnect();
    };
  }, []);




  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        body { font-family: 'Inter', sans-serif; }
        @keyframes caFadeUp   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes caFadeLeft { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
        @keyframes caFadeRight{ from { opacity:0; transform:translateX(32px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes caZoomIn   { from { opacity:0; transform:scale(0.93);       } to { opacity:1; transform:scale(1);    } }
        @keyframes caFadeIn   { from { opacity:0; }                              to { opacity:1; }                        }
        .ca-anim { opacity: 0; }
        .ca-anim.ca-in.ca-up    { animation: caFadeUp    0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-left  { animation: caFadeLeft  0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-right { animation: caFadeRight 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-zoom  { animation: caZoomIn    0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ca-anim.ca-in.ca-fade  { animation: caFadeIn    0.7s ease forwards; }
        .ca-d1 { animation-delay: 0.10s !important; }
        .ca-d2 { animation-delay: 0.20s !important; }
        .ca-d3 { animation-delay: 0.30s !important; }
        .ca-d4 { animation-delay: 0.40s !important; }
        .ca-d5 { animation-delay: 0.50s !important; }
        .ca-d6 { animation-delay: 0.60s !important; }
        .reveal { transform: translateY(30px); opacity: 0; transition: all 0.8s ease-out; }
        .reveal.active { transform: translateY(0); opacity: 1; }
        .mega-menu-gradient { background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%); }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { display: flex; white-space: nowrap; animation: marquee 14s linear infinite; }
        /* Guarantees each of the two copies fills at least the full visible width, so a short
           text (e.g. a handful of subcategory names) still scrolls continuously instead of
           leaving a blank gap once the real content runs out before the copy takes over. */
        .marquee-track-fill > span { min-width: 100%; flex-shrink: 0; }
        @keyframes slideUpIn { from { transform: translateY(70px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideRightIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes progressFill { from { width: 0%; } to { width: 100%; } }
        .feat-icon-anim { animation: slideUpIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
        .feat-text-anim { animation: slideRightIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: 0.1s; opacity: 0; }
        .feat-progress { animation: progressFill 3.8s linear forwards; }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-9px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        .float-a { animation: float 3.2s ease-in-out infinite; }
        .float-b { animation: floatB 3.2s ease-in-out infinite 0.6s; }
        .float-c { animation: float 3.4s ease-in-out infinite 1.1s; }
        .float-d { animation: floatB 3s ease-in-out infinite 1.7s; }
      ` }} />

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* Desktop Hero Container - Slider */}
      <div className="hidden md:flex relative min-h-[600px] w-full overflow-hidden flex-col justify-between">
        {/* Slide backgrounds */}
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-center transition-opacity duration-700"
            onClick={() => { if (slide.link) window.open(slide.link, '_blank', 'noopener,noreferrer'); }}
            style={{
              backgroundImage: `url('${getImage(slide.bg, slide.bg)}')`,
              // Slide 2 is a self-contained banner graphic (its own logo/text baked
              // in — see the `heroIndex !== 1` check below that hides the overlay
              // heading for it), but it shares the same 2048x1162 canvas as the
              // photographic slides, so it's treated identically with `cover`.
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: i === heroIndex ? 1 : 0,
              zIndex: 0,
              pointerEvents: i === heroIndex ? 'auto' : 'none',
              cursor: slide.link ? 'pointer' : 'default',
            }}
          />
        ))}

        {/* Hero Content Area — heading, subtext, and buttons hidden on the 2nd slide */}
        {heroIndex !== 1 && (
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex-grow flex items-center justify-start pt-20 md:pt-28 pb-16 md:pb-20 text-left pointer-events-none">
            <div className="max-w-2xl space-y-3 flex flex-col items-start">
              <div style={{ opacity: heroFading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
                <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-3">
                  {heroSlides[heroIndex].heading.split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
                  ))}
                </h1>
                <p className="text-[#000b5d] text-sm md:text-base font-medium leading-relaxed max-w-xl">
                  {heroSlides[heroIndex].sub}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 pointer-events-auto">
                <a href="/cancer-medicines" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white text-center font-bold uppercase tracking-wider text-[11px] px-6 py-3 rounded-lg shadow-2xl shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group">
                  Our Solutions <i className="fa-solid fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
                </a>
                <button onClick={() => setIsInquiryOpen(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/40 text-center font-bold uppercase tracking-wider text-[11px] px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                  <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">Become a Partner</span>
                  <i className="fa-solid fa-phone text-[#1D9FDA]"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slider Controls — dots + arrows */}
        <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-6">
          {/* Prev */}
          <button
            onClick={() => goToHeroSlide((heroIndex - 1 + heroSlides.length) % heroSlides.length)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition"
          >
            <i className="fa-solid fa-chevron-left text-white text-xs"></i>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToHeroSlide(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === heroIndex ? '24px' : '8px',
                  height: '8px',
                  background: i === heroIndex ? 'white' : 'rgba(255,255,255,0.45)',
                }}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => goToHeroSlide((heroIndex + 1) % heroSlides.length)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition"
          >
            <i className="fa-solid fa-chevron-right text-white text-xs"></i>
          </button>
        </div>
      </div>

      {/* Mobile Hero Container - Card Layout (block md:hidden) */}
      <div className="block md:hidden pb-4 pt-[120px] bg-white">

        {/* Horizontal scrollable buttons row */}
        <div
          className="flex gap-2.5 overflow-x-auto pb-4 px-4 scrollbar-none animate-fadeIn"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style>{`
            .scrollbar-none::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <a
            href="/order-medicines.html"
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-95 text-white font-bold text-[12.5px] py-2 px-5 rounded-full transition-all shrink-0 flex items-center justify-center"
          >
            Order Medicines
          </a>
          <a
            href="/product-range"
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-95 text-white font-bold text-[12.5px] py-2 px-5 rounded-full transition-all shrink-0 flex items-center justify-center"
          >
            Product Range
          </a>
          <a
            href="/services.html"
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-95 text-white font-bold text-[12.5px] py-2 px-5 rounded-full transition-all shrink-0 flex items-center justify-center"
          >
            Our Services
          </a>
          <button
            onClick={() => setIsInquiryOpen(true)}
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-95 text-white font-bold text-[12.5px] py-2 px-5 rounded-full transition-all shrink-0 flex items-center justify-center"
          >
            Become Our Partner
          </button>
          <a
            href="/contact-us.html"
            className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-95 text-white font-bold text-[12.5px] py-2 px-5 rounded-full transition-all shrink-0 flex items-center justify-center"
          >
            Contact Us
          </a>
        </div>

        <div className="bg-white px-4">

          {/* Image Slider Container */}
          <div className="relative aspect-[16/10] w-full rounded-[10px] overflow-hidden mb-4 bg-gray-100">
            {/* Slide backgrounds */}
            {heroSlides.map((slide, i) => (
              <div
                key={i}
                className="absolute inset-0 bg-center transition-opacity duration-700"
                onClick={() => { if (slide.link) window.open(slide.link, '_blank', 'noopener,noreferrer'); }}
                style={{
                  backgroundImage: `url('${getImage(slide.bg, slide.bg)}')`,
                  // Slides share the same 2048x1162 canvas so they use `cover` like on
                  // desktop — except slide 2 on this short mobile card: its banner text
                  // and icon row sit close to the image edges, so `cover`'s crop was
                  // cutting them off. `contain` keeps the whole banner visible here.
                  backgroundSize: i === 1 ? 'contain' : 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: i === 1 ? '#ffffff' : undefined,
                  backgroundRepeat: 'no-repeat',
                  opacity: i === heroIndex ? 1 : 0,
                  zIndex: 0,
                  pointerEvents: i === heroIndex ? 'auto' : 'none',
                  cursor: slide.link ? 'pointer' : 'default',
                }}
              />
            ))}

            {/* Soft white overlay for title contrast — skipped on slide 2 (index 1),
                whose banner graphic has its own baked-in text and no overlaid title */}
            {heroIndex !== 1 && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/10 to-transparent z-[1] pointer-events-none" />
            )}

            {/* Overlaid Title on Mobile Slider */}
            {heroIndex !== 1 && (
              <div
                className="absolute top-8 left-4 right-4 z-10 transition-opacity duration-400 pointer-events-none"
                style={{ opacity: heroFading ? 0 : 1 }}
              >
                <h1 className="text-[24px] font-black leading-[1.2] tracking-tight max-w-[90%]">
                  {heroSlides[heroIndex].heading.split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      <span className="bg-gradient-to-r from-[#61A644] via-[#1D9FDA] to-[#61A644] bg-clip-text text-transparent">
                        {line}
                      </span>
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h1>
              </div>
            )}

            {/* Slider Controls (Dots + Arrows) on the Image */}
            <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-4">
              {/* Prev */}
              <button
                onClick={() => goToHeroSlide((heroIndex - 1 + heroSlides.length) % heroSlides.length)}
                className="w-7 h-7 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white/80 transition"
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToHeroSlide(i)}
                    className={`transition-all duration-300 rounded-full h-1.5 ${i === heroIndex ? 'w-4 bg-gradient-to-r from-[#61A644] to-[#1D9FDA]' : 'w-1.5 bg-gray-300'
                      }`}
                  />
                ))}
              </div>

              {/* Next */}
              <button
                onClick={() => goToHeroSlide((heroIndex + 1) % heroSlides.length)}
                className="w-7 h-7 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white/80 transition"
              >
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>

          </div>

          {/* Subtext description below the slider */}
          {heroIndex !== 1 && (
            <div
              className="px-1 mb-4 transition-opacity duration-400"
              style={{ opacity: heroFading ? 0 : 1 }}
            >
              <p className="text-gray-500 text-[13px] font-normal leading-relaxed text-left">
                {heroSlides[heroIndex].sub}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Stat Numbers (Clean, without cards, directly under hero) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Stat 1 */}
        <div className="flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group ca-anim ca-up ca-d1">
          <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            <AnimatedCounter end={2000} suffix="+" />
          </h3>
          <p className="text-gray-600 font-bold text-sm md:text-base leading-tight">Molecules in portfolio</p>
        </div>

        {/* Stat 2 */}
        <div className="flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group ca-anim ca-up ca-d2">
          <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            <AnimatedCounter end={10000} suffix="+" />
          </h3>
          <p className="text-gray-600 font-bold text-sm md:text-base leading-tight">Pharmacies nationwide</p>
        </div>

        {/* Stat 3 */}
        <div className="flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group ca-anim ca-up ca-d3">
          <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            <AnimatedCounter end={500} suffix="+" />
          </h3>
          <p className="text-gray-600 font-bold text-sm md:text-base leading-tight">Hospitals served</p>
        </div>

        {/* Stat 4 */}
        <div className="flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group ca-anim ca-up ca-d4">
          <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            <AnimatedCounter end={2} suffix="M+" />
          </h3>
          <p className="text-gray-600 font-bold text-sm md:text-base leading-tight">Filipino lives touched</p>
        </div>
      </section>

      {/* Belief Section (Patient First Redesign) */}
      <section className="pt-4 pb-24 md:pt-8 md:pb-24 max-w-7xl mx-auto px-6 reveal">

        {/* Top Area: Text Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start mb-16">
          {/* Left Column: Eyebrow & Title */}
          <div className="flex flex-col justify-center items-end text-right space-y-4 max-w-lg md:ml-auto">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs">Who We Are</span>
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-900 leading-tight tracking-tight ca-anim ca-left">
              Patient First. <br />
              Raising the standard <br />
              for Filipino care.
            </h2>
          </div>

          {/* Right Column: Description */}
          <div className="flex flex-col justify-center max-w-lg md:pt-10">
            <p className="text-gray-500 leading-relaxed text-sm md:text-[15px]">
              A box of medicine isn't a product. It's a stage-IV oncology mother in Cebu waiting for her next dose. A child in Mindanao fighting leukemia. A father in Quezon City heading into surgery, trusting that the anesthesia is ready. Getmeds exists so distance, cost, and complexity never decide who lives.
            </p>
            <div className="mt-6 md:hidden">
              <a href="/about-us" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white font-bold text-sm px-8 py-3 rounded-full transition-transform hover:opacity-90 inline-block whitespace-nowrap">
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Area: Images & Floating Button */}
        <div className="relative mt-8">
          {/* Floating Button Cutout Style (desktop/tablet only — shown inline under the description on mobile) */}
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-white p-2.5 rounded-full">
              <a href="/about-us" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white font-bold text-sm px-8 py-3 rounded-full transition-transform hover:opacity-90 inline-block whitespace-nowrap">
                Learn More
              </a>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ca-anim ca-right ca-d2">
            <div className="h-[220px] md:h-[280px] lg:h-[340px]">
              <LinkableImage
                link={getImageLink('Patient First Section Image')}
                src={getImage('Patient First Section Image', 'assets/genericslider.jpg')}
                alt="Medical Professional"
                className="w-full h-full object-cover object-center rounded-[15px] sm:rounded-[24px] shadow-lg"
              />
            </div>
            <div className="h-[220px] md:h-[280px] lg:h-[340px]">
              <LinkableImage
                link={getImageLink('Patient Second Section Image')}
                src={getImage('Patient Second Section Image', 'assets/test.jpg')}
                alt="Medical Facility"
                className="w-full h-full object-cover object-center rounded-[15px] sm:rounded-[24px] shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pharmaceutical Portfolio Section (Redesigned matching About Us layout) */}
      <section className="py-8 bg-white reveal relative overflow-hidden">
        {/* Left orange gradient decoration */}
        <div className="absolute left-0 top-0 h-full w-56 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 224 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="portfolioLeftGrad" cx="0%" cy="100%" r="100%">
                <stop offset="0%" stopColor="#61A644" stopOpacity="0.9" />
                <stop offset="55%" stopColor="#1D9FDA" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFF7ED" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="224" height="600" fill="url(#portfolioLeftGrad)" />
            <path d="M 0 520 A 80 80 0 0 1 80 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 440 A 160 160 0 0 1 160 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 360 A 240 240 0 0 1 224 514" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 280 A 320 320 0 0 1 224 372" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 200 A 400 400 0 0 1 224 269" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 120 A 480 480 0 0 1 224 176" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 0 40 A 560 560 0 0 1 224 87" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Right pink gradient decoration */}
        <div className="absolute right-0 top-0 h-full w-56 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 224 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="portfolioRightGrad" cx="100%" cy="100%" r="100%">
                <stop offset="0%" stopColor="#61A644" stopOpacity="0.8" />
                <stop offset="55%" stopColor="#1D9FDA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFF1F2" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="224" height="600" fill="url(#portfolioRightGrad)" />
            <path d="M 224 520 A 80 80 0 0 0 144 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 440 A 160 160 0 0 0 64 600" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 360 A 240 240 0 0 0 0 514" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 280 A 320 320 0 0 0 0 372" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 200 A 400 400 0 0 0 0 269" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 120 A 480 480 0 0 0 0 176" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
            <path d="M 224 40 A 560 560 0 0 0 0 87" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-xs mb-3 block">Our Pharmaceutical Portfolio</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 ca-anim ca-up">
              From Essential Medicines to Advanced Therapies.
            </h2>
            <p className="text-gray-500 text-[13px]">
              Most distributors operate in one layer of the market. Getmeds is built for all four layers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* Card 1: Foundation */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ca-anim ca-zoom ca-d1">
              <i className="fa-solid fa-pills text-3xl text-[#1D9FDA] mb-4 block"></i>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Foundation</h4>
              <p className="text-sm font-bold text-gray-500 mb-1">Everyday medicines, never out of reach.</p>
              <p className="text-sm text-gray-500">Branded generics and essential medicines.</p>
            </div>

            {/* Card 2: Acceleration */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ca-anim ca-zoom ca-d2">
              <i className="fa-solid fa-bolt text-3xl text-[#61A644] mb-4 block"></i>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Acceleration</h4>
              <p className="text-sm font-bold text-gray-500 mb-1">Smarter therapies, faster access.</p>
              <p className="text-sm text-gray-500">Off-patent molecules, fixed-dose combinations, and new delivery systems.</p>
            </div>

            {/* Card 3: Frontier */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ca-anim ca-zoom ca-d3">
              <i className="fa-solid fa-microscope text-3xl text-[#5533FF] mb-4 block"></i>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Frontier</h4>
              <p className="text-sm font-bold text-gray-500 mb-1">Advanced therapies, within reach.</p>
              <p className="text-sm text-gray-500">Oncology, hematology, specialty medicines and rare disease.</p>
            </div>

            {/* Card 4: Beyond the molecule */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ca-anim ca-zoom ca-d4">
              <i className="fa-solid fa-network-wired text-3xl text-[#FFB020] mb-4 block"></i>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Beyond the molecule</h4>
              <p className="text-sm font-bold text-gray-500 mb-1">The access infrastructure.</p>
              <p className="text-sm text-gray-500">Cold-chain logistics, last-mile delivery, and patient programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Therapeutic Areas Section */}
      {(() => {
        const totalPages = Math.ceil(therapCards.length / 4);

        if (categoryImagesLoading) {
          return (
            <section className="py-12 px-0 md:px-6 reveal">
              <style>{`
                @keyframes therapSkeletonPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.6 } }
                .therap-skeleton { animation: therapSkeletonPulse 1.6s ease-in-out infinite; }
              `}</style>
              <div className="max-w-7xl mx-auto bg-gray-100 rounded-none md:rounded-3xl overflow-hidden">
                <div className="flex items-start justify-between px-8 pt-8 pb-6 gap-4">
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 max-w-md leading-tight">Therapeutic areas we serve across the Philippines.</h2>
                  <a href="/product-range" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white text-xs md:text-sm font-medium rounded-full px-3 py-1.5 md:px-6 md:py-2.5 transition-opacity shrink-0">View All</a>
                </div>
                <div className="md:hidden px-0">
                  <div className="therap-skeleton bg-gray-200" style={{ aspectRatio: '5/4' }} />
                </div>
                <div className="hidden md:grid grid-cols-4 gap-4 px-8 pb-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="therap-skeleton bg-gray-200 rounded-2xl aspect-[3/4]" />
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return (
          <section className="py-12 px-0 md:px-6 reveal">
            <style>{`
              @keyframes therapProgress { from { width: 0% } to { width: 100% } }
              .therap-progress-anim { animation: therapProgress 5s linear forwards; }

              /*
               * Fallback styling for the card gradient/text overlay, independent of Tailwind's
               * runtime CDN script (cdn.tailwindcss.com generates utility CSS in JS on page
               * load). Content that only appears after the async category data resolves can
               * end up unstyled if that script hasn't (re)scanned the DOM in time — showing a
               * bright, uncovered image with no name/marquee/link text. These plain-CSS rules
               * guarantee the overlay renders correctly regardless of the CDN script's timing.
               */
              .therap-card-gradient {
                background-image: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
              }
              .therap-card-gradient-mobile {
                background-image: linear-gradient(to top, rgba(0, 0, 0, 0.70), rgba(0, 0, 0, 0.20), rgba(0, 0, 0, 0));
              }
              .therap-card-text h3 {
                color: #fff;
              }
              .therap-card-text .marquee-track span {
                color: rgba(255, 255, 255, 0.75);
              }
              .therap-card-pill {
                color: #fff;
                background-color: rgba(255, 255, 255, 0.2);
              }
              .therap-card-pill:hover {
                background-color: rgba(255, 255, 255, 0.3);
              }
              .therap-card-subpill {
                color: rgba(255, 255, 255, 0.9);
                background-color: rgba(255, 255, 255, 0.15);
              }
            `}</style>
            <div className="max-w-7xl mx-auto bg-gray-100 rounded-none md:rounded-3xl overflow-hidden">

              {/* Header */}
              <div className="flex items-start justify-between px-8 pt-8 pb-6 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 max-w-md leading-tight ca-anim ca-up">Therapeutic areas we serve across the Philippines.</h2>
                <a href="/product-range" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white text-xs md:text-sm font-medium rounded-full px-3 py-1.5 md:px-6 md:py-2.5 transition-opacity shrink-0">View All</a>
              </div>

              {/* Mobile slider — portrait main image + thumbnail strip */}
              <div className="md:hidden">
                <div className="relative overflow-hidden" style={{ aspectRatio: '5/4' }}>
                  {therapCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                      style={{
                        backgroundImage: `url(${card.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: idx === therapMobileActive ? 1 : 0,
                      }}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent therap-card-gradient-mobile" />
                  {/* Card info overlay */}
                  <div className="absolute bottom-5 left-4 right-4 z-10 flex items-end justify-between therap-card-text">
                    <div>
                      <h3 className="text-white text-xs md:text-lg font-bold mb-0.5">{therapCards[therapMobileActive]?.name}</h3>
                      <div className="overflow-hidden w-40 sm:w-48">
                        <div className="marquee-track">
                          <span className="text-white/70 text-[11px] pr-4">{therapCards[therapMobileActive]?.marquee}</span>
                          <span className="text-white/70 text-[11px] pr-4">{therapCards[therapMobileActive]?.marquee}</span>
                        </div>
                      </div>
                      {!!therapCards[therapMobileActive]?.subcategories?.length && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {therapCards[therapMobileActive].subcategories.slice(0, 2).map((sub) => (
                            <span key={sub} className="text-white/90 text-[9px] bg-white/15 rounded-full px-2 py-0.5 therap-card-subpill">{sub}</span>
                          ))}
                          {therapCards[therapMobileActive].subcategories.length > 2 && (
                            <span className="text-white/70 text-[9px]">+{therapCards[therapMobileActive].subcategories.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <a
                      href={therapCards[therapMobileActive]?.link}
                      className="text-[11px] font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-3.5 py-1.5 transition-colors shrink-0 therap-card-pill"
                    >
                      See All
                    </a>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-10">
                    <div key={therapMobileActive} className="h-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] therap-progress-anim" />
                  </div>
                </div>
                {/* Thumbnail strip */}
                <div className="flex gap-2 overflow-x-auto px-4 py-4" style={{ scrollbarWidth: 'none' }}>
                  {therapCards.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() => setTherapMobileActive(idx)}
                      className="flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300"
                      style={{
                        width: '80px',
                        height: '60px',
                        borderRadius: '10px',
                        opacity: idx === therapMobileActive ? 1 : 0.5,
                        outline: idx === therapMobileActive ? '2px solid #61A644' : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      <img
                        src={card.img}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const t = e.currentTarget;
                          // Sanity image broke (deleted/orphaned asset) — retry once with the
                          // bundled local fallback before giving up and showing the placeholder icon.
                          if (t.dataset.fallbackTried !== '1' && t.src !== card.fallback) {
                            t.dataset.fallbackTried = '1';
                            t.src = card.fallback;
                            return;
                          }
                          t.style.display = 'none';
                          const parent = t.parentElement;
                          if (parent && !parent.querySelector('.img-fallback')) {
                            const fb = document.createElement('div');
                            fb.className = 'img-fallback w-full h-full flex items-center justify-center bg-gray-100';
                            fb.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><i class="fa-regular fa-image" style="font-size:16px;color:#d1d5db"></i><span style="font-size:10px;color:#9ca3af;font-family:Poppins,sans-serif">No image</span></div>';
                            parent.appendChild(fb);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop slider — hidden on mobile */}
              <div className="hidden md:block px-8 pb-8">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${therapPage * 100}%)` }}
                  >
                    {Array.from({ length: totalPages }).map((_, pageIdx) => (
                      <div key={pageIdx} className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {therapCards.slice(pageIdx * 4, pageIdx * 4 + 4).map((card) => (
                          <div key={card.name} className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer">
                            <img
                              src={card.img}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              alt={card.name}
                              onError={(e) => {
                                const t = e.currentTarget;
                                // Sanity image broke (deleted/orphaned asset) — retry once with the
                                // bundled local fallback before giving up and showing the placeholder icon.
                                if (t.dataset.fallbackTried !== '1' && t.src !== card.fallback) {
                                  t.dataset.fallbackTried = '1';
                                  t.src = card.fallback;
                                  return;
                                }
                                t.style.display = 'none';
                                const parent = t.parentElement;
                                if (parent && !parent.querySelector('.img-fallback')) {
                                  const fb = document.createElement('div');
                                  fb.className = 'img-fallback absolute inset-0 flex items-center justify-center bg-gray-100';
                                  fb.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><i class="fa-regular fa-image" style="font-size:20px;color:#d1d5db"></i><span style="font-size:11px;color:#9ca3af;font-family:Poppins,sans-serif">No image</span></div>';
                                  parent.insertBefore(fb, parent.firstChild);
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent therap-card-gradient"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 therap-card-text">
                              <h3 className="text-white text-xl font-bold mb-1">{card.name}</h3>
                              <div className="overflow-hidden mb-1">
                                <div className="marquee-track marquee-track-fill">
                                  <span className="text-white/75 text-xs pr-6">{card.subcategories?.join(' • ')}</span>
                                  <span className="text-white/75 text-xs pr-6">{card.subcategories?.join(' • ')}</span>
                                </div>
                              </div>
                              <a href={card.link} className="text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-3 py-1 transition-colors therap-card-pill">See All</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end mt-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTherapPage(p => Math.max(0, p - 1))}
                      disabled={therapPage === 0}
                      className={`w-10 h-10 rounded-full border bg-white flex items-center justify-center transition-colors ${therapPage === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                    >
                      <i className="fa-solid fa-chevron-left text-sm"></i>
                    </button>
                    <button
                      onClick={() => setTherapPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={therapPage === totalPages - 1}
                      className={`w-10 h-10 rounded-full border bg-white flex items-center justify-center transition-colors ${therapPage === totalPages - 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                    >
                      <i className="fa-solid fa-chevron-right text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        );
      })()}

      {/* Capabilities Bento Section */}
      <section className="py-16 px-6 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight ca-anim ca-up">
              Capabilities that move medicines, partnerships, and patients forward.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Getmeds operates a full-stack pharmaceutical platform — from global sourcing and regulatory compliance to last-mile distribution, government access, and digital health.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#e8effe] via-[#eef1fd] to-[#ede8fb] rounded-3xl p-5 ca-anim ca-fade ca-d2">
            <div className="grid grid-cols-6 gap-4">

              {/* Row 1 — 2 wide cards */}

              {/* Card 1: Global Network */}
              <div className="col-span-6 md:col-span-3 bg-gradient-to-br from-white to-sky-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Global Network of Pharma Manufacturers</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-full md:max-w-[55%]">Strategic sourcing partnerships with leading manufacturers across India, China, Europe, and the US.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
                  <svg viewBox="0 0 176 176" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="88" y1="176" x2="0" y2="0" stroke="#0ea5e9" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="44" y2="0" stroke="#0ea5e9" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="88" y2="0" stroke="#0ea5e9" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="132" y2="0" stroke="#0ea5e9" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="176" y2="0" stroke="#0ea5e9" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="22" y2="0" stroke="#0ea5e9" strokeWidth="1" opacity="0.1" />
                    <line x1="88" y1="176" x2="154" y2="0" stroke="#0ea5e9" strokeWidth="1" opacity="0.1" />
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-end pb-5 pr-5">
                    <div className="w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-earth-americas text-white text-xs md:text-lg"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Regulatory */}
              <div className="col-span-6 md:col-span-3 bg-gradient-to-br from-white to-violet-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Regulatory & Compliance</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-full md:max-w-[55%]">FDA Philippines, DOH, and international regulatory expertise across registration and post-market compliance.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
                  <svg viewBox="0 0 176 176" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="176" cy="176" r="50" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.15" />
                    <circle cx="176" cy="176" r="85" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.15" />
                    <circle cx="176" cy="176" r="120" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.12" />
                    <circle cx="176" cy="176" r="155" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.1" />
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-end pb-5 pr-5">
                    <div className="w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-shield-halved text-white text-xs md:text-lg"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 — 3 normal cards */}

              {/* Card 3: Supply Chain */}
              <div className="col-span-6 md:col-span-2 bg-gradient-to-br from-white to-teal-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Precision Supply Chain & Nationwide Distribution</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Temperature-controlled logistics and last-mile delivery across Luzon, Visayas, and Mindanao.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none opacity-[0.08]">
                  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => <circle key={`${r}-${c}`} cx={10 + c * 16} cy={10 + r * 16} r="2" fill="#0d9488" />))}
                  </svg>
                </div>
                <div className="absolute bottom-5 right-5">
                  <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-truck text-white text-xs md:text-base"></i>
                  </div>
                </div>
              </div>

              {/* Card 4: Sales */}
              <div className="col-span-6 md:col-span-2 bg-gradient-to-br from-white to-orange-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Sales and Distribution</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">10,000+ pharmacy and 500+ hospital accounts served through dedicated nationwide sales teams.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none opacity-[0.08]">
                  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => <circle key={`${r}-${c}`} cx={10 + c * 16} cy={10 + r * 16} r="2" fill="#f97316" />))}
                  </svg>
                </div>
                <div className="absolute bottom-5 right-5">
                  <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-store text-white text-xs md:text-base"></i>
                  </div>
                </div>
              </div>

              {/* Card 5: Gov Bidding */}
              <div className="col-span-6 md:col-span-2 bg-gradient-to-br from-white to-indigo-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Government Bidding & Public Sector Access</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Partnering with government hospitals through competitive bidding to enhance access to quality healthcare and essential medicines.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none opacity-[0.08]">
                  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => <circle key={`${r}-${c}`} cx={10 + c * 16} cy={10 + r * 16} r="2" fill="#6366f1" />))}
                  </svg>
                </div>
                <div className="absolute bottom-5 right-5">
                  <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-landmark text-white text-xs md:text-base"></i>
                  </div>
                </div>
              </div>

              {/* Row 3 — 2 wide cards */}

              {/* Card 6: Gov Medical */}
              <div className="col-span-6 md:col-span-3 bg-gradient-to-br from-white to-emerald-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '200px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Government Medical Assistance & Program Accreditation</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-full md:max-w-[55%]">Accredited provider of chemotherapy and cancer medicines for DSWD, PCSO, and other national government medical assistance programs.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
                  <svg viewBox="0 0 176 176" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="88" y1="176" x2="0" y2="0" stroke="#10b981" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="44" y2="0" stroke="#10b981" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="88" y2="0" stroke="#10b981" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="132" y2="0" stroke="#10b981" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="176" y2="0" stroke="#10b981" strokeWidth="1" opacity="0.15" />
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-end pb-5 pr-5">
                    <div className="w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-hand-holding-medical text-white text-xs md:text-lg"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 7: CLIDP */}
              <div className="col-span-6 md:col-span-3 bg-gradient-to-br from-white to-purple-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '200px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Certificate of Listing of Identical Drug Product (CLIDP) Services</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-full md:max-w-[55%]">End-to-end CLIDP application, certification, and ongoing compliance management for our portfolio.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
                  <svg viewBox="0 0 176 176" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="176" cy="176" r="50" fill="none" stroke="#9333ea" strokeWidth="1" opacity="0.15" />
                    <circle cx="176" cy="176" r="85" fill="none" stroke="#9333ea" strokeWidth="1" opacity="0.15" />
                    <circle cx="176" cy="176" r="120" fill="none" stroke="#9333ea" strokeWidth="1" opacity="0.12" />
                    <circle cx="176" cy="176" r="155" fill="none" stroke="#9333ea" strokeWidth="1" opacity="0.1" />
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-end pb-5 pr-5">
                    <div className="w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-certificate text-white text-xs md:text-lg"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4 — 2 wide cards */}

              {/* Card 8: International */}
              <div className="col-span-6 md:col-span-3 bg-gradient-to-br from-white to-rose-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '200px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">International Operations & Pharmacy Footprint</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-full md:max-w-[55%]">Cross-border operations and partner pharmacy networks across multiple regions, extending beyond Asia into global markets.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
                  <svg viewBox="0 0 176 176" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="176" cy="176" r="50" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.15" />
                    <circle cx="176" cy="176" r="85" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.15" />
                    <circle cx="176" cy="176" r="120" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.12" />
                    <circle cx="176" cy="176" r="155" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.1" />
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-end pb-5 pr-5">
                    <div className="w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-globe text-white text-xs md:text-lg"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 9: Digital Health */}
              <div className="col-span-6 md:col-span-3 bg-gradient-to-br from-white to-cyan-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '200px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Digital & Smart Healthcare Solutions</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-full md:max-w-[55%]">Patient adherence platforms, smart inventory systems, and healthcare data integrations supporting informed and connected healthcare experiences.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
                  <svg viewBox="0 0 176 176" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="88" y1="176" x2="0" y2="0" stroke="#06b6d4" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="44" y2="0" stroke="#06b6d4" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="88" y2="0" stroke="#06b6d4" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="132" y2="0" stroke="#06b6d4" strokeWidth="1" opacity="0.15" />
                    <line x1="88" y1="176" x2="176" y2="0" stroke="#06b6d4" strokeWidth="1" opacity="0.15" />
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-end pb-5 pr-5">
                    <div className="w-9 h-9 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-microchip text-white text-xs md:text-lg"></i>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Why Hospitals & Pharmacies Section */}
      {(() => {
        const whyFeatures = [
          { icon: 'fa-bolt', accent: '#F97316', title: 'First-to-market sourcing', desc: 'We move the moment a patent cliffs globally.' },
          { icon: 'fa-snowflake', accent: '#0EA5E9', title: 'Cold-chain excellence', desc: 'Biologics-ready logistics nationwide.' },
          { icon: 'fa-flag', accent: '#6366F1', title: 'Filipino-first formulations', desc: 'Engineered for local disease patterns.' },
          { icon: 'fa-heart-pulse', accent: '#F43F5E', title: 'Patient Assistance Program', desc: 'Adherence, access, affordability.' },
        ];
        return (
          <section className="py-20 px-6 bg-white reveal relative">

            {/* Right-side decorative stacked panels */}
            <div className="absolute pointer-events-none" style={{
              right: 0, top: '50%', transform: 'translateY(-50%)',
              width: '480px', height: '480px',
            }}>
              {[
                { rotate: -48, op: 0.15 },
                { rotate: -34, op: 0.21 },
                { rotate: -20, op: 0.28 },
                { rotate: -6, op: 0.35 },
                { rotate: 8, op: 0.25 },
              ].map((p, i) => (
                <div key={i} style={{
                  position: 'absolute', width: '380px', height: '380px',
                  right: '20px', bottom: '20px',
                  background: `linear-gradient(135deg, rgba(219,234,254,${p.op * 0.55}) 0%, rgba(96,165,250,${p.op}) 100%)`,
                  border: '1.5px solid rgba(255,255,255,0.88)',
                  borderRadius: '20px',
                  transform: `rotate(${p.rotate}deg)`,
                  transformOrigin: '100% 100%',
                }}></div>
              ))}
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

              {/* Heading — same size as other sections */}
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-14 max-w-xl ca-anim ca-up">
                Why hospitals and pharmacies choose Getmeds.
              </h2>

              {/* 4 feature columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 pt-10 border-t border-gray-100 ca-anim ca-up ca-d2">
                {whyFeatures.map((item, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-gray-900 text-base mb-2">{item.title}</h4>
                    <p className="text-gray-600 md:text-gray-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                    <a href="services.html" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: item.accent }}>
                      Learn More <i className="fa-solid fa-arrow-right text-[11px]"></i>
                    </a>
                  </div>
                ))}
              </div>

            </div>
          </section>
        );
      })()}

      {/* Partner With Us Section */}
      <section className="py-16 px-6 bg-white reveal relative">

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-14 text-center ca-anim ca-up">
            <span className="font-bold text-sm uppercase tracking-wider mb-2 block" style={{
              background: 'linear-gradient(135deg, #1D9FDA, #61A644)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}>Partnership</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">Partner with us!</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
            {[
              {
                icon: 'fa-earth-asia',
                color: '#1D9FDA',
                title: 'World-Class Standards',
                desc: 'Sourced from WHO, PIC/S, US FDA, EU GMP, and UK MHRA-recognized manufacturing facilities.',
              },
              {
                icon: 'fa-handshake',
                color: '#61A644',
                title: 'UN Global Compact Member',
                desc: 'Advancing the UN Sustainable Development Goals through ethical, responsible, and sustainable business.',
              },
              {
                icon: 'fa-certificate',
                color: '#6366F1',
                title: 'FDA Philippines Licensed',
                desc: 'Fully licensed by the Food and Drug Administration of the Philippines for pharmaceutical importation and distribution.',
              },
            ].map((item, i) => (
              <div key={i} className={`text-center ca-anim ca-zoom ca-d${i + 1}`}>
                <div className="mb-6 flex justify-center">
                  <i className={`fa-solid ${item.icon}`} style={{ fontSize: '44px', color: item.color }}></i>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-4">{item.title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {(() => {
        const faqs: { q: string; a: React.ReactNode }[] = [
          {
            q: 'Is Getmeds registered with FDA Philippines?',
            a: 'Yes — Getmeds holds a valid License to Operate from FDA Philippines as a pharmaceutical distributor.',
          },
          {
            q: 'Is Getmeds PH Legit?',
            a: 'Yes, Getmeds PH is a global pharmaceutical company located in Las Piñas, Metro Manila, Philippines. The company operates as a healthcare and pharmaceutical provider serving patients, pharmacies, hospitals, and healthcare partners through its pharmaceutical distribution and healthcare solutions.',
          },
          {
            q: 'Where is Getmeds located in the Philippines?',
            a: "Getmeds' head office is located at Unit 301–305, 17 Vatican Building, Vatican Drive, BF Resort Village, Talon Dos, Las Piñas City, Metro Manila, Philippines. This serves as the company's principal office and business address in the Philippines.",
          },
          {
            q: 'Who is the owner of Getmeds?',
            a: (<span>Getmeds was founded and is owned by <a href="https://www.linkedin.com/in/nareshbishnoi/" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: '#1D9FDA' }}>Naresh Bishnoi</a>.</span>),
          },
          {
            q: 'What products does Getmeds offer?',
            a: (
              <span>
                Getmeds distributes a comprehensive portfolio of pharmaceutical products and medicines in the Philippines across major therapeutic areas, including:<br /><br />
                <span className="block space-y-1">
                  <span className="block">• <strong>Oncology</strong> — targeted therapies, chemotherapies, and supportive cancer care for Filipino cancer patients</span>
                  <span className="block">• <strong>Hematology</strong> — treatments for leukemia, anemia, coagulation disorders, and blood cancers</span>
                  <span className="block">• <strong>Cardiology</strong> — therapies for heart, vascular, and cardiometabolic conditions</span>
                  <span className="block">• <strong>Rare Diseases</strong> — Named-Patient Access Programs and Compassionate Special Permit (CSP) imports for hard-to-find medicines in the Philippines</span>
                  <span className="block">• <strong>Antibacterial</strong> — hospital-grade and community antibiotics</span>
                  <span className="block">• <strong>Anesthesia & Pain Management</strong> — anesthesia agents, analgesics, and perioperative medicines for surgical care</span>
                  <span className="block">• <strong>Essential Medicines</strong> — WHO-listed first-line therapies and branded generics</span>
                  <span className="block">• <strong>Biologicals & Vaccines</strong> — cold-chain-managed biologicals and immunization products</span>
                  <span className="block">• <strong>Medical Devices</strong> — clinical devices and consumables for hospital and ambulatory care</span>
                  <span className="block">• <strong>Radiology</strong> — contrast agents, imaging consumables, and diagnostic products</span>
                </span>
                <br />Each therapeutic area is supported by Getmeds' dedicated regulatory, supply chain, and patient access teams operating nationwide across Luzon, Visayas, and Mindanao.
              </span>
            ),
          },
          {
            q: 'Does Getmeds accept Senior Citizen and PWD IDs for discounts?',
            a: (
              <span>
                Yes. Getmeds fully complies with the Expanded Senior Citizens Act (Republic Act 9994) and the Magna Carta for Persons with Disabilities (Republic Act 10754). Qualified Senior Citizens and Persons with Disabilities are entitled to a 20% discount plus VAT exemption on eligible prescription medicines purchased through Getmeds pharmacies and direct-to-consumer channels.<br /><br />
                To avail of the benefit, simply present a valid Senior Citizen ID or PWD ID together with a valid prescription at the point of purchase.
              </span>
            ),
          },
        ];
        return (
          <section className="py-14 px-6 bg-white reveal">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-12 items-start">

                {/* LEFT */}
                <div className="lg:w-72 flex-shrink-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: '#f0f7ff', border: '1px solid #dbeeff' }}>
                    <i className="fa-regular fa-circle-question text-xs" style={{ color: '#1D9FDA' }}></i>
                    <span className="text-xs font-medium" style={{ color: '#1D9FDA' }}>Frequently asked questions</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-4 ca-anim ca-left">
                    Frequently asked<br />
                    questions.
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Everything you need to know about Getmeds and our services.
                  </p>
                </div>

                {/* RIGHT — accordion */}
                <div className="flex-1 flex flex-col gap-3 ca-anim ca-up ca-d2">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="rounded-2xl px-5 py-4 cursor-pointer transition-all duration-300"
                      style={{
                        background: i === openFaq ? '#fff' : '#f5f6f8',
                        boxShadow: i === openFaq ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
                      }}
                      onClick={() => setOpenFaq(i === openFaq ? -1 : i)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className={`font-semibold text-[14px] leading-snug ${i === openFaq ? 'text-gray-900' : 'text-gray-600'}`}>
                          {faq.q}
                        </span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{
                          background: 'linear-gradient(135deg, #1D9FDA, #61A644)',
                        }}>
                          <i className={`fa-solid ${i === openFaq ? 'fa-chevron-up' : 'fa-chevron-down'} text-white`} style={{ fontSize: '9px' }}></i>
                        </div>
                      </div>
                      <div
                        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                        style={{ gridTemplateRows: i === openFaq ? '1fr' : '0fr' }}
                      >
                        <div className="overflow-hidden">
                          <p className="text-gray-500 text-sm leading-relaxed mt-3">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>
        );
      })()}

      {/* News & Insights Section */}
      {homeNewsItems && homeNewsItems.length > 0 && (
        <section className="py-10 px-0 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-none md:rounded-2xl p-7" style={{
              background: 'linear-gradient(120deg, #fdf0e8 0%, #c8e8f5 55%, #7ab3d4 100%)',
            }}>

              {/* Header */}
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-[13px] font-semibold tracking-wide mb-1.5 block" style={{
                    background: 'linear-gradient(135deg,#1D9FDA,#61A644)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block'
                  }}>News and Insights</span>
                  <h2 className="text-2xl font-bold text-gray-900">What's new at Getmeds.</h2>
                </div>
                <a href="/blog" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white text-xs md:text-sm font-medium rounded-full px-3 py-1.5 md:px-6 md:py-2.5 transition-opacity shrink-0">View All</a>
              </div>

              {/* 3 Article Cards — mobile: horizontal snap slider; desktop: 3-col grid */}
              <div
                ref={newsSliderRef}
                onScroll={handleNewsScroll}
                className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-3 md:gap-4 snap-x md:snap-none snap-mandatory -mx-7 px-7 md:mx-0 md:px-0 pb-1 md:pb-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
              >
                {homeNewsItems.map((article) => {
                  const imgUrl = article.image
                    ? urlFor(article.image).width(800).url()
                    : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800';
                  return (
                    <a key={article._id} href={`/blog/${article.slug || slugify(article.title)}`} className="relative rounded-3xl overflow-hidden cursor-pointer md:hover:-translate-y-2 md:hover:shadow-2xl transition-all duration-500 group block flex-shrink-0 w-[82%] md:w-auto snap-center mb-0 md:mb-0 h-[300px] md:h-[460px]">

                      {/* Full background image */}
                      <img src={imgUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={article.title} />

                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.55) 45%, rgba(10,15,30,0.15) 100%)' }}></div>

                      {/* Content pinned to bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">

                        {/* Title — desktop: flex row with readTime pill; mobile: full width */}
                        <div className="hidden md:flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-white font-bold text-base leading-snug">{article.title}</h3>
                          {article.readTime && (
                            <div className="flex-shrink-0 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
                              {article.readTime}
                            </div>
                          )}
                        </div>
                        <h3 className="md:hidden text-white font-bold text-base leading-snug mb-2">{article.title}</h3>

                        {/* Description */}
                        <p className="text-white/65 text-[12px] leading-relaxed mb-3 line-clamp-2">{article.description}</p>

                        {/* Tag + readTime on same row (mobile: both here; desktop: tag only) */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-white text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}>{article.tag}</span>
                          {article.readTime && (
                            <div className="md:hidden flex-shrink-0 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
                              {article.readTime}
                            </div>
                          )}
                        </div>

                        {/* Read More button */}
                        <span className="w-full font-semibold text-sm py-3 rounded-2xl transition-all duration-200 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                          Read More
                        </span>

                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Mobile dot indicators */}
              <div className="flex md:hidden justify-center gap-2 mt-4">
                {homeNewsItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToNewsSlide(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: activeNewsSlide === i ? '20px' : '8px',
                      height: '8px',
                      background: activeNewsSlide === i ? '#1D9FDA' : '#cbd5e1',
                    }}
                  />
                ))}
              </div>

            </div>
          </div>
        </section>
      )}


      {/* Footer Component Placeholder */}
      <div id="footer-container" />

      {/* Slide-out Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isInquiryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsInquiryOpen(false)}
      ></div>

      {/* Slide-out Drawer Panel */}
      <div
        className={`fixed top-4 right-4 h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md bg-white shadow-2xl rounded-[15px] z-[160] transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-y-auto ${isInquiryOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'}`}
      >
        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={() => setIsInquiryOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>

          {/* Drawer Header */}
          <div className="mb-6 pr-8 mt-2">
            <h2 className="text-[28px] font-semibold text-slate-900 mb-1 leading-tight tracking-tight">Partner with Getmeds</h2>
            <h3 className="text-sm font-medium text-primary mb-4">Advancing Healthcare Together</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed text-justify">
              Join Getmeds in expanding access to quality medicines and innovative healthcare solutions across the Philippines and beyond.<br />We'd like to hear from you.
            </p>
          </div>

          {/* Inquiry Form */}
          <form className="space-y-4" onSubmit={handlePartnershipSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. Juan Dela Cruz"
                value={partnershipData.name}
                onChange={e => setPartnershipData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Company/Organization <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. General Hospital Inc."
                value={partnershipData.company}
                onChange={e => setPartnershipData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" required placeholder="e.g. juan@hospital.com"
                value={partnershipData.email}
                onChange={e => setPartnershipData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile number <span className="text-red-500">*</span></label>
              <input type="tel" inputMode="numeric" required placeholder="e.g. +63 912 345 6789"
                value={partnershipData.phone}
                onChange={e => setPartnershipData(prev => ({ ...prev, phone: e.target.value.replace(/[^\d+\s\-()]/g, '') }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tell us how we can help <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                value={partnershipData.message}
                onChange={e => setPartnershipData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-[13px] resize-none placeholder-gray-400"
                placeholder="Briefly tell us about your inquiry — whether you're a hospital, pharmacy, manufacturer, or healthcare partner."
              ></textarea>
            </div>

            <div className="flex items-start space-x-3 pt-1">
              <input type="checkbox" required id="consent"
                checked={partnershipData.consent}
                onChange={e => setPartnershipData(prev => ({ ...prev, consent: e.target.checked }))}
                className="mt-[2px] w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer" />
              <label htmlFor="consent" className="text-[11px] text-gray-500 leading-snug cursor-pointer select-none">
                I consent to Getmeds processing my information in accordance with the Data Privacy Act of 2012. <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="pt-2 pb-8">
              <button
                type="submit"
                disabled={submitState === 'sending'}
                className="w-full bg-gradient-to-r from-primary to-[#1D9FDA] hover:opacity-90 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 group disabled:opacity-50"
              >
                <span>{submitState === 'sending' ? 'Sending...' : 'Send inquiry'}</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* ── Partnership Success Modal ── */}
      {successModalOpen && (
        <>
          <style>{`@keyframes checkBounce{0%{transform:scale(0);opacity:0}55%{transform:scale(1.06);opacity:1}75%{transform:scale(0.97)}100%{transform:scale(1);opacity:1}}.check-bounce{animation:checkBounce 0.8s ease-out forwards}`}</style>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl relative overflow-hidden">
              <button onClick={() => setSuccessModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition z-10">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
              <div className="px-10 pt-12 pb-8 text-center">
                <div className="flex justify-center mb-7">
                  <div className="check-bounce w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#61A644,#1D9FDA)' }}>
                    <i className="fa-solid fa-check text-white text-xl"></i>
                  </div>
                </div>
                <h2 className="text-[19px] font-semibold text-gray-900 mb-4 leading-snug">Thank you for considering Getmeds as your partner.</h2>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Our business development team will contact you within 2 working days to discuss collaboration opportunities. For urgent concerns, please call{' '}
                  <a href="tel:+639190769103" className="text-[#1D9FDA] font-semibold hover:underline">+63 919 076 9103</a>.
                </p>
              </div>
              <div className="border-t border-gray-100 px-10 py-4 text-center">
                <button onClick={() => setSuccessModalOpen(false)}
                  className="text-[13px] font-semibold hover:underline"
                  style={{ background: 'linear-gradient(to right,#61A644,#1D9FDA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
function setIsScrolled(arg0: boolean) {
  throw new Error('Function not implemented.');
}

