"use client";

/**
 * Draft persistence for multi-step request forms (spec: "Save entered information while navigating").
 * sessionStorage only — cleared on submit or when the browser tab closes. Only call from
 * components rendered inside <ClientOnly> (browser storage is unavailable during SSR).
 */
const PREFIX = "getmeds-draft:";

export function loadDraft<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function saveDraft(key: string, value: unknown) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or disabled — drafts are best-effort */
  }
}

export const clearDraft = (key: string) => sessionStorage.removeItem(PREFIX + key);
