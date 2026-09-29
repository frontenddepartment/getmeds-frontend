// Per-URL head tags, JSON-LD and crawler-readable body for the catalogue routes — the
// App Router equivalent of scripts/prerender-slugs.cjs (injectHead(), productMarkup(),
// listingMarkup()). Server-only: builds from lib/catalogServer.
import type { Metadata } from 'next';
import React from 'react';
import {
  withSiteName,
  truncateAtWord,
  ogImageForFolder,
  CONDITIONS_OG_IMAGE,
  ORGANIZATION_ID,
  specialtyUrl,
  conditionReviewFields,
} from './seo';
import ogImages from './og-images.json';
import {
  DOMAIN,
  ALL_PRODUCTS_DESCRIPTION,
  type CatalogModel,
  type CatalogProduct,
  type ConditionGroup,
  conditionGroups,
  folderDisplayName,
  productPath,
  slugify,
} from './catalogServer';

const DEFAULT_OG_IMAGE = `${DOMAIN}/assets/${ogImages.default.file}`;

export interface JsonLdBlock {
  id: string;
  data: Record<string, unknown> | null;
}

export interface CatalogPageSeo {
  metadata: Metadata;
  jsonLd: JsonLdBlock[];
  baked: React.ReactNode;
}

interface Crumb {
  name: string;
  url?: string;
}

function breadcrumbList(trail: Crumb[]): Record<string, unknown> | null {
  const crumbs = trail.filter((c) => c && c.name);
  if (crumbs.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.url && i < crumbs.length - 1 ? { item: `${DOMAIN}${crumb.url}` } : {}),
    })),
  };
}

function buildMetadata(opts: {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: 'website' | 'product';
  ogImage?: string;
  noindex?: boolean;
}): Metadata {
  const fullTitle = withSiteName(opts.title);
  const canonicalUrl = `${DOMAIN}${opts.canonicalPath}`;
  const image = opts.ogImage || DEFAULT_OG_IMAGE;
  return {
    title: { absolute: fullTitle },
    description: opts.description,
    alternates: { canonical: canonicalUrl },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      // Next's OpenGraph type union has no "product" (og:type is left for the page's
      // runtime setPageMeta() to write, as the original did on hydration).
      ...(opts.ogType === 'website' ? { type: 'website' as const } : {}),
      siteName: 'Getmeds Philippines',
      title: fullTitle,
      description: opts.description,
      url: canonicalUrl,
      images: [{ url: image, width: 1200, height: 630, alt: 'Getmeds Philippines' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: opts.description,
      images: [image],
    },
  };
}

/** Renders the page's JSON-LD blocks under the same ids src/lib/seo.ts updates at runtime. */
export function JsonLdScripts({ blocks }: { blocks: JsonLdBlock[] }) {
  return (
    <>
      {blocks
        .filter((b) => b && b.data)
        .map((b) => (
          <script
            key={b.id}
            id={b.id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({ '@context': 'https://schema.org', ...b.data }).replace(/</g, '\\u003c'),
            }}
          />
        ))}
    </>
  );
}

// ---- Body markup (scripts/prerender-slugs.cjs productMarkup()/listingMarkup()) -----------

function Crumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-6">
      {trail.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <> <span aria-hidden="true">›</span> </>}
          {c.url ? <a href={c.url} className="hover:text-primary">{c.name}</a> : <span>{c.name}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

function Paragraphs({ text }: { text?: string }) {
  const lines = String(text || '').split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);
  return (
    <>
      {lines.map((l, i) => (
        <p key={i} className="text-sm leading-relaxed text-gray-700 mb-3">{l}</p>
      ))}
    </>
  );
}

interface ProductLink {
  name: string;
  url: string;
  detail: string;
}

