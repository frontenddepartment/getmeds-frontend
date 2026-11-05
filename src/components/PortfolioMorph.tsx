"use client";

/*
 * Portfolio particle shapes — adapted from the 2mginc.com "Who we are" canvas.
 * One shared canvas spans all four columns. On first scroll into view the
 * particles spell C A R E as a single centered word, float there briefly,
 * then each letter disperses to its own column and morphs into its shape:
 *   C Foundation → capsule      A Acceleration → DNA helix
 *   R Frontier   → atom         E Beyond the Molecule → globe + routes
 * On stacked layouts (no single visual row) the word intro is skipped and each
 * letter forms directly over its own column before morphing.
 * Brand colors: #1D9FDA (blue) with #61A644 (green) accents.
 */

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const BLUE: [number, number, number] = [29, 159, 218]; // #1D9FDA
const GREEN: [number, number, number] = [97, 166, 68]; // #61A644
const rgba = (c: [number, number, number], a: number) => `rgb(${c[0]} ${c[1]} ${c[2]} / ${a})`;

type Pt = [number, number, number, number];
export type ShapeDef = {
  pts: Pt[];
  lean: [number, number];
  spin: (t: number) => number;
  size: number;
  globe?: boolean;
};

const ring = (radius: number, y: number, count: number, warm: number, phase = 0): Pt[] =>
  Array.from({ length: count }, (_, i) => {
    const a = phase + (i / count) * TAU;
    return [radius * Math.cos(a), y, radius * Math.sin(a), warm] as Pt;
  });

const GLOBE_R = 0.84;
function latLon(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180,
    lo = (lon * Math.PI) / 180;
  return [
    GLOBE_R * Math.cos(la) * Math.sin(lo),
    GLOBE_R * Math.sin(la),
    GLOBE_R * Math.cos(la) * Math.cos(lo),
  ];
}

const HUB = latLon(14, -10);
const ROUTES = [
  [52, -70],
  [26, -52],
  [46, 44],
  [-28, -24],
].map(([lat, lon]) =>
  Array.from({ length: 49 }, (_, i) => {
    const t = i / 48,
      s = latLon(lat, lon);
    const x = s[0] + (HUB[0] - s[0]) * t;
    const y = s[1] + (HUB[1] - s[1]) * t;
    const z = s[2] + (HUB[2] - s[2]) * t;
    const k = (GLOBE_R * (1 + 0.22 * Math.sin(t * Math.PI))) / Math.hypot(x, y, z);
    return [x * k, y * k, z * k] as [number, number, number];
  })
);

/* ---------- Shape point sets ---------- */
export function capsuleDef(): ShapeDef {
  const pts: Pt[] = [];
  for (let y = -0.62; y <= 0.621; y += 0.042) {
    if (Math.abs(y) < 0.0294) continue;
    pts.push(...ring(0.37, y, 50, +(y > 0 && y < 0.17), (y / 0.042) * 0.06));
  }
  const step = 0.11351351351351352;
  for (let e = step; e < Math.PI / 2; e += step) {
    const n = Math.max(1, Math.round(50 * Math.cos(e)));
    for (const s of [1, -1])
      pts.push(...ring(0.37 * Math.cos(e), s * (0.62 + 0.37 * Math.sin(e)), n, 0));
  }
  pts.sort((a, b) => a[1] - b[1]);
  return { pts, lean: [-1.08, 0.2], spin: (t) => 0.4 * t, size: 0.42 };
}

function dnaDef(): ShapeDef {
  const pts: Pt[] = [];
  for (let i = 0; i <= 210; i++) {
    const t = i / 210,
      ang = 2.3 * t * TAU,
      y = (t - 0.5) * 2.1;
    for (const off of [0, Math.PI]) {
      const x = 0.36 * Math.cos(ang + off),
        z = 0.36 * Math.sin(ang + off);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU;
        pts.push([x + 0.028 * Math.cos(a), y + 0.028 * Math.sin(a), z, 0]);
      }
    }
    if (i % 8 === 4) {
      for (let k = 1; k < 16; k++) {
        const d = 0.36 * (1 - (2 * k) / 16);
        pts.push([d * Math.cos(ang), y, d * Math.sin(ang), k === 8 ? 1 : 0]);
      }
    }
  }
  return { pts, lean: [-0.46, 0.16], spin: (t) => 0.45 * t, size: 0.34 };
}

