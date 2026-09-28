// Collects the class names used inside CMS-authored HTML, so the compiled Tailwind stylesheets
// (tailwind/base.cjs) generate CSS for them.
//
// Under the old CDN build this wasn't needed: the CDN read class names off the live page, CMS
// content included. A compiled stylesheet only sees files, and two kinds of CMS content carry
// their own Tailwind classes:
//   - WordPress post bodies (a handful of posts pasted with list/spacing utilities)
//   - Sanity "policiesDisclaimers" contentHtml (the policy pages, styled throughout)
//
// Writes tailwind/cms-classes.txt, one class per line. On a fetch failure the previous file is
// kept rather than emptied, so a CMS outage during a build can't strip styling from those pages.
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'tailwind', 'cms-classes.txt');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (m) env[m[1]] = String(m[2] || '').trim().replace(/^(['"])(.*)\1$/, '$2');
    });
  }
  return env;
}

function get(url) {
  return new Promise((resolve, reject) => {
    // The CMS's firewall answers requests without a User-Agent with 406.
    https.get(url, { headers: { 'User-Agent': 'SitemapGenerator/1.0' } }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

async function wordpressHtml(env) {
  const root = new URL(env.VITE_WORDPRESS_API_ROOT || 'https://cms.getmeds.ph').origin;
  const out = [];
  let page = 1;
  let total = 1;
  do {
    const res = await get(`${root}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=content`);
    if (res.status !== 200) throw new Error(`WordPress returned ${res.status}`);
    JSON.parse(res.body).forEach((p) => out.push(p.content && p.content.rendered));
    total = parseInt(res.headers['x-wp-totalpages'] || '1', 10);
    page++;
  } while (page <= total);
  return out;
}

async function sanityHtml(env) {
  const bad = (v) => !v || /[[\]]/.test(v);
  const projectId = bad(env.VITE_SANITY_PROJECT_ID) ? 's7ocz8zp' : env.VITE_SANITY_PROJECT_ID;
  const dataset = bad(env.VITE_SANITY_DATASET) ? 'production' : env.VITE_SANITY_DATASET;
  const query = encodeURIComponent('*[_type == "policiesDisclaimers" && defined(contentHtml)].contentHtml');
  const res = await get(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`);
  if (res.status !== 200) throw new Error(`Sanity returned ${res.status}`);
  return JSON.parse(res.body).result || [];
}

function classesIn(htmls) {
  const set = new Set();
  htmls.forEach((html) => {
    (String(html || '').match(/class="[^"]*"/g) || []).forEach((attr) => {
      // Attribute values arrive HTML-encoded ("[li_&amp;]:mb-0"); the browser, and so the CDN,
      // saw the decoded class, which is what Tailwind has to generate a rule for.
      attr.slice(7, -1).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
        .split(/\s+/).filter(Boolean).forEach((c) => set.add(c));
    });
  });
  return [...set].sort();
}

(async () => {
  const env = { ...loadEnv(), ...process.env };
  try {
    const [wp, sanity] = await Promise.all([wordpressHtml(env), sanityHtml(env)]);
    const classes = classesIn([...wp, ...sanity]);
    fs.writeFileSync(OUT, classes.join('\n') + '\n', 'utf8');
    console.log(`[CMS classes] ${classes.length} class names from ${wp.length} posts and ${sanity.length} policy documents.`);
  } catch (err) {
    console.warn(`[CMS classes] Could not refresh (${err.message}); keeping the existing tailwind/cms-classes.txt.`);
  }
})();
