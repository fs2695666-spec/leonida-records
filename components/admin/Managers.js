'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Drawer, EmptyState, useAction, useConfirm, useToast, slugify } from './ui';
import { EntityPicker, Field, LocaleTabs, Select, TextInput, Toggle } from './fields';
import { RELATION_LABELS, TYPE_SINGULAR } from './labels';
import { deleteCategory, saveCategory } from '@/app/admin/_actions/articles';
import { deleteSource, deleteTimeline, saveSource, saveTimeline } from '@/app/admin/_actions/library';
import { addRelation, deleteRelation } from '@/app/admin/_actions/content';

const langsFilled = (o) => ['es', 'en', 'pt', 'fr'].filter((l) => o?.[l]?.trim?.());
const COLORS = { flamingo: '#ef4f85', pool: '#3fb9c2', lavender: '#9c86e8', sun: '#f2b73a', peach: '#f77e6a', sky: '#6bb8dc', ink: '#1d1a3a' };

/* ============================================================ Categories */
export function CategoriesManager({ rows, isAdmin }) {
  const [edit, setEdit] = useState(null);
  const [lang, setLang] = useState('es');
  const [run, busy] = useAction();
  const confirm = useConfirm();
  const open = (c) => { setLang('es'); setEdit(c ? { ...c } : { id: null, slug: '', name: {}, color: 'flamingo', sort_order: rows.length }); };
  const toast = useToast();
  const save = async () => { const r = await run(saveCategory(edit), 'Sección guardada'); if (r) { setEdit(null); if (r.warning) toast(r.warning, 'error'); } };
  const remove = async (c) => {
    if (!(await confirm({ title: `¿Eliminar «${c.name?.es}»?`, message: 'Las noticias de esta sección quedarán sin sección.', confirmLabel: 'Eliminar', danger: true }))) return;
    await run(deleteCategory(c.id), 'Sección eliminada');
  };
  return (
    <>
      <div className="toolbar"><button type="button" className="abtn abtn--primary" onClick={() => open(null)}>Nueva sección</button></div>
      {rows.length === 0 ? <EmptyState title="Sin secciones">Crea secciones como «Oficial», «Tráilers» o «Música».</EmptyState> : (
        <ul className="list-cards">
          {rows.map((c) => (
            <li key={c.id}>
              <span className="swatch" style={{ background: COLORS[c.color] }} aria-hidden="true" />
              <div><strong>{c.name?.es}</strong><small>/noticias/archivo?category={c.slug} · {c.articles?.[0]?.count || 0} noticias · {langsFilled(c.name).join(' ').toUpperCase()}</small></div>
              <span className="row-actions">
                <button type="button" className="abtn abtn--small" onClick={() => open(c)}>Editar</button>
                {isAdmin && <button type="button" className="icon-btn" onClick={() => remove(c)} aria-label="Eliminar">×</button>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {edit && (
        <Drawer title={edit.id ? 'Editar sección' : 'Nueva sección'} onClose={() => setEdit(null)} footer={<>
          <button type="button" className="abtn" onClick={() => setEdit(null)}>Cancelar</button>
          <button type="button" className="abtn abtn--primary" disabled={busy || !edit.name.es?.trim() || !edit.slug} onClick={save}>Guardar</button>
        </>}>
          <LocaleTabs lang={lang} onChange={setLang} filled={langsFilled(edit.name)} compact />
          <TextInput label={`Nombre (${lang.toUpperCase()})`} required={lang === 'es'} value={edit.name[lang] || ''} maxLength={60}
            onChange={(v) => setEdit((e) => ({ ...e, name: { ...e.name, [lang]: v }, slug: !e.id && lang === 'es' ? slugify(v) : e.slug }))} />
          <TextInput label="Slug" value={edit.slug} onChange={(v) => setEdit((e) => ({ ...e, slug: slugify(v) }))} />
          <Field label="Color">
            <div className="swatches">
              {Object.entries(COLORS).map(([k, c]) => (
                <button key={k} type="button" className="swatch swatch--btn" style={{ background: c }} aria-pressed={edit.color === k} aria-label={k} onClick={() => setEdit((e) => ({ ...e, color: k }))} />
              ))}
            </div>
          </Field>
          <TextInput label="Orden" type="number" value={String(edit.sort_order)} onChange={(v) => setEdit((e) => ({ ...e, sort_order: v }))} />
        </Drawer>
      )}
    </>
  );
}

/* =============================================================== Sources */
export function SourcesManager({ rows, isAdmin }) {
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState('');
  const [run, busy] = useAction();
  const confirm = useConfirm();
  const shown = rows.filter((s) => !q || `${s.name} ${s.publisher} ${s.url}`.toLowerCase().includes(q.toLowerCase()));
  const open = (s) => setEdit(s ? { ...s, publisher: s.publisher || '', notes: s.notes || '', published_at: s.published_at || '' } : { id: null, name: '', publisher: '', kind: 'Official website', url: '', published_at: '', notes: '' });
  const save = async () => { if (await run(saveSource(edit), 'Fuente guardada')) setEdit(null); };
  const remove = async (s) => {
    const uses = (s.entities?.[0]?.count || 0) + (s.articles?.[0]?.count || 0);
    if (!(await confirm({ title: `¿Eliminar «${s.name}»?`, message: uses ? `La usan ${uses} fichas/noticias: se quedarán sin fuente.` : 'No la usa ningún contenido.', confirmLabel: 'Eliminar', danger: true }))) return;
    await run(deleteSource(s.id), 'Fuente eliminada');
  };
  const set = (k) => (v) => setEdit((e) => ({ ...e, [k]: v }));
  return (
    <>
      <div className="toolbar">
        <input className="input" type="search" placeholder="Buscar fuentes…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="abtn abtn--primary" onClick={() => open(null)}>Nueva fuente</button>
      </div>
      {shown.length === 0 ? <EmptyState title="Sin fuentes">Añade la web oficial, el Newswire o el artículo del que sale cada dato.</EmptyState> : (
        <ul className="list-cards">
          {shown.map((s) => (
            <li key={s.id}>
              <div>
                <strong>{s.name}</strong>
                <small>{[s.publisher, s.kind, s.published_at].filter(Boolean).join(' · ')} · usada en {(s.entities?.[0]?.count || 0) + (s.articles?.[0]?.count || 0)}</small>
                <a className="link-s" href={s.url} target="_blank" rel="noopener noreferrer">{s.url.replace(/^https?:\/\//, '').slice(0, 70)}</a>
              </div>
              <span className="row-actions">
                <button type="button" className="abtn abtn--small" onClick={() => open(s)}>Editar</button>
                {isAdmin && <button type="button" className="icon-btn" onClick={() => remove(s)} aria-label="Eliminar">×</button>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {edit && (
        <Drawer title={edit.id ? 'Editar fuente' : 'Nueva fuente'} onClose={() => setEdit(null)} footer={<>
          <button type="button" className="abtn" onClick={() => setEdit(null)}>Cancelar</button>
          <button type="button" className="abtn abtn--primary" disabled={busy || !edit.name.trim() || !/^https?:\/\//.test(edit.url)} onClick={save}>Guardar</button>
        </>}>
          <TextInput label="Nombre" required value={edit.name} onChange={set('name')} maxLength={200} />
          <TextInput label="URL" required value={edit.url} onChange={set('url')} placeholder="https://www.rockstargames.com/…" />
          <TextInput label="Editor / medio" value={edit.publisher} onChange={set('publisher')} placeholder="Rockstar Games" maxLength={120} />
          <Select label="Tipo" value={edit.kind} onChange={set('kind')} options={['Official website', 'Newswire', 'Official video page', 'Official media library', 'Support article', 'Official character / world page', 'Official editions page', 'Press', 'Social media', 'Other'].map((v) => ({ value: v, label: v }))} />
          <Field label="Fecha de publicación"><input type="date" className="input" value={edit.published_at || ''} onChange={(e) => set('published_at')(e.target.value)} /></Field>
          <TextInput label="Notas internas" multiline rows={3} value={edit.notes} onChange={set('notes')} maxLength={1000} />
        </Drawer>
      )}
    </>
  );
}

/* ============================================================== Timeline */
const KINDS = { video: 'Vídeo', news: 'Noticia', music: 'Música', launch: 'Lanzamiento', reveal: 'Revelación', other: 'Otro' };
export function TimelineManager({ rows, entities, articles, isAdmin }) {
  const [edit, setEdit] = useState(null);
  const [lang, setLang] = useState('es');
  const [run, busy] = useAction();
  const confirm = useConfirm();
  const open = (t) => { setLang('es'); setEdit(t ? { ...t, entity_id: t.entity_id || '', article_id: t.article_id || '' } : { id: null, event_date: new Date().toISOString().slice(0, 10), title: {}, detail: {}, kind: 'news', entity_id: '', article_id: '', published: true }); };
  const toast = useToast();
  const save = async () => { const r = await run(saveTimeline(edit), 'Evento guardado'); if (r) { setEdit(null); if (r.warning) toast(r.warning, 'error'); } };
  const remove = async (t) => {
    if (!(await confirm({ title: `¿Eliminar «${t.title?.es}»?`, confirmLabel: 'Eliminar', danger: true }))) return;
    await run(deleteTimeline(t.id), 'Evento eliminado');
  };
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <div className="toolbar"><button type="button" className="abtn abtn--primary" onClick={() => open(null)}>Nuevo evento</button></div>
      {rows.length === 0 ? <EmptyState title="Cronología vacía">Añade tráilers, anuncios y fechas clave.</EmptyState> : (
        <ul className="list-cards">
          {rows.map((t) => (
            <li key={t.id}>
              <span className="date-chip tnum" data-future={t.event_date > today || undefined}>{new Date(`${t.event_date}T12:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <div><strong>{t.title?.es}</strong><small>{KINDS[t.kind]}{!t.published && ' · oculto'} · {langsFilled(t.title).join(' ').toUpperCase()}</small></div>
              <span className="row-actions">
                <button type="button" className="abtn abtn--small" onClick={() => open(t)}>Editar</button>
                {isAdmin && <button type="button" className="icon-btn" onClick={() => remove(t)} aria-label="Eliminar">×</button>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {edit && (
        <Drawer title={edit.id ? 'Editar evento' : 'Nuevo evento'} onClose={() => setEdit(null)} footer={<>
          <button type="button" className="abtn" onClick={() => setEdit(null)}>Cancelar</button>
          <button type="button" className="abtn abtn--primary" disabled={busy || !edit.title.es?.trim() || !edit.event_date} onClick={save}>Guardar</button>
        </>}>
          <div className="grid-2">
            <Field label="Fecha"><input type="date" className="input" value={edit.event_date} onChange={(e) => setEdit((x) => ({ ...x, event_date: e.target.value }))} /></Field>
            <Select label="Tipo" value={edit.kind} onChange={(v) => setEdit((x) => ({ ...x, kind: v }))} options={Object.entries(KINDS).map(([value, label]) => ({ value, label }))} />
          </div>
          <LocaleTabs lang={lang} onChange={setLang} filled={langsFilled(edit.title)} compact />
          <TextInput label={`Título (${lang.toUpperCase()})`} required={lang === 'es'} value={edit.title[lang] || ''} onChange={(v) => setEdit((x) => ({ ...x, title: { ...x.title, [lang]: v } }))} maxLength={160} />
          <TextInput label={`Detalle (${lang.toUpperCase()})`} multiline rows={2} value={edit.detail[lang] || ''} onChange={(v) => setEdit((x) => ({ ...x, detail: { ...x.detail, [lang]: v } }))} maxLength={400} />
          <EntityPicker label="Enlazar a ficha (opcional)" options={entities} value={edit.entity_id} onChange={(v) => setEdit((x) => ({ ...x, entity_id: v }))} typeLabels={TYPE_SINGULAR} />
          <EntityPicker label="…o a noticia (opcional)" options={articles} value={edit.article_id} onChange={(v) => setEdit((x) => ({ ...x, article_id: v }))} placeholder="Buscar noticia…" />
          <Toggle label="Visible en la web" checked={edit.published} onChange={(v) => setEdit((x) => ({ ...x, published: v }))} />
        </Drawer>
      )}
    </>
  );
}

/* ============================================================= Relations */
export function RelationsOverview({ rows, entities }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [draft, setDraft] = useState({ from: '', relation_type: 'related', to: '', note: '' });
  const [run, busy] = useAction();
  const confirm = useConfirm();
  const shown = useMemo(() => rows.filter((r) => (!type || r.relation_type === type)
    && (!q || `${r.from?.title?.es} ${r.to?.title?.es}`.toLowerCase().includes(q.toLowerCase()))), [rows, q, type]);
  const byId = Object.fromEntries(entities.map((e) => [e.id, e]));
  const add = async () => {
    const ok = await run(addRelation({ from_entity_id: draft.from, to_entity_id: draft.to, relation_type: draft.relation_type, note: draft.note }), 'Relación creada');
    if (ok) setDraft({ from: '', relation_type: draft.relation_type, to: '', note: '' });
  };
  const remove = async (r) => {
    if (!(await confirm({ title: '¿Quitar esta relación?', confirmLabel: 'Quitar', danger: true }))) return;
    await run(deleteRelation(r.id), 'Relación eliminada');
  };
  return (
    <div className="panel-grid panel-grid--side">
      <section className="card">
        <div className="toolbar">
          <input className="input" type="search" placeholder="Buscar por ficha…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de relación">
            <option value="">Todas las relaciones</option>
            {Object.entries(RELATION_LABELS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {shown.length === 0 ? <p className="muted">No hay relaciones con estos filtros.</p> : (
          <ul className="rel-list">
            {shown.map((r) => (
              <li key={r.id}>
                <span className="rel-list__s">
                  <Link href={`/admin/content/${r.from?.id}`}>{r.from?.title?.es}</Link> <em>{(RELATION_LABELS[r.relation_type] || RELATION_LABELS.related)[0]}</em> <Link href={`/admin/content/${r.to?.id}`}>{r.to?.title?.es}</Link>
                  {r.note && <small> · {r.note}</small>}
                </span>
                <button type="button" className="icon-btn" onClick={() => remove(r)} aria-label="Quitar">×</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2 className="card__title">Nueva relación</h2>
        <EntityPicker label="Desde" options={entities} value={draft.from} onChange={(v) => setDraft((d) => ({ ...d, from: v }))} typeLabels={TYPE_SINGULAR} exclude={[draft.to]} />
        <Select label="Relación" value={draft.relation_type} onChange={(v) => setDraft((d) => ({ ...d, relation_type: v }))} options={Object.entries(RELATION_LABELS).map(([k, [l]]) => ({ value: k, label: l }))} />
        <EntityPicker label="Hacia" options={entities} value={draft.to} onChange={(v) => setDraft((d) => ({ ...d, to: v }))} typeLabels={TYPE_SINGULAR} exclude={[draft.from]} />
        <TextInput label="Nota (opcional)" value={draft.note} onChange={(v) => setDraft((d) => ({ ...d, note: v }))} maxLength={200} />
        {draft.from && draft.to && <p className="rel-preview"><strong>{byId[draft.from]?.label}</strong> {RELATION_LABELS[draft.relation_type][0]} <strong>{byId[draft.to]?.label}</strong></p>}
        <p className="field__hint">La relación aparece automáticamente en las dos fichas, con el texto adecuado en cada idioma.</p>
        <button type="button" className="abtn abtn--primary" disabled={busy || !draft.from || !draft.to} onClick={add}>Crear relación</button>
      </section>
    </div>
  );
}
