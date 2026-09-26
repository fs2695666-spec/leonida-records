import Link from 'next/link';
import { formatDate, getDictionary, href, pick } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { listEntities, listGallery } from '@/lib/data/public';
import { Gallery } from '@/components/site/Gallery';
import { Img } from '@/components/site/Img';
import { youtubeId } from '@/components/site/RichText';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/media', title: dict.media.title, description: dict.media.lead });
}

export default async function MediaPage({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const [videos, gallery] = await Promise.all([listEntities({ type: 'trailers' }), listGallery({ limit: 120 })]);
  const items = gallery.map((m) => ({
    id: m.id, src: m.url, alt: m.alt, caption: m.caption, credit: m.credit,
    href: m.links[0] ? href(lang, `/${m.links[0].type}/${m.links[0].slug}`) : undefined,
    hrefLabel: m.links[0] ? pick(m.links[0].title, lang) : undefined,
  }));

  return (
    <div className="media-page">
      <header className="page-head wrap">
        <h1 className="page-head__title display">{dict.media.title}</h1>
        <p className="page-head__lead">{dict.media.lead}</p>
      </header>

      {videos.length > 0 && (
        <section className="wrap media-page__videos" aria-labelledby="videos-h">
          <h2 id="videos-h" className="record-section__title">{dict.media.videos}</h2>
          <ul className="video-list">
            {[...videos].sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || '')).map((v) => {
              const id = youtubeId(v.videoUrl);
              const thumb = v.image || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);
              return (
                <li key={v.id}>
                  <Link href={href(lang, `/trailers/${v.slug}`)} className="video-card">
                    <span className="video-card__thumb">
                      {thumb && <Img src={thumb} alt="" sizes="(min-width: 1000px) 30vw, 92vw" />}
                      <span className="video-card__play" aria-hidden="true" />
                    </span>
                    <span className="video-card__meta">{v.releaseDate ? formatDate(v.releaseDate, lang, { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
                    <strong className="display">{pick(v.title, lang)}</strong>
                    {pick(v.short, lang) && <span className="video-card__short">{pick(v.short, lang)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="wrap" aria-labelledby="gallery-h">
        <h2 id="gallery-h" className="record-section__title">{dict.media.gallery}</h2>
        <Gallery items={items} layout="masonry" labels={{ close: dict.media.close, prev: dict.media.prev, next: dict.media.next, credit: dict.media.credit, empty: dict.media.empty, open: dict.media.gallery }} />
      </section>
    </div>
  );
}
