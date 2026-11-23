/*
 * Medicine search for patient forms (the /qr3 PAP QR form).
 *
 * Patients type whatever is on the prescription or the box: a brand ("Lapanib"), a molecule
 * ("lapatinib"), a misspelling ("lapatinb", "paklitaksel"), half a word ("pacli"), a strength
 * ("250") or a condition ("breast cancer"). Every query token must match some field of a
 * product; tokens are compared exactly, by prefix, by substring and, from four letters up,
 * by spelling distance on a rough phonetic form (c/k, x/ks, ph/f, z/s, doubled letters), so
 * Filipino phonetic spellings still land on the right molecule.
 */
import { damerauLevenshtein } from './fuzzySearch';

export interface MedicineOption {
  id: string;
  brand: string;
  /** Molecule without salt notes: "Docetaxel", not "Docetaxel (as Trihydrate)". */
  generic: string;
  genericFull: string;
  strength: string;
  form: string;
  category: string;
  conditions: string[];
  rx: boolean;
}

export interface MedicineHit {
  option: MedicineOption;
  score: number;
  /** True when at least one token only matched by spelling distance. */
  fuzzy: boolean;
  /** The catalogue word the fuzzy token was read as, e.g. "Lapatinib" for "lapatinb". */
  readAs?: string;
}

/** "Lapanib (Lapatinib) · 250 mg · Film-Coated Tablet": what the team reads in the sheet. */
export function medicineLabel(o: Pick<MedicineOption, 'brand' | 'generic' | 'strength' | 'form'>): string {
  const name = o.brand && o.generic && o.brand.toLowerCase() !== o.generic.toLowerCase() ? `${o.brand} (${o.generic})` : o.brand || o.generic;
  return [name, o.strength, o.form].filter(Boolean).join(' · ');
}

export function cleanGeneric(generic: string): string {
  return generic.replace(/\s*\((?:as|±)[^)]*\)/gi, '').replace(/\s+/g, ' ').trim();
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Rough sound-alike form: paclitaxel and paklitaksel both become "paklitaksel". */
export function phonetic(word: string): string {
  return word
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/qu/g, 'kw')
    .replace(/x/g, 'ks')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c/g, 'k')
    .replace(/z/g, 's')
    .replace(/y/g, 'i')
    .replace(/th/g, 't')
    .replace(/([a-z])\1+/g, '$1');
}

interface Field {
  words: string[];
  /** The text shown back as "Showing results for …". */
  display: string;
  weight: number;
}

/** Words of a value, plus brand parts: "DoseGet-20" gives doseget, dose, get, 20. */
function wordsOf(value: string, splitCamel = false): string[] {
  const out = new Set<string>();
  const raw = splitCamel ? value.replace(/([a-z])([A-Z])/g, '$1 $2') : value;
  for (const w of fold(raw).split(/[^a-z0-9]+/)) if (w) out.add(w);
  if (splitCamel) {
    const joined = fold(value).replace(/[^a-z0-9]+/g, '');
    if (joined) out.add(joined);
    const letters = fold(value).replace(/[^a-z]+/g, '');
    if (letters) out.add(letters);
  }
  return [...out];
}

function fieldsOf(o: MedicineOption): Field[] {
  return [
    { words: wordsOf(o.brand, true), display: o.brand, weight: 1 },
    { words: wordsOf(o.genericFull), display: o.generic, weight: 1 },
    { words: wordsOf(o.strength.replace(/(\d)\s*(mg|g|ml|mcg|units?)\b/gi, '$1 $2 $1$2')), display: o.strength, weight: 0.9 },
    ...o.conditions.map((c) => ({ words: wordsOf(c), display: c, weight: 0.8 })),
    { words: wordsOf(o.category), display: o.category, weight: 0.6 },
    { words: wordsOf(o.form), display: o.form, weight: 0.5 },
  ];
}

interface TokenScore {
  score: number;
  fuzzy: boolean;
  display: string;
}

function scoreToken(token: string, fields: Field[]): TokenScore | null {
  let best: TokenScore | null = null;
  const keep = (score: number, fuzzy: boolean, display: string) => {
    if (!best || score > best.score) best = { score, fuzzy, display };
  };
  const isNumber = /^\d/.test(token);
  const pt = phonetic(token);
  const allowed = token.length <= 5 ? 1 : token.length <= 8 ? 2 : 3;

  for (const f of fields) {
    for (const w of f.words) {
      if (w === token) keep(1 * f.weight, false, f.display);
      else if (w.startsWith(token)) keep((0.92 - Math.min(0.1, (w.length - token.length) * 0.01)) * f.weight, false, f.display);
      else if (token.length >= 4 && w.includes(token)) keep(0.8 * f.weight, false, f.display);
      else if (!isNumber && token.length >= 4 && w.length >= 4) {
        const pw = phonetic(w);
        if (pw === pt) {
          keep(0.9 * f.weight, false, f.display);
          continue;
        }
        // Whole word with a typo ("lapatinb"), or a half-typed word with one ("paklit").
        const whole = damerauLevenshtein(pt, pw);
        const partial = pw.length > pt.length ? damerauLevenshtein(pt, pw.slice(0, pt.length)) : Infinity;
        const d = Math.min(whole, partial + 0.5);
        if (d <= allowed && pw[0] === pt[0]) {
          const sim = 1 - d / Math.max(pt.length, Math.min(pw.length, pt.length + 2));
          keep((0.5 + 0.3 * sim) * f.weight, true, f.display);
        }
      }
    }
  }
  return best;
}

/** Words that carry no meaning in a medicine search. */
const STOP = new Set(['the', 'for', 'ng', 'sa', 'and', 'at', 'gamot', 'medicine', 'meds', 'na']);

export function searchMedicines(query: string, options: MedicineOption[], limit = 8): MedicineHit[] {
  const tokens = fold(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOP.has(t));
  if (!tokens.length) return [];

  const hits: MedicineHit[] = [];
  for (const option of options) {
    const fields = fieldsOf(option);
    let total = 0;
    let fuzzy = false;
    let readAs: string | undefined;
    let matched = true;
    for (const token of tokens) {
      const s = scoreToken(token, fields);
      if (!s) {
        matched = false;
        break;
      }
      total += s.score;
      if (s.fuzzy) {
        fuzzy = true;
        readAs ??= s.display;
      }
    }
    if (matched) hits.push({ option, score: total / tokens.length, fuzzy, readAs });
  }

  // When some products match as typed, typo guesses would only be noise.
  const exact = hits.filter((h) => !h.fuzzy);
  const pool = exact.length ? exact : hits;
  return pool
    .sort((a, b) => b.score - a.score || a.option.brand.localeCompare(b.option.brand) || a.option.strength.localeCompare(b.option.strength, undefined, { numeric: true }))
    .slice(0, limit);
}
