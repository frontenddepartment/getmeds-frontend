"use client";

/*
 * "Partner with us" — isometric step blocks drawn in SVG (scene space 845×475,
 * matching the reference layout). Cinematic intro: the camera dollies in from
 * a soft blur, blocks rise out of the floor back-to-front, then each top face
 * powers up as a glass holo-pad and a particle hologram (the same capsule /
 * atom / globe point sets as the portfolio morph) materializes out of the pad
 * and keeps spinning. Leader lines draw out to the labels; afterwards the
 * blocks breathe gently and the scene parallaxes with the pointer.
 */

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useId, useRef, type PointerEvent } from "react";
import { atomDef, capsuleDef, globeDef, type ShapeDef } from "./PortfolioMorph";
import { useScrollReveal } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;
// Each item plays its full sequence (rise → pad → hologram → line → label)
// before the next one starts.
const STEP = 0.7; // seconds between items
const T_WORLD = 0.1,
  T_UN = T_WORLD + STEP,
  T_FDA = T_UN + STEP;
const RISE = 0.5; // block rise duration
const LINE_AT = 0.55; // leader line starts this long after its block
const A = 74; // half-width of a block's top diamond
const B = 37; // half-depth (2:1 isometric)
const H = 330; // side height — runs past the floor and is clipped

type Block = {
  cx: number;
  ty: number; // y of the top diamond's center
  top: string;
  left: string;
  right: string;
  pad: [string, string]; // holo-pad glass gradient
  holo: () => ShapeDef; // particle hologram above the pad
  hs: number; // hologram scale (scene units per shape unit)
  depth: number; // parallax strength
  delay: number;
  grad?: boolean; // faces filled with blue→green gradients
};

// Drawn back-to-front: the tall middle block first.
const BLOCKS: Block[] = [
  // brand blue #1D9FDA
  { cx: 431, ty: 265, top: "#1D9FDA", left: "#4BB4E4", right: "#1580B2", pad: ["#0A4F75", "#1580B2"], holo: globeDef, hs: 25, depth: 0.6, delay: T_UN },
  // brand green #61A644
  { cx: 357, ty: 340, top: "#61A644", left: "#80BC66", right: "#4C8934", pad: ["#2F5C1E", "#4C8934"], holo: atomDef, hs: 27, depth: 1, delay: T_WORLD },
  // blue → green gradient
  { cx: 505, ty: 391, top: "", left: "", right: "", pad: ["#0E5F86", "#3E7A2A"], holo: capsuleDef, hs: 29, depth: 1.2, delay: T_FDA, grad: true },
];

const ITEMS = [
  {
    n: "01",
    title: "World-Class Standards",
    tone: "text-[#61A644]", // green block
    text: "Sourced from WHO, PIC/S, US FDA, EU GMP, and UK MHRA-recognized manufacturing facilities.",
  },
  {
    n: "02",
    title: "UN Global Compact Member",
    tone: "text-[#1D9FDA]", // blue block
    text: "Advancing the UN Sustainable Development Goals through ethical, responsible, and sustainable business.",
  },
  {
    n: "03",
    title: "FDA Philippines Licensed",
    tone: "bg-gradient-to-r from-[#1D9FDA] to-[#61A644] bg-clip-text text-transparent", // gradient block
    text: "Fully licensed by the Food and Drug Administration of the Philippines as a wholesaler, importer, distributor and retail pharmacy.",
  },
];

// Leader lines in scene coordinates: from the block's top corner out to the label dot.
const LINES = [
  { x1: 357 - A, y: 340, x2: 228, delay: T_WORLD + LINE_AT }, // → World-Class Standards
  { x1: 431 + A, y: 265, x2: 607, delay: T_UN + LINE_AT }, // → UN Global Compact Member
  { x1: 505 + A, y: 391, x2: 607, delay: T_FDA + LINE_AT }, // → FDA Philippines Licensed
];

