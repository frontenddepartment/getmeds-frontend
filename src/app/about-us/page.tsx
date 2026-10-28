import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Award, BadgeCheck, Building, Compass, Eye, Globe2, HandHeart,
  HeartPulse, Lightbulb, ShieldCheck, Target, Users,
} from "lucide-react";
import { leaders } from "@/lib/data";
import { Reveal, SectionHeading, Stagger, StaggerItem, TiltCard } from "@/components/ui";
import PageHero from "@/components/PageHero";
import { IlloTeam } from "@/components/Illustrations";

export const metadata: Metadata = {
  alternates: { canonical: "/about-us" },
  title: "About Us",
  description:
    "Getmeds is a global pharmaceutical company based in the Philippines with a portfolio spanning Oncology, Hematology, Anesthesiology, and Rare Diseases.",
};

const highlights = [
  { Icon: ShieldCheck, title: "FDA Philippines Licensed Distributor", text: "Licensed for pharmaceutical importation, wholesale, and distribution." },
  { Icon: Globe2, title: "UN Global Compact Member & SDG Driver", text: "Aligned with the UN's ten principles and actively contributing to the Sustainable Development Goals." },
  { Icon: BadgeCheck, title: "WHO GSDP Compliant", text: "Operating to World Health Organization standards for pharmaceutical storage, handling, and distribution." },
  { Icon: Award, title: "PDEA Licensed (S-4 & S-5)", text: "Licensed for the handling and distribution of dangerous drugs and controlled precursor chemicals." },
  { Icon: Building, title: "BOC & EDPMS Compliant", text: "Fully compliant with Bureau of Customs and DOH Electronic Drug Price Monitoring requirements." },
  { Icon: HandHeart, title: "PCO Accredited", text: "Pollution Control Officer accredited under DENR Environmental Management Bureau standards." },
];

const commitments = [
  { Icon: Users, title: "Collaboration and Excellence", text: "Fostering collaborations with leading medical professionals, researchers, and partners to accelerate breakthroughs and reshape the future of healthcare." },
  { Icon: HeartPulse, title: "Compassion & Integrity", text: "Built on compassion for patients and their families — unwavering in integrity and transparency, always doing what is right." },
  { Icon: Lightbulb, title: "Pioneering Medicine Solutions", text: "Delivering medicine solutions that address the unmet needs of patients worldwide, exploring novel therapies for challenging conditions." },
  { Icon: Globe2, title: "Global Accessibility", text: "Healthcare knows no boundaries. A seamless global presence ensures the needs of patients are met without delay." },
  { Icon: HandHeart, title: "Empowering Patients", text: "Accessible connection to life-saving medicines, cutting-edge treatments, and vital healthcare resources." },
  { Icon: Compass, title: "Advancing Healthcare E-Commerce", text: "A state-of-the-art platform that redefines accessibility — patients and providers can access medications regardless of geography." },
];

const values = [
  "Compassion", "Integrity", "Precision", "Innovation", "Security", "Speed", "Expertise",
  "Global", "Safety", "Care", "Affordable", "Reliable", "Community", "Excellence",
];

