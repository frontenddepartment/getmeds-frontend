import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Gavel,
  Leaf,
  Scale,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/ui";
import SdgCarousel from "./SdgCarousel";
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
function PrincipleColumn({
  groups,
  align,
}: {
  groups: typeof principleGroups;
  align: "left" | "right";
}) {
  return (
    <div className="space-y-10">
      {groups.map(({ Icon, title, items }) => (
        <div key={title}>
          <h3
            className={`font-display flex items-center gap-3 text-lg font-semibold text-[#0B2E5E] ${align === "right" ? "lg:flex-row-reverse" : ""}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
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
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary ring-4 ring-primary/15"
                  />
                  <span>
                    <span className="block text-[13px] font-semibold text-primary">
                      {label}:
                    </span>
                    <span className="mt-0.5 block text-[14.5px] leading-relaxed text-slate-700">
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

      {/* Hero: one rounded photo card, headline top-left, intro card bottom-right */}
      <section className="px-3 pt-28 sm:px-5 md:pt-32">
        <div className="relative mx-auto min-h-[560px] max-w-[1500px] overflow-hidden rounded-[1.75rem] bg-primary-deep md:min-h-[640px]">
          <Image
            src="/assets/bottomright.jpeg"
            alt="Getmeds at the UN Global Compact Network Philippines 2026 General Assembly"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_45%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#04263a]/85 via-[#04263a]/35 to-[#04263a]/70 md:bg-gradient-to-b md:from-[#04263a]/90 md:via-[#04263a]/45 md:via-45% md:to-[#04263a]/60" />

          <div className="relative flex min-h-[560px] flex-col justify-between gap-10 p-6 sm:p-10 md:min-h-[640px] md:p-14">
            <Reveal immediate className="max-w-3xl text-white">
              <div className="flex items-center gap-4">
                <Image
                  src="/assets/ungclogowhite.png"
                  alt="United Nations Global Compact logo"
                  width={306}
                  height={300}
                  className="h-auto w-14 md:w-16"
                />
                <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
                  United Nations Global Compact
                </span>
              </div>
              <h1 className="font-display mt-6 text-[clamp(2.1rem,5vw,4rem)] font-semibold leading-[1.06] tracking-tight">
                Responsible healthcare.{" "}
                <span className="sm:whitespace-nowrap">
                  Sustainable action.
                  <a
                    href={UNGC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Learn About UNGC (opens unglobalcompact.org)"
                    className="ml-3 inline-flex h-[0.85em] w-[0.85em] -translate-y-[0.08em] items-center justify-center rounded-full bg-white align-middle text-primary-deep transition hover:bg-primary hover:text-white"
                  >
                    <ArrowUpRight
                      className="h-[55%] w-[55%]"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </a>
                </span>
              </h1>
            </Reveal>

            <Reveal immediate className="self-stretch sm:self-end">
              <div className="max-w-sm rounded-2xl bg-white/12 p-5 text-white ring-1 ring-white/25 backdrop-blur-md sm:p-6">
                <p className="text-[15px] leading-relaxed text-white/90">
                  At Getmeds Philippines, we do more than provide medicines — we
                  drive meaningful impact through responsible healthcare,
                  compassion, and sustainable action.
                </p>
                <a
                  href={UNGC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-primary-deep transition hover:bg-primary-soft"
                >
                  Learn About UNGC{" "}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What is UNGC: photo collage left, story right */}
      <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <div className="grid grid-cols-[1fr_1.3fr] grid-rows-[auto_auto] gap-3 sm:gap-4">
              <div className="relative row-span-2 overflow-hidden rounded-2xl">
                <Image
                  src="/assets/left.jpg"
                  alt="Getmeds CEO Naresh Bishnoi at the UN Global Compact Network Philippines event"
                  width={3000}
                  height={4000}
                  sizes="(min-width: 1024px) 22vw, 42vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="/assets/topmid.jpg"
                  alt="Introduction of new participants at the UN Global Compact Network Philippines"
                  width={4041}
                  height={3388}
                  sizes="(min-width: 1024px) 28vw, 56vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="/assets/bottommid.jpg"
                  alt="UN Global Compact Network Philippines participants, including the Getmeds team"
                  width={4000}
                  height={3000}
                  sizes="(min-width: 1024px) 28vw, 56vw"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          <Reveal>
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
      <section
        aria-labelledby="principles-heading"
        className="bg-[#f6f9fb] py-20 md:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              The Ten Principles
            </span>
            <h2
              id="principles-heading"
              className="font-display mt-4 text-[clamp(2rem,3.8vw,3.2rem)] font-semibold leading-[1.08] text-[#0B2E5E]"
            >
              Principles that guide every decision.
            </h2>
          </Reveal>

          <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_300px_1fr] lg:gap-10 xl:grid-cols-[1fr_340px_1fr]">
            <Reveal className="lg:order-1">
              <PrincipleColumn groups={leftGroups} align="right" />
            </Reveal>
            <Reveal className="order-first lg:order-2">
              <div className="relative mx-auto aspect-[3/4] max-w-[340px] overflow-hidden rounded-3xl">
                <Image
                  src="/assets/topright.jpeg"
                  alt="Members of the UN Global Compact Network Philippines at a general assembly"
                  fill
                  sizes="(min-width: 1024px) 340px, 80vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal className="lg:order-3">
              <PrincipleColumn groups={rightGroups} align="left" />
            </Reveal>
          </div>

          <p className="mt-14 text-center text-[13px] text-slate-500">
            The Ten Principles listed above are based on and sourced from the
            official{" "}
            <a
              href={UNGC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-primary"
            >
              UN Global Compact website
            </a>
            .
          </p>
        </div>
      </section>

      {/* SDGs: heading + arrows, swipeable tiles */}
      <section
        aria-labelledby="sdg-heading"
        className="overflow-hidden py-20 md:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal>
            <SdgCarousel
              goals={sdgs}
              text="A global call to end poverty, protect the planet, and ensure prosperity for all."
              heading={
                <>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                    Sustainable Development Goals
                  </span>
                  <h2
                    id="sdg-heading"
                    className="font-display mt-4 text-[clamp(2rem,3.8vw,3.2rem)] font-semibold leading-[1.08] text-[#0B2E5E]"
                  >
                    Supporting all{" "}
                    <span className="text-primary">17 SDGs.</span>
                  </h2>
                </>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* Commitment: photo card with the statement over it */}
      <section className="px-3 pb-24 sm:px-5">
        <Reveal className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[1.75rem] bg-primary-deep">
          <Image
            src="/assets/bottommid.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04263a]/95 via-[#04263a]/80 to-[#04263a]/40" />
          <div className="relative max-w-3xl p-8 text-white sm:p-12 md:p-16">
            <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-semibold leading-[1.1]">
              Setting new standards in the healthcare industry.
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-white/85">
              By aligning with UNGC, Getmeds integrates these principles and
              goals into our operations — a commitment to ethical business
              practices, sustainable growth, and social responsibility. Every
              step we take in business aligns with global efforts for a
              healthier, fairer, and more sustainable world.
            </p>
            <Link
              href="/csr"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-primary-deep transition hover:bg-primary-soft"
            >
              See Our CSR Work <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
