import type { Metadata } from 'next'
import SearchClient from './SearchClient'

export const metadata: Metadata = {
  title: { absolute: 'Search | Getmeds' },
  description: 'Search the Getmeds catalogue by brand, generic name or condition.',
  // A search box with no query in it has nothing to rank, and the results are
  // built client-side from the catalogue the product pages already expose.
  robots: { index: false, follow: false },
}

export default function SearchPage() {
  return <SearchClient />
}
