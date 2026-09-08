import React, { useCallback, useEffect, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { getApiUrl } from '../lib/api';
import { submitInquiry } from '../lib/offlineInquiry';
import { Turnstile, useTurnstile } from '../lib/turnstile';
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
 * The request list, and the inquiry it turns into.
 *
 * "Cart" is the familiar name and the familiar position, but this is a request
 * list: Getmeds publishes no prices and much of the range is prescription-only,
 * so there is no checkout to reach. Finishing here sends the whole list as ONE
 * inquiry, through the same endpoint every other form on the site uses, into
 * the same Product Inquiry spreadsheet — the backend writes one row per
 * product with these contact details repeated on each, so the team can work
 * them the way they work every other lead.
 *
 * That is the real gain over the website, where a visitor can only ask about
 * one product at a time.
 */

type Step = 'list' | 'form' | 'done';

export default function Cart() {
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [consented, setConsented] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('list');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [queued, setQueued] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });

  const turnstile = useTurnstile(step === 'form');

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
        .then((r) => r.text()).then((html) => { injectHTML(nav, html); })
        .catch(() => { /* offline: the tab bar is still the way around */ });
    }
    const footer = document.getElementById('footer-container');
    if (footer && footer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then((r) => r.text()).then((html) => { injectHTML(footer, html); })
        .catch(() => { /* hidden in the installed app anyway */ });
    }
    return () => window.removeEventListener(CART_CHANGED_EVENT, refresh);
  }, [refresh]);

  const wipe = async () => {
    if (!window.confirm('Remove everything Getmeds has saved on this device? This clears your list and any inquiry waiting to be sent.')) return;
    await clearAllDeviceData();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items || items.length === 0) return;
    setError('');
    setSending(true);

    try {
      const lines = items.map((it) =>
        `• ${it.name}${[it.strength, it.form].filter(Boolean).length ? ` (${[it.strength, it.form].filter(Boolean).join(' · ')})` : ''}${it.needsRx ? ' — prescription required' : ''}`
      );

      const payload = {
        // The existing type, so it lands in the Product Inquiry sheet the team
        // already works rather than a new one nobody is watching.
        inquiryType: 'Product Inquiry',
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.company,
        // The email body should be readable on its own, so the list is spelled
        // out here as well as sent structurally below.
        message:
          `Request for a quote on ${items.length} product${items.length === 1 ? '' : 's'}:\n\n` +
          lines.join('\n') +
          (form.message.trim() ? `\n\nNotes:\n${form.message.trim()}` : ''),
        turnstileToken: turnstile.token,
        additionalData: {
          company: form.company,
          customerType: 'App request list',
          // The backend turns this into one spreadsheet row per product.
          items: items.map((it) => ({
            name: it.name,
            strength: it.strength || '',
            form: it.form || '',
            url: it.url,
            needsRx: Boolean(it.needsRx),
          })),
        },
        files: [],
      };

      const result = await submitInquiry(payload, { endpoint: getApiUrl(), returnPath: '/cart' });
      turnstile.reset();

      if (result.status === 'failed') { setError(result.error); return; }

      // Sent or safely queued — either way the request is recorded, so the list
      // should not sit there inviting a second submission of the same thing.
      setQueued(result.status === 'queued');
      await clearCart();
      setStep('done');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const empty = items !== null && items.length === 0;
  const field = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[13.5px] outline-none focus:border-primary';

  return (
    <>
      <div id="navbar-container"></div>

      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col px-6 pb-16 pt-28">
        {step === 'done' ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <i className="fa-solid fa-check text-2xl text-green-600"></i>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {queued ? 'Saved — we’ll send it shortly' : 'Request sent'}
            </h1>
            <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-gray-500">
              {queued
                ? 'You were offline, so your request is saved on this device and will be sent automatically as soon as you have a connection.'
                : 'Our team will get back to you with availability and pricing. Prescription items still need a valid prescription.'}
            </p>
            <a href="/product-range" className="mt-6 rounded-full px-7 py-3 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}>
              Keep browsing
            </a>
          </div>
        ) : step === 'form' ? (
          <>
            <button type="button" onClick={() => setStep('list')} className="mb-4 self-start text-[13px] font-semibold text-gray-400">
              <i className="fa-solid fa-chevron-left mr-1.5 text-[11px]"></i>Back to list
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Request a quote</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              For {items?.length} product{items?.length === 1 ? '' : 's'}. We&apos;ll reply with availability and pricing.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <input required className={field} placeholder="Your name *" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={field} placeholder="Company or hospital (optional)" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })} />
              <input required type="email" className={field} placeholder="Email *" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required className={field} placeholder="Mobile number *" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea rows={3} className={`${field} resize-none`} placeholder="Anything else we should know? (optional)"
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />

              <Turnstile turnstile={turnstile} />

              {error && <p className="text-[12.5px] text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={sending || (turnstile.enabled && !turnstile.token)}
                className="w-full rounded-full py-3.5 text-[14px] font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}
              >
                {sending ? 'Sending…' : `Send request for ${items?.length} item${items?.length === 1 ? '' : 's'}`}
              </button>
              <p className="pt-1 text-center text-[11px] text-gray-400">
                By submitting, you agree to our <a href="/policy" className="underline">Privacy Policy</a>.
              </p>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Your request list</h1>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  Add medicines you want a quote for, then send them to us in one request.
                </p>
              </div>
              {items && items.length > 0 && (
                <button type="button" onClick={() => clearCart()} className="shrink-0 text-[12px] font-semibold text-gray-400 hover:text-gray-600">
                  Clear list
                </button>
              )}
            </div>

            {items === null ? (
              <div className="mt-8 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-gray-100" />)}
              </div>
            ) : empty ? (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: 'linear-gradient(135deg,#eaf6fd,#eef7ea)' }}>
                  <i className="fa-solid fa-cart-shopping text-2xl" style={{ color: '#1D9FDA' }}></i>
                </div>
                <h2 className="text-base font-semibold text-gray-800">Nothing saved yet</h2>
                <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-gray-500">
                  Browse the catalogue and tap the cart icon on any medicine. We&apos;ll reply with
                  availability and pricing — prescription items still need a valid prescription.
                </p>
                <a href="/product-range" className="mt-6 rounded-full px-7 py-3 text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}>
                  Browse products
                </a>
              </div>
            ) : (
              <>
                <ul className="mt-6 space-y-3">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                      <div className="min-w-0 flex-1">
                        <a href={it.url} className="block text-[14px] font-semibold leading-snug text-gray-900">{it.name}</a>
                        {(it.strength || it.form) && (
                          <p className="mt-1 text-[12px] text-gray-500">{[it.strength, it.form].filter(Boolean).join(' · ')}</p>
                        )}
                        {it.needsRx && (
                          <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                            <i className="fa-solid fa-file-prescription mr-1"></i>Prescription required
                          </span>
                        )}
                      </div>
                      <button type="button" onClick={() => removeFromCart(it.id)} aria-label={`Remove ${it.name}`}
                        className="shrink-0 rounded-full p-2 text-gray-300 hover:text-red-500">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="mt-6 w-full rounded-full py-3.5 text-[14px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}
                >
                  Request a quote for {items.length} item{items.length === 1 ? '' : 's'}
                </button>
              </>
            )}

            <div className="mt-10 border-t border-gray-100 pt-4">
              <p className="text-[11.5px] leading-relaxed text-gray-400">
                {consented
                  ? 'Your list is saved on this device only. It is not sent to us until you request a quote, and it will not appear on your other devices.'
                  : 'Nothing is saved on this device yet. You will be asked before anything is stored.'}
              </p>
              <button type="button" onClick={wipe} className="mt-3 text-[12px] font-semibold text-gray-400 underline hover:text-gray-600">
                Clear saved data on this device
              </button>
            </div>
          </>
        )}
      </main>

      <div id="footer-container"></div>
    </>
  );
}
