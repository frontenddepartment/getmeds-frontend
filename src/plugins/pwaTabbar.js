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
 * The bar floats: a capsule inset from all three edges rather than a slab
 * welded to the bottom, so the page shows through around it and it reads as a
 * control resting on the content instead of a border framing it.
 *
 * That means its height is no longer the same as the space it occupies, and
 * everything pinned above it has to measure from the larger figure. Rather
 * than repeat that sum in five places and have them drift the first time the
 * bar changes size, it is --gm-tabbar-space, and every offset below is written
 * relative to it. Resolving to (inset + height + safe-area), currently 78px on
 * a phone with no home indicator:
 *
 *   tab bar         12 – 78    inset 12px from left and right
 *   scroll-to-top   90 – 140   right edge, and only while scrolled
 *
 * A floating "contact us" bubble used to sit at 90–140, with scroll-to-top
 * pushed above it. It has been removed: Contact is in the More sheet, the
 * product page has its own inquiry form, and a permanent circle over the
 * content is a choice on every screen for something almost nobody was taking.
 *
 * Tawk is not in that column because the app does not load it at all; the rule
 * hiding it below is only a guard against pages served from an older cache.
 *
 * The raised centre button breaks the top line by design — it sits about 16px
 * proud of the capsule, which is what makes it read as the primary action.
 */

/** Declarations shared by both detection methods, so they cannot drift apart. */
const APP_RULES = `
  .gm-tabbar { display: flex; }
  .gm-sheet { display: block; }
  .gm-sheet-backdrop { display: block; }

  /* Clear the bar so the end of the page is never trapped behind it. The
     extra 12px is the gap below the capsule, which content should not sit in
     either — it is what makes the bar look like it is floating. */
  body { padding-bottom: calc(var(--gm-tabbar-space) + 12px); }

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
    bottom: calc(var(--gm-tabbar-space) + 12px) !important;
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
  .gm-queued-notice { bottom: calc(var(--gm-tabbar-space) + 4px); }
`;

