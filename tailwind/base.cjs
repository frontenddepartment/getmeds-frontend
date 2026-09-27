// Shared Tailwind setup for the per-page themes in ./themes. Each theme passes in the
// `theme.extend` block its pages used to hand the CDN build inline; everything else
// (what gets scanned for class names) is the same for every page.
//
// The CDN generated CSS in the browser from whatever class names were on the page at
// that moment. A compiled stylesheet only knows the class names it can find in these
// files, so anything that puts class names on a page has to be listed here:
//   - the pages themselves and their React code
//   - the navbar/footer fragments components.js injects at runtime
//   - cms-classes.txt: class names written inside CMS content (WordPress post bodies,
//     Sanity policy HTML), collected at build time by scripts/collect-cms-tailwind-classes.cjs.
//     A class that first appears in the CMS after the last deploy won't be styled until
//     the next one.
module.exports = (extend) => ({
  content: {
    relative: true, // paths below are relative to the theme file in ./themes
    files: [
      '../../*.html',
      '../../src/**/*.{ts,tsx,js,jsx}',
      '../../public/components/**/*.{html,js}',
      '../cms-classes.txt',
    ],
  },
  theme: { extend },
});
