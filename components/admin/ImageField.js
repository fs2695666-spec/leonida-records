'use client';
import { useState } from 'react';
import { MediaPicker } from './MediaPicker';
import { Field } from './fields';

/** Image URL field with preview, library picker and upload. */
export function ImageField({ label = 'Imagen', value, onChange, alt, onAltChange, hint, onPickMeta }) {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div className="imgfield">
        <button type="button" className="imgfield__preview" onClick={() => setOpen(true)} aria-label="Elegir imagen">
          {value ? <img src={value} alt="" /> : <span>Elegir o subir imagen</span>}
        </button>
        <div className="imgfield__side">
          <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://…" aria-label={`${label}: URL`} />
          {onAltChange && <input className="input" value={alt || ''} onChange={(e) => onAltChange(e.target.value)} placeholder="Texto alternativo (accesibilidad y SEO)" aria-label="Texto alternativo" />}
          <div className="imgfield__btns">
            <button type="button" className="abtn abtn--small" onClick={() => setOpen(true)}>Biblioteca</button>
            {value && <button type="button" className="abtn abtn--small abtn--ghost" onClick={() => onChange('')}>Quitar</button>}
          </div>
        </div>
      </div>
      {open && (
        <MediaPicker onClose={() => setOpen(false)} onPick={([m]) => {
          onChange(m.url);
          if (onAltChange && !alt && m.alt_text) onAltChange(m.alt_text);
          onPickMeta?.(m);
        }} />
      )}
    </Field>
  );
}
