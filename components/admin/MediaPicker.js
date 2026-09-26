'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Spinner, useToast } from './ui';
import { listMediaForPicker, registerMedia } from '@/app/admin/_actions/library';
import { ACCEPT, uploadFiles } from './upload';

/**
 * Pick one or many items from the media library, upload new files, or paste a URL.
 * onPick receives media rows ({id,url,alt_text,caption,credit,...}).
 */
export function MediaPicker({ onClose, onPick, multiple = false, kind = 'image', title = 'Biblioteca de medios' }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState([]);
  const [busy, setBusy] = useState('');
  const [url, setUrl] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    const res = await listMediaForPicker();
    if (res.ok) setItems(res.data);
    else { toast(res.error, 'error'); setItems([]); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    const n = (s) => (s || '').toLowerCase();
    return (items || []).filter((m) => (!kind || m.kind === kind) && (!q || n(`${m.alt_text} ${m.caption} ${m.credit} ${m.url}`).includes(n(q))));
  }, [items, q, kind]);

  const toggle = (m) => {
    if (!multiple) { onPick([m]); onClose(); return; }
    setSel((s) => (s.some((x) => x.id === m.id) ? s.filter((x) => x.id !== m.id) : [...s, m]));
  };

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(`Subiendo 0/${files.length}…`);
    try {
      const { saved, errors } = await uploadFiles(files, { onProgress: (d, t) => setBusy(`Subiendo ${d}/${t}…`) });
      errors.forEach((e) => toast(e, 'error'));
      if (saved.length) {
        toast(saved.length === 1 ? 'Archivo subido' : `${saved.length} archivos subidos`);
        setItems((it) => [...saved, ...(it || [])]);
        if (!multiple && saved.length === 1) { onPick(saved); onClose(); return; }
        setSel((s) => [...s, ...saved]);
      }
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy('');
    }
  };

  const addUrl = async () => {
    if (!/^https?:\/\/\S+$/i.test(url.trim())) { toast('Pega una URL que empiece por https://', 'error'); return; }
    setBusy('Añadiendo…');
    const res = await registerMedia([{ url: url.trim(), kind, alt_text: '', caption: '', credit: '' }]);
    setBusy('');
    if (!res.ok) { toast(res.error, 'error'); return; }
    setUrl('');
    setItems((it) => [...res.data, ...(it || [])]);
    if (!multiple) { onPick(res.data); onClose(); } else setSel((s) => [...s, ...res.data]);
  };

  return (
    <Modal title={title} onClose={onClose} size="l"
      footer={multiple ? (
        <>
          <span className="muted">{sel.length} seleccionados</span>
          <button type="button" className="abtn" onClick={onClose}>Cancelar</button>
          <button type="button" className="abtn abtn--primary" disabled={!sel.length} onClick={() => { onPick(sel); onClose(); }}>Insertar</button>
        </>
      ) : null}>
      <div className="picker__bar">
        <input className="input" type="search" placeholder="Buscar por texto alternativo, pie o crédito…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="abtn abtn--primary" onClick={() => fileRef.current?.click()} disabled={Boolean(busy)}>Subir archivos</button>
        <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      </div>
      <div className="picker__url">
        <input className="input" placeholder="…o pega la URL de una imagen (https://)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())} />
        <button type="button" className="abtn" onClick={addUrl} disabled={!url || Boolean(busy)}>Añadir URL</button>
      </div>
      {busy && <p className="picker__busy"><Spinner /> {busy}</p>}
      <div
        className="picker__grid"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
      >
        {items === null && Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton picker__skel" />)}
        {items && shown.length === 0 && <p className="muted picker__empty">No hay archivos. Arrastra aquí tus imágenes para subirlas.</p>}
        {shown.map((m) => {
          const on = sel.some((x) => x.id === m.id);
          return (
            <button key={m.id} type="button" className="picker__item" aria-pressed={on} onClick={() => toggle(m)} title={m.alt_text || m.caption}>
              {m.kind === 'video' ? <video src={m.url} muted preload="metadata" /> : <img src={m.url} alt={m.alt_text || ''} loading="lazy" />}
              {on && <span className="picker__check">✓</span>}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
