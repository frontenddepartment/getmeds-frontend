// Shared helpers for writing a page's real content into its prerendered HTML (audit item 07).
//
// Every page is a React app that mounts into <div id="root"></div>, so the HTML a crawler
// receives has an empty body: fine for Google, which runs the JavaScript, but Bing, link
// previews and AI answer engines read the raw HTML and see nothing. The prerender scripts
// already bake each page's <head>; these helpers let them fill the body too:
//
//   - fillRoot() puts static markup inside #root. React's createRoot() replaces it on mount,
//     so it only has to read well until the app takes over — it isn't hydrated.
//   - preloadScript() embeds the data that markup came from, as JSON. The page's data hook
//     (src/lib/preload.ts) uses it for the first render instead of fetching the same thing
//     again, so the app's first paint already has the content: no blank or skeleton step
//     between the prerendered markup and the live page.

// Escapes text for element content and double-quoted attributes.
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// CMS HTML is authored in-house, but it is still going into a page as markup, so the parts
// that could run code are removed (the browser-side renderer runs it through DOMPurify for
// the same reason): <script>/<iframe>/<object>/<embed> elements, inline event handlers and
// javascript: URLs.
function sanitizeCmsHtml(html) {
  return String(html || '')
    .replace(/<(script|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|iframe|object|embed)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

// Puts `inner` inside the page's (empty) <div id="root">.
function fillRoot(html, inner) {
  const re = /<div id="root"><\/div>/;
  if (!re.test(html)) throw new Error('template has no empty <div id="root"></div>');
  // The comments mark the baked block, so it's easy to spot (and strip, when testing).
  return html.replace(re, () => `<div id="root"><!--prerendered-->${inner}<!--/prerendered--></div>`);
}

// <script type="application/json" id="gm-preload">, read by src/lib/preload.ts. `<` is
// escaped so no string inside the data can close the script element early.
// JSON escapes built from char codes so this file never holds a literal backslash-u sequence.
const BS = String.fromCharCode(92);
const LS = String.fromCharCode(0x2028); // line/paragraph separators: valid in JSON strings, but
const PS = String.fromCharCode(0x2029); // escaped anyway so the script body stays one clean line
function preloadScript(data) {
  const json = JSON.stringify(data)
    .split('<').join(BS + 'u003c')
    .split(LS).join(BS + 'u2028')
    .split(PS).join(BS + 'u2029');
  return `<script type="application/json" id="gm-preload">${json}</script>`;
}

// Adds the preload <script> just before </body>.
function addPreload(html, data) {
  return html.replace(/<\/body>/i, () => `${preloadScript(data)}\n</body>`);
}

module.exports = { escapeHtml, sanitizeCmsHtml, fillRoot, addPreload };
