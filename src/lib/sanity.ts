import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImage } from '../types/sanity'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  useCdn: true,
})

const builder = createImageUrlBuilder(client)

/**
 * Given a resolved image URL, returns a small/compressed version of the same asset for use as a
 * low-res placeholder (progressive loading — shown as-is, no artificial blur). Only works for
 * Sanity CDN URLs — returns the input unchanged for local/static fallback paths, since those
 * have no server-side resize endpoint.
 */
export function getLowResUrl(url: string, width = 100, quality = 30): string {
  if (!url || !url.includes('cdn.sanity.io')) return url
  try {
    const u = new URL(url)
    u.searchParams.set('w', String(width))
    u.searchParams.set('q', String(quality))
    u.searchParams.delete('blur')
    return u.toString()
  } catch (err) {
    console.error('Error generating low-res URL:', err)
    return url
  }
}

export function urlFor(source: any) {
  if (typeof source === 'string' && (source.startsWith('http') || source.startsWith('/'))) {
    return {
      width: () => ({
        height: () => ({ url: () => source }),
        url: () => source
      }),
      height: () => ({
        width: () => ({ url: () => source }),
        url: () => source
      }),
      url: () => source
    } as any;
  }
  if (source && typeof source === 'object' && 'url' in source) {
    const urlStr = source.url;
    return {
      width: () => ({
        height: () => ({ url: () => urlStr }),
        url: () => urlStr
      }),
      height: () => ({
        width: () => ({ url: () => urlStr }),
        url: () => urlStr
      }),
      url: () => urlStr
    } as any;
  }
  return builder.image(source).auto('format').quality(60).fit('max')
}
