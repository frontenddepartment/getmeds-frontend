"use client";

import { motion } from "framer-motion";
import { HeartPulse, Pill, ShieldCheck, Truck } from "lucide-react";

/* Clean illustrated hero visual: glassy capsule scene with floating chips. */
export default function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* Backdrop rings */}
      <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1D9FDA" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1D9FDA" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[240, 190, 140].map((r, i) => (
          <motion.circle
            key={r}
            cx="260"
            cy="260"
            r={r}
            fill="none"
            stroke="url(#ring)"
            strokeWidth="1.2"
            strokeDasharray="4 10"
            animate={{ rotate: i % 2 ? -360 : 360 }}
            transition={{ duration: 50 + i * 20, repeat: Infinity, ease: "linear" }}
            style={{ originX: "260px", originY: "260px" }}
          />
        ))}
      </svg>

      {/* Center capsule illustration */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="210" height="210" viewBox="0 0 210 210">
          <defs>
            <linearGradient id="capA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1D9FDA" />
              <stop offset="100%" stopColor="#1D9FDA" />
            </linearGradient>
            <linearGradient id="capB" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dff3fc" />
            </linearGradient>
            <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#1D9FDA" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#softShadow)" transform="rotate(-38 105 105)">
            <rect x="45" y="30" width="120" height="150" rx="60" fill="url(#capB)" stroke="#bfe6f8" />
            <path d="M45 105 h120 v15 a60 60 0 0 1 -60 60 a60 60 0 0 1 -60 -60 z" fill="url(#capA)" />
            <ellipse cx="80" cy="62" rx="14" ry="26" fill="#ffffff" opacity="0.75" transform="rotate(-12 80 62)" />
          </g>
        </svg>
      </motion.div>

      {/* Floating glass chips */}
      {[
        { Icon: ShieldCheck, label: "FDA Licensed", cls: "left-0 top-16", d: 0 },
        { Icon: Truck, label: "Same-day Metro Manila", cls: "right-0 top-32", d: 0.8 },
        { Icon: HeartPulse, label: "2M+ lives touched", cls: "left-4 bottom-24", d: 1.4 },
        { Icon: Pill, label: "2,000+ medicines", cls: "right-6 bottom-10", d: 2 },
      ].map(({ Icon, label, cls, d }) => (
        <motion.div
          key={label}
          className={`glass absolute ${cls} flex items-center gap-2.5 rounded-lg px-4 py-3`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { delay: 0.4 + d * 0.2, duration: 0.5 },
            scale: { delay: 0.4 + d * 0.2, duration: 0.5 },
            y: { duration: 5 + d, repeat: Infinity, ease: "easeInOut", delay: d },
          }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold text-primary-deep">{label}</span>
        </motion.div>
      ))}

      {/* ECG line */}
      <svg viewBox="0 0 520 60" className="absolute -bottom-2 left-0 w-full opacity-70">
        <motion.path
          d="M0 30 h150 l14 -18 l16 36 l14 -40 l16 44 l12 -22 h298"
          fill="none"
          stroke="#1D9FDA"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        />
      </svg>
    </div>
  );
}
