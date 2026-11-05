"use client";

/* Patient Assistance guide: the steps, the per-agency requirements and the FAQs, all shown at
   once (the old site put them behind three tabs). Copy is the old site's Filipino wording. */

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Clock, Globe, MapPin } from "lucide-react";
import { Reveal } from "@/components/ui";
import Faq from "@/components/Faq";
import { papFaqs } from "@/lib/data";

const DOCTOR_DOCS = ["Medical Prescription", "Treatment Protocol", "Medical Abstract / Clinical Summary"];

type Item = { text: string; note?: string; bullets?: string[] };

const DSWD_EXTRA: Item[] = [
  { text: "Photocopy ng valid government-issued ID ng pasyente", note: "Isama rin ang ID ng representative kung sila ang magsusumite." },
  { text: "Social Case Study Report", note: "Mula sa City Social Welfare and Development Office (CSWDO) sa City Hall ng lungsod kung saan kasalukuyang nakatira." },
  { text: "Certificate of Indigency", note: "Makukuha mula sa inyong barangay; kinakailangan para makuha ang iyong Social Case Study Report." },
  { text: "Official Price Quotation para sa mga gamot sa cancer", note: "Makukuha mula sa Getmeds." },
];

const PCSO_EXTRA: Item[] = [
  { text: "Kumpletong PCSO IMAP Application Form", note: "Maaaring i-download mula sa PCSO website." },
  { text: "Photocopy ng valid government-issued ID ng pasyente", note: "Isama rin ang ID ng representative kung sila ang magsusumite." },
  {
    text: "Tatlong (3) official price quotations para sa gamot sa cancer mula sa magkakaibang distributor o supplier",
    bullets: [
      "Ang unang quotation ay makukuha mula sa Getmeds",
      "Ang dalawa pang natitira ay kailangang i-request ng pasyente mula sa ibang distributor o supplier",
    ],
  },
];

const AGENCIES = [
  { name: "DSWD Medical Assistance (AICS)", head: "bg-[#1D9FDA]", tone: "text-[#1D9FDA]", extra: DSWD_EXTRA, Submit: MapPin, submit: "Personal na isumite sa pinakamalapit na DSWD Satellite Office" },
  { name: "PCSO Medical Assistance Program (MAP/IMAP)", head: "bg-[#61A644]", tone: "text-[#61A644]", extra: PCSO_EXTRA, Submit: Globe, submit: "Online submission (soft copy) sa PCSO website" },
];

