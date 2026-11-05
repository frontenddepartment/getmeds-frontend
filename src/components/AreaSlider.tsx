"use client";

/* Therapeutic-area section — white band with a one-line two-tone heading and a two-row slider of
   pastel-tinted category cards (about 4½ columns visible on desktop, arrows to slide). Each card has a coloured circle (inside a
   faint halo) holding a product from that area, and links to the product range. */

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { therapeuticAreas } from "@/lib/data";

// A real Getmeds pack per area, trimmed from its photo in public/images/products to public/images/areas/product-packs/<slug>.png.
// The image optimizer caches by address, so replacing a picture needs a new file or folder name, not just an overwrite:
// oncology PacliGet, hematology IdaGet, anti-infectives VancoGet, endocrinology DanaGet, orthopedic ZoloGet,
// cardiology AmloGet, neuro-oncology TemoGet, respiratory CetriGet, nephrology SevelaMed, pain Tradmin,
// rheumatology DexGet.
const areaImage = (slug: string) => `/images/areas/product-packs/${slug}.png`;

// One colour per category (the circle); the card is a light tint of the same colour.
const AREA_COLORS: Record<string, string> = {
  oncology: "#B5A1D8",        // Oncology (Solid Tumors)
  "anti-infectives": "#D9A441",
  orthopedic: "#D6B435",
  "neuro-oncology": "#828995",
  nephrology: "#339B70",      // Nephrology / Renal
  hematology: "#C75562",      // Oncology / Hematology
  endocrinology: "#3C86C6",
  cardiology: "#CB4050",
  respiratory: "#8D9CA7",     // Respiratory / Allergy
  pain: "#8262B4",            // Pain Management
  rheumatology: "#3F73B8",
};
const FALLBACK_COLOR = "#1D9FDA";

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
            <p className="text-sm font-semibold text-primary">Categories</p>
            {/* same size and weight as Contact Us's "Get in touch with us." */}
            <h2 className="font-display mt-2 text-2xl font-semibold leading-tight text-primary-deep md:text-[2rem]">
              <span className="text-ink-soft/80">Therapeutic areas we serve</span>{" "}
              <span>across the Philippines.</span>
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

        {/* two rows that slide sideways; column width leaves the 5th column half visible on desktop */}
        <div
          ref={trackRef}
          className="mt-8 grid snap-x snap-mandatory auto-cols-[calc((100%-0.75rem)/2.2)] grid-flow-col max-[359px]:auto-cols-[calc((100%-0.75rem)/1.8)] grid-rows-2 gap-x-3 gap-y-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[calc((100%-2.5rem)/2.5)] sm:gap-x-5 md:mt-10 lg:auto-cols-[calc((100%-5rem)/4.5)] [&::-webkit-scrollbar]:hidden"
        >
          {therapeuticAreas.map((a) => {
            const color = AREA_COLORS[a.slug] ?? FALLBACK_COLOR;
            return (
            // whole card is the link; title sits vertically centred on the left (no button)
            <Link
              key={a.slug}
              href="/product-range"
              className="group relative flex h-[76px] snap-start items-center overflow-hidden rounded-xl p-2.5 text-black transition hover:brightness-[0.98] sm:h-[104px] sm:rounded-2xl sm:p-4"
              style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, white)` }}
            >
              {/* faint halo + coloured circle with the area's product */}
              <span aria-hidden className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full opacity-[0.08]" style={{ backgroundColor: color }} />
              <span aria-hidden className="absolute -bottom-4 -right-4 h-28 w-28 rounded-full opacity-[0.1]" style={{ backgroundColor: color }} />
              {/* coloured circle with the area's pack (a transparent cut-out) rising out of it */}
              <div aria-hidden className="absolute bottom-[18px] right-2 h-10 w-10 rounded-full sm:bottom-3 sm:right-4 sm:h-[64px] sm:w-[64px]" style={{ backgroundColor: color }}>
                <Image
                  src={areaImage(a.slug)}
                  alt=""
                  fill
                  sizes="130px"
                  className="-translate-y-[8%] scale-[1.02] object-contain drop-shadow-[0_6px_8px_rgba(6,40,64,0.3)] transition duration-300 group-hover:-translate-y-[11%] group-hover:scale-[1.07]"
                />
              </div>

              <h3 className="font-display relative max-w-[66%] text-xs font-semibold leading-snug sm:max-w-[60%] sm:text-base">{a.name}</h3>
            </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
