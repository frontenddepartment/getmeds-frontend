import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { capabilities, stats } from "@/lib/data";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/ui";
import Faq from "@/components/Faq";
import FaqSchema from "@/components/FaqSchema";
import BusinessSchema from "@/components/BusinessSchema";
import HeroTagline from "@/components/HeroTagline";
import PortfolioMorph from "@/components/PortfolioMorph";
import AreaSlider from "@/components/AreaSlider";
import PartnerSteps from "@/components/PartnerSteps";
import CapabilityList from "@/components/CapabilityList";
import CapabilitiesWindow from "@/components/CapabilitiesWindow";
import FeaturedArticles from "@/components/FeaturedArticles";

/* Quiet left-aligned section label, benchmark style */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
      <span className="mr-2 text-primary">•</span>
      {children}
    </p>
  );
}

const heroImage = { alt: "", fill: true, priority: true, sizes: "100vw" } as const;
const { props: heroDesktop } = getImageProps({ ...heroImage, src: "/images/herosectionimage.png" });
const { props: heroMobile } = getImageProps({ ...heroImage, src: "/images/mobileherosec.png" });

const marqueeItems = [
  "FDA Philippines Licensed", "WHO", "PIC/S", "US FDA", "EU GMP", "UK MHRA",
  "UN Global Compact", "PDEA Licensed", "DSWD Accredited", "PCSO Accredited",
];

const whyCards = [
  { title: "First-to-market sourcing", text: "We move the moment a patent cliffs globally." },
  { title: "Cold-chain excellence", text: "Biologics-ready logistics nationwide." },
  { title: "Filipino-first portfolio", text: "Selected for local disease patterns." },
  { title: "Patient Assistance Program", text: "Adherence, access, affordability." },
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: { absolute: "Getmeds | Global Pharmaceutical Company" },
  description:
    "Getmeds is an FDA-licensed pharmaceutical importer, wholesale distributor, supplier, and retail pharmacy in the Philippines. Order medicines online.",
};

