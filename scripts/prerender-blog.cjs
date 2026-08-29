// Generates one static HTML file per WordPress blog post, so each gets its own
// title/description/canonical/OG/JSON-LD baked into the raw HTTP response instead of every
// post sharing the generic `blog-detail.html` shell. Runs as part of `postbuild`, after
// `vite build` has already produced `dist/` and scripts/prerender-slugs.cjs has run.
//
// Field mapping mirrors parse_wp_post() in getmeds_backend/app/api/routes/slug_resolver.py
// (title.rendered, excerpt.rendered stripped of HTML, wp:featuredmedia, wp:term) — that's the
// same normalization already used by the live /api/blog/posts backend, just replicated here
// so this build script fetches WordPress directly (same pattern as generate-sitemap.cjs)
// instead of depending on that backend being reachable during a Vercel build.
const fs = require('fs');
const path = require('path');
const https = require('https');

const DOMAIN = 'https://getmeds.ph';
const WP_API_ROOT = 'https://cms.getmeds.ph';
const WP_API_IP = 'https://173.231.197.156';
const DIST_DIR = path.join(__dirname, '..', 'dist');

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

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

// Same direct-fetch-with-IP-fallback pattern as generate-sitemap.cjs's fetchPage(), plus
// _embed=true so each post carries its featured image and category term inline.
async function fetchPostsPage(page, env) {
  const wordpressApiRoot = env.VITE_WORDPRESS_API_ROOT || WP_API_ROOT;
  const targetUrl = new URL(wordpressApiRoot);
  const pathQuery = `/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=true`;

  try {
    const res = await request(`${targetUrl.origin}${pathQuery}`, {
      headers: { Host: targetUrl.host, 'User-Agent': 'PrerenderBlog/1.0' },
    });
    if (res.statusCode === 200) {
      return { posts: JSON.parse(res.body), totalPages: parseInt(res.headers['x-wp-totalpages'] || '1', 10) };
    }
    throw new Error(`WordPress API returned status ${res.statusCode}`);
  } catch (err) {
    console.warn(`[Prerender Blog] Direct fetch failed for page ${page}: ${err.message}. Trying IP fallback...`);
  }

  const res = await request(`${WP_API_IP}${pathQuery}`, {
    headers: { Host: targetUrl.host, 'User-Agent': 'PrerenderBlog/1.0' },
    rejectUnauthorized: false,
  });
  if (res.statusCode !== 200) throw new Error(`WordPress API (IP fallback) returned status ${res.statusCode}`);
  return { posts: JSON.parse(res.body), totalPages: parseInt(res.headers['x-wp-totalpages'] || '1', 10) };
}

async function fetchAllPosts(env) {
  let allPosts = [];
  let page = 1;
  let totalPages = 1;
  do {
    console.log(`[Prerender Blog] Fetching WordPress posts page ${page}...`);
    const { posts, totalPages: pages } = await fetchPostsPage(page, env);
    allPosts = allPosts.concat(posts);
    totalPages = pages;
    page++;
  } while (page <= totalPages);
  return allPosts;
}

// Decodes WordPress's pre-encoded HTML entities (title.rendered/excerpt.rendered always come
// HTML-entity-encoded, e.g. "&#8217;" for an apostrophe) back to plain text, so escapeHtml()
// below can safely re-encode once without double-encoding into "&amp;#8217;".
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
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(html) {
  return decodeWpEntities(String(html || '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseWpPost(item) {
  const categories = item._embedded?.['wp:term']?.[0] || [];
  const tag = categories[0]?.name || 'News';
  const featuredMedia = item._embedded?.['wp:featuredmedia']?.[0] || {};
  const image = featuredMedia.source_url || '';

  return {
    slug: item.slug || '',
    title: decodeWpEntities(stripHtml(item.title?.rendered || '')),
    description: stripHtml(item.excerpt?.rendered || '').slice(0, 160),
    image,
    tag,
    date: item.date || '',
  };
}

function injectHead(template, { title, description, canonicalPath, image, jsonLd }) {
  let html = template;
  const fullTitle = `${title} — Getmeds`;
  const canonicalUrl = `${DOMAIN}${canonicalPath}`;
  const ogImage = image || `${DOMAIN}/assets/getmedslogo.png`;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  html = html.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${escapeHtml(description)}">`);

  const extraTags = [
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="Getmeds">`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...jsonLd })}</script>`,
  ].join('\n    ');

  return html.replace(/<\/head>/i, `    ${extraTags}\n</head>`);
}

function writeFile(destPath, html) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, html, 'utf8');
}

async function main() {
  const blogTemplatePath = path.join(DIST_DIR, 'blog-detail.html');
  if (!fs.existsSync(blogTemplatePath)) {
    console.log('[Prerender Blog] dist/blog-detail.html not found — skipping (did `vite build` run first?).');
    return;
  }
  const blogTemplate = fs.readFileSync(blogTemplatePath, 'utf8');

  const env = loadEnv();
  let rawPosts;
  try {
    rawPosts = await fetchAllPosts(env);
  } catch (err) {
    console.warn('[Prerender Blog] Failed to fetch posts from WordPress, skipping blog prerender:', err.message);
    return;
  }

  let count = 0;
  const skipped = [];
  const seenSlugs = new Set();

  rawPosts.forEach((item) => {
    const post = parseWpPost(item);
    if (!post.slug || !post.title) {
      skipped.push(post.slug || `(untitled #${item.id})`);
      return;
    }
    if (seenSlugs.has(post.slug)) return; // WordPress can return the same post twice across pages if content shifts mid-fetch
    seenSlugs.add(post.slug);

    const canonicalPath = `/blog/${post.slug}`;
    const html = injectHead(blogTemplate, {
      title: post.title,
      description: post.description || `${post.title} — read the full article on the Getmeds blog.`,
      canonicalPath,
      image: post.image,
      jsonLd: {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        ...(post.image ? { image: post.image } : {}),
        ...(post.date ? { datePublished: post.date } : {}),
        url: `${DOMAIN}${canonicalPath}`,
        mainEntityOfPage: `${DOMAIN}${canonicalPath}`,
      },
    });

    writeFile(path.join(DIST_DIR, 'blog', `${post.slug}.html`), html);
    count++;
  });

  console.log(`[Prerender Blog] Wrote ${count} blog post page(s) into dist/blog/.`);
  if (skipped.length) {
    console.log(`[Prerender Blog] Skipped ${skipped.length} post(s) with no slug/title: ${skipped.slice(0, 5).join(', ')}${skipped.length > 5 ? '…' : ''}`);
  }
}

main().catch((err) => {
  console.error('[Prerender Blog] Unexpected failure:', err);
  process.exitCode = 0; // Never fail the build over prerendering — the site still works via the client-rendered shell.
});
