import { DEFAULT_LOCALE, LOCALES, LOCALE_META, getDictionary, href } from '@/lib/i18n';
import { siteUrl } from '@/lib/env';

export const DEFAULT_OG_IMAGE = '/og.png';

/** hreflang alternates for a locale-neutral path like "/noticias/foo". */
export function languageAlternates(path) {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, href(l, path)]));
  languages['x-default'] = href(DEFAULT_LOCALE, path);
  return languages;
}

/**
 * Build Next.js Metadata for a public page.
 * @param {{lang:string, path:string, title?:string, description?:string, image?:string|null, type?:'website'|'article', publishedTime?:string, modifiedTime?:string, noindex?:boolean, absoluteTitle?:boolean}} o
 */
export function buildMetadata(o) {
  const dict = getDictionary(o.lang);
  const siteName = dict.meta.siteName;
  const title = o.title ? (o.absoluteTitle ? o.title : `${o.title} — ${siteName}`) : `${siteName} — ${dict.meta.tagline}`;
  const description = truncate(o.description || dict.meta.description, 180);
  const canonical = href(o.lang, o.path);
  const images = [{ url: o.image || DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: o.title || siteName }];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages: languageAlternates(o.path) },
    openGraph: {
      type: o.type || 'website',
      siteName,
      title,
      description,
      url: canonical,
      locale: LOCALE_META[o.lang].og,
      alternateLocale: LOCALES.filter((l) => l !== o.lang).map((l) => LOCALE_META[l].og),
      images,
      ...(o.type === 'article' ? { publishedTime: o.publishedTime, modifiedTime: o.modifiedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
    robots: o.noindex ? { index: false, follow: false } : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

export function truncate(text, n) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

export function absoluteUrl(path) {
  if (!path) return siteUrl();
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Serialize JSON-LD safely (prevents </script> injection). */
export function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}
