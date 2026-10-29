"use client";

/* Therapeutic-area section — white band with a one-line two-tone heading and a two-row slider of
   pastel-tinted category cards (about 4½ columns visible on desktop, arrows to slide). Each card has a coloured circle (inside a
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
          className="mt-8 grid snap-x snap-mandatory auto-cols-[72%] grid-flow-col grid-rows-2 gap-x-5 gap-y-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[calc((100%-2.5rem)/2.5)] md:mt-10 lg:auto-cols-[calc((100%-5rem)/4.5)] [&::-webkit-scrollbar]:hidden"
        >
          {therapeuticAreas.map((a) => {
            const color = AREA_COLORS[a.slug] ?? FALLBACK_COLOR;
            return (
            // whole card is the link; title sits vertically centred on the left (no button)
            <Link
              key={a.slug}
              href="/product-range"
              className="group relative flex h-[104px] snap-start items-center overflow-hidden rounded-2xl p-4 text-black transition hover:brightness-[0.98]"
              style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, white)` }}
            >
              {/* faint halo + coloured circle with the area's product */}
              <span aria-hidden className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full opacity-[0.08]" style={{ backgroundColor: color }} />
              <span aria-hidden className="absolute -bottom-4 -right-4 h-28 w-28 rounded-full opacity-[0.1]" style={{ backgroundColor: color }} />
              <div aria-hidden className="absolute bottom-3 right-4 h-[64px] w-[64px] rounded-full" style={{ backgroundColor: color }}>
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
