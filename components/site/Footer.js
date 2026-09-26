import Link from 'next/link';
import { LOCALES, LOCALE_META, href } from '@/lib/i18n';
import { SunMark } from './Logo';

export function Footer({ lang, dict }) {
  const year = new Date().getFullYear();
  const cols = [
    { title: dict.nav.archive, links: [
      ['/explore', dict.nav.explore], ['/characters', dict.nav.characters], ['/locations', dict.nav.locations],
      ['/vehicles', dict.nav.vehicles], ['/facts', dict.types.facts], ['/theories', dict.types.theories],
    ] },
    { title: dict.footer.read, links: [
      ['/noticias', dict.times.name], ['/noticias/archivo', dict.times.archive], ['/media', dict.nav.media], ['/timeline', dict.nav.timeline],
    ] },
    { title: dict.footer.project, links: [['/sources', dict.nav.sources], ['/search', dict.nav.search]] },
  ];
  return (
    <footer className="site-footer">
      <div className="sunset-rule" aria-hidden="true" />
      <div className="site-footer__inner wrap">
        <div className="site-footer__brand">
          <p className="site-footer__word display" aria-hidden="true">Leonida<br /><em>Records</em></p>
          <p className="site-footer__tag">{dict.meta.tagline}</p>
          <p className="site-footer__method"><SunMark size={18} /> {dict.footer.method}</p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} className="site-footer__col" aria-label={c.title}>
            <h2>{c.title}</h2>
            <ul>
              {c.links.map(([p, label]) => <li key={p}><Link href={href(lang, p)}>{label}</Link></li>)}
            </ul>
          </nav>
        ))}
        <div className="site-footer__col">
          <h2>{dict.nav.language}</h2>
          <ul className="site-footer__langs">
            {LOCALES.map((l) => (
              <li key={l}><a href={l === 'es' ? '/es' : href(l, '/')} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined}>{LOCALE_META[l].name}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="site-footer__legal wrap">
        <p><strong>{dict.home.unofficial}.</strong> {dict.footer.about}</p>
        <p>{dict.footer.rights}</p>
        <p className="site-footer__meta">
          <span>© {year} Leonida Records</span>
          <a href="/admin" rel="nofollow">{dict.footer.editorial}</a>
          <a href="#main">{dict.footer.top} ↑</a>
        </p>
      </div>
    </footer>
  );
}
