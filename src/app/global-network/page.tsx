"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Globe2, MapPin, X } from "lucide-react";
import { networkEras, networkNodes, type NetworkNode } from "@/lib/data";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/ui";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function GlobalNetworkPage() {
  const [selected, setSelected] = useState<NetworkNode | null>(null);
  const onSelect = useCallback((n: NetworkNode | null) => setSelected(n), []);

  return (
    <>
      {/* ---- Hero: futuristic globe ---- */}
      <section className="relative overflow-hidden bg-[#041f31] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[160px]" />
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(29,159,218,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(29,159,218,0.3) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-32 md:px-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:pt-36">
          <div>
            <Reveal immediate>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#1D9FDA]">
                <Globe2 className="h-3.5 w-3.5" /> Global Network
              </span>
              <h1 className="font-display mt-6 text-4xl font-bold leading-[1.1] md:text-6xl">
                Global Healthcare,
                <br />
                <span className="text-gradient">Without Borders.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                Getmeds&apos; network spans continents to close the healthcare gap — sourcing
                internationally recognized medicines and expanding access for the patients and
                partners who depend on us.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#expansion" className="btn-primary">
                  Explore the Journey <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/contact-us"
                  className="btn-ghost !border-white/25 !bg-white/5 !text-white hover:!bg-white/10"
                >
                  Become a Partner
                </Link>
              </div>

              <div className="mt-10 grid max-w-md grid-cols-3 gap-2.5 sm:gap-4">
                {[
                  { k: "10", v: "Global locations" },
                  { k: "4", v: "Regions reached" },
                  { k: "1st", v: "Pacific cancer pharmacy" },
                ].map((s) => (
                  <div key={s.v} className="glass-dark rounded-lg p-3 sm:p-4">
                    <div className="font-display text-2xl font-bold text-[#1D9FDA]">{s.k}</div>
                    <div className="mt-1 text-xs leading-snug text-white/75">{s.v}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Globe + selection card */}
          <div className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-[580px]">
              <Globe selected={selected} onSelect={onSelect} />
            </div>
            <p className="mt-2 text-center text-xs text-white/40">
              Drag to rotate · tap a glowing node to explore
            </p>

            <AnimatePresence>
              {selected && (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-dark absolute bottom-10 left-1/2 w-[92%] max-w-md -translate-x-1/2 rounded-xl p-6"
                >
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Close"
                    className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1D9FDA]">
                    <MapPin className="h-3 w-3" /> {selected.tag}
                  </span>
                  <h3 className="font-display mt-3 text-xl font-bold">{selected.name}</h3>
                  <p className="text-sm font-medium text-primary">{selected.country}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {selected.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ---- Location grid ---- */}
      <section className="relative py-24">
        <div className="aurora" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Where we operate"
            title={<>One mission. <span className="text-gradient">Ten footholds.</span></>}
            text="From our Manila headquarters to the Caribbean and the Pacific — every location exists to put life-saving medicine within reach."
          />
          <Stagger className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {networkNodes.map((n) => (
              <StaggerItem key={n.id}>
                <button
                  onClick={() => {
                    setSelected(n);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`glass group block h-full w-full rounded-xl p-5 text-left md:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-primary/10 ${
                    n.hub ? "ring-2 ring-primary/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary-dark">
                      {n.hub ? "Headquarters" : n.role}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 text-lg font-bold text-primary-deep">
                    {n.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {n.country}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{n.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-dark transition lg:mt-4 lg:opacity-0 lg:group-hover:opacity-100">
                    View on globe <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---- Expansion timeline ---- */}
      <section id="expansion" className="relative py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <SectionHeading
            eyebrow="The expansion journey"
            title={<>From Manila to the world, <span className="text-gradient">one milestone at a time.</span></>}
          />
          <div className="relative">
            <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent md:left-1/2" />
            {networkEras.map((era, ei) => (
              <div key={era.period} className="relative mb-16 last:mb-0">
                <Reveal className="relative z-10 mb-8 flex md:justify-center">
                  <span className="glass ml-12 inline-flex items-center gap-2 rounded-full px-5 py-2 md:ml-0">
                    <span className="pulse-ring relative h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="font-display text-sm font-bold text-primary-deep">
                      {era.period}
                    </span>
                    <span className="hidden text-sm text-ink-soft sm:inline">
                      — {era.headline}
                    </span>
                  </span>
                </Reveal>
                <div className="space-y-8">
                  {era.items.map((item, ii) => {
                    const left = (ei + ii) % 2 === 0;
                    return (
                      <Reveal
                        key={item.title}
                        delay={ii * 0.08}
                        className={`relative md:w-[calc(50%-2.5rem)] ${
                          left ? "md:mr-auto" : "md:ml-auto"
                        } ml-12 md:ml-auto ${left ? "md:ml-0" : ""}`}
                      >
                        <span
                          className={`absolute top-7 hidden h-3 w-3 rounded-full border-2 border-white bg-primary shadow-md shadow-primary/50 md:block ${
                            left ? "-right-[2.95rem]" : "-left-[2.95rem]"
                          }`}
                        />
                        <span className="absolute -left-[2.45rem] top-7 h-3 w-3 rounded-full border-2 border-white bg-primary shadow-md shadow-primary/50 md:hidden" />
                        <div className="glass rounded-xl p-6 transition hover:shadow-lg hover:shadow-primary/10">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                              {item.tag}
                            </span>
                            <span className="text-xs font-semibold text-ink-soft">
                              {item.place}
                            </span>
                          </div>
                          <h3 className="font-display mt-3 text-lg font-bold text-primary-deep">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-10 text-white md:p-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-dark/40 blur-[110px]" />
            <div className="relative max-w-2xl">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Grow beyond borders with Getmeds.
              </h2>
              <p className="mt-4 text-white/70">
                Whether you&apos;re sourcing specialized medicines or expanding healthcare access
                overseas, Getmeds makes it simple, fast, secure, and reliable.
              </p>
              <Link href="/contact-us" className="btn-primary mt-8">
                Start the Conversation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
