import type { Metadata } from 'next';
import Link from 'next/link';
import { ConditionChips, FaqGrid, HubBreadcrumb, HubHeading, HubPage, HubSectionTitle, ProductCard, hubBanner, hubBannerButton, hubLink } from '@/components/CatalogueHub';
import FaqSchema from '@/components/FaqSchema';
import { getCatalogModel, productPath } from '@/lib/catalogServer';
import { JsonLdScripts, categorySeo } from '@/lib/catalogSeo';
import { cancerMedicineTypes, cancerTypes, oncologyFaqs } from '@/lib/catalogueHub';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// "cancer-medicines" is Oncology's Category Folder. Unlike the other category folders, which
// render the searchable listing in [category]/page.tsx, it has the prototype's own page.
export const revalidate = 3600;

const related = [
  { href: '/blood-disorder-medicines', label: 'Oncology / Hematology (blood cancers)' },
  { href: '/brain-cancer-medicines', label: 'Neuro-Oncology (brain cancer)' },
  { href: '/bone-health-medicines', label: 'Bone Health (bone metastases)' },
];

async function baseGenerateMetadata(): Promise<Metadata> {
  return categorySeo(await getCatalogModel(), 'cancer-medicines').metadata;
}

export default async function CancerMedicinesPage() {
  const model = await getCatalogModel();
  const seo = categorySeo(model, 'cancer-medicines');
  const products = model.products.filter((p) => p.categoryFolder === 'cancer-medicines');
  const medicineTypes = cancerMedicineTypes
    .map((type) => ({
      ...type,
      medicines: type.generics.flatMap((generic) => {
        const product = products.find((p) => p.genericName?.toLowerCase().startsWith(generic.toLowerCase()));
        return product ? [{ generic, href: productPath(product) }] : [];
      }),
    }))
    .filter((type) => type.medicines.length);

  return (
    <>
      <JsonLdScripts blocks={seo.jsonLd} />
      <FaqSchema page="oncology" />
      <HubPage>
        <HubBreadcrumb
          trail={[
            { label: 'Home', href: '/' },
            { label: 'Order medicines', href: '/order-medicines' },
            { label: 'Prescription medicines', href: '/prescription-medicines' },
            { label: 'Oncology' },
          ]}
        />
        <HubHeading
          title="Oncology: Cancer Medicines"
          text="Cancer medicines and chemotherapy drugs, from oral chemotherapy tablets to injection vials, for patients, doctors, pharmacies and hospitals across the Philippines."
        />

        <section className="mt-12">
          <HubSectionTitle>Browse by cancer type</HubSectionTitle>
          <ConditionChips chips={cancerTypes} model={model} allLabel="All conditions A–Z →" />
          <p className="mt-2 text-[13px] text-ink-soft">Linked = condition page is live. Grey = plain text until its page is published.</p>
        </section>

        <section className="mt-12">
          <HubSectionTitle>Browse by medicine type</HubSectionTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {medicineTypes.map(({ title, text, medicines }) => (
              <div key={title} className="rounded-3xl border border-gray-200 bg-white p-5">
                <h3 className="font-display font-semibold text-black">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{text}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-black">
                  {medicines.map(({ generic, href }, i) => (
                    <span key={generic}>
                      {i > 0 && ', '}
                      <Link href={href} className="hover:text-primary hover:underline">{generic}</Link>
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Related:{' '}
            {related.map(({ href, label }, i) => (
              <span key={href}>
                {i > 0 && ' · '}
                <Link href={href} className={hubLink}>{label}</Link>
              </span>
            ))}
          </p>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <HubSectionTitle>All cancer medicines</HubSectionTitle>
            <span className="text-sm text-ink-soft">{products.length} products</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id || product.slug} product={product} />)}
          </div>
        </section>

        <aside className={`mt-12 ${hubBanner}`}>
          <div>
            <h2 className="font-display text-xl font-semibold">Applying for PCSO or DSWD medicine assistance?</h2>
            <p className="mt-1 text-sm text-white/90">Getmeds provides official price quotations for cancer medicines and accepts guarantee letters for eligible programs.</p>
          </div>
          <Link href="/patient-assistance-program" className={hubBannerButton}>
            Learn more about the Patient Assistance Program →
          </Link>
        </aside>

        <section className="mt-12">
          <HubSectionTitle>Frequently asked questions</HubSectionTitle>
          <FaqGrid items={oncologyFaqs} />
        </section>
      </HubPage>
    </>
  );
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export async function generateMetadata(...args: Parameters<typeof baseGenerateMetadata>): Promise<Metadata> {
  return withVidrysSeo(await '/cancer-medicines', await baseGenerateMetadata(...args));
}
