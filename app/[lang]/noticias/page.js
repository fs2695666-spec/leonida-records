import Link from 'next/link';
import { getDictionary, href, pick } from '@/lib/i18n';
import { buildMetadata, jsonLd, absoluteUrl } from '@/lib/seo';
import { listArticles, listCategories } from '@/lib/data/public';
import { ArticleCard, articleHref } from '@/components/site/Cards';
import { Masthead } from '@/components/site/Masthead';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/noticias', title: dict.times.name, description: `${dict.times.motto} ${dict.home.timesLead}` });
}

export default async function TimesFront({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const [{ items, total }, categories] = await Promise.all([listArticles({ limit: 13 }), listCategories()]);
  const [lead, second, third, ...rest] = items;
  const briefs = rest.slice(0, 4);
  const more = rest.slice(4);

  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: dict.times.name,
    mainEntity: { '@type': 'ItemList', itemListElement: items.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(articleHref(lang, a)), name: pick(a.title, lang) })) },
  };

  return (
    <div className="times">
      <div className="wrap">
        <Masthead lang={lang} dict={dict} categories={categories} />

        {!lead ? <p className="empty-note">{dict.times.empty}</p> : (
          <>
            <div className="times-front__grid times-front__grid--page">
              <div className="times-front__lead"><ArticleCard article={lead} lang={lang} variant="lead" headingLevel={2} priority sizes="(min-width: 1000px) 58vw, 92vw" /></div>
              <div className="times-front__col">
                {[second, third].filter(Boolean).map((a) => <ArticleCard key={a.id} article={a} lang={lang} variant="column" headingLevel={2} sizes="(min-width: 1000px) 25vw, 92vw" />)}
              </div>
              <div className="times-front__briefs">
                <h2 className="times-front__briefs-title">{dict.times.latest}</h2>
                {briefs.length ? briefs.map((a) => <ArticleCard key={a.id} article={a} lang={lang} variant="brief" headingLevel={3} />) : <p className="muted">—</p>}
              </div>
            </div>

            {more.length > 0 && (
              <section className="times__more" aria-labelledby="more-h">
                <h2 id="more-h" className="times-rule-title display">{dict.times.more}</h2>
                <div className="news-row">{more.map((a) => <ArticleCard key={a.id} article={a} lang={lang} variant="column" headingLevel={3} />)}</div>
              </section>
            )}

            <p className="times__archive-link">
              <Link className="btn" href={href(lang, '/noticias/archivo')}>{dict.times.archive} · {total}</Link>
            </p>
          </>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
    </div>
  );
}
