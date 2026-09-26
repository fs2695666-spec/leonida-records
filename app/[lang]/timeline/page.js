import Link from 'next/link';
import { formatDate, getDictionary, href, pick } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { listTimeline } from '@/lib/data/public';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/timeline', title: dict.timeline.title, description: dict.timeline.lead });
}

export default async function Timeline({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const events = await listTimeline();
  const today = new Date().toISOString().slice(0, 10);
  const byYear = {};
  for (const e of events) (byYear[e.date.slice(0, 4)] ||= []).push(e);

  return (
    <div className="timeline-page">
      <header className="page-head wrap">
        <h1 className="page-head__title display">{dict.timeline.title}</h1>
        <p className="page-head__lead">{dict.timeline.lead}</p>
      </header>
      <div className="wrap">
        {events.length === 0 ? <p className="empty-note">—</p> : Object.entries(byYear).map(([year, list]) => (
          <section key={year} className="tl-year" aria-labelledby={`y-${year}`}>
            <h2 id={`y-${year}`} className="tl-year__label display tnum">{year}</h2>
            <ol className="tl">
              {list.map((ev) => {
                const upcoming = ev.date > today;
                const link = ev.article ? href(lang, `/noticias/${ev.article.slug}`) : ev.entity ? href(lang, `/${ev.entity.type}/${ev.entity.slug}`) : null;
                return (
                  <li key={ev.id} className="tl__item" data-kind={ev.kind} data-upcoming={upcoming || undefined}>
                    <time className="tl__date tnum" dateTime={ev.date}>{formatDate(ev.date, lang, { day: 'numeric', month: 'long' })}</time>
                    <div className="tl__card">
                      {upcoming && <span className="tl__badge">{dict.timeline.upcoming}</span>}
                      <h3 className="display">{pick(ev.title, lang)}</h3>
                      {pick(ev.detail, lang) && <p>{pick(ev.detail, lang)}</p>}
                      {link && <Link className="link" href={link}>{dict.timeline.open}</Link>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
