import React, { useEffect } from 'react';
import { injectHTML } from '../lib/injectHTML';

/**
 * cart.tsx
 * ─────────────────────────────────────────────
 * The Cart tab's destination.
 *
 * "Cart" is the familiar name and the familiar position, but this is a request
 * list, not a shopping basket: Getmeds publishes no prices and much of the
 * range is prescription-only, so there is no checkout to reach. Finishing here
 * means sending the whole list as one inquiry and the team replying with a
 * quote — which is a genuine gain on today's site, where a visitor can only
 * ask about one product at a time.
 *
 * This is the empty state. Adding to the list, the badge count and the quote
 * submission come next; the page exists now so the middle tab is not a 404.
 */
export default function Cart() {
  useEffect(() => {
    document.title = 'Your Request List | Getmeds';

    const nav = document.getElementById('navbar-container');
    if (nav && nav.innerHTML.trim() === '') {
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(nav, html); })
        .catch(() => { /* offline: the tab bar is still the way around */ });
    }

    const footer = document.getElementById('footer-container');
    if (footer && footer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(footer, html); })
        .catch(() => { /* hidden in the installed app anyway */ });
    }
  }, []);

  return (
    <>
      <div id="navbar-container"></div>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16 min-h-[70vh] flex flex-col">
        <h1 className="text-2xl font-semibold text-gray-900">Your request list</h1>
        <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
          Add medicines you want a quote for, then send them to us in one request.
        </p>

        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,#eaf6fd,#eef7ea)' }}
          >
            <i className="fa-solid fa-cart-shopping text-2xl" style={{ color: '#1D9FDA' }}></i>
          </div>
          <h2 className="text-base font-semibold text-gray-800">Nothing saved yet</h2>
          <p className="text-gray-500 text-[13.5px] mt-2 max-w-sm leading-relaxed">
            Browse the catalogue and add the medicines you need. We'll reply with availability
            and pricing — prescription items still need a valid prescription.
          </p>
          <a
            href="/product-range"
            className="mt-6 text-white text-sm font-semibold rounded-full px-7 py-3"
            style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}
          >
            Browse products
          </a>
        </div>

        <p className="text-[11.5px] text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
          Your list is saved on this device only. It is not sent to us until you request a quote,
          and it will not appear on your other devices.
        </p>
      </main>

      <div id="footer-container"></div>
    </>
  );
}
