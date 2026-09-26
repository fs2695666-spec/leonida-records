import Link from 'next/link';
import { formatDate, href, pick } from '@/lib/i18n';

/** Newspaper masthead for The Leonida Times. */
export function Masthead({ lang, dict, categories, activeCategory, big = true }) {
  const now = new Date().toISOString();
  return (
    <header className={`masthead ${big ? 'masthead--page' : ''}`}>
      <p className="masthead__edge">
        <span>{dict.times.edition} · {dict.home.unofficial}</span>
        <span>{formatDate(now, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </p>
      {big ? <h1 className="masthead__name display"><Link href={href(lang, '/noticias')}>{dict.times.name}</Link></h1>
        : <p className="masthead__name display"><Link href={href(lang, '/noticias')}>{dict.times.name}</Link></p>}
      <p className="masthead__motto">{dict.times.motto}</p>
      {categories?.length > 0 && (
        <nav className="masthead__sections" aria-label={dict.times.sections}>
          <Link href={href(lang, '/noticias/archivo')} aria-current={!activeCategory ? 'true' : undefined}>{dict.times.all}</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`${href(lang, '/noticias/archivo')}?category=${c.slug}`} aria-current={activeCategory === c.slug ? 'true' : undefined}>{pick(c.name, lang)}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

