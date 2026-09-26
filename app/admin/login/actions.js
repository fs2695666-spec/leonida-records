'use server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { serverClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/env';

const safeNext = (n) => (typeof n === 'string' && n.startsWith('/admin') && !n.startsWith('//') ? n : '/admin');

export async function login(_prev, formData) {
  const supabase = await serverClient();
  if (!supabase) return { error: 'Supabase no está configurado. Revisa las variables de entorno.' };
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { error: 'Introduce tu email y tu contraseña.', email };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = /Invalid login/i.test(error.message) ? 'Email o contraseña incorrectos.'
      : /Email not confirmed/i.test(error.message) ? 'Tienes que confirmar tu email antes de entrar.'
        : /rate limit/i.test(error.message) ? 'Demasiados intentos. Espera un momento.' : error.message;
    return { error: msg, email };
  }
  redirect(safeNext(formData.get('next')));
}

export async function requestReset(_prev, formData) {
  const supabase = await serverClient();
  if (!supabase) return { error: 'Supabase no está configurado.' };
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Email no válido.', email };
  const h = await headers();
  const origin = h.get('origin') || siteUrl();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/admin/auth/confirm?next=/admin/set-password` });
  // Same answer whether the account exists or not (no account enumeration).
  return { sent: true, email };
}
