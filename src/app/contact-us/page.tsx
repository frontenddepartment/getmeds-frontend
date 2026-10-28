"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, CheckCircle2, Handshake, Mail, MapPin, MessageCircle, Phone,
  Pill, Send,
} from "lucide-react";
import { contact } from "@/lib/data";
import { Reveal, SectionHeading } from "@/components/ui";
import PageHero from "@/components/PageHero";

const channels = [
  {
    Icon: Pill, title: "Medicine Inquiries",
    lines: [
      { label: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
      { label: contact.email, href: `mailto:${contact.email}` },
    ],
  },
  {
    Icon: Briefcase, title: "HR / Careers",
    lines: [
      { label: contact.hrPhone, href: `tel:${contact.hrPhone.replace(/\s/g, "")}` },
      ...contact.hrEmails.map((e) => ({ label: e, href: `mailto:${e}` })),
    ],
  },
  {
    Icon: Handshake, title: "Partnerships",
    lines: [
      { label: contact.partnershipsPhone, href: `tel:${contact.partnershipsPhone.replace(/\s/g, "")}` },
      { label: contact.partnershipsEmail, href: `mailto:${contact.partnershipsEmail}` },
    ],
  },
  {
    Icon: MessageCircle, title: "Social Network",
    lines: [
      { label: "Facebook Messenger", href: contact.messenger },
      { label: "WhatsApp", href: contact.whatsapp },
    ],
  },
];

const subjects = ["General Inquiry", "Customer Support", "Sales & Pricing", "HR / Careers", "Medical Inquiry"];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title={<>For patients, partners, <span className="text-gradient">and providers.</span></>}
        text="For inquiries about our pharmaceutical portfolio, partnership opportunities, careers, or patient access programs — our team is ready to help."
      />

      {/* Channels */}
      <section className="pb-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-4 md:px-10">
          {channels.map(({ Icon, title, lines }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <div className="glass h-full rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-4 font-bold text-primary-deep">{title}</h3>
                <div className="mt-2 space-y-1.5">
                  {lines.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="block text-sm font-medium text-ink-soft transition hover:text-primary-dark"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Form + map card */}
      <section className="relative py-14">
        <div className="aurora" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 md:px-10 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <div className="glass rounded-2xl p-7 md:p-10">
              <SectionHeading
                align="left"
                eyebrow="Send a message"
                title={<>Get in touch <span className="text-gradient">with us.</span></>}
              />
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
                  className="-mt-6 grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  {[
                    { name: "name", label: "Full Name", type: "text" },
                    { name: "email", label: "Email Address", type: "email" },
                    { name: "phone", label: "Phone Number", type: "tel" },
                  ].map((f) => (
                    <div key={f.name} className={f.name === "name" ? "sm:col-span-2" : ""}>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-deep">
                        {f.label}
                      </label>
                      <input
                        required
                        type={f.type}
                        name={f.name}
                        className="w-full rounded-lg border border-primary/20 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-deep">
                      Subject
                    </label>
                    <select
                      name="subject"
                      className="w-full rounded-lg border border-primary/20 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    >
                      {subjects.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-primary-deep">
                      Message
                    </label>
                    <textarea
                      required
                      name="message"
                      rows={5}
                      className="w-full rounded-lg border border-primary/20 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3 py-1 text-[13px] leading-relaxed text-ink-soft">
                      <input required type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#1D9FDA]" />
                      I consent to Getmeds processing my information in accordance with the Data
                      Privacy Act of 2012.
                    </label>
                  </div>
                  <button type="submit" className="btn-primary sm:col-span-2 justify-center">
                    Submit <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl bg-primary-deep p-8 text-white">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-[90px]" />
                <MapPin className="relative h-8 w-8 text-primary" />
                <h3 className="font-display relative mt-4 text-lg font-bold">Head Office</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-white/70">
                  {contact.address}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="glass rounded-2xl p-8">
                <h3 className="font-display text-lg font-bold text-primary-deep">
                  Prefer to talk now?
                </h3>
                <p className="mt-2 text-sm text-ink-soft">
                  Our customer support is available 24/7 — including weekends and holidays.
                </p>
                <div className="mt-5 space-y-3">
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="btn-primary w-full justify-center text-sm">
                    <Phone className="h-4 w-4" /> Call {contact.phone}
                  </a>
                  <a href={`mailto:${contact.email}`} className="btn-ghost w-full justify-center text-sm">
                    <Mail className="h-4 w-4" /> {contact.email}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
