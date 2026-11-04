"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { otherRanges, productMenu } from "@/lib/catalogueHub";
import { SearchField, SearchPanel, SearchTrigger } from "@/components/NavSearch";

const mobileProductLinks = [
  { href: "/product-range", label: "View all products" },
  { href: "/prescription-medicines", label: "Prescription medicines" },
  ...otherRanges.map((r) => ({ href: `/${r.slug}`, label: r.title })),
];

const mobileLinksAfter = [
  { href: "/conditions", label: "Conditions" },
  { href: "/order-medicines", label: "Order medicines" },
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact us" },
];

const companyExplore = [
  { href: "/about-us", label: "About Us" },
  { href: "/services", label: "Our Services" },
  { href: "/global-network", label: "Global Presence" },
  { href: "/meditations", label: "Meditations" },
];

const companyMore = [
  { href: "/csr", label: "CSR" },
  { href: "/careers", label: "Careers" },
  { href: "/ungc", label: "UNGC" },
  { href: "/blog", label: "Blog" },
];

const networkOrgs = [
  "Getmeds Philippines", "Getmeds Healthcare", "Getmeds Vanuatu",
  "Getmeds South East Asia", "Getmeds Latin", "Bishnoi Omniverse India",
  "Bishnoi Omniverse Philippines", "Naresh Bishnoi Foundation",
  "Naresh Bishnoi", "UNGC", "2MG Incorporated",
];

const PANEL_DESC: Record<string, { label: string; text: string }> = {
  company: {
    label: "About Us",
    text: "Get to know Getmeds — who we are, our services, global presence and wellness initiatives, plus careers, CSR work and the latest company updates.",
  },
  network: {
    label: "Global Network",
    text: "Getmeds' growing footprint across the world — connect with any of our regional sites and trusted partner organizations.",
  },
};

/* stagger variants for the panel links */
const listVar = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
};

type DD = null | "products" | "company" | "network";


