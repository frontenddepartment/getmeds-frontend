"use client";

/**
 * NEW SETUP — the request form on each Order Medicines audience page (#request-form), in the shared
 * form panel: intro + contact details + that customer's option cards on the left, the form on the right.
 * Patients: upload prescription / medicine list. Doctors: professional request. Distributors: wholesale
 * quotation. Hospitals: procurement request. The option cards switch the request type in place.
 * Replaces v2's single-page forms on these pages (see NEW_SETUP_FORMS in OrderMedicinesClient.tsx).
 */
import { Suspense } from "react";
import { ClientOnly } from "@/newsetup/lib/hydration";
import { PatientRequestForm } from "@/newsetup/requests/PatientRequestForm";
import { ProfessionalInquiryForm, QuotationForm } from "@/newsetup/b2b/Forms";
import { FormPanel, PrototypeBadge } from "@/newsetup/ui";
import FormOptions from "@/newsetup/FormOptions";
import "./newsetup.css";

const Loading = () => <div className="ns-card-dashed text-sm text-ink-soft">Loading form…</div>;

type Audience = "patients" | "doctors" | "distributors" | "hospitals";

const PANELS: Record<Audience, { title: string; intro: string; help: string; options: string; form: React.ReactNode }> = {
  patients: {
    title: "Upload Prescription or Medicine List",
    intro: "Tell us what you need in three short steps. You'll get a reference number to track your request.",
    help: "Prescription questions? Our pharmacists can help.",
    options: "How would you like to order?",
    form: <PatientRequestForm />,
  },
  doctors: {
    title: "Professional Request",
    intro: "Availability, product information, documentation, supply or patient access — two short steps. Availability and product questions need no credentials.",
    help: "Questions before submitting? Our medical and sales team can help.",
    options: "What do you need?",
    form: <ProfessionalInquiryForm inline />,
  },
  distributors: {
    title: "Request a Wholesale Quotation",
    intro: "Upload your product list or RFQ — no registration needed. We confirm availability and applicable pricing in a formal quotation.",
    help: "Questions about partnership or credit terms?",
    options: "What would you like to do?",
    form: <QuotationForm audience="distributor" />,
  },
  hospitals: {
    title: "Submit a Procurement Request",
    intro: "Upload your RFQ, purchase order or tender documents — no retyping. Pick the procurement type in the form.",
    help: "Urgent requirement? Call us after submitting.",
    options: "Select procurement type",
    form: <QuotationForm audience="institution" />,
  },
};

export default function AudienceFlow({ audienceSlug }: { audienceSlug?: string }) {
  const key = audienceSlug as Audience;
  const panel = PANELS[key];
  if (!panel) return null;
  return (
    <section id="request-form" className="scroll-mt-28">
      <FormPanel
        id="request-form-h"
        eyebrow="Order medicines"
        title={panel.title}
        intro={
          <>
            <p>{panel.intro}</p>
            <div className="mt-3">
              <PrototypeBadge />
            </div>
          </>
        }
        help={panel.help}
        options={<FormOptions kind={key} title={panel.options} inline />}
      >
        <Suspense fallback={<Loading />}>
          <ClientOnly fallback={<Loading />}>{panel.form}</ClientOnly>
        </Suspense>
      </FormPanel>
    </section>
  );
}