export function atomDef(): ShapeDef {
  const pts: Pt[] = [];
  for (let lat = -75; lat <= 75; lat += 15) {
    const r = (lat * Math.PI) / 180;
    pts.push(
      ...ring(0.17 * Math.cos(r), 0.17 * Math.sin(r), Math.max(4, Math.round(16 * Math.cos(r))), 1)
    );
  }
  for (let o = 0; o < 3; o++) {
    const ry = (o * TAU) / 3;
    const tilt = 1.15;
    const [ct, st] = [Math.cos(tilt), Math.sin(tilt)];
    const [cy, sy] = [Math.cos(ry), Math.sin(ry)];
    for (let i = 0; i < 230; i++) {
      const a = (i / 230) * TAU;
      const x0 = 0.8 * Math.cos(a),
        z0 = 0.8 * Math.sin(a);
      const y1 = -z0 * st,
        z1 = z0 * ct;
      const x2 = x0 * cy + z1 * sy,
        z2 = z1 * cy - x0 * sy;
      pts.push([x2, y1, z2, 0]);
      if (i === Math.floor(230 * (0.15 + o * 0.33))) {
        for (let k = 0; k < 10; k++) {
          const b = (k / 10) * TAU;
          pts.push([x2 + 0.05 * Math.cos(b), y1 + 0.05 * Math.sin(b), z2, 1]);
        }
      }
    }
  }
  return { pts, lean: [-0.3, 0.22], spin: (t) => 0.5 * t, size: 0.44 };
}

export function globeDef(): ShapeDef {
  const pts: Pt[] = [];
  for (let lat = -84; lat <= 84; lat += 6) {
    const r = (lat * Math.PI) / 180;
    pts.push(
      ...ring(
        GLOBE_R * Math.cos(r),
        GLOBE_R * Math.sin(r),
        Math.max(6, Math.round(104 * Math.cos(r))),
        0,
        0.05 * lat
      )
    );
  }
  return {
    pts,
    lean: [-0.24, 0.3],
    spin: (t) => 0.42 * Math.sin(0.24 * t),
    size: 0.48,
    globe: true,
  };
}

