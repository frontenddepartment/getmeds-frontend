// A condition page from the website prototype, e.g. /conditions/breast-cancer: the condition's
// reviewed information (once it exists) and the Getmeds medicines filed under it.
import Link from 'next/link';
import { HubBreadcrumb, HubHeading, HubPage, ProductCard, hubBanner, hubBannerButton, hubLink } from '@/components/CatalogueHub';
import type { CatalogModel, ConditionGroup } from '@/lib/catalogServer';
import { JsonLdScripts, conditionCrumbs, type CatalogPageSeo } from '@/lib/catalogSeo';
import { conditionContent } from '@/lib/catalogueHub';
import { conditionReviewFields } from '@/lib/seo';

const reviewDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export default function ConditionHub({ model, group, seo }: { model: CatalogModel; group: ConditionGroup; seo: CatalogPageSeo }) {
  const products = model.products.filter((p) => group.productNames.includes(p.displayName));
  const content = conditionContent[group.slug];
  const review = conditionReviewFields(group.lastReviewed, group.reviewedBy);

  return (
    <>
      <JsonLdScripts blocks={seo.jsonLd} />
      {/* the footer sits flush under the page, as on product pages (the style unmounts with the page) */}
      <style>{'footer{margin-top:0!important}'}</style>
      <HubPage>
        <HubBreadcrumb
          trail={[
            { label: 'Home', href: '/' },
            ...conditionCrumbs(model, group).map((c, i, all) => ({ label: c.name, href: i < all.length - 1 ? c.url : undefined })),
          ]}
        />
        {group.category && group.folder && (
          <Link href={`/${group.folder}`} className="mt-6 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-deep">
            {group.category}
          </Link>
        )}
        <HubHeading title={group.name} text={seo.metadata.description || ''} />
        {review.lastReviewed && (
          <p className="mt-3 text-[13px] text-ink-soft">
            Medically reviewed by {review.reviewedBy.name} · Last reviewed {reviewDate(review.lastReviewed)}
          </p>
        )}

        {content && (
          <div className="mt-6 grid gap-6 rounded-3xl border border-gray-200 bg-white p-6 md:grid-cols-2">
            {content.map(({ title, text }) => (
              <section key={title}>
                <h2 className="font-display text-lg font-semibold text-black">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</p>
              </section>
            ))}
          </div>
        )}

        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-black md:text-[2rem]">{group.name} medicines available at Getmeds</h2>
            <span className="shrink-0 text-sm text-ink-soft">{products.length} {products.length === 1 ? 'product' : 'products'}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id || product.slug} product={product} />)}
          </div>
        </section>

        <aside className={`mt-8 ${hubBanner}`}>
          <p className="font-display text-lg font-semibold">Looking for a medicine for {group.name}? Send an inquiry for a price quote.</p>
          <Link href="/contact-us" className={hubBannerButton}>
            Send inquiry
          </Link>
        </aside>

        <p className="mt-6 text-[13px] text-ink-soft">
          This page is for information and does not replace advice from your doctor. See our <Link href="/medical-disclaimer" className={hubLink}>Medical Disclaimer</Link>.
        </p>
      </HubPage>
    </>
  );
}
