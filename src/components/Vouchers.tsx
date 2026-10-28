"use client";

import { motion } from "framer-motion";
import { useScrollReveal } from "@/components/ui";

/* Yellow voucher tickets for the Senior Citizen / PWD discounts.
   Each ticket is two pieces split at the dashed tear line, with half-circle notches cut into both sides.
   They start "closed" (only the top shows, the stub folded back along the tear line) and the stub
   unfolds downward when the vouchers scroll into view. */

const NOTCH = 12; // px radius of the side notches

// Top piece: notches at its bottom corners. Stub: notches at its top corners.
const TOP_MASK =
  `radial-gradient(circle ${NOTCH}px at 0 100%, transparent 98%, #000) left / 51% 100% no-repeat, ` +
  `radial-gradient(circle ${NOTCH}px at 100% 100%, transparent 98%, #000) right / 51% 100% no-repeat`;
const STUB_MASK =
  `radial-gradient(circle ${NOTCH}px at 0 0, transparent 98%, #000) left / 51% 100% no-repeat, ` +
  `radial-gradient(circle ${NOTCH}px at 100% 0, transparent 98%, #000) right / 51% 100% no-repeat`;

const vouchers = [
  { value: "20%", label: "on eligible prescription medicines for your own use", code: "DISCOUNT" },
  { value: "VAT", label: "on the same eligible purchases", code: "EXEMPT" },
];

export default function Vouchers() {
  // same visible-first reveal as <Reveal>: server HTML shows the vouchers open; only when they start
  // below the fold are they snapped closed after hydration and opened on scroll.
  const { ref, controls } = useScrollReveal("-80px");

  return (
    <motion.div ref={ref} className="grid grid-cols-2 gap-4" initial={false} animate={controls}>
      {vouchers.map(({ value, label, code }, i) => (
        <motion.div
          key={code}
          className="flex flex-col text-center text-black [perspective:700px]"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.45, delayChildren: 0.15 + i * 0.5 } },
          }}
        >
          <motion.div
            className="flex h-[120px] items-center justify-center rounded-t-2xl bg-[#FFE500] px-4 pt-2"
            style={{ WebkitMask: TOP_MASK, mask: TOP_MASK }}
            variants={{
              hidden: { scale: 0.92, opacity: 0 },
              show: { scale: 1, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <span className="font-display text-4xl font-bold leading-none tracking-tight md:text-5xl">{value}</span>
          </motion.div>

          {/* stub folds back along the tear line, then swings open */}
          <motion.div
            className="flex flex-1 flex-col rounded-b-2xl bg-[#FFE500] [transform-origin:top]"
            style={{ WebkitMask: STUB_MASK, mask: STUB_MASK }}
            variants={{
              hidden: { rotateX: -100, opacity: 0 },
              show: {
                rotateX: 0,
                opacity: 1,
                transition: { rotateX: { duration: 1.4, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.5 } },
              },
            }}
          >
            <div aria-hidden className="mx-6 border-t-2 border-dashed border-black/15" />
            <div className="flex flex-1 flex-col items-center justify-center px-4 pb-5 pt-3">
              <p className="text-[11px] font-medium leading-snug text-black/70">{label}</p>
              <p className="font-display mt-1 text-lg font-bold tracking-wide md:text-xl">{code}</p>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
