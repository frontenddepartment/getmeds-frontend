const fs = require('fs');
const path = require('path');
const https = require('https');

const DOMAIN = 'https://getmeds.ph';

// Three priority tiers, and only three, so the relative weighting stays readable:
//   MAIN      — the homepage and the hubs a visitor actually shops/navigates from
//   SECONDARY — everything those hubs lead to (products, conditions, audiences, articles)
//   STATIC    — company and legal pages that rarely change (about, contact, policies, ...)
const PRIORITY = { MAIN: '1.0', SECONDARY: '0.8', STATIC: '0.5' };

// Outputs, all written to public/ and served from the site root:
//   sitemap.xml          — sitemap index over the three URL sitemaps below
//   category-sitemap.xml, product-sitemap.xml, blog-sitemap.xml
//   image-sitemap.xml    — separate image sitemap (Google image extension)
//   sitemap.html         — the human-readable sitemap page; lives in the repo root (it's a
//                          Vite page like any other) and only the block between its
//                          SITEMAP:START/END markers is regenerated here.
const HTML_SITEMAP_FILE = path.join(__dirname, '..', 'sitemap.html');

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function htmlEscape(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// WordPress titles come pre-encoded ("&#8217;" etc.); decode once so htmlEscape() doesn't
// double-encode them.
function decodeWpEntities(str) {
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
function humanize(slug) {
  return String(slug || '')
    .split('/')
    .pop()
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Mirrors computeProductKey() in src/lib/productImageKey.ts — the key the Studio's
// Product Images tab links each image under.
function normalizeKeyPart(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function productImageKey(row) {
  const slugKey = normalizeKeyPart(row.slug || row['slug.current']);
  if (slugKey) return slugKey;
  const parts = [row.brandName, row.genericName, row.strength, row.form].map(normalizeKeyPart).filter(Boolean);
  if (parts.length) return parts.join('-');
  return normalizeKeyPart(row.name) || null;
}

// WordPress media is served to visitors through getmeds.ph's own /wp-content proxy
// (vercel.json), so list it under that host rather than cms.getmeds.ph.
function publicWpUrl(url) {
  if (!url) return '';
  return String(url).replace(/^https?:\/\/(cms\.|www\.)?getmeds\.ph/i, DOMAIN).replace(/^https?:\/\/173\.231\.197\.156/i, DOMAIN);
}

// Helper to make HTTPS requests using Node's standard library
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', (err) => reject(err));
    if (options.body) req.write(options.body);
    req.end();
  });
}

// Load environment variables from .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        } else if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1);
        }
        env[key] = value.trim();
      }
    });
  }
  return env;
}

// Strips a bare domain-prefixed URL from the sheet (e.g. "getmeds.ph/cancer-medicines/x",
// with or without a protocol) down to just its path, e.g. "cancer-medicines/x".
function stripDomain(url) {
  if (!url) return '';
  return String(url).replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '');
}

async function fetchSanityData(query) {
  const env = loadEnv();
  const isInvalid = (val) => !val || val.includes('[SENSITIVE]') || val.includes('[') || val.includes(']');
  const rawProjectId = env.VITE_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
  const projectId = isInvalid(rawProjectId) ? 's7ocz8zp' : rawProjectId;
  const rawDataset = env.VITE_SANITY_DATASET || process.env.VITE_SANITY_DATASET;
  const dataset = isInvalid(rawDataset) ? 'production' : rawDataset;
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  
  const res = await request(url, { headers: { 'User-Agent': 'SitemapGenerator/1.0' } });
  if (res.statusCode === 200) {
    return JSON.parse(res.body).result;
  }
  throw new Error(`Sanity API returned status code ${res.statusCode}`);
}

