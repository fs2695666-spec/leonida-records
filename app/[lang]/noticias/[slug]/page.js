import { notFound } from 'next/navigation';
import { LOCALES, getDictionary, href, pick, docToText } from '@/lib/i18n';
import { buildMetadata, breadcrumbLd, jsonLd, absoluteUrl, truncate } from '@/lib/seo';
import { getAdjacentArticles, getArticle, getSitemapData } from '@/lib/data/public';
import { ArticleView } from '@/components/site/ArticleView';

export const revalidate = 300;
// New records created in the admin render on first request, then are cached (ISR).
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { articles } = await getSitemapData();
    return LOCALES.flatMap((lang) => articles.map((a) => ({ lang, slug: a.slug })));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { robots: { index: false } };
  const title = pick(a.seoTitle, lang) || pick(a.title, lang);
  const description = pick(a.seoDescription, lang) || pick(a.excerpt, lang) || truncate(docToText(pick(a.body, lang)), 170);
  const meta = buildMetadata({
    lang, path: `/noticias/${slug}`, title, description, image: a.image, type: 'article',
    publishedTime: a.publishedAt, modifiedTime: a.updatedAt,
  });
  meta.openGraph.authors = a.author ? [a.author] : undefined;
  meta.openGraph.section = a.category ? pick(a.category.name, lang) : undefined;
  meta.openGraph.tags = a.tags;
  return meta;
}

export default async function ArticlePage({ params }) {
  const { lang, slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const dict = getDictionary(lang);
  const adjacent = await getAdjacentArticles(article);
  const path = href(lang, `/noticias/${slug}`);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: pick(article.title, lang).slice(0, 110),
    description: pick(article.excerpt, lang),
    image: article.image ? [article.image] : [absoluteUrl('/og.png')],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    inLanguage: lang,
    mainEntityOfPage: absoluteUrl(path),
    author: article.author ? { '@type': 'Person', name: article.author } : { '@type': 'Organization', name: 'Leonida Records' },
    publisher: { '@type': 'Organization', name: 'Leonida Records', logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') } },
    ...(article.source ? { isBasedOn: article.source.url } : {}),
    keywords: article.tags?.join(', '),
  };
  return (
    <>
      <ArticleView article={article} adjacent={adjacent} lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([ld, breadcrumbLd([
        { name: dict.nav.home, path: href(lang, '/') },
        { name: dict.times.name, path: href(lang, '/noticias') },
        { name: pick(article.title, lang), path },
      ])]) }} />
    </>
  );
}
