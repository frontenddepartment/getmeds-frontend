import type { BaseRecord, RecordKind } from "./types";

/**
 * Status pipelines per record kind. `pipeline` is the happy path; `branches` are
 * exception states reachable from specific steps. Used by the tracking page and
 * the prototype "simulate" controls.
 */
export type StatusDef = { label: string; description: string; tone?: "ok" | "warn" | "error" | "done" };

export const STATUS: Record<string, StatusDef> = {
  // Patient order
  submitted: { label: "Order submitted", description: "We received your order request. It is NOT yet approved for dispensing." },
  awaiting_prescription: { label: "Awaiting prescription", description: "Your order contains prescription medicine. Upload a valid prescription to continue.", tone: "warn" },
  pharmacist_review: { label: "Pharmacist review", description: "A licensed Getmeds pharmacist is reviewing your prescription and order." },
  additional_verification: { label: "Additional verification", description: "This order contains a medicine that requires additional regulatory safeguards (e.g. original prescription and valid ID). Our pharmacist will contact you.", tone: "warn" },
  prescription_rejected: { label: "Prescription not accepted", description: "Your prescription could not be accepted. Please upload a valid prescription or contact our pharmacist.", tone: "error" },
  approved_for_dispensing: { label: "Approved for dispensing", description: "The pharmacist approved your order. It will now be prepared.", tone: "ok" },
  preparing: { label: "Preparing order", description: "Your medicines are being picked, checked, and packed." },
  dispatched: { label: "Dispatched", description: "Your order has left our facility." },
  out_for_delivery: { label: "Out for delivery", description: "Your order is with the courier for delivery today." },
  delivered: { label: "Delivered", description: "Your order was delivered.", tone: "done" },
  cancelled: { label: "Cancelled", description: "This order was cancelled.", tone: "error" },
  out_of_stock_hold: { label: "On hold — availability", description: "One or more items are currently unavailable. Our team will contact you with options.", tone: "warn" },

  // Inquiries / registrations
  received: { label: "Request received", description: "Your request was received and assigned a reference number." },
  credential_verification: { label: "Credential verification", description: "We are verifying your professional credentials (e.g. PRC license).", tone: "warn" },
  business_verification: { label: "Business verification", description: "We are verifying your business documents and FDA License to Operate.", tone: "warn" },
  in_progress: { label: "In progress", description: "A Getmeds representative is working on your request." },
  documents_review: { label: "Documents review", description: "We are reviewing the documents required for the CSP application." },
  submitted_to_fda: { label: "Filed — subject to FDA approval", description: "The CSP application has been filed. Approval is decided by FDA Philippines, not Getmeds." },
  verified: { label: "Verified", description: "Your business is verified. You can now access applicable pricing and place orders.", tone: "ok" },
  verification_failed: { label: "Verification unsuccessful", description: "We could not verify the submitted documents. Our team will contact you.", tone: "error" },
  resolved: { label: "Resolved", description: "Your request has been resolved.", tone: "done" },

  // Patient medicine request (spec: Request Received → … → Delivered)
  action_required: { label: "Action required", description: "We need more information or a document from you. Please upload it below or contact us.", tone: "warn" },
  availability_ready: { label: "Availability / quotation ready", description: "We confirmed availability and pricing. Review the details we sent and confirm to continue.", tone: "ok" },
  customer_confirmation: { label: "Customer confirmation", description: "You confirmed the order. Prescription-only items still require pharmacist verification before dispensing." },
  payment_confirmed: { label: "Payment confirmed", description: "Payment was confirmed (if applicable).", tone: "ok" },
  cancelled_unavailable: { label: "Cancelled / unavailable", description: "This request was cancelled or the medicine is unavailable. Contact us for alternatives.", tone: "error" },

  // PCSO / DSWD assistance request
  reviewing_documents: { label: "Reviewing documents", description: "Our team is reviewing the documents you uploaded." },
  additional_documents_required: { label: "Additional documents required", description: "Some documents are missing or unclear. Upload them below.", tone: "warn" },
  quotation_ready: { label: "Medicine quotation ready", description: "Your medicine quotation is ready for your assistance application.", tone: "ok" },
  awaiting_customer_action: { label: "Awaiting customer action", description: "We are waiting for your response or next step with the agency.", tone: "warn" },
  assistance_coordination: { label: "Assistance coordination", description: "We are coordinating with you on the applicable assistance document (e.g. an existing Guarantee Letter). Approval of assistance is decided by the agency, not Getmeds." },
  closed: { label: "Completed / closed", description: "This request is completed or closed.", tone: "done" },

  // Quotation / PO
  under_review: { label: "Under review", description: "Our team is reviewing your request, availability, and applicable pricing." },
  quotation_issued: { label: "Quotation issued", description: "Your quotation is ready to review.", tone: "ok" },
  po_submitted: { label: "PO submitted", description: "Your purchase order and documents were received and are being validated." },
  order_confirmed: { label: "Order confirmed", description: "The order is confirmed and scheduled for fulfillment.", tone: "ok" },
};

