/**
 * NEW SETUP — homepage bands: PCSO/DSWD assistance, and "Need help? / Track a request".
 * Same section pattern as v2's homepage (• label, Poppins heading in primary-deep, max-w-7xl).
 */
import Link from "next/link";
import { ArrowUpRight, HeartHandshake, MessageCircle, PackageSearch } from "lucide-react";
import "../newsetup.css";

export function HomeAssistance() {
  const cards = [
    {
      href: "/patient-assistance-program/pcso",
      title: "PCSO Medical Assistance",
      text: "Get help with medicine quotations, document requirements, and coordination involving an existing PCSO Guarantee Letter, when applicable.",
      cta: "PCSO Assistance",
    },
    {
      href: "/patient-assistance-program/dswd",
      title: "DSWD Medical Assistance",
      text: "Request medicine quotations and guidance on applicable DSWD medical assistance (AICS) requirements.",
      cta: "DSWD Assistance",
    },
  ];
  return (
    <section aria-labelledby="ns-pap-h" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
        <div className="grid items-end gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <span className="ns-label">Patient Assistance Program</span>
            <h2 id="ns-pap-h" className="font-display mt-4 text-3xl font-medium leading-tight text-primary-deep md:text-[2.5rem]">
              Helping you access the medicines you need.
            </h2>
          </div>
          <p className="leading-relaxed text-ink-soft lg:pb-1.5">
            Get assistance with medicine quotations, document requirements, and guidance for applicable PCSO and DSWD medical assistance programs.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {cards.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="group flex h-full gap-5 rounded-3xl bg-[#1D9FDA] p-6 text-white transition hover:-translate-y-1 md:p-8">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <HeartHandshake aria-hidden className="h-6 w-6" />
                </span>
                <span className="flex flex-col gap-2">
                  <span className="font-display text-xl font-semibold">{c.title}</span>
                  <span className="text-sm leading-relaxed text-white/90">{c.text}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {c.cta} <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-soft">Getmeds does not approve government assistance. PCSO and DSWD decide on applications under their own programs.</p>
      </div>
    </section>
  );
}

export function HomeHelp() {
  return (
    <section aria-labelledby="ns-help-h" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16">
        <span className="ns-label">Customer support</span>
        <h2 id="ns-help-h" className="font-display mt-4 text-3xl font-medium leading-tight text-primary-deep md:text-[2.5rem]">
          Need help? We&apos;re here for you.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/contact-us" className="group flex items-start gap-5 rounded-3xl border border-[#dde9f2] bg-white p-6 transition hover:border-primary md:p-8">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <MessageCircle aria-hidden className="h-6 w-6" />
            </span>
            <span>
              <span className="font-display block text-xl font-semibold text-primary-deep">Contact our team</span>
              <span className="mt-1 block text-sm text-ink-soft">For general concerns, product questions, and assistance with existing requests.</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Contact Us <ArrowUpRight aria-hidden className="h-4 w-4" />
              </span>
            </span>
          </Link>
          <Link href="/track-order" className="group flex items-start gap-5 rounded-3xl border border-[#dde9f2] bg-white p-6 transition hover:border-primary md:p-8">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <PackageSearch aria-hidden className="h-6 w-6" />
            </span>
            <span>
              <span className="font-display block text-xl font-semibold text-primary-deep">Already have a request?</span>
              <span className="mt-1 block text-sm text-ink-soft">Check your request status, review updates, or upload documents we asked for.</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Track Request <ArrowUpRight aria-hidden className="h-4 w-4" />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
