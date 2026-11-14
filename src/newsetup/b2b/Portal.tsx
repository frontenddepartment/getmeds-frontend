"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useHydrated } from "@/newsetup/lib/hydration";
import { crm, records, sales, KIND_LABEL, statusLabel, type BaseRecord } from "@/newsetup/services";
import { PRODUCTS, getProductBySlug } from "@/newsetup/data/catalog";
import { dateTime } from "@/newsetup/lib/format";
import { FlowSteps, KeyValue, Notice } from "@/newsetup/ui";
import { FileField, TextField } from "@/newsetup/forms";
import { RecordFromUrl, RecordTracker } from "@/newsetup/tracking/RecordTracker";

type ReqLine = { slug?: string; product?: string; qty: number };

/* ================= Shared request confirmation ================= */

const NEXT_STEPS: Record<string, { title: string; text: string }[]> = {
  medicine_request: [
    { title: "Review", text: "Our team reviews your request; a licensed pharmacist verifies prescriptions where required." },
    { title: "Availability & amount", text: "We confirm availability and the amount with you." },
    { title: "Your confirmation", text: "You confirm the order and payment method." },
    { title: "Preparation & delivery", text: "Your medicines are prepared, dispatched, and delivered." },
  ],
  assistance_request: [
    { title: "Document review", text: "We review what you uploaded and tell you if anything is missing." },
    { title: "Medicine quotation", text: "We prepare the medicine quotation for your application." },
    { title: "Your application", text: "You apply to the agency using its official process." },
    { title: "Coordination", text: "Where applicable, we coordinate an existing Guarantee Letter with you." },
  ],
  professional_inquiry: [
    { title: "Credential verification", text: "Only where necessary (documentation, supply, patient access). Availability and product questions skip this step." },
    { title: "Review", text: "Our medical / sales team prepares the information or coordination you requested." },
    { title: "Response", text: "We contact you by email or phone, typically within 1–2 business days (target, to be confirmed)." },
  ],
  csp_inquiry: [
    { title: "Credential & document review", text: "We verify the requester and list the documents needed." },
    { title: "CSP application", text: "We coordinate filing with FDA Philippines." },
    { title: "FDA decision", text: "Supply proceeds only if FDA approves the permit." },
  ],
  partner_registration: [
    { title: "Business verification", text: "We validate your FDA LTO and business documents." },
    { title: "Account activation", text: "Verified partners receive an account ID for ordering." },
    { title: "Access pricing & order", text: "View applicable pricing, request quotations, and place POs." },
  ],
  quotation: [
    { title: "Review", text: "Sales checks availability, lead time, and applicable pricing." },
    { title: "Quotation issued", text: "You receive a formal quotation to review." },
    { title: "Submit PO", text: "Confirm by submitting your purchase order and documents." },
    { title: "Delivery", text: "Order is confirmed, dispatched, and tracked to delivery." },
  ],
  purchase_order: [
    { title: "PO validation", text: "We validate pricing, credit terms, and documents." },
    { title: "Order confirmation", text: "You receive an order confirmation." },
    { title: "Dispatch & delivery", text: "Track until delivered; reorder from your history." },
  ],
  contact: [
    { title: "Assigned", text: "Your message is routed to the right team." },
    { title: "Response", text: "We reply by email or phone." },
  ],
};

export function RequestConfirmationView() {
  return (
    <RecordFromUrl>
      {(rec) => (
        <div className="space-y-4">
          <Notice kind="success" title={`${KIND_LABEL[rec.kind]} received`}>
            Reference <strong className="font-mono">{rec.ref}</strong>. Keep this number to track your request. (Prototype: no email is sent and no team member receives
            this.)
          </Notice>
          <section className="ns-card">
            <h2 className="mb-2">What happens next</h2>
            <FlowSteps steps={NEXT_STEPS[rec.kind] ?? NEXT_STEPS.contact} />
          </section>
          <RecordTracker initial={rec} />
        </div>
      )}
    </RecordFromUrl>
  );
}

/* ================= Quotation review → PO ================= */

function ensureQuotation(rec: BaseRecord): BaseRecord {
  if (rec.data.quotation) return rec;
  const lines = ((rec.data.products as ReqLine[]) ?? []).map((l) => {
    const p = l.slug ? getProductBySlug(l.slug) : undefined;
    return { label: p ? `${p.brand} ${p.strength} (${p.generic}) ${p.form}` : l.product ?? "Product", qty: l.qty };
  });
  return records.patch(rec.ref, { quotation: { lines, validityDays: 30, leadTime: "Confirmed in the formal quotation" } })!;
}

