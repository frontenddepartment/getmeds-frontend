const SITE_NAME = 'Getmeds';
// og:site_name is the brand label social platforms print above the card, and it is the
// one the Organization JSON-LD carries as alternateName. SITE_NAME stays the short form
// because withSiteName() appends it to page titles.
const OG_SITE_NAME = 'Getmeds Philippines';
const BASE_URL = 'https://getmeds.ph';
const DEFAULT_IMAGE = `${BASE_URL}/assets/getmedslogo.png`;
/**
 * @id of the Organization node stamped into every static shell by
 * scripts/inject-organization-jsonld.cjs. Page-level blocks reference it instead of
 * repeating the company details, so it must stay byte-identical to the value there.
 */
export const ORGANIZATION_ID = `${BASE_URL}/#organization`;

export interface PageMetaOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
}

function updateMeta(name: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(isProperty ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateCanonical(path: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', `${BASE_URL}${path}`);
}

export function injectJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify({ '@context': 'https://schema.org', ...data });
}

export function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

/**
 * Appends " - Getmeds" only when the title doesn't already say it. Product titles come
 * from the sheet's Meta Title column and already end "| Getmeds Philippines", and several
 * blog posts open with the brand ("Getmeds Completes UN Global Compact…"), so appending
 * unconditionally printed the brand twice — e.g. "… | Getmeds Philippines - Getmeds".
 */
export function withSiteName(title: string): string {
  const t = (title || '').trim();
  if (!t) return SITE_NAME;
  return new RegExp(SITE_NAME, 'i').test(t) ? t : `${t} - ${SITE_NAME}`;
}

/** Cuts to `max` characters on a word boundary rather than mid-word. */
export function truncateAtWord(text: string, max: number): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\-–—]+$/, '').trim();
}

export function setPageMeta({ title, description, path, image, type = 'website' }: PageMetaOptions) {
  const fullTitle = withSiteName(title);
  document.title = fullTitle;

  updateMeta('description', description);
  updateMeta('og:type', type, true);
  updateMeta('og:site_name', OG_SITE_NAME, true);
  updateMeta('og:title', fullTitle, true);
  updateMeta('og:description', description, true);
  updateMeta('og:image', image || DEFAULT_IMAGE, true);

  if (path) {
    updateMeta('og:url', `${BASE_URL}${path}`, true);
    updateCanonical(path);
  }

  updateMeta('twitter:card', 'summary_large_image');
  updateMeta('twitter:title', fullTitle);
  updateMeta('twitter:description', description);
  updateMeta('twitter:image', image || DEFAULT_IMAGE);
}

// ---- Condition structured-data helpers ---------------------------------------------
// Duplicated, deliberately, in scripts/prerender-slugs.cjs: that is a standalone CJS build
// script and cannot import from here. The two copies must produce identical output, since
// the runtime block overwrites the prerendered one on hydration.

/**
 * schema.org's MedicalSpecialty is a closed enumeration, so the sheet's free-text specialty
 * is mapped onto a real enum value. Anything unrecognised returns null and the property is
 * left off that page — a wrong enum value is worse than a missing one.
 */
const MEDICAL_SPECIALTIES: Record<string, string> = {
  oncology: 'Oncologic', oncologic: 'Oncologic',
  hematology: 'Hematologic', haematology: 'Hematologic', hematologic: 'Hematologic',
  cardiology: 'Cardiovascular', cardiovascular: 'Cardiovascular',
  endocrinology: 'Endocrine', endocrine: 'Endocrine',
  nephrology: 'Renal', renal: 'Renal',
  neurology: 'Neurologic', neurologic: 'Neurologic',
  rheumatology: 'Rheumatologic', rheumatologic: 'Rheumatologic',
  'infectious disease': 'Infectious', 'infectious diseases': 'Infectious', infectious: 'Infectious',
  musculoskeletal: 'Musculoskeletal',
  gastroenterology: 'Gastroenterologic', gastroenterologic: 'Gastroenterologic',
  pulmonology: 'Pulmonary', pulmonary: 'Pulmonary', respiratory: 'Pulmonary',
  urology: 'Urologic', urologic: 'Urologic',
  gynecology: 'Gynecologic', gynecologic: 'Gynecologic',
  dermatology: 'Dermatologic', dermatologic: 'Dermatologic',
  radiology: 'Radiography', radiography: 'Radiography',
  anesthesia: 'Anesthesia', anaesthesia: 'Anesthesia',
  pathology: 'Pathology',
  pediatrics: 'Pediatric', pediatric: 'Pediatric',
  psychiatry: 'Psychiatric', psychiatric: 'Psychiatric',
  surgery: 'Surgical', surgical: 'Surgical',
  toxicology: 'Toxicologic',
  genetics: 'Genetic', genetic: 'Genetic',
};

export function specialtyUrl(value?: string): string | null {
  const enumValue = MEDICAL_SPECIALTIES[String(value || '').trim().toLowerCase()];
  return enumValue ? `https://schema.org/${enumValue}` : null;
}

/** Used only when a condition has a review date but no explicit reviewer of its own. */
export const DEFAULT_CONDITION_REVIEWER = 'Ivy Marcel F. Varias, RPh';

/**
 * `lastReviewed` is a public claim that a named pharmacist read the page on that date, so
 * only a real, well-formed calendar date counts. The pair is all-or-nothing: with no date
 * there is no claim to make, and the rest of the MedicalWebPage block stands on its own.
 */
export function conditionReviewFields(lastReviewed?: string, reviewedBy?: string) {
  const date = String(lastReviewed || '').trim().match(/^(\d{4}-\d{2}-\d{2})/);
  if (!date) return {};
  return {
    lastReviewed: date[1],
    reviewedBy: {
      '@type': 'Person',
      name: String(reviewedBy || '').trim() || DEFAULT_CONDITION_REVIEWER,
      jobTitle: 'Registered Pharmacist',
      affiliation: { '@id': ORGANIZATION_ID },
    },
  };
}
