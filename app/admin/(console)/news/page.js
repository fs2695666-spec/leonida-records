import Link from 'next/link';
import { listArticlesAdmin, listCategoriesAdmin } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { NewsTable } from '@/components/admin/NewsTable';

export const metadata = { title: 'The Leonida Times' };

export default async function NewsAdmin({ searchParams }) {
  const sp = await searchParams;
  const [{ profile }, rows, categories] = await Promise.all([getSession(), listArticlesAdmin(), listCategoriesAdmin()]);
  return (
    <div className="page">
      <PageHeader
        title="The Leonida Times"
        lead="Noticias publicadas automáticamente en la portada y en /noticias. Los borradores y las programadas no son públicas."
        actions={<>
          <Link className="abtn" href="/admin/news/categories">Secciones</Link>
          <Link className="abtn abtn--primary" href="/admin/news/new">Escribir noticia</Link>
        </>}
      />
      <NewsTable rows={rows} categories={categories} isAdmin={isAdminProfile(profile)} initial={{ state: sp?.state || '' }} />
    </div>
  );
}
