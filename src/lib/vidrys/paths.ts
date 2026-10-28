// Path handling shared by the Vidrys webhook (writes) and page metadata (reads).

/** "/about-us" for https://getmeds.ph/about-us/, decoded, no trailing slash, no query. */
export function normalizeSitePath(pathOrUrl: string): string {
  let path = pathOrUrl;
  try {
    path = new URL(pathOrUrl, 'https://getmeds.ph').pathname;
  } catch {
    /* keep as given */
  }
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep encoded */
  }
  path = path.replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

/** The hosts whose pages this site serves. A fix aimed anywhere else is not applied. */
export const SITE_HOSTS = ['getmeds.ph', 'www.getmeds.ph'];

/**
 * Pages that don't take SEO overrides: noindex utility pages and legacy shells. Every other
 * page's metadata goes through withVidrysSeo() (src/lib/vidrys/seoOverrides.ts).
 */
const NO_OVERRIDE_PREFIXES = [
  '/business-card', '/card', '/coming-soon', '/employee-verification', '/under-development',
  '/product-detail', '/blog-detail', '/hooks', '/api',
];

export function pageTakesSeoOverrides(path: string): boolean {
  const p = normalizeSitePath(path);
  return !NO_OVERRIDE_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}
