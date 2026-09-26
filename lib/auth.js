import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { serverClient } from '@/lib/supabase/server';

/**
 * Current session + profile, validated with Supabase Auth (getUser hits the Auth
 * server, so a forged cookie is rejected). Cached per request.
 */
export const getSession = cache(async () => {
  const supabase = await serverClient();
  if (!supabase) return { supabase: null, user: null, profile: null, configured: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, configured: true };
  const { data: profile } = await supabase.from('profiles').select('id,email,display_name,role,active').eq('id', user.id).maybeSingle();
  return { supabase, user, profile: profile || null, configured: true };
});

export const isStaffProfile = (p) => Boolean(p && p.active && (p.role === 'admin' || p.role === 'editor'));
export const isAdminProfile = (p) => Boolean(p && p.active && p.role === 'admin');

/** For pages/layouts: redirects when not allowed. */
export async function requireStaffPage() {
  const s = await getSession();
  if (!s.user) redirect('/admin/login');
  return s;
}
export async function requireAdminPage() {
  const s = await getSession();
  if (!s.user) redirect('/admin/login');
  if (!isAdminProfile(s.profile)) redirect('/admin?denied=1');
  return s;
}

export class AuthError extends Error {}

/** For Server Actions: throws AuthError (caught by `action()` wrapper). RLS still applies. */
export async function requireStaff() {
  const s = await getSession();
  if (!s.user) throw new AuthError('Tu sesión ha caducado. Vuelve a entrar.');
  if (!isStaffProfile(s.profile)) throw new AuthError('Tu cuenta no tiene permisos de edición.');
  return s;
}
export async function requireAdmin() {
  const s = await requireStaff();
  if (!isAdminProfile(s.profile)) throw new AuthError('Solo un administrador puede hacer esto.');
  return s;
}
