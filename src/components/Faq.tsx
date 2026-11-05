"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs, type FaqItem } from "@/lib/data";

/*
 * Every answer stays in the server HTML even when collapsed (SEO: the FAQPage schema
 * must match visible, crawlable content). Closed panels collapse via grid rows and are
 * made `inert` so their links aren't tabbable.
 */
export default function Faq({
  items = faqs,
  theme = "blue",
  initialOpen = 0,
  idPrefix = "faq",
  className = "",
}: {
  items?: FaqItem[];
  theme?: "blue" | "white";
  initialOpen?: number | null;
  idPrefix?: string;
  className?: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(initialOpen);
  const isWhite = theme === "white";

  return (
    <div className={`w-full border-t ${isWhite ? "border-slate-200" : "border-white/30"} ${className}`}>
      {items.map((f, i) => {
        const open = openIdx === i;
        const panelId = `${idPrefix}-panel-${i}`;
        return (
          <div key={f.q} className={`overflow-hidden border-b ${isWhite ? "border-slate-200" : "border-white/30"}`}>
            <h3>
              <button
                onClick={() => setOpenIdx(open ? null : i)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-1 py-4 text-left"
              >
                <span
                  className={`font-display font-semibold ${
                    isWhite
                      ? "text-base md:text-[17px] text-black"
                      : "text-sm md:text-[15px] text-white"
                  }`}
                >
                  {f.q}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-[rotate,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isWhite
                      ? open
                        ? "rotate-180 bg-primary text-white"
                        : "bg-slate-100 text-slate-600"
                      : open
                        ? "rotate-180 bg-white text-[#1D9FDA]"
                        : "bg-white/15 text-white"
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              inert={!open}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`space-y-2 px-1 pb-4 leading-relaxed ${
                    isWhite
                      ? "text-[14px] md:text-base text-black [&_*]:text-black [&_p]:text-black [&_li]:text-black [&_strong]:text-black [&_strong]:font-semibold [&_span]:text-black [&_a]:font-bold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary-dark [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5"
                      : "text-[13px] md:text-sm text-white [&_*]:text-white [&_p]:text-white [&_li]:text-white [&_strong]:text-white [&_span]:text-white [&_a]:font-bold [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-90 [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5"
                  }`}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
