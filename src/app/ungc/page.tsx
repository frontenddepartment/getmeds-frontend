import type { Metadata } from 'next'
import UngcClient from './UngcClient'
import './ungc.css'

export const metadata: Metadata = {
  title: { absolute: 'UN Global Compact - Getmeds' },
  description:
    'At Getmeds Philippines, we do more than provide medicines—we drive meaningful impact through responsible healthcare, compassion, and sustainable action.',
  alternates: { canonical: 'https://getmeds.ph/ungc' },
  openGraph: { url: 'https://getmeds.ph/ungc' },
}

export default function UngcPage() {
  return <UngcClient />
}
