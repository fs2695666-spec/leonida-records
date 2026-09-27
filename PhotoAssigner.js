'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EvidencePill, useAction } from './ui';
import { MediaPicker } from './MediaPicker';
import { TYPE_LABELS } from './labels';
import { setEntityImage } from '@/app/admin/_actions/content';

const label = (r) => r.title?.en || r.title?.es || r.slug;

export function PhotoAssigner({ rows, initialType }) {
  const [items, setItems] = useState(rows);
  const [type, setType] = useState(initialType);
  const [show, setShow] = useState('missing');
  const [q, setQ] = useState('');
  const [picking, setPicking] = useState(null);
  const [urls, setUrls] = useState({});
  const [run, busy] = useAction();

  const shown = useMemo(() => items
    .filter((r) => (!type || r.type === type) && (show === 'all' || !r.hero_image) && (!q || label(r).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => label(a).localeCompare(label(b), 'es')), [items, type, show, q]);
  const missing = items.filter((r) => (!type || r.type === type) && !r.hero_image).length;

  const assign = async (row, url, alt) => {
    const res = await run(setEntityImage(row.id, url, alt || label(row)), url ? `Foto puesta en ${label(row)}` : 'Foto quitada', { refresh: false });
    if (res) {
      setItems((list) => list.map((r) => (r.id === row.id ? { ...r, hero_image: res.hero_image } : r)));
      setUrls((u) => ({ ...u, [row.id]: '' }));
    }
  };

  return (
    <>
      <div className="dt__bar">
        <div className="dt__search"><input className="input" type="search" placeholder="Buscar ficha…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" /></div>
        <select className="input dt__filter" value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo">
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_LABELS).filter(([k]) => k !== 'news').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input dt__filter" value={show} onChange={(e) => setShow(e.target.value)} aria-label="Mostrar">
          <option value="missing">Solo sin foto</option>
          <option value="all">Todas</option>
        </select>
        <span className="dt__count tnum">{missing} sin foto</span>
      </div>

      {shown.length === 0 ? (
        <div className="empty"><div className="empty__art" aria-hidden="true" /><h3>Todas tienen foto</h3><p>No queda ninguna ficha de este tipo sin imagen.</p></div>
      ) : (
        <ul className="photo-list">
          {shown.map((r) => (
            <li key={r.id}>
              <span className="photo-list__thumb">{r.hero_image ? <img src={r.hero_image} alt="" loading="lazy" /> : <span aria-hidden="true">＋</span>}</span>
              <span className="photo-list__info">
                <Link href={`/admin/content/${r.id}`}><strong>{label(r)}</strong></Link>
                <small>{TYPE_LABELS[r.type]} · <EvidencePill level={r.status} /></small>
              </span>
              <span className="photo-list__actions">
                <button type="button" className="abtn abtn--small abtn--primary" disabled={busy} onClick={() => setPicking(r)}>Elegir o subir</button>
                <span className="input-group">
                  <input className="input input--s" placeholder="…o pega una URL https://" value={urls[r.id] || ''} onChange={(e) => setUrls((u) => ({ ...u, [r.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && urls[r.id] && assign(r, urls[r.id].trim())} />
                  <button type="button" className="abtn abtn--small" disabled={busy || !urls[r.id]} onClick={() => assign(r, urls[r.id].trim())}>Poner</button>
                </span>
                {r.hero_image && <button type="button" className="abtn abtn--small abtn--ghost" disabled={busy} onClick={() => assign(r, '', '')}>Quitar</button>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {picking && (
        <MediaPicker
          title={`Foto para ${label(picking)}`}
          onClose={() => setPicking(null)}
          onPick={([m]) => assign(picking, m.url, m.alt_text || label(picking))}
        />
      )}
    </>
  );
}
