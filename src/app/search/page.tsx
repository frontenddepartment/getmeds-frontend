import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import SearchIllustration from "@/components/SearchIllustration";
import { routes } from "@/lib/site";
import { highlightParts, searchAll } from "@/lib/search";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

const readQuery = async (searchParams: Props["searchParams"]) => {
  const q = (await searchParams).q;
  return (Array.isArray(q) ? q[0] : q ?? "").trim().slice(0, 100);
};

/* Results pages are noindex: they have no content of their own. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await readQuery(searchParams);
  return {
    title: query ? `Search: ${query}` : "Search",
    description: "Search the Getmeds product range and pages.",
    robots: { index: false, follow: true },
    alternates: { canonical: "/search" },
  };
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlightParts(text, terms).map((p, i) =>
        p.match ? (
          <mark key={i} className="rounded-sm bg-primary/15 text-inherit">{p.text}</mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

const chip =
  "inline-flex items-center rounded-full border border-[#e4e8ec] px-3.5 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-primary hover:text-primary";

/* Heading, summary and illustration on the left (sticky on desktop); results on the right. */
function SearchLayout({ title, text, children }: { title: ReactNode; text: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-32 md:px-16 md:pb-24 md:pt-40 lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12 xl:px-20">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <h1 className="font-display break-words text-[1.75rem] font-medium leading-tight text-primary-deep md:text-[2.1rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-[22rem] text-[15px] leading-relaxed text-ink-soft">{text}</p>
        <SearchIllustration className="mt-10 hidden w-full max-w-[280px] lg:block" />
      </div>
      <div className="mt-10 min-w-0 lg:mt-0">{children}</div>
    </section>
  );
}

/* The query is URL data, so it's read inside Suspense; the boundary keeps the rest prerenderable. */
export default function SearchPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<SearchLayout title="Search Getmeds" text="Search the product range and the rest of the site." />}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResults({ searchParams }: Props) {
  const query = await readQuery(searchParams);
  const results = searchAll(query, 12);
  const shown = results.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <SearchLayout
      title={query ? <>Results for “{query}”</> : "Search Getmeds"}
      text={
        !query
          ? "Search the product range and the rest of the site."
          : results.total
            ? `${results.total} result${results.total === 1 ? "" : "s"} across products and pages${
                shown < results.total ? ` — showing the top ${shown}` : ""
              }.`
            : "Nothing matched that."
      }
    >
      {!query ? (
        <div>
          <p className="mb-4 text-xs font-medium text-ink-soft/70">Popular starting points</p>
          <div className="flex flex-wrap gap-2">
            {routes.filter((r) => r.path !== "/sitemap").map((r) => (
              <Link key={r.path} href={r.path} className={chip}>{r.title}</Link>
            ))}
          </div>
        </div>
      ) : !results.total ? (
        <div className="rounded-2xl border border-[#e4e8ec] p-7">
          <p className="font-medium text-primary-deep">No results for “{query}”.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-soft">
            <li>Check the spelling — generic names are long and easy to mistype.</li>
            <li>Try the brand or generic name on its own.</li>
            <li>Try a broader word, such as a category (“oncology”) or a dosage form (“tablet”).</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/product-range" className="inline-flex items-center rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:brightness-110">
              Browse all products
            </Link>
            <Link href="/contact-us" className={chip}>Ask us directly</Link>
          </div>
        </div>
      ) : (
        results.groups.map((g) => (
          <section key={g.key} className="mt-9 first:mt-0" aria-labelledby={`search-group-${g.key}`}>
            <h2 id={`search-group-${g.key}`} className="mb-4 inline-block rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-medium text-white">
              {g.label}{" "}
              <span className="text-white/70">
                ({g.items.length < g.total ? `${g.items.length} of ${g.total}` : g.total})
              </span>
            </h2>
            <ul className="divide-y divide-[#eef2f7] border-t border-[#eef2f7]">
              {g.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="group flex items-start justify-between gap-4 py-5">
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-primary-deep transition-colors group-hover:text-primary">
                        <Highlight text={item.title} terms={results.terms} />
                      </p>
                      {item.summary && (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                          <Highlight text={item.summary} terms={results.terms} />
                        </p>
                      )}
                      {item.meta && <p className="mt-2 text-xs text-ink-soft/70">{item.meta}</p>}
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-soft/40 transition-colors group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
            {g.key === "products" && g.total > g.items.length && (
              <Link
                href={`/product-range?q=${encodeURIComponent(query)}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:brightness-110"
              >
                See all {g.total} matching products <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </section>
        ))
      )}
    </SearchLayout>
  );
}
