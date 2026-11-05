"use client";

/* Depth Stack: React port of public/depth-stack-section (1).html. Photo cards drift out of the
   distance toward the viewer on a canvas, scattered evenly across the frame, fading in far away
   and out as they pass the camera. White background here; photos are loaded through the
   next/image optimizer so the very large originals arrive resized. Pauses while off-screen. */

import { useEffect, useRef } from "react";

const IMAGES = [
  "iso1.jpg", "iso2.JPG", "iso3.jpg", "iso4.jpg", "iso5.png", "iso6.png",
  "iso7.jpg", "iso8.jpg", "iso9.png", "iso10.png", "iso11.JPG",
].map((f) => `/_next/image?url=${encodeURIComponent(`/images/aboutusiso/${f}`)}&w=828&q=75`);

const CONFIG = {
  background: "#ffffff",
  cardCount: 18,
  cardSize: 0.42,    // card height as a share of the section height (far-plane reference)
  loopSeconds: 18,   // time for one full pass
  depth: 2.4,        // how deep the stack goes
  depthFade: 0.45,   // far cards blend into the background
  cornerRadius: 0.03,
  direction: 1,      // 1 = toward viewer
};

// seeded random so the layout is the same on every load
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// R2 low-discrepancy points: cards fill the frame evenly and depth neighbours land far apart
function buildLayout(n: number) {
  const a1 = 0.7548776662;
  const a2 = 0.569840291;
  const rand = rng(1234);
  return Array.from({ length: n }, (_, i) => {
    let x = ((0.5 + a1 * i) % 1) * 2 - 1;
    let y = ((0.5 + a2 * i) % 1) * 2 - 1;
    const r = Math.hypot(x, y) || 1e-3;
    const nr = 0.3 + 0.7 * r; // nudge away from the dead centre
    x = Math.max(-1, Math.min(1, (x / r) * nr + (rand() - 0.5) * 0.08));
    y = Math.max(-1, Math.min(1, (y / r) * nr + (rand() - 0.5) * 0.08));
    return { x: x * 1.55, y: y * 1.35 };
  });
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function DepthStack({ className = "" }: { className?: string }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cvs = canvasRef.current;
    const ctx = cvs?.getContext("2d");
    if (!section || !cvs || !ctx) return;

    const layout = buildLayout(CONFIG.cardCount);
    let sources: HTMLImageElement[] = [];
    const loaded: HTMLImageElement[] = [];
    IMAGES.forEach((src, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        loaded[i] = img;
        sources = loaded.filter(Boolean);
      };
      img.src = src;
    });

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const render = (p: number) => {
      const W = cvs.width;
      const H = cvs.height;
      ctx.fillStyle = CONFIG.background;
      ctx.fillRect(0, 0, W, H);
      if (!sources.length) return;

      const N = CONFIG.cardCount;
      const zNear = 0.45;
      const zFar = zNear + CONFIG.depth;
      const cards = Array.from({ length: N }, (_, i) => {
        const d = ((((i / N + p * CONFIG.direction) % 1) + 1) % 1); // 0 far → 1 at camera
        return { i, d, z: zFar - d * (zFar - zNear) };
      }).sort((a, b) => b.z - a.z);

      for (const c of cards) {
        const alpha = smooth(0, 0.12, c.d) * (1 - smooth(0.86, 1, c.d));
        if (alpha < 0.003) continue;
        const src = sources[c.i % sources.length];
        const ar = src.naturalWidth / src.naturalHeight;
        const s = 1 / c.z;
        let ch = CONFIG.cardSize * H * s;
        let cw = ch * ar;
        if (ar > 1.4) {
          cw = CONFIG.cardSize * H * s * 1.4;
          ch = cw / ar;
        }
        const L = layout[c.i];
        const px = W / 2 + L.x * (W / 2) * s;
        const py = H / 2 + L.y * (H / 2) * s;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(px, py);
        const rad = CONFIG.cornerRadius * cw;
        // soft shadow, lighter than the dark original so it suits a white page
        ctx.shadowColor = "rgba(6,40,64,.28)";
        ctx.shadowBlur = 0.12 * cw;
        ctx.shadowOffsetY = 0.04 * cw;
        roundRect(-cw / 2, -ch / 2, cw, ch, rad);
        ctx.fillStyle = CONFIG.background;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        roundRect(-cw / 2, -ch / 2, cw, ch, rad);
        ctx.clip();
        let dw = cw;
        let dh = cw / ar;
        if (dh < ch) {
          dh = ch;
          dw = ch * ar;
        }
        ctx.drawImage(src, -dw / 2, -dh / 2, dw, dh);
        const f = CONFIG.depthFade * Math.pow(1 - c.d, 1.1);
        if (f > 0) {
          ctx.fillStyle = `rgba(255,255,255,${Math.min(1, f)})`;
          ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
        }
        ctx.restore();
      }
    };

    // sharp on retina
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(section.clientWidth * dpr);
      cvs.height = Math.round(section.clientHeight * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(section);
    resize();

    // loop; pauses while off-screen
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let last = performance.now();
    let t = 0;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      last = performance.now();
    });
    io.observe(section);
    let raf = 0;
    const tick = (now: number) => {
      if (visible && !reduce) t += (now - last) / 1000;
      last = now;
      if (visible) render((t / CONFIG.loopSeconds) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={sectionRef} className={`relative w-full overflow-hidden bg-white ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
