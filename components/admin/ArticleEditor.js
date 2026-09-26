'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntityPicker, Field, LocaleTabs, Select, SlugInput, TagInput, TextInput, Toggle } from './fields';
import { EvidencePill, StatusPill, useAction, useConfirm, useSaveShortcut, useToast, useUnsavedGuard } from './ui';
import { RichEditor } from './RichEditor';
import { ImageField } from './ImageField';
import { RelTime } from './RelTime';
import { EVIDENCE_HELP, EVIDENCE_LABELS, TYPE_SINGULAR } from './labels';
import { deleteArticles, saveArticle } from '@/app/admin/_actions/articles';

const filled = (v) => (typeof v === 'string' ? v.trim().length > 0 : Boolean(v && /"text":"|"type":"(image|youtube|gallery)"/.test(JSON.stringify(v))));
const slugify = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

// ISO <-> <input type="datetime-local"> (local time)
const toLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocal = (v) => (v ? new Date(v).toISOString() : null);

function initial(a, authorDefault) {
  return {
    id: a?.id || null, slug: a?.slug || '',
    title: a?.title || {}, excerpt: a?.excerpt || {}, body: a?.body || {}, seo_title: a?.seo_title || {}, seo_description: a?.seo_description || {},
    category_id: a?.category_id || '', tags: a?.tags || [],
    cover_image: a?.cover_image || '', cover_alt: a?.cover_alt || '', cover_caption: a?.cover_caption || '',
    author_name: a?.author_name ?? authorDefault ?? '', source_id: a?.source_id || '', evidence: a?.evidence || 'REPORTED',
    published: Boolean(a?.published), featured: Boolean(a?.featured), published_at: a?.published_at || null,
    entity_ids: a?.entity_ids || [],
  };
}

export function ArticleEditor({ article, categories, sourceOptions, entityOptions, isAdmin, authorDefault }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [run, busy] = useAction();
  const [form, setForm] = useState(() => initial(article, authorDefault));
  const [lang, setLang] = useState('es');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(article?.updated_at || null);
  const [slugLocked, setSlugLocked] = useState(Boolean(article?.slug));
  const [showSeo, setShowSeo] = useState(false);
  const ref = useRef(form);
  ref.current = form;
  useUnsavedGuard(dirty);

  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setDirty(true); };
  const setLoc = (field, v) => {
    setForm((f) => {
      const next = { ...f, [field]: { ...f[field], [lang]: v } };
      if (field === 'title' && lang === 'es' && !slugLocked) next.slug = slugify(v);
      return next;
    });
    setDirty(true);
  };

  const save = useCallback(async (overrides = {}, { silent = false } = {}) => {
    const f = { ...ref.current, ...overrides };
    if (!f.title.es?.trim()) { if (!silent) toast('El titular en español es obligatorio', 'error'); return null; }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug)) { if (!silent) toast('El slug no es válido', 'error'); return null; }
    setSaving(true);
    const msg = overrides.published === true
      ? (f.published_at && f.published_at > new Date().toISOString() ? 'Noticia programada' : 'Noticia publicada')
      : overrides.published === false ? 'Pasada a borrador' : 'Cambios guardados';
    const res = await run(saveArticle({ ...f, category_id: f.category_id || null, source_id: f.source_id || null }), silent ? null : msg, { refresh: !silent });
    setSaving(false);
    if (!res) return null;
    setForm((cur) => ({ ...cur, ...overrides, id: res.id, published_at: res.published_at }));
    setDirty(false);
    setSavedAt(res.updated_at);
    if (!f.id) router.replace(`/admin/news/${res.id}`);
    return res;
  }, [run, router, toast]);

  useSaveShortcut(() => save());
  useEffect(() => {
    if (!dirty || !form.id || form.published) return undefined;
    const t = setTimeout(() => save({}, { silent: true }), 5000);
    return () => clearTimeout(t);
  }, [form, dirty, save]);

  const remove = async () => {
    if (!(await confirm({ title: '¿Eliminar esta noticia?', message: 'Desaparecerá de la web. No se puede deshacer.', confirmLabel: 'Eliminar', danger: true }))) return;
    if (await run(deleteArticles([form.id]), 'Noticia eliminada', { refresh: false })) { setDirty(false); router.push('/admin/news'); router.refresh(); }
  };

  const scheduled = form.published && form.published_at && form.published_at > new Date().toISOString();
  const filledLangs = ['es', 'en', 'pt', 'fr'].filter((l) => filled(form.title[l]) && filled(form.body[l]));

  return (
    <div className="editor">
      <header className="editor__head">
        <div className="editor__crumbs"><Link href="/admin/news">The Leonida Times</Link> / {form.id ? 'Editar' : 'Nueva noticia'}</div>
        <div className="editor__titlebar">
          <h1>{form.title.es || 'Nueva noticia'}</h1>
          <div className="editor__meta">
            <StatusPill published={form.published} publishedAt={form.published_at} />
            <span className="editor__saved" aria-live="polite">{saving ? 'Guardando…' : dirty ? 'Cambios sin guardar' : savedAt ? <>Guardado <RelTime iso={savedAt} /></> : 'Sin guardar'}</span>
          </div>
        </div>
        <div className="editor__actions">
          {form.id && <a className="abtn abtn--ghost" href={`/admin/preview/article/${form.id}?lang=${lang}`} target="_blank" rel="noopener noreferrer">Vista previa</a>}
          {form.id && form.published && !scheduled && <a className="abtn abtn--ghost" href={`/noticias/${form.slug}`} target="_blank" rel="noopener noreferrer">Ver en la web ↗</a>}
          <button type="button" className="abtn" onClick={() => save()} disabled={busy || saving}>{form.published ? 'Guardar cambios' : 'Guardar borrador'}</button>
          {form.published
            ? <button type="button" className="abtn abtn--ghost" onClick={() => save({ published: false })} disabled={busy || saving}>Despublicar</button>
            : <button type="button" className="abtn abtn--primary" onClick={() => save({ published: true })} disabled={busy || saving}>{form.published_at && form.published_at > new Date().toISOString() ? 'Programar' : 'Publicar'}</button>}
        </div>
      </header>

      <div className="article-layout">
        <div className="article-main">
          <section className="card card--paper">
            <div className="card__head">
              <LocaleTabs lang={lang} onChange={setLang} filled={filledLangs} />
            </div>
            {lang !== 'es' && !filled(form.title[lang]) && <p className="notice">Sin traducción: en /{lang}/noticias se mostrará la versión española.</p>}
            <textarea className="headline-input" rows={2} value={form.title[lang] || ''} onChange={(e) => setLoc('title', e.target.value)} placeholder={lang === 'es' ? 'Titular' : (form.title.es || 'Titular')} aria-label="Titular" maxLength={200} />
            <textarea className="standfirst-input" rows={2} value={form.excerpt[lang] || ''} onChange={(e) => setLoc('excerpt', e.target.value)} placeholder={lang === 'es' ? 'Entradilla: una o dos frases que resumen la noticia' : (form.excerpt.es || 'Entradilla')} aria-label="Entradilla" maxLength={500} />
            <RichEditor key={`body-${lang}`} value={form.body[lang] || null} onChange={(v) => setLoc('body', v)} placeholder="Escribe la noticia. Usa H2 para secciones, cita las fuentes con enlaces…" label={`Cuerpo (${lang})`} />
          </section>

          <section className="card">
            <button type="button" className="disclosure" aria-expanded={showSeo} onClick={() => setShowSeo((v) => !v)}>SEO y redes ({lang.toUpperCase()}) <span aria-hidden="true">{showSeo ? '−' : '+'}</span></button>
            {showSeo && (
              <>
                <TextInput label="Título SEO" hint="Opcional. Si está vacío se usa el titular." value={form.seo_title[lang] || ''} onChange={(v) => setLoc('seo_title', v)} maxLength={80} />
                <TextInput label="Descripción SEO" hint="Opcional. Si está vacía se usa la entradilla." multiline rows={2} value={form.seo_description[lang] || ''} onChange={(v) => setLoc('seo_description', v)} maxLength={200} />
                <div className="serp">
                  <span className="serp__url">…/{lang === 'es' ? '' : `${lang}/`}noticias/{form.slug || 'slug'}</span>
                  <span className="serp__title">{form.seo_title[lang] || form.title[lang] || form.title.es || 'Titular'} — Leonida Records</span>
                  <span className="serp__desc">{(form.seo_description[lang] || form.excerpt[lang] || form.excerpt.es || '').slice(0, 170)}</span>
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="article-side">
          <section className="card">
            <h2 className="card__title">Publicación</h2>
            <Toggle label="Publicada" checked={form.published} onChange={(v) => set({ published: v })} hint={scheduled ? 'Programada: saldrá sola en la fecha indicada.' : 'Si está desactivada es un borrador privado.'} />
            <Toggle label="Destacada" hint="Abre la portada de The Leonida Times." checked={form.featured} onChange={(v) => set({ featured: v })} />
            <Field label="Fecha de publicación" hint="Vacía = en el momento de publicar. Una fecha futura la programa.">
              <input type="datetime-local" className="input" value={toLocal(form.published_at)} onChange={(e) => set({ published_at: fromLocal(e.target.value) })} />
            </Field>
            <SlugInput value={form.slug} onChange={(v) => set({ slug: v })} source={form.title.es} locked={slugLocked} onLock={setSlugLocked} prefix="/noticias/" />
          </section>

          <section className="card">
            <h2 className="card__title">Portada</h2>
            <ImageField label="Imagen de portada" value={form.cover_image} onChange={(v) => set({ cover_image: v })} alt={form.cover_alt} onAltChange={(v) => set({ cover_alt: v })}
              onPickMeta={(m) => { if (!form.cover_caption && (m.caption || m.credit)) set({ cover_caption: [m.caption, m.credit && `Imagen: ${m.credit}`].filter(Boolean).join('. ') }); }} />
            <TextInput label="Pie de foto" value={form.cover_caption} onChange={(v) => set({ cover_caption: v })} maxLength={300} />
          </section>

          <section className="card">
            <h2 className="card__title">Clasificación</h2>
            <Select label="Sección" value={form.category_id} onChange={(v) => set({ category_id: v })} options={categories.map((c) => ({ value: c.id, label: c.name?.es }))} placeholder="— Sin sección —" />
            <Select label="Evidencia" value={form.evidence} onChange={(v) => set({ evidence: v })} options={Object.entries(EVIDENCE_LABELS).map(([value, label]) => ({ value, label }))} hint={EVIDENCE_HELP[form.evidence]} />
            <div><EvidencePill level={form.evidence} /></div>
            <TextInput label="Firma" value={form.author_name} onChange={(v) => set({ author_name: v })} maxLength={120} placeholder="Redacción Leonida Records" />
            <Select label="Fuente" value={form.source_id} onChange={(v) => set({ source_id: v })} options={sourceOptions.map((s) => ({ value: s.id, label: s.label }))} placeholder="— Sin fuente —" />
            <TagInput value={form.tags} onChange={(v) => set({ tags: v })} />
            <EntityPicker label="Fichas en esta noticia" multiple options={entityOptions} value={form.entity_ids} onChange={(v) => set({ entity_ids: v })} typeLabels={TYPE_SINGULAR} />
          </section>

          {isAdmin && form.id && (
            <section className="card card--danger">
              <h2 className="card__title">Zona peligrosa</h2>
              <button type="button" className="abtn abtn--danger abtn--small" onClick={remove}>Eliminar noticia</button>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}


