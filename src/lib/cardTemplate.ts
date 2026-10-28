/**
 * cardTemplate.ts
 * ─────────────────────────────────────────────
 * Turns the Card Design (one blank front + text boxes) and one employee's
 * details into the things to draw on their card. No uploaded artwork per
 * person: every card is this layout over the same blank front.
 *
 * ── Two copies, kept identical ──
 * This file is also getmeds_database/studio/lib/cardTemplate.ts. The Studio
 * draws cards to a canvas (previews, print PNGs); the card page draws them as
 * SVG. Both go through layoutCard() below, so a card looks the same in the
 * Studio, on getmeds.ph/card/… and on paper. Change one, copy it to the other.
 *
 * ── Units ──
 * Box positions and sizes are stored as % of the card (x, width, font size
 * and padding: % of its width; y and the bar's top/bottom: % of its height),
 * so a box lands in the same place whatever resolution the blank front is.
 */

// ── What Card Design stores ──────────────────────────────────────────────────

export type CardField = 'fullName' | 'jobTitle' | 'company' | 'mobile' | 'officePhone' | 'email'

export interface CardBar {
  enabled?: boolean
  /** % of card height. */
  top: number
  bottom: number
  /** Gradient, left to right, and the slash after the bar. */
  from: string
  to: string
  slash: string
  /** Space each side of the text, % of card width. */
  padding: number
  /** The bar is never shorter than this, % of card width. */
  minWidth: number
}

export interface CardTextBox {
  _key: string
  label?: string
  field: CardField
  font: string
  weight: number
  /** Font size, % of card width. */
  size: number
  color: string
  /** Left edge (or centre / right edge, by align), % of card width. */
  x: number
  /** Text baseline, % of card height. */
  y: number
  /** Widest the text (or the bar) may get, % of card width. Longer text shrinks to fit. */
  maxWidth: number
  align: 'left' | 'center' | 'right'
  /** A background bar that grows with the text, like the job-title bar. */
  bar?: CardBar
}

export interface CardPerson {
  fullName?: string
  jobTitle?: string
  company?: string
  mobile?: string
  officePhone?: string
  email?: string
}

export const CARD_FIELDS: Array<{ title: string; value: CardField }> = [
  { title: 'Full name', value: 'fullName' },
  { title: 'Job title', value: 'jobTitle' },
  { title: 'Company', value: 'company' },
  { title: 'Mobile number', value: 'mobile' },
  { title: 'Office landline', value: 'officePhone' },
  { title: 'Email', value: 'email' },
]

/** Fonts the card can use. Each must also be in GOOGLE_FONTS_URL. */
export const CARD_FONTS = ['Montserrat', 'Poppins']

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap'

/**
 * The boxes for "Digital Business ID Card Front Black.png" (2500 × 1472),
 * measured against "Front with Sample Data.png" to within ~3 px. Used to start
 * a new Card Design and by "Reset boxes".
 */
export const DEFAULT_BOXES: CardTextBox[] = [
  {
    _key: 'name', label: 'Name', field: 'fullName', font: 'Montserrat', weight: 700,
    size: 4.04, color: '#0031A0', x: 7.68, y: 43.48, maxWidth: 60, align: 'left',
  },
  {
    _key: 'position', label: 'Position', field: 'jobTitle', font: 'Montserrat', weight: 600,
    size: 3.08, color: '#FFFFFF', x: 8.28, y: 51.02, maxWidth: 56, align: 'center',
    bar: {
      enabled: true, top: 46.2, bottom: 52.1, from: '#62A644', to: '#1D9FDA', slash: '#61A644',
      padding: 4.8, minWidth: 22.4,
    },
  },
  {
    _key: 'mobile', label: 'Mobile', field: 'mobile', font: 'Montserrat', weight: 400,
    size: 2.08, color: '#000B5D', x: 10.92, y: 58.7, maxWidth: 60, align: 'left',
  },
  {
    _key: 'email', label: 'Email', field: 'email', font: 'Montserrat', weight: 400,
    size: 2.08, color: '#000B5D', x: 10.92, y: 64.81, maxWidth: 60, align: 'left',
  },
]

// ── What a field shows ───────────────────────────────────────────────────────

/**
 * Same Philippine-first rules as toE164() in getmeds-frontend-v2/src/lib/businessCard.ts,
 * then "+63 9171234567": the country code set apart, as on the printed sample.
 */
