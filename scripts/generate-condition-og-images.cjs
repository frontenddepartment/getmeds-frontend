// Generates a per-condition share card (og:image) for every condition hub page, by
// taking the condition's parent-category artwork (public/assets/og-<category>.jpg),
// painting out the baked-in category title, and setting the condition's own name in
// the same green→blue gradient style. RA 9711 note: cards carry the condition name
// only, never a product name — same rule as the category artwork.
//
//   node scripts/generate-condition-og-images.cjs
//
// Reads the live "Products Range" sheet from Sanity (the same product.excelJson
// document src/lib/queries.ts reads), so the set of conditions matches the hub pages
// the site actually serves. Writes:
//   public/assets/og-conditions/og-<condition-slug>.jpg   (1200x630, < 300 KB)
//   src/lib/og-condition-images.json                      (slug → file manifest)
//
// The manifest is read at runtime by src/lib/seo.ts (ogImageForCondition), so a
// condition without a generated card simply keeps the generic og-conditions.jpg.
// Re-run after the sheet gains a condition or a category artwork file is replaced,
// and bump `version` in the manifest when regenerating under the same file names
// (it goes on the URL as ?v= — Facebook never refetches an unchanged URL).
//
// Text is rendered as outlines via opentype.js + the bundled Poppins Bold (the face
// the category artwork uses), not SVG <text>, so output is identical on any machine.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'public', 'assets');
const OUT_DIR = path.join(ASSETS, 'og-conditions');
const MANIFEST = path.join(ROOT, 'src', 'lib', 'og-condition-images.json');
const FONT_FILE = path.join(__dirname, 'fonts', 'Poppins-Bold.ttf');
const OG_IMAGES = require(path.join(ROOT, 'src', 'lib', 'og-images.json'));

// Same project/dataset fallbacks as src/lib/sanity.ts.
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 's7ocz8zp';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
// Same filter as sanityProxy.ts "product.excelJson".
const QUERY = '*[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)] | order(_updatedAt desc)[0]{json_data}';

// ---- Card geometry (matches the designer template; see og-oncology.jpg) -------------
const W = 1200;
const H = 630;
const TEXT_X = 90;            // left edge of the title, flush with the logo above it
const MAX_TEXT_WIDTH = 590;   // keeps the title off the artwork on the right half
const GRADIENT = ['#5BA345', '#1D9FDA']; // green → blue, as in the artwork titles

// Finds the baked-in category title's bounding box. The logo block sits a few pixels
// higher or lower depending on the template, so a fixed box either clips the logo
// tagline or misses the title's top row — instead each template is scanned once for
// rows of "ink" (saturated/dark pixels on the white left half). Tagline rows never
// reach past x≈290; title rows do, which is what tells the two apart.
async function detectTitleBox(file) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const isInk = ([r, g, b]) => {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum < 200 && Math.max(r, g, b) - Math.min(r, g, b) > 30;
  };
  // Candidate rows, then grouped into contiguous runs. The logo text forms its own
  // run on templates where it is large (og-allergy), and the artwork's blue wash can
  // drip single pixels into the scan window, so: a row's right edge only counts dense
  // ink (3 consecutive pixels — glyph strokes, never scattered wash), and the title
  // is the run with the most ink overall, not the one that happens to reach furthest.
  const rows = [];
  for (let y = 255; y <= 440; y++) {
    let count = 0, streak = 0, denseRight = 0;
    for (let x = 80; x <= 672; x++) {
      if (isInk(px(x, y))) {
        count++;
        streak++;
        if (streak >= 3) denseRight = x;
      } else {
        streak = 0;
      }
    }
    if (count > 30 && denseRight > 310) rows.push({ y, count, denseRight });
  }
  if (!rows.length) throw new Error(`No title row found in ${path.basename(file)}`);
  const runs = [];
  rows.forEach((r) => {
    const run = runs[runs.length - 1];
    if (run && r.y - run.bottom <= 4) {
      run.bottom = r.y;
      run.right = Math.max(run.right, r.denseRight);
      run.score += r.count;
    } else {
      runs.push({ top: r.y, bottom: r.y, right: r.denseRight, score: r.count });
    }
  });
  return runs.reduce((a, b) => (b.score > a.score ? b : a));
}

