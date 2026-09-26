'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntityPicker, Field, LANGS, LocaleTabs, Select, SlugInput, TagInput, TextInput, Toggle } from './fields';
import { EvidencePill, StatusPill, useAction, useConfirm, useSaveShortcut, useToast, useUnsavedGuard } from './ui';
import { RichEditor } from './RichEditor';
import { ImageField } from './ImageField';
import { MapPicker } from './MapPicker';
import { MediaPicker } from './MediaPicker';
import { RelTime } from './RelTime';
import { EVIDENCE_HELP, EVIDENCE_LABELS, RELATION_LABELS, TYPE_SINGULAR } from './labels';
import { addRelation, deleteEntities, deleteFact, deleteRelation, saveEntity, saveFact, setEntityMedia } from '@/app/admin/_actions/content';

const TYPES = ['characters', 'locations', 'vehicles', 'facts', 'trailers', 'theories'];
const EVIDENCE = Object.keys(EVIDENCE_LABELS);
const LOCALIZED = [['title', 'Título'], ['eyebrow', 'Antetítulo'], ['short_description', 'Resumen'], ['quote', 'Cita'], ['description', 'Descripción']];

const filled = (v) => (typeof v === 'string' ? v.trim().length > 0 : Boolean(v && JSON.stringify(v).includes('"text":"')) || Boolean(v && /"type":"(image|youtube|gallery)"/.test(JSON.stringify(v))));
const filledLangs = (obj) => LANGS.map((l) => l.code).filter((l) => filled(obj?.[l]));

function initialForm(e, defaultType) {
  return {
    id: e?.id || null,
    type: e?.type || defaultType || 'characters',
    slug: e?.slug || '',
    status: e?.status || 'OBSERVED',
    title: e?.title || {}, eyebrow: e?.eyebrow || {}, short_description: e?.short_description || {}, description: e?.description || {}, quote: e?.quote || {},
    hero_image: e?.hero_image || '', hero_alt: e?.hero_alt || '', video_url: e?.video_url || '',
    tags: e?.tags || [], primary_source_id: e?.primary_source_id || '',
    published: Boolean(e?.published), featured: Boolean(e?.featured), sort_order: e?.sort_order ?? 0,
    published_at: e?.published_at || null, map: e?.metadata?.map || null, release_date: e?.metadata?.release_date || '',
  };
}

