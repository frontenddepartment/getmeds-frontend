import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { productCategories, routes } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/sitemap" },
  title: "Sitemap",
  description:
    "Browse every page on the Getmeds website — products, patient assistance, services, company information and more.",
};

const groups = [
  { title: "Main Pages", priority: 1.0 },
  { title: "Company & Resources", priority: 0.8 },
  { title: "Information", priority: 0.5 },
] as const;

/* HTML sitemap — plain server-rendered links, no animation, so every link is crawlable. */
export default function SitemapPage() {
  return (
    <>
      <PageHero
        eyebrow="Sitemap"
        title="Every page on Getmeds."
        text="A complete list of pages on our website, so you can find what you need quickly."
      />

      <section className="mx-auto max-w-7xl px-5 pt-8 md:px-10 md:pt-0">
        <div className="grid gap-12 md:grid-cols-3">
          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h2 className="font-display text-xl font-semibold text-primary-deep">{g.title}</h2>
              <ul className="mt-5 space-y-4">
                {routes
                  .filter((r) => r.priority === g.priority)
                  .map((r) => (
                    <li key={r.path}>
                      <Link href={r.path} className="font-medium text-primary hover:underline">
                        {r.title}
                      </Link>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{r.description}</p>
                      {r.path === "/product-range" && (
                        <ul className="mt-3 flex flex-wrap gap-2 text-[13px]">
                          {productCategories.map((c) => (
                            <li key={c}>
                              <Link
                                href={`/product-range?category=${encodeURIComponent(c)}`}
                                className="inline-flex rounded-full border border-[#dde9f2] px-3.5 py-2 text-ink-soft transition hover:border-primary hover:text-primary"
                              >
                                {c}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-14 border-t border-[#e3edf5] pt-6 text-sm text-ink-soft">
          For search engines:{" "}
          <a href="/sitemap.xml" className="text-primary hover:underline">XML sitemap</a>
          {" · "}
          <a href="/image-sitemap.xml" className="text-primary hover:underline">Image sitemap</a>
        </p>
      </section>
    </>
  );
}
