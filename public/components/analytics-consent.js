/*
 * Getmeds cookie consent, and website analytics that only run after a "yes".
 *
 * components.js loads this on every page. It does two jobs, in this order.
 *
 * 1. Ask. The first visit shows a banner: Accept, Reject, or Manage
 *    preferences. Reject sits beside Accept at the same size, and nothing is
 *    counted until someone accepts. A browser sending Global Privacy Control
 *    or Do Not Track is taken as a "no" without asking, and told so once. The
 *    answer is kept in the gm_consent cookie for 180 days, then we ask again.
 *    "Cookie settings" in the footer and in the app's More sheet (anything
 *    marked data-gm-cookie-settings, or #cookie-settings in the URL) reopens
 *    the preferences at any time.
 *
 * 2. Count, only after a yes. Page views, time on page, scroll depth, link and
 *    button clicks, device type and the referring site are batched and sent to
 *    /api/analytics/collect, which getmeds.ph rewrites to the admin backend
 *    (getmeds_backend, app/api/routes/analytics.py). They're tied to a random
 *    visitor ID in gm_vid, never to a name, email or IP address. Query strings
 *    are dropped and form fields are never read. Switching analytics off after
 *    having it on clears the cookies and asks the backend to erase everything
 *    recorded under that visitor ID.
 *
 * This is a plain script, not a Vite module, for the same reason as
 * components.js: it has to run on 404.html and under-development.html, which
 * have no React entry. Styles are its own for the same reason, since not every
 * page is guaranteed Tailwind.
 */
