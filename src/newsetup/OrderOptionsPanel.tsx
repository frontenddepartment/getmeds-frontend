/**
 * NEW SETUP — "What would you like to do?" panel shown under each Order Medicines audience hero.
 * Lists that customer type's options; each opens v2's live form (#order-form) or a new prototype workflow.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCustomerType, type CustomerType } from "@/newsetup/data/ordering";
import "./newsetup.css";

export function OptionCards({ type, compact }: { type: CustomerType; compact?: boolean }) {
  return (
    <ul className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {type.options.map((o) => (
        <li key={o.label}>
          <Link
            href={o.href}
            className={`group flex h-full flex-col gap-2 rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
              o.primary ? "border-primary bg-primary text-white" : "border-[#dde9f2] bg-white hover:border-primary"
            }`}
          >
            <span className="flex flex-wrap items-center gap-2">
              {o.primary && <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${o.primary ? "text-white/85" : "text-primary"}`}>Recommended</span>}
              {o.prototype && <span className="ns-proto">Prototype</span>}
            </span>
            <span className={`font-display text-lg font-semibold leading-snug ${o.primary ? "text-white" : "text-primary-deep"}`}>{o.label}</span>
            <span className={`text-sm leading-relaxed ${o.primary ? "text-white/90" : "text-ink-soft"}`}>{o.text}</span>
            <span className={`mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold ${o.primary ? "text-white" : "text-primary"}`}>
              {o.primary ? "Start here" : "Open"}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const AUDIENCES_WITH_FORM = new Set(["patients", "doctors", "distributors", "hospitals"]);

const PANEL_TITLE: Record<string, string> = {
  patients: "How would you like to order?",
  doctors: "What do you need?",
  distributors: "What would you like to do?",
  hospitals: "Select procurement type",
};

export default function OrderOptionsPanel({ audienceSlug }: { audienceSlug?: string }) {
  const type = audienceSlug ? getCustomerType(audienceSlug) : undefined;
  // Every customer type: the options now sit inside the request form panel (AudienceFlow → FormOptions)
  if (!type || AUDIENCES_WITH_FORM.has(type.key)) return null;
  return (
    <section aria-labelledby="ns-options-h" className="bg-white pt-10 md:pt-12">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <span className="ns-label">How can we help?</span>
        <h2 id="ns-options-h" className="font-display mt-3 text-2xl font-medium text-primary-deep md:text-[2rem]">
          {PANEL_TITLE[type.key]}
        </h2>
        <p className="mt-2 max-w-2xl text-ink-soft">{type.summary}</p>
        <div className="mt-6">
          <OptionCards type={type} />
        </div>
      </div>
    </section>
  );
}
