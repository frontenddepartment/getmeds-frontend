"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { contact } from "@/lib/data";

type IconProps = { className?: string };

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

function TwitterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
    </svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const socials = [
  { label: "Facebook", href: contact.facebook, Icon: FacebookIcon },
  { label: "Twitter", href: contact.twitter, Icon: TwitterIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
  { label: "TikTok", href: "#", Icon: TikTokIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "YouTube", href: "#", Icon: YouTubeIcon },
];

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
  const isFlushPage = pathname === "/" || pathname === "/order-medicines";

  return (
    <footer className={`relative overflow-hidden bg-[#0B76AB] text-white ${isFlushPage ? "" : "mt-24"}`}>
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-[#1D9FDA] blur-[140px]" />
        <div className="absolute -bottom-52 left-10 h-[28rem] w-[28rem] rounded-full bg-[#085A84] blur-[140px]" />
      </div>

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
