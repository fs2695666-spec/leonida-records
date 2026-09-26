'use client';
import Link from 'next/link';
import { useState } from 'react';

/**
 * Featured records: an index list on the left drives a large arch-framed image.
 * `items` are pre-resolved on the server: {id, href, title, kicker, short, image, alt, evidence:{label,level}}
 */
export function Spotlight({ items, openLabel }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const current = items[active];
  return (
    <div className="spotlight">
      <ol className="spotlight__index">
        {items.map((it, i) => (
          <li key={it.id} data-active={i === active || undefined}>
            <Link href={it.href} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
              <span className="spotlight__n tnum">{String(i + 1).padStart(2, '0')}</span>
              <span className="spotlight__name">{it.title}</span>
              <span className="spotlight__kicker">{it.kicker}</span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="spotlight__stage" aria-live="polite">
        <div className="spotlight__frame">
          {items.map((it, i) => (
            it.image
              ? <img key={it.id} src={it.image} alt={i === active ? it.alt : ''} data-active={i === active || undefined} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
              : <div key={it.id} className="spotlight__blank" data-active={i === active || undefined} aria-hidden="true" />
          ))}
        </div>
        <div className="spotlight__caption" key={current.id}>
          <span className="evidence" data-level={current.evidence.level}>{current.evidence.label}</span>
          <p className="spotlight__title display">{current.title}</p>
          {current.short && <p className="spotlight__short">{current.short}</p>}
          <Link href={current.href} className="btn btn--primary btn--small">{openLabel}</Link>
        </div>
      </div>

      {/* Mobile: horizontal snap carousel */}
      <ul className="spotlight__rail">
        {items.map((it) => (
          <li key={it.id}>
            <Link href={it.href}>
              <span className="spotlight__rail-img">{it.image && <img src={it.image} alt="" loading="lazy" decoding="async" />}</span>
              <span className="spotlight__kicker">{it.kicker}</span>
              <span className="spotlight__rail-title display">{it.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
