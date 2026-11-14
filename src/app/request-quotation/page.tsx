import type { Metadata } from "next";
import FormOptions from "@/newsetup/FormOptions";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { QuotationForm } from "@/newsetup/b2b/Forms";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata: Metadata = {
  title: "Request a Quotation for Hospitals & Pharmacies",
  description: "Request a formal medicine quotation from Getmeds for regular, urgent or government bidding procurement, or submit a purchase order. Upload your RFQ or procurement documents.",
  alternates: { canonical: "/request-quotation" },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Order medicines"
      title="Request a Quotation"
      intro={
        <>
          <p>Upload your RFQ, product list or purchase order — no retyping. We confirm availability and applicable pricing in a formal quotation.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      path="/request-quotation"
      trail={[{ label: "Home", href: "/" }, { label: "Order medicines", href: "/order-medicines" }, { label: "Request a quotation" }]}
      layout="form"
      options={<FormOptions kind="quotation" title="Other ways to order" />}
      help="Urgent requirement? Call us after submitting."
    >
      <Suspense fallback={<Loading />}>
        <QuotationForm />
      </Suspense>
    </NsPage>
  );
}
