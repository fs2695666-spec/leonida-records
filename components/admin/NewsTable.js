'use client';
import Link from 'next/link';
import { DataTable } from './DataTable';
import { EvidencePill, LangDots, StatusPill } from './ui';
import { RelTime } from './RelTime';
import { deleteArticles, setArticlesFeatured, setArticlesPublished } from '@/app/admin/_actions/articles';

export function NewsTable({ rows, categories, isAdmin, initial }) {
  const now = new Date().toISOString();
  const columns = [
    { key: 'title', label: 'Titular', sort: (r) => r.title?.es || r.slug, render: (r) => (
      <Link href={`/admin/news/${r.id}`} className="dt__title">
        <span className="dt__thumb dt__thumb--wide">{r.cover_image ? <img src={r.cover_image} alt="" loading="lazy" /> : null}</span>
        <span><strong>{r.title?.es || r.slug}</strong>{r.featured && <span className="star" title="Destacada">★</span>}<small>{r.author_name || 'Sin firma'}</small></span>
      </Link>
    ) },
    { key: 'category', label: 'Sección', sort: (r) => r.category?.name?.es || '', render: (r) => r.category ? <span className="cat-tag" data-color={r.category.color}>{r.category.name?.es}</span> : <span className="muted">—</span>, className: 'hide-s' },
    { key: 'evidence', label: 'Evidencia', sort: (r) => r.evidence, render: (r) => <EvidencePill level={r.evidence} />, className: 'hide-s' },
    { key: 'i18n', label: 'Idiomas', render: (r) => <LangDots value={r.title} />, className: 'hide-s' },
    { key: 'published', label: 'Estado', sort: (r) => (r.published ? (r.published_at > now ? 1 : 2) : 0), render: (r) => <StatusPill published={r.published} publishedAt={r.published_at} /> },
    { key: 'date', label: 'Fecha', sort: (r) => r.published_at || r.updated_at, render: (r) => (r.published_at ? new Date(r.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : <RelTime iso={r.updated_at} />), className: 'hide-s' },
    { key: 'go', label: '', className: 'dt__actions', render: (r) => (
      <span className="row-actions">
        <Link className="abtn abtn--small" href={`/admin/news/${r.id}`}>Editar</Link>
        {r.published && r.published_at <= now
          ? <a className="abtn abtn--small abtn--ghost" href={`/noticias/${r.slug}`} target="_blank" rel="noopener noreferrer" title="Ver en la web">↗</a>
          : <a className="abtn abtn--small abtn--ghost" href={`/admin/preview/article/${r.id}`} target="_blank" rel="noopener noreferrer" title="Vista previa">👁</a>}
      </span>
    ) },
  ];
  return (
    <DataTable
      rows={rows}
      columns={columns}
      initial={initial}
      defaultSort={{ key: 'date', dir: 'desc' }}
      searchText={(r) => `${Object.values(r.title || {}).join(' ')} ${r.slug} ${r.author_name || ''}`}
      searchPlaceholder="Buscar titular, slug o autor…"
      filters={[
        { key: 'category', label: 'Sección', options: categories.map((c) => ({ value: c.id, label: c.name?.es })), test: (r, v) => r.category?.id === v },
        { key: 'state', label: 'Estado', options: [{ value: 'published', label: 'Publicadas' }, { value: 'scheduled', label: 'Programadas' }, { value: 'draft', label: 'Borradores' }, { value: 'featured', label: 'Destacadas' }],
          test: (r, v) => (v === 'published' ? r.published && r.published_at <= now : v === 'scheduled' ? r.published && r.published_at > now : v === 'draft' ? !r.published : r.featured) },
      ]}
      bulkActions={[
        { label: 'Publicar', run: (ids) => setArticlesPublished(ids, true), success: (n) => `${n} publicadas` },
        { label: 'Despublicar', run: (ids) => setArticlesPublished(ids, false), success: (n) => `${n} pasadas a borrador` },
        { label: 'Destacar', run: (ids) => setArticlesFeatured(ids, true), success: () => 'Destacadas' },
        { label: 'Quitar destacado', run: (ids) => setArticlesFeatured(ids, false), success: () => 'Hecho' },
        ...(isAdmin ? [{ label: 'Eliminar', danger: true, run: (ids) => deleteArticles(ids), success: (n) => `${n} eliminadas`,
          confirm: { title: (n) => `¿Eliminar ${n} noticia${n === 1 ? '' : 's'}?`, message: 'Desaparecerán de la web y de la hemeroteca. No se puede deshacer.' } }] : []),
      ]}
      rowHref={(r) => `/admin/news/${r.id}`}
      emptyTitle="The Leonida Times está en blanco"
      emptyText="Escribe la primera noticia: aparecerá en la portada y en /noticias en cuanto la publiques."
      emptyAction={<Link className="abtn abtn--primary" href="/admin/news/new">Escribir noticia</Link>}
    />
  );
}
