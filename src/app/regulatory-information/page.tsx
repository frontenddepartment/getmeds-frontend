import type { Metadata } from "next";
import Link from "next/link";
import { NsHelp, NsPage, NsSection } from "@/newsetup/ui";

/* NEW SETUP: "Licenses & Compliance" (navbar › About Us), as in the low-fidelity prototype.
   Only facts Getmeds already publishes on getmeds.ph; numbers/dates stay TO BE SUPPLIED until
   the Regulatory team verifies them. */
export const metadata: Metadata = {
  title: "Licenses & Regulatory Compliance",
  description:
    "Getmeds Philippines Inc. licenses and compliance: FDA Philippines License to Operate as importer, wholesaler, distributor and retail pharmacy, PDEA licensing, and DSWD and PCSO accreditation.",
  alternates: { canonical: "/regulatory-information" },
};

const BLOCKS: { title: string; id: string; text: React.ReactNode; todo?: string[] }[] = [
  { id: "company", title: "Legal company name", text: "Getmeds Philippines Inc." },
  {
    id: "fda",
    title: "FDA Philippines License to Operate (LTO)",
    text: "Licensed by the Food and Drug Administration of the Philippines as a wholesaler, importer, distributor and retail pharmacy.",
    todo: ["License number(s)", "Current validity dates", "Licensed address / scope"],
  },
  { id: "pdea", title: "PDEA license", text: "Licensed for the handling of applicable controlled substances (S-4 and S-5).", todo: ["License number and scope"] },
  { id: "programs", title: "Government program accreditation", text: "Accredited provider for DSWD, PCSO and other national government medical assistance programs.", todo: ["Accreditation details"] },
  { id: "verify", title: "How to verify", text: "FDA Philippines publishes licensed establishments.", todo: ["Official FDA verification portal link"] },
  {
    id: "rx",
    title: "Prescription medicines",
    text: (
      <>
        Prescription medicines are dispensed only against a valid prescription after verification by a licensed pharmacist. Getmeds does not issue prescriptions. See
        our{" "}
        <Link href="/prescription-policy" className="font-semibold text-primary">
          Prescription Policy
        </Link>
        .
      </>
    ),
  },
  { id: "csp", title: "Compassionate Special Permits", text: "CSP requests are coordinated by Getmeds and are subject to FDA Philippines approval." },
  {
    id: "adverse",
    title: "Reporting adverse events",
    text: "To report a suspected adverse reaction to a Getmeds product, contact info@getmeds.ph or +63 919 076 9105.",
    todo: ["Pharmacovigilance procedure"],
  },
];

export default function RegulatoryInformationPage() {
  return (
    <NsPage
      eyebrow="About Us"
      title="Licenses & Regulatory Compliance"
      intro={<p>Getmeds&apos; licensed pharmaceutical operations. License numbers and validity dates are shown only after verification by the Getmeds Regulatory team.</p>}
      path="/regulatory-information"
      trail={[{ label: "Home", href: "/" }, { label: "About Us", href: "/about-us" }, { label: "Licenses & compliance" }]}
      aside={<NsHelp title="Questions about our licenses?" text="Our regulatory team can help." />}
    >
      {BLOCKS.map((b) => (
        <NsSection key={b.id} id={b.id} title={b.title}>
          <div className="rounded-2xl border border-[#dde9f2] bg-white p-5 text-sm leading-relaxed text-ink-soft">
            <p>{b.text}</p>
            {b.todo && (
              <ul className="mt-3 space-y-1">
                {b.todo.map((t) => (
                  <li key={t} className="ns-proto">
                    {t}: TO BE SUPPLIED by Regulatory
                  </li>
                ))}
              </ul>
            )}
          </div>
        </NsSection>
      ))}
      <p className="text-sm">
        See also:{" "}
        <Link href="/ungc" className="font-semibold text-primary">
          UN Global Compact
        </Link>{" "}
        ·{" "}
        <Link href="/about-us" className="font-semibold text-primary">
          About Getmeds
        </Link>
      </p>
    </NsPage>
  );
}
