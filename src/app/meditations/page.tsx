import type { Metadata } from 'next'
import MeditationsClient from './MeditationsClient'
import './meditations.css'

export const metadata: Metadata = {
  title: { absolute: 'Meditations - Getmeds' },
  description:
    'Nurture your Mind, Body & Soul. Experience the Getmeds Meditation App with interactive breathing guides and live ambient soundscapes.',
  alternates: { canonical: 'https://getmeds.ph/meditations' },
  openGraph: { url: 'https://getmeds.ph/meditations' },
}

export default function MeditationsPage() {
  return <MeditationsClient />
}
