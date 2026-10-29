"use client";

/* Therapeutic-area section — white band with a two-tone heading and a two-row slider of
   pastel-tinted category cards (about 3½ columns visible on desktop, arrows to slide). Each card has a coloured circle (inside a
   faint halo) holding a product from that area, and links to the product range. */

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

// Light card tints, cycled across the categories (Canva-style); the circle takes the matching strong colour
const TINTS = [
  { card: "bg-[#E6F4FB]", circle: "bg-[#1D9FDA]", halo: "bg-[#1D9FDA]" },
  { card: "bg-[#EAF5E4]", circle: "bg-[#61A644]", halo: "bg-[#61A644]" },
  { card: "bg-[#FEF6DC]", circle: "bg-[#F2B705]", halo: "bg-[#F2B705]" },
  { card: "bg-[#FDECEC]", circle: "bg-[#E5484D]", halo: "bg-[#E5484D]" },
  { card: "bg-[#F0EBFB]", circle: "bg-[#8B6CD9]", halo: "bg-[#8B6CD9]" },
];

export default function AreaSlider() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  // slide by roughly three columns of cards
  const slide = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-12 md:px-10 md:pb-8 md:pt-14">
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

        {/* two rows that slide sideways; column width leaves the 4th column half visible on desktop */}
        <div
          ref={trackRef}
          className="mt-8 grid snap-x snap-mandatory auto-cols-[72%] grid-flow-col grid-rows-2 gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[calc((100%-1.5rem)/2.5)] md:mt-10 lg:auto-cols-[calc((100%-2.25rem)/3.5)] [&::-webkit-scrollbar]:hidden"
        >
          {therapeuticAreas.map((a, i) => {
            const t = TINTS[i % TINTS.length];
            return (
            // whole card is the link; title sits vertically centred on the left (no button)
            <Link
              key={a.slug}
              href="/product-range"
              className={`group relative flex h-[104px] snap-start items-center overflow-hidden rounded-xl p-4 text-black transition hover:brightness-[0.98] ${t.card}`}
            >
              {/* faint halo + coloured circle with the area's product */}
              <span aria-hidden className={`absolute -bottom-12 -right-12 h-36 w-36 rounded-full opacity-[0.08] ${t.halo}`} />
              <span aria-hidden className={`absolute -bottom-4 -right-4 h-28 w-28 rounded-full opacity-[0.1] ${t.halo}`} />
              <div aria-hidden className={`absolute bottom-3 right-4 h-[64px] w-[64px] rounded-full ${t.circle}`}>
                <Image
                  src={`/images/products/${AREA_IMAGES[a.slug] ?? "sample1"}.png`}
                  alt=""
                  fill
                  sizes="130px"
                  className="-translate-y-[16%] scale-[1.4] object-contain drop-shadow-[0_8px_10px_rgba(6,40,64,0.35)] transition duration-300 group-hover:-translate-y-[20%] group-hover:scale-[1.47]"
                />
              </div>

              <h3 className="font-display relative max-w-[60%] text-base font-semibold leading-snug">{a.name}</h3>
            </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
