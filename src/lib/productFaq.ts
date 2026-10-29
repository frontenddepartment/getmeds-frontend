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

/*
 * Google title and description for every product page, in the team-approved format from the
 * "How it looks on Google" prototype board. These replace the catalogue sheet's metaTitle /
 * metaDescription (a Vidrys SEO override for a path still wins over both):
 *
 *   Paclitaxel 300 mg/50 mL Injection Price in the Philippines
 *   Buy Paclitaxel 300 mg/50 mL injection vial (PacliGet) from Getmeds. Send an inquiry to order
 *   and get a price quote. Prescription required.
 */
export interface ProductSearchInput {
  displayName: string;
  brandName?: string;
  genericName?: string;
  strength?: string;
  form?: string;
  /** Prescription-only (the sheet's Prescription column is "RX"); adds "Prescription required." */
  isRx: boolean;
}

/** "6mg/mL (300 mg / 50 mL)" -> "300 mg/50 mL"; "20 mg / 0.5 mL" -> "20 mg/0.5 mL"; "500mg" -> "500 mg" */
export function strengthForSearch(strength?: string) {
  const first = String(strength || '').split(/\\n|\n/)[0].trim();
  const inner = first.match(/\(([^)]+)\)/)?.[1] || first;
  return inner
    .replace(/\s*\/\s*/g, '/')
    .replace(/(\d)([a-zA-Zµμ])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function formWords(form?: string) {
  const f = String(form || '');
  if (/infusion|inject|vial|powder|concentrate|solution|lyophili/i.test(f)) return { title: 'Injection', desc: 'injection vial' };
  if (/capsule/i.test(f)) return { title: 'Capsule', desc: 'capsule' };
  if (/tablet/i.test(f)) return { title: 'Tablet', desc: 'tablet' };
  return { title: '', desc: '' };
}

export function productSearchTitle(p: ProductSearchInput) {
  const name = [productSearchName(p), strengthForSearch(p.strength), formWords(p.form).title].filter(Boolean).join(' ');
  return `${name} Price in the Philippines`;
}

export function productSearchDescription(p: ProductSearchInput) {
  const generic = productSearchName(p);
  const brand = String(p.brandName || '').trim();
  const what = [generic, strengthForSearch(p.strength), formWords(p.form).desc].filter(Boolean).join(' ');
  const branded = brand && brand.toLowerCase() !== generic.toLowerCase() ? ` (${brand})` : '';
  return `Buy ${what}${branded} from Getmeds. Send an inquiry to order and get a price quote.${p.isRx ? ' Prescription required.' : ''}`;
}

/*
 * Category pages with an approved search title/description ("How it looks on Google" prototype
 * board), keyed by category folder. Only Oncology has one so far; other folders keep their
 * generated title until the team approves wording for them.
 */
export const CATEGORY_SEARCH_COPY: Record<string, { title: string; description: string }> = {
  'cancer-medicines': {
    title: 'Oncology: Cancer Medicines in the Philippines',
    description:
      'Browse Getmeds cancer medicines for breast, lung, ovarian and other cancers. Send an inquiry to order and get a price quote.',
  },
};

/*
 * Product page breadcrumb, per the prototype: Home › Product range › [Prescription medicines] ›
 * {Category} › {Product}. The "Prescription medicines" step is left out until /prescription-medicines
 * exists (a teammate is building it); flip the flag then. Shared by the visible breadcrumb, the
 * server copy and both BreadcrumbList JSON-LD blocks, so they always match.
 */
const PRESCRIPTION_MEDICINES_PAGE_LIVE = false;

export interface ProductCrumbInput {
  /** The sheet's breadcrumb, "Home > Oncology > Breast Cancer > PacliGet"; its category step is used */
  breadcrumb?: string;
  category?: string;
  categoryFolder?: string;
  brandName?: string;
  name?: string;
  strength?: string;
  isRx: boolean;
}

/** "PacliGet" + "6mg/mL (300 mg / 50 mL)" -> "PacliGet 300 mg"; names that already carry a number stay as is */
export function productCrumbLabel(p: Pick<ProductCrumbInput, 'brandName' | 'name' | 'strength'>) {
  const brand = String(p.brandName || p.name || 'Product').trim();
  if (/\d/.test(brand)) return brand;
  const amount = strengthForSearch(p.strength).split('/')[0].trim();
  return amount ? `${brand} ${amount}` : brand;
}

export function productCrumbs(p: ProductCrumbInput): Array<{ name: string; url: string | null }> {
  const sheetParts = String(p.breadcrumb || '').split('>').map((s) => s.trim()).filter((s) => s && s.toLowerCase() !== 'home');
  const category = sheetParts.length > 1 ? sheetParts[0] : String(p.category || '').trim();
  return [
    { name: 'Product Range', url: '/product-range' },
    ...(PRESCRIPTION_MEDICINES_PAGE_LIVE && p.isRx ? [{ name: 'Prescription Medicines', url: '/prescription-medicines' }] : []),
    ...(category ? [{ name: category, url: p.categoryFolder ? `/${p.categoryFolder}` : null }] : []),
    { name: productCrumbLabel(p), url: null },
  ];
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
