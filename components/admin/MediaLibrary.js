'use client';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Drawer, EmptyState, Spinner, formatBytes, useAction, useConfirm, useToast } from './ui';
import { TextInput } from './fields';
import { RelTime } from './RelTime';
import { ACCEPT, uploadFiles } from './upload';
import { deleteMedia, registerMedia, updateMedia } from '@/app/admin/_actions/library';

const SORTS = {
  new: (a, b) => b.created_at.localeCompare(a.created_at),
  old: (a, b) => a.created_at.localeCompare(b.created_at),
  big: (a, b) => (b.size_bytes || 0) - (a.size_bytes || 0),
  name: (a, b) => (a.alt_text || a.url).localeCompare(b.alt_text || b.url, 'es'),
};

export function MediaLibrary({ rows }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [run, busy] = useAction();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [usage, setUsage] = useState('');
  const [sort, setSort] = useState('new');
  const [sel, setSel] = useState(new Set());
  const [detail, setDetail] = useState(null);
  const [uploading, setUploading] = useState('');
  const [drag, setDrag] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const fileRef = useRef(null);

  const shown = useMemo(() => {
    const n = q.toLowerCase();
    return rows
      .filter((m) => (!kind || m.kind === kind)
        && (!usage || (usage === 'unused' ? !m.entity_media?.length : m.entity_media?.length))
        && (!n || `${m.alt_text} ${m.caption} ${m.credit} ${m.url}`.toLowerCase().includes(n)))
      .sort(SORTS[sort]);
  }, [rows, q, kind, usage, sort]);

  const totalSize = rows.reduce((s, m) => s + (m.size_bytes || 0), 0);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(`Subiendo 0 de ${files.length}…`);
    try {
      const { saved, errors } = await uploadFiles(files, { onProgress: (d, t) => setUploading(`Subiendo ${d} de ${t}…`) });
      errors.forEach((e) => toast(e, 'error'));
      if (saved.length) { toast(saved.length === 1 ? 'Archivo subido' : `${saved.length} archivos subidos`); router.refresh(); }
    } catch (e) {
      toast(e.message, 'error');
    } finally { setUploading(''); }
  };

  const addUrl = async () => {
    if (!/^https?:\/\/\S+$/i.test(urlDraft.trim())) { toast('URL no válida', 'error'); return; }
    if (await run(registerMedia([{ url: urlDraft.trim(), kind: /\.(mp4|webm)(\?|$)/i.test(urlDraft) ? 'video' : 'image', alt_text: '', caption: '', credit: '' }]), 'Añadido a la biblioteca')) setUrlDraft('');
  };

  const removeMany = async (ids) => {
    const used = rows.filter((m) => ids.includes(m.id) && m.entity_media?.length).length;
    if (!(await confirm({ title: `¿Eliminar ${ids.length} archivo${ids.length === 1 ? '' : 's'}?`, message: `${used ? `${used} se usan en galerías de fichas. ` : ''}Los archivos subidos se borran del almacenamiento. Si alguna ficha o noticia usa la URL como portada, dejará de verse.`, confirmLabel: 'Eliminar', danger: true }))) return;
    if (await run(deleteMedia(ids), 'Eliminado')) { setSel(new Set()); setDetail(null); }
  };

  const toggle = (id) => { const n = new Set(sel); if (n.has(id)) n.delete(id); else n.add(id); setSel(n); };

  return (
    <div
      className="medialib"
      data-drag={drag || undefined}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDrag(false); }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
    >
      <div className="dropzone" role="button" tabIndex={0} onClick={() => fileRef.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}>
        {uploading ? <><Spinner /> <strong>{uploading}</strong></> : <><strong>Arrastra imágenes o vídeos aquí</strong><span>o haz clic para elegir · JPG, PNG, WebP, AVIF, GIF, MP4, WebM · máx. 15 MB</span></>}
        <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      </div>
      <div className="toolbar">
        <input className="input" placeholder="…o pega una URL externa (https://)" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addUrl()} />
        <button type="button" className="abtn" onClick={addUrl} disabled={!urlDraft || busy}>Añadir URL</button>
      </div>

      <div className="dt__bar">
        <div className="dt__search"><input type="search" className="input" placeholder="Buscar por texto alternativo, pie, crédito…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" /></div>
        <select className="input dt__filter" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Tipo">
          <option value="">Imágenes y vídeos</option><option value="image">Imágenes</option><option value="video">Vídeos</option>
        </select>
        <select className="input dt__filter" value={usage} onChange={(e) => setUsage(e.target.value)} aria-label="Uso">
          <option value="">Todos</option><option value="used">En galerías</option><option value="unused">Sin usar en galerías</option>
        </select>
        <select className="input dt__filter" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
          <option value="new">Más recientes</option><option value="old">Más antiguos</option><option value="big">Más pesados</option><option value="name">Por nombre</option>
        </select>
        <span className="dt__count tnum">{shown.length} archivos · {formatBytes(totalSize)} subidos</span>
      </div>

      {sel.size > 0 && (
        <div className="dt__bulk">
          <strong className="tnum">{sel.size} seleccionados</strong>
          <button type="button" className="abtn abtn--small abtn--danger" onClick={() => removeMany([...sel])} disabled={busy}>Eliminar</button>
          <button type="button" className="abtn abtn--small abtn--ghost" onClick={() => setSel(new Set())}>Deseleccionar</button>
        </div>
      )}

      {shown.length === 0 ? <EmptyState title={rows.length ? 'Nada coincide' : 'La biblioteca está vacía'}>{rows.length ? 'Cambia los filtros.' : 'Sube tus primeras imágenes: podrás reutilizarlas en fichas, noticias y galerías.'}</EmptyState> : (
        <ul className="media-grid">
          {shown.map((m) => (
            <li key={m.id} data-selected={sel.has(m.id) || undefined}>
              <button type="button" className="media-grid__thumb" onClick={() => setDetail(m)} aria-label={`Detalles de ${m.alt_text || 'archivo'}`}>
                {m.kind === 'video' ? <video src={m.url} muted preload="metadata" /> : <img src={m.url} alt={m.alt_text || ''} loading="lazy" />}
                {m.kind === 'video' && <span className="media-grid__badge">Vídeo</span>}
                {!m.storage_path && <span className="media-grid__badge media-grid__badge--ext">URL</span>}
              </button>
              <label className="media-grid__check"><input type="checkbox" checked={sel.has(m.id)} onChange={() => toggle(m.id)} /><span className="sr-only">Seleccionar</span></label>
              <p className="media-grid__cap">{m.alt_text || m.caption || <span className="muted">Sin texto alternativo</span>}</p>
            </li>
          ))}
        </ul>
      )}

      {detail && <MediaDetail item={detail} onClose={() => setDetail(null)} onDelete={() => removeMany([detail.id])} />}
    </div>
  );
}

