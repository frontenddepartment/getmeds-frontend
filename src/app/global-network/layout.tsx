import type { Metadata } from "next";

/* page.tsx is a client component and can't export metadata — this server layout sets it. */
export const metadata: Metadata = {
  alternates: { canonical: "/global-network" },
  title: "Global Network",
  description:
    "Getmeds' network spans continents — sourcing internationally recognized medicines and expanding access for patients and partners from Manila to the world.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
