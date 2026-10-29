"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { contact } from "@/lib/data";
import { socials } from "./SocialIcons";

const mainMenu = [
  { href: "/", label: "Home" },
  { href: "/product-range", label: "Product Range" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/services", label: "Our Services" },
  { href: "/blog", label: "Blog" },
];

const productRange = ["Oncology", "Hematology", "Anti-Infectives", "Endocrinology", "Orthopedic", "Cardiology"];

const policies = [
  "Privacy Policy",
  "Terms of Service",
  "Medical Disclaimer",
  "Prescription Policy",
  "Shipping & Delivery Policy",
  "Return & Refund Policy",
];

export default function Footer() {
  const pathname = usePathname();
  const isFlushPage = pathname === "/" || pathname === "/order-medicines" || pathname === "/contact-us" || pathname === "/patient-assistance-program" || pathname === "/about-us" || pathname === "/services" || pathname === "/global-network" || pathname === "/product-range";

  return (
    <footer className={`relative overflow-hidden bg-[#1D9FDA] text-white ${isFlushPage ? "" : "mt-24"}`}>
      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/getmeds-logo-white.png"
                alt="GetMEDS Philippines â€” Your Compassionate Health Ally"
                width={1200}
                height={664}
                className="h-20 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90">
              Getmeds is a pharmaceutical company in the Philippines specializing in oncology,
              hematology, anesthesia, rare diseases, and essential medicines. FDA Philippines
              licensed. UN Global Compact member.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 ring-1 ring-white/15 transition hover:bg-white/25 hover:ring-white/50"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Main Menu */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white">Main Menu</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {mainMenu.map((l) => {
                const active = pathname === l.href;
                return (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className={
                        active
                          ? "text-white"
                          : "text-white/90 transition hover:text-white"
                      }
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Product Range */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white">Product Range</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {productRange.map((p) => (
                <li key={p}>
                  <Link
                    href={`/product-range?category=${encodeURIComponent(p)}`}
                    className="text-white/90 transition hover:text-white"
                  >
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white">Contact</h4>
            <ul className="mt-4 space-y-3.5 text-sm text-white/90">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/90" />
                {contact.address}
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-white/90" />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {contact.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-white/90" />
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/20 pt-7 text-[13px] text-white/85 xl:flex-row xl:items-center xl:justify-between">
          <p className="xl:whitespace-nowrap">Â© 2026 Getmeds Philippines, Inc. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 xl:flex-nowrap xl:justify-end">
            {policies.map((p) => (
              <span key={p} className="cursor-pointer whitespace-nowrap py-1.5 transition hover:text-white">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
