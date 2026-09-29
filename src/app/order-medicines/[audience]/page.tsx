import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ORDER_AUDIENCES, audienceBySlug, ORDER_MEDICINES_BASE } from '@/lib/orderAudiences'
import { withSiteName } from '@/lib/seo'
import { DOMAIN } from '@/lib/seo-config'
import OrderMedicinesClient from './OrderMedicinesClient'

// Same share card for every audience (scripts/prerender-order-medicines.cjs → ORDER_OG_IMAGE).
const OG_IMAGE = `${DOMAIN}/assets/og-order.jpg`

export const dynamicParams = false

export function generateStaticParams() {
  return ORDER_AUDIENCES.map((a) => ({ audience: a.slug }))
}

// Mirrors injectHead() in scripts/prerender-order-medicines.cjs.
export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const { audience: slug } = await params
  const audience = audienceBySlug(slug)
  if (!audience) return {}

  const title = withSiteName(audience.meta.title)
  const url = `${DOMAIN}${ORDER_MEDICINES_BASE}/${audience.slug}`
  return {
    title: { absolute: title },
    description: audience.meta.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Getmeds Philippines',
      title,
      description: audience.meta.description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Getmeds Philippines' }],
      url,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function OrderMedicinesAudiencePage({ params }: { params: Promise<{ audience: string }> }) {
  const { audience: slug } = await params
  if (!audienceBySlug(slug)) notFound()
  return <OrderMedicinesClient audienceSlug={slug} />
}
