"use client";

import Image from "next/image";
import {
  FileText, HeartHandshake, Mail, PhoneCall, Pill, Truck,
} from "lucide-react";
import { contact } from "@/lib/data";
import { Reveal } from "@/components/ui";
import PapGuide from "@/components/PapGuide";
import FaqSchema from "@/components/FaqSchema";

/* The three promises shown on the PAP banner (kept in the banner's own wording). */
const heroPerks = [
  { Icon: FileText, color: "bg-[#E5484D]", title: "Hassle-free quotation", lines: ["We process via Viber", "We offer quotation delivery"] },
  { Icon: HeartHandshake, color: "bg-[#F2B705]", title: "Fast GL processing", lines: ["We assist and guide each patient", "Mabilis, Maaasahan"] },
  { Icon: Pill, color: "bg-[#61A644]", title: "Compassionate Special Permit", lines: ["We accept GL for high cost medicines", "for advanced cancer stages"] },
];

export default function PapPage() {

  return (
    <>
      {/* FAQPage JSON-LD (all 12, same wording as the accordion) — this page only */}
      <FaqSchema page="pap" />

      {/* Hero image, same treatment as Order Medicines. xl+: copy sits white on the blue at the left.
          Below xl the image is too short, so the copy stacks below it in navy/black. */}
      <section className="relative bg-white pb-10 xl:pb-0" lang="en">
        <Image
          src="/images/papherosection.png"
          alt="Smiling daughter hugging her mother, a cancer patient"
          width={5456}
          height={2816}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary xl:text-white xl:drop-shadow">
              Government-accredited pharmaceutical distributor
            </span>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-[min(2.7vw,2.6rem)] xl:text-white xl:drop-shadow-md">
              {/* line one big; line two is the longer SEO line, set smaller so it fits beside the people */}
              <span className="block md:whitespace-nowrap">Patient Assistance Program</span>
              <span className="mt-2 block max-w-[38rem] text-balance text-[0.62em] leading-snug text-primary xl:text-white">
                PCSO Medical Assistance &amp; DSWD AICS for Cancer Patients
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              PCSO Medical Assistance Program (MAP) and DSWD Medical Assistance (AICS) requirements and steps for
              cancer patients and families in the Philippines.
            </p>
          </Reveal>
        </div>
        {/* same button pair as Order Medicines; xl+: anchored to the section bottom so it sits on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-9 flex flex-wrap items-center gap-4 xl:mt-0">
              <a
                href={contact.viber}
                className="rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Request a Quotation
              </a>
              <a
                href="#steps"
                className="rounded-full border-2 border-black px-7 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                Mga Hakbang
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The banner's three promises, right under the hero */}
      <section className="bg-white pt-6 xl:pt-2" lang="en">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:grid-cols-3 md:px-10">
          {heroPerks.map(({ Icon, color, title, lines }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="flex items-start gap-4">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-[#0B2E5E]">{title}</h3>
                  {lines.map((l) => (
                    <p key={l} className="mt-0.5 text-[15px] leading-snug text-[#0B2E5E]">{l}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* About the program + partner agencies: copy on the left, the two agencies on the right */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold text-primary" lang="en">Patient Assistance Program</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">
              Chemotherapy at Mga <br />
              Gamot sa Cancer
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft md:text-base">
              Ang Getmeds ay nakatuon sa pagsuporta sa kalusugan at kapakanan ng bawat Pilipinong lumalaban sa
              cancer. Sa pamamagitan ng aming Patient Assistance Program, nakikipagtulungan kami sa mga ahensya ng
              gobyerno tulad ng DSWD (AICS) at PCSO (MAP) upang makapagbigay ng tulong medikal, partikular na ang
              libreng chemotherapy at iba pang gamot sa cancer, sa mga higit na nangangailangan.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="font-display text-lg font-semibold text-gray-800">Mga katuwang na ahensya:</p>
            <div className="mt-4 space-y-3" lang="en">
              {[
                { k: "DSWD – AICS", v: "Assistance to Individuals in Crisis Situation" },
                { k: "PCSO", v: "Medical Assistance Program" },
              ].map((a) => (
                <div key={a.k} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                    <HeartHandshake className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-black">{a.k}</h3>
                    <p className="text-sm text-ink-soft">{a.v}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Steps, requirements and FAQs, all visible */}
      <PapGuide />

      {/* Quotation CTA: full-width band that sits directly on the footer */}
      <section className="relative overflow-hidden bg-[#61A644] text-white">
        <Reveal className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
          <div>
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-semibold md:text-4xl">
                  Kailangan ng Quotation para sa Gamot sa Cancer?
                </h2>
                <p className="mt-4 text-white/90">
                  Mag-request ng quotation sa Getmeds para sa cancer at chemotherapy medicines na
                  kailangan para sa inyong DSWD o PCSO application.
                </p>
              </div>
              <div className="space-y-4">
                {/* call + email in one glass card, two columns */}
                <div className="grid gap-4 p-5 sm:grid-cols-2 rounded-2xl border border-white/40 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md">
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 transition hover:opacity-85">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white backdrop-blur-md">
                      <PhoneCall className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-white/85">Tawagan kami</p>
                      <p className="font-display text-lg font-semibold">0919 076 9105</p>
                    </div>
                  </a>
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-3 transition hover:opacity-85">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white backdrop-blur-md">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div lang="en" className="min-w-0">
                      <p className="text-xs text-white/85">Email inquiries</p>
                      <p className="font-display truncate text-lg font-semibold">{contact.email}</p>
                    </div>
                  </a>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/40 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white backdrop-blur-md">
                    <Truck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold">Quotation Delivery</p>
                    <p className="text-[13px] text-white/90 xl:whitespace-nowrap">Mag-request ng quotation at ihahatid namin ito sa inyong tahanan.</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-white/80">
                  Pakilagay ang buong pangalan, aktibong phone number at email address, at i-attach
                  ang valid government ID at prescription para sa mas mabilis na proseso.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
