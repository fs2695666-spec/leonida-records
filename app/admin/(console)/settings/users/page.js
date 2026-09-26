import { requireAdminPage } from '@/lib/auth';
import { listUsers } from '@/lib/admin/data';
import { PageHeader } from '@/components/admin/PageHeader';
import { UsersManager } from '@/components/admin/UsersManager';

export const metadata = { title: 'Usuarios' };

export default async function UsersPage() {
  const { user } = await requireAdminPage();
  const rows = await listUsers();
  const canInvite = Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  return (
    <div className="page">
      <PageHeader title="Usuarios" lead="Quién puede entrar al panel y con qué permisos." crumbs={[{ label: 'Ajustes', href: '/admin/settings' }, { label: 'Usuarios' }]} />
      <div className="roles-help">
        <div><strong>Administrador</strong><span>Todo: publicar, borrar, ajustes del sitio y usuarios.</span></div>
        <div><strong>Editor</strong><span>Crea, edita y publica fichas, noticias, medios, fuentes y relaciones. No borra fichas ni noticias ni toca ajustes.</span></div>
        <div><strong>Sin acceso</strong><span>Puede iniciar sesión pero no ve nada del panel.</span></div>
      </div>
      <UsersManager rows={rows} meId={user.id} canInvite={canInvite} />
    </div>
  );
}
