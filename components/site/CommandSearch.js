'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const GROUPS = ['characters', 'locations', 'vehicles', 'facts', 'news', 'trailers', 'theories'];

function resultHref(lang, r) {
  const prefix = lang === 'es' ? '' : `/${lang}`;
  return r.kind === 'article' ? `${prefix}/noticias/${r.slug}` : `${prefix}/${r.type}/${r.slug}`;
}

/** Instant search palette. Opens with "/" or ⌘K / Ctrl+K. Queries /api/search (published content only). */
export function CommandSearch({ lang, open, onOpenChange, labels }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  // Global shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return undefined;
    document.documentElement.classList.add('is-locked');
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => { clearTimeout(t); document.documentElement.classList.remove('is-locked'); };
  }, [open]);

  // Debounced fetch
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); setLoading(false); return undefined; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&lang=${lang}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setActive(0);
      } catch (e) {
        if (e.name !== 'AbortError') setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 160);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, lang]);

  const counts = useMemo(() => {
    const c = {};
    for (const r of results) c[r.type] = (c[r.type] || 0) + 1;
    return c;
  }, [results]);
  const shown = filter === 'all' ? results : results.filter((r) => r.type === filter);

  useEffect(() => {
    const el = listRef.current?.children?.[active];
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const close = () => { onOpenChange(false); };
  const go = (r) => { close(); router.push(resultHref(lang, r)); };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (shown[active]) go(shown[active]);
      else if (q.trim().length >= 2) { close(); router.push(`${labels.searchHref}?q=${encodeURIComponent(q.trim())}`); }
    }
  };

  const term = q.trim();
  return (
    <div className="cmd" role="dialog" aria-modal="true" aria-label={labels.open} onKeyDown={onKeyDown}>
      <button type="button" className="cmd__scrim" aria-label={labels.close} onClick={close} tabIndex={-1} />
      <div className="cmd__panel">
        <div className="cmd__field">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.placeholder}
            aria-label={labels.open}
            role="combobox"
            aria-expanded={shown.length > 0}
            aria-controls="cmd-results"
            aria-activedescendant={shown[active] ? `cmd-r-${shown[active].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="cmd__esc" onClick={close}>Esc</button>
        </div>

        {results.length > 0 && (
          <div className="cmd__filters" role="tablist">
            <button type="button" role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>{labels.all} <span className="tnum">{results.length}</span></button>
            {GROUPS.filter((g) => counts[g]).map((g) => (
              <button key={g} type="button" role="tab" aria-selected={filter === g} onClick={() => { setFilter(g); setActive(0); }}>
                {labels.typesPlural[g]} <span className="tnum">{counts[g]}</span>
              </button>
            ))}
          </div>
        )}

        <div className="cmd__body" aria-live="polite">
          {term.length < 2 && <p className="cmd__hint">{labels.hint}</p>}
          {term.length >= 2 && loading && results.length === 0 && (
            <ul className="cmd__skeleton" aria-label={labels.searching}>{[0, 1, 2].map((i) => <li key={i} />)}</ul>
          )}
          {term.length >= 2 && !loading && results.length === 0 && <p className="cmd__hint">{labels.noResults.replace('{q}', term)}</p>}
          {shown.length > 0 && (
            <ul id="cmd-results" ref={listRef} className="cmd__results" role="listbox">
              {shown.map((r, i) => (
                <li key={`${r.kind}-${r.id}`} id={`cmd-r-${r.id}`} role="option" aria-selected={i === active}>
                  <a href={resultHref(lang, r)} onClick={(e) => { e.preventDefault(); go(r); }} onMouseMove={() => setActive(i)}>
                    <span className="cmd__thumb">{r.image ? <img src={r.image} alt="" loading="lazy" /> : <span className="cmd__thumb-empty" />}</span>
                    <span className="cmd__text">
                      <strong>{r.title}</strong>
                      {r.excerpt && <span>{r.excerpt}</span>}
                    </span>
                    <span className="cmd__type">{labels.types[r.type] || r.type}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {term.length >= 2 && (
          <a className="cmd__all" href={`${labels.searchHref}?q=${encodeURIComponent(term)}`} onClick={(e) => { e.preventDefault(); close(); router.push(`${labels.searchHref}?q=${encodeURIComponent(term)}`); }}>
            {labels.seeAll}: «{term}» <kbd>↵</kbd>
          </a>
        )}
      </div>
    </div>
  );
}
