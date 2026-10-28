import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HandHeart, HeartPulse, Quote, Ribbon, Users } from "lucide-react";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/ui";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  alternates: { canonical: "/csr" },
  title: "Corporate Social Responsibility",
  description:
    "We don't just distribute medicine; we facilitate healing. Through NGO partnerships and digital health advocacy, no patient navigates their journey alone.",
};

const partners = [
  { Icon: Ribbon, tag: "Health Promotion", title: "Pink Run — Breast Cancer Awareness", text: "The Pink Run is dedicated to promoting breast cancer awareness. Getmeds is the official health partner championing early detection and survivor support." },
  { Icon: HeartPulse, tag: "Foundation Partnership", title: "EPCALM Adult Leukemia Foundation", text: "Getmeds partners with EPCALM to provide free treatment access and continuous support for adult leukemia patients and their families." },
  { Icon: HandHeart, tag: "Foundation Partnership", title: "Imelda Papin Foundation", text: "Getmeds partners with the Imelda Papin Foundation to provide cancer patients access to essential medicines and continued support throughout their treatment journey." },
  { Icon: Users, tag: "Community", title: "Bahay Aruga & The Beautiful One DHE", text: "Multi-sector collaboration with oncology doctors, institutions, and organizations — including Bahay Aruga and The Beautiful One DHE Breast Cancer Warriors." },
];

export default function CsrPage() {
  return (
    <>
      <PageHero
        eyebrow="Corporate Social Responsibility"
        title={<>We don&apos;t just distribute medicine — <span className="text-gradient">we facilitate healing.</span></>}
        text="Through NGO partnerships and digital health advocacy, we ensure no patient navigates their journey alone."
      >
        <Link href="/patient-assistance-program" className="btn-primary">
          Patient Assistance Program <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHero>

      {/* Compassionate access */}
      <section className="py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-10 lg:grid-cols-2">
          <Reveal>
            <div className="glass rounded-2xl p-8 md:p-10">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                What we do
              </span>
              <h2 className="font-display mt-3 text-2xl font-bold text-primary-deep md:text-3xl">
                Compassionate Access
              </h2>
              <p className="mt-5 leading-relaxed text-ink-soft">
                Thousands of Filipino cancer patients have received free cancer treatments through
                Getmeds — directly and through multi-sector collaboration with oncology doctors,
                institutions, and organizations.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Patient access has expanded further through our official accreditation with
                government agencies — the DSWD (AICS), the PCSO Medical Assistance Programs, the
                Office of the Vice President, and the Office of the President — ensuring continued
                care for financially challenged patients.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-8 text-white md:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
              <Quote className="relative h-10 w-10 text-primary" />
              <p className="font-display relative mt-5 text-lg font-medium leading-relaxed">
                &ldquo;Since 2019, my son has been fighting his cancer. This is more than just a
                blessing. It&apos;s a big help to us, because if we had to buy it ourselves, we
                simply couldn&apos;t afford it. Because of Getmeds, he has a chance to live longer
                and continue his life.&rdquo;
              </p>
              <p className="relative mt-5 text-sm font-semibold text-[#1D9FDA]">
                Mother of a Chronic Myeloid Leukemia Patient
              </p>
              <p className="relative text-xs text-white/55">EPCALM Beneficiary · Faces of Hope</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Partnerships */}
      <section className="relative py-16">
        <div className="aurora" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Partnerships & events"
            title={<>Healing is a <span className="text-gradient">team effort.</span></>}
          />
          <Stagger className="grid gap-4 md:grid-cols-2">
            {partners.map(({ Icon, tag, title, text }) => (
              <StaggerItem key={title}>
                <div className="glass group h-full rounded-xl p-7 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-dark transition group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-dark group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 text-lg font-bold text-primary-deep">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Commitment CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <div className="glass rounded-2xl p-10 text-center md:p-14">
            <h2 className="font-display text-3xl font-bold text-primary-deep md:text-4xl">
              Our <span className="text-gradient">commitment.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-soft">
              We remain committed to extending our reach beyond boundaries — bringing accessible
              cancer care to every Filipino patient in need and inspiring a future where hope and
              healing know no limits.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/patient-assistance-program" className="btn-primary">
                Get Assistance <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact-us" className="btn-ghost">Partner With Us</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
