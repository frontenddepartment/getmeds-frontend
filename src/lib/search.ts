/*
 * Site search — shared by the navbar's live dropdown and the /search results page,
 * so both always rank a query the same way.
 *
 * Every word typed must match. A hit in the name counts far more than one in the
 * subtitle or body, so "paclitaxel" puts PacliGet first.
 */

import { products } from "@/lib/data";
import { routes } from "@/lib/site";

export type SearchHit = {
  score: number;
  title: string;
  summary: string;
  meta: string;
  href: string;
};

export type SearchGroup = {
  key: "products" | "pages";
  label: string;
  items: SearchHit[];
  total: number;
  top: number;
};

export type SearchResults = {
  query: string;
  terms: string[];
  groups: SearchGroup[];
  total: number;
  shown: number;
};

/* Words people may type that are not in a page's title or description. */
const PAGE_KEYWORDS: Record<string, string> = {
  "/": "home pharmacy medicines",
  "/product-range": "products catalogue catalog portfolio generics brands oncology hematology medicines range",
  "/order-medicines": "order buy purchase delivery shipping inquiry quotation price",
  "/patient-assistance-program": "pap assistance guarantee letter dswd pcso ovp quotation financial help",
  "/services": "services importation import wholesale distribution cold chain logistics",
  "/global-network": "global network partners international sourcing manufacturing presence",
  "/blog": "blog news articles updates",
  "/careers": "careers jobs hiring work apply vacancies",
  "/csr": "csr corporate social responsibility community",
  "/ungc": "ungc united nations global compact sustainability",
  "/meditations": "meditations reflections wellness",
  "/about-us": "about company who we are mission vision team leadership",
  "/contact-us": "contact email phone number address inquiry get in touch reach us support whatsapp messenger office",
};

/** Pages left out of search results (still crawlable via sitemap.xml). */
const UNSEARCHABLE = new Set(["/sitemap"]);

/** Lowercase, punctuation folded to single spaces — used on both sides of every comparison. */
export function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The words that must match. Single letters are dropped (unless that's all there is). */
export function searchTerms(query: string) {
  const normalized = normalize(query);
  if (!normalized) return [];
  const words = normalized.split(" ");
  const long = words.filter((t) => t.length > 1);
  return Array.from(new Set(long.length ? long : words));
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Score a record, or 0 if any word is missing. Name hits weigh most
 * (whole word 30, start of word 20, inside 12), then the subtitle (8/5),
 * then the body (2). Bonus when the whole query is the name (+200),
 * starts it (+60) or is inside it (+25).
 */
function score(fields: { title: string; subtitle?: string; body?: string }, terms: string[]) {
  const title = normalize(fields.title);
  const subtitle = normalize(fields.subtitle ?? "");
  const body = normalize(fields.body ?? "");

  let total = 0;
  for (const term of terms) {
    const q = escapeRe(term);
    let s = 0;
    if (title.includes(term)) {
      if (new RegExp(`(?:^| )${q}(?:$| )`).test(title)) s = 30;
      else if (new RegExp(`(?:^| )${q}`).test(title)) s = 20;
      else s = 12;
    } else if (subtitle.includes(term)) {
      s = new RegExp(`(?:^| )${q}(?:$| )`).test(subtitle) ? 8 : 5;
    } else if (body.includes(term)) {
      s = 2;
    }
    if (!s) return 0;
    total += s;
  }

  const phrase = terms.join(" ");
  if (title === phrase) total += 200;
  else if (title.startsWith(phrase)) total += 60;
  else if (title.includes(phrase)) total += 25;
  return total;
}

/** Highest score first; equal scores alphabetical so the order never shuffles. */
const rank = (hits: SearchHit[]) =>
  hits.sort((a, b) => (a.score === b.score ? a.title.localeCompare(b.title) : b.score - a.score));

function searchProducts(terms: string[]) {
  const hits: SearchHit[] = [];
  for (const p of products) {
    const s = score({ title: p.brand, subtitle: `${p.generic} ${p.category}`, body: `${p.strength} ${p.form}` }, terms);
    if (s) {
      hits.push({
        score: s,
        title: p.brand,
        summary: `${p.generic} · ${p.category}`,
        meta: `${p.strength} · ${p.form}`,
        href: `/product-range?q=${encodeURIComponent(p.brand)}`,
      });
    }
  }
  return rank(hits);
}

function searchPages(terms: string[]) {
  const hits: SearchHit[] = [];
  for (const r of routes) {
    if (UNSEARCHABLE.has(r.path)) continue;
    const s = score({ title: r.title, subtitle: PAGE_KEYWORDS[r.path] ?? "", body: r.description }, terms);
    if (s) hits.push({ score: s, title: r.title, summary: r.description, meta: "", href: r.path });
  }
  return rank(hits);
}

/** Runs every group; the group with the best match is listed first. */
export function searchAll(query: string, perGroup = 12): SearchResults {
  const q = query.trim().slice(0, 100);
  const terms = searchTerms(q);
  if (!terms.length) return { query: q, terms, groups: [], total: 0, shown: 0 };

  const sources = [
    { key: "products" as const, label: "Products", hits: searchProducts(terms) },
    { key: "pages" as const, label: "Pages", hits: searchPages(terms) },
  ];
  const groups: SearchGroup[] = sources
    .filter((s) => s.hits.length)
    .map((s) => ({ key: s.key, label: s.label, items: s.hits.slice(0, perGroup), total: s.hits.length, top: s.hits[0].score }))
    .sort((a, b) => b.top - a.top);

  return {
    query: q,
    terms,
    groups,
    total: groups.reduce((n, g) => n + g.total, 0),
    shown: groups.reduce((n, g) => n + g.items.length, 0),
  };
}

/** Splits text into plain and matched parts, for highlighting without innerHTML. */
export function highlightParts(text: string, terms: string[]) {
  if (!terms.length) return [{ text, match: false }];
  const pattern = new RegExp(`(${[...terms].sort((a, b) => b.length - a.length).map(escapeRe).join("|")})`, "giu");
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, match: terms.some((t) => t === part.toLowerCase()) }));
}

export const searchHref = (query: string) => `/search?q=${encodeURIComponent(query.trim())}`;
