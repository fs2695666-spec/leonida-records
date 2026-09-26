import { EVIDENCE, formatDate, getDictionary } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { listSources } from '@/lib/data/public';
import { Evidence } from '@/components/site/Evidence';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/sources', title: dict.sources.title, description: dict.sources.lead });
}

export default async function SourcesPage({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const sources = await listSources();
  return (
    <div className="sources-page">
      <header className="page-head wrap">
        <h1 className="page-head__title display">{dict.sources.title}</h1>
        <p className="page-head__lead">{dict.sources.lead}</p>
      </header>

      <section className="wrap" aria-labelledby="levels-h">
        <h2 id="levels-h" className="record-section__title">{dict.sources.levels}</h2>
        <ol className="levels">
          {EVIDENCE.map((l, i) => (
            <li key={l} className="level" data-level={l}>
              <span className="level__bar" aria-hidden="true"><i style={{ '--w': `${100 - i * 20}%` }} /></span>
              <Evidence level={l} lang={lang} withText />
              <p>{dict.evidence[l].text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap" aria-labelledby="src-h">
        <h2 id="src-h" className="record-section__title">{dict.sources.title}</h2>
        <ul className="source-list">
          {sources.map((s) => (
            <li key={s.id} className="source">
              <div>
                <p className="source__kind">{s.kind}{s.publisher ? ` · ${s.publisher}` : ''}</p>
                <h3 className="display">{s.name}</h3>
                <p className="source__meta">
                  {s.publishedAt && <time dateTime={s.publishedAt}>{formatDate(s.publishedAt, lang)}</time>}
                  <span>{dict.sources.linked(s.linked)}</span>
                </p>
              </div>
              <a className="btn btn--small" href={s.url} target="_blank" rel="noopener noreferrer">{dict.sources.visit} ↗</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
