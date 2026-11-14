/**
 * NEW SETUP — independent PCSO / DSWD guidance pages (content: src/newsetup/data/assistance.ts).
 * The request form, review and tracking are shared (/patient-assistance-program/request).
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProgramPage } from "@/newsetup/data/assistance";
import { FlowSteps, LinkButton, NsHelp, NsPage, NsSection, PrototypeBadge } from "@/newsetup/ui";

/** Titles of Getmeds' own published guides (live blog). */
const GUIDE_TITLES: Record<string, string> = {
  "how-to-apply-for-pcso-medical-assistance-program": "PCSO Medicine Assistance: Requirements & How to Apply Online",
  "how-to-get-medical-assistance-from-dswd-your-2025-ultimate-guide": "DSWD Medical Assistance through AICS: Requirements & How to Apply",
};

export const programMetadata = (key: "pcso" | "dswd"): Metadata => {
  const p = getProgramPage(key);
  return { title: p.title, description: p.description, alternates: { canonical: p.path } };
};

export default function ProgramPage({ program }: { program: "pcso" | "dswd" }) {
  const p = getProgramPage(program);
  const start = `/patient-assistance-program/request?program=${p.key}`;
  const agencyShort = p.agency.split(" ")[0];
  const faqs = [
    {
      q: `Can Getmeds approve my ${agencyShort} assistance?`,
      a: "No. Assistance is decided by the agency. Getmeds can help with medicine quotations, checking which documents you have, and coordinating an existing Guarantee Letter where applicable.",
    },
    {
      q: `Is a Getmeds assistance request an official ${agencyShort} application?`,
      a: `No. It is a request to Getmeds for help. You still apply to ${agencyShort} following its current official instructions.`,
    },
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <NsPage
      path={p.path}
      jsonLd={faqJsonLd}
      eyebrow="Patient Assistance Program"
      title={p.h1}
      intro={<p>{p.intro}</p>}
      trail={[{ label: "Home", href: "/" }, { label: "Patient Assistance Program", href: "/patient-assistance-program" }, { label: p.h1 }]}
      aside={
        <>
          <div className="rounded-2xl bg-primary p-5 text-white">
            <p className="font-display text-lg font-semibold">Start with what you have</p>
            <p className="mt-1 text-sm text-white/90">Upload what you already have. We will help identify what is missing.</p>
            <Link href={start} className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:brightness-95">
              Start Assistance Request
            </Link>
            <div className="mt-3">
              <PrototypeBadge>Request form is a prototype — not sent to Getmeds yet</PrototypeBadge>
            </div>
          </div>
          <NsHelp text="Questions about assistance documents or quotations?" />
        </>
      }
    >
      <div className="relative aspect-[16/7] overflow-hidden rounded-3xl bg-primary-soft">
        <Image
          src="/images/papherosection.png"
          alt={`${agencyShort} medical assistance support from Getmeds for patients and families`}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-[70%_40%]"
        />
      </div>

      <NsSection title={`How Getmeds helps with ${agencyShort} medical assistance`} id="getmeds">
        <ul className="space-y-2">
          {p.getmedsHelps.map((t) => (
            <li key={t} className="flex gap-3 rounded-xl border border-[#dde9f2] bg-white p-4 text-sm text-ink-soft">
              <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              {t}
            </li>
          ))}
        </ul>
      </NsSection>

      <NsSection title={`What ${agencyShort} handles`} id="agency">
        <p className="text-sm text-ink-soft">
          <strong className="text-primary-deep">{p.programName}</strong> is run by {p.agency}. The agency decides eligibility and approves assistance — Getmeds does not.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          {p.howAgencyWorks.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </NsSection>

      <NsSection title="Documents you may need" id="requirements">
        <div className="ns-card-dashed text-sm text-ink-soft">
          <p>
            Official requirements are set by {agencyShort} and can change. Check the current official instructions before applying. [Official requirement summary TO BE
            VERIFIED and maintained by Getmeds against current {agencyShort} issuances.]
          </p>
          <p className="mt-2">For a Getmeds medicine quotation you can start with any of: prescription, medicine list, medical abstract, existing quotation, or an existing Guarantee Letter.</p>
        </div>
      </NsSection>

      <NsSection title="How to request a medicine quotation" id="how-to-apply">
        <FlowSteps
          steps={[
            { title: "Upload & choose purpose", text: "Quotation, document check, or existing Guarantee Letter." },
            { title: "Add contact details", text: "Name and mobile number — email optional." },
            { title: "Review & submit", text: "You receive a Getmeds reference number." },
            { title: "Track your request", text: "See updates and upload missing documents from the tracking page." },
          ]}
        />
        <div className="mt-5">
          <LinkButton href={start} primary>
            Start Assistance Request
          </LinkButton>
        </div>
      </NsSection>

      <NsSection title="Official program information" id="official">
        <ul className="space-y-2 text-sm">
          <li>
            <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary">
              Official {p.agency} website <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
          </li>
          {GUIDE_TITLES[p.guideSlug] && (
            <li>
              Our guide:{" "}
              <Link href={`/blog/${p.guideSlug}`} className="font-semibold text-primary">
                {GUIDE_TITLES[p.guideSlug]}
              </Link>
            </li>
          )}
          <li>
            Already submitted?{" "}
            <Link href="/track-order" className="font-semibold text-primary">
              Track your request
            </Link>
          </li>
        </ul>
      </NsSection>

      <NsSection title={`${agencyShort} medical assistance FAQs`} id="faq">
        <div className="space-y-3 text-sm">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-[#dde9f2] p-4">
              <h3 className="font-semibold text-primary-deep">{f.q}</h3>
              <p className="mt-1 text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </NsSection>
    </NsPage>
  );
}