// Label anchors as % of the visible scene (y 110–475 of the 845×475 space)
const LABEL_POS = [
  { left: "4.85%", top: "54.7%", width: "20.5%" },
  { left: "74.8%", top: "34.4%", width: "22%" },
  { left: "74.8%", top: "68.5%", width: "22%" },
];

const pts = (p: number[][]) => p.map((q) => q.join(",")).join(" ");

/* ---------- Particle holograms ---------- */
const PAD = 0.7; // inner holo-pad scale relative to the top face
const HN = 420; // particles per hologram
// depth buckets: [opacity, particle size in scene units]
const BUCKETS: [number, number][] = [
  [0.35, 1.1],
  [0.65, 1.45],
  [1, 1.85],
];
const HOLO_PATHS = BUCKETS.length + 1; // + one path for accent ("warm") points

type HoloData = {
  def: ShapeDef;
  p: Float32Array; // x y z per particle (shape space)
  warm: Uint8Array;
  seed: Float32Array; // materialize start point on the pad (scene offsets)
  stag: Float32Array; // per-particle materialize delay
};

function makeHolo(b: Block): HoloData {
  const def = b.holo();
  const p = new Float32Array(HN * 3),
    warm = new Uint8Array(HN),
    seed = new Float32Array(HN * 2),
    stag = new Float32Array(HN);
  for (let i = 0; i < HN; i++) {
    const q = def.pts[Math.floor((i * def.pts.length) / HN)];
    p.set([q[0], q[1], q[2]], i * 3);
    warm[i] = q[3];
    // random point inside the pad diamond (|u| + |v| <= 1)
    let u = Math.random() * 2 - 1,
      v = Math.random() * 2 - 1;
    if (Math.abs(u) + Math.abs(v) > 1) {
      u = Math.sign(u) * (1 - Math.abs(u));
      v = Math.sign(v) * (1 - Math.abs(v));
    }
    seed[i * 2] = u * A * PAD;
    seed[i * 2 + 1] = v * B * PAD;
    stag[i] = Math.random() * 0.6;
  }
  return { def, p, warm, seed, stag };
}

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

function drawHolo(
  b: Block,
  h: HoloData,
  paths: (SVGPathElement | null)[],
  t: number,
  since: number, // seconds since this hologram started materializing
  idx: number
) {
  const { def, p, warm, seed, stag } = h;
  const spin = 0.55 * t + idx * 1.7;
  const [cs, ss] = [Math.cos(spin), Math.sin(spin)];
  const [cz, sz] = [Math.cos(def.lean[0]), Math.sin(def.lean[0])];
  const [cxl, sxl] = [Math.cos(def.lean[1]), Math.sin(def.lean[1])];
  const hx = b.cx,
    hy = b.ty - 11 + 1.6 * Math.sin(1.3 * t + idx);
  const d: string[] = Array.from({ length: HOLO_PATHS }, () => "");
  for (let i = 0; i < HN; i++) {
    if (since < stag[i]) continue; // not yet emitted from the pad
    const j = i * 3,
      x = p[j],
      y = p[j + 1],
      z = p[j + 2];
    const x1 = x * cs + z * ss,
      z1 = z * cs - x * ss;
    const x2 = x1 * cz - y * sz,
      y2 = x1 * sz + y * cz;
    const y3 = y2 * cxl - z1 * sxl,
      z3 = y2 * sxl + z1 * cxl;
    const persp = 3.6 / (3.6 - z3);
    let X = hx + x2 * b.hs * persp,
      Y = hy - y3 * b.hs * persp;
    const e = smooth((since - stag[i]) / 1.3);
    if (e < 1) {
      const sx = hx + seed[i * 2],
        sy = b.ty + seed[i * 2 + 1];
      X = sx + (X - sx) * e;
      Y = sy + (Y - sy) * e;
    }
    const depth = Math.min(0.999, Math.max(0, (z3 + 1) / 2));
    const k = warm[i] ? BUCKETS.length : Math.floor(depth * BUCKETS.length);
    const sz2 = warm[i] ? 1.9 : BUCKETS[k][1];
    d[k] += `M${(X - sz2 / 2).toFixed(1)} ${(Y - sz2 / 2).toFixed(1)}h${sz2}v${sz2}h-${sz2}z`;
  }
  for (let k = 0; k < HOLO_PATHS; k++) paths[k]?.setAttribute("d", d[k]);
}

