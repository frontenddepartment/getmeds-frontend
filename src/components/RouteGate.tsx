'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Pages whose original HTML shell didn't load components.js, so they had no chat bubble,
// chat links or back-to-top button. Kept in step with NO_COMPONENTS_ROUTES in Footer.tsx.
const NO_COMPONENTS_ROUTES = ['/edit-profile', '/coming-soon'];

export default function RouteGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const hidden = NO_COMPONENTS_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  return hidden ? null : <>{children}</>;
}
