"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Briefcase, CheckCircle2, Handshake, Mail, MapPin, MessageCircle, Phone,
  ChevronDown, Pill,
} from "lucide-react";
import { contact } from "@/lib/data";
import { socials } from "@/components/SocialIcons";
import { Reveal } from "@/components/ui";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";

const channels = [
  {
    Icon: Pill, iconBg: "bg-[#1D9FDA]", title: "Medicine Inquiries",
    lines: [
      { label: contact.address, href: "" },
      { label: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
      { label: contact.email, href: `mailto:${contact.email}` },
    ],
  },
  {
    Icon: Briefcase, iconBg: "bg-[#F2B705]", title: "HR / Careers",
    lines: [
      { label: contact.hrPhone, href: `tel:${contact.hrPhone.replace(/\s/g, "")}` },
      ...contact.hrEmails.map((e) => ({ label: e, href: `mailto:${e}` })),
    ],
  },
  {
    Icon: Handshake, iconBg: "bg-[#E5484D]", title: "Partnerships",
    lines: [
      { label: contact.partnershipsPhone, href: `tel:${contact.partnershipsPhone.replace(/\s/g, "")}` },
      { label: contact.partnershipsEmail, href: `mailto:${contact.partnershipsEmail}` },
    ],
  },
  {
    Icon: MessageCircle, iconBg: "bg-[#61A644]", title: "Social Network",
    lines: [],
    social: true,
  },
];

// Contact form fields: light gray fill, no border until focus (rounding is set per field)
const FIELD =
  "w-full border border-transparent bg-[#F3F5F9] px-5 py-3.5 text-[15px] text-black outline-none transition placeholder:text-[14px] placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15";

const subjects = ["General Inquiry", "Customer Support", "Sales & Pricing", "HR / Careers", "Medical Inquiry"];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  return (
    <>
      {/* Hero image, same treatment and text placement as Order Medicines. xl+: copy sits white on the blue at the left.
          Below xl the image is too short, so the copy stacks below it in navy/black. */}
      <section className="relative bg-white pb-14 xl:pb-0">
        <Image
          src="/images/contactusherosection.png"
          alt="Smiling Getmeds team member pointing to a Contact Us sign"
          width={5456}
          height={2816}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="relative mx-auto max-w-7xl px-5 md:px-10 xl:absolute xl:inset-x-0 xl:top-0 xl:pt-36">
          <Reveal immediate>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-primary xl:text-white xl:drop-shadow">
              Contact Us
            </span>
            <h1 className="font-display mt-6 text-[clamp(1.6rem,7.2vw,1.85rem)] font-semibold leading-[1.12] tracking-tight text-[#0B2E5E] md:text-[clamp(1.45rem,3.5vw+0.2rem,3.2rem)] xl:mt-4 xl:text-white xl:drop-shadow-md">
              {/* exactly two lines from md up; free wrapping on phones where line one doesn't fit */}
              <span className="md:block md:whitespace-nowrap">For patients, partners,</span>{" "}
              <span className="text-primary md:block md:whitespace-nowrap xl:text-white">and providers.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-black md:text-[15px] xl:mt-4 xl:max-w-xl xl:text-white xl:drop-shadow">
              For inquiries about our pharmaceutical portfolio, partnership opportunities, careers, or patient
              access programs — our team is ready to help.
            </p>
          </Reveal>
        </div>
        {/* same button pair as Order Medicines; xl+: anchored to the section bottom so it sits on the white wave */}
        <div className="relative xl:absolute xl:inset-x-0 xl:bottom-[15%]">
          <Reveal immediate className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mt-9 flex flex-wrap items-center gap-4 xl:mt-0">
              <a
                href={contact.messenger}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-full border-2 border-primary bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                {/* little chat bubble on the corner with a "typing..." dot animation; pops in on hover/keyboard focus */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-3.5 left-5 flex origin-bottom-left translate-y-1 scale-75 items-center gap-[3px] rounded-full bg-white px-2 py-1.5 opacity-0 shadow-[0_4px_12px_-4px_rgba(6,40,64,0.4)] transition duration-200 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                >
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary [animation-delay:0.15s]" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary [animation-delay:0.3s]" />
                  <span className="absolute -bottom-1 left-2.5 h-2 w-2 rotate-45 bg-white" />
                </span>
                Chat with us
              </a>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="rounded-full border-2 border-black px-7 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
              >
                {contact.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Form + map card */}
      <section className="relative bg-white pb-14 pt-0">
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 md:px-10 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
          {/* How to reach us: the four channels, left of the form */}
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-black md:text-[2rem]">How to Reach Us</h2>
            <p className="mt-3 text-balance text-sm leading-relaxed text-ink-soft">
              Pick the channel that fits your need. General inquiries, careers, and partnerships are routed directly
              to the right team for faster response.
            </p>
            <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {channels.map(({ Icon, iconBg, title, lines, social }) => (
                <div key={title}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-semibold text-black">{title}</h3>
                  </div>
                  {social && (
                    <div className="mt-4 flex flex-wrap items-center gap-3.5">
                      {socials.map(({ label, href, Icon: SocialIcon, color }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          style={{ color }}
                          className="transition hover:-translate-y-0.5 hover:opacity-80"
                        >
                          <SocialIcon className="h-6 w-6" />
                        </a>
                      ))}
                    </div>
                  )}
                  <ul className="mt-4 space-y-2.5">
                    {lines.map((l) => {
                      const LineIcon = !l.href ? MapPin : l.href.startsWith("tel:") ? Phone : l.href.startsWith("mailto:") ? Mail : MessageCircle;
                      const body = (
                        <>
                          <LineIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{l.label}</span>
                        </>
                      );
                      return (
                        <li key={l.label}>
                          {l.href ? (
                            <a
                              href={l.href}
                              target={l.href.startsWith("http") ? "_blank" : undefined}
                              rel="noopener noreferrer"
                              className="flex items-start gap-2.5 text-[15px] leading-snug text-ink-soft transition hover:text-primary-dark"
                            >
                              {body}
                            </a>
                          ) : (
                            <p className="flex items-start gap-2.5 text-[15px] leading-snug text-ink-soft">{body}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-[28px] border border-gray-200 bg-white p-7 md:p-10">
              <p className="text-sm font-semibold text-primary">Send a message</p>
              {/* same size and weight as "How to Reach Us" */}
              <h2 className="font-display mt-2 text-2xl font-semibold text-black md:text-[2rem]">Get in touch with us.</h2>
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-primary/8 p-10 text-center"
                >
                  <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
                  <h3 className="font-display mt-4 text-xl font-bold text-primary-deep">
                    Message received!
                  </h3>
                  <p className="mt-2 text-sm text-ink-soft">
                    Thank you for reaching out. Our team will get back to you shortly — for urgent
                    inquiries, call {contact.phone}.
                  </p>
                </motion.div>
              ) : (
                <form
                  className="mt-8 grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  {/* 2x2: Full Name | Email, Phone | Subject; then Message full width */}
                  {[
                    { name: "name", label: "Full Name", type: "text", placeholder: "e.g. Juan Dela Cruz" },
                    { name: "email", label: "Email Address", type: "email", placeholder: "e.g. juandelacruz@email.com" },
                    { name: "phone", label: "Phone Number", type: "tel", placeholder: "e.g. +63 912 345 6789" },
                  ].map((f) => (
                    <div key={f.name}>
                      <label htmlFor={`contact-${f.name}`} className="mb-2 block text-[15px] font-semibold text-gray-800">
                        {f.label}
                        <span aria-hidden className="ml-0.5 text-[#E5484D]">*</span>
                      </label>
                      <input
                        required
                        id={`contact-${f.name}`}
                        type={f.type}
                        name={f.name}
                        placeholder={f.placeholder}
                        className={`${FIELD} rounded-full`}
                      />
                    </div>
                  ))}
                  <div>
                    <label htmlFor="contact-subject" className="mb-2 block text-[15px] font-semibold text-gray-800">
                      Subject
                      <span aria-hidden className="ml-0.5 text-[#E5484D]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        id="contact-subject"
                        name="subject"
                        defaultValue=""
                        className={`${FIELD} appearance-none rounded-full pr-10 invalid:text-[14px] invalid:text-gray-400`}
                      >
                        <option value="" disabled>
                          Select Subject
                        </option>
                        {subjects.map((s) => (
                          <option key={s} className="text-black">{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-message" className="mb-2 block text-[15px] font-semibold text-gray-800">
                      Message
                      <span aria-hidden className="ml-0.5 text-[#E5484D]">*</span>
                    </label>
                    <textarea
                      required
                      id="contact-message"
                      name="message"
                      rows={5}
                      placeholder="e.g. I would like to inquire about your pharmaceutical products..."
                      className={`${FIELD} resize-y rounded-xl`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3 py-1 text-[13px] leading-relaxed text-ink-soft">
                      {/* green box with a white check when ticked */}
                      <span className="relative mt-0.5 h-5 w-5 shrink-0">
                        <input
                          required
                          type="checkbox"
                          className="peer absolute inset-0 h-5 w-5 cursor-pointer appearance-none rounded-[5px] border-2 border-gray-300 bg-white transition checked:border-[#61A644] checked:bg-[#61A644] focus-visible:ring-4 focus-visible:ring-[#61A644]/25"
                        />
                        <svg
                          viewBox="0 0 16 16"
                          aria-hidden
                          className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-white opacity-0 transition peer-checked:opacity-100"
                        >
                          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>
                        I consent to Getmeds processing my information in accordance with its{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setPolicyOpen(true);
                          }}
                          className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark"
                        >
                          Privacy Policy
                        </button>{" "}
                        and the Data Privacy Act of 2012.
                      </span>
                    </label>
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[#1D9FDA] px-7 py-3.5 font-semibold text-white transition hover:bg-[#1D9FDA]/90 sm:col-span-2">
                    Submit
                  </button>
                </form>
              )}
            </div>
          </Reveal>

        </div>
      </section>
      <PrivacyPolicyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </>
  );
}
