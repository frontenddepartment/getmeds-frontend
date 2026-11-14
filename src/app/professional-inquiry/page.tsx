import type { Metadata } from "next";
import FormOptions from "@/newsetup/FormOptions";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { ProfessionalInquiryForm } from "@/newsetup/b2b/Forms";

// NEW SETUP page (feature/new-ordering-setup) — same flow as the low-fidelity prototype.
export const metadata: Metadata = {
  title: "Professional Inquiry for Doctors & HCPs",
  description: "Doctors and healthcare professionals can ask Getmeds about medicine availability, product information, documentation, medicine supply and patient access. Simple questions need no credentials.",
  alternates: { canonical: "/professional-inquiry" },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Doctors & healthcare professionals"
      title="Professional Inquiry"
      intro={
        <>
          <p>Medicine availability, product information, documentation, supply or patient access. Availability and product questions don&apos;t need credential verification.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      path="/professional-inquiry"
      trail={[{ label: "Home", href: "/" }, { label: "Order medicines", href: "/order-medicines" }, { label: "Doctors", href: "/order-medicines/doctors" }, { label: "Professional inquiry" }]}
      layout="form"
      options={<FormOptions kind="doctors" title="What else do you need?" />}
      help="Questions before submitting? Our medical and sales team can help."
    >
      <Suspense fallback={<Loading />}>
        <ProfessionalInquiryForm />
      </Suspense>
    </NsPage>
  );
}
