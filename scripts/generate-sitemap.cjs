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

// Fetch a single page of posts from WordPress API, with IP fallback if DNS fails
async function fetchPage(page) {
  const pathQuery = `/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=slug,date`;
  
  // Try 1: Fetch via the domain
  try {
    const res = await request(`https://cms.getmeds.ph${pathQuery}`, {
      headers: { 'User-Agent': 'SitemapGenerator/1.0' }
    });
    if (res.statusCode === 200) {
      return {
        posts: JSON.parse(res.body),
        totalPages: parseInt(res.headers['x-wp-totalpages'] || '1', 10)
      };
    }
  } catch (err) {
    console.warn(`Direct fetch failed for page ${page}: ${err.message}. Trying IP fallback...`);
  }

  // Try 2: Fetch via IP address with Host header (bypassing DNS and SSL validation)
  try {
    const res = await request(`https://173.231.197.156${pathQuery}`, {
      headers: {
        'Host': 'cms.getmeds.ph',
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
    { path: 'product-range', priority: '0.8', changefreq: 'weekly' },
    { path: 'order-medicines', priority: '0.8', changefreq: 'monthly' },
    { path: 'careers', priority: '0.7', changefreq: 'monthly' },
    { path: 'contact-us', priority: '0.7', changefreq: 'monthly' },
    { path: 'csr', priority: '0.7', changefreq: 'monthly' },
    { path: 'global-presence', priority: '0.7', changefreq: 'monthly' },
    { path: 'meditations', priority: '0.7', changefreq: 'monthly' },
    { path: 'pap', priority: '0.7', changefreq: 'monthly' },
    { path: 'ungc', priority: '0.7', changefreq: 'monthly' },
    { path: 'blog', priority: '0.8', changefreq: 'daily' }
  ];

  const posts = await getAllPosts();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 1. Add static pages
  staticPages.forEach(p => {
    const url = p.path ? `${DOMAIN}/${p.path}` : DOMAIN;
    xml += '  <url>\n';
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
    xml += `    <priority>${p.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // 2. Add dynamic blog posts
  posts.forEach(post => {
    if (!post.slug) return;
    const url = `${DOMAIN}/blog/${post.slug}`;
    const dateStr = post.date ? new Date(post.date).toISOString().split('T')[0] : '';
    
    xml += '  <url>\n';
    xml += `    <loc>${url}</loc>\n`;
    if (dateStr) {
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
    }
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`[Sitemap] Generated successfully at ${sitemapPath}`);
}

generate();
