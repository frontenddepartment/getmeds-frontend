"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function Breadcrumb({ trail }: { trail: BreadcrumbItem[] }) {
  // phones: start scrolled to the end so the current page is the part in view
  const ref = useRef<HTMLElement>(null);
  const last = trail[trail.length - 1]?.label;
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [last, trail.length]);
  return (
    // Phones: one swipeable line instead of wrapping onto three; wraps normally from sm up
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className="scrollbar-none -mx-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap px-4 text-[14px] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:whitespace-normal sm:px-0"
    >
      {trail.map((c, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="flex shrink-0 items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 text-slate-400" />}
            {!isLast && c.href ? (
              <Link
                href={c.href}
                onClick={c.onClick}
                className="text-primary transition-colors hover:text-primary-deep"
              >
                {c.label}
              </Link>
            ) : !isLast && c.onClick ? (
              <button
                type="button"
                onClick={c.onClick}
                className="text-primary transition-colors hover:text-primary-deep"
              >
                {c.label}
              </button>
            ) : (
              <span aria-current="page" className="font-semibold text-[#0B2E5E]">
                {c.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;

