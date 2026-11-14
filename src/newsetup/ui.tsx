/**
 * NEW SETUP — UI primitives for the added workflows, in v2's visual language
 * (primary #1d9fda, deep #073b57, soft #e3f4fc, Poppins headings, rounded cards, pill buttons).
 */
import Link from "next/link";
import { CheckCircle2, CircleAlert, Info, Mail, Phone, TriangleAlert } from "lucide-react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import { absoluteUrl } from "@/lib/site";
import "./newsetup.css";

/** Page frame for new-setup pages: breadcrumb, eyebrow label, single H1, intro, optional aside. */
export function NsPage({
  eyebrow,
  title,
  intro,
  trail,
  aside,
  children,
  jsonLd,
  path,
  layout,
  help,
  options,
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  trail: BreadcrumbItem[];
  aside?: React.ReactNode;
  children: React.ReactNode;
  /** Extra structured data for this page (e.g. FAQPage). */
  jsonLd?: object;
  /** Canonical path of this page, used as the last breadcrumb item's URL. */
  path?: string;
  /** "form": split layout — intro + contact details left, the form in a white card right. */
  layout?: "form";
  /** Short help line shown above the contact details in the form layout. */
  help?: string;
  /** Option cards shown under the contact details in the form layout (see FormOptions). */
  options?: React.ReactNode;
}) {
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href || (i === trail.length - 1 && path) ? { item: absoluteUrl(c.href ?? path!) } : {}),
    })),
  };
  return (
    <div lang="en" className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd ? [crumbs, jsonLd] : crumbs) }} />
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-28 md:px-10 md:pt-32">
        <Breadcrumb trail={trail} />
        {layout === "form" ? (
          <FormPanel className="mt-6" eyebrow={eyebrow} title={title} as="h1" intro={intro} help={help} options={options}>
            {children}
          </FormPanel>
        ) : (
          <>
        <div className="mt-6 max-w-3xl">
          {eyebrow && <span className="ns-label">{eyebrow}</span>}
          <h1 className="font-display mt-4 text-3xl font-medium leading-tight text-primary-deep md:text-[2.5rem]">{title}</h1>
          {intro && <div className="mt-4 leading-relaxed text-ink-soft">{intro}</div>}
        </div>
        <div className={`mt-10 ${aside ? "grid gap-8 lg:grid-cols-[1fr_20rem]" : ""}`}>
          <div className="min-w-0 space-y-6">{children}</div>
          {aside && <aside className="space-y-6">{aside}</aside>}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Headline with the first word bold and the rest light ("**Discuss** your needs"). */
function SplitTitle({ text }: { text: string }) {
  const i = text.indexOf(" ");
  if (i < 0) return <span className="font-semibold">{text}</span>;
  return (
    <>
      <span className="font-semibold">{text.slice(0, i)}</span>
      <span className="font-light">{text.slice(i)}</span>
    </>
  );
}

/**
 * Shared form layout for every form on the site: a light rounded panel with the intro, help line and
 * verified Getmeds contact details on the left, and the form itself in a raised white card on the right.
 */
export function FormPanel({
  eyebrow,
  title,
  as: H = "h2",
  id,
  intro,
  help,
  options,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  as?: "h1" | "h2";
  id?: string;
  intro?: React.ReactNode;
  help?: string;
  options?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ns-formpanel grid gap-8 rounded-[2rem] bg-[#f3f5f7] p-5 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0 lg:p-14 ${className}`}>
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">{eyebrow}</p>}
        <H id={id} className="font-display mt-3 text-3xl leading-[1.15] tracking-tight text-[#0f2433] md:text-[2.5rem]">
          <SplitTitle text={title} />
        </H>
        {intro && <div className="mt-4 text-sm leading-relaxed text-[#5b6670] md:text-[15px]">{intro}</div>}
        {help && <p className="mt-6 text-sm font-medium text-[#0f2433]">{help}</p>}
        <ul className="mt-5 space-y-4">
          <li className="flex items-center gap-4">
            <Mail aria-hidden className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-sm">
              <span className="block text-xs text-[#6b7280]">E-mail</span>
              <a href="mailto:info@getmeds.ph" className="font-medium text-[#0f2433] hover:text-primary">info@getmeds.ph</a>
            </span>
          </li>
          <li className="flex items-center gap-4">
            <Phone aria-hidden className="h-6 w-6 shrink-0 text-primary" />
            <span className="text-sm">
              <span className="block text-xs text-[#6b7280]">Call / Viber</span>
              <a href="tel:+639190769105" className="font-medium text-[#0f2433] hover:text-primary">+63 919 076 9105</a>
            </span>
          </li>
        </ul>
      </div>
      {/* phones: intro → form → options; desktop: options stay under the intro, the form spans both rows */}
      <div className="ns-form-card min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start rounded-2xl bg-white p-5 shadow-[0_24px_60px_-28px_rgba(15,36,51,0.28)] ring-1 ring-black/[0.04] sm:p-8">{children}</div>
      {options && <div className="min-w-0 lg:col-start-1 lg:row-start-2">{options}</div>}
    </div>
  );
}

/** Section heading inside new-setup pages. */
export function NsSection({ title, id, children, className = "" }: { title?: string; id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={title && id ? `${id}-h` : undefined} className={`scroll-mt-28 ${className}`}>
      {title && (
        <h2 id={id ? `${id}-h` : undefined} className="font-display mb-4 text-xl font-semibold text-primary-deep md:text-2xl">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

const TONE = {
  info: { icon: Info, cls: "border-[#cfe7f5] bg-[#f3fafe] text-[#073b57]" },
  warn: { icon: TriangleAlert, cls: "border-[#f2d49b] bg-[#fff8e6] text-[#6b4a00]" },
  error: { icon: CircleAlert, cls: "border-[#f3c9c9] bg-[#fdf1f0] text-[#b00020]" },
  success: { icon: CheckCircle2, cls: "border-[#cbe6bd] bg-[#f2faee] text-[#2f6b17]" },
} as const;

export function Notice({ title, children, kind = "info" }: { title?: string; children: React.ReactNode; kind?: keyof typeof TONE }) {
  const { icon: Icon, cls } = TONE[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${cls}`}>
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}

export function LinkButton({ href, children, primary, small }: { href: string; children: React.ReactNode; primary?: boolean; small?: boolean }) {
  return (
    <Link href={href} className={`ns-btn ${primary ? "ns-btn-primary" : ""} ${small ? "ns-btn-sm" : ""}`}>
      {children}
    </Link>
  );
}

/** Numbered progress for multi-step forms. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap gap-2 text-sm" aria-label="Progress">
      {steps.map((s, i) => (
        <li
          key={s}
          aria-current={i === current ? "step" : undefined}
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${
            i === current ? "bg-primary font-semibold text-white" : i < current ? "bg-primary-soft text-primary-deep" : "border border-[#dde9f2] text-ink-soft"
          }`}
        >
          <span aria-hidden className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${i === current ? "bg-white text-primary" : "bg-white/70"}`}>
            {i < current ? "✓" : i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
}

/** Ordered flow: 1 → 2 → 3 */
export function FlowSteps({ steps }: { steps: { title: string; text?: string }[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="rounded-2xl border border-[#dde9f2] bg-white p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{i + 1}</span>
          <p className="font-display mt-3 font-semibold text-primary-deep">{s.title}</p>
          {s.text && <p className="mt-1 text-sm text-ink-soft">{s.text}</p>}
        </li>
      ))}
    </ol>
  );
}

export function KeyValue({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="font-semibold text-primary-deep">{k}</dt>
          <dd className="text-ink-soft">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Persistent help box (verified Getmeds contact details). */
export function NsHelp({ title = "Need help?", text }: { title?: string; text?: string }) {
  return (
    <div className="rounded-2xl bg-primary-soft p-5 text-sm">
      <p className="font-display text-base font-semibold text-primary-deep">{title}</p>
      <p className="mt-1 text-ink-soft">{text ?? "Talk to our customer care or trade sales team."}</p>
      <ul className="mt-3 space-y-1.5">
        <li>
          Call / Viber: <a className="font-semibold text-primary" href="tel:+639190769105">+63 919 076 9105</a>
        </li>
        <li>
          Email: <a className="font-semibold text-primary" href="mailto:info@getmeds.ph">info@getmeds.ph</a>
        </li>
        <li>
          <Link className="font-semibold text-primary" href="/contact-us">Contact form</Link> ·{" "}
          <Link className="font-semibold text-primary" href="/track-order">Track a request</Link>
        </li>
      </ul>
    </div>
  );
}

/** Marks pages/sections whose submissions are simulated in this branch. */
export function PrototypeBadge({ children = "Prototype — saved on this device only, not sent to Getmeds yet" }: { children?: React.ReactNode }) {
  return <p className="ns-proto">{children}</p>;
}
