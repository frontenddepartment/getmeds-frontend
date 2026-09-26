// Generates the sixteen share-card images (og-*.jpg) into public/assets/ from the table in
// src/lib/og-images.json. Run by hand after changing a label — `node scripts/generate-og-images.cjs`
// — and commit the output; it is not part of the build, so a build machine without the fonts
// can never produce a different picture from the one that was reviewed.
//
// The spec every image follows (Getmeds share images action sheet):
//   - 1200x630 exactly, JPG, under 300 KB.
//   - Brand palette, one layout for all sixteen so they read as a set.
//   - The label is the only text, one line, kept inside the middle 80% so no platform crop
//     cuts it, and large enough to read with the card shown ~500px wide on a phone.
//   - The logo is small, in one corner — it is not the subject.
//   - Abstract artwork only. No pills, vials, syringes or IV bags (Meta flags medicine
//     photography beside promotional copy) and no product names (RA 9711) — the labels in the
//     JSON are category names, and nothing else is printed.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../src/lib/og-images.json');

const W = 1200;
const H = 630;
const MAX_BYTES = 300 * 1024;
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets');
const LOGO = path.join(OUT_DIR, 'getmeds-logo-sm.png');

const NAVY = '#0A2A43';
const DEEP = '#0E4A6E';
const BLUE = '#1D9FDA';
const GREEN = '#61A644';

const escapeXml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The logo's cross, echoed as a faint pattern so the set carries the brand without the logo
// having to be large.
function cross(cx, cy, size, fill, opacity) {
  const t = size / 3;
  return `<path d="M${cx - t / 2} ${cy - size / 2}h${t}v${t}h${t}v${t}h-${t}v${t}h-${t}v-${t}h-${t}v-${t}h${t}z" fill="${fill}" opacity="${opacity}"/>`;
}

function svgFor(label) {
  // Bold sans averages ~0.6em per character; the width budget is the middle 80% less a margin.
  const fontSize = Math.min(112, Math.floor(900 / (label.length * 0.6)));
  const textY = H / 2 + fontSize * 0.35;
  const barY = textY + 44;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${DEEP}"/>
    </linearGradient>
    <radialGradient id="glowBlue" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${BLUE}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${BLUE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowGreen" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${GREEN}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${GREEN}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${GREEN}"/>
      <stop offset="1" stop-color="${BLUE}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1040" cy="90" r="360" fill="url(#glowBlue)"/>
  <circle cx="140" cy="600" r="320" fill="url(#glowGreen)"/>
  <circle cx="1060" cy="560" r="170" fill="none" stroke="${GREEN}" stroke-opacity="0.35" stroke-width="3"/>
  <circle cx="1060" cy="560" r="120" fill="none" stroke="${BLUE}" stroke-opacity="0.3" stroke-width="2"/>
  <circle cx="110" cy="120" r="70" fill="none" stroke="${BLUE}" stroke-opacity="0.3" stroke-width="2"/>
  ${cross(980, 200, 60, '#FFFFFF', 0.08)}
  ${cross(230, 470, 44, '#FFFFFF', 0.07)}
  ${cross(860, 470, 28, GREEN, 0.35)}
  ${cross(330, 150, 24, BLUE, 0.4)}
  <text x="${W / 2}" y="${textY}" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif"
        font-weight="700" font-size="${fontSize}" fill="#FFFFFF">${escapeXml(label)}</text>
  <rect x="${W / 2 - 90}" y="${barY}" width="180" height="8" rx="4" fill="url(#bar)"/>
</svg>`;
}

async function logoChip() {
  // A white chip behind the logo so its blue and green read on the dark background.
  const logoW = 150;
  const logo = await sharp(LOGO).resize({ width: logoW }).png().toBuffer();
  const { height: logoH } = await sharp(logo).metadata();
  const pad = 12;
  const chipW = logoW + pad * 2;
  const chipH = logoH + pad * 2;
  const chip = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${chipW}" height="${chipH}"><rect width="${chipW}" height="${chipH}" rx="12" fill="#FFFFFF"/></svg>`
  );
  return sharp(chip).composite([{ input: logo, left: pad, top: pad }]).png().toBuffer();
}

async function render(file, label, chip) {
  let quality = 86;
  let buf;
  do {
    buf = await sharp(Buffer.from(svgFor(label)))
      .composite([{ input: chip, left: 40, top: 36 }])
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    quality -= 6;
  } while (buf.length > MAX_BYTES && quality > 40);

  const meta = await sharp(buf).metadata();
  if (meta.width !== W || meta.height !== H) throw new Error(`${file} rendered at ${meta.width}x${meta.height}`);
  if (buf.length > MAX_BYTES) throw new Error(`${file} is ${Math.round(buf.length / 1024)} KB, over the 300 KB limit`);
  fs.writeFileSync(path.join(OUT_DIR, file), buf);
  console.log(`  ${file.padEnd(26)} ${String(Math.round(buf.length / 1024)).padStart(3)} KB  "${label}"`);
}

async function main() {
  const entries = [config.default, config.order, ...Object.values(config.categories), config.conditions];
  const chip = await logoChip();
  console.log(`[OG Images] Writing ${entries.length} image(s) to public/assets/:`);
  for (const { file, label } of entries) await render(file, label, chip);
}

main().catch((err) => {
  console.error('[OG Images] Failed:', err.message);
  process.exitCode = 1;
});
