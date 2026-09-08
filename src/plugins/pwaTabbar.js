/**
 * pwaTabbar.js
 * ─────────────────────────────────────────────
 * The installed app's bottom navigation, as plain HTML/CSS injected into every
 * built page by vite.config.js.
 *
 * Not a React component on purpose. It ships inside the initial HTML, so it
 * paints with the shell rather than appearing a beat after hydration — that
 * delay on every tap is most of what makes a web app feel like a web page. It
 * also means all 25 entry points get it without touching a single entry file.
 *
 * Shown ONLY in the installed app and only at phone widths: five icons
 * stretched across a 1400px desktop window looks broken, so an installed
 * desktop window keeps the normal top navigation instead.
 *
 * ── Why every rule is written twice ──
 * The app is detected two ways, and both are needed:
 *
 *   @media (display-mode: standalone)  — pure CSS, works with no JavaScript.
 *   html.pwa-standalone                — set in <head> before first paint,
 *                                        and the only thing that works on iOS
 *                                        Safari before 16.4, which predates
 *                                        the display-mode query.
 *
 * The class alone was not enough: it depends on a script that a page served
 * from an older service-worker cache may not have, and the bar then vanishes
 * on exactly the pages the app had already cached. The media query has no such
 * dependency, so the two together cover each other's gaps.
 *
 * ── The bottom-right column ──
 * Everything pinned there is spaced so nothing overlaps, measured from the
 * bottom edge of the viewport:
 *
 *   tab bar          0 – 60    full width
 *   contact FAB     74 – 124
 *   Tawk chat      134 – 184   aligned to the same right edge as the FAB
 *   scroll-to-top  194 – 244
 */

/** Declarations shared by both detection methods, so they cannot drift apart. */
const APP_RULES = `
  .gm-tabbar { display: flex; }
  .gm-fab { display: flex; }

  /* Clear the bar so the end of the page is never trapped behind it. */
  body { padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px)); }

  /* The footer repeats what Contact Us already covers, so the app drops it. */
  #site-footer { display: none; }

  /* The top bar goes: the tab bar is the app's navigation now.
     Only the bar ROW is hidden, never <nav> itself — #mobile-menu (the drawer
     "More" opens) and #gn-panel are siblings of that row inside the same nav,
     so display:none on the nav silently takes the drawer with it and "More"
     opens a zero-height element. */
  #global-top-bar { display: none !important; }
  #global-nav > div.max-w-7xl { display: none !important; }
  #global-nav {
    position: static !important;
    background: transparent !important;
    box-shadow: none !important;
    border: 0 !important;
  }
  #navbar-container { position: static !important; }
  /* The drawer was offset to clear an 80px bar that no longer exists. */
  #mobile-menu { top: 0 !important; }

  /* components.js declares #scroll-to-top with !important on every line
     (including bottom: 100px, which sat squarely on the contact FAB), so
     overriding it needs !important too. */
  #scroll-to-top {
    bottom: calc(134px + env(safe-area-inset-bottom, 0px)) !important;
    right: 16px !important;
  }

  /* Tawk is no longer injected in the app at all (see components.js). This is
     the belt to that braces: a page still served from an older cache would
     inject it, and it would land straight on the tab bar. Selectors are broad
     because Tawk's markup differs between widget versions. */
  iframe[title*="chat" i],
  .widget-visible,
  .widget-visible iframe,
  #tawkchat-container,
  .tawk-min-container {
    display: none !important;
  }

  /* The offline-inquiry notice spans the full width and would otherwise cover
     the tab bar completely — it sits directly above it instead. */
  .gm-queued-notice { bottom: calc(60px + env(safe-area-inset-bottom, 0px)); }
`;

