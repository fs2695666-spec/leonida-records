import Link from 'next/link';
import { formatDate, getDictionary, href, pick, readingMinutes } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/seo';
import { Evidence } from './Evidence';
import { Img } from './Img';
import { RichText } from './RichText';
import { ArticleCard, articleHref, entityHref } from './Cards';
import { ShareBar } from './ShareBar';

/** Long-form news article in The Leonida Times. Shared by the public route and the admin preview. */
export function ArticleView({ article: a, adjacent = { related: [] }, lang }) {
  const dict = getDictionary(lang);
  const t = dict.times;
  const title = pick(a.title, lang);
  const excerpt = pick(a.excerpt, lang);
  const body = pick(a.body, lang);
  const url = absoluteUrl(articleHref(lang, a));

  return (
    <article className="story">
      <div className="story__masthead wrap">
        <Link href={href(lang, '/noticias')} className="story__paper display">{t.name}</Link>
        <p>{t.motto}</p>
      </div>

      <header className="story__head wrap">
        <p className="story__kicker">
          {a.category && (
            <Link href={`${href(lang, '/noticias/archivo')}?category=${a.category.slug}`} className="cat-dot" data-color={a.category.color}>
              {pick(a.category.name, lang)}
            </Link>
          )}
          <Evidence level={a.evidence} lang={lang} />
        </p>
        <h1 className="story__title display">{title}</h1>
        {excerpt && <p className="story__standfirst">{excerpt}</p>}
        <p className="story__byline">
          {a.author && <span>{t.by} <strong>{a.author}</strong></span>}
          {a.publishedAt && <time dateTime={a.publishedAt}>{formatDate(a.publishedAt, lang, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</time>}
          <span>{t.minutes(readingMinutes(body || ''))}</span>
        </p>
      </header>

      {a.image && (
        <figure className="story__cover wrap">
          <div className="story__cover-img"><Img src={a.image} alt={a.imageAlt || title} priority sizes="(min-width: 1200px) 1200px, 100vw" /></div>
          {a.caption && <figcaption>{a.caption}</figcaption>}
        </figure>
      )}

      <div className="story__layout wrap">
        <div className="story__body">
          <RichText value={body} className="richtext richtext--story" />
          <ShareBar url={url} title={title} labels={{ share: t.share, copyLink: t.copyLink, copied: t.copied }} />
        </div>

        <aside className="story__aside">
          {a.source && (
            <div className="aside-box aside-box--source">
              <h2>{t.source}</h2>
              <a className="link" href={a.source.url} target="_blank" rel="noopener noreferrer">{a.source.name}</a>
              {a.source.publisher && <p>{a.source.publisher}</p>}
            </div>
          )}
          {a.entities?.length > 0 && (
            <div className="aside-box">
              <h2>{t.inThisStory}</h2>
              <ul className="aside-links">
                {a.entities.map((e) => (
                  <li key={e.id}>
                    <Link href={entityHref(lang, e)}>
                      <span className="aside-links__img">{e.image && <Img src={e.image} alt="" sizes="48px" />}</span>
                      <span><strong>{pick(e.title, lang)}</strong><small>{dict.typeSingular[e.type]}</small></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {a.tags?.length > 0 && (
            <div className="aside-box">
              <h2>{t.tags}</h2>
              <p className="tags">{a.tags.map((tag) => <Link key={tag} href={`${href(lang, '/search')}?q=${encodeURIComponent(tag)}`}>#{tag}</Link>)}</p>
            </div>
          )}
        </aside>
      </div>

      {(adjacent.older || adjacent.newer) && (
        <nav className="story__pager wrap" aria-label={t.more}>
          {adjacent.older ? (
            <Link href={articleHref(lang, adjacent.older)} className="story__pager-link">
              <span>← {t.previous}</span><strong>{pick(adjacent.older.title, lang)}</strong>
            </Link>
          ) : <span />}
          {adjacent.newer && (
            <Link href={articleHref(lang, adjacent.newer)} className="story__pager-link story__pager-link--next">
              <span>{t.next} →</span><strong>{pick(adjacent.newer.title, lang)}</strong>
            </Link>
          )}
        </nav>
      )}

      {adjacent.related?.length > 0 && (
        <section className="story__related wrap" aria-labelledby="related-h">
          <h2 id="related-h" className="times-rule-title display">{t.related}</h2>
          <div className="news-row">
            {adjacent.related.map((r) => <ArticleCard key={r.id} article={r} lang={lang} variant="column" />)}
          </div>
        </section>
      )}
    </article>
  );
}
