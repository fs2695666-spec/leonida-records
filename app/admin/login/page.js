import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/env';
import { SunMark } from '@/components/site/Logo';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Acceso editorial' };

const NOTICES = {
  expired: 'El enlace ha caducado o ya se usó. Pide uno nuevo.',
  password: 'Contraseña guardada. Ya puedes entrar.',
};

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const configured = isSupabaseConfigured();
  return (
    <main className="login">
      <div className="login__art" aria-hidden="true">
        <div className="login__sun" />
        <p className="login__word">Leonida<br /><em>Records</em></p>
      </div>
      <section className="login__panel">
        <Link href="/" className="login__brand"><SunMark size={26} /> Leonida Records</Link>
        <h1>Acceso editorial</h1>
        <p className="login__lead">Solo para el equipo que mantiene el archivo y The Leonida Times.</p>
        {configured
          ? <LoginForm next={typeof sp?.next === 'string' ? sp.next : ''} notice={NOTICES[sp?.notice]} />
          : (
            <div className="login__error">
              <strong>Supabase no está configurado.</strong>
              <p>Añade <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> en <code>.env.local</code> (o en Vercel) y vuelve a desplegar. Mientras tanto la web pública funciona en modo demo de solo lectura.</p>
            </div>
          )}
        <p className="login__foot">Proyecto de fans no oficial · <Link href="/">Volver a la web</Link></p>
      </section>
    </main>
  );
}
