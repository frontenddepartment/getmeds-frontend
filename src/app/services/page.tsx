import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Flag, HandHeart, Rocket, Snowflake } from "lucide-react";
import { capabilities, stats } from "@/lib/data";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  alternates: { canonical: "/services" },
  title: "Our Services",
  description:
    "Ten capabilities. Four focus areas. One complete pharmaceutical partner for Filipino patients, doctors, hospitals, pharmacies, and manufacturers.",
};

type Pillar = {
  step: string;
  title: string;
  lines?: [string, string]; // fixed two-line break for the title
  image?: { src: string; alt: string; width: number; height: number };
  compact?: boolean; // tighter capability cards
  stacked?: boolean; // image on the left; heading above the cards on the right
  top?: boolean; // label + title left, chips right, cards in a row underneath (image goes full width below)
  plain?: boolean; // items side by side without card boxes
  chips: string[];
  caps: number[];
  cards?: { icon: string; title: string; text: string }[]; // block-specific cards instead of `caps`
};

/* "The Getmeds Difference" cards (before the closing banner), each with its own brand colour */
const differences = [
  { Icon: Rocket, color: "bg-[#1D9FDA]", title: "First-to-Market Sourcing", text: "We move the moment a patent cliffs globally." },
  { Icon: Snowflake, color: "bg-[#F2B705]", title: "Cold-Chain Excellence", text: "Biologics-ready logistics nationwide." },
  { Icon: Flag, color: "bg-[#E5484D]", title: "Filipino-First Formulations", text: "Engineered for local disease patterns." },
  { Icon: HandHeart, color: "bg-[#61A644]", title: "Patient Assistance Programs", text: "Adherence, access, affordability." },
];

