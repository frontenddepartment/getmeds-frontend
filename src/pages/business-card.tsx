import React, { useEffect, useMemo, useState } from 'react';
import { urlFor } from '../lib/sanity';
import {
  CARD_PATH_PREFIX,
  downloadVCard,
  formatPhone,
  getBusinessCardBySlug,
  telLink,
  toE164,
  viberLink,
  viberNumber,
  whatsappLink,
  whatsappNumber,
  type BusinessCard,
} from '../lib/businessCard';

/**
 * business-card.tsx
 * ─────────────────────────────────────────────
 * What the QR code on a printed Getmeds business card opens.
 *
 * ── Who this page is for ──
 * Almost never an app user. A business card is handed over in a meeting, and
 * the other person scans it with whatever their phone's camera app is — so
 * this has to be an ordinary public web page that stands on its own, not a
 * screen inside the installed app. It gets the tab bar when opened from the
 * app, from the shell injector, and works perfectly well without it.
 *
 * They have the physical card in their hand as they look at this. So the
 * screen leads with the card itself — the same artwork, recognisably the thing
 * they are holding — and everything below it exists to do the one thing the
 * cardboard cannot: put the number somewhere they will still have it next
 * month.
 *
 * ── Why three buttons and not one ──
 * "Save to contacts" is the complete answer and also the one most people skip,
 * because the message they actually want to send is a WhatsApp or Viber one
 * and they will look the person up later, or never. Offering the two messaging
 * apps directly is not clutter; it is the difference between a card that gets
 * used and a card that gets photographed and forgotten.
 *
 * ── noindex ──
 * These pages carry named staff members' mobile numbers. They are meant to be
 * reachable by anyone holding the card and by nobody running a search, which
 * is a distinction only the robots meta can draw. Also set in the HTML shell,
 * which is the copy crawlers actually read.
 */

const BRAND = '#1D9FDA';
const BRAND_GREEN = '#61A644';
const GROUND = '#F3F6FB';
const CARD_SHADOW = '0 2px 10px rgba(23,43,77,.055)';

/** The slug is in the path, because the QR code is a path: /card/juan-dela-cruz */
function slugFromLocation(): string {
  const path = window.location.pathname.replace(/\.html$/, '');
  if (path.startsWith(CARD_PATH_PREFIX)) {
    const rest = path.slice(CARD_PATH_PREFIX.length).replace(/\/+$/, '');
    if (rest && !rest.includes('/')) return decodeURIComponent(rest);
  }
  // Direct hits on /business-card during development, and the shape Vercel
  // would fall back to if the /card/:slug rewrite were ever removed.
  const q = new URLSearchParams(window.location.search).get('card');
  return q ? q.trim() : '';
}

function ActionButton({
  href,
  onClick,
  icon,
  label,
  sub,
  background,
  color = '#FFFFFF',
}: {
  href?: string;
  onClick?: () => void;
  icon: string;
  label: string;
  sub?: string;
  background: string;
  color?: string;
}) {
  const inner = (
    <>
      <span
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,.18)' }}
      >
        <i className={`${icon} text-[17px]`} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[14px] font-semibold leading-tight">{label}</span>
        {sub && <span className="mt-0.5 block text-[11.5px] leading-tight opacity-80">{sub}</span>}
      </span>
      <i className="fa-solid fa-chevron-right shrink-0 text-[12px] opacity-60" />
    </>
  );

  const className =
    'flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 transition active:scale-[0.985]';
  const style = { background, color, boxShadow: CARD_SHADOW };

  if (href) {
    return (
      <a href={href} className={className} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} style={style}>
      {inner}
    </button>
  );
}

/**
 * One face of the printed card.
 *
 * Pulled out because the desktop layout shows front and back at once while the
 * phone shows one at a time behind a toggle — same markup, two different
 * visibility rules, and duplicating the <img> would mean a second copy to keep
 * in step.
 */
