import type { Metadata } from "next";

/* page.tsx is a client component and can't export metadata — this server layout sets it. */
export const metadata: Metadata = {
  alternates: { canonical: "/product-range" },
  title: "Medicines, Supplements and Medical Devices in the Philippines",
  description:
    "Browse Getmeds prescription medicines, OTC medicines, food supplements and medical devices. Send an inquiry for availability and pricing.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
