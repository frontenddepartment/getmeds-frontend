/**
 * cart.ts
 * ─────────────────────────────────────────────
 * The request list — "Cart" in the tab bar — for the installed app only.
 *
 * ── On "asking permission" ──
 * There is no browser permission for this. IndexedDB, localStorage and the
 * Cache API are all writable without a prompt, so no OS dialog exists to
 * trigger; asking the browser would be asking for something it does not offer.
 *
 * What does exist, and what actually matters here, is informed consent. Under
 * the Data Privacy Act a visitor should know what is kept about them and be
 * able to withdraw it, so nothing is written until they have explicitly agreed
 * once, and withdrawing that agreement erases what was stored. That gate is
 * enforced here rather than in the UI, so no future caller can bypass it by
 * forgetting to check.
 *
 * ── Why its own database ──
 * offlineInquiry.ts owns 'getmeds-offline' at version 1. Adding stores to it
 * would mean a version bump that both modules must agree on, and a page that
 * loads only one of them would block the other's open() forever. A separate
 * database has no such coupling.
 */

const DB_NAME = 'getmeds-cart'
const DB_VERSION = 1
const ITEMS = 'items'
const META = 'meta'
const CONSENT_KEY = 'storage-consent'

/** Fired on window whenever the list or the consent state changes. */
export const CART_CHANGED_EVENT = 'getmeds:cart-changed'

export interface CartItem {
  /** Stable per product, so adding twice does not duplicate the row. */
  id: string
  name: string
  strength?: string
  form?: string
  url: string
  needsRx?: boolean
  addedAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(ITEMS)) db.createObjectStore(ITEMS, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(store, mode).objectStore(store))
        request.onsuccess = () => resolve(request.result as T)
        request.onerror = () => reject(request.error)
      })
  )
}

// Private browsing and blocked site data make IndexedDB throw on open. The
// list is a convenience, never a blocker, so every path degrades to "no cart".
const safe = <T>(p: Promise<T>, fallback: T): Promise<T> => p.catch(() => fallback)

const announce = () => window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT))

/**
 * The sheet's Prescription column is free text ("Yes", "Rx", "OTC", blank...),
 * so treat anything that is not an explicit no as requiring one. Erring toward
 * "needs a prescription" is the safe direction for a pharmacy.
 */
export function needsPrescription(value: unknown): boolean {
  const v = String(value ?? '').trim().toLowerCase()
  if (!v) return false
  return !['no', 'otc', 'false', 'none', 'n/a'].includes(v)
}

/** True only in the installed app at phone widths — the cart ships nowhere else. */
export function isAppMode(): boolean {
  try {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    return standalone && window.innerWidth <= 1024
  } catch {
    return false
  }
}

// ── Consent ──────────────────────────────────────────────────────────────────

export const hasConsent = (): Promise<boolean> =>
  safe(tx<boolean | undefined>(META, 'readonly', (s) => s.get(CONSENT_KEY)).then((v) => v === true), false)

/** Granting only records the choice. Withdrawing also erases the list. */
export async function setConsent(granted: boolean): Promise<void> {
  await safe(tx<void>(META, 'readwrite', (s) => s.put(granted, CONSENT_KEY)), undefined as void)
  if (!granted) await clearCart()
  announce()
}

// ── The list ─────────────────────────────────────────────────────────────────

export const listCart = (): Promise<CartItem[]> =>
  safe(
    tx<CartItem[]>(ITEMS, 'readonly', (s) => s.getAll()).then((all) =>
      (all ?? []).sort((a, b) => b.addedAt - a.addedAt)
    ),
    []
  )

export const countCart = (): Promise<number> => listCart().then((l) => l.length)

/**
 * Refuses to write anything before consent is recorded, and says so, rather
 * than storing quietly and asking afterwards.
 */
export async function addToCart(item: Omit<CartItem, 'addedAt'>): Promise<'added' | 'needs-consent' | 'failed'> {
  if (!(await hasConsent())) return 'needs-consent'
  try {
    await tx<void>(ITEMS, 'readwrite', (s) => s.put({ ...item, addedAt: Date.now() }))
    announce()
    return 'added'
  } catch {
    return 'failed'
  }
}

export async function removeFromCart(id: string): Promise<void> {
  await safe(tx<void>(ITEMS, 'readwrite', (s) => s.delete(id)), undefined as void)
  announce()
}

export async function clearCart(): Promise<void> {
  await safe(tx<void>(ITEMS, 'readwrite', (s) => s.clear()), undefined as void)
  announce()
}

export const inCart = (id: string): Promise<boolean> =>
  safe(tx<CartItem | undefined>(ITEMS, 'readonly', (s) => s.get(id)).then(Boolean), false)

/**
 * Erases everything this device holds — the list, the consent record, and the
 * queued inquiries from offlineInquiry.ts. This is what the "clear saved data"
 * control in More is for, and what a withdrawal of consent should actually do.
 */
export async function clearAllDeviceData(): Promise<void> {
  await clearCart()
  await safe(tx<void>(META, 'readwrite', (s) => s.clear()), undefined as void)
  try {
    indexedDB.deleteDatabase('getmeds-offline')
  } catch { /* nothing queued, or storage unavailable */ }
  announce()
}

// ── Tab bar badge ────────────────────────────────────────────────────────────

/**
 * The tab bar is static HTML injected at build time, so it has no React state
 * to re-render. The count is written onto the element instead, and the CSS
 * shows the badge only when it is not "0".
 */
export async function syncCartBadge(): Promise<void> {
  const badge = document.querySelector('.gm-cart-badge')
  if (!badge) return
  const n = await countCart()
  badge.setAttribute('data-count', String(n))
  badge.textContent = n > 99 ? '99+' : String(n)
}

/** Keeps the badge current for the life of the page. */
export function watchCartBadge(): () => void {
  syncCartBadge()
  const handler = () => { syncCartBadge() }
  window.addEventListener(CART_CHANGED_EVENT, handler)
  return () => window.removeEventListener(CART_CHANGED_EVENT, handler)
}
