"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { crm } from "@/newsetup/services";
import { Notice, Stepper } from "@/newsetup/ui";
import { CheckboxField, FileField, RadioGroup, SelectField, TextAreaField, TextField, checked, email, phPhone, req, useForm } from "@/newsetup/forms";
import { clearDraft, loadDraft, saveDraft } from "@/newsetup/lib/draft";
import { NoExtractionNote, ReviewBlock } from "./shared";

/**
 * Patients & Families medicine request — docs/plan/getmeds-home.md "Dedicated Form — Patients & Families".
 * 3 steps: Upload prescription / medicine list → Patient & contact → Review & submit.
 * Upload only: patients who know the medicine use the product range (product page → inquiry) instead.
 * Creates a medicine REQUEST, not a paid order, stock reservation, or dispensing authorization.
 */
const DRAFT = "patient-request";
type Draft = { step: number; files: string[]; values: Record<string, string> };

const DEFAULTS: Record<string, string> = {
  docType: "prescription", docNotes: "",
  forWhom: "self", name: "", phone: "", email: "", patientName: "", relationship: "",
  recipient: "", street: "", barangay: "", city: "", province: "", deliveryPhone: "", instructions: "",
  privacy: "",
};

export function PatientRequestForm() {
  const router = useRouter();
  const [draft] = useState(() => loadDraft<Draft>(DRAFT));
  const [step, setStep] = useState(draft?.step ?? 0);
  const [files, setFiles] = useState<string[]>(draft?.files ?? []);
  const [fileErr, setFileErr] = useState("");

  const f = useForm(
    { ...DEFAULTS, ...draft?.values },
    {
      name: [req("Contact name")],
      phone: [req("Mobile number"), phPhone],
      email: [email],
      patientName: [(v, a) => (a.forWhom === "other" && !v.trim() ? "Patient name is required when ordering for someone else." : "")],
      relationship: [(v, a) => (a.forWhom === "other" && !v.trim() ? "Tell us your relationship to the patient." : "")],
      street: [req("House / unit no. and street")],
      barangay: [req("Barangay")],
      city: [req("City / municipality")],
      province: [req("Province")],
      deliveryPhone: [req("Delivery contact number"), phPhone],
      privacy: [checked("Please acknowledge the Privacy Policy to submit.")],
    },
  );
  const v = f.values;
  const recipient = v.recipient.trim() || (v.forWhom === "other" ? v.patientName : v.name);

  // Persist progress so going Back, editing, or reloading never loses entered data.
  useEffect(() => {
    saveDraft(DRAFT, { step, files, values: v } satisfies Draft);
  }, [step, files, v]);

  const stepFields = [[], ["name", "phone", "email", "patientName", "relationship", "street", "barangay", "city", "province", "deliveryPhone"], ["privacy"]];

  function validateStep1() {
    const ok = files.length > 0;
    setFileErr(ok ? "" : fileErr || "Upload at least one document — your prescription or medicine list.");
    if (!ok) document.getElementById("req-files")?.focus();
    return ok;
  }

  function next() {
    const ok = step === 0 ? validateStep1() : f.validate(stepFields[step]);
    if (!ok) return;
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  }

  function submit() {
    if (!f.validate(stepFields[2])) return;
    const rec = crm.createInquiry(
      "medicine_request",
      { name: v.name, email: v.email, phone: v.phone },
      {
        mode: "upload",
        documents: files,
        documentType: v.docType,
        notes: v.docNotes,
        forWhom: v.forWhom,
        patientName: v.forWhom === "other" ? v.patientName : v.name,
        relationship: v.relationship,
        delivery: { recipient, street: v.street, barangay: v.barangay, city: v.city, province: v.province, phone: v.deliveryPhone, instructions: v.instructions },
      },
    );
    clearDraft(DRAFT);
    router.push(`/request-confirmation?ref=${rec.ref}`);
  }

  return (
    <form
      className="ns-card space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 2) next();
        else submit();
      }}
    >
      <Stepper steps={["Upload prescription", "Patient & contact", "Review & submit"]} current={step} />

      {step === 0 && (
        <>
          <h2>Step 1 — Upload your prescription or medicine list</h2>
          <SelectField
            {...f.bind("docType")}
            label="What are you uploading?"
            options={[
              { value: "prescription", label: "Prescription" },
              { value: "medicine_list", label: "Medicine list" },
              { value: "doctor_instructions", label: "Doctor-provided medicine instructions" },
            ]}
          />
          <FileField
            id="req-files"
            label="Your document(s) *"
            files={files}
            error={fileErr}
            onFiles={(n, e) => {
              setFiles(n);
              setFileErr(e);
            }}
            hint=""
          />
          <NoExtractionNote />
          <Notice>
            Know the medicine you need? <Link href="/product-range">Find it in our product range</Link> and send an inquiry from its product page.
          </Notice>
          <TextAreaField {...f.bind("docNotes")} label="Anything else we should know? (optional)" rows={2} />
        </>
      )}

      {step === 1 && (
        <>
          <h2>Step 2 — Patient & contact information</h2>
          <RadioGroup
            legend="Are you ordering for yourself or someone else?"
            id="f-forWhom"
            name="forWhom"
            value={v.forWhom}
            onChange={(x) => f.set("forWhom", x)}
            options={[
              { value: "self", label: "For myself" },
              { value: "other", label: "For someone else (family member / patient I care for)" },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField {...f.bind("name")} label="Your full name" required autoComplete="name" />
            <TextField {...f.bind("phone")} label="Mobile number" type="tel" required autoComplete="tel" inputMode="tel" placeholder="0917 123 4567" />
            <TextField {...f.bind("email")} label="Email (optional)" type="email" autoComplete="email" />
          </div>
          {v.forWhom === "other" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField {...f.bind("patientName")} label="Patient's full name" required />
              <TextField {...f.bind("relationship")} label="Your relationship to the patient" required placeholder="e.g. daughter, caregiver" />
              <p className="ns-hint sm:col-span-2">Authorization from the patient may be required for some medicines.</p>
            </div>
          )}
          <h3>Delivery</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField {...f.bind("recipient")} label="Delivery recipient (optional)" hint="Leave blank to use the patient's name." />
            <TextField {...f.bind("deliveryPhone")} label="Delivery contact number" type="tel" required />
          </div>
          <TextField {...f.bind("street")} label="House / unit no., building, street" required autoComplete="address-line1" />
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField {...f.bind("barangay")} label="Barangay" required />
            <TextField {...f.bind("city")} label="City / municipality" required autoComplete="address-level2" />
            <TextField {...f.bind("province")} label="Province" required autoComplete="address-level1" />
          </div>
          <TextAreaField {...f.bind("instructions")} label="Delivery instructions (optional)" rows={2} placeholder="Landmark, preferred time" />
        </>
      )}

      {step === 2 && (
        <>
          <h2>Step 3 — Review & submit</h2>
          <ReviewBlock title="Uploaded document(s)" onEdit={() => setStep(0)}>
            <p>
              {v.docType.replace("_", " ")}: {files.join(", ")}
            </p>
            {v.docNotes && <p className="mt-1">Notes: {v.docNotes}</p>}
          </ReviewBlock>
          <ReviewBlock title="Contact details" onEdit={() => setStep(1)}>
            <p>
              {v.name} · {v.phone}
              {v.email && ` · ${v.email}`}
            </p>
            <p>{v.forWhom === "other" ? `Ordering for ${v.patientName} (${v.relationship})` : "Ordering for myself"}</p>
          </ReviewBlock>
          <ReviewBlock title="Delivery information" onEdit={() => setStep(1)}>
            <p>
              {recipient} · {v.deliveryPhone}
            </p>
            <p>
              {v.street}, {v.barangay}, {v.city}, {v.province}
            </p>
            {v.instructions && <p>Instructions: {v.instructions}</p>}
          </ReviewBlock>
          <Notice title="Prescription review">
            Prescription-only medicines require a valid prescription and verification by a licensed Getmeds pharmacist. Submitting this request is not a confirmed or paid order,
            does not reserve stock, and does not authorize dispensing. We will confirm availability and next steps with you.
          </Notice>
          <CheckboxField
            {...f.bind("privacy")}
            label={
              <>
                I have read the <Link href="/privacy-policy" target="_blank">Privacy Policy</Link> and consent to Getmeds processing this information to handle my request.
              </>
            }
          />
        </>
      )}

      <div className="flex flex-wrap gap-2 pt-5 border-t border-[#eef1f4]">
        {step > 0 && (
          <button type="button" className="ns-btn" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        )}
        <button type="submit" className="ns-btn ns-btn-primary">
          {step < 2 ? "Continue" : "Submit Medicine Request"}
        </button>
      </div>
    </form>
  );
}