function MediaDetail({ item, onClose, onDelete }) {
  const [form, setForm] = useState({ alt_text: item.alt_text || '', caption: item.caption || '', credit: item.credit || '' });
  const [run, busy] = useAction();
  const toast = useToast();
  const save = async () => { if (await run(updateMedia(item.id, form), 'Guardado')) onClose(); };
  const copy = async () => { try { await navigator.clipboard.writeText(item.url); toast('URL copiada'); } catch { toast('No se pudo copiar', 'error'); } };
  return (
    <Drawer title="Detalles del archivo" onClose={onClose} size="l" footer={<>
      <button type="button" className="abtn abtn--danger abtn--small" onClick={onDelete} disabled={busy}>Eliminar</button>
      <span className="spacer" />
      <button type="button" className="abtn" onClick={onClose}>Cerrar</button>
      <button type="button" className="abtn abtn--primary" onClick={save} disabled={busy}>Guardar</button>
    </>}>
      <div className="media-detail__preview">
        {item.kind === 'video' ? <video src={item.url} controls /> : <img src={item.url} alt={item.alt_text || ''} />}
      </div>
      <dl className="media-detail__meta">
        <div><dt>Tipo</dt><dd>{item.mime_type || item.kind}</dd></div>
        <div><dt>Tamaño</dt><dd>{formatBytes(item.size_bytes)}</dd></div>
        <div><dt>Dimensiones</dt><dd>{item.width && item.height ? `${item.width} × ${item.height}` : '—'}</dd></div>
        <div><dt>Subido</dt><dd><RelTime iso={item.created_at} /></dd></div>
        <div className="wide"><dt>Origen</dt><dd>{item.storage_path ? `Storage · ${item.storage_path}` : 'URL externa'}</dd></div>
      </dl>
      <div className="input-group"><input className="input" readOnly value={item.url} aria-label="URL" /><button type="button" className="abtn abtn--small" onClick={copy}>Copiar URL</button></div>
      <TextInput label="Texto alternativo" hint="Describe la imagen para lectores de pantalla y buscadores." value={form.alt_text} onChange={(v) => setForm((f) => ({ ...f, alt_text: v }))} maxLength={300} />
      <TextInput label="Pie de foto" value={form.caption} onChange={(v) => setForm((f) => ({ ...f, caption: v }))} maxLength={300} />
      <TextInput label="Crédito" value={form.credit} onChange={(v) => setForm((f) => ({ ...f, credit: v }))} placeholder="Rockstar Games" maxLength={160} />
      <div className="field">
        <p className="field__label">Usado en galerías</p>
        {item.entity_media?.length ? (
          <ul className="picked">{item.entity_media.map((l) => l.entity && <li key={l.entity.id}><Link href={`/admin/content/${l.entity.id}`}>{l.entity.title?.es}</Link></li>)}</ul>
        ) : <p className="muted">Ninguna. Añádelo desde la pestaña Media de una ficha.</p>}
      </div>
    </Drawer>
  );
}
