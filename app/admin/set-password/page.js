import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SetPasswordForm } from './SetPasswordForm';

export const metadata = { title: 'Crear contraseña' };

export default async function SetPasswordPage() {
  const { user } = await getSession();
  if (!user) redirect('/admin/login?notice=expired');
  return (
    <main className="login login--single">
      <section className="login__panel">
        <h1>Crea tu contraseña</h1>
        <p className="login__lead">Cuenta: <strong>{user.email}</strong>. Usa al menos 10 caracteres.</p>
        <SetPasswordForm />
      </section>
    </main>
  );
}