/* Green check that "ticks itself" when scrolled into view: the circle pops in, then the tick draws. */
function AnimatedCheck({ delay = 0, className = "", bare = false }: { delay?: number; className?: string; bare?: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`shrink-0 ${className}`}
      initial="off"
      whileInView="on"
      viewport={{ once: true, amount: 0.8 }}
    >
      {!bare && (
      <motion.circle
        cx="12"
        cy="12"
        r="11"
        fill="#61A644"
        variants={{ off: { scale: 0.4, opacity: 0 }, on: { scale: 1, opacity: 1 } }}
        transition={{ duration: 0.3, delay, ease: "easeOut" }}
        style={{ originX: "50%", originY: "50%" }}
      />
      )}
      <motion.path
        d={bare ? "M4 12.5l5 5L20 6" : "M7 12.5l3.2 3.2L17 9"}
        fill="none"
        stroke="#fff"
        strokeWidth={bare ? 2.8 : 2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{ off: { pathLength: 0 }, on: { pathLength: 1 } }}
        transition={{ duration: bare ? 0.45 : 0.35, delay: bare ? delay : delay + 0.25, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

function CheckItem({ text, note, bullets, delay = 0, large = false, onBlue = false }: Item & { delay?: number; large?: boolean; onBlue?: boolean }) {
  const strong = onBlue ? "text-white" : "text-gray-800";
  const soft = onBlue ? "text-white/85" : "text-ink-soft";
  return (
    <li className={`flex ${large ? "gap-3" : "gap-2.5"}`}>
      <AnimatedCheck delay={delay} bare={onBlue} className={large ? "mt-0.5 h-5 w-5" : "mt-0.5 h-4 w-4"} />
      <div>
        <p className={`font-semibold leading-snug ${strong} ${large ? "text-[15px] md:text-base" : "text-sm"}`}>{text}</p>
        {note && (
          <p className={`mt-0.5 leading-relaxed ${soft} ${large ? "text-[15px] md:text-base" : "text-xs"}`}>{note}</p>
        )}
        {bullets && (
          <ul className="mt-1 space-y-0.5">
            {bullets.map((b) => (
              <li key={b} className={`leading-relaxed ${soft} ${large ? "text-[15px] md:text-base" : "text-xs"}`}>— {b}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

// Step 3 agency checklist: coloured header is a toggle; the list stays closed until clicked
function AgencyCard({ a, items }: { a: (typeof AGENCIES)[number]; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const panelId = `agency-${a.name.slice(0, 4).toLowerCase()}`;
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-semibold text-white ${a.head}`}
      >
        <span className="lg:whitespace-nowrap">{a.name}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-3 p-5">
            {items.map((it, i) => (
              <CheckItem key={it.text} {...it} delay={i * 0.12} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* Requirements column on the blue band: white pill header above a borderless list (bigger text). */
function RequirementList({ a }: { a: (typeof AGENCIES)[number] }) {
  return (
    <div>
      <p className="inline-flex rounded-full border border-white/50 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md lg:whitespace-nowrap xl:text-[15px]">{a.name}</p>
      <ul className="mt-6 space-y-5">
        {a.extra.map((it, i) => (
          <CheckItem key={it.text} {...it} delay={i * 0.15} large onBlue />
        ))}
      </ul>
      <p className="mt-6 flex items-center gap-2 border-t border-white/30 pt-5 text-[15px] font-medium text-white md:text-base">
        <a.Submit className="h-5 w-5 shrink-0" />
        {a.submit}
      </p>
    </div>
  );
}

function Part({
  kicker,
  title,
  image,
  plain = false,
  bigTitle = false,
  children,
}: {
  kicker: string;
  title: string;
  image?: { src: string; alt: string; width: number; height: number };
  plain?: boolean; // no card border/padding
  bigTitle?: boolean;
  children: React.ReactNode;
}) {
  return (
    // title (and optional image) on the left, sticking while the content scrolls past on desktop
    <Reveal
      className={`grid gap-6 lg:gap-10 ${image ? "lg:grid-cols-[20rem_minmax(0,1fr)]" : "lg:grid-cols-[13rem_minmax(0,1fr)]"} ${
        plain ? "" : "rounded-3xl border border-gray-200 bg-white p-5 md:p-8"
      }`}
    >
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-sm font-semibold text-primary" lang="en">{kicker}</p>
        <h3 className={`font-display mt-1 font-semibold text-black ${bigTitle ? "text-2xl md:text-[2rem]" : "text-xl md:text-2xl"}`}>{title}</h3>
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1024px) 320px, 100vw"
            className="mt-5 h-auto w-full max-w-sm rounded-xl"
          />
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </Reveal>
  );
}

const STEPS: { title: string; body: React.ReactNode }[] = [
  { title: "Kumonsulta sa Iyong Doktor", body: <p>Tanungin ang iyong attending physician tungkol sa government assistance para sa iyong mga gamot sa cancer.</p> },
  {
    title: "Ihanda ang Iyong Mga Medical Documents",
    body: (
      <>
        <p>Kunin ang sumusunod mula sa iyong doktor — original copy, may buong pangalan, pirma, at license number:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DOCTOR_DOCS.map((d) => (
            <span key={d} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">{d}</span>
          ))}
        </div>
      </>
    ),
  },
  {
    title: "Kumpletuhin ang Iyong Application Documents",
    body: (
      <>
        <p>
          Bukod sa mga medikal na dokumento mula sa iyong doktor, may karagdagang requirements na kailangang i-submit, na
          nakadepende sa ahensya ng gobyerno na iyong aaplayan:
        </p>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          {AGENCIES.map((a) => (
            <AgencyCard key={a.name} a={a} items={[...DOCTOR_DOCS.map((text) => ({ text })), ...a.extra]} />
          ))}
        </div>
      </>
    ),
  },
  {
    title: "Makipag-ugnayan sa Aming Team",
    body: <p>Kontakin ang aming Patient Assistance Officer para sa pagsusuri ng inyong requirements at pagkuha ng opisyal na quotation para sa inyong gamot sa cancer.</p>,
  },
  {
    title: "I-submit ang Iyong Requirements",
    body: (
      <div className="overflow-hidden rounded-xl border border-gray-200 text-sm">
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800">
          <div className="px-4 py-2.5">Ahensya</div>
          <div className="border-l border-gray-200 px-4 py-2.5">Paraan ng Pagsumite</div>
        </div>
        {[
          ["DSWD (AICS)", "Personal sa pinakamalapit na DSWD Satellite Office"],
          ["PCSO (MAP / IMAP)", "Online submission sa PCSO website"],
        ].map(([k, v], i) => (
          <div key={k} className={`grid grid-cols-2 ${i === 0 ? "border-b border-gray-200" : ""}`}>
            <div className="px-4 py-3 font-semibold text-gray-800">{k}</div>
            <div className="border-l border-gray-200 px-4 py-3 text-ink-soft">{v}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Hintayin ang Iyong Guarantee Letter (GL)",
    body: <p>Kapag naaprubahan, dalhin ang GL sa nakasaad na supplier para makuha ang gamot. Para sa gabay, makipag-ugnayan sa aming Patient Assistance Officer.</p>,
  },
];


export default function PapGuide() {
  return (
    <section id="steps" className="scroll-mt-28 bg-white pb-12" lang="tl">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <h2 className="font-display text-center text-2xl font-semibold text-black md:text-[2rem]">
          Mga Hakbang Para Makakuha ng Cancer Assistance
        </h2>

        <div className="mt-10 space-y-6">
          {/* 1. Steps */}
          <Part
            kicker="PAP Guide"
            title="Mga Hakbang"
            plain
            image={{ src: "/images/papguide.png", alt: "Young man checking the Patient Assistance Program on his phone", width: 1113, height: 1413 }}
          >
            <ol>
              {STEPS.map((st, i) => {
                const last = i === STEPS.length - 1;
                return (
                  <li key={st.title} className="flex gap-3 md:gap-5">
                    <div className="flex flex-col items-center">
                      {/* "location radius" ring pulsing out of each number, rippling down the steps */}
                      <span
                        className={`step-ping relative isolate flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                          last ? "bg-[#61A644] [--ping:#61A644]" : "bg-[#1D9FDA] [--ping:#1D9FDA]"
                        }`}
                        style={{ ["--ping-delay" as string]: `${i * 0.35}s` }}
                      >
                        {last ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      {!last && <span aria-hidden className="mt-1 w-px flex-1 bg-gray-200" />}
                    </div>
                    <div className={`min-w-0 flex-1 ${last ? "" : "pb-8"}`}>
                      <h4 className="font-display pt-1 text-base font-semibold text-black md:text-lg">{st.title}</h4>
                      <div className="mt-1.5 space-y-2 text-[15px] leading-relaxed text-ink-soft md:text-base">{st.body}</div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* after step 6: where to claim the medicines */}
            <h4 className="font-display mt-10 text-base font-semibold text-black md:text-lg">Saan Makukuha ang Iyong Mga Gamot</h4>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Pagkatapos matanggap ang inyong Guarantee Letter (GL) mula sa ahensiya, maaari kayong pumunta sa aming opisina
              upang makuha ang inyong gamot.
            </p>
          </Part>

        </div>
      </div>

      {/* 2. Requirements: full-width brand-blue band */}
      <div className="mt-12 bg-[#1D9FDA] py-12 text-white md:py-16">
        <Reveal className="mx-auto grid max-w-7xl gap-6 px-5 md:px-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-semibold text-white/85" lang="en">Documents</p>
            <h3 className="font-display mt-1 text-xl font-semibold text-white md:text-2xl">Requirements</h3>
          </div>
          <div className="min-w-0">
            <p className="text-[15px] leading-relaxed text-white/90 md:text-base">
              Bukod sa Medical Prescription, Treatment Protocol, at Medical Abstract / Clinical Summary na kinukuha mula sa
              doktor, kailangan din ang mga sumusunod na dokumento ayon sa ahensyang iyong aaplayan.
            </p>
            <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
              {AGENCIES.map((a) => (
                <RequirementList key={a.name} a={a} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-5 md:px-10">
        <div className="space-y-6">
          {/* 3. FAQs, all answers open */}
          <Part kicker="Tanong" title="FAQs" plain bigTitle>
            {/* all 12 answers stay in the server HTML; FAQPage schema comes from <FaqSchema page="pap" /> */}
            <Faq items={papFaqs} theme="white" initialOpen={null} idPrefix="pap-faq" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                  <MapPin className="h-5 w-5" />
                </span>
                <p className="font-display mt-4 font-semibold text-black">Aming Lokasyon</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-gray-800">Unit 305, 17 Vatican Bldg.,</span> Vatican Drive, BF Resort
                  Village, Las Piñas City, Metro Manila 1747
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#61A644] text-white">
                  <Clock className="h-5 w-5" />
                </span>
                <p className="font-display mt-4 font-semibold text-black">Oras ng Operasyon</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-gray-800">8:00 AM – 5:00 PM,</span> Lunes hanggang Biyernes.
                </p>
              </div>
            </div>
          </Part>
        </div>
      </div>
    </section>
  );
}
