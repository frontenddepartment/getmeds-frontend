import type { Metadata } from "next";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { QuotationReviewView } from "@/newsetup/b2b/Portal";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata: Metadata = {
  title: "Review Quotation",
  description: "Review your Getmeds quotation and submit a purchase order.",
  alternates: { canonical: "/quotation-review" },
  robots: { index: false, follow: true },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Order medicines"
      title="Review Quotation"
      intro={
        <>
          <p>Review the quotation and confirm by submitting your purchase order and documents.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      trail={[{ label: "Home", href: "/" }, { label: "Order medicines", href: "/order-medicines" }, { label: "Review quotation" }]}
    >
      <Suspense fallback={<Loading />}>
        <QuotationReviewView />
      </Suspense>
    </NsPage>
  );
}
