import Link from 'next/link';
import { formatDate, getDictionary, href, pick, readingMinutes } from '@/lib/i18n';
import { Evidence } from './Evidence';
import { Img } from './Img';

export function entityHref(lang, e) {
  return href(lang, `/${e.type}/${e.slug}`);
}
export function articleHref(lang, a) {
  return href(lang, `/noticias/${a.slug}`);
}

/** Archive record card. `variant`: 'arch' (portrait arch frame) | 'wide' | 'text' */
export function EntityCard({ entity: e, lang, variant = 'wide', sizes = '(min-width: 1000px) 30vw, 90vw', priority = false }) {
  const dict = getDictionary(lang);
  const title = pick(e.title, lang);
  return (
    <article className={`ecard ecard--${variant}`} data-type={e.type}>
      <Link href={entityHref(lang, e)} className="ecard__link">
        {variant !== 'text' && (
          <div className="ecard__media">
            {e.image ? <Img src={e.image} alt={e.imageAlt || title} sizes={sizes} priority={priority} /> : <div className="ecard__placeholder" aria-hidden="true"><span className="display">{title.slice(0, 1)}</span></div>}
          </div>
        )}
        <div className="ecard__body">
          <p className="ecard__kicker">{pick(e.eyebrow, lang) || dict.typeSingular[e.type]}</p>
          <h3 className="ecard__title">{title}</h3>
          {pick(e.short, lang) && <p className="ecard__short">{pick(e.short, lang)}</p>}
        </div>
      </Link>
      <div className="ecard__meta"><Evidence level={e.status} lang={lang} /></div>
    </article>
  );
}

/** Newspaper-style story. `variant`: 'lead' | 'column' | 'row' | 'brief' */
export function ArticleCard({ article: a, lang, variant = 'row', headingLevel = 3, sizes = '(min-width: 1000px) 40vw, 92vw', priority = false }) {
  const dict = getDictionary(lang);
  const H = `h${headingLevel}`;
  const title = pick(a.title, lang);
  const showImage = variant !== 'brief' && a.image;
  return (
    <article className={`acard acard--${variant}`}>
      <Link href={articleHref(lang, a)} className="acard__link">
        {showImage && (
          <div className="acard__media"><Img src={a.image} alt={a.imageAlt || title} sizes={sizes} priority={priority} /></div>
        )}
        <div className="acard__body">
          <p className="acard__kicker">
            {a.category && <span className="cat-dot" data-color={a.category.color}>{pick(a.category.name, lang)}</span>}
            <time dateTime={a.publishedAt}>{formatDate(a.publishedAt, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</time>
          </p>
          <H className="acard__title">{title}</H>
          {variant !== 'brief' && pick(a.excerpt, lang) && <p className="acard__excerpt">{pick(a.excerpt, lang)}</p>}
          {(variant === 'lead' || variant === 'column') && (
            <p className="acard__byline">
              {a.author && <span>{dict.times.by} {a.author}</span>}
              {a.body && <span>{dict.times.minutes(readingMinutes(pick(a.body, lang) || ''))}</span>}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function SectionHead({ title, lead, action, as: H = 'h2', id, index }) {
  return (
    <header className="section-head">
      {index && <span className="section-head__index tnum" aria-hidden="true">{index}</span>}
      <div className="section-head__text">
        <H className="section-head__title display" id={id}>{title}</H>
        {lead && <p className="section-head__lead">{lead}</p>}
      </div>
      {action}
    </header>
  );
}
