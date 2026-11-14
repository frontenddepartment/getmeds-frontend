import type { Metadata } from "next";
import FormOptions from "@/newsetup/FormOptions";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { TrackOrderView } from "@/newsetup/tracking/TrackViews";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata: Metadata = {
  title: "Track Your Request",
  description: "Track your Getmeds quotation, purchase order or assistance request using your reference number.",
  alternates: { canonical: "/track-order" },
  robots: { index: false, follow: true },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Track"
      title="Track Your Request"
      intro={
        <>
          <p>Enter your reference number to see the latest status of your quotation, purchase order or assistance request.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      trail={[{ label: "Home", href: "/" }, { label: "Track your request" }]}
      layout="form"
      options={<FormOptions kind="track" title="Start a new request" />}
      help="Lost your reference number? Contact us with your name and mobile number."
    >
      <Suspense fallback={<Loading />}>
        <TrackOrderView />
      </Suspense>
    </NsPage>
  );
}
