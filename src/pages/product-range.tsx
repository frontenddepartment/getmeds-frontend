import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useProducts, useCategories } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';
import type { Product as SanityProduct, Category } from '../types/sanity';

interface ProductWithCategory extends Omit<SanityProduct, 'category'> {
  category?: Category;
}


const ITEMS_PER_PAGE = 12;

const SidebarSkeleton = () => (
  <div className="animate-pulse space-y-4 py-4 px-6">
    <div className="h-5 bg-gray-200 rounded-full w-1/2 mb-6" />
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex justify-between items-center py-2">
        <div className="h-4 bg-gray-100 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-4" />
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl" />
          <div className="space-y-2 flex-grow">
            <div className="h-4 bg-gray-100 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2" />
          </div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full w-24" />
        <div className="h-4 bg-gray-100 rounded-full w-16" />
        <div className="h-8 bg-gray-100 rounded-full w-24" />
      </div>
    ))}
  </div>
);

const categoryIcons: Record<string, string> = {
  'Oncology': 'fa-ribbon',
  'Hematology': 'fa-droplet',
  'Obstetrician': 'fa-baby',
  'Gynecology': 'fa-venus',
  'Endocrinology': 'fa-syringe',
  'Anti-Infectives': 'fa-shield-virus',
  'Orthopedic': 'fa-bone',
  'Cardiology': 'fa-heart-pulse',
  'Neuro-Oncology': 'fa-brain',
  'Respiratory': 'fa-lungs',
  'Allergy': 'fa-hand-dots',
  'Nephrology': 'fa-kidneys',
  'Renal': 'fa-droplet',
  'Pain Management': 'fa-pills',
  'Rheumatology': 'fa-person-walking',
  'Radiology': 'fa-x-ray',
};

