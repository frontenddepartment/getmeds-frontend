"use client";

import { motion, useReducedMotion } from "framer-motion";

/*
 * Handwritten "Health Brings Hope ♥" tag on the right of the home hero.
 * Lines slide in one after another, the underline draws itself, then the whole tag
 * floats gently and the heart beats. Uses system script faces (no web font
 * download) so it renders offline.
 */
const SCRIPT =
  '"Segoe Script", "Bradley Hand", "Snell Roundhand", "Ink Free", "Lucida Handwriting", cursive';

const LINES = ["Health", "Brings", "Hope"];

export default function HeroTagline({ className = "" }: { className?: string }) {
  const still = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      animate={still ? undefined : { y: [0, -8, 0], rotate: [-12, -10, -12] }}
      initial={{ rotate: -12 }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
    >
      <div className="relative text-[#61A644]" style={{ fontFamily: SCRIPT }}>
        {LINES.map((word, i) => (
          <motion.span
            key={word}
            className="block text-[1.6rem] leading-[1.15] 2xl:text-[1.9rem]"
            style={{ paddingLeft: `${i * 0.6}em` }}
            initial={still ? false : { opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 + i * 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {i === LINES.length - 1 && (
              <motion.span
                className="ml-1 inline-block"
                initial={still ? false : { scale: 0, opacity: 0 }}
                animate={
                  still ? { scale: 1, opacity: 1 } : { scale: [0, 1.25, 1, 1.18, 1], opacity: 1 }
                }
                transition={
                  still
                    ? undefined
                    : {
                        scale: {
                          duration: 1.4,
                          delay: 1.9,
                          repeat: Infinity,
                          repeatDelay: 1.2,
                          ease: "easeInOut",
                        },
                        opacity: { duration: 0.2, delay: 1.9 },
                      }
                }
              >
                ♥
              </motion.span>
            )}
          </motion.span>
        ))}

        {/* hand-drawn underline */}
        <svg viewBox="0 0 160 30" className="ml-[0.8em] mt-0.5 h-5 w-32 overflow-visible" fill="none">
          <motion.path
            d="M4 26 C 40 12, 90 4, 156 2"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial={still ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.9, ease: "easeOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
