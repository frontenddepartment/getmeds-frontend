"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

const SRC = "/images/capabilities-original.png";
const W = 2898;
const H = 733;

/* One row of the collage; opens from the centre outward like a pair of window shutters. */
function Half({ part, progress, range }: { part: "top" | "bottom"; progress: MotionValue<number>; range: [number, number] }) {
  const reduce = useReducedMotion();
  const closed = useTransform(progress, range, [50, 0], { clamp: true });
  const clipPath = useTransform(closed, (v) => `inset(0% ${v}% 0% ${v}% round 12px)`);
  const scale = useTransform(progress, range, [1.08, 1], { clamp: true });

  return (
    <motion.div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${W} / ${H / 2}`, clipPath: reduce ? undefined : clipPath }}
    >
      <motion.div className="absolute inset-0" style={{ scale: reduce ? 1 : scale }}>
        <Image
          src={SRC}
          alt={
            part === "top"
              ? "Getmeds team at the CPHI Japan international pharmaceutical expo, April 2026"
              : "Getmeds representatives meeting pharmaceutical manufacturers and partners at CPHI and Medtec Japan"
          }
          width={W}
          height={H}
          sizes="(min-width:1280px) 1280px, 100vw"
          className={`absolute left-0 h-auto w-full ${part === "top" ? "top-0" : "bottom-0"}`}
        />
      </motion.div>
    </motion.div>
  );
}

export default function CapabilitiesWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.55"] });

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <Half part="top" progress={scrollYProgress} range={[0, 0.5]} />
      <Half part="bottom" progress={scrollYProgress} range={[0.45, 1]} />
    </div>
  );
}
