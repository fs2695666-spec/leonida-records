import 'server-only';
import { cache } from 'react';
import { publicClient } from '@/lib/supabase/public';
import * as demo from '@/lib/data/demo';

// Public read layer. Every function returns normalized objects whose text fields
// are still localized ({es,en,pt,fr}); pages pick the language with `pick()`.
// When Supabase isn't configured the read-only demo dataset is used instead.

const ENTITY_LIST_COLS = 'id,type,slug,status,title,eyebrow,short_description,hero_image,hero_alt,video_url,tags,featured,published_at,updated_at,metadata,primary_source_id,sort_order';
const ENTITY_CARD_COLS = 'id,type,slug,status,title,eyebrow,short_description,hero_image,hero_alt';
const ARTICLE_LIST_COLS = 'id,slug,title,excerpt,cover_image,cover_alt,cover_caption,author_name,evidence,published_at,updated_at,featured,tags,category:categories(id,slug,name,color)';

function fail(error, where) {
  if (error) {
    const e = new Error(`[data] ${where}: ${error.message}`);
    e.cause = error;
    throw e;
  }
}

export function normEntity(r) {
  if (!r) return null;
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    status: r.status,
    title: r.title || {},
    eyebrow: r.eyebrow || {},
    short: r.short_description || {},
    description: r.description || {},
    quote: r.quote || {},
    image: r.hero_image || null,
    imageAlt: r.hero_alt || '',
    videoUrl: r.video_url || null,
    tags: r.tags || [],
    featured: Boolean(r.featured),
    sourceId: r.primary_source_id || null,
    source: r.source ? normSource(r.source) : null,
    publishedAt: r.published_at || null,
    updatedAt: r.updated_at || null,
    map: r.metadata?.map || null,
    releaseDate: typeof r.metadata?.release_date === 'string' ? r.metadata.release_date : null,
    sortOrder: r.sort_order ?? 0,
  };
}

export function normSource(s) {
  if (!s) return null;
  return { id: s.id, name: s.name, publisher: s.publisher || '', kind: s.kind || '', url: s.url, publishedAt: s.published_at || null, notes: s.notes || '' };
}

export function normArticle(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title || {},
    excerpt: r.excerpt || {},
    body: r.body || {},
    seoTitle: r.seo_title || {},
    seoDescription: r.seo_description || {},
    category: r.category ? { id: r.category.id, slug: r.category.slug, name: r.category.name || {}, color: r.category.color } : null,
    tags: r.tags || [],
    image: r.cover_image || null,
    imageAlt: r.cover_alt || '',
    caption: r.cover_caption || '',
    author: r.author_name || '',
    evidence: r.evidence || 'REPORTED',
    source: r.source ? normSource(r.source) : null,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
    featured: Boolean(r.featured),
    entities: (r.article_entities || []).map((x) => normEntity(x.entity)).filter(Boolean),
  };
}

function normMedia(m) {
  return {
    id: m.id,
    url: m.url,
    kind: m.kind,
    alt: m.alt_text || '',
    caption: m.caption || '',
    credit: m.credit || '',
    width: m.width || null,
    height: m.height || null,
    createdAt: m.created_at,
    links: (m.entity_media || []).map((l) => l.entity).filter(Boolean).map((e) => ({ type: e.type, slug: e.slug, title: e.title })),
  };
}

// ---------------------------------------------------------------------------

export const getSettings = cache(async () => {
  const db = publicClient();
  if (!db) return demo.settings();
  const { data, error } = await db.from('site_settings').select('key,value');
  fail(error, 'settings');
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
});

export const getStats = cache(async () => {
  const db = publicClient();
  if (!db) return demo.stats();
  const [ents, arts, srcs] = await Promise.all([
    db.from('entities').select('type,updated_at').eq('published', true),
    db.from('articles').select('id,updated_at', { count: 'exact' }).eq('published', true),
    db.from('sources').select('id', { count: 'exact', head: true }),
  ]);
  fail(ents.error, 'stats.entities');
  fail(arts.error, 'stats.articles');
  const byType = {};
  let last = null;
  for (const e of ents.data || []) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    if (!last || e.updated_at > last) last = e.updated_at;
  }
  for (const a of arts.data || []) if (!last || a.updated_at > last) last = a.updated_at;
  return { byType, total: (ents.data || []).length, news: arts.count || 0, sources: srcs.count || 0, lastUpdated: last };
});