export function cardPhone(raw?: string | null): string {
  if (!raw) return ''
  const trimmed = String(raw).trim()
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return ''
  let e164: string
  if (trimmed.startsWith('+')) e164 = `+${digits}`
  else if (digits.startsWith('00')) e164 = `+${digits.slice(2)}`
  else if (digits.startsWith('63') && digits.length === 12) e164 = `+${digits}`
  else if (digits.startsWith('0')) e164 = `+63${digits.slice(1)}`
  else if (digits.startsWith('9') && digits.length === 10) e164 = `+63${digits}`
  else if (digits.length >= 7 && digits.length <= 9) e164 = `+63${digits}`
  else e164 = `+${digits}`
  return e164.startsWith('+63') ? `+63 ${e164.slice(3)}` : e164
}

export function fieldText(person: CardPerson, field: CardField): string {
  const raw = person[field]
  if (field === 'mobile' || field === 'officePhone') return cardPhone(raw)
  return (raw || '').trim()
}

// ── Layout ───────────────────────────────────────────────────────────────────

export type CardItem =
  | {
      kind: 'text'
      text: string
      x: number
      y: number
      size: number
      weight: number
      font: string
      color: string
      anchor: 'start' | 'middle' | 'end'
    }
  | { kind: 'bar'; d: string; from: string; to: string; x1: number; x2: number }
  | { kind: 'shape'; d: string; color: string }

/** Width of text in px at the given font; from a canvas, so it matches the real font. */
export type MeasureText = (text: string, font: string, weight: number, sizePx: number) => number

/*
 * The bar's shape, measured off the original artwork and kept as ratios of its
 * height so it scales: rounded left end, right end slanted (it shifts 0.576 px
 * left per px down) with a rounded bottom corner, then a slash in the same
 * slant a little after it.
 */
const SLOPE = 0.576
const R_LEFT = 0.414
const R_CORNER = 0.345
const SLASH_W = 0.276
const SLASH_GAP = 0.276
const SLASH_OVER_TOP = 0.035
const SLASH_OVER_BOTTOM = 0.046

const n = (v: number) => Math.round(v * 100) / 100

function barPath(left: number, top: number, bottom: number, rightTop: number): string {
  const h = bottom - top
  const r = R_LEFT * h
  const rc = R_CORNER * h
  const xb = rightTop - SLOPE * h // where the slant meets the bottom
  // The bottom-right corner is rounded: leave the slant rc before the corner,
  // curve round it, carry on along the bottom.
  const len = Math.hypot(SLOPE * h, h)
  const bx = xb + (rc * SLOPE * h) / len
  const by = bottom - (rc * h) / len
  return [
    `M${n(left + r)},${n(top)}`,
    `L${n(rightTop)},${n(top)}`,
    `L${n(bx)},${n(by)}`,
    `Q${n(xb)},${n(bottom)} ${n(xb - rc)},${n(bottom)}`,
    `L${n(left + r)},${n(bottom)}`,
    `A${n(r)},${n(r)} 0 0 1 ${n(left)},${n(bottom - r)}`,
    `L${n(left)},${n(top + r)}`,
    `A${n(r)},${n(r)} 0 0 1 ${n(left + r)},${n(top)}`,
    'Z',
  ].join(' ')
}

function slashPath(rightTop: number, top: number, bottom: number): string {
  const h = bottom - top
  const t = top - SLASH_OVER_TOP * h
  const b = bottom + SLASH_OVER_BOTTOM * h
  const s0 = rightTop + SLASH_GAP * h + SLOPE * (top - t)
  const w = SLASH_W * h
  const drop = SLOPE * (b - t)
  return `M${n(s0)},${n(t)} L${n(s0 + w)},${n(t)} L${n(s0 + w - drop)},${n(b)} L${n(s0 - drop)},${n(b)} Z`
}

/**
 * Everything to draw on one card front, in card pixels (width × height of
 * the blank front). Text wider than its box shrinks to fit; a box with a bar
 * gets a bar sized to its text.
 */
