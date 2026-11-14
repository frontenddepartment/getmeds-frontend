"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { crm, sales } from "@/newsetup/services";
import { Notice, Stepper } from "@/newsetup/ui";
import { CheckboxField, FileField, RadioGroup, SelectField, TextAreaField, TextField, checked, email, phPhone, req, useForm } from "@/newsetup/forms";
import { productCategories } from "@/lib/site";

const contactRules = { name: [req("Full name")], email: [req("Email"), email], phone: [req("Mobile number"), phPhone] };

function ContactFields({ f, org }: { f: ReturnType<typeof useForm>; org?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField {...f.bind("name")} label="Full name" required autoComplete="name" />
      {org && <TextField {...f.bind("organization")} label={org} required autoComplete="organization" />}
      <TextField {...f.bind("email")} label="Work email" type="email" required autoComplete="email" />
      <TextField {...f.bind("phone")} label="Mobile number" type="tel" required autoComplete="tel" />
    </div>
  );
}

function Actions({ step, last, onBack, submitLabel }: { step: number; last: number; onBack: () => void; submitLabel: string }) {
  return (
    <div className="flex flex-wrap gap-2 pt-5 border-t border-[#eef1f4]">
      {step > 0 && (
        <button type="button" className="ns-btn" onClick={onBack}>
          ← Back
        </button>
      )}
      <button type="submit" className="ns-btn ns-btn-primary">
        {step < last ? "Continue" : submitLabel}
      </button>
    </div>
  );
}

/* ================= CSP inquiry ================= */

export function CspInquiryForm() {
  const router = useRouter();
  const [docs, setDocs] = useState<string[]>([]);
  const [docErr, setDocErr] = useState("");
  const f = useForm(
    { requesterType: "physician", name: "", organization: "", email: "", phone: "", prc: "", medicine: "", strength: "", quantity: "", patientInitials: "", justification: "", ack: "" },
    {
      ...contactRules,
      organization: [req("Hospital / institution")],
      prc: [(v, a) => (a.requesterType === "physician" && !v.trim() ? "PRC license number is required for physicians." : "")],
      medicine: [req("Medicine (generic name)")],
      quantity: [req("Estimated quantity")],
      patientInitials: [(v, a) => (a.requesterType === "physician" && !v.trim() ? "Patient initials are required for named-patient requests." : "")],
      justification: [req("Brief clinical justification")],
      ack: [checked("Please acknowledge that CSP approval is decided by FDA Philippines.")],
    },
  );
  return (
    <form
      className="ns-card space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.validate()) return;
        const v = f.values;
        const rec = crm.createInquiry("csp_inquiry", { name: v.name, email: v.email, phone: v.phone, organization: v.organization }, { ...v, documents: docs });
        router.push(`/request-confirmation?ref=${rec.ref}`);
      }}
    >
      <Notice kind="warn" title="Subject to FDA approval">
        Getmeds coordinates Compassionate Special Permit applications. Approval is decided solely by FDA Philippines. Submitting this inquiry does not guarantee supply.
      </Notice>
      <RadioGroup
        legend="Who is requesting?"
        id="f-requesterType"
        name="requesterType"
        value={f.values.requesterType}
        onChange={(x) => f.set("requesterType", x)}
        options={[
          { value: "physician", label: "Physician (named patient)" },
          { value: "institution", label: "Hospital / institution" },
        ]}
      />
      <h2>Requester</h2>
      <ContactFields f={f} org="Hospital / institution" />
      {f.values.requesterType === "physician" && <TextField {...f.bind("prc")} label="PRC license number" required />}
      <h2>Medicine requested</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField {...f.bind("medicine")} label="Medicine (generic name)" required />
        <TextField {...f.bind("strength")} label="Strength / form" />
        <TextField {...f.bind("quantity")} label="Estimated quantity" required />
      </div>
      {f.values.requesterType === "physician" && (
        <TextField {...f.bind("patientInitials")} label="Patient initials" required hint="Initials only — do not enter full patient names in this form." />
      )}
      <TextAreaField {...f.bind("justification")} label="Brief clinical justification" required rows={3} hint="Summary only. Full medical documents are requested securely after review." />
      <FileField id="csp-docs" label="Supporting documents (optional)" files={docs} error={docErr} onFiles={(n, e) => { setDocs(n); setDocErr(e); }} hint="e.g. physician request letter, institution endorsement. JPG, PNG or PDF. Prototype: not uploaded." />
      <CheckboxField {...f.bind("ack")} label="I understand CSP approval is decided by FDA Philippines and that Getmeds cannot guarantee approval or supply." />
      <button type="submit" className="ns-btn ns-btn-primary">
        Submit CSP inquiry
      </button>
    </form>
  );
}

