import 'server-only';
import * as seed from '@/lib/seed-data';
import { LOCALES } from '@/lib/i18n';

// Read-only demo dataset, shaped exactly like lib/data/public.js output.
// Used only when NEXT_PUBLIC_SUPABASE_* variables are missing (e.g. first local run).

const STAMP = '2026-09-24T09:00:00Z';
const sourceById = Object.fromEntries(seed.sources.map((s) => [s.key, { id: s.key, name: s.name, publisher: s.publisher, kind: s.kind, url: s.url, publishedAt: s.published_at, notes: '' }]));
const catByKey = Object.fromEntries(seed.categories.map((c, i) => [c.key, { id: c.key, slug: c.slug, name: c.name, color: c.color, sort_order: i }]));

const entities = seed.entities.map((e, i) => ({
  id: e.key, type: e.type, slug: e.slug, status: e.status, title: e.title, eyebrow: e.eyebrow || {}, short: e.short || {},
  description: e.desc || {}, quote: e.quote || {}, image: e.image || null, imageAlt: e.title.es, videoUrl: e.video_url || null,
  tags: e.tags || [], featured: Boolean(e.featured), sourceId: e.source, source: sourceById[e.source] || null,
  publishedAt: STAMP, updatedAt: new Date(Date.parse(STAMP) - i * 3600e3).toISOString(), map: e.map || null, releaseDate: seed.releaseDates[e.key] || null, sortOrder: i,
}));
const entityById = Object.fromEntries(entities.map((e) => [e.id, e]));

const articles = seed.articles.map((a) => ({
  id: a.key, slug: a.slug, title: a.title, excerpt: a.excerpt, body: a.body, seoTitle: {}, seoDescription: {},
  category: catByKey[a.category] || null, tags: a.tags || [], image: a.image, imageAlt: a.title.es, caption: a.cover_caption || '',
  author: a.author || '', evidence: a.evidence, source: sourceById[a.source] || null, publishedAt: a.published_at, updatedAt: a.published_at,
  featured: Boolean(a.featured), entities: (a.entities || []).map((k) => entityById[k]).filter(Boolean),
}));

const media = seed.media.map((m, i) => ({
  id: m.key, url: m.url, kind: 'image', alt: m.alt, caption: m.caption, credit: m.credit, width: null, height: null,
  createdAt: new Date(Date.parse(STAMP) - i * 60e3).toISOString(),
  links: m.entity && entityById[m.entity] ? [{ type: entityById[m.entity].type, slug: entityById[m.entity].slug, title: entityById[m.entity].title }] : [],
}));

const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const allText = (v) => (v && typeof v === 'object' ? LOCALES.map((l) => (typeof v[l] === 'string' ? v[l] : '')).join(' ') : String(v || ''));

export function settings() {
  return { ...seed.settings };
}

export function stats() {
  const byType = {};
  for (const e of entities) byType[e.type] = (byType[e.type] || 0) + 1;
  return { byType, total: entities.length, news: articles.length, sources: seed.sources.length, lastUpdated: STAMP };
}

export function listEntities({ type, status, q, featured, limit = 200, order = 'sort' } = {}) {
  const term = fold(q);
  let list = entities.filter((e) => (!type || e.type === type) && (!status || e.status === status) && (!featured || e.featured)
    && (!term || fold(`${allText(e.title)} ${e.slug} ${e.tags.join(' ')}`).includes(term)));
  if (order === 'recent') list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return list.slice(0, limit);
}

export function getEntity(type, slug) {
  return entities.find((e) => e.type === type && e.slug === slug) || null;
}

export function getEntityDetail(entity) {
  const facts = seed.facts.filter((f) => f.entity === entity.id).map((f, i) => ({
    id: `${entity.id}-f${i}`, title: f.title, body: f.body, status: f.status, timestamp: null, source: sourceById[f.source] || null,
  }));
  const relations = seed.relations.flatMap((r, i) => {
    if (r.from === entity.id && entityById[r.to]) return [{ id: `r${i}`, type: r.type, direction: 'out', entity: entityById[r.to] }];
    if (r.to === entity.id && entityById[r.from]) return [{ id: `r${i}`, type: r.type, direction: 'in', entity: entityById[r.from] }];
    return [];
  });
  const gallery = seed.media.map((m, i) => ({ m, i })).filter(({ m }) => m.entity === entity.id).map(({ i }) => media[i]);
  const news = articles.filter((a) => a.entities.some((e) => e.id === entity.id));
  return { facts, relations, media: gallery, articles: news };
}

export function listArticles({ limit = 20, offset = 0, category, byDate } = {}) {
  let list = articles.filter((a) => !category || a.category?.slug === category);
  list = [...list].sort((a, b) => (byDate ? 0 : Number(b.featured) - Number(a.featured)) || b.publishedAt.localeCompare(a.publishedAt));
  return { items: list.slice(offset, offset + limit), total: list.length };
}

export function getArticle(slug) {
  return articles.find((a) => a.slug === slug) || null;
}

export function getAdjacentArticles(article) {
  const sorted = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const i = sorted.findIndex((a) => a.id === article.id);
  const related = sorted.filter((a) => a.id !== article.id && a.category?.id === article.category?.id).slice(0, 3);
  for (const a of sorted) if (related.length < 3 && a.id !== article.id && !related.includes(a)) related.push(a);
  return { newer: sorted[i - 1] || null, older: sorted[i + 1] || null, related };
}

export function listCategories() {
  return Object.values(catByKey);
}

export function listTimeline() {
  return seed.timeline.map((t, i) => ({
    id: `tl-${i}`, date: t.date, title: t.title, detail: t.detail, kind: t.kind,
    entity: t.entity && entityById[t.entity] ? { type: entityById[t.entity].type, slug: entityById[t.entity].slug } : null,
    article: t.article ? { slug: seed.articles.find((a) => a.key === t.article)?.slug } : null,
  }));
}

export function listSources() {
  return seed.sources.map((s) => ({ ...sourceById[s.key], linked: entities.filter((e) => e.sourceId === s.key).length }));
}

export function listGallery({ limit = 60 } = {}) {
  return media.slice(0, limit);
}

export function sitemapData() {
  return {
    entities: entities.map((e) => ({ type: e.type, slug: e.slug, updated_at: e.updatedAt })),
    articles: articles.map((a) => ({ slug: a.slug, updated_at: a.updatedAt })),
  };
}

export function search(q, lang, limit) {
  const term = fold(q);
  const out = [];
  for (const e of entities) {
    const t = fold(allText(e.title));
    const hit = t.includes(term) ? 3 : fold(e.tags.join(' ')).includes(term) ? 2 : fold(allText(e.short)).includes(term) ? 1 : 0;
    if (hit) out.push({ kind: 'entity', id: e.id, type: e.type, slug: e.slug, title: e.title[lang] || e.title.es, excerpt: e.short[lang] || e.short.es || '', status: e.status, image: e.image, rank: hit });
  }
  for (const a of articles) {
    const t = fold(allText(a.title));
    const hit = t.includes(term) ? 3 : fold(a.tags.join(' ')).includes(term) ? 2 : fold(allText(a.excerpt)).includes(term) ? 1 : 0;
    if (hit) out.push({ kind: 'article', id: a.id, type: 'news', slug: a.slug, title: a.title[lang] || a.title.es, excerpt: a.excerpt[lang] || a.excerpt.es || '', status: a.evidence, image: a.image, rank: hit });
  }
  return out.sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title)).slice(0, limit);
}
