import { sanityQuery } from './sanityProxy'
import type { SanityImage } from '../types/sanity'

/**
 * businessCard.ts
 * ─────────────────────────────────────────────
 * Everything behind a scanned Getmeds business card: fetching the record, and
 * turning the numbers on it into the three things someone actually wants to do
 * with a card they have just been handed — save it, message it on WhatsApp,
 * message it on Viber.
 *
 * Kept apart from queries.ts on purpose. That module is the catalogue's data
 * layer and is bundled into nearly every page; this is one screen's worth of
 * phone-number handling that no other page needs.
 *
 * "Scanned" here means scanned by the phone's own camera app, not by us. The
 * app carried its own QR reader for a while and it has been removed: every
 * phone has read QR codes from the native camera for years, and almost nobody
 * handed a business card has this app installed, so the in-app reader was a
 * second way to do a thing the person's phone already does better — at the
 * cost of a camera permission prompt and a decoder library. The printed QR is
 * an ordinary https:// address, so it needs no special reader to work.
 */

export interface BusinessCard {
  _id: string
  fullName: string
  slug: string
  jobTitle?: string
  company?: string
  cardImage?: SanityImage
  cardImageBack?: SanityImage
  mobile?: string
  whatsapp?: string
  viber?: string
  officePhone?: string
  email?: string
  active?: boolean
}

/** The path a printed QR code encodes. One place, because three files read it. */
export const CARD_PATH_PREFIX = '/card/'

export async function getBusinessCardBySlug(slug: string) {
  // { fresh: true } — a card is looked up seconds after someone was handed it,
  // often right after the details were corrected in Studio. Sanity's CDN is
  // eventually consistent, and a stale phone number here is the one failure
  // this feature cannot afford: the whole reason the card carries a link
  // instead of a printed number is so the number can be fixed.
  return sanityQuery<BusinessCard | null>('businessCard.bySlug', { slug }, { fresh: true })
}

// ── Phone numbers ────────────────────────────────────────────────────────────

/**
 * Normalises whatever was typed into Studio to E.164 (+639171234567).
 *
 * Every downstream link needs this and none of them can do it themselves:
 * wa.me rejects spaces and plus signs, viber:// wants the plus, tel: tolerates
 * almost anything but dials the wrong number if a leading 0 survives, and a
 * vCard saved with "0917 123 4567" cannot be called from abroad.
 *
 * Philippine-first, since that is where the cards are handed out: a bare
 * 09xxxxxxxxx or 9xxxxxxxxx is assumed to be +63. Anything already carrying a
 * "+" is left with its own country code, so an international card still works.
 *
 * Returns '' when there is nothing usable, which is the signal every caller
 * below uses to hide its button rather than render one that dials nowhere.
 */
export function toE164(raw?: string | null): string {
  if (!raw) return ''
  const trimmed = String(raw).trim()
  const hadPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return ''

  // Already international, and said so.
  if (hadPlus) return `+${digits}`

  // 00 is the other way of writing "+" in most of the world.
  if (digits.startsWith('00')) return `+${digits.slice(2)}`

  // 639171234567 — country code present but the plus was left off.
  if (digits.startsWith('63') && digits.length === 12) return `+${digits}`

  // 09171234567 — the way a PH mobile is almost always written locally.
  if (digits.startsWith('0') && digits.length === 11) return `+63${digits.slice(1)}`

  // 9171234567 — the same number with the trunk zero dropped.
  if (digits.startsWith('9') && digits.length === 10) return `+63${digits}`

  // 0281234567 / 88881234 — a Manila landline, with or without the trunk zero.
  if (digits.startsWith('0')) return `+63${digits.slice(1)}`
  if (digits.length >= 7 && digits.length <= 9) return `+63${digits}`

  // Long enough to be a full international number someone forgot the plus on.
  if (digits.length >= 10) return `+${digits}`

  return ''
}

/** Human-readable grouping for display only — never fed to a link. */
export function formatPhone(raw?: string | null): string {
  const e164 = toE164(raw)
  if (!e164) return ''
  // +639171234567 → +63 917 123 4567
  const ph = e164.match(/^\+63(9\d{2})(\d{3})(\d{4})$/)
  if (ph) return `+63 ${ph[1]} ${ph[2]} ${ph[3]}`
  return e164
}

/** WhatsApp falls back to the main mobile — see the note in the Sanity schema. */
export function whatsappNumber(card: BusinessCard): string {
  return toE164(card.whatsapp) || toE164(card.mobile)
}

export function viberNumber(card: BusinessCard): string {
  return toE164(card.viber) || toE164(card.mobile)
}

// ── Deep links ───────────────────────────────────────────────────────────────

/** wa.me wants bare digits: no plus, no spaces, no dashes. */
export function whatsappLink(card: BusinessCard): string {
  const n = whatsappNumber(card)
  if (!n) return ''
  return `https://wa.me/${n.replace(/\D/g, '')}`
}

