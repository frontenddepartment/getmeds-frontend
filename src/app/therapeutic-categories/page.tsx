import type { Metadata } from "next";
import ProductRangeHub from "@/app/product-range/ProductRangeHub";
import { getCatalogModel } from "@/lib/catalogServer";

/* NEW SETUP: "Therapeutic Categories" (navbar › Product Range), as in the low-fidelity prototype.
   Reuses v2's catalogue hub — every prescription category, the other ranges (OTC, supplements,
   devices), conditions and FAQs — which used to sit on /product-range. No ribbon strip here. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Therapeutic Categories — Prescription & Other Medicines",
  description:
    "Browse Getmeds medicines by therapeutic category: oncology, hematology, anti-infectives, endocrinology, cardiology and nephrology, plus OTC medicines, food supplements and medical devices.",
  alternates: { canonical: "/therapeutic-categories" },
};

export default async function TherapeuticCategoriesPage() {
  const model = await getCatalogModel();
  return <ProductRangeHub model={model} title="Therapeutic categories" crumb="Therapeutic categories" showRibbons={false} />;
}
