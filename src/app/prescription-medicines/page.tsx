import type { Metadata } from "next";
import { CircleAlert } from "lucide-react";
import {
  CategoryCard, ConditionChips, FaqGrid, HubBreadcrumb, HubHeading, HubPage, HubSectionTitle, OrderFaqLink,
} from "@/components/CatalogueHub";
import FaqSchema from "@/components/FaqSchema";
import { getCatalogModel } from "@/lib/catalogServer";
import { prescriptionCategories, prescriptionConditions, prescriptionFaqs } from "@/lib/catalogueHub";

// Same cadence as the catalogue it counts.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/prescription-medicines" },
  title: "Prescription Medicines in the Philippines",
  description:
    "Browse Getmeds prescription medicines by category, from oncology and hematology to antibiotics, diabetes and heart medicines. Send an inquiry to order.",
};

export default async function PrescriptionMedicinesPage() {
  const model = await getCatalogModel();
  return (
    <>
      <FaqSchema page="prescription" />
      <HubPage>
        <HubBreadcrumb trail={[{ label: "Home", href: "/" }, { label: "Order medicines", href: "/order-medicines" }, { label: "Prescription medicines" }]} />
        <HubHeading
          title="Prescription Medicines"
          text="Prescription medicines by category, from oncology and hematology to antibiotics, diabetes, heart and kidney medicines, for patients, doctors, pharmacies and hospitals across the Philippines."
        />

        <p className="mt-6 flex items-start gap-2.5 rounded-3xl border border-[#f3c9c9] bg-[#fdf1f0] px-4 py-3 text-sm text-[#b00020]">
          <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          Patients need a valid prescription to order these medicines. Doctors, hospitals, clinics and pharmacies order through a verified partner account.
        </p>

        <section className="mt-12">
          <HubSectionTitle>Browse by category</HubSectionTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {prescriptionCategories.map((card, i) => (
              <CategoryCard key={card.name} card={card} model={model} highlight={i === 0} withText />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <HubSectionTitle>Browse by condition</HubSectionTitle>
          <p className="mt-1.5 text-sm text-ink-soft">Looking for medicines for a specific condition? Browse by condition or see all conditions A–Z.</p>
          <ConditionChips chips={prescriptionConditions} model={model} allLabel="All conditions A–Z →" />
        </section>

        <section className="mt-12">
          <HubSectionTitle>Frequently asked questions</HubSectionTitle>
          <FaqGrid items={prescriptionFaqs} />
          <OrderFaqLink />
        </section>
      </HubPage>
    </>
  );
}
