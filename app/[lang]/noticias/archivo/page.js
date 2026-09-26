import Link from 'next/link';
import { getDictionary, href, pick } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { listArticlesByDate, listCategories } from '@/lib/data/public';
import { ArticleCard } from '@/components/site/Cards';
import { Masthead } from '@/components/site/Masthead';

const PER_PAGE = 12;

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const page = Math.max(1, Number.parseInt(sp?.page, 10) || 1);
  const filtered = Boolean(sp?.category) || page > 1;
  return buildMetadata({ lang, path: '/noticias/archivo', title: `${dict.times.archive} · ${dict.times.name}`, description: dict.times.archiveLead, noindex: filtered });
}

export default async function TimesArchive({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const categories = await listCategories();
  const category = categories.find((c) => c.slug === sp?.category)?.slug || '';
  const page = Math.max(1, Number.parseInt(sp?.page, 10) || 1);
  const { items, total } = await listArticlesByDate({ limit: PER_PAGE, offset: (page - 1) * PER_PAGE, category: category || undefined });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const base = href(lang, '/noticias/archivo');
  const link = (p) => {
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (p > 1) q.set('page', String(p));
    return q.toString() ? `${base}?${q}` : base;
  };
  const catName = category ? pick(categories.find((c) => c.slug === category)?.name, lang) : '';

  return (
    <div className="times">
      <div className="wrap">
        <Masthead lang={lang} dict={dict} categories={categories} activeCategory={category} big={false} />
        <header className="page-head page-head--tight">
          <h1 className="page-head__title display">{catName || dict.times.archive}</h1>
          <div className="page-head__row">
            <p className="page-head__lead">{dict.times.archiveLead}</p>
            <p className="page-head__count tnum">{dict.search.results(total)}</p>
          </div>
        </header>
        {items.length === 0 ? <p className="empty-note">{dict.times.empty}</p> : (
          <div className="archive-list">
            {items.map((a) => <ArticleCard key={a.id} article={a} lang={lang} variant="row" headingLevel={2} sizes="(min-width: 800px) 280px, 92vw" />)}
          </div>
        )}
        {pages > 1 && (
          <nav className="pager" aria-label={dict.times.archive}>
            {page > 1 ? <Link className="btn btn--small" href={link(page - 1)} rel="prev">← {dict.times.newer}</Link> : <span />}
            <span className="tnum">{dict.times.page(page)} / {pages}</span>
            {page < pages ? <Link className="btn btn--small" href={link(page + 1)} rel="next">{dict.times.older} →</Link> : <span />}
          </nav>
        )}
      </div>
    </div>
  );
}
