import { DOMAIN } from '@/lib/seo-config';

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${DOMAIN}/#organization`,
    name: 'Getmeds',
    legalName: 'Getmeds Philippines Inc.',
    alternateName: 'Getmeds Philippines',
    url: DOMAIN,
    logo: `${DOMAIN}/assets/getmedslogo.png`,
    // What Getmeds is, in the words the homepage meta description already uses, so AI
    // answers describe a licensed pharmaceutical company rather than "an online pharmacy".
    description:
      'Pharmaceutical company in the Philippines: FDA-licensed wholesaler, importer, distributor and retail pharmacy, serving patients, doctors, pharmacies and hospitals nationwide.',
    founder: {
      '@type': 'Person',
      name: 'Naresh Bishnoi',
      jobTitle: 'Founder and Director',
      sameAs: ['https://www.linkedin.com/in/nareshbishnoi/'],
    },
    // The official profiles, the same ones linked in the footer and top bar. Keep in step
    // with Footer.tsx if one changes.
    sameAs: [
      'https://www.facebook.com/getmedsphilippines/',
      'https://www.linkedin.com/company/getmeds',
      'https://www.youtube.com/@getmedsph',
      'https://www.tiktok.com/@getmedsph',
      'https://www.instagram.com/getmeds_ph/',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+63-919-076-9105',
        contactType: 'customer service',
        areaServed: 'PH',
        availableLanguage: ['en', 'tl'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village',
      addressLocality: 'Las Piñas City',
      addressRegion: 'Metro Manila',
      postalCode: '1747',
      addressCountry: 'PH',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
