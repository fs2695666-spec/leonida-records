import { notFound } from 'next/navigation';
import { entityOptions, getEntityAdmin, sourceOptions } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { EntityEditor } from '@/components/admin/EntityEditor';

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: 'Ficha' };
  const d = await getEntityAdmin(id).catch(() => null);
  return { title: d?.entity?.title?.es || 'Ficha' };
}

export default async function EditEntity({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ profile }, data, sources, entities] = await Promise.all([getSession(), getEntityAdmin(id), sourceOptions(), entityOptions()]);
  if (!data) notFound();
  return (
    <div className="page page--editor">
      <EntityEditor key={data.entity.id} entity={data.entity} facts={data.facts} relations={data.relations} media={data.media} sourceOptions={sources} entityOptions={entities} isAdmin={isAdminProfile(profile)} />
    </div>
  );
}
