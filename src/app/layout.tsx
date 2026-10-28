import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

// Self-hosted (Latin subset) so dev/builds never depend on reaching Google Fonts.
const inter = localFont({
  variable: "--font-inter",
  src: "../fonts/inter-latin-var.woff2",
  weight: "100 900",
  display: "swap",
});

const poppins = localFont({
  variable: "--font-poppins",
  src: [
    { path: "../fonts/poppins-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/poppins-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/poppins-latin-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/poppins-latin-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/poppins-latin-800.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Getmeds | Trusted Pharmaceutical Company & Healthcare Provider",
    template: "%s | Getmeds",
  },
  description:
    "Getmeds is a global pharmaceutical company advancing healthcare access across the Philippines through essential medicines, hospital therapies and cancer treatments.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