function fetchConditions() {
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/v2023-05-03/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`;
  return fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`Sanity query failed: HTTP ${r.status}`);
      return r.json();
    })
    .then(({ result }) => {
      if (!result || !result.json_data) throw new Error('No product.excelJson document found');
      const data = JSON.parse(result.json_data);
      const firstSheet = Object.keys(data)[0];
      const rows = (data[firstSheet] || []).filter(
        (r) => r && (r.brandName || r.genericName || r.name || r.slug || r['slug.current'])
      );
      // First row wins per slug, like conditionGroups() in src/lib/catalogServer.ts.
      const bySlug = new Map();
      rows.forEach((r) => {
        const slug = String(r.conditionSlug || '').trim();
        const name = String(r.subCategory || '').trim();
        if (!slug || !name || bySlug.has(slug)) return;
        bySlug.set(slug, { slug, name, folder: String(r.categoryFolder || '').trim() });
      });
      return [...bySlug.values()];
    });
}

function baseImageForFolder(folder) {
  for (const cat of Object.values(OG_IMAGES.categories)) {
    if (cat.folders.includes(folder)) return cat.file;
  }
  return null;
}

// Wraps the title into the fewest lines that fit MAX_TEXT_WIDTH, largest size first.
function layoutTitle(font, text, maxWidth) {
  const width = (s, size) => font.getAdvanceWidth(s, size);
  const attempts = [
    { lines: 1, sizes: range(68, 46, -2) },
    { lines: 2, sizes: range(58, 38, -2) },
    { lines: 3, sizes: range(44, 32, -2) },
  ];
  for (const { lines, sizes } of attempts) {
    for (const size of sizes) {
      const split = wrap(text, lines, (s) => width(s, size));
      if (split && split.every((l) => width(l, size) <= maxWidth)) return { lines: split, size };
    }
  }
  // Pathologically long name: smallest 3-line layout regardless of overflow.
  return { lines: wrap(text, 3, (s) => width(s, 32)) || [text], size: 32 };
}

function range(from, to, step) {
  const out = [];
  for (let v = from; step > 0 ? v <= to : v >= to; v += step) out.push(v);
  return out;
}

// Splits on spaces into `count` lines, keeping line widths as even as possible.
// Returns null when the text has fewer words than lines.
function wrap(text, count, measure) {
  const words = text.split(/\s+/).filter(Boolean);
  if (count === 1) return [text];
  if (words.length < count) return null;
  let best = null;
  let bestSpread = Infinity;
  const splits = (start, parts) => {
    if (parts.length === count - 1) {
      const lines = [...parts, words.slice(start).join(' ')];
      const widths = lines.map(measure);
      const spread = Math.max(...widths);
      if (spread < bestSpread) { bestSpread = spread; best = lines; }
      return;
    }
    for (let i = start + 1; i <= words.length - (count - parts.length - 1); i++) {
      splits(i, [...parts, words.slice(start, i).join(' ')]);
    }
  };
  splits(0, []);
  return best;
}

// opentype's toPathData() packs numbers so tightly ("337.5.84") that sharp's SVG
// parser gives up partway through a long title, dropping glyphs. Emitting every
// command with explicit spaces keeps the path unambiguous for any parser.
function pathData(p) {
  const n = (v) => (Math.round(v * 100) / 100).toString();
  return p.commands
    .map((c) => {
      switch (c.type) {
        case 'M': return `M ${n(c.x)} ${n(c.y)}`;
        case 'L': return `L ${n(c.x)} ${n(c.y)}`;
        case 'C': return `C ${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        case 'Q': return `Q ${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'Z': return 'Z';
        default: return '';
      }
    })
    .join(' ');
}

function buildOverlaySvg(font, title, box) {
  const { lines, size } = layoutTitle(font, title, MAX_TEXT_WIDTH);
  const lineHeight = Math.round(size * 1.18);
  // The first line's cap height tops out where the original title's did; extra lines
  // grow downward into the white area below (never up toward the logo tagline).
  const firstBaseline = lines.length === 1 ? box.bottom : box.top + Math.round(size * 0.72);
  const paths = lines
    .map((line, i) => pathData(font.getPath(line, TEXT_X, firstBaseline + i * lineHeight, size)))
    .map((d) => `<path d="${d}"/>`)
    .join('');
  const blockWidth = Math.max(...lines.map((l) => font.getAdvanceWidth(l, size)));
  // Cover for the baked-in title: solid white over its box (the surrounding
  // background there is white on every template), fading out to the right where
  // some artwork carries a faint tint a hard edge would show against.
  const cover = {
    top: box.top - 7,
    bottom: box.bottom + 10,
    solidLeft: 70,
    solidRight: box.right + 10,
    fadeRight: box.right + 65,
  };
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="t" gradientUnits="userSpaceOnUse" x1="${TEXT_X}" y1="0" x2="${TEXT_X + blockWidth}" y2="0">
          <stop offset="0" stop-color="${GRADIENT[0]}"/>
          <stop offset="1" stop-color="${GRADIENT[1]}"/>
        </linearGradient>
        <linearGradient id="f" gradientUnits="userSpaceOnUse" x1="${cover.solidRight}" y1="0" x2="${cover.fadeRight}" y2="0">
          <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect x="${cover.solidLeft}" y="${cover.top}" width="${cover.solidRight - cover.solidLeft}" height="${cover.bottom - cover.top}" fill="#ffffff"/>
      <rect x="${cover.solidRight}" y="${cover.top}" width="${cover.fadeRight - cover.solidRight}" height="${cover.bottom - cover.top}" fill="url(#f)"/>
      <g fill="url(#t)">${paths}</g>
    </svg>`
  );
}