export function EntityEditor({ entity, facts = [], relations = [], media = [], sourceOptions, entityOptions, isAdmin, defaultType }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [run, busy] = useAction();
  const [form, setForm] = useState(() => initialForm(entity, defaultType));
  const [tab, setTab] = useState('general');
  const [lang, setLang] = useState('es');
  const [dirty, setDirty] = useState(false);
  const [slugLocked, setSlugLocked] = useState(Boolean(entity?.slug));
  const [savedAt, setSavedAt] = useState(entity?.updated_at || null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(form);
  formRef.current = form;

  useUnsavedGuard(dirty);

  const set = useCallback((patch) => { setForm((f) => ({ ...f, ...patch })); setDirty(true); }, []);
  const setLoc = (field, l, v) => {
    setForm((f) => {
      const next = { ...f, [field]: { ...f[field], [l]: v } };
      if (field === 'title' && l === 'es' && !slugLocked) next.slug = slugifyLocal(v);
      return next;
    });
    setDirty(true);
  };

  const validate = (f) => {
    const e = {};
    if (!f.title.es?.trim()) e.title = 'El título en español es obligatorio.';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug)) e.slug = 'Slug no válido: minúsculas, números y guiones.';
    if (f.hero_image && !/^https?:\/\//.test(f.hero_image)) e.hero_image = 'La imagen debe ser una URL https://';
    if (f.video_url && !/^https?:\/\//.test(f.video_url)) e.video_url = 'URL no válida';
    setErrors(e);
    return e;
  };

  const save = useCallback(async (overrides = {}, { silent = false } = {}) => {
    const f = { ...formRef.current, ...overrides };
    const e = validate(f);
    if (Object.keys(e).length) {
      if (!silent) { toast(Object.values(e)[0], 'error'); setTab(e.hero_image || e.video_url ? 'media' : 'general'); }
      return null;
    }
    setSaving(true);
    const payload = { ...f, primary_source_id: f.primary_source_id || null, sort_order: Number(f.sort_order) || 0 };
    const msg = overrides.published === true ? 'Publicada en la web' : overrides.published === false ? 'Pasada a borrador' : 'Cambios guardados';
    const res = await run(saveEntity(payload), silent ? null : msg, { refresh: !silent });
    setSaving(false);
    if (!res) return null;
    setForm((cur) => ({ ...cur, ...overrides, id: res.id }));
    setDirty(false);
    setSavedAt(res.updated_at);
    if (!f.id) router.replace(`/admin/content/${res.id}`);
    return res;
  }, [run, router, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  useSaveShortcut(() => save());

  // Autosave drafts (never auto-publishes, never touches published records)
  useEffect(() => {
    if (!dirty || !form.id || form.published) return undefined;
    const t = setTimeout(() => save({}, { silent: true }), 5000);
    return () => clearTimeout(t);
  }, [form, dirty, save]);

  const remove = async () => {
    if (!(await confirm({ title: '¿Eliminar esta ficha?', message: 'Se borrarán también sus datos, relaciones y vínculos de galería. No se puede deshacer.', confirmLabel: 'Eliminar', danger: true }))) return;
    const res = await run(deleteEntities([form.id]), 'Ficha eliminada', { refresh: false });
    if (res) { setDirty(false); router.push('/admin/content'); router.refresh(); }
  };

  const title = form.title.es || 'Nueva ficha';
  const publicUrl = `/${form.type}/${form.slug}`;
  const tabs = [
    ['general', 'General'], ['content', 'Contenido'], ['media', 'Media'], ['sources', 'Fuentes y datos'], ['relations', 'Relaciones'], ['translations', 'Traducciones'],
  ];
  const typeOptions = entityOptions.filter((o) => o.id !== form.id);

  return (
    <div className="editor">
      <header className="editor__head">
        <div className="editor__crumbs"><Link href="/admin/content">Fichas</Link> / {TYPE_SINGULAR[form.type]}</div>
        <div className="editor__titlebar">
          <h1>{title}</h1>
          <div className="editor__meta">
            <StatusPill published={form.published} publishedAt={form.published_at} />
            <EvidencePill level={form.status} />
            <span className="editor__saved" aria-live="polite">
              {saving ? 'Guardando…' : dirty ? 'Cambios sin guardar' : savedAt ? <>Guardado <RelTime iso={savedAt} /></> : 'Sin guardar'}
            </span>
          </div>
        </div>
        <div className="editor__actions">
          {form.id && <a className="abtn abtn--ghost" href={`/admin/preview/entity/${form.id}?lang=${lang}`} target="_blank" rel="noopener noreferrer">Vista previa</a>}
          {form.id && form.published && <a className="abtn abtn--ghost" href={publicUrl} target="_blank" rel="noopener noreferrer">Ver en la web ↗</a>}
          <button type="button" className="abtn" onClick={() => save()} disabled={busy || saving}>{form.published ? 'Guardar cambios' : 'Guardar borrador'}</button>
          {form.published
            ? <button type="button" className="abtn abtn--ghost" onClick={() => save({ published: false })} disabled={busy || saving}>Despublicar</button>
            : <button type="button" className="abtn abtn--primary" onClick={() => save({ published: true })} disabled={busy || saving}>Publicar</button>}
        </div>
        <nav className="tabs" role="tablist" aria-label="Secciones de la ficha">
          {tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
        </nav>
      </header>

      <div className="editor__body">
        {tab === 'general' && (
          <div className="panel-grid">
            <section className="card">
              <h2 className="card__title">Identidad</h2>
              <Select label="Tipo" value={form.type} onChange={(v) => set({ type: v })} options={TYPES.map((t) => ({ value: t, label: TYPE_SINGULAR[t] }))} />
              <TextInput label="Título (español)" required value={form.title.es || ''} onChange={(v) => { setLoc('title', 'es', v); }} error={errors.title} maxLength={160} />
              <SlugInput value={form.slug} onChange={(v) => set({ slug: v })} source={form.title.es} locked={slugLocked} onLock={setSlugLocked} prefix={`/${form.type}/`} error={errors.slug} />
              <TextInput label="Antetítulo (español)" hint="Línea pequeña sobre el título. Ej.: «Personaje 001»." value={form.eyebrow.es || ''} onChange={(v) => { setLoc('eyebrow', 'es', v); }} maxLength={80} />
              <TagInput value={form.tags} onChange={(v) => set({ tags: v })} />
            </section>
            <section className="card">
              <h2 className="card__title">Publicación</h2>
              <Toggle label="Publicada" hint="Visible en la web. Si no, es un borrador privado." checked={form.published} onChange={(v) => set({ published: v })} />
              <Toggle label="Destacada" hint="Aparece en «En portada» y tiene prioridad en el mapa." checked={form.featured} onChange={(v) => set({ featured: v })} />
              <TextInput label="Orden" type="number" hint="Menor número = aparece antes en los listados." value={String(form.sort_order)} onChange={(v) => set({ sort_order: v })} />
              <Field label="Nivel de evidencia">
                <div className="ev-choice" role="radiogroup" aria-label="Nivel de evidencia">
                  {EVIDENCE.map((l) => (
                    <label key={l} className="ev-choice__opt" data-on={form.status === l || undefined}>
                      <input type="radio" name="status" value={l} checked={form.status === l} onChange={() => set({ status: l })} />
                      <EvidencePill level={l} /><small>{EVIDENCE_HELP[l]}</small>
                    </label>
                  ))}
                </div>
              </Field>
            </section>
            {form.type === 'locations' && (
              <section className="card card--wide">
                <h2 className="card__title">Posición en el mapa de Leonida</h2>
                <p className="muted">Haz clic en el mapa. Es ilustrativo: basta con una posición aproximada.</p>
                <MapPicker value={form.map} onChange={(v) => set({ map: v })} />
              </section>
            )}
          </div>
        )}

        {tab === 'content' && (
          <section className="card">
            <div className="card__head">
              <h2 className="card__title">Textos en {LANGS.find((l) => l.code === lang).label}</h2>
              <LocaleTabs lang={lang} onChange={setLang} filled={['es', 'en', 'pt', 'fr'].filter((l) => filled(form.short_description[l]))} />
            </div>
            {lang !== 'es' && !filled(form.title[lang]) && (
              <p className="notice">Si dejas un campo vacío, la web mostrará el texto en español.</p>
            )}
            <TextInput label="Título" required={lang === 'es'} value={form.title[lang] || ''} onChange={(v) => { setLoc('title', lang, v); }} maxLength={160} placeholder={lang !== 'es' ? form.title.es : ''} />
            <TextInput label="Antetítulo" value={form.eyebrow[lang] || ''} onChange={(v) => { setLoc('eyebrow', lang, v); }} maxLength={80} placeholder={lang !== 'es' ? form.eyebrow.es : ''} />
            <TextInput label="Resumen" hint="Una o dos frases. Se usa en tarjetas, buscador y SEO." multiline rows={3} value={form.short_description[lang] || ''} onChange={(v) => { setLoc('short_description', lang, v); }} maxLength={400} placeholder={lang !== 'es' ? form.short_description.es : ''} />
            <TextInput label="Cita destacada" multiline rows={2} value={form.quote[lang] || ''} onChange={(v) => { setLoc('quote', lang, v); }} maxLength={400} placeholder={lang !== 'es' ? form.quote.es : ''} />
            <Field label="Descripción">
              <RichEditor key={`desc-${lang}`} value={form.description[lang] || null} onChange={(v) => { setLoc('description', lang, v); }} placeholder="Descripción larga: qué se sabe y de dónde sale…" label={`Descripción (${lang})`} />
            </Field>
          </section>
        )}

        {tab === 'media' && (
          <div className="panel-grid">
            <section className="card">
              <h2 className="card__title">Imagen principal</h2>
              <ImageField label="Imagen de cabecera" value={form.hero_image} onChange={(v) => set({ hero_image: v })} alt={form.hero_alt} onAltChange={(v) => set({ hero_alt: v })} hint="Se usa en la ficha, en las tarjetas y al compartir en redes." />
              {errors.hero_image && <p className="field__error">{errors.hero_image}</p>}
              {form.type === 'trailers' && (
                <Field label="Fecha de estreno del vídeo" hint="Se muestra en /media y ordena los vídeos.">
                  <input type="date" className="input" value={form.release_date || ''} onChange={(e) => set({ release_date: e.target.value })} />
                </Field>
              )}
              <TextInput label="Vídeo (YouTube)" hint="Opcional. Se incrusta en la ficha y aparece en /media si el tipo es «Vídeo»." value={form.video_url} onChange={(v) => set({ video_url: v })} placeholder="https://www.youtube.com/watch?v=…" error={errors.video_url} />
            </section>
            <GalleryManager entityId={form.id} initial={media} />
          </div>
        )}

        {tab === 'sources' && (
          <div className="panel-grid">
            <section className="card">
              <h2 className="card__title">Fuente principal</h2>
              <Select label="Fuente" value={form.primary_source_id} onChange={(v) => set({ primary_source_id: v })} options={sourceOptions.map((s) => ({ value: s.id, label: s.label }))} placeholder="— Sin fuente —" />
              <p className="field__hint">¿No está en la lista? <Link href="/admin/sources" target="_blank">Añade la fuente</Link> y recarga.</p>
            </section>
            <FactsManager entityId={form.id} initial={facts} sourceOptions={sourceOptions} />
          </div>
        )}

        {tab === 'relations' && <RelationsManager entityId={form.id} entityTitle={title} initial={relations} options={typeOptions} />}

        {tab === 'translations' && (
          <section className="card">
            <h2 className="card__title">Estado de las traducciones</h2>
            <div className="dt__scroll">
              <table className="mini-table tr-matrix">
                <thead><tr><th>Campo</th>{LANGS.map((l) => <th key={l.code}>{l.code.toUpperCase()}</th>)}</tr></thead>
                <tbody>
                  {LOCALIZED.map(([k, label]) => (
                    <tr key={k}>
                      <td>{label}</td>
                      {LANGS.map((l) => (
                        <td key={l.code}>
                          <button type="button" className="tr-cell" data-on={filled(form[k][l.code]) || (k === 'title' && filled(form.title.es)) || undefined} onClick={() => { setLang(l.code); setTab('content'); }}>
                            {filled(form[k][l.code]) ? '✓' : k === 'title' && filled(form.title.es) ? '= ES' : filled(form[k].es) ? 'Falta' : '—'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="field__hint">Haz clic en una celda para editar ese idioma. Los campos vacíos muestran el español en la web; en los nombres propios («= ES») suele ser lo correcto.</p>
            <div className="btn-row">
              {LANGS.filter((l) => l.code !== 'es').map((l) => (
                <button key={l.code} type="button" className="abtn abtn--small" onClick={() => {
                  setForm((f) => {
                    const next = { ...f };
                    for (const [k] of LOCALIZED) if (!filled(f[k][l.code]) && filled(f[k].es)) next[k] = { ...f[k], [l.code]: f[k].es };
                    return next;
                  });
                  setDirty(true); setLang(l.code); setTab('content');
                  toast(`Copiado el español en ${l.label} como punto de partida`);
                }}>Copiar ES → {l.code.toUpperCase()}</button>
              ))}
            </div>
          </section>
        )}
      </div>

      {isAdmin && form.id && (
        <footer className="editor__danger">
          <p>Zona peligrosa</p>
          <button type="button" className="abtn abtn--danger abtn--small" onClick={remove}>Eliminar ficha</button>
        </footer>
      )}
    </div>
  );
}

function slugifyLocal(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

/* ------------------------------------------------------------- Gallery */
function GalleryManager({ entityId, initial }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [run, busy] = useAction();
  const persist = async (next) => {
    const prev = items;
    setItems(next);
    const ok = await run(setEntityMedia(entityId, next.map((m) => m.id)), 'Galería actualizada', { refresh: false });
    if (!ok) setItems(prev);
  };
  const move = (i, d) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    persist(next);
  };
  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">Galería de la ficha</h2>
        <button type="button" className="abtn abtn--small" disabled={!entityId || busy} onClick={() => setOpen(true)}>Añadir imágenes</button>
      </div>
      {!entityId ? <p className="muted">Guarda la ficha primero para poder añadir su galería.</p>
        : items.length === 0 ? <p className="muted">Sin imágenes. Las imágenes de la galería también aparecen en /media.</p> : (
          <ul className="gal-list">
            {items.map((m, i) => (
              <li key={m.id}>
                <img src={m.url} alt={m.alt_text || ''} />
                <span className="gal-list__cap">{m.caption || m.alt_text || '—'}</span>
                <span className="gal-list__btns">
                  <button type="button" className="icon-btn" disabled={i === 0 || busy} onClick={() => move(i, -1)} aria-label="Subir">↑</button>
                  <button type="button" className="icon-btn" disabled={i === items.length - 1 || busy} onClick={() => move(i, 1)} aria-label="Bajar">↓</button>
                  <button type="button" className="icon-btn" disabled={busy} onClick={() => persist(items.filter((x) => x.id !== m.id))} aria-label="Quitar de la galería">×</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      {open && <MediaPicker multiple onClose={() => setOpen(false)} onPick={(picked) => persist([...items, ...picked.filter((p) => !items.some((x) => x.id === p.id))])} />}
    </section>
  );
}

/* --------------------------------------------------------------- Facts */
const emptyFact = (entityId) => ({ id: null, entity_id: entityId, title: {}, body: {}, status: 'CONFIRMED', source_id: '', timestamp_text: '', sort_order: 0 });

function FactsManager({ entityId, initial, sourceOptions }) {
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [flang, setFlang] = useState('es');
  const [run, busy] = useAction();
  const confirm = useConfirm();
  const srcLabel = useMemo(() => Object.fromEntries(sourceOptions.map((s) => [s.id, s.label])), [sourceOptions]);

  const save = async () => {
    const res = await run(saveFact({ ...editing, source_id: editing.source_id || null, sort_order: editing.id ? editing.sort_order : list.length }), 'Dato guardado', { refresh: false });
    if (res) {
      setList((l) => (editing.id ? l.map((f) => (f.id === res.id ? res : f)) : [...l, res]));
      setEditing(null);
    }
  };
  const remove = async (f) => {
    if (!(await confirm({ title: '¿Borrar este dato?', confirmLabel: 'Borrar', danger: true }))) return;
    if (await run(deleteFact(f.id), 'Dato borrado', { refresh: false })) setList((l) => l.filter((x) => x.id !== f.id));
  };

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">Datos verificables</h2>
        <button type="button" className="abtn abtn--small" disabled={!entityId} onClick={() => { setFlang('es'); setEditing(emptyFact(entityId)); }}>+ Añadir dato</button>
      </div>
      {!entityId && <p className="muted">Guarda la ficha primero para añadir datos.</p>}
      {entityId && list.length === 0 && !editing && <p className="muted">Cada dato lleva su propio nivel de evidencia y su fuente.</p>}
      <ul className="facts-admin">
        {list.map((f) => (
          <li key={f.id}>
            <div>
              <strong>{f.title?.es}</strong>
              <small>{EVIDENCE_LABELS[f.status]}{f.source_id ? ` · ${srcLabel[f.source_id] || 'fuente'}` : ''}{f.timestamp_text ? ` · ${f.timestamp_text}` : ''}</small>
            </div>
            <span className="row-actions">
              <button type="button" className="abtn abtn--small" onClick={() => { setFlang('es'); setEditing({ ...f, source_id: f.source_id || '', timestamp_text: f.timestamp_text || '' }); }}>Editar</button>
              <button type="button" className="icon-btn" onClick={() => remove(f)} aria-label="Borrar dato">×</button>
            </span>
          </li>
        ))}
      </ul>
      {editing && (
        <div className="subform">
          <div className="card__head"><strong>{editing.id ? 'Editar dato' : 'Nuevo dato'}</strong><LocaleTabs compact lang={flang} onChange={setFlang} filled={filledLangs(editing.title)} /></div>
          <TextInput label={`Dato (${flang.toUpperCase()})`} required={flang === 'es'} value={editing.title[flang] || ''} onChange={(v) => setEditing((e) => ({ ...e, title: { ...e.title, [flang]: v } }))} maxLength={200} />
          <TextInput label={`Detalle (${flang.toUpperCase()})`} multiline rows={2} value={editing.body[flang] || ''} onChange={(v) => setEditing((e) => ({ ...e, body: { ...e.body, [flang]: v } }))} maxLength={1000} />
          <div className="grid-3">
            <Select label="Evidencia" value={editing.status} onChange={(v) => setEditing((e) => ({ ...e, status: v }))} options={EVIDENCE.map((l) => ({ value: l, label: EVIDENCE_LABELS[l] }))} />
            <Select label="Fuente" value={editing.source_id} onChange={(v) => setEditing((e) => ({ ...e, source_id: v }))} options={sourceOptions.map((s) => ({ value: s.id, label: s.label }))} placeholder="— Sin fuente —" />
            <TextInput label="Marca de tiempo" hint="Ej.: 1:42 en el tráiler" value={editing.timestamp_text} onChange={(v) => setEditing((e) => ({ ...e, timestamp_text: v }))} maxLength={40} />
          </div>
          <div className="btn-row">
            <button type="button" className="abtn" onClick={() => setEditing(null)}>Cancelar</button>
            <button type="button" className="abtn abtn--primary" onClick={save} disabled={busy || !editing.title.es?.trim()}>Guardar dato</button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------- Relations */
function RelationsManager({ entityId, entityTitle, initial, options }) {
  const [list, setList] = useState(initial);
  const [draft, setDraft] = useState({ relation_type: 'related', direction: 'out', other: '', note: '' });
  const [run, busy] = useAction();
  const byId = useMemo(() => Object.fromEntries(options.map((o) => [o.id, o])), [options]);

  const add = async () => {
    if (!draft.other) return;
    const row = draft.direction === 'out'
      ? { from_entity_id: entityId, to_entity_id: draft.other, relation_type: draft.relation_type, note: draft.note }
      : { from_entity_id: draft.other, to_entity_id: entityId, relation_type: draft.relation_type, note: draft.note };
    const res = await run(addRelation(row), 'Relación añadida', { refresh: false });
    if (res) {
      const o = byId[draft.other];
      setList((l) => [...l, { id: res.id, relation_type: draft.relation_type, note: draft.note, direction: draft.direction, other: { id: o.id, type: o.type, slug: o.slug, title: { es: o.label }, published: o.published } }]);
      setDraft((d) => ({ ...d, other: '', note: '' }));
    }
  };
  const remove = async (r) => {
    if (await run(deleteRelation(r.id), 'Relación eliminada', { refresh: false })) setList((l) => l.filter((x) => x.id !== r.id));
  };

  if (!entityId) return <section className="card"><p className="muted">Guarda la ficha primero para poder relacionarla con otras.</p></section>;

  const sentence = (r) => {
    const [fwd, rev] = RELATION_LABELS[r.relation_type] || RELATION_LABELS.related;
    return r.direction === 'out' ? fwd : rev;
  };

  return (
    <div className="panel-grid">
      <section className="card">
        <h2 className="card__title">Conexiones de «{entityTitle}»</h2>
        {list.length === 0 ? <p className="muted">Sin relaciones. Se muestran automáticamente en las dos fichas implicadas.</p> : (
          <ul className="rel-list">
            {list.map((r) => (
              <li key={r.id}>
                <span className="rel-list__s"><em>{entityTitle}</em> {sentence(r)} <Link href={`/admin/content/${r.other?.id}`}>{r.other?.title?.es || r.other?.slug}</Link>
                  {r.note && <small> · {r.note}</small>}
                  {!r.other?.published && <small className="muted"> (borrador: no se muestra)</small>}
                </span>
                <button type="button" className="icon-btn" onClick={() => remove(r)} disabled={busy} aria-label="Quitar relación">×</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2 className="card__title">Añadir relación</h2>
        <Select label="Dirección" value={draft.direction} onChange={(v) => setDraft((d) => ({ ...d, direction: v }))}
          options={[{ value: 'out', label: `${entityTitle} → otra ficha` }, { value: 'in', label: `Otra ficha → ${entityTitle}` }]} />
        <Select label="Tipo de relación" value={draft.relation_type} onChange={(v) => setDraft((d) => ({ ...d, relation_type: v }))}
          options={Object.entries(RELATION_LABELS).map(([k, [fwd]]) => ({ value: k, label: fwd }))} />
        <EntityPicker label="Ficha relacionada" options={options} value={draft.other} onChange={(v) => setDraft((d) => ({ ...d, other: v }))} typeLabels={TYPE_SINGULAR} />
        <TextInput label="Nota (opcional)" value={draft.note} onChange={(v) => setDraft((d) => ({ ...d, note: v }))} maxLength={200} />
        {draft.other && (
          <p className="rel-preview">
            {draft.direction === 'out'
              ? <><strong>{entityTitle}</strong> {RELATION_LABELS[draft.relation_type][0]} <strong>{byId[draft.other]?.label}</strong></>
              : <><strong>{byId[draft.other]?.label}</strong> {RELATION_LABELS[draft.relation_type][0]} <strong>{entityTitle}</strong></>}
          </p>
        )}
        <button type="button" className="abtn abtn--primary" onClick={add} disabled={!draft.other || busy}>Añadir relación</button>
      </section>
    </div>
  );
}

