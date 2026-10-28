"use client";

/*
 * "What we do" capability rows. Each row is revealed by a blue→green scan
 * beam that wipes across it; the icon powers up inside a spinning gradient
 * ring, the title resolves out of a blur, and the description follows.
 * On hover a cursor-following spotlight lights the row, the ring spins
 * faster, the arrow turns to point forward and a gradient rule draws in.
 */

import { motion, useReducedMotion, type TargetAndTransition, type Transition, type Variants } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import type { MouseEvent } from "react";
import { Icon } from "@/components/icons";
import { useScrollReveal } from "@/components/ui";

const EASE = [0.22, 1, 0.36, 1] as const;

type Item = { icon: string; title: string; text: string };

function Row({ c, i, still }: { c: Item; i: number; still: boolean }) {
  const d = 0.05 + (i % 3) * 0.12; // small stagger within a screenful
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  // Variants keyed "hidden"/"show": one unclipped wrapper owns the in-view
  // trigger, so a fully clipped row can never fail to start its reveal.
  const v = (hidden: TargetAndTransition, show: TargetAndTransition, transition: Transition): Variants | undefined =>
    still ? undefined : { hidden, show: { ...show, transition } };

  // Visible in the server HTML; only rows still below the fold after load are hidden and revealed.
  const { ref, controls } = useScrollReveal("-40px");
  // Rows are square, edge-to-edge cards below md, so the reveal clip drops its rounding there.
  const round = typeof window !== "undefined" && !matchMedia("(min-width: 768px)").matches ? 0 : 16;

  return (
    <motion.div ref={ref} initial={false} animate={controls}>
    <motion.div
      onMouseMove={onMove}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-none px-5 py-5 md:rounded-2xl transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(29,159,218,0.45)] lg:flex-row lg:items-center lg:justify-between lg:gap-10 md:px-7 md:py-6 ${
        i % 2 ? "bg-[#f7fafc]" : "bg-white"
      }`}
      variants={v(
        { clipPath: `inset(0 100% 0 0 round ${round}px)` },
        { clipPath: `inset(0 0% 0 0 round ${round}px)` },
        { duration: 0.9, ease: EASE, delay: d }
      )}
    >
      {/* scan beam that leads the reveal */}
      {!still && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-28 -skew-x-12 bg-gradient-to-r from-transparent via-[#1D9FDA]/35 to-transparent"
          style={{ left: "-15%", opacity: 0 }}
          variants={v(
            { left: "-15%", opacity: 0 },
            { left: ["-15%", "105%"], opacity: [0, 1, 1, 0] },
            { duration: 1.05, ease: EASE, delay: d, times: [0, 0.1, 0.8, 1] }
          )}
        />
      )}

      {/* hover spotlight following the cursor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(29,159,218,0.13), rgba(97,166,68,0.06) 45%, transparent 70%)",
        }}
      />

      {/* gradient rule that draws in on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#1D9FDA] to-[#61A644] transition-transform duration-700 ease-out group-hover:scale-x-100"
      />

      <div className="relative flex items-center gap-4 md:gap-6">
        {/* icon orb inside a spinning gradient ring */}
        <motion.span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center"
          variants={v(
            { scale: 0.4, opacity: 0, filter: "blur(6px)" },
            { scale: 1, opacity: 1, filter: "blur(0px)" },
            { type: "spring", stiffness: 220, damping: 16, delay: d + 0.25 }
          )}
        >
          <span
            aria-hidden
            className="absolute -inset-[2px] animate-[spin_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#1D9FDA,#61A644,rgba(97,166,68,0)_55%,rgba(29,159,218,0)_75%,#1D9FDA)] opacity-70 transition-opacity duration-500 group-hover:animate-[spin_1.6s_linear_infinite] group-hover:opacity-100 motion-reduce:animate-none"
          />
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white text-primary-deep shadow-[0_0_0_1px_rgba(219,231,239,0.6)] transition-colors duration-300 group-hover:text-[#1D9FDA]">
            <Icon name={c.icon} className="h-5 w-5" />
          </span>
          {/* soft glow pulse behind the orb */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-[#1D9FDA]/30 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
          />
        </motion.span>

        <motion.span
          className="hidden sm:block"
          variants={v({ opacity: 0, rotate: -90 }, { opacity: 1, rotate: 0 }, { duration: 0.6, ease: EASE, delay: d + 0.35 })}
        >
          <ArrowDownRight className="h-4 w-4 shrink-0 text-ink-soft/50 transition-all duration-500 group-hover:-rotate-45 group-hover:text-[#61A644]" />
        </motion.span>

        <motion.h3
          className="font-display text-lg font-medium leading-snug text-primary-deep transition-transform duration-500 group-hover:translate-x-1 md:text-2xl"
          variants={v(
            { opacity: 0, x: -24, filter: "blur(8px)", letterSpacing: "0.06em" },
            { opacity: 1, x: 0, filter: "blur(0px)", letterSpacing: "0em" },
            { duration: 0.9, ease: EASE, delay: d + 0.3 }
          )}
        >
          {c.title}
        </motion.h3>
      </div>

      <motion.p
        className="relative text-balance text-sm leading-relaxed text-ink-soft lg:w-96 lg:shrink-0"
        variants={v(
          { opacity: 0, y: 12, filter: "blur(4px)" },
          { opacity: 1, y: 0, filter: "blur(0px)" },
          { duration: 0.8, ease: EASE, delay: d + 0.5 }
        )}
      >
        {c.text}
      </motion.p>
    </motion.div>
    </motion.div>
  );
}

export default function CapabilityList({ items }: { items: Item[] }) {
  const still = !!useReducedMotion();
  return (
    <div className="-mx-5 mt-8 space-y-1.5 md:mx-0">
      {items.map((c, i) => (
        <Row key={c.title} c={c} i={i} still={still} />
      ))}
    </div>
  );
}
