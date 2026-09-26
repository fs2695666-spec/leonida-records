import 'server-only';

// Automatic translation ES -> EN / PT / FR with the DeepL API (free plan: 500,000 characters/month).
// Plain text fields and Tiptap rich-text documents are supported. Rich text is translated block by block,
// with inline formatting and links sent as lightweight XML tags so DeepL keeps them in place.

const TARGETS = { en: 'EN-US', pt: 'PT-PT', fr: 'FR' };
export const AUTO_LANGS = Object.keys(TARGETS);

const CONTEXT = 'Textos de una web de fans sobre el videojuego Grand Theft Auto VI (GTA VI), ambientado en el estado ficticio de Leonida y en Vice City. '
  + 'Los nombres propios de personajes, lugares, vehículos, marcas y canciones se mantienen tal cual.';

function apiKey() {
  return process.env.DEEPL_API_KEY || '';
}
function endpoint() {
  if (process.env.DEEPL_API_URL) return process.env.DEEPL_API_URL; // testing / self-hosted proxy
  return apiKey().endsWith(':fx') ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';
}
export function isTranslateConfigured() {
  return Boolean(apiKey() || process.env.DEEPL_API_URL);
}

export class TranslateError extends Error {}

/* ------------------------------------------------------------ XML helpers */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/* ---------------------------------------------------------------- DeepL */
async function callDeepL(texts, target) {
  const out = [];
  // DeepL limits: 50 texts and 128 KiB per request.
  let batch = [];
  let size = 0;
  const flush = async () => {
    if (!batch.length) return;
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${apiKey()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: batch, source_lang: 'ES', target_lang: TARGETS[target], tag_handling: 'xml', context: CONTEXT, preserve_formatting: true }),
      cache: 'no-store',
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) {
      const msg = res.status === 403 ? 'la clave de DeepL no es válida'
        : res.status === 456 ? 'se ha agotado la cuota mensual de DeepL'
          : res.status === 429 ? 'DeepL está recibiendo demasiadas peticiones, prueba en un minuto'
            : `DeepL respondió con error ${res.status}`;
      throw new TranslateError(msg);
    }
    const data = await res.json();
    for (const t of data.translations || []) out.push(t.text);
    batch = [];
    size = 0;
  };
  for (const t of texts) {
    const bytes = Buffer.byteLength(t) + 16;
    if (batch.length >= 50 || size + bytes > 110_000) await flush();
    batch.push(t);
    size += bytes;
  }
  await flush();
  if (out.length !== texts.length) throw new TranslateError('Respuesta incompleta de DeepL');
  return out;
}

/* ------------------------------------------------------ Rich-text units */
const TEXTBLOCKS = new Set(['paragraph', 'heading']);
const MARK_TAG = { bold: 'b', italic: 'i', strike: 's', underline: 'u', code: 'c' };
const TAG_MARK = Object.fromEntries(Object.entries(MARK_TAG).map(([k, v]) => [v, k]));

function inlineToXml(nodes, links) {
  let s = '';
  for (const n of nodes || []) {
    if (n.type === 'hardBreak') { s += '<br/>'; continue; }
    if (n.type !== 'text') continue;
    let open = '';
    let close = '';
    for (const m of n.marks || []) {
      if (m.type === 'link') {
        links.push(m.attrs);
        open += `<a k="${links.length - 1}">`;
        close = `</a>${close}`;
      } else if (MARK_TAG[m.type]) {
        open += `<${MARK_TAG[m.type]}>`;
        close = `</${MARK_TAG[m.type]}>${close}`;
      }
    }
    s += open + esc(n.text || '') + close;
  }
  return s;
}

function xmlToInline(xml, links) {
  const nodes = [];
  const stack = [];
  const re = /<(\/?)(b|i|s|u|c|a)(?:\s+k="(\d+)")?\s*>|<br\s*\/>/g;
  let last = 0;
  let m;
  const pushText = (raw) => {
    if (!raw) return;
    const text = unesc(raw);
    const marks = stack.map((t) => (t.tag === 'a' ? (links[t.k] ? { type: 'link', attrs: links[t.k] } : null) : { type: TAG_MARK[t.tag] })).filter(Boolean);
    const prev = nodes[nodes.length - 1];
    if (prev && prev.type === 'text' && JSON.stringify(prev.marks || []) === JSON.stringify(marks)) prev.text += text;
    else nodes.push(marks.length ? { type: 'text', text, marks } : { type: 'text', text });
  };
  while ((m = re.exec(xml))) {
    pushText(xml.slice(last, m.index));
    last = re.lastIndex;
    if (m[0].startsWith('<br')) { nodes.push({ type: 'hardBreak' }); continue; }
    if (m[1]) { const i = stack.map((t) => t.tag).lastIndexOf(m[2]); if (i >= 0) stack.splice(i, 1); } else stack.push({ tag: m[2], k: Number(m[3]) });
  }
  pushText(xml.slice(last));
  return nodes;
}

