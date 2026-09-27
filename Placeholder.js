// Artwork shown when a record has no photo yet: a line silhouette for vehicles (by class tag),
// the first letter of the name for everything else.

const P = {
  car: 'M6 34h52M10 34l5-11c1-2 3-3 5-3h20c2 0 4 1 6 3l7 8 6 1c2 0 3 2 3 4v6h-6M10 34v6h6M22 40h20M16 40a5 5 0 1 0 10 0a5 5 0 1 0-10 0M40 40a5 5 0 1 0 10 0a5 5 0 1 0-10 0M20 23l-3 8h14v-8M35 23v8h14l-6-6',
  truck: 'M4 38V18h30v20M34 24h12l8 8v6h-4M4 38h4M18 38h16M8 38a5 5 0 1 0 10 0a5 5 0 1 0-10 0M40 38a5 5 0 1 0 10 0a5 5 0 1 0-10 0M38 28h10',
  motorcycle: 'M12 40a8 8 0 1 0 0.1 0M52 40a8 8 0 1 0 0.1 0M12 40l10-12h12l6 6h12M30 28l-4-6h-6M40 34l-6-10h8',
  bicycle: 'M14 40a8 8 0 1 0 0.1 0M50 40a8 8 0 1 0 0.1 0M14 40l8-14h16l12 14M22 26l-3-5h-5M38 26l-4 14h-8M34 18h8',
  boat: 'M6 36h52l-6 10H14zM14 36l6-14h18l8 14M24 22v-8M20 28h16',
  helicopter: 'M10 16h44M32 16v6M18 30c0-5 5-8 14-8s16 4 16 10-5 8-12 8H26c-5 0-8-4-8-10M48 32h12l2-6M24 40l-2 6M38 40l2 6M16 46h30',
  plane: 'M4 34l24-4 10-16h6l-4 16 16-2 4-6h4l-2 10 2 10h-4l-4-6-16-2 4 16h-6L28 38 4 34',
  quad: 'M12 40a7 7 0 1 0 0.1 0M52 40a7 7 0 1 0 0.1 0M12 40l6-10h28l6 10M24 30l4-8h8l4 8M30 22v-6',
};
const TAG_TO_SHAPE = {
  motorcycle: 'motorcycle', bicycle: 'bicycle', quad: 'quad', boat: 'boat', motorboat: 'boat', jetski: 'boat', kayak: 'boat',
  helicopter: 'helicopter', plane: 'plane', truck: 'truck', commercial: 'truck', bus: 'truck', van: 'truck', motorhome: 'truck',
};

export function placeholderShape(entity) {
  if (entity?.type !== 'vehicles') return null;
  for (const t of entity.tags || []) if (TAG_TO_SHAPE[t]) return TAG_TO_SHAPE[t];
  if ((entity.tags || []).some((t) => /boat|squalo|yacht|kayak/.test(t))) return 'boat';
  return 'car';
}

export function Placeholder({ entity, title, className = '' }) {
  const shape = placeholderShape(entity);
  if (shape) {
    return (
      <svg className={`vsil ${className}`} viewBox="0 0 64 56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={P[shape]} />
      </svg>
    );
  }
  return <span className={`display ${className}`}>{(String(title || '').match(/[\p{L}\p{N}]/u) || [''])[0]}</span>;
}
