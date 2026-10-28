/**
 * sitemapData.ts
 * ─────────────────────────────────────────────
 * Server-side port of getmeds_frontend/scripts/generate-sitemap.cjs.
 *
 * The old site ran that script on every build and wrote public/sitemap.xml,
 * category-sitemap.xml, product-sitemap.xml, blog-sitemap.xml, image-sitemap.xml and
 * the link block of sitemap.html. Here the same data is fetched (Sanity product sheet,
 * Sanity page assets, WordPress posts) and the same output is produced by the
 * route handlers in src/app/*-sitemap.xml and the /sitemap page, which are
 * revalidated daily instead of being regenerated per deploy.
 *
 * Only server code imports this file.
 */

import { unstable_cache } from 'next/cache';

export const SITEMAP_DOMAIN = 'https://getmeds.ph';

/** How long generated sitemaps are cached before being rebuilt (seconds). */
export const SITEMAP_REVALIDATE = 86400;

// Three priority tiers, and only three, so the relative weighting stays readable:
//   MAIN      — the homepage and the hubs a visitor actually shops/navigates from
//   SECONDARY — everything those hubs lead to (products, conditions, audiences, articles)
//   STATIC    — company and legal pages that rarely change (about, contact, policies, ...)
const PRIORITY = { MAIN: '1.0', SECONDARY: '0.8', STATIC: '0.5' } as const;

export interface StaticSitemapPage {
  path: string;
  label: string;
  section: 'main' | 'order' | 'company' | 'policies';
  priority: string;
  changefreq: string;
}

export interface SubcategoryRoute {
  path: string;
  label: string;
  priority: string;
  changefreq: string;
  kind: 'folder' | 'condition';
}

export interface ProductRoute {
  path: string;
  label: string;
  folder: string;
  image?: string;
  priority: string;
  changefreq: string;
}

export interface WpPost {
  slug?: string;
  date?: string;
  modified?: string;
  title?: { rendered?: string };
  _embedded?: { 'wp:featuredmedia'?: Array<{ source_url?: string }> };
}

