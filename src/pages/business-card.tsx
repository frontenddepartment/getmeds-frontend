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

/*
  A downscaled copy of the logo, shared by the mark in the header and the
  watermark tiles on the card faces.

  Not /assets/getmedslogo.png, which is 7122x4000 — fine as a hero image,
  wasteful for a 148px header mark and worse for a 110px tile the browser has to
  hold decoded while it paints two dozen of them on a phone.
*/
const LOGO_SRC = '/assets/getmeds-logo-sm.png';

/*
  WATERMARK_OPACITY is the knob: high enough to survive a screenshot, low enough
  to read the printed phone number underneath.
*/
const WATERMARK_OPACITY = 0.18;
const WATERMARK_TILES = 28;

/*
  Hover motion for the icons on the three action buttons.

  Plain CSS rather than Tailwind's `group-hover:`, for the two guards it buys.
  `hover: hover` means a tap on a phone cannot leave the effect stuck on, which
  the bare `:hover` behind Tailwind's variant would — and this page is mostly
  read on a phone, since it opens from a QR code. `prefers-reduced-motion` then
  drops the movement for anyone who asked their OS for less of it, keeping the
  tint change so the button still visibly answers the pointer.
*/
const ACTION_ICON_CSS = `
  .gm-action__disc { background-color: rgba(255,255,255,.18); }
  .gm-action__disc,
  .gm-action__glyph,
  .gm-action__chev {
    transition: transform .22s cubic-bezier(.2,.7,.3,1), background-color .22s ease, opacity .22s ease;
  }

  /* The halo. Sits outside the disc rather than inside it, so it reads as
     something leaving the icon instead of a border thickening. */
  .gm-action__disc::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    border: 2px solid rgba(255,255,255,.6);
    opacity: 0;
    pointer-events: none;
  }

  @media (hover: hover) {
    .gm-action:hover .gm-action__disc { background-color: rgba(255,255,255,.3); transform: scale(1.07); }
    .gm-action:hover .gm-action__glyph { transform: scale(1.12); }
    /* Beats Tailwind's .opacity-60 on specificity, so the arrow brightens as it
       slides instead of drifting away still dimmed. */
    .gm-action:hover .gm-action__chev { transform: translateX(3px); opacity: 1; }
    .gm-action:hover .gm-action__disc::after { animation: gm-action-halo 1.15s ease-out infinite; }
  }

  @keyframes gm-action-halo {
    0%   { opacity: .6; transform: scale(1); }
    70%  { opacity: 0;  transform: scale(1.55); }
    100% { opacity: 0;  transform: scale(1.55); }
  }

  @media (prefers-reduced-motion: reduce) {
    .gm-action:hover .gm-action__disc,
    .gm-action:hover .gm-action__glyph,
    .gm-action:hover .gm-action__chev { transform: none; }
    .gm-action:hover .gm-action__disc::after { animation: none; }
  }
`;

/*
  The note that appears beside a detail row on hover, saying what the row will do
  if you click it.

  It sits outside the white card — `left: 100%` puts it past the row's right
  edge, out on the page background, which is why the card had to give up its
  `overflow-hidden`. Nothing in there paints to the rounded corners, so the clip
  was doing no work anyway.

  Guarded by `hover: hover` like the button icons: on a phone the rows are tapped
  and a tooltip that latches on after the tap is worse than no tooltip. That also
  disposes of the one place this could not fit — at phone width there is no page
  margin to hang it in, and at phone width it never shows.
*/
const DETAIL_HINT_CSS = `
  .gm-hint {
    position: absolute;
    top: 50%;
    left: 100%;
    margin-left: 10px;
    padding: 3px 9px;
    border-radius: 6px;
    background: #111;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.5;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    /* Starts tucked back towards the card, so it reads as emerging from the row
       rather than drifting in from somewhere off to the side. */
    transform: translateY(-50%) translateX(-6px);
    transition: opacity .18s ease, transform .18s cubic-bezier(.2,.7,.3,1);
  }

  @media (hover: hover) {
    .gm-detail:hover .gm-hint { opacity: 1; transform: translateY(-50%) translateX(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .gm-hint,
    .gm-detail:hover .gm-hint { transform: translateY(-50%); }
  }
`;

/*
  The two columns arriving: the card artwork slides in from the left, the name
  and the things you can do with it from the right, meeting in the middle.

  It runs on the ready state only, which is also the moment the fetched card
  first paints — so the movement covers the content appearing rather than
  replaying over something already on screen.

  --gm-enter is the knob for the whole thing, and the 140ms on the right column
  is what makes it a pair arriving rather than two halves snapping together.
*/
const ENTRANCE_CSS = `
  :root { --gm-enter: 900ms; }

  /* On a phone the card already runs nearly edge to edge, so the opening frame
     of the slide sits off-screen. Clipping at the viewport keeps that from
     reading as a sideways scroll for the length of the animation — nothing is
     lost, since the overhang is past the screen edge either way. */
  body { overflow-x: hidden; }

  @keyframes gm-enter-from-left {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: none; }
  }

  @keyframes gm-enter-from-right {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: none; }
  }

  @keyframes gm-enter-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* The "both" fill mode holds the opening frame through the delay, so the
     right column is not briefly visible in its final place before it sets off. */
  .gm-enter-left {
    animation: gm-enter-from-left var(--gm-enter) cubic-bezier(.16,.84,.44,1) both;
  }

  .gm-enter-right {
    animation: gm-enter-from-right var(--gm-enter) cubic-bezier(.16,.84,.44,1) 140ms both;
  }

  /* The header mark leads, and only fades — sliding it as well would give the
     eye a third thing to follow before the card has arrived. */
  .gm-enter-fade-in {
    animation: gm-enter-fade var(--gm-enter) ease both;
  }

  /* Movement is the part people ask to be spared, not the appearing itself —
     so this keeps the fade and drops the travel. */
  @media (prefers-reduced-motion: reduce) {
    .gm-enter-left,
    .gm-enter-right { animation: gm-enter-fade var(--gm-enter) ease both; }
  }
`;

