'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, href, isLocale } from '@/lib/i18n';

const COPY = {
  es: ['Esta ficha no existe.', 'Puede que la hayan movido o que el enlace esté mal.', 'Volver al inicio', 'Buscar en el archivo'],
  en: ['This record doesn’t exist.', 'It may have moved, or the link is wrong.', 'Back to home', 'Search the archive'],
  pt: ['Este registo não existe.', 'Pode ter sido movido, ou a ligação está errada.', 'Voltar ao início', 'Pesquisar no arquivo'],
  fr: ['Ce dossier n’existe pas.', 'Il a peut-être été déplacé, ou le lien est erroné.', 'Retour à l’accueil', 'Rechercher dans l’archive'],
};

export default function NotFound() {
  const seg = (usePathname() || '/').split('/')[1];
  const lang = isLocale(seg) ? seg : DEFAULT_LOCALE;
  const [title, lead, back, search] = COPY[lang];
  return (
    <section className="notfound wrap">
      <p className="notfound__code display" aria-hidden="true">404</p>
      <h1 className="display">{title}</h1>
      <p className="lead">{lead}</p>
      <div className="notfound__actions">
        <Link className="btn btn--primary" href={href(lang, '/')}>{back}</Link>
        <Link className="btn btn--ghost" href={href(lang, '/search')}>{search}</Link>
      </div>
    </section>
  );
}
