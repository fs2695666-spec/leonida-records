import { requireAdminPage } from '@/lib/auth';
import { getSettingsAdmin } from '@/lib/admin/data';
import { PageHeader } from '@/components/admin/PageHeader';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const metadata = { title: 'Ajustes del sitio' };

export default async function SettingsPage() {
  await requireAdminPage();
  const settings = await getSettingsAdmin();
  return (
    <div className="page">
      <PageHeader title="Ajustes del sitio" lead="Portada, fecha de lanzamiento y avisos. Solo administradores." />
      <SettingsForm initial={settings} />
    </div>
  );
}
