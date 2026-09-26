import { notFound } from 'next/navigation';
import '@/styles/base.css';
import '@/styles/public.css';
import { fontVars } from '@/lib/fonts';
import { LOCALES, LOCALE_META, getDictionary, href, isLocale } from '@/lib/i18n';
import { buildMetadata, jsonLd } from '@/lib/seo';
import { siteUrl } from '@/lib/env';
import { getSettings } from '@/lib/data/public';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { pick } from '@/lib/i18n';


export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fff5f0',
  colorScheme: 'light',
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl()),
    applicationName: dict.meta.siteName,
    ...buildMetadata({ lang, path: '/' }),
    title: { default: `${dict.meta.siteName} — ${dict.meta.tagline}`, template: `%s — ${dict.meta.siteName}` },
    formatDetection: { telephone: false },
  };
}

export default async function PublicLayout({ children, params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = await getSettings().catch(() => ({}));
  const announcement = pick(settings.announcement, lang);

  const nav = [
    { key: 'home', path: '/', label: dict.nav.home },
    { key: 'explore', path: '/explore', label: dict.nav.explore },
    { key: 'characters', path: '/characters', label: dict.nav.characters },
    { key: 'locations', path: '/locations', label: dict.nav.locations },
    { key: 'vehicles', path: '/vehicles', label: dict.nav.vehicles },
    { key: 'news', path: '/noticias', label: dict.nav.news },
    { key: 'media', path: '/media', label: dict.nav.media },
    { key: 'timeline', path: '/timeline', label: dict.nav.timeline },
  ];

  const siteLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${siteUrl()}/#website`, name: dict.meta.siteName, url: `${siteUrl()}${href(lang, '/')}`, inLanguage: LOCALE_META[lang].intl, description: dict.meta.description,
        potentialAction: { '@type': 'SearchAction', target: `${siteUrl()}${href(lang, '/search')}?q={q}`, 'query-input': 'required name=q' } },
      { '@type': 'Organization', '@id': `${siteUrl()}/#org`, name: dict.meta.siteName, url: siteUrl(), logo: `${siteUrl()}/icon.svg` },
    ],
  };

  return (
    <html lang={lang} className={fontVars}>
      <body>
        <a className="skip-link" href="#main">{dict.nav.skip}</a>
        {announcement && <div className="announce"><p>{announcement}</p></div>}
        <Header
          lang={lang}
          nav={nav}
          homeHref={href(lang, '/')}
          labels={{
            siteName: dict.meta.siteName, menu: dict.nav.menu, close: dict.nav.close, language: dict.nav.language,
            search: dict.nav.search, sources: dict.nav.sources, sourcesHref: href(lang, '/sources'), unofficial: dict.home.unofficial,
          }}
          searchLabels={{
            placeholder: dict.search.placeholder, hint: dict.search.hint, searching: dict.search.searching, all: dict.search.all,
            open: dict.search.open, close: dict.nav.close, noResults: dict.search.empty('{q}'), seeAll: dict.search.title,
            types: dict.typeSingular, typesPlural: dict.types, searchHref: href(lang, '/search'),
          }}
        />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer lang={lang} dict={dict} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteLd) }} />
      </body>
    </html>
  );
}
