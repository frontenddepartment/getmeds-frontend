"use client";

/* Therapeutic-area section — brand-blue band: the ribbon Spiral Stream on the left,
   two-tone heading and the therapeutic-area pills on the right. */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { therapeuticAreas } from "@/lib/data";
import SpiralStream from "./SpiralStream";

export default function AreaSlider() {
  const pillsRef = useRef<HTMLDivElement | null>(null);

  // On first scroll into view, play the wipe hover effect on all pills at once
  useEffect(() => {
    const wrap = pillsRef.current;
    if (!wrap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        const pills = Array.from(wrap.children) as HTMLElement[];
        timers.push(
          window.setTimeout(() => pills.forEach((p) => p.classList.add("wipe-auto")), 400),
          window.setTimeout(() => pills.forEach((p) => p.classList.remove("wipe-auto")), 1800)
        );
      },
      { threshold: 0.5 }
    );
    io.observe(wrap);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="bg-[#1D9FDA] text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-5 py-8 md:px-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-10 lg:py-4">
        <SpiralStream className="h-[320px] md:h-[380px] lg:h-[440px]" />

        <div className="pb-6 lg:pb-0">
          <p className="font-display text-2xl font-light text-white/85 md:text-[2rem]">
            Therapeutic areas we serve
          </p>
          <h2 className="font-display text-2xl font-semibold leading-tight text-white md:text-[2.3rem]">
            across the Philippines.
          </h2>

          {/* pills grow to fill each row edge to edge */}
          <div ref={pillsRef} className="mt-8 flex flex-wrap gap-2.5 md:mt-10 md:gap-3">
            {therapeuticAreas.map((a) => (
              <Link
                key={a.slug}
                href="/product-range"
                className="btn-wipe btn-wipe-light grow rounded-full border border-white bg-transparent px-5 py-2.5 text-center text-sm font-medium text-white md:px-6 md:py-3 md:text-[15px]"
              >
                {a.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