const scoped = (prefix) =>
  APP_RULES.replace(/^\s{2}(?=[.#a-zA-Z])/gm, '  ' + prefix + ' ');

/**
 * ── Squircles ──
 * Superellipse corners instead of circular-arc ones: the corner curvature
 * ramps in smoothly rather than starting abruptly where the straight edge
 * ends. It is the difference between a rounded rectangle and the shape every
 * native app surface is actually drawn with, and it is most of why a plain
 * border-radius reads subtly as "web page" next to one.
 *
 * Installed app only, which is what makes this affordable: `corner-shape` is
 * recent, so this is written as pure progressive enhancement behind @supports.
 * Where the browser has never heard of it, nothing is emitted and every corner
 * stays exactly the rounded rectangle it is today — there is no fallback to
 * get wrong, and the website is not touched either way.
 *
 * Circles and pills are deliberately absent from this list. `rounded-full` is
 * how the codebase spells "this is a circle" — avatars, icon buttons, the
 * badge, the tab bar capsule — and a squircled circle is just a worse circle.
 */
const SQUIRCLE_SELECTORS = [
  // Tailwind arbitrary radii — rounded-[18px] and friends, which is how nearly
  // every card in the app screens is written.
  '[class*="rounded-["]',
  '.rounded-lg',
  '.rounded-xl',
  '.rounded-2xl',
  '.rounded-3xl',
  '.rounded-t-2xl',
  '.rounded-t-3xl',
  // Plain CSS rather than a utility class, so it needs naming explicitly.
  '.gm-sheet',
];

const squircleRules = (prefix) =>
  `    ${SQUIRCLE_SELECTORS.map((s) => (prefix ? `${prefix} ${s}` : s)).join(',\n    ')} {\n` +
  '      corner-shape: squircle;\n' +
  '    }';

export const PWA_TABBAR_CSS = `
<style>
  /* Hidden everywhere by default — the blocks below are the only thing that
     reveals it, so nothing changes for the website. */
  .gm-tabbar, .gm-sheet, .gm-sheet-backdrop { display: none; }

  /* The bar's geometry, in one place. --gm-tabbar-space is the figure every
     other pinned element measures from; see the note at the top of this file.
     Declared unscoped on purpose: custom properties are inert until something
     reads them, and nothing on the website does. env() resolves to a real
     value only because every page sets viewport-fit=cover — without it the
     capsule would sit on top of the iPhone home indicator. */
  :root {
    --gm-tabbar-inset: 12px;
    --gm-tabbar-height: 66px;
    --gm-tabbar-space: calc(var(--gm-tabbar-inset) + var(--gm-tabbar-height) + env(safe-area-inset-bottom, 0px));
  }

  @media (max-width: 1024px) {
${scoped('html.pwa-standalone')}
  }

  @media (display-mode: standalone) and (max-width: 1024px) {
${APP_RULES}
  }

  /* Written twice for the same reason everything above is — see the note at
     the top of this file. Not width-gated, unlike the rules above: this is
     pure surface finish, and an installed desktop window is still the app. */
  @supports (corner-shape: squircle) {
${squircleRules('html.pwa-standalone')}

    @media (display-mode: standalone) {
${squircleRules('')}
    }
  }

  /* A capsule floating clear of all three edges, not a slab welded to the
     bottom. The page showing through around it is the whole point: it reads as
     a control resting on the content rather than a border framing it. */
  .gm-tabbar {
    position: fixed;
    left: var(--gm-tabbar-inset);
    right: var(--gm-tabbar-inset);
    bottom: calc(var(--gm-tabbar-inset) + env(safe-area-inset-bottom, 0px));
    z-index: 9997;
    height: var(--gm-tabbar-height);
    align-items: stretch;
    justify-content: space-around;
    background: #fff;
    border-radius: 999px;
    /* Two shadows doing two jobs: a wide soft one to lift the capsule off the
       page, and a tight one to keep its edge defined where it crosses a white
       card and the soft one has nothing to darken. */
    box-shadow: 0 12px 32px rgba(23, 43, 77, .16), 0 2px 6px rgba(23, 43, 77, .06);
    /* The raised centre button and its halo overhang the top edge. */
    overflow: visible;
  }

  .gm-tabbar a,
  .gm-tabbar button {
    flex: 1;
    /* Every tab, not just the raised one: the cart badge anchors to whichever
       tab is carrying it. */
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 0 2px;
    border: 0;
    background: none;
    color: #9CA3AF;
    font: 600 9.5px "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    letter-spacing: .01em;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  /* Captions are small but present. An icon-only bar reads well to whoever
     drew it and badly to everyone else: a cart and a house are guessable, but
     nothing about a hamburger says "everything else on the site", and a wrong
     guess costs a page load to undo. The dot that used to mark the active tab
     is gone with them — a coloured icon over a coloured word is already two
     signals, and a third would just be decoration. */
  .gm-tabbar i {
    font-size: 18px;
    line-height: 1;
    transition: color .18s ease;
  }

  .gm-tabbar .is-active { color: #1D9FDA; }

  /* The middle tab sits raised, the way a primary action reads on a phone.
     Search holds that slot: in a catalogue this size — thousands of rows,
     most of them near-identical oncology names — finding one specific thing
     is the errand people arrive with far more often than any other. */
  .gm-tabbar .gm-mid .gm-mid-btn {
    position: absolute;
    top: -16px;
    left: 50%;
    margin-left: -27px;
    width: 54px; height: 54px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1D9FDA, #61A644);
    color: #fff;
    /* Concentric rings rather than a single drop shadow: the halo is what
       makes this read as lit from within instead of merely raised. */
    box-shadow:
      0 0 0 5px rgba(29, 159, 218, .10),
      0 0 0 11px rgba(29, 159, 218, .05),
      0 10px 22px rgba(29, 159, 218, .40);
  }
  .gm-tabbar .gm-mid .gm-mid-btn i { font-size: 20px; }

  /* The raised button is absolutely positioned, so the caption is the only
     child left in flow and would centre higher than its neighbours. A normal
     tab's stack is icon (18px) + gap (3px) + caption; adding that 21px back is
     exactly what puts every caption on one line. */
  .gm-tabbar .gm-mid .gm-label { margin-top: 21px; }

  /* Anchored to the Cart tab's own box (every tab is positioned, above). The
     white ring cuts it out of the icon it overlaps. */
  .gm-cart-badge {
    position: absolute;
    top: 10px; right: calc(50% - 16px);
    min-width: 17px; height: 17px;
    padding: 0 4px;
    border-radius: 999px;
    background: #e5484d;
    color: #fff;
    font: 700 10px system-ui, sans-serif;
    display: none;
    align-items: center; justify-content: center;
    box-shadow: 0 0 0 2px #fff;
  }
  /* Appears only once something is in the list. */
  .gm-cart-badge:not([data-count="0"]) { display: flex; }

  /* ── The "More" sheet ──
     Six entries, not the website's thirty. The drawer this replaces was built
     for a site whose job is to explain the company to someone deciding whether
     to trust it: Global Network sub-brands, UNGC, Careers, Employee
     Verification. Almost all of that is read once, before installing, and none
     of it is why anyone opens the app. Leaving it on the one control whose
     whole purpose is "everything else" is what turned a five-item bar into a
     thirty-item decision one tap deeper.

     What is left is what an installed app is actually asked for, plus the two
     things the bar itself no longer carries: the full catalogue, and account. */
  .gm-sheet-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(16, 24, 40, .45);
    opacity: 0;
    pointer-events: none;
    transition: opacity .22s ease;
  }
  .gm-sheet-backdrop[data-open="1"] { opacity: 1; pointer-events: auto; }

  .gm-sheet {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    z-index: 9999;
    background: #fff;
    border-radius: 22px 22px 0 0;
    padding: 10px 10px calc(14px + env(safe-area-inset-bottom, 0px));
    box-shadow: 0 -10px 40px rgba(23, 43, 77, .22);
    /* Parked off-screen rather than display:none, so it can animate in and so
       the transition has something to move from on the very first open. */
    transform: translateY(100%);
    transition: transform .26s cubic-bezier(.22, 1, .36, 1);
  }
  .gm-sheet[data-open="1"] { transform: translateY(0); }

  .gm-sheet-grip {
    display: block;
    width: 38px; height: 4px;
    margin: 2px auto 10px;
    border-radius: 999px;
    background: #E5E7EB;
  }

  .gm-sheet a {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 12px;
    border-radius: 14px;
    color: #1F2937;
    font: 600 13.5px "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }
  .gm-sheet a:active { background: #F3F6FB; }
  .gm-sheet a > i:first-child {
    width: 34px; height: 34px;
    flex: none;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    background: #F1F6FC;
    color: #1D9FDA;
    font-size: 14px;
  }
  .gm-sheet a > span { flex: 1; }
  .gm-sheet .gm-sheet-go { color: #D1D5DB; font-size: 12px; }
</style>`;

export const PWA_TABBAR = `
<nav class="gm-tabbar" aria-label="Primary">
  <a href="/app-home" data-match="/app-home,/"><i class="fa-solid fa-house"></i><span>Home</span></a>
  <a href="/search" data-match="/search"><i class="fa-solid fa-magnifying-glass"></i><span>Search</span></a>
  <a href="/order-medicines" class="gm-mid" data-match="/order-medicines">
    <span class="gm-mid-btn"><i class="fa-solid fa-file-prescription"></i></span>
  </a>
  <a href="/cart" data-match="/cart" aria-label="Your request list">
    <i class="fa-solid fa-cart-shopping"></i>
    <span class="gm-cart-badge" data-count="0">0</span>
    <span>Requests</span>
  </a>
  <button type="button" id="gm-more" aria-haspopup="dialog" aria-expanded="false"><i class="fa-solid fa-bars"></i><span>More</span></button>
</nav>

<div class="gm-sheet-backdrop" data-open="0"></div>
<div class="gm-sheet" data-open="0" role="dialog" aria-modal="true" aria-label="More" aria-hidden="true">
  <span class="gm-sheet-grip" aria-hidden="true"></span>
  <a href="/profile"><i class="fa-solid fa-user"></i><span>My account</span><i class="fa-solid fa-chevron-right gm-sheet-go"></i></a>
  <a href="/product-range"><i class="fa-solid fa-capsules"></i><span>Browse all products</span><i class="fa-solid fa-chevron-right gm-sheet-go"></i></a>
  <a href="/patient-assistance-program"><i class="fa-solid fa-hand-holding-heart"></i><span>Patient Assistance</span><i class="fa-solid fa-chevron-right gm-sheet-go"></i></a>
  <a href="/contact-us"><i class="fa-solid fa-headset"></i><span>Contact us</span><i class="fa-solid fa-chevron-right gm-sheet-go"></i></a>
  <a href="/about-us"><i class="fa-solid fa-circle-info"></i><span>About Getmeds</span><i class="fa-solid fa-chevron-right gm-sheet-go"></i></a>
  <a href="/policy"><i class="fa-solid fa-shield-halved"></i><span>Privacy &amp; policies</span><i class="fa-solid fa-chevron-right gm-sheet-go"></i></a>
</div>
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

  // "More" opens the app's own sheet rather than the website drawer it used to
  // borrow. Sharing that drawer kept the two in step, but what it kept them in
  // step with was a thirty-entry site map — see the note on .gm-sheet above.
  var more = document.getElementById('gm-more');
  var sheet = document.querySelector('.gm-sheet');
  var backdrop = document.querySelector('.gm-sheet-backdrop');

  function setSheet(open) {
    if (!sheet || !backdrop) return;
    sheet.setAttribute('data-open', open ? '1' : '0');
    backdrop.setAttribute('data-open', open ? '1' : '0');
    sheet.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (more) more.setAttribute('aria-expanded', open ? 'true' : 'false');
    // Closed, the backdrop stays in the tree but is transparent and
    // pointer-events:none, so it never swallows a tap meant for the page
    // underneath. The [hidden] attribute would have been the tidier signal,
    // but the rule that reveals the backdrop in the app is a class selector
    // and would win against it — leaving it visible and blocking.
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (more && sheet) {
    more.addEventListener('click', function () {
      setSheet(sheet.getAttribute('data-open') !== '1');
    });
    backdrop.addEventListener('click', function () { setSheet(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setSheet(false);
    });
  } else if (more) {
    // A page still served from an older cache has the button but not the
    // sheet. Better a real destination than a tap that does nothing.
    more.addEventListener('click', function () { location.href = '/about-us'; });
  }

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
