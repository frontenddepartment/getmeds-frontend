/**
 * sanityImageSync.js
 * ─────────────────────────────────────────────────────────────
 * Vite plugin that automatically syncs image slot names from
 * your frontend source code into Sanity as pageAsset documents.
 *
 * How it works:
 *  1. On every `vite dev` start or `vite build`, it scans all
 *     .tsx files in src/pages/ for getImage() and getSliderImages() calls.
 *  2. Extracts the first argument (the slot name) from each call.
 *  3. Queries Sanity for all existing pageAsset document names.
 *  4. For any slot name found in code that does NOT exist in Sanity,
 *     it creates an empty pageAsset document (name only, no image yet).
 *  5. Content managers then see the new slot in Studio and just upload.
 *
 * Requirements:
 *  Add to your .env:
 *    SANITY_WRITE_TOKEN=sk...  (Editor or higher token from manage.sanity.io)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@sanity/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─────────────────────────────────────────────────────────────
// Regex patterns that match your getImage / getSliderImages calls
// Captures the slot name (first string argument)
// ─────────────────────────────────────────────────────────────
const IMAGE_CALL_PATTERN = /getImage\(\s*['"]([^'"]+)['"]/g
const SLIDER_CALL_PATTERN = /getSliderImages\(\s*['"]([^'"]+)['"]/g

/**
 * Scan a single .tsx file and return all slot names found.
 */
function extractSlotNamesFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const names = new Set()

  for (const match of content.matchAll(IMAGE_CALL_PATTERN)) {
    names.add(match[1])
  }
  for (const match of content.matchAll(SLIDER_CALL_PATTERN)) {
    names.add(match[1])
  }

  return names
}

/**
 * Scan all .tsx files in src/pages/ and map slot name to page slug.
 */
function scanAllPageSlots(pagesDir) {
  const nameToPageMap = new Map()

  if (!fs.existsSync(pagesDir)) {
    console.warn(`[ImageSync] Pages directory not found: ${pagesDir}`)
    return nameToPageMap
  }

  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'))

  for (const file of files) {
    const pageSlug = file.replace(/\.tsx$/, '')
    const filePath = path.join(pagesDir, file)
    const names = extractSlotNamesFromFile(filePath)
    for (const name of names) {
      nameToPageMap.set(name, pageSlug)
    }
  }

  return nameToPageMap
}

export function sanityImageSyncPlugin() {
  return {
    name: 'sanity-image-sync',

    async buildStart() {
      const projectId = process.env.VITE_SANITY_PROJECT_ID || 's7ocz8zp'
      const dataset   = process.env.VITE_SANITY_DATASET    || 'production'
      const apiVersion = process.env.VITE_SANITY_API_VERSION || '2024-01-01'
      const writeToken = process.env.SANITY_WRITE_TOKEN

      if (!writeToken) {
        console.warn(
          '\n[ImageSync] ⚠️  SANITY_WRITE_TOKEN is not set in .env — skipping auto-sync.\n' +
          '           Add SANITY_WRITE_TOKEN=sk... to your .env file to enable it.\n'
        )
        return
      }

      const sanity = createClient({
        projectId,
        dataset,
        apiVersion,
        token: writeToken,
        useCdn: false,
      })

      const pagesDir = path.resolve(__dirname, '../src/pages')
      const nameToPageMap = scanAllPageSlots(pagesDir)

      if (nameToPageMap.size === 0) {
        console.log('[ImageSync] No getImage() calls found in src/pages/')
        return
      }

      // Skip the logo — it's handled via siteSettings
      nameToPageMap.delete('assets/getmedslogo.png')

      let existingNames = new Set()
      try {
        const existing = await sanity.fetch(
          `*[_type == "pageAsset"]{ name }`,
          {},
          { cache: 'no-store' }
        )
        existingNames = new Set(existing.map(doc => doc.name))
      } catch (err) {
        console.error('[ImageSync] Failed to fetch existing pageAsset docs:', err.message)
        return
      }

      const missing = [...nameToPageMap.keys()].filter(name => !existingNames.has(name))

      if (missing.length === 0) {
        console.log(`[ImageSync] ✅ All ${nameToPageMap.size} image slots are already in Sanity.`)
        return
      }

      console.log(`\n[ImageSync] Found ${missing.length} new image slot(s) not yet in Sanity:`)
      missing.forEach(name => console.log(`  + "${name}" (Page: ${nameToPageMap.get(name)})`))

      let created = 0
      for (const name of missing) {
        const docId = `page-asset-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        const pageSlug = nameToPageMap.get(name)
        try {
          await sanity.createIfNotExists({
            _type: 'pageAsset',
            _id: docId,
            name,
            page: pageSlug,
            images: [],
          })
          console.log(`[ImageSync]   ✓ Created slot: "${name}" for page: ${pageSlug}`)
          created++
        } catch (err) {
          console.error(`[ImageSync]   ✗ Failed to create slot "${name}":`, err.message)
        }
      }

      console.log(
        `\n[ImageSync] ✅ Done — ${created} new slot(s) created in Sanity.\n`
      )
    },
  }
}
