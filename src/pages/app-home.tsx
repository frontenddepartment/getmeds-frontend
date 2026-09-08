import React, { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../lib/useSanity';
import { injectHTML } from '../lib/injectHTML';
import { urlFor } from '../lib/sanity';

/**
 * app-home.tsx
 * ─────────────────────────────────────────────
 * The installed app's home screen. Deliberately NOT the website's homepage:
 * that page is a marketing story — hero carousel, statistics, CSR — which is
 * the right thing for a first-time visitor arriving from search, and the wrong
 * thing for someone who has installed the app and wants the catalogue.
 *
 * So this is catalogue-first: search, categories, a few featured products, and
 * the two actions that matter (order with a prescription, ask us something).
 *
 * No prices anywhere, and that is a decision rather than an omission — Getmeds
 * publishes none, much of the range is prescription-only, and advertising Rx
 * pricing to the public is not something to do casually. Cards show what is
 * actually known and useful: what it is, how strong, what form, whether it is
 * in stock, and whether it needs a prescription.
 */

interface Row {
  _id?: string;
  name?: string;
  brandName?: string;
  genericName?: string;
  strength?: string;
  form?: string;
  availability?: boolean;
  subCategory?: string;
  categoryFolder?: string;
  productPageUrl?: string;
  slug?: { current?: string };
  Prescription?: string;
  /** Attached in queries.ts by matching the sheet row to a Studio image link. */
  image?: { asset?: unknown };
}

/**
 * The catalogue rows already carry an image — fetchProductsFromExcel() joins
 * each row to the picture a person attached in the Studio. Rendering only text
 * was simply not asking for it.
 */
const productImage = (p: Row, size = 160) => {
  try {
    if (p.image && p.image.asset) return urlFor(p.image).width(size).height(size).url();
  } catch { /* fall through to the placeholder */ }
  return '/assets/no-image.png';
};

const displayName = (p: Row) =>
  p.brandName && p.genericName && p.brandName !== p.genericName
    ? `${p.brandName} (${p.genericName})`
    : p.name || p.brandName || p.genericName || 'Unnamed product';

/** Mirrors the products page: the sheet's own URL wins, else folder + slug. */
const productUrl = (p: Row) => {
  if (p.productPageUrl) {
    const path = p.productPageUrl.replace(/^https?:\/\//, '').replace(/^[^/]*/, '');
    return path || '/product-range';
  }
  return `/${p.categoryFolder || 'product-range'}/${p.slug?.current || ''}`;
};

const prettyFolder = (folder: string) =>
  folder.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const FOLDER_ICON: Record<string, string> = {
  'cancer-medicines': 'fa-ribbon',
  'blood-disorder-medicines': 'fa-droplet',
  'antibiotics': 'fa-shield-virus',
  'heart-medicines': 'fa-heart-pulse',
  'anemia-medicines': 'fa-droplet',
  'diabetes-medicines': 'fa-syringe',
  'bone-health-medicines': 'fa-bone',
  'allergy-medicines': 'fa-hand-dots',
  'pain-management': 'fa-pills',
  'kidney-medicines': 'fa-kit-medical',
  'brain-cancer-medicines': 'fa-brain',
  'hormonal-therapy': 'fa-flask',
  'contrast-media': 'fa-x-ray',
  'anti-inflammatory-medicines': 'fa-fire',
};

function ProductCard({ p }: { p: Row }) {
  const rx = String(p.Prescription || '').trim().toLowerCase();
  const needsRx = rx !== '' && rx !== 'no' && rx !== 'otc' && rx !== 'false';
  return (
    <a
      href={productUrl(p)}
      className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
    >
      <div className="flex gap-3">
        <div className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1.5">
          <img
            src={productImage(p)}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/no-image.png'; }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[14px] font-semibold leading-snug text-gray-900">{displayName(p)}</h3>
            {p.availability !== false && (
              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                In stock
              </span>
            )}
          </div>
          {(p.strength || p.form) && (
            <p className="mt-1.5 text-[12px] text-gray-500">
              {[p.strength, p.form].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        {needsRx ? (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
            <i className="fa-solid fa-file-prescription mr-1"></i>Prescription required
          </span>
        ) : <span />}
        <span
          className="rounded-full px-4 py-1.5 text-[12px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}
        >
          Inquire
        </span>
      </div>
    </a>
  );
}

export default function AppHome() {
  const { data: raw } = useProducts();
  const products = (raw || []) as Row[];
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Getmeds';
    const footer = document.getElementById('footer-container');
    if (footer && footer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then((r) => r.text())
        .then((html) => { injectHTML(footer, html); })
        .catch(() => { /* hidden in the app anyway */ });
    }
    // The navbar is deliberately not mounted: the tab bar is this screen's
    // navigation, and the drawer it normally hosts is reachable from "More"
    // on every other page.
  }, []);

  // Each tile borrows the first real photo in its folder, so the grid reads as
  // a catalogue rather than a list of icons. Folders whose products have no
  // image attached yet fall back to the icon.
  const categories = useMemo(() => {
    const acc = new Map<string, { count: number; image?: string }>();
    for (const p of products) {
      const f = (p.categoryFolder || '').trim();
      if (!f) continue;
      const cur = acc.get(f) || { count: 0 };
      cur.count += 1;
      if (!cur.image && p.image && p.image.asset) cur.image = productImage(p, 120);
      acc.set(f, cur);
    }
    return [...acc.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
  }, [products]);

  const featured = useMemo(
    () => products.filter((p) => p.availability !== false).slice(0, 3),
    [products]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    return products
      .filter((p) =>
        [p.name, p.brandName, p.genericName, p.subCategory, p.categoryFolder]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [query, products]);

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-lg" />
          <div>
            <p className="text-[15px] font-semibold leading-tight text-gray-900">Getmeds</p>
            <p className="text-[11.5px] text-gray-400">Your Compassionate Health Ally</p>
          </div>
        </div>

        <div className="relative mb-5">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-gray-400"></i>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand, generic name or condition"
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-[13.5px] outline-none focus:border-primary"
          />
        </div>

        {results ? (
          <section>
            <h2 className="mb-3 text-[13px] font-semibold text-gray-500">
              {results.length} result{results.length === 1 ? '' : 's'} for "{query.trim()}"
            </h2>
            <div className="space-y-3">
              {results.map((p, i) => <ProductCard key={p._id || i} p={p} />)}
            </div>
            {results.length === 0 && (
              <p className="py-10 text-center text-[13px] text-gray-400">
                Nothing matched. Try a generic name, or browse the categories below.
              </p>
            )}
          </section>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <a href="/order-medicines" className="rounded-2xl p-4 text-white" style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}>
                <i className="fa-solid fa-file-prescription text-lg"></i>
                <p className="mt-2 text-[13px] font-semibold leading-tight">Order with prescription</p>
              </a>
              <a href="/patient-assistance-program" className="rounded-2xl border border-gray-100 bg-white p-4">
                <i className="fa-solid fa-hand-holding-heart text-lg" style={{ color: '#61A644' }}></i>
                <p className="mt-2 text-[13px] font-semibold leading-tight text-gray-800">Patient Assistance</p>
              </a>
            </div>

            <section className="mb-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold text-gray-900">Categories</h2>
                <a href="/product-range" className="text-[12px] font-semibold" style={{ color: '#1D9FDA' }}>See all</a>
              </div>
              {categories.length === 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-[74px] animate-pulse rounded-2xl bg-gray-100" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {categories.map(([folder, info]) => (
                    <a key={folder} href={`/${folder}`} className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-white p-2 py-2.5">
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                        {info.image ? (
                          <img
                            src={info.image}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-contain p-0.5"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <i className={`fa-solid ${FOLDER_ICON[folder] || 'fa-pills'} text-[14px]`} style={{ color: '#1D9FDA' }}></i>
                        )}
                      </span>
                      <span className="text-center text-[9.5px] font-semibold leading-tight text-gray-600">
                        {prettyFolder(folder).replace(' Medicines', '')}
                      </span>
                      <span className="text-[9px] text-gray-400">{info.count}</span>
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold text-gray-900">Featured</h2>
                <a href="/product-range" className="text-[12px] font-semibold" style={{ color: '#1D9FDA' }}>Browse all</a>
              </div>
              {featured.length === 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-gray-100" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {featured.map((p, i) => <ProductCard key={p._id || i} p={p} />)}
                </div>
              )}
            </section>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
              Prescription medicines are dispensed only against a valid prescription
              from a licensed physician.
            </p>
          </>
        )}
      </main>

      <div id="footer-container"></div>
    </>
  );
}
