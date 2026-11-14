"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useHydrated } from "@/newsetup/lib/hydration";
import { KIND_LABEL, records, statusLabel } from "@/newsetup/services";
import { dateTime } from "@/newsetup/lib/format";
import { RecordFromUrl, RecordTracker } from "./RecordTracker";

/* ---------------- Track order / request ---------------- */

export function RecentRecords({ title = "Recent orders & requests on this device" }: { title?: string }) {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="ns-card-dashed">Loading…</div>;
  const list = records.list();
  return (
    <section className="ns-card" aria-labelledby="recent-h">
      <h2 id="recent-h" className="mb-2">
        {title}
      </h2>
      {!list.length ? (
        <p className="text-sm">
          Nothing yet. <Link href="/product-range">Shop medicines</Link> or <Link href="/order-medicines">start a business request</Link>.
        </p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-[#e6ebef]">
              <th className="py-1 pr-2">Reference</th>
              <th className="py-1 pr-2">Type</th>
              <th className="py-1 pr-2">Status</th>
              <th className="py-1 pr-2 hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.ref} className="border-b border-[#eef1f4]">
                <td className="py-1 pr-2">
                  <Link href={`/track-order?ref=${r.ref}`} className="font-mono">
                    {r.ref}
                  </Link>
                </td>
                <td className="py-1 pr-2">{KIND_LABEL[r.kind]}</td>
                <td className="py-1 pr-2">{statusLabel(r.status)}</td>
                <td className="py-1 pr-2 hidden sm:table-cell">{dateTime(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function TrackOrderView() {
  const params = useSearchParams();
  const router = useRouter();
  const ref = params.get("ref");
  const [value, setValue] = useState(ref ?? "");
  const [error, setError] = useState("");
  return (
    <div className="space-y-4">
      <form
        className="ns-card flex flex-wrap gap-2 items-end"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return setError("Enter your order or reference number.");
          setError("");
          router.replace(`/track-order?ref=${encodeURIComponent(value.trim().toUpperCase())}`);
        }}
      >
        <div className="ns-field flex-1 min-w-[14rem]">
          <label htmlFor="track-ref">Order or reference number</label>
          <input
            id="track-ref"
            className="ns-input font-mono"
            placeholder="e.g. GM-ORD-123456"
            value={value}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "track-err" : "track-hint"}
            onChange={(e) => setValue(e.target.value)}
          />
          <p id="track-hint" className="ns-hint">
            Works for medicine orders (GM-ORD), quotations (GM-RFQ), purchase orders (GM-PO), registrations (GM-REG) and inquiries (GM-PRO, GM-CSP, GM-SUP).
          </p>
          {error && (
            <p id="track-err" className="ns-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <button className="ns-btn ns-btn-primary" type="submit">
          Track
        </button>
      </form>
      {ref && <RecordFromUrl>{(rec) => <RecordTracker key={rec.ref} initial={rec} />}</RecordFromUrl>}
      <RecentRecords />
    </div>
  );
}

