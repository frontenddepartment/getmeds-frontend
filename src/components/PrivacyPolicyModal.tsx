"use client";

/* Privacy Policy in a modal, opened from the Contact Us form's consent line.
   Content comes from the same static file as the /privacy-policy page fallback. */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import policy from "../../data/static/privacy-policy.json";

export default function PrivacyPolicyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Escape closes; lock page scroll and move focus into the dialog while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 md:px-8">
          <div>
            <p className="text-sm font-semibold text-primary">{policy.badge}</p>
            <h2 id="privacy-modal-title" className="font-display mt-1 text-2xl font-semibold text-black">
              {policy.heading}
            </h2>
            <p className="mt-1 text-xs text-ink-soft">Last updated {policy.lastUpdated}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close privacy policy"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F5F9] text-gray-700 transition hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 md:px-8">
          <p className="text-[15px] leading-relaxed text-gray-800">{policy.summary}</p>
          <div className="mt-6 space-y-5">
            {policy.sections.map((sec) => (
              <section key={sec.title}>
                <h3 className="font-display text-base font-semibold text-black">{sec.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{sec.content}</p>
              </section>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 md:px-8">
          <Link href="/privacy-policy" className="text-sm font-semibold text-primary underline underline-offset-2">
            Open the full Privacy Policy page
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#1D9FDA] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D9FDA]/90"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
