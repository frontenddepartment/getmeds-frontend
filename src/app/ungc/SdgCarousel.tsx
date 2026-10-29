"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/* The 17 SDGs as a swipeable row of tall tiles with prev/next arrows (all tiles stay in the HTML).
   The row runs past the content column to the screen's right edge, as in the reference. */
export default function SdgCarousel({ heading, text, goals }: { heading: React.ReactNode; text: string; goals: string[] }) {
  const track = useRef<HTMLOListElement>(null);
  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const tile = el.querySelector("li");
    el.scrollBy({ left: dir * ((tile?.clientWidth ?? 240) + 16) * 2, behavior: "smooth" });
  };

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {heading}
          <p className="mt-4 text-[16px] leading-relaxed text-slate-600">{text}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous goals"
            className="flex h-11 w-11 items-center justify-center rounded-full text-primary-deep ring-1 ring-slate-300 transition hover:ring-primary hover:text-primary"
          >
            <ArrowLeft className="h-4.5 w-4.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next goals"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-deep"
          >
            <ArrowRight className="h-4.5 w-4.5" aria-hidden />
          </button>
        </div>
      </div>

      <ol
        ref={track}
        style={{ marginRight: "calc(50% - 50vw)" }}
        className="scrollbar-none -ml-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 pl-5 pr-5 pb-2 md:-ml-10 md:scroll-pl-10 md:pl-10"
      >
        {goals.map((g, i) => {
          const featured = i === 2; // Goal 3, Good Health and Well-Being: Getmeds' own goal
          return (
            <li
              key={g}
              className={`relative flex h-64 w-[62vw] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl p-5 sm:w-[240px] ${
                featured ? "bg-primary text-white" : "bg-primary-deep text-white"
              }`}
            >
              <span aria-hidden className="pointer-events-none absolute -right-4 -top-6 font-display text-[150px] font-semibold leading-none text-white/[0.07] tabular-nums">
                {i + 1}
              </span>
              <span className="font-display text-[15px] font-semibold tabular-nums text-white/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display relative text-[19px] font-semibold leading-snug">{g}</span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
