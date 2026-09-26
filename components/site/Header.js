'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LOCALES, LOCALE_META, stripLocale } from '@/lib/i18n';
import { Wordmark } from './Logo';
import { CommandSearch } from './CommandSearch';

function localized(lang, path) {
  if (lang === 'es') return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

export function Header({ lang, nav, homeHref, labels, searchLabels }) {
  const pathname = usePathname() || '/';
  const bare = stripLocale(pathname);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', open);
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (path) => (path === '/' ? bare === '/' : bare === path || bare.startsWith(`${path}/`));

  const langSwitch = (
    <ul className="langs" aria-label={labels.language}>
      {LOCALES.map((l) => (
        <li key={l}>
          {/* Full navigation on purpose: the proxy stores the chosen language in a cookie.
              Spanish goes through /es so the proxy can switch the cookie back (then redirects to the root). */}
          <a href={l === 'es' ? `/es${bare === '/' ? '' : bare}` : localized(l, bare)} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined} title={LOCALE_META[l].name}>
            {LOCALE_META[l].label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <header className="site-header" data-scrolled={scrolled || undefined} data-open={open || undefined}>
        <div className="site-header__bar">
          <Link href={homeHref} className="site-header__brand" aria-label={labels.siteName}>
            <Wordmark name={labels.siteName} />
          </Link>

          <nav className="site-nav" aria-label="Main">
            <ul>
              {nav.slice(1).map((item) => (
                <li key={item.key}>
                  <Link href={localized(lang, item.path)} aria-current={isActive(item.path) ? 'page' : undefined}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__tools">
            <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)} aria-label={searchLabels.open}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <span className="search-trigger__label">{labels.search}</span>
              <kbd aria-hidden="true">/</kbd>
            </button>
            <div className="site-header__langs">{langSwitch}</div>
            <button type="button" className="menu-trigger" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
              <span className="sr-only">{open ? labels.close : labels.menu}</span>
              <span className="menu-trigger__lines" aria-hidden="true"><i /><i /></span>
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className="mobile-menu" data-open={open || undefined} aria-hidden={!open} inert={!open ? true : undefined}>
        <nav aria-label="Mobile">
          <ol>
            {nav.map((item, i) => (
              <li key={item.key} style={{ '--i': i }}>
                <Link href={localized(lang, item.path)} aria-current={isActive(item.path) ? 'page' : undefined}>
                  <span className="mobile-menu__n tnum">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            <li style={{ '--i': nav.length }}>
              <Link href={labels.sourcesHref}><span className="mobile-menu__n tnum">{String(nav.length + 1).padStart(2, '0')}</span>{labels.sources}</Link>
            </li>
          </ol>
        </nav>
        <div className="mobile-menu__foot">
          {langSwitch}
          <p>{labels.unofficial}</p>
        </div>
        <div className="sunset-rule" aria-hidden="true" />
      </div>

      <CommandSearch lang={lang} open={searchOpen} onOpenChange={setSearchOpen} labels={searchLabels} />
    </>
  );
}
