import { Fragment } from 'react';
import type { Metadata } from 'next';
import { buildHtmlSitemapSections, type HtmlSitemapLink } from '@/lib/sitemapData';
import './sitemap.css';

// Port of sitemap.html. Its link block (between the SITEMAP:START/END markers) was
// rewritten on every build by scripts/generate-sitemap.cjs from the same data as the XML
// sitemaps; here it is built from that data at render time and refreshed daily.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: 'Sitemap - All Pages, Medicines & Articles | Getmeds' },
  description:
    'Browse every page on Getmeds Philippines in one place: medicine categories, products, conditions, ordering options, company information, policies and blog articles.',
  alternates: { canonical: 'https://getmeds.ph/sitemap' },
};

function LinkList({ links }: { links: HtmlSitemapLink[] }) {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-[15px]">
      {links.map((l, i) => (
        <li key={`${l.href}-${i}`}>
          <a href={l.href} className="text-gray-600 hover:text-primary transition-colors">{l.label}</a>
        </li>
      ))}
    </ul>
  );
}

export default async function SitemapPage() {
  const sections = await buildHtmlSitemapSections();

  return (
    <div data-theme="notfound" data-page="sitemap" className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-20">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2">Sitemap</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-dark mb-3">Every page on Getmeds</h1>
        <p className="text-gray-500 max-w-2xl">
          A complete index of the site. Search engines can use the{' '}
          <a href="/sitemap.xml" className="text-primary hover:underline">XML sitemap</a> and{' '}
          <a href="/image-sitemap.xml" className="text-primary hover:underline">image sitemap</a>.
        </p>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12 scroll-mt-28">
            <h2 className="text-xl md:text-2xl font-bold text-dark mb-5 pb-3 border-b border-gray-200">
              {section.title} <span className="text-sm font-medium text-gray-400">({section.count})</span>
            </h2>
            {section.groups
              ? section.groups.map((group) => (
                  <Fragment key={group.heading}>
                    <h3 className="text-base font-semibold text-primary mt-6 mb-3">{group.heading}</h3>
                    <LinkList links={group.links} />
                  </Fragment>
                ))
              : <LinkList links={section.links || []} />}
          </section>
        ))}
      </div>
    </div>
  );
}
