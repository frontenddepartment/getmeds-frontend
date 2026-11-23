'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CircleAlert, LoaderCircle, X } from 'lucide-react';

/* A text box with a dropdown of suggestions (the ARIA 1.2 combobox pattern): type to filter,
   arrow keys and Enter to choose, Escape to close. The list sits under the field; on phones the
   field scrolls to the top of the screen when focused so the keyboard doesn't hide the list. */

export interface ComboItem {
  key: string;
  content: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}

interface ComboboxProps {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  items: ComboItem[];
  /** Shown at the top of the open list, e.g. "Showing results for Lapatinib". */
  header?: ReactNode;
  /** Shown when the list is open but has nothing to offer. */
  empty?: ReactNode;
  icon?: ReactNode;
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  autoComplete?: string;
  required?: boolean;
  optional?: boolean;
  /** Called the first time the field is focused (to load its data). */
  onFirstFocus?: () => void;
  /** Called when the field loses focus, with the dropdown closed. */
  onCommit?: () => void;
  listLabel: string;
  className?: string;
}

export default function Combobox({
  id,
  label,
  value,
  onChange,
  items,
  header,
  empty,
  icon,
  placeholder,
  hint,
  error,
  disabled,
  loading,
  autoComplete = 'off',
  required,
  optional,
  onFirstFocus,
  onCommit,
  listLabel,
  className = '',
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [activeRaw, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusedOnce = useRef(false);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
  // The highlight stays on a selectable row when the list changes under it.
  const active = items[activeRaw] && !items[activeRaw].disabled ? activeRaw : (enabled[0] ?? 0);
  const showList = open && !disabled && (items.length > 0 || Boolean(empty) || Boolean(loading));

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (showList) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, showList]);

  const choose = (i: number) => {
    const item = items[i];
    if (!item || item.disabled) return;
    item.onSelect();
    setOpen(false);
  };

  const move = (step: 1 | -1) => {
    if (!enabled.length) return;
    const at = enabled.indexOf(active);
    const next = at === -1 ? (step === 1 ? 0 : enabled.length - 1) : (at + step + enabled.length) % enabled.length;
    setActive(enabled[next]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      if (showList && items[active]) {
        e.preventDefault();
        choose(active);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    }
  };

  const describedBy = [error ? `${id}-error` : '', hint && !error ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`pq-field pq-combo${error ? ' has-error' : ''}${icon ? ' has-icon' : ''}${showList ? ' is-open' : ''} ${className}`}>
      <label htmlFor={id}>
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
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete={autoComplete}
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="next"
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && items[active] ? optionId(active) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => {
            if (!focusedOnce.current) {
              focusedOnce.current = true;
              onFirstFocus?.();
            }
            setOpen(true);
            // On a phone the keyboard takes half the screen: lift the field to the top so the list fits.
            if (window.matchMedia('(max-width: 640px)').matches) {
              window.setTimeout(() => inputRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 280);
            }
          }}
          onBlur={() => {
            setOpen(false);
            onCommit?.();
          }}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {loading && open ? (
          <span className="pq-combo-side" aria-hidden="true">
            <LoaderCircle size={16} className="pq-spin" />
          </span>
        ) : value && !disabled ? (
          <button
            type="button"
            className="pq-clear"
            tabIndex={-1}
            aria-label="Clear"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange('');
              setActive(0);
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        ) : null}

        {showList && (
          <div className="pq-dropdown" onMouseDown={(e) => e.preventDefault()}>
            {header && <div className="pq-dropdown-head">{header}</div>}
            <ul id={listId} role="listbox" aria-label={listLabel}>
              {items.map((item, i) => (
                <li
                  key={item.key}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={item.disabled || undefined}
                  className={`pq-option${i === active ? ' is-active' : ''}${item.disabled ? ' is-added' : ''}`}
                  onMouseEnter={() => !item.disabled && setActive(i)}
                  onClick={() => choose(i)}
                >
                  {item.content}
                </li>
              ))}
            </ul>
            {!items.length && (loading ? <p className="pq-dropdown-empty">Loading…</p> : empty && <div className="pq-dropdown-empty">{empty}</div>)}
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="pq-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="pq-error" id={`${id}-error`}>
          <CircleAlert size={14} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}
