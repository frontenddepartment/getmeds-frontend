"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { crm } from "@/newsetup/services";
import { Notice, Stepper } from "@/newsetup/ui";
import { CheckboxField, FileField, RadioGroup, TextAreaField, TextField, checked, email, phPhone, req, useForm } from "@/newsetup/forms";
import { clearDraft, loadDraft, saveDraft } from "@/newsetup/lib/draft";
import { NoExtractionNote, ReviewBlock } from "./shared";

/**
 * PCSO / DSWD upload-first assistance request — docs/plan/getmeds-home.md
 * "Upload what you already have. We will help identify what is missing."
 * A Getmeds assistance request is NOT an official PCSO or DSWD application.
 */
export const PROGRAMS = { pcso: "PCSO Medical Assistance", dswd: "DSWD Medical Assistance (AICS)" } as const;
export type ProgramKey = keyof typeof PROGRAMS;

const PURPOSES = [
  { value: "quotation", label: "I need a medicine quotation", description: "For your assistance application." },
  { value: "check_documents", label: "I need help checking my documents", description: "We'll tell you what may be missing for the quotation." },
  { value: "have_gl", label: "I already have a Guarantee Letter", description: "Coordination of an existing Guarantee Letter, where applicable." },
];

const DRAFT = "assistance-request";
type Draft = { step: number; files: string[]; values: Record<string, string> };

export function AssistanceRequestForm() {
  const params = useSearchParams();
  const router = useRouter();
  const urlProgram = params.get("program");
  const [draft] = useState(() => loadDraft<Draft>(DRAFT));
  const [step, setStep] = useState(draft?.step ?? 0);
  const [files, setFiles] = useState<string[]>(draft?.files ?? []);
  const [fileErr, setFileErr] = useState("");

  const f = useForm(
    {
      program: "", purpose: "quotation", description: "",
      forWhom: "self", name: "", phone: "", email: "", patientName: "", location: "",
      notOfficial: "", privacy: "",
      ...draft?.values,
      ...(urlProgram === "pcso" || urlProgram === "dswd" ? { program: urlProgram } : {}),
    },
    {
      program: [req("Assistance program")],
      name: [req("Contact person's full name")],
      phone: [req("Mobile number"), phPhone],
      email: [email],
      notOfficial: [checked("Please confirm you understand this is not an official PCSO or DSWD application.")],
      privacy: [checked("Please acknowledge the Privacy Policy to submit.")],
    },
  );
  const v = f.values;

  useEffect(() => {
    saveDraft(DRAFT, { step, files, values: v } satisfies Draft);
  }, [step, files, v]);

  function next() {
    if (step === 0) {
      const programOk = f.validate(["program"]);
      // Preliminary requests are accepted with minimum information: a document OR a description.
      const contentOk = files.length > 0 || v.description.trim().length > 0;
      setFileErr(contentOk ? "" : fileErr || "Upload at least one document, or describe the medicines you need.");
      if (!programOk || !contentOk) return;
    }
    if (step === 1 && !f.validate(["name", "phone", "email"])) return;
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  }

  function submit() {
    if (!f.validate(["notOfficial", "privacy"])) return;
    const rec = crm.createInquiry(
      "assistance_request",
      { name: v.name, email: v.email, phone: v.phone },
      { program: v.program, purpose: v.purpose, documents: files, description: v.description, forWhom: v.forWhom, patientName: v.patientName, location: v.location },
    );
    clearDraft(DRAFT);
    router.push(`/request-confirmation?ref=${rec.ref}`);
  }

  const programLabel = PROGRAMS[v.program as ProgramKey];

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
      <Stepper steps={["Purpose & upload", "Contact details", "Review & submit"]} current={step} />

      {step === 0 && (
        <>
          <h2>Step 1 — Purpose & upload</h2>
          <RadioGroup
            legend="Which program is this for?"
            id="f-program"
            name="program"
            value={v.program}
            error={f.errors.program}
            onChange={(x) => f.set("program", x)}
            options={[
              { value: "pcso", label: PROGRAMS.pcso },
              { value: "dswd", label: PROGRAMS.dswd },
            ]}
          />
          <RadioGroup legend="What do you need help with?" id="f-purpose" name="purpose" value={v.purpose} onChange={(x) => f.set("purpose", x)} options={PURPOSES} />
          <FileField
            id="pap-files"
            label="Upload what you already have"
            files={files}
            error={fileErr}
            onFiles={(n, e) => {
              setFiles(n);
              setFileErr(e);
            }}
            hint="For example: prescription, medicine list, medical abstract, existing quotation, or an existing Guarantee Letter. You don't need every document now."
          />
          <NoExtractionNote />
          <TextAreaField {...f.bind("description")} label="Or describe the medicines you need (optional if you uploaded a document)" rows={3} />
        </>
      )}

      {step === 1 && (
        <>
          <h2>Step 2 — Contact details</h2>
          <RadioGroup
            legend="Is this request for you or someone else?"
            id="f-forWhom"
            name="forWhom"
            value={v.forWhom}
            onChange={(x) => f.set("forWhom", x)}
            options={[
              { value: "self", label: "For myself" },
              { value: "other", label: "For someone else" },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField {...f.bind("name")} label="Contact person's full name" required autoComplete="name" />
            <TextField {...f.bind("phone")} label="Mobile number" type="tel" required autoComplete="tel" placeholder="0917 123 4567" />
            <TextField {...f.bind("email")} label="Email (optional)" type="email" autoComplete="email" />
            <TextField {...f.bind("location")} label="City / province (optional)" hint="Helps us route your request." />
          </div>
          {v.forWhom === "other" && <TextField {...f.bind("patientName")} label="Patient's name (optional for now)" hint="We'll ask for patient details only if the quotation requires them." />}
        </>
      )}

      {step === 2 && (
        <>
          <h2>Step 3 — Review & submit</h2>
          <ReviewBlock title="Program & purpose" onEdit={() => setStep(0)}>
            <p>{programLabel}</p>
            <p>{PURPOSES.find((p) => p.value === v.purpose)?.label}</p>
            <p>Documents: {files.length ? files.join(", ") : "none uploaded"}</p>
            {v.description && <p>Description: {v.description}</p>}
          </ReviewBlock>
          <ReviewBlock title="Contact information" onEdit={() => setStep(1)}>
            <p>
              {v.name} · {v.phone}
              {v.email && ` · ${v.email}`}
            </p>
            {v.forWhom === "other" && <p>For: {v.patientName || "someone else (name to follow)"}</p>}
            {v.location && <p>Location: {v.location}</p>}
          </ReviewBlock>
          <Notice kind="warn" title="Important">
            This is a request to Getmeds for help with quotations and documents. It is not an official {v.program === "dswd" ? "DSWD" : "PCSO"} application. Getmeds cannot
            approve government assistance or guarantee eligibility.
          </Notice>
          <CheckboxField {...f.bind("notOfficial")} label="I understand this is not an official PCSO or DSWD application." />
          <CheckboxField
            {...f.bind("privacy")}
            label={
              <>
                I have read the <Link href="/privacy-policy" target="_blank">Privacy Policy</Link> and consent to Getmeds processing my documents to handle this request.
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
          {step < 2 ? "Continue" : "Submit Assistance Request"}
        </button>
      </div>
    </form>
  );
}