async function main() {
  const fontBuf = fs.readFileSync(FONT_FILE);
  const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength));
  const conditions = await fetchConditions();
  if (!conditions.length) throw new Error('Sheet returned no conditions');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const bySlug = {};
  const skipped = [];
  const boxCache = new Map();
  for (const c of conditions) {
    const baseFile = baseImageForFolder(c.folder);
    if (!baseFile) { skipped.push(`${c.slug} (folder "${c.folder}" has no category artwork)`); continue; }
    if (!boxCache.has(baseFile)) boxCache.set(baseFile, await detectTitleBox(path.join(ASSETS, baseFile)));
    const overlay = buildOverlaySvg(font, c.name.toUpperCase(), boxCache.get(baseFile));
    const outFile = `og-${c.slug}.jpg`;
    await sharp(path.join(ASSETS, baseFile))
      .composite([{ input: overlay }])
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(path.join(OUT_DIR, outFile));
    bySlug[c.slug] = outFile;
    console.log(`  ${outFile}  ← ${baseFile}  "${c.name}"`);
  }

  // version: bump when regenerating under the same names (becomes the ?v= cache-buster).
  const prev = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : null;
  const manifest = {
    _comment: 'Generated by scripts/generate-condition-og-images.cjs — do not edit by hand. Read by src/lib/seo.ts (ogImageForCondition). Files live in public/assets/og-conditions/.',
    version: prev ? prev.version : 1,
    bySlug,
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n${Object.keys(bySlug).length} cards written, manifest → src/lib/og-condition-images.json`);
  if (skipped.length) console.log(`Skipped (keep the generic conditions card):\n  ${skipped.join('\n  ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
