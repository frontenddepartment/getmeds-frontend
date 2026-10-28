import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Award, Briefcase, Car, Globe2, GraduationCap, HeartPulse,
  Plane, Rocket, Sparkles, TrendingUp, Trophy, Users,
} from "lucide-react";
import { contact } from "@/lib/data";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/ui";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  alternates: { canonical: "/careers" },
  title: "Careers",
  description:
    "Join the minds behind the medicine. Build a career with global impact in the healthcare industry.",
};

const perks = [
  { Icon: Briefcase, title: "Major Portfolio", text: "One of the largest Hematology & Oncology portfolios in the Philippines." },
  { Icon: Sparkles, title: "Exclusive Products", text: "Exclusive CSP products available to Filipino patients." },
  { Icon: GraduationCap, title: "Structured Path", text: "Structured career development path within your first 6 months." },
  { Icon: TrendingUp, title: "Fast Promotion", text: "Fast-track promotions & annual salary increments for high performers." },
  { Icon: Trophy, title: "Top Compensation", text: "Competitive package with attractive monthly incentives." },
  { Icon: Car, title: "Company Car", text: "Free company car program — vehicle ownership under the employee's name." },
  { Icon: Plane, title: "Travel Incentives", text: "All-expense-paid international travel incentives after 2 years of service." },
  { Icon: HeartPulse, title: "Wellness Focus", text: "Employee wellness & meditation programs to support mental health." },
  { Icon: Award, title: "Recognition", text: "Recognition, awards, and employee engagement initiatives year-round." },
  { Icon: Rocket, title: "Growth Environment", text: "Dynamic, high-performing, and growth-oriented work environment." },
];

const culture = [
  { title: "Innovate Healthcare", text: "Your career has no boundaries at Getmeds. Leverage our global footprint to build a fulfilling legacy in an environment that rewards merit and thrives on lifelong learning." },
  { title: "Empower Yourself", text: "Break boundaries, not just ground. Look beyond your role and lead with thoughtful, decisive action — your fresh perspectives fuel our next breakthrough." },
  { title: "Grow With Us", text: "Success is a team sport. We've built a culture of radical transparency and professional support, ensuring a team stands behind you — no matter the challenge." },
];

const conventions = {
  local: [
    "Philippine Society of Medical Oncology",
    "Philippine Society of Hematology and Blood Transfusion",
    "ASEAN Congress of Anesthesiologists",
    "Philippine Society of Anesthesiologists Annual Convention",
    "Society of Gynecologic Oncologists of the Philippines (SGOP)",
    "Philippine College of Radiology Annual Convention",
  ],
  international: [
    "CPHI Southeast Asia · Korea · Japan · America · India · Europe · China",
    "IPHEX — International Pharmaceutical Exhibition",
  ],
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={<>Join the minds <span className="text-gradient">behind the medicine.</span></>}
        text="Join our mission to make healthcare accessible worldwide. We're looking for passionate individuals to innovate and grow with us."
      >
        <a href={`mailto:${contact.hrEmails[0]}`} className="btn-primary">
          Apply Now <ArrowRight className="h-4 w-4" />
        </a>
        <a href={`tel:${contact.hrPhone.replace(/\s/g, "")}`} className="btn-ghost">
          HR: {contact.hrPhone}
        </a>
      </PageHero>

      {/* Perks */}
      <section className="relative py-16">
        <div className="aurora" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Career advantages"
            title={<>Why professionals <span className="text-gradient">choose Getmeds.</span></>}
            text="More than a job — a path to excellence, innovation, and global impact in the healthcare industry."
          />
          <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {perks.map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="glass group h-full rounded-xl p-4 transition hover:-translate-y-1 sm:p-5 hover:shadow-lg hover:shadow-primary/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-dark transition group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-dark group-hover:text-white">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="font-display mt-3 text-sm font-bold text-primary-deep">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Culture */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-8 text-white md:p-14">
            <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
            <Reveal>
              <span className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#1D9FDA]">
                Our culture
              </span>
              <h2 className="font-display relative mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
                Great work doesn&apos;t fade into the background here.
              </h2>
            </Reveal>
            <Stagger className="relative mt-10 grid gap-4 md:grid-cols-3">
              {culture.map((c) => (
                <StaggerItem key={c.title}>
                  <div className="glass-dark h-full rounded-xl p-6">
                    <Users className="h-6 w-6 text-[#1D9FDA]" />
                    <h3 className="font-display mt-3 font-bold">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{c.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Conventions */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="Industry engagement"
            title={<>Conventions we&apos;ve <span className="text-gradient">been part of.</span></>}
            text="Our team regularly represents Getmeds at leading local and international medical conventions, building partnerships that expand access to care."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="glass h-full rounded-xl p-7">
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-dark">
                  Local
                </span>
                <ul className="mt-5 space-y-3">
                  {conventions.local.map((c) => (
                    <li key={c} className="flex gap-3 text-sm text-ink-soft">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="glass h-full rounded-xl p-7">
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-dark">
                  International
                </span>
                <ul className="mt-5 space-y-3">
                  {conventions.international.map((c) => (
                    <li key={c} className="flex gap-3 text-sm text-ink-soft">
                      <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {c}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-lg bg-primary/8 p-5">
                  <h4 className="font-display text-sm font-bold text-primary-deep">
                    Pharmaceutical Internship Program
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                    Step into a journey where your work touches real lives. Guided by experienced
                    pharmacists across regulatory affairs, business development, and community
                    pharmacy — hands-on healthcare experience that goes far beyond theory.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <div className="glass rounded-2xl p-10 text-center md:p-14">
            <p className="font-display text-lg italic text-ink-soft">
              &ldquo;Join a culture where your growth is measured by the lives we touch.&rdquo;
            </p>
            <p className="mt-2 text-sm font-bold text-primary-dark">
              — Naresh Bishnoi, Founder, Getmeds Philippines Inc.
            </p>
            <h2 className="font-display mt-8 text-3xl font-bold text-primary-deep md:text-4xl">
              Ready to lead <span className="text-gradient">the future of medicine?</span>
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href={`mailto:${contact.hrEmails[0]}`} className="btn-primary">
                Send Your Resume <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/contact-us" className="btn-ghost">Talk to HR</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
