"use client";

/* "Dedicated to:" panel on About Us. The title slides in from the left; the coloured pills sit
   in a loose, crooked pile at the bottom of the panel (no animation). */

import { motion } from "framer-motion";

// spot per pill (horizontal centre in % of the pile, distance from the bottom, tilt):
// one-line pills heaped at uneven angles, like a pile that was dropped rather than arranged
const PILLS = [
  { label: "Cold-Chain & Last-Mile Delivery", color: "bg-[#1D9FDA] text-white", cx: 34, bottom: 0, rotate: -4 },
  { label: "Hospital & Pharmacy Partnerships", color: "bg-[#F2B705] text-white", cx: 63, bottom: 46, rotate: 5 },
  { label: "Regulatory Compliance & FDA Philippines Licensing", color: "bg-[#0B2E5E] text-white", cx: 50, bottom: 96, rotate: -4 },
  { label: "Patient Assistance Program", color: "bg-[#61A644] text-white", cx: 64, bottom: 152, rotate: 10 },
  { label: "Precision Pharmaceutical Distribution", color: "bg-[#E5484D] text-white", cx: 38, bottom: 204, rotate: -8 },
  { label: "Strategic Global Sourcing", color: "bg-[#61A644] text-white", cx: 66, bottom: 258, rotate: 13 },
];

export default function DedicatedPills() {
  return (
    <div className="flex h-full flex-col">
      <motion.h3
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-2xl font-semibold text-black md:text-[2rem]"
      >
        Dedicated to:
      </motion.h3>

      {/* static pile: pills sit already stacked at uneven angles */}
      <ul className="relative mx-auto mt-6 min-h-[340px] w-full max-w-[26rem] flex-1">
        {PILLS.map((p) => (
          <li
            key={p.label}
            className={`absolute whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] font-semibold leading-tight shadow-[0_10px_20px_-12px_rgba(6,40,64,0.6)] ${p.color}`}
            style={{ left: `${p.cx}%`, bottom: p.bottom, transform: `translateX(-50%) rotate(${p.rotate}deg)` }}
          >
            {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
