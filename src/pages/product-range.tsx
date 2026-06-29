import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useProducts, useCategories, useImageMapper, useSiteSettings } from '../lib/useSanity';
import { urlFor, client } from '../lib/sanity';
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

export default function ProductRange() {
  const { getImage } = useImageMapper('product-range');
  const { data: productsDataRaw, loading: productsLoading } = useProducts();
  const productsData = productsDataRaw as ProductWithCategory[] | null;
  const { data: categoriesData, loading: categoriesLoading } = useCategories();
  const { data: settings } = useSiteSettings();
  const [imageAssets, setImageAssets] = useState<any[]>([]);

  useEffect(() => {
    client.fetch('*[_type == "sanity.imageAsset"]{ _id, originalFilename }')
      .then(assets => {
        setImageAssets(assets || []);
      })
      .catch(err => {
        console.error('Error fetching image assets on frontend:', err);
      });
  }, []);

  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [currentCategory, setCurrentCategory] = useState('All');
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
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!productsLoading && productsData) {
      const urlParams = new URLSearchParams(window.location.search);
      const productSlug = urlParams.get('product');
      const searchQuery = urlParams.get('search');

      if (productSlug) {
        window.location.href = '/product-detail?product=' + productSlug;
        return;
      }

      if (searchQuery) {
        const cleanQuery = searchQuery.trim().toLowerCase();
        const targetProduct = productsData.find(
          p => (p.brandName && p.brandName.toLowerCase() === cleanQuery) ||
               (p.name && p.name.toLowerCase() === cleanQuery) ||
               (p.brandName && p.genericName && `${p.brandName} (${p.genericName})`.toLowerCase() === cleanQuery)
        );
        if (targetProduct) {
          const slug = targetProduct.slug?.current || encodeURIComponent((targetProduct.brandName || targetProduct.name || '').toLowerCase());
          window.location.href = '/product-detail?product=' + slug;
        }
      }
    }
  }, [productsLoading, productsData]);

  // Process dynamic categories into 4 columns using Jaccard Similarity Graph Grouping (sim >= 0.5)
  const processedCats = useMemo(() => {
    if (!categoriesData) return [];

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

    const result: Array<{
      category: string;
      slugs: string[];
      slug: string;
      subcategory: string[];
    }> = [];

    groups.forEach((groupCats) => {
      if (groupCats.length === 1) {
        result.push({
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
          result.push({
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
            result.push({
              category: cat.category,
              slugs: [cat.slug?.current || ''],
              slug: cat.slug?.current || '',
              subcategory: uniqueSubs
            });
          }
        });
      }
    });

    return result;
  }, [categoriesData]);

  // Synchronize URL Category param with dynamic categories data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('category');
    if (categorySlug && processedCats.length > 0) {
      const cleanSlug = categorySlug.toLowerCase().trim();
      
      // 1. Check if cleanSlug matches any category slugs
      const matchedCat = processedCats.find(c => {
        const hasSlugMatch = c.slugs.some(s => s.toLowerCase() === cleanSlug) || c.slug.toLowerCase() === cleanSlug;
        const hasNameMatch = c.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === cleanSlug;
        return hasSlugMatch || hasNameMatch;
      });
      if (matchedCat) {
        setCurrentCategory(matchedCat.category);
        return;
      }
      
      // 2. Check if cleanSlug matches any subcategory
      for (const cat of processedCats) {
        const matchedSub = cat.subcategory.find(sub => {
          const subSlug = getSubcategorySlug(sub);
          return subSlug === cleanSlug || sub.toLowerCase() === cleanSlug;
        });
        if (matchedSub) {
          setCurrentCategory(matchedSub);
          return;
        }
      }
    }
  }, [processedCats]);


  const brandNameCounts = useMemo(() => {
    const counts = new Map<string, number>()
    if (productsData) {
      productsData.forEach(p => {
        const brand = (p.brandName || '').toLowerCase().trim()
        if (brand) {
          counts.set(brand, (counts.get(brand) || 0) + 1)
        }
      })
    }
    return counts
  }, [productsData])

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

    if (settings && imageAssets.length > 0) {
      const primaryImageFormat = settings.primaryImageNamingFormat || '{brandName}'
      const secondaryImageFormat = settings.fallbackImageNamingFormat || '{brandName}-{strength}'
      const brandNameKey = (p.brandName || '').toLowerCase().trim()
      const hasMultipleOutputs = (brandNameCounts.get(brandNameKey) || 0) > 1

      const formatFilenameLocal = (pattern: string, doc: any) => {
        let name = pattern
        const fields = ['brandName', 'genericName', 'strength', 'form']
        for (const field of fields) {
          const val = String(doc[field] || '').trim()
          const lowerPlaceholder = `{${field.toLowerCase()}}`
          const upperPlaceholder = `{${field.toUpperCase()}}`
          const mixedPlaceholder = `{${field}}`
          name = name.split(lowerPlaceholder).join(val.toLowerCase())
          name = name.split(upperPlaceholder).join(val.toUpperCase())
          name = name.split(mixedPlaceholder).join(val)
          name = name.replace(new RegExp(`{${field}}`, 'gi'), val)
        }
        return name
      }

      const cleanNameLocal = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')

      // Try both formats: preferred first, then alternate
      const formatsToTry = hasMultipleOutputs
        ? [secondaryImageFormat, primaryImageFormat]
        : [primaryImageFormat, secondaryImageFormat]

      let matchedAsset: any = null

      // Pass 1: Exact match with each format
      for (const fmt of formatsToTry) {
        if (matchedAsset) break
        const targetNormalized = cleanNameLocal(formatFilenameLocal(fmt, p))
        if (!targetNormalized) continue
        matchedAsset = imageAssets.find((asset: any) => {
          if (!asset.originalFilename) return false
          const baseName = asset.originalFilename.replace(/\.[^/.]+$/, '')
          return cleanNameLocal(baseName) === targetNormalized
        })
      }

      // Pass 2: Fuzzy startsWith fallback (asset starts with target or target starts with asset)
      if (!matchedAsset) {
        for (const fmt of formatsToTry) {
          if (matchedAsset) break
          const targetNormalized = cleanNameLocal(formatFilenameLocal(fmt, p))
          if (!targetNormalized || targetNormalized.length < 3) continue
          matchedAsset = imageAssets.find((asset: any) => {
            if (!asset.originalFilename) return false
            const assetNormalized = cleanNameLocal(asset.originalFilename.replace(/\.[^/.]+$/, ''))
            return assetNormalized.startsWith(targetNormalized) || targetNormalized.startsWith(assetNormalized)
          })
        }
      }

      if (matchedAsset) {
        try {
          const imageObj = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: matchedAsset._id,
            }
          }
          if (size) {
            return urlFor(imageObj).width(size).height(size).url();
          }
          return urlFor(imageObj).url();
        } catch (err) {
          console.error('Error generating dynamic image URL:', err);
        }
      }
    }

    const brandLower = (p.brandName || '').toLowerCase().trim()
    if (brandLower) {
      return `assets/${brandLower}.png`
    }

    return 'assets/no-image.png';
  };

  const getProductSubcategories = (p: ProductWithCategory) => {
    if (!p.subCategory) return [];
    const parts = p.subCategory.split('/').map(s => s.trim().replace(/,$/, '')).filter(Boolean);
    const catDoc = categoriesData?.find(c => c._id === p.category?._id || c.category === p.category?.category);
    const masterSubcategories = catDoc?.subcategory || [];
    if (masterSubcategories.length === 0) return parts;
    return parts.map(part => {
      const matched = masterSubcategories.find(m => m.toLowerCase() === part.toLowerCase());
      return matched || part;
    });
  };

  const getCategorizationDisplay = (p: ProductWithCategory) => {
    const subcats = getProductSubcategories(p);
    if (subcats.length === 0) {
      return p.category?.category || 'General';
    }
    if (currentCategory !== 'All' && categoriesData) {
      const isSubcategory = categoriesData.some(c => 
        c.subcategory?.some(sub => sub.toLowerCase() === currentCategory.toLowerCase())
      );
      if (isSubcategory) {
        const matched = subcats.find(sub => sub.toLowerCase() === currentCategory.toLowerCase());
        if (matched) {
          return matched;
        }
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

  const getFiltered = (category: string) => {
    if (!productsData) return [];
    if (category === 'All') return productsData;
    
    const cleanCategory = category.trim().toLowerCase();
    
    // Find if the selected category is one of our processed categories
    const matchedProcessed = processedCats.find(
      c => c.category.trim().toLowerCase() === cleanCategory
    );
    
    if (matchedProcessed) {
      return productsData.filter(p => {
        const subcats = getProductSubcategories(p);
        return subcats.some(sub => matchedProcessed.subcategory.some(s => s.trim().toLowerCase() === sub.toLowerCase()));
      });
    }
    
    // Fallback: search by subcategory name directly
    return productsData.filter(p => {
      const subcats = getProductSubcategories(p);
      if (subcats.some(part => part.toLowerCase() === cleanCategory)) return true;
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

  const FORM_GROUPS: { label: string; match: (f: string) => boolean }[] = [
    { label: 'Capsule', match: f => /capsule/i.test(f) },
    { label: 'Tablet',  match: f => /tablet/i.test(f) },
    { label: 'Vial',    match: f => /inject|infus|lyophil|powder\s+for|concentrate|ampoule|vial/i.test(f) },
    { label: 'Bottle',  match: f => /bottle|syrup|oral\s+sol|oral\s+susp|drops/i.test(f) },
  ];

  const activeFilterCount = (filterAvailability !== 'all' ? 1 : 0) + filterForms.size;

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

  const sorted = [...fullyFiltered].sort((a, b) => {
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
          const cat = p.category?.category;
          if (cat && !seenCats.has(cat)) {
            seenCats.add(cat);
            next[cat] = (next[cat] || 0) + 1;
          }
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
        p => p.category?.category === cat && !usedIds.has(p._id)
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

  const selectCategory = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
  };

  const openModal = (product: ProductWithCategory) => {
    const slug = product.slug?.current || encodeURIComponent((product.brandName || product.name || '').toLowerCase());
    window.location.href = '/product-detail?product=' + slug;
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
                  onClick={() => { selectCategory(cat.name); openFlyout(cat); }}
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
              style={{ background: 'linear-gradient(135deg, #3aaf5c 0%, #1ab8c4 45%, #1a99d6 100%)', minHeight: '130px' }}
            >
              {/* Glassy circles — mirroring the reference image */}
              {/* Large teal circle bottom-left */}
              <div className="absolute pointer-events-none" style={{ width: 160, height: 160, borderRadius: '50%', bottom: '-55px', left: '28%', background: 'radial-gradient(circle at 40% 35%, rgba(100,240,200,0.55), rgba(30,180,210,0.30))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
              {/* Large blue/purple circle center-bottom */}
              <div className="absolute pointer-events-none" style={{ width: 130, height: 130, borderRadius: '50%', bottom: '-42px', left: '45%', background: 'radial-gradient(circle at 38% 30%, rgba(120,100,240,0.55), rgba(60,80,220,0.35))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.20)' }} />
              {/* Big light-teal circle right */}
              <div className="absolute pointer-events-none hidden md:block" style={{ width: 180, height: 180, borderRadius: '50%', bottom: '-70px', right: '8%', background: 'radial-gradient(circle at 42% 38%, rgba(130,230,230,0.45), rgba(60,190,210,0.22))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.22)' }} />
              {/* Medium green-yellow circle far left */}
              <div className="absolute pointer-events-none hidden md:block" style={{ width: 90, height: 90, borderRadius: '50%', bottom: '-20px', left: '18%', background: 'radial-gradient(circle at 35% 30%, rgba(160,240,120,0.60), rgba(40,210,130,0.35))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
              {/* Small purple circle top-right area */}
              <div className="absolute pointer-events-none hidden md:block" style={{ width: 52, height: 52, borderRadius: '50%', top: '10px', right: '28%', background: 'radial-gradient(circle at 35% 30%, rgba(170,110,240,0.70), rgba(100,60,210,0.45))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.25)' }} />
              {/* Medium teal circle top center-right */}
              <div className="absolute pointer-events-none hidden md:block" style={{ width: 85, height: 85, borderRadius: '50%', top: '-15px', right: '38%', background: 'radial-gradient(circle at 38% 32%, rgba(80,220,210,0.55), rgba(30,170,200,0.30))', backdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.22)' }} />
              {/* Wide shallow blue ellipse bottom */}
              <div className="absolute pointer-events-none" style={{ width: 280, height: 80, borderRadius: '50%', bottom: '-48px', left: '22%', background: 'radial-gradient(ellipse at 50% 40%, rgba(40,160,230,0.38), rgba(20,130,210,0.18))', backdropFilter: 'blur(2px)' }} />
              <div className="relative z-10 transition-all duration-300">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
                  Getmeds Products
                </h1>
                <p className="text-white/75 text-[12px] sm:text-[13px] mt-1 font-medium">Comprehensive catalog of pharmaceutical solutions. Browse categories and send inquiries directly.</p>
              </div>
            </div>
          </section>

          {/* PRODUCTS LIST */}
          <section className="px-4 sm:px-6 lg:px-8 mb-24">
            {/* Toolbar: stacks vertically on mobile */}
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-start sm:justify-between sm:mb-8">
              <h2 className="text-xl font-semibold text-gray-900 leading-snug sm:max-w-[55%]">
                {currentCategory === 'All' ? 'All Products' : currentCategory}{' '}
                <span className="text-gray-400 font-normal text-sm ml-1 whitespace-nowrap">({sorted.length} Items)</span>
              </h2>

              {/* Check Products — opens category sidebar */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-blue-600 text-white text-[13px] font-bold transition-all whitespace-nowrap shadow-sm"
                >
                  <i className="fa-solid fa-list text-[12px]" />
                  Check Products
                </button>
              )}

              {/* Search Bar — full width on mobile, flex-1 on desktop */}
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
                              onError={(e) => { (e.target as HTMLImageElement).src = 'assets/no-image.png'; }}
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
              ) : (
                <>
                  {/* MOBILE CARDS — visible below lg */}
                  <div className="lg:hidden space-y-3">
                    {paginated.map((p, i) => {
                      const displayName = p.brandName && p.genericName && p.brandName !== p.genericName
                        ? `${p.brandName} (${p.genericName})`
                        : p.name || p.brandName || p.genericName || 'Unnamed Product';
                      return (
                        <div key={p._id || i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
                          <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                            <img
                              src={getProductImage(p, 120)}
                              alt={displayName}
                              className="w-full h-full object-contain mix-blend-multiply"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'assets/no-image.png'; }}
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
                            <button
                              onClick={() => openModal(p)}
                              className="w-full justify-center bg-primary hover:bg-blue-600 text-white text-[12px] font-bold px-4 py-2.5 rounded-full transition-all duration-300 shadow-sm inline-flex items-center gap-1.5"
                            >
                              <i className="fa-solid fa-paper-plane text-[11px]" />
                              Send Inquiry
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP TABLE — visible lg and above */}
                  <div className="hidden lg:block overflow-x-auto bg-white rounded-[10px] border border-gray-100 shadow-sm">
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
                          const displayName = p.brandName && p.genericName && p.brandName !== p.genericName
                            ? `${p.brandName} (${p.genericName})`
                            : p.name || p.brandName || p.genericName || 'Unnamed Product';
                          return (
                            <tr key={p._id || i} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-1">
                                    <img
                                      src={getProductImage(p, 120)}
                                      alt={displayName}
                                      className="w-full h-full object-contain mix-blend-multiply"
                                      onError={(e) => { (e.target as HTMLImageElement).src = 'assets/no-image.png'; }}
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
                                <button
                                  onClick={() => openModal(p)}
                                  className="bg-primary hover:bg-blue-600 text-white text-[12px] font-semibold px-4 py-1.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
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