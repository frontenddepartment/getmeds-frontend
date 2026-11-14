/**
 * NEW SETUP — service contracts for the added workflows (future Bishnoi One integration):
 *   CRM   → CSP inquiries, PCSO/DSWD assistance requests, partner lookup
 *   Sales → quotation / procurement requests (RFQ), purchase orders
 *   Records → reference numbers, statuses, tracking timeline
 *
 * Site policy (v2 AGENTS.md): prescription medicines have NO online price, cart or checkout,
 * so there is no Inventory/Finance pricing here. v2's existing forms (patient, doctor,
 * distributor, hospital, contact) keep submitting to the live backend and are not routed here.
 * UI imports only from "@/newsetup/services"; swap mock.ts for real API clients later.
 */

export type RecordKind =
  | "order" // reserved (no cart in this branch)
  | "medicine_request"
  | "assistance_request" // PCSO / DSWD assistance-related request
  | "professional_inquiry"
  | "csp_inquiry"
  | "partner_registration"
  | "quotation" // B2B / institutional RFQ or procurement request
  | "purchase_order"
  | "contact";

export type TimelineEvent = { status: string; at: string; note?: string };

export type BaseRecord = {
  ref: string;
  kind: RecordKind;
  status: string;
  createdAt: string;
  timeline: TimelineEvent[];
  contact: { name: string; email: string; phone: string; organization?: string };
  /** Always true in this branch. Never display a prototype record as a real transaction. */
  isMock: true;
  data: Record<string, unknown>;
};

export type LineItem = { slug: string; qty: number };

export interface CrmService {
  createInquiry(kind: Exclude<RecordKind, "order" | "quotation" | "purchase_order">, contact: BaseRecord["contact"], data: Record<string, unknown>): BaseRecord;
  /** Prototype: looks up an existing partner by account ID. */
  findPartner(accountId: string): { accountId: string; businessName: string; creditTerms: string } | undefined;
}

export interface SalesService {
  createQuotationRequest(contact: BaseRecord["contact"], data: Record<string, unknown>): BaseRecord;
  createPurchaseOrder(contact: BaseRecord["contact"], data: Record<string, unknown>): BaseRecord;
  /** Submit a PO against an issued quotation. */
  acceptQuotation(ref: string, poNumber: string): BaseRecord | undefined;
}

export interface RecordStore {
  get(ref: string): BaseRecord | undefined;
  list(kind?: RecordKind): BaseRecord[];
  update(ref: string, status: string, note?: string): BaseRecord | undefined;
  patch(ref: string, data: Record<string, unknown>): BaseRecord | undefined;
}
