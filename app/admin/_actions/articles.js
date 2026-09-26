'use server';
import { z } from 'zod';
import { requireAdmin, requireStaff } from '@/lib/auth';
import { action, check, revalidatePublic } from '@/lib/admin/action';
import { articleSchema, categorySchema } from '@/lib/validation';

const ids = z.array(z.guid()).min(1).max(500);

export async function saveArticle(input) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const { id, entity_ids: entityIds, ...row } = articleSchema.parse(input);
    for (const k of ['cover_alt', 'cover_caption', 'author_name']) row[k] = row[k] || null;
    if (!row.published_at) delete row.published_at;
    const res = id
      ? await supabase.from('articles').update(row).eq('id', id).select('id,slug,published,published_at,updated_at').single()
      : await supabase.from('articles').insert(row).select('id,slug,published,published_at,updated_at').single();
    const saved = check(res);
    check(await supabase.from('article_entities').delete().eq('article_id', saved.id).select('entity_id'));
    if (entityIds.length) {
      check(await supabase.from('article_entities').insert([...new Set(entityIds)].map((e) => ({ article_id: saved.id, entity_id: e }))).select('entity_id'));
    }
    revalidatePublic();
    return saved;
  });
}

export async function setArticlesPublished(input, published) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const list = ids.parse(input);
    check(await supabase.from('articles').update({ published: Boolean(published) }).in('id', list).select('id'));
    revalidatePublic();
    return { count: list.length };
  });
}

export async function setArticlesFeatured(input, featured) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const list = ids.parse(input);
    check(await supabase.from('articles').update({ featured: Boolean(featured) }).in('id', list).select('id'));
    revalidatePublic();
    return { count: list.length };
  });
}

export async function deleteArticles(input) {
  return action(async () => {
    const { supabase } = await requireAdmin();
    const list = ids.parse(input);
    check(await supabase.from('articles').delete().in('id', list).select('id'));
    revalidatePublic();
    return { count: list.length };
  });
}

export async function saveCategory(input) {
  return action(async () => {
    const { supabase } = await requireStaff();
    const { id, ...row } = categorySchema.parse(input);
    const res = id
      ? await supabase.from('categories').update(row).eq('id', id).select('*').single()
      : await supabase.from('categories').insert(row).select('*').single();
    const saved = check(res);
    revalidatePublic();
    return saved;
  });
}

export async function deleteCategory(id) {
  return action(async () => {
    const { supabase } = await requireAdmin();
    check(await supabase.from('categories').delete().eq('id', z.guid().parse(id)).select('id'));
    revalidatePublic();
  });
}
