// Server-side build of the main marketing pages (src/ssr/static-pages.tsx), used at build time
// by scripts/prerender-static-pages.cjs to write each page's rendered HTML into its #root.
// Kept apart from vite.config.js: none of the browser build's plugins (PWA, HTML transforms,
// dev middleware) apply to a Node bundle.
import { defineConfig } from 'vite';

export default defineConfig({
  logLevel: 'warn',
  publicDir: false, // the browser build already copies public/
  build: {
    ssr: 'src/ssr/static-pages.tsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: { output: { format: 'esm', entryFileNames: 'static-pages.mjs' } },
  },
  ssr: { noExternal: true },
});
