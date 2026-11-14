"use client";

/**
 * NEW SETUP — homepage "Find the medicine you need" band.
 * Instant suggestions from v2's own search index (lib/search.ts); submitting opens the product range
 * filtered by the query (/product-range?q=, which v2's product-range page reads).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchAll } from "@/lib/search";
import "../newsetup.css";

export default function HomeFind() {
  const router = useRouter();
  const uid = useId();
  const listId = `home-find-list-${uid}`;
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState("");
  const suggestions = useMemo(
    () => (q.trim().length >= 2 ? (searchAll(q, 6).groups.find((g) => g.key === "products")?.items ?? []).slice(0, 6) : []),
    [q],
  );
  const showList = open && q.trim().length >= 2;

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }
  function submit() {
    if (active >= 0 && suggestions[active]) return go(suggestions[active].href);
    if (!q.trim()) return setError("Enter a medicine name to search.");
    go(`/product-range?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <section aria-labelledby="ns-find-h" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <span className="ns-label">Search medicines</span>
            <h2 id="ns-find-h" className="font-display mt-4 text-3xl font-medium leading-tight text-primary-deep md:text-[2.5rem]">
              Find the medicine you need.
            </h2>
            <p className="mt-3 text-ink-soft">Search by brand or generic name to find medicine information and how to order.</p>
          </div>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="relative flex items-center rounded-full border border-[#d8e4ee] bg-white p-1.5 shadow-[0_10px_24px_-18px_rgba(13,84,120,0.35)] focus-within:border-primary">
              <Search aria-hidden className="ml-3 h-5 w-5 shrink-0 text-ink-soft" />
              <label htmlFor={`home-find-${uid}`} className="sr-only">
                Search medicine name
              </label>
              <input
                id={`home-find-${uid}`}
                type="search"
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                aria-invalid={error ? true : undefined}
                autoComplete="off"
                placeholder="Search medicine name..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setOpen(true);
                  setActive(-1);
                  setError("");
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(true);
                    setActive((a) => Math.min(a + 1, suggestions.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, -1));
                  } else if (e.key === "Escape" && showList) {
                    e.preventDefault(); // close suggestions without clearing the query
                    setOpen(false);
                    setActive(-1);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
              <button type="submit" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95">
                Search
              </button>
              {showList && (
                <ul id={listId} role="listbox" aria-label="Medicine suggestions" className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[#dde9f2] bg-white text-sm shadow-lg">
                  {suggestions.length ? (
                    suggestions.map((p, i) => (
                      <li
                        key={p.href + i}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === active}
                        className={`cursor-pointer px-4 py-3 ${i === active ? "bg-primary-soft" : ""}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          go(p.href);
                        }}
                        onMouseEnter={() => setActive(i)}
                      >
                        <span className="font-semibold text-primary-deep">{p.title}</span>
                        {p.meta && <span className="ml-2 text-ink-soft">{p.meta}</span>}
                      </li>
                    ))
                  ) : (
                    <li role="option" aria-selected={false} aria-disabled="true" className="px-4 py-3 text-ink-soft">
                      No matching medicine. Press Search to see all results, or request assistance below.
                    </li>
                  )}
                </ul>
              )}
            </div>
            {error && (
              <p className="ns-error mt-2" role="alert">
                {error}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 px-2 text-sm">
              <p className="text-ink-soft">
                Can&apos;t find your medicine?{" "}
                <Link href="/order-medicines/patients#order-form" className="font-semibold text-primary hover:text-primary-deep">
                  Send us your prescription
                </Link>
              </p>
              <Link href="/product-range" className="font-semibold text-primary hover:text-primary-deep">
                View all medicines →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
