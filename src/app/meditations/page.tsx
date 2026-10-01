import type { Metadata } from 'next'
import MeditationsClient from './MeditationsClient'
import './meditations.css'
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides'

const baseMetadata: Metadata = {
  title: { absolute: 'Meditations - Getmeds' },
  description:
    'Nurture your Mind, Body & Soul. Experience the Getmeds Meditation App with interactive breathing guides and live ambient soundscapes.',
  alternates: { canonical: 'https://getmeds.ph/meditations' },
  openGraph: { url: 'https://getmeds.ph/meditations' },
}

export default function MeditationsPage() {
  return <MeditationsClient />
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/meditations', baseMetadata)
}
