import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContactButtons from '@/components/FloatingContactButtons';
import RouteGate from '@/components/RouteGate';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { DOMAIN } from '@/lib/seo-config';

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),
  title: {
    default: 'Getmeds | Trusted Pharmaceutical Company & Healthcare Provider',
    template: '%s | Getmeds',
  },
  description: 'Global pharmaceutical company in the Philippines: FDA-licensed wholesaler, importer, distributor and retail pharmacy.',
  keywords: ['getmeds', 'pharmaceutical company', 'philippines pharmacy', 'oncology medicines', 'cancer medicines Philippines', 'FDA licensed distributor'],
  authors: [{ name: 'Getmeds Philippines' }],
  creator: 'Getmeds Philippines',
  publisher: 'Getmeds Philippines',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png' }],
  },
  openGraph: {
    title: 'Getmeds | Trusted Pharmaceutical Company & Healthcare Provider',
    description: 'Global pharmaceutical company in the Philippines: FDA-licensed wholesaler, importer, distributor and retail pharmacy.',
    url: DOMAIN,
    siteName: 'Getmeds Philippines',
    images: [
      {
        url: `${DOMAIN}/assets/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Getmeds Philippines',
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Getmeds | Trusted Pharmaceutical Company & Healthcare Provider',
    description: 'Global pharmaceutical company in the Philippines: FDA-licensed wholesaler, importer, distributor and retail pharmacy.',
    images: [`${DOMAIN}/assets/og-default.jpg`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1D9FDA',
};

const FA_WEBFONTS = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts';
const FA_SWAP_CSS = [
  ['Font Awesome 6 Free', 900, 'fa-solid-900'],
  ['Font Awesome 6 Free', 400, 'fa-regular-400'],
  ['Font Awesome 6 Brands', 400, 'fa-brands-400'],
]
  .map(
    ([family, weight, file]) =>
      `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url(${FA_WEBFONTS}/${file}.woff2) format("woff2"),url(${FA_WEBFONTS}/${file}.ttf) format("truetype")}`,
  )
  .join('');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        {/* Images are plain (non-CORS) requests, which can't reuse the CORS connection above. */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={`${FA_WEBFONTS}/fa-solid-900.woff2`}
          crossOrigin="anonymous"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        {/* Font Awesome declares its fonts font-display:block, which hides text-sized icons
            (and held back first paint by up to 3s on PageSpeed). Re-declaring the same faces
            after it, with swap, wins (the later identical @font-face is used) and reuses the
            same files, so nothing downloads twice. */}
        <style dangerouslySetInnerHTML={{ __html: FA_SWAP_CSS }} />
        <OrganizationJsonLd />
      </head>
      <body className="bg-white text-gray-800 antialiased">
        {/* Navbar and Footer hide themselves on the routes whose original page had none */}
        <Navbar />
        <main>{children}</main>
        <Footer />
        <RouteGate>
          <FloatingContactButtons />
        </RouteGate>
      </body>
    </html>
  );
}
