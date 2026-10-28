"use client";

/* Therapeutic-area section — white band with a two-tone heading and one sliding row of
   compact white category cards (thin border, no shadow). Each card has a brand-blue circle
   (inside a faint halo) holding a product from that area, and links to the product range. */

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { therapeuticAreas } from "@/lib/data";

// Placeholder product shots per area (public/images/products/sample1–10) until real ones are picked
const AREA_IMAGES: Record<string, string> = {
  oncology: "sample8",
  hematology: "sample2",
  "anti-infectives": "sample3",
  endocrinology: "sample4",
  orthopedic: "sample1",
  cardiology: "sample6",
  "neuro-oncology": "sample5",
  respiratory: "sample10",
  nephrology: "sample9",
  pain: "sample7",
  rheumatology: "sample1",
};

export default function AreaSlider() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  // slide by roughly one viewport of cards
  const slide = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-display text-2xl font-light text-ink-soft/80 md:text-[2rem]">
              Therapeutic areas we serve
            </p>
            <h2 className="font-display text-2xl font-semibold leading-tight text-primary-deep md:text-[2.3rem]">
              across the Philippines.
            </h2>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              onClick={() => slide(-1)}
              aria-label="Previous therapeutic areas"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-primary-deep transition hover:border-[#1D9FDA] hover:bg-[#1D9FDA] hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => slide(1)}
              aria-label="Next therapeutic areas"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-primary-deep transition hover:border-[#1D9FDA] hover:bg-[#1D9FDA] hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* one sliding row; swipe/scroll on touch, arrows on desktop */}
        <div
          ref={trackRef}
          className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] md:mt-10 md:gap-4 [&::-webkit-scrollbar]:hidden"
        >
          {therapeuticAreas.map((a) => (
            <div
              key={a.slug}
              className="group relative flex h-[150px] w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-black md:w-[260px]"
            >
              {/* faint halo + brand-blue circle with the area's product */}
              <span aria-hidden className="absolute -bottom-14 -right-14 h-44 w-44 rounded-full bg-[#1D9FDA]/[0.07]" />
              <span aria-hidden className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-[#1D9FDA]/[0.08]" />
              <div aria-hidden className="absolute bottom-4 right-4 h-[84px] w-[84px] rounded-full bg-[#1D9FDA]">
                <Image
                  src={`/images/products/${AREA_IMAGES[a.slug] ?? "sample1"}.png`}
                  alt=""
                  fill
                  sizes="140px"
                  className="-translate-y-[16%] scale-[1.4] object-contain drop-shadow-[0_8px_10px_rgba(6,40,64,0.35)] transition duration-300 group-hover:-translate-y-[20%] group-hover:scale-[1.47]"
                />
              </div>

              <h3 className="font-display relative max-w-[58%] text-[15px] font-semibold leading-snug">{a.name}</h3>
              <div className="relative mt-auto">
                <Link
                  href="/product-range"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition hover:brightness-95"
                >
                  View products
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
