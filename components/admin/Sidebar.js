'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SunMark } from '@/components/site/Logo';

const I = {
  dash: 'M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z',
  content: 'M4 5h16M4 12h16M4 19h10',
  news: 'M4 4h13v16H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2M8 8h5M8 12h5M8 16h3',
  media: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
  sources: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  rel: 'M6 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M8.5 8.5l7 7',
  time: 'M12 7v5l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 13.6H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10.4 3V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
};
const Icon = ({ d }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;

export function Sidebar({ profile, isAdmin, signOutAction, counts = {} }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  const groups = [
    { label: null, items: [{ href: '/admin', label: 'Panel', icon: I.dash, exact: true }] },
    { label: 'Contenido', items: [
      { href: '/admin/content', label: 'Fichas', icon: I.content, badge: counts.drafts },
      { href: '/admin/news', label: 'The Leonida Times', icon: I.news },
      { href: '/admin/media', label: 'Media', icon: I.media },
    ] },
    { label: 'Archivo', items: [
      { href: '/admin/sources', label: 'Fuentes', icon: I.sources },
      { href: '/admin/relations', label: 'Relaciones', icon: I.rel },
      { href: '/admin/timeline', label: 'Cronología', icon: I.time },
    ] },
    ...(isAdmin ? [{ label: 'Administración', items: [
      { href: '/admin/settings', label: 'Ajustes del sitio', icon: I.cog, exact: true },
      { href: '/admin/settings/users', label: 'Usuarios', icon: I.users },
    ] }] : []),
  ];
  const active = (it) => (it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`));
  const name = profile?.display_name || profile?.email || '';

  return (
    <>
      <div className="topbar">
        <button type="button" className="icon-btn icon-btn--light" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open}>☰</button>
        <Link href="/admin" className="topbar__brand"><SunMark size={22} /> Editorial</Link>
        <Link href="/admin/content/new" className="abtn abtn--small abtn--flamingo">+ Nuevo</Link>
      </div>
      <aside className="sidebar" data-open={open || undefined}>
        <div className="sidebar__head">
          <Link href="/admin" className="sidebar__brand"><SunMark size={26} /><span>Leonida<em> Records</em><small>Editorial</small></span></Link>
          <button type="button" className="icon-btn icon-btn--light sidebar__close" onClick={() => setOpen(false)} aria-label="Cerrar menú">×</button>
        </div>
        <div className="sidebar__new">
          <Link href="/admin/content/new" className="abtn abtn--flamingo abtn--block">+ Nueva ficha</Link>
          <Link href="/admin/news/new" className="abtn abtn--ghost-light abtn--block">+ Nueva noticia</Link>
        </div>
        <nav className="sidebar__nav" aria-label="Editorial">
          {groups.map((g, gi) => (
            <div key={gi} className="sidebar__group">
              {g.label && <p className="sidebar__label">{g.label}</p>}
              <ul>
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} aria-current={active(it) ? 'page' : undefined}>
                      <Icon d={it.icon} /><span>{it.label}</span>
                      {it.badge ? <span className="sidebar__badge tnum" title="Borradores">{it.badge}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="sidebar__foot">
          <div className="sidebar__me">
            <span className="avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
            <span><strong>{name}</strong><small>{profile?.role === 'admin' ? 'Administrador' : 'Editor'}</small></span>
          </div>
          <div className="sidebar__links">
            <a href="/" target="_blank" rel="noopener noreferrer">Ver la web ↗</a>
            <form action={signOutAction}><button type="submit">Cerrar sesión</button></form>
          </div>
        </div>
      </aside>
      {open && <button type="button" className="sidebar__scrim" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
    </>
  );
}
