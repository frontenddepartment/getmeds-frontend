import type { Metadata } from 'next';
import OrderMedicinesClient from './[audience]/OrderMedicinesClient';
import { ORDER_HUB_META, ORDER_MEDICINES_BASE } from '@/lib/orderAudiences';
import { withSiteName } from '@/lib/seo';
import { DOMAIN } from '@/lib/seo-config';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// Mirrors the <head> of order-medicines.html: title, description, canonical,
// og:url and the order share card. ?v= is the scraper cache-buster — bump it
// whenever og-order.jpg is replaced under the same name (v2: phone-mockup card
// showing the order page, from assets/order-medicines/og-order-medicines.png).
const OG_IMAGE = `${DOMAIN}/assets/og-order.jpg?v=2`;

const baseMetadata: Metadata = {
  title: { absolute: withSiteName(ORDER_HUB_META.title) },
  description: ORDER_HUB_META.description,
  alternates: { canonical: `${DOMAIN}${ORDER_MEDICINES_BASE}` },
  // og:title/description/type/site_name/twitter:card were completed at build
  // time by scripts/inject-social-meta.cjs.
  openGraph: {
    title: withSiteName(ORDER_HUB_META.title),
    description: ORDER_HUB_META.description,
    url: `${DOMAIN}${ORDER_MEDICINES_BASE}`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Getmeds Philippines' }],
    type: 'website',
    siteName: 'Getmeds Philippines',
  },
  twitter: { card: 'summary_large_image' },
};

export default function OrderMedicinesPage() {
  return <OrderMedicinesClient />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/order-medicines', baseMetadata);
}