export default function ProductRange() {
  const { data: productsDataRaw, loading: productsLoading } = useProducts();
  const productsData = productsDataRaw as ProductWithCategory[] | null;
  const { data: categoriesData, loading: categoriesLoading } = useCategories();

  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('Popularity');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'usage' | 'precautions'>('description');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [searchHistoryCleared, setSearchHistoryCleared] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFlyoutCat, setActiveFlyoutCat] = useState<any | null>(null);
  const [flyoutVisible, setFlyoutVisible] = useState(false);

  const openFlyout = (cat: any) => {
    if (activeFlyoutCat?.name === cat.name && flyoutVisible) {
      setFlyoutVisible(false);
      setTimeout(() => setActiveFlyoutCat(null), 450);
      return;
    }
    setFlyoutVisible(false);
    setActiveFlyoutCat(cat);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyoutVisible(true);
      });
    });
  };

  const closeFlyout = () => {
    setFlyoutVisible(false);
    setTimeout(() => setActiveFlyoutCat(null), 450);
  };

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html')
        .then(r => r.text())
        .then(html => { navContainer.innerHTML = html; });
    }
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html')
        .then(r => r.text())
        .then(html => { footerContainer.innerHTML = html; });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('search');
    if (query) setSearchTerm(query);

    const handleClick = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const getProductPrice = (p: ProductWithCategory) => {
    const nameLower = p.name?.toLowerCase() || '';
    if (nameLower.includes('cytarabine')) return 1840;
    if (nameLower.includes('docetaxel')) return 560;
    if (nameLower.includes('capecitabine')) return 1150;
    if (nameLower.includes('letrozole')) return 8900;
    if (nameLower.includes('temozolomide')) return 12450;
    return undefined; // Quote on Request
  };

  const getProductImage = (p: ProductWithCategory) => {
    if (p.image && p.image.asset) {
      try {
        return urlFor(p.image).width(120).height(120).url();
      } catch (err) {
        console.error('Error generating image URL:', err);
      }
    }
    return 'assets/no-image.png';
  };

  const sidebarCategories = useMemo(() => {
    if (!categoriesData || !productsData) return [];

    const subCategoriesByCategoryId = new Map<string, Set<string>>();
    productsData.forEach(p => {
      const catId = p.category?._id;
      if (catId && p.subCategory) {
        if (!subCategoriesByCategoryId.has(catId)) {
          subCategoriesByCategoryId.set(catId, new Set());
        }
        subCategoriesByCategoryId.get(catId)!.add(p.subCategory);
      }
    });

    return categoriesData.map(cat => {
      const subSet = subCategoriesByCategoryId.get(cat._id);
      const subItems = subSet
        ? Array.from(subSet).sort().map(sub => ({ label: sub }))
        : [];
      return {
        _id: cat._id,
        name: cat.category,
        subItems
      };
    }).filter(cat => cat.subItems.length > 0 || productsData.some(p => p.category?._id === cat._id));
  }, [categoriesData, productsData]);

  const getFiltered = (category: string) => {
    if (!productsData) return [];
    return productsData.filter(p => {
      if (category === 'All') return true;
      if (p.category?.category === category) return true;
      if (p.subCategory === category) return true;
      return false;
    });
  };

  const categoryFiltered = getFiltered(currentCategory);
  const searchFiltered = searchTerm
    ? categoryFiltered.filter(p => {
        const search = searchTerm.toLowerCase();
        return (
          p.name?.toLowerCase().includes(search) ||
          (p.brandName && p.brandName.toLowerCase().includes(search)) ||
          (p.genericName && p.genericName.toLowerCase().includes(search)) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(search))
        );
      })
    : categoryFiltered;

  const sorted = [...searchFiltered].sort((a, b) => {
    const priceA = getProductPrice(a);
    const priceB = getProductPrice(b);
    if (sortBy === 'Price: Low to High') {
      if (priceA === undefined) return 1;
      if (priceB === undefined) return -1;
      return priceA - priceB;
    }
    if (sortBy === 'Price: High to Low') {
      if (priceA === undefined) return 1;
      if (priceB === undefined) return -1;
      return priceB - priceA;
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleCat = (name: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectCategory = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
  };

  const openModal = (product: ProductWithCategory) => {
    setSelectedProduct(product);
    setActiveTab('description');
    setFormData({ name: '', phone: '', email: '', message: '' });
    setUploadedFiles([]);
    setSubmitState('idle');
    setModalOpen(true);
    setTimeout(() => setModalVisible(true), 10);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalOpen(false), 300);
    document.body.style.overflow = 'auto';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFiles(Array.from(e.target.files));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState('sending');
    const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
    const filesData: { name: string; type: string; base64: string }[] = [];
    for (const file of uploadedFiles) {
      try {
        const base64 = await fileToBase64(file);
        filesData.push({ name: file.name, type: file.type, base64 });
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }
    const payload = { productName: selectedProduct?.name, ...formData, files: filesData };
    try {
      if (!SCRIPT_URL || SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setSubmitState('sent');
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 2000);
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || isNaN(price)) return 'Quote on Request';
    return price.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
  };

  const getPageRange = (current: number, total: number): (number | string)[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...'); pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1); pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      pages.push(current - 1); pages.push(current); pages.push(current + 1);
      pages.push('...'); pages.push(total);
    }
    return pages;
  };

  const scrollToTable = () => {
    if (tableRef.current) tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isCatParentActive = (cat: any) =>
    cat.subItems.some((s: any) => s.label === currentCategory) || cat.name === currentCategory;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased flex flex-col h-screen overflow-hidden">
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .sidebar-scroll::-webkit-scrollbar-button { display: none; }
      `}</style>

      {/* NAVBAR */}
      <div id="navbar-container" className="shrink-0 z-[50]" />

      {/* BODY ROW */}
      <div className="flex flex-1 min-h-0 relative">

        {/* SIDEBAR */}
        <aside
          className="shrink-0 overflow-y-auto z-40 hidden lg:flex flex-col bg-white border-r border-gray-100 sidebar-scroll relative"
          style={{ width: sidebarOpen ? '256px' : '0px', minWidth: 0, transition: 'width 0.3s ease', overflow: sidebarOpen ? 'auto' : 'hidden' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 whitespace-nowrap flex items-center justify-between">
            <p className="text-[15px] font-semibold text-gray-500">Categories</p>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <i className="fa-solid fa-chevron-left text-[15px] text-gray-500" />
            </button>
          </div>
          <nav className="px-3 py-3 space-y-0.5">
            <button
              onClick={() => selectCategory('All')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-200"
              style={currentCategory === 'All' && !flyoutVisible
                ? { background: 'linear-gradient(to right, #61A644, #1D9FDA)', color: '#fff' }
                : { color: '#374151' }}
            >
              <span>All Products</span>
            </button>
            {categoriesLoading ? (
              <SidebarSkeleton />
            ) : (
              sidebarCategories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => openFlyout(cat)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-200 hover:bg-gray-50 group"
                  style={(flyoutVisible ? activeFlyoutCat?.name === cat.name : isCatParentActive(cat))
                    ? { background: 'linear-gradient(to right, #61A644, #1D9FDA)', color: '#fff' }
                    : { color: '#374151' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <i className={`fa-solid ${categoryIcons[cat.name] || 'fa-folder'} text-[14px] shrink-0 ${(flyoutVisible ? activeFlyoutCat?.name === cat.name : isCatParentActive(cat)) ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
                    <span className="text-left leading-snug truncate">{cat.name}</span>
                  </div>
                  <i className={`fa-solid fa-chevron-right text-[9px] shrink-0 ${(flyoutVisible ? activeFlyoutCat?.name === cat.name : isCatParentActive(cat)) ? 'text-white/70' : 'text-gray-400'}`} />
                </button>
              ))
            )}
          </nav>
        </aside>

        {/* FLYOUT BACKDROP */}
        {activeFlyoutCat && (
          <div
            className="absolute inset-0 z-20"
            style={{
              backdropFilter: flyoutVisible ? 'blur(4px)' : 'blur(0px)',
              background: flyoutVisible ? 'rgba(0,0,0,0.08)' : 'transparent',
              transition: 'backdrop-filter 0.4s ease, background 0.4s ease',
            }}
            onClick={closeFlyout}
          />
        )}

        {/* FLYOUT SUBCATEGORY PANEL */}
        {activeFlyoutCat && (
          <div
            className="absolute z-30 bg-white shadow-2xl flex flex-col sidebar-scroll overflow-y-auto"
            style={{
              left: (sidebarOpen ? 256 : 0) + 12,
              top: '12px',
              bottom: '12px',
              width: '250px',
              borderRadius: '15px',
              transform: flyoutVisible ? 'translateX(0)' : 'translateX(-48px)',
              opacity: flyoutVisible ? 1 : 0,
              transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease',
            }}
          >
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <p className="font-semibold text-gray-800 text-[13px] leading-snug">{activeFlyoutCat.name}</p>
              <button onClick={closeFlyout} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-gray-500 text-[16px]" />
              </button>
            </div>
            <div className="px-2 py-2 space-y-0.5">
              {activeFlyoutCat.subItems.map((sub: any, si: number) => (
                <button
                  key={si}
                  onClick={() => { selectCategory(sub.label); closeFlyout(); }}
                  className="w-full text-left px-3 py-2.5 rounded-[8px] text-[13.5px] transition-all duration-150 hover:bg-gray-50"
                  style={currentCategory === sub.label
                    ? { color: '#1D9FDA', fontWeight: 700, background: '#EFF8FF' }
                    : { color: '#6B7280' }}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CONTENT COLUMN */}
        <div className="flex-1 min-w-0 overflow-y-auto" style={{ transition: 'all 0.3s ease' }}>

          {/* Hero Banner */}
          <section className="w-full px-4 md:px-6 pt-5 pb-4">
            <div
              className="relative rounded-[15px] overflow-hidden flex items-center px-8 md:px-12"
              style={{ background: 'linear-gradient(120deg, #3aaf5c 0%, #1a99d6 100%)', minHeight: '130px' }}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.12)', filter: 'blur(40px)' }} />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none" style={{ width: '220px', height: '90px' }}>
                {[
                  { right: '160px', rotate: '-14deg', opacity: 0.35 },
                  { right: '110px', rotate: '-7deg',  opacity: 0.50 },
                  { right: '58px',  rotate: '-1deg',  opacity: 0.65 },
                  { right: '0px',   rotate:  '6deg',  opacity: 0.45 },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="absolute w-16 h-[86px] rounded-2xl"
                    style={{
                      right: s.right,
                      top: '50%',
                      transform: `translateY(-50%) rotate(${s.rotate})`,
                      background: `rgba(255,255,255,${s.opacity})`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    }}
                  />
                ))}
              </div>
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors"
                  title="Expand sidebar"
                >
                  <i className="fa-solid fa-chevron-right text-[13px] text-white" />
                </button>
              )}
              <div className={`relative z-10 transition-all duration-300 ${!sidebarOpen ? 'pl-8' : ''}`}>
                <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
                  GetMEDS Products
                </h1>
                <p className="text-white/75 text-[13px] mt-1 font-medium">Comprehensive catalog of pharmaceutical solutions.</p>
                <p className="text-white/60 text-[12px] font-medium">Browse categories and send inquiries directly.</p>
              </div>
            </div>
          </section>

          {/* PRODUCTS LIST */}
          <section className="px-4 sm:px-6 lg:px-8 mb-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">
                {currentCategory === 'All' ? 'All Products' : currentCategory}{' '}
                <span className="text-gray-400 font-normal text-sm ml-2">({sorted.length} Items)</span>
              </h2>

              {/* Search Bar */}
              <div className="relative w-full max-w-md mx-4" ref={searchWrapperRef}>
                <div className="bg-white rounded-full py-1 px-1.5 border border-gray-200 flex items-center">
                  <div className="relative flex-grow flex items-center ml-3">
                    <i className="fa-solid fa-magnifying-glass text-gray-400 text-[13px]" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full bg-transparent border-none pl-2.5 pr-2 py-1.5 text-[13px] text-gray-700 outline-none placeholder-gray-400"
                    />
                  </div>
                  <button className="h-7 w-7 bg-primary rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors duration-300 flex-shrink-0 active:scale-95 group">
                    <i className="fa-solid fa-sliders text-[10px] group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h4 className="text-[12px] font-medium text-gray-500">Recent Searches</h4>
                      <button
                        onClick={() => setSearchHistoryCleared(true)}
                        className="text-[11px] font-bold text-primary hover:text-blue-700 transition"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1 mb-4">
                      {!searchHistoryCleared ? (
                        <div className="flex items-center justify-between p-2 hover:bg-blue-50/50 rounded-xl cursor-pointer group transition">
                          <div className="flex items-center gap-2">
                            <i className="fa-solid fa-clock-rotate-left text-gray-300 text-[11px]" />
                            <span className="text-[13px] text-gray-600 font-medium">Oncology Medicines</span>
                          </div>
                          <i className="fa-solid fa-xmark text-gray-300 hover:text-red-500 text-[10px] transition opacity-0 group-hover:opacity-100" />
                        </div>
                      ) : (
                        <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                          <i className="fa-solid fa-ghost text-gray-300 text-2xl mb-3 block" />
                          <p className="text-xs font-semibold text-gray-400">No search history found</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h4 className="text-[12px] font-medium text-gray-500">Suggested</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-3 p-2 hover:bg-blue-50/50 rounded-xl cursor-pointer transition group">
                        <div className="w-10 h-10 bg-white border border-gray-100 p-1.5 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src="assets/CYTAGET.png" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-300" alt="Cytarabine" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-gray-800">Cytarabine</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">₱ 1,840.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[13px] text-gray-500 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="appearance-none bg-white border border-blue-200 hover:border-primary rounded-full pl-4 pr-8 py-1.5 text-[13px] font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                  >
                    <option>Popularity</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
                    <i className="fa-solid fa-chevron-down text-[10px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div ref={tableRef} className="overflow-x-auto bg-white rounded-[10px] border border-gray-100 shadow-sm">
              {productsLoading ? (
                <TableSkeleton />
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Product</th>
                      <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Category</th>
                      <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Price</th>
                      <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginated.map((p, i) => {
                      const displayName = p.brandName && p.genericName && p.brandName !== p.genericName
                        ? `${p.brandName} (${p.genericName})`
                        : p.name || p.brandName || p.genericName || 'Unnamed Product';
                      const productPrice = getProductPrice(p);
                      const displayPrice = formatPrice(productPrice);

                      return (
                        <tr key={p._id || i} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                                <img
                                  src={getProductImage(p)}
                                  alt={displayName}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=PHARMA'; }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span
                                  className="text-[14px] font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer"
                                  onClick={() => openModal(p)}
                                >
                                  {displayName}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  Available: <span className="text-success font-bold">In Stock</span>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">
                            {p.subCategory || p.category?.category || 'General'}
                          </td>
                          <td className="px-6 py-4 text-[14px] font-bold text-gray-900">
                            {displayPrice}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => openModal(p)}
                              className="bg-primary hover:bg-blue-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <i className="fa-solid fa-paper-plane text-[10px]" />
                              Send Inquiry
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button
                  onClick={() => { if (currentPage > 1) { setCurrentPage(p => p - 1); scrollToTable(); } }}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition cursor-pointer select-none ${currentPage === 1 ? 'border border-gray-100 text-gray-300 cursor-not-allowed' : 'border border-gray-200 text-gray-400 hover:border-primary hover:text-primary'}`}
                >
                  <i className="fa-solid fa-chevron-left text-xs" />
                </button>
                {getPageRange(currentPage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={i} className="text-gray-400 px-1 flex items-center">...</span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => { setCurrentPage(p as number); scrollToTable(); }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition cursor-pointer select-none ${p === currentPage ? 'bg-primary text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => { if (currentPage < totalPages) { setCurrentPage(p => p + 1); scrollToTable(); } }}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition cursor-pointer select-none ${currentPage === totalPages ? 'border border-gray-100 text-gray-300 cursor-not-allowed' : 'border border-gray-200 text-gray-400 hover:border-primary hover:text-primary'}`}
                >
                  <i className="fa-solid fa-chevron-right text-xs" />
                </button>
              </div>
            )}
          </section>

          <div id="footer-container" />
        </div>
      </div>{/* end body row */}

      {/* Inquiry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300"
            style={{ background: 'rgba(26,32,44,0.6)' }}
            onClick={closeModal}
          />
          <div
            className={`relative bg-white w-full max-w-6xl max-h-[95vh] rounded-[15px] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 ${modalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-4">
                <img src="assets/getmedslogo.png" alt="GetMEDS Logo" className="h-6 w-auto object-contain" />
                <h3 className="text-base font-semibold text-gray-800 border-l border-gray-200 pl-4">
                  Product Details & Inquiry
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <button className="hidden sm:flex items-center text-gray-500 hover:text-primary transition text-sm space-x-1.5">
                  <i className="fa-regular fa-circle-question" />
                  <span>Do you need help?</span>
                </button>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800 transition border border-gray-200 hover:border-gray-300 rounded-full w-8 h-8 flex items-center justify-center bg-white shadow-sm hover:shadow"
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-0 flex flex-col lg:flex-row bg-white">

              {/* Left Column: Product Info */}
              <div className="lg:w-1/2 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                <div className="flex flex-col-reverse md:flex-row gap-8 mb-8">
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <div className="flex flex-nowrap whitespace-nowrap items-center gap-3 mb-3 text-sm text-gray-600">
                      <span className="flex items-center font-medium" style={{ color: '#61A644' }}>
                        <i className="fa-solid fa-check mr-1.5" /> In stock
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="capitalize font-medium" style={{ color: '#0D99FF' }}>
                        {selectedProduct?.subCategory || selectedProduct?.category?.category || 'General'}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                      {selectedProduct?.brandName && selectedProduct?.genericName && selectedProduct.brandName !== selectedProduct.genericName
                        ? `${selectedProduct.brandName} (${selectedProduct.genericName})`
                        : selectedProduct?.name || selectedProduct?.brandName || selectedProduct?.genericName || 'Product Details'}
                    </h1>
                    <p className="text-gray-600 text-[13px] leading-relaxed">
                      {selectedProduct?.description || 'GetMEDS pharmaceutical product designed for patient care and optimal therapeutic outcomes.'}
                    </p>
                  </div>
                  <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-full max-w-[200px] aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-[15px] border border-gray-100 p-2 overflow-hidden text-gray-300 group transition hover:bg-gray-100/50">
                      {selectedProduct && selectedProduct.image && selectedProduct.image.asset ? (
                        <img
                          src={getProductImage(selectedProduct)}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                          alt={selectedProduct.name}
                        />
                      ) : (
                        <>
                          <i className="fa-regular fa-image text-4xl mb-3 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-[15px] border border-gray-100 p-5 mt-auto">
                  <div className="flex overflow-x-auto border-b border-gray-100 mb-5 gap-6">
                    {(['description', 'usage', 'precautions'] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className="pb-3 text-[13px] whitespace-nowrap transition-colors"
                        style={activeTab === tab
                          ? { color: '#0D99FF', borderBottom: '2px solid #0D99FF', fontWeight: 600 }
                          : { color: '#6B7280', fontWeight: 500 }}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="text-[13px] text-gray-600 leading-relaxed max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeTab === 'description' && (
                      <div>
                        {selectedProduct?.description ? (
                          <p>{selectedProduct.description}</p>
                        ) : (
                          <p>Detailed therapeutic description is not available.</p>
                        )}
                        <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                          {selectedProduct?.strength && (
                            <div>
                              <span className="block text-[11px] text-gray-400 uppercase font-semibold">Strength</span>
                              <span className="text-gray-800 font-medium text-[13px]">{selectedProduct.strength}</span>
                            </div>
                          )}
                          {selectedProduct?.form && (
                            <div>
                              <span className="block text-[11px] text-gray-400 uppercase font-semibold">Form</span>
                              <span className="text-gray-800 font-medium text-[13px]">{selectedProduct.form}</span>
                            </div>
                          )}
                          {selectedProduct?.packaging && (
                            <div>
                              <span className="block text-[11px] text-gray-400 uppercase font-semibold">Packaging</span>
                              <span className="text-gray-800 font-medium text-[13px]">{selectedProduct.packaging}</span>
                            </div>
                          )}
                          {selectedProduct?.innovator && (
                            <div>
                              <span className="block text-[11px] text-gray-400 uppercase font-semibold">Innovator</span>
                              <span className="text-gray-800 font-medium text-[13px]">{selectedProduct.innovator}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {activeTab === 'usage' && (
                      <div>
                        {selectedProduct?.dosageAdministration && (
                          <div className="mb-4">
                            <span className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Dosage & Administration</span>
                            <p className="text-[13px] text-gray-600">{selectedProduct.dosageAdministration}</p>
                          </div>
                        )}
                        {selectedProduct?.indications && (
                          <div className="mb-4">
                            <span className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Indications</span>
                            <p className="text-[13px] text-gray-600">{selectedProduct.indications}</p>
                          </div>
                        )}
                        {!selectedProduct?.dosageAdministration && !selectedProduct?.indications && (
                          <p>Dosage and administration should be directed by a licensed physician.</p>
                        )}
                      </div>
                    )}
                    {activeTab === 'precautions' && (
                      <div>
                        {selectedProduct?.storageCondition && (
                          <div className="mb-4">
                            <span className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Storage Conditions</span>
                            <p className="text-[13px] text-gray-600">{selectedProduct.storageCondition}</p>
                          </div>
                        )}
                        {selectedProduct?.accreditations && (
                          <div className="mb-4">
                            <span className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">Accreditations</span>
                            <p className="text-[13px] text-gray-600">{selectedProduct.accreditations}</p>
                          </div>
                        )}
                        {!selectedProduct?.storageCondition && !selectedProduct?.accreditations && (
                          <p>Precautions, potential side effects, and warnings should be consulted with your doctor or pharmacist.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Inquiry Form */}
              <div className="lg:w-1/2 bg-white p-6 lg:p-8 pb-10">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900">Send Inquiry</h4>
                  <p className="text-xs text-gray-500 mt-1">Submit your details to get a formal quote for this product.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Target Product</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedProduct?.name || ''}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none cursor-default"
                      style={{ color: '#0D99FF' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+63 900 000 0000"
                      value={formData.phone}
                      onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Message</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us more about your requirements..."
                      value={formData.message}
                      onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-primary transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-2">Upload Prescription (Optional)</label>
                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileChange}
                      className="w-full text-[13px] text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition cursor-pointer border border-gray-200 rounded-xl p-1.5 bg-white outline-none"
                    />
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {uploadedFiles.map((file, fi) => (
                          <div key={fi} className="flex items-center text-[11px] text-gray-500 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
                            <i className="fa-solid fa-file-lines mr-2" style={{ color: 'rgba(13,153,255,0.7)' }} />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitState === 'sending' || submitState === 'sent'}
                    className="w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-500 transform active:scale-[0.98] mt-6 mb-8 text-[13px]"
                    style={submitState === 'sent'
                      ? { background: '#61A644' }
                      : { background: 'linear-gradient(to right, #61A644, #0D99FF)' }}
                  >
                    {submitState === 'sending'
                      ? 'Sending...'
                      : submitState === 'sent'
                        ? '✓ Inquiry Sent Successfully!'
                        : submitState === 'error'
                          ? 'Failed to submit. Try again.'
                          : 'Submit Inquiry Request'}
                  </button>
                  <div className="h-8" />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
