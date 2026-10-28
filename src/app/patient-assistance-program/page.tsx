"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ClipboardList, FileText, HeartHandshake, Mail, PhoneCall,
  Send, Stethoscope, Timer,
} from "lucide-react";
import { contact } from "@/lib/data";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/ui";
import PageHero from "@/components/PageHero";

const steps = [
  { Icon: Stethoscope, title: "Kumonsulta sa Iyong Doktor", text: "Tanungin ang iyong attending physician tungkol sa government assistance para sa iyong mga gamot sa cancer." },
  { Icon: FileText, title: "Ihanda ang Medical Documents", text: "Kunin mula sa iyong doktor — original copy, may buong pangalan, pirma, at license number: Medical Prescription, Treatment Protocol, at Medical Abstract / Clinical Summary." },
  { Icon: ClipboardList, title: "Kumpletuhin ang Application", text: "May karagdagang requirements depende sa ahensya (DSWD o PCSO) — tingnan ang checklist sa ibaba." },
  { Icon: PhoneCall, title: "Makipag-ugnayan sa Team", text: "Kontakin ang aming Patient Assistance Officer para sa pagsusuri ng requirements at pagkuha ng opisyal na quotation." },
  { Icon: Send, title: "I-submit ang Requirements", text: "DSWD (AICS): personal sa pinakamalapit na DSWD Satellite Office. PCSO (MAP/IMAP): online submission sa PCSO website." },
  { Icon: Timer, title: "Hintayin ang Guarantee Letter", text: "Kapag naaprubahan, dalhin ang GL sa nakasaad na supplier para makuha ang gamot. Ga-gabayan ka ng aming team sa bawat hakbang." },
];

const agencyDocs = {
  dswd: {
    name: "DSWD Medical Assistance (AICS)",
    items: [
      "Medical Prescription",
      "Treatment Protocol",
      "Medical Abstract / Clinical Summary",
      "Photocopy ng valid government-issued ID ng pasyente (isama ang ID ng representative kung sila ang magsusumite)",
      "Social Case Study Report — mula sa City Social Welfare and Development Office (CSWDO)",
      "Certificate of Indigency — makukuha mula sa inyong barangay",
      "Official Price Quotation para sa mga gamot sa cancer — makukuha mula sa Getmeds",
    ],
  },
  pcso: {
    name: "PCSO Medical Assistance Program (MAP / IMAP)",
    items: [
      "Kumpletong PCSO IMAP Application Form — maaaring i-download mula sa PCSO website",
      "Medical Prescription, Treatment Protocol, at Medical Abstract mula sa iyong doktor",
      "Tatlong (3) official price quotations mula sa magkakaibang distributor o supplier",
      "Ang unang quotation ay makukuha mula sa Getmeds",
      "Ang dalawa pang natitira ay i-request mula sa ibang distributor o supplier",
    ],
  },
};

export default function PapPage() {
  const [agency, setAgency] = useState<"dswd" | "pcso">("dswd");
  const docs = agencyDocs[agency];

  return (
    <>
      <PageHero
        eyebrow="Patient Assistance Program"
        title={<>Libreng tulong para sa <span className="text-gradient">chemotherapy at gamot sa cancer.</span></>}
        text="Ang Getmeds ay nakatuon sa pagsuporta sa bawat Pilipinong lumalaban sa cancer. Nakikipagtulungan kami sa DSWD (AICS) at PCSO (MAP) upang makapagbigay ng libreng chemotherapy at iba pang gamot sa cancer sa mga higit na nangangailangan."
      >
        <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="btn-primary" lang="en">
          <PhoneCall className="h-4 w-4" /> Request a Quotation
        </a>
        <a href="#steps" className="btn-ghost">Mga Hakbang</a>
      </PageHero>

      {/* Partner agencies (official English program names) */}
      <section className="pb-6 pt-6 md:pt-0" lang="en">
        <div className="mx-auto grid max-w-4xl gap-4 px-5 sm:grid-cols-2 md:px-6">
          {[
            { k: "DSWD — AICS", v: "Assistance to Individuals in Crisis Situation" },
            { k: "PCSO — MAP", v: "Medical Assistance Program" },
          ].map((a) => (
            <Reveal key={a.k}>
              <div className="glass flex items-center gap-4 rounded-xl p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
                  <HeartHandshake className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-primary-deep">{a.k}</h3>
                  <p className="text-sm text-ink-soft">{a.v}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section id="steps" className="relative py-20">
        <div className="aurora" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="PAP Guide · Mga Hakbang"
            title={<>Anim na hakbang para makakuha ng <span className="text-gradient">cancer assistance.</span></>}
          />
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {steps.map(({ Icon, title, text }, i) => (
              <StaggerItem key={title}>
                <div className="glass relative h-full rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <span className="font-display absolute right-6 top-5 text-4xl font-bold text-primary/10">
                    {i + 1}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
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

      {/* Requirements toggle */}
      <section className="py-10">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Documents · Requirements"
            title={<>Checklist ng mga <span className="text-gradient">kailangang dokumento.</span></>}
            text="Piliin ang ahensya ng gobyerno na iyong aaplayan."
          />
          <Reveal>
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="glass-chip mx-auto flex w-fit rounded-full p-1.5">
                {(["dswd", "pcso"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAgency(a)}
                    className={`relative rounded-full px-6 py-2.5 text-sm font-bold transition ${
                      agency === a ? "text-white" : "text-primary-dark"
                    }`}
                  >
                    {agency === a && (
                      <motion.span
                        layoutId="agency-pill"
                        className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative uppercase">{a}</span>
                  </button>
                ))}
              </div>
              <motion.div
                key={agency}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-7"
              >
                <h3 className="font-display text-center text-lg font-bold text-primary-deep">
                  {docs.name}
                </h3>
                <ul className="mt-5 space-y-3">
                  {docs.items.map((item, i) => (
                    <li key={item} className="flex gap-3 rounded-lg bg-white/55 p-4 text-sm text-ink-soft ring-1 ring-primary/10">
                      <span className="font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-dark">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quotation CTA */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-10 text-white md:p-14">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-bold md:text-4xl">
                  Kailangan ng quotation para sa gamot sa cancer?
                </h2>
                <p className="mt-4 text-white/70">
                  Mag-request ng quotation sa Getmeds para sa cancer at chemotherapy medicines na
                  kailangan para sa inyong DSWD o PCSO application — ihahatid pa namin ito sa
                  inyong tahanan.
                </p>
              </div>
              <div className="space-y-4">
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="glass-dark flex items-center gap-4 rounded-xl p-5 transition hover:bg-white/10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                    <PhoneCall className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/50">Tawagan kami</p>
                    <p className="font-display text-lg font-bold">0919 076 9105</p>
                  </div>
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="glass-dark flex items-center gap-4 rounded-xl p-5 transition hover:bg-white/10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div lang="en">
                    <p className="text-xs uppercase tracking-wider text-white/50">Email inquiries</p>
                    <p className="font-display text-lg font-bold">{contact.email}</p>
                  </div>
                </a>
                <p className="text-xs leading-relaxed text-white/50">
                  Pakilagay ang buong pangalan, aktibong phone number at email address, at i-attach
                  ang valid government ID at prescription para sa mas mabilis na proseso.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="text-center">
          <Link href="/order-medicines" className="btn-ghost">
            Paano mag-order ng gamot <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