export const PIPELINES: Record<RecordKind, { pipeline: string[]; branches: Record<string, string[]> }> = {
  order: {
    pipeline: ["submitted", "pharmacist_review", "approved_for_dispensing", "preparing", "dispatched", "out_for_delivery", "delivered"],
    branches: {
      awaiting_prescription: ["pharmacist_review", "cancelled"],
      pharmacist_review: ["prescription_rejected", "additional_verification", "out_of_stock_hold"],
      prescription_rejected: ["pharmacist_review", "cancelled"],
      additional_verification: ["approved_for_dispensing", "cancelled"],
      out_of_stock_hold: ["approved_for_dispensing", "cancelled"],
    },
  },
  medicine_request: {
    pipeline: ["received", "under_review", "availability_ready", "customer_confirmation", "payment_confirmed", "preparing", "dispatched", "delivered"],
    branches: {
      under_review: ["action_required", "cancelled_unavailable"],
      action_required: ["under_review", "cancelled_unavailable"],
    },
  },
  assistance_request: {
    pipeline: ["received", "reviewing_documents", "quotation_ready", "awaiting_customer_action", "assistance_coordination", "closed"],
    branches: {
      reviewing_documents: ["additional_documents_required"],
      additional_documents_required: ["reviewing_documents"],
    },
  },
  professional_inquiry: {
    pipeline: ["received", "credential_verification", "in_progress", "resolved"],
    branches: {},
  },
  csp_inquiry: {
    pipeline: ["received", "credential_verification", "documents_review", "submitted_to_fda", "resolved"],
    branches: {},
  },
  partner_registration: {
    pipeline: ["received", "business_verification", "verified"],
    branches: { business_verification: ["verification_failed"] },
  },
  quotation: {
    pipeline: ["received", "under_review", "quotation_issued", "po_submitted", "order_confirmed", "dispatched", "delivered"],
    branches: {},
  },
  purchase_order: {
    pipeline: ["po_submitted", "order_confirmed", "preparing", "dispatched", "delivered"],
    branches: {},
  },
  contact: { pipeline: ["received", "in_progress", "resolved"], branches: {} },
};

export const KIND_LABEL: Record<RecordKind, string> = {
  order: "Medicine order",
  medicine_request: "Medicine request",
  assistance_request: "Assistance request",
  professional_inquiry: "Professional inquiry",
  csp_inquiry: "CSP inquiry",
  partner_registration: "Partner registration",
  quotation: "Quotation request",
  purchase_order: "Purchase order",
  contact: "Support request",
};

export const statusLabel = (s: string) => STATUS[s]?.label ?? s;

/** Happy-path pipeline for a specific record (preliminary professional inquiries skip credential verification). */
export function pipelineFor(rec: BaseRecord): string[] {
  const p = PIPELINES[rec.kind].pipeline;
  if (rec.kind === "professional_inquiry" && rec.data.credentialsRequired === false) return p.filter((s) => s !== "credential_verification");
  return p;
}
