import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { capabilities, stats } from "@/lib/data";
import { Counter, Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/ui";
import { Icon } from "@/components/icons";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  alternates: { canonical: "/services" },
  title: "Our Services",
  description:
    "Ten capabilities. Four focus areas. One complete pharmaceutical partner for Filipino patients, doctors, hospitals, pharmacies, and manufacturers.",
};

const pillars = [
  {
    step: "01 · Foundation",
    title: "The global backbone behind every Getmeds medicine.",
    chips: ["50+ manufacturers", "5 international standards", "Full lifecycle regulatory management"],
    caps: [0, 1],
  },
  {
    step: "02 · Reach",
    title: "How our medicines get to every corner of Filipino healthcare.",
    chips: ["10,000+ pharmacies", "500+ hospitals", "Nationwide reach", "Government bidding expertise"],
    caps: [2, 3, 4],
  },
  {
    step: "03 · Who We Serve",
    title: "The patients, doctors, and hospitals we're built for.",
    chips: ["Filipino oncologists, hematologists, anesthesiologists", "Compassionate access for rare disease patients"],
    caps: [9, 8],
  },
  {
    step: "04 · Programs & Access",
    title: "Specialized services for government and pharmaceutical partners.",
    chips: ["DSWD", "PCSO", "OVP & OP accredited", "CLIDP for pharmaceutical partners"],
    caps: [5, 6, 7],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={<>One complete <span className="text-gradient">pharmaceutical partner.</span></>}
        text="Getmeds connects globally certified pharmaceutical manufacturers with Filipino patients, doctors, and hospitals — bridging the gap between world-class treatment and local access."
      >
        <Link href="/contact-us" className="btn-primary">
          Contact Us <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/product-range" className="btn-ghost">Our Medicines</Link>
      </PageHero>

      {/* Stats */}
      <section className="pb-6 pt-6 md:pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal>
            <div className="glass grid grid-cols-2 gap-6 rounded-2xl px-8 py-8 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <Counter
                    value={s.value}
                    suffix={s.suffix}
                    className="font-display text-3xl font-bold text-gradient md:text-4xl"
                  />
                  <p className="mt-1.5 text-xs font-medium text-ink-soft md:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative py-16">
        <div className="aurora" />
        <div className="relative mx-auto max-w-7xl space-y-16 px-5 md:px-10">
          <SectionHeading
            eyebrow="Core competencies"
            title={<>Ten capabilities. Four focus areas. <span className="text-gradient">One partner.</span></>}
          />
          {pillars.map((pillar, pi) => (
            <div
              key={pillar.step}
              className={`grid items-start gap-8 lg:grid-cols-[1fr_1.5fr] ${
                pi % 2 ? "lg:[direction:rtl]" : ""
              }`}
            >
              <Reveal className="lg:sticky lg:top-32 [direction:ltr]">
                <span className="glass-chip inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
                  {pillar.step}
                </span>
                <h3 className="font-display mt-4 text-2xl font-bold leading-snug text-primary-deep md:text-3xl">
                  {pillar.title}
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {pillar.chips.map((c) => (
                    <span key={c} className="rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary-dark">
                      {c}
                    </span>
                  ))}
                </div>
              </Reveal>
              <Stagger className="grid gap-4 [direction:ltr]">
                {pillar.caps.map((ci) => {
                  const c = capabilities[ci];
                  return (
                    <StaggerItem key={c.title}>
                      <div className="glass group flex gap-5 rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-dark transition group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-dark group-hover:text-white">
                          <Icon name={c.icon} className="h-5 w-5" />
                        </span>
                        <div>
                          <h4 className="font-display font-bold text-primary-deep">{c.title}</h4>
                          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{c.text}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-10 text-center text-white md:p-16">
            <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[110px]" />
            <h2 className="font-display relative text-3xl font-bold md:text-4xl">
              Ready to experience better healthcare?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/70">
              Join thousands of patients who trust Getmeds for fast, reliable, and expert
              pharmaceutical services every day.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/order-medicines" className="btn-primary">
                Order Medicines <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact-us"
                className="btn-ghost !border-white/25 !bg-white/5 !text-white hover:!bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
