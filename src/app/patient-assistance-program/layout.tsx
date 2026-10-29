import type { Metadata } from "next";

/* page.tsx is a client component and can't export metadata — this server layout sets it. */
export const metadata: Metadata = {
  alternates: { canonical: "/patient-assistance-program" },
  title: { absolute: "PCSO & DSWD Medical Assistance for Cancer Patients PH" },
  description:
    "Apply for PCSO Medical Assistance Program (MAP) and DSWD Medical Assistance (AICS) for cancer and chemotherapy treatment in the Philippines.",
};

/* The page copy is written in Filipino — tell search engines so it matches Filipino queries. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div lang="fil">{children}</div>;
}
