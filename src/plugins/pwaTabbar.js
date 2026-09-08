/**
 * pwaTabbar.js
 * ─────────────────────────────────────────────
 * The installed app's bottom navigation, as plain HTML/CSS injected into every
 * built page by vite.config.js.
 *
 * Not a React component on purpose. It ships inside the initial HTML, so it
 * paints with the shell rather than appearing a beat after hydration — that
 * delay on every tap is most of what makes a web app feel like a web page. It
 * also means all 24 entry points get it without touching a single entry file.
 *
 * Shown ONLY in the installed app (html.pwa-standalone, set in <head> before
 * first paint) and only at phone widths: five icons stretched across a 1400px
 * desktop window looks broken, so an installed desktop window keeps the normal
 * top navigation instead.
 */

export const PWA_TABBAR_CSS = `
<style>
  /* Hidden everywhere by default — the rules below are the only thing that
     reveals it, so nothing changes for the website. */
  .gm-tabbar, .gm-fab { display: none; }

  @media (max-width: 1024px) {
    html.pwa-standalone .gm-tabbar { display: flex; }
    html.pwa-standalone .gm-fab { display: flex; }

    /* Clear the bar so the end of the page is never trapped behind it. */
    html.pwa-standalone body {
      padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
    }

    /* The footer repeats what Contact Us already covers, so the app drops it. */
    html.pwa-standalone #site-footer { display: none; }

    /* One button in that corner, not three: the FAB below replaces Tawk's own
       bubble, which would otherwise sit on top of the bar. */
    html.pwa-standalone .tawk-min-container,
    html.pwa-standalone iframe[title*="chat" i] { display: none !important; }

    /* Everything pinned to the bottom-right becomes one column instead of a
       pile. Measured from the bottom edge: the bar owns 0-60, the contact FAB
       74-124, and scroll-to-top 134-184 — 50px tall each with a 10px gap, so
       nothing lands on top of anything else.
       components.js declares #scroll-to-top with !important on every line
       (including bottom: 100px, which sat squarely on the FAB), so overriding
       it needs !important too. */
    html.pwa-standalone #scroll-to-top {
      bottom: calc(134px + env(safe-area-inset-bottom, 0px)) !important;
      right: 16px !important;
    }

    /* The offline-inquiry notice spans the full width and would otherwise cover
       the tab bar completely — it sits directly above it instead. */
    html.pwa-standalone .gm-queued-notice {
      bottom: calc(60px + env(safe-area-inset-bottom, 0px));
    }
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
    /* Resolves to a real value only because every page now sets
       viewport-fit=cover; without it the labels sit under the home indicator. */
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

  /* Contact stays reachable from every screen, clear of both the bar and the
     home indicator. */
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
  <a href="/" data-match="/"><i class="fa-solid fa-house"></i><span>Home</span></a>
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
})();
</script>`;