const pillars: Pillar[] = [
  {
    step: "01 · Foundation",
    title: "The global backbone behind every Getmeds medicine.",
    image: { src: "/images/foundation.png", alt: "Getmeds global manufacturing and regulatory foundation", width: 1920, height: 1080 },
    chips: ["50+ manufacturers", "5 international standards", "Full lifecycle regulatory management"],
    caps: [0, 1],
  },
  {
    step: "02 · Reach",
    title: "How our medicines get to every corner of Filipino healthcare.",
    lines: ["How our medicines get to every", "corner of Filipino healthcare."],
    compact: true,
    chips: ["10,000+ pharmacies", "500+ hospitals", "Nationwide reach", "Government bidding expertise"],
    caps: [2, 3, 4],
  },
  {
    step: "03 · Who We Serve",
    title: "The patients, doctors, and hospitals we're built for.",
    top: true,
    chips: ["500+ hospitals", "Filipino oncologists, hematologists, anesthesiologists", "Compassionate access for rare disease patients"],
    caps: [],
    cards: [
      {
        icon: "Hospital",
        title: "Hospital Partnerships & Institutional Supply",
        text: "Trusted by 500+ Filipino hospitals across public and private healthcare — with dedicated account managers, cold-chain oncology handling, and urgent-response supply for ICU and critical care units. Formulary-ready documentation for hospital pharmacy committees and specialty procurement for hard-to-source therapies.",
      },
      {
        icon: "Stethoscope",
        title: "Doctor & Healthcare Professional Support",
        text: "Partnership with Filipino oncologists, hematologists, anesthesiologists, and specialists across the country. Product education, clinical information, and Named-Patient Access Program coordination — because doctors succeed when their prescribed medicines actually reach their patients.",
      },
      {
        icon: "HandHeart",
        title: "Direct-to-Patient Care & Access Programs",
        text: "Prescription order fulfillment, refill support, affordable pricing, and nationwide delivery for Filipino patients. Patient Assistance Programs (PAP), Named-Patient Access Programs (NPAP), and Compassionate Special Permit (CSP) imports ensure continuous access to life-saving medicines — especially for oncology and rare disease treatments.",
      },
    ],
  },
  {
    step: "04 · Programs & Access",
    title: "Specialized services for government and pharmaceutical partners.",
    top: true,
    plain: true,
    image: { src: "/images/ourservicesone.jpg", alt: "Getmeds staff checking a sealed GetMEDS delivery pack against the order log", width: 2000, height: 780 },
    chips: ["DSWD", "PCSO", "OVP & OP accredited", "CLIDP for pharmaceutical partners"],
    caps: [],
    cards: [
      {
        icon: "HandHeart",
        title: "Government Medical Assistance & Program Accreditation",
        text: "Accredited chemotherapy and cancer medicine provider for DSWD, PCSO, Office of the Vice President (OVP), and Office of the President (OP) medical assistance programs. Fast quotations and streamlined guarantee letter processing ensure Filipino patients receive their medicines quickly and without administrative barriers.",
      },
      {
        icon: "FileCheck2",
        title: "Certificate of Listing of Identical Drug Product (CLIDP) Services",
        text: "End-to-end CLIDP application, certification, and ongoing compliance management across our Certificate of Product Registration portfolio. Fast-track processing, low-risk market entry, and flexible minimum order quantities for pharmaceutical partners.",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero, same treatment as Order Medicines on the ourservicesherosection.png wave. xl+: copy sits white on the
          blue at the left, button on the white wave; below xl the copy stacks under the image in navy/black. */}
      <section className="relative bg-white pb-14 xl:pb-0">
        <Image
          src="/images/ourservicesherosection.png"
          alt="Three smiling Getmeds team members in branded black blazers"
          width={5456}
          height={2816}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary xl:text-white xl:drop-shadow">
              Getmeds
            </span>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-white xl:drop-shadow-md">
              Our Services
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              Getmeds connects globally certified pharmaceutical manufacturers with Filipino patients, doctors, and
              hospitals — bridging the gap between world-class treatment and local access.
            </p>
          </Reveal>
        </div>
        {/* same button placement as Order Medicines: xl+ anchored to the section bottom, on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-9 flex flex-wrap items-center gap-4 xl:mt-0">
              <a
                href="#core-competencies"
                className="rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Explore Services
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats: full-width white band, four columns, no box, borders or shadows */}
      <section className="bg-white py-10 md:py-14">
        <Reveal className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 md:grid-cols-4 md:px-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <Counter
                value={s.value}
                suffix={s.suffix}
                className="font-display text-4xl font-semibold text-[#1D9FDA] md:text-5xl"
              />
              <p className="mt-2 text-sm text-black md:text-base">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Pillars */}
      <section id="core-competencies" className="relative scroll-mt-24 bg-white pt-16">
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          {/* title on the left, description on the right */}
          <Reveal className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-semibold text-primary">Corporate Services</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">Our Core Competencies</h2>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-soft md:text-base lg:pb-1">
              Ten capabilities. Four focus areas. One complete pharmaceutical partner for Filipino patients, doctors,
              hospitals, pharmacies, and manufacturers.
            </p>
          </Reveal>
        </div>
        {pillars.map((pillar, pi) => {
          // the second focus area (Reach) sits on a full-width brand-blue band
          const blue = pi === 1;
          const heading = (
              <Reveal className={pillar.stacked ? "" : "lg:sticky lg:top-32 [direction:ltr]"}>
                <span
                  className={`inline-block rounded-full px-4 py-1.5 text-sm font-medium ${
                    blue ? "border border-white/50 bg-white/15 text-white" : "glass-chip text-primary-dark"
                  }`}
                >
                  {pillar.step}
                </span>
                <h3 className={`font-display mt-4 text-2xl font-semibold leading-snug md:text-[2rem] ${blue ? "text-white" : "text-black"}`}>
                  {pillar.lines ? (
                    <>
                      <span className="md:block lg:whitespace-nowrap">{pillar.lines[0]}</span>{" "}
                      <span className="md:block lg:whitespace-nowrap">{pillar.lines[1]}</span>
                    </>
                  ) : (
                    pillar.title
                  )}
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {pillar.chips.map((c) => (
                    <span
                      key={c}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                        blue ? "bg-white/15 text-white" : "bg-primary/10 text-primary-dark"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                {/* side-by-side layout: the image sits under the title and chips */}
                {pillar.image && !pillar.stacked && (
                  <Image
                    src={pillar.image.src}
                    alt={pillar.image.alt}
                    width={pillar.image.width}
                    height={pillar.image.height}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="mt-6 h-auto w-full rounded-2xl object-cover"
                  />
                )}
              </Reveal>
          );
          const cards = (
              <Stagger className={`grid [direction:ltr] ${pillar.compact ? "gap-3" : "gap-4"} ${pillar.stacked ? "mt-8" : ""} ${pillar.top ? (pillar.plain ? "mt-10 md:grid-cols-2 md:gap-12" : "mt-10 md:grid-cols-3") : ""}`}>
                {(pillar.cards ?? pillar.caps.map((ci) => capabilities[ci])).map((c) => {
                  return (
                    <StaggerItem key={c.title}>
                      {/* same card as About Us "Our Commitments": white, gray border, blue circle icon */}
                      {pillar.plain ? (
                        <div className="flex gap-4">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                            <Icon name={c.icon} className="h-5 w-5" />
                          </span>
                          <div>
                            <h4 className="font-display text-lg font-semibold leading-snug text-black">{c.title}</h4>
                            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{c.text}</p>
                          </div>
                        </div>
                      ) : pillar.compact ? (
                        <div className="flex h-full gap-4 rounded-3xl border border-gray-200 bg-white p-4 transition hover:-translate-y-1">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                            <Icon name={c.icon} className="h-[18px] w-[18px]" />
                          </span>
                          <div>
                            <h4 className="font-display font-semibold leading-snug text-black">{c.title}</h4>
                            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{c.text}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                            <Icon name={c.icon} className="h-5 w-5" />
                          </span>
                          <h4 className="font-display mt-4 font-semibold text-black">{c.title}</h4>
                          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.text}</p>
                        </div>
                      )}
                    </StaggerItem>
                  );
                })}
              </Stagger>
          );
          return (
          <div
            key={pillar.step}
            className={blue ? "my-8 bg-[#1D9FDA] py-14 text-white" : pi === 0 ? "pb-8 pt-12" : pi === pillars.length - 1 ? "pb-16 pt-8 md:pb-20" : "py-8"}
          >
            {pillar.top ? (
              <>
              {/* full-bleed photo above the block */}
              {pillar.image && (
                <Reveal className="mb-12">
                  <Image
                    src={pillar.image.src}
                    alt={pillar.image.alt}
                    width={pillar.image.width}
                    height={pillar.image.height}
                    sizes="100vw"
                    className="h-auto w-full"
                  />
                </Reveal>
              )}
              <div className="mx-auto max-w-7xl px-5 md:px-10">
                <Reveal className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
                  <div>
                    <span className="glass-chip inline-block rounded-full px-4 py-1.5 text-sm font-medium text-primary-dark">
                      {pillar.step}
                    </span>
                    <h3 className="font-display mt-4 text-2xl font-semibold leading-snug text-black md:text-[2rem]">
                      {pillar.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end lg:pb-1.5">
                    {pillar.chips.map((c) => (
                      <span key={c} className="rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary-dark">
                        {c}
                      </span>
                    ))}
                  </div>
                </Reveal>
                {cards}
              </div>
              </>
            ) : pillar.stacked ? (
              <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-12">
                {pillar.image && (
                  <Reveal className="lg:sticky lg:top-32">
                    <Image
                      src={pillar.image.src}
                      alt={pillar.image.alt}
                      width={pillar.image.width}
                      height={pillar.image.height}
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="h-auto w-full rounded-2xl object-cover"
                    />
                  </Reveal>
                )}
                <div>
                  {heading}
                  {cards}
                </div>
              </div>
            ) : (
              <div
                className={`mx-auto grid max-w-7xl items-start gap-8 px-5 md:px-10 lg:grid-cols-[1fr_1.5fr] ${
                  pi % 2 ? "lg:[direction:rtl]" : ""
                }`}
              >
                {heading}
                {cards}
              </div>
            )}
          </div>
          );
        })}
      </section>

      {/* The Getmeds Difference: copy on the left, staggered cards on the right */}
      <section className="bg-white pb-16 md:pb-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold text-primary">The Getmeds Difference</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
              Why patients, doctors, and partners trust Getmeds.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft md:text-base">
              Pharmaceutical care built on global standards, patient-first values, and Filipino heart. Every medicine is
              sourced, verified, and delivered with the care your health deserves.
            </p>
            <Link
              href="/about-us"
              className="mt-8 inline-flex items-center rounded-full bg-[#1D9FDA] px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Learn More
            </Link>
          </Reveal>
          <Stagger className="grid gap-3">
            {differences.map(({ Icon: DiffIcon, color, title, text }, i) => (
              <StaggerItem key={title}>
                {/* alternate rows step in slightly for a staggered rhythm */}
                <div
                  className={`flex items-center gap-4 rounded-3xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 md:p-5 ${
                    i % 2 ? "lg:ml-10" : "lg:mr-10"
                  }`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${color}`}>
                    <DiffIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-black md:text-lg">{title}</h3>
                    <p className="mt-0.5 text-sm text-ink-soft md:text-[15px]">{text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA: full-width green band, sitting directly under the photo above and on the footer */}
      <section className="bg-[#61A644] text-white">
        <Reveal className="mx-auto max-w-7xl px-5 py-14 text-center md:px-10 md:py-16">
          <h2 className="font-display text-2xl font-semibold md:text-[2rem]">Ready to experience better healthcare?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/90 md:text-base">
            Join thousands of patients who trust Getmeds for fast, reliable, and expert pharmaceutical services every day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/order-medicines"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#3d7a26] transition hover:bg-white/90"
            >
              Order Medicines
            </Link>
            <Link
              href="/contact-us"
              className="rounded-full border-2 border-white px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
