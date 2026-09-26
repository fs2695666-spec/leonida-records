import { notFound } from 'next/navigation';
import { ENTITY_TYPES, LOCALES, getDictionary, href, pick } from '@/lib/i18n';
import { buildMetadata, breadcrumbLd, jsonLd, absoluteUrl } from '@/lib/seo';
import { getEntity, getEntityDetail, getSitemapData, listEntities } from '@/lib/data/public';
import { EntityView } from '@/components/site/EntityView';

export const revalidate = 300;
// New records created in the admin render on first request, then are cached (ISR).
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { entities } = await getSitemapData();
    return LOCALES.flatMap((lang) => entities.map((e) => ({ lang, type: e.type, slug: e.slug })));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { lang, type, slug } = await params;
  if (!ENTITY_TYPES.includes(type)) return {};
  const e = await getEntity(type, slug);
  if (!e) return { robots: { index: false } };
  const dict = getDictionary(lang);
  return buildMetadata({
    lang, path: `/${type}/${slug}`, title: `${pick(e.title, lang)} · ${dict.typeSingular[type]}`,
    description: pick(e.short, lang), image: e.image, type: 'article', modifiedTime: e.updatedAt, publishedTime: e.publishedAt,
  });
}

const SCHEMA_TYPE = { characters: 'Person', locations: 'Place', vehicles: 'Product', trailers: 'VideoObject' };

export default async function EntityPage({ params }) {
  const { lang, type, slug } = await params;
  if (!ENTITY_TYPES.includes(type)) notFound();
  const entity = await getEntity(type, slug);
  if (!entity) notFound();
  const dict = getDictionary(lang);
  const [detail, siblings] = await Promise.all([getEntityDetail(entity), listEntities({ type, limit: 9 })]);
  const more = siblings.filter((s) => s.id !== entity.id).slice(0, 4);

  const title = pick(entity.title, lang);
  const path = href(lang, `/${type}/${slug}`);
  const main = {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPE[type] || 'CreativeWork',
    name: title,
    description: pick(entity.short, lang),
    url: absoluteUrl(path),
    ...(entity.image ? { image: entity.image } : {}),
    ...(type === 'trailers' && entity.videoUrl ? { contentUrl: entity.videoUrl, uploadDate: entity.releaseDate || entity.publishedAt, thumbnailUrl: entity.image || absoluteUrl('/og.png') } : {}),
    ...(type !== 'trailers' ? { subjectOf: { '@type': 'VideoGame', name: 'Grand Theft Auto VI' } } : {}),
    ...(entity.source ? { citation: entity.source.url } : {}),
  };

  return (
    <>
      <EntityView entity={entity} detail={detail} more={more} lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([main, breadcrumbLd([
        { name: dict.nav.home, path: href(lang, '/') },
        { name: dict.types[type], path: href(lang, `/${type}`) },
        { name: title, path },
      ])]) }} />
    </>
  );
}
