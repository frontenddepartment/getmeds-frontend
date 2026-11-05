import type { Metadata } from "next";

/* page.tsx is a client component and can't export metadata — this server layout sets it. */
export const metadata: Metadata = {
  alternates: { canonical: "/product-range" },
  title: "Product Range: Oncology & Specialty Medicines",
  description:
    "Browse Getmeds' FDA Philippines-licensed medicines across oncology, hematology, cardiology, anti-infectives and more. Prescription-based ordering, nationwide delivery.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
