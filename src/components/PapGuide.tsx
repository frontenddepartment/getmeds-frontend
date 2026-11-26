"use client";

/* Patient Assistance guide: the steps, the per-agency requirements and the FAQs, all shown at
   once (the old site put them behind three tabs). Copy is the old site's Filipino wording. */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Clock, Globe, MapPin } from "lucide-react";
import { Reveal } from "@/components/ui";
import Faq from "@/components/Faq";
import { papFaqs } from "@/lib/data";

const MALASAKIT_ACT = "https://ldr.senate.gov.ph/subject/malasakit-centers-act";
const bulletList = "list-disc space-y-1.5 pl-5 marker:text-primary";
const inlineLink = "font-semibold text-primary underline underline-offset-2 hover:text-primary-deep";

/* Official sources: followed (no nofollow), opening in a new tab. */
function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={inlineLink}>
      {children}
    </a>
  );
}

/* A plain H2 section: heading on the left (sticky on desktop), copy on the right. */
function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-4 py-8 first:pt-0 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10">
      <h2 className="font-display text-xl font-semibold text-black md:text-2xl lg:sticky lg:top-28 lg:self-start">{title}</h2>
      <div className="min-w-0 space-y-3 text-[15px] leading-relaxed text-ink-soft md:text-base">{children}</div>
    </Reveal>
  );
}

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
  h2 = false,
  children,
}: {
  kicker: string;
  title: string;
  image?: { src: string; alt: string; width: number; height: number };
  plain?: boolean; // no card border/padding
  bigTitle?: boolean;
  h2?: boolean; // a top-level section of the page rather than a part of the steps guide
  children: React.ReactNode;
}) {
  const Heading = h2 ? "h2" : "h3";
  return (
    // title (and optional image) on the left, sticking while the content scrolls past on desktop
    <Reveal
      className={`grid gap-6 lg:gap-10 ${image ? "lg:grid-cols-[20rem_minmax(0,1fr)]" : "lg:grid-cols-[13rem_minmax(0,1fr)]"} ${
        plain ? "" : "rounded-3xl border border-gray-200 bg-white p-5 md:p-8"
      }`}
    >
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-sm font-semibold text-primary" lang="en">{kicker}</p>
        <Heading className={`font-display mt-1 font-semibold text-black ${bigTitle ? "text-2xl md:text-[2rem]" : "text-xl md:text-2xl"}`}>{title}</Heading>
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

            {/* after step 6: using the GL to claim the medicines */}
            <h3 className="font-display mt-10 text-base font-semibold text-black md:text-lg">Paano Gamitin ang Guarantee Letter (GL)</h3>
            <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-ink-soft md:text-base">
              <p>
                Ang GL ay nakapangalan sa isang partikular na supplier, at doon lang ito magagamit para kunin ang gamot. Bago
                ka umalis sa opisina ng DSWD o PCSO, i-check ang mga ito:
              </p>
              <ul className={bulletList}>
                <li>Tama ba ang pangalan ng supplier?</li>
                <li>Tama ba ang gamot at ang dami, at tama ba ang spelling ng pangalan ng pasyente?</li>
                <li>Hanggang kailan valid ang GL?</li>
                <li>Ano ang mangyayari kung may balanseng hindi sakop ng GL?</li>
              </ul>
              <p>
                Kapag nasa iyo na ang GL, dalhin ito sa Getmeds office para sa pagkuha ng gamot, kasama ang valid ID. Ang mga
                reseta ay kailangang mula sa lisensyadong doktor, at dumadaan sa pharmacist verification bago i-dispense ang
                gamot.
              </p>
            </div>
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
        {/* 3. Who can apply, where, document tips, repeat cycles and other help */}
        <div className="divide-y divide-gray-200">
          <InfoSection title="Sino ang Puwedeng Mag-apply?">
            <p>
              Ang DSWD at PCSO ang nagpapasya kung sino ang makakatanggap ng tulong. Sa DSWD, social worker ang
              nag-iinterbyu at tumitingin sa sitwasyon ng pasyente at pamilya. Hindi lang ito para sa pinakamahirap;
              tinitingnan din kung may krisis o kakulangan sa pambayad sa gamot. Kung kapamilya ang mag-a-apply para sa
              pasyente, karaniwang hindi na kailangan ng authorization letter. Kung hindi kapamilya, magdala ng signed
              authorization letter at kopya ng ID ng pasyente. Magdala rin ng valid ID ng kumakatawan.
            </p>
          </InfoSection>

          <InfoSection title="Saan Mag-apply sa DSWD?">
            <p>
              Maaari kang pumunta sa DSWD field office o satellite office na pinakamalapit sa inyo. Kung hindi ka sigurado
              sa lokasyon, tanungin ang city o municipal social welfare office.
            </p>
            <p>
              Sa mga government hospital, may Malasakit Center din, isang one-stop shop na may kinatawan ng DOH, DSWD, PCSO
              at PhilHealth, ayon sa <ExternalLink href={MALASAKIT_ACT}>Republic Act No. 11463</ExternalLink>. Doon, pwedeng
              mag-asikaso ng tulong nang hindi na lilipat-lipat ng opisina.
            </p>
          </InfoSection>

          <InfoSection title="Mga Tip sa Paghahanda ng Dokumento">
            <ul className={bulletList}>
              <li>
                Ang mga medical document (reseta, treatment protocol, medical abstract) ay karaniwang tinatanggap kung hindi
                lumipas ang mga tatlong buwan mula nang ipalabas. Itanong ito sa opisina bago pumunta.
              </li>
              <li>Siguraduhing magkakapareho ang pangalan ng pasyente sa lahat ng dokumento, kasama ang ID.</li>
              <li>Dapat nakasulat sa dokumento ng doktor ang buong pangalan, pirma, at license number.</li>
              <li>Magdala ng original at hindi bababa sa dalawang photocopy ng bawat dokumento.</li>
              <li>
                Humingi ng official price quotation sa amin bago pumunta sa DSWD o PCSO para hindi maantala ang aplikasyon.
              </li>
            </ul>
            <p>
              Ang mga hinihingi ay maaaring magkaiba sa bawat opisina at nagbabago paminsan-minsan. Tawagan o bisitahin ang
              opisina bago pumunta para makumpirma ang kasalukuyang listahan.
            </p>
          </InfoSection>

          <InfoSection title="Kung Paulit-ulit ang Gamutan">
            <p>
              Ang chemotherapy ay karaniwang may ilang cycle. Itanong sa DSWD o PCSO kung kailan puwedeng mag-apply ulit para
              sa susunod na cycle, at ihanda nang maaga ang bagong reseta at quotation para hindi maantala ang gamutan.
            </p>
          </InfoSection>

          <InfoSection title="Ibang Tulong na Puwedeng Lapitan">
            <p>Bukod sa DSWD at PCSO, may iba pang mapagkukunan ng tulong sa gastos ng gamot:</p>
            <ul className={bulletList}>
              <li>Office of the President at Office of the Vice President (medical assistance)</li>
              <li>PhilHealth benefits para sa cancer</li>
              <li>Lokal na pamahalaan (LGU) ng inyong lungsod o munisipyo</li>
              <li>Philippine Cancer Society</li>
            </ul>
            <p>
              Maaari ka ring magbasa ng aming mga gabay:{" "}
              <Link href="/blog/how-to-get-medical-assistance-from-dswd-your-2025-ultimate-guide" className={inlineLink}>
                Paano Mag-apply sa DSWD AICS
              </Link>
              ,{" "}
              <Link href="/blog/how-to-apply-for-pcso-medical-assistance-program" className={inlineLink}>
                Paano Mag-apply sa PCSO Medical Assistance
              </Link>
              , at{" "}
              <Link href="/blog/how-to-reduce-cancer-treatment-costs-in-the-philippines" className={inlineLink}>
                Paano Bawasan ang Gastos sa Gamutan ng Cancer
              </Link>
              .
            </p>
          </InfoSection>
        </div>

        <div className="mt-12 space-y-6">
          {/* 4. FAQs */}
          <Part kicker="Tanong" title="FAQs" plain bigTitle h2>
            {/* all 16 answers stay in the server HTML; FAQPage schema comes from <FaqSchema page="pap" /> */}
            <Faq items={papFaqs} theme="white" initialOpen={null} idPrefix="pap-faq" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9FDA] text-white">
                  <MapPin className="h-5 w-5" />
                </span>
                <p className="font-display mt-4 font-semibold text-black">Aming Lokasyon</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-gray-800">Unit 301 &amp; 305, 17 Vatican Bldg.,</span> Vatican City
                  Drive, B.F. Resort Village, Talon II, Las Piñas City, Metro Manila 1747
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#61A644] text-white">
                  <Clock className="h-5 w-5" />
                </span>
                <p className="font-display mt-4 font-semibold text-black">Oras ng Operasyon</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-gray-800">Monday to Saturday,</span> 7:00 AM to 4:00 PM
                </p>
              </div>
            </div>
          </Part>
        </div>

        {/* 5. License, last updated and sources (license numbers are typed text, no dates) */}
        <div className="mt-12 space-y-3 border-t border-gray-200 pt-6 text-[13px] leading-relaxed text-ink-soft">
          <p>
            Ang Getmeds Philippines Inc. ay lisensyado ng FDA Philippines bilang Drugstore na may online ordering at delivery
            (LTO No. CDRR-NCR-DS-295793) at bilang Drug Distributor-Importer/Wholesaler (LTO No. CDRR-NCR-DI/W-418260).
          </p>
          <p>
            Huling na-update: 21 Nobyembre 2026. Ang impormasyong ito ay pangkalahatang gabay lamang at hindi kapalit ng payo
            ng doktor. Ang mga requirement at proseso ng DSWD at PCSO ay maaaring magbago; kumpirmahin sa mismong opisina bago
            mag-apply.
          </p>
          <p>
            Mga Pinagkunan: <ExternalLink href="https://www.dswd.gov.ph">DSWD</ExternalLink>,{" "}
            <ExternalLink href="https://www.pcso.gov.ph">PCSO</ExternalLink>,{" "}
            <ExternalLink href={MALASAKIT_ACT}>Republic Act No. 11463</ExternalLink> (Malasakit Centers Act), Philippine
            Cancer Society.
          </p>
        </div>
      </div>
    </section>
  );
}
