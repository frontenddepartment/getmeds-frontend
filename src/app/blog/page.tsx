"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Reveal } from "@/components/ui";
import PageHero from "@/components/PageHero";

type Post = { title: string; excerpt: string; date: string; category: string; /** set when the excerpt is in Filipino */ lang?: "fil" };

const posts: Post[] = [
  { category: "News", date: "September 15, 2026", title: "Docetaxel Price Philippines: Where to Get Docetaxel and How to Inquire", excerpt: "Looking for the docetaxel price in the Philippines? Here's where to get it and how to inquire." },
  { category: "News", date: "September 1, 2026", title: "Generic Medicines vs Branded: Safety, Price, and Quality Comparison 2026", excerpt: "Ikaw ba ay nag-aalinlangan tungkol sa generic medicines? Understanding quality, safety, and affordability." },
  { category: "News", date: "July 23, 2026", title: "Getmeds Strengthens Cancer Care Access Through Courtesy Call with Naga City Mayor Leni Robredo", excerpt: "Getmeds strengthens its commitment to cancer care through a courtesy call in Naga City." },
  { category: "News", date: "July 8, 2026", title: "Getmeds Completes UN Global Compact SDG Ambition Programme", excerpt: "On 16 June 2026, Getmeds reached a defining milestone — completing the SDG Ambition Accelerator." },
  { category: "Guides", date: "June 26, 2026", title: "How to Get Medical Assistance from DSWD: Your Ultimate Guide", excerpt: "Ang DSWD ay isang ahensya ng gobyerno na tumutulong sa mga Pilipinong nangangailangan ng medical assistance.", lang: "fil" },
  { category: "Health", date: "June 26, 2026", title: "14 Essential Cancer Screening Tests for Women: Early Detection in the Philippines", excerpt: "Cancer screening is a highly recommended procedure once you fall under a certain age bracket." },
  { category: "Product Launch", date: "June 25, 2026", title: "PAZOGET: The First Generic Pazopanib Now Available in the Philippines", excerpt: "The generic pazopanib Philippine patients have been waiting for is finally here." },
  { category: "Product Launch", date: "June 9, 2025", title: "First Affordable Teriparatide Injection Biosimilar Enters the Philippine Market", excerpt: "A meaningful step forward for cost-effective bone health treatment in the Philippines." },
  { category: "Health", date: "April 23, 2025", title: "9 Affordable and Healthy Filipino Foods That Help Reduce Cancer Risk", excerpt: "Budget-friendly, cancer-fighting foods you can add to your everyday meals." },
  { category: "Guides", date: "April 14, 2025", title: "Managing Chemotherapy Side Effects: Before, During, and After Treatment", excerpt: "Life-changing tips for patients navigating chemotherapy side effects." },
  { category: "Health", date: "April 7, 2025", title: "20 Cancer Myths and Misconceptions You Should Stop Believing", excerpt: "Cancer myths continue to be passed around without fact-checking — let's set the record straight." },
  { category: "Guides", date: "February 20, 2025", title: "PCSO Medicine Assistance: Requirements & How to Apply Online", excerpt: "How PCSO medical assistance helps Filipino patients pay for prescribed medicines, including cancer medicines." },
  { category: "News", date: "February 11, 2025", title: "Surging Lung Cancer Cases Among Non-Smokers Linked to Air Pollution", excerpt: "Lung cancer remains one of the leading causes of cancer-related death in the Philippines." },
  { category: "News", date: "February 4, 2025", title: "Breakthrough AI Predicts Breast Cancer Risk 6 Years Ahead, Study Reveals", excerpt: "New research shows AI can flag elevated breast cancer risk years before diagnosis." },
  { category: "Guides", date: "December 20, 2024", title: "How to Reduce the Cost of Cancer Treatment in the Philippines: 4 Effective Ways", excerpt: "Practical ways patients and families can ease the financial burden of treatment." },
  { category: "Health", date: "December 13, 2024", title: "HIV in the Philippines: Its Current State and Steadfast Emergence", excerpt: "Understanding HIV's impact on the immune system and the current situation in the Philippines." },
];

const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

// Phones list posts in pages of MOBILE_PAGE ("Load more"); larger screens show them all.
const MOBILE_PAGE = 6;

export default function BlogPage() {
  const [cat, setCat] = useState("All");
  const [mobileLimit, setMobileLimit] = useState(MOBILE_PAGE);
  useEffect(() => setMobileLimit(MOBILE_PAGE), [cat]);
  const filtered = useMemo(
    () => (cat === "All" ? posts : posts.filter((p) => p.category === cat)),
    [cat]
  );
  const [featured, ...rest] = filtered;

  return (
    <>
      <PageHero
        eyebrow="Our Blog"
        title={<>Insights from <span className="text-gradient">Getmeds.</span></>}
        text="Stay informed with the latest news, health guides, and updates from Getmeds — your trusted source for pharmaceutical insights and patient care resources in the Philippines."
      />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                  cat === c
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "glass-chip text-primary-dark hover:bg-primary/10"
                }`}
              >
                {c}
              </button>
            ))}
          </Reveal>

          {featured && (
            <motion.article
              key={"feat-" + featured.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass group relative mb-6 cursor-pointer overflow-hidden rounded-2xl p-8 transition hover:shadow-lg hover:shadow-primary/10 md:p-12"
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/15 blur-[90px]" />
              <div className="relative max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    Featured · {featured.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                    <CalendarDays className="h-3.5 w-3.5" /> {featured.date}
                  </span>
                </div>
                <h2 className="font-display mt-4 text-2xl font-bold leading-snug text-primary-deep transition group-hover:text-primary-dark md:text-3xl">
                  {featured.title}
                </h2>
                <p lang={featured.lang} className="mt-3 leading-relaxed text-ink-soft">{featured.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Read article <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </motion.article>
          )}

          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {rest.map((p, i) => (
                <motion.article
                  layout
                  key={p.title}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.3 }}
                  className={`glass group flex h-full cursor-pointer flex-col rounded-xl p-5 transition md:p-6 ${i >= mobileLimit ? "max-sm:hidden" : ""} hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                      {p.category}
                    </span>
                    <span className="text-xs font-medium text-ink-soft">{p.date}</span>
                  </div>
                  <h3 className="font-display mt-4 font-bold leading-snug text-primary-deep transition group-hover:text-primary-dark">
                    {p.title}
                  </h3>
                  <p lang={p.lang} className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                    {p.excerpt}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-bold text-primary">
                    Read more <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
          {rest.length > mobileLimit && (
            <div className="mt-6 text-center sm:hidden">
              <button
                type="button"
                onClick={() => setMobileLimit((n) => n + MOBILE_PAGE)}
                className="rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Load more ({rest.length - mobileLimit} more)
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
