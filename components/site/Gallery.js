'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Editorial gallery with an accessible lightbox.
 * items: [{id, src, alt, caption, credit, href?, hrefLabel?}]
 */
export function Gallery({ items, labels, layout = 'mosaic', limit }) {
  const [open, setOpen] = useState(-1);
  const closeRef = useRef(null);
  const touch = useRef(null);
  const lastFocus = useRef(null);
  const shown = limit ? items.slice(0, limit) : items;

  const close = useCallback(() => {
    setOpen(-1);
    lastFocus.current?.focus?.();
  }, []);
  const step = useCallback((d) => setOpen((i) => (i + d + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (open < 0) return undefined;
    document.documentElement.classList.add('is-locked');
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.classList.remove('is-locked'); };
  }, [open, close, step]);

  if (!items.length) return <p className="empty-note">{labels.empty}</p>;
  const cur = items[open];

  return (
    <>
      <ul className={`gallery gallery--${layout}`}>
        {shown.map((it, i) => (
          <li key={it.id} className="gallery__item">
            <button type="button" onClick={(e) => { lastFocus.current = e.currentTarget; setOpen(i); }} aria-label={it.alt || it.caption || labels.open}>
              <img src={it.src} alt={it.alt || ''} loading="lazy" decoding="async" />
            </button>
            {(it.caption || it.credit) && (
              <p className="gallery__cap">{it.caption}{it.credit && <span> · {it.credit}</span>}</p>
            )}
          </li>
        ))}
      </ul>

      {cur && typeof document !== 'undefined' && createPortal(
        // Portal to <body>: the lightbox must never depend on its ancestors' positioning.
        <div
          className="lightbox" role="dialog" aria-modal="true" aria-label={cur.caption || cur.alt}
          onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 50 && items.length > 1) step(dx < 0 ? 1 : -1);
          }}
        >
          <button type="button" className="lightbox__scrim" onClick={close} tabIndex={-1} aria-label={labels.close} />
          <figure className="lightbox__figure">
            <img key={cur.src} src={cur.src} alt={cur.alt || ''} />
            <figcaption>
              <span className="tnum">{open + 1} / {items.length}</span>
              {cur.caption && <strong>{cur.caption}</strong>}
              {cur.credit && <span>{labels.credit}: {cur.credit}</span>}
              {cur.href && <a className="link" href={cur.href}>{cur.hrefLabel}</a>}
            </figcaption>
          </figure>
          <div className="lightbox__controls">
            {items.length > 1 && <button type="button" onClick={() => step(-1)} aria-label={labels.prev}>‹</button>}
            {items.length > 1 && <button type="button" onClick={() => step(1)} aria-label={labels.next}>›</button>}
            <button type="button" ref={closeRef} onClick={close} className="lightbox__close">{labels.close}</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