function CardFace({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[18px] bg-white ${className}`}
      style={{ boxShadow: '0 6px 24px rgba(23,43,77,.12)' }}
    >
      <img
        src={src}
        alt={alt}
        className="block w-full"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

/** A row in the "details" card — tappable where the value is dialable. */
function DetailRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const body = (
    <>
      <i className={`${icon} w-[18px] shrink-0 text-center text-[13px]`} style={{ color: BRAND }} />
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] uppercase tracking-wide text-gray-400">{label}</span>
        <span className="block truncate text-[13.5px] text-gray-800">{value}</span>
      </span>
      {href && <i className="fa-solid fa-arrow-up-right-from-square shrink-0 text-[11px] text-gray-300" />}
    </>
  );
  const cls = 'flex items-center gap-3 px-4 py-3';
  return href ? (
    <a href={href} className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default function BusinessCardPage() {
  const slug = useMemo(slugFromLocation, []);
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [face, setFace] = useState<'front' | 'back'>('front');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!slug) {
      setState('missing');
      return;
    }
    let cancelled = false;
    getBusinessCardBySlug(slug)
      .then((found) => {
        if (cancelled) return;
        if (!found) {
          setState('missing');
          return;
        }
        setCard(found);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (card) document.title = `${card.fullName} | Getmeds`;
  }, [card]);

  const cardUrl = useMemo(
    () => (slug ? `${window.location.origin}${CARD_PATH_PREFIX}${slug}` : ''),
    [slug]
  );

  const save = () => {
    if (!card) return;
    downloadVCard(card, cardUrl);
    setSaved(true);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <main className="mx-auto max-w-md px-4 pb-10 pt-6">
        <div className="mb-5 aspect-[1.75/1] w-full animate-pulse rounded-[18px] bg-white" />
        <div className="mx-auto mb-2 h-4 w-40 animate-pulse rounded-full bg-white" />
        <div className="mx-auto mb-7 h-3 w-28 animate-pulse rounded-full bg-white" />
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[66px] animate-pulse rounded-[16px] bg-white" />
          ))}
        </div>
      </main>
    );
  }

  // ── Not found, withdrawn, or a broken link ────────────────────────────────
  if (state !== 'ready' || !card) {
    const isError = state === 'error';
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <span
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: '#FFF1F0' }}
        >
          <i className={`fa-solid ${isError ? 'fa-wifi' : 'fa-id-card'} text-[22px] text-[#E5484D]`} />
        </span>
        <h1 className="text-[19px] font-semibold text-gray-900">
          {isError ? 'Could not load this card' : 'Card not found'}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
          {isError
            ? 'Something went wrong reaching Getmeds. Check your connection and try again.'
            : 'This business card link is no longer active. The person it belonged to may have left Getmeds, or the code may have been mistyped.'}
        </p>
        <div className="mt-6 flex flex-col gap-2.5 self-stretch">
          {isError && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full px-5 py-3 text-[13px] font-semibold text-white"
              style={{ background: BRAND }}
            >
              Try again
            </button>
          )}
          <a
            href="/contact-us"
            className="rounded-full bg-white px-5 py-3 text-[13px] font-semibold"
            style={{ color: BRAND, boxShadow: CARD_SHADOW }}
          >
            Contact Getmeds
          </a>
        </div>
      </main>
    );
  }

  // ── A card that has been deactivated ──────────────────────────────────────
  // Deliberately not the same screen as "not found": the difference matters to
  // whoever is holding the card, and it is the entire reason a printed card
  // carries a link rather than a number.
  if (card.active === false) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <span
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: '#FFF8E6' }}
        >
          <i className="fa-solid fa-user-slash text-[22px] text-[#B88217]" />
        </span>
        <h1 className="text-[19px] font-semibold text-gray-900">{card.fullName}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
          is no longer with Getmeds. For anything this card was about, our team can pick it up from
          here.
        </p>
        <a
          href="/contact-us"
          className="mt-6 self-stretch rounded-full px-5 py-3 text-[13px] font-semibold text-white"
          style={{ background: BRAND }}
        >
          Contact Getmeds
        </a>
      </main>
    );
  }

  const front = card.cardImage ? urlFor(card.cardImage).width(1000).url() : '';
  const back = card.cardImageBack ? urlFor(card.cardImageBack).width(1000).url() : '';

  const mobile = toE164(card.mobile);
  const office = toE164(card.officePhone);
  const wa = whatsappLink(card);
  const viber = viberLink(card);

  return (
    /*
      One column on a phone, two from `lg` up: the card on the left, everything
      you can do with it on the right.

      A phone is the overwhelmingly common case here — somebody scans a QR code
      with the camera they are already holding — so that layout is the one left
      untouched, and the desktop rules are all `lg:` additions on top of it. On a
      wide screen the single column was the problem: the card rendered at
      tablet-poster size and pushed the Save and messaging buttons, which are the
      entire point of the page, below the fold.
    */
    <main className="mx-auto max-w-md px-4 pb-10 pt-5 lg:max-w-4xl lg:px-8 lg:pt-10">
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        {/* ── Left: the card artwork ──
            Whoever is looking at this is holding the paper version, so matching
            it is what makes the page read as "this card" rather than "a Getmeds
            page".

            Desktop shows both faces stacked; the phone shows one at a time
            behind the toggle below. A desktop window has the room, and two
            images side by side answer "what is on the back?" without asking
            anyone to find a control and click it. */}
        {front && (
          <div className="mb-4 lg:mb-0">
            <CardFace
              src={front}
              alt={`Business card for ${card.fullName}`}
              className={face === 'front' ? '' : 'hidden lg:block'}
            />

            {back && (
              <CardFace
                src={back}
                alt={`Back of the business card for ${card.fullName}`}
                /* The top margin is desktop-only: on a phone this sits alone
                   where the front was, with the same spacing as before. */
                className={`lg:mt-4 ${face === 'back' ? '' : 'hidden lg:block'}`}
              />
            )}

            {/* Nothing to toggle between once both are on screen. */}
            {back && (
              <div className="mt-3 flex justify-center gap-1.5 lg:hidden">
                {(['front', 'back'] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setFace(side)}
                    className="rounded-full px-4 py-1.5 text-[11.5px] font-semibold capitalize transition"
                    style={
                      face === side
                        ? { background: BRAND, color: '#fff' }
                        : { background: '#fff', color: '#6B7280', boxShadow: CARD_SHADOW }
                    }
                  >
                    {side}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Right: who they are, and what you can do about it ── */}
        <div>
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-gray-900">
          {card.fullName}
        </h1>
        {card.jobTitle && <p className="mt-1 text-[13px] text-gray-500">{card.jobTitle}</p>}
        {card.company && (
          <p className="mt-0.5 text-[12px] font-medium" style={{ color: BRAND }}>
            {card.company}
          </p>
        )}
      </div>

      {/* Save first: it is the complete answer, and the only one that survives
          the person closing this page. */}
      <div className="mb-2.5 space-y-2.5">
        <ActionButton
          onClick={save}
          icon="fa-solid fa-user-plus"
          label={saved ? 'Contact saved' : 'Save to contacts'}
          /* No follow-up instruction once it is done: a phone hands the vCard
             straight to the contacts app, so telling somebody to go and finish
             the job describes a step they never had to take. */
          sub={saved ? undefined : 'Adds name, number and email'}
          background={saved ? BRAND_GREEN : BRAND}
        />

        {wa && (
          <ActionButton
            href={wa}
            icon="fa-brands fa-whatsapp"
            label="Message on WhatsApp"
            sub={formatPhone(whatsappNumber(card))}
            background="#25D366"
          />
        )}

        {viber && (
          <ActionButton
            href={viber}
            icon="fa-brands fa-viber"
            label="Message on Viber"
            sub={formatPhone(viberNumber(card))}
            background="#7360F2"
          />
        )}
      </div>

      {/* Desktop only.

          On a phone the vCard is handed to the contacts app and the "Add
          contact" sheet comes up by itself, so a paragraph explaining how to
          find a downloaded file described a chore nobody was doing — and put
          the awkward-sounding word "download" on the one action the page most
          wants people to take.

          A desktop browser really does just drop a .vcf into the downloads
          folder and say nothing, so the sentence still earns its place there.
          Keyed off width rather than a device sniff: this is about which
          behaviour the browser has, and width is the honest proxy the rest of
          this page already uses. */}
      {saved && (
        <p className="mb-4 hidden px-1 text-[11.5px] leading-relaxed text-gray-500 lg:block lg:px-0">
          Saved to your downloads as a <strong>.vcf</strong> file — open it to add the contact.
        </p>
      )}

      <section className="mt-5 overflow-hidden rounded-[18px] bg-white" style={{ boxShadow: CARD_SHADOW }}>
        {mobile && (
          <DetailRow icon="fa-solid fa-mobile-screen" label="Mobile" value={formatPhone(mobile)} href={telLink(mobile)} />
        )}
        {office && (
          <DetailRow icon="fa-solid fa-phone" label="Office" value={formatPhone(office)} href={telLink(office)} />
        )}
        {card.email && (
          <DetailRow icon="fa-solid fa-envelope" label="Email" value={card.email} href={`mailto:${card.email}`} />
        )}
        {!mobile && !office && !card.email && (
          <div className="px-4 py-5 text-center text-[12.5px] text-gray-400">
            No contact details have been published for this card yet.
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-col items-center gap-3 lg:items-start">
        <a
          href="/product-range"
          className="text-[12px] font-semibold"
          style={{ color: BRAND }}
        >
          Browse the Getmeds catalogue
        </a>
        <p className="px-2 text-center text-[10.5px] leading-relaxed text-gray-400 lg:px-0 lg:text-left">
          Getmeds does not publish these details for search engines. They are here for whoever was
          handed this card.
        </p>
      </div>
        </div>
      </div>
    </main>
  );
}
