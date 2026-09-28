// Writes the main marketing pages' rendered HTML into their built files (audit item 07).
//
// Home, About Us, Services, the Patient Assistance Program, Careers, CSR, Global Presence,
// Meditations, UNGC, Contact Us and the Order Medicines hub and audience pages carry their
// text in the page components themselves, so the build can render each one to HTML exactly
// as the browser's first render draws it: src/ssr/static-pages.tsx, bundled for Node by
// vite.ssr.config.mjs into dist-ssr/. That HTML goes into the page's empty #root, where
// crawlers that don't run JavaScript can read it and visitors see it before the app loads;
// the entry's createRoot() then replaces it with the identical live render.
//
// Runs in `postbuild` after prerender-order-medicines.cjs, which copies order-medicines.html
// into the audience pages and so needs that template's #root still empty. A page that fails
// to render is left as it was (empty #root, same as before) rather than failing the build.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const body = require('./lib/prerender-body.cjs');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const BUNDLE = path.join(__dirname, '..', 'dist-ssr', 'static-pages.mjs');

async function main() {
  if (!fs.existsSync(BUNDLE)) {
    console.warn('[Prerender Static] dist-ssr/static-pages.mjs not found — skipping (run `vite build --config vite.ssr.config.mjs` first).');
    return;
  }
  const { PAGES } = await import(pathToFileURL(BUNDLE).href);

  let written = 0;
  const failed = [];
  for (const page of PAGES) {
    const file = path.join(DIST_DIR, page.file);
    if (!fs.existsSync(file)) {
      failed.push(`${page.file} (no such file in dist/)`);
      continue;
    }
    try {
      const html = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, body.fillRoot(html, page.render()), 'utf8');
      written++;
    } catch (err) {
      failed.push(`${page.file} (${err.message})`);
    }
  }

  console.log(`[Prerender Static] Wrote rendered content into ${written} page(s).`);
  if (failed.length) console.warn(`[Prerender Static] Left ${failed.length} page(s) client-rendered only: ${failed.join('; ')}`);
}

main().catch((err) => {
  console.error('[Prerender Static] Unexpected failure:', err);
  process.exitCode = 0; // never fail the build over prerendering
});
