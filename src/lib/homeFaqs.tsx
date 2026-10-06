import type { ReactNode } from 'react';

// The homepage FAQ accordion and its FAQPage JSON-LD both read from this list, so the
// structured data always matches what visitors see (Google requires the two to agree).
// `text` is the plain-text answer used in the schema; `rich` is an optional on-page version
// with links or lists. When editing an answer, keep `text` and `rich` saying the same thing.
export interface HomeFaq {
  q: string;
  text: string;
  rich?: ReactNode;
}

export const HOME_FAQS: HomeFaq[] = [
  {
    q: 'Is Getmeds registered with FDA Philippines?',
    text: 'Yes. Getmeds holds a valid License to Operate from FDA Philippines as a wholesaler, importer, distributor and retail pharmacy.',
  },
  {
    q: 'Is Getmeds legit?',
    text: 'Yes. Getmeds Philippines, Inc. is licensed by the Food and Drug Administration of the Philippines as a wholesaler, importer, distributor and retail pharmacy, and is PDEA-licensed for controlled substances. Every order is dispensed under PRC-licensed Filipino pharmacists. We serve patients, doctors, pharmacies and hospitals nationwide.',
  },
  {
    q: 'Where is Getmeds located in the Philippines?',
    text: "Getmeds' head office is at Unit 305, 17 Vatican Bldg. Vatican Drive BF Resort Village, Talon Dos, Las Piñas, Metro Manila. This is our principal office and business address in the Philippines.",
  },
  {
    q: 'Who is the owner of Getmeds?',
    text: 'Getmeds was founded and is owned by Naresh Bishnoi, who also serves as Director and is a United Nations Global Compact SDG Champion.',
    rich: (<span>Getmeds was founded and is owned by <a href="https://www.linkedin.com/in/nareshbishnoi/" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: '#1D9FDA' }}>Naresh Bishnoi</a>, who also serves as Director and is a United Nations Global Compact SDG Champion.</span>),
  },
  {
    q: 'What products does Getmeds offer?',
    text: 'Getmeds distributes pharmaceutical products across the Philippines in these therapeutic areas: Oncology (targeted therapies, chemotherapy and supportive cancer care); Hematology (treatments for leukemia, anemia, coagulation disorders and blood cancers); Anti-Infectives (antibiotics for hospital and community use); Cardiology (therapies for heart, vascular and cardiometabolic conditions); Anesthesia and Pain Management (anesthetic, analgesic and perioperative medicines); Endocrinology, Orthopedic, Rheumatology, Nephrology, Respiratory and Radiology; Rare Diseases (Named-Patient Access Programs and Compassionate Special Permit imports for medicines not registered in the Philippines); Medical Devices (clinical devices and consumables for hospital and ambulatory care); and Essential Medicines (WHO-listed first-line therapies and branded generics).',
    rich: (
      <span>
        Getmeds distributes pharmaceutical products across the Philippines in these therapeutic areas:<br /><br />
        <span className="block space-y-1">
          <span className="block">• <strong>Oncology</strong> — targeted therapies, chemotherapy and supportive cancer care</span>
          <span className="block">• <strong>Hematology</strong> — treatments for leukemia, anemia, coagulation disorders and blood cancers</span>
          <span className="block">• <strong>Anti-Infectives</strong> — antibiotics for hospital and community use</span>
          <span className="block">• <strong>Cardiology</strong> — therapies for heart, vascular and cardiometabolic conditions</span>
          <span className="block">• <strong>Anesthesia and Pain Management</strong> — anesthetic, analgesic and perioperative medicines</span>
          <span className="block">• <strong>Endocrinology, Orthopedic, Rheumatology, Nephrology, Respiratory and Radiology</strong></span>
          <span className="block">• <strong>Rare Diseases</strong> — Named-Patient Access Programs and Compassionate Special Permit imports for medicines not registered in the Philippines</span>
          <span className="block">• <strong>Medical Devices</strong> — clinical devices and consumables for hospital and ambulatory care</span>
          <span className="block">• <strong>Essential Medicines</strong> — WHO-listed first-line therapies and branded generics</span>
        </span>
      </span>
    ),
  },
  {
    q: 'Does Getmeds accept Senior Citizen and PWD IDs for discounts?',
    text: 'Yes. Getmeds complies with the Expanded Senior Citizens Act (Republic Act 9994) and the Magna Carta for Persons with Disabilities (Republic Act 10754). Qualified Senior Citizens and Persons with Disabilities receive a 20% discount plus VAT exemption on eligible prescription medicines. Submit a valid Senior Citizen or PWD ID together with your prescription when you place your order.',
  },
  {
    q: 'Can doctors order medicines from Getmeds?',
    text: 'Yes. Physicians, specialists and healthcare professionals can order products, check stock and pricing, and coordinate Compassionate Special Permit (CSP) applications directly with our team.',
  },
  {
    q: 'How long does delivery take?',
    text: 'Orders confirmed before 3:00 PM may be delivered the same day within Metro Manila, subject to product availability and order confirmation. Delivery lead times for Luzon, Visayas, and Mindanao may vary depending on the location and courier service.',
  },
  {
    q: 'What payment methods do you accept?',
    text: 'Getmeds accepts Cash on Delivery, GCash, Bank Transfer, Credit or Debit Card. Credit terms may also be available for qualified distributor and hospital accounts, subject to approval and applicable terms.',
    rich: (
      <span>
        Getmeds accepts Cash on Delivery, GCash, Bank Transfer, Credit or Debit Card.<br /><br />
        Credit terms may also be available for qualified distributor and hospital accounts, subject to approval and applicable terms.
      </span>
    ),
  },
];

export const HOME_FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://getmeds.ph/#faq',
  url: 'https://getmeds.ph/',
  inLanguage: 'en-PH',
  mainEntity: HOME_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.text },
  })),
};
