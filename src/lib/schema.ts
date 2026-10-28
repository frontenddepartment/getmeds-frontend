/*
 * Business JSON-LD for the homepage — tells Google who Getmeds is, where it is and how
 * to reach it (feeds the knowledge panel and local results). Built from `contact`, so
 * the schema always matches the footer and Contact page.
 *
 * Not included until confirmed: openingHoursSpecification and geo (lat/long). Add them
 * here once known — they must match the Google Business Profile exactly.
 */

import { contact } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

const ORG_ID = `${SITE_URL}/#organization`;

export const businessSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Pharmacy",
      "@id": ORG_ID,
      name: "Getmeds Philippines, Inc.",
      alternateName: ["Getmeds", "GetMEDS Philippines"],
      slogan: "Your Compassionate Health Ally",
      description:
        "FDA-licensed pharmaceutical importer, wholesale distributor and retail pharmacy supplying cancer, hospital and essential medicines to patients, doctors, pharmacies and hospitals across the Philippines.",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/getmeds-logo.png`,
      image: `${SITE_URL}/images/herosectionimage.png`,
      telephone: contact.phone.replace(/\s/g, ""),
      email: contact.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Talon Dos",
        addressLocality: "Las Piñas",
        addressRegion: "Metro Manila",
        postalCode: "1747",
        addressCountry: "PH",
      },
      areaServed: { "@type": "Country", name: "Philippines" },
      foundingDate: "2020",
      founder: { "@type": "Person", name: "Naresh Bishnoi" },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: contact.phone.replace(/\s/g, ""),
          email: contact.email,
          areaServed: "PH",
          availableLanguage: ["English", "Filipino"],
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: contact.partnershipsPhone.replace(/\s/g, ""),
          email: contact.partnershipsEmail,
          areaServed: "PH",
        },
      ],
      sameAs: [contact.facebook, contact.twitter],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Getmeds",
      alternateName: "Getmeds Philippines",
      url: `${SITE_URL}/`,
      publisher: { "@id": ORG_ID },
      inLanguage: "en-PH",
    },
  ],
};
