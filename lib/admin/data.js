import 'server-only';
import { getSession } from '@/lib/auth';
import { filledLocales } from '@/lib/i18n';

// Admin reads use the signed-in user's client, so RLS decides what is visible
// (staff see drafts; pending users see nothing).

async function db() {
  const { supabase } = await getSession();
  if (!supabase) throw new Error('Supabase no está configurado');
  return supabase;
}
function ok({ data, error }, where) {
  if (error) throw new Error(`[admin] ${where}: ${error.message}`);
  return data;
}

const ENTITY_ROW = 'id,type,slug,status,title,short_description,hero_image,primary_source_id,published,featured,sort_order,updated_at,created_at';

export async function dashboardData() {
  const s = await db();
  const [ents, arts, media, sources, activity] = await Promise.all([
    s.from('entities').select('id,type,slug,title,short_description,description,hero_image,primary_source_id,published,updated_at'),
    s.from('articles').select('id,slug,title,excerpt,body,cover_image,published,published_at,updated_at'),
    s.from('media').select('id', { count: 'exact', head: true }),
    s.from('sources').select('id', { count: 'exact', head: true }),
    s.from('activity_log').select('*').order('created_at', { ascending: false }).limit(14),
  ]);
  const entities = ok(ents, 'entities');
  const articles = ok(arts, 'articles');
  const byType = {};
  for (const e of entities) {
    byType[e.type] ||= { published: 0, draft: 0 };
    byType[e.type][e.published ? 'published' : 'draft'] += 1;
  }
  const now = new Date().toISOString();
  const health = [];
  for (const e of entities) {
    // Names usually stay the same in every language (the title falls back to ES),
    // so an entity counts as translated when its summary exists in that language.
    const missing = ['en', 'pt', 'fr'].filter((l) => !filledLocales(e.short_description).includes(l));
    const issues = [];
    if (missing.length) issues.push(`Sin traducir: ${missing.join(', ').toUpperCase()}`);
    if (!e.hero_image) issues.push('Sin imagen');
    if (!e.primary_source_id && e.type !== 'theories') issues.push('Sin fuente');
    if (!filledLocales(e.short_description).includes('es')) issues.push('Sin resumen');
    if (issues.length) health.push({ kind: 'entity', id: e.id, title: e.title?.es || e.slug, type: e.type, published: e.published, issues });
  }
  for (const a of articles) {
    const missing = ['en', 'pt', 'fr'].filter((l) => !filledLocales(a.title).includes(l) || !filledLocales(a.body).includes(l));
    const issues = [];
    if (missing.length) issues.push(`Sin traducir: ${missing.join(', ').toUpperCase()}`);
    if (!a.cover_image) issues.push('Sin portada');
    if (!filledLocales(a.excerpt).includes('es')) issues.push('Sin entradilla');
    if (issues.length) health.push({ kind: 'article', id: a.id, title: a.title?.es || a.slug, type: 'news', published: a.published, issues });
  }
  health.sort((a, b) => Number(b.published) - Number(a.published) || b.issues.length - a.issues.length);
  return {
    byType,
    totals: {
      entities: entities.length,
      published: entities.filter((e) => e.published).length,
      drafts: entities.filter((e) => !e.published).length + articles.filter((a) => !a.published).length,
      articles: articles.length,
      articlesPublished: articles.filter((a) => a.published && a.published_at <= now).length,
      scheduled: articles.filter((a) => a.published && a.published_at > now).length,
      media: media.count || 0,
      sources: sources.count || 0,
    },
    activity: ok(activity, 'activity'),
    health: health.slice(0, 40),
    healthTotal: health.length,
  };
}

export async function listEntitiesAdmin() {
  const s = await db();
  return ok(await s.from('entities').select(ENTITY_ROW).order('updated_at', { ascending: false }).limit(5000), 'entities');
}

