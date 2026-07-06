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

const subcategorySpecials = {
  'non-small-cell-lung-cancer': 'lung-cancer',
  'acute-myeloid-leukemia': 'aml',
  'chronic-myeloid-leukemia': 'cml',
  'hodgkin-non-hodgkins-lymphoma': 'lymphoma',
  'hodgkin-non-hodgkin-s-lymphoma': 'lymphoma',
  'sickle-cell-anemia': 'sickle-cell',
  'respiratory-infections': 'respiratory',
  'urinary-tract-infections': 'uti',
  'skin-and-soft-tissue-infections': 'skin-infections',
  'bone-and-joint-infections': 'bone-infections',
  'fibrocystic-breast-disease': 'fibrocystic',
  'arrhythmia-management': 'arrhythmia',
  'hypertension-angina': 'hypertension',
  'hypertension-and-angina': 'hypertension',
  'seasonal-allergic-rhinitis': 'allergic-rhinitis',
  'chronic-kidney-disease': 'kidney-disease',
  'chronic-pain': 'pain',
  'inflammatory-disorders': 'rheumatology',
  'inflammatory-and-rheumatic-disorders': 'rheumatology'
};

const getSubcategorySlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
};

async function fetchSanityData(query) {
  const env = loadEnv();
  const projectId = env.VITE_SANITY_PROJECT_ID || 's7ocz8zp';
  const dataset = env.VITE_SANITY_DATASET || 'production';
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  
  const res = await request(url, { headers: { 'User-Agent': 'SitemapGenerator/1.0' } });
  if (res.statusCode === 200) {
    return JSON.parse(res.body).result;
  }
  throw new Error(`Sanity API returned status code ${res.statusCode}`);
}

async function getAllCancerMedicines() {
  const getProductSlug = (p) => {
    const brand = (p.brandName || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-');
    const molecule = (p.genericName || '').toLowerCase().trim()
      .replace(/\s*\(as\s+[^)]+\)/gi, '')
      .replace(/[^a-z0-9]+/g, '-');
    const form = (p.form || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-');
    const strength = (p.strength || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-');
    
    const parts = [brand, molecule, strength, form].filter(Boolean).join('-');
    return parts.replace(/-+/g, '-').replace(/(^-|-$)/g, '');
  };

  const subcategories = [];
  const products = [];
  try {
    console.log('[Sitemap] Fetching subcategories from Sanity...');
    const categories = await fetchSanityData('*[_type == "category"] { category, subcategory }');
    const subcats = new Set();
    categories.forEach(cat => {
      if (cat.category) {
        const clean = getSubcategorySlug(cat.category);
        subcats.add(clean);
        if (subcategorySpecials[clean]) {
          subcats.add(subcategorySpecials[clean]);
        }
      }
      if (Array.isArray(cat.subcategory)) {
        cat.subcategory.forEach(sub => {
          if (sub) {
            const clean = getSubcategorySlug(sub);
            subcats.add(clean);
            if (subcategorySpecials[clean]) {
              subcats.add(subcategorySpecials[clean]);
            }
          }
        });
      }
    });
    
    subcats.forEach(slug => {
      if (slug) {
        subcategories.push({ path: `cancer-medicines/${slug}`, priority: '0.7', changefreq: 'weekly' });
      }
    });

    console.log('[Sitemap] Fetching products from Sanity...');
    const excelDoc = await fetchSanityData('*[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)][0] { json_data }');
    const originalProducts = await fetchSanityData('*[_type == "product" && !defined(title) && (!defined(remarks) || remarks == "present" || remarks == "active")] { _id, slug, name, remarks, brandName, genericName, form, strength }');

    const originalMap = new Map();
    originalProducts.forEach(op => {
      originalMap.set(op._id, op);
    });

    let rawProducts = [];
    if (excelDoc && excelDoc.json_data) {
      try {
        const data = JSON.parse(excelDoc.json_data);
        const firstSheetName = Object.keys(data)[0];
        if (firstSheetName) {
          rawProducts = data[firstSheetName] || [];
        }
      } catch (e) {
        console.error('[Sitemap] Failed to parse Excel json_data:', e.message);
      }
    }

    const excelProductIds = new Set(rawProducts.map(p => p._id));
    const processedSlugs = new Set();

    // Process Excel Products
    rawProducts.forEach(p => {
      const orig = originalMap.get(p._id) || {};
      if (orig.remarks && orig.remarks !== 'present' && orig.remarks !== 'active') {
        return;
      }

      const merged = { ...orig, ...p };
      const slugStr = getProductSlug(merged);

      if (slugStr && !processedSlugs.has(slugStr)) {
        processedSlugs.add(slugStr);
        products.push({ path: `cancer-medicines/${slugStr}`, priority: '0.6', changefreq: 'monthly' });
      }
    });

    // Process Individual-only products
    originalProducts.forEach(op => {
      if (excelProductIds.has(op._id)) return;
      if (op.remarks !== 'present' && op.remarks !== 'active') return;

      const slugStr = getProductSlug(op);

      if (slugStr && !processedSlugs.has(slugStr)) {
        processedSlugs.add(slugStr);
        products.push({ path: `cancer-medicines/${slugStr}`, priority: '0.6', changefreq: 'monthly' });
      }
    });

    console.log(`[Sitemap] Successfully processed ${subcats.size} subcategories and ${processedSlugs.size} products from Sanity.`);
  } catch (err) {
    console.error('[Sitemap] Failed to retrieve products/categories from Sanity:', err.message);
  }
  return { subcategories, products };
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
    { path: 'cancer-medicines', priority: '0.8', changefreq: 'weekly' },
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
  const { subcategories, products } = await getAllCancerMedicines();

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
