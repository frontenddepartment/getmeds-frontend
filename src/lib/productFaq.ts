/*
 * Ordering FAQs for a product page, shared by the server copy Google reads first
 * (src/lib/catalogSeo.tsx) and the live page (src/components/ProductDetailClient.tsx), so the
 * visible questions and the FAQPage structured data always match.
 *
 * Only ordering facts the site already states (inquiry and quote flow, prescription rule,
 * nationwide delivery, strengths from the catalogue). No medical claims: indications, dosing and
 * side effects come from the catalogue sheet, reviewed by the pharmacist team.
 */

export interface ProductFaqInput {
  /** e.g. "DoseGet-20 (Docetaxel (as Trihydrate))" */
  displayName: string;
  brandName?: string;
  genericName?: string;
  /** Strength labels of every variant in the product group, current product included */
  strengths: string[];
  isRx: boolean;
}

export interface ProductFaq {
  q: string;
  a: string;
}

/** "Docetaxel (as Trihydrate)" -> "Docetaxel" */
export const plainGenericName = (generic?: string) => String(generic || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();

/** The name people search for: the generic, or the display name when there is none. */
export function productSearchName({ genericName, displayName }: Pick<ProductFaqInput, 'genericName' | 'displayName'>) {
  return plainGenericName(genericName) || displayName;
}

export function productOrderFaqs(input: ProductFaqInput): ProductFaq[] {
  const generic = productSearchName(input);
  const brand = String(input.brandName || '').trim();
  const named = brand && brand.toLowerCase() !== generic.toLowerCase() ? `${brand} (${generic})` : generic;
  const strengths = [...new Set(input.strengths.map((s) => s.trim()).filter(Boolean))];

  // The generic name (the search keyword) appears in the price question only; the rest name the brand,
  // so keyword density stays near Rank Math's 1–1.5% on short product pages.
  const product = brand || generic;
  const faqs: ProductFaq[] = [
    {
      q: `How do I order ${product} in the Philippines?`,
      a: `Send an inquiry on this page or message Getmeds on WhatsApp. Choose who is ordering (patient or family, doctor, pharmacy or hospital), share a valid prescription, and our team replies with a formal quote.`,
    },
    {
      q: `How much does ${named} cost in the Philippines?`,
      a: `Getmeds does not list online prices for prescription medicines. Send an inquiry with your prescription and our pharmacist sends you a formal price quote.`,
    },
  ];
  if (input.isRx) {
    faqs.push({
      q: `Do I need a prescription to buy ${product}?`,
      a: `Yes. It is a prescription-only (Rx) medicine. A valid prescription from a licensed healthcare professional is required for purchase and dispensing, as regulated by FDA Philippines under RA 9711.`,
    });
  }
  if (strengths.length > 1) {
    faqs.push({
      q: `Which strengths of ${brand || generic} are available?`,
      a: `Getmeds supplies ${brand || generic} in ${strengths.slice(0, -1).join(', ')} and ${strengths[strengths.length - 1]}. Each strength has its own page and can be ordered with a prescription.`,
    });
  }
  faqs.push({
    q: `Does Getmeds deliver ${product} nationwide?`,
    a: `Yes. Getmeds delivers prescription medicines across Luzon, Visayas and Mindanao.`,
  });
  return faqs;
}

export function productFaqJsonLd(faqs: ProductFaq[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/** FDA Philippines, the regulator (dofollow outbound reference). */
export const FDA_VERIFICATION_URL = 'https://www.fda.gov.ph/';

/** The four ordering steps shown on every product page. */
export const ORDER_STEPS: Array<[string, string]> = [
  ['Tell us who is ordering', 'Patient or family, doctor, pharmacy or hospital.'],
  ['Share your prescription', 'Upload it securely with your inquiry.'],
  ['Get a formal quote', 'Our pharmacist reviews your order and confirms the price.'],
  ['Receive your medicine', 'Delivered across Luzon, Visayas and Mindanao.'],
];