/**
 * Turns away the browser's own "save this image" affordances — the right-click
 * menu and drag-to-desktop.
 *
 * Worth being plain about what this is: a speed bump, not protection. Anyone
 * with a screenshot key or devtools still gets the artwork, which is why the
 * watermark above is the actual answer and this only stops the effortless copy.
 */
function blockSave(e: React.SyntheticEvent) {
  e.preventDefault();
}

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
      {/* The disc tint moved from an inline style to ACTION_ICON_CSS, because a
          style attribute has no hover to respond to. */}
      <span className="gm-action__disc relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full">
        <i className={`${icon} gm-action__glyph text-[17px]`} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[14px] font-semibold leading-tight">{label}</span>
        {sub && <span className="mt-0.5 block text-[11.5px] leading-tight opacity-80">{sub}</span>}
      </span>
      <i className="fa-solid fa-chevron-right gm-action__chev shrink-0 text-[12px] opacity-60" />
    </>
  );

  const className =
    'gm-action flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 transition active:scale-[0.985]';
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
      className={`relative overflow-hidden rounded-[18px] bg-white ${className}`}
      style={{ boxShadow: '0 6px 24px rgba(23,43,77,.12)' }}
      /* On the wrapper, not the <img>: the watermark sits on top, and a guard
         here catches the right-click wherever inside the card it lands. */
      onContextMenu={blockSave}
      onDragStart={blockSave}
    >
      <img
        src={src}
        alt={alt}
        className="block w-full select-none"
        draggable={false}
        /* Suppresses the iOS long-press sheet, which is the phone equivalent of
           "Save image as" and the likelier route on a page opened from a QR. */
        style={{ WebkitTouchCallout: 'none' }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <CardWatermark />
    </div>
  );
}

/**
 * The tiled, slanted logo laid over a card face.
 *
 * Same treatment as the employee verification modal, so a card and a
 * verification result read as one document family.
 *
 * Purely decorative: `pointer-events-none` keeps it from swallowing the
 * right-click guard on the wrapper, and the empty alt keeps two dozen copies of
 * the logo out of the accessibility tree.
 *
 * The grid is deliberately larger than the card (`-inset-24`) and carries more
 * tiles than fit, because rotating it swings the corners inward — the overflow
 * is what keeps them covered, and the parent clips the rest. At `-inset-16` the
 * rotated top edge cuts across the card's top-left corner and leaves it bare.
 */
function CardWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div
        className="absolute -inset-24 grid grid-cols-4 content-start gap-x-6 gap-y-4"
        style={{ transform: 'rotate(-20deg)' }}
      >
        {Array.from({ length: WATERMARK_TILES }).map((_, i) => (
          <img
            key={i}
            src={LOGO_SRC}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="w-full max-w-[110px] justify-self-center"
            style={{ opacity: WATERMARK_OPACITY }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * What the hover note on a detail row says.
 *
 * Read off the href rather than passed in at each call site, so a row cannot end
 * up promising to call a mailto: — the protocol is already the authority on what
 * clicking it does.
 */
function hintFor(href: string): string {
  if (href.startsWith('tel:')) return 'Call Me';
  if (href.startsWith('mailto:')) return 'Email Me';
  return 'Open';
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
      {href && (
        <>
          {/* Decorative: the link already reads out its label and value, so the
              note would only repeat it to a screen reader. */}
          <span className="gm-hint" aria-hidden="true">
            {hintFor(href)}
          </span>
          <i className="fa-solid fa-arrow-up-right-from-square shrink-0 text-[11px] text-gray-300" />
        </>
      )}
    </>
  );
  const cls = 'gm-detail relative flex items-center gap-3 px-4 py-3';
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
    <>
      {/* Once for the page, not once per button — ActionButton renders three
          times and three identical stylesheets would do the same job. */}
      <style>{`${ENTRANCE_CSS}${ACTION_ICON_CSS}${DETAIL_HINT_CSS}`}</style>

      {/* The page's own mark, and deliberately not a child of <main>.

          In the flow it did two things it should not: pushed the card down, and
          sat directly above the details column closely enough to read as that
          column's heading. Out of the flow it is measured from the page corner
          instead, so the layout below is exactly where it was without the logo,
          and on a wide screen it sits well clear of the content in the margin.

          This leans on <main> being unpositioned — if it ever gains `relative`,
          this snaps back to the content edge and looks like part of the column
          again. Absolute rather than fixed, so it scrolls away with the page
          rather than shadowing the buttons. */}
      <header className="gm-enter-fade-in absolute right-4 top-5 z-10 lg:right-8 lg:top-7">
        <a href="/" className="inline-block">
          <img src={LOGO_SRC} alt="Getmeds" className="h-auto w-[92px] lg:w-[148px]" />
        </a>
      </header>

      {/* The phone-only top padding is the one concession: at that width there
          is no margin beside the content to put a logo in, so the card has to
          start below it. Desktop keeps its original pt-10. */}
      <main className="mx-auto max-w-md px-4 pb-10 pt-[84px] lg:max-w-4xl lg:px-8 lg:pt-10">
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
          <div className="gm-enter-left mb-4 lg:mb-0">
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
        <div className="gm-enter-right">
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

      {/* No `overflow-hidden`: the hover note on each row sits outside this card,
          and the clip would cut it off. Nothing here paints to the corners. */}
      <section className="mt-5 rounded-[18px] bg-white" style={{ boxShadow: CARD_SHADOW }}>
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
    </>
  );
}
