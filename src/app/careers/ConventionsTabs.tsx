"use client";

/* Conventions: a sticky Local / International switch on the left; on the right the events of the
   chosen group laid out like the blog's article cards (photo, then title and text, no box),
   fading between groups. */

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export type Convention = { src: string; title: string; sub?: string; text: string };
type Groups = { local: Convention[]; international: Convention[] };

const TABS: { key: keyof Groups; label: string }[] = [
  { key: "local", label: "Local" },
  { key: "international", label: "International" },
];

export default function ConventionsTabs({ groups }: { groups: Groups }) {
  const [tab, setTab] = useState<keyof Groups>("local");
  const items = groups[tab];

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-14">
      {/* sidebar: stays put while the events scroll */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="flex gap-2 lg:flex-col" role="tablist" aria-label="Convention groups">
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={`flex items-center justify-between gap-3 rounded-full px-5 py-2.5 text-sm font-semibold transition lg:w-full ${
                  active
                    ? "bg-[#1D9FDA] text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-primary hover:ring-primary/40"
                }`}
              >
                {label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {groups[key].length}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* events: article-style, fading in when the group changes */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-x-6 gap-y-10 sm:grid-cols-2"
        >
          {items.map((c) => (
            <li key={c.title}>
              <article className="group flex h-full flex-col">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={c.src}
                    alt={c.title}
                    fill
                    sizes="(min-width: 1024px) 38vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-4 text-[12.5px] text-slate-500">
                  <span className="font-semibold text-primary">{tab === "local" ? "Local" : "International"}</span>
                  {c.sub && (
                    <>
                      <span className="mx-2 text-slate-300">·</span>
                      {c.sub}
                    </>
                  )}
                </p>
                <h3 className="font-display mt-1.5 text-[17px] font-semibold leading-snug text-black">{c.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{c.text}</p>
              </article>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}
