import Link from 'next/link';
import { HubBreadcrumb, HubHeading, HubPage } from '@/components/CatalogueHub';
import { otherRanges } from '@/lib/catalogueHub';

/* OTC, food supplements and medical devices: no products in the sheet yet, so an inquiry page. */
export default function OtherRangePage({ range }: { range: (typeof otherRanges)[number] }) {
  return (
    <HubPage>
      <HubBreadcrumb trail={[{ label: 'Home', href: '/' }, { label: 'Product range', href: '/product-range' }, { label: range.title }]} />
      <HubHeading title={range.title} text={`${range.text}${range.note ? ` ${range.note}` : ''}`} />
      <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <p className="text-[15px] text-ink-soft">
          These products are not listed online yet. Send us an inquiry and our team will confirm availability and send you an official price quote.
        </p>
        <Link href="/contact-us" className="shrink-0 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-white transition hover:brightness-95">
          Send an inquiry →
        </Link>
      </div>
    </HubPage>
  );
}
