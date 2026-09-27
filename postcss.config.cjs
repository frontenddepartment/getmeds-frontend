// Compiles the per-page Tailwind stylesheets in src/styles/tailwind. Each of those files names
// its own theme with @config (see tailwind/base.cjs); every other CSS file in the build has no
// @tailwind directives, so Tailwind passes it through untouched. The root config below only
// exists so Tailwind doesn't warn about "missing content" while doing that.
module.exports = {
  plugins: {
    tailwindcss: { config: './tailwind/passthrough.cjs' },
  },
};
