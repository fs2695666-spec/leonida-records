import { listCategoriesAdmin } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { CategoriesManager } from '@/components/admin/Managers';

export const metadata = { title: 'Secciones' };

export default async function CategoriesPage() {
  const [{ profile }, rows] = await Promise.all([getSession(), listCategoriesAdmin()]);
  return (
    <div className="page">
      <PageHeader title="Secciones del periódico" lead="Categorías de The Leonida Times, con nombre en los cuatro idiomas." crumbs={[{ label: 'The Leonida Times', href: '/admin/news' }, { label: 'Secciones' }]} />
      <CategoriesManager rows={rows} isAdmin={isAdminProfile(profile)} />
    </div>
  );
}
