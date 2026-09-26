'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getSession, requireAdmin, requireStaff } from '@/lib/auth';
import { action, check, revalidatePublic, userError } from '@/lib/admin/action';
import { inviteSchema, settingsSchema } from '@/lib/validation';
import { serviceClient } from '@/lib/supabase/service';
import { siteUrl } from '@/lib/env';

export async function saveSettings(input) {
  return action(async () => {
    const { supabase } = await requireAdmin();
    const v = settingsSchema.parse(input);
    const rows = Object.entries(v).map(([key, value]) => ({ key, value: value ?? null }));
    check(await supabase.from('site_settings').upsert(rows, { onConflict: 'key' }).select('key'));
    revalidatePublic();
  });
}

export async function updateOwnProfile(input) {
  return action(async () => {
    const { supabase, user } = await requireStaff();
    const { display_name } = z.object({ display_name: z.string().trim().min(1).max(80) }).parse(input);
    check(await supabase.from('profiles').update({ display_name }).eq('id', user.id).select('id'));
  });
}

export async function inviteUser(input) {
  return action(async () => {
    await requireAdmin();
    const v = inviteSchema.parse(input);
    const svc = serviceClient();
    if (!svc) throw userError('Falta SUPABASE_SECRET_KEY en el servidor. Crea el usuario desde el panel de Supabase (Authentication → Users) y asígnale el rol aquí.');
    const { data, error } = await svc.auth.admin.inviteUserByEmail(v.email, {
      redirectTo: `${siteUrl()}/admin/auth/confirm?next=/admin/set-password`,
      data: { full_name: v.display_name || v.email.split('@')[0] },
    });
    if (error) throw userError(/already been registered|already exists/i.test(error.message) ? 'Ese email ya tiene cuenta. Cambia su rol en la tabla.' : error.message);
    // Service role bypasses RLS; the profile row is created by the auth trigger.
    check(await svc.from('profiles').upsert({ id: data.user.id, email: v.email, display_name: v.display_name || v.email.split('@')[0], role: v.role, active: true }).select('id'));
    return { id: data.user.id };
  });
}

export async function updateUser(id, patch) {
  return action(async () => {
    const { supabase, user } = await requireAdmin();
    const uid = z.guid().parse(id);
    const v = z.object({ role: z.enum(['admin', 'editor', 'pending']), active: z.boolean(), display_name: z.string().trim().min(1).max(80) }).partial().parse(patch);
    if (uid === user.id && (v.role && v.role !== 'admin')) throw userError('No puedes quitarte a ti mismo el rol de administrador.');
    if (uid === user.id && v.active === false) throw userError('No puedes desactivar tu propia cuenta.');
    return check(await supabase.from('profiles').update(v).eq('id', uid).select('id,email,display_name,role,active').single());
  });
}

export async function deleteUser(id) {
  return action(async () => {
    const { user } = await requireAdmin();
    const uid = z.guid().parse(id);
    if (uid === user.id) throw userError('No puedes eliminar tu propia cuenta.');
    const svc = serviceClient();
    if (!svc) throw userError('Falta SUPABASE_SECRET_KEY: desactiva el usuario o elimínalo desde el panel de Supabase.');
    const { data: target } = await svc.from('profiles').select('role,active').eq('id', uid).maybeSingle();
    if (target?.role === 'admin' && target.active) {
      const { count } = await svc.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin').eq('active', true);
      if ((count || 0) <= 1) throw userError('Debe quedar al menos un administrador activo.');
    }
    const { error } = await svc.auth.admin.deleteUser(uid);
    if (error) throw userError(error.message);
  });
}

export async function signOut() {
  const { supabase } = await getSession();
  if (supabase) await supabase.auth.signOut();
  redirect('/admin/login');
}
