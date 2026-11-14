"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** false during SSR and the hydration render, true afterwards. Use before reading localStorage. */
export const useHydrated = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

/** Renders `fallback` until hydrated, so children may read browser-only state (localStorage) during render. */
export function ClientOnly({ children, fallback = <div className="ns-card-dashed">Loading…</div> }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return useHydrated() ? <>{children}</> : <>{fallback}</>;
}
