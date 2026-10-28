"use client";

/*
 * Navbar search.
 *  - 1280px and wider: <SearchField/> — an inline field; 2+ characters show a live
 *    dropdown (Products / Pages, 4 each) plus "See all N results →".
 *  - Narrower: <SearchTrigger/> opens <SearchPanel/>, a full-width panel under the
 *    header with a dimmed backdrop; the page can't scroll behind it.
 *  - Enter or "See all" opens /search?q=…; arrow keys walk results, Esc closes,
 *    "/" focuses search from anywhere (unless typing in another field).
 */

import Link from "next/link";
import { IlloNoResults } from "@/components/Illustrations";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchAll, searchHref } from "@/lib/search";

const PER_GROUP = 4;

/** Arrow keys walk the result links; ArrowUp past the first returns to the field. */
function moveFocus(e: React.KeyboardEvent, list: HTMLElement | null, input: HTMLInputElement | null) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  const rows = Array.from(list?.querySelectorAll<HTMLAnchorElement>("a[data-hit]") ?? []);
  if (!rows.length) return;
  e.preventDefault();
  const current = rows.indexOf(document.activeElement as HTMLAnchorElement);
  const next =
    e.key === "ArrowDown"
      ? current < 0 ? 0 : Math.min(current + 1, rows.length - 1)
      : current <= 0 ? -1 : current - 1;
  if (next < 0) input?.focus();
  else rows[next].focus();
}

function useSuggestions(value: string) {
  const query = useDeferredValue(value.trim());
  const results = useMemo(() => (query.length < 2 ? null : searchAll(query, PER_GROUP)), [query]);
  return { query, results };
}

