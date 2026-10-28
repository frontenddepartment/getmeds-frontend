"use client";

/* Phones: a swipeable, snap-scrolling row (next card peeks in) with dots.
   md and up: the original 2/3-column grid. */

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";

type Article = {
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  source: string;
  logo: string;
  href: string;
};

const articles: Article[] = [
  {
    category: "Pharmaceuticals",
    date: "Sep 29, 2026",
    title: "Essar eyes $18-billion US steel plant: Why Indian firms are investing in US amid tariffs",
    excerpt:
      "While Essar Group’s investment pledge is one of the largest in the last few months, several Indian companies are boosting investment in the US. These…",
    image: "/images/articles/essar-us-steel.jpg",
    source: "The Indian Express",
    logo: "/images/articles/logo-indianexpress.png",
    href: "https://indianexpress.com/section/business/",
  },
  {
    category: "Biotechnology",
    date: "Sep 29, 2026",
    title:
      "Professor Bill Sessa, Former Chief Scientific Officer of Internal Medicine at Pfizer, Appointed Chair of Isomab's Scientific Advisory Board",
    excerpt:
      "/PRNewswire/ -- Isomab Ltd (\"Isomab\") a UK-based biotechnology company developing novel therapies to restore vascularization in cardiovascular disease,…",
    image: "/images/articles/isomab-sessa.png",
    source: "PR Newswire UK",
    logo: "/images/articles/logo-prnewswire.png",
    href: "https://www.prnewswire.co.uk/news-releases/",
  },
  {
    category: "Medicines",
    date: "Sep 29, 2026",
    title: "WHO and partners discuss governance of traditional medicine knowledge in the AI era at WIPO-IGC",
    excerpt:
      "From second left to right: Dr. Suerie Moon, James Love, Ambassador Guilherme de Aguiar Patriota, Peter Harrison, Margo A Bagley©WHOBringing together…",
    image: "/images/articles/who-wipo-igc.jpg",
    source: "World Health Organization (WHO)",
    logo: "/images/articles/logo-who.png",
    href: "https://www.who.int/news",
  },
];

export default function FeaturedArticles() {
  const track = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    setActive(Math.min(articles.length - 1, Math.round(el.scrollLeft / (step + 16))));
  };
  const goTo = (i: number) => {
    const card = track.current?.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <>
    <div
      ref={track}
      onScroll={onScroll}
      className="scrollbar-none -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-10 md:overflow-visible md:px-0 lg:grid-cols-3 lg:gap-9"
    >
      {articles.map((a) => (
        <a
          key={a.title}
          href={a.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-[85%] shrink-0 snap-start flex-col md:w-auto"
        >
          <div className="relative aspect-[434/273] overflow-hidden rounded-2xl bg-[#e6e7e8]">
            <Image
              src={a.image}
              alt={a.title}
              fill
              sizes="(min-width:1024px) 400px, (min-width:768px) 50vw, 85vw"
              className="object-cover"
            />
            <span className="absolute left-[18px] top-[19px] rounded-full bg-[#1D9FDA] px-3 py-1.5 text-xs font-semibold leading-none text-white">
              {a.category}
            </span>
            <span className="absolute right-[18px] top-[19px] rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold leading-none text-white backdrop-blur-sm">
              {a.date}
            </span>
          </div>

          <h3 className="font-display mt-5 px-1 text-lg font-semibold leading-snug text-[#111827] transition-colors duration-200 group-hover:text-[#1D9FDA]">
            {a.title}
          </h3>
          <p className="mt-2.5 line-clamp-3 px-1 text-sm leading-relaxed text-[#6b7280]">{a.excerpt}</p>

          <div className="mt-auto flex items-center justify-between gap-3 px-1 pt-6">
            <span className="flex min-w-0 items-center gap-2 text-[13px] leading-tight text-[#9ca3af]">
              <Image src={a.logo} alt={`${a.source} logo`} width={16} height={16} className="h-4 w-4 shrink-0" />
              <span>{a.source}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#111827]">
              Read Full Article
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </a>
      ))}
    </div>
    <div className="mt-4 flex justify-center md:hidden">
      {articles.map((a, i) => (
        <button
          key={a.title}
          type="button"
          onClick={() => goTo(i)}
          aria-label={`Show article ${i + 1}`}
          aria-current={i === active}
          className="group flex h-8 items-center px-1"
        >
          <span className={`block h-2 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-[#1D9FDA]" : "w-2 bg-[#cfe3f0]"}`} />
        </button>
      ))}
    </div>
    </>
  );
}
