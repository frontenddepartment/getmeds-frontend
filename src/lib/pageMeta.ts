import type { Metadata } from 'next';
import ogImages from './og-images.json';
import { withSiteName } from './seo';

// Next.js metadata for a page, shaped like the <head> the old Vite build served: the HTML
// shell's own <title>/description/canonical, completed by scripts/inject-social-meta.cjs
// (og:title/description/image/type/site_name/url + twitter:card), or — for blog posts and
// policies — the tags scripts/prerender-blog.cjs / prerender-policies.cjs baked in.
//
// The title is `absolute` so the root layout's "%s | Getmeds" template doesn't append the
// brand a second time; withSiteName() already adds " - Getmeds" the way the old site did.

const DOMAIN = 'https://getmeds.ph';
const OG_SITE_NAME = 'Getmeds Philippines';
export const DEFAULT_OG_IMAGE = `${DOMAIN}/assets/${ogImages.default.file}`;

export interface PageMetaInput {
  /** Page title without the brand suffix (it is added unless the title already names Getmeds). */
  title: string;
  description: string;
  /** Canonical path, e.g. "/contact-us". */
  path: string;
  /** og:image; defaults to the site-wide share card (1200x630). */
  image?: string;
  type?: 'website' | 'article';
  /** Title already carries the " - Getmeds" suffix (static shells wrote it by hand). */
  rawTitle?: boolean;
}

export function pageMetadata({ title, description, path, image, type = 'website', rawTitle }: PageMetaInput): Metadata {
  const fullTitle = rawTitle ? title : withSiteName(title);
  const url = `${DOMAIN}${path}`;
  const images = image
    ? [{ url: image }]
    : [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: OG_SITE_NAME }];
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: OG_SITE_NAME,
      title: fullTitle,
      description,
      url,
      images,
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}
