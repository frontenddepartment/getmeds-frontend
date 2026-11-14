import type { Metadata } from "next";
import FormOptions from "@/newsetup/FormOptions";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { PartnerRegistrationForm } from "@/newsetup/b2b/Forms";

// NEW SETUP page (feature/new-ordering-setup) — same flow as the low-fidelity prototype.
export const metadata: Metadata = {
  title: "Partner Registration for Pharmacies & Distributors",
  description: "Register your drugstore, pharmacy or distribution business with Getmeds. Submit your FDA License to Operate for verification and unlock partner pricing and ordering.",
  alternates: { canonical: "/partner-registration" },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Distributors & pharmacies"
      title="Partner Registration"
      intro={
        <>
          <p>Register your business in 3 steps. After we verify your FDA License to Operate and business documents, you can access applicable pricing and place orders.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      path="/partner-registration"
      trail={[{ label: "Home", href: "/" }, { label: "Order medicines", href: "/order-medicines" }, { label: "Distributors", href: "/order-medicines/distributors" }, { label: "Partner registration" }]}
      layout="form"
      options={<FormOptions kind="distributors" title="Other ways to order" />}
      help="Questions about partnership or credit terms?"
    >
      <Suspense fallback={<Loading />}>
        <PartnerRegistrationForm />
      </Suspense>
    </NsPage>
  );
}
