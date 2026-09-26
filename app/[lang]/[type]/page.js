import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ENTITY_TYPES, EVIDENCE, LOCALES, getDictionary, href, pick } from '@/lib/i18n';
import { buildMetadata, breadcrumbLd, jsonLd } from '@/lib/seo';
import { listEntities } from '@/lib/data/public';
import { EntityCard, entityHref } from '@/components/site/Cards';
import { Evidence } from '@/components/site/Evidence';

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => ENTITY_TYPES.map((type) => ({ lang, type })));
}

export async function generateMetadata({ params }) {
  const { lang, type } = await params;
  if (!ENTITY_TYPES.includes(type)) return {};
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: `/${type}`, title: dict.types[type], description: dict.typeIntro[type] });
}

export default async function TypeIndex({ params }) {
  const { lang, type } = await params;
  if (!ENTITY_TYPES.includes(type)) notFound();
  const dict = getDictionary(lang);
  const items = await listEntities({ type });
  const counts = Object.fromEntries(EVIDENCE.map((l) => [l, items.filter((i) => i.status === l).length]));
  const variant = type === 'characters' ? 'arch' : type === 'facts' || type === 'theories' ? 'text' : 'wide';

  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: dict.types[type], description: dict.typeIntro[type],
    mainEntity: { '@type': 'ItemList', itemListElement: items.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: pick(e.title, lang), url: entityHref(lang, e) })) },
  };

  return (
    <div className="index-page" data-type={type}>
      <header className="page-head wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href={href(lang, '/')}>{dict.nav.home}</Link><span aria-hidden="true">/</span><span>{dict.nav.archive}</span></nav>
        <h1 className="page-head__title display">{dict.types[type]}</h1>
        <div className="page-head__row">
          <p className="page-head__lead">{dict.typeIntro[type]}</p>
          <p className="page-head__count tnum">{dict.explore.results(items.length)}</p>
        </div>
        <ul className="ev-summary" aria-label={dict.entity.evidence}>
          {EVIDENCE.filter((l) => counts[l]).map((l) => (
            <li key={l}><Link href={`${href(lang, '/explore')}?type=${type}&status=${l}`}><Evidence level={l} lang={lang} inert /> <span className="tnum">{counts[l]}</span></Link></li>
          ))}
          <li><Link className="link" href={`${href(lang, '/explore')}?type=${type}`}>{dict.explore.title}</Link></li>
        </ul>
      </header>
      <div className="wrap">
        {items.length === 0
          ? <p className="empty-note">{dict.explore.empty}</p>
          : (
            <div className={`card-grid ${variant === 'arch' ? 'card-grid--4' : variant === 'text' ? 'card-grid--text' : 'card-grid--3'}`}>
              {items.map((e, i) => <EntityCard key={e.id} entity={e} lang={lang} variant={variant} priority={i < 2} sizes={variant === 'arch' ? '(min-width: 1000px) 24vw, 46vw' : '(min-width: 1000px) 32vw, 92vw'} />)}
            </div>
          )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([ld, breadcrumbLd([{ name: dict.nav.home, path: href(lang, '/') }, { name: dict.types[type], path: href(lang, `/${type}`) }])]) }} />
    </div>
  );
}
