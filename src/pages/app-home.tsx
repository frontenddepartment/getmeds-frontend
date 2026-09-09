import React, { useEffect, useMemo, useState } from 'react';
import { useProducts } from '../lib/useSanity';
import { injectHTML } from '../lib/injectHTML';
import { AddToCart } from '../lib/AddToCart';
import { CART_CHANGED_EVENT, countCart } from '../lib/cart';
import {
  CatalogueRow,
  cartItemFor,
  displayName,
  prettyFolder,
  productImage,
  productUrl,
  rxRequired,
  specLine,
} from '../lib/catalogueItem';

/**
 * app-home.tsx
 * ─────────────────────────────────────────────
 * The installed app's home screen. Deliberately NOT the website's homepage:
 * that page is a marketing story — hero carousel, statistics, CSR — which is
 * the right thing for a first-time visitor arriving from search, and the wrong
 * thing for someone who has installed the app and wants the catalogue.
 *
 * So this is catalogue-first: a way into search, the categories, featured
 * products, and the errand most people actually arrive with.
 *
 * ── On the visual language ──
 * Laid out as a native storefront rather than a web page: a tinted ground with
 * white cards floating on it, a pill search bar, circular category tiles and a
 * two-up product grid. The tint is what does the work — on a flat white page a
 * white card is invisible, so every section needs a border to exist, and a
 * screen full of hairline boxes is most of what makes a PWA read as a website
 * in a frame.
 *
 * ── On the search bar ──
 * It is a link, not an input. Searching gets its own screen (see search.tsx)
 * the way it does in an app store, so this bar only has to look like a search
 * bar and hand over. Filtering in place here would mean a second, lesser copy
 * of the search UI competing with the real one.
 *
 * No prices anywhere — see the note in lib/catalogueItem.tsx, which is also
 * where naming, linking and the spec line now live.
 */

/**
 * The tinted ground everything else sits on.
 *
 * Also hard-coded on <body> in app-home.html, which is the copy that actually
 * paints the background — it has to be there to survive the gap before
 * hydration. This constant is for the elements that must colour-match it: the
 * sticky header, which would otherwise show a seam, and the ring around the
 * cart badge, which fakes a cut-out.
 */
const GROUND = '#F3F6FB';
const BRAND = '#1D9FDA';
const CARD_SHADOW = '0 2px 10px rgba(23,43,77,.055)';

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

/**
 * The two-up grid card. Image on top the way a storefront card reads, because
 * a medicine box is recognisable at a glance in a way its name often is not —
 * people recognise the packaging of something they have taken for months.
 */
