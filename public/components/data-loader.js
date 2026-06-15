/**
 * Getmeds Data Loader
 * Fetches page-specific JSON from /data/ and binds values to DOM elements.
 *
 * HTML attribute API:
 *   data-json="key.path"             → sets element.textContent
 *   data-json-src="key.path"         → sets img.src
 *   data-json-alt="key.path"         → sets img.alt
 *   data-json-placeholder="key.path" → sets input/textarea.placeholder
 *   data-json-href="key.path"        → sets a.href
 */
(function () {
  'use strict';

  const PAGE_MAP = {
    '': 'home',
    'index': 'home',
    'home': 'home',
    'about-us': 'about',
    'services': 'services',
    'contact-us': 'contact',
    'meditations': 'meditations',
    'careers': 'careers',
    'global-presence': 'global-presence',
    'csr': 'csr',
    'ungc': 'ungc',
    'order-medicines': 'order-medicines',
    'pap': 'pap',
    'product-range': 'products'
  };

  function resolvePath(obj, path) {
    if (!path || obj == null) return null;
    return path.replace(/\[(\d+)\]/g, '.$1').split('.').reduce(function (cur, key) {
      return cur != null && cur[key] !== undefined ? cur[key] : null;
    }, obj);
  }

  function applyData(data) {
    document.querySelectorAll('[data-json]').forEach(function (el) {
      var val = resolvePath(data, el.getAttribute('data-json'));
      if (val !== null && typeof val === 'string') el.textContent = val;
    });

    document.querySelectorAll('[data-json-src]').forEach(function (el) {
      var val = resolvePath(data, el.getAttribute('data-json-src'));
      if (val) el.src = val;
    });

    document.querySelectorAll('[data-json-alt]').forEach(function (el) {
      var val = resolvePath(data, el.getAttribute('data-json-alt'));
      if (val) el.alt = val;
    });

    document.querySelectorAll('[data-json-placeholder]').forEach(function (el) {
      var val = resolvePath(data, el.getAttribute('data-json-placeholder'));
      if (val) el.placeholder = val;
    });

    document.querySelectorAll('[data-json-href]').forEach(function (el) {
      var val = resolvePath(data, el.getAttribute('data-json-href'));
      if (val) el.href = val;
    });
  }

  function init() {
    var pageName = (window.location.pathname.split('/').pop() || '').replace('.html', '');
    var dataKey = PAGE_MAP[pageName];
    if (!dataKey) return;

    fetch('data/' + dataKey + '.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(applyData)
      .catch(function (err) { console.warn('[Getmeds DataLoader]', err); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