// Sitemap URLs are read directly from the sheet's own URL columns — no more
// hardcoded cancer/subcategory slug tables or a hand-rolled slug builder.
// Product pages use "Product Page URL (auto)" (categoryFolder + slug); the
// condition hub URLs below use "Condition Hub URL (auto)" directly — that's
// the ONE place conditions get a URL at all, since they're sitemap/crawl-only
// and not an in-app route the frontend actively resolves.
async function getAllProductRoutes() {
  const folderUrls = [];
  const conditionUrls = [];
  const products = [];
  const categoryImageUrls = [];
  try {
    console.log('[Sitemap] Fetching active product sheet from Sanity...');
    // NOTE: not filtering on defined(json_data) — GROQ silently fails to match
    // that against this field once it's large (200KB+ of parsed Excel data),
    // even though the field is genuinely present.
    const excelDoc = await fetchSanityData('*[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)] | order(_updatedAt desc)[0] { json_data, "productImages": productImages[]{ productKey, "url": image.asset->url }, "categoryImages": categoryImages[]{ "url": image.asset->url } }');

    const imageByKey = new Map();
    ((excelDoc && excelDoc.productImages) || []).forEach((link) => {
      if (link && link.productKey && link.url) imageByKey.set(link.productKey, link.url);
    });
    ((excelDoc && excelDoc.categoryImages) || []).forEach((c) => {
      if (c && c.url) categoryImageUrls.push(c.url);
    });

    let rawRows = [];
    if (excelDoc && excelDoc.json_data) {
      try {
        const data = JSON.parse(excelDoc.json_data);
        const firstSheetName = Object.keys(data)[0];
        if (firstSheetName) rawRows = data[firstSheetName] || [];
      } catch (e) {
        console.error('[Sitemap] Failed to parse Excel json_data:', e.message);
      }
    }
    // Sheet rows can include trailing blanks past the last real row of data.
    rawRows = rawRows.filter(r => r && (r.brandName || r.genericName || r.name || r.slug));

    const folders = new Set();
    const conditions = new Map(); // conditionSlug -> conditionHubUrl
    const productsBySlug = new Map();

    rawRows.forEach(row => {
      if (row.categoryFolder) folders.add(String(row.categoryFolder).trim());
      if (row.conditionSlug && row.conditionHubUrl) {
        conditions.set(String(row.conditionSlug).trim(), row.conditionHubUrl);
      }
      const slugKey = String(row.slug || '').toLowerCase().trim();
      if (slugKey && !productsBySlug.has(slugKey)) {
        productsBySlug.set(slugKey, row);
      }
    });

    folders.forEach(folder => {
      folderUrls.push({ path: folder, label: humanize(folder), priority: PRIORITY.MAIN, changefreq: 'weekly', kind: 'folder' });
    });

    conditions.forEach((hubUrl, conditionSlug) => {
      const p = stripDomain(hubUrl);
      if (p) conditionUrls.push({ path: p, label: humanize(conditionSlug), priority: PRIORITY.SECONDARY, changefreq: 'weekly', kind: 'condition' });
    });

    productsBySlug.forEach(row => {
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

    console.log(`[Sitemap] Successfully processed ${folders.size} category folders, ${conditions.size} condition hubs, and ${productsBySlug.size} products from Sanity.`);
  } catch (err) {
    console.error('[Sitemap] Failed to retrieve products from Sanity:', err.message);
  }
  return { subcategories: [...folderUrls, ...conditionUrls], products, categoryImageUrls };
}

// Page imagery managed in the Studio as "pageAsset" documents. Those documents aren't tagged
// with the page they appear on, only named ("About Us Hero Background", "UNGC Logo White"),
// so they're attributed by name prefix — and anything whose name doesn't clearly say which
// page it belongs to is left out rather than guessed at.
const PAGE_ASSET_PREFIXES = [
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

async function getPageAssetImages() {
  const byPage = new Map(); // page path -> [image url]
  try {
    const assets = await fetchSanityData('*[_type == "pageAsset"]{ name, "urls": images[].image.asset->url }') || [];
    assets.forEach((a) => {
      const match = PAGE_ASSET_PREFIXES.find(([prefix]) => String(a.name || '').startsWith(prefix));
      if (!match) return;
      const urls = (a.urls || []).filter(Boolean);
      if (!urls.length) return;
      if (!byPage.has(match[1])) byPage.set(match[1], []);
      byPage.get(match[1]).push(...urls);
    });
    console.log(`[Sitemap] Attributed page images to ${byPage.size} pages.`);
  } catch (err) {
    console.error('[Sitemap] Failed to fetch page images from Sanity:', err.message);
  }
  return byPage;
}

// Fetch a single page of posts from WordPress API, with IP fallback if DNS fails
async function fetchPage(page) {
  // _embed=true carries each post's featured image inline (for image-sitemap.xml). Not
  // combined with _fields: WordPress drops _embedded when _fields is present.
  const pathQuery = `/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=true`;
  const env = loadEnv();
  const wordpressApiRoot = env.VITE_WORDPRESS_API_ROOT || 'https://cms.getmeds.ph';
  const targetUrl = new URL(wordpressApiRoot);
  
  // Try 1: Fetch via the domain
  try {
    const res = await request(`${targetUrl.origin}${pathQuery}`, {
      headers: {
        'Host': targetUrl.host,
        'User-Agent': 'SitemapGenerator/1.0'
      }
    });
    if (res.statusCode === 200) {
      return {
        posts: JSON.parse(res.body),
        totalPages: parseInt(res.headers['x-wp-totalpages'] || '1', 10)
      };
    }
    throw new Error(`WordPress API returned status code ${res.statusCode}`);
  } catch (err) {
    console.warn(`Direct fetch failed for page ${page}: ${err.message}. Trying IP fallback...`);
  }

  // Try 2: Fetch via IP address with Host header (bypassing DNS and SSL validation)
  try {
    const res = await request(`https://173.231.197.156${pathQuery}`, {
      headers: {
        'Host': targetUrl.host,
        'User-Agent': 'SitemapGenerator/1.0'
      },
      rejectUnauthorized: false // Ignore self-signed/invalid certificate issues for IP
    });
    if (res.statusCode === 200) {
      return {
        posts: JSON.parse(res.body),
        totalPages: parseInt(res.headers['x-wp-totalpages'] || '1', 10)
      };
    }
    throw new Error(`WordPress API returned status code ${res.statusCode}`);
  } catch (err) {
    console.error(`IP fallback also failed for page ${page}:`, err.message);
    throw err;
  }
}

// Fetch all posts by paginating through the WordPress API
async function getAllPosts() {
  let allPosts = [];
  let page = 1;
  let totalPages = 1;
  
  try {
    do {
      console.log(`[Sitemap] Fetching WordPress posts page ${page}...`);
      const { posts, totalPages: pages } = await fetchPage(page);
      allPosts = allPosts.concat(posts);
      totalPages = pages;
      page++;
    } while (page <= totalPages);
    console.log(`[Sitemap] Successfully fetched ${allPosts.length} posts from WordPress.`);
  } catch (err) {
    console.error('[Sitemap] Failed to fetch posts from WordPress. Falling back to static routes only:', err.message);
  }
  return allPosts;
}

async function generate() {
  // label/section feed the HTML sitemap (sitemap.html); path/priority/changefreq the XML ones.
  const staticPages = [
    { path: '', label: 'Home', section: 'main', priority: PRIORITY.MAIN, changefreq: 'daily' },
    // The all-products landing page, and what the navbar's "Product Range" links to.
    // Prerendered and self-canonical (scripts/prerender-slugs.cjs); /conditions renders
    // the same view but canonicalises here, so it is deliberately not listed.
    { path: 'product-range', label: 'Product Range', section: 'main', priority: PRIORITY.MAIN, changefreq: 'weekly' },
    { path: 'services', label: 'Services', section: 'main', priority: PRIORITY.MAIN, changefreq: 'monthly' },
    { path: 'patient-assistance-program', label: 'Patient Assistance Program', section: 'main', priority: PRIORITY.MAIN, changefreq: 'monthly' },
    { path: 'blog', label: 'Blog', section: 'main', priority: PRIORITY.MAIN, changefreq: 'daily' },
    // Category folders (cancer-medicines, antibiotics, ...) come from
    // getAllProductRoutes() below now, straight from the sheet.
    // The hub, plus its four audience pages. Each audience is prerendered with its own
    // title/description/canonical by scripts/prerender-order-medicines.cjs, so all five
    // are real, separately indexable pages rather than one URL with four hidden states.
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
    // Prerendered by scripts/prerender-policies.cjs — each is a real page with its own
    // canonical, not an alias of /policy (which now 301s to return-and-refund-policy).
    { path: 'return-and-refund-policy', label: 'Return and Refund Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
    { path: 'privacy-policy', label: 'Privacy Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
    { path: 'terms-of-service', label: 'Terms of Service', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
    { path: 'medical-disclaimer', label: 'Medical Disclaimer', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
    { path: 'prescription-policy', label: 'Prescription Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' },
    { path: 'shipping-and-delivery-policy', label: 'Shipping and Delivery Policy', section: 'policies', priority: PRIORITY.STATIC, changefreq: 'yearly' }
  ];

  const posts = await getAllPosts();
  const { subcategories, products, categoryImageUrls } = await getAllProductRoutes();
  const pageImages = await getPageAssetImages();

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const currentDate = new Date().toISOString().split('T')[0];
  // Trailing slash on the root so this matches the canonical index.html declares.
  const absolute = (p) => (p ? `${DOMAIN}/${p}` : `${DOMAIN}/`);

  // Helper to generate a standard XML urlset
  function generateUrlSetXml(urls) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    urls.forEach(u => {
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

  // 1. Generate category-sitemap.xml (static pages + subcategories)
  const categoryUrls = [];
  staticPages.forEach(p => {
    categoryUrls.push({
      loc: absolute(p.path),
      changefreq: p.changefreq,
      priority: p.priority,
      lastmod: currentDate
    });
  });
  subcategories.forEach(s => {
    categoryUrls.push({
      loc: absolute(s.path),
      changefreq: s.changefreq,
      priority: s.priority,
      lastmod: currentDate
    });
  });
  fs.writeFileSync(path.join(publicDir, 'category-sitemap.xml'), generateUrlSetXml(categoryUrls), 'utf8');
  console.log('[Sitemap] Generated category-sitemap.xml successfully.');

  // 2. Generate product-sitemap.xml
  const productUrls = [];
  products.forEach(p => {
    productUrls.push({
      loc: absolute(p.path),
      changefreq: p.changefreq,
      priority: p.priority,
      lastmod: currentDate
    });
  });
  fs.writeFileSync(path.join(publicDir, 'product-sitemap.xml'), generateUrlSetXml(productUrls), 'utf8');
  console.log('[Sitemap] Generated product-sitemap.xml successfully.');

  // 3. Generate blog-sitemap.xml
  const redirectedSlugs = new Set([
    'how-to-get-medical-assistance-from-dswd',
    '14-essential-cancer-screening-tests-for-women-early-detection-in-the-philippines'
  ]);
  const livePosts = posts.filter(post => post.slug && !redirectedSlugs.has(post.slug));

  const blogUrls = [];
  livePosts.forEach(post => {
    const stamp = post.modified || post.date;
    const dateStr = stamp ? new Date(stamp).toISOString().split('T')[0] : currentDate;
    blogUrls.push({
      loc: `${DOMAIN}/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: PRIORITY.SECONDARY,
      lastmod: dateStr
    });
  });
  fs.writeFileSync(path.join(publicDir, 'blog-sitemap.xml'), generateUrlSetXml(blogUrls), 'utf8');
  console.log('[Sitemap] Generated blog-sitemap.xml successfully.');

  // 4. Generate sitemap.xml (Sitemap Index)
  let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  indexXml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const subSitemaps = ['category-sitemap.xml', 'product-sitemap.xml', 'blog-sitemap.xml'];
  subSitemaps.forEach(s => {
    indexXml += '  <sitemap>\n';
    indexXml += `    <loc>${DOMAIN}/${s}</loc>\n`;
    indexXml += `    <lastmod>${currentDate}</lastmod>\n`;
    indexXml += '  </sitemap>\n';
  });
  indexXml += '</sitemapindex>\n';

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), indexXml, 'utf8');
  console.log('[Sitemap] Generated sitemap.xml (Sitemap Index) successfully.');

  // 5. Generate image-sitemap.xml — kept separate from the URL sitemaps above and
  // submitted on its own (robots.txt lists both). One <url> per page that shows images,
  // each image as an <image:loc>; Google ignores the deprecated caption/title tags, so
  // they're not emitted.
  const imagesByPage = new Map(); // page url -> Set of image urls
  const addImages = (pageUrl, urls) => {
    const clean = (urls || []).filter(Boolean);
    if (!clean.length) return;
    if (!imagesByPage.has(pageUrl)) imagesByPage.set(pageUrl, new Set());
    clean.forEach(u => imagesByPage.get(pageUrl).add(u));
  };
  pageImages.forEach((urls, pagePath) => addImages(absolute(pagePath), urls));
  // Category tiles appear on both the homepage and the Product Range page.
  addImages(absolute(''), categoryImageUrls);
  addImages(absolute('product-range'), categoryImageUrls);
  products.forEach(p => addImages(absolute(p.path), [p.image]));
  livePosts.forEach(post => {
    const media = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
    addImages(`${DOMAIN}/blog/${post.slug}`, [publicWpUrl(media && media.source_url)]);
  });

  let imageXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  imageXml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  imageXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  let imageCount = 0;
  imagesByPage.forEach((urls, pageUrl) => {
    imageXml += '  <url>\n';
    imageXml += `    <loc>${xmlEscape(pageUrl)}</loc>\n`;
    // The protocol's cap is 1,000 images per page.
    [...urls].slice(0, 1000).forEach(u => {
      imageXml += `    <image:image>\n      <image:loc>${xmlEscape(u)}</image:loc>\n    </image:image>\n`;
      imageCount++;
    });
    imageXml += '  </url>\n';
  });
  imageXml += '</urlset>\n';
  fs.writeFileSync(path.join(publicDir, 'image-sitemap.xml'), imageXml, 'utf8');
  console.log(`[Sitemap] Generated image-sitemap.xml successfully (${imageCount} images across ${imagesByPage.size} pages).`);

  // 6. Refresh the HTML sitemap's link list (sitemap.html, between its markers).
  writeHtmlSitemap({ staticPages, subcategories, products, posts: livePosts });
}

function writeHtmlSitemap({ staticPages, subcategories, products, posts }) {
  const START = '<!-- SITEMAP:START -->';
  const END = '<!-- SITEMAP:END -->';
  if (!fs.existsSync(HTML_SITEMAP_FILE)) {
    console.warn('[Sitemap] sitemap.html not found — skipping the HTML sitemap.');
    return;
  }
  const html = fs.readFileSync(HTML_SITEMAP_FILE, 'utf8');
  const startAt = html.indexOf(START);
  const endAt = html.indexOf(END);
  if (startAt === -1 || endAt === -1 || endAt < startAt) {
    console.warn('[Sitemap] sitemap.html is missing its SITEMAP:START/END markers — skipping the HTML sitemap.');
    return;
  }

  const byLabel = (a, b) => a.label.localeCompare(b.label);
  const link = (href, label) =>
    `<li><a href="${htmlEscape(href)}" class="text-gray-600 hover:text-primary transition-colors">${htmlEscape(label)}</a></li>`;
  const list = (items) =>
    `<ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-[15px]">\n${items.join('\n')}\n</ul>`;
  const section = (id, title, count, body) => [
    `<section id="${id}" class="mb-12 scroll-mt-28">`,
    `<h2 class="text-xl md:text-2xl font-bold text-dark mb-5 pb-3 border-b border-gray-200">${htmlEscape(title)} <span class="text-sm font-medium text-gray-400">(${count})</span></h2>`,
    body,
    '</section>',
  ].join('\n');

  const pagesIn = (name) => staticPages.filter(p => p.section === name).map(p => link(`/${p.path}`, p.label));
  const folders = subcategories.filter(s => s.kind === 'folder').sort(byLabel);
  const conditions = subcategories.filter(s => s.kind === 'condition').sort(byLabel);

  // Products grouped under their category folder, folders in alphabetical order.
  const folderLabel = new Map(folders.map(f => [f.path, f.label]));
  const productGroups = new Map();
  products.forEach(p => {
    if (!productGroups.has(p.folder)) productGroups.set(p.folder, []);
    productGroups.get(p.folder).push(p);
  });
  const productBody = [...productGroups.keys()]
    .sort((a, b) => (folderLabel.get(a) || humanize(a)).localeCompare(folderLabel.get(b) || humanize(b)))
    .map(folder => [
      `<h3 class="text-base font-semibold text-primary mt-6 mb-3">${htmlEscape(folderLabel.get(folder) || humanize(folder))}</h3>`,
      list(productGroups.get(folder).sort(byLabel).map(p => link(`/${p.path}`, p.label))),
    ].join('\n'))
    .join('\n');

  const sortedPosts = [...posts].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const sections = [
    section('main-pages', 'Main Pages', pagesIn('main').length, list(pagesIn('main'))),
    section('order-medicines', 'Order Medicines', pagesIn('order').length, list(pagesIn('order'))),
    folders.length && section('medicine-categories', 'Medicine Categories', folders.length, list(folders.map(f => link(`/${f.path}`, f.label)))),
    conditions.length && section('conditions', 'Conditions', conditions.length, list(conditions.map(c => link(`/${c.path}`, c.label)))),
    products.length && section('products', 'Products', products.length, productBody),
    section('company', 'Company', pagesIn('company').length, list(pagesIn('company'))),
    section('policies', 'Policies', pagesIn('policies').length, list(pagesIn('policies'))),
    sortedPosts.length && section('blog-articles', 'Blog Articles', sortedPosts.length,
      list(sortedPosts.map(post => link(`/blog/${post.slug}`, decodeWpEntities(post.title && post.title.rendered) || humanize(post.slug))))),
  ].filter(Boolean);

  const next = html.slice(0, startAt + START.length) + '\n' + sections.join('\n\n') + '\n' + html.slice(endAt);
  fs.writeFileSync(HTML_SITEMAP_FILE, next, 'utf8');
  console.log('[Sitemap] Updated sitemap.html successfully.');
}

generate();

