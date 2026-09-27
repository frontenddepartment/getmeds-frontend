// Data the build baked into a prerendered page (scripts/lib/prerender-body.cjs), as
// <script type="application/json" id="gm-preload">{ "<kind>": { "key": ..., "data": ... } }</script>.
//
// That page's #root already holds the content as static markup; handing the same data to the
// first React render lets the app draw the finished page straight away instead of showing a
// loading state and fetching what the HTML already contained.

type PreloadEntry = { key: string; data: unknown }

let cache: Record<string, PreloadEntry> | null | undefined

function readAll(): Record<string, PreloadEntry> | null {
  if (cache !== undefined) return cache
  cache = null
  try {
    const el = typeof document !== 'undefined' ? document.getElementById('gm-preload') : null
    if (el && el.textContent) cache = JSON.parse(el.textContent)
  } catch {
    cache = null
  }
  return cache
}

// The preloaded `kind` entry, but only if it was baked for this exact `key` (a slug, usually):
// a page reached by a client-side change of slug must still fetch.
export function readPreload<T>(kind: string, key: string | null | undefined): T | undefined {
  if (!key) return undefined
  const entry = readAll()?.[kind]
  return entry && entry.key === key ? (entry.data as T) : undefined
}
