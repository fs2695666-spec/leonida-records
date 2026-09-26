import Link from 'next/link';
import { formatDate, getDictionary, href, pick } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { getSettings, getStats, listArticles, listEntities, listGallery } from '@/lib/data/public';
import { Img } from '@/components/site/Img';
import { PalmShadow } from '@/components/site/PalmShadow';
import { SunMark } from '@/components/site/Logo';
import { Evidence } from '@/components/site/Evidence';
import { ArticleCard, SectionHead, entityHref } from '@/components/site/Cards';
import { Spotlight } from '@/components/site/Spotlight';
import { LeonidaMap } from '@/components/site/LeonidaMap';
import { Gallery } from '@/components/site/Gallery';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const settings = await getSettings().catch(() => ({}));
  return buildMetadata({ lang, path: '/', image: settings.hero_image || undefined });
}

function daysUntil(date) {
  if (!date) return null;
  const target = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / 86400000);
}

export default async function Home({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const h = dict.home;

  const [settings, stats, featured, characters, locations, vehicles, facts, news, gallery, latest] = await Promise.all([
    getSettings(), getStats(),
    listEntities({ featured: true, limit: 8 }),
    listEntities({ type: 'characters', limit: 4 }),
    listEntities({ type: 'locations', limit: 40 }),
    listEntities({ type: 'vehicles', limit: 3 }),
    listEntities({ type: 'facts', limit: 3 }),
    listArticles({ limit: 6 }),
    listGallery({ limit: 12 }),
    listEntities({ order: 'recent', limit: 6 }),
  ]);

  const days = daysUntil(settings.release_date);
  const heroImage = settings.hero_image;
  const heroVideo = typeof settings.hero_video === 'string' && /^https:\/\//.test(settings.hero_video) ? settings.hero_video : null;
  const [lead, ...restNews] = news.items;

  const blocks = [
    { key: 'characters', item: characters[0], count: stats.byType.characters || 0 },
    { key: 'locations', item: locations.find((l) => l.image) || locations[0], count: stats.byType.locations || 0 },
    { key: 'vehicles', item: vehicles[0], count: stats.byType.vehicles || 0 },
    { key: 'facts', item: facts[0], count: stats.byType.facts || 0 },
  ];

  const ev = (level) => ({ level, label: (dict.evidence[level] || dict.evidence.OBSERVED).label });
  const spotlight = featured.filter((e) => e.type !== 'facts').slice(0, 6).map((e) => ({
    id: e.id, href: entityHref(lang, e), title: pick(e.title, lang), kicker: dict.typeSingular[e.type],
    short: pick(e.short, lang), image: e.image, alt: e.imageAlt || pick(e.title, lang), evidence: ev(e.status),
  }));
  const places = locations.filter((l) => l.map && Number.isFinite(l.map.x) && Number.isFinite(l.map.y)).map((l) => ({
    id: l.id, href: entityHref(lang, l), title: pick(l.title, lang), short: pick(l.short, lang), image: l.image, alt: l.imageAlt,
    x: l.map.x, y: l.map.y, featured: l.featured, evidence: ev(l.status),
  }));
  const galleryItems = gallery.map((m) => ({
    id: m.id, src: m.url, alt: m.alt, caption: m.caption, credit: m.credit,
    href: m.links[0] ? href(lang, `/${m.links[0].type}/${m.links[0].slug}`) : undefined,
    hrefLabel: m.links[0] ? pick(m.links[0].title, lang) : undefined,
  }));

  return (
    <>
      {/* ------------------------------------------------------------ HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__bg" aria-hidden="true">
          {heroVideo
            ? <video src={heroVideo} poster={heroImage || undefined} autoPlay muted loop playsInline preload="metadata" />
            : heroImage && <Img src={heroImage} alt="" priority sizes="100vw" />}
        </div>
        <div className="hero__wash" aria-hidden="true" />
        <PalmShadow />
        <div className="hero__grain" aria-hidden="true" />

        <div className="hero__inner wrap">
          <p className="hero__kicker"><SunMark size={20} /> {dict.meta.tagline}</p>
          <h1 id="hero-title" className="hero__title display">
            <span>Leonida</span>
            <em>Records</em>
          </h1>
          <p className="hero__lead">{h.heroLead}</p>
          <div className="hero__ctas">
            <Link className="btn btn--primary" href={href(lang, '/explore')}>{h.ctaExplore}</Link>
            <Link className="btn btn--ghost btn--glass" href={href(lang, '/noticias')}>{h.ctaTimes}</Link>
          </div>
        </div>

        {settings.release_date && (
          <aside className="stamp" aria-label={h.release}>
            <div className="stamp__inner">
              <p className="stamp__label">{h.release}</p>
              <p className="stamp__date display">{formatDate(settings.release_date, lang, { day: 'numeric', month: 'short' })}</p>
              <p className="stamp__year tnum">{settings.release_date.slice(0, 4)}</p>
              <p className="stamp__days">{days > 0 ? h.daysLeft(days) : h.released}</p>
            </div>
          </aside>
        )}

        <dl className="hero__stats wrap">
          <div><dt>{h.records}</dt><dd className="tnum">{stats.total}</dd></div>
          <div><dt>{h.sources}</dt><dd className="tnum">{stats.sources}</dd></div>
          <div><dt>{h.updated}</dt><dd>{formatDate(stats.lastUpdated, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
          <div className="hero__unofficial"><dt className="sr-only">Info</dt><dd>{h.unofficial}</dd></div>
        </dl>
      </section>

      {/* --------------------------------------------------------- ARCHIVE */}
      <section className="archive wrap" aria-labelledby="archive-title">
        <SectionHead id="archive-title" index="I" title={h.archiveTitle} lead={h.archiveLead} />
        <div className="archive__grid">
          {blocks.map(({ key, item, count }) => (
            <Link key={key} href={href(lang, `/${key}`)} className={`door door--${key}`}>
              {key !== 'facts' && item?.image && (
                <span className="door__img"><Img src={item.image} alt="" sizes={key === 'locations' ? '(min-width: 1000px) 55vw, 92vw' : '(min-width: 1000px) 38vw, 92vw'} /></span>
              )}
              <span className="door__body">
                <span className="door__count tnum">{h.recordsCount(count)}</span>
                <span className="door__title display">{dict.types[key]}</span>
                <span className="door__intro">{dict.typeIntro[key]}</span>
                {key === 'facts' && item && <span className="door__fact">“{pick(item.title, lang)}”</span>}
              </span>
            </Link>
          ))}
          <Link href={href(lang, '/noticias')} className="door door--news">
            <span className="door__body">
              <span className="door__count tnum">{h.recordsCount(stats.news)}</span>
              <span className="door__title display">{dict.types.news}</span>
              <span className="door__intro">{h.timesLead}</span>
            </span>
            {lead && (
              <span className="door__headline">
                <span className="door__headline-kicker">{dict.times.latest}</span>
                <span className="door__headline-title display">{pick(lead.title, lang)}</span>
              </span>
            )}
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------------- FEATURED */}
      {spotlight.length > 0 && (
        <section className="featured" aria-labelledby="featured-title">
          <div className="wrap">
            <SectionHead id="featured-title" index="II" title={h.featuredTitle} lead={h.featuredLead} />
            <Spotlight items={spotlight} openLabel={h.openRecord} />
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- TIMES */}
      <section className="times-front" aria-labelledby="times-title">
        <div className="wrap">
          <header className="masthead">
            <p className="masthead__edge"><span>{dict.times.edition}</span><span>{formatDate(new Date().toISOString(), lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
            <h2 id="times-title" className="masthead__name display"><Link href={href(lang, '/noticias')}>{dict.times.name}</Link></h2>
            <p className="masthead__motto">{dict.times.motto}</p>
          </header>
          {lead ? (
            <div className="times-front__grid">
              <div className="times-front__lead"><ArticleCard article={lead} lang={lang} variant="lead" headingLevel={3} priority={false} sizes="(min-width: 1000px) 58vw, 92vw" /></div>
              <div className="times-front__col">
                {restNews.slice(0, 2).map((a) => <ArticleCard key={a.id} article={a} lang={lang} variant="column" sizes="(min-width: 1000px) 25vw, 92vw" />)}
              </div>
              <div className="times-front__briefs">
                <h3 className="times-front__briefs-title">{dict.times.latest}</h3>
                {restNews.slice(2, 6).map((a) => <ArticleCard key={a.id} article={a} lang={lang} variant="brief" headingLevel={4} />)}
                <Link className="btn btn--small" href={href(lang, '/noticias')}>{h.allNews}</Link>
              </div>
            </div>
          ) : <p className="empty-note">{dict.times.empty}</p>}
        </div>
      </section>

      {/* ------------------------------------------------------------- MAP */}
      <section className="world" aria-labelledby="world-title">
        <div className="wrap">
          <SectionHead id="world-title" index="III" title={h.worldTitle} lead={h.worldLead}
            action={<Link className="btn btn--small" href={href(lang, '/locations')}>{h.allLocations}</Link>} />
          <LeonidaMap places={places} labels={{ title: h.worldTitle, open: h.openRecord }} t={h.map} />
        </div>
      </section>

      {/* ----------------------------------------------------------- MEDIA */}
      {galleryItems.length > 0 && (
        <section className="media-home wrap" aria-labelledby="media-title">
          <SectionHead id="media-title" index="IV" title={h.mediaTitle} lead={h.mediaLead}
            action={<Link className="btn btn--small" href={href(lang, '/media')}>{h.openGallery}</Link>} />
          <Gallery items={galleryItems} limit={7} layout="mosaic"
            labels={{ close: dict.media.close, prev: dict.media.prev, next: dict.media.next, credit: dict.media.credit, empty: dict.media.empty, open: h.openGallery }} />
        </section>
      )}

      {/* ---------------------------------------------------------- LATEST */}
      <section className="latest wrap" aria-labelledby="latest-title">
        <SectionHead id="latest-title" index="V" title={h.latestTitle} lead={h.latestLead}
          action={<Link className="btn btn--small" href={href(lang, '/timeline')}>{h.seeTimeline}</Link>} />
        <ol className="ledger">
          {latest.map((e) => (
            <li key={e.id}>
              <Link href={entityHref(lang, e)} className="ledger__row">
                <time className="ledger__date tnum" dateTime={e.updatedAt}>{formatDate(e.updatedAt, lang, { day: '2-digit', month: 'short' })}</time>
                <span className="ledger__type">{dict.typeSingular[e.type]}</span>
                <span className="ledger__title">{pick(e.title, lang)}</span>
                <span className="ledger__ev"><Evidence level={e.status} lang={lang} inert /></span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
