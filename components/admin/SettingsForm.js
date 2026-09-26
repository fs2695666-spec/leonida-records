'use client';
import { useState } from 'react';
import { Field, LocaleTabs, TextInput } from './fields';
import { ImageField } from './ImageField';
import { useAction } from './ui';
import { saveSettings } from '@/app/admin/_actions/settings';

export function SettingsForm({ initial }) {
  const [form, setForm] = useState({
    hero_image: initial.hero_image || '', hero_video: initial.hero_video || '', release_date: initial.release_date || '',
    announcement: (initial.announcement && typeof initial.announcement === 'object') ? initial.announcement : {}, contact_email: initial.contact_email || '',
  });
  const [lang, setLang] = useState('es');
  const [run, busy] = useAction();
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form className="panel-grid" onSubmit={(e) => { e.preventDefault(); run(saveSettings(form), 'Ajustes guardados. La web se actualiza en unos segundos.'); }}>
      <section className="card">
        <h2 className="card__title">Portada</h2>
        <ImageField label="Imagen del hero" value={form.hero_image} onChange={set('hero_image')} hint="Imagen grande de la portada (y póster del vídeo)." />
        <TextInput label="Vídeo del hero (opcional)" hint="URL directa a un .mp4/.webm (sube el archivo en Media y copia su URL). Se reproduce en bucle y sin sonido." value={form.hero_video} onChange={set('hero_video')} placeholder="https://…/hero.mp4" />
        <Field label="Fecha de lanzamiento" hint="Alimenta la cuenta atrás del sello de la portada.">
          <input type="date" className="input" value={form.release_date || ''} onChange={(e) => set('release_date')(e.target.value)} />
        </Field>
      </section>
      <section className="card">
        <div className="card__head"><h2 className="card__title">Aviso superior</h2><LocaleTabs compact lang={lang} onChange={setLang} filled={['es', 'en', 'pt', 'fr'].filter((l) => form.announcement[l])} /></div>
        <TextInput label={`Texto (${lang.toUpperCase()})`} hint="Barra fina encima del menú. Déjalo vacío para ocultarla." multiline rows={2} maxLength={240}
          value={form.announcement[lang] || ''} onChange={(v) => setForm((f) => ({ ...f, announcement: { ...f.announcement, [lang]: v } }))} />
        <TextInput label="Email de contacto" type="email" value={form.contact_email} onChange={set('contact_email')} />
      </section>
      <div className="form-foot"><button type="submit" className="abtn abtn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar ajustes'}</button></div>
    </form>
  );
}
