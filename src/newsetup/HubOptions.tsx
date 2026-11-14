/**
 * NEW SETUP — compact "What do you need?" block under the Order Medicines hub's audience cards:
 * one column per customer type with its options, so visitors can jump straight to the right workflow.
 */
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { CUSTOMER_TYPES } from "@/newsetup/data/ordering";
import "./newsetup.css";

export default function HubOptions() {
  return (
    <section aria-labelledby="ns-hub-options-h" className="pb-8 md:pb-12">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="rounded-3xl border border-[#dde9f2] bg-white p-5 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="ns-label">Order medicines</span>
              <h2 id="ns-hub-options-h" className="font-display mt-2 text-xl font-semibold text-primary-deep md:text-2xl">
                What do you need?
              </h2>
            </div>
            <Link href="/track-order" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-deep">
              <PackageSearch aria-hidden className="h-4 w-4" /> Track a request
            </Link>
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CUSTOMER_TYPES.map((t) => (
              <div key={t.key}>
                <Link href={t.path} className="font-display font-semibold text-black hover:text-primary">
                  {t.title}
                </Link>
                <ul className="mt-2 space-y-2">
                  {t.options.map((o) => (
                    <li key={o.label} className="text-sm">
                      <Link href={o.href} className={`${o.primary ? "font-semibold" : ""} text-primary hover:text-primary-deep`}>
                        {o.label}
                      </Link>
                      {o.prototype && <span className="ml-1.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-[#7a5300]">prototype</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
