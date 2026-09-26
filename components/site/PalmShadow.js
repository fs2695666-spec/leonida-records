/** Hand-drawn palm frond silhouettes used as a soft shadow overlay. Decorative only. */
export function PalmShadow({ className = 'palm-shadow' }) {
  const frond = 'M0 0 C 40 -18, 110 -22, 180 6 C 120 -4, 60 2, 0 0 Z';
  const leaflets = Array.from({ length: 14 }, (_, i) => {
    const t = (i + 1) / 15;
    const x = 12 * t * 15;
    const y = -8 * Math.sin(t * Math.PI) + t * 4;
    const len = 46 - Math.abs(t - 0.45) * 50;
    return { x, y, len, a: 58 + t * 30 };
  });
  const Frond = ({ transform }) => (
    <g transform={transform}>
      <path d={frond} />
      {leaflets.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y})`}>
          <path d={`M0 0 Q ${l.len * 0.3} ${l.len * 0.25} ${l.len * 0.35} ${l.len}`} strokeWidth="5" stroke="currentColor" fill="none" transform={`rotate(${-l.a + 90})`} strokeLinecap="round" />
          <path d={`M0 0 Q ${l.len * 0.3} ${-l.len * 0.25} ${l.len * 0.35} ${-l.len}`} strokeWidth="5" stroke="currentColor" fill="none" transform={`rotate(${l.a - 90})`} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 600 600" aria-hidden="true" focusable="false" preserveAspectRatio="xMaxYMin slice">
      <g className="palm-shadow__sway" fill="currentColor" color="currentColor">
        <Frond transform="translate(560 40) rotate(160) scale(1.5)" />
        <Frond transform="translate(560 40) rotate(128) scale(1.35)" />
        <Frond transform="translate(560 40) rotate(196) scale(1.25)" />
        <Frond transform="translate(560 40) rotate(100) scale(1.1)" />
        <Frond transform="translate(560 40) rotate(222) scale(1.0)" />
      </g>
    </svg>
  );
}
