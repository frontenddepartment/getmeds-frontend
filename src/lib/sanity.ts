import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImage } from '../types/sanity'

export const client = createClient({
  projectId: 's7ocz8zp',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImage) {
  return builder.image(source)
}
