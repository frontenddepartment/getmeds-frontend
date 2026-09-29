import type { Metadata } from 'next';
import ServicesClient from './ServicesClient';

// Title, description, canonical and OG tags copied from getmeds_frontend/services.html.
const TITLE = 'Our Services - Getmeds';
const DESCRIPTION =
  'Getmeds pharmaceutical services: FDA Philippines-licensed wholesale, distribution, retail pharmacy, and patient assistance for oncology medicines.';

export const metadata: Metadata = {
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
