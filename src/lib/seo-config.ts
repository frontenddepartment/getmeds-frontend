export const DOMAIN = 'https://getmeds.ph';

export const PRIORITY = {
  MAIN: '1.0',
  SECONDARY: '0.80',
  STATIC: '0.50',
} as const;

export interface SitemapPageConfig {
  path: string;
  label: string;
  section: 'main' | 'order' | 'company' | 'policies' | 'category' | 'condition';
  priority: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  images?: string[];
}

export const MAIN_PAGES: SitemapPageConfig[] = [
  { path: '', label: 'Home', section: 'main', priority: PRIORITY.MAIN, changefreq: 'daily', images: ['/assets/getmedslogo.png', '/assets/og-logo.jpg'] },
  { path: 'product-range', label: 'Product Range', section: 'main', priority: PRIORITY.MAIN, changefreq: 'weekly', images: ['/assets/getmedslogo.png'] },
  { path: 'order-medicines', label: 'Order Medicines', section: 'main', priority: PRIORITY.MAIN, changefreq: 'monthly', images: ['/assets/ordermedicinedistributor.jpg'] },
  { path: 'services', label: 'Services', section: 'main', priority: PRIORITY.MAIN, changefreq: 'monthly', images: ['/assets/services_hero_new.png'] },
  { path: 'patient-assistance-program', label: 'Patient Assistance Program', section: 'main', priority: PRIORITY.MAIN, changefreq: 'monthly', images: ['/assets/pap-banner.png'] },
  { path: 'blog', label: 'Blog', section: 'main', priority: PRIORITY.MAIN, changefreq: 'daily', images: ['/assets/og-logo.jpg'] },
];

export const SECONDARY_PAGES: SitemapPageConfig[] = [
  { path: 'order-medicines/patients', label: 'For Patients', section: 'order', priority: PRIORITY.SECONDARY, changefreq: 'monthly', images: ['/assets/order-medicines/patients.jpg'] },
  { path: 'order-medicines/doctors', label: 'For Doctors', section: 'order', priority: PRIORITY.SECONDARY, changefreq: 'monthly', images: ['/assets/order-medicines/doctors.jpg'] },
  { path: 'order-medicines/distributors', label: 'For Distributors', section: 'order', priority: PRIORITY.SECONDARY, changefreq: 'monthly', images: ['/assets/order-medicines/distributors.jpg'] },
  { path: 'order-medicines/hospitals', label: 'For Hospitals', section: 'order', priority: PRIORITY.SECONDARY, changefreq: 'monthly', images: ['/assets/order-medicines/hospitals.jpg'] },
  { path: 'cancer-medicines', label: 'Cancer Medicines', section: 'category', priority: PRIORITY.MAIN, changefreq: 'weekly', images: ['/assets/og-cancer.jpg'] },
  { path: 'antibiotics', label: 'Antibiotics', section: 'category', priority: PRIORITY.SECONDARY, changefreq: 'weekly' },
  { path: 'blood-disorder-medicines', label: 'Blood Disorder Medicines', section: 'category', priority: PRIORITY.SECONDARY, changefreq: 'weekly' },
  { path: 'diabetes-medicines', label: 'Diabetes Medicines', section: 'category', priority: PRIORITY.SECONDARY, changefreq: 'weekly' },
  { path: 'heart-medicines', label: 'Heart Medicines', section: 'category', priority: PRIORITY.SECONDARY, changefreq: 'weekly' },
  { path: 'bone-health-medicines', label: 'Bone Health Medicines', section: 'category', priority: PRIORITY.SECONDARY, changefreq: 'weekly' },
  { path: 'pain-management', label: 'Pain Management', section: 'category', priority: PRIORITY.SECONDARY, changefreq: 'weekly' },
  { path: 'kidney-medicines', label: 'Kidney Medicines', section: 'category', priority: PRIORITY.SECONDARY, changefreq: 'weekly' },
];

export const STATIC_PAGES: SitemapPageConfig[] = [
  { path: 'about-us', label: 'About Us', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly', images: ['/assets/SIRNARESH.png', '/assets/SIRSUBIR.png', '/assets/SIRJAVED.png'] },
  { path: 'contact-us', label: 'Contact Us', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'careers', label: 'Careers', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'csr', label: 'Corporate Social Responsibility', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly', images: ['/assets/pinkrunone-web.jpg'] },
  { path: 'global-presence', label: 'Global Presence', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'ungc', label: 'UN Global Compact', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly', images: ['/assets/UNGClogo.png'] },
  { path: 'meditations', label: 'Meditations App', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'sitemap', label: 'Sitemap', section: 'company', priority: PRIORITY.STATIC, changefreq: 'weekly' },
  { path: 'return-and-refund-policy', label: 'Return and Refund Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'privacy-policy', label: 'Privacy Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'terms-of-service', label: 'Terms of Service', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'medical-disclaimer', label: 'Medical Disclaimer', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'prescription-policy', label: 'Prescription Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'shipping-and-delivery-policy', label: 'Shipping and Delivery Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
];

export function xmlEscape(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function absoluteUrl(path: string): string {
  return path ? `${DOMAIN}/${path.replace(/^\//, '')}` : `${DOMAIN}/`;
}

/**
 * Links typed into Studio sometimes point at www.getmeds.ph or http://. Google treats those
 * as a second copy of the site, so any link to this site is rewritten to the one canonical
 * address (https://getmeds.ph/...). Links to other sites are returned unchanged.
 */
export function canonicalSiteLink(link: string): string {
  const raw = (link || '').trim();
  const m = raw.match(/^(?:https?:)?\/\/(?:www\.)?getmeds\.ph(?=[/?#:]|$)(?::\d+)?(.*)$/i);
  if (!m) return raw;
  const rest = m[1] || '/';
  return `${DOMAIN}${rest.startsWith('/') ? rest : `/${rest}`}`;
}