const advantages = [
  { title: "Globally Sourced Quality", text: "Verified under FDA Philippines and international quality standards." },
  { title: "Hard-to-Find Access", text: "Compassionate Special Permit imports and rare disease therapies unavailable elsewhere." },
  { title: "Nationwide Logistics", text: "Reliable cold-chain delivery across Luzon, Visayas, and Mindanao." },
  { title: "Sustainable Pricing", text: "Rapid-response sourcing and fair pricing for the patients and partners we serve." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Getmeds"
        title={<>Your Compassionate <span className="text-gradient">Health Ally.</span></>}
        text="A new standard of care for a new generation of patients. Advanced science. Trusted medicine. Closer access. Better outcomes. Greater hope."
      >
        <Link href="/contact-us" className="btn-primary">
          Contact Us <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/careers" className="btn-ghost">Explore Careers</Link>
      </PageHero>

      {/* Story */}
      <section className="py-14">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 md:px-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="glass rounded-2xl p-8 md:p-10">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Our story
              </span>
              <h2 className="font-display mt-3 text-2xl font-bold text-primary-deep md:text-3xl">
                Driven by innovation, science, and deep compassion.
              </h2>
              <p className="mt-5 leading-relaxed text-ink-soft">
                Getmeds, established in 2020, is a global pharmaceutical company based in the
                Philippines with a diverse portfolio spanning Oncology, Hematology, Anesthesiology,
                and Rare Diseases. It is driven by innovation, science, and a deep commitment to
                improving access and affordability of life-changing therapies for Filipino patients
                and healthcare partners.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                At its core, Getmeds is guided by compassion — ensuring that every medicine
                delivered reflects care, dignity, and hope for patients and families in need. With
                continuing expansion across the Asia-Pacific region and beyond, Getmeds is poised to
                create an even greater impact on global healthcare.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {values.map((v) => (
                  <span key={v} className="glass-chip rounded-full px-3.5 py-1.5 text-xs font-semibold text-primary-dark">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4">
            <Reveal delay={0.1}>
              <TiltCard className="glass rounded-xl p-7">
                <div className="tilt-raise">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
                    <Target className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-bold text-primary-deep">Mission</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    To transform the landscape of oncological, hematological, critical care, rare
                    medicine and healthcare e-commerce through relentless innovation, compassionate
                    service, and international collaboration.
                  </p>
                </div>
              </TiltCard>
            </Reveal>
            <Reveal delay={0.2}>
              <TiltCard className="glass rounded-xl p-7">
                <div className="tilt-raise">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
                    <Eye className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-bold text-primary-deep">Vision</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    To be the global beacon of hope and innovation — a world where every patient has
                    access from first-line treatments to the most advanced medicines, where borders
                    do not limit healthcare.
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="relative py-20">
        <div className="aurora" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Highlights"
            title={<>Licensed, accredited, <span className="text-gradient">and verified.</span></>}
          />
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {highlights.map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="glass h-full rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-bold text-primary-deep">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Our commitments"
            title={<>Enhancing patient connectivity <span className="text-gradient">and clinical reach.</span></>}
            text="With relentless dedication to innovation, empathy, and accessible global healthcare solutions."
          />
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commitments.map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="glass group h-full rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary-dark transition group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-dark group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-bold text-primary-deep">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-8 text-white md:p-14">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
            <Reveal>
              <h2 className="font-display relative max-w-xl text-3xl font-bold md:text-4xl">
                Why choose Getmeds?
              </h2>
            </Reveal>
            <Stagger className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {advantages.map((a, i) => (
                <StaggerItem key={a.title}>
                  <div className="glass-dark h-full rounded-xl p-6">
                    <span className="font-display text-sm font-bold text-[#1D9FDA]">0{i + 1}</span>
                    <h3 className="font-display mt-2 font-bold">{a.title}</h3>
                    <p className="mt-2 text-sm text-white/65">{a.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Leaders */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Our leaders"
            title={<>The people <span className="text-gradient">behind Getmeds.</span></>}
            text="Decades of combined expertise across pharmaceutical operations, business development, in-licensing, regulatory affairs, finance, and supply chain."
          />
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {leaders.map((l) => (
              <StaggerItem key={l.name}>
                <div className="glass group h-full rounded-xl p-5 text-center transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <div className="font-display mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-md shadow-primary/20">
                    {l.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <h3 className="font-display mt-3 text-sm font-bold text-primary-deep">{l.name}</h3>
                  <p className="mt-1 text-xs text-ink-soft">{l.role}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <div className="glass rounded-2xl p-10 text-center md:p-14">
            <IlloTeam className="mx-auto -mt-2 mb-6 w-full max-w-sm" />
            <h2 className="font-display text-3xl font-bold text-primary-deep md:text-4xl">
              Every patient. Every doctor. <span className="text-gradient">Every partner.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-soft">
              Whether you&apos;re seeking medicine, sourcing therapies, exploring partnerships, or
              joining our team — one message reaches the right hands.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/contact-us" className="btn-primary">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/global-network" className="btn-ghost">Our Global Network</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
