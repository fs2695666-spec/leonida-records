import { ENTITY_TYPES, LOCALES, href } from '@/lib/i18n';
import { siteUrl } from '@/lib/env';
import { getSitemapData } from '@/lib/data/public';

export const revalidate = 3600;

function entry(path, lastModified, priority = 0.6, changeFrequency = 'weekly') {
  const base = siteUrl();
  return {
    url: `${base}${href('es', path)}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency,
    priority,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}${href(l, path)}`])) },
  };
}

export default async function sitemap() {
  let data = { entities: [], articles: [] };
  try { data = await getSitemapData(); } catch (e) { console.error(e); }
  const staticPaths = [
    ['/', 1, 'daily'], ['/noticias', 0.9, 'daily'], ['/explore', 0.7], ['/timeline', 0.6], ['/media', 0.6], ['/sources', 0.5],
    ...ENTITY_TYPES.map((t) => [`/${t}`, 0.7]),
  ];
  return [
    ...staticPaths.map(([p, pr, cf]) => entry(p, null, pr, cf)),
    ...data.articles.map((a) => entry(`/noticias/${a.slug}`, a.updated_at, 0.8, 'monthly')),
    ...data.entities.map((e) => entry(`/${e.type}/${e.slug}`, e.updated_at, 0.7, 'monthly')),
  ];
}
