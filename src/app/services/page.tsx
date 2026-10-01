import type { Metadata } from 'next';
import ServicesClient from './ServicesClient';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// Title, description, canonical and OG tags copied from getmeds_frontend/services.html.
const TITLE = 'Our Services - Getmeds';
const DESCRIPTION =
  'Getmeds pharmaceutical services: FDA Philippines-licensed wholesale, distribution, retail pharmacy, and patient assistance for oncology medicines.';

const baseMetadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: 'https://getmeds.ph/services' },
  openGraph: {
    type: 'website',
    siteName: 'Getmeds',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://getmeds.ph/services',
    images: [{ url: 'https://getmeds.ph/assets/services_hero_new.png' }],
  },
};

export default function ServicesPage() {
  return <ServicesClient />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/services', baseMetadata);
}
