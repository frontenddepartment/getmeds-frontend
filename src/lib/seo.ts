const SITE_NAME = 'Getmeds';
const BASE_URL = 'https://getmeds.ph';
const DEFAULT_IMAGE = `${BASE_URL}/assets/getmedslogo.png`;

export interface PageMetaOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
}

function updateMeta(name: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(isProperty ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateCanonical(path: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', `${BASE_URL}${path}`);
}

export function injectJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify({ '@context': 'https://schema.org', ...data });
}

export function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

export function setPageMeta({ title, description, path, image, type = 'website' }: PageMetaOptions) {
  const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} - ${SITE_NAME}`;
  document.title = fullTitle;

  updateMeta('description', description);
  updateMeta('og:type', type, true);
  updateMeta('og:site_name', SITE_NAME, true);
  updateMeta('og:title', fullTitle, true);
  updateMeta('og:description', description, true);
  updateMeta('og:image', image || DEFAULT_IMAGE, true);

  if (path) {
    updateMeta('og:url', `${BASE_URL}${path}`, true);
    updateCanonical(path);
  }

  updateMeta('twitter:card', 'summary_large_image');
  updateMeta('twitter:title', fullTitle);
  updateMeta('twitter:description', description);
  updateMeta('twitter:image', image || DEFAULT_IMAGE);
}
