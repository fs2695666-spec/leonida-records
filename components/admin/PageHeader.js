import Link from 'next/link';

export function PageHeader({ title, lead, crumbs = [], actions }) {
  return (
    <header className="ph">
      {crumbs.length > 0 && (
        <nav className="ph__crumbs" aria-label="Ruta">
          {crumbs.map((c, i) => (
            <span key={i}>{c.href ? <Link href={c.href}>{c.label}</Link> : c.label}{i < crumbs.length - 1 && <span aria-hidden="true"> / </span>}</span>
          ))}
        </nav>
      )}
      <div className="ph__row">
        <div>
          <h1 className="ph__title">{title}</h1>
          {lead && <p className="ph__lead">{lead}</p>}
        </div>
        {actions && <div className="ph__actions">{actions}</div>}
      </div>
    </header>
  );
}
