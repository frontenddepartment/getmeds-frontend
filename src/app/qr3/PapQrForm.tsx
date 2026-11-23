'use client';

import { useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import {
  Check,
  CircleAlert,
  Hospital,
  LoaderCircle,
  Lock,
  MapPin,
  Phone,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { submitInquiry } from '@/lib/offlineInquiry';
import { Turnstile, useTurnstile } from '@/lib/turnstile';
import { medicineLabel, searchMedicines, type MedicineOption } from '@/lib/medicineSearch';

/* The sheet ("PAP QR CONVENSION INQUIRY") and the email both receive this type; the backend
   maps it in INQUIRY_SPREADSHEETS and prefixes the patient's name with "(PAP QR)". */
const INQUIRY_TYPE = 'PAP QR';
const MAX_MEDICINES = 10;

type FieldName = 'firstName' | 'middleName' | 'lastName' | 'phone' | 'address' | 'doctor' | 'hospital';
type Fields = Record<FieldName, string>;
type ErrorKey = FieldName | 'medicines' | 'consent' | 'verify';

interface Chosen {
  key: string;
  label: string;
  option?: MedicineOption;
}

const EMPTY: Fields = { firstName: '', middleName: '', lastName: '', phone: '', address: '', doctor: '', hospital: '' };

/** PH mobile (09…, 639…, +639…) must be complete; anything else needs 7 to 15 digits. */
function phoneError(raw: string): string | null {
  const v = raw.trim();
  if (!v) return 'Enter a contact number.';
  if (!/^[\d+\s\-()]+$/.test(v)) return 'Use numbers only, like 0917 123 4567.';
  const digits = v.replace(/\D/g, '');
  if (/^(09|639)/.test(digits)) {
    const ok = (digits.startsWith('09') && digits.length === 11) || (digits.startsWith('639') && digits.length === 12);
    return ok ? null : 'A mobile number has 11 digits, like 0917 123 4567.';
  }
  return digits.length >= 7 && digits.length <= 15 ? null : 'Enter a valid contact number, like 0917 123 4567.';
}

function validate(f: Fields, medicines: Chosen[], consent: boolean): Partial<Record<ErrorKey, string>> {
  const e: Partial<Record<ErrorKey, string>> = {};
  if (!f.firstName.trim()) e.firstName = "Enter the patient's first name.";
  if (!f.lastName.trim()) e.lastName = "Enter the patient's last name.";
  const pe = phoneError(f.phone);
  if (pe) e.phone = pe;
  if (f.address.trim().length < 10) e.address = 'Enter the complete address: house no., street, barangay, city and province.';
  if (!f.doctor.trim()) e.doctor = "Enter the doctor's name.";
  if (!f.hospital.trim()) e.hospital = 'Enter the hospital or clinic name.';
  if (!medicines.length) e.medicines = 'Search and add at least one medicine.';
  if (!consent) e.consent = 'Please agree so we can process your request.';
  return e;
}

const ORDER: ErrorKey[] = ['firstName', 'middleName', 'lastName', 'phone', 'address', 'doctor', 'hospital', 'medicines', 'consent', 'verify'];

export default function PapQrForm({ medicines: catalogue }: { medicines: MedicineOption[] }) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [chosen, setChosen] = useState<Chosen[]>([]);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<{ code?: string; phone: string; name: string } | null>(null);
  const turnstile = useTurnstile(status !== 'sent');
  const topRef = useRef<HTMLDivElement>(null);

  const set = (name: FieldName) => (value: string) => {
    setFields((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const addMedicine = (item: Chosen) => {
    setChosen((list) => (list.some((c) => c.key === item.key) || list.length >= MAX_MEDICINES ? list : [...list, item]));
    setErrors((e) => ({ ...e, medicines: undefined }));
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (status === 'sending') return;
    setSubmitError('');

    const found = validate(fields, chosen, consent);
    if (turnstile.enabled && !turnstile.token && !Object.keys(found).length) found.verify = 'Please complete the verification check below.';
    setErrors(found);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      const el = document.getElementById(`pq-${first}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus({ preventScroll: true });
      return;
    }

    // A bot filled the hidden field: act as if it worked and send nothing.
    if (honeypot) {
      setResult({ phone: fields.phone, name: fields.firstName });
      setStatus('sent');
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setSubmitError("You're offline. Check your mobile data or Wi-Fi, then tap Send request again.");
      return;
    }

    const t = (s: string) => s.trim().replace(/\s+/g, ' ');
    const patient = [fields.firstName, fields.middleName, fields.lastName].map(t).filter(Boolean).join(' ');
    const medicineText = chosen.map((c) => c.label).join('; ');
    const consentText = `Agreed to the Privacy Policy and Terms of Service (${new Date().toISOString()})`;

    setStatus('sending');
    try {
      const submission = await submitInquiry(
        {
          turnstileToken: turnstile.token,
          inquiryType: INQUIRY_TYPE,
          fullName: `(PAP QR) ${patient}`,
          email: '',
          phone: t(fields.phone),
          subject: INQUIRY_TYPE,
          message: [
            `Patient: ${patient}`,
            `Contact number: ${t(fields.phone)}`,
            `Complete address: ${t(fields.address)}`,
            `Doctor: ${t(fields.doctor)}`,
            `Hospital: ${t(fields.hospital)}`,
            `Medicine needed: ${medicineText}`,
          ].join('\n'),
          additionalData: {
            namePrefix: '(PAP QR)',
            firstName: t(fields.firstName),
            middleName: t(fields.middleName),
            lastName: t(fields.lastName),
            address: t(fields.address),
            doctorName: t(fields.doctor),
            institution: t(fields.hospital),
            medicines: medicineText,
            productName: medicineText,
            consent: consentText,
            source: 'QR code (/qr3)',
          },
          files: [],
        },
        { endpoint: getApiUrl(), returnPath: '/qr3' }
      );
      turnstile.reset();
      if (submission.status === 'failed') throw new Error(submission.error);
      if (submission.status === 'queued') {
        setStatus('idle');
        setSubmitError('Your connection dropped before the request was sent. Check your signal, then tap Send request again.');
        return;
      }
      const body = (submission.body || {}) as { inquiry_code?: string };
      setResult({ code: body.inquiry_code, phone: t(fields.phone), name: t(fields.firstName) });
      setStatus('sent');
      setFields(EMPTY);
      setChosen([]);
      setConsent(false);
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (err) {
      setStatus('idle');
      const msg = err instanceof Error && err.message && !/^Submission request failed/.test(err.message) ? err.message : '';
      setSubmitError(msg || "We couldn't send your request. Please try again, or call or text us at +63 919 076 9105.");
    }
  };

  if (status === 'sent' && result) {
    return (
      <main className="pq" ref={topRef}>
        <section className="pq-done" aria-live="polite">
          <span className="pq-done-icon" aria-hidden="true">
            <Check size={30} strokeWidth={2.6} />
          </span>
          <h1>Request received</h1>
          <p>
            Thank you{result.name ? `, ${result.name}` : ''}. A Getmeds patient care staff member will call or text you at <strong>{result.phone}</strong> about your medicine and the
            assistance available.
          </p>
          {result.code && (
            <div className="pq-code">
              <span>Your reference number</span>
              <strong>{result.code}</strong>
              <small>Take a screenshot so you can quote it when we contact you.</small>
            </div>
          )}
          <div className="pq-next">
            <h2>While you wait</h2>
            <ul>
              <li>Keep the doctor&apos;s prescription ready. We need it before any prescription medicine can be released.</li>
              <li>Keep your phone on so you don&apos;t miss our call.</li>
            </ul>
          </div>
          <Link href="/patient-assistance-program" className="pq-btn pq-btn-ghost">
            See PCSO and DSWD assistance requirements
          </Link>
          <button
            type="button"
            className="pq-link"
            onClick={() => {
              setResult(null);
              setStatus('idle');
            }}
          >
            Send a request for another patient
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="pq" ref={topRef}>
      <header className="pq-hero">
        <p className="pq-eyebrow">Patient Assistance Program</p>
        <h1>Request help getting your medicine</h1>
        <p>Fill in the patient&apos;s details. Our team will contact you to arrange the medicine and guide you through the assistance available.</p>
        <p className="pq-trust">
          <ShieldCheck size={16} aria-hidden="true" /> Your details are protected under the Data Privacy Act of 2012.
        </p>
      </header>

      <form className="pq-form" onSubmit={onSubmit} noValidate>
        {/* Hidden from people; bots that fill every field reveal themselves here. */}
        <div className="pq-hp" aria-hidden="true">
          <label>
            Company
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </label>
        </div>

        <fieldset className="pq-card">
          <legend>
            <span className="pq-step">1</span> Patient details
          </legend>
          <TextField id="firstName" label="First name" icon={<UserRound size={18} />} value={fields.firstName} onChange={set('firstName')} error={errors.firstName} autoComplete="given-name" required />
          <TextField id="middleName" label="Middle name" optional value={fields.middleName} onChange={set('middleName')} error={errors.middleName} autoComplete="additional-name" />
          <TextField id="lastName" label="Last name" value={fields.lastName} onChange={set('lastName')} error={errors.lastName} autoComplete="family-name" required />
          <TextField
            id="phone"
            label="Contact number"
            icon={<Phone size={18} />}
            type="tel"
            inputMode="tel"
            placeholder="0917 123 4567"
            value={fields.phone}
            onChange={set('phone')}
            error={errors.phone}
            autoComplete="tel"
            hint="We'll call or text this number."
            required
          />
          <TextField
            id="address"
            label="Complete address"
            icon={<MapPin size={18} />}
            multiline
            placeholder="House no., street, barangay, city or municipality, province"
            value={fields.address}
            onChange={set('address')}
            error={errors.address}
            autoComplete="street-address"
            required
          />
        </fieldset>

        <fieldset className="pq-card">
          <legend>
            <span className="pq-step">2</span> Doctor and hospital
          </legend>
          <TextField id="doctor" label="Doctor's name" icon={<Stethoscope size={18} />} placeholder="e.g. Dr. Maria Santos" value={fields.doctor} onChange={set('doctor')} error={errors.doctor} autoComplete="off" required />
          <TextField id="hospital" label="Hospital name" icon={<Hospital size={18} />} placeholder="e.g. Philippine General Hospital" value={fields.hospital} onChange={set('hospital')} error={errors.hospital} autoComplete="organization" required />
        </fieldset>

        <fieldset className="pq-card">
          <legend>
            <span className="pq-step">3</span> Medicine needed
          </legend>
          <MedicinePicker catalogue={catalogue} chosen={chosen} onAdd={addMedicine} onRemove={(key) => setChosen((l) => l.filter((c) => c.key !== key))} error={errors.medicines} />
        </fieldset>

        <div className="pq-card pq-consent-card">
          <label className={`pq-consent${errors.consent ? ' has-error' : ''}`} id="pq-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (errors.consent) setErrors((x) => ({ ...x, consent: undefined }));
              }}
              aria-describedby="pq-consent-note"
            />
            <span className="pq-check" aria-hidden="true">
              <Check size={14} strokeWidth={3} />
            </span>
            <span>
              I agree to the{' '}
              <Link href="/privacy-policy" target="_blank" rel="noopener">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms-of-service" target="_blank" rel="noopener">
                Terms of Service
              </Link>
              , and I allow Getmeds to use these details to contact me about this request.
            </span>
          </label>
          {errors.consent && <FieldError id="pq-consent-error">{errors.consent}</FieldError>}
          <p className="pq-note" id="pq-consent-note">
            <Lock size={14} aria-hidden="true" /> We use these details only to process this medicine request and the assistance that goes with it. Only authorized Getmeds staff can see them.
          </p>

          <div id="pq-verify">
            <Turnstile turnstile={turnstile} className="pq-turnstile" />
            {errors.verify && <FieldError id="pq-verify-error">{errors.verify}</FieldError>}
          </div>

          {submitError && (
            <p className="pq-submit-error" role="alert">
              <CircleAlert size={18} aria-hidden="true" /> {submitError}
            </p>
          )}

          <button type="submit" className="pq-btn" disabled={status === 'sending'}>
            {status === 'sending' ? (
              <>
                <LoaderCircle size={20} className="pq-spin" aria-hidden="true" /> Sending…
              </>
            ) : (
              'Send request'
            )}
          </button>
          <p className="pq-fine">
            Prescription medicines are released only with a valid prescription from your doctor.
          </p>
        </div>
      </form>
    </main>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p className="pq-error" id={id}>
      <CircleAlert size={14} aria-hidden="true" /> {children}
    </p>
  );
}

interface TextFieldProps {
  id: FieldName;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
  placeholder?: string;
  type?: string;
  inputMode?: 'tel' | 'text';
  autoComplete?: string;
  multiline?: boolean;
  required?: boolean;
  optional?: boolean;
}

function TextField({ id, label, value, onChange, error, icon, hint, placeholder, type = 'text', inputMode, autoComplete, multiline, required, optional }: TextFieldProps) {
  const domId = `pq-${id}`;
  const describedBy = [error ? `${domId}-error` : '', hint ? `${domId}-hint` : ''].filter(Boolean).join(' ') || undefined;
  const common = {
    id: domId,
    name: id,
    value,
    placeholder,
    autoComplete,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  } as const;
  return (
    <div className={`pq-field${error ? ' has-error' : ''}${icon ? ' has-icon' : ''}`}>
      <label htmlFor={domId}>
        {label}
        {optional ? <span className="pq-optional"> (optional)</span> : required ? <span className="pq-req" aria-hidden="true"> *</span> : null}
      </label>
      <div className="pq-control">
        {icon && <span className="pq-icon" aria-hidden="true">{icon}</span>}
        {multiline ? (
          <textarea {...common} rows={3} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input {...common} type={type} inputMode={inputMode} enterKeyHint="next" onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
      {hint && !error && (
        <p className="pq-hint" id={`${domId}-hint`}>
          {hint}
        </p>
      )}
      {error && <FieldError id={`${domId}-error`}>{error}</FieldError>}
    </div>
  );
}

function MedicinePicker({
  catalogue,
  chosen,
  onAdd,
  onRemove,
  error,
}: {
  catalogue: MedicineOption[];
  chosen: Chosen[];
  onAdd: (c: Chosen) => void;
  onRemove: (key: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const hits = useMemo(() => searchMedicines(query, catalogue, 12), [query, catalogue]);
  const typed = query.trim();
  // Offered when nothing matched as typed (none at all, or only typo guesses), so a
  // condition search such as "breast cancer" isn't offered as a medicine name.
  const showCustom = typed.length >= 3 && hits.every((h) => h.fuzzy);
  const total = hits.length + (showCustom ? 1 : 0);
  const full = chosen.length >= 10;
  const readAs = hits.length && hits.every((h) => h.fuzzy) ? hits[0].readAs : undefined;

  const pick = (index: number) => {
    if (index < hits.length) {
      const o = hits[index].option;
      onAdd({ key: o.id, label: medicineLabel(o), option: o });
    } else if (showCustom) {
      onAdd({ key: `custom:${typed.toLowerCase()}`, label: `${typed} (not in list)` });
    }
    setQuery('');
    setActive(0);
    inputRef.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!total) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + total) % total);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(active);
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  };

  return (
    <div className={`pq-field pq-picker${error ? ' has-error' : ''}`}>
      <label htmlFor="pq-medicines">Search by brand, generic name or condition</label>
      <div className="pq-control has-icon">
        <span className="pq-icon" aria-hidden="true">
          <Search size={18} />
        </span>
        <input
          ref={inputRef}
          id="pq-medicines"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={full ? 'You can add up to 10 medicines' : 'e.g. Lapanib or lapatinib'}
          disabled={full}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          role="combobox"
          aria-expanded={total > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={total ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'pq-medicines-error' : undefined}
        />
        {query && (
          <button type="button" className="pq-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      {typed && (
        <div className="pq-results">
          {readAs && (
            <p className="pq-readas">
              Showing results for <strong>{readAs}</strong>
            </p>
          )}
          <ul id={listId} role="listbox" aria-label="Matching medicines">
            {hits.map((h, i) => {
              const o = h.option;
              const added = chosen.some((c) => c.key === o.id);
              return (
                <li
                  key={o.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={added || undefined}
                  className={`pq-option${i === active ? ' is-active' : ''}${added ? ' is-added' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !added && pick(i)}
                >
                  <span className="pq-option-icon" aria-hidden="true">
                    <Pill size={18} />
                  </span>
                  <span className="pq-option-text">
                    <span className="pq-option-name">
                      {o.brand}
                      {o.rx && <span className="pq-rx" title="Prescription required">Rx</span>}
                    </span>
                    <span className="pq-option-generic">{o.generic}</span>
                    <span className="pq-option-meta">{[o.strength, o.form].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className="pq-option-add" aria-hidden="true">
                    {added ? <Check size={18} /> : <Plus size={18} />}
                  </span>
                </li>
              );
            })}
            {showCustom && (
              <li
                id={`${listId}-${hits.length}`}
                role="option"
                aria-selected={active === hits.length}
                className={`pq-option pq-option-custom${active === hits.length ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(hits.length)}
              >
                <span className="pq-option-icon" aria-hidden="true">
                  <Plus size={18} />
                </span>
                <span className="pq-option-text">
                  <span className="pq-option-name">Add &ldquo;{typed}&rdquo;</span>
                  <span className="pq-option-meta">{hits.length ? 'Not the one? Request it by this name.' : "Not in our list. We'll check if we can source it."}</span>
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <FieldError id="pq-medicines-error">{error}</FieldError>}

      {chosen.length > 0 && (
        <ul className="pq-chosen" aria-label="Medicines added">
          {chosen.map((c) => (
            <li key={c.key}>
              <span className="pq-chosen-text">
                {c.option ? (
                  <>
                    <strong>
                      {c.option.brand}
                      {c.option.rx && <span className="pq-rx">Rx</span>}
                    </strong>
                    <span>{[c.option.generic, c.option.strength, c.option.form].filter(Boolean).join(' · ')}</span>
                  </>
                ) : (
                  <>
                    <strong>{c.label.replace(/ \(not in list\)$/, '')}</strong>
                    <span>Not in our list yet</span>
                  </>
                )}
              </span>
              <button type="button" onClick={() => onRemove(c.key)} aria-label={`Remove ${c.option?.brand || c.label}`}>
                <X size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!chosen.length && !typed && <p className="pq-hint">Type the name on the prescription or the box. You can add more than one medicine.</p>}
    </div>
  );
}