/* ---------- Letter point sampling (C·A·R·E intro) ---------- */
function letterXY(ch: string, count: number): Float32Array | null {
  const S = 160;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const c = cv.getContext("2d");
  if (!c) return null;
  c.font = `600 ${Math.round(S * 0.84)}px Poppins, Arial, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(ch, S / 2, S / 2);
  const data = c.getImageData(0, 0, S, S).data;
  const cells: number[] = [];
  for (let y = 0; y < S; y += 2)
    for (let x = 0; x < S; x += 2) if (data[(y * S + x) * 4 + 3] > 120) cells.push(x, y);
  const m = cells.length / 2;
  if (!m) return null;
  // x, y from the glyph plus a thin z jitter so the letter wobbles with real depth
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const k = Math.floor((i * m) / count) * 2;
    out[i * 3] = (cells[k] / S - 0.5) * 1.8;
    out[i * 3 + 1] = (0.5 - cells[k + 1] / S) * 1.8;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.16;
  }
  return out;
}

/* ---------- Shared multi-shape renderer ---------- */
function createCareAnim(
  canvas: HTMLCanvasElement,
  boxes: HTMLElement[],
  defs: ShapeDef[],
  word: string[],
  { still = false, n = 1000 } = {}
) {
  const ctx = canvas.getContext("2d")!;
  const N = n,
    K = defs.length;

  const at: Float32Array[] = [],
    warm: Uint8Array[] = [],
    push: Float32Array[] = [],
    screen: Float32Array[] = [],
    letters: (Float32Array | null)[] = [];
  defs.forEach((def, k) => {
    const a = new Float32Array(N * 3),
      w = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const p = def.pts[Math.floor((i * def.pts.length) / N)];
      a.set([p[0], p[1], p[2]], i * 3);
      w[i] = p[3];
    }
    at.push(a);
    warm.push(w);
    push.push(new Float32Array(N * 2));
    screen.push(new Float32Array(N * 3));
    letters.push(still ? null : letterXY(word[k], N));
  });

  let W = 0,
    H = 0,
    dpr = 1;
  let raf = 0,
    visible = true;
  let morphStart = -1; // performance.now() when the section first scrolls into view
  const mouse = { x: -9999, y: -9999, screenX: 0, screenY: 0, on: false };
  const tilt = { x: 0, y: 0 };
  let rect = { left: 0, top: 0 };

  // Per-column visual-box geometry, measured relative to the shared canvas
  const bx = new Float32Array(K),
    by = new Float32Array(K),
    bs = new Float32Array(K);
  let rowLayout = false;

  const updateRect = () => {
    const r = canvas.getBoundingClientRect();
    rect = { left: r.left, top: r.top };
  };
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const cr = canvas.getBoundingClientRect();
    rect = { left: cr.left, top: cr.top };
    let lo = Infinity,
      hi = -Infinity;
    for (let k = 0; k < K; k++) {
      const r = boxes[k].getBoundingClientRect();
      bx[k] = r.left - cr.left + r.width / 2;
      by[k] = r.top - cr.top + r.height / 2;
      bs[k] = Math.min(r.width, r.height);
      lo = Math.min(lo, by[k]);
      hi = Math.max(hi, by[k]);
    }
    // Word intro only makes sense when all four visuals sit on one row
    rowLayout = K > 1 && hi - lo < 4;
  };

  const B = new Float32Array(3);
  const HOLD = 0.6, // word floats centered
    DISP = 0.3, // letters travel to their columns
    GAP = 0.08, // beat before the first morph
    MORPH = 1.5,
    STAG = 0.25; // per-column morph stagger
  const smooth = (p: number) => {
    const c = Math.min(1, Math.max(0, p));
    return c * c * (3 - 2 * c);
  };

  function frame(ms: number) {
    const t = ms / 1000;

    mouse.x = mouse.screenX - rect.left;
    mouse.y = mouse.screenY - rect.top;
    if (mouse.on) {
      tilt.x += ((mouse.x / W - 0.5) * 2 - tilt.x) * 0.04;
      tilt.y += ((mouse.y / H - 0.5) * 2 - tilt.y) * 0.04;
    }

    // Shared wobble (time drift + mouse tilt) applied to shapes and letters alike
    const wy = still ? 0 : 0.16 * Math.sin(0.31 * t) + 0.3 * Math.max(-1, Math.min(1, tilt.x));
    const wx = still ? 0 : 0.06 * Math.sin(0.23 * t) + 0.16 * Math.max(-1, Math.min(1, tilt.y));
    const [cwy, swy] = [Math.cos(wy), Math.sin(wy)];
    const [cwx, swx] = [Math.cos(wx), Math.sin(wx)];

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ts = morphStart < 0 ? 0 : (ms - morphStart) / 1000;
    const dp = rowLayout ? smooth((ts - HOLD) / DISP) : 1; // 0 = word centered, 1 = letters at columns
    let wordCy = 0;
    for (let k = 0; k < K; k++) wordCy += by[k] / K;

    for (let k = 0; k < K; k++) {
      const def = defs[k],
        L = letters[k];
      const mStart = (rowLayout ? HOLD + DISP + GAP : 0.9) + STAG * k;
      const e = L ? smooth((ts - mStart) / MORPH) : 1; // 0 = letter, 1 = shape

      const spin = still ? 0.6 : def.spin(t);
      const [cs, ss] = [Math.cos(spin), Math.sin(spin)];
      const [cz, sz] = [Math.cos(def.lean[0]), Math.sin(def.lean[0])];
      const [cx, sx] = [Math.cos(def.lean[1]), Math.sin(def.lean[1])];
      const rot = (x: number, y: number, z: number, out: Float32Array) => {
        const x1 = x * cs + z * ss,
          z1 = z * cs - x * ss;
        const x2 = x1 * cz - y * sz,
          y2 = x1 * sz + y * cz;
        const y3 = y2 * cx - z1 * sx,
          z3 = y2 * sx + z1 * cx;
        const z4 = z3 * cwy - x2 * swy;
        out[0] = x2 * cwy + z3 * swy;
        out[1] = y3 * cwx - z4 * swx;
        out[2] = y3 * swx + z4 * cwx;
      };

      const scale = bs[k] * def.size;
      const lsc = bs[k] * 0.42;
      // Letter anchor glides from its slot in the centered word to its column
      const slotX = W / 2 + (k - (K - 1) / 2) * lsc * 1.12;
      const ax = slotX + (bx[k] - slotX) * dp;
      const ay = wordCy + (by[k] - wordCy) * dp;

      const A = at[k],
        Wk = warm[k],
        P = push[k],
        S = screen[k];
      for (let i = 0; i < N; i++) {
        const j = i * 3;
        rot(A[j], A[j + 1], A[j + 2], B);
        const persp = 3.6 / (3.6 - B[2]);
        let sx2 = bx[k] + B[0] * scale * persp,
          sy2 = by[k] - B[1] * scale * persp,
          depth = Math.min(0.999, Math.max(0, (B[2] + 1) / 2));
        if (L && e < 1) {
          // Letter gets the same wobble rotation + perspective as the shapes
          const lx0 = L[j],
            ly0 = L[j + 1],
            lz0 = L[j + 2];
          const lX = lx0 * cwy + lz0 * swy,
            z4 = lz0 * cwy - lx0 * swy;
          const lY = ly0 * cwx - z4 * swx,
            lZ = ly0 * swx + z4 * cwx;
          const lp = 3.6 / (3.6 - lZ);
          const lsx = ax + lX * lsc * lp,
            lsy = ay - lY * lsc * lp;
          const ld = Math.min(0.999, Math.max(0, (lZ + 1) / 2));
          sx2 = lsx + (sx2 - lsx) * e;
          sy2 = lsy + (sy2 - lsy) * e;
          depth = ld + (depth - ld) * e;
        }
        const dx = sx2 - mouse.x,
          dy = sy2 - mouse.y,
          dist = Math.hypot(dx, dy);
        const f = mouse.on && dist < 110 && dist > 0.01 ? ((1 - dist / 110) ** 2 * 44) / dist : 0;
        const q = i * 2;
        P[q] += (dx * f - P[q]) * 0.14;
        P[q + 1] += (dy * f - P[q + 1]) * 0.14;
        S[j] = sx2 + P[q];
        S[j + 1] = sy2 + P[q + 1];
        S[j + 2] = depth;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (let b = 0; b < 7; b++) {
        const d = (b + 0.5) / 7;
        const sz2 = Math.max(1, Math.round((1.4 + 1.6 * d * d) * dpr)),
          half = sz2 / 2;
        for (const w of [0, 1]) {
          ctx.beginPath();
          for (let i = 0; i < N; i++) {
            const j = i * 3;
            if (Wk[i] === w && Math.floor(7 * S[j + 2]) === b)
              ctx.rect(Math.round(S[j] * dpr - half), Math.round(S[j + 1] * dpr - half), sz2, sz2);
          }
          ctx.fillStyle = rgba(w ? GREEN : BLUE, 0.42 + 0.58 * d);
          ctx.fill();
        }
      }

      // Globe overlay: routes, travelling dots, pulsing green hub
      if (def.globe && e > 0.7) {
        ctx.globalAlpha = Math.min(1, (e - 0.7) / 0.3);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const project = (p: ArrayLike<number>) => {
          rot(p[0], p[1], p[2], B);
          const kk = 3.6 / (3.6 - B[2]);
          B[0] = bx[k] + B[0] * scale * kk;
          B[1] = by[k] - B[1] * scale * kk;
        };
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = rgba(BLUE, 0.5);
        ctx.beginPath();
        for (const route of ROUTES)
          route.forEach((p, i) => {
            project(p);
            if (i === 0) ctx.moveTo(B[0], B[1]);
            else ctx.lineTo(B[0], B[1]);
          });
        ctx.stroke();

        ctx.fillStyle = rgba(BLUE, 1);
        ctx.beginPath();
        ROUTES.forEach((route, r) => {
          project(route[0]);
          ctx.moveTo(B[0] + 2.5, B[1]);
          ctx.arc(B[0], B[1], 2.5, 0, TAU);
          const pos = (still ? 0.6 : (0.16 * t + 0.27 * r) % 1) * 48;
          const p0 = route[Math.floor(pos)],
            p1 = route[Math.min(48, Math.floor(pos) + 1)],
            f = pos % 1;
          project([
            p0[0] + (p1[0] - p0[0]) * f,
            p0[1] + (p1[1] - p0[1]) * f,
            p0[2] + (p1[2] - p0[2]) * f,
          ]);
          ctx.moveTo(B[0] + 3, B[1]);
          ctx.arc(B[0], B[1], 3, 0, TAU);
        });
        ctx.fill();

        project(HUB);
        ctx.fillStyle = rgba(GREEN, 1);
        ctx.beginPath();
        ctx.arc(B[0], B[1], 5, 0, TAU);
        ctx.fill();
        const pulse = still ? 0.5 : (0.5 * t) % 1;
        ctx.strokeStyle = rgba(GREEN, 1 - pulse);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(B[0], B[1], 7 + 24 * pulse, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    if (!still && visible) raf = requestAnimationFrame(frame);
  }

  const kick = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  };
  const onMove = (ev: PointerEvent) => {
    mouse.screenX = ev.clientX;
    mouse.screenY = ev.clientY;
    mouse.on = true;
  };
  const onLeave = () => {
    mouse.on = false;
  };
  const io = new IntersectionObserver(
    ([en]) => {
      if (en.intersectionRatio >= 0.35 && morphStart < 0) morphStart = performance.now();
      if ((visible = en.isIntersecting && !document.hidden)) kick();
    },
    { threshold: [0, 0.35] }
  );
  const onVis = () => {
    if ((visible = !document.hidden)) kick();
  };
  const ro = new ResizeObserver(() => {
    resize();
    kick();
  });

  resize();
  kick();
  io.observe(canvas);
  ro.observe(canvas);
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("scroll", updateRect, { passive: true });
  if (!still) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }

  return {
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    },
  };
}

/* ---------- Section ---------- */
const layers = [
  { n: "01", title: "Foundation", tagline: "Everyday medicines, never out of reach.", text: "Branded generics and essential medicines.", def: capsuleDef },
  { n: "02", title: "Acceleration", tagline: "Smarter therapies, faster access.", text: "Off-patent molecules, fixed-dose combinations, and new delivery systems.", def: dnaDef },
  { n: "03", title: "Frontier", tagline: "Advanced therapies, within reach.", text: "Oncology, hematology, specialty medicines and rare disease.", def: atomDef },
  { n: "04", title: "Beyond the Molecule", tagline: "The access infrastructure.", text: "Cold-chain logistics, last-mile delivery, and patient programs.", def: globeDef },
];

const LETTERS = ["C", "A", "R", "E"]; // intro word spelled across the four columns

export default function PortfolioMorph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const boxes = boxRefs.current.filter((b): b is HTMLDivElement => !!b);
    if (!canvas || boxes.length !== layers.length) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anim = createCareAnim(canvas, boxes, layers.map((l) => l.def()), LETTERS, {
      still,
      n: 1000,
    });
    return () => anim.destroy();
  }, []);

  return (
    <div className="relative">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {layers.map((l, i) => (
          <div
            key={l.n}
            className="lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-[#e3edf5] lg:[&:not(:first-child)]:pl-10 lg:[&:not(:last-child)]:pr-10"
          >
            <div
              ref={(el) => {
                boxRefs.current[i] = el;
              }}
              className="relative h-52 w-full md:h-60"
              style={{ background: "radial-gradient(circle, #eaf5fc 0%, #ffffff 68%)" }}
            />
            <h3 className="font-display mt-5 text-lg font-medium text-primary-deep">{l.title}</h3>
            <p className="mt-0.5 text-sm font-semibold text-[#61A644]">{l.tagline}</p>
            <p className="mt-1 text-balance text-sm leading-relaxed text-ink-soft">{l.text}</p>
          </div>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />
    </div>
  );
}
