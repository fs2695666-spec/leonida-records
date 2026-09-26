'use server';
import { requireStaff } from '@/lib/auth';
import { action, check, revalidatePublic, userError } from '@/lib/admin/action';
import { AUTO_LANGS, FIELDS, isTranslateConfigured, translateRecord, TranslateError } from '@/lib/translate';

const TABLES = [
  { table: 'entities', f: FIELDS.entity, label: (r) => r.title?.es },
  { table: 'articles', f: FIELDS.article, label: (r) => r.title?.es },
  { table: 'facts', f: FIELDS.fact, label: (r) => r.title?.es },
  { table: 'timeline_events', f: FIELDS.timeline, label: (r) => r.title?.es },
  { table: 'categories', f: FIELDS.category, label: (r) => r.name?.es },
];
const filled = (v) => (typeof v === 'string' ? v.trim().length > 0 : Boolean(v && JSON.stringify(v).includes('"text":"')));

function needs(row, f) {
  return [...f.plain, ...f.rich].some((k) => filled(row[k]?.es) && AUTO_LANGS.some((l) => !filled(row[k]?.[l])));
}

/** How many records still have untranslated fields. */
export async function translationStatus() {
  return action(async () => {
    const { supabase } = await requireStaff();
    let pending = 0;
    for (const t of TABLES) {
      const cols = ['id', ...t.f.plain, ...t.f.rich].join(',');
      const rows = check(await supabase.from(t.table).select(cols));
      pending += rows.filter((r) => needs(r, t.f)).length;
    }
    let usage = null;
    if (process.env.DEEPL_API_KEY && !process.env.DEEPL_API_URL) {
      try {
        const base = process.env.DEEPL_API_KEY.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
        const r = await fetch(`${base}/v2/usage`, { headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}` }, cache: 'no-store' });
        if (r.ok) { const u = await r.json(); usage = { used: u.character_count, limit: u.character_limit }; }
      } catch { /* usage is informative only */ }
    }
    return { configured: isTranslateConfigured(), pending, usage };
  });
}

/** Translate the next few records with missing languages. The client calls it in a loop. */
export async function translateMissingBatch() {
  return action(async () => {
    const { supabase } = await requireStaff();
    if (!isTranslateConfigured()) throw userError('Falta configurar DEEPL_API_KEY en Vercel.');
    const LIMIT = 6;
    let processed = 0;
    let remaining = 0;
    const done = [];
    for (const t of TABLES) {
      const cols = ['id', ...t.f.plain, ...t.f.rich].join(',');
      const rows = check(await supabase.from(t.table).select(cols)).filter((r) => needs(r, t.f));
      for (const r of rows) {
        if (processed >= LIMIT) { remaining += 1; continue; }
        const record = Object.fromEntries([...t.f.plain, ...t.f.rich].map((k) => [k, r[k] || {}]));
        let result;
        try {
          result = await translateRecord(record, t.f, 'missing');
        } catch (e) {
          throw userError(e instanceof TranslateError ? `DeepL: ${e.message}.` : 'No se pudo conectar con DeepL.');
        }
        check(await supabase.from(t.table).update(result.record).eq('id', r.id).select('id'));
        processed += 1;
        done.push(t.label(r) || r.id);
      }
    }
    if (processed) revalidatePublic();
    return { processed, remaining, done };
  });
}
