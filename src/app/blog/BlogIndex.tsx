"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Faq from "@/components/Faq";
import { faqs } from "@/lib/data";
import type { BlogIndexPost } from "@/lib/blogServer";

const PAGE = 12;
const FEATURED = 3;
const MAX_TOPICS = 6;
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

  // Topic chips: the most-used categories, so the row stays one line instead of every WordPress category
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => counts.set(p.tag, (counts.get(p.tag) || 0) + 1));
    return ["All", ...[...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_TOPICS).map(([t]) => t)];
  }, [posts]);

  const [topic, setTopic] = useState("All");
  const [limit, setLimit] = useState(PAGE);
  const list = useMemo(() => (topic === "All" ? posts : posts.filter((p) => p.tag === topic)), [posts, topic]);
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
      <section className="pb-10 pt-32 md:pt-40">
        <div className="mx-auto grid max-w-7xl items-end gap-6 px-5 md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-10">
          <h1 className="font-display text-[clamp(1.9rem,4.4vw,3.4rem)] font-semibold leading-[1.1] tracking-tight text-[#0B2E5E]">
            Health insights &amp; news <span className="text-primary">from Getmeds</span>
          </h1>
          <div>
            <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
              Health guides, patient-assistance how-tos and company news, from your trusted source for
              pharmaceutical insights and patient care in the Philippines.
            </p>
            <a
              href="#articles"
              className="group mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-primary transition hover:text-primary-deep"
            >
              Browse all articles
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* Featured carousel: the latest posts. The image shows clean (many already carry their title in the
          artwork, so nothing is laid over it); the story and dots sit beside it. */}
      {current && (
        <section aria-label="Latest articles" className="pb-16 md:pb-24">
          <div
            className="mx-auto max-w-7xl px-5 md:px-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* lg+: image left (kept whole, at WordPress's 1200x628), story right; stacked below lg */}
            <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr] lg:items-center lg:gap-12">
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
      <section id="articles" className="scroll-mt-28 pb-20 md:pb-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-semibold leading-tight text-[#0B2E5E]">
            Latest articles
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">
            Cancer care, medicine prices and access, government medical assistance, and news from the Getmeds team.
          </p>

          {/* Phones: one swipeable row. The scroller clips anything at its edges, so it gets vertical padding
              for the chips' rings; from md the row wraps and needs no scrolling (or clipping) at all. */}
          <div className="scrollbar-none -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 py-1.5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
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

          {shown.length === 0 ? (
            <p className="mt-10 rounded-2xl bg-slate-50 p-8 text-center text-slate-600">
              Articles couldn&apos;t be loaded right now. Please try again in a moment.
            </p>
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

      {/* Questions */}
      <section className="border-t border-slate-100 bg-[#f6f9fb] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid items-end gap-5 md:grid-cols-[1.15fr_1fr] md:gap-12">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-semibold leading-tight text-[#0B2E5E]">
              Have a question?
              <br />
              <span className="text-primary">We&apos;re here to answer.</span>
            </h2>
            <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
              Answers to what patients and families ask us most. Can&apos;t find yours?{" "}
              <Link href="/contact-us" className="font-semibold text-primary hover:text-primary-deep">
                Contact our team
              </Link>
              .
            </p>
          </div>
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
            <Faq items={faqs.slice(0, 5)} theme="white" idPrefix="blog-faq" />
            <div className="relative hidden overflow-hidden rounded-3xl lg:block">
              <Image
                src="/images/faqsimage.png"
                alt="Getmeds team member thinking about a question"
                width={1254}
                height={1254}
                sizes="(min-width: 1024px) 36vw, 0px"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
