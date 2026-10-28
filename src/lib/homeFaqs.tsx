import type { ReactNode } from 'react';

// The homepage FAQ accordion and its FAQPage JSON-LD both read from this list, so the
// structured data always matches what visitors see (Google requires the two to agree).
// `text` is the answer used in the schema (limited HTML — <a>, <ul>, <li> — is allowed
// there, with full https://getmeds.ph/ URLs); `rich` is the on-page version with the
// same wording. When editing an answer, keep `text` and `rich` saying the same thing.
export interface HomeFaq {
  q: string;
  text: string;
  rich?: ReactNode;
}

// Only the first HOME_FAQ_SCHEMA_COUNT questions go into the FAQPage JSON-LD. The rest
// render in the accordion only: delivery and payment are already covered by the
// /order-medicines page's schema, and repeating them here would have two pages carrying
// structured data for the same questions.
export const HOME_FAQ_SCHEMA_COUNT = 6;

const linkStyle = { color: '#1D9FDA' };

export const HOME_FAQS: HomeFaq[] = [
  {
    q: 'Is Getmeds registered with FDA Philippines?',
    text: 'Yes. Getmeds holds valid Licenses to Operate (LTO) from the Food and Drug Administration (FDA) of the Philippines as a drug wholesaler, importer, distributor, and retail pharmacy.',
  },
  {
    q: 'Is Getmeds legit?',
    text: 'Yes. Getmeds Philippines, Inc. is an FDA-licensed pharmaceutical importer, wholesaler, and distributor, and is PDEA-licensed across categories S1 to S5 for controlled substances. Getmeds supplies cancer, hospital, and essential medicines to doctors, pharmacies, and hospitals nationwide, and runs its own retail and online pharmacy, where every prescription order is reviewed by PRC-licensed pharmacists.',
  },
  {
    q: 'Where is Getmeds located in the Philippines?',
    text: "Getmeds' head office is at Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village, Talon Dos, Las Piñas, Metro Manila. This is our principal office and business address in the Philippines.",
  },
  {
    q: 'Who is the owner of Getmeds?',
    text: 'Getmeds was founded and is owned by Naresh Bishnoi, who serves as Director and is a United Nations Global Compact SDG Champion.',
    rich: (<span>Getmeds was founded and is owned by <a href="https://www.linkedin.com/in/nareshbishnoi/" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={linkStyle}>Naresh Bishnoi</a>, who serves as Director and is a United Nations Global Compact SDG Champion.</span>),
  },
  {
    q: 'What products does Getmeds offer?',
    text: 'Getmeds supplies prescription medicines, hospital medicines and medical supplies across the Philippines, covering oncology, hematology, anti-infectives, cardiology, anesthesia and pain management, critical care, endocrinology, orthopedics, rheumatology, nephrology, respiratory care, rare diseases and essential medicines. Explore our full <a href="https://getmeds.ph/product-range">Product Range</a>.',
    rich: (
      <span>
        Getmeds supplies prescription medicines, hospital medicines and medical supplies across the Philippines, covering oncology, hematology, anti-infectives, cardiology, anesthesia and pain management, critical care, endocrinology, orthopedics, rheumatology, nephrology, respiratory care, rare diseases and essential medicines. Explore our full <a href="/product-range" className="font-semibold underline" style={linkStyle}>Product Range</a>.
      </span>
    ),
  },
  {
    q: 'How do I order medicines from Getmeds?',
    text: 'Patients can order prescription medicines by submitting a valid doctor\'s prescription. A PRC-licensed pharmacist reviews each order before dispatch. Choose the option that fits your needs: <ul><li><a href="https://getmeds.ph/order-medicines/patients">Patients &amp; Families</a>: Order with a valid prescription</li><li><a href="https://getmeds.ph/order-medicines/doctors">Doctors</a>: Request medicines</li><li><a href="https://getmeds.ph/order-medicines/distributors">Distributors &amp; Pharmacies</a>: Open a wholesale account</li><li><a href="https://getmeds.ph/order-medicines/hospitals">Hospitals &amp; Institutions</a>: Request a quotation</li></ul>',
    rich: (
      <span>
        Patients can order prescription medicines by submitting a valid doctor&apos;s prescription. A PRC-licensed pharmacist reviews each order before dispatch.<br /><br />
        Choose the option that fits your needs:
        <span className="block space-y-1 mt-2">
          <span className="block">• <a href="/order-medicines/patients" className="font-semibold underline" style={linkStyle}>Patients &amp; Families</a>: Order with a valid prescription</span>
          <span className="block">• <a href="/order-medicines/doctors" className="font-semibold underline" style={linkStyle}>Doctors</a>: Request medicines</span>
          <span className="block">• <a href="/order-medicines/distributors" className="font-semibold underline" style={linkStyle}>Distributors &amp; Pharmacies</a>: Open a wholesale account</span>
          <span className="block">• <a href="/order-medicines/hospitals" className="font-semibold underline" style={linkStyle}>Hospitals &amp; Institutions</a>: Request a quotation</span>
        </span>
      </span>
    ),
  },
  // ── Accordion only from here down (not in the FAQPage schema; see HOME_FAQ_SCHEMA_COUNT). ──
  {
    q: 'How long does delivery take?',
    text: 'Getmeds delivers across Luzon, Visayas, and Mindanao. In Metro Manila, orders confirmed before 3:00 PM may be delivered the same day, subject to product availability. Provincial orders typically arrive within 3 to 5 business days, depending on the destination.',
  },
  {
    q: "What are Getmeds' accepted modes of payment?",
    text: 'Getmeds accepts Cash on Delivery (COD), GCash, Bank Transfer, Credit Card, and Debit Card. Qualified hospital and institutional accounts may apply for credit terms, subject to approval.',
  },
];

export const HOME_FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://getmeds.ph/#faq',
  url: 'https://getmeds.ph/',
  inLanguage: 'en-PH',
  mainEntity: HOME_FAQS.slice(0, HOME_FAQ_SCHEMA_COUNT).map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.text },
  })),
};
