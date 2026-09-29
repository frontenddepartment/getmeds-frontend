/**
 * pwaMode.tsx
 * ─────────────────────────────────────────────
 * PWA_MODE from getmeds_frontend/vite.config.js, which the Vite build put at
 * the top of <head> on every page. It must run before first paint:
 *
 *   - In the installed app (any "installed" display mode, or iOS
 *     navigator.standalone) it adds html.pwa-standalone (the hook every rule in
 *     pwa-tabbar.css uses) and sends "/" straight to "/app-home".
 *   - In an ordinary browser tab it sends "/app-home" back to "/", because
 *     /app-home has no website navigation and would be a dead end there.
 *
 * <PwaModeScript /> belongs in the root layout's <head> (coordinator-owned).
 * /app-home also renders it itself so that page never strands a browser
 * visitor, whether or not the layout has it yet; running it twice is harmless.
 */
export const PWA_MODE_SCRIPT = `(function () {
  try {
    var standalone =
      (typeof window.matchMedia === 'function' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches)) ||
      window.navigator.standalone === true;

    var p = location.pathname.replace(/\\.html$/, '').replace(/\\/+$/, '') || '/';
    var rest = location.search + location.hash;

    if (standalone) {
      document.documentElement.classList.add('pwa-standalone');
      if (p === '/' || p === '/index') location.replace('/app-home' + rest);
      return;
    }

    if (p === '/app-home') location.replace('/' + rest);
  } catch (e) { /* never let a display-mode probe break the page */ }
})();`;

export function PwaModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: PWA_MODE_SCRIPT }} />;
}

/** The same test, for client code that runs after hydration. */
export function isStandaloneDisplay(): boolean {
  try {
    return (
      (typeof window.matchMedia === 'function' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          window.matchMedia('(display-mode: fullscreen)').matches ||
          window.matchMedia('(display-mode: window-controls-overlay)').matches)) ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

/**
 * SW_REGISTER from getmeds_frontend/vite.config.js, which the Vite build put before </body>
 * on every page. Plain DOM APIs, no workbox-window: the update check is the only behaviour
 * it needs. Production only, as before: a stale worker holding on to yesterday's modules is
 * a miserable thing to debug in development.
 */
export const SW_REGISTER_SCRIPT = `(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      // Check for a new worker on every page load. Chrome checks on its own schedule
      // otherwise, which is part of why a deploy could take a long while to reach an
      // installed app.
      if (reg && typeof reg.update === 'function') reg.update().catch(function () {});
    }).catch(function () { /* a failed registration must never break the page */ });
  });
})();`;

export function ServiceWorkerRegistration() {
  if (process.env.NODE_ENV !== 'production') return null;
  return <script dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }} />;
}
