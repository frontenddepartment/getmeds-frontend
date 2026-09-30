'use client';

import React, { useEffect, useState } from 'react';
import './floating-contact.css';

/**
 * The fixed contact corner every page had, ported from getmeds_frontend/public/components/components.js:
 * - the Tawk.to live chat bubble (injectAIAssistant): the pharmacist support chat, with Tawk's own
 *   unread badge; window.openGetmedsChat opens it from anywhere on the site
 * - WhatsApp, Viber and Messenger buttons stacked above it (injectChatLinks)
 * - the back-to-top button (injectScrollToTop)
 */

const TAWK_PROPERTY_ID = '6a8f969fb56df5344af1f3a0';
const TAWK_WIDGET_ID = '1k134u1kt';
const TAWK_SCRIPT_ID = 'tawk-script-sdk';
const SCROLL_THRESHOLD = 300;

interface TawkHooks {
  onChatMaximized?: (...args: unknown[]) => void;
  onChatMinimized?: (...args: unknown[]) => void;
  maximize?: () => void;
  toggle?: () => void;
  popup?: () => void;
}

type ChatWindow = Window & {
  Tawk_API?: TawkHooks;
  Tawk_LoadStart?: Date;
  TAWK_PROPERTY_ID?: string;
  TAWK_WIDGET_ID?: string;
  openGetmedsChat?: () => void;
};

// Where each direct-message button goes. wa.me wants bare digits; Viber wants the plus,
// percent-encoded, or it looks the number up in the wrong country.
const CHAT_LINKS = [
  {
    id: 'whatsapp',
    label: 'Chat with us on WhatsApp',
    href: 'https://wa.me/639190769105',
    background: '#25D366',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  },
  {
    id: 'viber',
    label: 'Chat with us on Viber',
    href: 'viber://chat?number=%2B639190769105',
    background: '#7360F2',
    path: 'M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z',
  },
  {
    id: 'messenger',
    label: 'Chat with us on Messenger',
    href: 'https://m.me/getmedsphilippines',
    background: 'linear-gradient(180deg, #00B2FF 0%, #006AFF 100%)',
    path: 'M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 00-2.61.48z',
  },
];

/** Every scroll container on the page that React content may scroll inside, besides the window. */
function scrolledContainers(minScrollTop: number): HTMLElement[] {
  const found: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>('*').forEach((el) => {
    if (el.id === 'scroll-to-top') return;
    const overflow = window.getComputedStyle(el).overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && el.scrollTop > minScrollTop) found.push(el);
  });
  return found;
}

export default function FloatingContactButtons() {
  const [chatOpen, setChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Tawk.to chat bubble and the global opener.
  useEffect(() => {
    const w = window as ChatWindow;
    w.Tawk_API = w.Tawk_API || {};
    w.Tawk_LoadStart = new Date();

    w.openGetmedsChat = () => {
      const api = w.Tawk_API;
      if (api && typeof api.maximize === 'function') api.maximize();
      else if (api && typeof api.toggle === 'function') api.toggle();
      else if (api && typeof api.popup === 'function') api.popup();
    };

    // Tawk's open chat window covers this corner, so the chat links hide while it is open.
    // Any handler already on the hook is kept and called first.
    const tawk = w.Tawk_API;
    const hook = (name: 'onChatMaximized' | 'onChatMinimized', open: boolean) => {
      const previous = tawk[name];
      tawk[name] = function (this: unknown, ...args: unknown[]) {
        if (typeof previous === 'function') previous.apply(this, args);
        setChatOpen(open);
      };
    };
    hook('onChatMaximized', true);
    hook('onChatMinimized', false);

    if (!document.getElementById(TAWK_SCRIPT_ID)) {
      const propertyId =
        w.TAWK_PROPERTY_ID ||
        document.querySelector<HTMLMetaElement>('meta[name="tawk-property-id"]')?.content ||
        TAWK_PROPERTY_ID;
      const widgetId =
        w.TAWK_WIDGET_ID ||
        document.querySelector<HTMLMetaElement>('meta[name="tawk-widget-id"]')?.content ||
        TAWK_WIDGET_ID;
      const s1 = document.createElement('script');
      s1.id = TAWK_SCRIPT_ID;
      s1.async = true;
      s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      const s0 = document.getElementsByTagName('script')[0];
      if (s0 && s0.parentNode) s0.parentNode.insertBefore(s1, s0);
      else document.head.appendChild(s1);
    }
  }, []);

  // Back-to-top visibility: the window or any inner scroll container past the threshold.
  useEffect(() => {
    const checkScrolled = () => {
      setShowScrollTop(window.scrollY > SCROLL_THRESHOLD || scrolledContainers(SCROLL_THRESHOLD).length > 0);
    };
    // Capture phase catches scroll on any element, including React content divs
    document.addEventListener('scroll', checkScrolled, true);
    window.addEventListener('scroll', checkScrolled);
    return () => {
      document.removeEventListener('scroll', checkScrolled, true);
      window.removeEventListener('scroll', checkScrolled);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    scrolledContainers(0).forEach((el) => el.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  return (
    <>
      <div id="gm-chat-links" className={chatOpen ? 'gm-chat-links--hidden' : undefined}>
        {CHAT_LINKS.map((link) => {
          // viber:// hands off to the app, so it has no tab to open.
          const newTab = link.href.startsWith('http');
          return (
            <a
              key={link.id}
              href={link.href}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
              data-chat-link={link.id}
              aria-label={link.label}
              title={link.label}
              style={{ background: link.background }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={link.path} />
              </svg>
            </a>
          );
        })}
      </div>
      <button
        id="scroll-to-top"
        type="button"
        title="Back to Top"
        className={showScrollTop ? 'show' : undefined}
        onClick={scrollToTop}
      >
        <i className="fa-solid fa-chevron-up" />
      </button>
    </>
  );
}