/** Collect translatable units of a doc. Each unit = { text, apply(translated) } acting on a deep copy. */
function docUnits(doc) {
  const copy = JSON.parse(JSON.stringify(doc));
  const units = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (TEXTBLOCKS.has(node.type) && Array.isArray(node.content) && node.content.some((c) => c.type === 'text' && c.text?.trim())) {
      const links = [];
      const text = inlineToXml(node.content, links);
      units.push({ text, apply: (t) => { node.content = xmlToInline(t, links); } });
      return;
    }
    if (node.type === 'image' && node.attrs) {
      for (const k of ['alt', 'title']) if (node.attrs[k]?.trim()) units.push({ text: esc(node.attrs[k]), apply: (t) => { node.attrs[k] = unesc(t); } });
    }
    if (node.type === 'gallery' && Array.isArray(node.attrs?.images)) {
      for (const im of node.attrs.images) {
        for (const k of ['alt', 'caption']) if (im[k]?.trim()) units.push({ text: esc(im[k]), apply: (t) => { im[k] = unesc(t); } });
      }
    }
    (node.content || []).forEach(walk);
  };
  walk(copy);
  return { copy, units };
}

const hasText = (v) => (typeof v === 'string' ? v.trim().length > 0 : Boolean(v && JSON.stringify(v).match(/"text":"[^"]*\S|"type":"(image|youtube|gallery)"/)));

/**
 * Fill translations of a record.
 * record: { field: {es,en,pt,fr} }, fields: { plain: [...], rich: [...] }
 * mode 'missing' fills only empty languages (never touches manual work); 'all' overwrites EN/PT/FR.
 * Returns { record, translated: ['en',...] } — a new object, input untouched.
 */
export async function translateRecord(record, { plain = [], rich = [] }, mode = 'missing') {
  if (!isTranslateConfigured() || mode === 'off') return { record, translated: [] };
  const out = { ...record };
  const done = new Set();
  await Promise.all(AUTO_LANGS.map(async (lang) => {
    const jobs = [];
    for (const f of plain) {
      const src = record[f]?.es;
      if (!hasText(src) || (mode === 'missing' && hasText(record[f]?.[lang]))) continue;
      jobs.push({ units: [{ text: esc(src) }], finish: (res) => ({ f, value: unesc(res[0]) }) });
    }
    for (const f of rich) {
      const src = record[f]?.es;
      if (!hasText(src) || (mode === 'missing' && hasText(record[f]?.[lang]))) continue;
      const { copy, units } = docUnits(src);
      jobs.push({ units, finish: (res) => { units.forEach((u, i) => u.apply(res[i])); return { f, value: copy }; } });
    }
    if (!jobs.length) return;
    const all = jobs.flatMap((j) => j.units.map((u) => u.text));
    const res = all.length ? await callDeepL(all, lang) : [];
    let i = 0;
    for (const j of jobs) {
      const slice = res.slice(i, i + j.units.length);
      i += j.units.length;
      const { f, value } = j.finish(slice);
      out[f] = { ...(out[f] || {}), [lang]: value };
    }
    done.add(lang);
  }));
  return { record: out, translated: AUTO_LANGS.filter((l) => done.has(l)) };
}

/** Safe wrapper for save actions: never blocks a save because of a translation problem. */
export async function autoTranslate(record, fields, mode = 'missing') {
  try {
    return { ...(await translateRecord(record, fields, mode)), warning: null };
  } catch (e) {
    console.error('[translate]', e);
    return { record, translated: [], warning: `Guardado, pero no se pudo traducir automáticamente: ${e instanceof TranslateError ? e.message : 'error de conexión con DeepL'}.` };
  }
}

export const FIELDS = {
  entity: { plain: ['title', 'eyebrow', 'short_description', 'quote'], rich: ['description'] },
  article: { plain: ['title', 'excerpt', 'seo_title', 'seo_description'], rich: ['body'] },
  fact: { plain: ['title', 'body'], rich: [] },
  timeline: { plain: ['title', 'detail'], rich: [] },
  category: { plain: ['name'], rich: [] },
};
