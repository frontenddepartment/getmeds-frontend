import type { Metadata } from "next";

/* page.tsx is a client component and can't export metadata — this server layout sets it. */
export const metadata: Metadata = {
  alternates: { canonical: "/patient-assistance-program" },
  title: "Patient Assistance Program: DSWD & PCSO Aid",
  description:
    "Libreng tulong para sa chemotherapy at gamot sa cancer. Get a price quotation for your DSWD, PCSO, OP or OVP Guarantee Letter and see the requirements.",
};

/* The page copy is written in Filipino — tell search engines so it matches Filipino queries. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div lang="fil">{children}</div>;
}