export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState<DD>(null);
  const [productsOpen, setProductsOpen] = useState(true);
  // /meditations: the bar belongs to the hero only; it slides away once the hero (#top) has scrolled
  // out, and the page's own floating pill takes over (its arrow brings the hero, and the bar, back).
  const [heroGone, setHeroGone] = useState(false);
  const hideForHero = pathname === "/meditations" && heroGone;
  useEffect(() => {
    if (pathname !== "/meditations") return;
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setHeroGone(!entry.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openSearch = useCallback(() => {
    setOpen(false);
    setDd(null);
    setSearchOpen(true);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDd(null);
    setSearchOpen(false);
  }, [pathname]);

  // full-screen mobile menu: keep the page behind it from scrolling
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // the bar is always the raised white pill now, so it never needs the white-on-dark variant
  const onDark = false;

  const linkCls = (href: string) =>
    `whitespace-nowrap px-2 py-2 text-sm font-medium transition-colors xl:px-3 ${
      pathname === href
        ? onDark ? "font-semibold text-white" : "font-semibold text-primary"
        : onDark ? "text-white/70 hover:text-white" : "text-ink-soft hover:text-primary"
    }`;

  const panelLink =
    "nav-underline relative inline-flex items-center px-3 py-2 text-[15px] font-medium text-primary-deep transition-colors hover:text-primary";

  const mobileRow = (href: string) =>
    `block px-4 py-3.5 text-[15px] font-semibold ${pathname === href ? "text-primary" : "text-primary-deep"}`;

  const chevron = (key: DD) =>
    `h-4 w-4 transition-transform duration-300 ${dd === key ? "rotate-180" : ""}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding,transform,opacity] duration-300 md:px-6 md:pt-3 ${
        searchOpen ? "px-0 pt-0" : "px-3 pt-3"
      } ${open ? "max-lg:!px-0 max-lg:!pt-0" : ""} ${hideForHero ? "pointer-events-none -translate-y-full opacity-0" : ""}`}
    >
      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px]" onMouseLeave={() => setDd(null)}>
        {/* ---- Sheet panel sliding out from beneath the bar ---- */}
        <AnimatePresence>
          {dd && (
            <motion.div
              key={dd}
              initial={{ opacity: 0, y: -28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18, transition: { duration: 0.18 } }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0 z-0 hidden overflow-hidden rounded-[30px] bg-white ring-1 ring-[#edf2f7] lg:block"
            >
              <div className="px-10 pb-9 pt-24">
                <div className="flex gap-12">
                  {/* links */}
                  <motion.div variants={listVar} initial="hidden" animate="show" className="flex-1">
                    {dd === "products" && (
                      <div>
                        <motion.div variants={itemVar} className="flex items-center justify-between gap-4">
                          <Link href="/prescription-medicines" className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary transition-colors hover:text-primary-deep">
                            Prescription medicines →
                          </Link>
                          <span className="text-[12px] text-ink-soft">Category (bold) · conditions underneath</span>
                        </motion.div>
                        <div className="mt-3 grid grid-cols-3 gap-x-6 gap-y-5">
                          {productMenu.map((cat) => (
                            <motion.div key={cat.name} variants={itemVar}>
                              <Link href={cat.href} className="font-display text-[15px] font-bold text-primary-deep transition-colors hover:text-primary">
                                {cat.name}
                              </Link>
                              <ul className="mt-1.5 space-y-1">
                                {cat.conditions.map((c) => (
                                  <li key={c.href}>
                                    <Link href={c.href} className="text-[13.5px] text-primary transition-colors hover:text-primary-deep">
                                      {c.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          ))}
                        </div>
                        <motion.div variants={itemVar} className="mt-4 border-t border-[#eef2f7] pt-3">
                          <Link href="/conditions" className="text-sm font-semibold text-primary transition-colors hover:text-primary-deep">
                            View all conditions A–Z →
                          </Link>
                        </motion.div>
                      </div>
                    )}

                    {dd === "company" && (
                      <div className="grid grid-cols-2 gap-x-10">
                        <div>
                          <motion.p
                            variants={itemVar}
                            className="mb-2 border-b border-[#eef2f7] px-3 pb-2 text-[15px] font-medium text-primary"
                          >
                            Explore by Organization
                          </motion.p>
                          {companyExplore.map((l) => (
                            <motion.div key={l.href} variants={itemVar}>
                              <Link href={l.href} className={panelLink}>
                                {l.label}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                        <div>
                          <motion.p
                            variants={itemVar}
                            className="mb-2 border-b border-[#eef2f7] px-3 pb-2 text-[15px] font-medium text-primary"
                          >
                            More Information
                          </motion.p>
                          {companyMore.map((l) => (
                            <motion.div key={l.href} variants={itemVar}>
                              <Link href={l.href} className={panelLink}>
                                {l.label}
                              </Link>
                            </motion.div>
                          ))}
                          <motion.div variants={itemVar}>
                            <Link
                              href="/careers"
                              className="ml-3 mt-3 inline-flex rounded-full bg-[#61A644] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                            >
                              Join Us
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    )}

                    {dd === "network" && (
                      <div className="grid grid-cols-2 gap-x-10">
                        {networkOrgs.map((o) => (
                          <motion.div key={o} variants={itemVar}>
                            <Link href="/global-network" className={panelLink}>
                              {o}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* right-side description */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.16 }}
                    className={`shrink-0 border-l border-[#eef2f7] ${dd === "products" ? "w-52 pl-6" : "w-72 pl-10"}`}
                  >
                    {dd === "products" ? (
                      <>
                        <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-soft">More</p>
                        <ul className="mt-3 space-y-3 text-sm font-medium text-primary-deep">
                          {otherRanges.map((r) => (
                            <li key={r.slug}>
                              <Link href={`/${r.slug}`} className="transition-colors hover:text-primary">{r.title}</Link>
                            </li>
                          ))}
                        </ul>
                        <Link href="/product-range" className="mt-4 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary-deep">
                          View all products →
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="text-[15px] font-medium text-primary">
                          {PANEL_DESC[dd].label}
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                          {PANEL_DESC[dd].text}
                        </p>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Pill bar (always above the sheet) ---- */}
        <div
          className={`relative z-10 grid grid-cols-[1fr_auto_auto] items-center gap-2 lg:gap-0 rounded-full px-4 py-2.5 lg:py-3.5 transition-all duration-300 md:px-6 xl:px-10 lg:grid-cols-[auto_1fr_auto] ${
            /* phones: open search joins the bar into one flush, full-width block */
            searchOpen ? "max-md:rounded-none max-md:!shadow-none" : ""
          } ${
            /* open mobile menu: the bar sits flush on top of the full-screen sheet */
            open ? "max-lg:!rounded-none max-lg:!shadow-none" : ""
          } ${
            dd || searchOpen
              ? "glass-nav !shadow-[0_6px_16px_-14px_rgba(13,84,120,0.12)]"
              : "glass-nav"
          }`}
        >
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={onDark ? "/images/getmeds-logo-white.png" : "/images/getmeds-logo.png"}
              alt="GetMEDS Philippines — Your Compassionate Health Ally"
              width={181}
              height={100}
              priority
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop nav (centered) */}
          <nav className="hidden items-center justify-center gap-0.5 lg:flex">
            <Link href="/" className={linkCls("/")}>Home</Link>
            <Link href="/order-medicines" className={linkCls("/order-medicines")}>
              Order Medicines
            </Link>

            <div onMouseEnter={() => setDd("products")}>
              <Link
                href="/product-range"
                className={`flex items-center gap-1 ${linkCls("/product-range")}`}
              >
                Product Range <ChevronDown className={chevron("products")} />
              </Link>
            </div>

            {/* About Us: click goes to the page, hover opens the company sheet */}
            <div onMouseEnter={() => setDd("company")}>
              <Link
                href="/about-us"
                className={`flex items-center gap-1 ${linkCls("/about-us")}`}
              >
                About Us <ChevronDown className={chevron("company")} />
              </Link>
            </div>

            <Link
              href="/ungc"
              onMouseEnter={() => setDd(null)}
              className={linkCls("/ungc")}
              title="UN Global Compact"
            >
              UNGC
            </Link>

            {/* Patient Assistance Program logo, right of UNGC; the bar grows to fit it */}
            <Link
              href="/patient-assistance-program"
              onMouseEnter={() => setDd(null)}
              className="mx-1 flex shrink-0 items-center transition-opacity hover:opacity-80 xl:mx-2"
              aria-label="Patient Assistance Program"
            >
              <Image
                src="/images/newpaplogo.png"
                alt="Patient Assistance Program"
                width={1708}
                height={920}
                sizes="120px"
                priority
                className="h-9 w-auto"
              />
            </Link>

            <Link href="/contact-us" className={linkCls("/contact-us")} onMouseEnter={() => setDd(null)}>
              Contact Us
            </Link>
          </nav>

          {/* Right: search + Global Network */}
          <div className="hidden items-center gap-2 justify-self-end lg:ml-4 lg:flex xl:gap-3">
            <div onMouseEnter={() => setDd(null)}>
              <SearchField onDark={onDark} onOpenPanel={openSearch} />
            </div>
            <SearchTrigger onDark={onDark} open={searchOpen} onToggle={() => (searchOpen ? closeSearch() : openSearch())} />
            <div onMouseEnter={() => setDd("network")}>
              <Link href="/global-network" className="flex items-center gap-1">
                <Image
                  src="/images/globalnetwork.webp"
                  alt="Global Network"
                  width={216}
                  height={144}
                  className={`h-9 w-auto ${onDark ? "brightness-0 invert" : ""}`}
                />
                <ChevronDown
                  className={`${chevron("network")} ${onDark ? "text-white/80" : "text-ink-soft"}`}
                />
              </Link>
            </div>
          </div>

          {/* Mobile: search icon + menu toggle */}
          <div className="lg:hidden">
            <SearchTrigger onDark={onDark} open={searchOpen} onToggle={() => (searchOpen ? closeSearch() : openSearch())} />
          </div>
          <button
            onClick={() => {
              setSearchOpen(false);
              setOpen(!open);
            }}
            className={`justify-self-end rounded-xl p-2.5 lg:hidden ${
              onDark ? "bg-white/10 text-white" : "bg-white text-primary-deep"
            }`}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              // full width + full height: covers the screen under the bar (the bar, z-10, overlaps its top padding)
              className="fixed inset-0 z-0 overflow-y-auto overscroll-contain bg-white pt-[62px] lg:hidden"
            >
              <div className="divide-y divide-[#e6ecf1] border-t border-[#e6ecf1] pb-[env(safe-area-inset-bottom)]">
              <Link href="/" className={mobileRow("/")}>Home</Link>
              <div>
                <button
                  type="button"
                  onClick={() => setProductsOpen(!productsOpen)}
                  aria-expanded={productsOpen}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-[15px] font-semibold text-primary"
                >
                  Product range
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${productsOpen ? "" : "-rotate-90"}`} />
                </button>
                {productsOpen && (
                  <div className="bg-white pb-2">
                    {mobileProductLinks.map((l, i) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={`block px-7 py-2.5 text-sm ${i === 0 ? "font-semibold text-primary" : "font-medium text-primary-deep"}`}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {mobileLinksAfter.map((l) => (
                <Link key={l.href} href={l.href} className={mobileRow(l.href)}>{l.label}</Link>
              ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <SearchPanel open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