function ResultList({
  id,
  query,
  results,
  onPick,
}: {
  id: string;
  query: string;
  results: ReturnType<typeof searchAll>;
  onPick: () => void;
}) {
  const row =
    "block rounded-xl px-2.5 py-2 outline-none transition-colors hover:bg-[#f2f8fc] focus:bg-[#f2f8fc]";
  return (
    <div id={id} role="listbox" aria-label="Search results" className="text-left">
      {!results.groups.length ? (
        <div className="flex flex-col items-center py-5 text-center">
          <IlloNoResults className="h-24 w-auto" />
          <p className="mt-3 text-sm font-medium text-primary-deep">No results for “{query}”.</p>
          <p className="mt-1 text-xs text-ink-soft">Try a brand or generic name, e.g. “Pazopanib”.</p>
        </div>
      ) : (
        <>
          {results.groups.map((g) => (
            <div key={g.key}>
              <p className="mb-1.5 mt-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-white first:mt-1">
                {g.label}
              </p>
              {g.items.map((item) => (
                <Link key={item.href} href={item.href} data-hit role="option" aria-selected={false} onClick={onPick} className={row}>
                  <span className="block text-sm font-semibold leading-snug text-primary-deep">{item.title}</span>
                  {item.summary && (
                    <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{item.summary}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
          <Link
            href={searchHref(query)}
            data-hit
            role="option"
            aria-selected={false}
            onClick={onPick}
            className={`${row} mt-2 text-[13px] font-semibold text-primary`}
          >
            See all {results.total} result{results.total === 1 ? "" : "s"} →
          </Link>
        </>
      )}
    </div>
  );
}

/** "/" focuses search from anywhere, unless the visitor is typing elsewhere. */
function useSlashShortcut(onSlash: () => void) {
  const cb = useRef(onSlash);
  useEffect(() => {
    cb.current = onSlash;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      e.preventDefault();
      cb.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
}

/** On the results page, show the query that page is answering; elsewhere start empty. */
function useQueryFromUrl(setValue: (v: string) => void) {
  const pathname = usePathname();
  useEffect(() => {
    setValue(pathname === "/search" ? new URLSearchParams(window.location.search).get("q") ?? "" : "");
  }, [pathname, setValue]);
}

/* ------------------------------------------------------------------ inline field */

export function SearchField({ onDark, onOpenPanel }: { onDark: boolean; onOpenPanel: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const listId = useId();
  const { query, results } = useSuggestions(value);
  const showList = open && !!results;

  useQueryFromUrl(setValue);

  // The inline field only shows at 1280px+; below that, "/" opens the panel instead.
  useSlashShortcut(() => {
    if (input.current && input.current.offsetParent !== null) input.current.focus();
    else onOpenPanel();
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setOpen(false);
    input.current?.blur();
    router.push(searchHref(value));
  }

  return (
    <div
      ref={wrap}
      className="relative hidden xl:block"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          input.current?.focus(); // before closing — focusing the field reopens the list
          setOpen(false);
        } else moveFocus(e, list.current, input.current);
      }}
    >
      <form action="/search" onSubmit={submit} role="search" className="relative">
        <label htmlFor="nav-search" className="sr-only">Search products and pages</label>
        <Search
          className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
            onDark ? "text-white/70" : "text-ink-soft/60"
          }`}
        />
        <input
          ref={input}
          id="nav-search"
          type="search"
          name="q"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showList}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search medicines"
          className={`w-64 rounded-full py-1.5 pl-10 pr-4 text-sm outline-none transition [&::-webkit-search-cancel-button]:hidden ${
            onDark
              ? "bg-white/15 text-white placeholder-white/60 ring-1 ring-white/30 backdrop-blur"
              : "bg-[#f5f7f9] text-primary-deep placeholder-ink-soft/60 ring-1 ring-[#e4e8ec] focus:bg-white focus:ring-primary/40"
          }`}
        />
      </form>

      {showList && (
        <div
          ref={list}
          className="absolute left-1/2 top-full z-[60] mt-2.5 max-h-[min(70vh,28rem)] w-[26rem] max-w-[80vw] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl bg-white p-2 shadow-xl ring-1 ring-[#e4e8ec]"
        >
          <ResultList id={listId} query={query} results={results} onPick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ icon + full panel */

export function SearchTrigger({
  onDark,
  open,
  onToggle,
}: {
  onDark: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      data-search-trigger
      onClick={onToggle}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="nav-search-panel"
      aria-label="Search"
      className={`justify-self-end rounded-xl p-2.5 xl:hidden ${
        onDark ? "bg-white/10 text-white" : "bg-white text-primary-deep"
      }`}
    >
      <Search className="h-5 w-5" />
    </button>
  );
}

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const listId = useId();
  const { query, results } = useSuggestions(value);

  useQueryFromUrl(setValue);

  // Focus the field after the slide-in, lock page scroll, close on Esc / outside click.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus(), 60);
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        Array.from(document.querySelectorAll<HTMLElement>("[data-search-trigger]"))
          .find((t) => t.offsetParent !== null)
          ?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!panel.current?.contains(target) && !target.closest("[data-search-trigger]")) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onClose();
    router.push(searchHref(value));
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-full h-screen bg-[#020617]/50 transition-opacity duration-300 xl:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        ref={panel}
        id="nav-search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search this site"
        className={`absolute inset-x-0 top-full z-40 transition duration-300 ease-out md:px-6 md:pt-2 xl:hidden ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <div
          className="mx-auto max-w-7xl rounded-b-[24px] bg-white p-4 shadow-xl md:rounded-[24px] md:p-5 md:ring-1 md:ring-[#edf2f7]"
          onKeyDown={(e) => moveFocus(e, list.current, input.current)}
        >
          <form action="/search" onSubmit={submit} role="search" className="relative">
            <label htmlFor="nav-search-panel-input" className="sr-only">Search products and pages</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft/60" />
            <input
              ref={input}
              id="nav-search-panel-input"
              type="search"
              name="q"
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded={!!results}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search products and pages…"
              className="w-full rounded-full bg-white py-3.5 pl-11 pr-14 text-[15px] text-primary-deep outline-none ring-1 ring-[#e4e8ec] transition placeholder:text-ink-soft/60 focus:ring-primary/50 [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft/60 transition hover:text-primary-deep"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </form>
          {results && (
            <div ref={list} className="mt-3 max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain">
              <ResultList id={listId} query={query} results={results} onPick={onClose} />
            </div>
          )}
          <p role="status" aria-live="polite" className="sr-only">
            {results ? `${results.total} result${results.total === 1 ? "" : "s"}.` : ""}
          </p>
        </div>
      </div>
    </>
  );
}
