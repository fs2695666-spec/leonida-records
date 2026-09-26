import { entityOptions, sourceOptions } from '@/lib/admin/data';
import { getSession, isAdminProfile } from '@/lib/auth';
import { EntityEditor } from '@/components/admin/EntityEditor';
import { ENTITY_TYPES } from '@/lib/i18n';

export const metadata = { title: 'Nueva ficha' };

export default async function NewEntity({ searchParams }) {
  const sp = await searchParams;
  const [{ profile }, sources, entities] = await Promise.all([getSession(), sourceOptions(), entityOptions()]);
  return (
    <div className="page page--editor">
      <EntityEditor entity={null} defaultType={ENTITY_TYPES.includes(sp?.type) ? sp.type : 'characters'} sourceOptions={sources} entityOptions={entities} isAdmin={isAdminProfile(profile)} />
    </div>
  );
}
