import Link from 'next/link';
import { listEntitiesAdmin } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { ContentTable } from '@/components/admin/ContentTable';

export const metadata = { title: 'Fichas' };

export default async function ContentPage({ searchParams }) {
  const sp = await searchParams;
  const [{ profile }, rows] = await Promise.all([getSession(), listEntitiesAdmin()]);
  return (
    <div className="page">
      <PageHeader
        title="Fichas del archivo"
        lead="Personajes, lugares, vehículos, datos, vídeos y teorías. Los borradores no se ven en la web."
        actions={<Link className="abtn abtn--primary" href={`/admin/content/new${sp?.type ? `?type=${sp.type}` : ''}`}>Nueva ficha</Link>}
      />
      <ContentTable rows={rows} isAdmin={isAdminProfile(profile)} initial={{ type: sp?.type || '', state: sp?.state || '', q: sp?.q || '' }} />
    </div>
  );
}