const scoped = (prefix) =>
  APP_RULES.replace(/^\s{2}(?=[.#a-zA-Z])/gm, '  ' + prefix + ' ');

export const PWA_TABBAR_CSS = `
<style>
  /* Hidden everywhere by default — the blocks below are the only thing that
     reveals it, so nothing changes for the website. */
  .gm-tabbar, .gm-fab { display: none; }

  @media (max-width: 1024px) {
${scoped('html.pwa-standalone')}
  }

  @media (display-mode: standalone) and (max-width: 1024px) {
${APP_RULES}
  }

  .gm-tabbar {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    z-index: 9997;
    align-items: stretch;
    justify-content: space-around;
    background: #fff;
    border-top: 1px solid #eef0f4;
    box-shadow: 0 -2px 14px rgba(0, 0, 0, .06);
    /* Resolves to a real value only because every page sets viewport-fit=cover;
       without it the labels sit under the iPhone home indicator. */
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .gm-tabbar a,
  .gm-tabbar button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-height: 60px;
    padding: 6px 2px;
    border: 0;
    background: none;
    color: #9aa3af;
    font: 600 10.5px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    text-decoration: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .gm-tabbar i { font-size: 17px; line-height: 1; }
  .gm-tabbar .is-active { color: #1D9FDA; }

  /* The middle tab sits raised, the way a primary action reads on a phone. */
  .gm-tabbar .gm-mid { position: relative; }
  .gm-tabbar .gm-mid .gm-mid-btn {
    position: absolute;
    top: -20px;
    width: 50px; height: 50px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1D9FDA, #61A644);
    color: #fff;
    box-shadow: 0 4px 12px rgba(29, 159, 218, .38);
  }
  .gm-tabbar .gm-mid .gm-mid-btn i { font-size: 19px; }
  /* The raised button is absolutely positioned, so the label is the only child
     left in flow and would centre higher than its neighbours. A normal tab's
     content is icon (17px) + gap (3px) + label; matching that 20px is exactly
     what puts every label on one line. */
  .gm-tabbar .gm-mid .gm-label { margin-top: 20px; }

  .gm-cart-badge {
    position: absolute;
    top: -25px; right: calc(50% - 27px);
    min-width: 18px; height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: #e5484d;
    color: #fff;
    font: 700 10px system-ui, sans-serif;
    display: none;
    align-items: center; justify-content: center;
  }
  /* Appears only once something is in the list. */
  .gm-cart-badge:not([data-count="0"]) { display: flex; }

  .gm-fab {
    position: fixed;
    right: 16px;
    bottom: calc(74px + env(safe-area-inset-bottom, 0px));
    z-index: 9996;
    width: 50px; height: 50px;
    border-radius: 50%;
    align-items: center; justify-content: center;
    background: linear-gradient(135deg, #61A644, #1D9FDA);
    color: #fff;
    box-shadow: 0 4px 14px rgba(0, 0, 0, .2);
    text-decoration: none;
  }
  .gm-fab i { font-size: 19px; }
</style>`;

export const PWA_TABBAR = `
<nav class="gm-tabbar" aria-label="Primary">
  <a href="/app-home" data-match="/app-home,/"><i class="fa-solid fa-house"></i><span>Home</span></a>
  <a href="/product-range" data-match="/product-range,/cancer-medicines,/conditions"><i class="fa-solid fa-capsules"></i><span>Products</span></a>
  <a href="/cart" class="gm-mid" data-match="/cart">
    <span class="gm-mid-btn"><i class="fa-solid fa-cart-shopping"></i></span>
    <span class="gm-cart-badge" data-count="0">0</span>
    <span class="gm-label">Cart</span>
  </a>
  <a href="/order-medicines" data-match="/order-medicines"><i class="fa-solid fa-prescription-bottle-medical"></i><span>Order</span></a>
  <button type="button" id="gm-more"><i class="fa-solid fa-bars"></i><span>More</span></button>
</nav>
<a class="gm-fab" href="/contact-us" aria-label="Contact us"><i class="fa-solid fa-comment-dots"></i></a>
<script>
(function () {
  // Active state is read from the URL, not held in memory: this is a multi-page
  // app, so every tab is a full navigation and there is no state to carry.
  var path = location.pathname.replace(/\\.html$/, '').replace(/\\/+$/, '') || '/';
  document.querySelectorAll('.gm-tabbar [data-match]').forEach(function (el) {
    var hit = el.getAttribute('data-match').split(',').some(function (m) {
      return m === '/' ? path === '/' : path === m || path.indexOf(m + '/') === 0;
    });
    if (hit) el.classList.add('is-active');
  });

  // "More" reuses the drawer the navbar already builds, rather than shipping a
  // second menu that would drift out of step with it.
  var more = document.getElementById('gm-more');
  if (more) more.addEventListener('click', function () {
    if (typeof window.toggleMobileMenu === 'function') window.toggleMobileMenu();
    else location.href = '/about-us';
  });

  // Cart badge. Read straight from IndexedDB in plain JS rather than from the
  // React store, because this bar is on every page — including ones where no
  // cart code is bundled — and the count must be right on all of them.
  //
  // The store names MUST match src/lib/cart.ts exactly: whichever of the two
  // opens the database first is the one that creates its object stores, and a
  // second opener at the same version never gets an upgrade event. Creating
  // nothing here would leave cart.ts with a database it cannot write to.
  function gmCartCount(cb) {
    try {
      var req = indexedDB.open('getmeds-cart', 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
      };
      req.onsuccess = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains('items')) { cb(0); return; }
        var c = db.transaction('items', 'readonly').objectStore('items').count();
        c.onsuccess = function () { cb(c.result || 0); };
        c.onerror = function () { cb(0); };
      };
      req.onerror = function () { cb(0); };
    } catch (e) { cb(0); }
  }

  function gmPaintBadge() {
    var badge = document.querySelector('.gm-cart-badge');
    if (!badge) return;
    gmCartCount(function (n) {
      badge.setAttribute('data-count', String(n));
      badge.textContent = n > 99 ? '99+' : String(n);
    });
  }

  gmPaintBadge();
  window.addEventListener('getmeds:cart-changed', gmPaintBadge);
})();
</script>`;