function QuotationDetail({ initial }: { initial: BaseRecord }) {
  const router = useRouter();
  const [rec] = useState(() => (initial.status === "quotation_issued" ? ensureQuotation(initial) : initial));
  const [po, setPo] = useState("");
  const [poErr, setPoErr] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [fileErr, setFileErr] = useState("");

  if (["received", "under_review"].includes(rec.status))
    return (
      <Notice title="Quotation not ready yet">
        Your request <strong>{rec.ref}</strong> is “{statusLabel(rec.status)}”. You&apos;ll be notified when the quotation is issued.{" "}
        <Link href={`/track-order?ref=${rec.ref}`}>Track request</Link> (prototype: use the simulate control there to issue a sample quotation).
      </Notice>
    );
  if (rec.status !== "quotation_issued")
    return (
      <Notice kind="success" title={`Status: ${statusLabel(rec.status)}`}>
        A purchase order has already been submitted for this quotation. <Link href={`/track-order?ref=${rec.ref}`}>Track delivery</Link>.
      </Notice>
    );

  const q = rec.data.quotation as { lines: { label: string; qty: number }[]; validityDays: number; leadTime: string };

  return (
    <div className="space-y-4">
      <section className="ns-card space-y-3">
        <p className="ns-proto">Prototype quotation summary — pricing is provided in the formal quotation document</p>
        <h2>Quotation for {rec.contact.organization ?? rec.contact.name}</h2>
        <KeyValue
          rows={[
            ["Reference", rec.ref],
            ["Procurement type", String(rec.data.procurement ?? "regular").replace("_", " ")],
            ["Valid for", `${q.validityDays} days (sample)`],
            ["Lead time", q.leadTime],
            ["Payment", String(rec.data.paymentPref ?? "—").replace("_", " ")],
          ]}
        />
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#e6ebef] text-left">
              <th className="py-1 pr-2">Item</th>
              <th className="py-1 pr-2">Qty</th>

            </tr>
          </thead>
          <tbody>
            {q.lines.map((l, i) => (
              <tr key={i} className="border-b border-[#eef1f4]">
                <td className="py-1 pr-2">{l.label}</td>
                <td className="py-1 pr-2">{l.qty}</td>

              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs ns-muted">Prototype data only. Real quotations will be generated by Bishnoi One Sales and sent as a formal document.</p>
      </section>
      <form
        className="ns-card space-y-3"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const pe = po.trim() ? "" : "Enter your purchase order number.";
          const fe = files.length ? "" : fileErr || "Attach your signed purchase order.";
          setPoErr(pe);
          setFileErr(fe);
          if (pe || fe) return;
          records.patch(rec.ref, { poDocuments: files });
          sales.acceptQuotation(rec.ref, po.trim());
          router.push(`/track-order?ref=${rec.ref}`);
        }}
      >
        <h2>Accept quotation — submit purchase order</h2>
        <TextField id="po-no" name="po" label="Purchase order (PO) number" required value={po} error={poErr} onChange={setPo} />
        <FileField id="po-file" label="Signed PO & supporting documents *" files={files} error={fileErr} onFiles={(n, e) => { setFiles(n); setFileErr(e); }} hint="PO, and for institutions: purchase request / notice of award where applicable. Prototype: not uploaded." />
        <div className="flex flex-wrap gap-2">
          <button className="ns-btn ns-btn-primary" type="submit">
            Submit PO
          </button>
          <Link className="ns-btn" href={`/contact-us?ref=${rec.ref}&topic=partnership`}>
            Request revision
          </Link>
        </div>
      </form>
    </div>
  );
}

export function QuotationReviewView() {
  return <RecordFromUrl>{(rec) => (rec.kind === "quotation" ? <QuotationDetail initial={rec} /> : <Notice kind="error" title="Not a quotation">Reference {rec.ref} is not a quotation request.</Notice>)}</RecordFromUrl>;
}

/* ================= Partner portal (existing partners) ================= */

type Partner = NonNullable<ReturnType<typeof crm.findPartner>>;

export function PartnerPortalView() {
  const params = useSearchParams();
  const accountParam = params.get("account") ?? "";
  const reorderRef = params.get("reorder");
  const hydrated = useHydrated();
  if (!hydrated) return <div className="ns-card-dashed">Loading…</div>;
  const partner = accountParam ? crm.findPartner(accountParam) : undefined;
  if (!partner) return <PartnerSignIn key={accountParam} accountParam={accountParam} />;
  return <PartnerWorkspace key={`${accountParam}|${reorderRef}`} partner={partner} reorderRef={reorderRef} />;
}

function PartnerSignIn({ accountParam }: { accountParam: string }) {
  const router = useRouter();
  const [input, setInput] = useState(accountParam);
  const [error, setError] = useState(
    accountParam ? "Account not found or not yet verified. Use PARTNER-DEMO for the demo, or a verified registration reference (GM-REG-…)." : "",
  );
  return (
      <div className="grid gap-4 md:grid-cols-2">
        <form
          className="ns-card space-y-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return setError("Enter your partner account ID.");
            setError("");
            router.replace(`/partner-portal?account=${encodeURIComponent(input.trim().toUpperCase())}`);
          }}
        >
          <h2>Existing partner sign in</h2>
          <TextField id="acct" name="account" label="Partner account ID" value={input} onChange={setInput} error={error} hint="Demo: PARTNER-DEMO. Real authentication will be added with Bishnoi One." />
          <button className="ns-btn ns-btn-primary" type="submit">
            Continue
          </button>
        </form>
        <div className="ns-card space-y-2">
          <h2>New partner?</h2>
          <p className="text-sm">Register your pharmacy or distribution business. Pricing and ordering are available after business and FDA license verification.</p>
          <Link className="ns-btn" href="/partner-registration">
            Register as a partner
          </Link>
        </div>
      </div>
  );
}

