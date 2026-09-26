import { listSourcesAdmin } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { SourcesManager } from '@/components/admin/Managers';

export const metadata = { title: 'Fuentes' };

export default async function SourcesAdmin() {
  const [{ profile }, rows] = await Promise.all([getSession(), listSourcesAdmin()]);
  return (
    <div className="page">
      <PageHeader title="Fuentes" lead="De dónde sale cada dato. Se muestran en las fichas, en las noticias y en /sources." />
      <SourcesManager rows={rows} isAdmin={isAdminProfile(profile)} />
    </div>
  );
}
