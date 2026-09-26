'use client';
import { useId, useState } from 'react';
import { slugify } from './ui';

export const LANGS = [
  { code: 'es', label: 'Español' }, { code: 'en', label: 'English' }, { code: 'pt', label: 'Português' }, { code: 'fr', label: 'Français' },
];

export function Field({ label, hint, error, children, required, id, className = '' }) {
  return (
    <div className={`field ${className}`} data-invalid={error ? true : undefined}>
      {label && <label className="field__label" htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>}
      {children}
      {error ? <p className="field__error" role="alert">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ label, hint, error, value, onChange, required, multiline, rows = 3, maxLength, className, ...rest }) {
  const id = useId();
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} className={className}>
      <Tag id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={multiline ? rows : undefined} maxLength={maxLength} {...rest} />
      {maxLength && (value?.length || 0) > maxLength * 0.8 && <span className="field__count tnum">{value?.length || 0}/{maxLength}</span>}
    </Field>
  );
}

export function Select({ label, hint, value, onChange, options, placeholder, error, required }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id} error={error} required={required}>
      <select id={id} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function Toggle({ label, hint, checked, onChange, disabled }) {
  const id = useId();
  return (
    <div className="toggle">
      <input id={id} type="checkbox" role="switch" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <label htmlFor={id}><span className="toggle__track" aria-hidden="true"><span /></span><span className="toggle__text">{label}{hint && <small>{hint}</small>}</span></label>
    </div>
  );
}

/** Language tabs with a completeness dot per language. */
export function LocaleTabs({ lang, onChange, filled = [], compact = false }) {
  return (
    <div className={`ltabs ${compact ? 'ltabs--compact' : ''}`} role="tablist" aria-label="Idioma">
      {LANGS.map((l) => (
        <button key={l.code} type="button" role="tab" aria-selected={lang === l.code} onClick={() => onChange(l.code)}>
          <span className="ltabs__dot" data-on={filled.includes(l.code) || undefined} aria-hidden="true" />
          {compact ? l.code.toUpperCase() : l.label}
          {l.code === 'es' && !compact && <small>base</small>}
        </button>
      ))}
    </div>
  );
}

export function SlugInput({ value, onChange, source, locked, onLock, prefix, error }) {
  const id = useId();
  return (
    <Field label="Slug (URL)" id={id} error={error} hint={`${prefix}${value || '…'}`}>
      <div className="input-group">
        <input id={id} className="input" value={value} onChange={(e) => { onLock?.(true); onChange(slugify(e.target.value)); }} spellCheck={false} />
        <button type="button" className="abtn abtn--small" onClick={() => { onLock?.(false); onChange(slugify(source)); }} title="Generar desde el título">↻</button>
      </div>
      {!locked && <span className="field__hint">Se genera desde el título hasta que lo edites.</span>}
    </Field>
  );
}

export function TagInput({ label = 'Etiquetas', value = [], onChange, hint = 'Escribe y pulsa Enter o coma.' }) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const add = (raw) => {
    const t = raw.trim().toLowerCase().replace(/^#/, '').slice(0, 40);
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft('');
  };
  return (
    <Field label={label} hint={hint} id={id}>
      <div className="tag-input">
        {value.map((t) => (
          <span key={t} className="tag">#{t}<button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Quitar ${t}`}>×</button></span>
        ))}
        <input id={id} value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft); }
            if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)} placeholder={value.length ? '' : 'jason, vice-city…'} />
      </div>
    </Field>
  );
}

/** Searchable single/multi picker for records. options: [{id,label,type?,image?}] */
export function EntityPicker({ label, options, value, onChange, multiple = false, placeholder = 'Buscar ficha…', typeLabels = {}, exclude = [] }) {
  const id = useId();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const selected = multiple ? value || [] : value ? [value] : [];
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const results = options
    .filter((o) => !selected.includes(o.id) && !exclude.includes(o.id))
    .filter((o) => !q || norm(`${o.label} ${o.slug || ''}`).includes(norm(q)))
    .slice(0, 12);
  const pick = (o) => {
    onChange(multiple ? [...selected, o.id] : o.id);
    setQ('');
    if (!multiple) setOpen(false);
  };
  const byId = Object.fromEntries(options.map((o) => [o.id, o]));
  return (
    <Field label={label} id={id}>
      {multiple && selected.length > 0 && (
        <ul className="picked">
          {selected.map((sid) => (
            <li key={sid}>
              <span>{byId[sid]?.label || '—'}{byId[sid]?.type && <small>{typeLabels[byId[sid].type] || byId[sid].type}</small>}</span>
              <button type="button" onClick={() => onChange(selected.filter((x) => x !== sid))} aria-label="Quitar">×</button>
            </li>
          ))}
        </ul>
      )}
      <div className="combo">
        <input id={id} className="input" value={!multiple && !open && value ? (byId[value]?.label || '') : q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder} autoComplete="off" role="combobox" aria-expanded={open} />
        {!multiple && value && <button type="button" className="combo__clear" onClick={() => onChange('')} aria-label="Quitar selección">×</button>}
        {open && results.length > 0 && (
          <ul className="combo__list" role="listbox">
            {results.map((o) => (
              <li key={o.id} role="option" aria-selected="false">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)}>
                  <span>{o.label}</span>
                  {o.type && <small>{typeLabels[o.type] || o.type}</small>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
