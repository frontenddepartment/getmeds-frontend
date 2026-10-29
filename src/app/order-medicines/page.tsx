import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, Clock, FileCheck2, HandHeart, HeartHandshake, Leaf,
  Lock, PhoneCall, Pill, ShieldCheck, Snowflake, Stethoscope, Tablets, Truck,
} from "lucide-react";
import { contact, orderFaqs } from "@/lib/data";
import { Reveal, Stagger, StaggerItem } from "@/components/ui";
import Faq from "@/components/Faq";
import FaqSchema from "@/components/FaqSchema";
import Vouchers from "@/components/Vouchers";
import { WhatsAppIcon } from "@/components/SocialIcons";

export const metadata: Metadata = {
  alternates: { canonical: "/order-medicines" },
  title: { absolute: "Buy Prescription Medicines Online in the Philippines" },
  description:
    "Buy prescription medicines online from Getmeds, an FDA-licensed importer, wholesaler, distributor and retail pharmacy. Delivery across the Philippines.",
};

/* Coloured ordering pills stacked on the hero person's right; `nudge` keeps a slight stagger. */
const heroPills = [
  { label: "Order online", color: "bg-[#E5484D] text-white", nudge: "mr-[8%]" },
  { label: "Upload your prescription", color: "bg-[#61A644] text-white", nudge: "" },
  { label: "Nationwide delivery", color: "bg-[#F2B705] text-[#3a2a00]", nudge: "mr-[5%]" },
];

/* Brand-blue cards with a big white arrow, all white-on-blue. */
const audiences = [
  { title: "Patients & Families", text: "Upload a prescription and we deliver to your door.", cta: "Order with a prescription" },
  { title: "Doctors & Healthcare Professionals", text: "Product orders, pricing and Compassionate Special Permits.", cta: "Send an inquiry" },
  { title: "Distributors & Pharmacies", text: "Wholesale supply, credit terms and a distributor account.", cta: "Become a distributor partner" },
  { title: "Hospitals & Institutions", text: "Quotations, emergency purchases and hospital procurement.", cta: "Request a quotation" },
];

/* The four order cards; "Start your order" in the closing banner scrolls back here (#order-cards). */
const categories = [
  {
    Icon: Pill, iconBg: "bg-[#1D9FDA]",
    title: "Prescription medicines",
    text: "Order cancer medicines, chemotherapy drugs, hematology, and hospital medicines online.",
    note: "Valid prescription required for patients.",
    cta: "Order prescription medicines",
    href: "/prescription-medicines",
  },
  {
    Icon: Tablets, iconBg: "bg-[#F2B705]",
    title: "OTC medicines",
    text: "Buy over-the-counter (OTC) medicines, vitamins, and pain relief for everyday health needs.",
    note: "No prescription needed.",
    cta: "Buy OTC medicines",
    href: "/over-the-counter-medicines",
  },
  {
    Icon: Stethoscope, iconBg: "bg-[#E5484D]",
    title: "Medical devices",
    text: "FDA-registered medical devices, equipment, and supplies for patients, hospitals, clinics, and healthcare professionals.",
    cta: "Buy medical devices",
    href: "/medical-devices",
  },
  {
    Icon: Leaf, iconBg: "bg-[#61A644]",
    title: "Food supplements",
    text: "Buy vitamins, probiotics, herbal teas, and food supplements for daily wellness.",
    note: "No Approved Therapeutic Claims.",
    noteItalic: true,
    cta: "Buy food supplements",
    href: "/food-supplements",
  },
];

const delivery = [
  { Icon: Clock, title: "Same-day Metro Manila", text: "Orders confirmed before 3:00 PM are delivered the same day." },
  { Icon: Truck, title: "Luzon, Visayas and Mindanao", text: "We deliver across the Philippines, not only Metro Manila." },
  { Icon: Snowflake, title: "Cold-chain handling", text: "Temperature-controlled from our warehouse to your door." },
  { Icon: ShieldCheck, title: "GDP-compliant distribution", text: "Good Distribution Practice standards on every order." },
];

const reasons = [
  { Icon: ShieldCheck, title: "Fully licensed pharmaceutical company", text: "FDA Philippines-licensed wholesaler, importer, distributor and retail pharmacy. PDEA-licensed S1 to S5 for controlled substances." },
  { Icon: Pill, title: "Pharmacist-verified dispensing", text: "Every order is reviewed and dispensed under PRC-licensed Filipino pharmacists, under the Philippine Pharmacy Act (RA 10918)." },
  { Icon: FileCheck2, title: "Product documentation", text: "Certificate of Product Registration, Certificate of Analysis, product inserts and batch notifications." },
  { Icon: HeartHandshake, title: "Compassionate Special Permit coordination", text: "For medicines not registered in the Philippines, coordinated through our partner 2MG Inc. and subject to FDA approval." },
  { Icon: PhoneCall, title: "24/7 Customer Support", text: "Emergency requirements, delivery updates and order questions, at any hour including weekends and holidays." },
  { Icon: Lock, title: "Secure prescription storage", text: "Uploads are encrypted and handled under the Data Privacy Act of 2012." },
];