function PartnerWorkspace({ partner, reorderRef }: { partner: Partner; reorderRef: string | null }) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>(() => {
    const lines = ((reorderRef && records.get(reorderRef)?.data.products) as ReqLine[] | undefined) ?? [];
    return Object.fromEntries(lines.filter((l) => l.slug).map((l) => [l.slug!, l.qty]));
  });
  const [filter, setFilter] = useState("");
  const [po, setPo] = useState("");
  const [poErr, setPoErr] = useState("");
  const history: BaseRecord[] = [...records.list("purchase_order"), ...records.list("quotation")].filter((r) => r.data.accountId === partner.accountId);

  const list = useMemo(() => {
    const n = filter.trim().toLowerCase();
    return PRODUCTS.filter((p) => !n || `${p.brand} ${p.generic}`.toLowerCase().includes(n));
  }, [filter]);
  const selected = Object.entries(qty).filter(([, n]) => n > 0);

  function submit(kind: "rfq" | "po") {
    if (!selected.length) return setPoErr("Enter a quantity for at least one product.");
    if (kind === "po" && !po.trim()) return setPoErr("Enter your PO number to place a purchase order.");
    setPoErr("");
    const contact = { name: partner!.businessName, email: "partner@example.com", phone: "-", organization: partner!.businessName };
    const data = { accountId: partner!.accountId, products: selected.map(([slug, n]) => ({ slug, qty: n })), poNumber: po.trim() || undefined, customerType: "distributor", procurement: "regular" };
    const rec = kind === "po" ? sales.createPurchaseOrder(contact, data) : sales.createQuotationRequest(contact, data);
    router.push(`/request-confirmation?ref=${rec.ref}`);
  }

  return (
    <div className="space-y-4">
      <section className="ns-card">
        <h2>{partner.businessName}</h2>
        <KeyValue
          rows={[
            ["Account ID", partner.accountId],
            ["Credit terms", partner.creditTerms],
            ["Pricing", "Applicable partner pricing is confirmed in your quotation / order confirmation"],
          ]}
        />
        <button className="ns-btn ns-btn-sm mt-2" onClick={() => router.replace("/partner-portal")}>
          Sign out
        </button>
      </section>
      {reorderRef && <Notice title="Reorder">Quantities pre-filled from {reorderRef}. Review and submit.</Notice>}
      <section className="ns-card space-y-3" aria-labelledby="po-h">
        <h2 id="po-h">Select products</h2>
        <div className="ns-field max-w-sm">
          <label htmlFor="pf">Filter products</label>
          <input id="pf" className="ns-input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Brand or generic" />
        </div>
        <div className="overflow-x-auto max-h-[28rem] overflow-y-auto rounded-xl border border-[#e6ebef]">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#f3f5f7] sticky top-0">
              <tr className="text-left">
                <th className="p-2">Product</th>
                <th className="p-2">Category</th>
                <th className="p-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.slug} className="border-t border-[#eef1f4]">
                  <td className="p-2">
                    <span className="font-semibold">{p.brand}</span> {p.strength}
                    <span className="block text-xs ns-muted">
                      {p.generic} · {p.form}
                    </span>
                  </td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">
                    <input
                      aria-label={`Quantity for ${p.brand} ${p.strength}`}
                      className="ns-input w-24"
                      type="number"
                      min={0}
                      value={qty[p.slug] ?? ""}
                      onChange={(e) => setQty((q) => ({ ...q, [p.slug]: Math.max(0, Number(e.target.value) || 0) }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          Selected: <strong>{selected.length}</strong> product(s). Pricing and availability are confirmed by our trade sales team.
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end">
          <TextField id="pp-po" name="po" label="PO number (required to place order)" value={po} onChange={setPo} />
          <button className="ns-btn" onClick={() => submit("rfq")}>
            Request quotation
          </button>
          <button className="ns-btn ns-btn-primary" onClick={() => submit("po")}>
            Place purchase order
          </button>
        </div>
        {poErr && (
          <p className="ns-error" role="alert">
            {poErr}
          </p>
        )}
      </section>
      <section className="ns-card" aria-labelledby="hist-h">
        <h2 id="hist-h" className="mb-2">
          Order & quotation history
        </h2>
        {!history.length ? (
          <p className="text-sm">No orders yet on this device.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {history.map((r) => (
              <li key={r.ref} className="flex flex-wrap gap-2 items-center">
                <Link href={`/track-order?ref=${r.ref}`} className="font-mono">
                  {r.ref}
                </Link>
                <span>
                  {KIND_LABEL[r.kind]} · {statusLabel(r.status)} · {dateTime(r.createdAt)}
                </span>
                <Link className="ns-btn ns-btn-sm" href={`/partner-portal?account=${partner.accountId}&reorder=${r.ref}`}>
                  Reorder
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