// label/section feed the HTML sitemap (/sitemap); path/priority/changefreq the XML ones.
export const STATIC_SITEMAP_PAGES: StaticSitemapPage[] = [
  { path: '', label: 'Home', section: 'main', priority: PRIORITY.MAIN, changefreq: 'daily' },
  // The all-products landing page, and what the navbar's "Product Range" links to.
  { path: 'product-range', label: 'Product Range', section: 'main', priority: PRIORITY.MAIN, changefreq: 'weekly' },
  { path: 'services', label: 'Services', section: 'main', priority: PRIORITY.MAIN, changefreq: 'monthly' },
  { path: 'patient-assistance-program', label: 'Patient Assistance Program', section: 'main', priority: PRIORITY.MAIN, changefreq: 'monthly' },
  { path: 'blog', label: 'Blog', section: 'main', priority: PRIORITY.MAIN, changefreq: 'daily' },
  // Category folders (cancer-medicines, antibiotics, ...) come from getAllProductRoutes().
  { path: 'order-medicines', label: 'Order Medicines', section: 'main', priority: PRIORITY.MAIN, changefreq: 'monthly' },
  { path: 'order-medicines/patients', label: 'For Patients', section: 'order', priority: PRIORITY.SECONDARY, changefreq: 'monthly' },
  { path: 'order-medicines/doctors', label: 'For Doctors', section: 'order', priority: PRIORITY.SECONDARY, changefreq: 'monthly' },
  { path: 'order-medicines/distributors', label: 'For Distributors', section: 'order', priority: PRIORITY.SECONDARY, changefreq: 'monthly' },
  { path: 'order-medicines/hospitals', label: 'For Hospitals', section: 'order', priority: PRIORITY.SECONDARY, changefreq: 'monthly' },
  { path: 'meditations', label: 'Meditations App', section: 'company', priority: PRIORITY.SECONDARY, changefreq: 'monthly' },
  { path: 'about-us', label: 'About Us', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'contact-us', label: 'Contact Us', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'careers', label: 'Careers', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'csr', label: 'Corporate Social Responsibility', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'global-presence', label: 'Global Presence', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'ungc', label: 'UN Global Compact', section: 'company', priority: PRIORITY.STATIC, changefreq: 'monthly' },
  { path: 'sitemap', label: 'Sitemap', section: 'company', priority: PRIORITY.STATIC, changefreq: 'weekly' },
  { path: 'return-and-refund-policy', label: 'Return and Refund Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'privacy-policy', label: 'Privacy Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'terms-of-service', label: 'Terms of Service', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'medical-disclaimer', label: 'Medical Disclaimer', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'prescription-policy', label: 'Prescription Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
  { path: 'shipping-and-delivery-policy', label: 'Shipping and Delivery Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
];

// Slugs of blog posts that redirect to another post. The original read these from the
// "/blog/<slug>" sources in vercel.json; the same seven redirects live in next.config.ts.
const BLOG_REDIRECTED_SLUGS = new Set([
  'how-to-get-medical-assistance-from-dswd',
  '14-essential-cancer-screening-tests-for-women-early-detection-in-the-philippines',
  'nutrition-tips-for-a-healthy-immune-system',
  'cough-and-cold-medicines',
  'how-to-cure-cough-and-cold',
  'maintain-a-healthy-weight',
  'best-supplements-and-vitamins-for-kids',
]);

export function xmlEscape(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// WordPress titles come pre-encoded ("&#8217;" etc.); decode once.
export function decodeWpEntities(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// "cancer-medicines" -> "Cancer Medicines"
export function humanize(slug?: string | null): string {
  return (String(slug || '').split('/').pop() || '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Mirrors computeProductKey() in src/lib/productImageKey.ts — the key the Studio's
// Product Images tab links each image under.
function normalizeKeyPart(value: unknown): string {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function productImageKey(row: Record<string, unknown>): string | null {
  const slugKey = normalizeKeyPart(row.slug || row['slug.current']);
  if (slugKey) return slugKey;
  const parts = [row.brandName, row.genericName, row.strength, row.form].map(normalizeKeyPart).filter(Boolean);
  if (parts.length) return parts.join('-');
  return normalizeKeyPart(row.name) || null;
}

// WordPress media is served to visitors through getmeds.ph's own /wp-content proxy,
// so list it under that host rather than cms.getmeds.ph.
function publicWpUrl(url?: string | null): string {
  if (!url) return '';
  return String(url)
    .replace(/^https?:\/\/(cms\.|www\.)?getmeds\.ph/i, SITEMAP_DOMAIN)
    .replace(/^https?:\/\/173\.231\.197\.156/i, SITEMAP_DOMAIN);
}

// Strips a bare domain-prefixed URL from the sheet (e.g. "getmeds.ph/cancer-medicines/x",
// with or without a protocol) down to just its path, e.g. "cancer-medicines/x".
function stripDomain(url: unknown): string {
  if (!url) return '';
  return String(url).replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '');
}

function isInvalidEnv(val?: string): boolean {
  return !val || val.includes('[SENSITIVE]') || val.includes('[') || val.includes(']');
}

async function fetchSanityData<T>(query: string): Promise<T> {
  const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
  const projectId = isInvalidEnv(rawProjectId) ? 's7ocz8zp' : rawProjectId;
  const rawDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.VITE_SANITY_DATASET;
  const dataset = isInvalidEnv(rawDataset) ? 'production' : rawDataset;
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SitemapGenerator/1.0' },
    next: { revalidate: SITEMAP_REVALIDATE },
  });
  if (res.status === 200) {
    return (await res.json()).result as T;
  }
  throw new Error(`Sanity API returned status code ${res.status}`);
}

// Sitemap URLs are read directly from the sheet's own URL columns. Product pages use
// "Product Page URL (auto)" (categoryFolder + slug); condition hubs use
// "Condition Hub URL (auto)".
export async function getAllProductRoutes(): Promise<{
  subcategories: SubcategoryRoute[];
  products: ProductRoute[];
  categoryImageUrls: string[];
}> {
  const folderUrls: SubcategoryRoute[] = [];
  const conditionUrls: SubcategoryRoute[] = [];
  const products: ProductRoute[] = [];
  const categoryImageUrls: string[] = [];
  try {
    // Not filtering on defined(json_data): GROQ silently fails to match that against this
    // field once it's large, even though the field is genuinely present.
    const excelDoc = await fetchSanityData<{
      json_data?: string;
      productImages?: Array<{ productKey?: string; url?: string }>;
      categoryImages?: Array<{ url?: string }>;
    } | null>('*[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)] | order(_updatedAt desc)[0] { json_data, "productImages": productImages[]{ productKey, "url": image.asset->url }, "categoryImages": categoryImages[]{ "url": image.asset->url } }');

    const imageByKey = new Map<string, string>();
    ((excelDoc && excelDoc.productImages) || []).forEach((link) => {
      if (link && link.productKey && link.url) imageByKey.set(link.productKey, link.url);
    });
    ((excelDoc && excelDoc.categoryImages) || []).forEach((c) => {
      if (c && c.url) categoryImageUrls.push(c.url);
    });

    let rawRows: Array<Record<string, unknown>> = [];
    if (excelDoc && excelDoc.json_data) {
      try {
        const data = JSON.parse(excelDoc.json_data);
        const firstSheetName = Object.keys(data)[0];
        if (firstSheetName) rawRows = data[firstSheetName] || [];
      } catch (e) {
        console.error('[Sitemap] Failed to parse Excel json_data:', (e as Error).message);
      }
    }
    // Sheet rows can include trailing blanks past the last real row of data.
    rawRows = rawRows.filter((r) => r && (r.brandName || r.genericName || r.name || r.slug));

    const folders = new Set<string>();
    const conditions = new Map<string, unknown>(); // conditionSlug -> conditionHubUrl
    const productsBySlug = new Map<string, Record<string, unknown>>();

    rawRows.forEach((row) => {
      if (row.categoryFolder) folders.add(String(row.categoryFolder).trim());
      if (row.conditionSlug && row.conditionHubUrl) {
        conditions.set(String(row.conditionSlug).trim(), row.conditionHubUrl);
      }
      const slugKey = String(row.slug || '').toLowerCase().trim();
      if (slugKey && !productsBySlug.has(slugKey)) {
        productsBySlug.set(slugKey, row);
      }
    });

    folders.forEach((folder) => {
      folderUrls.push({ path: folder, label: humanize(folder), priority: PRIORITY.MAIN, changefreq: 'weekly', kind: 'folder' });
    });

    conditions.forEach((hubUrl, conditionSlug) => {
      const p = stripDomain(hubUrl);
      if (p) conditionUrls.push({ path: p, label: humanize(conditionSlug), priority: PRIORITY.SECONDARY, changefreq: 'weekly', kind: 'condition' });
    });

    productsBySlug.forEach((row) => {
      const p = row.productPageUrl
        ? stripDomain(row.productPageUrl)
        : (row.categoryFolder && row.slug ? `${row.categoryFolder}/${row.slug}` : '');
      if (!p) return;
      const brand = String(row.brandName || row.name || '').trim();
      const generic = String(row.genericName || '').trim();
      const label = [
        brand || generic,
        brand && generic && brand.toLowerCase() !== generic.toLowerCase() ? `(${generic})` : '',
        String(row.strength || '').trim(),
        String(row.form || '').trim(),
      ].filter(Boolean).join(' ');
      const key = productImageKey(row);
      products.push({
        path: p,
        label: label || humanize(p),
        folder: String(row.categoryFolder || p.split('/')[0]).trim(),
        image: key ? imageByKey.get(key) : undefined,
        priority: PRIORITY.SECONDARY,
        changefreq: 'monthly',
      });
    });
  } catch (err) {
    console.error('[Sitemap] Failed to retrieve products from Sanity:', (err as Error).message);
  }
  return { subcategories: [...folderUrls, ...conditionUrls], products, categoryImageUrls };
}

// Page imagery managed in the Studio as "pageAsset" documents, attributed to a page by
// name prefix. Anything whose name doesn't clearly say which page it belongs to is left out.
const PAGE_ASSET_PREFIXES: Array<[string, string]> = [
  ['Home Hero', ''],
  ['About Us', 'about-us'],
  ['Careers', 'careers'],
  ['Contact Us', 'contact-us'],
  ['CSR', 'csr'],
  ['Global Presence', 'global-presence'],
  ['Meditations', 'meditations'],
  ['PAP ', 'patient-assistance-program'],
  ['Patient Assistance Program', 'patient-assistance-program'],
  ['Services', 'services'],
  ['UNGC', 'ungc'],
];

export async function getPageAssetImages(): Promise<Map<string, string[]>> {
  const byPage = new Map<string, string[]>(); // page path -> [image url]
  try {
    const assets = (await fetchSanityData<Array<{ name?: string; urls?: string[] }>>(
      '*[_type == "pageAsset"]{ name, "urls": images[].image.asset->url }'
    )) || [];
    assets.forEach((a) => {
      const match = PAGE_ASSET_PREFIXES.find(([prefix]) => String(a.name || '').startsWith(prefix));
      if (!match) return;
      const urls = (a.urls || []).filter(Boolean);
      if (!urls.length) return;
      if (!byPage.has(match[1])) byPage.set(match[1], []);
      byPage.get(match[1])!.push(...urls);
    });
  } catch (err) {
    console.error('[Sitemap] Failed to fetch page images from Sanity:', (err as Error).message);
  }
  return byPage;
}

// Fetch a single page of posts from the WordPress API.
async function fetchPostsPage(page: number): Promise<{ posts: WpPost[]; totalPages: number }> {
  // _embed=true carries each post's featured image inline (for image-sitemap.xml). Not
  // combined with _fields: WordPress drops _embedded when _fields is present.
  const pathQuery = `/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=true`;
  const wordpressApiRoot =
    process.env.NEXT_PUBLIC_WORDPRESS_API_ROOT || process.env.VITE_WORDPRESS_API_ROOT || 'https://cms.getmeds.ph';
  const targetUrl = new URL(wordpressApiRoot);
  const res = await fetch(`${targetUrl.origin}${pathQuery}`, {
    headers: { 'User-Agent': 'SitemapGenerator/1.0' },
    // Each page carrying embedded media is ~3MB, over the data cache's 2MB per-item limit,
    // so the raw response isn't cached; getAllPosts caches the slimmed posts instead.
    cache: 'no-store',
  });
  if (res.status === 200) {
    return {
      posts: (await res.json()) as WpPost[],
      totalPages: parseInt(res.headers.get('x-wp-totalpages') || '1', 10),
    };
  }
  throw new Error(`WordPress API returned status code ${res.status}`);
}

// Fetch all posts by paginating through the WordPress API.
async function fetchAllPosts(): Promise<WpPost[]> {
  let allPosts: WpPost[] = [];
  let page = 1;
  let totalPages = 1;
  try {
    do {
      const { posts, totalPages: pages } = await fetchPostsPage(page);
      allPosts = allPosts.concat(posts);
      totalPages = pages;
      page++;
    } while (page <= totalPages);
  } catch (err) {
    console.error('[Sitemap] Failed to fetch posts from WordPress. Falling back to static routes only:', (err as Error).message);
  }
  // Keep only what the sitemaps read, so the cached copy stays small.
  return allPosts.map((post) => {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    return {
      slug: post.slug,
      date: post.date,
      modified: post.modified,
      title: { rendered: post.title?.rendered },
      _embedded: media ? { 'wp:featuredmedia': [{ source_url: media.source_url }] } : undefined,
    };
  });
}

/** All WordPress posts (slimmed), shared by every sitemap and cached for a day. */
export const getAllPosts = unstable_cache(fetchAllPosts, ['sitemap-wordpress-posts'], {
  revalidate: SITEMAP_REVALIDATE,
});

/** Posts that 301 elsewhere stay out of the sitemaps. */
export function livePostsOf(posts: WpPost[]): WpPost[] {
  return posts.filter((post) => post.slug && !BLOG_REDIRECTED_SLUGS.has(post.slug));
}

const currentDate = () => new Date().toISOString().split('T')[0];
// Trailing slash on the root so this matches the homepage canonical.
const absolute = (p: string) => (p ? `${SITEMAP_DOMAIN}/${p}` : `${SITEMAP_DOMAIN}/`);

interface UrlEntry { loc: string; lastmod?: string; changefreq: string; priority: string }

function generateUrlSetXml(urls: UrlEntry[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  urls.forEach((u) => {
    xml += '  <url>\n';
    xml += `    <loc>${xmlEscape(u.loc)}</loc>\n`;
    if (u.lastmod) {
      xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    }
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  xml += '</urlset>\n';
  return xml;
}

/** category-sitemap.xml — static pages + category folders + condition hubs. */
export async function buildCategorySitemapXml(): Promise<string> {
  const { subcategories } = await getAllProductRoutes();
  const date = currentDate();
  const urls: UrlEntry[] = [];
  STATIC_SITEMAP_PAGES.forEach((p) => urls.push({ loc: absolute(p.path), changefreq: p.changefreq, priority: p.priority, lastmod: date }));
  subcategories.forEach((s) => urls.push({ loc: absolute(s.path), changefreq: s.changefreq, priority: s.priority, lastmod: date }));
  return generateUrlSetXml(urls);
}

/** product-sitemap.xml */
export async function buildProductSitemapXml(): Promise<string> {
  const { products } = await getAllProductRoutes();
  const date = currentDate();
  return generateUrlSetXml(products.map((p) => ({ loc: absolute(p.path), changefreq: p.changefreq, priority: p.priority, lastmod: date })));
}

/** blog-sitemap.xml — live WordPress posts, lastmod from each post. */
export async function buildBlogSitemapXml(): Promise<string> {
  const posts = livePostsOf(await getAllPosts());
  const date = currentDate();
  return generateUrlSetXml(posts.map((post) => {
    const stamp = post.modified || post.date;
    return {
      loc: `${SITEMAP_DOMAIN}/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: PRIORITY.SECONDARY,
      lastmod: stamp ? new Date(stamp).toISOString().split('T')[0] : date,
    };
  }));
}

/** sitemap.xml — the sitemap index over the three URL sitemaps. */
export function buildSitemapIndexXml(): string {
  const date = currentDate();
  let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  ['category-sitemap.xml', 'product-sitemap.xml', 'blog-sitemap.xml'].forEach((s) => {
    indexXml += '  <sitemap>\n';
    indexXml += `    <loc>${SITEMAP_DOMAIN}/${s}</loc>\n`;
    indexXml += `    <lastmod>${date}</lastmod>\n`;
    indexXml += '  </sitemap>\n';
  });
  indexXml += '</sitemapindex>\n';
  return indexXml;
}

/**
 * image-sitemap.xml — one <url> per page that shows images.
 */
export async function buildImageSitemapXml(): Promise<string> {
  const [posts, { products, categoryImageUrls }, pageImages] = await Promise.all([
    getAllPosts().then(livePostsOf),
    getAllProductRoutes(),
    getPageAssetImages(),
  ]);

  const imagesByPage = new Map<string, Set<string>>(); // page url -> Set of image urls
  const addImages = (pageUrl: string, urls: Array<string | undefined>) => {
    const clean = (urls || []).filter((u): u is string => Boolean(u));
    if (!clean.length) return;
    if (!imagesByPage.has(pageUrl)) imagesByPage.set(pageUrl, new Set());
    clean.forEach((u) => imagesByPage.get(pageUrl)!.add(u));
  };
  pageImages.forEach((urls, pagePath) => addImages(absolute(pagePath), urls));
  // Category tiles appear on both the homepage and the Product Range page.
  addImages(absolute(''), categoryImageUrls);
  addImages(absolute('product-range'), categoryImageUrls);
  products.forEach((p) => addImages(absolute(p.path), [p.image]));
  posts.forEach((post) => {
    const media = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
    addImages(`${SITEMAP_DOMAIN}/blog/${post.slug}`, [publicWpUrl(media && media.source_url)]);
  });

  let imageXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  imageXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  imagesByPage.forEach((urls, pageUrl) => {
    imageXml += '  <url>\n';
    imageXml += `    <loc>${xmlEscape(pageUrl)}</loc>\n`;
    // The protocol's cap is 1,000 images per page.
    [...urls].slice(0, 1000).forEach((u) => {
      imageXml += `    <image:image>\n      <image:loc>${xmlEscape(u)}</image:loc>\n    </image:image>\n`;
    });
    imageXml += '  </url>\n';
  });
  imageXml += '</urlset>\n';
  return imageXml;
}

export interface HtmlSitemapLink { href: string; label: string }
export interface HtmlSitemapSection {
  id: string;
  title: string;
  count: number;
  /** Plain link list, or product groups under a category heading. */
  links?: HtmlSitemapLink[];
  groups?: Array<{ heading: string; links: HtmlSitemapLink[] }>;
}

/** The sections of the human-readable /sitemap page, as writeHtmlSitemap() built them. */
export async function buildHtmlSitemapSections(): Promise<HtmlSitemapSection[]> {
  const [posts, { subcategories, products }] = await Promise.all([
    getAllPosts().then(livePostsOf),
    getAllProductRoutes(),
  ]);

  const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label);
  const pagesIn = (name: StaticSitemapPage['section']) =>
    STATIC_SITEMAP_PAGES.filter((p) => p.section === name).map((p) => ({ href: `/${p.path}`, label: p.label }));
  const folders = subcategories.filter((s) => s.kind === 'folder').sort(byLabel);
  const conditions = subcategories.filter((s) => s.kind === 'condition').sort(byLabel);

  // Products grouped under their category folder, folders in alphabetical order.
  const folderLabel = new Map(folders.map((f) => [f.path, f.label]));
  const productGroups = new Map<string, ProductRoute[]>();
  products.forEach((p) => {
    if (!productGroups.has(p.folder)) productGroups.set(p.folder, []);
    productGroups.get(p.folder)!.push(p);
  });
  const groups = [...productGroups.keys()]
    .sort((a, b) => (folderLabel.get(a) || humanize(a)).localeCompare(folderLabel.get(b) || humanize(b)))
    .map((folder) => ({
      heading: folderLabel.get(folder) || humanize(folder),
      links: productGroups.get(folder)!.sort(byLabel).map((p) => ({ href: `/${p.path}`, label: p.label })),
    }));

  const sortedPosts = [...posts].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const sections: Array<HtmlSitemapSection | false> = [
    { id: 'main-pages', title: 'Main Pages', count: pagesIn('main').length, links: pagesIn('main') },
    { id: 'order-medicines', title: 'Order Medicines', count: pagesIn('order').length, links: pagesIn('order') },
    folders.length > 0 && { id: 'medicine-categories', title: 'Medicine Categories', count: folders.length, links: folders.map((f) => ({ href: `/${f.path}`, label: f.label })) },
    conditions.length > 0 && { id: 'conditions', title: 'Conditions', count: conditions.length, links: conditions.map((c) => ({ href: `/${c.path}`, label: c.label })) },
    products.length > 0 && { id: 'products', title: 'Products', count: products.length, groups },
    { id: 'company', title: 'Company', count: pagesIn('company').length, links: pagesIn('company') },
    { id: 'policies', title: 'Policies', count: pagesIn('policies').length, links: pagesIn('policies') },
    sortedPosts.length > 0 && {
      id: 'blog-articles',
      title: 'Blog Articles',
      count: sortedPosts.length,
      links: sortedPosts.map((post) => ({
        href: `/blog/${post.slug}`,
        label: decodeWpEntities(post.title && post.title.rendered) || humanize(post.slug),
      })),
    },
  ];
  return sections.filter((s): s is HtmlSitemapSection => Boolean(s));
}
