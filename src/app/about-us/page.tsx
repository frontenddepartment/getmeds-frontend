import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck, Check, Compass, Eye, Globe2, HandHeart,
  HandCoins, HeartPulse, Lightbulb, PackageSearch, Target, Truck, Users,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui";
import IsoFocus from "@/components/IsoFocus";
import DedicatedPills from "@/components/DedicatedPills";
import DepthStack from "@/components/DepthStack";
import CoreValues from "@/components/CoreValues";

export const metadata: Metadata = {
  alternates: { canonical: "/about-us" },
  title: "About Us",
  description:
    "Getmeds is a global pharmaceutical company based in the Philippines with a portfolio spanning Oncology, Hematology, Anesthesiology, and Rare Diseases.",
};

const commitments = [
  { Icon: Users, title: "Collaboration and Excellence", text: "By fostering collaborations with leading medical professionals, researchers, and partners, we strive for synergistic partnerships that aim to accelerate breakthroughs and reshape the future of healthcare." },
  { Icon: HeartPulse, title: "Compassion & Integrity", text: "Our foundation is built upon compassion for patients and their families. We are unwavering in our commitment to integrity and transparency, ensuring every action is guided by doing what is right." },
  { Icon: Lightbulb, title: "Pioneering Medicine Solutions", text: "We are dedicated to delivering medicine solutions that address the unmet needs of patients worldwide, exploring novel therapies that make a difference in challenging medical conditions." },
  { Icon: Globe2, title: "Global Accessibility", text: "We believe healthcare knows no boundaries. Our commitment to a seamless global presence through synergistic partnerships ensures the needs of patients are met globally without delay." },
  { Icon: HandHeart, title: "Empowering Patients", text: "We strive to empower patients by providing them with accessible connection to life-saving medicines and providers, cutting-edge treatments, and vital healthcare resources." },
  { Icon: Compass, title: "Advancing Healthcare E-Commerce", text: "Through our state-of-the-art e-commerce platform, we aim to redefine healthcare accessibility. Our seamless and secure online marketplace will ensure patients and providers can access medications regardless of geographic boundaries." },
];

// Order Medicines category-card look: solid colour circle with a white icon per card
const advantages = [
  { Icon: BadgeCheck, iconBg: "bg-[#1D9FDA]", title: "Globally Sourced Quality", text: "Verified under FDA Philippines and international quality standards." },
  { Icon: PackageSearch, iconBg: "bg-[#F2B705]", title: "Hard-to-Find Access", text: "Compassionate Special Permit imports and rare disease therapies unavailable elsewhere." },
  { Icon: Truck, iconBg: "bg-[#E5484D]", title: "Nationwide Logistics", text: "Reliable cold-chain delivery across Luzon, Visayas, and Mindanao." },
  { Icon: HandCoins, iconBg: "bg-[#61A644]", title: "Sustainable Pricing", text: "Rapid-response sourcing and fair pricing for the patients and partners we serve." },
];

