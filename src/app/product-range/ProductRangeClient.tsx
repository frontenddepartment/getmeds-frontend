"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { productCategories, products, type Product } from "@/lib/data";
import { Reveal } from "@/components/ui";
import NoResultsIllustration from "@/components/NoResultsIllustration";

type FormFilter = "all" | "injectable" | "oral";
type SortOption = "default" | "name-asc" | "name-desc" | "category";

const MOBILE_PAGE = 12;

/* "Hematology / OB-GYN" -> "hematology-ob-gyn" */
const categorySlug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const isInjectable = (form: string) => /inject|infusion|iv|sc|im|powder for/i.test(form);
const isOral = (form: string) => /tablet|capsule|oral/i.test(form);

/* Each product's own page. Brands the catalogue doesn't list fall back to /product-range/<brand>,
   which the product route resolves by brand name. */
export type ProductLink = { href: string; image?: string };

const productLink = (links: Record<string, ProductLink>, brand: string): ProductLink =>
  links[brand.trim().toLowerCase()] ?? { href: `/product-range/${encodeURIComponent(brand)}` };

export default function ProductRangeClient({ productLinks }: { productLinks: Record<string, ProductLink> }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [formFilter, setFormFilter] = useState<FormFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  // Phones show the list in pages of MOBILE_PAGE ("Load more"); desktop always shows everything.
  const [mobileLimit, setMobileLimit] = useState(MOBILE_PAGE);
  const [view, setView] = useState<"grid" | "table">("grid");
  const catalogRef = useRef<HTMLElement>(null);

  // Sidebar's CSP note hides while the bottom "Can't find what you need?" banner is on screen.
  // The sentinel sits just above the banner, so "in view or scrolled past" counts.
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerInView, setBannerInView] = useState(false);
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setBannerInView(entry.isIntersecting || entry.boundingClientRect.top < 0)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One search bar, two homes: the hero (lg+) and the top of the sidebar. As soon as the hero slot
  // starts sliding under the fixed navbar the bar flies down to the sidebar, and back up on return.
  const heroSearchSlotRef = useRef<HTMLDivElement>(null);
  const [heroSearchPassed, setHeroSearchPassed] = useState(false);
  useEffect(() => {
    const el = heroSearchSlotRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) =>
        setHeroSearchPassed(
          entry.intersectionRatio < 1 && entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0)
        ),
      { rootMargin: "-110px 0px 0px 0px", threshold: [0, 1] } // the fixed navbar covers the top ~110px
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // The travelling bar. Same layoutId in both places, so framer animates it from one to the other.
  const renderSearchBar = (compact: boolean) => (
    <motion.form
      layoutId="catalog-search"
      role="search"
      onSubmit={submitSearch}
      style={{ borderRadius: 9999 }}
      transition={{ layout: { duration: 0.65, ease: EASE_OUT } }}
      className={`flex w-full items-center bg-white ring-1 ring-slate-200 ${
        compact
          ? "gap-1 p-1 focus-within:ring-2 focus-within:ring-[#1D9FDA]"
          : "gap-1.5 p-1 shadow-md shadow-[#0a5a8c]/15 xl:ring-white/60"
      }`}
    >
      <div className="relative min-w-0 flex-1">
        <Search
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${compact ? "left-3 h-4 w-4" : "left-3.5 h-4.5 w-4.5"}`}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={compact ? "Search medicines" : "Search by brand, generic name or form"}
          aria-label="Search products"
          className={`w-full rounded-full bg-transparent text-primary-deep outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden ${
            compact ? "py-2 pl-9 pr-7 text-[14px]" : "py-2.5 pl-10 pr-8 text-[14px]"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-primary"
            aria-label="Clear search"
          >
            <X className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
        )}
      </div>
      {compact ? (
        <button
          type="submit"
          aria-label="Search"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1D9FDA] text-white transition hover:brightness-95"
        >
          <Search className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : (
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Search
        </button>
      )}
    </motion.form>
  );

  // Prefill search & category from query params (?q=... & ?cat=... or ?category=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);

    const cat = params.get("cat") || params.get("category");
    if (cat) {
      const normalized = cat.toLowerCase();
      // Exact slug first ("neuro-oncology" must not land on Oncology), then the loose match old links rely on
      const found = productCategories.find((c) => categorySlug(c) === categorySlug(cat)) ?? productCategories.find(
        (c) =>
          c.toLowerCase() === normalized ||
          c.toLowerCase().includes(normalized) ||
          normalized.includes(c.toLowerCase())
      );
      if (found) setCategory(found);
    }
  }, []);

  // Keep ?category= in step with the selected area so the address always matches the list
  // (runs after the prefill above has read the incoming URL)
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("cat");
    if (category === "All") url.searchParams.delete("category");
    else url.searchParams.set("category", categorySlug(category));
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [category]);

  const hasActiveFilters =
    category !== "All" || query.trim() !== "" || formFilter !== "all";

  // Hero "Browse all products": clear every filter and show the whole catalog
  const browseAll = () => {
    setCategory("All");
    setQuery("");
    setFormFilter("all");
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearAllFilters = () => {
    setCategory("All");
    setQuery("");
    setFormFilter("all");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = products.filter((p) => {
      // Category filter
      if (category !== "All" && p.category !== category) return false;

      // Dosage form filter
      if (formFilter === "injectable" && !isInjectable(p.form)) return false;
      if (formFilter === "oral" && !isOral(p.form)) return false;

      // Search query filter
      if (q) {
        const match =
          p.brand.toLowerCase().includes(q) ||
          p.generic.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.strength.toLowerCase().includes(q) ||
          p.form.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "name-asc") {
      return [...list].sort((a, b) => a.brand.localeCompare(b.brand));
    }
    if (sortBy === "name-desc") {
      return [...list].sort((a, b) => b.brand.localeCompare(a.brand));
    }
    if (sortBy === "category") {
      return [...list].sort(
        (a, b) =>
          a.category.localeCompare(b.category) ||
          a.brand.localeCompare(b.brand)
      );
    }

    return list;
  }, [category, formFilter, query, sortBy]);

  // New filters start the mobile list from the top page again
  useEffect(() => setMobileLimit(MOBILE_PAGE), [category, formFilter, query, sortBy]);

  return (
    <div className="bg-white">
      {/* Hero image (same layout as Order Medicines). xl+: copy sits in the sky on the left, white on blue.
          Below xl: the image is too short, so the copy stacks below it in the usual navy/black. */}
      <section className="relative bg-white pb-10 xl:pb-0">
        <Image
          src="/images/productrange.png"
          alt="Getmeds specialty medicines including ErpoGet, SevelaMed, PazoGet-400 and IdaGet-5"
          width={1746}
          height={901}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        {/* soft blue shade behind the copy so white text stays legible; fades out before the wave */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[57%] bg-gradient-to-r from-[#0a5a8c]/60 via-[#0a5a8c]/35 via-45% to-transparent [mask-image:linear-gradient(to_bottom,black_65%,transparent)] xl:block" />
        <div className="relative mx-auto max-w-[1760px] px-5 sm:px-6 lg:px-8 2xl:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary xl:text-white xl:drop-shadow">
              Product Range
            </span>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-white xl:drop-shadow-md">
              {/* exactly two lines from md up; free wrapping on phones where line one doesn't fit */}
              <span className="md:block md:whitespace-nowrap">A portfolio built for</span>{" "}
              <span className="text-primary md:block md:whitespace-nowrap xl:text-white">Filipino healthcare.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              Browse Getmeds&apos; full range of specialty pharmaceutical products across oncology, hematology, cardiology, and other therapeutic areas — FDA Philippines-licensed, prescription-based ordering, nationwide delivery.
            </p>
            {/* Hero search (lg+; phones use the bar above the catalog). The slot keeps its height while the
                bar is away in the sidebar, so nothing below it jumps. */}
            <div ref={heroSearchSlotRef} className="mt-7 hidden h-[50px] max-w-lg lg:block">
              {!heroSearchPassed && renderSearchBar(false)}
            </div>
            {/* Whole catalog: a real href for crawlers, handled in-page for visitors */}
            <Link
              href="/product-range"
              onClick={(e) => {
                e.preventDefault();
                browseAll();
              }}
              className="mt-6 inline-flex items-center rounded-full bg-[#1D9FDA] px-5 py-2 text-[14px] font-medium text-white shadow-[0_3px_10px_-4px_rgba(6,40,64,0.18)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:mt-3.5"
            >
              Browse all products
            </Link>
          </Reveal>
        </div>
      </section>

      <section ref={catalogRef} className="scroll-mt-28 bg-white pt-4">
        {/* Hero copy and catalog share this wide container so big screens fill with products instead of side margins */}
        <div className="mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-8 2xl:px-10">
          {/* Main 2-column Layout: Sticky Sidebar on Left + Products Catalog on Right */}
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* ===================== SIDEBAR ===================== */}
            <aside className="w-full shrink-0 lg:w-56 xl:w-60">
              {/* Mobile Search & Filter Header Toggle */}
              <div className="lg:hidden">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search medicines"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9.5 pr-8 text-base outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary"
                        aria-label="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition ${
                      mobileFilterOpen || hasActiveFilters
                        ? "bg-primary text-white shadow-xs"
                        : "bg-primary/10 text-primary-dark hover:bg-primary/15"
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary">
                        !
                      </span>
                    )}
                  </button>
                </div>

                {/* category shortcuts: one swipeable row */}
                <div className="scrollbar-none -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
                  {productCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      aria-pressed={category === c}
                      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                        category === c
                          ? "border-primary bg-primary text-white"
                          : "border-primary/30 bg-white text-primary-dark"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter panel: plain category index, sticky on desktop (lg+), opened from the Filters button on phones */}
              <div
                className={`${mobileFilterOpen ? "mt-4 block" : "hidden"} lg:sticky lg:top-28 lg:z-20 lg:block`}
              >

                <div className="custom-scrollbar rounded-lg bg-white p-5 ring-1 ring-slate-200 lg:max-h-[calc(100vh-8.5rem-66px)] lg:overflow-y-auto lg:p-0 lg:pr-2 lg:ring-0 [overflow-anchor:none]">

                  <nav aria-label="Product categories">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-[20px] font-semibold text-primary-deep">Categories</h2>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          aria-label="Reset all filters"
                          title="Reset all filters"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary ring-1 ring-primary/30 transition hover:-rotate-90 hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                    </div>
                    <div className="relative mt-3 h-px bg-slate-200">
                      <span className="absolute left-0 top-1/2 h-[3px] w-10 -translate-y-1/2 rounded-full bg-primary" />
                    </div>
                    <ul className="mt-4 space-y-0.5">
                      {productCategories.map((c) => {
                        const active = category === c;
                        return (
                          <li key={c}>
                            <button
                              type="button"
                              onClick={() => {
                                setCategory(c);
                                if (mobileFilterOpen) setMobileFilterOpen(false);
                              }}
                              aria-pressed={active}
                              className={`w-full py-1.5 text-left text-[15px] transition-colors ${
                                active ? "font-semibold text-primary" : "text-slate-700 hover:text-primary"
                              }`}
                            >
                              {c === "All" ? "All medicines" : c}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  <div className="mt-8">
                    <h2 className="font-display text-[20px] font-semibold text-primary-deep">Dosage form</h2>
                    <div className="relative mt-3 h-px bg-slate-200">
                      <span className="absolute left-0 top-1/2 h-[3px] w-10 -translate-y-1/2 rounded-full bg-primary" />
                    </div>
                    <ul className="mt-4 space-y-0.5">
                      {[
                        { id: "all" as const, label: "All forms" },
                        { id: "injectable" as const, label: "Injectables" },
                        { id: "oral" as const, label: "Tablets & capsules" },
                      ].map(({ id, label }) => {
                        const active = formFilter === id;
                        return (
                          <li key={id}>
                            <button
                              type="button"
                              onClick={() => setFormFilter(id)}
                              aria-pressed={active}
                              className={`w-full py-1.5 text-left text-[15px] transition-colors ${
                                active ? "font-semibold text-primary" : "text-slate-700 hover:text-primary"
                              }`}
                            >
                              {label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Same offer as the bottom banner, so it folds away once that banner is on screen */}
                  <div
                    aria-hidden={bannerInView}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      bannerInView ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-8 border-t border-slate-200 pt-4 text-[13px] leading-relaxed text-slate-600">
                        Need an unlisted medicine? We coordinate FDA Compassionate Special Permit (CSP) imports with your
                        physician.{" "}
                        <Link
                          href="/contact-us"
                          tabIndex={bannerInView ? -1 : undefined}
                          className="font-semibold text-primary hover:text-primary-deep"
                        >
                          Inquire about CSP
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ===================== RIGHT: PRODUCT CATALOG ===================== */}
            <main className="min-w-0 flex-1">
              {/* Product Header / Sort Bar */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
                <div className="shrink-0">
                  <h2 className="font-display text-2xl font-semibold text-black">
                    {category === "All" ? "All Medicines" : category}
                  </h2>
                  <p className="text-sm font-medium text-black">
                    Showing{" "}
                    <span className="font-bold text-black">
                      {filtered.length}
                    </span>{" "}
                    {filtered.length === 1 ? "product" : "products"}
                    {category !== "All" && (
                      <>
                        {" "}
                        in{" "}
                        <span className="font-bold text-black">
                          {category}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Landing spot for the travelling search bar (lg+), right after the title */}
                <div className="hidden h-[42px] min-w-0 max-w-md flex-1 lg:block">{heroSearchPassed && renderSearchBar(true)}</div>

                {/* View toggle + sort */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="flex items-center rounded-full border border-slate-200 bg-white p-1" role="group" aria-label="Product view">
                    {([
                      ["grid", LayoutGrid, "Grid view"],
                      ["table", List, "Table view"],
                    ] as const).map(([v, Icon, label]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setView(v)}
                        aria-pressed={view === v}
                        aria-label={label}
                        title={label}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                          view === v ? "bg-[#1D9FDA] text-white" : "text-slate-500 hover:text-black"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-black">
                    Sort:
                  </span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="cursor-pointer appearance-none rounded-full border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-black outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="default">Default Order</option>
                      <option value="name-asc">Brand (A – Z)</option>
                      <option value="name-desc">Brand (Z – A)</option>
                      <option value="category">Category</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Product Grid / Table */}
              <motion.div
                layout
                className={
                  view === "grid"
                    ? "grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-2.5"
                }
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((p, i) => (
                    <ProductCard
                      key={p.brand + p.strength}
                      product={p}
                      link={productLink(productLinks, p.brand)}
                      row={view === "table"}
                      className={i >= mobileLimit ? "max-lg:hidden" : ""}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {filtered.length > mobileLimit && (
                <div className="mt-6 text-center lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileLimit((n) => n + MOBILE_PAGE)}
                    className="rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    Load more ({filtered.length - mobileLimit} more)
                  </button>
                </div>
              )}

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-slate-200/90 bg-white px-6 py-10 text-center md:p-12">
                  <NoResultsIllustration className="mx-auto h-auto w-full max-w-[15rem]" />
                  <h3 className="font-display mt-4 text-lg font-semibold text-black">
                    No matching medicines found
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    We couldn&apos;t find any medicines matching your search or
                    filters. Try broadening your criteria or reset the filters.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={clearAllFilters}
                      className="btn-ghost text-xs"
                    >
                      Clear All Filters
                    </button>
                    <Link
                      href="/contact-us"
                      className="inline-flex items-center rounded-full bg-[#1D9FDA] px-7 py-3 text-xs font-semibold text-white transition hover:brightness-95"
                    >
                      Ask About an Unlisted Medicine
                    </Link>
                  </div>
                </div>
              )}
            </main>
          </div>

        </div>

        {/* Bottom CTA Banner: full-width brand-green band sitting directly on the footer */}
        <div ref={bannerRef} className="mt-14" />
        <div className="bg-[#61A644] text-white">
          <Reveal className="mx-auto flex max-w-[1760px] flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:py-14 lg:px-8 2xl:px-10">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-[2rem]">Can&apos;t find what you need?</h2>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/90 md:text-base">
                For medicines not registered in the Philippines, we coordinate Compassionate Special Permit (CSP)
                imports with your physician, subject to FDA approval.
              </p>
            </div>
            <Link
              href="/contact-us"
              className="inline-flex shrink-0 items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#3d7a26] transition hover:bg-white/90"
            >
              Request Assistance
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* Pack count printed on the box tab, the way the real Getmeds cartons read ("30 Tablets", "1 Vial") */
function packLabel(form: string) {
  if (/capsule/i.test(form)) return "Capsules";
  if (/tablet/i.test(form)) return "Tablets";
  return "1 Vial";
}

/* Carton drawn in CSS after the Getmeds packaging (blue band, green tab, boxed generic, brand in blue),
   standing in for product photography the catalog doesn't have yet. */
function PackShot({ product }: { product: Product }) {
  const generic = product.generic.replace(/\s*\(.*?\)/g, "");
  return (
    <div
      aria-hidden
      className={`relative flex aspect-[4/3] w-[60%] max-w-[220px] flex-col overflow-hidden rounded-[3px] bg-white shadow-[0_18px_28px_-14px_rgba(7,59,87,0.55)] ring-1 ring-black/5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1`}
    >
      <div className="flex h-[13%] shrink-0">
        <div className="flex-1 bg-primary" />
        <div className="flex items-center bg-[#3fae49] pl-3 pr-2 text-[8px] font-bold text-white [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]">
          {packLabel(product.form)}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-3 text-center">
        <span className="line-clamp-2 border-[1.5px] border-primary-deep px-1.5 py-0.5 text-[10px] font-extrabold uppercase leading-tight tracking-tight text-primary-deep">
          {generic}
        </span>
        <span className="font-display mt-1 text-[15px] font-bold leading-none text-primary">{product.brand}</span>
        <span className="mt-1 line-clamp-1 text-[8px] text-slate-500">{product.strength}</span>
      </div>
      <span className="absolute bottom-1.5 right-2 font-serif text-[13px] font-semibold italic text-primary-deep/80">Rx</span>
    </div>
  );
}

/* Clean catalogue card: square pack photo, name, the product's details as plain lines, one action. */
function ProductCard({
  product: p,
  link,
  row = false,
  className = "",
}: {
  product: Product;
  link: ProductLink;
  row?: boolean; // table view: one product per row
  className?: string;
}) {
  const { href, image } = link;
  // Keyword-rich name for the button and assistive tech; the visible text stays short
  const actionLabel = `Order ${p.brand} (${p.generic} ${p.strength}) online in the Philippines`;

  if (row) {
    return (
      <motion.article
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        className={`group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 sm:gap-5 sm:p-3 ${className}`}
      >
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f6f8fa] sm:h-20 sm:w-20"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN already serves a resized, auto-format image
            <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
          ) : (
            <PackShot product={p} />
          )}
        </Link>
        <div className="grid min-w-0 flex-1 gap-0.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.2fr)] md:items-center md:gap-4">
          <h3 className="font-display truncate text-[15px] font-semibold text-primary sm:text-base">
            <Link href={href} className="rounded-sm transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {p.brand}
            </Link>
          </h3>
          <p className="text-[13px] font-medium leading-snug text-slate-800">
            {p.generic} {p.strength}
          </p>
          <p className="text-[13px] leading-snug text-slate-500">
            {p.form} <span className="text-slate-400">· {p.category}</span>
          </p>
        </div>
        <Link
          href={href}
          aria-label={actionLabel}
          title={actionLabel}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4"
        >
          Order now
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className={`group flex flex-col rounded-md border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-[0_14px_30px_-18px_rgba(7,59,87,0.35)] ${className}`}
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-t-md border-b border-slate-200 bg-[#f6f8fa]"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN already serves a resized, auto-format image
          <img
            src={image}
            alt={`${p.brand} (${p.generic} ${p.strength}) ${p.form.toLowerCase()} pack`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-4 mix-blend-multiply transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <PackShot product={p} />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <h3 className="font-display truncate text-[16px] font-semibold text-primary sm:text-[17px]">
          <Link href={href} className="rounded-sm transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {p.brand}
          </Link>
        </h3>
        <p className="mt-1.5 text-[13.5px] font-medium leading-snug text-slate-800">
          {p.generic} {p.strength}
        </p>
        <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{p.form}</p>
        <div className="flex-1" />

        <Link
          href={href}
          aria-label={actionLabel}
          title={actionLabel}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[14px] font-semibold text-white shadow-[0_6px_14px_-8px_rgba(29,159,218,0.7)] transition-colors hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Order now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </motion.article>
  );
}