function ProductList({ items }: { items: ProductLink[] }) {
  if (!items.length) return null;
  return (
    <ul className="grid sm:grid-cols-2 gap-3">
      {items.map((p, i) => (
        <li key={i} className="border border-gray-200 rounded-xl p-4">
          <a href={p.url} className="font-semibold text-gray-900 hover:text-primary">{p.name}</a>
          {p.detail ? <p className="text-xs text-gray-500 mt-1">{p.detail}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function ListingMarkup({ trail, heading, intro, sections }: {
  trail?: Crumb[];
  heading: string;
  intro?: string;
  sections: Array<{ title?: string; url?: string; items: ProductLink[] }>;
}) {
  return (
    <main className="max-w-5xl mx-auto px-4 pt-28 pb-16 text-gray-800">
      {trail ? <Crumbs trail={trail} /> : null}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">{heading}</h1>
      {intro ? <p className="text-sm text-gray-600 mb-8 max-w-2xl">{intro}</p> : null}
      {sections.map((s, i) => (
        <React.Fragment key={i}>
          {s.title ? (
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              {s.url ? <a href={s.url} className="hover:text-primary">{s.title}</a> : s.title}
            </h2>
          ) : null}
          <ProductList items={s.items} />
        </React.Fragment>
      ))}
    </main>
  );
}

function productLinks(model: CatalogModel): Map<string, ProductLink> {
  const map = new Map<string, ProductLink>();
  model.products.forEach((p) => {
    if (map.has(p.displayName)) return;
    map.set(p.displayName, {
      name: p.displayName,
      url: productPath(p),
      detail: [p.strength, p.form].map((v) => String(v || '').trim()).filter(Boolean).join(' · '),
    });
  });
  return map;
}

function conditionHeading(name: string): string {
  const n = String(name || '').trim();
  return /\b(medicines?|media)$/i.test(n) ? n : `${n} Medicines`;
}

function listingDescription(label: string, sampleNames: string[]): string {
  return sampleNames.length
    ? `Browse Getmeds' ${label} medicines available in the Philippines, including ${sampleNames.join(', ')}. FDA Philippines-licensed distributor, prescription-based ordering, nationwide delivery.`
    : `Browse Getmeds' ${label} medicines available in the Philippines. FDA Philippines-licensed distributor, prescription-based ordering, nationwide delivery.`;
}

interface FolderGroup {
  folder: string;
  name: string;
  productNames: string[];
}

function folderGroups(model: CatalogModel): Map<string, FolderGroup> {
  const groups = new Map<string, FolderGroup>();
  model.products.forEach((p) => {
    const folder = p.categoryFolder;
    if (!folder) return;
    if (!groups.has(folder)) groups.set(folder, { folder, name: p.category || folder, productNames: [] });
    const g = groups.get(folder)!;
    if (!g.productNames.includes(p.displayName)) g.productNames.push(p.displayName);
  });
  return groups;
}

function foldersPerCategory(groups: Map<string, FolderGroup>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  groups.forEach((g, folder) => {
    if (!map.has(g.name)) map.set(g.name, []);
    map.get(g.name)!.push(folder);
  });
  return map;
}

// ---- Page builders -------------------------------------------------------------------

/** /product-range and /conditions — "Products", canonical /product-range. */
export function allProductsSeo(model: CatalogModel): CatalogPageSeo {
  const canonicalPath = '/product-range';
  const links = productLinks(model);
  const groups = folderGroups(model);
  const perCat = foldersPerCategory(groups);
  const sections = [...groups.entries()].map(([folder, g]) => ({
    title: g.name === folderDisplayName(folder) || (perCat.get(g.name) || []).length < 2 ? g.name : `${g.name} — ${folderDisplayName(folder)}`,
    url: `/${folder}`,
    items: g.productNames.map((n) => links.get(n)).filter((x): x is ProductLink => !!x),
  }));
  return {
    metadata: buildMetadata({ title: 'Products', description: ALL_PRODUCTS_DESCRIPTION, canonicalPath, ogType: 'website' }),
    jsonLd: [
      {
        id: 'jsonld-medical-webpage',
        data: { '@type': 'CollectionPage', name: 'Product Range — Getmeds Philippines', url: `${DOMAIN}${canonicalPath}` },
      },
    ],
    baked: <ListingMarkup heading="Product Range" intro={ALL_PRODUCTS_DESCRIPTION} sections={sections} />,
  };
}

/** A Category Folder listing, e.g. /antibiotics. */
export function categorySeo(model: CatalogModel, folder: string): CatalogPageSeo {
  const groups = folderGroups(model);
  const group = groups.get(folder) || { folder, name: folderDisplayName(folder), productNames: [] };
  const perCat = foldersPerCategory(groups);
  const qualifier = (perCat.get(group.name) || []).length > 1 ? ` — ${folderDisplayName(folder)}` : '';
  const canonicalPath = `/${folder}`;
  const description = listingDescription(group.name, group.productNames.slice(0, 3));
  const links = productLinks(model);
  const inFolder = [...conditionGroups(model).values()].filter((g) => g.folder === folder);
  const listed = new Set<string>();
  const sections: Array<{ title?: string; url?: string; items: ProductLink[] }> = inFolder.map((g) => {
    const items = g.productNames.map((n) => links.get(n)).filter((x): x is ProductLink => !!x);
    items.forEach((i) => listed.add(i.name));
    return { title: g.name, url: g.hubPath, items };
  });
  const rest = group.productNames.filter((n) => !listed.has(n)).map((n) => links.get(n)).filter((x): x is ProductLink => !!x);
  if (rest.length) sections.push({ title: sections.length ? 'Other products' : '', items: rest });
  const label = `${group.name}${qualifier}`;
  return {
    metadata: buildMetadata({ title: label, description, canonicalPath, ogType: 'website', ogImage: ogImageForFolder(folder) }),
    jsonLd: [
      {
        id: 'jsonld-medical-webpage',
        data: { '@type': 'CollectionPage', name: `${label} Medicines in the Philippines`, url: `${DOMAIN}${canonicalPath}` },
      },
      { id: 'jsonld-breadcrumb', data: breadcrumbList([{ name: 'All Products', url: '/product-range' }, { name: label }]) },
    ],
    baked: (
      <ListingMarkup
        trail={[{ name: 'All Products', url: '/product-range' }, { name: label }]}
        heading={label}
        intro={description}
        sections={sections}
      />
    ),
  };
}

/** A condition listing — /conditions/<slug> or /<folder>/<condition-slug>. */
export function conditionSeo(model: CatalogModel, group: ConditionGroup | undefined, fallbackName: string, requestPath: string): CatalogPageSeo {
  const name = group?.name || fallbackName;
  const canonicalPath = group?.hubPath || requestPath;
  const description = listingDescription(name, (group?.productNames || []).slice(0, 3));
  const specialty = specialtyUrl(group?.specialty) || specialtyUrl(group?.category);
  const trail: Crumb[] = [
    { name: 'All Products', url: '/product-range' },
    ...(group?.category && group?.folder ? [{ name: group.category, url: `/${group.folder}` }] : []),
    { name },
  ];
  const links = productLinks(model);
  const items = (group?.productNames || []).map((n) => links.get(n)).filter((x): x is ProductLink => !!x);
  return {
    metadata: buildMetadata({ title: name, description, canonicalPath, ogType: 'website', ogImage: CONDITIONS_OG_IMAGE }),
    jsonLd: [
      {
        id: 'jsonld-medical-webpage',
        data: {
          '@type': 'MedicalWebPage',
          name: `${name} Medicines in the Philippines`,
          description,
          inLanguage: 'en-PH',
          about: {
            '@type': 'MedicalCondition',
            name,
            ...(group?.filipinoName ? { alternateName: group.filipinoName } : {}),
          },
          ...(specialty ? { specialty } : {}),
          url: `${DOMAIN}${canonicalPath}`,
          ...conditionReviewFields(group?.lastReviewed, group?.reviewedBy),
          publisher: { '@id': ORGANIZATION_ID },
        },
      },
      { id: 'jsonld-breadcrumb', data: breadcrumbList(trail) },
    ],
    baked: <ListingMarkup trail={trail} heading={conditionHeading(name)} intro={description} sections={[{ items }]} />,
  };
}

function productBreadcrumbTrail(p: CatalogProduct, folder: string | undefined): Crumb[] | null {
  const parts = String(p.breadcrumb || '')
    .split('>')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part.toLowerCase() !== 'home');
  const rest = parts.length ? parts : [p.subCategory || p.category, p.displayName].filter((x): x is string => !!x);
  if (!rest.length) return null;
  return [
    { name: 'Home', url: '/' },
    ...rest.map((name, idx): Crumb => {
      const isLast = idx === rest.length - 1;
      if (isLast || !folder) return { name };
      if (idx === 0) return { name, url: `/${folder}` };
      if (idx === rest.length - 2) return { name, url: `/${folder}/${p.conditionSlug ? p.conditionSlug : slugify(name)}` };
      return { name };
    }),
  ];
}

/** A product page, e.g. /cancer-medicines/<slug>. */
export function productSeo(model: CatalogModel, p: CatalogProduct): CatalogPageSeo {
  const folder = p.categoryFolder;
  const displayName = p.displayName;
  const isBranded = Boolean(p.brandName && p.genericName && p.brandName !== p.genericName);
  const description = truncateAtWord(
    p.metaDescription || `${displayName} — available through Getmeds Philippines. Quality pharmaceutical product for healthcare needs.`,
    160
  );
  const canonicalPath = productPath(p);

  // Condition name -> hub URL across the catalogue, for the "Used for" list.
  const conditionUrlByName = new Map<string, string>();
  model.products.forEach((row) => {
    const n = String(row.subCategory || '').trim();
    if (!n || !row.conditionSlug || conditionUrlByName.has(n.toLowerCase())) return;
    conditionUrlByName.set(n.toLowerCase(), row.conditionHubUrl ? `/${row.conditionHubUrl.replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '')}` : `/conditions/${row.conditionSlug}`);
  });
  const conditions = (p.conditions.length ? p.conditions : [p.subCategory])
    .map((n) => String(n || '').trim())
    .filter(Boolean)
    .filter((n, i, all) => all.indexOf(n) === i)
    .map((n) => ({ name: n, url: conditionUrlByName.get(n.toLowerCase()) }))
    .filter((c): c is { name: string; url: string } => !!c.url);

  const facts: Array<[string, string]> = [];
  if (p.genericName) facts.push(['Generic name', p.genericName]);
  if (p.strength) facts.push(['Strength', p.strength]);
  if (p.form) facts.push(['Dosage form', p.form]);
  facts.push(['Prescription', 'Prescription only (Rx)']);

  const trail = productBreadcrumbTrail(p, folder);

  return {
    metadata: buildMetadata({
      title: p.metaTitle || displayName,
      description,
      canonicalPath,
      ogType: 'product',
      ogImage: ogImageForFolder(folder),
    }),
    jsonLd: [
      {
        id: 'jsonld-drug',
        data: {
          '@type': 'Drug',
          name: displayName,
          ...(isBranded ? { alternateName: String(p.brandName).trim() } : {}),
          ...(p.genericName ? { nonProprietaryName: p.genericName, activeIngredient: p.genericName } : {}),
          isProprietary: isBranded,
          ...(p.strength || p.form ? { dosageForm: [p.form, p.strength].filter(Boolean).join(', ') } : {}),
          description,
          url: `${DOMAIN}${canonicalPath}`,
          legalStatus: 'Prescription only medicine (Rx), Philippines',
          prescriptionStatus: 'PrescriptionOnly',
          ...(p.manufacturer ? { manufacturer: { '@type': 'Organization', name: p.manufacturer } } : {}),
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${DOMAIN}${canonicalPath}`,
            publisher: { '@id': ORGANIZATION_ID },
          },
        },
      },
      { id: 'jsonld-breadcrumb', data: trail ? breadcrumbList(trail) : null },
    ],
    baked: (
      <main className="max-w-5xl mx-auto px-4 pt-28 pb-16 text-gray-800">
        <Crumbs
          trail={[
            { name: 'All Products', url: '/product-range' },
            ...(folder ? [{ name: folderDisplayName(folder), url: `/${folder}` }] : []),
            { name: displayName },
          ]}
        />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">{displayName}</h1>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-8 max-w-xl">
          {facts.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-gray-500">{k}</dt>
              <dd className="text-gray-900">{v}</dd>
            </React.Fragment>
          ))}
        </dl>
        {conditions.length ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Used for</h2>
            <ul className="flex flex-wrap gap-2 mb-8">
              {conditions.map((c) => (
                <li key={c.name}>
                  <a href={c.url} className="inline-block text-xs border border-gray-200 rounded-full px-3 py-1 hover:text-primary">{c.name}</a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {p.indications ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Indications</h2>
            <Paragraphs text={p.indications} />
          </>
        ) : null}
        {p.dosageAdministration ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Dosage and administration</h2>
            <Paragraphs text={p.dosageAdministration} />
          </>
        ) : null}
        <p className="text-sm text-gray-700 mt-8">
          Prescription medicine, supplied by Getmeds, an FDA Philippines-licensed distributor.{' '}
          <a href="/order-medicines" className="text-primary underline">Request a quotation</a>.
        </p>
      </main>
    ),
  };
}

/** /product-detail — the bare shell (noindex, "Product Details"). */
export const productDetailShellMetadata: Metadata = {
  title: { absolute: 'Product Details - Getmeds' },
  robots: { index: false, follow: true },
};
