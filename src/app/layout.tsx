import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_OG_IMAGE } from "@/lib/pageMeta";

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
  // Share-card defaults for pages that don't build their own (pageMetadata() overrides all of this).
  // No og:title/og:url here on purpose: inherited ones would show the home page's title on every
  // page, whereas without them Facebook/X fall back to the page's own <title>, description and canonical.
  openGraph: {
    type: "website",
    siteName: "Getmeds Philippines",
    locale: "en_PH",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Getmeds Philippines" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // globals.css sets smooth scrolling; data-scroll-behavior lets Next switch it off during
  // navigation so a new page opens at the top.
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        {/* keyboard users: first Tab jumps past the nav */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-deep focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" tabIndex={-1} className="outline-none">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
