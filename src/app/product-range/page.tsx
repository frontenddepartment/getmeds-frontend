"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Pill,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Syringe,
  X,
} from "lucide-react";
import { productCategories, products } from "@/lib/data";
import { Reveal } from "@/components/ui";

type FormFilter = "all" | "injectable" | "oral";
type SortOption = "default" | "name-asc" | "name-desc" | "category";

const MOBILE_PAGE = 12;

export default function ProductRangePage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [formFilter, setFormFilter] = useState<FormFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  // Phones show the list in pages of MOBILE_PAGE ("Load more"); desktop always shows everything.
  const [mobileLimit, setMobileLimit] = useState(MOBILE_PAGE);

  // Prefill search & category from query params (?q=... & ?cat=... or ?category=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);

    const cat = params.get("cat") || params.get("category");
    if (cat) {
      const normalized = cat.toLowerCase();
      const found = productCategories.find(
        (c) =>
          c.toLowerCase() === normalized ||
          c.toLowerCase().includes(normalized) ||
          normalized.includes(c.toLowerCase())
      );
      if (found) setCategory(found);
    }
  }, []);

  // Pre-calculate count of products per category
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return map;
  }, []);

  const hasActiveFilters =
    category !== "All" || query.trim() !== "" || formFilter !== "all";

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
      if (formFilter === "injectable") {
        const isInjectable = /inject|infusion|iv|sc|im|powder for/i.test(p.form);
        if (!isInjectable) return false;
      } else if (formFilter === "oral") {
        const isOral = /tablet|capsule|oral/i.test(p.form);
        if (!isOral) return false;
      }

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
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
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
          </Reveal>
        </div>
      </section>

      <section className="bg-white pb-24 pt-4">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          {/* Main 2-column Layout: Sticky Sidebar on Left + Products Catalog on Right */}
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* ===================== SIDEBAR ===================== */}
            <aside className="w-full shrink-0 lg:w-72 xl:w-80">
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

              {/* Sidebar Panel: Sticky on Desktop (lg+), Expandable Accordion on Mobile */}
              <div
                className={`${
                  mobileFilterOpen ? "mt-4 block" : "hidden"
                } lg:sticky lg:top-28 lg:z-20 lg:block`}
              >
                <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)]">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-primary" />
                      <h2 className="font-display text-sm font-bold text-primary-deep">
                        Filter Products
                      </h2>
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-dark hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Desktop Search Box */}
                  <div className="hidden lg:block">
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Search Catalog
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Brand, generic, form…"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-8 text-sm text-primary-deep outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      />
                      {query && (
                        <button
                          onClick={() => setQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-primary"
                          aria-label="Clear search"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dosage Form Segmented Filter */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Dosage Form
                    </label>
                    <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 text-xs">
                      {[
                        { id: "all" as const, label: "All" },
                        { id: "injectable" as const, label: "IV / Inj" },
                        { id: "oral" as const, label: "Oral" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFormFilter(item.id)}
                          className={`rounded-lg py-1.5 text-center font-medium transition ${
                            formFilter === item.id
                              ? "bg-white font-semibold text-primary shadow-xs"
                              : "text-slate-600 hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Therapeutic Categories List */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Therapeutic Areas
                      </label>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {productCategories.length - 1} areas
                      </span>
                    </div>

                    <div className="custom-scrollbar max-h-[300px] xl:max-h-[360px] space-y-1 overflow-y-auto pr-1">
                      {productCategories.map((c) => {
                        const isSelected = category === c;
                        const count =
                          c === "All" ? products.length : categoryCounts[c] || 0;

                        return (
                          <button
                            key={c}
                            onClick={() => {
                              setCategory(c);
                              if (mobileFilterOpen) setMobileFilterOpen(false);
                            }}
                            className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                              isSelected
                                ? "bg-gradient-to-r from-primary to-primary-dark font-semibold text-white shadow-sm shadow-primary/20"
                                : "font-medium text-slate-700 hover:bg-slate-50 hover:text-primary"
                            }`}
                          >
                            <span className="truncate pr-2">{c}</span>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                                isSelected
                                  ? "bg-white/25 text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sidebar Assistance Helper Box */}
                  <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-3.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-primary-deep">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                      <span>Need unlisted medicine?</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                      We coordinate FDA Compassionate Special Permit (CSP)
                      imports with your physician.
                    </p>
                    <Link
                      href="/contact-us"
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary transition hover:text-primary-dark"
                    >
                      Inquire about CSP <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            {/* ===================== RIGHT: PRODUCT CATALOG ===================== */}
            <main className="min-w-0 flex-1">
              {/* Product Header / Sort Bar */}
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-primary-deep">
                    {category === "All" ? "All Medicines" : category}
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Showing{" "}
                    <span className="font-bold text-primary-dark">
                      {filtered.length}
                    </span>{" "}
                    {filtered.length === 1 ? "product" : "products"}
                    {category !== "All" && (
                      <>
                        {" "}
                        in{" "}
                        <span className="font-bold text-primary-dark">
                          {category}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-semibold text-slate-500">
                    Sort:
                  </span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-[13px] font-semibold lg:py-1.5 lg:text-xs text-primary-deep outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="default">Default Order</option>
                      <option value="name-asc">Brand (A – Z)</option>
                      <option value="name-desc">Brand (Z – A)</option>
                      <option value="category">Category</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Active Filter Chips (if any) */}
              {hasActiveFilters && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Active filters:
                  </span>

                  {category !== "All" && (
                    <button
                      onClick={() => setCategory("All")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark transition hover:bg-primary/20"
                    >
                      <span>Category: {category}</span>
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {formFilter !== "all" && (
                    <button
                      onClick={() => setFormFilter("all")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark transition hover:bg-primary/20"
                    >
                      <span>
                        Form: {formFilter === "injectable" ? "Injections / IV" : "Oral"}
                      </span>
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {query.trim() && (
                    <button
                      onClick={() => setQuery("")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark transition hover:bg-primary/20"
                    >
                      <span>Search: &ldquo;{query}&rdquo;</span>
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-primary underline transition hover:text-primary-dark"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Product Grid */}
              <motion.div
                layout
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((p, i) => {
                    const injectable = /inject|infusion|iv|sc|im/i.test(p.form);
                    return (
                      <motion.div
                        layout
                        key={p.brand + p.strength}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-4 lg:p-5.5 ${i >= mobileLimit ? "max-lg:hidden" : ""} shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_36px_-8px_rgba(29,159,218,0.14)]`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-dark group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/25">
                            {injectable ? (
                              <Syringe className="h-4.5 w-4.5" />
                            ) : (
                              <Pill className="h-4.5 w-4.5" />
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCategory(p.category)}
                            title={`Filter by ${p.category}`}
                            className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-dark transition hover:bg-primary hover:text-white"
                          >
                            {p.category}
                          </button>
                        </div>

                        <h3 className="font-display mt-3.5 text-base font-bold text-primary-deep transition-colors group-hover:text-primary">
                          {p.brand}
                        </h3>
                        <p className="text-xs font-semibold text-primary-dark">
                          {p.generic}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-[13px] text-slate-600 sm:block sm:space-y-1.5 sm:p-3 sm:text-xs">
                          <p>
                            <span className="font-semibold text-slate-800">
                              Strength:
                            </span>{" "}
                            {p.strength}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-800">
                              Form:
                            </span>{" "}
                            {p.form}
                          </p>
                        </div>

                        <Link
                          href="/order-medicines"
                          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-bold text-primary transition group-hover:translate-x-1 group-hover:text-primary-dark"
                        >
                          Inquire / Order <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </motion.div>
                    );
                  })}
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
                <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Filter className="h-7 w-7" />
                  </div>
                  <h3 className="font-display mt-4 text-lg font-bold text-primary-deep">
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
                    <Link href="/contact-us" className="btn-primary text-xs">
                      Ask About an Unlisted Medicine
                    </Link>
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Bottom CTA Banner */}
          <Reveal className="mt-14">
            <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-8 text-white md:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-[110px]" />
              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-2xl font-bold md:text-3xl">
                    Can&apos;t find what you need?
                  </h2>
                  <p className="mt-2 max-w-xl text-white/70">
                    For medicines not registered in the Philippines, we
                    coordinate Compassionate Special Permit (CSP) imports with
                    your physician, subject to FDA approval.
                  </p>
                </div>
                <Link href="/contact-us" className="btn-primary shrink-0">
                  Request Assistance <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
