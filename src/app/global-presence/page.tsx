import type { Metadata } from 'next'
import GlobalPresenceClient from './GlobalPresenceClient'
import './global-presence.css'
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides'

const baseMetadata: Metadata = {
  title: { absolute: 'Global Presence - Getmeds' },
  description:
    'Getmeds global network spans continents to close the healthcare gap — sourcing internationally recognized medicines and expanding access for the patients and partners who depend on us.',
  alternates: { canonical: 'https://getmeds.ph/global-presence' },
  openGraph: { url: 'https://getmeds.ph/global-presence' },
}

export default function GlobalPresencePage() {
  return <GlobalPresenceClient />
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/global-presence', baseMetadata)
}
