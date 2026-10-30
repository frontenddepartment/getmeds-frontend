import type { Metadata } from "next";
import Image from "next/image";
import {
  Gavel,
  Leaf,
  Scale,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/ui";
import SdgCarousel from "./SdgCarousel";
import SdgActions from "./SdgActions";
import { pageMetadata } from "@/lib/pageMeta";
import { SITE_URL } from "@/lib/site";
import { withVidrysSeo } from "@/lib/vidrys/seoOverrides";

const PATH = "/ungc";
const UNGC_URL = "https://unglobalcompact.org";
const DESCRIPTION =
  "Getmeds Philippines is a UN Global Compact member — driving meaningful impact through responsible healthcare, compassion, and sustainable action.";

// The page's own metadata (with the UNGC hero as its share image), with any Vidrys SEO fix on top.
export async function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo(
    PATH,
    pageMetadata({
      title:
        "UN Global Compact Member: Responsible Healthcare in the Philippines",
      description: DESCRIPTION,
      path: PATH,
      image: `${SITE_URL}/assets/bottomright.jpeg`,
    }),
  );
}

const principleGroups = [
  {
    Icon: Scale,
    title: "Human Rights",
    items: [
      "Principle 1: Businesses should support and respect the protection of internationally proclaimed human rights.",
      "Principle 2: Make sure that they are not complicit in human rights abuses.",
    ],
  },
  {
    Icon: Users,
    title: "Labor",
    items: [
      "Principle 3: Uphold the freedom of association and the effective recognition of the right to collective bargaining.",
      "Principle 4: The elimination of all forms of forced and compulsory labor.",
      "Principle 5: The effective abolition of child labor.",
      "Principle 6: The elimination of discrimination in respect of employment and occupation.",
    ],
  },
  {
    Icon: Leaf,
    title: "Environment",
    items: [
      "Principle 7: Support a precautionary approach to environmental challenges.",
      "Principle 8: Undertake initiatives to promote greater environmental responsibility.",
      "Principle 9: Encourage the development and diffusion of environmentally friendly technologies.",
    ],
  },
  {
    Icon: Gavel,
    title: "Anti-Corruption",
    items: [
      "Principle 10: Businesses should work against corruption in all its forms, including extortion and bribery.",
    ],
  },
];

const sdgs = [
  "No Poverty",
  "Zero Hunger",
  "Good Health and Well-Being",
  "Quality Education",
  "Gender Equality",
  "Clean Water and Sanitation",
  "Affordable and Clean Energy",
  "Decent Work and Economic Growth",
  "Industry, Innovation, and Infrastructure",
  "Reduced Inequality",
  "Sustainable Cities and Communities",
  "Responsible Consumption and Production",
  "Climate Action",
  "Life Below Water",
  "Life on Land",
  "Peace, Justice, and Strong Institutions",
  "Partnerships for the Goals",
];

/* "Principle 3: Uphold the..." -> label "Principle 3" + statement; the words are unchanged, only typeset apart */
const splitPrinciple = (p: string) => {
  const i = p.indexOf(": ");
  return { label: p.slice(0, i), text: p.slice(i + 2) };
};

