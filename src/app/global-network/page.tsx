"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { HeartPulse, MapPin, X } from "lucide-react";
import { type NetworkNode } from "@/lib/data";
import { Reveal } from "@/components/ui";
import CountryFlag, { type FlagCode } from "@/components/CountryFlag";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

/* Regional expansion cards (blue band under "Where we operate") */
const regional: { code: FlagCode; tag: string; title: string; sub?: string; text: string }[] = [
  { code: "sg", tag: "Global Hub", title: "Singapore", sub: "Getmeds HealthTech Pte. Ltd.", text: "Extending global reach and creating new opportunities for international expansion across Asia and beyond." },
  { code: "pk", tag: "Strategic Office", title: "Pakistan", sub: "Trusted partnership", text: "Opened an office with a trusted healthcare provider — supplying essential medicines and expanding healthcare access and industry networks." },
  { code: "vn", tag: "SE Asia", title: "Vietnam", text: "Building market presence and expanding access to quality medicines across the country." },
  { code: "kh", tag: "SE Asia", title: "Cambodia", text: "Driving strategic initiatives to advance healthcare services and strengthen regional collaboration." },
  { code: "la", tag: "SE Asia", title: "Laos", text: "Spearheading programs to enhance healthcare delivery and foster long-term partnerships." },
  { code: "mm", tag: "SE Asia", title: "Myanmar", text: "Pioneering operations to accelerate healthcare development and operational excellence." },
];

/* "A Global Vision Takes Shape" cards (white band after the regional expansion) */
const globalVision: { code?: FlagCode; tag: string; title: string; sub?: string; text: string }[] = [
  { code: "kn", tag: "Caribbean Entry", title: "Saint Kitts and Nevis", sub: "Officially registered", text: "Strengthening global presence and paving the way for further international growth in the Caribbean and beyond." },
  { code: "vu", tag: "Pacific Partnership", title: "Vanuatu", sub: "Government collaboration", text: "Collaborated with the government to enhance medical support, introduce cancer awareness initiatives, and bring life-saving healthcare solutions to the Pacific community." },
  { tag: "A Healthcare First", title: "First specialty cancer pharmacy in the Pacific", text: "Opened the Pacific's first specialty pharmacy dedicated to cancer medicines — providing localized access to life-saving treatments for patients in Vanuatu, Fiji, and across the Pacific region." },
];

