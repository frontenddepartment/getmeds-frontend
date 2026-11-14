/**
 * NEW SETUP — PROTOTYPE implementation. Records live in this browser's localStorage only:
 * nothing is sent to the Getmeds backend, Google Sheets, email or Sanity. Replace with
 * real API clients once the backend supports references, RFQ/PO uploads and tracking.
 */
import type { BaseRecord, CrmService, RecordKind, RecordStore, SalesService } from "./types";

const KEY = "getmeds-newsetup-records";
const PREFIX: Record<RecordKind, string> = {
  order: "GM-ORD",
  medicine_request: "GM-REQ",
  assistance_request: "GM-PAP",
  professional_inquiry: "GM-PRO",
  csp_inquiry: "GM-CSP",
  partner_registration: "GM-REG",
  quotation: "GM-RFQ",
  purchase_order: "GM-PO",
  contact: "GM-SUP",
};

const now = () => new Date().toISOString();
const isBrowser = () => typeof window !== "undefined";

function readAll(): BaseRecord[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as BaseRecord[];
  } catch {
    return [];
  }
}
function writeAll(records: BaseRecord[]) {
  if (isBrowser()) localStorage.setItem(KEY, JSON.stringify(records));
}

const newRef = (kind: RecordKind) => `${PREFIX[kind]}-${Math.floor(100000 + Math.random() * 900000)}`;

function create(kind: RecordKind, status: string, contact: BaseRecord["contact"], data: Record<string, unknown>, note?: string): BaseRecord {
  const rec: BaseRecord = { ref: newRef(kind), kind, status, createdAt: now(), timeline: [{ status, at: now(), note }], contact, isMock: true, data };
  writeAll([rec, ...readAll()]);
  return rec;
}

export const records: RecordStore = {
  get: (ref) => readAll().find((r) => r.ref.toUpperCase() === ref.trim().toUpperCase()),
  list: (kind) => readAll().filter((r) => !kind || r.kind === kind),
  update(ref, status, note) {
    const all = readAll();
    const rec = all.find((r) => r.ref === ref);
    if (!rec) return undefined;
    rec.status = status;
    rec.timeline.push({ status, at: now(), note });
    writeAll(all);
    return rec;
  },
  patch(ref, data) {
    const all = readAll();
    const rec = all.find((r) => r.ref === ref);
    if (!rec) return undefined;
    rec.data = { ...rec.data, ...data };
    writeAll(all);
    return rec;
  },
};

const DEMO_PARTNERS = [{ accountId: "PARTNER-DEMO", businessName: "Demo Pharmacy (sample account)", creditTerms: "30 days (sample)" }];

export const crm: CrmService = {
  createInquiry: (kind, contact, data) => create(kind, "received", contact, data),
  findPartner(accountId) {
    const id = accountId.trim().toUpperCase();
    const demo = DEMO_PARTNERS.find((p) => p.accountId === id);
    if (demo) return demo;
    // A partner registration (GM-REG-…) marked "verified" in tracking can sign in to partner ordering.
    const reg = records.list("partner_registration").find((r) => r.ref === id && r.status === "verified");
    return reg ? { accountId: reg.ref, businessName: String(reg.data.businessName ?? "Registered partner"), creditTerms: "Subject to credit approval" } : undefined;
  },
};

export const sales: SalesService = {
  createQuotationRequest: (contact, data) => create("quotation", "received", contact, data),
  createPurchaseOrder: (contact, data) => create("purchase_order", "po_submitted", contact, data),
  acceptQuotation(ref, poNumber) {
    const rec = records.patch(ref, { poNumber });
    return rec ? records.update(ref, "po_submitted", `PO ${poNumber} submitted.`) : undefined;
  },
};
