// Shared server pieces of the catalogue hub pages (/product-range, /prescription-medicines,
// /cancer-medicines). Copy lives in lib/catalogueHub.ts; counts and links come from the catalogue.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import Faq from "@/components/Faq";
import { Reveal } from "@/components/ui";
import { conditionGroups, productPath, type CatalogModel, type CatalogProduct } from "@/lib/catalogServer";
import { cancerRibbons, type CategoryCardDef, type ConditionChip, type HubFaq } from "@/lib/catalogueHub";
import { plainGenericName, productCrumbLabel } from "@/lib/productFaq";

export const hubLink = "font-semibold text-primary transition hover:text-primary-deep";

/* Blue call-to-action band and its white pill button, on the Oncology and condition pages. */
export const hubBanner = "flex flex-col gap-4 rounded-3xl bg-[#1D9FDA] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8";
export const hubBannerButton = "shrink-0 rounded-full bg-white px-7 py-3 text-center text-sm font-semibold text-primary transition hover:bg-white/90";

export function HubPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white pb-16 pt-28 md:pb-24 md:pt-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10">{children}</div>
    </div>
  );
}

import { Breadcrumb as HubBreadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
export { HubBreadcrumb, type BreadcrumbItem };

/** `wide`: the intro runs the full page width in a slightly smaller size. */
export function HubHeading({ title, text, wide }: { title: string; text: string; wide?: boolean }) {
  return (
    <Reveal immediate>
      <h1 className="font-display mt-6 text-[clamp(1.85rem,7.2vw,2.2rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(2rem,3.5vw+0.2rem,3.2rem)]">{title}</h1>
      <p className={`mt-4 leading-relaxed text-ink-soft ${wide ? "text-[14px] md:text-[15px]" : "max-w-3xl text-[15px] md:text-base"}`}>{text}</p>
    </Reveal>
  );
}

/* Sliding strip of cancer awareness ribbons, on the site's marquee (pauses on hover). The list is doubled for the loop. */
export function RibbonMarquee() {
  return (
    <div className="relative mt-6 overflow-hidden">
      <div className="marquee-track items-center motion-reduce:[animation-play-state:paused]">
        {[...cancerRibbons, ...cancerRibbons].map(({ file, label }, i) => (
          <Image
            key={i}
            src={`/images/ribbons/${file}.webp`}
            alt={i < cancerRibbons.length ? `${label} cancer awareness ribbon` : ""}
            aria-hidden={i >= cancerRibbons.length || undefined}
            width={200}
            height={226}
            loading="eager"
            className="mx-3 h-24 w-auto shrink-0 mix-blend-multiply md:mx-4 md:h-28"
          />
        ))}
      </div>
    </div>
  );
}

export function HubSectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-black md:text-[2rem]">{children}</h2>;
}

const productCount = (n: number) => `${n} ${n === 1 ? "product" : "products"}`;

const cardShell = "flex h-full flex-col rounded-3xl border p-5 transition";

/** One category tile; `withText` is the fuller version on /prescription-medicines. */
export function CategoryCard({ card, model, highlight, withText }: { card: CategoryCardDef; model: CatalogModel; highlight?: boolean; withText?: boolean }) {
  if (!card.folders.length) {
    return (
      <div className={`${cardShell} border-gray-200 bg-[#f3f6f9]`}>
        <span className="font-display text-[15px] font-semibold text-black">{card.name}</span>
        {withText && <span className="mt-1 text-[13px] leading-snug text-ink-soft">{card.text}</span>}
        <span className="mt-1 text-[13px] text-ink-soft">For hospitals only</span>
      </div>
    );
  }
  const count = model.products.filter((p) => card.folders.includes(p.categoryFolder || "")).length;
  return (
    <Link
      href={card.listCategory ? `/product-range?category=${card.listCategory}` : `/${card.folders[0]}`}
      className={`${cardShell} hover:-translate-y-1 ${highlight ? "border-primary bg-primary-soft" : "border-gray-200 bg-white hover:border-primary"}`}
    >
      <span className={`font-display text-[15px] font-semibold ${highlight ? "text-primary-deep" : "text-black"}`}>{card.name}</span>
      {withText && <span className="mt-1 text-[13px] leading-snug text-ink-soft">{card.text}</span>}
      {/* always right under the name (mt-auto pushed it to the bottom only on cards sharing a row with a taller one) */}
      <span className="mt-1 text-[13px] font-medium text-primary-deep">{productCount(count)}{withText && " →"}</span>
    </Link>
  );
}

/** One medicine tile on the category and condition pages. */
export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <Link href={productPath(product)} className="group flex flex-col rounded-3xl border border-gray-200 bg-white p-4 transition hover:-translate-y-1 hover:border-primary">
      <span className="relative block aspect-[16/9] overflow-hidden rounded-2xl bg-[#f3f6f9]">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={`${productCrumbLabel(product)} pack`} loading="lazy" className="h-full w-full object-contain p-2 mix-blend-multiply" />
        )}
      </span>
      {/rx/i.test(product.prescription || "") && (
        <span className="mt-3 self-start rounded-full bg-[#e4f2dc] px-2.5 py-0.5 text-[11px] font-semibold text-[#3f7a28]">Rx</span>
      )}
      <span className="font-display mt-2 text-[15px] font-semibold text-black">{productCrumbLabel(product)}</span>
      <span className="mt-1 flex-1 text-[13px] leading-snug text-ink-soft">
        {plainGenericName(product.genericName)}{product.form && ` · ${product.form}`}
      </span>
      <span className="mt-2 text-[13px] font-semibold text-primary">View product →</span>
    </Link>
  );
}

export function ConditionChips({ chips, model, allLabel }: { chips: ConditionChip[]; model: CatalogModel; allLabel: string }) {
  const groups = conditionGroups(model);
  const pill = "rounded-full px-4 py-2.5 text-[13px] font-semibold";
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {chips.map((chip) => {
        const href = chip.href ?? (chip.slug ? groups.get(chip.slug)?.hubPath : undefined);
        return href ? (
          <Link key={chip.label} href={href} className={`${pill} bg-primary-soft text-primary-deep transition hover:bg-primary hover:text-white`}>
            {chip.label}
          </Link>
        ) : (
          <span key={chip.label} className={`${pill} bg-[#f3f6f9] font-medium text-ink-soft`}>{chip.label}</span>
        );
      })}
      <Link href="/conditions" className={`${pill} border border-primary text-primary transition hover:bg-primary-soft`}>
        {allLabel}
      </Link>
    </div>
  );
}

/* Our accordion, in two columns like the Order Medicines FAQ; every answer stays in the HTML for the FAQPage schema. */
export function FaqGrid({ items }: { items: HubFaq[] }) {
  const faqs = items.map((f) => ({ ...f, schema: true }));
  const half = Math.ceil(faqs.length / 2);
  return (
    <div className="mt-6 grid items-start gap-x-10 gap-y-0 md:grid-cols-2 lg:gap-x-14">
      <Faq items={faqs.slice(0, half)} theme="white" idPrefix="hub-faq-col1" initialOpen={null} />
      <Faq items={faqs.slice(half)} theme="white" idPrefix="hub-faq-col2" initialOpen={null} className="max-md:border-t-0" />
    </div>
  );
}

export function OrderFaqLink() {
  return (
    <p className="mt-5 text-sm text-ink-soft">
      More questions about ordering? See our{" "}
      <Link href="/order-medicines#faq" className={hubLink}>
        Order Medicines FAQ <ArrowRight aria-hidden className="inline h-3.5 w-3.5" />
      </Link>
    </p>
  );
}
