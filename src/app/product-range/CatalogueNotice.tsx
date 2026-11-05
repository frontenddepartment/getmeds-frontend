"use client";

import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "getmeds-catalogue-notice";

const noSubscription = () => () => {};

const noticeNotSeen = () => {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return true; // storage blocked: still show the notice
  }
};

/* The prototype's "Before you continue" notice: shown once per browser, and never in the server HTML, so it can't cover the crawlable page. */
export default function CatalogueNotice() {
  const notSeen = useSyncExternalStore(noSubscription, noticeNotSeen, () => false);
  const [dismissed, setDismissed] = useState(false);

  if (!notSeen || dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage blocked: the notice just returns next visit
    }
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5">
      <div role="dialog" aria-modal="true" aria-labelledby="catalogue-notice-title" className="w-full max-w-[520px] rounded-3xl bg-white p-8">
        <h2 id="catalogue-notice-title" className="font-display text-2xl font-semibold text-black">Before you continue</h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          This catalogue is for information only. Prescription medicines are dispensed only with a valid prescription and are reviewed by a licensed Getmeds pharmacist. Always follow your doctor&apos;s advice.
        </p>
        <button autoFocus onClick={dismiss} className="mt-4 h-12 w-full rounded-full bg-primary font-semibold text-white transition hover:brightness-95">
          I understand
        </button>
      </div>
    </div>
  );
}
