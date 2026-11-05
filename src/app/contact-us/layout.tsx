import type { Metadata } from "next";

/* page.tsx is a client component and can't export metadata — this server layout sets it. */
export const metadata: Metadata = {
  alternates: { canonical: "/contact-us" },
  title: "Contact Us",
  description:
    "Contact Getmeds for inquiries about our pharmaceutical portfolio, partnerships, careers or patient access programs. Our team in the Philippines is ready to help.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
