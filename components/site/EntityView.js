import Link from 'next/link';
import { formatDate, getDictionary, href, pick } from '@/lib/i18n';
import { Evidence } from './Evidence';
import { Img } from './Img';
import { RichText, youtubeId } from './RichText';
import { ArticleCard, EntityCard, entityHref } from './Cards';
import { Gallery } from './Gallery';

/** Full editorial record page. Shared by the public route and the admin preview. */
export function EntityView({ entity: e, detail, more = [], lang }) {
  const dict = getDictionary(lang);
  const t = dict.entity;
  const title = pick(e.title, lang);
  const short = pick(e.short, lang);
  const quote = pick(e.quote, lang);
  const description = pick(e.description, lang);
  const ev = dict.evidence[e.status] || dict.evidence.OBSERVED;
  const video = youtubeId(e.videoUrl);
  const isPortrait = e.type === 'characters';

  const groups = {};
  for (const r of detail.relations) {
    const labels = dict.relations[r.type] || dict.relations.related;
    const label = labels[r.direction === 'out' ? 0 : 1];
    (groups[label] ||= []).push(r);
  }

  const galleryItems = detail.media.map((m) => ({ id: m.id, src: m.url, alt: m.alt, caption: m.caption, credit: m.credit }));

  return (
    <article className="record" data-type={e.type}>
      <header className={`record-hero ${isPortrait ? 'record-hero--portrait' : 'record-hero--wide'}`}>
        <div className="record-hero__text wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href={href(lang, '/')}>{dict.nav.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={href(lang, `/${e.type}`)}>{dict.types[e.type]}</Link>
          </nav>
          <p className="record-hero__kicker">{pick(e.eyebrow, lang) || dict.typeSingular[e.type]}</p>
          <h1 className="record-hero__title display">{title}</h1>
          {short && <p className="record-hero__lead">{short}</p>}
          <div className="record-hero__ev">
            <Evidence level={e.status} lang={lang} withText />
            <span>{ev.text}</span>
          </div>
        </div>
        <div className="record-hero__media">
          {e.image
            ? <div className="record-hero__frame"><Img src={e.image} alt={e.imageAlt || title} priority sizes={isPortrait ? '(min-width: 1000px) 40vw, 90vw' : '100vw'} /></div>
            : <div className="record-hero__frame record-hero__frame--blank" aria-hidden="true"><span className="display">{title.slice(0, 1)}</span></div>}
        </div>
      </header>

      <div className="record-body wrap">
        <aside className="record-sheet" aria-label={t.record}>
          <dl>
            <div><dt>{t.record}</dt><dd className="tnum">#{e.slug}</dd></div>
            <div><dt>{t.type}</dt><dd><Link className="link" href={href(lang, `/${e.type}`)}>{dict.typeSingular[e.type]}</Link></dd></div>
            <div><dt>{t.status}</dt><dd><Evidence level={e.status} lang={lang} /></dd></div>
            <div>
              <dt>{t.primarySource}</dt>
              <dd>{e.source
                ? <a className="link" href={e.source.url} target="_blank" rel="noopener noreferrer">{e.source.name}</a>
                : <span className="muted">{t.noSource}</span>}
                {e.source?.publisher && <small>{e.source.publisher}</small>}
              </dd>
            </div>
            {e.updatedAt && <div><dt>{t.updated}</dt><dd><time dateTime={e.updatedAt}>{formatDate(e.updatedAt, lang)}</time></dd></div>}
            {e.tags?.length > 0 && (
              <div><dt>{t.tags}</dt><dd className="tags">{e.tags.map((tag) => <Link key={tag} href={`${href(lang, '/search')}?q=${encodeURIComponent(tag)}`}>#{tag}</Link>)}</dd></div>
            )}
          </dl>
        </aside>

        <div className="record-main">
          {quote && (
            <figure className="record-quote">
              <blockquote className="display"><p>{quote}</p></blockquote>
              <figcaption>{title}{e.source ? ` · ${e.source.publisher || e.source.name}` : ''}</figcaption>
            </figure>
          )}

          {description && (
            <section className="record-section" aria-labelledby="sec-summary">
              <h2 id="sec-summary" className="record-section__title">{t.summary}</h2>
              <RichText value={description} className="richtext richtext--record" />
            </section>
          )}

          {video && (
            <section className="record-section">
              <div className="video-embed">
                <iframe src={`https://www.youtube-nocookie.com/embed/${video}?rel=0`} title={title} loading="lazy" allowFullScreen
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            </section>
          )}

          {detail.facts.length > 0 && (
            <section className="record-section" aria-labelledby="sec-facts">
              <h2 id="sec-facts" className="record-section__title">{t.facts}</h2>
              <p className="record-section__lead">{t.factsLead}</p>
              <ol className="facts">
                {detail.facts.map((f, i) => (
                  <li key={f.id} className="fact">
                    <span className="fact__n tnum" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <div className="fact__head">
                        <h3>{pick(f.title, lang)}</h3>
                        <Evidence level={f.status} lang={lang} />
                      </div>
                      {pick(f.body, lang) && <p>{pick(f.body, lang)}</p>}
                      {(f.source || f.timestamp) && (
                        <p className="fact__src">
                          {f.source && <a className="link" href={f.source.url} target="_blank" rel="noopener noreferrer">{f.source.name}</a>}
                          {f.timestamp && <span className="tnum"> · {f.timestamp}</span>}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>

      {detail.relations.length > 0 && (
        <section className="record-connections" aria-labelledby="sec-conn">
          <div className="wrap">
            <h2 id="sec-conn" className="record-section__title">{t.connections}</h2>
            <p className="record-section__lead">{t.connectionsLead}</p>
            <div className="connections">
              {Object.entries(groups).map(([label, rels]) => (
                <div key={label} className="connections__group">
                  <h3>{label}</h3>
                  <ul>
                    {rels.map((r) => (
                      <li key={r.id}>
                        <Link href={entityHref(lang, r.entity)} className="conn">
                          <span className="conn__img">{r.entity.image && <Img src={r.entity.image} alt="" sizes="64px" />}</span>
                          <span className="conn__text">
                            <strong>{pick(r.entity.title, lang)}</strong>
                            <span>{dict.typeSingular[r.entity.type]}{r.note ? ` · ${r.note}` : ''}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {galleryItems.length > 0 && (
        <section className="record-section wrap" aria-labelledby="sec-gallery">
          <h2 id="sec-gallery" className="record-section__title">{t.gallery}</h2>
          <Gallery items={galleryItems} layout="strip" labels={{ close: dict.media.close, prev: dict.media.prev, next: dict.media.next, credit: dict.media.credit, empty: dict.media.empty, open: t.gallery }} />
        </section>
      )}

      {detail.articles.length > 0 && (
        <section className="record-section wrap" aria-labelledby="sec-news">
          <h2 id="sec-news" className="record-section__title">{t.relatedNews}</h2>
          <div className="news-row">
            {detail.articles.slice(0, 3).map((a) => <ArticleCard key={a.id} article={a} lang={lang} variant="column" />)}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="record-section record-more wrap" aria-labelledby="sec-more">
          <div className="record-more__head">
            <h2 id="sec-more" className="record-section__title">{t.moreOfType} · {dict.types[e.type]}</h2>
            <Link className="link" href={href(lang, `/${e.type}`)}>{dict.types[e.type]}</Link>
          </div>
          <div className="card-grid card-grid--4">
            {more.map((m) => <EntityCard key={m.id} entity={m} lang={lang} variant={e.type === 'characters' ? 'arch' : 'wide'} sizes="(min-width: 1000px) 22vw, 45vw" />)}
          </div>
        </section>
      )}
    </article>
  );
}
