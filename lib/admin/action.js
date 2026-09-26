import 'server-only';
import { revalidatePath } from 'next/cache';
import { AuthError } from '@/lib/auth';

/** Translate Postgres / PostgREST errors into something an editor understands. */
export function dbMessage(error) {
  if (!error) return null;
  const m = error.message || '';
  if (error.code === '23505') {
    if (/slug/.test(m) || /slug/.test(error.details || '')) return 'Ya existe otro elemento con ese slug.';
    return 'Ese elemento ya existe.';
  }
  if (error.code === '23503') return 'Está vinculado a otro contenido que ya no existe.';
  if (error.code === '42501' || /row-level security|permission denied/i.test(m)) return 'No tienes permisos para esta acción.';
  if (/At least one active admin/i.test(m)) return 'Debe quedar al menos un administrador activo.';
  if (/Only admins/i.test(m)) return 'Solo un administrador puede cambiar roles o estados.';
  if (error.code === '23514') return 'Algún campo tiene un formato no válido.';
  return m || 'Error de base de datos';
}

/**
 * Wrap a server action: auth + validation errors become `{ ok:false, error }`,
 * everything else is logged and reported generically.
 */
export async function action(fn) {
  try {
    const data = await fn();
    return { ok: true, data: data ?? null };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.message };
    if (e?.name === 'ZodError') {
      const { firstError } = await import('@/lib/validation');
      return { ok: false, error: firstError(e) };
    }
    if (e?.userMessage) return { ok: false, error: e.userMessage };
    if (e?.digest?.startsWith?.('NEXT_')) throw e; // redirect()/notFound()
    console.error('[admin action]', e);
    return { ok: false, error: 'Algo ha fallado en el servidor. Inténtalo de nuevo.' };
  }
}

export function check({ error, data }) {
  if (error) {
    const e = new Error(error.message);
    e.userMessage = dbMessage(error);
    throw e;
  }
  return data;
}

export function userError(message) {
  const e = new Error(message);
  e.userMessage = message;
  return e;
}

/** Refresh every public page (ISR) and the sitemap after a content change. */
export function revalidatePublic() {
  revalidatePath('/[lang]', 'layout');
  revalidatePath('/sitemap.xml');
}
