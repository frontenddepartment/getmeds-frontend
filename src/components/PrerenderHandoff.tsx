'use client';

// App Router version of lib/handoff.ts mountPage(): the server-rendered, crawler-readable
// copy of the page (what scripts/prerender-slugs.cjs baked into #root) stays on screen while
// the live page loads out of sight, and the two swap in one step when the page calls
// usePageReady(true) — or after FALLBACK_MS, so a failed fetch can't leave the static copy
// standing in for the app.
//
// mode="skeleton" is for pages whose live version has its own loading skeleton (the
// catalogue): the live page shows straight away with that skeleton, and the baked copy stays
// in the HTML for crawlers but off screen, instead of flashing a plain-text version of the
// page that then jumps into a different layout.
import React, { useEffect, useState } from 'react';
import { PAGE_READY_EVENT, getPageReadyCount } from '@/lib/handoff';

const FALLBACK_MS = 15000;

// Off screen but still in the HTML and the layout-free flow (the usual "visually hidden" recipe).
const offscreen: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

export default function PrerenderHandoff({
  baked,
  children,
  mode = 'static',
}: {
  baked: React.ReactNode;
  children: React.ReactNode;
  mode?: 'static' | 'skeleton';
}) {
  // Captured during render — before the child page's layout effects can fire a ready signal.
  const [startCount] = useState(() => getPageReadyCount());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getPageReadyCount() > startCount) {
      setReady(true);
      return;
    }
    const onReady = () => setReady(true);
    window.addEventListener(PAGE_READY_EVENT, onReady);
    const timer = window.setTimeout(onReady, FALLBACK_MS);
    return () => {
      window.removeEventListener(PAGE_READY_EVENT, onReady);
      window.clearTimeout(timer);
    };
  }, [startCount]);

  if (mode === 'skeleton') {
    return (
      <>
        {!ready && (
          <div data-prerendered="" data-prerendered-offscreen="" aria-hidden="true" style={offscreen}>
            {baked}
          </div>
        )}
        {/* Without JavaScript the skeleton would never resolve, so show the baked copy instead. */}
        <noscript>
          <style>{'[data-prerendered-offscreen]{position:static!important;width:auto!important;height:auto!important;margin:0!important;overflow:visible!important;clip:auto!important;white-space:normal!important}.catalog-root{display:none!important}'}</style>
        </noscript>
        <div>{children}</div>
      </>
    );
  }

  return (
    <>
      {!ready && <div data-prerendered="">{baked}</div>}
      <div
        data-handoff-pending={ready ? undefined : ''}
        aria-hidden={ready ? undefined : true}
        style={ready ? undefined : { position: 'absolute', top: 0, left: 0, right: 0, visibility: 'hidden', pointerEvents: 'none' }}
      >
        {children}
      </div>
    </>
  );
}
