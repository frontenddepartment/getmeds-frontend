"use client";

import {
  motion,
  useAnimationControls,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, type CSSProperties, type ReactNode, type MouseEvent } from "react";

/* ---------- Scroll reveal ---------- */

type InViewMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"];

/**
 * Visible-first scroll reveal. Server HTML always renders the content fully visible
 * (crawlers and first paint see real text). After hydration, only elements still
 * below the fold are hidden — instantly, off-screen — and play their "show" variant
 * when scrolled into view. Pair with `initial={false} animate={controls}` and
 * "hidden"/"show" variants.
 */
export function useScrollReveal<T extends Element = HTMLDivElement>(margin: InViewMargin = "-60px") {
  const ref = useRef<T>(null);
  const controls = useAnimationControls();
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin });
  const armed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (reduced || !el || el.getBoundingClientRect().top <= window.innerHeight) return;
    armed.current = true;
    controls.set("hidden");
  }, [controls, reduced]);

  useEffect(() => {
    if (inView && armed.current) controls.start("show");
  }, [inView, controls]);

  return { ref, controls };
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Above-the-fold content: CSS rise on load, text never hidden. */
  immediate?: boolean;
}) {
  const { ref, controls } = useScrollReveal();

  if (immediate) {
    const style: CSSProperties | undefined = delay ? { animationDelay: `${delay}s` } : undefined;
    return (
      <div className={`rise-in ${className ?? ""}`} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={controls}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE_OUT } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, controls } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={controls}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Animated counter ---------- */
const formatCount = (n: number, suffix: string) =>
  Intl.NumberFormat("en-US").format(Math.round(n)) + suffix;

export function Counter({
  value,
  suffix = "",
  className,
  from,
}: {
  value: number;
  suffix?: string;
  className?: string;
  /** Where the count-up starts. Defaults to 1,000 for big numbers, 0 for small ones. */
  from?: number;
}) {
  const start = from ?? (value >= 1000 ? 1000 : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(start);
  const spring = useSpring(mv, { duration: 2000, bounce: 0 });

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = formatCount(v, suffix);
    });
  }, [spring, suffix]);

  useEffect(() => {
    if (!inView) return;
    if (ref.current) ref.current.textContent = formatCount(start, suffix);
    mv.set(value);
  }, [inView, start, value, suffix, mv]);

  /* SEO: the server HTML carries the real number; the count-up only runs in the browser */
  return (
    <span ref={ref} className={className}>
      {formatCount(value, suffix)}
    </span>
  );
}

/* ---------- 3D tilt card ---------- */
export function TiltCard({
  children,
  className,
  max = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 220, damping: 20 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <div className="tilt-wrap">
      <motion.div
        className={`tilt-card ${className ?? ""}`}
        style={{ rotateX, rotateY }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow?: string;
  title?: ReactNode;
  text?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} mb-12 md:mb-16`}
    >
      {eyebrow && (
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="font-display mt-4 text-3xl font-bold leading-tight text-primary-deep md:text-[2.6rem]">
          {title}
        </h2>
      )}
      {text && <p className="mt-4 text-base leading-relaxed text-ink-soft md:text-lg">{text}</p>}
    </Reveal>
  );
}