export default function GlobalNetworkPage() {
  const [selected, setSelected] = useState<NetworkNode | null>(null);
  const onSelect = useCallback((n: NetworkNode | null) => setSelected(n), []);

  return (
    <>
      {/* ---- Hero: same treatment as Order Medicines on the backgroundnocontent.png wave. xl+: copy white on
              the blue at the left, rotating globe on the right; below xl the copy and globe stack under it. ---- */}
      <section className="relative overflow-hidden bg-white pb-12 xl:pb-0">
        <Image
          src="/images/backgroundnocontent.png"
          alt=""
          width={5456}
          height={2816}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate className="xl:max-w-[44%]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary xl:text-white xl:drop-shadow">
              Global Presence
            </span>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-white xl:drop-shadow-md">
              <span className="md:block md:whitespace-nowrap">Global Healthcare</span>{" "}
              <span className="text-primary md:block md:whitespace-nowrap xl:text-white">Without Borders</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              Getmeds global network spans continents to close the healthcare gap — sourcing internationally
              recognized medicines and expanding access for the patients and partners who depend on us.
            </p>
          </Reveal>
        </div>
        {/* same button placement as Order Medicines: xl+ anchored to the section bottom, on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-9 flex flex-wrap items-center gap-4 xl:mt-0">
              <a
                href="#where-we-operate"
                className="rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Explore Now
              </a>
            </div>
          </Reveal>
        </div>

        {/* Rotating globe + selection card: over the blue on the right at xl+ (sized and placed in % of the
            image so it always stays inside the blue, above the wave), below the copy otherwise */}
        <div className="relative mx-auto mt-10 w-full max-w-[520px] px-5 xl:absolute xl:right-[9%] xl:top-[16.5%] xl:mt-0 xl:w-[38vw] xl:max-w-none xl:px-0">
          <div className="relative aspect-square w-full">
            <Globe selected={selected} onSelect={onSelect} />
          </div>
          <p className="mt-2 text-center text-xs text-ink-soft xl:hidden">Drag to rotate · tap a glowing node to explore</p>

          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="glass-dark absolute bottom-6 left-1/2 w-[92%] max-w-md -translate-x-1/2 rounded-xl p-6 text-white"
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
                <p className="mt-3 text-sm leading-relaxed text-white/70">{selected.description}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ---- Location grid ---- */}
      <section id="where-we-operate" className="relative scroll-mt-24 bg-white pb-14 pt-4 md:pb-16 md:pt-6">
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          {/* same heading style as About Us "Our Advantages": label + title left, subtext right */}
          <Reveal className="mb-10 grid gap-4 md:mb-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-semibold text-primary">Where we operate</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">One mission. Ten footholds.</h2>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-soft md:text-base lg:pb-1">
              From our Manila headquarters to the Caribbean and the Pacific — every location exists to put life-saving
              medicine within reach.
            </p>
          </Reveal>
          {/* The Foundation: title on the left, three equal cards in one row on the right */}
          <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
            <Reveal>
              <p className="text-sm font-semibold text-primary">The Foundation</p>
              <h3 className="font-display mt-1 text-xl font-semibold text-black md:text-2xl">
                Innovation meets pharmaceutical care
              </h3>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  code: "ph" as const,
                  tone: "blue" as const,
                  tag: "Industry First",
                  title: "Launch of the Getmeds Digital Platform",
                  sub: "Philippines",
                  text: "Pioneered the Philippines' first fully digital oncology care platform — featuring an innovative e-commerce platform and mobile app that brought specialty care closer to patients.",
                },
                {
                  code: "in" as const,
                  tone: "white" as const,
                  tag: "Export Hub",
                  title: "India",
                  sub: "Getmeds Healthcare (India)",
                  text: "Expanding the international footprint as a trusted pharmaceutical exporter and supplier in India.",
                },
                {
                  code: "ph" as const,
                  tone: "green" as const,
                  tag: "Pharma Launch",
                  title: "Philippines",
                  sub: "Getmeds Philippines Incorporated",
                  text: "Redefining the Philippine healthcare landscape with high-quality, affordable generic medicines accessible to every Filipino.",
                },
              ].map((c, i) => (
                <Reveal key={c.tag} delay={i * 0.06}>
                  {/* the two Philippine cards are filled (blue left, green right); India stays white */}
                  <div
                    className={`h-full rounded-3xl p-6 ${
                      c.tone === "white" ? "border border-gray-200 bg-white" : c.tone === "blue" ? "bg-[#1D9FDA] text-white" : "bg-[#61A644] text-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <CountryFlag code={c.code} className={`h-11 w-11 shrink-0 ${c.tone === "white" ? "" : "ring-2 ring-white/70"}`} />
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          c.tone === "white" ? "bg-primary/10 text-primary-dark" : "border border-white/50 bg-white/15 text-white"
                        }`}
                      >
                        {c.tag}
                      </span>
                    </div>
                    <h4 className={`font-display mt-5 text-lg font-semibold leading-snug ${c.tone === "white" ? "text-black" : ""}`}>{c.title}</h4>
                    <p className={`text-sm ${c.tone === "white" ? "text-ink-soft" : "text-white/85"}`}>{c.sub}</p>
                    <p className={`mt-3 text-[15px] leading-relaxed ${c.tone === "white" ? "text-ink-soft" : "text-white/90"}`}>{c.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Regional expansion: full-width globe-and-sky photo (globebg.png). Title on top, the six items
              spread across the full width with no boxes, white on a soft blue shade so they read over the sky. ---- */}
      <section className="relative overflow-hidden bg-[#1D9FDA] py-16 text-white md:py-20">
        <Image src="/images/globebg.png" alt="" fill sizes="100vw" className="object-cover object-bottom" />
        <div aria-hidden className="absolute inset-0 bg-[#0B5E8A]/45" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <Reveal>
            <p className="text-sm font-semibold text-white/90 drop-shadow">Regional Expansion Across Asia-Pacific</p>
            <h3 className="font-display mt-1 text-2xl font-semibold drop-shadow md:text-[2rem]">Strengthening reach and partnerships</h3>
          </Reveal>
          <div className="mt-10 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-16">
            {regional.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 0.06}>
                <div className="flex items-center gap-3">
                  <CountryFlag code={c.code} className="h-12 w-12 shrink-0 ring-2 ring-white/70" />
                  <span className="rounded-full border border-white/50 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {c.tag}
                  </span>
                </div>
                <h4 className="font-display mt-4 text-xl font-semibold drop-shadow">{c.title}</h4>
                {c.sub && <p className="text-sm text-white/85 drop-shadow">{c.sub}</p>}
                <p className="mt-3 text-[15px] leading-relaxed text-white/90 drop-shadow md:text-base">{c.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- A Global Vision: white band, title left, three cards right (same layout as The Foundation) ---- */}
      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 md:px-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
          <Reveal>
            <p className="text-sm font-semibold text-primary">A Global Vision Takes Shape</p>
            <h3 className="font-display mt-1 text-xl font-semibold text-black md:text-2xl">
              Reaching the Caribbean and the Pacific
            </h3>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {globalVision.map((c, i) => (
              <Reveal key={c.tag} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-gray-200 bg-white p-6">
                  <div className="flex items-start justify-between gap-3">
                    {c.code ? (
                      <CountryFlag code={c.code} className="h-11 w-11 shrink-0" />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                        <HeartPulse className="h-5 w-5" />
                      </span>
                    )}
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">{c.tag}</span>
                  </div>
                  <h4 className="font-display mt-5 text-lg font-semibold leading-snug text-black">{c.title}</h4>
                  {c.sub && <p className="text-sm text-ink-soft">{c.sub}</p>}
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA: full-width blue band sitting directly on the footer, with the globe photo half over its top
              edge (inside a solid white ring), title on the left, text + button on the right, and a thin
              blue-to-green line along the bottom edge ---- */}
      <section className="pt-32 md:pt-36">
        <div className="relative bg-[#1D9FDA] text-white">
          {/* solid white ring around the planet (no glow or shadow) */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white md:h-56 md:w-56 lg:h-[17.5rem] lg:w-[17.5rem]"
          />
          <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full md:h-48 md:w-48 lg:h-60 lg:w-60">
            <Image src="/images/globe.jpg" alt="Planet Earth" fill sizes="240px" className="scale-[1.12] object-cover" />
          </div>

          <Reveal className="relative mx-auto max-w-7xl px-5 pb-12 pt-32 md:grid md:grid-cols-[minmax(0,1fr)_17rem_minmax(0,1fr)] md:items-center md:gap-6 md:px-10 md:py-16 lg:grid-cols-[minmax(0,1fr)_21rem_minmax(0,1fr)]">
            <h2 className="font-display text-3xl font-semibold leading-tight md:text-[2.3rem] lg:text-[2.6rem]">
              Grow beyond
              <br />
              borders with
              <br />
              <span className="text-[#0B2E5E]">Getmeds</span>
            </h2>
            <div aria-hidden className="hidden md:block" />
            <div className="mt-6 md:mt-0">
              <p className="text-[15px] leading-relaxed text-white/95 md:text-base">
                Whether you&apos;re sourcing specialized medicines or expanding healthcare access overseas, Getmeds
                makes it simple, fast, secure, and reliable.
              </p>
              <Link
                href="/about-us"
                className="mt-6 inline-flex items-center rounded-full bg-[#1E293B] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
              >
                Learn More
              </Link>
            </div>
          </Reveal>

          {/* bottom edge: thin gradient line, brand blue on the left to brand green on the right */}
          <div aria-hidden className="h-1.5 w-full bg-gradient-to-r from-[#1D9FDA] to-[#61A644]" />
        </div>
      </section>
    </>
  );
}
