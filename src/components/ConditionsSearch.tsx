"use client";

/*
 * Conditions A–Z: search box + the masonry of category cards, filtered as you type.
 * Matches a condition's name or its category's name (a category match keeps the whole card).
 * Every card is in the server HTML; filtering only hides cards in the browser.
 * When nothing matches exactly, falls back to typo-tolerant matching ("leukemai" → Leukemia).
 */

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { damerauLevenshtein } from "@/lib/fuzzySearch";

export type ConditionCard = { name: string; items: { label: string; href?: string }[] };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* Every query word is a substring of the text */
const matchesExact = (text: string, words: string[]) => {
  const t = norm(text);
  return words.every((w) => t.includes(w));
};

/* Every query word (4+ letters) is within a typo or two of a word in the text, or of its start */
const matchesFuzzy = (text: string, words: string[]) => {
  const tw = norm(text).split(/[^a-z0-9]+/).filter(Boolean);
  return words.every((w) => {
    if (w.length < 4) return tw.some((x) => x.startsWith(w));
    const max = w.length <= 6 ? 1 : 2;
    return tw.some((x) => damerauLevenshtein(w, x) <= max || (x.length > w.length && damerauLevenshtein(w, x.slice(0, w.length)) <= max));
  });
};

function filterCards(cards: ConditionCard[], words: string[], match: (t: string, w: string[]) => boolean) {
  return cards
    .map((c) => (match(c.name, words) ? c : { ...c, items: c.items.filter((i) => match(i.label, words)) }))
    .filter((c) => c.items.length > 0);
}

/* Bold the matched part of a label (exact matches only) */
function highlight(label: string, words: string[]): ReactNode {
  if (!words.length) return label;
  const n = norm(label);
  const marks = new Array(label.length).fill(false);
  for (const w of words) {
    let i = n.indexOf(w);
    while (i !== -1) {
      for (let k = i; k < i + w.length; k++) marks[k] = true;
      i = n.indexOf(w, i + w.length);
    }
  }
  const out: ReactNode[] = [];
  let start = 0;
  for (let i = 1; i <= label.length; i++) {
    if (i === label.length || marks[i] !== marks[start]) {
      const part = label.slice(start, i);
      out.push(marks[start] ? <mark key={start} className="rounded-sm bg-[#d8f0fb] text-inherit">{part}</mark> : part);
      start = i;
    }
  }
  return out;
}

export default function ConditionsSearch({ cards }: { cards: ConditionCard[] }) {
  const [query, setQuery] = useState("");
  const words = useMemo(() => norm(query).split(/\s+/).filter(Boolean), [query]);
  const total = useMemo(() => cards.reduce((n, c) => n + c.items.length, 0), [cards]);

  const { shown, fuzzy } = useMemo(() => {
    if (!words.length) return { shown: cards, fuzzy: false };
    const exact = filterCards(cards, words, matchesExact);
    if (exact.length) return { shown: exact, fuzzy: false };
    return { shown: filterCards(cards, words, matchesFuzzy), fuzzy: true };
  }, [cards, words]);
  const count = shown.reduce((n, c) => n + c.items.length, 0);

  return (
    <>
      <div className="mt-8 max-w-xl">
        <label htmlFor="conditions-search" className="sr-only">Search conditions</label>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="conditions-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search conditions, e.g. leukemia, diabetes"
            autoComplete="off"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-11 text-base text-black outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 md:text-[15px] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 pl-1 text-[13px] text-ink-soft" aria-live="polite">
          {!words.length
            ? `${total} conditions in ${cards.length} categories`
            : count
              ? `${count} of ${total} conditions${fuzzy ? ` — closest matches for “${query.trim()}”` : ""}`
              : ""}
        </p>
      </div>

      {shown.length > 0 ? (
        /* Masonry: CSS columns, so each card sits right under the one above instead of every row
           stretching to its tallest card and leaving gaps next to the short ones */
        <div className="mt-6 gap-4 md:columns-2 lg:columns-3">
          {shown.map(({ name, items }) => (
            <section key={name} className="mb-4 break-inside-avoid rounded-3xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display font-semibold leading-snug text-black">{fuzzy ? name : highlight(name, words)}</h2>
                <span className="mt-0.5 text-xs text-ink-soft">{items.length}</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-black">
                {items.map(({ label, href }) => {
                  const text = fuzzy ? label : highlight(label, words);
                  return (
                    <li key={label}>
                      {href ? <Link href={href} className="font-semibold text-primary hover:underline">{text} →</Link> : text}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center">
          <p className="font-display text-lg font-semibold text-black">No conditions match &ldquo;{query.trim()}&rdquo;</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Try another spelling or a broader word, or search our medicines instead.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setQuery("")} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary">
              Clear search
            </button>
            <Link
              href={`/product-range?q=${encodeURIComponent(query.trim())}`}
              className="rounded-full bg-[#1D9FDA] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Search medicines
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
