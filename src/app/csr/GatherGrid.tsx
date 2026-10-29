"use client";

/* Photo grid with the previous CSR page's "card deck" entrance: the cards rise from below fanned
   out at the centre, then unfan and settle into their grid slots once the grid scrolls into view.
   `lead` is an optional first tile rendered instead of a photo (e.g. the EPCALM card). */

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";

export default function GatherGrid({
  images,
  alt,
  cols = 4,
  aspect = "aspect-square",
  lead,
}: {
  images: string[];
  alt: string;
  cols?: 2 | 4;
  aspect?: string;
  lead?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .gather-grid .gather-card {
          opacity: 0;
          translate: 0 110px;
          transform-origin: 50% 100%;
          transition: opacity 0.7s ease, translate 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1) 0.7s;
        }
        .gather-grid .gather-card:nth-child(1) { transform: translateX(55%) translateY(10px) rotate(-9deg); transition-delay: 0s, 0s, 0.7s; }
        .gather-grid .gather-card:nth-child(2) { transform: translateX(-55%) translateY(10px) rotate(9deg); transition-delay: 0.09s, 0.09s, 0.79s; }
        .gather-grid .gather-card:nth-child(3) { transform: translateX(55%) translateY(10px) rotate(-9deg); transition-delay: 0.18s, 0.18s, 0.88s; }
        .gather-grid .gather-card:nth-child(4) { transform: translateX(-55%) translateY(10px) rotate(9deg); transition-delay: 0.27s, 0.27s, 0.97s; }
        @media (min-width: 1024px) {
          .gather-grid.cols-4 .gather-card:nth-child(1) { transform: translateX(160%) translateY(16px) rotate(-14deg); }
          .gather-grid.cols-4 .gather-card:nth-child(2) { transform: translateX(55%) translateY(4px) rotate(-5deg); }
          .gather-grid.cols-4 .gather-card:nth-child(3) { transform: translateX(-55%) translateY(4px) rotate(5deg); }
          .gather-grid.cols-4 .gather-card:nth-child(4) { transform: translateX(-160%) translateY(16px) rotate(14deg); }
        }
        /* :nth-child(n) keeps this at least as specific as the per-card fan rules above (including the
           desktop .cols-4 ones), so it wins once the grid is in view. */
        .gather-grid.in-view .gather-card:nth-child(n) {
          opacity: 1;
          translate: 0 0;
          transform: translateX(0) translateY(0) rotate(0deg);
        }
        @media (prefers-reduced-motion: reduce) {
          .gather-grid .gather-card:nth-child(n) { opacity: 1; translate: 0 0; transform: none !important; transition: none; }
        }
      `}</style>
      <div
        ref={ref}
        className={`gather-grid cols-${cols} grid grid-cols-2 gap-4 ${cols === 4 ? "lg:grid-cols-4" : ""}`}
      >
        {lead && <div className={`gather-card relative overflow-hidden rounded-2xl ${aspect}`}>{lead}</div>}
        {images.map((src, i) => (
          <div key={src} className={`gather-card relative overflow-hidden rounded-2xl bg-slate-100 ${aspect}`}>
            <Image
              src={src}
              alt={`${alt}, photo ${i + 1}`}
              fill
              sizes={cols === 4 ? "(min-width: 1024px) 25vw, 50vw" : "50vw"}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
}
