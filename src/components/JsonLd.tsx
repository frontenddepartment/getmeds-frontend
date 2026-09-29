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
