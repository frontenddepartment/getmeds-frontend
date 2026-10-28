import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gavel, Leaf, Scale, Users } from "lucide-react";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/ui";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  alternates: { canonical: "/ungc" },
  title: "UN Global Compact",
  description:
    "Getmeds Philippines is a UN Global Compact member — driving meaningful impact through responsible healthcare, compassion, and sustainable action.",
};

const principleGroups = [
  {
    Icon: Scale,
    title: "Human Rights",
    items: [
      "Principle 1: Businesses should support and respect the protection of internationally proclaimed human rights.",
      "Principle 2: Make sure that they are not complicit in human rights abuses.",
    ],
  },
  {
    Icon: Users,
    title: "Labor",
    items: [
      "Principle 3: Uphold the freedom of association and the effective recognition of the right to collective bargaining.",
      "Principle 4: The elimination of all forms of forced and compulsory labor.",
      "Principle 5: The effective abolition of child labor.",
      "Principle 6: The elimination of discrimination in respect of employment and occupation.",
    ],
  },
  {
    Icon: Leaf,
    title: "Environment",
    items: [
      "Principle 7: Support a precautionary approach to environmental challenges.",
      "Principle 8: Undertake initiatives to promote greater environmental responsibility.",
      "Principle 9: Encourage the development and diffusion of environmentally friendly technologies.",
    ],
  },
  {
    Icon: Gavel,
    title: "Anti-Corruption",
    items: [
      "Principle 10: Businesses should work against corruption in all its forms, including extortion and bribery.",
    ],
  },
];

const sdgs = [
  "No Poverty", "Zero Hunger", "Good Health and Well-Being", "Quality Education",
  "Gender Equality", "Clean Water and Sanitation", "Affordable and Clean Energy",
  "Decent Work and Economic Growth", "Industry, Innovation, and Infrastructure",
  "Reduced Inequality", "Sustainable Cities and Communities",
  "Responsible Consumption and Production", "Climate Action", "Life Below Water",
  "Life on Land", "Peace, Justice, and Strong Institutions", "Partnerships for the Goals",
];

export default function UngcPage() {
  return (
    <>
      <PageHero
        eyebrow="United Nations Global Compact"
        title={<>Responsible healthcare. <span className="text-gradient">Sustainable action.</span></>}
        text="At Getmeds Philippines, we do more than provide medicines — we drive meaningful impact through responsible healthcare, compassion, and sustainable action."
      >
        <a
          href="https://unglobalcompact.org"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Learn About UNGC <ArrowRight className="h-4 w-4" />
        </a>
      </PageHero>

      {/* What is UNGC */}
      <section className="pb-6">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <Reveal>
            <div className="glass rounded-2xl p-8 text-center md:p-10">
              <h2 className="font-display text-2xl font-bold text-primary-deep">What is UNGC?</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                The United Nations Global Compact is the world&apos;s largest corporate
                sustainability initiative. It encourages companies to adopt responsible, ethical,
                and sustainable business practices that create positive impact for people,
                communities, and the planet.
              </p>
              <p className="mt-4 text-sm font-semibold text-primary-dark">
                Getmeds Philippines is only the second pharmaceutical company of its kind in the
                Philippines to join.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Ten principles */}
      <section className="relative py-16">
        <div className="aurora" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="The Ten Principles"
            title={<>Principles that guide <span className="text-gradient">every decision.</span></>}
          />
          <Stagger className="grid gap-4 md:grid-cols-2">
            {principleGroups.map(({ Icon, title, items }) => (
              <StaggerItem key={title}>
                <div className="glass h-full rounded-xl p-7">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-primary-deep">{title}</h3>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {items.map((p) => (
                      <li key={p} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-6 text-center text-xs text-ink-soft">
            The Ten Principles listed above are based on and sourced from the official UN Global
            Compact website.
          </p>
        </div>
      </section>

      {/* SDGs */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Sustainable Development Goals"
            title={<>Supporting all <span className="text-gradient">17 SDGs.</span></>}
            text="A global call to end poverty, protect the planet, and ensure prosperity for all."
          />
          <Stagger className="flex flex-wrap justify-center gap-3">
            {sdgs.map((g, i) => (
              <StaggerItem key={g}>
                <span className="glass-chip flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-primary-deep transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/20">
                  <span className="font-display flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  {g}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Commitment */}
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-10 text-white md:p-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
            <div className="relative max-w-3xl">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Setting new standards in the healthcare industry.
              </h2>
              <p className="mt-5 leading-relaxed text-white/70">
                By aligning with UNGC, Getmeds integrates these principles and goals into our
                operations — a commitment to ethical business practices, sustainable growth, and
                social responsibility. Every step we take in business aligns with global efforts
                for a healthier, fairer, and more sustainable world.
              </p>
              <Link href="/csr" className="btn-primary mt-8">
                See Our CSR Work <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
