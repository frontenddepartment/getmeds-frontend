import type { Metadata } from 'next';
import HomeClient from './HomeClient';

// Title, description, canonical and OG tags copied from getmeds_frontend/index.html.
const TITLE = 'Getmeds | Trusted Pharmaceutical Company & Healthcare Provider';
const DESCRIPTION =
  'Global pharmaceutical company in the Philippines: FDA-licensed wholesaler, importer, distributor and retail pharmacy.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: 'https://getmeds.ph/' },
  openGraph: {
    url: 'https://getmeds.ph/',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: 'https://getmeds.ph/assets/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Getmeds Philippines',
      },
    ],
    type: 'website',
    siteName: 'Getmeds Philippines',
  },
};

// The WebSite JSON-LD block index.html carried in addition to the site-wide Organization one
// (which the root layout already renders).
const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://getmeds.ph/#website',
  name: 'Getmeds Philippines',
  alternateName: 'Getmeds',
  url: 'https://getmeds.ph/',
  inLanguage: 'en-PH',
  publisher: { '@id': 'https://getmeds.ph/#organization' },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        id="jsonld-website"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
      />
      <HomeClient />
    </>
  );
}
