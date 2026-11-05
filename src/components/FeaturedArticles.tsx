"use client";

/* The Blog page's featured posts on the homepage.
   Phones: a swipeable, snap-scrolling row (next card peeks in) with dots.
   md and up: the original 2/3-column grid. */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import type { BlogIndexPost } from "@/lib/blogServer";

export default function FeaturedArticles({ posts }: { posts: BlogIndexPost[] }) {
  const track = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    setActive(Math.min(posts.length - 1, Math.round(el.scrollLeft / (step + 16))));
  };
  const goTo = (i: number) => {
    const card = track.current?.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <>
    <div
      ref={track}
      onScroll={onScroll}
      className="scrollbar-none -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-10 md:overflow-visible md:px-0 lg:grid-cols-3 lg:gap-9"
    >
      {posts.map((p) => (
        <Link
          key={p.slug}
          href={`/blog/${p.slug}`}
          className="group flex w-[85%] shrink-0 snap-start flex-col md:w-auto"
        >
          {/* WordPress's 1200x628 shape: many covers carry their title in the artwork, so they stay whole */}
          <div className="relative aspect-[1200/628] overflow-hidden rounded-2xl bg-[#e6e7e8]">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- WordPress already serves the resized size we ask for
              <img
                src={p.image.card}
                alt={p.image.alt || p.title}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-primary-deep">
                <Image src="/images/getmeds-logo-white.png" alt="" width={1200} height={664} sizes="160px" className="h-auto w-[38%]" />
              </div>
            )}
            <span className="absolute left-[18px] top-[19px] rounded-full bg-[#1D9FDA] px-3 py-1.5 text-xs font-semibold leading-none text-white">
              {p.tag}
            </span>
            <span className="absolute right-[18px] top-[19px] rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold leading-none text-white backdrop-blur-sm">
              {p.date}
            </span>
          </div>

          <h3 className="font-display mt-5 px-1 text-lg font-semibold leading-snug text-[#111827] transition-colors duration-200 group-hover:text-[#1D9FDA]">
            {p.title}
          </h3>
          <p className="mt-2.5 line-clamp-3 px-1 text-sm leading-relaxed text-[#6b7280]">{p.excerpt}</p>

          <div className="mt-auto flex items-center justify-between gap-3 px-1 pt-6">
            <Image src="/images/getmeds-logo.png" alt="Getmeds" width={181} height={100} className="h-7 w-auto" />
            <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#111827]">
              Read Full Article
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
    <div className="mt-4 flex justify-center md:hidden">
      {posts.map((p, i) => (
        <button
          key={p.slug}
          type="button"
          onClick={() => goTo(i)}
          aria-label={`Show article ${i + 1}`}
          aria-current={i === active}
          className="group flex h-8 items-center px-1"
        >
          <span className={`block h-2 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-[#1D9FDA]" : "w-2 bg-[#cfe3f0]"}`} />
        </button>
      ))}
    </div>
    </>
  );
}
