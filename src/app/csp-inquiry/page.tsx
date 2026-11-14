import type { Metadata } from "next";
import FormOptions from "@/newsetup/FormOptions";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { CspInquiryForm } from "@/newsetup/b2b/Forms";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata: Metadata = {
  title: "Compassionate Special Permit (CSP) Inquiry",
  description: "Request Getmeds coordination of a Compassionate Special Permit (CSP) application for physicians and institutions. Every request is subject to FDA Philippines approval.",
  alternates: { canonical: "/csp-inquiry" },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Doctors & healthcare professionals"
      title="Compassionate Special Permit (CSP) Inquiry"
      intro={
        <>
          <p>For physicians and institutions seeking access to a medicine not yet registered in the Philippines. Getmeds coordinates the application; approval rests with FDA Philippines.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      path="/csp-inquiry"
      trail={[{ label: "Home", href: "/" }, { label: "Order medicines", href: "/order-medicines" }, { label: "Doctors", href: "/order-medicines/doctors" }, { label: "CSP inquiry" }]}
      layout="form"
      options={<FormOptions kind="doctors" title="What else do you need?" />}
      help="Our regulatory team can explain the CSP process."
    >
      <Suspense fallback={<Loading />}>
        <CspInquiryForm />
      </Suspense>
    </NsPage>
  );
}
