import type { Metadata } from 'next';
import HomeClient, { type HeroSlideImage } from './HomeClient';
import { getCategories, getCategoryImages, getHeroSlides, type CategoryImageLink } from '@/lib/queries';
import { canonicalSiteLink } from '@/lib/seo-config';
import type { Category } from '@/types/sanity';
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
    if (!doc?.images?.length) return null;
    // Same canonical-link rewrite the browser applies, so the data embedded in the HTML
    // never carries a www.getmeds.ph address either.
    return doc.images.map((s) => (s.link ? { ...s, link: canonicalSiteLink(s.link) } : s));
  } catch (err) {
    // Built-in fallback slides render instead; the browser fetch still tries again.
    console.error('[home] Failed to load hero slides:', err);
    return null;
  }
}

// The "Therapeutic areas" section's two lists, fetched here so its cards and category links
// are in the HTML Google reads, not gray placeholders filled in after load. Either one failing
// leaves that list to the browser fetch, which is how the section worked before.
async function loadTherapeuticAreas(): Promise<{
  categoryImages: CategoryImageLink[] | null;
  categories: Category[] | null;
}> {
  const [categoryImages, categories] = await Promise.all([
    getCategoryImages().catch((err) => {
      console.error('[home] Failed to load featured categories:', err);
      return null;
    }),
    getCategories().catch((err) => {
      console.error('[home] Failed to load categories:', err);
      return null;
    }),
  ]);
  return { categoryImages, categories };
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
        // The Getmeds logo, not the generated "Life-Saving Medicines" card:
        // the homepage share image should show who the site is.
        url: 'https://getmeds.ph/assets/og-logo.jpg',
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
  const [initialHeroSlides, therapeutic] = await Promise.all([loadHeroSlides(), loadTherapeuticAreas()]);
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
      <HomeClient
        initialHeroSlides={initialHeroSlides}
        initialCategoryImages={therapeutic.categoryImages}
        initialCategories={therapeutic.categories}
      />
    </>
  );
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/', baseMetadata);
}
