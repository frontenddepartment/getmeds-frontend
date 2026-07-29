import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useProducts, useCategories, useImageMapper } from '../lib/useSanity';
import { urlFor } from '../lib/sanity';
import type { Product as SanityProduct, Category } from '../types/sanity';
import { injectHTML } from '../lib/injectHTML';


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



const formatFieldWithLineBreaks = (text: string | undefined | null) => {
  if (!text) return null;
  const parts = text.split(/\\n|\n/g);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part.trim()}
      {i < parts.length - 1 && <br />}
    </React.Fragment>
  ));
};

// Product name shown in the table/cards is always built straight from the
// brandName/genericName fields.
const getProductDisplayName = (p: { name?: string; brandName?: string; genericName?: string }) =>
  p.brandName && p.genericName && p.brandName !== p.genericName
    ? `${p.brandName} (${p.genericName})`
    : p.name || p.brandName || p.genericName || 'Unnamed Product';

// Categories/subcategories are keyed on the sheet's own Category Folder /
// Condition (+ Condition Slug) columns now (see queries.ts getCategories()),
// so there's no more hardcoded name->slug remap table or cancer/non-cancer
// classification here — a product's own `categoryFolder`/`conditionSlug`
// fields are used directly wherever a URL or slug is needed.
const getProductConditions = (p: { conditions?: string[]; subCategory?: string }) =>
  p.conditions && p.conditions.length ? p.conditions : (p.subCategory ? [p.subCategory] : []);

