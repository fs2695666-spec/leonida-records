import Link from 'next/link';
import { ENTITY_TYPES, EVIDENCE, getDictionary, href } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { listEntities } from '@/lib/data/public';
import { EntityCard } from '@/components/site/Cards';

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const filtered = Boolean(sp?.type || sp?.status || sp?.q);
  return buildMetadata({ lang, path: '/explore', title: dict.explore.title, description: dict.explore.lead, noindex: filtered });
}

export default async function Explore({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const type = ENTITY_TYPES.includes(sp?.type) ? sp.type : '';
  const status = EVIDENCE.includes(sp?.status) ? sp.status : '';
  const q = typeof sp?.q === 'string' ? sp.q.slice(0, 60) : '';
  const items = await listEntities({ type: type || undefined, status: status || undefined, q: q || undefined });
  const base = href(lang, '/explore');
  const qs = (patch) => {
    const p = new URLSearchParams();
    const next = { type, status, q, ...patch };
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div className="explore">
      <header className="page-head wrap">
        <h1 className="page-head__title display">{dict.explore.title}</h1>
        <p className="page-head__lead">{dict.explore.lead}</p>
      </header>

      <div className="explore__bar wrap">
        <form action={base} method="get" className="explore__search" role="search">
          {type && <input type="hidden" name="type" value={type} />}
          {status && <input type="hidden" name="status" value={status} />}
          <label className="sr-only" htmlFor="explore-q">{dict.explore.filterPlaceholder}</label>
          <input id="explore-q" type="search" name="q" defaultValue={q} placeholder={dict.explore.filterPlaceholder} />
          <button className="btn btn--primary btn--small" type="submit">{dict.explore.apply}</button>
        </form>
        <nav className="chips" aria-label={dict.entity.type}>
          <Link href={qs({ type: '' })} aria-current={!type ? 'true' : undefined}>{dict.explore.all}</Link>
          {ENTITY_TYPES.map((t) => <Link key={t} href={qs({ type: t })} aria-current={type === t ? 'true' : undefined}>{dict.types[t]}</Link>)}
        </nav>
        <nav className="chips chips--ev" aria-label={dict.entity.evidence}>
          <Link href={qs({ status: '' })} aria-current={!status ? 'true' : undefined}>{dict.explore.allEvidence}</Link>
          {EVIDENCE.map((l) => (
            <Link key={l} href={qs({ status: l })} aria-current={status === l ? 'true' : undefined} data-level={l} title={dict.evidence[l].text}>
              {dict.evidence[l].label}
            </Link>
          ))}
        </nav>
        <p className="explore__count tnum" aria-live="polite">
          {dict.explore.results(items.length)}
          {(type || status || q) && <> · <Link className="link" href={base}>{dict.explore.reset}</Link></>}
        </p>
      </div>

      <div className="wrap">
        {items.length === 0
          ? <p className="empty-note">{dict.explore.empty}</p>
          : <div className="card-grid card-grid--3">{items.map((e) => <EntityCard key={e.id} entity={e} lang={lang} variant={e.image ? 'wide' : 'text'} />)}</div>}
      </div>
    </div>
  );
}
