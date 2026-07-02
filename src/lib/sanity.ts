import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImage } from '../types/sanity'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  useCdn: false,
})

const builder = createImageUrlBuilder(client)

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
