// Conditions A–Z from the website prototype: /conditions. A name links once its condition page exists.
import Link from 'next/link';
import { HubBreadcrumb, HubHeading, HubPage } from '@/components/CatalogueHub';
import { conditionGroups, type CatalogModel } from '@/lib/catalogServer';
import { JsonLdScripts, conditionsIndexSeo } from '@/lib/catalogSeo';
import { conditionsAZ } from '@/lib/catalogueHub';

export default function ConditionsIndex({ model }: { model: CatalogModel }) {
  const groups = conditionGroups(model);
  return (
    <>
      <JsonLdScripts blocks={conditionsIndexSeo().jsonLd} />
      <HubPage>
        <HubBreadcrumb trail={[{ label: 'Home', href: '/' }, { label: 'Conditions' }]} />
        <HubHeading
          title="Conditions"
          text="Conditions grouped by category, from oncology and hematology to anti-infectives, endocrinology and cardiology. Each page has medically reviewed information and the Getmeds medicines used to treat it."
        />
        <div className="mt-10 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conditionsAZ.map(({ name, items }) => (
            <section key={name} className="rounded-3xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display font-semibold leading-snug text-black">{name}</h2>
                <span className="mt-0.5 text-xs text-ink-soft">{items.length}</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-black">
                {items.map(({ label, s }) => {
                  const href = s ? groups.get(s)?.hubPath : undefined;
                  return (
                    <li key={label}>
                      {href ? <Link href={href} className="font-semibold text-primary hover:underline">{label} →</Link> : label}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-5 text-[13px] text-ink-soft">Blue = condition page is live. Others show as plain text until their page is published.</p>
      </HubPage>
    </>
  );
}
