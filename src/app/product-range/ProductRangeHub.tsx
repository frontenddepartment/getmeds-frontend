import Link from "next/link";
import { ArrowRight, Leaf, Pill, Stethoscope } from "lucide-react";
import {
  CategoryCard, ConditionChips, FaqGrid, HubBreadcrumb, HubHeading, HubPage, HubSectionTitle, OrderFaqLink, RibbonMarquee, hubLink,
} from "@/components/CatalogueHub";
import FaqSchema from "@/components/FaqSchema";
import type { CatalogModel } from "@/lib/catalogServer";
import { otherRanges, prescriptionCategories, productRangeConditions, productRangeFaqs } from "@/lib/catalogueHub";
import CatalogueNotice from "./CatalogueNotice";

/* Same icon colours as the order cards on /order-medicines */
const rangeIcons = {
  "over-the-counter-medicines": { Icon: Pill, iconBg: "bg-[#F2B705]" },
  "food-supplements": { Icon: Leaf, iconBg: "bg-[#61A644]" },
  "medical-devices": { Icon: Stethoscope, iconBg: "bg-[#E5484D]" },
};

export default function ProductRangeHub({ model }: { model: CatalogModel }) {
  return (
    <>
      <FaqSchema page="productRange" />
      <CatalogueNotice />
      <HubPage>
        <HubBreadcrumb trail={[{ label: "Home", href: "/" }, { label: "Product range" }]} />
        <HubHeading
          wide
          title="Product range"
          text="Browse the tablets, capsules, injections and infusion vials Getmeds supplies to patients, doctors, pharmacies and hospitals across Luzon, Visayas and Mindanao, and send an inquiry for availability and an official price quote."
        />
        <RibbonMarquee />

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-2xl font-semibold text-black md:text-[2rem]">Prescription medicines</h2>
              <span className="rounded-full bg-[#e4f2dc] px-2.5 py-0.5 text-[11px] font-semibold text-[#3f7a28]">Rx</span>
            </div>
            <Link href="/prescription-medicines" className={`${hubLink} text-sm`}>
              View all prescription medicines <ArrowRight aria-hidden className="inline h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="mt-1.5 text-sm text-ink-soft">
            Cancer medicines, chemotherapy drugs, hematology and hospital medicines. A valid prescription is required for patients.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {prescriptionCategories.map((card, i) => (
              <CategoryCard key={card.name} card={card} model={model} highlight={i === 0} />
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {otherRanges.map(({ slug, title, text, note }) => {
            const { Icon, iconBg } = rangeIcons[slug as keyof typeof rangeIcons];
            return (
              <Link key={slug} href={`/${slug}`} className="flex gap-3.5 rounded-3xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:border-primary">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${iconBg}`}>
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="font-display block font-semibold text-black">{title}</span>
                  <span className="mt-1 block text-sm leading-snug text-ink-soft">{text}{note && ` ${note}`}</span>
                  <span className="mt-1.5 block text-[13px] font-semibold text-primary">Send an inquiry →</span>
                </span>
              </Link>
            );
          })}
        </div>

        <section className="mt-12">
          <HubSectionTitle>Browse by condition</HubSectionTitle>
          <p className="mt-1.5 text-sm text-ink-soft">Looking for medicines for a specific condition? Browse by condition or see all conditions A–Z.</p>
          <ConditionChips chips={productRangeConditions} model={model} allLabel="All conditions →" />
        </section>

        <section className="mt-12">
          <HubSectionTitle>Frequently asked questions</HubSectionTitle>
          <FaqGrid items={productRangeFaqs} />
          <OrderFaqLink />
        </section>
      </HubPage>
    </>
  );
}
