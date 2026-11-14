"use client";

/**
 * NEW SETUP — the "How would you like to order?" option cards, stacked in the left column of every
 * form panel. The card for the form you are on is highlighted ("You're here"); the others let the
 * customer switch to the right workflow without leaving the page first.
 */
import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { CUSTOMER_TYPES, getCustomerType, type OrderOption } from "@/newsetup/data/ordering";

type Kind = "patients" | "doctors" | "distributors" | "hospitals" | "quotation" | "pap" | "track";

const PAP_OPTIONS: OrderOption[] = [
  { label: "Start an assistance request", text: "Upload what you already have — we help identify what is missing.", href: "/patient-assistance-program/request", primary: true, prototype: true },
  { label: "PCSO Medical Assistance", text: "What PCSO usually asks for and how we help with quotations.", href: "/patient-assistance-program/pcso" },
  { label: "DSWD Assistance (AICS)", text: "What DSWD usually asks for and how we help with quotations.", href: "/patient-assistance-program/dswd" },
  { label: "Eligibility & requirements", text: "Documents to prepare before you apply.", href: "/patient-assistance-program#requirements" },
];

const TRACK_OPTIONS: OrderOption[] = CUSTOMER_TYPES.map((c, i) => ({ label: c.title, text: c.summary, href: c.path, primary: i === 0 }));
const BROWSE: OrderOption = { label: "Browse medicines", text: "Search the product range and open a product for details and inquiries.", href: "/product-range" };
const TRACK_LINK: OrderOption = { label: "Track a request", text: "Already submitted? Check the status with your reference number.", href: "/track-order" };

/** Same page + every query value of the option present in the URL → this is the form you are on. */
function isCurrent(href: string, pathname: string, params: URLSearchParams) {
  const u = new URL(href.split("#")[0], "https://x");
  if (u.pathname !== pathname) return false;
  for (const [k, v] of u.searchParams) if (params.get(k) !== v) return false;
  // with no query in the option, only match when the page itself has no distinguishing query
  return u.searchParams.size > 0 || ![...params.keys()].some((k) => k === "type" || k === "procurement");
}

function Cards({ kind, title, inline }: { kind: Kind; title: string; inline?: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const resolved: Kind = kind === "quotation" ? (params.get("type") === "distributor" ? "distributors" : "hospitals") : kind;
  const base = resolved === "pap" ? PAP_OPTIONS : resolved === "track" ? TRACK_OPTIONS : getCustomerType(resolved)?.options ?? [];
  // quotation page: also the business routes that are NOT a quotation (availability, partner registration / ordering)
  const extra =
    kind === "quotation" ? getCustomerType("distributors")?.options ?? [] : resolved === "doctors" ? [BROWSE] : [];
  const all = [...base, ...extra];
  const samePage = (o: OrderOption) => new URL(o.href.split("#")[0], "https://x").pathname === pathname;
  // Audience pages (inline): every card of that customer type; the one matching the form on the page is
  // marked. Standalone form pages: the form already offers its own choices, so only OTHER destinations.
  // Both end with "Track a request".
  const seen = new Set<string>();
  const options = [...(inline ? all : all.filter((o) => !samePage(o))), ...(kind === "track" ? [] : [TRACK_LINK])].filter((o) =>
    seen.has(o.href) ? false : (seen.add(o.href), true),
  );
  const matched = options.filter((o) => isCurrent(o.href, pathname, params));
  // nothing in the URL yet → the form shows its default, which is the recommended same-page card
  const fallback = inline && !matched.length ? options.find((o) => samePage(o) && o.primary) ?? options.find(samePage) : undefined;
  const here = (o: OrderOption) => matched.includes(o) || o === fallback;
  const anyHere = options.some(here);

  return (
    <nav aria-label={title} className="border-t border-[#e3e8ee] pt-7 lg:mt-9">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">{title}</p>
      <ul className="mt-4 space-y-3">
        {options.map((o) => {
          const current = here(o);
          const filled = o.primary && !anyHere && !current;
          return (
            <li key={o.label}>
              <Link
                href={o.href}
                aria-current={current ? "page" : undefined}
                className={`group flex items-start gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                  current
                    ? "border-primary bg-white shadow-[0_0_0_3px_rgba(29,159,218,0.15)]"
                    : filled
                      ? "border-primary bg-primary text-white"
                      : "border-[#e3e8ee] bg-white hover:border-primary"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    {current && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                        <Check aria-hidden className="h-3 w-3" /> You&apos;re here
                      </span>
                    )}
                    {filled && <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/85">Recommended</span>}
                    {o.prototype && !filled && !current && <span className="ns-proto">Prototype</span>}
                  </span>
                  <span className={`font-display mt-1 block text-[15px] font-semibold leading-snug ${filled ? "text-white" : "text-primary-deep"}`}>{o.label}</span>
                  <span className={`mt-1 block text-[13px] leading-relaxed ${filled ? "text-white/90" : "text-ink-soft"}`}>{o.text}</span>
                </span>
                <ArrowRight
                  aria-hidden
                  className={`mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${filled ? "text-white" : "text-primary"}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function FormOptions({ kind, title = "Other ways we can help", inline }: { kind: Kind; title?: string; inline?: boolean }) {
  return (
    <Suspense fallback={null}>
      <Cards kind={kind} title={title} inline={inline} />
    </Suspense>
  );
}
