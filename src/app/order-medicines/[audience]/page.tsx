import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ORDER_AUDIENCES, audienceBySlug, ORDER_MEDICINES_BASE } from '@/lib/orderAudiences'
import { withSiteName } from '@/lib/seo'
import { DOMAIN } from '@/lib/seo-config'
import OrderMedicinesClient from './OrderMedicinesClient'
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides'

// Same share card for every audience. ?v= matches order-medicines/page.tsx —
// bump both together when og-order.jpg is replaced under the same name.
const OG_IMAGE = `${DOMAIN}/assets/og-order.jpg?v=2`

export const dynamicParams = false

export function generateStaticParams() {
  return ORDER_AUDIENCES.map((a) => ({ audience: a.slug }))
}

// Mirrors injectHead() in scripts/prerender-order-medicines.cjs.
async function baseGenerateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
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

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export async function generateMetadata(...args: Parameters<typeof baseGenerateMetadata>): Promise<Metadata> {
  return withVidrysSeo(await `/order-medicines/${(await args[0].params).audience}`, await baseGenerateMetadata(...args))
}
