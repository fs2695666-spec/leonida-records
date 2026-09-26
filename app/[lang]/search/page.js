import Link from 'next/link';
import { getDictionary, href } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { searchArchive } from '@/lib/data/public';
import { Evidence } from '@/components/site/Evidence';

const GROUPS = ['characters', 'locations', 'vehicles', 'facts', 'news', 'trailers', 'theories'];

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/search', title: sp?.q ? `${dict.search.title}: ${String(sp.q).slice(0, 60)}` : dict.search.title, noindex: true });
}

export default async function SearchPage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const q = typeof sp?.q === 'string' ? sp.q.trim().slice(0, 80) : '';
  const type = GROUPS.includes(sp?.type) ? sp.type : '';
  const results = q.length >= 2 ? await searchArchive(q, lang, 60) : [];
  const counts = {};
  for (const r of results) counts[r.type] = (counts[r.type] || 0) + 1;
  const shown = type ? results.filter((r) => r.type === type) : results;
  const base = href(lang, '/search');
  const link = (t) => `${base}?q=${encodeURIComponent(q)}${t ? `&type=${t}` : ''}`;
  const target = (r) => (r.kind === 'article' ? href(lang, `/noticias/${r.slug}`) : href(lang, `/${r.type}/${r.slug}`));

  return (
    <div className="search-page">
      <header className="page-head wrap">
        <h1 className="page-head__title display">{dict.search.title}</h1>
        <form action={base} method="get" role="search" className="search-page__form">
          <label className="sr-only" htmlFor="search-q">{dict.search.title}</label>
          <input id="search-q" type="search" name="q" defaultValue={q} placeholder={dict.search.placeholder} autoComplete="off" />
          <button className="btn btn--primary" type="submit">{dict.search.title}</button>
        </form>
        <p className="page-head__lead only-keyboard">{dict.search.shortcut}</p>
      </header>
      <div className="wrap">
        {q.length < 2 ? <p className="empty-note">{dict.search.hint}</p> : (
          <>
            <nav className="chips" aria-label={dict.entity.type}>
              <Link href={link('')} aria-current={!type ? 'true' : undefined}>{dict.search.all} <span className="tnum">{results.length}</span></Link>
              {GROUPS.filter((g) => counts[g]).map((g) => <Link key={g} href={link(g)} aria-current={type === g ? 'true' : undefined}>{dict.types[g]} <span className="tnum">{counts[g]}</span></Link>)}
            </nav>
            <p className="explore__count" aria-live="polite">{dict.search.results(shown.length)}</p>
            {shown.length === 0 ? <p className="empty-note">{dict.search.empty(q)}</p> : (
              <ol className="results">
                {shown.map((r) => (
                  <li key={`${r.kind}-${r.id}`}>
                    <Link href={target(r)} className="result">
                      <span className="result__img">{r.image && <img src={r.image} alt="" loading="lazy" />}</span>
                      <span className="result__text">
                        <span className="result__type">{dict.typeSingular[r.type] || r.type}</span>
                        <strong className="display">{r.title}</strong>
                        {r.excerpt && <span className="result__excerpt">{r.excerpt}</span>}
                      </span>
                      <span className="result__ev"><Evidence level={r.status} lang={lang} inert /></span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  );
}
