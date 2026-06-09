# Product Toolbar UI — Complete Code Extraction

The toolbar from the product-range page contains these elements (left to right):

1. **Title** — "All Products" with item count "(56 Items)"
2. **Check Products** button — blue pill button with list icon
3. **Search bar** — with magnifying glass icon, placeholder text, and filter button
4. **Filter button** — blue circular button inside the search bar (opens filter panel)
5. **Sort by** dropdown — "Default" with chevron

Plus hidden panels that appear on interaction:
- **Search Suggestions Dropdown** — recent searches + suggested products
- **Filter Panel** — availability & form filters

---

## External Dependencies

Add these to your `<head>`:

```html
<!-- Google Font: Poppins -->
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>

<!-- Font Awesome 6 -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
/>
```

Add the primary color to your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1D9FDA',
      },
    },
  },
};
```

---

## 1. All State Variables

```tsx
// ── Core toolbar state ──
const [searchTerm, setSearchTerm] = useState('');
const [showSuggestions, setShowSuggestions] = useState(false);
const [sortBy, setSortBy] = useState('Default');
const [currentPage, setCurrentPage] = useState(1);
const [currentCategory, setCurrentCategory] = useState('All');
const [sidebarOpen, setSidebarOpen] = useState(true);

// ── Filter panel state ──
const [filterPanelOpen, setFilterPanelOpen] = useState(false);
const [filterAvailability, setFilterAvailability] = useState<'all' | 'instock' | 'outofstock'>('all');
const [filterForms, setFilterForms] = useState<Set<string>>(new Set());

// ── Search history (persisted in localStorage) ──
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

// ── Refs ──
const searchWrapperRef = useRef<HTMLDivElement>(null);
const filterPanelRef = useRef<HTMLDivElement>(null);

// ── Computed values ──
const activeFilterCount = (filterAvailability !== 'all' ? 1 : 0) + filterForms.size;
```

---

## 2. Search History & Suggestions Logic

```tsx
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

// Smart suggestion engine — prioritizes frequently searched categories
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

  const suggestions: any[] = [];
  const usedIds = new Set<string>();

  for (const cat of sortedCats) {
    if (suggestions.length >= MAX_SUGGESTIONS) break;
    const catProducts = productsData.filter(
      p => p.category?.category === cat && !usedIds.has(p._id)
    );
    const shuffled = [...catProducts].sort(() => Math.random() - 0.5);
    const remaining = MAX_SUGGESTIONS - suggestions.length;
    const toAdd = shuffled.slice(0, remaining);
    toAdd.forEach(p => {
      suggestions.push(p);
      usedIds.add(p._id);
    });
  }

  // Fill remaining slots with random products
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
```

---

## 3. Click-Outside Handler

```tsx
useEffect(() => {
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
```

---

## 4. Complete Toolbar JSX

```tsx
{/* Toolbar: stacks vertically on mobile, horizontal on desktop */}
<div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between sm:mb-8">
  
  {/* ── Title + Item Count ── */}
  <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">
    {currentCategory === 'All' ? 'All Products' : currentCategory}{' '}
    <span className="text-gray-400 font-normal text-sm ml-2">
      ({sorted.length} Items)
    </span>
  </h2>

  {/* ── Check Products Button (shown when sidebar is collapsed) ── */}
  {!sidebarOpen && (
    <button
      onClick={() => setSidebarOpen(true)}
      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-blue-600 text-white text-[13px] font-bold transition-all whitespace-nowrap shadow-sm"
    >
      <i className="fa-solid fa-list text-[12px]" />
      Check Products
    </button>
  )}

  {/* ── Search Bar (with filter button & suggestions) ── */}
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

      {/* ── Filter Button (circular, inside the search bar) ── */}
      <div className="relative flex-shrink-0" ref={filterPanelRef}>
        <button
          onClick={e => {
            e.stopPropagation();
            setFilterPanelOpen(v => !v);
            setShowSuggestions(false);
          }}
          className="relative h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors duration-300 active:scale-95"
        >
          <i className="fa-solid fa-sliders text-[11px]" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* ── Filter Dropdown Panel ── */}
        {filterPanelOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[13px] font-semibold text-gray-800">Filter Products</h4>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setFilterAvailability('all');
                    setFilterForms(new Set());
                    setCurrentPage(1);
                  }}
                  className="text-[11px] font-semibold text-primary hover:text-blue-700 transition"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Availability Filter */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Availability
              </p>
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

            {/* Form Filter */}
            {availableForms.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Form
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableForms.map(form => (
                    <button
                      key={form}
                      onClick={() => {
                        setFilterForms(prev => {
                          const next = new Set(prev);
                          next.has(form) ? next.delete(form) : next.add(form);
                          return next;
                        });
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                        filterForms.has(form)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {form}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* ── Search Suggestions Dropdown ── */}
    {showSuggestions && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
        
        {/* Recent Searches Header */}
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

        {/* Recent Search Items */}
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

        {/* Suggested Products Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-[12px] font-medium text-gray-500">Suggested</h4>
        </div>

        {/* Suggested Product Items */}
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
                <p className="text-[13px] font-bold text-gray-800 truncate">
                  {sp.brandName || sp.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {sp.category?.category || 'General'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* ── Sort By Dropdown ── */}
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
```

---

## 5. Sorting Logic

```tsx
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
```

---

## 6. Filtering Logic

```tsx
// Available forms (computed from product data)
const availableForms = useMemo(() => {
  if (!productsData) return [];
  const forms = new Set<string>();
  productsData.forEach(p => { if (p.form) forms.add(p.form); });
  return Array.from(forms).sort();
}, [productsData]);

// Active filter count (for badge on filter button)
const activeFilterCount = (filterAvailability !== 'all' ? 1 : 0) + filterForms.size;

// Apply all filters
const fullyFiltered = searchFiltered.filter(p => {
  if (filterAvailability === 'instock' && p.availability === false) return false;
  if (filterAvailability === 'outofstock' && p.availability !== false) return false;
  if (filterForms.size > 0 && (!p.form || !filterForms.has(p.form))) return false;
  return true;
});
```

---

## Summary of Components

| Element | Classes / Key Styles |
|---|---|
| **Toolbar container** | `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` |
| **Title** | `text-xl font-semibold text-gray-900` with gray-400 count badge |
| **Check Products btn** | `rounded-full bg-primary text-white text-[13px] font-bold` |
| **Search bar wrapper** | `bg-white rounded-full border border-gray-200` |
| **Search input** | `bg-transparent border-none text-[13px] outline-none` |
| **Filter button** | `h-8 w-8 bg-primary rounded-full` (inside search bar) |
| **Filter panel** | `rounded-2xl shadow-xl border border-gray-100 p-4` |
| **Suggestions panel** | `rounded-2xl shadow-xl border border-gray-100 p-4` |
| **Sort dropdown** | `appearance-none rounded-full border border-blue-200 text-[13px]` |
| **Primary color** | `#1D9FDA` |
| **Font** | Poppins (400, 500, 600, 700) |
