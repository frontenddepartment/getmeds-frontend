import type { Product } from "./data";

/**
 * Calculates the Damerau-Levenshtein distance between two strings,
 * accounting for insertions, deletions, substitutions, and transpositions.
 */
export function damerauLevenshtein(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;

  const d: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,        // deletion
        d[i][j - 1] + 1,        // insertion
        d[i - 1][j - 1] + cost  // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
      }
    }
  }

  return d[al][bl];
}

interface TokenMatch {
  isExact: boolean;
  similarity: number;
  distance: number;
  suggestionLabel: string;
}

function matchTokenAgainstProduct(token: string, p: Product): TokenMatch | null {
  const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleanToken) return null;

  // 1. Check exact substring in brand, generic, strength, form, category
  const fullText = `${p.brand} ${p.generic} ${p.strength} ${p.form} ${p.category}`.toLowerCase();
  if (fullText.includes(token.toLowerCase())) {
    return { isExact: true, similarity: 1, distance: 0, suggestionLabel: p.brand };
  }

  if (cleanToken.length < 3) return null;

  // 2. Candidates for typo / fuzzy comparison
  const brandRaw = p.brand.toLowerCase();
  const brandNoNums = brandRaw.replace(/[^a-z]/g, "");
  const brandWords = brandRaw.split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  const genericWords = p.generic.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3);

  const candidates: Array<{ text: string; label: string }> = [
    { text: brandNoNums, label: p.brand },
    ...brandWords.map((w) => ({ text: w, label: p.brand })),
    ...genericWords.map((w) => ({ text: w, label: p.brand })),
  ];

  const maxAllowedDist = cleanToken.length <= 4 ? 1 : cleanToken.length <= 7 ? 2 : 3;
  const threshold = cleanToken.length <= 4 ? 0.75 : 0.65;

  let best: TokenMatch | null = null;
  const consider = (text: string, label: string, penalty: number) => {
    const dist = damerauLevenshtein(cleanToken, text);
    const sim = 1 - dist / Math.max(cleanToken.length, text.length) - penalty;
    if (dist <= maxAllowedDist && sim >= threshold - penalty) {
      if (!best || sim > best.similarity || (sim === best.similarity && dist < best.distance)) {
        best = { isExact: false, similarity: sim, distance: dist, suggestionLabel: label };
      }
    }
  };

  for (const c of candidates) {
    if (!c.text || c.text.length < 3) continue;
    // Whole-word typo, e.g. "abirgaet" → "abiraget"
    consider(c.text, c.label, 0);

    // Partially typed word with a typo, e.g. "aboreg" → "abirag…" (AbiraGet).
    // Compare against prefixes around the typed length; same first letter required
    // to keep noise down. Slight penalty so full-word matches rank first.
    const L = cleanToken.length;
    if (L >= 4 && c.text.length > L && c.text[0] === cleanToken[0]) {
      for (let len = L - 1; len <= L + 1; len++) {
        if (len < c.text.length) consider(c.text.slice(0, len), c.label, 0.02);
      }
    }
  }

  return best;
}

export interface TypoSearchResult {
  list: Product[];
  hasTypo: boolean;
  suggestion: string | null;
}

/**
 * Searches products with typo-detection.
 * If exact matches exist, returns them immediately with hasTypo = false.
 * If only typo-close matches exist, returns closest matches and suggestion label with hasTypo = true.
 */
export function searchProductsWithTypo(query: string, productList: Product[]): TypoSearchResult {
  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return { list: productList, hasTypo: false, suggestion: null };
  }

  interface ScoredProduct {
    product: Product;
    avgSim: number;
    totalDist: number;
    hasTypo: boolean;
    suggestionLabel: string;
  }

  const matches: ScoredProduct[] = [];
  for (const p of productList) {
    let allTokensMatched = true;
    let productSim = 0;
    let productDist = 0;
    let productHasTypo = false;
    let suggestionLabel = p.brand;

    for (const token of tokens) {
      const tokenMatch = matchTokenAgainstProduct(token, p);
      if (!tokenMatch) {
        allTokensMatched = false;
        break;
      }
      productSim += tokenMatch.similarity;
      productDist += tokenMatch.distance;
      if (!tokenMatch.isExact) {
        productHasTypo = true;
        suggestionLabel = tokenMatch.suggestionLabel;
      }
    }

    if (allTokensMatched) {
      matches.push({
        product: p,
        avgSim: productSim / tokens.length,
        totalDist: productDist,
        hasTypo: productHasTypo,
        suggestionLabel,
      });
    }
  }

  // Exact matches first
  const exactMatches = matches.filter((m) => !m.hasTypo);
  if (exactMatches.length > 0) {
    return {
      list: exactMatches.map((m) => m.product),
      hasTypo: false,
      suggestion: null,
    };
  }

  // Typo matches sorted by similarity then distance
  matches.sort((a, b) => b.avgSim - a.avgSim || a.totalDist - b.totalDist);
  const suggestion = matches.length > 0 ? matches[0].suggestionLabel : null;

  return {
    list: matches.map((m) => m.product),
    hasTypo: matches.length > 0,
    suggestion,
  };
}

