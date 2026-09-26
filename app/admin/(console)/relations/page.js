import { entityOptions, listRelationsAdmin } from '@/lib/admin/data';
import { PageHeader } from '@/components/admin/PageHeader';
import { RelationsOverview } from '@/components/admin/Managers';

export const metadata = { title: 'Relaciones' };

export default async function RelationsAdmin() {
  const [rows, entities] = await Promise.all([listRelationsAdmin(), entityOptions()]);
  return (
    <div className="page">
      <PageHeader title="Relaciones" lead="El mapa de conexiones del archivo: Jason → pareja de → Lucia. También se editan desde cada ficha." />
      <RelationsOverview rows={rows} entities={entities} />
    </div>
  );
}
