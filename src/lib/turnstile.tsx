import React, { useEffect, useRef, useState } from 'react';

/**
 * turnstile.tsx
 * ─────────────────────────────────────────────
 * Cloudflare Turnstile, shared by every inquiry form.
 *
 * This was previously implemented once, inline, in order-medicines.tsx and
 * nowhere else — so seven of the eight forms sent an empty token. The moment a
 * secret key was set on the backend those seven started rejecting real
 * customers with "Please complete the verification challenge", pointing at a
 * widget that was not on the page. Keeping it in one place is what stops that
 * happening again the next time a form is added.
 *
 * Requires the api.js script on the page:
 *   <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
 */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

/**
 * No site key configured means no widget and no gating, so forms still work in
 * local dev and if the key is ever unset. The backend mirrors this: with no
 * secret, verification is skipped entirely.
 */
export const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || '';

export interface TurnstileHandle {
  /** Current token, or '' when unsolved. Send this as `turnstileToken`. */
  token: string;
  /** Attach to the element the widget should render into. */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Call after every submit — tokens are single-use. */
  reset: () => void;
  /** False when no site key is configured, i.e. the widget renders nothing. */
  enabled: boolean;
}

/**
 * @param active Set false while the form is hidden, so the widget is not
 *               mounted for a form the visitor cannot see.
 */
export function useTurnstile(active: boolean = true): TurnstileHandle {
  const [token, setToken] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Set by the effect below so reset() can mount a brand-new widget after a
  // submission rather than reusing the solved one.
  const mount = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!active || !TURNSTILE_SITE_KEY) return;
    const host = ref.current;
    if (!host) return;

    let cancelled = false;
    // api.js is loaded async/defer, so window.turnstile is usually NOT ready when
    // this effect first runs. Returning false here (rather than "done") is what
    // keeps the poll below alive until the script lands — otherwise the interval
    // clears itself on its first tick and the widget never renders, leaving the
    // submit button permanently disabled with nothing on screen to solve.
    const render = () => {
      if (cancelled || widgetId.current) return true; // done, or nothing to do
      if (!window.turnstile) return false;            // script not loaded yet
      widgetId.current = window.turnstile.render(host, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        // 'normal' rather than 'flexible': the flexible size was inherited from
        // the partner form, the only place this had ever run, and on the live
        // order form it reserved 300x72px and drew nothing in it.
        size: 'normal',
        appearance: 'always', // keep the widget visible rather than interaction-only
        callback: (t: string) => setToken(t),
        'expired-callback': () => setToken(''),
        'timeout-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
      return true;
    };

    const timer = window.setInterval(() => { if (render()) window.clearInterval(timer); }, 150);
    const giveUp = window.setTimeout(() => window.clearInterval(timer), 15000);
    render();
    mount.current = render;

    return () => {
      cancelled = true;
      mount.current = null;
      window.clearInterval(timer);
      window.clearTimeout(giveUp);
      if (widgetId.current) {
        try { window.turnstile?.remove(widgetId.current); } catch { /* already gone */ }
        widgetId.current = null;
      }
    };
  }, [active]);

  // Tear the widget down and mount a fresh one, rather than calling reset() on the
  // existing instance. Turnstile tokens are single-use, so every submission needs a
  // genuinely new challenge — a reused token is rejected server-side as
  // "timeout-or-duplicate". Removing and re-rendering also guarantees the widget
  // returns to its unsolved state instead of staying visually ticked.
  const reset = () => {
    setToken('');
    if (widgetId.current) {
      try { window.turnstile?.remove(widgetId.current); } catch { /* already gone */ }
      widgetId.current = null;
    }
    mount.current?.();
  };

  return { token, ref, reset, enabled: Boolean(TURNSTILE_SITE_KEY) };
}

/** Renders nothing when no site key is configured. */
export function Turnstile({
  turnstile,
  className = 'my-4',
}: {
  turnstile: TurnstileHandle;
  className?: string;
}) {
  if (!turnstile.enabled) return null;
  return <div ref={turnstile.ref} className={className} />;
}