/**
 * Viber wants the opposite of WhatsApp — the plus, percent-encoded. Without it
 * Viber reads the rest as a local number and looks it up in the wrong country.
 */
export function viberLink(card: BusinessCard): string {
  const n = viberNumber(card)
  if (!n) return ''
  return `viber://chat?number=${encodeURIComponent(n)}`
}

export function telLink(raw?: string | null): string {
  const n = toE164(raw)
  return n ? `tel:${n}` : ''
}

// ── vCard ────────────────────────────────────────────────────────────────────

/** Escapes the four characters that are structural in a vCard property value. */
function esc(value: string): string {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

/**
 * vCard lines are limited to 75 octets, continued by starting the next line
 * with a single space. Most contact apps forgive a long line, but some Android
 * importers truncate it silently — and a silently truncated phone number is
 * the worst possible outcome here, since it looks like it worked.
 */
function fold(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = [line.slice(0, 75)]
  let rest = line.slice(75)
  while (rest.length > 74) {
    parts.push(' ' + rest.slice(0, 74))
    rest = rest.slice(74)
  }
  if (rest) parts.push(' ' + rest)
  return parts.join('\r\n')
}

/**
 * Splits "Juan Dela Cruz" into the N property's family/given parts.
 * Crude by necessity — no rule gets every name right — but N is what decides
 * how the contact files alphabetically, and getting the common case right beats
 * dumping the whole name into the given-name slot for everyone.
 */
function nameParts(fullName: string): { family: string; given: string; middle: string } {
  const bits = fullName.trim().split(/\s+/)
  if (bits.length === 1) return { family: '', given: bits[0], middle: '' }
  if (bits.length === 2) return { family: bits[1], given: bits[0], middle: '' }
  return { family: bits.slice(-1)[0], given: bits[0], middle: bits.slice(1, -1).join(' ') }
}

/**
 * Builds a vCard 3.0 record.
 *
 * 3.0 rather than the newer 4.0 because this has to land in whatever contacts
 * app the person happens to have: iOS reads 3.0 natively, and a good many
 * Android builds still parse 4.0 partially or not at all. Nothing on a business
 * card needs anything 4.0 added.
 *
 * CRLF line endings are not a stylistic choice — RFC 6350 requires them, and
 * several importers reject a file that uses bare newlines.
 */
export function buildVCard(card: BusinessCard, cardUrl?: string): string {
  const { family, given, middle } = nameParts(card.fullName || '')
  const mobile = toE164(card.mobile)
  const office = toE164(card.officePhone)
  const wa = whatsappNumber(card)
  const viber = viberNumber(card)

  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  lines.push(`N:${esc(family)};${esc(given)};${esc(middle)};;`)
  lines.push(`FN:${esc(card.fullName || '')}`)
  if (card.company) lines.push(`ORG:${esc(card.company)}`)
  if (card.jobTitle) lines.push(`TITLE:${esc(card.jobTitle)}`)

  if (mobile) lines.push(`TEL;TYPE=CELL,VOICE:${mobile}`)
  if (office) lines.push(`TEL;TYPE=WORK,VOICE:${office}`)

  // Only worth a line of its own when it is genuinely a different number —
  // otherwise the contact shows the same digits three times over.
  if (wa && wa !== mobile) lines.push(`TEL;TYPE=CELL,VOICE:${wa}`)
  if (viber && viber !== mobile && viber !== wa) lines.push(`TEL;TYPE=CELL,VOICE:${viber}`)

  if (card.email) lines.push(`EMAIL;TYPE=WORK,INTERNET:${esc(card.email)}`)

  // The card's own address, so the saved contact stays a way back to the live
  // record — the number can be re-checked later without the physical card.
  if (cardUrl) lines.push(`URL:${esc(cardUrl)}`)

  lines.push(`NOTE:${esc('Saved from a Getmeds business card.')}`)
  lines.push(`REV:${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}`)
  lines.push('END:VCARD')

  return lines.map(fold).join('\r\n') + '\r\n'
}

/**
 * Hands the vCard to the OS.
 *
 * A Blob plus a download attribute is the one route that behaves on all three
 * targets: Android Chrome saves it and offers Contacts, desktop downloads it,
 * and iOS Safari (13+) puts it in Files, from where tapping it opens the Add
 * Contact sheet. A `data:` URI is tempting because it is one line, but iOS
 * refuses to download one and Chrome blocks top-level data: navigations.
 */
export function downloadVCard(card: BusinessCard, cardUrl?: string): void {
  const vcf = buildVCard(card, cardUrl)
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = `${(card.slug || card.fullName || 'contact').replace(/[^\w-]+/g, '-')}.vcf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Not revoked immediately: Safari reads the blob after the click returns, and
  // revoking synchronously leaves it with a dead URL and a silently empty file.
  setTimeout(() => URL.revokeObjectURL(href), 30_000)
}
