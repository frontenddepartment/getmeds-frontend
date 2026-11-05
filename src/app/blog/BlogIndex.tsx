"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import NoResultsIllustration from "@/components/NoResultsIllustration";
import type { BlogIndexPost } from "@/lib/blogServer";

const PAGE = 12;
const FEATURED = 3;
/* Topic pills, in this order (the WordPress blog's category list). */
const TOPICS = [
  "Cancer", "Health", "Health Care", "Top Trending", "Covid-19", "Fitness", "Skin Care", "Weight Loss",
  "Diabetes", "Mental health", "Hepatitis", "News", "Online Drug Store", "Hypertension", "Blood Pressure",
  "Kids Health", "Pregnancy", "Workout", "Vitamin", "Immune System", "Muscle Gain", "Press Release",
  "Product Launch", "Award", "Blood", "Multiple Sclerosis", "Online Pharmacy", "Partnership",
  "Patient Stories", "Sponsorship",
];
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* Image, or a brand panel (white Getmeds logo on blue) for the few posts WordPress has no image for */
function Cover({ post, wide, className }: { post: BlogIndexPost; wide?: boolean; className: string }) {
  if (!post.image) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-primary to-primary-deep ${className}`}>
        <Image
          src="/images/getmeds-logo-white.png"
          alt=""
          width={1200}
          height={664}
          sizes="200px"
          className="h-auto w-[38%] max-w-[220px] opacity-95"
        />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- WordPress already serves the resized size we ask for
    <img
      src={wide ? post.image.wide : post.image.card}
      alt={post.image.alt || post.title}
      loading={wide ? "eager" : "lazy"}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}

export default function BlogIndex({ posts }: { posts: BlogIndexPost[] }) {
  const featured = posts.slice(0, FEATURED);

  const topics = ["All", ...TOPICS];

  const [topic, setTopic] = useState("All");
  const [query, setQuery] = useState("");
  // One-line pill row that slides sideways; the arrows move it by most of its visible width
  const pillsRef = useRef<HTMLDivElement | null>(null);
  const slidePills = (dir: 1 | -1) => {
    const el = pillsRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };
  const [limit, setLimit] = useState(PAGE);
  // A post matches a pill through any of its categories (case-insensitive), then the search box
  // narrows by title, excerpt or category.
  const list = useMemo(() => {
    const t = topic.toLowerCase();
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const cats = (p.tags?.length ? p.tags : [p.tag]).map((c) => c.toLowerCase());
      if (topic !== "All" && !cats.includes(t)) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || cats.some((c) => c.includes(q));
    });
  }, [posts, topic, query]);
  const shown = list.slice(0, limit);

  // Featured carousel: advances every 6s, pauses while hovered or focused
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || featured.length < 2) return;
    const t = window.setInterval(() => setSlide((s) => (s + 1) % featured.length), 6000);
    return () => window.clearInterval(t);
  }, [paused, featured.length]);
  const current = featured[slide];

  return (
    <div className="bg-white">
      {/* Header: heading left, intro + jump link right */}
      <section className="pb-8 pt-20 md:pt-26">
        <div className="mx-auto grid max-w-7xl items-end gap-6 px-5 md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-10">
          {/* same size as the Order Medicines page headline */}
          <h1 className="font-display text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)]">
            Health insights &amp; news
          </h1>
          <div>
            <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
              Health guides, patient-assistance how-tos and company news, from your trusted source for
              pharmaceutical insights and patient care in the Philippines.
            </p>
          </div>
        </div>
      </section>

      {/* Featured carousel: the latest posts. The image shows clean (many already carry their title in the
          artwork, so nothing is laid over it); the story and dots sit beside it. */}
      {current && (
        <section aria-label="Latest articles" className="pb-10 md:pb-14">
          <div
            className="mx-auto max-w-7xl px-5 md:px-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* lg+: image left (kept whole, at WordPress's 1200x628), story right; stacked below lg.
                Same column split and gap as the header above, so the story aligns with the intro text. */}
            <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={`img-${current.slug}`}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  <Link
                    href={`/blog/${current.slug}`}
                    tabIndex={-1}
                    aria-hidden
                    className="group block overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200/70"
                  >
                    <Cover
                      post={current}
                      wide
                      className="aspect-[1200/628] w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>

              <div>
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`txt-${current.slug}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  >
                    <Link href={`/blog/${current.slug}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <p className="text-[13px] text-slate-500">
                        <span className="font-semibold text-primary">{current.tag}</span>
                        <span className="mx-2 text-slate-300">·</span>
                        {current.date}
                      </p>
                      <h2 className="font-display mt-3 text-[clamp(1.35rem,2.2vw,2rem)] font-semibold leading-snug text-[#0B2E5E] transition-colors group-hover:text-primary">
                        {current.title}
                      </h2>
                      {current.excerpt && (
                        <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">{current.excerpt}</p>
                      )}
                      <span className="mt-6 inline-flex items-center gap-2.5 text-[15px] font-semibold text-primary-deep">
                        Read article
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                </AnimatePresence>

                {featured.length > 1 && (
                  <div className="mt-8 flex gap-2" role="tablist" aria-label="Choose featured article">
                    {featured.map((p, i) => (
                      <button
                        key={p.slug}
                        type="button"
                        role="tab"
                        aria-selected={i === slide}
                        aria-label={`Show: ${p.title}`}
                        onClick={() => setSlide(i)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-primary" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All articles */}
      <section id="articles" className="scroll-mt-28 pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          {/* Title left, search box top right */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <div>
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-semibold leading-tight text-[#0B2E5E]">
                Recent Blog Posts
              </h2>
            </div>
            <label className="relative block w-full shrink-0 md:w-80">
              <span className="sr-only">Search articles</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLimit(PAGE);
                }}
                placeholder="Search articles..."
                className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-[14px] text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          {/* One swipeable row at every size: swipe on phones, arrows from md. The scroller clips at its
              edges, so it gets vertical padding for the chips' rings. */}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => slidePills(-1)}
              aria-label="Scroll topics left"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary hover:text-primary md:flex"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
          <div
            ref={pillsRef}
            className="scrollbar-none -mx-5 flex min-w-0 flex-1 gap-2 overflow-x-auto px-5 py-1.5 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTopic(t);
                  setLimit(PAGE);
                }}
                aria-pressed={topic === t}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                  topic === t
                    ? "bg-primary text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-primary hover:ring-primary/40"
                }`}
              >
                {t === "All" ? "All articles" : t}
              </button>
            ))}
          </div>
            <button
              type="button"
              onClick={() => slidePills(1)}
              aria-label="Scroll topics right"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary hover:text-primary md:flex"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {shown.length === 0 ? (
            /* Empty state: the same animated no-results scene the product range uses */
            <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white px-6 py-10 text-center md:p-12">
              <NoResultsIllustration className="mx-auto h-auto w-full max-w-[15rem]" />
              <h3 className="font-display mt-4 text-lg font-semibold text-[#0B2E5E]">
                {posts.length === 0 ? "Articles couldn’t be loaded" : "No articles found"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {posts.length === 0
                  ? "Please try again in a moment."
                  : "Nothing matches that search or topic yet. Try another keyword or browse all articles."}
              </p>
              {posts.length > 0 && (topic !== "All" || query) && (
                <button
                  type="button"
                  onClick={() => {
                    setTopic("All");
                    setQuery("");
                    setLimit(PAGE);
                  }}
                  className="mt-6 inline-flex items-center rounded-full border-2 border-primary bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  Show all articles
                </button>
              )}
            </div>
          ) : (
            <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <li key={p.slug}>
                  <article className="group flex h-full flex-col">
                    <Link
                      href={`/blog/${p.slug}`}
                      tabIndex={-1}
                      aria-hidden
                      className="block overflow-hidden rounded-2xl bg-slate-100"
                    >
                      <Cover
                        post={p}
                        className="aspect-[16/10] w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                    </Link>
                    <p className="mt-4 text-[12.5px] text-slate-500">
                      <span className="font-semibold text-primary">{p.tag}</span>
                      <span className="mx-2 text-slate-300">·</span>
                      {p.date}
                    </p>
                    <h3 className="font-display mt-1.5 line-clamp-2 text-[17px] font-semibold leading-snug text-[#0B2E5E] transition-colors group-hover:text-primary">
                      <Link href={`/blog/${p.slug}`} className="focus-visible:outline-none focus-visible:underline">
                        {p.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-slate-600">{p.excerpt}</p>
                    <Link
                      href={`/blog/${p.slug}`}
                      aria-label={`Read more: ${p.title}`}
                      className="mt-auto inline-flex items-center gap-2.5 pt-4 text-[13.5px] font-medium text-slate-700 transition-colors hover:text-primary"
                    >
                      Read more
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}

          {list.length > limit && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setLimit((n) => n + PAGE)}
                className="rounded-full px-7 py-3 text-sm font-semibold text-primary-deep ring-1 ring-primary-deep/30 transition hover:bg-primary-deep hover:text-white"
              >
                Load more articles <span className="tabular-nums text-slate-400">({list.length - limit})</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
