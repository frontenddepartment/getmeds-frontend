const fs = require('fs');
const path = require('path');
const https = require('https');

const DOMAIN = 'https://getmeds.ph';

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
  try {
    console.log('[Sitemap] Fetching active product sheet from Sanity...');
    // NOTE: not filtering on defined(json_data) — GROQ silently fails to match
    // that against this field once it's large (200KB+ of parsed Excel data),
    // even though the field is genuinely present.
    const excelDoc = await fetchSanityData('*[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)] | order(_updatedAt desc)[0] { json_data }');

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
      folderUrls.push({ path: folder, priority: '0.7', changefreq: 'weekly' });
    });

    conditions.forEach(hubUrl => {
      const p = stripDomain(hubUrl);
      if (p) conditionUrls.push({ path: p, priority: '0.6', changefreq: 'weekly' });
    });

    productsBySlug.forEach(row => {
      const p = row.productPageUrl
        ? stripDomain(row.productPageUrl)
        : (row.categoryFolder && row.slug ? `${row.categoryFolder}/${row.slug}` : '');
      if (p) products.push({ path: p, priority: '0.6', changefreq: 'monthly' });
    });

    console.log(`[Sitemap] Successfully processed ${folders.size} category folders, ${conditions.size} condition hubs, and ${productsBySlug.size} products from Sanity.`);
  } catch (err) {
    console.error('[Sitemap] Failed to retrieve products from Sanity:', err.message);
  }
  return { subcategories: [...folderUrls, ...conditionUrls], products };
}

// Fetch a single page of posts from WordPress API, with IP fallback if DNS fails
async function fetchPage(page) {
  const pathQuery = `/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=slug,date`;
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
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: 'about-us', priority: '0.8', changefreq: 'monthly' },
    { path: 'services', priority: '0.8', changefreq: 'monthly' },
    // Category folders (cancer-medicines, antibiotics, ...) come from
    // getAllProductRoutes() below now, straight from the sheet.
    { path: 'order-medicines', priority: '0.8', changefreq: 'monthly' },
    { path: 'careers', priority: '0.7', changefreq: 'monthly' },
    { path: 'contact-us', priority: '0.7', changefreq: 'monthly' },
    { path: 'csr', priority: '0.7', changefreq: 'monthly' },
    { path: 'global-presence', priority: '0.7', changefreq: 'monthly' },
    { path: 'meditations', priority: '0.7', changefreq: 'monthly' },
    { path: 'patient-assistance-program', priority: '0.7', changefreq: 'monthly' },
    { path: 'ungc', priority: '0.7', changefreq: 'monthly' },
    { path: 'blog', priority: '0.8', changefreq: 'daily' }
  ];

  const posts = await getAllPosts();
  const { subcategories, products } = await getAllProductRoutes();

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const currentDate = new Date().toISOString().split('T')[0];

  // Helper to generate a standard XML urlset
  function generateUrlSetXml(urls) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    urls.forEach(u => {
      xml += '  <url>\n';
      xml += `    <loc>${u.loc}</loc>\n`;
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
      loc: p.path ? `${DOMAIN}/${p.path}` : DOMAIN,
      changefreq: p.changefreq,
      priority: p.priority,
      lastmod: currentDate
    });
  });
  subcategories.forEach(s => {
    categoryUrls.push({
      loc: `${DOMAIN}/${s.path}`,
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
      loc: `${DOMAIN}/${p.path}`,
      changefreq: p.changefreq,
      priority: p.priority,
      lastmod: currentDate
    });
  });
  fs.writeFileSync(path.join(publicDir, 'product-sitemap.xml'), generateUrlSetXml(productUrls), 'utf8');
  console.log('[Sitemap] Generated product-sitemap.xml successfully.');

  // 3. Generate blog-sitemap.xml
  const blogUrls = [];
  posts.forEach(post => {
    if (!post.slug) return;
    const dateStr = post.date ? new Date(post.date).toISOString().split('T')[0] : currentDate;
    blogUrls.push({
      loc: `${DOMAIN}/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: '0.6',
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
}

generate();