export default function Home() {
  return (
    <>
      {/* FAQPage JSON-LD (Q1–6) — homepage only, never in the shared layout */}
      <FaqSchema page="home" />
      {/* Pharmacy + WebSite JSON-LD — who Getmeds is, for Google's knowledge panel and local results */}
      <BusinessSchema />

      {/* ================= Hero: centered over photo (benchmark layout) ================= */}
      <section className="relative overflow-hidden bg-white">
        {/* full-bleed photo: its light left side carries the copy. Phones get a
            portrait crop (white top for the copy, people at the bottom); each
            device downloads only its own source. */}
        <div className="absolute inset-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={heroDesktop.srcSet} sizes={heroDesktop.sizes} />
            <source media="(max-width: 767px)" srcSet={heroMobile.srcSet} sizes={heroMobile.sizes} />
            {/* largest paint on every device: fetch it before anything else */}
            <img
              {...heroMobile}
              fetchPriority="high"
              alt="A smiling Getmeds doctor comforting a cancer patient in a headscarf"
              className="object-contain object-bottom md:object-cover md:object-[78%_30%]"
            />
          </picture>
        </div>
        {/* sits in the gap right of the grandmother's headscarf */}
        <HeroTagline className="absolute right-[1%] top-[28%] z-10 hidden xl:block 2xl:right-[2%]" />

        <div className="relative mx-auto flex min-h-svh md:min-h-[620px] max-w-7xl flex-col items-start justify-center px-5 pb-[76vw] pt-28 text-left md:px-10 md:pb-24 md:pt-32">

          {/* SEO: the page's only <h1> + subheadline render visible in the server HTML — no fade-in wrapper */}
          <div className="relative z-10">
            {/* hierarchy: four fixed lines that scale fluidly with the viewport (never re-wrap) */}
            <h1 className="font-display text-[clamp(1.6rem,7.2vw,1.85rem)] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E]">
              <span className="block whitespace-nowrap">
                Life-Saving{" "}
                <span className="text-primary">
                  Medicines
                </span>
              </span>
              <span className="block whitespace-nowrap">
                for Patients, <span className="text-primary">Doctors,</span>
              </span>
              <span className="block whitespace-nowrap">
                <span className="text-primary">Pharmacies</span>{" "}
                <span className="text-primary">&amp;</span>{" "}
                <span className="text-primary">
                  Hospitals
                </span>
              </span>
              <span className="block whitespace-nowrap">in the Philippines</span>
            </h1>
            <p className="hero-subheadline mt-6 max-w-xl text-[15.5px] leading-relaxed text-black md:text-[15px]">
              Getmeds is a global pharmaceutical company and an FDA-licensed importer, wholesale
              distributor, and retail pharmacy, delivering essential medicines, hospital therapies,
              and cancer treatments nationwide.
            </p>
            <Reveal immediate delay={0.1} className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/product-range"
                className="rounded-full border-2 border-black px-7 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                View Products
              </Link>
              <Link
                href="/order-medicines"
                className="rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Order Medicines
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* credentials strip along the hero's bottom edge: solid brand blue, white text, dot separators */}
      <div className="overflow-hidden bg-[#1D9FDA] py-2.5 md:py-3">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((m, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center whitespace-nowrap text-xs font-semibold text-white md:text-sm"
            >
              <span className="px-4 md:px-6">{m}</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-white/70" />
            </span>
          ))}
        </div>
      </div>

      {/* everything below the hero: balanced headings, no single-word last lines */}
      <div className="text-flow">
      {/* ================= Therapeutic areas: split slider ================= */}
      <section>
        <AreaSlider />
      </section>

      {/* ================= Featured Products heading (above the four-tile strip) ================= */}
      <section className="bg-white pb-6 pt-6 md:pb-8 md:pt-8">
        <Reveal className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className="font-display text-2xl font-medium text-black md:text-[2rem]">Featured Products</h2>
        </Reveal>
      </section>

      {/* ================= Product image strip: four tiles, edge to edge ================= */}
      <section className="grid grid-cols-4">
        {[
          {
            src: "/images/pazopanib.jpeg",
            alt: "PazoGet-200 (Pazopanib 200 mg) film-coated tablets by Getmeds",
            caption: {
              title: "PazoGet (Pazopanib)",
              subtitle: "First Branded Generic in the Philippines",
              meta: "200 mg & 400 mg Tablets · Oncology · Rx",
            },
          },
          { src: "/images/categoryimage2.png", alt: "Medicine bottle on a white pedestal with tablets" },
          { src: "/images/categoryimage3.png", alt: "Medicine bottles and tablets on green" },
          { src: "/images/categoryimage2.png", alt: "Medicine bottle on a white pedestal with tablets" },
        ].map((img, i) => (
          <div key={i} className="relative aspect-[2/3]">
            <Image src={img.src} alt={img.alt} fill sizes="25vw" className="object-cover" />
            {"caption" in img && img.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B5E8A]/70 via-[#0B5E8A]/30 to-transparent p-2 pt-10 text-white sm:p-4 sm:pt-16 lg:p-7 lg:pt-24">
                <p className="font-display text-[11px] font-semibold leading-tight sm:text-base lg:text-2xl">
                  {img.caption.title}
                </p>
                <p className="mt-0.5 text-[9px] leading-snug text-white/90 sm:text-xs lg:mt-1 lg:text-sm">
                  {img.caption.subtitle}
                </p>
                <p className="mt-1 hidden text-xs text-white/80 sm:block lg:mt-3 lg:text-[13px]">{img.caption.meta}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ================= Impact band: four trust signals splitting the full width ================= */}
      <section className="bg-[#1D9FDA] text-white">
        <Reveal className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-12 md:grid-cols-4 md:px-10 md:py-16">
          {stats.map((st, i) => (
            <div
              key={st.label}
              className={`px-4 py-5 text-center md:py-2 ${i % 2 === 1 ? "border-l border-white/25" : ""} ${i >= 2 ? "border-t border-white/25 md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
            >
              <Counter
                value={st.value}
                suffix={st.suffix}
                className="font-display text-4xl font-semibold md:text-5xl"
              />
              <p className="mt-2 text-balance text-sm leading-snug text-white/80">{st.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ================= Portfolio layers ================= */}
      <section className="border-b border-[#e3edf5]">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
          <div className="mb-12 grid items-end gap-6 md:mb-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <Reveal>
              <Label>Our Pharmaceutical Portfolio</Label>
              <h2 className="font-display mt-5 text-3xl font-medium leading-tight text-primary-deep md:text-[2.5rem]">
                From Essential Medicines to Advanced Therapies.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="leading-relaxed text-ink-soft lg:pb-1.5">
                Getmeds is built for all four layers — from branded generics that keep
                everyday treatment affordable, to specialty and rare-disease therapies
                once out of reach for Filipino patients.
              </p>
            </Reveal>
          </div>
          <PortfolioMorph />
        </div>
      </section>

      {/* ================= Who we are + portfolio layers ================= */}
      <section className="border-b border-[#e3edf5]">
        <div className="mx-auto max-w-7xl px-5 pt-14 pb-2 md:px-10 md:pt-18 md:pb-4">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <Reveal>
              <Label>Who we are</Label>
              <h2 className="font-display mt-5 text-3xl font-medium leading-tight text-primary-deep md:text-[2.75rem]">
                Patient first. Raising the standard for Filipino care.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:pt-10">
              <p className="leading-relaxed text-ink-soft">
                A box of medicine isn&apos;t a product. It&apos;s a stage-IV oncology mother in
                Cebu waiting for her next dose. A child in Mindanao fighting leukemia. A father
                in Quezon City heading into surgery, trusting that the anesthesia is ready.{" "}
                <span className="font-medium text-primary">
                  Getmeds exists so distance, cost, and complexity never decide who lives.
                </span>
              </p>
              <Link
                href="/about-us"
                className="mt-6 inline-flex rounded-full bg-[#61A644] px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                About Getmeds
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= Serbisyong May Puso (2x2 feature grid) ================= */}
      <section className="grid md:grid-cols-2">
        {/* Top-left: copy + agency pills */}
        <div className="flex flex-col justify-center bg-white px-8 py-10 md:min-h-[340px] md:px-10 md:py-12 xl:px-12">
          <div>
            <h2 className="font-display text-2xl font-medium leading-snug text-[#1D9FDA] md:text-[1.375rem] lg:text-[2rem]">
              Patient Assistance Program
            </h2>
            <p lang="fil" className="mt-3 text-base leading-relaxed text-[#1D9FDA]">
              Humingi ng price quotation para sa iyong Guarantee Letter.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2.5" aria-label="Partner agencies">
              {["DSWD", "PCSO", "OP", "OVP"].map((agency) => (
                <li
                  key={agency}
                  className="rounded-full border border-[#1D9FDA] px-4 py-1.5 text-sm font-semibold tracking-wide text-[#1D9FDA]"
                >
                  {agency}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            {/* filled pill with arrow, no shadow */}
            <Link
              href="/patient-assistance-program"
              lang="fil"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1D9FDA] px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Alamin ang Proseso
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Top-right: team collage with heart ribbon */}
        <div className="relative min-h-[260px] md:min-h-[340px]">
          <Image
            src="/images/imageone.jpeg"
            alt="The Getmeds team — Your Health, Compassionate Ally"
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover"
          />
          {/* rounded white stroke frame with caption */}
          <div className="pointer-events-none absolute inset-5 flex items-end justify-center rounded-[2rem] border-2 border-white/95 pb-5 md:inset-8 md:pb-6">
            <p
              className="px-4 text-center text-sm font-medium text-white md:text-base"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.5)" }}
            >
            </p>
          </div>
        </div>

        {/* Bottom-left: products display. Its labels are baked into the image, so phones
            get the image's own 16:9 box — a taller box would crop the edge labels off. */}
        <div className="relative aspect-[1600/906] md:aspect-auto md:min-h-[340px]">
          <Image
            src="/images/imagetwo.png"
            alt="Getmeds product range — oncology, hematology, essential medicines and medical supplies"
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* Bottom-right: All Generic Medicines (mirrors the PAP panel, inverted for the blue background) */}
        <div className="flex flex-col justify-center bg-[#1D9FDA] px-8 py-10 text-white md:min-h-[340px] md:px-10 md:py-12 xl:px-12">
          <div>
            <h2 className="font-display text-2xl font-medium leading-snug text-white md:text-[1.375rem] lg:text-[2rem]">
              All Generic Medicines
            </h2>
            <p lang="fil" className="mt-3 text-base leading-relaxed text-white">
              Dekalidad at abot-kayang gamot para sa kalusugan ng pamilya.
            </p>
            <p className="mt-4 text-sm font-semibold tracking-wide text-white md:text-base">
              FDA-Registered&nbsp;&nbsp;•&nbsp;&nbsp;GMP-Certified
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/product-range"
              lang="fil"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#1D9FDA] transition hover:bg-white/90"
            >
              Maghanap ng Gamot
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= Services: numbered hairline list ================= */}
      <section className="border-b border-[#e3edf5]">
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-8 md:px-10 md:pt-28 md:pb-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <Reveal className="max-w-3xl">
              <Label>What we do</Label>
              <h2 className="font-display mt-5 text-3xl font-medium leading-tight text-primary-deep md:text-[2.5rem]">
                Capabilities that move medicines, partnerships, and patients forward.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-sm text-balance text-sm leading-relaxed text-ink-soft lg:mt-7">
                Getmeds operates across the pharmaceutical supply chain from global sourcing and
                regulatory compliance to nationwide distribution and last-mile delivery, helping
                make quality medicines accessible across the Philippines.
              </p>
            </Reveal>
          </div>

          {/* capabilities collage — each row opens like a window as you scroll */}
          <div className="mt-10">
            <CapabilitiesWindow />
          </div>

          <CapabilityList items={capabilities} />
        </div>
      </section>

      {/* ================= Why Getmeds: full-bleed blue band ================= */}
      <section className="relative text-white">
        <Image
          src="/images/bluebg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-10 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
              <span className="mr-2">•</span>Why Getmeds
            </p>
            <h2 className="font-display mt-5 text-3xl font-medium leading-tight md:text-[2.5rem]">
              Why doctors, hospitals and pharmacies choose Getmeds.
            </h2>
            <Link
              href="/services"
              className="mt-8 inline-flex items-center rounded-full border border-white/50 bg-transparent px-7 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_1px_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:border-white/80 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(255,255,255,0.25),0_10px_28px_rgba(0,0,0,0.12)]"
            >
              Learn More
            </Link>
          </Reveal>

          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {whyCards.map((w) => (
              <StaggerItem key={w.title}>
                <h3 className="font-display text-lg font-medium">{w.title}</h3>
                <p className="mt-2 text-balance text-sm leading-relaxed text-white/80">{w.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ================= Partnership: isometric steps ================= */}
      <section className="overflow-hidden border-b border-[#e3edf5] bg-white">
        <div className="mx-auto max-w-7xl md:px-10">
          <PartnerSteps />
        </div>
      </section>

      {/* ================= Featured articles ================= */}
      <section>
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16">
          <Reveal>
            <Label>Featured Articles</Label>
            <h2 className="font-display mt-5 text-3xl font-medium leading-tight text-primary-deep md:text-[2.5rem]">
              In the news.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <FeaturedArticles />
          </Reveal>
        </div>
      </section>

      {/* ================= FAQ: two-column structured ================= */}
      <section className="border-b border-white/20 bg-[#1D9FDA] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-10 md:py-14 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white">
              <span className="mr-2">•</span>FAQ
            </p>
            <h2 className="font-display mt-4 text-2xl font-medium leading-tight text-white md:text-[2rem]">
              Frequently asked questions.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white md:text-base">
              Everything you need to know about Getmeds and our services. Can&apos;t find your
              answer?{" "}
              <Link href="/contact-us" className="font-semibold text-white underline underline-offset-4 hover:opacity-85">
                Talk to our team
              </Link>
              .
            </p>
            {/* cutout sits flush on the section's bottom edge (cancels the py-14 padding) */}
            <div className="relative -mb-14 mt-auto hidden aspect-square w-full max-w-[420px] lg:block">
              <Image
                src="/images/faqsimage.png"
                alt="Getmeds team member thinking about a question"
                fill
                sizes="420px"
                className="object-contain object-bottom"
              />
            </div>
          </div>
          <Faq />
        </div>
      </section>
      </div>
    </>
  );
}