/* AboutPage + breadcrumb, and the UNGC membership stated on the organisation (memberOf) for search engines. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}${PATH}#webpage`,
      url: `${SITE_URL}${PATH}`,
      name: "United Nations Global Compact | Getmeds Philippines",
      description: DESCRIPTION,
      inLanguage: "en-PH",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/bottomright.jpeg`,
      },
      about: { "@id": `${SITE_URL}/#organization` },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "UN Global Compact",
            item: `${SITE_URL}${PATH}`,
          },
        ],
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Getmeds Philippines, Inc.",
      memberOf: {
        "@type": "Organization",
        name: "United Nations Global Compact",
        alternateName: "UNGC",
        url: UNGC_URL,
      },
    },
  ],
};

/* One column of principle groups; "right" mirrors it so it reads toward the centre photo on lg+ */
/* White copy on a coloured panel; the icon badges are frosted glass (the lists keep their exact layout). */
function PrincipleColumn({
  groups,
  align,
}: {
  groups: typeof principleGroups;
  align: "left" | "right";
}) {
  return (
    <div className="space-y-10 text-white">
      {groups.map(({ Icon, title, items }) => (
        <div key={title}>
          <h3
            className={`font-display flex items-center gap-3 text-lg font-semibold ${align === "right" ? "lg:flex-row-reverse" : ""}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-sm">
              <Icon className="h-4.5 w-4.5" aria-hidden />
            </span>
            {title}
          </h3>
          <ol className="mt-4 space-y-4">
            {items.map((p) => {
              const { label, text } = splitPrinciple(p);
              return (
                <li
                  key={p}
                  className={`flex gap-3 ${align === "right" ? "lg:flex-row-reverse lg:text-right" : ""}`}
                >
                  <span
                    aria-hidden
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-white ring-4 ring-white/25"
                  />
                  <span>
                    <span className="block text-[13px] font-semibold text-white">
                      {label}:
                    </span>
                    <span className="mt-0.5 block text-[14.5px] leading-relaxed text-white/85">
                      {text}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

/* Event gallery tiles: three columns, left column a single tall photo, the other two stacked pairs. */
const eventGallery = [
  [
    { src: "/assets/left.jpg", date: "24 Sept 2025", title: "Getmeds CEO Naresh Bishnoi at the UNGC Network Philippines Event" },
  ],
  [
    { src: "/assets/topmid.jpg", date: "24 Sept 2025", title: "Leading SDG conversations in\nHealthcare Innovation" },
    { src: "/assets/bottommid.jpg", date: "24 Sept 2025", title: "Connecting with Global Stakeholders" },
  ],
  [
    { src: "/assets/topright.jpeg", date: "10 Feb 2026", title: "Commitment to Ethical Business Practices" },
    { src: "/assets/bottomright.jpeg", date: "10 Feb 2026", title: "Pledging for a Healthier Future for All" },
  ],
];

export default function UngcPage() {
  // Ten principles split into two columns around the centre photo, as in the reference layout
  const leftGroups = principleGroups.slice(0, 2);
  const rightGroups = principleGroups.slice(2);

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero: the same full-bleed image treatment and size as Contact Us; the artwork carries its own copy */}
      <section className="relative bg-white pb-2 xl:pb-0">
        <Image
          src="/images/ungcherosection.png"
          alt="Getmeds and the United Nations Global Compact: responsible healthcare, sustainable action"
          width={1746}
          height={901}
          priority
          quality={100}
          sizes="100vw"
          className="h-auto w-full"
        />
        {/* same button placement as Contact Us / CSR: xl+ anchored bottom-left on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-6 flex flex-wrap items-center gap-4 xl:mt-0">
              <a
                href={UNGC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Learn About UNGC
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Page title under the hero: the only h1, two lines, with the intro beside it on the left */}
      <section className="pb-6 pt-8 md:pb-8 md:pt-10">
        {/* same layout as the Ten Principles header: one-line h1 left, intro right */}
        <Reveal immediate className="mx-auto grid max-w-7xl items-end gap-5 px-5 md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-10">
          <h1 className="font-display text-2xl font-semibold text-black md:text-[2rem]">
            United Nations <span className="text-primary">Global Compact</span>
          </h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
            At Getmeds Philippines, we do more than provide medicines—we drive meaningful impact through
            responsible healthcare, compassion, and sustainable action.
          </p>
        </Reveal>
      </section>

      {/* What is UNGC: photo collage left, story right */}
      <section className="pb-8 pt-4 md:pb-10 md:pt-6">
        {/* collage bleeds to the left edge with no gutter; the copy keeps the site column's right edge */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-0">
          <Reveal>
            <div className="grid grid-cols-[1fr_1.3fr] grid-rows-[auto_auto] gap-0 overflow-hidden lg:rounded-r-2xl">
              <div className="relative row-span-2 overflow-hidden">
                <Image
                  src="/images/ungc1.jpeg"
                  alt="Getmeds CEO Naresh Bishnoi beside the UN Global Compact Asia-Pacific backdrop: one region, shared ambition, collective action"
                  width={960}
                  height={1280}
                  sizes="(min-width: 1024px) 22vw, 42vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="/images/ungc2.jpeg"
                  alt="Getmeds CEO Naresh Bishnoi at the UN Global Compact Forward Faster wall"
                  width={1280}
                  height={960}
                  sizes="(min-width: 1024px) 28vw, 56vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="/images/ungc3.jpeg"
                  alt="Plenary stage at UN Global Compact Forward Faster Now APAC 2026 in Colombo, Sri Lanka"
                  width={1280}
                  height={960}
                  sizes="(min-width: 1024px) 28vw, 56vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          <Reveal className="px-5 md:px-10 lg:pl-16 lg:pr-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
            <Image
              src="/assets/UNGClogo.png"
              alt="UN Global Compact logo"
              width={297}
              height={288}
              className="h-auto w-16"
            />
            <h2 className="font-display mt-6 text-[clamp(2rem,3.8vw,3.2rem)] font-semibold leading-[1.08] text-[#0B2E5E]">
              What is UNGC?
            </h2>
            <p className="mt-6 text-[16.5px] leading-relaxed text-slate-600">
              The United Nations Global Compact is the world&apos;s largest
              corporate sustainability initiative. It encourages companies to
              adopt responsible, ethical, and sustainable business practices
              that create positive impact for people, communities, and the
              planet.
            </p>
            <p className="font-display mt-8 text-[18px] font-semibold leading-snug text-primary md:text-xl">
              Getmeds Philippines is only the second pharmaceutical company of
              its kind in the Philippines to join.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Ten principles: centred heading, photo in the middle, principles either side */}
      {/* Ten Principles heading sits on white, above the blue band */}
      <div className="bg-white pb-10 pt-4 md:pb-12 md:pt-6">
        <Reveal className="mx-auto grid max-w-7xl items-end gap-5 px-5 md:grid-cols-[1.15fr_1fr] md:gap-12 md:px-10">
          <div>
            {/* same eyebrow and heading style as About Us's "Inside Getmeds" */}
            <p className="text-sm font-semibold text-primary">The Ten Principles</p>
            <h2
              id="principles-heading"
              className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]"
            >
              Principles that guide every decision.
            </h2>
          </div>
          <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
            The Ten Principles listed below are based on and sourced from the official{" "}
            <a
              href={UNGC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary-deep"
            >
              UN Global Compact website
            </a>
            .
          </p>
        </Reveal>
      </div>

      <section
        aria-labelledby="principles-heading"
        className="py-4 md:py-6"
      >
        {/* edge to edge: three equal-height panels butted together, blue | white (UNGC logo) | green.
            Inner padding keeps the copy inside the site's column on wide screens. */}
        <div className="grid items-stretch lg:grid-cols-[1fr_300px_1fr] xl:grid-cols-[1fr_340px_1fr]">
          <Reveal className="lg:order-1">
            <div className="h-full bg-[#1D9FDA] px-5 py-8 md:px-10 md:py-10 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:pr-10">
              <PrincipleColumn groups={leftGroups} align="left" />
            </div>
          </Reveal>
          <Reveal className="order-first lg:order-2">
            {/* participant lockup: "We Support" above the UNGC emblem */}
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4 bg-white p-8">
              <p className="font-display text-center text-[1.25rem] font-bold uppercase leading-none tracking-tight text-[#0B2E5E] md:text-[1.45rem]">
                We Support
              </p>
              <Image
                src="/assets/UNGClogo.png"
                alt="UN Global Compact logo"
                width={297}
                height={288}
                sizes="(min-width: 1024px) 200px, 45vw"
                className="h-auto w-[60%] max-w-[200px]"
              />
            </div>
          </Reveal>
          <Reveal className="lg:order-3">
            <div className="h-full bg-[#61A644] px-5 py-8 md:px-10 md:py-10 lg:pl-10 lg:pr-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
              <PrincipleColumn groups={rightGroups} align="left" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Event gallery: edge to edge, five photos (tall left, two stacked in the middle, two on the right);
          glassy date pill top-left, caption bottom-left, slow zoom + blue wash on hover */}
      <section aria-label="Getmeds at UN Global Compact events" className="py-4 md:py-6">
        <div className="flex flex-col md:flex-row">
          {eventGallery.map((col, c) => (
            <div key={c} className="flex w-full flex-col md:w-1/3">
              {col.map((tile) => (
                <div
                  key={tile.title}
                  className={`group relative overflow-hidden ${col.length === 1 ? "h-[320px] md:h-[500px]" : "h-[250px]"}`}
                >
                  <Image
                    src={tile.src}
                    alt={tile.title.replace("\n", " ")}
                    fill
                    sizes="(min-width: 768px) 34vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-0 z-10 bg-[#1D9FDA]/0 transition-all duration-500 group-hover:bg-[#1D9FDA]/40" />
                  <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between bg-gradient-to-t from-black/60 via-transparent to-black/30 p-6 md:p-8">
                    <span className="self-start rounded-full bg-white/20 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-white/40 backdrop-blur-md">
                      {tile.date}
                    </span>
                    <h3 className="font-display whitespace-pre-line text-[17px] font-semibold leading-snug text-white">{tile.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* SDGs: heading + arrows, swipeable tiles */}
      <section
        aria-labelledby="sdg-heading"
        className="overflow-hidden pb-10 pt-6 md:pb-12 md:pt-8"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal>
            <SdgCarousel
              goals={sdgs}
              text="The UNGC principles also contribute to the United Nations Sustainable Development Goals (SDGs) — a global call to end poverty, protect the planet, and ensure prosperity for all."
              heading={
                <>
                  <span className="block text-sm font-semibold text-primary">
                    Sustainable Development Goals
                  </span>
                  {/* same size as the Ten Principles heading */}
                  <h2
                    id="sdg-heading"
                    className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]"
                  >
                    How UNGC Supports the 17 Sustainable Development Goals (SDGs)
                  </h2>
                </>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* Getmeds' own SDG actions 02–05 (2026 company profile) */}
      <SdgActions />

      {/* Alignment statement: one full-width italic paragraph under the SDGs */}
      <section className="pb-16 pt-2 md:pb-20 md:pt-4">
        <Reveal className="mx-auto max-w-7xl px-5 md:px-10">
          <p className="text-lg font-medium italic leading-relaxed text-black md:text-xl md:leading-relaxed">
            By aligning with UNGC, Getmeds Philippines, only the second pharmaceutical company of its kind in the
            Philippines to join, integrates these principles and goals into our operations. This milestone
            highlights our commitment to ethical business practices, sustainable growth, and social
            responsibility. Through this partnership, we aim to set new standards in the healthcare industry,
            improve access to quality medicines, and create a positive, lasting impact on communities
            nationwide. Joining UNGC also reflects our dedication to the United Nations Sustainable Development
            Goals (SDGs), ensuring that every step we take in business aligns with global efforts for a
            healthier, fairer, and more sustainable world.
          </p>
        </Reveal>
      </section>

      {/* Bottom CTA band: short, brand green, sitting directly on the footer */}
      <section className="bg-[#61A644] text-white">
        <Reveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-5 py-7 md:flex-row md:items-center md:px-10 md:py-8">
          <p className="font-display text-lg font-semibold leading-snug md:text-xl">
            Learn more about UNGC
            <br />
            and its global impact
          </p>
          <a
            href={UNGC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center rounded-full bg-white/20 px-7 py-3 text-sm font-semibold text-white ring-1 ring-white/50 backdrop-blur-md transition hover:bg-white/30"
          >
            Learn More
          </a>
        </Reveal>
      </section>
    </div>
  );
}