/* ================= Quotation / procurement (distributors & institutions) ================= */

type ProcOption = { value: string; label: string; description: string };
const INSTITUTION_TYPES: ProcOption[] = [
  { value: "formal_rfq", label: "Formal RFQ", description: "Upload your RFQ and receive a formal quotation." },
  { value: "regular", label: "Regular procurement", description: "Planned replenishment with standard lead time." },
  { value: "urgent", label: "Urgent medicine requirement", description: "Prioritized for review; we call to confirm. Urgency does not guarantee immediate fulfillment." },
  { value: "government_bidding", label: "Government bidding inquiry", description: "PhilGEPS / public bidding — attach bid or tender documents." },
  { value: "purchase_order", label: "Purchase order submission", description: "Submit an approved PO with its supporting documents." },
  { value: "csp", label: "CSP coordination", description: "Unregistered medicine requiring a Compassionate Special Permit." },
];
const DISTRIBUTOR_TYPES: ProcOption[] = [
  { value: "regular", label: "Wholesale quotation", description: "Prices and availability for your product list — no registration needed." },
  { value: "urgent", label: "Urgent requirement", description: "Prioritized for review; we call to confirm." },
];
export const PROCUREMENT_TYPES = INSTITUTION_TYPES;

const DOC_LABEL: Record<string, string> = {
  purchase_order: "Signed purchase order & supporting documents *",
  government_bidding: "Bid / tender documents *",
};

/**
 * Upload-only, 2 steps: Requirements → Organization & submit.
 * On the audience pages (`audience` prop) the request type comes from the option cards on the left
 * (?procurement=…) and the dropdown here — both stay in sync through the URL.
 * Know the exact product? The product range (product page → inquiry) is the place for that.
 */
