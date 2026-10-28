/*
 * Single source of truth for crawlable routes and images.
 * Feeds /sitemap.xml, /image-sitemap.xml, the HTML /sitemap page and robots.txt —
 * add a new page here and it shows up in all of them.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://getmeds.ph").replace(/\/$/, "");

/* Bump when content changes; used as <lastmod> in the XML sitemaps. */
export const LAST_MODIFIED = "2026-10-16";

export type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export type SiteRoute = {
  path: string;
  title: string;
  description: string;
  /* 1.0 main · 0.8 secondary · 0.5 static pages */
  priority: 1.0 | 0.8 | 0.5;
  changefreq: ChangeFreq;
};

export const routes: SiteRoute[] = [
  // Main — 1.0
  { path: "/", title: "Home", description: "Life-saving medicines for patients, doctors, pharmacies and hospitals in the Philippines.", priority: 1.0, changefreq: "daily" },
  { path: "/product-range", title: "Product Range", description: "Oncology, hematology, anti-infectives, endocrinology and essential medicines.", priority: 1.0, changefreq: "daily" },
  { path: "/order-medicines", title: "Order Medicines", description: "Buy prescription medicines online from Getmeds, an FDA-licensed importer, wholesaler, distributor and retail pharmacy. Delivery across the Philippines.", priority: 1.0, changefreq: "weekly" },
  { path: "/patient-assistance-program", title: "Patient Assistance Program", description: "Price quotations for DSWD, PCSO, OP and OVP Guarantee Letters.", priority: 1.0, changefreq: "weekly" },
  { path: "/services", title: "Our Services", description: "Importation, wholesale distribution, cold-chain logistics and patient programs.", priority: 1.0, changefreq: "monthly" },

  // Secondary — 0.8
  { path: "/global-network", title: "Global Network", description: "Our international manufacturing and sourcing partners.", priority: 0.8, changefreq: "monthly" },
  { path: "/blog", title: "Blog", description: "News, health articles and company updates from Getmeds.", priority: 0.8, changefreq: "weekly" },
  { path: "/careers", title: "Careers", description: "Join the Getmeds team.", priority: 0.8, changefreq: "monthly" },
  { path: "/csr", title: "Corporate Social Responsibility", description: "Our community and patient-access initiatives.", priority: 0.8, changefreq: "monthly" },
  { path: "/ungc", title: "UN Global Compact", description: "Our commitment as a UN Global Compact participant.", priority: 0.8, changefreq: "monthly" },
  { path: "/meditations", title: "Meditations", description: "Reflections from the Getmeds community.", priority: 0.8, changefreq: "monthly" },

  // Static — 0.5
  { path: "/about-us", title: "About Us", description: "Who we are and why Getmeds exists.", priority: 0.5, changefreq: "yearly" },
  { path: "/contact-us", title: "Contact Us", description: "Reach the Getmeds team by phone, email or visit.", priority: 0.5, changefreq: "yearly" },
  { path: "/sitemap", title: "Sitemap", description: "Every page on getmeds.ph.", priority: 0.5, changefreq: "monthly" },
];

/* Product categories surfaced in the HTML sitemap (query URLs stay out of the XML sitemap). */
export const productCategories = ["Oncology", "Hematology", "Anti-Infectives", "Endocrinology", "Orthopedic", "Cardiology"];

/* Images Google should index, grouped by the page they appear on. */
export const pageImages: Record<string, { src: string; alt: string }[]> = {
  "/": [
    { src: "/images/herosectionimage.png", alt: "A smiling Getmeds doctor comforting a cancer patient in a headscarf" },
    { src: "/images/getmeds-logo.png", alt: "GetMEDS Philippines — Your Compassionate Health Ally" },
    { src: "/images/imageone.jpeg", alt: "The Getmeds team — Your Health, Compassionate Ally" },
    { src: "/images/imagetwo.png", alt: "Getmeds product range — oncology, hematology, essential medicines and medical supplies" },
    { src: "/images/pazopanibfeatured.jpeg", alt: "PazoGet-200 (Pazopanib 200 mg) film-coated tablets by Getmeds" },
    { src: "/images/capabilities-original.png", alt: "Getmeds team at the CPHI Japan international pharmaceutical expo, April 2026" },
    { src: "/images/faqsimage.png", alt: "Getmeds team member thinking about a question" },
    { src: "/images/paplogo.png", alt: "Patient Assistance Program" },
    { src: "/images/globalnetwork.webp", alt: "Global Network" },
    { src: "/images/articles/who-wipo-igc.jpg", alt: "WHO and partners discuss governance of traditional medicine knowledge in the AI era at WIPO-IGC" },
    { src: "/images/articles/isomab-sessa.png", alt: "Professor Bill Sessa appointed Chair of Isomab's Scientific Advisory Board" },
    { src: "/images/articles/essar-us-steel.jpg", alt: "Essar eyes $18-billion US steel plant" },
  ],
};

/* Back-office paths kept out of search results. */
export const disallowedPaths = [
  "/admin/",
  "/dashboard/",
  "/backpanel/",
  "/api/",
  "/wp-admin/",
  "/wp-login.php",
];

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "/" : encodeURI(path)}`;

export const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
