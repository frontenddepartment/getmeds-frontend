"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useHydrated } from "@/newsetup/lib/hydration";
import { KIND_LABEL, PIPELINES, STATUS, pipelineFor, records, statusLabel, type BaseRecord } from "@/newsetup/services";
import { getProductBySlug } from "@/newsetup/data/catalog";
import { dateTime } from "@/newsetup/lib/format";
import { KeyValue, Notice } from "@/newsetup/ui";
import { FileField } from "@/newsetup/forms";

/** Visual status timeline: completed / current / upcoming steps on the happy path. */
export function StatusTimeline({ rec }: { rec: BaseRecord }) {
  const pipeline = pipelineFor(rec);
  const currentIdx = pipeline.indexOf(rec.status);
  // When in an exception state (off the happy path), show progress up to the last on-path step reached.
  const progressIdx = currentIdx >= 0 ? currentIdx : Math.max(-1, ...rec.timeline.map((t) => pipeline.indexOf(t.status))) + 1;
  return (
    <ol className="space-y-1 text-sm" aria-label="Status progress">
      {pipeline.map((s, i) => {
        const done = i < progressIdx;
        const current = i === currentIdx;
        return (
          <li key={s} className={`rounded-lg border p-2 ${current ? "border-primary bg-primary-soft font-semibold text-primary-deep" : done ? "border-transparent bg-[#f1f3f5]" : "border-[#e6ebef] bg-white ns-muted"}`}>
            {done ? "✓" : current ? "●" : "○"} {statusLabel(s)}
            {current && <span className="block font-normal">{STATUS[s]?.description}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function DemoControls({ rec, onChange }: { rec: BaseRecord; onChange: (r: BaseRecord) => void }) {
  const pipeline = pipelineFor(rec);
  const { branches } = PIPELINES[rec.kind];
  const idx = pipeline.indexOf(rec.status);
  const options = [...(idx >= 0 && idx < pipeline.length - 1 ? [pipeline[idx + 1]] : []), ...(branches[rec.status] ?? [])];
  if (!options.length) return null;
  return (
    <div className="ns-card-dashed text-sm space-y-2">
      <p className="font-bold">PROTOTYPE CONTROL — simulate back-office action</p>
      <p>Use these buttons to demonstrate how the customer sees each status. In production, statuses come from Bishnoi One (pharmacist, sales, dispatch).</p>
      <div className="flex flex-wrap gap-2">
        {options.map((s) => (
          <button key={s} className="ns-btn ns-btn-sm" onClick={() => onChange(records.update(rec.ref, s, "Simulated in prototype")!)}>
            → {statusLabel(s)}
          </button>
        ))}
        {rec.kind === "quotation" && rec.status === "under_review" && (
          <span className="ns-hint self-center">Advancing issues a sample quotation.</span>
        )}
      </div>
    </div>
  );
}

function ContextActions({ rec }: { rec: BaseRecord }) {
  const actions: React.ReactNode[] = [];

  if (rec.kind === "quotation" && ["quotation_issued"].includes(rec.status))
    actions.push(
      <Link key="q" className="ns-btn ns-btn-primary" href={`/quotation-review?ref=${rec.ref}`}>
        Review quotation & submit PO
      </Link>,
    );
  if (rec.kind === "partner_registration" && rec.status === "verified")
    actions.push(
      <Link key="p" className="ns-btn ns-btn-primary" href={`/partner-portal?account=${rec.ref}`}>
        Go to partner ordering
      </Link>,
    );
  if (rec.kind === "purchase_order" && rec.status === "delivered")
    actions.push(
      <Link key="re" className="ns-btn" href={`/partner-portal?account=${String(rec.data.accountId ?? "")}&reorder=${rec.ref}`}>
        Reorder
      </Link>,
    );
  actions.push(
    <Link key="help" className="ns-btn" href={`/contact-us?ref=${rec.ref}`}>
      Contact us about this
    </Link>,
  );
  return <div className="flex flex-wrap gap-2">{actions}</div>;
}

export function RecordTracker({ initial }: { initial: BaseRecord }) {
  const [rec, setRec] = useState(initial);
  const def = STATUS[rec.status];
  // Quotation / PO product lines: catalog slug or free-text product, with quantity.
  const lines = (rec.data.products as { slug?: string; product?: string; qty: number }[] | undefined) ?? [];

  return (
    <div className="space-y-4">
      <div className="ns-card space-y-2">
        <p className="ns-proto">{KIND_LABEL[rec.kind]} · Prototype record — not sent to Getmeds</p>
        <h2>
          Reference: <span className="font-mono">{rec.ref}</span>
        </h2>
        <Notice kind={def?.tone === "error" ? "error" : def?.tone === "warn" ? "warn" : def?.tone ? "success" : "info"} title={`Current status: ${statusLabel(rec.status)}`}>
          {def?.description}
        </Notice>
        <ContextActions rec={rec} />
        {NEEDS_DOCS[rec.status] && <AdditionalDocsUpload rec={rec} onDone={setRec} />}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="ns-card" aria-labelledby="prog-h">
          <h2 id="prog-h" className="mb-2">
            Progress
          </h2>
          <StatusTimeline rec={rec} />
          {pipelineFor(rec).indexOf(rec.status) === -1 && (
            <p className="text-sm mt-2 font-semibold">Exception state: {statusLabel(rec.status)} — see message above.</p>
          )}
        </section>
        <section className="ns-card space-y-3" aria-labelledby="det-h">
          <h2 id="det-h">Details</h2>
          <KeyValue
            rows={[
              ["Submitted", dateTime(rec.createdAt)],
              ["Name", rec.contact.name],
              ...(rec.contact.organization ? ([["Organization", rec.contact.organization]] as [string, string][]) : []),
              ["Email", rec.contact.email],
            ]}
          />
          {lines.length > 0 && (
            <ul className="text-sm list-disc pl-5">
              {lines.map((l, i) => {
                const p = l.slug ? getProductBySlug(l.slug) : undefined;
                return (
                  <li key={i}>
                    {l.qty} × {p ? `${p.brand} ${p.strength}` : l.product ?? l.slug}
                  </li>
                );
              })}
            </ul>
          )}
          <RequestContent rec={rec} />
          <details className="text-sm">
            <summary className="cursor-pointer">History ({rec.timeline.length})</summary>
            <ol className="mt-2 space-y-1">
              {rec.timeline.map((t, i) => (
                <li key={i}>
                  {dateTime(t.at)} — {statusLabel(t.status)}
                  {t.note && <span className="ns-muted"> ({t.note})</span>}
                </li>
              ))}
            </ol>
          </details>
        </section>
      </div>
      <DemoControls rec={rec} onChange={setRec} />
    </div>
  );
}

/** Statuses where the customer can upload missing documents directly from the tracking page → next status. */
const NEEDS_DOCS: Record<string, string> = {
  action_required: "under_review",
  additional_documents_required: "reviewing_documents",
};

function AdditionalDocsUpload({ rec, onDone }: { rec: BaseRecord; onDone: (r: BaseRecord) => void }) {
  const [files, setFiles] = useState<string[]>([]);
  const [err, setErr] = useState("");
  return (
    <form
      className="rounded-xl bg-[#f7f9fb] p-4 space-y-2"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!files.length) return setErr(err || "Select at least one document to upload.");
        const prev = (rec.data.documents as string[] | undefined) ?? [];
        records.patch(rec.ref, { documents: [...prev, ...files] });
        onDone(records.update(rec.ref, NEEDS_DOCS[rec.status], `Customer uploaded: ${files.join(", ")}`)!);
      }}
    >
      <h3>Upload missing documents</h3>
      <FileField id={`more-docs-${rec.ref}`} label="Additional document(s)" files={files} error={err} onFiles={(n, e) => { setFiles(n); setErr(e); }} />
      <button className="ns-btn ns-btn-primary" type="submit">
        Submit documents
      </button>
    </form>
  );
}

/** Shows what the customer submitted for document-first requests. */
function RequestContent({ rec }: { rec: BaseRecord }) {
  const docs = (rec.data.documents as string[] | undefined) ?? [];
  const meds = (rec.data.medicines as { name: string; strength: string; form: string; qty: string }[] | undefined) ?? [];
  const program = rec.data.program as string | undefined;
  if (!docs.length && !meds.length && !program) return null;
  return (
    <div className="text-sm space-y-1">
      {program && <p>Program: {program === "dswd" ? "DSWD Medical Assistance (AICS)" : "PCSO Medical Assistance"}</p>}
      {docs.length > 0 && <p>Documents: {docs.join(", ")}</p>}
      {meds.length > 0 && (
        <ul className="list-disc pl-5">
          {meds.map((m, i) => (
            <li key={i}>
              {m.qty} × {m.name} {m.strength} {m.form}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Loads a record by ?ref= after hydration (records live in localStorage) and renders
 * loading / not-found / found states.
 */
export function RecordFromUrl({ children, notFound }: { children: (rec: BaseRecord) => React.ReactNode; notFound?: React.ReactNode }) {
  const params = useSearchParams();
  const ref = params.get("ref");
  const hydrated = useHydrated();
  if (!hydrated) return <div className="ns-card-dashed">Loading…</div>;
  const rec = ref ? records.get(ref) : undefined;
  if (!rec)
    return (
      <>
        {notFound ?? (
          <Notice kind="error" title="Reference not found">
            We couldn&apos;t find {ref ? <strong>{ref}</strong> : "that reference"} on this device. Prototype records are stored only in this browser.{" "}
            <Link href="/track-order">Look up another reference</Link>.
          </Notice>
        )}
      </>
    );
  return <>{children(rec)}</>;
}
