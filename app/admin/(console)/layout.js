import { requireStaffPage, isStaffProfile, isAdminProfile } from '@/lib/auth';
import { signOut } from '@/app/admin/_actions/settings';
import { Sidebar } from '@/components/admin/Sidebar';

export const dynamic = 'force-dynamic';

export default async function ConsoleLayout({ children }) {
  const { user, profile, supabase } = await requireStaffPage();

  if (!isStaffProfile(profile)) {
    return (
      <main className="login login--single">
        <section className="login__panel">
          <h1>Cuenta sin acceso</h1>
          <p className="login__lead">
            Has entrado como <strong>{user.email}</strong>, pero {profile && !profile.active ? 'tu cuenta está desactivada' : 'todavía no tienes un rol de editor'}.
            Pide a un administrador que te dé acceso desde <em>Ajustes → Usuarios</em>.
          </p>
          <form action={signOut}><button className="abtn abtn--primary abtn--block" type="submit">Cerrar sesión</button></form>
        </section>
      </main>
    );
  }

  const [e, a] = await Promise.all([
    supabase.from('entities').select('id', { count: 'exact', head: true }).eq('published', false),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('published', false),
  ]);

  return (
    <div className="console">
      <Sidebar profile={profile} isAdmin={isAdminProfile(profile)} signOutAction={signOut} counts={{ drafts: (e.count || 0) + (a.count || 0) }} />
      <main className="console__main" id="main">{children}</main>
    </div>
  );
}
