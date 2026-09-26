'use client';
import Link from 'next/link';
import { DataTable } from './DataTable';
import { EvidencePill, LangDots, StatusPill } from './ui';
import { RelTime } from './RelTime';
import { EVIDENCE_LABELS, TYPE_LABELS } from './labels';
import { deleteEntities, setEntitiesFeatured, setEntitiesPublished } from '@/app/admin/_actions/content';

export function ContentTable({ rows, isAdmin, initial }) {
  const columns = [
    { key: 'title', label: 'Ficha', sort: (r) => r.title?.es || r.slug, render: (r) => (
      <Link href={`/admin/content/${r.id}`} className="dt__title">
        <span className="dt__thumb">{r.hero_image ? <img src={r.hero_image} alt="" loading="lazy" /> : null}</span>
        <span><strong>{r.title?.es || r.slug}</strong>{r.featured && <span className="star" title="Destacada">★</span>}<small>/{r.type}/{r.slug}</small></span>
      </Link>
    ) },
    { key: 'type', label: 'Tipo', sort: (r) => r.type, render: (r) => TYPE_LABELS[r.type] },
    { key: 'status', label: 'Evidencia', sort: (r) => r.status, render: (r) => <EvidencePill level={r.status} />, className: 'hide-s' },
    { key: 'i18n', label: 'Idiomas', render: (r) => <LangDots value={r.short_description} />, className: 'hide-s' },
    { key: 'published', label: 'Estado', sort: (r) => Number(r.published), render: (r) => <StatusPill published={r.published} /> },
    { key: 'updated', label: 'Editado', sort: (r) => r.updated_at, render: (r) => <RelTime iso={r.updated_at} />, className: 'hide-s' },
    { key: 'go', label: '', className: 'dt__actions', render: (r) => (
      <span className="row-actions">
        <Link className="abtn abtn--small" href={`/admin/content/${r.id}`}>Editar</Link>
        {r.published
          ? <a className="abtn abtn--small abtn--ghost" href={`/${r.type}/${r.slug}`} target="_blank" rel="noopener noreferrer" title="Ver en la web">↗</a>
          : <a className="abtn abtn--small abtn--ghost" href={`/admin/preview/entity/${r.id}`} target="_blank" rel="noopener noreferrer" title="Vista previa">👁</a>}
      </span>
    ) },
  ];
  const bulk = [
    { label: 'Publicar', run: (ids) => setEntitiesPublished(ids, true), success: (n) => `${n} publicadas` },
    { label: 'Despublicar', run: (ids) => setEntitiesPublished(ids, false), success: (n) => `${n} pasadas a borrador` },
    { label: 'Destacar', run: (ids) => setEntitiesFeatured(ids, true), success: (n) => `${n} destacadas` },
    { label: 'Quitar destacado', run: (ids) => setEntitiesFeatured(ids, false), success: () => 'Hecho' },
    ...(isAdmin ? [{
      label: 'Eliminar', danger: true, run: (ids) => deleteEntities(ids), success: (n) => `${n} eliminadas`,
      confirm: { title: (n) => `¿Eliminar ${n} ficha${n === 1 ? '' : 's'}?`, message: 'Se borrarán también sus datos, relaciones y vínculos de galería. No se puede deshacer.' },
    }] : []),
  ];
  return (
    <DataTable
      rows={rows}
      columns={columns}
      initial={initial}
      searchText={(r) => `${Object.values(r.title || {}).join(' ')} ${r.slug}`}
      searchPlaceholder="Buscar por título (cualquier idioma) o slug…"
      filters={[
        { key: 'type', label: 'Tipo', options: Object.entries(TYPE_LABELS).filter(([k]) => k !== 'news').map(([value, label]) => ({ value, label })), test: (r, v) => r.type === v },
        { key: 'state', label: 'Estado', options: [{ value: 'published', label: 'Publicadas' }, { value: 'draft', label: 'Borradores' }, { value: 'featured', label: 'Destacadas' }],
          test: (r, v) => (v === 'published' ? r.published : v === 'draft' ? !r.published : r.featured) },
        { key: 'evidence', label: 'Evidencia', options: Object.entries(EVIDENCE_LABELS).map(([value, label]) => ({ value, label })), test: (r, v) => r.status === v },
        { key: 'missing', label: 'Pendiente', options: [{ value: 'translation', label: 'Falta traducir' }, { value: 'image', label: 'Sin imagen' }, { value: 'source', label: 'Sin fuente' }],
          test: (r, v) => (v === 'image' ? !r.hero_image : v === 'source' ? !r.primary_source_id : ['en', 'pt', 'fr'].some((l) => !r.short_description?.[l])) },
      ]}
      bulkActions={bulk}
      rowHref={(r) => `/admin/content/${r.id}`}
      emptyTitle="Aún no hay fichas"
      emptyText="Crea la primera ficha del archivo o importa el contenido inicial con supabase/seed.sql."
      emptyAction={<Link className="abtn abtn--primary" href="/admin/content/new">Nueva ficha</Link>}
    />
  );
}
