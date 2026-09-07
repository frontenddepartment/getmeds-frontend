// Shared vocabulary for the postbuild SEO guards: which files in dist/ are pages, what URL
// each is served at, and which URLs are deliberately kept out of the index.
//
// Extracted from check-duplicate-titles.cjs when check-canonicals.cjs was added. Both
// guards have to agree on "is this page supposed to be indexable?" — if they drift, one
// starts reporting findings the other has already excluded on purpose, and the build log
// stops being trustworthy.
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', '..', 'dist');
const VERCEL_CONFIG = path.join(__dirname, '..', '..', 'vercel.json');
const DOMAIN = 'https://getmeds.ph';

// Partials injected into pages at runtime, not pages themselves — they have no <head>.
const SKIP_DIRS = new Set(['assets', 'components']);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), acc);
    } else if (entry.name.endsWith('.html')) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

// The URL a file is served at, which is what a report needs to be actionable. cleanUrls is
// on in vercel.json, so dist/about-us.html is served at /about-us and never at the .html.
function urlFor(file) {
  return '/' + path.relative(DIST_DIR, file).replace(/\\/g, '/').replace(/\.html$/, '');
}

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(VERCEL_CONFIG, 'utf8'));
  } catch {
    return null;
  }
}

// Two classes of URL are held out by routing rather than by anything in the file: a URL
// vercel.json permanently redirects away (a superseded blog slug whose file still sits in
// dist) and a URL served with an X-Robots-Tag: noindex header. Only literal sources count —
// a pattern source like /articles/:slug* can't be matched against one file's URL here.
//
// Returns null, not an empty set, when vercel.json can't be read: a caller that silently
// treated that as "nothing is excluded" would report every held-out URL as a finding.
function excludedUrls() {
  const config = readConfig();
  if (!config) return null;
  const excluded = new Set();
  const literal = (source) => (source && !source.includes(':') && !source.includes('*') ? source : null);
  (config.redirects || []).forEach((r) => {
    const s = literal(r.source);
    // Only extensionless sources name a page's served URL. A ".html" source is about the
    // duplicate URL, not the page: "/product-range.html -> /product-range" retires the
    // .html twin and leaves /product-range as the live page. Stripping the extension here
    // (as this did before check-canonicals.cjs was added) read that rule backwards and
    // quietly excluded the surviving page from both guards.
    if (s && !s.endsWith('.html')) excluded.add(s);
  });
  (config.headers || []).forEach((h) => {
    if (!JSON.stringify(h.headers || []).toLowerCase().includes('noindex')) return;
    const s = literal(h.source);
    if (s) excluded.add(s);
  });
  return excluded;
}

function hasNoindexMeta(html) {
  return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

function canonicalOf(html) {
  return (html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || [])[1] || null;
}

// The path a canonical URL points at, normalised to compare against urlFor(). The homepage
// canonical is "https://getmeds.ph/", which has to compare equal to urlFor(dist/index.html)
// ("/index"), so both sides collapse to "/".
function canonicalPath(canonical) {
  if (!canonical) return null;
  const p = canonical.replace(/^https?:\/\/[^/]+/, '');
  const trimmed = p.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function normalizeUrl(url) {
  return url === '/index' ? '/' : url.replace(/\/index$/, '');
}

module.exports = {
  DIST_DIR,
  DOMAIN,
  SKIP_DIRS,
  walk,
  urlFor,
  readConfig,
  excludedUrls,
  hasNoindexMeta,
  canonicalOf,
  canonicalPath,
  normalizeUrl,
};
