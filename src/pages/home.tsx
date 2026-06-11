import React, { useState, useEffect } from 'react';
import { useCategories, useImageMapper, useNews, useSiteSettings } from '../lib/useSanity';
import { getGoogleSpreadsheetBySlug } from '../lib/queries';
import { injectHTML } from '../lib/injectHTML';
import { urlFor } from '../lib/sanity';


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

export default function GetMedsHomepage() {
  const { getImage } = useImageMapper('home');
  const { data: newsItems } = useNews();
  const { data: settings } = useSiteSettings();
  const { data: categoriesData } = useCategories();
  const [isScrolled, setIsScrolled] = useState(false);

  // Grouping config to keep the static layout and style
  const categoryConfig: Record<string, { col: number; title: string }> = {
    'oncology': { col: 0, title: 'Oncology' },
    'hematology': { col: 1, title: 'Hematology' },
    'anti-infectives': { col: 1, title: 'Anti-Infectives' },
    'endocrinology': { col: 2, title: 'Endocrinology' },
    'orthopedic': { col: 2, title: 'Orthopedic' },
    'cardiology': { col: 2, title: 'Cardiology' },
    'neuro-oncology': { col: 3, title: 'Neuro-Oncology' },
    'respiratory': { col: 3, title: 'Respiratory / Allergy' },
    'allergy': { col: 3, title: 'Respiratory / Allergy' },
    'renal': { col: 3, title: 'Nephrology / Renal' },
    'nephrology': { col: 3, title: 'Nephrology / Renal' },
    'pain-management': { col: 3, title: 'Pain Mgt.' },
    'rheumatology': { col: 3, title: 'Rheumatology' },
    'gynecology': { col: 2, title: 'Gynecology' },
    'obstetrician': { col: 2, title: 'Obstetrician' },
    'radiology': { col: 1, title: 'Radiology' }
  };

  const subcategorySpecials: Record<string, string> = {
    'non-small-cell-lung-cancer': 'lung-cancer',
    'acute-myeloid-leukemia': 'aml',
    'chronic-myeloid-leukemia': 'cml',
    'hodgkin-non-hodgkins-lymphoma': 'lymphoma',
    'hodgkin-non-hodgkin-s-lymphoma': 'lymphoma',
    'sickle-cell-anemia': 'sickle-cell',
    'respiratory-infections': 'respiratory',
    'urinary-tract-infections': 'uti',
    'skin-and-soft-tissue-infections': 'skin-infections',
    'bone-and-joint-infections': 'bone-infections',
    'fibrocystic-breast-disease': 'fibrocystic',
    'arrhythmia-management': 'arrhythmia',
    'hypertension-angina': 'hypertension',
    'hypertension-and-angina': 'hypertension',
    'seasonal-allergic-rhinitis': 'allergic-rhinitis',
    'chronic-kidney-disease': 'kidney-disease',
    'chronic-pain': 'pain',
    'inflammatory-disorders': 'rheumatology',
    'inflammatory-and-rheumatic-disorders': 'rheumatology'
  };

  const getSubcategorySlug = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return subcategorySpecials[slug] || slug;
  };

  // Process dynamic categories into 4 columns using Jaccard Similarity Graph Grouping (sim >= 0.5)
  const desktopColumns: Array<Array<{ title: string; subcategories: string[] }>> = [[], [], [], []];
  const accordionSections: Array<{ title: string; subcategories: string[] }> = [];

  if (categoriesData && categoriesData.length > 0) {
    const validCats = categoriesData.filter(
      (cat) => cat.subcategory && Array.isArray(cat.subcategory) && cat.subcategory.length > 0
    );

    const jaccardSimilarity = (arr1: string[], arr2: string[]) => {
      const setA = new Set(arr1.map(x => x.trim().toLowerCase()));
      const setB = new Set(arr2.map(x => x.trim().toLowerCase()));
      const intersection = new Set([...setA].filter(x => setB.has(x)));
      const union = new Set([...setA, ...setB]);
      return union.size === 0 ? 0 : (intersection.size / union.size);
    };

    const visited = new Set<number>();
    const groups: Array<typeof validCats> = [];

    for (let i = 0; i < validCats.length; i++) {
      if (visited.has(i)) continue;

      const component: typeof validCats = [];
      const queue = [i];
      visited.add(i);

      while (queue.length > 0) {
        const currIdx = queue.shift()!;
        const currCat = validCats[currIdx];
        component.push(currCat);

        for (let j = 0; j < validCats.length; j++) {
          if (visited.has(j)) continue;

          const sim = jaccardSimilarity(currCat.subcategory!, validCats[j].subcategory!);
          if (sim >= 0.5) {
            visited.add(j);
            queue.push(j);
          }
        }
      }
      groups.push(component);
    }

    const processedCategories: Array<{
      category: string;
      slugs: string[];
      slug: string;
      subcategory: string[];
    }> = [];

    groups.forEach((groupCats) => {
      if (groupCats.length === 1) {
        processedCategories.push({
          category: groupCats[0].category,
          slugs: [groupCats[0].slug?.current || ''],
          slug: groupCats[0].slug?.current || '',
          subcategory: groupCats[0].subcategory!
        });
      } else {
        const sortedCats = [...groupCats].sort((a, b) => a.category.localeCompare(b.category));
        const combinedName = sortedCats.map((c) => c.category).join(' / ');

        // Find shared subcategories
        const subMaps = sortedCats.map(cat => {
          const map = new Map<string, string>();
          cat.subcategory!.forEach(sub => {
            map.set(sub.trim().toLowerCase(), sub);
          });
          return map;
        });

        const firstMap = subMaps[0];
        const sharedKeys: string[] = [];
        for (const key of firstMap.keys()) {
          let inAll = true;
          for (let k = 1; k < subMaps.length; k++) {
            if (!subMaps[k].has(key)) {
              inAll = false;
              break;
            }
          }
          if (inAll) {
            sharedKeys.push(key);
          }
        }

        const sharedSubcategories = sharedKeys.map(key => firstMap.get(key)!);

        if (sharedSubcategories.length > 0) {
          processedCategories.push({
            category: combinedName,
            slugs: sortedCats.map((c) => c.slug?.current || ''),
            slug: sortedCats[0].slug?.current || '',
            subcategory: sharedSubcategories
          });
        }

        // Add unique subcategories for each category in the group
        sortedCats.forEach(cat => {
          const uniqueSubs = cat.subcategory!.filter(sub => {
            const norm = sub.trim().toLowerCase();
            return !sharedKeys.includes(norm);
          });

          if (uniqueSubs.length > 0) {
            processedCategories.push({
              category: cat.category,
              slugs: [cat.slug?.current || ''],
              slug: cat.slug?.current || '',
              subcategory: uniqueSubs
            });
          }
        });
      }
    });

    const sections: Record<string, { title: string; col: number; subcategories: string[] }> = {};
    processedCategories.forEach((cat) => {
      const slugsToCheck = cat.slugs;
      let minCol = 3;
      let confTitle: string | null = null;

      for (const s of slugsToCheck) {
        if (categoryConfig[s]) {
          if (categoryConfig[s].col < minCol) {
            minCol = categoryConfig[s].col;
          }
          if (!confTitle) {
            confTitle = categoryConfig[s].title;
          }
        }
      }

      const title = slugsToCheck.length > 1 ? cat.category : (confTitle || cat.category);
      const col = minCol;

      if (!sections[title]) {
        sections[title] = {
          title,
          col,
          subcategories: []
        };
      }

      cat.subcategory.forEach((sub) => {
        if (sub && !sections[title].subcategories.includes(sub)) {
          sections[title].subcategories.push(sub);
        }
      });
    });

    Object.values(sections).forEach((sec) => {
      if (sec.subcategories.length > 0) {
        desktopColumns[sec.col].push(sec);
        accordionSections.push(sec);
      }
    });
  }

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
      const sheetInfo = await getGoogleSpreadsheetBySlug('partership-list');
      if (!sheetInfo || !sheetInfo.spreadsheetId) {
        throw new Error('Google Spreadsheet settings not found in Sanity.');
      }

      const timestamp = new Date().toLocaleString();
      const payload = {
        spreadsheetId: sheetInfo.spreadsheetId,
        row: [
          partnershipData.name,
          partnershipData.company,
          partnershipData.email,
          partnershipData.phone,
          partnershipData.message,
          partnershipData.consent ? 'Agreed' : 'Disagreed',
          timestamp
        ]
      };

      const response = await fetch(import.meta.env.VITE_SPREADSHEET_API_URL || '/api/append-to-spreadsheet', {
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
      alert('Inquiry Sent Successfully!');
      setIsInquiryOpen(false);
      setSubmitState('idle');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  const [therapPage, setTherapPage] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false);

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

    // 6. Dynamically load the footer component
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html')
        .then(res => res.text())
        .then(html => { injectHTML(footerContainer, html); });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  console.log(settings);


  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        body { font-family: 'Inter', sans-serif; }
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

      {/* Hero Container - Wraps the transparent header & top-bar, matching the UI screenshot overlay concept */}
      <div className="relative min-h-[70vh] md:min-h-[600px] w-full bg-cover bg-center overflow-hidden flex flex-col justify-between"
        style={{ backgroundImage: `url('${getImage('assets/herosectiontsx.jpg', 'assets/herosectiontsx.jpg')}')` }}>

        {/* Dark Blue/Violet Gradient Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/60 to-slate-900/70 z-0"></div>

        {/* Header (Top-bar + Nav) Group */}
        <div className="relative w-full z-50">

          {/* Top Bar (Dark semi-transparent strip) */}
          <div className="w-full bg-slate-900/40 border-b border-white/10 backdrop-blur-sm py-2.5 px-6 hidden md:block">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white/90 font-medium">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-white">
                  {settings?.topBar?.label || 'Connect With Us'}
                </span>
              </div>
              <div className="flex items-center space-x-6">
                {/* Phone — from contactInfo.phones where showInTopBar is true */}
                {(() => {
                  const topBarPhone =
                    settings?.contactGroups?.find(g => g.showInTopBar)?.phones?.[0] ||
                    settings?.contactGroups?.find(g => g._key === 'general')?.phones?.[0] ||
                    settings?.topBar?.phone ||
                    '+63 919 076 9105'

                  const phoneHref = `tel:${topBarPhone.replace(/[^+\d]/g, '')}`

                  return (
                    <a href={phoneHref} className="flex items-center space-x-2 hover:text-primary transition">
                      <i className="fa-solid fa-phone"></i>
                      <span id="topbar-phone">{topBarPhone.trim()}</span>
                    </a>
                  )
                })()}
                {/* Socials — from topBar.socials or static fallback */}
                <div className="flex items-center space-x-4 border-l border-white/20 pl-6">
                  {settings?.topBar?.socials && (settings.topBar.socials as any[]).length > 0
                    ? (settings.topBar.socials as any[]).map((s: any, i: number) => {
                      const platform = s.platform?.toLowerCase() || '';
                      let iconClass = 'fa-solid fa-link';
                      if (platform === 'facebook') iconClass = 'fa-brands fa-facebook-f';
                      else if (platform === 'twitter' || platform === 'x') iconClass = 'fa-brands fa-x-twitter';
                      else if (platform === 'instagram') iconClass = 'fa-brands fa-instagram';
                      else if (platform === 'linkedin') iconClass = 'fa-brands fa-linkedin-in';
                      else if (platform === 'youtube') iconClass = 'fa-brands fa-youtube';
                      else if (platform === 'tiktok') iconClass = 'fa-brands fa-tiktok';
                      if (s.icon) iconClass = s.icon.startsWith('fa-') ? s.icon : `fa-brands fa-${s.icon}`;
                      return (
                        <a key={i} href={s.href || '#'} target="_blank" rel="noopener noreferrer"
                          className="hover:text-primary transition">
                          <i className={`${iconClass} text-[14px]`}></i>
                        </a>
                      );
                    })
                    : (
                      <>
                        <a href="#" className="hover:text-primary transition"><i className="fa-brands fa-facebook text-[14px]"></i></a>
                        <a href="#" className="hover:text-primary transition"><i className="fa-brands fa-linkedin text-[14px]"></i></a>
                      </>
                    )
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Bar (Transparent overlay, smoothly switches to colored shadow card on scroll) */}
          <nav className={`w-full z-50 ${isScrolled
            ? 'bg-white border-b border-gray-100 text-gray-800 fixed top-0 left-0 animate-slide-down'
            : 'bg-transparent text-white absolute top-full left-0 transition-colors duration-300'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20 relative">

              {/* Logo */}
              <div className="w-auto sm:w-[180px] shrink-0 flex items-center">
                <a href="/" className="flex items-center">
                  {(() => {
                    const logoUrl = getImage('assets/getmedslogo.png', 'assets/getmedslogo.png');
                    const isCustomLogo = logoUrl && logoUrl.includes('cdn.sanity.io');
                    return (
                      <img
                        src={logoUrl}
                        alt="Getmeds Logo"
                        className={`h-10 w-auto object-contain transition-all duration-300 ${isScrolled || isCustomLogo ? '' : 'brightness-0 invert'}`}
                      />
                    );
                  })()}
                </a>
              </div>

              {/* Navigation Links */}
              <div className="hidden lg:flex flex-1 justify-center items-center space-x-8 text-sm font-semibold font-['Poppins']">
                <a href="/" className="transition-colors duration-300 text-primary">Home</a>
                <a href="order-medicines.html" className={`transition-colors duration-300 whitespace-nowrap ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-primary'}`}>Order Medicines</a>

                {/* Product Range Dropdown */}
                <div className="group h-20 flex items-center">
                  <a href="product-range.html" className={`flex items-center transition-colors duration-300 whitespace-nowrap focus:outline-none ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-primary'}`}>
                    Product Range <i className="fa-solid fa-chevron-down ml-1.5 text-[10px]"></i>
                  </a>
                  {/* Mega Menu Container */}
                  <div className="fixed top-[80px] left-0 w-full bg-white rounded-b-[30px] border-b border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] max-h-[calc(100vh-80px)] overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-medium">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                        {desktopColumns.some(col => col.length > 0) ? (
                          desktopColumns.map((colSections, colIdx) => (
                            <div key={colIdx}>
                              {colSections.map((sec, secIdx) => {
                                const h4Class = secIdx > 0 ? "font-semibold text-gray-900 mb-4 border-b pb-2 text-sm mt-6" : "font-semibold text-gray-900 mb-4 border-b pb-2 text-sm";
                                const ulClass = secIdx < colSections.length - 1 ? "space-y-2 text-[13px] mb-6" : "space-y-2 text-[13px]";
                                return (
                                  <React.Fragment key={sec.title}>
                                    <h4 className={h4Class}>{sec.title}</h4>
                                    <ul className={ulClass}>
                                      {sec.subcategories.map((sub) => {
                                        const subslug = getSubcategorySlug(sub);
                                        return (
                                          <li key={sub}>
                                            <a href={`product-range.html?category=${subslug}`} className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">
                                              {sub}
                                            </a>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          ))
                        ) : (
                          <>
                            {/* Column 1 */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Oncology (Solid Tumors)</h4>
                              <ul className="space-y-2 text-[13px]">
                                <li><a href="product-range.html?category=breast-cancer" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Breast Cancer</a></li>
                                <li><a href="product-range.html?category=ovarian-cancer" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Ovarian Cancer</a></li>
                                <li><a href="product-range.html?category=lung-cancer" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Non-Small Cell Lung Cancer</a></li>
                                <li><a href="product-range.html?category=prostate-cancer" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Prostate Cancer</a></li>
                                <li><a href="product-range.html?category=colorectal-cancer" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Colorectal Cancer</a></li>
                                <li><a href="product-range.html?category=pancreatic-cancer" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Pancreatic Cancer</a></li>
                              </ul>
                            </div>

                            {/* Column 2 */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Hematology Range</h4>
                              <ul className="space-y-2 text-[13px] mb-6">
                                <li><a href="product-range.html?category=aml" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Acute Myeloid Leukemia</a></li>
                                <li><a href="product-range.html?category=cml" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Chronic Myeloid Leukemia</a></li>
                                <li><a href="product-range.html?category=lymphoma" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Hodgkin/Non-Hodgkin's Lymphoma</a></li>
                                <li><a href="product-range.html?category=sickle-cell" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Sickle Cell Anemia</a></li>
                              </ul>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Anti-Infectives</h4>
                              <ul className="space-y-2 text-[13px]">
                                <li><a href="product-range.html?category=respiratory" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Respiratory Infections</a></li>
                                <li><a href="product-range.html?category=uti" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Urinary Tract Infections</a></li>
                                <li><a href="product-range.html?category=skin-infections" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Skin and Soft Tissue Infections</a></li>
                                <li><a href="product-range.html?category=bone-infections" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Bone and Joint Infections</a></li>
                              </ul>
                            </div>

                            {/* Column 3 */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Endocrinology</h4>
                              <ul className="space-y-2 text-[13px] mb-6">
                                <li><a href="product-range.html?category=endometriosis" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Endometriosis</a></li>
                                <li><a href="product-range.html?category=fibrocystic" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Fibrocystic Breast Disease</a></li>
                              </ul>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Orthopedic</h4>
                              <ul className="space-y-2 text-[13px] mb-6">
                                <li><a href="product-range.html?category=multiple-myeloma" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Multiple Myeloma</a></li>
                                <li><a href="product-range.html?category=osteoporosis" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Osteoporosis</a></li>
                              </ul>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Cardiology</h4>
                              <ul className="space-y-2 text-[13px]">
                                <li><a href="product-range.html?category=arrhythmia" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Arrhythmia management</a></li>
                                <li><a href="product-range.html?category=hypertension" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Hypertension/Angina</a></li>
                              </ul>
                            </div>

                            {/* Column 4 */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Neuro-Oncology</h4>
                              <ul className="space-y-2 text-[13px] mb-6">
                                <li><a href="product-range.html?category=glioblastoma" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Glioblastoma Multiforme</a></li>
                              </ul>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Respiratory / Allergy</h4>
                              <ul className="space-y-2 text-[13px] mb-6">
                                <li><a href="product-range.html?category=allergic-rhinitis" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Seasonal Allergic Rhinitis</a></li>
                              </ul>
                              <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm">Nephrology / Renal</h4>
                              <ul className="space-y-2 text-[13px] mb-6">
                                <li><a href="product-range.html?category=kidney-disease" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Chronic Kidney Disease</a></li>
                              </ul>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 border-b pb-1 text-sm">Pain Mgt.</h4>
                                  <ul className="space-y-2 text-[13px]">
                                    <li><a href="product-range.html?category=pain" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Chronic Pain</a></li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 border-b pb-1 text-sm">Rheumatology</h4>
                                  <ul className="space-y-2 text-[13px]">
                                    <li><a href="product-range.html?category=rheumatology" className="relative inline-block text-gray-500 hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Inflammatory Disorders</a></li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <a href="meditations.html" className={`transition-colors duration-300 whitespace-nowrap ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-primary'}`}>Meditations</a>
                <a href="about-us.html" className={`transition-colors duration-300 whitespace-nowrap ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-primary'}`}>About Us</a>
                <a href="contact-us.html" className={`transition-colors duration-300 whitespace-nowrap ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-primary'}`}>Contact Us</a>

                {/* Company Dropdown */}
                <div className="group h-20 flex items-center">
                  <button className={`flex items-center transition-colors duration-300 whitespace-nowrap focus:outline-none ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-primary'}`}>
                    Company <i className="fa-solid fa-chevron-down ml-1.5 text-[9px] opacity-75"></i>
                  </button>
                  {/* Mega Menu Container */}
                  <div className="fixed top-[80px] left-0 w-full bg-white rounded-b-[30px] border-b border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] max-h-[calc(100vh-80px)] overflow-y-auto">
                    <style dangerouslySetInnerHTML={{
                      __html: `
                        @keyframes slide1 { 0%, 28% { opacity: 1; z-index: 10; } 33%, 95% { opacity: 0; z-index: 0; } 100% { opacity: 1; z-index: 10; } }
                        @keyframes slide2 { 0%, 28% { opacity: 0; z-index: 0; } 33%, 61% { opacity: 1; z-index: 10; } 66%, 100% { opacity: 0; z-index: 0; } }
                        @keyframes slide3 { 0%, 61% { opacity: 0; z-index: 0; } 66%, 95% { opacity: 1; z-index: 10; } 100% { opacity: 0; z-index: 0; } }
                        .company-slide-1 { animation: slide1 15s infinite; }
                        .company-slide-2 { animation: slide2 15s infinite; }
                        .company-slide-3 { animation: slide3 15s infinite; }
                      `
                    }} />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-medium text-gray-800">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
                        {/* Links Section (Cols 1-7) */}
                        <div className="lg:col-span-7 grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm uppercase tracking-wider">Explore by Organization</h4>
                            <ul className="space-y-4">
                              <li><a href="services.html" className="relative inline-block text-gray-700 font-semibold hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 text-base">Our Services</a></li>
                              <li><a href="global-presence.html" className="relative inline-block text-gray-700 font-semibold hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 text-base">Global Presence</a></li>
                              <li>
                                <a href="pap.html" className="inline-block mt-3 opacity-80 hover:opacity-100 transition transform hover:-translate-y-0.5">
                                  <img src={getImage('assets/pap.png', 'assets/pap.png')} alt="Patient Assistance Program" className="h-32 w-auto object-contain" />
                                </a>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2 text-sm uppercase tracking-wider">More Information</h4>
                            <ul className="space-y-4">
                              <li><a href="csr.html" className="relative inline-block text-gray-700 font-semibold hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 text-base">CSR</a></li>
                              <li><a href="careers.html" className="relative inline-block text-gray-700 font-semibold hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 text-base">Careers</a></li>
                              <li><a href="ungc.html" className="relative inline-block text-gray-700 font-semibold hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 text-base">United Nations Global Compact</a></li>
                              <li><a href="/articles" className="relative inline-block text-gray-700 font-semibold hover:text-primary transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:w-full after:h-[1px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300 text-base">Articles</a></li>
                              <li className="pt-2">
                                <a href="careers.html#join-form"
                                  className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md"
                                  style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}>
                                  Join Us
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        {/* Slider Section (Cols 8-12) */}
                        <div className="lg:col-span-5 h-[260px] relative rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                          <a href="about-us.html" className="absolute inset-0 bg-cover bg-center company-slide-1 transition-opacity duration-1000 cursor-pointer" style={{ backgroundImage: `url('${getImage('assets/about_us_hero.png', 'assets/about_us_hero.png')}')` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                              <h3 className="text-white font-bold text-xl mb-1">About Us</h3>
                              <p className="text-white/80 text-sm">Learn more about our mission and vision.</p>
                            </div>
                          </a>
                          <a href="global-presence.html" className="absolute inset-0 bg-cover bg-center company-slide-2 transition-opacity duration-1000 cursor-pointer" style={{ backgroundImage: `url('${getImage('assets/globalpresencehero.jpg', 'assets/globalpresencehero.jpg')}')` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                              <h3 className="text-white font-bold text-xl mb-1">Global Presence</h3>
                              <p className="text-white/80 text-sm">We are expanding healthcare solutions worldwide.</p>
                            </div>
                          </a>
                          <a href="careers.html" className="absolute inset-0 bg-cover bg-center company-slide-3 transition-opacity duration-1000 cursor-pointer" style={{ backgroundImage: `url('${getImage('assets/careershero.png', 'assets/careershero.png')}')` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                              <h3 className="text-white font-bold text-xl mb-1">Careers</h3>
                              <p className="text-white/80 text-sm">Join our team and make a difference.</p>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side — hamburger on mobile, empty spacer on desktop */}
              <div className="w-auto sm:w-[180px] shrink-0 flex items-center justify-end">
                <button
                  className={`lg:hidden p-2 rounded-md transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-white hover:text-white/70'}`}
                  onClick={() => setIsMobileMenuOpen(o => !o)}
                  aria-label="Toggle menu"
                >
                  <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile Sidebar Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed top-[80px] left-0 w-full bg-white shadow-xl border-t border-gray-100 z-[200] overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
              <div className="flex flex-col px-4 py-4 pb-12">
                <a href="/" className="flex items-center px-3 py-3.5 text-[15px] font-semibold text-primary border-b border-gray-100">Home</a>
                <a href="order-medicines.html" className="flex items-center px-3 py-3.5 text-[15px] font-semibold text-gray-700 border-b border-gray-100 hover:text-primary transition">Order Medicines</a>

                {/* Product Range accordion */}
                <div className="border-b border-gray-100">
                  <button onClick={() => setMobileProductsOpen(o => !o)} className="w-full flex items-center justify-between px-3 py-3.5 text-[15px] font-semibold text-gray-700 hover:text-primary transition">
                    <span>Product Range</span>
                    <i className={`fa-solid fa-chevron-down text-[11px] text-gray-400 transition-transform duration-300 ${mobileProductsOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  {mobileProductsOpen && (
                    <div className="px-2 pb-3">
                      {accordionSections.length > 0 ? (
                        accordionSections.map((sec) => (
                          <React.Fragment key={sec.title}>
                            <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">{sec.title}</p>
                            {sec.subcategories.map((sub) => {
                              const subslug = getSubcategorySlug(sub);
                              return (
                                <a key={sub} href={`product-range.html?category=${subslug}`} className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">
                                  {sub}
                                </a>
                              );
                            })}
                          </React.Fragment>
                        ))
                      ) : (
                        <>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Oncology (Solid Tumors)</p>
                          <a href="product-range.html?category=breast-cancer" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Breast Cancer</a>
                          <a href="product-range.html?category=ovarian-cancer" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Ovarian Cancer</a>
                          <a href="product-range.html?category=lung-cancer" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Non-Small Cell Lung Cancer</a>
                          <a href="product-range.html?category=prostate-cancer" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Prostate Cancer</a>
                          <a href="product-range.html?category=colorectal-cancer" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Colorectal Cancer</a>
                          <a href="product-range.html?category=pancreatic-cancer" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Pancreatic Cancer</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Hematology</p>
                          <a href="product-range.html?category=aml" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Acute Myeloid Leukemia</a>
                          <a href="product-range.html?category=cml" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Chronic Myeloid Leukemia</a>
                          <a href="product-range.html?category=lymphoma" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Hodgkin / Non-Hodgkin's Lymphoma</a>
                          <a href="product-range.html?category=sickle-cell" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Sickle Cell Anemia</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Anti-Infectives</p>
                          <a href="product-range.html?category=respiratory" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Respiratory Infections</a>
                          <a href="product-range.html?category=uti" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Urinary Tract Infections</a>
                          <a href="product-range.html?category=skin-infections" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Skin and Soft Tissue Infections</a>
                          <a href="product-range.html?category=bone-infections" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Bone and Joint Infections</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Endocrinology</p>
                          <a href="product-range.html?category=endometriosis" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Endometriosis</a>
                          <a href="product-range.html?category=fibrocystic" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Fibrocystic Breast Disease</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Orthopedic</p>
                          <a href="product-range.html?category=multiple-myeloma" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Multiple Myeloma</a>
                          <a href="product-range.html?category=osteoporosis" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Osteoporosis</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Cardiology</p>
                          <a href="product-range.html?category=arrhythmia" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Arrhythmia Management</a>
                          <a href="product-range.html?category=hypertension" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Hypertension / Angina</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Neuro-Oncology</p>
                          <a href="product-range.html?category=glioblastoma" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Glioblastoma Multiforme</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Respiratory - Allergy</p>
                          <a href="product-range.html?category=allergic-rhinitis" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Seasonal Allergic Rhinitis</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Nephrology - Renal</p>
                          <a href="product-range.html?category=kidney-disease" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Chronic Kidney Disease</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Pain Management</p>
                          <a href="product-range.html?category=pain" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Chronic Pain</a>
                          <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">Rheumatology</p>
                          <a href="product-range.html?category=rheumatology" className="block pl-5 py-2 text-[13px] text-gray-600 hover:text-primary transition">Inflammatory Disorders</a>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <a href="meditations.html" className="flex items-center px-3 py-3.5 text-[15px] font-semibold text-gray-700 border-b border-gray-100 hover:text-primary transition">Meditations</a>
                <a href="about-us.html" className="flex items-center px-3 py-3.5 text-[15px] font-semibold text-gray-700 border-b border-gray-100 hover:text-primary transition">About Us</a>
                <a href="contact-us.html" className="flex items-center px-3 py-3.5 text-[15px] font-semibold text-gray-700 border-b border-gray-100 hover:text-primary transition">Contact Us</a>

                {/* Company accordion */}
                <div className="border-b border-gray-100">
                  <button onClick={() => setMobileCompanyOpen(o => !o)} className="w-full flex items-center justify-between px-3 py-3.5 text-[15px] font-semibold text-gray-700 hover:text-primary transition">
                    <span>Company</span>
                    <i className={`fa-solid fa-chevron-down text-[11px] text-gray-400 transition-transform duration-300 ${mobileCompanyOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  {mobileCompanyOpen && (
                    <div className="px-2 pb-3 space-y-0.5">
                      <a href="services.html" className="block pl-5 py-2.5 text-[14px] font-medium text-gray-600 hover:text-primary transition">Our Services</a>
                      <a href="global-presence.html" className="block pl-5 py-2.5 text-[14px] font-medium text-gray-600 hover:text-primary transition">Global Presence</a>
                      <a href="csr.html" className="block pl-5 py-2.5 text-[14px] font-medium text-gray-600 hover:text-primary transition">CSR</a>
                      <a href="careers.html" className="block pl-5 py-2.5 text-[14px] font-medium text-gray-600 hover:text-primary transition">Careers</a>
                      <a href="ungc.html" className="block pl-5 py-2.5 text-[14px] font-medium text-gray-600 hover:text-primary transition">United Nations Global Compact</a>
                      <a href="/articles" className="block pl-5 py-2.5 text-[14px] font-medium text-gray-600 hover:text-primary transition">Articles</a>
                      <div className="pl-5 pt-2 pb-1">
                        <a href="careers.html#join-form"
                          className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-md"
                          style={{ background: 'linear-gradient(135deg, #61A644, #1D9FDA)' }}>
                          Join Us
                        </a>
                      </div>
                      <a href="pap.html" className="block pl-5 py-1">
                        <img src={getImage('assets/PAPlogo.png', 'assets/PAPlogo.png')} alt="Patient Assistance Program" className="h-12 w-auto object-contain" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Content Area */}
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex-grow flex items-center justify-center pt-20 md:pt-36 pb-12 md:pb-20 text-center">
          <div className="max-w-3xl space-y-6 reveal active mx-auto flex flex-col items-center">
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-[10px] md:text-xs">
              Best For Your Health & Recovery.
            </span>
            <h1 className="text-3xl md:text-[42px] lg:text-5xl font-semibold text-white leading-tight tracking-tight">
              Life-Saving Access. <br />
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent md:whitespace-nowrap">Redefining Healthcare Possibilities.</span>
            </h1>
            <p className="text-white/85 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              Getmeds is a global pharmaceutical company advancing healthcare access in the Philippines through high-quality medicines from essential therapies to advanced hospital treatments.

            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <a href="order-medicines.html" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white text-center font-bold uppercase tracking-wider text-[11px] px-6 py-3 rounded-lg shadow-2xl shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group">
                Our Solutions <i className="fa-solid fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
              </a>
              <button onClick={() => setIsInquiryOpen(true)} className="bg-white/10 hover:bg-white hover:text-dark backdrop-blur-sm border border-white text-center font-bold uppercase tracking-wider text-[11px] px-6 py-3 rounded-lg text-white transition-all flex items-center justify-center gap-2">
                Become a Partner <i className="fa-solid fa-phone"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Numbers (Clean, without cards, directly under hero) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Stat 1 */}
        <div className="flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group">
          <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            <AnimatedCounter end={2000} suffix="+" />
          </h3>
          <p className="text-gray-600 font-bold text-sm md:text-base leading-tight">Molecules in portfolio</p>
        </div>

        {/* Stat 2 */}
        <div className="flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group">
          <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            <AnimatedCounter end={10000} suffix="+" />
          </h3>
          <p className="text-gray-600 font-bold text-sm md:text-base leading-tight">Pharmacies nationwide</p>
        </div>

        {/* Stat 3 */}
        <div className="flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group">
          <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
            <AnimatedCounter end={500} suffix="+" />
          </h3>
          <p className="text-gray-600 font-bold text-sm md:text-base leading-tight">Hospitals served</p>
        </div>

        {/* Stat 4 */}
        <div className="flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group">
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
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-900 leading-tight tracking-tight">
              Patient First. <br />
              Raising the standard <br />
              <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent">for Filipino care.</span>
            </h2>
          </div>

          {/* Right Column: Description */}
          <div className="flex flex-col justify-center max-w-lg md:pt-10">
            <p className="text-gray-500 leading-relaxed text-sm md:text-[15px]">
              A box of medicine isn't a product. It's a stage-IV oncology mother in Cebu waiting for her next dose. A child in Mindanao fighting leukemia. A father in Quezon City heading into surgery, trusting that the anesthesia is ready. Getmeds exists so distance, cost, and complexity never decide who lives.
            </p>
          </div>
        </div>

        {/* Bottom Area: Images & Floating Button */}
        <div className="relative mt-8">
          {/* Floating Button Cutout Style */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-white p-2.5 rounded-full">
              <a href="/about-us" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] text-white font-bold text-sm px-8 py-3 rounded-full transition-transform hover:opacity-90 inline-block whitespace-nowrap">
                Learn More
              </a>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-[220px] md:h-[280px] lg:h-[340px]">
              <img
                src={getImage('assets/patientfirst.jpg', 'assets/patientfirst.jpg')}
                alt="Medical Professional"
                className="w-full h-full object-cover object-center rounded-[24px] shadow-lg"
              />
            </div>
            <div className="h-[220px] md:h-[280px] lg:h-[340px]">
              <img
                src={getImage('assets/patientsecond.jpg', 'assets/patientsecond.jpg')}
                alt="Medical Facility"
                className="w-full h-full object-cover object-center rounded-[24px] shadow-lg"
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
            <span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent font-bold uppercase tracking-widest text-lg">Our Portfolio</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Our pharmaceutical portfolio —<span className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] bg-clip-text text-transparent inline-block">from essential medicines to advanced therapies.</span>
            </h2>
            <p className="text-gray-500 text-[15px]">
              Most distributors operate in one layer of the market. Getmeds is built for all four layers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* Card 1: Foundation */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-pills text-3xl text-[#1D9FDA] mb-4 block"></i>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Foundation</h4>
              <p className="text-sm font-bold text-gray-500 mb-1">Everyday medicines, never out of reach.</p>
              <p className="text-sm text-gray-500">Branded generics and essential medicines.</p>
            </div>

            {/* Card 2: Acceleration */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-bolt text-3xl text-[#61A644] mb-4 block"></i>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Acceleration</h4>
              <p className="text-sm font-bold text-gray-500 mb-1">Smarter therapies, faster access.</p>
              <p className="text-sm text-gray-500">Off-patent molecules, fixed-dose combinations, and new delivery systems.</p>
            </div>

            {/* Card 3: Frontier */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <i className="fa-solid fa-microscope text-3xl text-[#5533FF] mb-4 block"></i>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Frontier</h4>
              <p className="text-sm font-bold text-gray-500 mb-1">Advanced therapies, within reach.</p>
              <p className="text-sm text-gray-500">Oncology, hematology, specialty medicines and rare disease.</p>
            </div>

            {/* Card 4: Beyond the molecule */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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
        const therapCards = [
          { name: "Oncology", badge: "50+ Products", img: getImage("assets/oncology.jpg", "assets/oncology.jpg"), marquee: "Breast Cancer • Ovarian Cancer • Non-Small Cell Lung Cancer • Prostate Cancer • Colorectal Cancer • Pancreatic Cancer • ", link: "product-range.html?category=oncology" },
          { name: "Cardiology", badge: "35+ Products", img: getImage("assets/cardiology.jpg", "assets/cardiology.jpg"), marquee: "Arrhythmia Management • Hypertension/Angina • Heart Failure • Atrial Fibrillation • Coronary Artery Disease • ", link: "product-range.html?category=cardiology" },
          { name: "Neurology", badge: "40+ Products", img: getImage("assets/neurology.jpg", "assets/neurology.jpg"), marquee: "Glioblastoma Multiforme • Chronic Pain • Inflammatory Disorders • Osteoporosis • Multiple Myeloma • Neuro-Oncology • ", link: "product-range.html?category=neuro-oncology" },
          { name: "Hematology", badge: "60+ Products", img: getImage("assets/hematology.jpg", "assets/hematology.jpg"), marquee: "Acute Myeloid Leukemia • Chronic Myeloid Leukemia • Hodgkin/Non-Hodgkin's Lymphoma • Sickle Cell Anemia • ", link: "product-range.html?category=hematology" },
          { name: "Anti-Infectives", badge: "45+ Products", img: getImage("assets/anti-infectives.jpg", "assets/anti-infectives.jpg"), marquee: "Respiratory Infections • Urinary Tract Infections • Skin and Soft Tissue Infections • Bone and Joint Infections • ", link: "product-range.html?category=anti-infectives" },
          { name: "Endocrinology", badge: "30+ Products", img: getImage("assets/endocrinology.jpg", "assets/endocrinology.jpg"), marquee: "Endometriosis • Fibrocystic Breast Disease • Diabetes Management • Thyroid Disorders • Metabolic Syndrome • ", link: "product-range.html?category=endocrinology" },
          { name: "Orthopedic", badge: "25+ Products", img: getImage("assets/orthopedic.jpg", "assets/orthopedic.jpg"), marquee: "Multiple Myeloma • Osteoporosis • Joint Replacement Support • Fracture Recovery • Bone Metastases • ", link: "product-range.html?category=orthopedic" },
          { name: "Respiratory", badge: "35+ Products", img: getImage("assets/respiratory.jpg", "assets/respiratory.jpg"), marquee: "Seasonal Allergic Rhinitis • Asthma • COPD • Bronchitis • Pulmonary Hypertension • Chronic Kidney Disease • ", link: "product-range.html?category=respiratory" },
          { name: "Essential Medicines", badge: "100+ Products", img: getImage("assets/essential-medicines.jpg", "assets/essential-medicines.jpg"), marquee: "Generic Medicines • OTC Products • Vitamins & Supplements • First-line Treatments • Essential Drug List • ", link: "product-range.html" },
          { name: "Biologicals & Vaccines", badge: "20+ Products", img: getImage("assets/biologicals-vaccines.jpg", "assets/biologicals-vaccines.jpg"), marquee: "Hepatitis B • HPV • Influenza • Pneumococcal • Monoclonal Antibodies • Biosimilars • ", link: "product-range.html" },
          { name: "Medical Devices", badge: "50+ Devices", img: getImage("assets/medical-devices.jpg", "assets/medical-devices.jpg"), marquee: "Diagnostic Equipment • Surgical Instruments • Patient Monitoring • Infusion Devices • Wound Care • ", link: "product-range.html" },
          { name: "Rare Diseases", badge: "15+ Products", img: getImage("assets/rare-diseases.jpg", "assets/rare-diseases.jpg"), marquee: "Orphan Drugs • Enzyme Replacement Therapy • Gene Therapy • Ultra-rare Conditions • Patient Programs • ", link: "product-range.html" },
        ];
        const totalPages = Math.ceil(therapCards.length / 4);
        return (
          <section className="py-12 px-6 reveal">
            <div className="max-w-7xl mx-auto bg-gray-100 rounded-3xl p-8">
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 max-w-md leading-tight">Therapeutic areas we serve across the Philippines.</h2>
              </div>

              {/* Slider */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${therapPage * 100}%)` }}
                >
                  {Array.from({ length: totalPages }).map((_, pageIdx) => (
                    <div key={pageIdx} className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {therapCards.slice(pageIdx * 4, pageIdx * 4 + 4).map((card) => (
                        <div key={card.name} className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer">
                          <img src={card.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={card.name} />
                          <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
                            <span className="text-xs text-gray-700 font-medium">{card.badge}</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">{card.name}</h3>
                            <div className="overflow-hidden mb-1">
                              <div className="marquee-track">
                                <span className="text-white/75 text-xs pr-6">{card.marquee}</span>
                                <span className="text-white/75 text-xs pr-6">{card.marquee}</span>
                              </div>
                            </div>
                            <a href={card.link} className="text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-3 py-1 transition-colors">See All</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between mt-6">
                <button className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white text-sm font-medium rounded-full px-6 py-2.5 transition-opacity">View more</button>
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
          </section>
        );
      })()}

      {/* Capabilities Bento Section */}
      <section className="py-16 px-6 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
              Capabilities that move{' '}
              <span className="bg-gradient-to-r from-primary via-green-400 to-blue-500 bg-clip-text text-transparent">
                medicines, partnerships, and patients forward.
              </span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Getmeds operates a full-stack pharmaceutical platform — from global sourcing and regulatory compliance to last-mile distribution, government access, and digital health.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#e8effe] via-[#eef1fd] to-[#ede8fb] rounded-3xl p-5">
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
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-earth-americas text-white text-lg"></i>
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
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-shield-halved text-white text-lg"></i>
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-truck text-white text-base"></i>
                  </div>
                </div>
              </div>

              {/* Card 4: Sales */}
              <div className="col-span-6 md:col-span-2 bg-gradient-to-br from-white to-orange-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Sales and Distribution</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">5,000+ pharmacy and 500+ hospital accounts served through dedicated nationwide sales teams.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none opacity-[0.08]">
                  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => <circle key={`${r}-${c}`} cx={10 + c * 16} cy={10 + r * 16} r="2" fill="#f97316" />))}
                  </svg>
                </div>
                <div className="absolute bottom-5 right-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-store text-white text-base"></i>
                  </div>
                </div>
              </div>

              {/* Card 5: Gov Bidding */}
              <div className="col-span-6 md:col-span-2 bg-gradient-to-br from-white to-indigo-100/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Government Bidding & Public Sector Access</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">DOH, LGU, and PhilHealth tender participation with full documentation and compliance support.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none opacity-[0.08]">
                  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => <circle key={`${r}-${c}`} cx={10 + c * 16} cy={10 + r * 16} r="2" fill="#6366f1" />))}
                  </svg>
                </div>
                <div className="absolute bottom-5 right-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-landmark text-white text-base"></i>
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
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-hand-holding-medical text-white text-lg"></i>
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
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-certificate text-white text-lg"></i>
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
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-globe text-white text-lg"></i>
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
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-microchip text-white text-lg"></i>
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
          { icon: 'fa-heart-pulse', accent: '#F43F5E', title: 'Patient support programs', desc: 'Adherence, access, affordability.' },
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
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-14 max-w-xl">
                Why hospitals and pharmacies choose{' '}
                <span className="bg-gradient-to-r from-[#1D9FDA] to-[#61A644] bg-clip-text text-transparent">Getmeds.</span>
              </h2>

              {/* 4 feature columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 pt-10 border-t border-gray-100">
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
          <div className="mb-14 text-center">
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
              <div key={i} className="text-center">
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
                  <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-4">
                    Frequently asked<br />
                    <span className="bg-gradient-to-r from-[#1D9FDA] to-[#61A644] bg-clip-text text-transparent">questions.</span>
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Everything you need to know about Getmeds and our services.
                  </p>
                </div>

                {/* RIGHT — accordion */}
                <div className="flex-1 flex flex-col gap-3">
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
                      {i === openFaq && (
                        <p className="text-gray-500 text-sm leading-relaxed mt-3">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>
        );
      })()}

      {/* News & Insights Section */}
      <section className="py-10 px-6 bg-white reveal">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl p-7" style={{
            background: 'linear-gradient(120deg, #fdf0e8 0%, #c8e8f5 55%, #7ab3d4 100%)',
          }}>

            {/* Header */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[13px] font-semibold tracking-wide text-gray-400 mb-0.5 block">Partners</span>
                <span className="text-[13px] font-semibold tracking-wide mb-1.5 block" style={{
                  background: 'linear-gradient(135deg,#1D9FDA,#61A644)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block'
                }}>News and Insights</span>
                <h2 className="text-2xl font-bold text-gray-900">What's new at Getmeds.</h2>
              </div>
              <a href="articles.html" className="bg-gradient-to-r from-[#61A644] to-[#1D9FDA] hover:opacity-90 text-white text-sm font-medium rounded-full px-6 py-2.5 transition-opacity shrink-0">View All</a>
            </div>

            {/* 3 Article Cards — Dynamic from Sanity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(newsItems && newsItems.length > 0 ? newsItems.slice(0, 3) : []).map((article) => {
                const imgUrl = article.image
                  ? urlFor(article.image).width(800).url()
                  : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800';
                return (
                  <a key={article._id} href={`/article-detail?id=${article._id}`} className="relative rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group block" style={{ height: '460px' }}>

                    {/* Full background image */}
                    <img src={imgUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={article.title} />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.55) 45%, rgba(10,15,30,0.15) 100%)' }}></div>

                    {/* Content pinned to bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">

                      {/* Title + read time pill */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-white font-bold text-base leading-snug">{article.title}</h3>
                        {article.readTime && (
                          <div className="flex-shrink-0 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
                            {article.readTime}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-white/65 text-[12px] leading-relaxed mb-3 line-clamp-2">{article.description}</p>

                      {/* Category tag */}
                      <div className="flex gap-2 mb-4">
                        <span className="text-white text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}>{article.tag}</span>
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

          </div>
        </div>
      </section>


      {/* Footer Component Placeholder */}
      <div id="footer-container" />

      {/* Slide-out Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isInquiryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsInquiryOpen(false)}
      ></div>

      {/* Slide-out Drawer Panel */}
      <div
        className={`fixed top-4 right-4 h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md bg-white shadow-2xl rounded-[15px] z-[60] transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-y-auto ${isInquiryOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'}`}
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
            <h2 className="text-[28px] font-bold text-slate-900 mb-1 leading-tight tracking-tight">Partner with Getmeds</h2>
            <h3 className="text-sm font-medium text-primary mb-4">Advancing Healthcare Together</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed text-justify">
              Join Getmeds in expanding access to quality medicines and innovative healthcare solutions across the Philippines and beyond. We'd like to hear from you.
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
              <input type="tel" required placeholder="e.g. +63 912 345 6789"
                value={partnershipData.phone}
                onChange={e => setPartnershipData(prev => ({ ...prev, phone: e.target.value }))}
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
    </div>
  );
}
