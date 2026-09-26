'use server';
import { z } from 'zod';
import { requireAdmin, requireStaff } from '@/lib/auth';
import { action, check, revalidatePublic, userError } from '@/lib/admin/action';
import { mediaSchema, sourceSchema, timelineSchema } from '@/lib/validation';
import { autoTranslate, FIELDS } from '@/lib/translate';

const pickFields = (row, f) => Object.fromEntries([...f.plain, ...f.rich].map((k) => [k, row[k] || {}]));

/** Register files already uploaded to Storage by the browser (or external URLs). */
export async function registerMedia(items) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const rows = z.array(mediaSchema).min(1).max(50).parse(items);
    for (const r of rows) {
      if (r.storage_path && !/^uploads\/[\w./-]+$/.test(r.storage_path)) throw userError('Ruta de archivo no válida');
    }
    const saved = check(await supabase.from('media').insert(rows).select('*'));
    return saved;
  });
}

export async function updateMedia(id, patch) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const v = z.object({ alt_text: z.string().trim().max(300), caption: z.string().trim().max(300), credit: z.string().trim().max(160) }).partial().parse(patch);
    const saved = check(await supabase.from('media').update(v).eq('id', z.guid().parse(id)).select('*').single());
    revalidatePublic();
    return saved;
  });
}

export async function deleteMedia(input) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const list = z.array(z.guid()).min(1).max(200).parse(input);
    const rows = check(await supabase.from('media').select('id,storage_path,bucket').in('id', list));
    const paths = rows.filter((r) => r.storage_path).map((r) => r.storage_path);
    if (paths.length) {
      const { error } = await supabase.storage.from('media').remove(paths);
      if (error) console.error('[media] storage remove', error.message);
    }
    check(await supabase.from('media').delete().in('id', list).select('id'));
    revalidatePublic();
    return { count: list.length };
  });
}

export async function saveSource(input) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const { id, ...row } = sourceSchema.parse(input);
    for (const k of ['publisher', 'notes']) row[k] = row[k] || null;
    const res = id
      ? await supabase.from('sources').update(row).eq('id', id).select('*').single()
      : await supabase.from('sources').insert(row).select('*').single();
    const saved = check(res);
    revalidatePublic();
    return saved;
  });
}

export async function deleteSource(id) {
  return action(async () => {
    const { supabase } = await requireAdmin();
    check(await supabase.from('sources').delete().eq('id', z.guid().parse(id)).select('id'));
    revalidatePublic();
  });
}

export async function saveTimeline(input) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const { id, ...row } = timelineSchema.parse(input);
    const tr = await autoTranslate(pickFields(row, FIELDS.timeline), FIELDS.timeline, 'missing');
    Object.assign(row, tr.record);
    const res = id
      ? await supabase.from('timeline_events').update(row).eq('id', id).select('*').single()
      : await supabase.from('timeline_events').insert(row).select('*').single();
    const saved = check(res);
    revalidatePublic();
    return { ...saved, warning: tr.warning };
  });
}

export async function deleteTimeline(id) {
  return action(async () => {
    const { supabase } = await requireAdmin();
    check(await supabase.from('timeline_events').delete().eq('id', z.guid().parse(id)).select('id'));
    revalidatePublic();
  });
}

export async function listMediaForPicker() {
  return action(async () => {
    const { supabase } = await requireStaff();
    return check(await supabase.from('media')
      .select('id,url,kind,mime_type,size_bytes,width,height,alt_text,caption,credit,created_at')
      .order('created_at', { ascending: false }).limit(500));
  });
}
