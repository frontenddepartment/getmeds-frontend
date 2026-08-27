import React, { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: any;
    TAWK_PROPERTY_ID?: string;
    TAWK_WIDGET_ID?: string;
    openGetmedsChat?: () => void;
  }
}

export const TawkChatWidget: React.FC = () => {
  useEffect(() => {
    const propertyId = window.TAWK_PROPERTY_ID ||
                       document.querySelector<HTMLMetaElement>('meta[name="tawk-property-id"]')?.content ||
                       '6a8f969fb56df5344af1f3a0';
    const widgetId = window.TAWK_WIDGET_ID ||
                     document.querySelector<HTMLMetaElement>('meta[name="tawk-widget-id"]')?.content ||
                     '1k10e8o0v';

    // Global helper for opening Tawk chat from any button click
    window.openGetmedsChat = () => {
      if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
        window.Tawk_API.maximize();
      } else if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
        window.Tawk_API.toggle();
      } else if (window.Tawk_API && typeof window.Tawk_API.popup === 'function') {
        window.Tawk_API.popup();
      }
    };

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Remove any legacy custom chatbot trigger button
    const legacyBtn = document.getElementById('zap-ai-trigger');
    if (legacyBtn) legacyBtn.remove();

    // Inject Tawk.to Script SDK if not present
    if (!document.getElementById('tawk-script-sdk')) {
      const s1 = document.createElement('script');
      s1.id = 'tawk-script-sdk';
      const s0 = document.getElementsByTagName('script')[0];
      s1.async = true;
      s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      } else {
        document.head.appendChild(s1);
      }
    }
  }, []);

  return null;
};
