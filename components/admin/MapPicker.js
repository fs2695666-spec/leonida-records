'use client';
import { COAST, KEYS } from '@/lib/map-shape';

/** Click on the illustrative map to set a location's pin (0–100 coordinates). */
export function MapPicker({ value, onChange }) {
  const onClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 1000) / 10;
    const y = Math.round(((e.clientY - r.top) / r.height) * 1000) / 10;
    onChange({ x, y });
  };
  return (
    <div className="mappick">
      <svg viewBox="0 0 100 100" onClick={onClick} role="img" aria-label="Mapa: haz clic para colocar el punto">
        <rect width="100" height="100" fill="#e9f6f8" />
        <path d={COAST} fill="#fff1c9" stroke="#1d1a3a" strokeOpacity="0.5" strokeWidth="0.3" />
        {KEYS.map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#fff1c9" stroke="#1d1a3a" strokeOpacity="0.5" strokeWidth="0.25" />)}
        {[20, 40, 60, 80].map((v) => <g key={v} stroke="#1d1a3a" strokeOpacity="0.08" strokeWidth="0.2"><line x1={v} y1="0" x2={v} y2="100" /><line x1="0" y1={v} x2="100" y2={v} /></g>)}
        {value && <g transform={`translate(${value.x} ${value.y})`}><circle r="3.2" fill="#ef4f85" fillOpacity="0.25" /><circle r="1.5" fill="#ef4f85" stroke="#fff" strokeWidth="0.5" /></g>}
      </svg>
      <div className="mappick__row">
        <span className="tnum">{value ? `x ${value.x} · y ${value.y}` : 'Sin posición: no aparece en el mapa de la portada.'}</span>
        {value && <button type="button" className="abtn abtn--small abtn--ghost" onClick={() => onChange(null)}>Quitar del mapa</button>}
      </div>
    </div>
  );
}
