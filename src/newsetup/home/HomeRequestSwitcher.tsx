"use client";

/**
 * NEW SETUP — homepage "Need help ordering your medicines?".
 * Layout: full-width band — dark navy panel left (headline, "I am a:" switcher, pill CTA + round arrow),
 * photo of the selected customer type bleeding to the right edge with a navy fade and caption overlay.
 * Content and destinations are the low-fidelity prototype's Section 06 (ARIA tabs, default Patient).
 * Photos: v2's /assets/order-medicines (Unsplash License — see CREDITS.md there).
 */
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import "../newsetup.css";

type Action = { label: string; href: string };
type CustomerTab = {
  key: string;
  tab: string;
  title: string;
  text: string;
  primary: Action;
  more: Action[];
  image: string;
  alt: string;
};

const TYPES: CustomerTab[] = [
  {
    key: "patient",
    tab: "Patient",
    title: "Patients & Families",
    text: "Upload your prescription or medicine list, or find a medicine in our product range and inquire from its page. Prescription-only medicines are verified by a licensed pharmacist.",
    primary: { label: "Upload Prescription", href: "/order-medicines/patients?mode=upload#request-form" },
    more: [{ label: "Browse Medicines", href: "/product-range" }],
    image: "/assets/order-medicines/ordermedicinepatient.jpg",
    alt: "A patient and family member receiving medicine support",
  },
  {
    key: "doctor",
    tab: "Doctor",
    title: "Doctors & Healthcare Professionals",
    text: "Check medicine availability, request product information and documentation, request supply, or start a patient access / CSP inquiry.",
    primary: { label: "Start Professional Request", href: "/order-medicines/doctors" },
    more: [{ label: "Product information & inquiries", href: "/professional-inquiry" }],
    image: "/assets/order-medicines/ordermedicinedoctor.jpg",
    alt: "A doctor in a clinical setting",
  },
  {
    key: "distributor",
    tab: "Distributor",
    title: "Distributors & Pharmacies",
    text: "Request a wholesale quotation, check product availability, apply as a business partner, or place a repeat order. Upload your RFQ or product list if you have one.",
    primary: { label: "Start Wholesale Request", href: "/order-medicines/distributors" },
    more: [{ label: "Request a wholesale quotation", href: "/request-quotation?type=distributor" }],
    image: "/assets/order-medicines/ordermedicinedistributor.jpg",
    alt: "Pharmacy shelves and medicine distribution",
  },
  {
    key: "hospital",
    tab: "Hospital",
    title: "Hospitals & Institutions",
    text: "Submit an RFQ, regular or urgent medicine requirement, government bidding inquiry, or purchase order. Upload your procurement documents instead of retyping them.",
    primary: { label: "Start Procurement Request", href: "/order-medicines/hospitals" },
    more: [{ label: "Request a formal quotation", href: "/request-quotation?type=institution" }],
    image: "/assets/order-medicines/ordermedicinehospitals.jpg",
    alt: "A hospital team coordinating medicine procurement",
  },
];

export default function HomeRequestSwitcher() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const t = TYPES[active];

  function onKey(e: React.KeyboardEvent, i: number) {
    const last = TYPES.length - 1;
    const next = e.key === "ArrowRight" ? (i === last ? 0 : i + 1) : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    // Full-width band: dark panel left (content aligned to the page container), photo bleeding to the right edge.
    <section aria-labelledby="ns-help-order-h" className="relative overflow-hidden bg-[#073b57] text-white">
      <div className="grid lg:grid-cols-2">
        {/* ── Left: dark panel ── */}
        <div className="relative z-10 flex flex-col justify-center px-5 py-14 md:px-10 md:py-20 lg:py-24 lg:pr-14 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
          <span aria-hidden className="block h-1 w-12 rounded-full bg-[#7fd0f2]" />
          <span className="mt-6 text-[11px] font-bold uppercase tracking-[0.24em] text-white/60">
            <span className="mr-2">•</span>Order medicines
          </span>
          <h2 id="ns-help-order-h" className="font-display mt-3 max-w-xl text-[2.1rem] font-semibold leading-[1.08] tracking-tight md:text-[2.75rem]">
            Need help ordering your medicines?
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70 md:text-[15px]">
            Have a prescription, medicine list, or supply requirement? Upload your document, or browse our product range. Our team will guide you through the next steps.
          </p>

          <p id="ns-switcher-label" className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            I am a:
          </p>
          <div role="tablist" aria-labelledby="ns-switcher-label" className="mt-2 flex flex-wrap gap-1.5">
            {TYPES.map((x, i) => (
              <button
                key={x.key}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`ns-tab-${x.key}`}
                aria-selected={i === active}
                aria-controls={`ns-panel-${x.key}`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  i === active ? "bg-white text-[#073b57]" : "border border-white/25 text-white hover:border-white/60"
                }`}
              >
                {x.tab}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`ns-panel-${t.key}`} aria-labelledby={`ns-tab-${t.key}`} tabIndex={0} className="mt-7 outline-none">
            <Link href={t.primary.href} className="group inline-flex items-center gap-2">
              <span className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#073b57] transition group-hover:bg-primary-soft">{t.primary.label}</span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition group-hover:brightness-95">
                <ArrowUpRight aria-hidden className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {t.more.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="inline-flex items-center gap-1.5 font-semibold text-[#7fd0f2] hover:text-white">
                    {a.label} <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right: photo to the page edge, navy fade at the seam, caption overlay ── */}
        <div className="relative min-h-[340px] sm:min-h-[420px] lg:min-h-full">
          <AnimatePresence initial={false}>
            <motion.div
              key={t.key}
              initial={reduce ? false : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image src={t.image} alt={t.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#073b57] via-transparent to-[#073b57]/85 lg:bg-gradient-to-r lg:from-[#073b57] lg:via-[#073b57]/10 lg:to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#073b57]/90 to-transparent" />
          <div className="absolute bottom-6 left-5 right-5 max-w-sm md:bottom-10 md:left-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">{t.tab}</p>
            <p className="font-display mt-1 text-xl font-semibold">{t.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/75 md:text-sm">{t.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