/** q is filtered in SQL across every language of title + tags. */
export async function listEntities({ type, status, q, featured, limit = 200, order = 'sort' } = {}) {
  const db = publicClient();
  if (!db) return demo.listEntities({ type, status, q, featured, limit, order });
  let query = db.from('entities').select(ENTITY_LIST_COLS).eq('published', true);
  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);
  if (featured) query = query.eq('featured', true);
  const term = sanitizeTerm(q);
  if (term) {
    query = query.or(['es', 'en', 'pt', 'fr'].map((l) => `title->>${l}.ilike.*${term}*`).concat([`slug.ilike.*${term}*`, `tags.cs.{${term.toLowerCase()}}`]).join(','));
  }
  query = order === 'recent'
    ? query.order('updated_at', { ascending: false })
    : query.order('sort_order', { ascending: true }).order('created_at', { ascending: true });
  const { data, error } = await query.limit(limit);
  fail(error, 'listEntities');
  return (data || []).map(normEntity);
}

function sanitizeTerm(q) {
  if (!q) return '';
  return String(q).replace(/[,()*%:"'\\{}]/g, ' ').trim().slice(0, 60);
}

export const getEntity = cache(async (type, slug) => {
  const db = publicClient();
  if (!db) return demo.getEntity(type, slug);
  const { data, error } = await db
    .from('entities')
    .select('*, source:sources(*)')
    .eq('type', type)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  fail(error, 'getEntity');
  return normEntity(data);
});

export async function getEntityDetail(entity) {
  const db = publicClient();
  if (!db) return demo.getEntityDetail(entity);
  const [facts, out, inc, media, news] = await Promise.all([
    db.from('facts').select('id,title,body,status,timestamp_text,sort_order,source:sources(*)').eq('entity_id', entity.id).order('sort_order'),
    db.from('relations').select(`id,relation_type,note,target:entities!relations_to_entity_id_fkey(${ENTITY_CARD_COLS},published)`).eq('from_entity_id', entity.id),
    db.from('relations').select(`id,relation_type,note,target:entities!relations_from_entity_id_fkey(${ENTITY_CARD_COLS},published)`).eq('to_entity_id', entity.id),
    db.from('entity_media').select('sort_order, media:media(*)').eq('entity_id', entity.id).order('sort_order'),
    db.from('article_entities').select(`article:articles(${ARTICLE_LIST_COLS})`).eq('entity_id', entity.id),
  ]);
  fail(facts.error, 'facts');
  fail(out.error, 'relations.out');
  fail(inc.error, 'relations.in');
  fail(media.error, 'entity_media');
  fail(news.error, 'article_entities');
  const rel = (rows, direction) => (rows || [])
    .filter((r) => r.target && r.target.published)
    .map((r) => ({ id: r.id, type: r.relation_type, note: r.note, direction, entity: normEntity(r.target) }));
  return {
    facts: (facts.data || []).map((f) => ({ id: f.id, title: f.title, body: f.body, status: f.status, timestamp: f.timestamp_text, source: normSource(f.source) })),
    relations: [...rel(out.data, 'out'), ...rel(inc.data, 'in')],
    media: (media.data || []).map((m) => m.media).filter(Boolean).map(normMedia),
    articles: (news.data || []).map((n) => normArticle(n.article)).filter(Boolean)
      .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')),
  };
}

export async function listArticles({ limit = 20, offset = 0, category } = {}) {
  const db = publicClient();
  if (!db) return demo.listArticles({ limit, offset, category });
  let query = db
    .from('articles')
    .select(category ? ARTICLE_LIST_COLS.replace('category:categories(', 'category:categories!inner(') : ARTICLE_LIST_COLS, { count: 'exact' })
    .eq('published', true)
    .lte('published_at', new Date().toISOString());
  if (category) query = query.eq('category.slug', category);
  const { data, error, count } = await query
    .order('featured', { ascending: false, nullsFirst: false })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);
  fail(error, 'listArticles');
  return { items: (data || []).map(normArticle), total: count || 0 };
}

/** Chronological list (no featured-first ordering) for the archive pages. */
export async function listArticlesByDate({ limit = 20, offset = 0, category } = {}) {
  const db = publicClient();
  if (!db) return demo.listArticles({ limit, offset, category, byDate: true });
  let query = db
    .from('articles')
    .select(category ? ARTICLE_LIST_COLS.replace('category:categories(', 'category:categories!inner(') : ARTICLE_LIST_COLS, { count: 'exact' })
    .eq('published', true)
    .lte('published_at', new Date().toISOString());
  if (category) query = query.eq('category.slug', category);
  const { data, error, count } = await query.order('published_at', { ascending: false }).range(offset, offset + limit - 1);
  fail(error, 'listArticlesByDate');
  return { items: (data || []).map(normArticle), total: count || 0 };
}

export const getArticle = cache(async (slug) => {
  const db = publicClient();
  if (!db) return demo.getArticle(slug);
  const { data, error } = await db
    .from('articles')
    .select(`*, category:categories(id,slug,name,color), source:sources(*), article_entities(entity:entities(${ENTITY_CARD_COLS}))`)
    .eq('slug', slug)
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  fail(error, 'getArticle');
  return normArticle(data);
});

export async function getAdjacentArticles(article) {
  const db = publicClient();
  if (!db) return demo.getAdjacentArticles(article);
  const now = new Date().toISOString();
  const [older, newer, related] = await Promise.all([
    db.from('articles').select(ARTICLE_LIST_COLS).eq('published', true).lt('published_at', article.publishedAt).order('published_at', { ascending: false }).limit(1),
    db.from('articles').select(ARTICLE_LIST_COLS).eq('published', true).gt('published_at', article.publishedAt).lte('published_at', now).order('published_at', { ascending: true }).limit(1),
    article.category
      ? db.from('articles').select(ARTICLE_LIST_COLS).eq('published', true).lte('published_at', now).eq('category_id', article.category.id).neq('id', article.id).order('published_at', { ascending: false }).limit(3)
      : db.from('articles').select(ARTICLE_LIST_COLS).eq('published', true).lte('published_at', now).neq('id', article.id).order('published_at', { ascending: false }).limit(3),
  ]);
  fail(related.error, 'related');
  let rel = (related.data || []).map(normArticle);
  if (rel.length < 3) {
    const { data } = await db.from('articles').select(ARTICLE_LIST_COLS).eq('published', true).lte('published_at', now).neq('id', article.id).order('published_at', { ascending: false }).limit(4);
    for (const a of (data || []).map(normArticle)) if (rel.length < 3 && !rel.some((r) => r.id === a.id)) rel.push(a);
  }
  return { older: normArticle(older.data?.[0]), newer: normArticle(newer.data?.[0]), related: rel };
}

export const listCategories = cache(async () => {
  const db = publicClient();
  if (!db) return demo.listCategories();
  const { data, error } = await db.from('categories').select('id,slug,name,color,sort_order').order('sort_order');
  fail(error, 'categories');
  return data || [];
});

export async function listTimeline() {
  const db = publicClient();
  if (!db) return demo.listTimeline();
  const { data, error } = await db
    .from('timeline_events')
    .select('id,event_date,title,detail,kind, entity:entities(type,slug,published), article:articles(slug,published)')
    .eq('published', true)
    .order('event_date');
  fail(error, 'timeline');
  return (data || []).map((t) => ({
    id: t.id, date: t.event_date, title: t.title, detail: t.detail, kind: t.kind,
    entity: t.entity?.published ? { type: t.entity.type, slug: t.entity.slug } : null,
    article: t.article?.published ? { slug: t.article.slug } : null,
  }));
}

export async function listSources() {
  const db = publicClient();
  if (!db) return demo.listSources();
  const { data, error } = await db.from('sources').select('*, entities(count)').order('published_at', { ascending: false, nullsFirst: false });
  fail(error, 'sources');
  return (data || []).map((s) => ({ ...normSource(s), linked: s.entities?.[0]?.count || 0 }));
}

export async function listGallery({ limit = 60 } = {}) {
  const db = publicClient();
  if (!db) return demo.listGallery({ limit });
  const { data, error } = await db
    .from('media')
    .select('*, entity_media!inner(entity:entities!inner(type,slug,title,published))')
    .eq('kind', 'image')
    .eq('entity_media.entity.published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  fail(error, 'gallery');
  return (data || []).map(normMedia);
}

export async function getSitemapData() {
  const db = publicClient();
  if (!db) return demo.sitemapData();
  const [e, a] = await Promise.all([
    db.from('entities').select('type,slug,updated_at').eq('published', true),
    db.from('articles').select('slug,updated_at').eq('published', true).lte('published_at', new Date().toISOString()),
  ]);
  fail(e.error, 'sitemap.entities');
  fail(a.error, 'sitemap.articles');
  return { entities: e.data || [], articles: a.data || [] };
}

export async function searchArchive(q, lang, limit = 40) {
  const term = String(q || '').trim().slice(0, 80);
  if (term.length < 2) return [];
  const db = publicClient();
  if (!db) return demo.search(term, lang, limit);
  const { data, error } = await db.rpc('search_archive', { q: term, lang, max_results: limit });
  fail(error, 'search');
  return data || [];
}
