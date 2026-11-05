// Conditions A–Z from the website prototype: /conditions. A name links once its condition page exists.
import ConditionsSearch, { type ConditionCard } from '@/components/ConditionsSearch';
import { HubBreadcrumb, HubHeading, HubPage, RibbonMarquee } from '@/components/CatalogueHub';
import { conditionGroups, type CatalogModel } from '@/lib/catalogServer';
import { JsonLdScripts, conditionsIndexSeo } from '@/lib/catalogSeo';
import { conditionsAZ } from '@/lib/catalogueHub';

export default function ConditionsIndex({ model }: { model: CatalogModel }) {
  const groups = conditionGroups(model);
  // Resolved here on the server: the search box gets plain data (label + live page link, if any)
  const cards: ConditionCard[] = conditionsAZ.map(({ name, items }) => ({
    name,
    items: items.map(({ label, s }) => {
      const href = s ? groups.get(s)?.hubPath : undefined;
      return href ? { label, href } : { label };
    }),
  }));
  return (
    <>
      <JsonLdScripts blocks={conditionsIndexSeo().jsonLd} />
      <HubPage>
        <HubBreadcrumb trail={[{ label: 'Home', href: '/' }, { label: 'Conditions' }]} />
        <HubHeading
          wide
          title="Conditions"
          text="Conditions grouped by category, from oncology and hematology to anti-infectives, endocrinology and cardiology. Each page has medically reviewed information and the Getmeds medicines used to treat it."
        />
        <RibbonMarquee />
        <ConditionsSearch cards={cards} />
        <p className="mt-5 text-[13px] text-ink-soft">Blue = condition page is live. Others show as plain text until their page is published.</p>
      </HubPage>
    </>
  );
}