export default function OrderPage() {
  return (
    <>
      <FaqSchema page="order" />

      {/* Hero image. xl+: copy sits on the blue on the left, in white.
          Below xl: the image is too short, so the copy stacks below it in the usual navy/black. */}
      <section className="relative bg-white pb-14 xl:pb-0">
        <div className="relative">
          <Image
            src="/images/herosectionfinal.png"
            alt="Smiling Getmeds team member ordering medicines on her phone"
            width={5456}
            height={2816}
            priority
            sizes="100vw"
            className="h-auto w-full"
          />
          {/* ordering pills on the person's right: one group floating in one motion; % position tracks her at any width */}
          <div className="animate-float absolute right-[2%] top-[26%] hidden flex-col items-end gap-1.5 md:flex lg:gap-2">
            {heroPills.map(({ label, color, nudge }) => (
              <span
                key={label}
                className={`whitespace-nowrap rounded-full border border-white/40 px-3 py-1.5 text-[11px] font-semibold shadow-[0_10px_24px_-12px_rgba(6,40,64,0.55)] lg:px-4 lg:py-2 lg:text-xs ${color} ${nudge}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary xl:text-white xl:drop-shadow">
              Order Medicines
            </span>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-white xl:drop-shadow-md">
              {/* exactly two lines from md up; free wrapping on phones where line one doesn't fit */}
              <span className="md:block md:whitespace-nowrap">Order Prescription Medicines</span>{" "}
              <span className="text-primary md:block md:whitespace-nowrap xl:text-white">Online in the Philippines</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              Prescription medicine delivery for patients, doctors, pharmacies and hospitals across the Philippines.
            </p>
          </Reveal>
        </div>
        {/* same button pair and placement as Contact Us / CSR; xl+: anchored to the section bottom so it sits on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-9 flex flex-wrap items-center gap-4 xl:mt-0">
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border-2 border-primary bg-primary py-1.5 pl-1.5 pr-7 text-sm font-semibold text-white transition hover:brightness-95"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <WhatsAppIcon className="h-4 w-4" />
                </span>
                Order via WhatsApp
              </a>
              {/* Plain <a>, not <Link>: a native hash jump is what sets :target, which plays the cards' cue below */}
              <a
                href="#audiences"
                className="rounded-full border-2 border-black px-7 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                Order Medicines
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Audiences — no heading, sits right under the hero; compact on mobile so the order cards below stay close to the top */}
      <section id="audiences" className="scroll-mt-32 pb-6 md:pb-8 lg:pt-2">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Stagger className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {audiences.map(({ title, text, cta }, i) => (
              <StaggerItem key={title} className="h-full">
                <Link
                  href="/contact-us"
                  aria-label={`${title}: ${cta}`}
                  style={{ "--cue-i": i } as React.CSSProperties}
                  className="cue-card group relative flex h-full flex-col rounded-3xl bg-[#1D9FDA] p-4 text-white transition-transform duration-300 hover:-translate-y-1 md:p-5"
                >
                  {/* chunky arrow, as in the reference; pinned to the corner so it doesn't add height */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4.2}
                    strokeLinejoin="round"
                    aria-hidden
                    className="absolute right-2.5 top-2.5 h-10 w-10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 md:right-3.5 md:top-3.5 md:h-12 md:w-12"
                  >
                    <path d="M5.5 18.5 17 7" />
                    <path d="M7.5 6.5h10v10" />
                  </svg>
                  <div className="mt-auto pt-9 md:pt-10">
                    <h3 className="font-display pr-10 text-sm font-semibold leading-snug md:pr-12 md:text-base">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/85 md:text-sm">{text}</p>
                  </div>
                  {/* one glass pill: label + inner glass circle with the chevron */}
                  <span className="mt-3 flex w-full items-center justify-between gap-2 rounded-full bg-white/20 py-1 pl-3 pr-1 md:pl-4">
                    <span className="text-[11px] font-semibold leading-tight sm:whitespace-nowrap md:text-xs">{cta}</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 transition-transform duration-300 group-hover:translate-x-0.5 md:h-8 md:w-8">
                      <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.75} />
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* What we supply + the four order cards */}
      <section className="pb-10 pt-2 md:pb-16 md:pt-4">
          {/* Split block, full-bleed and edge to edge: blue copy panel + green photo panel with the glassy cross.
              The copy's left padding lines up with the max-w-7xl container on wide screens. */}
          <Reveal className="mb-10 grid md:mb-14 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] xl:grid-cols-[calc((100vw-80rem)/2+26rem)_minmax(0,1fr)]">
            <div className="flex min-h-[420px] flex-col bg-[#1D9FDA] px-5 py-8 text-white md:min-h-[560px] md:px-10 md:py-10 xl:pl-[calc((100vw-80rem)/2+2.5rem)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                Importer / Wholesaler / Pharmacy
              </span>
              <h2 className="font-display mt-6 text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl">
                What we supply.
              </h2>
              <p className="mt-auto pt-10 text-sm leading-relaxed text-white/90">
                Getmeds is a trusted pharmaceutical importer, wholesale distributor, and retail pharmacy
                serving patients, doctors, pharmacies, and hospitals nationwide. We supply cancer medicines
                and chemotherapy drugs, treatments for blood disorders, and essential hospital medicines,
                including anesthesia and surgical medicines. Our complete healthcare catalog also includes
                everyday over-the-counter (OTC) medicines, medical devices, and food supplements.
              </p>
              <div className="mt-6 flex items-center justify-between gap-3">
                <a
                  href="#order-cards"
                  className="inline-flex items-center gap-3 rounded-full bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-black/85"
                >
                  Start your order
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </a>
                <div className="flex items-center gap-2">
                  <span aria-hidden className="h-8 w-8 rounded-full bg-white/50" />
                  <a
                    href="#order-cards"
                    aria-label="See what we supply"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-sm transition hover:scale-105"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                  </a>
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden bg-[#61A644] md:min-h-[560px]">
              {/* small glassy Getmeds cross behind the photo, near the top so its middle shows above the heads; two interlocking halves of the logo mark; fades in on scroll */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[2%] aspect-[100/110] h-[56%] -translate-x-1/2"
              >
                <Reveal y={0} delay={0.35} className="h-full w-full">
                  <svg
                    viewBox="0 0 100 110"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full drop-shadow-[0_8px_24px_rgba(255,255,255,0.18)]"
                  >
                    <defs>
                      <linearGradient id="glass-fill" x1="0" y1="0" x2="0.6" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.55" />
                        <stop offset="55%" stopColor="white" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <g fill="url(#glass-fill)">
                      <path d="M 7.5 20 H 42.5 V 47.5 H 27.5 V 62.5 H 42.5 V 105 H 7.5 Z" />
                      <path d="M 57.5 0 H 92.5 V 85 H 57.5 V 62.5 H 72.5 V 47.5 H 57.5 V 0 Z" />
                    </g>
                  </svg>
                </Reveal>
              </div>
              <Image
                src="/images/models.png"
                alt="Smiling Getmeds team in branded white polo shirts"
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-contain object-bottom"
              />
            </div>
          </Reveal>

        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div id="order-cards" className="scroll-mt-28">
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map(({ Icon, iconBg, title, text, note, noteItalic, cta, href }) => (
                <StaggerItem key={title}>
                  {/* flat card: grey border, no shadow; each category gets its own solid icon colour */}
                  <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display mt-4 font-semibold text-black">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                    {note && (
                      <p className={`mt-2 text-sm font-semibold text-primary-deep ${noteItalic ? "italic" : ""}`}>{note}</p>
                    )}
                    <div className="mt-auto pt-5">
                      <Link
                        href={href}
                        className="flex w-full items-center justify-center whitespace-nowrap rounded-full bg-primary px-3 py-3 text-[13px] font-semibold text-white transition hover:brightness-95"
                      >
                        {cta}
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Discounts — full-width brand-blue band. Copy + vouchers on the left (in the max-w-7xl container);
          on lg+ the photo fills the right side flush with the band's top, bottom and right edges. */}
      <section className="relative my-8 overflow-hidden bg-[#1D9FDA] text-white">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] lg:block">
          <Image
            src="/images/seniorcitizen.png"
            alt="Smiling senior in a wheelchair exercising with a caregiver"
            fill
            sizes="44vw"
            className="object-cover object-[center_38%]"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
          <Reveal>
            <div className="lg:max-w-[52%]">
              <div>
                <h2 className="font-display text-3xl font-semibold leading-tight md:text-[2.6rem]">
                  Senior Citizen and <br />
                  PWD Discounts
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/90">
                  Getmeds complies with the Expanded Senior Citizens Act (RA 9994) and the Magna Carta for
                  Persons with Disability (RA 7277, as amended by RA 9442 and RA 10754).
                </p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-white">
                  Present or upload a valid Senior Citizen or PWD ID with your prescription.
                </p>
              </div>
              <div className="mt-8 max-w-lg">
                <Vouchers />
              </div>
            </div>
          </Reveal>
        </div>
        {/* below lg the photo stacks under the vouchers, full width, flush with the band's sides and bottom */}
        <div className="relative h-72 sm:h-96 lg:hidden">
          <Image
            src="/images/seniorcitizen.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_38%]"
          />
        </div>
      </section>

      {/* Delivery (#delivery: the hero's "Nationwide delivery" badge jumps here) */}
      <section id="delivery" className="relative scroll-mt-28 bg-white py-16">
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="mb-12 md:mb-16">
            <h2 className="font-display text-3xl font-semibold leading-tight text-black md:text-[2.6rem]">
              Nationwide delivery
            </h2>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {delivery.map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                {/* same flat card as the order cards above, brand-blue icon */}
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

      {/* Why order — no top padding so it sits close to the delivery cards */}
      <section className="pb-16 pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="mb-12 md:mb-16">
            <h2 className="font-display text-3xl font-semibold leading-tight text-black md:text-[2.6rem]">
              Why order from Getmeds
            </h2>
          </Reveal>
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reasons.map(({ Icon, title, text }) => (
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

      {/* Patient Assistance Program — its own section, right after the reasons */}
      <section className="mb-16 bg-[#1D9FDA] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          {/* title on the left (two lines), description + button on the right */}
          <Reveal className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-center md:gap-12">
            <div>
              <HandHeart className="h-7 w-7 text-white" />
              <h2 className="font-display mt-4 text-3xl font-semibold leading-tight text-white md:text-[2.6rem]">
                Patient Assistance
                <br />
                Program
              </h2>
            </div>
            <div>
              <p className="text-sm leading-relaxed text-white md:text-base">
                Applying for medicine assistance? Getmeds provides official price quotations for your
                prescribed medicines and accepts Guarantee Letters from DSWD, PCSO, the Office of the
                President (OP), and the Office of the Vice President (OVP).
              </p>
              <Link
                href="/patient-assistance-program"
                className="mt-6 inline-flex items-center rounded-full border border-white/40 bg-white/15 px-6 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md transition-colors hover:bg-white/25"
              >
                Learn more about the Patient Assistance Program
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ — all 13 answers are in the server HTML; schema via <FaqSchema page="order" /> */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
          <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:gap-14 items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                <span className="mr-2">•</span>FAQ
              </p>
              <h2 className="font-display mt-4 mb-6 text-3xl font-semibold leading-tight text-black md:mb-8 md:text-[2.25rem] lg:text-4xl">
                Frequently asked questions
              </h2>
              {/* Q1 ("Can I buy medicine online…") is shown last in the right column */}
              <Faq items={orderFaqs.slice(1, 7)} theme="white" idPrefix="faq-col1" initialOpen={null} />
            </div>
            <div>
              <Faq items={[...orderFaqs.slice(7), orderFaqs[0]]} theme="white" idPrefix="faq-col2" initialOpen={null} />
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      {/* Shorter than the photo: it's anchored to the bottom so the trim comes off the top.
          Copy sits white on the left over the green cubicles; the agent stays visible on the right. */}
      <section className="relative w-full overflow-hidden py-14 text-white md:py-12 lg:flex lg:aspect-[1947/560] lg:items-center lg:py-0">
        <Image
          src="/images/ctabannerordermedicines.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[70%_bottom] md:object-bottom"
          aria-hidden
        />
        {/* shade behind the copy: full on phones, a left-to-right fade from md up */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#073b57]/90 via-[#073b57]/60 to-black/25 md:bg-gradient-to-r md:from-[#073b57]/80 md:via-[#073b57]/45 md:via-45% md:to-transparent md:to-70%" />

        <div className="relative mx-auto w-full max-w-7xl px-5 md:px-10">
          <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Left side CTA copy */}
            <Reveal className="text-center md:text-left">
              <h2 className="font-display text-3xl font-semibold leading-tight text-white drop-shadow-md md:text-4xl lg:text-[2.6rem]">
                Ready to order?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/95 drop-shadow-sm md:mx-0 md:text-lg">
                Choose a category to get started, or message us if you need help finding your medicine.
              </p>
              <div className="mt-6 flex justify-center md:justify-start">
                <a
                  href="#order-cards"
                  className="inline-flex items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#073b57] transition hover:bg-white/90"
                >
                  Start your order
                </a>
              </div>
              <p className="mt-5 text-sm text-white/95 drop-shadow-sm">
                Questions? Message us on{" "}
                <a href={contact.viber} className="font-semibold underline underline-offset-4 hover:opacity-85">
                  Viber
                </a>{" "}
                or call{" "}
                <a href="tel:+639190769105" className="font-semibold underline underline-offset-4 hover:opacity-85">
                  +639190769105
                </a>
              </p>
            </Reveal>

            {/* Right side spacer leaves the agent visible */}
            <div className="hidden md:block" />
          </div>
        </div>
      </section>
    </>
  );
}
