'use client';
import Link from 'next/link';
import { useState } from 'react';
import { COAST, KEYS } from '@/lib/map-shape';

const gridRef = (x, y) => `${'ABCDE'[Math.min(4, Math.floor(x / 20))]}${Math.min(5, Math.floor(y / 20) + 1)} · ${x}/${y}`;

/**
 * Illustrative map of Leonida (own drawing, not the game map).
 * `places`: [{id, title, kicker, short, image, href, x, y, evidence:{label,level}}] pre-resolved server side.
 */
export function WorldMap({ places, labels }) {
  const [active, setActive] = useState(() => Math.max(0, places.findIndex((p) => p.featured)));
  const current = places[active];
  if (!places.length) return null;

  return (
    <div className="worldmap">
      <div className="worldmap__chart">
        <svg viewBox="0 0 100 100" role="group" aria-label={labels.title}>
          <defs>
            <pattern id="wm-waves" width="4" height="2.4" patternUnits="userSpaceOnUse">
              <path d="M0 1.2 q1 -0.9 2 0 t2 0" fill="none" stroke="#3fb9c2" strokeOpacity="0.28" strokeWidth="0.18" />
            </pattern>
            <linearGradient id="wm-land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff1c9" />
              <stop offset="0.55" stopColor="#ffe2d1" />
              <stop offset="1" stopColor="#fbd3e1" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#wm-waves)" />
          {[20, 40, 60, 80].map((v) => (
            <g key={v} stroke="#1d1a3a" strokeOpacity="0.07" strokeWidth="0.15">
              <line x1={v} y1="0" x2={v} y2="100" />
              <line x1="0" y1={v} x2="100" y2={v} />
            </g>
          ))}
          <path d={COAST} fill="none" stroke="#3fb9c2" strokeOpacity="0.18" strokeWidth="3.2" strokeLinejoin="round" />
          <path d={COAST} fill="none" stroke="#3fb9c2" strokeOpacity="0.3" strokeWidth="1.4" strokeLinejoin="round" />
          <path d={COAST} fill="url(#wm-land)" stroke="#1d1a3a" strokeOpacity="0.55" strokeWidth="0.3" strokeLinejoin="round" />
          <path d="M49 58 C52 55 58 56 60 60 C61 64 57 68 53 67 C50 66 48 62 49 58 Z" fill="#c4e6f5" fillOpacity="0.8" />
          <path d="M44 16 C47 14 51 15 52 18 C52 21 48 22 45 21 Z" fill="#c4e6f5" fillOpacity="0.8" />
          {KEYS.map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="url(#wm-land)" stroke="#1d1a3a" strokeOpacity="0.5" strokeWidth="0.25" transform={`rotate(-14 ${x} ${y})`} />)}
          <g className="worldmap__compass" transform="translate(90 12)">
            <circle r="5.2" fill="#fff" fillOpacity="0.7" stroke="#1d1a3a" strokeOpacity="0.3" strokeWidth="0.2" />
            <path d="M0 -4.2 L1.1 0 L0 4.2 L-1.1 0 Z" fill="#ef4f85" />
            <text y="-6.4" textAnchor="middle" fontSize="2.4" fill="#1d1a3a">N</text>
          </g>
        </svg>

        <ul className="worldmap__pins">
          {places.map((p, i) => (
            <li key={p.id} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <button
                type="button"
                className="worldmap__pin"
                data-active={i === active || undefined}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="worldmap__dot" aria-hidden="true" />
                <span className="worldmap__label">{p.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {current && (
        <aside className="worldmap__card" aria-live="polite">
          <div className="worldmap__card-img">
            {current.image ? <img key={current.id} src={current.image} alt={current.alt || current.title} loading="lazy" decoding="async" /> : <div className="worldmap__card-blank" />}
          </div>
          <div className="worldmap__card-body" key={`b-${current.id}`}>
            <p className="worldmap__coords tnum">{gridRef(current.x, current.y)}</p>
            <h3 className="display">{current.title}</h3>
            <span className="evidence" data-level={current.evidence.level}>{current.evidence.label}</span>
            {current.short && <p>{current.short}</p>}
            <Link className="link" href={current.href}>{labels.open}</Link>
          </div>
        </aside>
      )}
    </div>
  );
}