export function QuotationForm({ audience }: { audience?: "institution" | "distributor" } = {}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<string[]>([]);
  const [docErr, setDocErr] = useState("");
  const urlType = params.get("type") === "distributor" ? "distributor" : "institution";
  const typeOptions = (t: string) => (t === "distributor" ? DISTRIBUTOR_TYPES : INSTITUTION_TYPES);
  const procParam = params.get("procurement") ?? "";
  const f = useForm(
    {
      customerType: audience ?? urlType, procurement: "",
      neededBy: "", deliveryCity: "", bidRef: "", bidDeadline: "", poNumber: "", notes: "",
      name: "", organization: "", email: "", phone: "", accountId: "",
    },
    {
      neededBy: [req("Required delivery date")],
      deliveryCity: [req("Delivery location")],
      bidRef: [(v, a) => ((a.procurement || procurement) === "government_bidding" && !v.trim() ? "Enter the bid / PhilGEPS reference number." : "")],
      poNumber: [(v, a) => ((a.procurement || procurement) === "purchase_order" && !v.trim() ? "Enter your purchase order number." : "")],
      ...contactRules,
      organization: [req("Organization name")],
    },
  );
  const v = f.values;
  const options = typeOptions(v.customerType);
  // The request type follows the URL (option cards) unless the customer picked one in the dropdown.
  const procurement = options.some((p) => p.value === v.procurement)
    ? v.procurement
    : options.some((p) => p.value === procParam)
      ? procParam
      : options[0].value;
  const isPO = procurement === "purchase_order";
  const steps = ["Requirements", "Organization & submit"];
  const fields = [["neededBy", "deliveryCity", "bidRef", "poNumber"], ["name", "organization", "email", "phone"]];

  // A card on the left was clicked (URL changed) → follow it.
  const [seenParam, setSeenParam] = useState(procParam);
  if (procParam !== seenParam) {
    setSeenParam(procParam);
    if (options.some((p) => p.value === procParam)) f.set("procurement", procParam);
  }

  function pickType(x: string) {
    f.set("procurement", x);
    if (audience) {
      const q = new URLSearchParams(params.toString());
      q.set("procurement", x);
      setSeenParam(x);
      router.replace(`${pathname}?${q.toString()}#request-form`, { scroll: false });
    }
  }

  return (
    <form
      className="ns-card space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const docsOk = step !== 0 || docs.length > 0;
        if (!docsOk) setDocErr(docErr || (isPO ? "Attach your signed purchase order." : "Upload your RFQ, product list, or procurement document."));
        if (!f.validate(fields[step]) || !docsOk) return;
        if (step < 1) return setStep(step + 1);
        const contact = { name: v.name, email: v.email, phone: v.phone, organization: v.organization };
        const data = { ...v, procurement, inputMode: "upload", products: [], documents: docs };
        const rec = isPO ? sales.createPurchaseOrder(contact, data) : sales.createQuotationRequest(contact, data);
        router.push(`/request-confirmation?ref=${rec.ref}`);
      }}
    >
      <Stepper steps={steps} current={step} />
      {step === 0 && (
        <>
          {!audience && (
            <RadioGroup
              legend="I am requesting as"
              id="f-customerType"
              name="customerType"
              value={v.customerType}
              onChange={(x) => {
                f.set("customerType", x);
                f.set("procurement", "");
              }}
              options={[
                { value: "institution", label: "Hospital / institution" },
                { value: "distributor", label: "Pharmacy / distributor" },
              ]}
            />
          )}
          <SelectField
            id="f-procurement"
            name="procurement"
            value={procurement}
            onChange={pickType}
            label="Request type"
            options={options.map((p) => ({ value: p.value, label: p.label }))}
            hint={options.find((p) => p.value === procurement)?.description}
          />
          {procurement === "csp" && (
            <Notice kind="warn" title="CSP requests">
              Medicines requiring a Compassionate Special Permit are subject to FDA approval. You may also use the dedicated <Link href="/csp-inquiry">CSP inquiry form</Link>.
            </Notice>
          )}
          {procurement === "urgent" && <Notice kind="warn" title="Urgent request">For life-threatening urgency, also call us directly after submitting.</Notice>}
          <FileField
            id="rfq-docs"
            label={DOC_LABEL[procurement] ?? (v.customerType === "distributor" ? "Product list / RFQ *" : "RFQ / product list / procurement document *")}
            files={docs}
            error={docErr}
            onFiles={(n, e) => {
              setDocs(n);
              setDocErr(e);
            }}
            hint="Prototype: files are not uploaded or read."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {isPO && <TextField {...f.bind("poNumber")} label="Purchase order (PO) number" required />}
            {procurement === "government_bidding" && (
              <>
                <TextField {...f.bind("bidRef")} label="Bid / PhilGEPS reference no." required />
                <TextField {...f.bind("bidDeadline")} label="Bid deadline (optional)" type="date" />
              </>
            )}
            <TextField {...f.bind("neededBy")} label="Required delivery date" type="date" required />
            <TextField {...f.bind("deliveryCity")} label="Delivery location (city / province)" required />
          </div>
          <TextAreaField {...f.bind("notes")} label="Notes (optional)" rows={2} />
          <Notice>
            Asking about one specific medicine? <Link href="/product-range">Find it in our product range</Link> and send an inquiry from its product page.
          </Notice>
        </>
      )}
      {step === 1 && (
        <>
          <h2>Organization &amp; contact</h2>
          <ContactFields f={f} org={v.customerType === "institution" ? "Hospital / institution name" : "Business name"} />
          {v.customerType === "distributor" && (
            <>
              <TextField {...f.bind("accountId")} label="Partner account ID (if existing partner)" hint="Leave blank if you are not yet registered — no registration needed for a quotation." />
              <p className="text-sm">
                Existing partner? <Link href="/partner-portal">Order on your partner account</Link>.
              </p>
            </>
          )}
          {isPO ? (
            <Notice title="Purchase order submission">Your PO and documents are validated before the order is confirmed. Requested credit terms are not automatically approved.</Notice>
          ) : (
            <Notice title="This is a quotation request, not an order">We will review availability and send a formal quotation. You then submit a purchase order to confirm.</Notice>
          )}
        </>
      )}
      <Actions step={step} last={1} onBack={() => setStep(step - 1)} submitLabel={isPO ? "Submit purchase order" : "Request quotation"} />
    </form>
  );
}


