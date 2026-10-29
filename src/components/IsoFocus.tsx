"use client";

/* Iso Focus: React port of public/iso-focus (1).html. Photos sit on a diagonal 3D rail; each one
   holds in focus in the middle, then the rail glides one place: upcoming photos come from the top
   right, passed ones stack up at the bottom left. Photos go through next/image so the large
   originals in public/images/aboutusiso are served resized. */

import Image from "next/image";
import { useEffect, useRef } from "react";

const IMAGES = [
  "iso1.jpg", "iso2.JPG", "iso3.jpg", "iso4.jpg", "iso5.png", "iso6.png",
  "iso7.jpg", "iso8.jpg", "iso9.png", "iso10.png", "iso11.JPG",
].map((f) => `/images/aboutusiso/${f}`);

const CONFIG = {
  loop: 22,          // seconds for one full cycle through all photos
  hold: 0.55,        // share of each step the focused photo stays still (0–0.9)
  cardSize: 0.5,     // photo width, fraction of the smaller side of the section
  aspect: 0.7,       // photo height ÷ width (the photos are landscape)
  depthAhead: 1.15,  // spacing of upcoming photos (top right), × photo width
  depthBehind: 0.12, // spacing of passed photos in the stack (bottom left), × photo width
  stackGap: 1.0,     // empty space between the middle photo and the stack, × photo width
  camY: -34,         // camera turn (degrees)
  camX: 26,          // camera tilt (degrees)
};

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function IsoFocus({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const N = IMAGES.length;
    let cw = 0;

    const measure = () => {
      const S = Math.min(root.clientWidth, root.clientHeight);
      cw = S * CONFIG.cardSize;
      const ch = cw * CONFIG.aspect;
      cardRefs.current.forEach((c) => {
        if (!c) return;
        c.style.width = `${cw}px`;
        c.style.height = `${ch}px`;
        c.style.marginLeft = `${-cw / 2}px`;
        c.style.marginTop = `${-ch / 2}px`;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    // stepped time: each photo holds in focus, then everything glides one place
    const steppedPos = (t: number) => {
      const raw = t / (CONFIG.loop / N);
      const k = Math.floor(raw);
      const f = raw - k;
      return k + (f < CONFIG.hold ? 0 : ease((f - CONFIG.hold) / (1 - CONFIG.hold)));
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;
    stage.style.transform = `rotateX(${-CONFIG.camX}deg) rotateY(${CONFIG.camY}deg)`;

    const frame = (now: number) => {
      const pos = steppedPos(reduced ? 0 : (now - start) / 1000);
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        // s: 0 = middle, negative = upcoming (top right), positive = passed (bottom-left stack)
        let s = (((pos - i) % N) + N) % N;
        if (s > N / 2) s -= N;
        const z =
          s < 0
            ? s * CONFIG.depthAhead * cw
            : (smooth(0, 1, s) * CONFIG.stackGap + s * CONFIG.depthBehind) * cw;
        el.style.transform = `translate3d(0, 0, ${z}px)`;
        const op = s < 0 ? 1 - smooth(-2.2, -3, s) : 1 - smooth(5, 6.5, s);
        el.style.opacity = op.toFixed(3);
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
    <div ref={rootRef} className={`iso-focus ${className}`} aria-label="Photos of the Getmeds team" role="img">
      <div ref={stageRef} className="iso-focus__stage">
        {IMAGES.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="iso-focus__card"
          >
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 420px, 70vw" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
