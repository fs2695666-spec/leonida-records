import { useId } from 'react';

/** Retro sunset disc used as the Leonida Records mark. Unique ids per instance: a hidden
 *  copy (e.g. a display:none top bar) would otherwise break every other copy's gradient. */
export function SunMark({ size = 28, className }) {
  const uid = useId().replace(/:/g, '');
  const g = `lr-sun-${uid}`;
  const m = `lr-cut-${uid}`;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffcf6e" />
          <stop offset="0.45" stopColor="#ff9b86" />
          <stop offset="0.8" stopColor="#ef4f85" />
          <stop offset="1" stopColor="#a58ff0" />
        </linearGradient>
        <mask id={m}>
          <rect width="32" height="32" fill="#fff" />
          <rect x="0" y="17.2" width="32" height="1.4" fill="#000" />
          <rect x="0" y="21" width="32" height="1.9" fill="#000" />
          <rect x="0" y="25.2" width="32" height="2.5" fill="#000" />
        </mask>
      </defs>
      <circle cx="16" cy="16" r="15" fill={`url(#${g})`} mask={`url(#${m})`} />
    </svg>
  );
}

export function Wordmark({ name = 'Leonida Records' }) {
  const [first, ...rest] = name.split(' ');
  return (
    <span className="wordmark">
      <SunMark />
      <span className="wordmark__text">
        <span>{first}</span> <em>{rest.join(' ')}</em>
      </span>
    </span>
  );
}
