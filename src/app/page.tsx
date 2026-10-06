import type { Metadata } from 'next';
import HomeClient, { type HeroSlideImage } from './HomeClient';
import { getHeroSlides } from '@/lib/queries';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';
import { HOME_FAQ_JSON_LD } from '@/lib/homeFaqs';

// The hero slides are fetched here so the first slide's picture is in the HTML (it's the
// page's main picture for PageSpeed). The page is rebuilt in the background at most every
// 5 minutes, so a hero change in Sanity shows up within that window.
export const revalidate = 300;

async function loadHeroSlides(): Promise<HeroSlideImage[] | null> {
  try {
    // The query returns the single "Home Hero Background" document; getHeroSlides() is typed
    // as an array for the browser hook's sake.
    const doc = (await getHeroSlides()) as unknown as { images?: HeroSlideImage[] } | null;
    return doc?.images?.length ? doc.images : null;
  } catch (err) {
    // Built-in fallback slides render instead; the browser fetch still tries again.
    console.error('[home] Failed to load hero slides:', err);
    return null;
  }
}

// Title, description, canonical and OG tags copied from getmeds_frontend/index.html.
const TITLE = 'Getmeds | Trusted Pharmaceutical Company & Healthcare Provider';
const DESCRIPTION =
  'Global pharmaceutical company in the Philippines: FDA-licensed wholesaler, importer, distributor and retail pharmacy.';

const baseMetadata: Metadata = {
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

export default async function Page() {
  const initialHeroSlides = await loadHeroSlides();
  return (
    <>
      <script
        type="application/ld+json"
        id="jsonld-website"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
      />
      {/* FAQPage block built from the same list the FAQ accordion renders. */}
      <script
        type="application/ld+json"
        id="jsonld-faq"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_FAQ_JSON_LD).replace(/</g, '\\u003c') }}
      />
      <HomeClient initialHeroSlides={initialHeroSlides} />
    </>
  );
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/', baseMetadata);
}
