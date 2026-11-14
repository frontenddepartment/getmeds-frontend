"use client";

import { useState } from "react";
import { CircleAlert, FileText, UploadCloud } from "lucide-react";

/* ---------- lightweight form state + validation ---------- */

export type Rule = (value: string, all: Record<string, string>) => string;
export type Rules = Record<string, Rule[]>;

export function useForm(initial: Record<string, string>, rules: Rules) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, v: Record<string, string>) => {
    for (const rule of rules[name] ?? []) {
      const msg = rule(v[name] ?? "", v);
      if (msg) return msg;
    }
    return "";
  };

  return {
    values,
    errors,
    set: (name: string, value: string) => {
      setValues((cur) => ({ ...cur, [name]: value }));
      if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    },
    /** Validate the given fields (default: all with rules). Focuses the first invalid field. */
    validate: (fields: string[] = Object.keys(rules)) => {
      const next: Record<string, string> = {};
      for (const f of fields) {
        const msg = validateField(f, values);
        if (msg) next[f] = msg;
      }
      setErrors((e) => ({ ...e, ...Object.fromEntries(fields.map((f) => [f, next[f] ?? ""])) }));
      const first = fields.find((f) => next[f]);
      if (first) document.getElementById(`f-${first}`)?.focus();
      return !first;
    },
    bind: (name: string) => ({
      id: `f-${name}`,
      name,
      value: values[name] ?? "",
      error: errors[name],
      onChange: (v: string) => {
        setValues((cur) => ({ ...cur, [name]: v }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
      },
    }),
  };
}

export const req = (label: string): Rule => (v) => (v.trim() ? "" : `${label} is required.`);
export const email: Rule = (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address (e.g. name@example.com).");
export const phPhone: Rule = (v) =>
  !v.trim() || /^(\+?63|0)9\d{9}$/.test(v.replace(/[\s-]/g, "")) ? "" : "Enter a valid PH mobile number (e.g. 0917 123 4567).";
export const minLen = (n: number, label: string): Rule => (v) => (!v.trim() || v.trim().length >= n ? "" : `${label} must be at least ${n} characters.`);
export const checked = (msg: string): Rule => (v) => (v === "true" ? "" : msg);

/* ---------- fields ---------- */

type Bound = { id: string; name: string; value: string; error?: string; onChange: (v: string) => void };
type Common = Bound & { label: string; hint?: string; required?: boolean; className?: string };

function Wrap({ id, label, hint, error, required, className = "", children }: Omit<Common, "name" | "value" | "onChange"> & { children: React.ReactNode }) {
  return (
    <div className={`ns-field ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="ns-req">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="ns-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="ns-error" role="alert">
          <CircleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, hint?: string, error?: string) => [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;

export function TextField(props: Common & { type?: string; placeholder?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  const { id, name, value, onChange, error, hint, required, type = "text", placeholder, autoComplete, inputMode } = props;
  return (
    <Wrap {...props}>
      <input
        id={id}
        name={name}
        type={type}
        className="ns-input"
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-required={required}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrap>
  );
}

export function TextAreaField(props: Common & { rows?: number; placeholder?: string }) {
  const { id, name, value, onChange, error, hint, required, rows = 4, placeholder } = props;
  return (
    <Wrap {...props}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        className="ns-input"
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-required={required}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrap>
  );
}

export function SelectField(props: Common & { options: { value: string; label: string }[]; placeholder?: string }) {
  const { id, name, value, onChange, error, hint, required, options, placeholder = "Select…" } = props;
  return (
    <Wrap {...props}>
      <select
        id={id}
        name={name}
        className="ns-input"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-required={required}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  );
}

export function RadioGroup({
  legend,
  name,
  value,
  onChange,
  options,
  error,
  id,
}: {
  legend: string;
  name: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  error?: string;
}) {
  return (
    <fieldset className="space-y-2" aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="mb-1.5 text-[0.82rem] font-semibold text-[#26343f]">{legend}</legend>
      {options.map((o, i) => (
        <label key={o.value} className="ns-choice" data-checked={value === o.value} data-disabled={o.disabled || undefined}>
          <input
            type="radio"
            id={i === 0 ? id : undefined}
            name={name}
            value={o.value}
            checked={value === o.value}
            disabled={o.disabled}
            onChange={() => onChange(o.value)}
          />
          <span>
            <span className="font-semibold text-[#0f2433]">{o.label}</span>
            {o.description && <span className="block text-sm ns-muted">{o.description}</span>}
          </span>
        </label>
      ))}
      {error && (
        <p id={`${id}-err`} className="ns-error" role="alert">
          <CircleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function CheckboxField({ id, label, value, onChange, error }: Bound & { label: React.ReactNode }) {
  return (
    <div>
      <label className="ns-check">
        <input id={id} type="checkbox" checked={value === "true"} onChange={(e) => onChange(e.target.checked ? "true" : "")} aria-invalid={error ? true : undefined} />
        <span>{label}</span>
      </label>
      {error && (
        <p className="ns-error mt-1.5" role="alert">
          <CircleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const ACCEPT = ["image/jpeg", "image/png", "application/pdf"];
const MAX_MB = 10;

/** Mock file picker: validates type/size and keeps file NAMES only (nothing is uploaded). */
export function FileField({
  id,
  label,
  files,
  onFiles,
  error,
  hint = "Prototype: files stay on your device and are not uploaded.",
  multiple = true,
}: {
  id: string;
  label: string;
  files: string[];
  onFiles: (names: string[], err: string) => void;
  error?: string;
  hint?: string;
  multiple?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <div className="ns-field">
      <label htmlFor={id}>{label}</label>
      <div className="ns-drop" data-drag={drag || undefined} data-invalid={error ? true : undefined}>
        <span aria-hidden className="ns-drop-icon">
          <UploadCloud className="h-5 w-5" />
        </span>
        <p className="text-sm text-[#26343f]">
          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-[#667085]">JPG, PNG or PDF · up to {MAX_MB} MB{multiple ? " each" : ""}</p>
        <input
          id={id}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple={multiple}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined}
          onDragEnter={() => setDrag(true)}
          onDragLeave={() => setDrag(false)}
          onDrop={() => setDrag(false)}
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            const bad = list.find((f) => !ACCEPT.includes(f.type));
            const big = list.find((f) => f.size > MAX_MB * 1024 * 1024);
            if (bad) return onFiles([], `“${bad.name}” is not a supported file type. Upload a JPG, PNG or PDF.`);
            if (big) return onFiles([], `“${big.name}” is larger than ${MAX_MB} MB.`);
            onFiles(list.map((f) => f.name), "");
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Selected files">
          {files.map((f) => (
            <li key={f} className="ns-file">
              <FileText aria-hidden className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">{f}</span>
              <span className="text-xs font-semibold text-[#2f7d32]">Ready</span>
            </li>
          ))}
        </ul>
      )}
      {hint && (
        <p id={`${id}-hint`} className="ns-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="ns-error" role="alert">
          <CircleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
