// Used only for CSS files that aren't Tailwind stylesheets (see postcss.config.cjs). Points at
// a file with no class names, so it never generates anything.
module.exports = { content: ['./tailwind/passthrough.cjs'] };
