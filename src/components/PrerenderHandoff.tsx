'use client';

// App Router version of lib/handoff.ts mountPage(): the server-rendered, crawler-readable
// copy of the page (what scripts/prerender-slugs.cjs baked into #root) stays on screen while
// the live page loads out of sight, and the two swap in one step when the page calls
// usePageReady(true) — or after FALLBACK_MS, so a failed fetch can't leave the static copy
// standing in for the app.
import React, { useEffect, useState } from 'react';
import { PAGE_READY_EVENT, getPageReadyCount } from '@/lib/handoff';

const FALLBACK_MS = 15000;

export default function PrerenderHandoff({ baked, children }: { baked: React.ReactNode; children: React.ReactNode }) {
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
