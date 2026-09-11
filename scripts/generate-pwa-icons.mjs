/**
 * generate-pwa-icons.mjs
 * ─────────────────────────────────────────────
 * Builds the PWA / favicon set from the brand logo. Re-runnable: rerun it if
 * the logo changes, then commit the output.
 *
 *   node scripts/generate-pwa-icons.mjs
 *
 * The source is a wide 16:9 lockup — mark, wordmark and the "Your Compassionate
 * Health Ally" tagline — so nothing here is a plain resize. Two crops are used:
 *
 *   MARK  — just the blue/green cross device on the left. Used for the home
 *           screen and maskable icons, because the tagline turns to mush below
 *           ~180px and the wide lockup letterboxes into a thin strip.
 *   FULL  — the whole lockup. Used at 512 (Android splash screen) and, by
 *           request, for the browser-tab favicons so the tab matches the navbar.
 *
 * Maskable icons get extra padding: Android crops them to a circle of 80%
 * diameter, and for this portrait mark the largest box fitting that circle is
 * about 66% of the icon height. Anything larger loses its edges on some launchers.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'public/assets/getmedslogo.png'
const OUT = 'public/icons'
const BG = { r: 255, g: 255, b: 255, alpha: 1 } // matches the site's white chrome

// Measured from the 7122x4000 source by scanning for non-white pixels:
//   blue bar   x 160..1030,  y 1150..3380
//   green bar  x 1100..2400, y  190..2430
//   "GetMEDS"  y 2480..3380,  tagline y 3510..3920
// The two bars interlock into an L-shaped device, so its bounding box also
// contains the top-left of the "G". Cropping alone cannot separate them —
// hence the white patch below, which erases the wordmark from the corner the
// mark does not occupy. Without it the "G" shows up in every small icon.
const MARK = { left: 160, top: 190, width: 2240, height: 3190 }
const MARK_PATCH = { left: 940, top: 2245, width: 1300, height: 945 }

/** The cross device on its own, with the intruding wordmark painted out. */
async function markBuffer() {
  const patch = await sharp({
    create: { ...MARK_PATCH, channels: 4, background: BG, width: MARK_PATCH.width, height: MARK_PATCH.height },
  }).png().toBuffer()

  return sharp(SRC)
    .extract(MARK)
    .composite([{ input: patch, left: MARK_PATCH.left, top: MARK_PATCH.top }])
    .png()
    .toBuffer()
}

async function icon(size, ratio, file, { crop, source } = {}) {
  const box = Math.round(size * ratio)
  const logo = await sharp(source ?? SRC)
    .resize({ width: box, height: box, fit: 'inside' })
    .toBuffer()
  const { width, height } = await sharp(logo).metadata()

  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{
      input: logo,
      top: Math.round((size - height) / 2),
      left: Math.round((size - width) / 2),
    }])
    .png()
    .toFile(path.join(OUT, file))

  return { file, size, ratio, crop: crop ? 'mark' : 'full' }
}

const TARGETS = [
  // [size, ratio, filename, useMark]
  [512, 0.86, 'icon-512.png', false],
  [192, 0.80, 'icon-192.png', true],
  [512, 0.62, 'icon-maskable-512.png', true],
  [192, 0.62, 'icon-maskable-192.png', true],
  [180, 0.80, 'apple-touch-icon.png', true],
  // Browser-tab favicons use the full navbar lockup (by request), edge to edge.
  [32, 1.00, 'favicon-32.png', false],
  [16, 1.00, 'favicon-16.png', false],
]

await mkdir(OUT, { recursive: true })
const meta = await sharp(SRC).metadata()
console.log(`Source: ${SRC} (${meta.width}x${meta.height})\n`)

const mark = await markBuffer()

for (const [size, ratio, file, useMark] of TARGETS) {
  await icon(size, ratio, file, { crop: useMark, source: useMark ? mark : undefined })
  console.log(`  ${file.padEnd(26)} ${String(size).padStart(3)}px  ${(useMark ? 'mark' : 'full').padEnd(4)}  at ${Math.round(ratio * 100)}%`)
}
console.log(`\n${TARGETS.length} icons written to ${OUT}/`)
