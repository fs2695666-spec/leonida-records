import { articleOptions, entityOptions, listTimelineAdmin } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { TimelineManager } from '@/components/admin/Managers';

export const metadata = { title: 'Cronología' };

export default async function TimelineAdmin() {
  const [{ profile }, rows, entities, articles] = await Promise.all([getSession(), listTimelineAdmin(), entityOptions(), articleOptions()]);
  return (
    <div className="page">
      <PageHeader title="Cronología" lead="Los hitos de /timeline. Las fechas futuras se marcan como «Próximamente»." />
      <TimelineManager rows={rows} entities={entities} articles={articles} isAdmin={isAdminProfile(profile)} />
    </div>
  );
}