function Prism({
  b,
  shown,
  still,
  px,
  py,
  idx,
  holoRef,
}: {
  b: Block;
  shown: boolean;
  still: boolean;
  px: MotionValue<number>;
  py: MotionValue<number>;
  idx: number;
  holoRef: (k: number) => (el: SVGPathElement | null) => void;
}) {
  const { cx, ty } = b;
  const tx = useTransform(px, (v) => v * 10 * b.depth);
  const tyy = useTransform(py, (v) => v * 5 * b.depth);
  const s = PAD;
  const top = [
    [cx, ty - B],
    [cx + A, ty],
    [cx, ty + B],
    [cx - A, ty],
  ];
  const inner = top.map(([x, y]) => [cx + (x - cx) * s, ty + (y - ty) * s]);
  const uid = `${useId().replace(/:/g, "")}-${idx}`;
  const clipId = `ps-top-${uid}`;
  const fills = b.grad
    ? { top: `url(#ps-gt-${uid})`, left: `url(#ps-gl-${uid})`, right: `url(#ps-gr-${uid})` }
    : { top: b.top, left: b.left, right: b.right };

  return (
    <motion.g style={{ x: tx, y: tyy }}>
      <motion.g
        initial={still ? false : { y: 300 }}
        animate={shown ? { y: 0 } : undefined}
        transition={{ duration: RISE, ease: EASE, delay: b.delay }}
      >
        <motion.g
          animate={shown && !still ? { y: [0, -4, 0] } : undefined}
          transition={{ duration: 4.2 + idx * 0.7, repeat: Infinity, ease: "easeInOut", delay: b.delay + RISE + 3 }}
        >
          {b.grad && (
            <defs>
              <linearGradient id={`ps-gt-${uid}`} x1="0.15" y1="0" x2="0.85" y2="0">
                <stop offset="0" stopColor="#1D9FDA" />
                <stop offset="1" stopColor="#61A644" />
              </linearGradient>
              <linearGradient id={`ps-gl-${uid}`} x1="0" y1="0" x2="0" y2="0.55">
                <stop offset="0" stopColor="#4BB4E4" />
                <stop offset="1" stopColor="#80BC66" />
              </linearGradient>
              <linearGradient id={`ps-gr-${uid}`} x1="0" y1="0" x2="0" y2="0.55">
                <stop offset="0" stopColor="#1580B2" />
                <stop offset="1" stopColor="#4C8934" />
              </linearGradient>
            </defs>
          )}
          {/* sides */}
          <polygon points={pts([[cx - A, ty], [cx, ty + B], [cx, ty + B + H], [cx - A, ty + H]])} fill={fills.left} />
          <polygon points={pts([[cx, ty + B], [cx + A, ty], [cx + A, ty + H], [cx, ty + B + H]])} fill={fills.right} />
          {/* top rim + inner face */}
          <polygon points={pts(top)} fill={fills.top} />
          {/* holo-pad: dark glass with a fine iso grid and a glowing rim */}
          <defs>
            <linearGradient id={`ps-pad-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={b.pad[0]} />
              <stop offset="1" stopColor={b.pad[1]} />
            </linearGradient>
            <radialGradient id={`ps-glow-${uid}`}>
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <polygon points={pts(inner)} fill={`url(#ps-pad-${uid})`} />
          <g stroke="#ffffff" strokeOpacity={0.14} strokeWidth={0.6}>
            {[1, 2, 3, 4].map((g) => {
              const f = g / 5;
              const [T, R, Bt, L] = inner;
              const lerp = (a: number[], c: number[]) => [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f];
              const a1 = lerp(L, T),
                a2 = lerp(Bt, R),
                b1 = lerp(L, Bt),
                b2 = lerp(T, R);
              return (
                <g key={g}>
                  <line x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} />
                  <line x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} />
                </g>
              );
            })}
          </g>
          <motion.polygon
            points={pts(inner)}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1}
            initial={still ? false : { strokeOpacity: 0 }}
            animate={shown ? { strokeOpacity: still ? 0.7 : [0, 1, 0.55, 0.85, 0.55] } : undefined}
            transition={
              still
                ? undefined
                : { duration: 3.2, delay: b.delay + RISE * 0.7, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
            }
          />
          <motion.ellipse
            cx={cx}
            cy={ty + 2}
            rx={A * s * 0.62}
            ry={B * s * 0.62}
            fill={`url(#ps-glow-${uid})`}
            initial={still ? false : { opacity: 0 }}
            animate={shown ? { opacity: still ? 0.8 : [0.45, 1, 0.45] } : undefined}
            transition={still ? undefined : { duration: 2.6, delay: b.delay + RISE * 0.75, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* light sweep across the top face */}
          <defs>
            <clipPath id={clipId}>
              <polygon points={pts(top)} />
            </clipPath>
          </defs>
          {!still && (
            <g clipPath={`url(#${clipId})`}>
              <motion.rect
                x={cx - A - 60}
                y={ty - B}
                width={34}
                height={B * 2}
                fill="white"
                opacity={0.55}
                initial={{ x: 0 }}
                animate={shown ? { x: [0, 2 * A + 120] } : undefined}
                transition={{ duration: 1.3, ease: "easeInOut", delay: b.delay + RISE + 1.6, repeat: Infinity, repeatDelay: 6 + idx }}
                style={{ skewX: -25 }}
              />
            </g>
          )}
          {/* particle hologram — paths are written every frame by the Scene loop */}
          <g>
            {BUCKETS.map(([op], k) => (
              <path key={k} ref={holoRef(k)} fill="#ffffff" fillOpacity={op} />
            ))}
            <path ref={holoRef(BUCKETS.length)} fill="#D9F99D" />
          </g>
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

function Scene({ compact = false }: { compact?: boolean }) {
  // Step labels are real text: visible in the server HTML, revealed only if below the fold.
  const { ref, controls: labels } = useScrollReveal<HTMLDivElement>("-80px");
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const still = !!useReducedMotion();
  const shown = inView || still;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (still || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const holoEls = useRef<(SVGPathElement | null)[][]>(BLOCKS.map(() => []));
  const holoRef = (i: number) => (k: number) => (el: SVGPathElement | null) => {
    holoEls.current[i][k] = el;
  };

  useEffect(() => {
    if (!shown) return;
    const data = BLOCKS.map(makeHolo);
    let t0 = -1; // set on the first frame
    if (still) {
      BLOCKS.forEach((b, i) => drawHolo(b, data[i], holoEls.current[i], 0.8, 99, i));
      return;
    }
    let raf = 0,
      onScreen = true;
    const frame = (ms: number) => {
      const t = ms / 1000;
      if (t0 < 0) t0 = t;
      BLOCKS.forEach((b, i) =>
        drawHolo(b, data[i], holoEls.current[i], t, t - t0 - (b.delay + RISE * 0.8), i)
      );
      if (onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([en]) => {
      onScreen = en.isIntersecting;
      if (onScreen) kick();
    });
    const onVis = () => {
      if (!document.hidden && onScreen) kick();
    };
    if (ref.current) io.observe(ref.current);
    document.addEventListener("visibilitychange", onVis);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [shown, still, ref]);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={compact ? "relative mx-auto w-full max-w-md" : "absolute inset-0"}
    >
      <motion.svg
        viewBox={compact ? "250 210 360 265" : "0 110 845 365"}
        className={compact ? "h-auto w-full overflow-hidden" : "h-full w-full overflow-hidden"}
        aria-hidden
        initial={still ? false : { scale: 1.08, filter: "blur(8px)", opacity: 0 }}
        animate={shown ? { scale: 1, filter: "blur(0px)", opacity: 1 } : undefined}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {BLOCKS.map((b, i) => (
          <Prism key={i} b={b} shown={shown} still={still} px={px} py={py} idx={i} holoRef={holoRef(i)} />
        ))}

        {!compact &&
          LINES.map((l, i) => (
            <g key={i}>
              <motion.line
                x1={l.x1}
                y1={l.y}
                y2={l.y}
                stroke="#3b4652"
                strokeWidth={1.1}
                strokeDasharray="2.5 2.5"
                initial={still ? false : { x2: l.x1 }}
                animate={shown ? { x2: l.x2 } : undefined}
                transition={{ duration: 0.5, ease: EASE, delay: l.delay }}
              />
              <motion.circle
                cx={l.x2}
                cy={l.y}
                fill="#26313d"
                initial={still ? { r: 3 } : { r: 0 }}
                animate={shown ? { r: 3 } : undefined}
                transition={{ duration: 0.3, ease: EASE, delay: l.delay + 0.45 }}
              />
              {!still && (
                <motion.circle
                  cx={l.x2}
                  cy={l.y}
                  fill="none"
                  stroke="#61A644"
                  strokeWidth={1}
                  initial={{ r: 3, opacity: 0 }}
                  animate={shown ? { r: [3, 3, 10], opacity: [0, 0.7, 0] } : undefined}
                  transition={{ duration: 2, times: [0, 0.05, 1], repeat: Infinity, ease: "easeOut", delay: l.delay + 1.4 + i * 0.6 }}
                />
              )}
            </g>
          ))}
      </motion.svg>

      {!compact &&
        ITEMS.map((it, i) => (
          <motion.div
            key={it.n}
            className="absolute"
            style={LABEL_POS[i]}
            initial={false}
            animate={labels}
            variants={{
              hidden: { opacity: 0, x: i === 0 ? -16 : 16, filter: "blur(6px)" },
              show: {
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                transition: { duration: 0.6, ease: EASE, delay: LINES[i].delay + 0.3 },
              },
            }}
          >
            <Label title={it.title} text={it.text} tone={it.tone} />
          </motion.div>
        ))}
    </div>
  );
}

function Label({ title, text, tone }: { title: string; text: string; tone: string }) {
  return (
    <>
      <h3 className="font-display text-base font-semibold xl:text-lg">
        <span className={tone}>{title}</span>
      </h3>
      <p className="mt-1.5 text-balance text-[13px] leading-snug text-ink-soft xl:text-sm">{text}</p>
    </>
  );
}

function Heading() {
  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
        <span className="mr-2 text-primary">•</span>Partnership
      </p>
      <h2 className="font-display mt-5 text-3xl font-medium leading-tight text-black md:text-[2.5rem]">
        Partner with us!
      </h2>
    </>
  );
}

export default function PartnerSteps() {
  const { ref: headingRef, controls: heading } = useScrollReveal<HTMLDivElement>("-80px");
  return (
    <>
      {/* Desktop: the reference composition, everything placed in scene space */}
      <div className="relative mx-auto hidden aspect-[845/365] w-full max-w-[1180px] lg:block">
        <motion.div
          ref={headingRef}
          className="absolute"
          style={{ left: "4.85%", top: "7%" }}
          initial={false}
          animate={heading}
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
          }}
        >
          <Heading />
        </motion.div>
        <Scene />
      </div>

      {/* Mobile / tablet: heading, numbered list, then the blocks */}
      <div className="px-5 pt-14 md:px-10 lg:hidden">
        <Heading />
        <div className="mt-8 space-y-6">
          {ITEMS.map((it) => (
            <div key={it.n}>
              <Label title={it.title} text={it.text} tone={it.tone} />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Scene compact />
        </div>
      </div>
    </>
  );
}
