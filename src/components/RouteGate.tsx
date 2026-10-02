'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Pages without the Tawk chat bubble, the WhatsApp/Viber/Messenger links and the back-to-top
// button. /coming-soon never loaded components.js. The business card pages have their own
// WhatsApp and Viber buttons for the person on the card, so the site-wide ones (which reach
// Getmeds support instead) would only compete with them.
const NO_COMPONENTS_ROUTES = ['/coming-soon', '/card', '/business-card'];

export default function RouteGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const hidden = NO_COMPONENTS_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  return hidden ? null : <>{children}</>;
}
