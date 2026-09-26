import Link from 'next/link';
import { dashboardData } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { ENTITY_TYPES } from '@/lib/i18n';
import { TYPE_LABELS } from '@/components/admin/labels';
import { RelTime } from '@/components/admin/RelTime';

export const metadata = { title: 'Panel' };

const ACTION = { insert: 'creó', update: 'editó', delete: 'eliminó', publish: 'publicó', unpublish: 'despublicó' };
const TABLE = { entities: 'la ficha', articles: 'la noticia', media: 'el archivo', sources: 'la fuente', timeline_events: 'el evento', site_settings: 'el ajuste' };

function activityHref(a) {
  if (a.action === 'delete' || !a.record_id) return null;
  if (a.table_name === 'entities') return `/admin/content/${a.record_id}`;
  if (a.table_name === 'articles') return `/admin/news/${a.record_id}`;
  if (a.table_name === 'media') return '/admin/media';
  if (a.table_name === 'sources') return '/admin/sources';
  if (a.table_name === 'timeline_events') return '/admin/timeline';
  return null;
}

export default async function Dashboard({ searchParams }) {
  const sp = await searchParams;
  const { profile } = await getSession();
  const d = await dashboardData();
  const hour = new Date().getHours();
  const hello = hour < 13 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches';
  const name = (profile?.display_name || '').split(' ')[0];

  return (
    <div className="page">
      <PageHeader
        title={`${hello}${name ? `, ${name}` : ''}`}
        lead="Estado del archivo y de The Leonida Times."
        actions={<>
          <Link className="abtn" href="/admin/news/new">Escribir noticia</Link>
          <Link className="abtn abtn--primary" href="/admin/content/new">Nueva ficha</Link>
        </>}
      />
      {sp?.denied && <p className="notice notice--warn">Esa sección es solo para administradores.</p>}

      <section className="stats" aria-label="Resumen">
        <Link href="/admin/content" className="stat stat--pink"><span className="stat__n tnum">{d.totals.entities}</span><span>Fichas</span><small>{d.totals.published} publicadas</small></Link>
        <Link href="/admin/news" className="stat stat--pool"><span className="stat__n tnum">{d.totals.articles}</span><span>Noticias</span><small>{d.totals.articlesPublished} publicadas{d.totals.scheduled ? ` · ${d.totals.scheduled} programadas` : ''}</small></Link>
        <Link href="/admin/content?state=draft" className="stat stat--sun"><span className="stat__n tnum">{d.totals.drafts}</span><span>Borradores</span><small>fichas + noticias</small></Link>
        <Link href="/admin/media" className="stat stat--lav"><span className="stat__n tnum">{d.totals.media}</span><span>Archivos</span><small>{d.totals.sources} fuentes</small></Link>
      </section>

      <div className="dash-grid">
        <section className="card">
          <header className="card__head"><h2>Por tipo</h2><Link href="/admin/content" className="link-s">Ver todo</Link></header>
          <table className="mini-table">
            <thead><tr><th>Tipo</th><th className="num">Publicadas</th><th className="num">Borradores</th><th /></tr></thead>
            <tbody>
              {ENTITY_TYPES.map((t) => (
                <tr key={t}>
                  <td><Link href={`/admin/content?type=${t}`}>{TYPE_LABELS[t]}</Link></td>
                  <td className="num tnum">{d.byType[t]?.published || 0}</td>
                  <td className="num tnum">{d.byType[t]?.draft || 0}</td>
                  <td className="num"><Link className="link-s" href={`/admin/content/new?type=${t}`}>+ Añadir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <header className="card__head"><h2>Actividad reciente</h2></header>
          {d.activity.length === 0 ? <p className="muted">Todavía no hay actividad registrada.</p> : (
            <ol className="activity">
              {d.activity.map((a) => {
                const h = activityHref(a);
                const label = a.label || '(sin título)';
                return (
                  <li key={a.id} data-action={a.action}>
                    <span className="activity__dot" aria-hidden="true" />
                    <p>
                      <strong>{a.actor_name || 'Alguien'}</strong> {ACTION[a.action] || a.action} {TABLE[a.table_name] || a.table_name}{' '}
                      {h ? <Link href={h}>{label}</Link> : <em>{label}</em>}
                    </p>
                    <RelTime iso={a.created_at} />
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="card card--wide">
          <header className="card__head">
            <h2>Salud del contenido</h2>
            <span className="muted">{d.healthTotal} elementos con algo pendiente</span>
          </header>
          {d.health.length === 0 ? <p className="notice notice--ok">Todo está traducido, con imagen y con fuente. 🌴</p> : (
            <ul className="health">
              {d.health.map((h) => (
                <li key={`${h.kind}-${h.id}`}>
                  <Link href={h.kind === 'entity' ? `/admin/content/${h.id}` : `/admin/news/${h.id}`}>
                    <span className="health__title">{h.title}</span>
                    <span className="health__type">{TYPE_LABELS[h.type] || h.type}{!h.published && ' · borrador'}</span>
                    <span className="health__issues">{h.issues.map((i) => <span key={i} className="chip-s">{i}</span>)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {isAdminProfile(profile) && (
        <p className="dash-foot muted">Consejo: los usuarios nuevos entran sin permisos hasta que les asignas un rol en <Link href="/admin/settings/users">Usuarios</Link>.</p>
      )}
    </div>
  );
}