export function layoutCard(
  boxes: CardTextBox[],
  person: CardPerson,
  width: number,
  height: number,
  measure: MeasureText
): CardItem[] {
  const items: CardItem[] = []
  for (const box of boxes || []) {
    const text = fieldText(person, box.field)
    if (!text) continue
    const font = box.font || 'Montserrat'
    const weight = box.weight || 400
    let size = (box.size / 100) * width
    const x = (box.x / 100) * width
    const y = (box.y / 100) * height
    const maxW = (box.maxWidth / 100) * width
    let w = measure(text, font, weight, size)

    if (box.bar?.enabled) {
      const bar = box.bar
      const pad = (bar.padding / 100) * width
      const room = Math.max(1, maxW - 2 * pad)
      if (w > room) {
        size *= room / w
        w = room
      }
      const top = (bar.top / 100) * height
      const bottom = (bar.bottom / 100) * height
      const barW = Math.max((bar.minWidth / 100) * width, w + 2 * pad)
      // barW is measured across the middle of the slanted end.
      const rightTop = x + barW + SLOPE * ((bottom - top) / 2)
      const h = bottom - top
      items.push({ kind: 'bar', d: barPath(x, top, bottom, rightTop), from: bar.from, to: bar.to, x1: x + 0.46 * h, x2: rightTop - 0.46 * h })
      items.push({ kind: 'shape', d: slashPath(rightTop, top, bottom), color: bar.slash })
      items.push({ kind: 'text', text, x: x + barW / 2, y, size, weight, font, color: box.color, anchor: 'middle' })
      continue
    }

    if (w > maxW) size *= maxW / w
    const anchor = box.align === 'center' ? 'middle' : box.align === 'right' ? 'end' : 'start'
    items.push({ kind: 'text', text, x, y, size, weight, font, color: box.color, anchor })
  }
  return items
}

// ── Drawing (browser only) ───────────────────────────────────────────────────

let fontsLink: Promise<void> | null = null

/** Longest a card waits for its fonts before drawing with a fallback. */
export const FONT_WAIT_MS = 3000

/** Loads the card fonts once, so text is measured and drawn in the real font. */
export function loadCardFonts(boxes: CardTextBox[] = DEFAULT_BOXES): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  if (!fontsLink) {
    fontsLink = new Promise((resolve) => {
      if (document.querySelector(`link[href="${GOOGLE_FONTS_URL}"]`)) return resolve()
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = GOOGLE_FONTS_URL
      link.onload = () => resolve()
      link.onerror = () => resolve()
      document.head.appendChild(link)
    })
  }
  const loaded = fontsLink.then(() =>
    Promise.all(
      (boxes || []).map((b) => document.fonts.load(`${b.weight || 400} 40px "${b.font || 'Montserrat'}"`).catch(() => []))
    ).then(() => undefined)
  )
  // Never wait forever: on a slow or blocked connection the card is drawn in a
  // fallback font after FONT_WAIT_MS rather than left without its text.
  return Promise.race([loaded, new Promise<void>((resolve) => setTimeout(resolve, FONT_WAIT_MS))])
}

let measureCtx: CanvasRenderingContext2D | null = null

export const measureWithCanvas: MeasureText = (text, font, weight, sizePx) => {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')
  if (!measureCtx) return text.length * sizePx * 0.55
  measureCtx.font = `${weight} ${sizePx}px "${font}"`
  return measureCtx.measureText(text).width
}

/** Draws a card onto a canvas: the blank front, then every item. */
export function drawCardToCanvas(
  canvas: HTMLCanvasElement,
  front: HTMLImageElement,
  boxes: CardTextBox[],
  person: CardPerson,
  scale = 1
): void {
  const width = front.naturalWidth
  const height = front.naturalHeight
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const c = canvas.getContext('2d')
  if (!c) return
  c.setTransform(scale, 0, 0, scale, 0, 0)
  c.drawImage(front, 0, 0, width, height)
  for (const item of layoutCard(boxes, person, width, height, measureWithCanvas)) {
    if (item.kind === 'bar') {
      const g = c.createLinearGradient(item.x1, 0, item.x2, 0)
      g.addColorStop(0, item.from)
      g.addColorStop(1, item.to)
      c.fillStyle = g
      c.fill(new Path2D(item.d))
    } else if (item.kind === 'shape') {
      c.fillStyle = item.color
      c.fill(new Path2D(item.d))
    } else {
      c.font = `${item.weight} ${item.size}px "${item.font}"`
      c.fillStyle = item.color
      c.textAlign = item.anchor === 'middle' ? 'center' : item.anchor === 'end' ? 'right' : 'left'
      c.textBaseline = 'alphabetic'
      c.fillText(item.text, item.x, item.y)
    }
  }
}
