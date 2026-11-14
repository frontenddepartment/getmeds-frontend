"use client";

/** Shared building blocks for the 3-step, document-first request forms. */

export type MedRow = { name: string; strength: string; form: string; qty: string };
export const emptyMed = (): MedRow => ({ name: "", strength: "", form: "", qty: "1" });
export const filledMeds = (rows: MedRow[]) => rows.filter((r) => r.name.trim());

/** Manual medicine entry: name, strength (if known), dosage form (if known), quantity; add another. */
export function MedicineRows({ rows, onChange, error }: { rows: MedRow[]; onChange: (r: MedRow[]) => void; error?: string }) {
  const set = (i: number, patch: Partial<MedRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <fieldset className="space-y-2" aria-describedby={error ? "meds-err" : undefined}>
      <legend className="font-semibold text-sm">Medicines you need</legend>
      {rows.map((r, i) => (
        <div key={i} className="rounded-xl border border-[#e6ebef] p-3 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_6rem_auto] items-end">
          <div className="ns-field">
            <label htmlFor={i === 0 ? "f-meds" : `med-name-${i}`}>Medicine name {i + 1}</label>
            <input id={i === 0 ? "f-meds" : `med-name-${i}`} className="ns-input" value={r.name} placeholder="Brand or generic name" onChange={(e) => set(i, { name: e.target.value })} />
          </div>
          <div className="ns-field">
            <label htmlFor={`med-str-${i}`}>Strength (if known)</label>
            <input id={`med-str-${i}`} className="ns-input" value={r.strength} placeholder="e.g. 500 mg" onChange={(e) => set(i, { strength: e.target.value })} />
          </div>
          <div className="ns-field">
            <label htmlFor={`med-form-${i}`}>Dosage form (if known)</label>
            <input id={`med-form-${i}`} className="ns-input" value={r.form} placeholder="e.g. tablet" onChange={(e) => set(i, { form: e.target.value })} />
          </div>
          <div className="ns-field">
            <label htmlFor={`med-qty-${i}`}>Quantity</label>
            <input id={`med-qty-${i}`} className="ns-input" type="number" min={1} value={r.qty} onChange={(e) => set(i, { qty: e.target.value })} />
          </div>
          <button type="button" className="ns-btn ns-btn-sm" disabled={rows.length === 1} onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={`Remove medicine ${i + 1}`}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="ns-btn ns-btn-sm" onClick={() => onChange([...rows, emptyMed()])}>
        + Add another medicine
      </button>
      {error && (
        <p id="meds-err" className="ns-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Review block with an Edit button that returns to the step (data is preserved). */
export function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#f7f9fb] p-4 text-sm">
      <div className="flex justify-between gap-2 mb-1">
        <h3>{title}</h3>
        <button type="button" className="underline" onClick={onEdit} aria-label={`Edit ${title.toLowerCase()}`}>
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

export function NoExtractionNote() {
  return (
    <p className="ns-hint">
      Prototype: files stay on your device and are not read automatically. In production, details may be extracted for you to confirm — extracted information is never treated as
      verified until our team reviews it.
    </p>
  );
}
