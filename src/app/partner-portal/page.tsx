import type { Metadata } from "next";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { PartnerPortalView } from "@/newsetup/b2b/Portal";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata: Metadata = {
  title: "Partner Ordering",
  description: "Verified Getmeds partners can request quotations, place purchase orders and reorder.",
  alternates: { canonical: "/partner-portal" },
  robots: { index: false, follow: true },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Distributors & pharmacies"
      title="Partner Ordering"
      intro={
        <>
          <p>For verified pharmacies, distributors and institutions: select products, request a quotation or place a purchase order, and reorder from your history.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      trail={[{ label: "Home", href: "/" }, { label: "Order medicines", href: "/order-medicines" }, { label: "Distributors", href: "/order-medicines/distributors" }, { label: "Partner ordering" }]}
    >
      <Suspense fallback={<Loading />}>
        <PartnerPortalView />
      </Suspense>
    </NsPage>
  );
}
