"use client";

/* Spiral Stream — React port of public/spiralstream.html. Cards wrap a vertical 3D
   spiral and flow top → bottom; here each card is a cancer-awareness ribbon from
   public/ribbons on white, over the section's brand-blue background. */

import { useEffect, useRef } from "react";

const RIBBONS = [
  "breast", "brain", "leukemia", "lung", "childhood", "cervical", "colorectal",
  "head-neck", "liver", "lymphoma", "melanoma", "multiple-myeloma", "ovarian",
  "pancreatic", "prostate", "skin", "stomach", "testicular", "thyroid", "uterine",
].map((n) => `/ribbons/${n}.webp`);

const CONFIG = {
  cardsPerTurn: 8,   // cards in one wrap (card width is computed so they sit edge to edge)
  radius: 0.3,       // spiral radius, as a fraction of section height
  aspect: 0.62,      // card height ÷ width (landscape; the ribbon sits centred on white)
  rowSpacing: 2.1,   // distance between spiral rows, in card heights
  height: 1.3,       // spiral height, as a fraction of section height
  maxTurns: 4,       // never show more than this many spiral rows
  gap: 6,            // px gap between neighbouring cards
  loop: 32,          // seconds for one full pass (top → bottom)
  tiltX: -8,         // camera tilt in degrees
  direction: 1,      // 1 = flows top → down, -1 = bottom → up
};

// smoothstep fade near the ends of the spiral
const fade = (s: number) => {
  const e = 0.12;
  const k = Math.min(1, s / e, (1 - s) / e);
  return k * k * (3 - 2 * k);
};

export default function SpiralStream({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    let cards: HTMLDivElement[] = [];
    let count = 0;
    let turnsRad = 0;
    let spanY = 0;
    let R = 0;
    let skew = 0;

    const build = (n: number) => {
      stage.innerHTML = "";
      cards = [];
      for (let i = 0; i < n; i++) {
        const el = document.createElement("div");
        el.className = "spiral-stream__card";
        el.style.backgroundImage = `url("${RIBBONS[i % RIBBONS.length]}")`;
        stage.appendChild(el);
        cards.push(el);
      }
      count = n;
    };

    const measure = () => {
      const W = root.clientWidth;
      const H = root.clientHeight;
      R = Math.min(W * 0.38, H * CONFIG.radius);
      const step = (Math.PI * 2) / CONFIG.cardsPerTurn;
      const chord = 2 * R * Math.sin(step / 2);
      const cw = chord - CONFIG.gap;
      const ch = cw * CONFIG.aspect;
      const pitch = ch * CONFIG.rowSpacing;
      const turns = Math.max(2, Math.min(CONFIG.maxTurns, Math.round((H * CONFIG.height) / pitch)));
      spanY = turns * pitch;
      turnsRad = turns * Math.PI * 2;
      const n = turns * CONFIG.cardsPerTurn;
      if (n !== count) build(n);
      // shear so top/bottom edges follow the spiral and left/right edges stay vertical
      skew = (Math.atan2(pitch / CONFIG.cardsPerTurn, chord) * 180) / Math.PI;
      cards.forEach((c) => {
        c.style.width = `${cw}px`;
        c.style.height = `${ch}px`;
        c.style.marginLeft = `${-cw / 2}px`;
        c.style.marginTop = `${-ch / 2}px`;
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = reduced ? 0 : (now - start) / 1000;
      const progress = (t / CONFIG.loop) * CONFIG.direction;
      stage.style.transform = `rotateX(${CONFIG.tiltX}deg)`;
      for (let i = 0; i < cards.length; i++) {
        let s = (i / count + progress) % 1;
        if (s < 0) s += 1;
        const y = (s - 0.5) * spanY;
        const ang = s * turnsRad;
        const el = cards[i];
        el.style.transform = `translate3d(0, ${y}px, 0) rotateY(${(ang * 180) / Math.PI}deg) translateZ(${R}px) skewY(${skew}deg)`;
        // dim cards on the back of the spiral, fade the ends
        const front = (Math.cos(ang) + 1) / 2;
        el.style.opacity = (fade(s) * (0.2 + 0.8 * front)).toFixed(3);
        el.style.zIndex = String(Math.round(front * 1000));
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className={`spiral-stream ${className}`} aria-hidden>
      <div ref={stageRef} className="spiral-stream__stage" />
    </div>
  );
}