export async function getEntityAdmin(id) {
  const s = await db();
  const entity = ok(await s.from('entities').select('*').eq('id', id).maybeSingle(), 'entity');
  if (!entity) return null;
  const [facts, out, inc, media] = await Promise.all([
    s.from('facts').select('*').eq('entity_id', id).order('sort_order').order('created_at'),
    s.from('relations').select('id,relation_type,note,other:entities!relations_to_entity_id_fkey(id,type,slug,title,published)').eq('from_entity_id', id),
    s.from('relations').select('id,relation_type,note,other:entities!relations_from_entity_id_fkey(id,type,slug,title,published)').eq('to_entity_id', id),
    s.from('entity_media').select('sort_order, media:media(*)').eq('entity_id', id).order('sort_order'),
  ]);
  return {
    entity,
    facts: ok(facts, 'facts'),
    relations: [
      ...ok(out, 'rel.out').map((r) => ({ ...r, direction: 'out' })),
      ...ok(inc, 'rel.in').map((r) => ({ ...r, direction: 'in' })),
    ],
    media: ok(media, 'media').map((m) => m.media).filter(Boolean),
  };
}

export async function listArticlesAdmin() {
  const s = await db();
  return ok(await s.from('articles')
    .select('id,slug,title,excerpt,cover_image,evidence,published,published_at,featured,updated_at,author_name,category:categories(id,slug,name,color)')
    .order('updated_at', { ascending: false }).limit(5000), 'articles');
}

export async function getArticleAdmin(id) {
  const s = await db();
  const a = ok(await s.from('articles').select('*, article_entities(entity_id)').eq('id', id).maybeSingle(), 'article');
  if (!a) return null;
  return { ...a, entity_ids: (a.article_entities || []).map((x) => x.entity_id) };
}

export async function listMediaAdmin() {
  const s = await db();
  return ok(await s.from('media').select('*, entity_media(entity:entities(id,type,slug,title))').order('created_at', { ascending: false }).limit(2000), 'media');
}

export async function listSourcesAdmin() {
  const s = await db();
  return ok(await s.from('sources').select('*, entities(count), articles(count)').order('published_at', { ascending: false, nullsFirst: false }), 'sources');
}

export async function listCategoriesAdmin() {
  const s = await db();
  return ok(await s.from('categories').select('*, articles(count)').order('sort_order'), 'categories');
}

export async function listTimelineAdmin() {
  const s = await db();
  return ok(await s.from('timeline_events').select('*').order('event_date', { ascending: false }), 'timeline');
}

export async function listRelationsAdmin() {
  const s = await db();
  return ok(await s.from('relations')
    .select('id,relation_type,note,created_at,from:entities!relations_from_entity_id_fkey(id,type,slug,title),to:entities!relations_to_entity_id_fkey(id,type,slug,title)')
    .order('created_at', { ascending: false }).limit(3000), 'relations');
}

/** Lightweight option lists for pickers. */
export async function entityOptions() {
  const s = await db();
  const rows = ok(await s.from('entities').select('id,type,slug,title,hero_image,published').order('type').order('sort_order'), 'entityOptions');
  return rows.map((r) => ({ id: r.id, type: r.type, slug: r.slug, label: r.title?.es || r.slug, image: r.hero_image, published: r.published }));
}
export async function articleOptions() {
  const s = await db();
  const rows = ok(await s.from('articles').select('id,slug,title').order('published_at', { ascending: false, nullsFirst: true }), 'articleOptions');
  return rows.map((r) => ({ id: r.id, slug: r.slug, label: r.title?.es || r.slug }));
}
export async function sourceOptions() {
  const s = await db();
  const rows = ok(await s.from('sources').select('id,name,publisher').order('name'), 'sourceOptions');
  return rows.map((r) => ({ id: r.id, label: r.publisher ? `${r.name} · ${r.publisher}` : r.name }));
}

export async function listUsers() {
  const s = await db();
  return ok(await s.from('profiles').select('*').order('created_at'), 'users');
}

export async function getSettingsAdmin() {
  const s = await db();
  const rows = ok(await s.from('site_settings').select('key,value'), 'settings');
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