/* ================= Doctors: Professional inquiry ================= */

const PRO_TYPES = [
  { value: "availability", label: "Medicine availability", description: "Quick check whether a medicine is available. No credentials needed." },
  { value: "product_information", label: "Product information", description: "Product details for your patients. No credentials needed." },
  { value: "professional_documentation", label: "Documentation", description: "Package insert, certificate of analysis, registration documents." },
  { value: "medicine_supply", label: "Medicine supply", description: "Supply for your clinic or a patient's treatment." },
  { value: "patient_access", label: "Patient access coordination", description: "Help a patient obtain a medicine, incl. Patient Assistance Program." },
];
/** Preliminary inquiries that never require credential verification. */
const NO_CREDENTIALS = new Set(["availability", "product_information"]);
const LEGACY_TYPES: Record<string, string> = { order_coordination: "medicine_supply" };

/**
 * Always 2 steps: Your request → Your details & submit.
 * Credentials (PRC, specialty, affiliation) are asked in step 2 only for documentation, supply and
 * patient access; availability / product information never need them. On the doctors page the
 * request type comes from the option cards on the left (?type=…) and the dropdown here.
 */
export function ProfessionalInquiryForm({ inline }: { inline?: boolean } = {}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<string[]>([]);
  const [docErr, setDocErr] = useState("");
  const rawType = params.get("type") ?? "";
  const typeParam = LEGACY_TYPES[rawType] ?? rawType;
  const urlType = PRO_TYPES.some((t) => t.value === typeParam) ? typeParam : "availability";
  const f = useForm(
    { type: urlType, medicine: "", message: "", prc: "", specialty: "", institution: "", name: "", organization: "", email: "", phone: "", consent: "" },
    {
      medicine: [req("Medicine name")],
      message: [req("Details of your request")],
      prc: [
        (v, a) => (!NO_CREDENTIALS.has(a.type) && !v.trim() ? "PRC license number is required for this request." : ""),
        (v) => (!v.trim() || /^\d{5,8}$/.test(v.trim()) ? "" : "PRC license number should be 5–8 digits."),
      ],
      specialty: [(v, a) => (!NO_CREDENTIALS.has(a.type) && !v.trim() ? "Specialty is required." : "")],
      institution: [(v, a) => (!NO_CREDENTIALS.has(a.type) && !v.trim() ? "Hospital / clinic is required." : "")],
      ...contactRules,
      consent: [checked("Please give your consent to submit.")],
    },
  );
  // A card on the left was clicked (URL changed) → follow it.
  const [seenType, setSeenType] = useState(urlType);
  if (urlType !== seenType) {
    setSeenType(urlType);
    f.set("type", urlType);
  }
  function pickType(x: string) {
    f.set("type", x);
    if (inline) {
      const q = new URLSearchParams(params.toString());
      q.set("type", x);
      setSeenType(x);
      router.replace(`${pathname}?${q.toString()}#request-form`, { scroll: false });
    }
  }

  const needsCredentials = !NO_CREDENTIALS.has(f.values.type);
  const fields = [
    ["medicine", "message"],
    ["name", "email", "phone", "prc", "consent", ...(needsCredentials ? ["specialty", "institution"] : [])],
  ];

  return (
    <form
      className="ns-card space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.validate(fields[step])) return;
        if (step < 1) return setStep(1);
        const v = f.values;
        const rec = crm.createInquiry("professional_inquiry", { name: v.name, email: v.email, phone: v.phone, organization: v.institution || undefined }, {
          requestType: v.type, credentialsRequired: needsCredentials, medicine: v.medicine, message: v.message, prc: v.prc, specialty: v.specialty, documents: docs,
        });
        router.push(`/request-confirmation?ref=${rec.ref}`);
      }}
    >
      <Stepper steps={["Your request", "Your details & submit"]} current={step} />
      {step === 0 && (
        <>
          <SelectField
            id="f-type"
            name="type"
            value={f.values.type}
            onChange={pickType}
            label="What do you need?"
            options={PRO_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            hint={PRO_TYPES.find((t) => t.value === f.values.type)?.description}
          />
          <TextField {...f.bind("medicine")} label="Medicine(s)" required placeholder="Brand or generic name, e.g. Pazopanib 400 mg" />
          <TextAreaField {...f.bind("message")} label="Details of your request" required rows={4} placeholder="e.g. Is this available for 3 patients starting next month?" />
          <p className="ns-hint">
            Need an unregistered medicine for a named patient? Use the <Link href="/csp-inquiry">CSP inquiry</Link> instead.
          </p>
        </>
      )}
      {step === 1 && (
        <>
          <h2>Contact details</h2>
          <ContactFields f={f} />
          {needsCredentials ? (
            <>
              <h3>Credential verification</h3>
              <p className="ns-hint">Documentation, supply and patient access coordination are provided to verified healthcare professionals.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField {...f.bind("prc")} label="PRC license number" required inputMode="numeric" />
                <TextField {...f.bind("specialty")} label="Specialty" required placeholder="e.g. Medical Oncology" />
                <TextField {...f.bind("institution")} label="Hospital / clinic affiliation" required className="sm:col-span-2" />
              </div>
              <FileField id="pro-docs" label="PRC ID (optional — speeds up verification)" files={docs} error={docErr} onFiles={(n, e) => { setDocs(n); setDocErr(e); }} />
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField {...f.bind("institution")} label="Hospital / clinic (optional)" />
              <TextField {...f.bind("prc")} label="PRC license number (optional)" inputMode="numeric" />
            </div>
          )}
          <CheckboxField
            {...f.bind("consent")}
            label={
              needsCredentials
                ? "I consent to Getmeds verifying my professional credentials and processing my data per the Privacy Policy."
                : "I consent to Getmeds processing my data per the Privacy Policy to answer this inquiry."
            }
          />
          <Notice title="This is an inquiry, not an order">
            {needsCredentials ? "Our medical/sales team will verify your credentials and respond." : "Our team will respond — no credential verification needed for this question."} No order or
            reservation is created.
          </Notice>
        </>
      )}
      <Actions step={step} last={1} onBack={() => setStep(step - 1)} submitLabel="Submit professional inquiry" />
    </form>
  );
}


