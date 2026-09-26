import '@/styles/base.css';
import '@/styles/public.css';
import { fontVars } from '@/lib/fonts';

export const metadata = { title: '404 — Leonida Records', robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="es" className={fontVars}>
      <body>
        <main className="notfound wrap">
          <p className="notfound__code display">404</p>
          <h1 className="display">Esta página no existe.</h1>
          <p className="lead">This page doesn’t exist.</p>
          <div className="notfound__actions">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="btn btn--primary" href="/">Leonida Records</a>
          </div>
        </main>
      </body>
    </html>
  );
}
