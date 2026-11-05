# Getmeds.ph — Future (v2 Revamp)

A modern, clean + glassy redesign of [getmeds.ph](https://getmeds.ph) built with **Next.js 16, React 19, Tailwind CSS v4, Framer Motion, and D3**.

Primary brand color: `#1D9FDA`.

## Run

```bash
npm install
npm run dev       # development (pick a free port if 3000 is taken: npm run dev -- -p 3100)
npm run build
npx next start -p 3100   # production preview (port 3000 is used by another app on this machine)
```

## Pages

| Route | Highlights |
|---|---|
| `/` | Animated illustrated hero, counters, 3D-tilt portfolio cards, therapeutic areas, capabilities, FAQ accordion |
| `/global-network` | **Futuristic interactive D3 globe** (canvas, orthographic) — animated arcs from Manila to each location, drag-to-rotate, clickable glowing nodes, expansion timeline |
| `/product-range` | Live search + category filters over the full 58-product catalog, animated grid |
| `/about-us` | Story, mission/vision tilt cards, credentials, commitments, leadership |
| `/services` | Four pillars with sticky headings and the ten core capabilities |
| `/patient-assistance-program` | Taglish 6-step PAP guide with DSWD / PCSO document checklist toggle |
| `/order-medicines` | Audience cards, Senior/PWD discount panel, delivery + trust sections |
| `/careers`, `/csr`, `/ungc`, `/contact-us`, `/meditations`, `/blog` | Fully redesigned to match |

## Where things live

- `src/lib/data.ts` — all site content (products, network locations, stats, FAQs…), extracted from the live site
- `src/components/Globe.tsx` — the D3 globe (world topology in `public/world-110m.json`)
- `src/components/ui.tsx` — Reveal / Stagger / Counter / TiltCard / SectionHeading primitives
- `src/app/globals.css` — brand tokens, glass + aurora + grid utilities, buttons
