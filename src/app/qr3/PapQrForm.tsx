'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building,
  Check,
  CircleAlert,
  House,
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
import { composeAddress, filterBarangays, loadBarangays, loadPlaces, placeLabel, searchPlaces, type Place } from '@/lib/phAddress';
import Combobox, { type ComboItem } from './Combobox';

/* The sheet ("PAP QR CONVENSION INQUIRY") and the email both receive this type; the backend
   maps it in INQUIRY_SPREADSHEETS and prefixes the patient's name with "(PAP QR)". */
const INQUIRY_TYPE = 'PAP QR';
const MAX_MEDICINES = 10;

type FieldName = 'firstName' | 'middleName' | 'lastName' | 'phone' | 'city' | 'barangay' | 'street' | 'doctor' | 'hospital';
type Fields = Record<FieldName, string>;
type ErrorKey = FieldName | 'medicines' | 'consent' | 'verify';

interface Chosen {
  key: string;
  label: string;
  option?: MedicineOption;
}

const EMPTY: Fields = { firstName: '', middleName: '', lastName: '', phone: '', city: '', barangay: '', street: '', doctor: '', hospital: '' };

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
  if (!f.city.trim()) e.city = 'Type and choose your city or municipality.';
  if (!f.barangay.trim()) e.barangay = 'Type and choose your barangay.';
  if (f.street.trim().length < 3) e.street = 'Enter your house or unit number and street.';
  if (!f.doctor.trim()) e.doctor = "Enter the doctor's name.";
  if (!f.hospital.trim()) e.hospital = 'Enter the hospital or clinic name.';
  if (!medicines.length) e.medicines = 'Search and add at least one medicine.';
  if (!consent) e.consent = 'Please agree so we can process your request.';
  return e;
}

const ORDER: ErrorKey[] = ['firstName', 'middleName', 'lastName', 'phone', 'city', 'barangay', 'street', 'doctor', 'hospital', 'medicines', 'consent', 'verify'];
const FIELD_DOM_ID: Partial<Record<ErrorKey, string>> = { medicines: 'pq-medicines', consent: 'pq-consent', verify: 'pq-verify' };