function ProductCard({ p }: { p: CatalogueRow }) {
  const needsRx = rxRequired(p);
  return (
    <a
      href={productUrl(p)}
      className="group flex flex-col overflow-hidden rounded-[18px] bg-white transition active:scale-[0.985]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="relative aspect-square w-full bg-[#F6F8FC] p-3">
        <img
          src={productImage(p)}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain mix-blend-multiply"
          onError={(e) => { const i = e.currentTarget; i.onerror = null; i.src = '/assets/no-image.png'; }}
        />
        {needsRx && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-50 px-2 py-[3px] text-[9.5px] font-bold uppercase tracking-wide text-amber-700">
            Rx
          </span>
        )}
        {p.availability !== false && (
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-[3px] text-[9.5px] font-bold text-green-700 backdrop-blur">
            In stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 pt-2.5">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900">
          {displayName(p)}
        </h3>
        <p className="mt-1 line-clamp-1 text-[11px] text-gray-400">{specLine(p)}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className="text-[11.5px] font-semibold" style={{ color: BRAND }}>
            Inquire
          </span>
          <AddToCart item={cartItemFor(p)} />
        </div>
      </div>
    </a>
  );
}

function SectionHeading({ title, href, cta = 'See all' }: { title: string; href: string; cta?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[17px] font-bold tracking-tight text-gray-900">{title}</h2>
      <a href={href} className="text-[12px] font-semibold" style={{ color: BRAND }}>{cta}</a>
    </div>
  );
}

export default function AppHome() {
  const { data: raw } = useProducts();
  const products = (raw || []) as CatalogueRow[];
  const [cartCount, setCartCount] = useState(0);

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

  // The header cart badge. Same source of truth as the tab bar's, just read
  // through the typed helper rather than raw IndexedDB, because this screen
  // already bundles cart.ts for AddToCart.
  useEffect(() => {
    const paint = () => { countCart().then(setCartCount).catch(() => setCartCount(0)); };
    paint();
    window.addEventListener(CART_CHANGED_EVENT, paint);
    return () => window.removeEventListener(CART_CHANGED_EVENT, paint);
  }, []);

  // Each tile borrows the first real photo in its folder, so the strip reads as
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
    return [...acc.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 10);
  }, [products]);

  const featured = useMemo(
    () => products.filter((p) => p.availability !== false).slice(0, 6),
    [products]
  );

  return (
    <>
      <style>{`
        .gm-hscroll { -ms-overflow-style: none; scrollbar-width: none; }
        .gm-hscroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Sticky because this row is the only way back to the whole catalogue —
          scrolling six product cards deep should not mean scrolling back up to
          look something up. */}
      <header
        className="sticky top-0 z-40 px-4 pb-3 pt-4"
        style={{ background: GROUND, boxShadow: '0 6px 12px -10px rgba(23,43,77,.35)' }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2.5">
          {/* The camera is a sibling of the search link rather than a child of
              it: one anchor cannot live inside another, and these are two
              genuinely different destinations. */}
          <div className="relative flex-1">
            <a
              href="/search"
              className="flex h-[46px] w-full items-center rounded-full bg-white pl-11 pr-12 text-[13.5px] text-gray-400"
              style={{ boxShadow: CARD_SHADOW }}
            >
              Search medicine
            </a>
            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-gray-400" />
            {/* A visual-search shortcut in spirit: there is no image search to
                point it at, but there is something better — photograph the
                prescription and let a person read it. */}
            <a
              href="/order-medicines"
              aria-label="Send a photo of your prescription"
              title="Send a photo of your prescription"
              className="absolute right-1.5 top-1/2 flex h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-[#F1F6FC]"
            >
              <i className="fa-solid fa-camera text-[13px]" style={{ color: BRAND }} />
            </a>
          </div>

          <a
            href="/cart"
            aria-label={`Request list, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-white"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <i className="fa-solid fa-cart-shopping text-[15px] text-gray-700" />
            {cartCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ background: BRAND, boxShadow: `0 0 0 2px ${GROUND}` }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-2">
        {/* A storefront puts an offer in this slot; this one puts the errand
            people actually arrive with, because the app's whole job is turning
            a prescription into a quote. */}
        <a
          href="/order-medicines"
          className="relative mb-6 mt-1 block overflow-hidden rounded-[20px] p-5 text-white"
          style={{ background: 'linear-gradient(118deg,#1D9FDA 0%,#2F8FD6 52%,#61A644 165%)' }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-10 h-32 w-32 rounded-full bg-white/[0.07]"
          />
          <i
            aria-hidden="true"
            className="fa-solid fa-file-prescription pointer-events-none absolute -right-1 bottom-1 text-[86px] text-white/20"
          />
          <div className="relative max-w-[64%]">
            <p className="text-[19px] font-extrabold leading-tight">Have a prescription?</p>
            <p className="mt-1.5 text-[12.5px] leading-snug text-white/85">
              Send us a photo and we&rsquo;ll come back to you with availability.
            </p>
            <span
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-bold"
              style={{ color: BRAND }}
            >
              Upload now <i className="fa-solid fa-arrow-right text-[10px]" />
            </span>
          </div>
        </a>

        <section className="mb-6">
          <SectionHeading title="Categories" href="/product-range" />
          {categories.length === 0 ? (
            <div className="gm-hscroll flex gap-4 overflow-x-auto pb-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0">
                  <div className="h-[62px] w-[62px] animate-pulse rounded-full bg-white" />
                  <div className="mx-auto mt-2 h-2 w-12 animate-pulse rounded-full bg-white" />
                </div>
              ))}
            </div>
          ) : (
            // Horizontal, not a grid: the folder list grows as the catalogue
            // does, and a scroll strip absorbs that without pushing the
            // products below the fold.
            <div className="gm-hscroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
              {categories.map(([folder, info]) => (
                <a key={folder} href={`/${folder}`} className="flex w-[68px] shrink-0 flex-col items-center gap-2">
                  <span
                    className="flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-full bg-white"
                    style={{ boxShadow: CARD_SHADOW }}
                  >
                    {info.image ? (
                      <img
                        src={info.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-2.5 mix-blend-multiply"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <i className={`fa-solid ${FOLDER_ICON[folder] || 'fa-pills'} text-[19px]`} style={{ color: BRAND }} />
                    )}
                  </span>
                  <span className="text-center text-[10px] font-semibold leading-tight text-gray-600">
                    {prettyFolder(folder).replace(' Medicines', '')}
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <SectionHeading title="Featured products" href="/product-range" cta="Browse all" />
          {featured.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[230px] animate-pulse rounded-[18px] bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {featured.map((p, i) => <ProductCard key={p._id || i} p={p} />)}
            </div>
          )}
        </section>

        {/* Below the catalogue rather than above it: a real programme people
            come looking for, but not what most sessions are for.

            The programme's own logo rather than a generic icon — it is a
            named thing with its own identity that people are told to ask for
            by name, and the mark is what they will have been shown. It also
            carries the words "Patient Assistance Program" itself, so a
            separate heading would only say it twice; the name lives in alt
            text instead, where a screen reader still reads it out. */}
        <a
          href="/patient-assistance-program"
          className="mb-5 flex items-center gap-3.5 rounded-[18px] bg-white p-4"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <img
            src="/assets/pap-logo-sm.png"
            alt="Patient Assistance Program"
            loading="lazy"
            width={400}
            height={183}
            className="h-[46px] w-auto shrink-0"
          />
          <span className="min-w-0 flex-1 text-[11.5px] leading-snug text-gray-500">
            Support programmes for long-course treatment
          </span>
          <i className="fa-solid fa-chevron-right shrink-0 text-[12px] text-gray-300" />
        </a>

        <p className="mb-2 text-center text-[11px] leading-relaxed text-gray-400">
          Prescription medicines are dispensed only against a valid prescription
          from a licensed physician.
        </p>
      </main>

      <div id="footer-container"></div>
    </>
  );
}
