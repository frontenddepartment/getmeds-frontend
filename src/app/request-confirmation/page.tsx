import type { Metadata } from "next";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { RequestConfirmationView } from "@/newsetup/b2b/Portal";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata: Metadata = {
  title: "Request Received",
  description: "Your request to Getmeds has been received.",
  alternates: { canonical: "/request-confirmation" },
  robots: { index: false, follow: true },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Thank you"
      title="Request Received"
      intro={
        <>
          <p>Your request has a reference number you can use to track it.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      trail={[{ label: "Home", href: "/" }, { label: "Request received" }]}
    >
      <Suspense fallback={<Loading />}>
        <RequestConfirmationView />
      </Suspense>
    </NsPage>
  );
}
