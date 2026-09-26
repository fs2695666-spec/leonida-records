'use server';
import { z } from 'zod';
import { requireAdmin, requireStaff } from '@/lib/auth';
import { action, check, revalidatePublic } from '@/lib/admin/action';
import { entitySchema, factSchema, relationSchema } from '@/lib/validation';

const ids = z.array(z.guid()).min(1).max(500);

export async function saveEntity(input) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const v = entitySchema.parse(input);
    const { id, map, release_date: releaseDate, ...row } = v;

    let metadata = {};
    if (id) {
      const current = check(await supabase.from('entities').select('metadata').eq('id', id).maybeSingle());
      metadata = current?.metadata || {};
    }
    if (map) metadata = { ...metadata, map: { x: Math.round(map.x * 10) / 10, y: Math.round(map.y * 10) / 10 } };
    else { const { map: _drop, ...rest } = metadata; metadata = rest; }
    if (releaseDate) metadata = { ...metadata, release_date: releaseDate };
    else { const { release_date: _r, ...rest } = metadata; metadata = rest; }

    const payload = { ...row, metadata };
    if (!payload.published_at) delete payload.published_at; // DB sets it on first publish
    const res = id
      ? await supabase.from('entities').update(payload).eq('id', id).select('id,type,slug,updated_at').single()
      : await supabase.from('entities').insert(payload).select('id,type,slug,updated_at').single();
    const saved = check(res);
    revalidatePublic();
    return saved;
  });
}

export async function setEntitiesPublished(input, published) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const list = ids.parse(input);
    check(await supabase.from('entities').update({ published: Boolean(published) }).in('id', list).select('id'));
    revalidatePublic();
    return { count: list.length };
  });
}

export async function setEntitiesFeatured(input, featured) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const list = ids.parse(input);
    check(await supabase.from('entities').update({ featured: Boolean(featured) }).in('id', list).select('id'));
    revalidatePublic();
    return { count: list.length };
  });
}

export async function deleteEntities(input) {
  return action(async () => {
    const { supabase } = await requireAdmin();
    const list = ids.parse(input);
    check(await supabase.from('entities').delete().in('id', list).select('id'));
    revalidatePublic();
    return { count: list.length };
  });
}

export async function saveFact(input) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const { id, ...row } = factSchema.parse(input);
    const res = id
      ? await supabase.from('facts').update(row).eq('id', id).select('*').single()
      : await supabase.from('facts').insert(row).select('*').single();
    const saved = check(res);
    revalidatePublic();
    return saved;
  });
}

export async function deleteFact(id) {
  return action(async () => {
    const { supabase } = await requireStaff();
    check(await supabase.from('facts').delete().eq('id', z.guid().parse(id)).select('id'));
    revalidatePublic();
  });
}

export async function addRelation(input) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const row = relationSchema.parse(input);
    const saved = check(await supabase.from('relations').insert({ ...row, note: row.note || null }).select('id').single());
    revalidatePublic();
    return saved;
  });
}

export async function deleteRelation(id) {
  return action(async () => {
    const { supabase } = await requireStaff();
    check(await supabase.from('relations').delete().eq('id', z.guid().parse(id)).select('id'));
    revalidatePublic();
  });
}

/** Replace the ordered gallery of an entity. */
export async function setEntityMedia(entityId, mediaIds) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const eid = z.guid().parse(entityId);
    const list = z.array(z.guid()).max(100).parse(mediaIds);
    check(await supabase.from('entity_media').delete().eq('entity_id', eid).select('media_id'));
    if (list.length) {
      check(await supabase.from('entity_media').insert([...new Set(list)].map((m, i) => ({ entity_id: eid, media_id: m, sort_order: i }))).select('media_id'));
    }
    revalidatePublic();
  });
}