export default function PapQrForm({ medicines: catalogue }: { medicines: MedicineOption[] }) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [place, setPlace] = useState<Place | null>(null);
  const [chosen, setChosen] = useState<Chosen[]>([]);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<{ code?: string; phone: string; name: string } | null>(null);
  const turnstile = useTurnstile(status !== 'sent');
  const topRef = useRef<HTMLDivElement>(null);

  const setField = (name: FieldName, value: string) => {
    setFields((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };
  const set = (name: FieldName) => (value: string) => setField(name, value);

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
      const el = document.getElementById(FIELD_DOM_ID[first] || `pq-${first}`);
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
    const address = composeAddress({ street: fields.street, barangay: fields.barangay, city: fields.city });
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
            `Complete address: ${address}`,
            `Doctor: ${t(fields.doctor)}`,
            `Hospital: ${t(fields.hospital)}`,
            `Medicine needed: ${medicineText}`,
          ].join('\n'),
          additionalData: {
            namePrefix: '(PAP QR)',
            firstName: t(fields.firstName),
            middleName: t(fields.middleName),
            lastName: t(fields.lastName),
            address,
            addressStreet: t(fields.street),
            addressBarangay: t(fields.barangay),
            addressCity: place?.name || t(fields.city),
            addressProvince: place?.province || '',
            addressPsgcCode: place?.code || '',
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
      setPlace(null);
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
        <Image src="/images/newpaplogo.png" alt="Getmeds Patient Assistance Program" width={1708} height={920} priority sizes="190px" className="pq-logo" />
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
          <AddressFields fields={fields} errors={errors} place={place} setPlace={setPlace} setField={setField} />
        </fieldset>

        <fieldset className="pq-card">
          <legend>
            <span className="pq-step">2</span> Doctor and hospital
          </legend>
          <TextField id="doctor" label="Doctor's name" icon={<Stethoscope size={18} />} placeholder="e.g. Dr. Maria Santos" value={fields.doctor} onChange={set('doctor')} error={errors.doctor} autoComplete="off" required />
          <TextField id="hospital" label="Hospital name" icon={<Hospital size={18} />} placeholder="e.g. Philippine General Hospital" value={fields.hospital} onChange={set('hospital')} error={errors.hospital} autoComplete="off" required />
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
          <p className="pq-fine">Prescription medicines are released only with a valid prescription from your doctor.</p>
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
  required?: boolean;
  optional?: boolean;
}

function TextField({ id, label, value, onChange, error, icon, hint, placeholder, type = 'text', inputMode, autoComplete, required, optional }: TextFieldProps) {
  const domId = `pq-${id}`;
  const describedBy = [error ? `${domId}-error` : '', hint && !error ? `${domId}-hint` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`pq-field${error ? ' has-error' : ''}${icon ? ' has-icon' : ''}`}>
      <label htmlFor={domId}>
        {label}
        {optional ? <span className="pq-optional"> (optional)</span> : required ? <span className="pq-req" aria-hidden="true"> *</span> : null}
      </label>
      <div className="pq-control">
        {icon && (
          <span className="pq-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={domId}
          name={id}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          type={type}
          inputMode={inputMode}
          enterKeyHint="next"
          onChange={(e) => onChange(e.target.value)}
        />
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

/* City or municipality → barangay → street. The city list is the PSA's official one, so picking
   a city fills the province and narrows the barangay list to that city's barangays. Anything not
   in the lists can still be typed in as is. */
function AddressFields({
  fields,
  errors,
  place,
  setPlace,
  setField,
}: {
  fields: Fields;
  errors: Partial<Record<ErrorKey, string>>;
  place: Place | null;
  setPlace: (p: Place | null) => void;
  setField: (name: FieldName, value: string) => void;
}) {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [placesFailed, setPlacesFailed] = useState(false);
  const [loaded, setLoaded] = useState<{ code: string; list: string[] } | null>(null);
  // The chosen city's barangays, or null while they load (or before a city is chosen).
  const barangays = place && loaded?.code === place.code ? loaded.list : null;

  const ensurePlaces = () => {
    if (places) return;
    loadPlaces()
      .then(setPlaces)
      .catch(() => setPlacesFailed(true));
  };

  useEffect(() => {
    if (!place) return;
    let live = true;
    loadBarangays(place.code)
      .then((list) => live && setLoaded({ code: place.code, list }))
      .catch(() => live && setLoaded({ code: place.code, list: [] }));
    return () => {
      live = false;
    };
  }, [place]);

  // Typing after choosing a city means a different city: drop the old one and its barangays.
  const cityQuery = fields.city;
  const showingChosen = place && cityQuery === placeLabel(place);
  const cityHits = useMemo(() => (places && !showingChosen ? searchPlaces(cityQuery, places, 30) : []), [places, cityQuery, showingChosen]);
  const cityItems: ComboItem[] = cityHits.map((p) => ({
    key: p.code,
    onSelect: () => {
      setPlace(p);
      setField('city', placeLabel(p));
      setField('barangay', '');
      window.setTimeout(() => document.getElementById('pq-barangay')?.focus(), 0);
    },
    content: (
      <span className="pq-option-text">
        <span className="pq-option-name">{p.name}</span>
        <span className="pq-option-meta">{p.province}</span>
      </span>
    ),
  }));

  const brgyQuery = fields.barangay;
  const brgyHits = useMemo(() => (barangays ? filterBarangays(brgyQuery, barangays, 80) : []), [barangays, brgyQuery]);
  const brgyExact = brgyHits.some((b) => b.toLowerCase() === brgyQuery.trim().toLowerCase());
  const brgyItems: ComboItem[] = brgyExact
    ? []
    : brgyHits.map((b) => ({
        key: b,
        onSelect: () => {
          setField('barangay', b);
          window.setTimeout(() => document.getElementById('pq-street')?.focus(), 0);
        },
        content: (
          <span className="pq-option-text">
            <span className="pq-option-name">{b}</span>
          </span>
        ),
      }));

  const preview = composeAddress({ street: fields.street, barangay: fields.barangay, city: fields.city });

  return (
    <div className="pq-address" role="group" aria-labelledby="pq-address-label">
      <p className="pq-group-label" id="pq-address-label">
        Complete address <span className="pq-req" aria-hidden="true">*</span>
      </p>
      <Combobox
        id="pq-city"
        label="City or municipality"
        icon={<Building size={18} />}
        placeholder="Start typing, e.g. Quezon City"
        value={cityQuery}
        onChange={(v) => {
          setField('city', v);
          if (place && v !== placeLabel(place)) setPlace(null);
        }}
        onFirstFocus={ensurePlaces}
        items={cityItems}
        loading={!places && !placesFailed}
        empty={cityQuery.trim() && places ? <>No match. You can keep what you typed.</> : places ? <>Type the first letters of your city or municipality.</> : null}
        error={errors.city}
        autoComplete="address-level2"
        listLabel="Cities and municipalities"
        required
      />
      <Combobox
        id="pq-barangay"
        label="Barangay"
        icon={<MapPin size={18} />}
        placeholder={place ? 'Type or choose your barangay' : 'Type your barangay'}
        value={brgyQuery}
        onChange={(v) => setField('barangay', v)}
        items={brgyItems}
        loading={Boolean(place) && barangays === null}
        empty={place && barangays && !brgyExact && brgyQuery.trim() ? <>Not in the list. You can keep what you typed.</> : null}
        error={errors.barangay}
        autoComplete="address-level3"
        listLabel="Barangays"
        hint={place ? undefined : 'Choose your city first to see its barangays.'}
        required
      />
      <TextField
        id="street"
        label="House no., street, building or subdivision"
        icon={<House size={18} />}
        placeholder="e.g. 12 Rizal St., Villa Verde Subd."
        value={fields.street}
        onChange={(v) => setField('street', v)}
        error={errors.street}
        autoComplete="address-line1"
        required
      />
      {preview && fields.city && (
        <p className="pq-address-preview" aria-live="polite">
          <span>Your address</span>
          {preview}
        </p>
      )}
    </div>
  );
}

function MedicineThumb({ option }: { option?: MedicineOption }) {
  const [broken, setBroken] = useState(false);
  if (option?.image && !broken) {
    // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN already serves a resized, auto-format image
    return <img src={option.image} alt="" loading="lazy" decoding="async" className="pq-thumb" onError={() => setBroken(true)} />;
  }
  return (
    <span className="pq-thumb pq-thumb-icon" aria-hidden="true">
      <Pill size={18} />
    </span>
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
  const typed = query.trim();
  const hits = useMemo(() => searchMedicines(query, catalogue, 20), [query, catalogue]);
  const full = chosen.length >= MAX_MEDICINES;
  // Nothing typed: the whole list, A to Z, to browse. Typed: the best matches.
  const options = typed ? hits.map((h) => h.option) : catalogue;
  const readAs = hits.length && hits.every((h) => h.fuzzy) ? hits[0].readAs : undefined;
  // Offered when nothing matched as typed (none at all, or only typo guesses), so a
  // condition search such as "breast cancer" isn't offered as a medicine name.
  const showCustom = typed.length >= 3 && hits.every((h) => h.fuzzy);

  const items: ComboItem[] = options.map((o) => {
    const added = chosen.some((c) => c.key === o.id);
    return {
      key: o.id,
      disabled: added,
      onSelect: () => {
        onAdd({ key: o.id, label: medicineLabel(o), option: o });
        setQuery('');
      },
      content: (
        <>
          <MedicineThumb option={o} />
          <span className="pq-option-text">
            <span className="pq-option-name">
              {o.brand}
              {o.rx && (
                <span className="pq-rx" title="Prescription required">
                  Rx
                </span>
              )}
            </span>
            <span className="pq-option-generic">{o.generic}</span>
            <span className="pq-option-meta">{[o.strength, o.form].filter(Boolean).join(' · ')}</span>
          </span>
          <span className="pq-option-add" aria-hidden="true">
            {added ? <Check size={16} /> : <Plus size={16} />}
          </span>
        </>
      ),
    };
  });
  if (showCustom) {
    items.push({
      key: `custom:${typed.toLowerCase()}`,
      onSelect: () => {
        onAdd({ key: `custom:${typed.toLowerCase()}`, label: `${typed} (not in list)` });
        setQuery('');
      },
      content: (
        <>
          <span className="pq-thumb pq-thumb-icon pq-thumb-muted" aria-hidden="true">
            <Plus size={18} />
          </span>
          <span className="pq-option-text">
            <span className="pq-option-name">Add &ldquo;{typed}&rdquo;</span>
            <span className="pq-option-meta">{hits.length ? 'Not the one? Request it by this name.' : "Not in our list. We'll check if we can source it."}</span>
          </span>
        </>
      ),
    });
  }

  const header = readAs ? (
    <>
      Showing results for <strong>{readAs}</strong>
    </>
  ) : !typed ? (
    <>All medicines ({catalogue.length})</>
  ) : null;

  return (
    <div className="pq-picker">
      <Combobox
        id="pq-medicines"
        label="Search by brand, generic name or condition"
        icon={<Search size={18} />}
        placeholder={full ? 'You can add up to 10 medicines' : 'e.g. Lapanib or lapatinib'}
        value={query}
        onChange={setQuery}
        items={items}
        header={header}
        disabled={full}
        error={error}
        hint={chosen.length ? undefined : 'Type the name on the prescription or the box, or browse the list. You can add more than one.'}
        listLabel="Medicines"
        className="pq-combo-medicine"
      />

      {chosen.length > 0 && (
        <ul className="pq-chosen" aria-label="Medicines added">
          {chosen.map((c) => (
            <li key={c.key}>
              <MedicineThumb option={c.option} />
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
    </div>
  );
}
