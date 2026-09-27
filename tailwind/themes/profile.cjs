// Tailwind theme for: /profile
// Copied verbatim from the page's old inline `tailwind.config` (the CDN build), so the
// compiled stylesheet renders exactly what the CDN did. Colour values differ between
// themes on purpose: that's what each page looked like, and unifying them is a design
// decision, not part of the move off the CDN.
module.exports = require('../base.cjs')({
  "colors": {
    "primary": "#0D99FF",
    "success": "#61A644",
    "dark": "#1A202C",
    "footer": "#1A1D2B",
    "unblue": "#00ADEF"
  },
  "fontFamily": {
    "sans": [
      "Poppins",
      "sans-serif"
    ]
  }
});
