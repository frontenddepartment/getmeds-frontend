"use client";

/* Two FDA licence certificates as a paper stack that trades places every 3 seconds:
   the back sheet slides forward and the front one tucks behind. Pauses for reduced motion. */

import { useEffect, useState } from "react";
import Image from "next/image";

const SHEETS = [
  {
    src: "/images/licenseone.jpeg",
    alt: "FDA License to Operate: Drugstore with online ordering and delivery, Getmeds Philippines Inc.",
  },
  {
    src: "/images/licensetwo.jpeg",
    alt: "FDA License to Operate: Drug Distributor-Importer/Wholesaler, Getmeds Philippines Inc.",
  },
];

const FRONT = "translate(0%, 0%) rotate(-2deg) scale(1)";
const BACK = "translate(30%, 9%) rotate(4deg) scale(0.96)";

export default function LicenseStack() {
  const [front, setFront] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setFront((f) => (f + 1) % SHEETS.length), 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    // the box reserves room for both sheets (front at top-left, back shifted right and down)
    // right-click, drag-out and long-press saving are switched off for the certificates
    <div
      className="relative mx-auto aspect-[100/118] w-full max-w-md select-none sm:max-w-lg [-webkit-touch-callout:none]"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {SHEETS.map((sheet, i) => {
        const isFront = i === front;
        return (
          <div
            key={sheet.src}
            className="absolute left-0 top-0 w-[76%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: isFront ? FRONT : BACK, zIndex: isFront ? 20 : 10 }}
          >
            <Image
              src={sheet.src}
              alt={sheet.alt}
              width={1132}
              height={1600}
              sizes="(min-width: 1024px) 30vw, 70vw"
              draggable={false}
              className={`pointer-events-none h-auto w-full rounded-xl ring-1 ring-slate-200 transition-shadow duration-700 ${
                isFront ? "shadow-[0_24px_50px_-20px_rgba(6,40,64,0.5)]" : "shadow-[0_18px_40px_-24px_rgba(6,40,64,0.4)]"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