export default function CancerMedicines() {
  const { getImage } = useImageMapper('product-range');
  const { data: productsDataRaw, loading: productsLoading } = useProducts();
  const productsData = productsDataRaw as ProductWithCategory[] | null;
  const { data: categoriesData, loading: categoriesLoading } = useCategories();

  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<{ category: string; subCategory: string }>({
    category: 'All',
    subCategory: 'All'
  });
  // Guards the localStorage-save effect: stays false until the restore-from-localStorage
  // effect has actually run once categories are loaded. Without this, the save effect fires
  // on first mount with the default {All, All} state and clobbers the real saved selection
  // before it's ever read back.
  const hasRestoredCategoryRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('Default');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('getmeds-search-history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('getmeds-category-counts');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFlyoutCat, setActiveFlyoutCat] = useState<any | null>(null);
  const [flyoutVisible, setFlyoutVisible] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'instock' | 'outofstock'>('all');
  const [filterForms, setFilterForms] = useState<Set<string>>(new Set());
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [inquiryDropdown, setInquiryDropdown] = useState<{
    rowId: string;
    product: ProductWithCategory;
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const USER_TYPE_OPTIONS = [
    { label: 'Patient / Caregiver',                  value: 'patient'  },
    { label: 'Doctor / Healthcare Professional',      value: 'doctor'   },
    { label: 'Pharmacy Owner / Retail Pharmacy',      value: 'pharmacy' },
    { label: 'Hospital / Institution',                value: 'hospital' },
  ];

  const navigateWithUserType = (p: ProductWithCategory, userType: string) => {
    const url = getProductDetailUrl(p) + `?userType=${userType}`;
    window.location.href = url;
  };

  // Positions the inquiry dropdown as a fixed-position portal anchored to the
  // trigger button's rect, so it renders above the table/card instead of being
  // clipped by the table's scroll container or covered by the floating chat widget.
  const toggleInquiryDropdown = (e: React.MouseEvent, rowId: string, p: ProductWithCategory, mode: 'fixed' | 'fill') => {
    e.stopPropagation();
    if (inquiryDropdown?.rowId === rowId) {
      setInquiryDropdown(null);
      return;
    }
    const wrapper = (e.currentTarget as HTMLElement).closest('.inquiry-dropdown-wrapper') as HTMLElement;
    const rect = wrapper.getBoundingClientRect();
    const width = mode === 'fill' ? rect.width : 256;
    const dropdownHeight = USER_TYPE_OPTIONS.length * 40 + 16;
    const openUpward = rect.bottom + dropdownHeight > window.innerHeight;
    let left = mode === 'fill' ? rect.left : rect.right - width;
    const maxLeft = window.innerWidth - width - 8;
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;
    const top = openUpward ? rect.top - dropdownHeight - 8 : rect.bottom + 8;
    setInquiryDropdown({ rowId, product: p, top, left, width });
  };

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
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(navContainer, html); });
    }
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(footerContainer, html); });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('search');
    if (query) setSearchTerm(query);

    const handleClick = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setFilterPanelOpen(false);
      }
      // Close inquiry dropdown if click is outside the trigger wrapper or the portaled menu itself
      const target = e.target as HTMLElement;
      if (!target.closest('.inquiry-dropdown-wrapper') && !target.closest('.inquiry-dropdown-portal')) {
        setInquiryDropdown(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Close the inquiry dropdown on scroll since it's fixed-position and won't
  // follow the table/card it's anchored to.
  useEffect(() => {
    if (!inquiryDropdown) return;
    const closeOnScroll = () => setInquiryDropdown(null);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => window.removeEventListener('scroll', closeOnScroll, true);
  }, [inquiryDropdown]);

  // Process dynamic categories into 4 columns using Jaccard Similarity Graph Grouping (sim >= 0.5)
  // Process dynamic categories directly from Sanity (no redundant grouping)
  const processedCats = useMemo(() => {
    if (!categoriesData) return [];

    return categoriesData
      .filter((cat) => cat.category && cat.slug?.current && cat.subcategory && Array.isArray(cat.subcategory) && cat.subcategory.length > 0)
      .map((cat) => ({
        category: cat.category,
        slugs: [cat.slug.current],
        slug: cat.slug.current,
        subcategory: (cat.subcategory || []).filter(Boolean)
      }));
  }, [categoriesData]);

  // Helper to resolve condition by slug or display name
  const resolveConditionName = (target: string, cats: typeof processedCats) => {
    const cleanTarget = target.trim().toLowerCase();
    for (const cat of cats) {
      const sub = cat.subcategory.find(s => {
        const sLower = s.toLowerCase();
        const sSlug = sLower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return sLower === cleanTarget || sSlug === cleanTarget;
      });
      if (sub) {
        return { category: cat.category, subCategory: sub };
      }
    }
    return null;
  };

  // Restore the selected category/subcategory from URL or localStorage
  useEffect(() => {
    if (processedCats.length > 0) {
      let resolved = false;

      // 1. Check if URL path has condition segment (e.g. /conditions/breast-cancer or /cancer-medicines/breast-cancer)
      const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
      if (pathParts.length >= 2) {
        const urlParam = decodeURIComponent(pathParts[1]);
        const match = resolveConditionName(urlParam, processedCats);
        if (match) {
          setSelectedCategory(match);
          setCurrentPage(1);
          resolved = true;
        }
      }

      // 2. Check if URL path has 1 segment matching a category folder slug or category name (e.g. /bone-health-medicines, /antibiotics, /heart-medicines)
      if (!resolved && pathParts.length >= 1) {
        const firstSeg = decodeURIComponent(pathParts[0]).trim().toLowerCase();
        if (firstSeg !== 'cancer-medicines' && firstSeg !== 'product-range' && firstSeg !== 'conditions') {
          const matchedCat = processedCats.find(c => {
            const catSlug = (c.slug || '').toLowerCase();
            const catNameSlug = c.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const catNameLower = c.category.toLowerCase();
            return catSlug === firstSeg || catNameSlug === firstSeg || catNameLower === firstSeg;
          });
          if (matchedCat) {
            setSelectedCategory({ category: matchedCat.category, subCategory: 'All' });
            setCurrentPage(1);
            resolved = true;
          }
        }
      }

      // 2. Check query param (e.g. ?category=breast-cancer)
      if (!resolved && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        if (categoryFromUrl) {
          const match = resolveConditionName(categoryFromUrl, processedCats);
          if (match) {
            setSelectedCategory(match);
            setCurrentPage(1);
            resolved = true;
          }
        }
      }

      // 3. Fallback to localStorage saved selection
      if (!resolved) {
        const savedCategoryStr = localStorage.getItem('selectedCategory');
        if (savedCategoryStr) {
          let savedObj: { category?: string; subCategory?: string } | null = null;
          try {
            savedObj = JSON.parse(savedCategoryStr);
          } catch {
            if (savedCategoryStr) {
              savedObj = { category: 'All', subCategory: savedCategoryStr };
            }
          }

          if (savedObj) {
            const searchSub = (savedObj.subCategory || '').trim();
            const searchCat = (savedObj.category || '').trim();

            if (searchSub && searchSub.toLowerCase() !== 'all') {
              const match = resolveConditionName(searchSub, processedCats);
              if (match) {
                setSelectedCategory(match);
                setCurrentPage(1);
                resolved = true;
              }
            }

            if (!resolved && searchCat && searchCat.toLowerCase() !== 'all') {
              const matchedCat = processedCats.find(c => c.category.toLowerCase() === searchCat.toLowerCase());
              if (matchedCat) {
                setSelectedCategory({ category: matchedCat.category, subCategory: 'All' });
                setCurrentPage(1);
                resolved = true;
              }
            }
          }
        }
      }

      if (!resolved) {
        setSelectedCategory({ category: 'All', subCategory: 'All' });
        setCurrentPage(1);
      }

      hasRestoredCategoryRef.current = true;
    }
  }, [processedCats]);

  // Save selected category/subcategory to localStorage as a JSON object. Skipped until
  // the restore effect above has actually run — otherwise this fires on mount with the
  // default {All, All} state and overwrites the real saved selection before it's read back.
  useEffect(() => {
    if (!hasRestoredCategoryRef.current) return;
    localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory));
  }, [selectedCategory]);

  // Synchronize Title to active category
  useEffect(() => {
    const sectionLabel = selectedCategory.category !== 'All' ? selectedCategory.category : 'Products';
    const displayLabel = selectedCategory.subCategory !== 'All' ? selectedCategory.subCategory : selectedCategory.category;
    if (displayLabel === 'All') {
      document.title = 'Products - Getmeds';
    } else {
      document.title = `${displayLabel} - ${sectionLabel} | Getmeds`;
    }
  }, [selectedCategory]);

  const getProductImage = (p: ProductWithCategory, size?: number) => {
    if (p.image && p.image.asset) {
      try {
        if (size) {
          return urlFor(p.image).width(size).height(size).url();
        }
        return urlFor(p.image).url();
      } catch (err) {
        console.error('Error generating image URL:', err);
      }
    }

    return '/assets/no-image.png';
  };

  const getCategorizationDisplay = (p: ProductWithCategory) => {
    const subcats = getProductConditions(p);
    if (subcats.length === 0) {
      return p.category?.category || 'General';
    }
    if (selectedCategory.subCategory !== 'All') {
      const matched = subcats.find(sub => sub && typeof sub === 'string' && sub.toLowerCase() === selectedCategory.subCategory.toLowerCase());
      if (matched) {
        return matched;
      }
    }
    return subcats.join(' / ');
  };

  const sidebarCategories = useMemo(() => {
    return processedCats.map(cat => ({
      _id: cat.slug,
      name: cat.category,
      subItems: cat.subcategory.map(sub => ({ label: sub }))
    }));
  }, [processedCats]);

  const getFiltered = (sel: { category: string; subCategory: string }) => {
    if (!productsData) return [];
    if (sel.category === 'All' && sel.subCategory === 'All') return productsData;

    const cleanCategory = sel.category.trim().toLowerCase();
    const cleanSub = (sel.subCategory || '').trim().toLowerCase();

    // Each processed category is keyed on its Category Folder (queries.ts
    // getCategories()), so matching a product to its parent category is just
    // an exact categoryFolder comparison — no more combined-name splitting.
    const matchedProcessed = processedCats.find(
      c => c.category.trim().toLowerCase() === cleanCategory
    );

    const matchesParentCategory = (p: ProductWithCategory) => {
      if (!cleanCategory || cleanCategory === 'all') return true;

      const pCat = (p.excelCategory || (typeof p.category === 'string' ? p.category : p.category?.category) || '').trim().toLowerCase();
      const pFolder = (p.categoryFolder || '').trim().toLowerCase();

      if (matchedProcessed) {
        return pCat === cleanCategory || pFolder === matchedProcessed.slug || pFolder === cleanCategory;
      }
      return pCat === cleanCategory || pFolder === cleanCategory;
    };

    if (cleanSub && cleanSub !== 'all') {
      // A condition is always scoped to its parent category folder — otherwise two
      // categories that happen to share a condition label would leak into each other.
      return productsData.filter(p => {
        if (!matchesParentCategory(p)) return false;
        const conditions = getProductConditions(p);
        return conditions.some(part => part.toLowerCase() === cleanSub);
      });
    }

    if (matchedProcessed) {
      return productsData.filter(matchesParentCategory);
    }

    // Fallback: category isn't a known processed category — search by condition name directly
    return productsData.filter(p => {
      const conditions = getProductConditions(p);
      return conditions.some(part => part.toLowerCase() === cleanCategory);
    });
  };

  const FORM_GROUPS: { label: string; match: (f: string) => boolean }[] = [
    { label: 'Capsule', match: f => /capsule/i.test(f) },
    { label: 'Tablet',  match: f => /tablet/i.test(f) },
    { label: 'Vial',    match: f => /inject|infus|lyophil|powder\s+for|concentrate|ampoule|vial/i.test(f) },
    { label: 'Bottle',  match: f => /bottle|syrup|oral\s+sol|oral\s+susp|drops/i.test(f) },
  ];

  const activeFilterCount = (filterAvailability !== 'all' ? 1 : 0) + filterForms.size;

  const sorted = useMemo(() => {
    const categoryFiltered = getFiltered(selectedCategory);

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

    const fullyFiltered = searchFiltered.filter(p => {
      if (filterAvailability === 'instock' && p.availability === false) return false;
      if (filterAvailability === 'outofstock' && p.availability !== false) return false;
      if (filterForms.size > 0) {
        const form = p.form || '';
        const matched = Array.from(filterForms).some(label => {
          const group = FORM_GROUPS.find(g => g.label === label);
          return group ? group.match(form) : false;
        });
        if (!matched) return false;
      }
      return true;
    });

    return [...fullyFiltered].sort((a, b) => {
      const nameA = (a.brandName || a.name || '').toLowerCase();
      const nameB = (b.brandName || b.name || '').toLowerCase();
      if (sortBy === 'Name: A → Z') return nameA.localeCompare(nameB);
      if (sortBy === 'Name: Z → A') return nameB.localeCompare(nameA);
      if (sortBy === 'In Stock First') {
        const avA = a.availability === false ? 1 : 0;
        const avB = b.availability === false ? 1 : 0;
        return avA - avB;
      }
      if (sortBy === 'Form: A → Z') return (a.form || '').localeCompare(b.form || '');
      return 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsData, categoriesData, processedCats, selectedCategory, searchTerm, filterAvailability, filterForms, sortBy]);

  // ── Search History & Suggestions Logic ──────────────────
  const onEnterSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || !productsData) return;

    // 1. Save to search history (deduped, most recent first, max 10)
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 10);
      localStorage.setItem('getmeds-search-history', JSON.stringify(next));
      return next;
    });

    // 2. Find matching products and increment their category counts
    const lowerQuery = trimmed.toLowerCase();
    const matchedProducts = productsData.filter(p =>
      p.name?.toLowerCase().includes(lowerQuery) ||
      (p.brandName && p.brandName.toLowerCase().includes(lowerQuery)) ||
      (p.genericName && p.genericName.toLowerCase().includes(lowerQuery))
    );

    if (matchedProducts.length > 0) {
      setCategoryCounts(prev => {
        const next = { ...prev };
        const seenCats = new Set<string>();
        matchedProducts.forEach(p => {
          const cat = p.category?.category || '';
          const cats = cat.split('/').map(s => s.trim()).filter(Boolean);
          cats.forEach(c => {
            if (c && !seenCats.has(c)) {
              seenCats.add(c);
              next[c] = (next[c] || 0) + 1;
            }
          });
        });
        localStorage.setItem('getmeds-category-counts', JSON.stringify(next));
        return next;
      });
    }
  };

  const removeSearchHistoryItem = (item: string) => {
    setSearchHistory(prev => {
      const next = prev.filter(h => h !== item);
      localStorage.setItem('getmeds-search-history', JSON.stringify(next));
      return next;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    setCategoryCounts({});
    localStorage.removeItem('getmeds-search-history');
    localStorage.removeItem('getmeds-category-counts');
  };

  const suggestedProducts = useMemo(() => {
    if (!productsData || productsData.length === 0) return [];

    const MAX_SUGGESTIONS = 5;

    // If no category counts, show 5 random products
    if (Object.keys(categoryCounts).length === 0) {
      const shuffled = [...productsData].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, MAX_SUGGESTIONS);
    }

    // Sort categories by count descending
    const sortedCats = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const suggestions: ProductWithCategory[] = [];
    const usedIds = new Set<string>();

    for (const cat of sortedCats) {
      if (suggestions.length >= MAX_SUGGESTIONS) break;
      const catProducts = productsData.filter(
        p => {
          const pCat = p.category?.category || p.excelCategory || '';
          const pCats = pCat.split('/').map(s => s.trim().toLowerCase()).filter(Boolean);
          return pCats.includes(cat.toLowerCase()) && !usedIds.has(p._id);
        }
      );
      // Shuffle within category so it's not always the same order
      const shuffled = [...catProducts].sort(() => Math.random() - 0.5);
      const remaining = MAX_SUGGESTIONS - suggestions.length;
      const toAdd = shuffled.slice(0, remaining);
      toAdd.forEach(p => {
        suggestions.push(p);
        usedIds.add(p._id);
      });
    }

    // If still fewer than MAX, fill with random products from other categories
    if (suggestions.length < MAX_SUGGESTIONS) {
      const remaining = MAX_SUGGESTIONS - suggestions.length;
      const others = productsData
        .filter(p => !usedIds.has(p._id))
        .sort(() => Math.random() - 0.5)
        .slice(0, remaining);
      suggestions.push(...others);
    }

    return suggestions;
  }, [productsData, categoryCounts]);

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

  // Strips a bare domain-prefixed URL from the sheet (e.g. "getmeds.ph/conditions/x", with or
  // without a protocol) down to just its path, e.g. "/conditions/x" — same pattern already
  // used for productPageUrl below.
  const toPath = (url: string) => '/' + url.replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '');

  // Condition/subcategory name (lowercased) -> its precomputed "Condition Hub URL (Auto)"
  // path, sourced straight from the product catalog (each product carries its own
  // conditionHubUrl plus a conditionSlugsByName map for every condition it's linked to — see
  // fetchProductsFromExcel() in src/lib/queries.ts). This is the DB's canonical URL for a
  // condition; selectCategory() below prefers it over self-slugifying the name.
  const conditionHubPaths = useMemo(() => {
    const map = new Map<string, string>();
    productsData?.forEach((p: any) => {
      if (p.subCategory && p.conditionHubUrl && !map.has(p.subCategory.toLowerCase())) {
        map.set(p.subCategory.toLowerCase(), toPath(p.conditionHubUrl));
      }
      Object.entries(p.conditionSlugsByName || {}).forEach(([name, info]: [string, any]) => {
        if (info?.conditionHubUrl && !map.has(name.toLowerCase())) {
          map.set(name.toLowerCase(), toPath(info.conditionHubUrl));
        }
      });
    });
    return map;
  }, [productsData]);

  const getProductDetailUrl = (p: ProductWithCategory) => {
    // productPageUrl from the sheet has no protocol (e.g. "getmeds.ph/cancer-medicines/..."),
    // so the leading domain segment has to be stripped even without an "https://" to match.
    if (p.productPageUrl) {
      return toPath(p.productPageUrl);
    }
    return `/${p.categoryFolder || 'product-range'}/${p.slug?.current || ''}`;
  };

  const selectCategory = (category: string, subCategory: string = 'All') => {
    setSelectedCategory({ category, subCategory });
    setCurrentPage(1);

    if (typeof window !== 'undefined') {
      const matched = processedCats.find(c => c.category.toLowerCase() === category.toLowerCase());
      if (matched && matched.slug) {
        const targetPath = subCategory !== 'All'
          ? conditionHubPaths.get(subCategory.toLowerCase())
            ?? `/${matched.slug}/${subCategory.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
          : `/${matched.slug}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState(null, '', targetPath);
        }
      } else if (category === 'All' && subCategory === 'All') {
        if (window.location.pathname !== '/cancer-medicines' && window.location.pathname !== '/product-range') {
          window.history.pushState(null, '', '/cancer-medicines');
        }
      }
    }
  };

  const openModal = (product: ProductWithCategory) => {
    window.location.href = getProductDetailUrl(product);
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
    selectedCategory.category === cat.name;

  const displayCategory = selectedCategory.subCategory !== 'All' ? selectedCategory.subCategory : selectedCategory.category;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased flex flex-col h-screen overflow-hidden">
      <style>{`
        @media (max-width: 767px) {
          .product-range-scroll { scroll-behavior: smooth; }
        }

        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .sidebar-scroll::-webkit-scrollbar-button { display: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
              onClick={() => selectCategory('All', 'All')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-200"
              style={selectedCategory.category === 'All' && !flyoutVisible
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
                  <span className="text-left leading-snug truncate">{cat.name}</span>
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
              <p
                className="font-semibold text-gray-800 text-[13px] leading-snug cursor-pointer hover:text-primary transition-colors"
                onClick={() => { selectCategory(activeFlyoutCat.name, 'All'); closeFlyout(); }}
              >
                {activeFlyoutCat.name}
              </p>
              <button onClick={closeFlyout} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-gray-500 text-[16px]" />
              </button>
            </div>
            <div className="px-2 py-2 space-y-0.5">
              {activeFlyoutCat.subItems.map((sub: any, si: number) => (
                <button
                  key={si}
                  onClick={() => { selectCategory(activeFlyoutCat.name, sub.label); closeFlyout(); }}
                  className="w-full text-left px-3 py-2.5 rounded-[8px] text-[13.5px] transition-all duration-150 hover:bg-gray-50"
                  style={selectedCategory.subCategory === sub.label
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
        <div className="flex-1 min-w-0 overflow-y-auto product-range-scroll" style={{ transition: 'all 0.3s ease' }}>

          {/* Hero Banner */}
          <section className="w-full px-4 md:px-6 pt-5 pb-4">
            <div
              className="relative rounded-[15px] overflow-hidden flex items-center px-8 md:px-12"
              style={{ background: 'linear-gradient(135deg, #3aaf5c 0%, #1ab8c4 45%, #1a99d6 100%)', minHeight: '130px' }}
            >
              {/* Glassy circles */}
              <div className="absolute pointer-events-none" style={{ width: 160, height: 160, borderRadius: '50%', bottom: '-55px', left: '28%', background: 'radial-gradient(circle at 40% 35%, rgba(100,240,200,0.55), rgba(30,180,210,0.30))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
              <div className="absolute pointer-events-none" style={{ width: 130, height: 130, borderRadius: '50%', bottom: '-42px', left: '45%', background: 'radial-gradient(circle at 38% 30%, rgba(120,100,240,0.55), rgba(60,80,220,0.35))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.20)' }} />
              <div className="absolute pointer-events-none hidden md:block" style={{ width: 180, height: 180, borderRadius: '50%', bottom: '-70px', right: '8%', background: 'radial-gradient(circle at 42% 38%, rgba(130,230,230,0.45), rgba(60,190,210,0.22))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.22)' }} />
              <div className="absolute pointer-events-none hidden md:block" style={{ width: 90, height: 90, borderRadius: '50%', bottom: '-20px', left: '18%', background: 'radial-gradient(circle at 35% 30%, rgba(160,240,120,0.60), rgba(40,210,130,0.35))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
              <div className="absolute pointer-events-none hidden md:block" style={{ width: 52, height: 52, borderRadius: '50%', top: '10px', right: '28%', background: 'radial-gradient(circle at 35% 30%, rgba(170,110,240,0.70), rgba(100,60,210,0.45))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
              <div className="absolute pointer-events-none hidden md:block" style={{ width: 85, height: 85, borderRadius: '50%', top: '-15px', right: '38%', background: 'radial-gradient(circle at 38% 32%, rgba(80,220,210,0.55), rgba(30,170,200,0.30))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.22)' }} />
              <div className="absolute pointer-events-none" style={{ width: 280, height: 80, borderRadius: '50%', bottom: '-48px', left: '22%', background: 'radial-gradient(ellipse at 50% 40%, rgba(40,160,230,0.38), rgba(20,130,210,0.18))', backdropFilter: 'blur(2px)' }} />
              <div className="relative z-10 transition-all duration-300">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
                  {selectedCategory.category !== 'All' ? selectedCategory.category : 'Products'}
                </h1>
                <p className="text-white/75 text-[12px] sm:text-[13px] mt-1 font-medium">Comprehensive catalog of pharmaceutical solutions. Browse categories and send inquiries directly.</p>
              </div>
            </div>
          </section>

          {/* Breadcrumb */}
          <nav className="px-4 sm:px-6 lg:px-8 pb-2 pt-1" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12px] text-gray-400 flex-wrap">
              <li>
                <button
                  onClick={() => selectCategory('All', 'All')}
                  className="hover:text-primary transition-colors font-medium"
                >
                  All Products
                </button>
              </li>
              {displayCategory !== 'All' && (
                <>
                  <li className="text-gray-300"><i className="fa-solid fa-chevron-right text-[9px]" /></li>
                  <li className="font-semibold text-gray-700">{displayCategory}</li>
                </>
              )}
            </ol>
          </nav>

          {/* PRODUCTS LIST */}
          <section className="px-4 sm:px-6 lg:px-8 mb-24">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-start sm:justify-between sm:mb-8">
              <h2 className="text-xl font-semibold text-gray-900 leading-snug sm:max-w-[55%]">
                {displayCategory === 'All' ? 'All Products' : displayCategory}{' '}
                <span className="text-gray-400 font-normal text-sm ml-1 whitespace-nowrap">({sorted.length} Items)</span>
              </h2>

              {/* Check Products */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-blue-600 text-white text-[13px] font-bold transition-all whitespace-nowrap shadow-sm"
                >
                  <i className="fa-solid fa-list text-[12px]" />
                  Check Products
                </button>
              )}

              {/* Search Bar */}
              <div className="relative w-full sm:flex-1 sm:min-w-0" ref={searchWrapperRef}>
                <div className="bg-white rounded-full py-1 px-1.5 border border-gray-200 flex items-center">
                  <div className="relative flex-grow flex items-center ml-3">
                    <i className="fa-solid fa-magnifying-glass text-gray-400 text-[13px]" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          onEnterSearch(searchTerm);
                          setShowSuggestions(false);
                        }
                      }}
                      className="w-full bg-transparent border-none pl-2.5 pr-2 py-1.5 text-[13px] text-gray-700 outline-none placeholder-gray-400"
                    />
                  </div>
                  <div className="relative flex-shrink-0" ref={filterPanelRef}>
                    <button
                      onClick={e => { e.stopPropagation(); setFilterPanelOpen(v => !v); setShowSuggestions(false); }}
                      className="relative h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors duration-300 active:scale-95"
                    >
                      <i className="fa-solid fa-sliders text-[11px]" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center leading-none">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    {/* Filter Panel */}
                    {filterPanelOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[13px] font-semibold text-gray-800">Filter Products</h4>
                          {activeFilterCount > 0 && (
                            <button
                              onClick={() => { setFilterAvailability('all'); setFilterForms(new Set()); setCurrentPage(1); }}
                              className="text-[11px] font-semibold text-primary hover:text-blue-700 transition"
                            >
                              Clear all
                            </button>
                          )}
                        </div>

                        {/* Availability */}
                        <div className="mb-4">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Availability</p>
                          <div className="flex gap-2">
                            {(['all', 'instock', 'outofstock'] as const).map(v => (
                              <button
                                key={v}
                                onClick={() => { setFilterAvailability(v); setCurrentPage(1); }}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                                  filterAvailability === v
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                                }`}
                              >
                                {v === 'all' ? 'All' : v === 'instock' ? 'In Stock' : 'Out of Stock'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Form */}
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Form</p>
                          <div className="flex flex-wrap gap-2">
                            {FORM_GROUPS.map(({ label }) => (
                              <button
                                key={label}
                                onClick={() => {
                                  setFilterForms(prev => {
                                    const next = new Set(prev);
                                    next.has(label) ? next.delete(label) : next.add(label);
                                    return next;
                                  });
                                  setCurrentPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                                  filterForms.has(label)
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h4 className="text-[12px] font-medium text-gray-500">Recent Searches</h4>
                      {searchHistory.length > 0 && (
                        <button
                          onClick={() => clearSearchHistory()}
                          className="text-[11px] font-bold text-primary hover:text-blue-700 transition"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-1 mb-4">
                      {searchHistory.length > 0 ? (
                        searchHistory.map((term, idx) => (
                          <div
                            key={`${term}-${idx}`}
                            className="flex items-center justify-between p-2 hover:bg-blue-50/50 rounded-xl cursor-pointer group transition"
                            onClick={() => {
                              setSelectedCategory({ category: 'All', subCategory: 'All' });
                              setSearchTerm(term);
                              setCurrentPage(1);
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-clock-rotate-left text-gray-300 text-[11px]" />
                              <span className="text-[13px] text-gray-600 font-medium">{term}</span>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); removeSearchHistoryItem(term); }}
                              className="p-1"
                            >
                              <i className="fa-solid fa-xmark text-gray-300 hover:text-red-500 text-[10px] transition opacity-0 group-hover:opacity-100" />
                            </button>
                          </div>
                        ))
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
                    <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto">
                      {suggestedProducts.map(sp => (
                        <div
                          key={sp._id}
                          className="flex items-center gap-3 p-2 hover:bg-blue-50/50 rounded-xl cursor-pointer transition group"
                          onClick={() => {
                            setSelectedCategory({ category: 'All', subCategory: 'All' });
                            setSearchTerm(sp.brandName || sp.name || '');
                            setCurrentPage(1);
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="w-10 h-10 bg-white border border-gray-100 p-1.5 rounded-lg flex items-center justify-center overflow-hidden">
                            <img
                              src={getProductImage(sp, 80)}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-300"
                              alt={sp.brandName || sp.name || 'Product'}
                              onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = '/assets/no-image.png'; }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-gray-800 truncate">{sp.brandName || sp.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{sp.category?.category || 'General'}</p>
                          </div>
                        </div>
                      ))}
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
                    <option>Default</option>
                    <option>Name: A → Z</option>
                    <option>Name: Z → A</option>
                    <option>In Stock First</option>
                    <option>Form: A → Z</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
                    <i className="fa-solid fa-chevron-down text-[10px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div ref={tableRef}>
              {productsLoading ? (
                <TableSkeleton />
              ) : paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm py-16 px-6">
                  <img
                    src="/assets/noproductsfound.png"
                    alt="No products found"
                    className="w-44 sm:w-56 object-contain mb-6"
                  />
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5">No Products Found</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    We couldn't find any products matching your search or filters.
                  </p>
                </div>
              ) : (
                <>
                  {/* MOBILE CARDS */}
                  <div className="lg:hidden space-y-3">
                    {paginated.map((p, i) => {
                      const displayName = getProductDisplayName(p);
                      const rowId = `${p._id || 'idx'}-${i}`;
                      return (
                        <div key={rowId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
                          <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                            <img
                              src={getProductImage(p, 120)}
                              alt={displayName}
                              className="w-full h-full object-contain mix-blend-multiply"
                              onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = '/assets/no-image.png'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span
                                className="text-[14px] font-semibold text-gray-900 leading-snug cursor-pointer hover:text-primary transition-colors"
                                onClick={() => openModal(p)}
                              >
                                {displayName}
                              </span>
                              {p.availability === false
                                ? <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100">Out of Stock</span>
                                : <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-100">In Stock</span>
                              }
                            </div>
                            <p className="text-[11px] text-primary font-medium mb-2">{getCategorizationDisplay(p)}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                              {p.strength && <span className="text-[11px] text-gray-500"><span className="font-semibold text-gray-400 uppercase tracking-wide">Strength</span> · {formatFieldWithLineBreaks(p.strength)}</span>}
                              {p.form && <span className="text-[11px] text-gray-500"><span className="font-semibold text-gray-400 uppercase tracking-wide">Form</span> · {formatFieldWithLineBreaks(p.form)}</span>}
                            </div>
                            <div className="relative inquiry-dropdown-wrapper">
                              <button
                                onClick={e => toggleInquiryDropdown(e, rowId, p, 'fill')}
                                className="w-full justify-center bg-primary hover:bg-blue-600 text-white text-[12px] font-bold px-4 py-2.5 rounded-full transition-all duration-300 shadow-sm inline-flex items-center gap-1.5"
                              >
                                <i className="fa-solid fa-paper-plane text-[11px]" />
                                Send Inquiry
                                <i className="fa-solid fa-chevron-down text-[9px] ml-0.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden lg:block overflow-x-auto no-scrollbar bg-white rounded-[10px] border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Product</th>
                          <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Category</th>
                          <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Strength</th>
                          <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize">Form</th>
                          <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize text-center">Availability</th>
                          <th className="px-6 py-4 text-[14px] font-semibold text-gray-900 capitalize text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paginated.map((p, i) => {
                          const displayName = getProductDisplayName(p);
                          const rowId = `dt-${p._id || 'idx'}-${i}`;
                          return (
                            <tr key={rowId} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                                    <img
                                      src={getProductImage(p, 120)}
                                      alt={displayName}
                                      className="w-full h-full object-contain mix-blend-multiply"
                                      onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = '/assets/no-image.png'; }}
                                    />
                                  </div>
                                  <span
                                    className="text-[14px] font-semibold text-gray-900 group-hover:text-primary transition-colors cursor-pointer"
                                    onClick={() => openModal(p)}
                                  >
                                    {displayName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">
                                {getCategorizationDisplay(p)}
                              </td>
                              <td className="px-6 py-4 text-[13px] text-gray-700">
                                {formatFieldWithLineBreaks(p.strength) || <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-6 py-4 text-[13px] text-gray-700">
                                {formatFieldWithLineBreaks(p.form) || <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {p.availability === false
                                  ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-500 border border-red-100">Out of Stock</span>
                                  : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-600 border border-green-100">In Stock</span>
                                }
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="relative inline-block inquiry-dropdown-wrapper">
                                  <button
                                    onClick={e => toggleInquiryDropdown(e, rowId, p, 'fixed')}
                                    className="bg-primary hover:bg-blue-600 text-white text-[12px] font-semibold px-4 py-1.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                                  >
                                    <i className="fa-solid fa-paper-plane text-[10px]" />
                                    Send Inquiry
                                    <i className="fa-solid fa-chevron-down text-[9px]" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
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

          {/* ── Inquiry User-Type Dropdown (portaled so it isn't clipped by the table/card scroll containers) ── */}
          {inquiryDropdown && createPortal(
            <div
              className="inquiry-dropdown-portal fixed bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]"
              style={{ top: inquiryDropdown.top, left: inquiryDropdown.left, width: inquiryDropdown.width }}
            >
              {USER_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const prod = inquiryDropdown.product;
                    setInquiryDropdown(null);
                    navigateWithUserType(prod, opt.value);
                  }}
                  className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors font-medium flex items-center gap-2"
                >
                  <i className="fa-solid fa-user-tag text-[10px] text-primary/60" />
                  {opt.label}
                </button>
              ))}
            </div>,
            document.body
          )}

          {/* ── Product Inquiry Success Modal ── */}
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
                  <h2 className="text-[19px] font-semibold text-gray-900 mb-4 leading-snug">Thank you for your inquiry.</h2>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Our team will contact you shortly to discuss your pharmaceutical product needs. For urgent concerns, please call{' '}
                    <a href="tel:+639190769105" className="text-[#1D9FDA] font-semibold hover:underline">+63 919 076 9105</a>.
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
      </div>{/* end body row */}

    </div>
  );
}