/* ================= Distributors: Partner registration ================= */

export function PartnerRegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<string[]>([]);
  const [docErr, setDocErr] = useState("");
  const f = useForm(
    { businessType: "", businessName: "", tin: "", address: "", city: "", region: "", lto: "", ltoExpiry: "", categories: "", name: "", organization: "", email: "", phone: "", position: "", terms: "", consent: "" },
    {
      businessType: [req("Business type")],
      businessName: [req("Registered business name")],
      tin: [req("TIN"), (v) => (/^\d{3}-?\d{3}-?\d{3}(-?\d{3,5})?$/.test(v.trim()) ? "" : "Enter TIN as 000-000-000 or 000-000-000-000.")],
      address: [req("Business address")],
      city: [req("City")],
      region: [req("Region")],
      lto: [req("FDA License to Operate number")],
      ltoExpiry: [req("LTO validity date")],
      ...contactRules,
      position: [req("Position")],
      consent: [checked("Please consent to business verification.")],
    },
  );
  const steps = ["Business", "FDA license & documents", "Authorized contact"];
  const fields = [["businessType", "businessName", "tin", "address", "city", "region"], ["lto", "ltoExpiry"], ["name", "email", "phone", "position", "consent"]];

  return (
    <form
      className="ns-card space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const docsOk = step !== 1 || docs.length > 0;
        if (!docsOk) setDocErr(docErr || "Upload a copy of your FDA License to Operate.");
        if (!f.validate(fields[step]) || !docsOk) return;
        if (step < 2) return setStep(step + 1);
        const v = f.values;
        const rec = crm.createInquiry("partner_registration", { name: v.name, email: v.email, phone: v.phone, organization: v.businessName }, { ...v, documents: docs });
        router.push(`/request-confirmation?ref=${rec.ref}`);
      }}
    >
      <Stepper steps={steps} current={step} />
      {step === 0 && (
        <>
          <SelectField
            {...f.bind("businessType")}
            label="Business type"
            required
            options={[
              { value: "drugstore", label: "Drugstore / retail pharmacy" },
              { value: "distributor", label: "Distributor / wholesaler" },
              { value: "hospital_pharmacy", label: "Hospital pharmacy" },
              { value: "clinic", label: "Clinic / dispensing practice" },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField {...f.bind("businessName")} label="Registered business name" required />
            <TextField {...f.bind("tin")} label="BIR TIN" required placeholder="000-000-000-000" />
          </div>
          <TextField {...f.bind("address")} label="Business address" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField {...f.bind("city")} label="City / municipality" required />
            <SelectField
              {...f.bind("region")}
              label="Region"
              required
              options={[
                { value: "metro_manila", label: "Metro Manila" },
                { value: "luzon", label: "Luzon" },
                { value: "visayas", label: "Visayas" },
                { value: "mindanao", label: "Mindanao" },
              ]}
            />
          </div>
          <SelectField {...f.bind("categories")} label="Main category of interest (optional)" options={productCategories.map((c) => ({ value: c, label: c }))} />
        </>
      )}
      {step === 1 && (
        <>
          <h2>FDA license & business documents</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField {...f.bind("lto")} label="FDA License to Operate (LTO) number" required />
            <TextField {...f.bind("ltoExpiry")} label="LTO valid until" type="date" required />
          </div>
          <FileField
            id="reg-docs"
            label="Upload documents *"
            files={docs}
            error={docErr}
            onFiles={(n, e) => { setDocs(n); setDocErr(e); }}
            hint="Required: FDA LTO. Recommended: Business permit, BIR Certificate of Registration (2303), SEC/DTI registration. Prototype: files are not uploaded."
          />
        </>
      )}
      {step === 2 && (
        <>
          <h2>Authorized contact</h2>
          <ContactFields f={f} />
          <TextField {...f.bind("position")} label="Position" required placeholder="e.g. Purchasing Manager, Pharmacist-in-charge" />
          <CheckboxField {...f.bind("consent")} label="I am authorized to register this business and consent to Getmeds verifying the submitted documents." />
          <Notice title="Pricing after verification">Applicable partner pricing and ordering become available once your business is verified. Credit terms are subject to separate approval.</Notice>
        </>
      )}
      <Actions step={step} last={2} onBack={() => setStep(step - 1)} submitLabel="Submit registration" />
    </form>
  );
}

