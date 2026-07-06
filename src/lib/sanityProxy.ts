// Calls a fixed, server-defined GROQ query by name through the backend proxy
// (see getmeds_backend/app/api/routes/sanity.py) instead of hitting Sanity's
// public data API directly from the browser. This keeps the Sanity project
// ID, dataset, and raw GROQ query text out of the client bundle/network tab.
const SANITY_PROXY_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api/sanity'
    : '/api/sanity';

export async function sanityQuery<T>(
  name: string,
  params?: Record<string, string | number | string[]>
): Promise<T> {
  const searchParams = new URLSearchParams()
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value))
    }
  }
  const qs = searchParams.toString()
  const res = await fetch(`${SANITY_PROXY_BASE}/${name}${qs ? `?${qs}` : ''}`)
  if (!res.ok) {
    throw new Error(`Sanity proxy query "${name}" failed: HTTP ${res.status}`)
  }
  const body = await res.json()
  return body.result as T
}
