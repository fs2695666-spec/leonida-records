import Link from 'next/link';
import { notFound } from 'next/navigation';
import '@/styles/public.css';
import { requireStaffPage, isStaffProfile } from '@/lib/auth';
import { getEntityAdmin } from '@/lib/admin/data';
import { normArticle, normEntity } from '@/lib/data/public';
import { LOCALES, isLocale } from '@/lib/i18n';
import { EntityView } from '@/components/site/EntityView';
import { ArticleView } from '@/components/site/ArticleView';

export const metadata = { title: 'Vista previa', robots: { index: false } };
export const dynamic = 'force-dynamic';

const CARD = 'id,type,slug,status,title,eyebrow,short_description,hero_image,hero_alt';

export default async function Preview({ params, searchParams }) {
  const { kind, id } = await params;
  const sp = await searchParams;
  const lang = isLocale(sp?.lang) ? sp.lang : 'es';
  const { supabase, profile } = await requireStaffPage();
  if (!isStaffProfile(profile) || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  let body = null;
  let editHref = '/admin';
  let published = false;

  if (kind === 'entity') {
    const data = await getEntityAdmin(id);
    if (!data) notFound();
    const { data: source } = data.entity.primary_source_id
      ? await supabase.from('sources').select('*').eq('id', data.entity.primary_source_id).maybeSingle()
      : { data: null };
    const entity = normEntity({ ...data.entity, source });
    const { data: srcRows } = await supabase.from('sources').select('*');
    const srcById = Object.fromEntries((srcRows || []).map((s) => [s.id, s]));
    const detail = {
      facts: data.facts.map((f) => ({ id: f.id, title: f.title, body: f.body, status: f.status, timestamp: f.timestamp_text, source: srcById[f.source_id] ? { name: srcById[f.source_id].name, url: srcById[f.source_id].url } : null })),
      relations: data.relations.filter((r) => r.other).map((r) => ({ id: r.id, type: r.relation_type, note: r.note, direction: r.direction, entity: normEntity(r.other) })),
      media: data.media.map((m) => ({ id: m.id, url: m.url, alt: m.alt_text, caption: m.caption, credit: m.credit })),
      articles: [],
    };
    body = <EntityView entity={entity} detail={detail} lang={lang} />;
    editHref = `/admin/content/${id}`;
    published = data.entity.published;
  } else if (kind === 'article') {
    const { data: row } = await supabase.from('articles')
      .select(`*, category:categories(id,slug,name,color), source:sources(*), article_entities(entity:entities(${CARD}))`)
      .eq('id', id).maybeSingle();
    if (!row) notFound();
    body = <ArticleView article={normArticle(row)} lang={lang} />;
    editHref = `/admin/news/${id}`;
    published = row.published;
  } else notFound();

  return (
    <div className="preview-shell">
      <div className="preview-bar" role="status">
        <strong>Vista previa</strong>
        <span>{published ? 'Publicado — así se ve en la web.' : 'Borrador — solo lo ve el equipo editorial.'}</span>
        <nav aria-label="Idioma de la vista previa">
          {LOCALES.map((l) => <Link key={l} href={`?lang=${l}`} aria-current={l === lang ? 'true' : undefined}>{l.toUpperCase()}</Link>)}
        </nav>
        <Link href={editHref} className="abtn abtn--small">Volver al editor</Link>
      </div>
      <div lang={lang}>{body}</div>
    </div>
  );
}