/* Highlights in the blue panel under the hero */
const aboutHighlights = [
  { title: "FDA Philippines Licensed Distributor", text: "Licensed by the Food and Drug Administration of the Philippines for pharmaceutical importation, wholesale, and distribution." },
  { title: "UN Global Compact Member & SDG Driver", text: "Aligned with the United Nations' ten principles and actively contributing to the UN Sustainable Development Goals through ethical, responsible business practices." },
  { title: "WHO Good Storage and Distribution Practices Compliant", text: "Operating to World Health Organization standards for pharmaceutical storage, handling, and distribution." },
  { title: "PDEA Licensed (S-4 and S-5)", text: "Philippine Drug Enforcement Agency licensed for the handling and distribution of dangerous drugs (S-4) and controlled precursor chemicals (S-5)." },
  { title: "BOC Compliant", text: "Fully compliant with Bureau of Customs requirements for pharmaceutical importation and clearance." },
  { title: "EDPMS Compliant", text: "Electronic Drug Price Monitoring System compliant — fulfilling DOH price reporting and transparency requirements." },
  { title: "PCO Accredited", text: "Pollution Control Officer accredited under DENR Environmental Management Bureau standards." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero image, same treatment as Order Medicines. xl+: copy sits white on the blue at the left.
          Below xl the image is too short, so the copy stacks below it in navy/black. */}
      <section className="relative bg-white pb-14 xl:pb-0">
        <Image
          src="/images/aboutusherosection.png"
          alt="Getmeds team member helping patients"
          width={5456}
          height={2816}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary xl:text-white xl:drop-shadow">
              About Getmeds
            </span>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-white xl:drop-shadow-md">
              {/* exactly two lines from md up; free wrapping on phones where line one doesn't fit */}
              <span className="md:block md:whitespace-nowrap">Your Compassionate</span>{" "}
              <span className="text-primary md:block md:whitespace-nowrap xl:text-white">Health Ally.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              A new standard of care for a new generation of patients. Advanced science. Trusted medicine. Closer
              access. Better outcomes. Greater hope.
            </p>
          </Reveal>
        </div>
        {/* same button pair as Order Medicines; xl+: anchored to the section bottom so it sits on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-9 flex flex-wrap items-center gap-4 xl:mt-0">
              <Link
                href="/contact-us"
                className="rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Contact Us
              </Link>
              <Link
                href="/careers"
                className="rounded-full border-2 border-black px-7 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                Explore Careers
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team photo slider on the left, the About Us summary on the right */}
      <section className="bg-white pb-12 pt-2 md:pb-16 md:pt-4">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-start lg:gap-16">
          <Reveal>
            <IsoFocus className="h-[320px] sm:h-[380px] lg:h-[420px]" />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-sm font-semibold text-primary">About Us</p>
            {/* same size and weight as Contact Us's "Get in touch with us." */}
            <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
              Inside Getmeds
              <br />
              Our People &amp; Culture
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft md:text-base">
              Getmeds, established in 2020, is a global pharmaceutical company based in the Philippines with a diverse
              portfolio spanning Oncology, Hematology, Anesthesiology, and Rare Diseases. It is driven by innovation,
              science, and a deep commitment to improving access and affordability of life-changing therapies for
              Filipino patients and healthcare partners. At its core, Getmeds is guided by compassion — ensuring that
              every medicine delivered reflects care, dignity, and hope for patients and families in need. With a
              strong focus on accessibility and cost-effective healthcare solutions, the company works to make
              high-quality treatments more reachable, especially for underserved communities. With its continuing
              expansion across the Asia-Pacific region and beyond, Getmeds is poised to create an even greater impact
              on global healthcare.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Split block, same size and colours as Order Medicines' "What we supply": blue panel + white grid panel,
          full-bleed and edge to edge. Content to come. */}
      <section>
        <div className="grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_calc((100vw-80rem)/2+26rem)]">
          {/* Highlights: credentials with glassy check circles, white on blue.
              Left padding lines up with the max-w-7xl container on wide screens. */}
          <div className="min-h-[250px] bg-[#1D9FDA] px-5 py-12 text-white md:min-h-[440px] md:px-10 md:py-14 xl:pl-[calc((100vw-80rem)/2+2.5rem)]">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold md:text-[2rem]">Highlights</h2>
            </Reveal>
            <div className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
              {aboutHighlights.map((h, i) => (
                <Reveal key={h.title} delay={(i % 2) * 0.06}>
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md">
                      <Check className="h-5 w-5 text-white" strokeWidth={2.6} />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold leading-snug md:text-[17px]">{h.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/85">{h.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          {/* white with the faint box grid the therapeutic-areas section used */}
          <div
            className="min-h-[300px] overflow-hidden bg-white px-5 py-12 md:min-h-[440px] md:px-10 md:py-14"
            style={{
              backgroundImage:
                "linear-gradient(#eef2f6 1px, transparent 1px), linear-gradient(90deg, #eef2f6 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          >
            <DedicatedPills />
          </div>
        </div>
      </section>

      {/* Depth stack: team photos drifting out of the distance toward the viewer */}
      <section className="bg-white">
        <DepthStack className="aspect-[3/1] max-h-[60vh] min-h-[280px]" />
      </section>

      {/* Mission and Vision */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-2 md:gap-12 md:px-10">
          {[
            {
              Icon: Target,
              eyebrow: "Our Drive",
              title: "Mission",
              text: "Our mission is to transform the landscape of oncological, hematological, critical care, rare medicine and healthcare e-commerce through relentless innovation, compassionate service, and international collaboration.",
            },
            {
              Icon: Eye,
              eyebrow: "Our Goal",
              title: "Vision",
              text: "To be the global beacon of hope and innovation, tirelessly dedicated to improving the lives of humankind. We envision a world where every patient has access from the first line treatments to the most advanced medicines, where borders do not limit healthcare, and where our unwavering commitment shines through every corner of the globe.",
            },
          ].map(({ Icon, eyebrow, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#61A644] text-white">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-5 text-sm font-semibold text-primary">{eyebrow}</p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-black md:text-[2rem]">{title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft md:text-base">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Commitments, card style of Order Medicines' "Why order from Getmeds" */}
      <section className="bg-white pb-16 pt-4">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          {/* title (two lines) on the left, subtext on the right */}
          <Reveal className="mb-12 grid gap-4 md:mb-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-semibold text-primary">Our Commitments</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
                Enhancing patient connectivity
                <br />
                and clinical reach.
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-soft md:text-base lg:pb-1.5">
              With relentless dedication to innovation, empathy, and accessible global healthcare solutions.
            </p>
          </Reveal>
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commitments.map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-semibold text-black">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Core values: title left, pill cloud right */}
      <CoreValues />

      {/* Advantages: plain white, four cards in the Order Medicines category-card style (no buttons) */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="mb-10 grid gap-4 md:mb-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-semibold text-primary">Our Advantages</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">Why Choose Getmeds?</h2>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-soft md:text-base lg:pb-1">
              We go above and beyond to ensure our services exceed your expectations when it comes to your health and
              convenience.
            </p>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ Icon, iconBg, title, text }) => (
              <StaggerItem key={title}>
                <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-semibold text-black">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA: full-width green band that sits directly on the footer */}
      <section className="bg-[#61A644] text-white">
        <Reveal className="mx-auto max-w-7xl px-5 py-14 text-center md:px-10 md:py-16">
          <h2 className="font-display text-2xl font-semibold md:text-[2rem]">
            Every patient. Every doctor. Every pharmacy. Every partner.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/90 md:text-base">
            Getmeds is built for all of them. Whether you&apos;re seeking medicine, sourcing therapies, exploring
            partnerships, or joining our team — one message reaches the right hands.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact-us"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#3d7a26] transition hover:bg-white/90"
            >
              Contact Us
            </Link>
            <Link
              href="/contact-us"
              className="rounded-full border-2 border-white px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Partner With Us
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
