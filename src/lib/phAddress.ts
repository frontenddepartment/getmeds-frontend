/*
 * Philippine address suggestions for patient forms (/qr3), from the PSA's PSGC codes.
 * The data is built by scripts/build-ph-address.mjs into public/data/ph-address/ and loaded
 * on demand: the city list when the city field is first focused, then one small barangay file
 * for the chosen city.
 */

export interface Place {
  code: string;
  name: string;
  province: string;
}

const BASE = '/data/ph-address';

let placesPromise: Promise<Place[]> | null = null;
const barangayGroups = new Map<string, Promise<Record<string, string[]>>>();

export function loadPlaces(): Promise<Place[]> {
  placesPromise ??= fetch(`${BASE}/places.json`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((rows: [string, string, string][]) => rows.map(([code, name, province]) => ({ code, name, province })))
    .catch((err) => {
      placesPromise = null; // let the next focus try again
      throw err;
    });
  return placesPromise;
}

export async function loadBarangays(cityCode: string): Promise<string[]> {
  const group = cityCode.slice(0, 5);
  let pending = barangayGroups.get(group);
  if (!pending) {
    pending = fetch(`${BASE}/brgy/${group}.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))));
    barangayGroups.set(group, pending);
    pending.catch(() => barangayGroups.delete(group));
  }
  return (await pending)[cityCode] || [];
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ñ/g, 'n');

const words = (s: string) => fold(s).split(/[^a-z0-9]+/).filter(Boolean);

/** What people type that the official names don't contain. */
const ALIASES: Record<string, string> = {
  qc: 'quezon city',
  mla: 'manila',
  ncr: 'metro manila',
  mm: 'metro manila',
  sta: 'santa',
  sto: 'santo',
  gen: 'general',
};

function queryWords(query: string): string[] {
  return words(query).flatMap((w) => (ALIASES[w] ? words(ALIASES[w]) : [w]));
}

/** "City of Makati, Metro Manila" for display and for the sheet. */
export function placeLabel(p: Place): string {
  return p.province ? `${p.name}, ${p.province}` : p.name;
}

/**
 * Cities and municipalities whose name and province contain every typed word as a word start:
 * "makati", "quezon city", "qc", "san jose bat" (San Jose, Batangas). Name matches rank first.
 */
export function searchPlaces(query: string, places: Place[], limit = 30): Place[] {
  const q = queryWords(query);
  if (!q.length) return [];
  const scored: { p: Place; s: number }[] = [];
  for (const p of places) {
    // "City of Makati" is searched as "makati city", like people say it; "Quezon City" stays as is.
    // Only real cities carry the word "city", so "quezon c" finds Quezon City, not the towns named Quezon.
    const w = words(p.name);
    const nameWords = w[0] === 'city' && w[1] === 'of' ? [...w.slice(2), 'city'] : w;
    const all = [...nameWords, ...words(p.province)];
    if (!q.every((t) => all.some((x) => x.startsWith(t)))) continue;
    let s = 0;
    if (nameWords.join(' ').startsWith(q.join(' '))) s += 3;
    if (nameWords[0]?.startsWith(q[0])) s += 2;
    if (q.every((t) => nameWords.some((x) => x.startsWith(t)))) s += 1;
    scored.push({ p, s });
  }
  return scored
    .sort((a, b) => b.s - a.s || a.p.name.length - b.p.name.length || a.p.name.localeCompare(b.p.name))
    .slice(0, limit)
    .map((x) => x.p);
}

/** Barangays containing every typed word ("san isidro", "brgy 12", "poblacion"). Empty query: all of them. */
export function filterBarangays(query: string, list: string[], limit = 60): string[] {
  const q = words(query).filter((w) => w !== 'brgy' && w !== 'barangay' && w !== 'bgy');
  if (!q.length) return list.slice(0, limit);
  return list
    .map((b) => {
      const bw = words(b);
      if (!q.every((t) => bw.some((w) => (/^\d/.test(t) ? w === t : w.startsWith(t))))) return null;
      return { b, s: words(b).filter((w) => w !== 'barangay').join(' ').startsWith(q.join(' ')) ? 1 : 0 };
    })
    .filter((x): x is { b: string; s: number } => x !== null)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.b);
}

/** "12 Rizal St., Brgy. San Isidro, Quezon City, Metro Manila" */
export function composeAddress(parts: { street: string; barangay: string; city: string }): string {
  const t = (s: string) => s.trim().replace(/\s+/g, ' ');
  const barangay = t(parts.barangay);
  const brgy = barangay && !/^(brgy|barangay|bgy)\b/i.test(barangay) ? `Brgy. ${barangay}` : barangay;
  return [t(parts.street), brgy, t(parts.city)].filter(Boolean).join(', ');
}
