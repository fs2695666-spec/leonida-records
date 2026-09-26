'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAction, useConfirm, EmptyState } from './ui';

const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Generic admin table: search, filters, sort, pagination, multi-select and bulk actions.
 * Everything runs client-side over the rows passed in (fine for thousands of rows).
 */
export function DataTable({
  rows, columns, searchText, filters = [], initial = {}, bulkActions = [], rowHref,
  emptyTitle = 'Nada por aquí', emptyText, emptyAction, pageSize = 25, defaultSort = { key: 'updated', dir: 'desc' }, searchPlaceholder = 'Buscar…',
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [run, busy] = useAction();
  const [q, setQ] = useState(initial.q || '');
  const [f, setF] = useState(() => Object.fromEntries(filters.map((x) => [x.key, initial[x.key] || ''])));
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState(new Set());

  const filtered = useMemo(() => {
    const nq = norm(q);
    let out = rows.filter((r) => (!nq || norm(searchText(r)).includes(nq)) && filters.every((x) => !f[x.key] || x.test(r, f[x.key])));
    const col = columns.find((c) => c.key === sort.key);
    if (col?.sort) {
      out = [...out].sort((a, b) => {
        const va = col.sort(a); const vb = col.sort(b);
        const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va ?? '').localeCompare(String(vb ?? ''), 'es');
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, f, sort, columns, filters, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const allShownSelected = shown.length > 0 && shown.every((r) => sel.has(r.id));
  const toggleAll = () => {
    const next = new Set(sel);
    if (allShownSelected) shown.forEach((r) => next.delete(r.id)); else shown.forEach((r) => next.add(r.id));
    setSel(next);
  };
  const toggle = (id) => { const n = new Set(sel); if (n.has(id)) n.delete(id); else n.add(id); setSel(n); };
  const setFilter = (k, v) => { setF((x) => ({ ...x, [k]: v })); setPage(1); };
  const activeFilters = q || Object.values(f).some(Boolean);

  const doBulk = async (a) => {
    const ids = [...sel];
    if (a.confirm) {
      const okd = await confirm({ title: a.confirm.title(ids.length), message: a.confirm.message, confirmLabel: a.label, danger: a.danger });
      if (!okd) return;
    }
    const res = await run(a.run(ids), a.success?.(ids.length) || 'Hecho');
    if (res) setSel(new Set());
  };

  const sortBy = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));

  return (
    <div className="dt">
      <div className="dt__bar">
        <div className="dt__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" className="input" placeholder={searchPlaceholder} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Buscar" />
        </div>
        {filters.map((x) => (
          <select key={x.key} className="input dt__filter" value={f[x.key]} onChange={(e) => setFilter(x.key, e.target.value)} aria-label={x.label}>
            <option value="">{x.label}: todos</option>
            {x.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        {activeFilters && <button type="button" className="abtn abtn--small abtn--ghost" onClick={() => { setQ(''); setF(Object.fromEntries(filters.map((x) => [x.key, '']))); }}>Limpiar</button>}
        <span className="dt__count tnum">{filtered.length} de {rows.length}</span>
      </div>

      {sel.size > 0 && (
        <div className="dt__bulk" role="region" aria-label="Acciones en bloque">
          <strong className="tnum">{sel.size} seleccionados</strong>
          {bulkActions.map((a) => (
            <button key={a.label} type="button" className={`abtn abtn--small ${a.danger ? 'abtn--danger' : ''}`} disabled={busy} onClick={() => doBulk(a)}>{a.label}</button>
          ))}
          <button type="button" className="abtn abtn--small abtn--ghost" onClick={() => setSel(new Set())}>Deseleccionar</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={activeFilters ? 'Ningún resultado con estos filtros' : emptyTitle} action={!activeFilters && emptyAction}>{activeFilters ? 'Prueba a quitar algún filtro.' : emptyText}</EmptyState>
      ) : (
        <div className="dt__scroll">
          <table className="dt__table">
            <thead>
              <tr>
                {bulkActions.length > 0 && <th className="dt__check"><input type="checkbox" checked={allShownSelected} onChange={toggleAll} aria-label="Seleccionar página" /></th>}
                {columns.map((c) => (
                  <th key={c.key} className={c.className} aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {c.sort ? <button type="button" onClick={() => sortBy(c.key)}>{c.label}{sort.key === c.key && <span aria-hidden="true">{sort.dir === 'asc' ? ' ↑' : ' ↓'}</span>}</button> : c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} data-selected={sel.has(r.id) || undefined} onClick={(e) => {
                  if (!rowHref || e.target.closest('a,button,input,label')) return;
                  router.push(rowHref(r));
                }} className={rowHref ? 'is-link' : undefined}>
                  {bulkActions.length > 0 && <td className="dt__check"><input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} aria-label="Seleccionar" /></td>}
                  {columns.map((c) => <td key={c.key} className={c.className} data-label={c.label}>{c.render(r)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="dt__pager" aria-label="Paginación">
          <button type="button" className="abtn abtn--small" disabled={cur <= 1} onClick={() => setPage(cur - 1)}>← Anterior</button>
          <span className="tnum">Página {cur} de {pages}</span>
          <button type="button" className="abtn abtn--small" disabled={cur >= pages} onClick={() => setPage(cur + 1)}>Siguiente →</button>
        </nav>
      )}
    </div>
  );
}
