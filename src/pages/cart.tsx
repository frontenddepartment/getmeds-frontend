import React, { useCallback, useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import {
  CART_CHANGED_EVENT,
  clearAllDeviceData,
  clearCart,
  hasConsent,
  listCart,
  removeFromCart,
  type CartItem,
} from '../lib/cart';

/**
 * cart.tsx
 * ─────────────────────────────────────────────
 * The Cart tab's destination.
 *
 * "Cart" is the familiar name and the familiar position, but this is a request
 * list, not a shopping basket: Getmeds publishes no prices and much of the
 * range is prescription-only, so there is no checkout to reach. Finishing here
 * means sending the whole list as one inquiry and the team replying with a
 * quote — a real gain on today's site, where a visitor can only ask about one
 * product at a time. That submission is the next piece of work; this page owns
 * the list itself.
 */
export default function Cart() {
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [consented, setConsented] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    setItems(await listCart());
    setConsented(await hasConsent());
  }, []);

  useEffect(() => {
    document.title = 'Your Request List | Getmeds';
    refresh();
    window.addEventListener(CART_CHANGED_EVENT, refresh);

    const nav = document.getElementById('navbar-container');
    if (nav && nav.innerHTML.trim() === '') {
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then((r) => r.text())
        .then((html) => { injectHTML(nav, html); })
        .catch(() => { /* offline: the tab bar is still the way around */ });
    }
    const footer = document.getElementById('footer-container');
    if (footer && footer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then((r) => r.text())
        .then((html) => { injectHTML(footer, html); })
        .catch(() => { /* hidden in the installed app anyway */ });
    }

    return () => window.removeEventListener(CART_CHANGED_EVENT, refresh);
  }, [refresh]);

  const wipe = async () => {
    if (!window.confirm('Remove everything Getmeds has saved on this device? This clears your list and any inquiry waiting to be sent.')) return;
    await clearAllDeviceData();
  };

  const empty = items !== null && items.length === 0;

  return (
    <>
      <div id="navbar-container"></div>

      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col px-6 pb-16 pt-28">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Your request list</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
              Add medicines you want a quote for, then send them to us in one request.
            </p>
          </div>
          {items && items.length > 0 && (
            <button
              type="button"
              onClick={() => clearCart()}
              className="shrink-0 text-[12px] font-semibold text-gray-400 hover:text-gray-600"
            >
              Clear list
            </button>
          )}
        </div>

        {items === null ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : empty ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg,#eaf6fd,#eef7ea)' }}
            >
              <i className="fa-solid fa-cart-shopping text-2xl" style={{ color: '#1D9FDA' }}></i>
            </div>
            <h2 className="text-base font-semibold text-gray-800">Nothing saved yet</h2>
            <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-gray-500">
              Browse the catalogue and tap the cart icon on any medicine. We'll reply with
              availability and pricing — prescription items still need a valid prescription.
            </p>
            <a
              href="/product-range"
              className="mt-6 rounded-full px-7 py-3 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}
            >
              Browse products
            </a>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((it) => (
              <li key={it.id} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <a href={it.url} className="block text-[14px] font-semibold leading-snug text-gray-900">
                    {it.name}
                  </a>
                  {(it.strength || it.form) && (
                    <p className="mt-1 text-[12px] text-gray-500">
                      {[it.strength, it.form].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {it.needsRx && (
                    <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                      <i className="fa-solid fa-file-prescription mr-1"></i>Prescription required
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(it.id)}
                  aria-label={`Remove ${it.name}`}
                  className="shrink-0 rounded-full p-2 text-gray-300 hover:text-red-500"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 border-t border-gray-100 pt-4">
          <p className="text-[11.5px] leading-relaxed text-gray-400">
            {consented
              ? 'Your list is saved on this device only. It is not sent to us until you request a quote, and it will not appear on your other devices.'
              : 'Nothing is saved on this device yet. You will be asked before anything is stored.'}
          </p>
          <button
            type="button"
            onClick={wipe}
            className="mt-3 text-[12px] font-semibold text-gray-400 underline hover:text-gray-600"
          >
            Clear saved data on this device
          </button>
        </div>
      </main>

      <div id="footer-container"></div>
    </>
  );
}
