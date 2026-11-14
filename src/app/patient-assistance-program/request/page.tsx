import type { Metadata } from "next";
import FormOptions from "@/newsetup/FormOptions";
import { Suspense } from "react";
import { NsPage, PrototypeBadge } from "@/newsetup/ui";
import { ClientOnly } from "@/newsetup/lib/hydration";
import { AssistanceRequestForm } from "@/newsetup/requests/AssistanceRequestForm";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata: Metadata = {
  title: "Assistance Request — PCSO & DSWD Medicine Quotations",
  description: "Upload your prescription or documents and request a medicine quotation for PCSO or DSWD medical assistance. No account needed.",
  alternates: { canonical: "/patient-assistance-program/request" },
  robots: { index: false, follow: true },
};

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading…</div>;

export default function Page() {
  return (
    <NsPage
      eyebrow="Patient Assistance Program"
      title="Assistance Request"
      intro={
        <>
          <p>Upload what you already have. We will help identify what is missing. No account needed.</p>
          <div className="mt-3">
            <PrototypeBadge />
          </div>
        </>
      }
      trail={[{ label: "Home", href: "/" }, { label: "Patient Assistance Program", href: "/patient-assistance-program" }, { label: "Assistance request" }]}
      layout="form"
      options={<FormOptions kind="pap" title="Patient assistance" />}
      help="Not sure which documents you need? Ask us."
    >
      <Suspense fallback={<Loading />}>
        <ClientOnly fallback={<Loading />}>
          <AssistanceRequestForm />
        </ClientOnly>
      </Suspense>
    </NsPage>
  );
}