(function () {
  'use strict';
  if (window.GetmedsConsent) return;

  var CONSENT_COOKIE = 'gm_consent';
  var VISITOR_COOKIE = 'gm_vid';
  var SESSION_COOKIE = 'gm_sid';
  var CONSENT_DAYS = 180;
  var SESSION_MINUTES = 30;
  var API = '/api/analytics/';
  var PRIVACY_URL = '/privacy-policy';
  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Only the live site and local dev report. Vercel preview deployments also
  // rewrite /api to the production backend, and test clicks there would
  // otherwise land in the real numbers.
  var host = location.hostname;
  var REPORTS = /(^|\.)getmeds\.ph$/.test(host) || host === 'localhost' || host === '127.0.0.1';

  // ── Cookies ───────────────────────────────────────────────────────────────

  function readCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    if (!match) return null;
    try { return decodeURIComponent(match[1]); } catch (e) { return null; }
  }

  function writeCookie(name, value, maxAgeSeconds) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; Max-Age=' + maxAgeSeconds +
      '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  }

  function clearCookie(name) {
    document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
  }

  // gm_consent is "1.<a|r>.<unix seconds>.<source>": a format version, the
  // answer, when it was given, and whether it came from the banner, the
  // preferences dialog or a browser privacy signal.
  function readConsent() {
    var parts = (readCookie(CONSENT_COOKIE) || '').split('.');
    if (parts[0] !== '1' || (parts[1] !== 'a' && parts[1] !== 'r')) return null;
    return { analytics: parts[1] === 'a', at: (Number(parts[2]) || 0) * 1000, source: parts[3] || 'banner' };
  }

  function saveConsent(analytics, source) {
    writeCookie(CONSENT_COOKIE, ['1', analytics ? 'a' : 'r', Math.floor(Date.now() / 1000), source].join('.'),
      CONSENT_DAYS * 86400);
  }

  function browserSaysNo() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  }

  // ── Sending ───────────────────────────────────────────────────────────────

  function uuid() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    var b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64;
    b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function send(endpoint, payload) {
    if (!REPORTS) return;
    var body = JSON.stringify(payload);
    // sendBeacon survives the page closing, which is exactly when "leave"
    // reports go out. text/plain keeps it a simple request with no preflight;
    // the backend parses the body whatever the type says.
    try {
      if (navigator.sendBeacon &&
          navigator.sendBeacon(API + endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) {
        return;
      }
    } catch (e) { /* fall through to fetch */ }
    try {
      fetch(API + endpoint, {
        method: 'POST',
        body: body,
        keepalive: true,
        credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      }).catch(function () {});
    } catch (e) { /* analytics must never break the page */ }
  }

  // ── Tracker (runs only with consent) ──────────────────────────────────────

  var tracker = null;
  var onRouteChange = null;
  var historyPatched = false;

  function deviceClass() {
    var ua = navigator.userAgent || '';
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
        (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
      return 'tablet';
    }
    return /Mobi|iPhone|iPod|Android/i.test(ua) ? 'mobile' : 'desktop';
  }

  function timeZone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch (e) { return null; }
  }

  // How far down the page the visitor has seen, as the bottom of the viewport.
  function scrollDepth() {
    var doc = document.documentElement;
    var height = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
    var viewport = window.innerHeight || doc.clientHeight;
    if (!height || height <= viewport) return 100;
    var seen = (window.scrollY || doc.scrollTop || 0) + viewport;
    return Math.max(0, Math.min(100, Math.round(seen / height * 100)));
  }

  // The referring site's origin only, and only when it isn't getmeds.ph.
  function externalReferrer() {
    try {
      if (!document.referrer) return null;
      var ref = new URL(document.referrer);
      return ref.hostname === location.hostname ? null : ref.origin;
    } catch (e) {
      return null;
    }
  }

  function labelFor(el) {
    // The signed-in menu shows the visitor's own name, so it is reported by
    // what it is, never by its text.
    if (el.closest('#user-name-display, #mobile-user-name-display') ||
        (el.querySelector && el.querySelector('#user-name-display, #mobile-user-name-display'))) {
      return 'Account menu';
    }
    var text = el.getAttribute('data-track') || el.getAttribute('aria-label') || el.getAttribute('title') ||
      el.textContent || '';
    if (!text.trim() && el.querySelector) {
      var img = el.querySelector('img[alt]');
      if (img) text = img.getAttribute('alt') || '';
    }
    text = text.replace(/\s+/g, ' ').trim();
    return text ? text.slice(0, 80) : null;
  }

  function hrefFor(el) {
    var href = el.tagName === 'A' ? el.getAttribute('href') : null;
    if (!href || href.charAt(0) === '#' || /^javascript:/i.test(href)) return null;
    if (/^(tel|mailto|sms|viber|whatsapp):/i.test(href)) return href.split('?')[0];
    try {
      var url = new URL(href, location.href);
      return url.hostname === location.hostname ? url.pathname : url.hostname + url.pathname;
    } catch (e) {
      return null;
    }
  }

  function patchHistory() {
    // Pages are separate documents, but a few update the URL in place. Those
    // changes count as page views too.
    if (historyPatched) return;
    historyPatched = true;
    ['pushState', 'replaceState'].forEach(function (name) {
      var original = history[name];
      if (typeof original !== 'function') return;
      history[name] = function () {
        var result = original.apply(this, arguments);
        try { if (onRouteChange) onRouteChange(); } catch (e) { /* never break navigation */ }
        return result;
      };
    });
  }

  function createTracker() {
    var visitorId = readCookie(VISITOR_COOKIE);
    var mintedVisitor = !UUID_RE.test(visitorId || '');
    if (mintedVisitor) visitorId = uuid();
    writeCookie(VISITOR_COOKIE, visitorId, CONSENT_DAYS * 86400);

    // gm_sid is "<session id>.<last active ms>.<1 if the visitor ID is new this visit>";
    // it lapses after 30 minutes without activity, which starts a new visit.
    var parts = (readCookie(SESSION_COOKIE) || '').split('.');
    var resumed = UUID_RE.test(parts[0] || '') && Date.now() - Number(parts[1]) < SESSION_MINUTES * 60000;
    var sessionId = resumed ? parts[0] : uuid();
    var newVisitor = mintedVisitor || (resumed && parts[2] === '1');
    var sessionIsNew = !resumed;

    var queue = [];
    var timer = null;
    var page = null;
    var scrollQueued = false;

    function touchSession() {
      writeCookie(SESSION_COOKIE, [sessionId, Date.now(), newVisitor ? 1 : 0].join('.'), SESSION_MINUTES * 60);
    }

    function flush() {
      clearTimeout(timer);
      timer = null;
      // Titles are read at send time: the React pages set document.title after they mount.
      queue.forEach(function (ev) {
        if (ev.type === 'pageview' && !ev.title && ev.path === location.pathname) ev.title = document.title || null;
      });
      while (queue.length) {
        send('collect', {
          visitorId: visitorId,
          sessionId: sessionId,
          newVisitor: newVisitor,
          device: deviceClass(),
          language: navigator.language || null,
          timezone: timeZone(),
          events: queue.splice(0, 40)
        });
      }
    }

    function flushSoon(ms) {
      if (!timer) timer = setTimeout(flush, ms);
    }

    function beginPage(first) {
      page = {
        id: uuid(),
        path: location.pathname,
        visibleSince: document.visibilityState === 'visible' ? Date.now() : 0,
        unsentMs: 0,
        maxScroll: 0,
        reported: false,
        clicks: 0
      };
      var ev = { type: 'pageview', path: page.path, pageViewId: page.id, newSession: first && sessionIsNew };
      if (ev.newSession) ev.referrer = externalReferrer();
      var params = new URLSearchParams(location.search);
      ['Source', 'Medium', 'Campaign'].forEach(function (key) {
        var value = params.get('utm_' + key.toLowerCase());
        if (value) ev['utm' + key] = value;
      });
      queue.push(ev);
      flushSoon(1500);
    }

    // Reports the visible time since the last report, so a tab that is hidden
    // and shown many times adds up correctly on the server (which sums the
    // slices per page view and keeps the deepest scroll).
    function reportLeave() {
      if (!page) return;
      if (page.visibleSince) {
        page.unsentMs += Date.now() - page.visibleSince;
        page.visibleSince = 0;
      }
      page.maxScroll = Math.max(page.maxScroll, scrollDepth());
      if (page.unsentMs > 0 || !page.reported) {
        queue.push({
          type: 'leave',
          path: page.path,
          pageViewId: page.id,
          durationMs: Math.round(page.unsentMs),
          scrollPct: page.maxScroll
        });
        page.unsentMs = 0;
        page.reported = true;
      }
      flush();
    }

    function onVisibility() {
      if (document.visibilityState === 'hidden') {
        reportLeave();
      } else if (page) {
        page.visibleSince = Date.now();
        touchSession();
      }
    }

    function onScroll() {
      if (scrollQueued || !page) return;
      scrollQueued = true;
      requestAnimationFrame(function () {
        scrollQueued = false;
        if (page) page.maxScroll = Math.max(page.maxScroll, scrollDepth());
      });
    }

    function onClick(e) {
      if (!page || page.clicks >= 50) return;
      var el = e.target && e.target.closest ? e.target.closest('a[href], button, [role="button"], [data-track]') : null;
      // Sign-in and registration forms, and this banner, are never reported.
      if (!el || el.closest('[data-analytics-ignore], .gmc-root, #auth-modal-container')) return;
      var label = labelFor(el);
      var target = hrefFor(el);
      if (!label && !target) return;
      page.clicks += 1;
      queue.push({ type: 'click', path: page.path, pageViewId: page.id, label: label, target: target });
      // Clicks ride along with the next report (leaving the page sends
      // everything), so they rarely cost a stored message of their own.
      flushSoon(20000);
    }

    function onRoute() {
      if (!page || location.pathname === page.path) return;
      reportLeave();
      touchSession();
      beginPage(false);
    }

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', reportLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onRoute);
    onRouteChange = onRoute;
    patchHistory();

    touchSession();
    beginPage(true);

    return {
      visitorId: visitorId,
      // discard: drop anything not yet sent (consent was just withdrawn).
      stop: function (discard) {
        if (discard) queue.length = 0;
        else reportLeave();
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', reportLeave);
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('click', onClick, true);
        window.removeEventListener('popstate', onRoute);
        onRouteChange = null;
        page = null;
      }
    };
  }

  function startTracking() {
    if (tracker || !REPORTS || navigator.webdriver) return;
    try { tracker = createTracker(); } catch (e) { tracker = null; }
  }

  // ── Decisions ─────────────────────────────────────────────────────────────

  function decide(analytics, source) {
    var before = readConsent();
    var wasOn = !!tracker || !!(before && before.analytics);
    saveConsent(analytics, source);
    // Counted once per change of mind, with no ID attached: it only tells the
    // dashboard what share of visitors its numbers stand for.
    if (!before || before.analytics !== analytics) {
      send('consent', { decision: analytics ? 'accepted' : 'rejected', source: source });
    }

    if (analytics) {
      startTracking();
    } else {
      var visitorId = (tracker && tracker.visitorId) || readCookie(VISITOR_COOKIE);
      if (tracker) { tracker.stop(true); tracker = null; }
      if (wasOn && UUID_RE.test(visitorId || '')) send('forget', { visitorId: visitorId });
      clearCookie(VISITOR_COOKIE);
      clearCookie(SESSION_COOKIE);
    }

    hideBanner();
    closePreferences();
    hideNotice();
  }

  // ── Interface ─────────────────────────────────────────────────────────────

  var banner = null;
  var overlay = null;
  var notice = null;
  var returnFocus = null;
  var chatHiddenByUs = false;

  var ICON_COOKIE =
    '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 ' +
    '4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/>' +
    '<path d="M7 14v.01"/></svg>';
  var ICON_CLOSE =
    '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  var CSS = [
    '.gmc-root{font-family:Poppins,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1A202C;',
    '-webkit-font-smoothing:antialiased;line-height:1.5;text-align:left}',
    '.gmc-root *,.gmc-root *::before,.gmc-root *::after{box-sizing:border-box}',
    '.gmc-root p,.gmc-root h2,.gmc-root h3,.gmc-root ul{margin:0}',
    '.gmc-banner{position:fixed;z-index:2147483000;left:16px;bottom:16px;width:min(420px,calc(100vw - 32px));',
    'background:#fff;border-radius:20px;padding:20px;',
    'box-shadow:0 24px 48px -16px rgba(15,23,42,.35),0 0 0 1px rgba(15,23,42,.06);animation:gmc-rise .4s cubic-bezier(.2,.8,.2,1)}',
    '.gmc-eyebrow{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:.06em;',
    'text-transform:uppercase;color:#1D9FDA}',
    // Text colours are pinned at two-class strength so a page's own p/li/h2
    // rules can't leak in (a global `p { color }` is common on the site).
    '.gmc-root .gmc-title{margin-top:6px!important;font-size:17px;font-weight:600;line-height:1.35;color:#1A202C}',
    '.gmc-root .gmc-text{margin-top:6px!important;font-size:13px;line-height:1.6;color:#4A5568}',
    '.gmc-root .gmc-cat-desc p,.gmc-root .gmc-cat-desc li{color:#4A5568}',
    '.gmc-root.gmc-notice p{color:#E2E8F0}',
    '.gmc-root a{color:#1A7FB0;text-decoration:underline;text-underline-offset:2px}',
    '.gmc-root a:hover{color:#0F6C99}',
    '.gmc-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}',
    '.gmc-btn{appearance:none;-webkit-appearance:none;border:0;border-radius:999px;min-height:44px;padding:10px 16px;',
    'font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;',
    'transition:background-color .15s,box-shadow .15s,transform .15s}',
    '.gmc-btn:active{transform:translateY(1px)}',
    '.gmc-btn:focus-visible,.gmc-link:focus-visible,.gmc-close:focus-visible,.gmc-switch:focus-visible,',
    '.gmc-notice button:focus-visible{outline:3px solid rgba(29,159,218,.5);outline-offset:2px}',
    '.gmc-btn-primary{color:#fff;background:linear-gradient(135deg,#1D9FDA,#61A644);',
    'box-shadow:0 8px 18px -8px rgba(29,159,218,.7)}',
    '.gmc-btn-primary:hover{box-shadow:0 10px 22px -8px rgba(29,159,218,.85)}',
    '.gmc-btn-quiet{color:#1A202C;background:#EEF2F6}',
    '.gmc-btn-quiet:hover{background:#E2E8F0}',
    '.gmc-link{display:block;margin:12px auto 0;padding:4px 8px;background:none;border:0;font:inherit;font-size:12.5px;',
    'font-weight:500;color:#4A5568;text-decoration:underline;text-underline-offset:3px;cursor:pointer;border-radius:6px}',
    '.gmc-link:hover{color:#1A202C}',
    '.gmc-overlay{position:fixed;inset:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;',
    'padding:16px;background:rgba(15,23,42,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);',
    'animation:gmc-fade .2s ease}',
    '.gmc-modal{width:min(520px,100%);max-height:min(90vh,760px);overflow:auto;overscroll-behavior:contain;',
    'background:#fff;border-radius:24px;padding:24px;box-shadow:0 30px 60px -20px rgba(15,23,42,.45);',
    'animation:gmc-rise .3s cubic-bezier(.2,.8,.2,1)}',
    '.gmc-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}',
    '.gmc-modal-head .gmc-title{margin-top:0!important;font-size:19px}',
    '.gmc-close{flex:none;display:grid;place-items:center;width:36px;height:36px;margin:-6px -6px 0 0;border:0;',
    'border-radius:50%;background:transparent;color:#4A5568;cursor:pointer}',
    '.gmc-close:hover{background:#EEF2F6;color:#1A202C}',
    '.gmc-note{margin-top:14px!important;padding:12px 14px;border-radius:14px;background:#EAF6FC;color:#0F5F86;',
    'font-size:12.5px;line-height:1.55}',
    '.gmc-cat{margin-top:12px;padding:14px 16px;border:1px solid #E2E8F0;border-radius:16px}',
    '.gmc-cat-head{display:flex;align-items:center;justify-content:space-between;gap:12px}',
    '.gmc-cat-name{font-size:14px;font-weight:600;color:#1A202C;cursor:default}',
    'label.gmc-cat-name{cursor:pointer}',
    '.gmc-cat-desc{margin-top:6px;font-size:12.5px;line-height:1.6;color:#4A5568}',
    '.gmc-cat-desc p+p,.gmc-cat-desc ul+p{margin-top:8px!important}',
    '.gmc-cat-desc ul{margin-top:6px!important;padding-left:18px}',
    '.gmc-cat-desc li{margin:2px 0}',
    '.gmc-pill{flex:none;font-size:11px;font-weight:600;color:#3F7A2A;background:#EEF7E9;border-radius:999px;',
    'padding:4px 10px}',
    '.gmc-switch{appearance:none;-webkit-appearance:none;flex:none;position:relative;width:46px;height:28px;margin:0;',
    'border-radius:999px;background:#CBD5E1;cursor:pointer;transition:background-color .2s}',
    '.gmc-switch::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;',
    'background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s cubic-bezier(.2,.8,.2,1)}',
    '.gmc-switch:checked{background:#61A644}',
    '.gmc-switch:checked::after{transform:translateX(18px)}',
    '.gmc-modal-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:18px}',
    '.gmc-foot{margin-top:14px!important;font-size:12px;color:#4A5568;text-align:center}',
    '.gmc-notice{position:fixed;z-index:2147483000;left:16px;bottom:16px;width:min(400px,calc(100vw - 32px));',
    'display:flex;flex-direction:column;gap:10px;padding:14px 16px;border-radius:16px;background:#1A202C;color:#E2E8F0;',
    'font-size:12.5px;line-height:1.55;box-shadow:0 20px 40px -16px rgba(15,23,42,.5);',
    'animation:gmc-rise .4s cubic-bezier(.2,.8,.2,1)}',
    '.gmc-notice strong{color:#fff;font-weight:600}',
    '.gmc-notice-actions{display:flex;justify-content:flex-end;gap:4px}',
    '.gmc-notice button{border:0;background:transparent;color:#fff;font:inherit;font-size:12.5px;font-weight:600;',
    'padding:6px 10px;border-radius:8px;cursor:pointer}',
    '.gmc-notice button:hover{background:rgba(255,255,255,.1)}',
    '@media (max-width:640px){',
    '.gmc-banner,.gmc-notice{left:8px;right:8px;bottom:8px;width:auto}',
    '.gmc-banner{padding:18px 18px calc(16px + env(safe-area-inset-bottom,0px))}',
    '.gmc-overlay{align-items:flex-end;padding:0}',
    '.gmc-modal{width:100%;max-height:92vh;border-radius:24px 24px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom,0px))}',
    '.gmc-modal-actions{grid-template-columns:1fr}',
    '.gmc-modal-actions .gmc-btn-primary{order:-1}',
    '}',
    '@keyframes gmc-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',
    '@keyframes gmc-fade{from{opacity:0}to{opacity:1}}',
    '@media (prefers-reduced-motion:reduce){.gmc-banner,.gmc-overlay,.gmc-modal,.gmc-notice{animation:none}',
    '.gmc-switch,.gmc-switch::after{transition:none}}',
    '@media print{.gmc-root{display:none!important}}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('gmc-styles')) return;
    var style = document.createElement('style');
    style.id = 'gmc-styles';
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function mount(html) {
    var holder = document.createElement('div');
    holder.innerHTML = html;
    var node = holder.firstElementChild;
    document.body.appendChild(node);
    return node;
  }

  // Tawk's chat bubble sits bottom-right above everything, which on a phone
  // is on top of the banner's buttons. It is hidden only while the banner is
  // up, and only on small screens where the two collide.
  function holdChat(hold) {
    var tawk = window.Tawk_API = window.Tawk_API || {};
    if (hold) {
      if (!window.matchMedia || !window.matchMedia('(max-width: 640px)').matches) return;
      chatHiddenByUs = true;
      if (typeof tawk.hideWidget === 'function') {
        try { tawk.hideWidget(); } catch (e) { /* ignore */ }
      } else {
        var previous = tawk.onLoad;
        tawk.onLoad = function () {
          if (typeof previous === 'function') previous.apply(this, arguments);
          if (chatHiddenByUs && typeof tawk.hideWidget === 'function') tawk.hideWidget();
        };
      }
    } else if (chatHiddenByUs) {
      chatHiddenByUs = false;
      if (typeof tawk.showWidget === 'function') {
        try { tawk.showWidget(); } catch (e) { /* ignore */ }
      }
    }
  }

  function wire(root) {
    root.addEventListener('click', function (e) {
      var action = e.target.closest && e.target.closest('[data-gmc]');
      if (!action) return;
      var what = action.getAttribute('data-gmc');
      if (what === 'accept') decide(true, root === banner ? 'banner' : 'settings');
      else if (what === 'reject') decide(false, root === banner ? 'banner' : 'settings');
      else if (what === 'save') decide(!!overlay.querySelector('#gmc-analytics:checked'), 'settings');
      else if (what === 'manage') openPreferences();
      else if (what === 'close') closePreferences();
      else if (what === 'dismiss') hideNotice();
    });
  }

  function showBanner() {
    if (banner || !document.body) return;
    banner = mount(
      '<section class="gmc-root gmc-banner" role="region" aria-labelledby="gmc-banner-title">' +
        '<p class="gmc-eyebrow">' + ICON_COOKIE + 'Your privacy, your choice</p>' +
        '<h2 class="gmc-title" id="gmc-banner-title">May we use analytics cookies?</h2>' +
        '<p class="gmc-text">They show us which pages people find useful, so we can make Getmeds better. ' +
          'They stay off unless you say yes. We never read what you type into forms, and we never sell your data. ' +
          '<a href="' + PRIVACY_URL + '">Privacy Policy</a></p>' +
        '<div class="gmc-actions">' +
          '<button type="button" class="gmc-btn gmc-btn-quiet" data-gmc="reject">Reject</button>' +
          '<button type="button" class="gmc-btn gmc-btn-primary" data-gmc="accept">Accept</button>' +
        '</div>' +
        '<button type="button" class="gmc-link" data-gmc="manage">Manage preferences</button>' +
      '</section>'
    );
    wire(banner);
    holdChat(true);
  }

  function hideBanner() {
    if (!banner) return;
    banner.remove();
    banner = null;
    holdChat(false);
  }

  function openPreferences() {
    if (overlay || !document.body) return;
    hideNotice();
    var current = readConsent();
    var signal = browserSaysNo();
    returnFocus = document.activeElement;
    overlay = mount(
      '<div class="gmc-root gmc-overlay">' +
        '<div class="gmc-modal" role="dialog" aria-modal="true" aria-labelledby="gmc-prefs-title" ' +
          'aria-describedby="gmc-prefs-intro">' +
          '<div class="gmc-modal-head">' +
            '<h2 class="gmc-title" id="gmc-prefs-title">Cookie preferences</h2>' +
            '<button type="button" class="gmc-close" data-gmc="close" aria-label="Close">' + ICON_CLOSE + '</button>' +
          '</div>' +
          '<p class="gmc-text" id="gmc-prefs-intro">Choose what Getmeds may use on this browser. You can change ' +
            'this any time from <strong>Cookie settings</strong> at the bottom of every page, or under More in ' +
            'the Getmeds app.</p>' +
          (signal
            ? '<p class="gmc-note">Your browser is sending a privacy signal (Global Privacy Control or Do Not ' +
              'Track), so we have kept analytics off. You can still switch them on here if you like.</p>'
            : '') +
          '<section class="gmc-cat">' +
            '<div class="gmc-cat-head"><h3 class="gmc-cat-name">Strictly necessary</h3>' +
              '<span class="gmc-pill">Always on</span></div>' +
            '<p class="gmc-cat-desc">These keep the site working: your cart, signing in, security checks on forms, ' +
              'and remembering this choice. They can\'t be switched off.</p>' +
          '</section>' +
          '<section class="gmc-cat">' +
            '<div class="gmc-cat-head"><label class="gmc-cat-name" for="gmc-analytics">Analytics</label>' +
              '<input type="checkbox" role="switch" id="gmc-analytics" class="gmc-switch" ' +
                'aria-describedby="gmc-analytics-desc"' + (current && current.analytics ? ' checked' : '') + '></div>' +
            '<div class="gmc-cat-desc" id="gmc-analytics-desc">' +
              '<p>These help us see which pages are useful and which ones people miss. If you allow them, we count:</p>' +
              '<ul>' +
                '<li>the pages you open, how long you stay, and how far you scroll</li>' +
                '<li>the links and buttons you click</li>' +
                '<li>your device type, browser, language, and the site that sent you here</li>' +
              '</ul>' +
              '<p>This is tied to a random ID stored on this browser, never to your name, email or IP address, ' +
                'and only the Getmeds team sees it. Each night the day\'s visits are added into anonymous totals ' +
                'and the individual records are deleted; the totals are kept for 13 months. Switching this off ' +
                'also erases any records still held for this browser.</p>' +
            '</div>' +
          '</section>' +
          '<div class="gmc-modal-actions">' +
            '<button type="button" class="gmc-btn gmc-btn-quiet" data-gmc="reject">Reject all</button>' +
            '<button type="button" class="gmc-btn gmc-btn-quiet" data-gmc="save">Save choices</button>' +
            '<button type="button" class="gmc-btn gmc-btn-primary" data-gmc="accept">Accept all</button>' +
          '</div>' +
          '<p class="gmc-foot"><a href="' + PRIVACY_URL + '">Read our Privacy Policy</a></p>' +
        '</div>' +
      '</div>'
    );
    wire(overlay);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closePreferences(); });
    overlay.addEventListener('keydown', trapFocus);
    document.documentElement.style.overflow = 'hidden';
    var toggle = overlay.querySelector('#gmc-analytics');
    if (toggle) toggle.focus();
  }

  function closePreferences() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.documentElement.style.overflow = '';
    if (location.hash === '#cookie-settings') {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
    }
    var target = banner ? banner.querySelector('[data-gmc="manage"]') : returnFocus;
    if (target && typeof target.focus === 'function') target.focus();
    returnFocus = null;
  }

  function trapFocus(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closePreferences();
      return;
    }
    if (e.key !== 'Tab') return;
    var focusable = overlay.querySelectorAll('button, input, a[href]');
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function showNotice() {
    if (notice || !document.body) return;
    notice = mount(
      '<div class="gmc-root gmc-notice" role="status">' +
        '<p><strong>Analytics are off.</strong> Your browser asked sites not to track you, so nothing about ' +
          'this visit is counted.</p>' +
        '<div class="gmc-notice-actions">' +
          '<button type="button" data-gmc="manage">Cookie settings</button>' +
          '<button type="button" data-gmc="dismiss">OK</button>' +
        '</div>' +
      '</div>'
    );
    // It stays until dismissed: for a visitor whose browser said no, this is
    // the only sign the site heard it, and it is shown just once.
    wire(notice);
  }

  function hideNotice() {
    if (!notice) return;
    notice.remove();
    notice = null;
  }

  // ── Start ─────────────────────────────────────────────────────────────────

  function boot() {
    injectStyles();

    // Delegated, because the footer and the app's More sheet are fetched in
    // after this runs.
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('[data-gm-cookie-settings], a[href="#cookie-settings"]');
      if (!trigger) return;
      e.preventDefault();
      // Close the app's More sheet first, so the dialog isn't stacked over it.
      if (trigger.closest('.gm-sheet')) {
        var backdrop = document.querySelector('.gm-sheet-backdrop');
        if (backdrop) backdrop.click();
      }
      openPreferences();
    });

    var consent = readConsent();
    if (!consent) {
      if (browserSaysNo()) {
        saveConsent(false, 'gpc');
        send('consent', { decision: 'rejected', source: 'gpc' });
        showNotice();
      } else {
        showBanner();
      }
    } else if (consent.analytics) {
      startTracking();
    }
    if (location.hash === '#cookie-settings') openPreferences();
  }

  window.GetmedsConsent = {
    open: openPreferences,
    get: function () {
      var consent = readConsent();
      return consent ? { analytics: consent.analytics, decidedAt: new Date(consent.at), source: consent.source } : null;
    },
    acceptAnalytics: function () { decide(true, 'settings'); },
    rejectAnalytics: function () { decide(false, 'settings'); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
